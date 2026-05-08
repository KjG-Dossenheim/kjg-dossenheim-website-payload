export function getRequiredEnv(name: string): string {
  const val = (process.env[name] || '').trim()
  if (!val) {
    throw new Error(`ENV_MISSING:${name}`)
  }
  return val
}
