import { buildSupabaseHeaders, supabaseUrl } from "@/lib/supabase-rest"
import { incrWithExpiry } from "@/lib/upstash-rest"
import { generateCustomerId } from "@/lib/ghost"

type GhostInitRequest = {
  visitorId?: string
  deviceKey?: string
}

export async function POST(req: Request) {
  try {
    const { visitorId, deviceKey } = (await req.json()) as GhostInitRequest
    if (!visitorId || !deviceKey) {
      return Response.json({ error: "缺少设备标识" }, { status: 400 })
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

    const lookupByDevice = async () =>
      fetch(
        `${baseUrl}/rest/v1/ghost_accounts?device_key=eq.${encodeURIComponent(deviceKey)}&order=created_at.asc&limit=1&select=ghost_id,customer_id`,
        { headers }
      )

    const lookupByVisitor = async () =>
      fetch(
        `${baseUrl}/rest/v1/ghost_accounts?visitor_id=eq.${encodeURIComponent(visitorId)}&order=created_at.asc&limit=1&select=ghost_id,customer_id`,
        { headers }
      )

    let lookupRes = await lookupByDevice()
    if (!lookupRes.ok) {
      const errorText = await lookupRes.text()
      if (errorText.includes('column "device_key" does not exist')) {
        lookupRes = await lookupByVisitor()
      } else {
        return Response.json({ error: errorText || "查询幽灵账户失败" }, { status: 500 })
      }
    }

    if (!lookupRes.ok) {
      const text = await lookupRes.text()
      return Response.json({ error: text || "查询幽灵账户失败" }, { status: 500 })
    }

    let rows = (await lookupRes.json()) as Array<{ ghost_id: string; customer_id: string }>
    if (!rows.length) {
      const fallbackRes = await lookupByVisitor()
      if (!fallbackRes.ok) {
        const text = await fallbackRes.text()
        return Response.json({ error: text || "查询幽灵账户失败" }, { status: 500 })
      }
      rows = (await fallbackRes.json()) as Array<{ ghost_id: string; customer_id: string }>
    }
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
          device_key: deviceKey,
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
      await fetch(`${baseUrl}/rest/v1/ghost_accounts?ghost_id=eq.${encodeURIComponent(ghostId)}`, {
        method: "PATCH",
        headers: {
          ...headers,
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          visitor_id: visitorId,
          device_key: deviceKey,
        }),
      })

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
