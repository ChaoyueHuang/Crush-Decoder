import { buildSupabaseHeaders, supabaseUrl } from "@/lib/supabase-rest"
import { cookies } from "next/headers"
import { logDopamineEvent } from "@/lib/dopamine-log"
import { incrWithExpiry } from "@/lib/upstash-rest"
import { generateCustomerId } from "@/lib/ghost"

type GhostInitRequest = {
  visitorId?: string
  deviceKey?: string
  localDate?: string
}

export async function POST(req: Request) {
  try {
    const { visitorId, deviceKey, localDate } = (await req.json()) as GhostInitRequest
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

    let selfInvite = false

    if (!ghostId || !customerId) {
      ghostId = crypto.randomUUID()
      customerId = generateCustomerId()

      let refSource: string | undefined
      try {
        const cookieStore = await cookies()
        if (typeof cookieStore?.get === "function") {
          refSource = cookieStore.get("ref_source")?.value
        }
      } catch {
        // ignore cookie helper errors
      }
      if (!refSource) {
        const rawCookie = req.headers.get("cookie") ?? ""
        const parts = rawCookie.split(";").map((part) => part.trim())
        for (const part of parts) {
          if (part.startsWith("ref_source=")) {
            refSource = decodeURIComponent(part.slice("ref_source=".length))
            break
          }
        }
      }
      let invitedBy: string | null = null
      let inviterGhostId: string | null = null
      let inviterDeviceKey: string | null = null
      let inviterVisitorId: string | null = null

      if (refSource) {
        const inviterRes = await fetch(
          `${baseUrl}/rest/v1/ghost_accounts?customer_id=eq.${encodeURIComponent(refSource)}&select=ghost_id,customer_id,device_key,visitor_id`,
          { headers }
        )
        if (inviterRes.ok) {
          const inviterRows = (await inviterRes.json()) as Array<{
            ghost_id: string
            customer_id: string
            device_key: string | null
            visitor_id: string | null
          }>
          if (inviterRows.length) {
            inviterGhostId = inviterRows[0].ghost_id
            invitedBy = inviterRows[0].customer_id
            inviterDeviceKey = inviterRows[0].device_key
            inviterVisitorId = inviterRows[0].visitor_id
          }
        }
      }

      if (inviterGhostId && (inviterDeviceKey === deviceKey || inviterVisitorId === visitorId)) {
        selfInvite = true
        inviterGhostId = null
        invitedBy = null
      }

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
          invited_by: invitedBy,
        }),
      })

      if (!insertRes.ok) {
        const text = await insertRes.text()
        return Response.json({ error: text || "创建幽灵账户失败" }, { status: 500 })
      }

      const initialDopamine = invitedBy ? 40 : 20
      await fetch(`${baseUrl}/rest/v1/dopamine_accounts`, {
        method: "POST",
        headers: {
          ...headers,
          Prefer: "resolution=merge-duplicates,return=minimal",
        },
        body: JSON.stringify({
          ghost_id: ghostId,
          customer_id: customerId,
          dopamine: initialDopamine,
          first_reward_claimed: true,
          daily_claim_date: null,
          invited_by: invitedBy,
        }),
      })

      if (invitedBy) {
        await logDopamineEvent({
          ghostId,
          customerId,
          amount: 20,
          direction: "earn",
          scene: "邀请接入奖励",
        })
      }

      if (inviterGhostId && invitedBy) {
        let rewardGranted = false
        if (localDate) {
          const countRes = await fetch(
            `${baseUrl}/rest/v1/referral_logs?inviter_ghost_id=eq.${encodeURIComponent(inviterGhostId)}&reward_granted=is.true&reward_date=eq.${encodeURIComponent(localDate)}&select=id`,
            { headers }
          )
          if (countRes.ok) {
            const countRows = (await countRes.json()) as Array<{ id: string }>
            rewardGranted = countRows.length < 5
          }
        }

        await fetch(`${baseUrl}/rest/v1/referral_logs`, {
          method: "POST",
          headers: {
            ...headers,
            Prefer: "return=minimal",
          },
          body: JSON.stringify({
            inviter_ghost_id: inviterGhostId,
            inviter_customer_id: invitedBy,
            invitee_ghost_id: ghostId,
            invitee_customer_id: customerId,
            ref_code: invitedBy,
            reward_granted: rewardGranted,
            reward_amount: rewardGranted ? 30 : 0,
            reward_date: localDate ?? null,
          }),
        })

        if (rewardGranted) {
          const inviterAccountRes = await fetch(
            `${baseUrl}/rest/v1/dopamine_accounts?ghost_id=eq.${encodeURIComponent(inviterGhostId)}&select=dopamine,customer_id`,
            { headers }
          )
          if (inviterAccountRes.ok) {
            const inviterRows = (await inviterAccountRes.json()) as Array<{ dopamine: number; customer_id: string }>
            if (inviterRows.length) {
              const next = inviterRows[0].dopamine + 30
              await fetch(`${baseUrl}/rest/v1/dopamine_accounts?ghost_id=eq.${encodeURIComponent(inviterGhostId)}`, {
                method: "PATCH",
                headers: {
                  ...headers,
                  Prefer: "return=minimal",
                },
                body: JSON.stringify({ dopamine: next }),
              })
              await logDopamineEvent({
                ghostId: inviterGhostId,
                customerId: inviterRows[0].customer_id,
                amount: 30,
                direction: "earn",
                scene: "建立新连接",
              })
            }
          }
        }
      }
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

    const response = Response.json({ ghostId, customerId, selfInvite })
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
