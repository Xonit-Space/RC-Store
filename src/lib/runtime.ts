export const isVercel = !!process.env.VERCEL

export const isServerless = isVercel || !!process.env.AWS_LAMBDA_FUNCTION_NAME

/** Long-lived Node process (Docker VPS, PM2, etc.) — BullMQ workers and Redis pub/sub are supported. */
export const isLongRunningNode =
  process.env.NEXT_RUNTIME === "nodejs" && !isServerless

/**
 * BullMQ workers must not run inside `next dev` — they block the event loop during
 * compilation and cause ChunkLoadError timeouts. Enable only in production Docker/VPS.
 */
export function shouldStartQueueWorkers(): boolean {
  if (process.env.ENABLE_QUEUE_WORKERS !== "true") return false
  if (!isLongRunningNode) return false
  if (process.env.NODE_ENV === "development") return false
  return true
}
