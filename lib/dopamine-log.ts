import { buildSupabaseHeaders, supabaseUrl } from "@/lib/supabase-rest"

type DopamineLogInput = {
  ghostId: string
  customerId: string
  amount: number
  direction: "earn" | "spend"
  scene: string
}

export const logDopamineEvent = async (input: DopamineLogInput) => {
  const baseUrl = supabaseUrl()
  const headers = buildSupabaseHeaders()
  await fetch(`${baseUrl}/rest/v1/dopamine_logs`, {
    method: "POST",
    headers: {
      ...headers,
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      ghost_id: input.ghostId,
      customer_id: input.customerId,
      amount: input.amount,
      direction: input.direction,
      scene: input.scene,
    }),
  })
}
