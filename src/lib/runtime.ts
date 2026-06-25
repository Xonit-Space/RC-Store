export const isVercel = !!process.env.VERCEL

export const isServerless = isVercel || !!process.env.AWS_LAMBDA_FUNCTION_NAME

/** Long-lived Node process (Docker VPS, PM2, etc.) — BullMQ workers and Redis pub/sub are supported. */
export const isLongRunningNode =
  process.env.NEXT_RUNTIME === "nodejs" && !isServerless
