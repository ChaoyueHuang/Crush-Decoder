import { buildSupabaseHeaders, supabaseUrl } from "@/lib/supabase-rest"

export async function POST(req: Request) {
  try {
    const { ghostId, localDate } = (await req.json()) as { ghostId?: string; localDate?: string }
    if (!ghostId) {
      return Response.json({ error: "缺少账号标识" }, { status: 400 })
    }
    if (!localDate) {
      return Response.json({ error: "缺少本地日期" }, { status: 400 })
    }

    const baseUrl = supabaseUrl()
    const headers = buildSupabaseHeaders()

    const lookupRes = await fetch(
      `${baseUrl}/rest/v1/dopamine_accounts?ghost_id=eq.${encodeURIComponent(ghostId)}&select=dopamine,daily_claim_date`,
      { headers }
    )

    if (!lookupRes.ok) {
      const text = await lookupRes.text()
      return Response.json({ error: text || "查询失败" }, { status: 500 })
    }

    const rows = (await lookupRes.json()) as Array<{ dopamine: number; daily_claim_date: string | null }>
    if (!rows.length) {
      return Response.json({ error: "未找到账号" }, { status: 404 })
    }

    if (rows[0].daily_claim_date === localDate) {
      return Response.json({ error: "今日已注射" }, { status: 409 })
    }

    const newDopamine = rows[0].dopamine + 10
    const updateRes = await fetch(
      `${baseUrl}/rest/v1/dopamine_accounts?ghost_id=eq.${encodeURIComponent(ghostId)}&select=dopamine,daily_claim_date`,
      {
        method: "PATCH",
        headers: {
          ...headers,
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          dopamine: newDopamine,
          daily_claim_date: localDate,
        }),
      }
    )

    if (!updateRes.ok) {
      const text = await updateRes.text()
      return Response.json({ error: text || "更新失败" }, { status: 500 })
    }

    const updated = (await updateRes.json()) as Array<{ dopamine: number; daily_claim_date: string | null }>
    if (!updated.length) {
      return Response.json({ error: "更新失败" }, { status: 500 })
    }

    return Response.json({ data: updated[0] })
  } catch (error) {
    const message = error instanceof Error ? error.message : "服务器错误"
    return Response.json({ error: message }, { status: 500 })
  }
}
