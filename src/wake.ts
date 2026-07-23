const RENDER_NAME = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/
const CUSTOM_DOMAINS: Record<string, string> = {
  'garage-demo': 'garage-demo.sevenz.app',
  'rails-starter-kit': 'rails-starter-kit.sevenz.app',
}

export type MachineStage = 'showcase' | 'ignition' | 'warmup' | 'full-load' | 'online' | 'locked'

export function machineStageFor(progress: number, isLanding = false, isInvalid = false): MachineStage {
  if (isLanding) return 'showcase'
  if (isInvalid) return 'locked'
  if (progress === 100) return 'online'
  if (progress < 35) return 'ignition'
  if (progress < 70) return 'warmup'
  return 'full-load'
}

export function renderTargetFromPath(pathname: string): string | null {
  const parts = pathname.split('/').filter(Boolean)
  if (parts.length === 0) return null

  try {
    const [rawName, ...subpath] = parts
    const name = decodeURIComponent(rawName).toLowerCase()
    const host = CUSTOM_DOMAINS[name] ?? `${name}.onrender.com`
    return RENDER_NAME.test(name) ? `https://${host}/${subpath.join('/')}` : null
  } catch {
    return null
  }
}

export function themeFromSearch<T extends string>(search: string, themes: readonly T[]): T | null {
  const params = new URLSearchParams(search)
  const namedTheme = params.get('theme')

  if (namedTheme && themes.includes(namedTheme as T)) return namedTheme as T
  return themes.find(theme => params.has(theme)) ?? null
}

export function progressFor(attempts: number, elapsedSeconds: number): number {
  return Math.min(94, Math.round(12 + Math.log2(attempts + 1) * 17 + elapsedSeconds * 0.35))
}
