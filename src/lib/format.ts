export function formatRp(n: number): string {
  const abs = Math.abs(Math.round(n))
  return (n < 0 ? '-Rp' : 'Rp') + abs.toLocaleString('id-ID')
}

export function signRp(n: number): string {
  const abs = Math.abs(Math.round(n))
  return (n < 0 ? '-' : '+') + 'Rp' + abs.toLocaleString('id-ID')
}

export function formatScore(n: number): string {
  return Math.round(n).toString()
}

export function assetUrl(path: string): string {
  const base = import.meta.env.BASE_URL || '/'
  const cleanBase = base.endsWith('/') ? base : base + '/'
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  return cleanBase + cleanPath
}
