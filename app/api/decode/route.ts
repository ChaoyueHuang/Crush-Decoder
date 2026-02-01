import { analysisSchema } from "@/lib/analysis-schema"
import { readFile } from "fs/promises"
import path from "path"

const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions"
const IMAGE_MODEL_ID = "google/gemini-3-pro-preview"
const TEXT_MODEL_ID = "deepseek/deepseek-v3.2"
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

const extractJsonFromText = (text: string) => {
  const fencedJson = text.match(/```json([\s\S]*?)```/i)
  if (fencedJson?.[1]) return fencedJson[1].trim()

  const fenced = text.match(/```([\s\S]*?)```/)
  if (fenced?.[1]) return fenced[1].trim()

  const firstBrace = text.indexOf("{")
  const lastBrace = text.lastIndexOf("}")
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return text.slice(firstBrace, lastBrace + 1)
  }

  return text.trim()
}

const readPrompt = async () => {
  const cwd = process.cwd()
  const promptPath = path.join(cwd, "prompt.md")
  const promptLocalPath = path.join(cwd, "prompt.local.md")

  if (process.env.PROMPT_TEXT?.trim()) {
    return process.env.PROMPT_TEXT
  }

  try {
    return await readFile(promptPath, "utf-8")
  } catch {
    return await readFile(promptLocalPath, "utf-8")
  }
}

const REPAIR_SCHEMA_HINT = `{
  "is_wechat_or_xiaohongshu": 0|1,
  "analysis": {
    "conquest_difficulty": {"score":0-100,"ranking":"...","desc":"..."},
    "mbti_profile": {"type":"...","name":"...","probability":"75%","secondary_type":"...","secondary_probability":"30%","secondary_name":"...","logic":"..."},
    "core_traits": {"extroversion":0-100,"rationality":0-100,"sensitivity":0-100,"adventure":0-100,"romanticism":0-100,"independence":0-100,"summary":"..."},
    "psychological_state": {"current_state":"...","deepest_desire":"..."},
    "potential_weaknesses":[{"weakness":"...","analysis":"..."}],
    "authenticity_assessment":[{"score":0-100,"fishing_risk":"低|中|高","persona_check_positive":"..."}],
    "contradiction_check":[{"name":"...","details":"...","summary":"..."}],
    "defense_mechanism":[{"name":"...","analysis":"...","suggestion":"..."}],
    "comparative_analysis":{"attraction_target":"...","vulnerability_target":"..."},
    "summary_and_advice":{"essence_summary":"...","suggestions":["..."]},
    "final_note":{"note":"..."}
  }
}`

const requestJsonRepair = async (rawText: string) => {
  const requestBody = {
    model: TEXT_MODEL_ID,
    messages: [
      {
        role: "system",
        content: "You are a JSON repair bot. Output ONLY valid JSON that strictly matches the given schema. Do not add extra keys or commentary.",
      },
      {
        role: "user",
        content: `Fix the following model output into strict JSON that matches this schema:\n${REPAIR_SCHEMA_HINT}\n\nModel output:\n${rawText}`,
      },
    ],
    max_tokens: 2000,
    temperature: 0,
  }

  const response = await fetchWithRetry(OPENROUTER_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) return ""
  const data = await response.json()
  return data?.choices?.[0]?.message?.content ?? ""
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

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      return Response.json({ error: "缺少 OPENROUTER_API_KEY" }, { status: 500 })
    }

    const { images } = (await req.json()) as { images?: string[] }
    if (!images || images.length === 0) {
      return Response.json({ error: "未提供图片" }, { status: 400 })
    }

    const prompt = await readPrompt()

    const content = [
      { type: "text", text: prompt },
      ...images.map((url) => ({
        type: "image_url",
        image_url: { url },
      })),
    ]

    const requestBody = {
      model: IMAGE_MODEL_ID,
      messages: [{ role: "user", content }],
      reasoning: { enabled: true },
      max_tokens: 3500,
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
        return Response.json({ error: "模型响应超时，请稍后再试或减少图片数量" }, { status: 524 })
      }
      return Response.json({ error: errorText || "模型请求失败" }, { status: apiResponse.status })
    }

    const message = await readStreamedContent(apiResponse)
    if (!message) {
      return Response.json({ error: "模型未返回有效内容" }, { status: 500 })
    }

    let jsonText = extractJsonFromText(message)
    let parsedJson: unknown
    let parsed = analysisSchema.safeParse(null)

    try {
      parsedJson = JSON.parse(jsonText)
      parsed = analysisSchema.safeParse(parsedJson)
    } catch {
      parsed = analysisSchema.safeParse(null)
    }

    if (!parsed.success) {
      const repairedText = await requestJsonRepair(message)
      if (repairedText) {
        const repairedJsonText = extractJsonFromText(repairedText)
        try {
          const repairedJson = JSON.parse(repairedJsonText)
          const repairedParsed = analysisSchema.safeParse(repairedJson)
          if (repairedParsed.success) {
            return Response.json({ data: repairedParsed.data })
          }
        } catch {
          // fall through
        }
      }

      return Response.json({ error: "返回数据结构不符合要求", details: parsed.error.flatten() }, { status: 400 })
    }

    return Response.json({ data: parsed.data })
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return Response.json({ error: "模型响应超时，请稍后再试或减少图片数量" }, { status: 524 })
    }
    const message = error instanceof Error ? error.message : "服务器错误"
    return Response.json({ error: message }, { status: 500 })
  }
}
