import { buildSupabaseHeaders, supabaseUrl } from "@/lib/supabase-rest"
import { incrWithExpiry } from "@/lib/upstash-rest"
import { generateCustomerId } from "@/lib/ghost"

type GhostInitRequest = {
  visitorId?: string
}

export async function POST(req: Request) {
  try {
    const { visitorId } = (await req.json()) as GhostInitRequest
    if (!visitorId) {
      return Response.json({ error: "缺少设备指纹" }, { status: 400 })
    }

    const forwardedFor = req.headers.get("x-forwarded-for") ?? ""
    const ip = forwardedFor.split(",")[0]?.trim() || "unknown"
    const ipCount = await incrWithExpiry(`ghost:init:${ip}`, 10)
    if (ipCount > 5) {
      return Response.json(
        { error: "当前区域接入信号过载，正在重新分配线路，请等待30秒后重试" },
        { status: 429 }
      )
    }

    const baseUrl = supabaseUrl()
    const headers = buildSupabaseHeaders()

    const lookupRes = await fetch(
      `${baseUrl}/rest/v1/ghost_accounts?visitor_id=eq.${encodeURIComponent(visitorId)}&order=created_at.asc&limit=1&select=ghost_id,customer_id`,
      { headers }
    )

    if (!lookupRes.ok) {
      const text = await lookupRes.text()
      return Response.json({ error: text || "查询幽灵账户失败" }, { status: 500 })
    }

    const rows = (await lookupRes.json()) as Array<{ ghost_id: string; customer_id: string }>
    let ghostId = rows[0]?.ghost_id
    let customerId = rows[0]?.customer_id

    if (!ghostId || !customerId) {
      ghostId = crypto.randomUUID()
      customerId = generateCustomerId()

      const insertRes = await fetch(`${baseUrl}/rest/v1/ghost_accounts`, {
        method: "POST",
        headers: {
          ...headers,
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          ghost_id: ghostId,
          customer_id: customerId,
          visitor_id: visitorId,
          user_agent: req.headers.get("user-agent") ?? null,
        }),
      })

      if (!insertRes.ok) {
        const text = await insertRes.text()
        return Response.json({ error: text || "创建幽灵账户失败" }, { status: 500 })
      }

      await fetch(`${baseUrl}/rest/v1/dopamine_accounts`, {
        method: "POST",
        headers: {
          ...headers,
          Prefer: "resolution=merge-duplicates,return=minimal",
        },
        body: JSON.stringify({
          ghost_id: ghostId,
          customer_id: customerId,
          dopamine: 20,
          first_reward_claimed: true,
          daily_claim_date: null,
        }),
      })
    } else {
      const dopamineLookup = await fetch(
        `${baseUrl}/rest/v1/dopamine_accounts?ghost_id=eq.${encodeURIComponent(ghostId)}&select=ghost_id`,
        { headers }
      )
      if (dopamineLookup.ok) {
        const dopamineRows = (await dopamineLookup.json()) as Array<{ ghost_id: string }>
        if (!dopamineRows.length) {
          await fetch(`${baseUrl}/rest/v1/dopamine_accounts`, {
            method: "POST",
            headers: {
              ...headers,
              Prefer: "resolution=merge-duplicates,return=minimal",
            },
            body: JSON.stringify({
              ghost_id: ghostId,
              customer_id: customerId,
              dopamine: 20,
              first_reward_claimed: true,
              daily_claim_date: null,
            }),
          })
        }
      }
    }

    const response = Response.json({ ghostId, customerId })
    response.headers.set(
      "Set-Cookie",
      [
        `ghost_id=${encodeURIComponent(ghostId)}; Path=/; Max-Age=${60 * 60 * 24 * 365 * 2}; HttpOnly; SameSite=Lax`,
        `ghost_cid=${encodeURIComponent(customerId)}; Path=/; Max-Age=${60 * 60 * 24 * 365 * 2}; SameSite=Lax`,
      ].join(", ")
    )

    return response
  } catch (error) {
    const message = error instanceof Error ? error.message : "服务器错误"
    return Response.json({ error: message }, { status: 500 })
  }
}
