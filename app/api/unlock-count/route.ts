import { buildSupabaseHeaders, supabaseUrl } from "@/lib/supabase-rest"

const BASE_COUNT = 216

const parseContentRangeCount = (value: string | null) => {
  if (!value) return null
  const parts = value.split("/")
  if (parts.length !== 2) return null
  const total = Number(parts[1])
  return Number.isFinite(total) ? total : null
}

export async function GET() {
  try {
    const baseUrl = supabaseUrl()
    const headers = {
      ...buildSupabaseHeaders(),
      Prefer: "count=exact",
    }

    const response = await fetch(
      `${baseUrl}/rest/v1/redemption_codes?used=eq.true&select=code`,
      {
        method: "HEAD",
        headers,
      }
    )

    if (!response.ok) {
      const text = await response.text()
      return Response.json({ error: text || "获取解锁人数失败" }, { status: 500 })
    }

    const count = parseContentRangeCount(response.headers.get("content-range"))
    if (count === null) {
      return Response.json({ count: BASE_COUNT })
    }

    return Response.json({ count: BASE_COUNT + count })
  } catch (error) {
    const message = error instanceof Error ? error.message : "服务器错误"
    return Response.json({ error: message }, { status: 500 })
  }
}
