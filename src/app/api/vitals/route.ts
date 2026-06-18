import { NextRequest, NextResponse } from "next/server"

/**
 * POST /api/vitals
 * Receives Core Web Vitals performance telemetry data
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // In production, you would stream this to Sentry, Google Analytics, or database logs.
    // Here we log it to stdout for standard monitoring systems to collect.
    console.info(`[Core Web Vitals Report] ID: ${body.id} | Name: ${body.name} | Value: ${body.value} | Label: ${body.label}`)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to process telemetry" }, { status: 400 })
  }
}
