import { NextRequest, NextResponse } from "next/server"

/**
 * POST /api/performance/metrics
 * Compatibility endpoint for performance telemetry clients.
 * Accepts payloads and logs them; wire to analytics storage when needed.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    console.info("[Performance Metrics]", JSON.stringify(body))
    return NextResponse.json({ success: true }, { status: 200 })
  } catch {
    return NextResponse.json({ success: true }, { status: 200 })
  }
}
