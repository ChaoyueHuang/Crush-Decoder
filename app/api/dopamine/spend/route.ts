import { buildSupabaseHeaders, supabaseUrl } from "@/lib/supabase-rest"

export async function POST(req: Request) {
  try {
    const { ghostId, amount } = (await req.json()) as { ghostId?: string; amount?: number }
    if (!ghostId) {
      return Response.json({ error: "缺少账号标识" }, { status: 400 })
    }
    if (!amount || amount <= 0) {
      return Response.json({ error: "扣减数值不正确" }, { status: 400 })
    }

    const baseUrl = supabaseUrl()
    const headers = buildSupabaseHeaders()

    const lookupRes = await fetch(
      `${baseUrl}/rest/v1/dopamine_accounts?ghost_id=eq.${encodeURIComponent(ghostId)}&select=dopamine`,
      { headers }
    )

    if (!lookupRes.ok) {
      const text = await lookupRes.text()
      return Response.json({ error: text || "查询失败" }, { status: 500 })
    }

    const rows = (await lookupRes.json()) as Array<{ dopamine: number }>
    if (!rows.length) {
      return Response.json({ error: "未找到账号" }, { status: 404 })
    }

    const next = Math.max(0, rows[0].dopamine - amount)
    const updateRes = await fetch(
      `${baseUrl}/rest/v1/dopamine_accounts?ghost_id=eq.${encodeURIComponent(ghostId)}&select=dopamine`,
      {
        method: "PATCH",
        headers: {
          ...headers,
          Prefer: "return=representation",
        },
        body: JSON.stringify({ dopamine: next }),
      }
    )

    if (!updateRes.ok) {
      const text = await updateRes.text()
      return Response.json({ error: text || "更新失败" }, { status: 500 })
    }

    const updated = (await updateRes.json()) as Array<{ dopamine: number }>
    if (!updated.length) {
      return Response.json({ error: "更新失败" }, { status: 500 })
    }

    return Response.json({ data: updated[0] })
  } catch (error) {
    const message = error instanceof Error ? error.message : "服务器错误"
    return Response.json({ error: message }, { status: 500 })
  }
}
