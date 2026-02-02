import { writeFile, readFile } from "fs/promises"
import path from "path"

const loadEnvFile = async () => {
  const candidates = [".env.local", ".env"]
  for (const filename of candidates) {
    try {
      const filePath = path.join(process.cwd(), filename)
      const content = await readFile(filePath, "utf-8")
      content.split("\n").forEach((line) => {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith("#")) return
        const idx = trimmed.indexOf("=")
        if (idx === -1) return
        const key = trimmed.slice(0, idx).trim()
        let value = trimmed.slice(idx + 1).trim()
        if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1)
        }
        if (!process.env[key]) process.env[key] = value
      })
      break
    } catch {
      // ignore missing file
    }
  }
}

await loadEnvFile()

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const CHARSET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ"
const CODE_PATTERN = /^([A-Z]+)-[A-Z0-9]{4}-[A-Z0-9]{4}$/

const buildChunk = (size) => Array.from({ length: size }, () => CHARSET[Math.floor(Math.random() * CHARSET.length)]).join("")

const generateCode = (prefix) => `${prefix}-${buildChunk(4)}-${buildChunk(4)}`

const uniqueCodes = (prefix, count, existing) => {
  const codes = []
  while (codes.length < count) {
    const code = generateCode(prefix)
    if (!CODE_PATTERN.test(code)) continue
    if (existing.has(code)) continue
    existing.add(code)
    codes.push(code)
  }
  return codes
}

const existing = new Set()
const giftCodes = uniqueCodes("GIFT", 500, existing)
const testCodes = uniqueCodes("TEST", 200, existing)
const crushCodes = uniqueCodes("CRUSH", 1500, existing)

const payload = [
  ...giftCodes.map((code) => ({ code, prefix: "GIFT", group: "gift", used: false })),
  ...testCodes.map((code) => ({ code, prefix: "TEST", group: "test", used: false })),
  ...crushCodes.map((code) => ({ code, prefix: "CRUSH", group: "crush", used: false })),
]

const insertBatch = async (batch) => {
  const response = await fetch(`${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/redemption_codes`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(batch),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || "Failed to insert redemption codes")
  }
}

const chunkArray = (arr, size) => {
  const chunks = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}

for (const chunk of chunkArray(payload, 500)) {
  await insertBatch(chunk)
}

await writeFile("gift_codes.txt", giftCodes.join("\n"), "utf-8")
await writeFile("test_codes.txt", testCodes.join("\n"), "utf-8")
await writeFile("crush_codes.txt", crushCodes.join("\n"), "utf-8")

console.log("Generated and uploaded codes:")
console.log("- gift_codes.txt")
console.log("- test_codes.txt")
console.log("- crush_codes.txt")
