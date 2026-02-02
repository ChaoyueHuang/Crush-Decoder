type SupabaseConfig = {
  url: string
  serviceRoleKey: string
}

const getConfig = (): SupabaseConfig => {
  const url = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceRoleKey) {
    throw new Error("缺少 SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY")
  }
  return { url, serviceRoleKey }
}

export const buildSupabaseHeaders = () => {
  const { serviceRoleKey } = getConfig()
  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    "Content-Type": "application/json",
  }
}

export const supabaseUrl = () => {
  const { url } = getConfig()
  return url.replace(/\/$/, "")
}
