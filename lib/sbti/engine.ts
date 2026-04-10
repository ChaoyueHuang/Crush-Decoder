import sbtiTypes from "./types.json"
import type { SBTIType } from "./types"

type SBTITypesPayload = {
  standard: SBTIType[]
  fallback: SBTIType
}

const LEVEL_TO_SCORE: Record<string, number> = {
  L: 1,
  M: 2,
  H: 3,
}

const toVector = (dimensions: string[]) => {
  if (!Array.isArray(dimensions) || dimensions.length !== 15) return null
  const vector = dimensions.map((value) => LEVEL_TO_SCORE[value])
  if (vector.some((value) => typeof value !== "number")) return null
  return vector as number[]
}

const parsePattern = (pattern: string) => {
  const cleaned = pattern.replace(/-/g, "")
  if (cleaned.length !== 15) return null
  const vector = cleaned.split("").map((value) => LEVEL_TO_SCORE[value])
  if (vector.some((value) => typeof value !== "number")) return null
  return vector as number[]
}

const manhattanDistance = (a: number[], b: number[]) =>
  a.reduce((sum, value, index) => sum + Math.abs(value - b[index]), 0)

export const calculateSBTI = (dimensions: string[], isAlcoholic: boolean): SBTIType => {
  const types = sbtiTypes as SBTITypesPayload

  if (isAlcoholic) {
    const drunk = types.standard.find((type) => type.code === "DRUNK")
    return drunk ?? types.fallback
  }

  const vector = toVector(dimensions)
  if (!vector) return types.fallback

  let best: SBTIType | null = null
  let bestDistance = Number.POSITIVE_INFINITY

  for (const type of types.standard) {
    if (type.code === "DRUNK" || type.pattern === "ANY") continue

    const patternVector = parsePattern(type.pattern)
    if (!patternVector) continue

    const distance = manhattanDistance(vector, patternVector)
    if (distance < bestDistance) {
      bestDistance = distance
      best = type
    }
  }

  if (!best || bestDistance > 12) return types.fallback
  return best
}
