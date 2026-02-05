const CHARSET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ"

export const generateCustomerId = () => {
  const build = (size: number) =>
    Array.from({ length: size }, () => CHARSET[Math.floor(Math.random() * CHARSET.length)]).join("")
  return `DA${build(6)}`
}

export const parseCookie = (cookieHeader: string | null) => {
  if (!cookieHeader) return {} as Record<string, string>
  return cookieHeader.split(";").reduce<Record<string, string>>((acc, part) => {
    const [key, ...rest] = part.trim().split("=")
    if (!key) return acc
    acc[key] = decodeURIComponent(rest.join("="))
    return acc
  }, {})
}
