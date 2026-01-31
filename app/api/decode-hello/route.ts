const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions"
const MODEL_ID = "deepseek/deepseek-v3.2"
const RETRYABLE_STATUS = new Set([429, 503, 524])
const REQUEST_TIMEOUT_MS = 60000

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const fetchWithRetry = async (input: RequestInfo | URL, init: RequestInit, retries = 4) => {
  let lastResponse: Response | null = null

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const response = await fetch(input, init)
    if (!RETRYABLE_STATUS.has(response.status)) return response

    lastResponse = response
    if (attempt < retries) {
      const retryAfter = response.headers.get("retry-after")
      const fallbackDelay = Math.min(10000, 1500 * 2 ** attempt)
      const delayMs = retryAfter ? Number(retryAfter) * 1000 : fallbackDelay
      await sleep(Number.isFinite(delayMs) ? delayMs : 1200 * (attempt + 1))
      continue
    }
  }

  return lastResponse ?? fetch(input, init)
}

const readStreamedContent = async (response: Response) => {
  if (!response.body) return ""
  const reader = response.body.getReader()
  const decoder = new TextDecoder("utf-8")
  let buffer = ""
  let result = ""

  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    const lines = buffer.split("\n")
    buffer = lines.pop() ?? ""
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed.startsWith("data:")) continue
      const data = trimmed.slice(5).trim()
      if (!data || data === "[DONE]") return result
      try {
        const parsed = JSON.parse(data)
        const delta = parsed?.choices?.[0]?.delta?.content
        if (typeof delta === "string") result += delta
      } catch {
        continue
      }
    }
  }

  return result
}

export async function POST() {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      return Response.json({ error: "缺少 OPENROUTER_API_KEY" }, { status: 500 })
    }

    const requestBody = {
      model: MODEL_ID,
      messages: [
        {
          role: "user",
          content: [{ type: "text", text: "hello" }],
        },
      ],
      max_tokens: 200,
      temperature: 0.2,
      stream: true,
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    const apiResponse = await fetchWithRetry(OPENROUTER_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text()
      if (apiResponse.status === 429) {
        return Response.json({ error: "请求过于频繁，请稍后再试" }, { status: 429 })
      }
      if (apiResponse.status === 503) {
        return Response.json({ error: "模型服务暂时不可用，请稍后再试" }, { status: 503 })
      }
      if (apiResponse.status === 524) {
        return Response.json({ error: "模型响应超时，请稍后再试" }, { status: 524 })
      }
      return Response.json({ error: errorText || "模型请求失败" }, { status: apiResponse.status })
    }

    const message = await readStreamedContent(apiResponse)
    return Response.json({ message: message ?? "" })
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return Response.json({ error: "模型响应超时，请稍后再试" }, { status: 524 })
    }
    const message = error instanceof Error ? error.message : "服务器错误"
    return Response.json({ error: message }, { status: 500 })
  }
}
