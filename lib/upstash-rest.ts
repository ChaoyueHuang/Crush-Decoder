type UpstashConfig = {
  url: string
  token: string
}

const getConfig = (): UpstashConfig => {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) {
    throw new Error("缺少 UPSTASH_REDIS_REST_URL 或 UPSTASH_REDIS_REST_TOKEN")
  }
  return { url: url.replace(/\/$/, ""), token }
}

const upstashFetch = async <T>(path: string): Promise<T> => {
  const { url, token } = getConfig()
  const response = await fetch(`${url}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || "Upstash request failed")
  }

  return response.json() as Promise<T>
}

export const incrWithExpiry = async (key: string, ttlSeconds: number) => {
  const result = await upstashFetch<{ result: number }>(`/incr/${encodeURIComponent(key)}`)
  if (result.result === 1) {
    await upstashFetch<{ result: number }>(`/expire/${encodeURIComponent(key)}/${ttlSeconds}`)
  }
  return result.result
}

export const getString = async (key: string) => {
  const result = await upstashFetch<{ result: string | null }>(`/get/${encodeURIComponent(key)}`)
  return result.result
}

export const setString = async (key: string, value: string) => {
  await upstashFetch<{ result: string }>(`/set/${encodeURIComponent(key)}/${encodeURIComponent(value)}`)
}
