import { buildSupabaseHeaders, supabaseUrl } from "@/lib/supabase-rest"

export async function POST(req: Request) {
  try {
    const { ghostId, localDate } = (await req.json()) as { ghostId?: string; localDate?: string }
    if (!ghostId) {
      return Response.json({ error: "缺少账号标识" }, { status: 400 })
    }

    const baseUrl = supabaseUrl()
    const headers = buildSupabaseHeaders()

    const res = await fetch(
      `${baseUrl}/rest/v1/dopamine_accounts?ghost_id=eq.${encodeURIComponent(ghostId)}&select=ghost_id,customer_id,dopamine,first_reward_claimed,daily_claim_date,invited_by`,
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
      invited_by: string | null
    }>

    if (!rows.length) {
      return Response.json({ error: "未找到账号" }, { status: 404 })
    }

    const info = rows[0]
    let inviteCountToday = 0
    if (localDate) {
      const inviteRes = await fetch(
        `${baseUrl}/rest/v1/referral_logs?inviter_ghost_id=eq.${encodeURIComponent(ghostId)}&reward_granted=is.true&reward_date=eq.${encodeURIComponent(localDate)}&select=id`,
        { headers }
      )
      if (inviteRes.ok) {
        const inviteRows = (await inviteRes.json()) as Array<{ id: string }>
        inviteCountToday = inviteRows.length
      }
    }

    return Response.json({
      data: {
        ...info,
        invite_count_today: inviteCountToday,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "服务器错误"
    return Response.json({ error: message }, { status: 500 })
  }
}
