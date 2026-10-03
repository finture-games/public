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

const BUILD_VER = '20261003_v11'

export function assetUrl(path: string): string {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:') || path.startsWith('blob:')) {
    return path
  }

  // Strip existing version query parameters if any
  const cleanPathNoQuery = path.split('?')[0]

  // Detect base URL from Vite
  let base = import.meta.env.BASE_URL || '/'
  if (!base.endsWith('/')) base += '/'

  // Clean raw path (remove leading slashes, redundant base prefixes)
  let clean = cleanPathNoQuery
  if (clean.startsWith('/finture_games/')) clean = clean.substring('/finture_games/'.length)
  if (clean.startsWith('/public/')) clean = clean.substring('/public/'.length)
  if (clean.startsWith('finture_games/')) clean = clean.substring('finture_games/'.length)
  if (clean.startsWith('public/')) clean = clean.substring('public/'.length)
  if (clean.startsWith(base)) clean = clean.substring(base.length)
  clean = clean.replace(/^(\.\/|\/)+/, '')

  const fullUrl = `${base}${clean}`
  return `${fullUrl}?v=${BUILD_VER}`
}
