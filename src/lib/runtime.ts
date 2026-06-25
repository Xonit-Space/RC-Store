export const isVercel = !!process.env.VERCEL

export const isServerless = isVercel || !!process.env.AWS_LAMBDA_FUNCTION_NAME
