import { NextRequest, NextResponse } from "next/server"
import { withApiHandler } from "@/lib/api-middleware"
import { getQueueConnection, isQueueEnabled } from "@/lib/queue/connection"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

async function queueDepth(listKey: string): Promise<number> {
  if (!isQueueEnabled) return 0
  try {
    return await getQueueConnection().llen(listKey)
  } catch {
    return 0
  }
}

/**
 * GET /api/admin/metrics
 * Real-time system health: queue depths, WS connections, recent events
 */
export const GET = withApiHandler(async (req: NextRequest) => {
  const [
    emailQueueWaiting,
    analyticsQueueWaiting,
    inventoryQueueWaiting,
    recentEvents,
    orderCount,
    userCount,
  ] = await Promise.all([
    queueDepth("bull:email:wait"),
    queueDepth("bull:analytics:wait"),
    queueDepth("bull:inventory:wait"),
    db.domainEventLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { eventId: true, eventType: true, status: true, createdAt: true },
    }),
    db.order.count(),
    db.user.count(),
  ])

  return NextResponse.json({
    queues: {
      email: { waiting: emailQueueWaiting },
      analytics: { waiting: analyticsQueueWaiting },
      inventory: { waiting: inventoryQueueWaiting },
    },
    recentEvents,
    totals: { orders: orderCount, users: userCount },
    timestamp: new Date().toISOString(),
  })
}, { requireAdmin: true, rateLimitNamespace: "admin_metrics" })
