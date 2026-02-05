import { buildSupabaseHeaders, supabaseUrl } from "@/lib/supabase-rest"

export async function POST(req: Request) {
  try {
    const { ghostId } = (await req.json()) as { ghostId?: string }
    if (!ghostId) {
      return Response.json({ error: "缺少账号标识" }, { status: 400 })
    }

    const baseUrl = supabaseUrl()
    const headers = buildSupabaseHeaders()

    const res = await fetch(
      `${baseUrl}/rest/v1/dopamine_accounts?ghost_id=eq.${encodeURIComponent(ghostId)}&select=ghost_id,customer_id,dopamine,first_reward_claimed,daily_claim_date`,
      { headers }
    )

    if (!res.ok) {
      const text = await res.text()
      return Response.json({ error: text || "获取多巴胺状态失败" }, { status: 500 })
    }

    const rows = (await res.json()) as Array<{
      ghost_id: string
      customer_id: string
      dopamine: number
      first_reward_claimed: boolean
      daily_claim_date: string | null
    }>

    if (!rows.length) {
      return Response.json({ error: "未找到账号" }, { status: 404 })
    }

    return Response.json({ data: rows[0] })
  } catch (error) {
    const message = error instanceof Error ? error.message : "服务器错误"
    return Response.json({ error: message }, { status: 500 })
  }
}
