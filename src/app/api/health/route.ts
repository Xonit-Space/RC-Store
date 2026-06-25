import { NextResponse } from "next/server"
import { db } from "@/lib/db"

/**
 * GET /api/health
 * Lightweight liveness + readiness probe used by Docker HEALTHCHECK and load balancers.
 * Returns 200 if the server and database are reachable, 503 otherwise.
 */
export async function GET() {
  try {
    // Lightweight DB ping — checks connection pool is healthy
    await db.$queryRaw`SELECT 1`

    return NextResponse.json(
      { status: "ok", timestamp: new Date().toISOString() },
      { status: 200 }
    )
  } catch (err: unknown) {
    return NextResponse.json(
      {
        status: "error",
        message: err instanceof Error ? err.message : "Database unreachable",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    )
  }
}
