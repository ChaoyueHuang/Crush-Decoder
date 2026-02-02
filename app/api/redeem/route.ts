import { buildSupabaseHeaders, supabaseUrl } from "@/lib/supabase-rest"

type RedeemRequest = {
  code?: string
}

export async function POST(req: Request) {
  try {
    const { code } = (await req.json()) as RedeemRequest
    if (!code || !code.trim()) {
      return Response.json({ error: "兑换码不能为空" }, { status: 400 })
    }

    const normalized = code.replace(/\s+/g, "").toUpperCase()
    const baseUrl = supabaseUrl()
    const headers = buildSupabaseHeaders()

    const lookupRes = await fetch(
      `${baseUrl}/rest/v1/redemption_codes?code=eq.${encodeURIComponent(normalized)}&select=code,used`,
      { headers }
    )

    if (!lookupRes.ok) {
      const text = await lookupRes.text()
      return Response.json({ error: text || "查询兑换码失败" }, { status: 500 })
    }

    const rows = (await lookupRes.json()) as Array<{ code: string; used: boolean }>
    if (rows.length === 0) {
      return Response.json({ error: "请输入正确的兑换码" }, { status: 404 })
    }

    if (rows[0].used) {
      return Response.json({ error: "此兑换码已被使用，请更换兑换码" }, { status: 409 })
    }

    const updateRes = await fetch(
      `${baseUrl}/rest/v1/redemption_codes?code=eq.${encodeURIComponent(normalized)}&used=is.false&select=code,used`,
      {
        method: "PATCH",
        headers: {
          ...headers,
          Prefer: "return=representation",
        },
        body: JSON.stringify({ used: true, used_at: new Date().toISOString() }),
      }
    )

    if (!updateRes.ok) {
      const text = await updateRes.text()
      return Response.json({ error: text || "更新兑换码失败" }, { status: 500 })
    }

    const updated = (await updateRes.json()) as Array<{ code: string; used: boolean }>
    if (updated.length === 0) {
      return Response.json({ error: "此兑换码已被使用，请更换兑换码" }, { status: 409 })
    }

    return Response.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "服务器错误"
    return Response.json({ error: message }, { status: 500 })
  }
}
