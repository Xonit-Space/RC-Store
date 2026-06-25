/**
 * Converts Prisma Decimal (and similar) values into plain JSON-safe types
 * before passing data from Server Components / Server Actions to the client.
 */
export function serializeForClient<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_key, val) => {
      if (val !== null && typeof val === "object") {
        if (typeof (val as { toNumber?: () => number }).toNumber === "function") {
          return (val as { toNumber: () => number }).toNumber()
        }
      }
      if (typeof val === "bigint") {
        return val.toString()
      }
      return val
    })
  ) as T
}

export function decimalToNumber(value: unknown): number {
  if (value == null) return 0
  if (typeof value === "number") return value
  if (typeof value === "string") return parseFloat(value) || 0
  if (typeof value === "object" && typeof (value as { toNumber?: () => number }).toNumber === "function") {
    return (value as { toNumber: () => number }).toNumber()
  }
  return Number(value) || 0
}
