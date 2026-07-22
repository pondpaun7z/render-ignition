const RENDER_NAME = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/

export function renderTargetFromPath(pathname: string): string | null {
  const parts = pathname.split('/').filter(Boolean)
  if (parts.length !== 1) return null

  try {
    const name = decodeURIComponent(parts[0]).toLowerCase()
    return RENDER_NAME.test(name) ? `https://${name}.onrender.com/` : null
  } catch {
    return null
  }
}

export function progressFor(attempts: number, elapsedSeconds: number): number {
  return Math.min(94, Math.round(12 + Math.log2(attempts + 1) * 17 + elapsedSeconds * 0.35))
}
