import { buildSupabaseHeaders, supabaseUrl } from "@/lib/supabase-rest"

export async function POST(req: Request) {
  try {
    const { ghostId } = (await req.json()) as { ghostId?: string }
    if (!ghostId) {
      return Response.json({ error: "缺少账号标识" }, { status: 400 })
    }

    const baseUrl = supabaseUrl()
    const headers = buildSupabaseHeaders()

    const lookupRes = await fetch(
      `${baseUrl}/rest/v1/dopamine_accounts?ghost_id=eq.${encodeURIComponent(ghostId)}&select=dopamine,first_reward_claimed`,
      { headers }
    )

    if (!lookupRes.ok) {
      const text = await lookupRes.text()
      return Response.json({ error: text || "查询失败" }, { status: 500 })
    }

    const rows = (await lookupRes.json()) as Array<{ dopamine: number; first_reward_claimed: boolean }>
    if (!rows.length) {
      return Response.json({ error: "未找到账号" }, { status: 404 })
    }
    if (rows[0].first_reward_claimed) {
      return Response.json({ error: "已摄入" }, { status: 409 })
    }

    const newDopamine = rows[0].dopamine + 20
    const updateRes = await fetch(
      `${baseUrl}/rest/v1/dopamine_accounts?ghost_id=eq.${encodeURIComponent(ghostId)}&select=dopamine,first_reward_claimed`,
      {
        method: "PATCH",
        headers: {
          ...headers,
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          dopamine: newDopamine,
          first_reward_claimed: true,
        }),
      }
    )

    if (!updateRes.ok) {
      const text = await updateRes.text()
      return Response.json({ error: text || "更新失败" }, { status: 500 })
    }

    const updated = (await updateRes.json()) as Array<{ dopamine: number; first_reward_claimed: boolean }>
    if (!updated.length) {
      return Response.json({ error: "更新失败" }, { status: 500 })
    }

    return Response.json({ data: updated[0] })
  } catch (error) {
    const message = error instanceof Error ? error.message : "服务器错误"
    return Response.json({ error: message }, { status: 500 })
  }
}
