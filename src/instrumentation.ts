export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { bootstrapBackendSystems } = await import('@/lib/bootstrap')
    bootstrapBackendSystems()
  }
}
