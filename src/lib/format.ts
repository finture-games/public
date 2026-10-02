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

const BUILD_VER = '20261002_v3'

export function assetUrl(path: string): string {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path

  const base = import.meta.env.BASE_URL || '/'
  const cleanBase = base.endsWith('/') ? base : base + '/'
  const cleanPath = path.startsWith('/') ? path.slice(1) : path

  let fullUrl = ''
  if (base !== '/' && (path.startsWith(base) || cleanPath.startsWith(cleanBase.slice(1)))) {
    fullUrl = path.startsWith('/') ? path : '/' + path
  } else {
    fullUrl = cleanBase + cleanPath
  }

  const sep = fullUrl.includes('?') ? '&' : '?'
  return `${fullUrl}${sep}v=${BUILD_VER}`
}
