/**
 * Reads a product's latest release from its public releases repository (FEAT-016, ADR-0016).
 *
 * Used only while a site is built: pages never call the releases service. Every failure gives a
 * result with `release: null` and the cause, so a build never fails because of the service.
 */

import type { AvailabilityStatus } from './types'

/** The operating systems a product can ship an installer for, in display order. */
export type Platform = 'windows' | 'macos' | 'linux'

export const PLATFORMS: readonly Platform[] = ['windows', 'macos', 'linux']

/**
 * Where a product publishes its releases: a public GitHub repository (`owner/name`) and, when the
 * product ships installers, the asset name of the installer per operating system.
 */
export interface ReleaseSource {
  readonly repository: string
  readonly downloads?: Readonly<Partial<Record<Platform, string>>>
}

/** A direct link to the installer of one operating system. */
export interface ReleaseDownload {
  readonly platform: Platform
  readonly url: string
}

/** The release a product site shows. */
export interface ReleaseInfo {
  readonly version: string
  readonly url: string
  readonly publishedAt: string | null
  readonly prerelease: boolean
  readonly downloads: readonly ReleaseDownload[]
}

/** What the reader found: the release, or `null` with the reasons. `warnings` lists what was skipped. */
export interface ReleaseResult {
  readonly release: ReleaseInfo | null
  readonly warnings: readonly string[]
}

/** The part of a product the reader needs. */
export interface ReleaseProduct {
  readonly id: string
  readonly status: AvailabilityStatus
  readonly releases: ReleaseSource
}

export type FetchLike = (url: string, init?: { headers?: Record<string, string> }) => Promise<{
  ok: boolean
  status: number
  json(): Promise<unknown>
}>

export interface ReadOptions {
  readonly fetch?: FetchLike
  readonly token?: string
  readonly apiBase?: string
}

interface GitHubAsset {
  name: string
  browser_download_url: string
}

interface GitHubRelease {
  tag_name: string
  html_url: string
  draft: boolean
  prerelease: boolean
  published_at: string | null
  assets: GitHubAsset[]
}

const REPOSITORY = /^[A-Za-z0-9-]+\/[A-Za-z0-9._-]+$/

/** Throws when a release source is malformed; called by the portfolio validation. */
export function validateReleaseSource(productId: string, source: ReleaseSource): string[] {
  const problems: string[] = []
  if (!REPOSITORY.test(source.repository)) {
    problems.push(`${productId}: releases repository "${source.repository}" is not owner/name`)
  }
  for (const [platform, asset] of Object.entries(source.downloads ?? {})) {
    if (!PLATFORMS.includes(platform as Platform)) problems.push(`${productId}: unknown platform "${platform}"`)
    if (typeof asset !== 'string' || asset.trim() === '') problems.push(`${productId}: empty asset name for ${platform}`)
  }
  return problems
}

/**
 * Reads the release a product site shows: for an available product the latest release (never a
 * pre-release), for a preview the newest published one, pre-releases included; nothing for a
 * product in development.
 */
export async function readRelease(product: ReleaseProduct, options: ReadOptions = {}): Promise<ReleaseResult> {
  if (product.status === 'in-development') return { release: null, warnings: [] }

  const fetchImpl = options.fetch ?? (globalThis.fetch as unknown as FetchLike)
  const base = (options.apiBase ?? 'https://api.github.com').replace(/\/$/, '')
  const repository = product.releases.repository
  const url =
    product.status === 'available'
      ? `${base}/repos/${repository}/releases/latest`
      : `${base}/repos/${repository}/releases?per_page=10`
  const headers: Record<string, string> = {
    accept: 'application/vnd.github+json',
    'x-github-api-version': '2022-11-28',
  }
  if (options.token) headers.authorization = `Bearer ${options.token}`

  let body: unknown
  try {
    const response = await fetchImpl(url, { headers })
    if (!response.ok) {
      const cause = response.status === 404 ? 'no published release' : `HTTP ${response.status}`
      return failed(product.id, repository, cause)
    }
    body = await response.json()
  } catch (error) {
    return failed(product.id, repository, error instanceof Error ? error.message : String(error))
  }

  const found = Array.isArray(body) ? body.find(isPublished) : isPublished(body) ? body : undefined
  if (found === undefined) return failed(product.id, repository, 'no published release')
  if (product.status === 'available' && found.prerelease) return failed(product.id, repository, 'latest is a pre-release')

  const warnings: string[] = []
  const downloads: ReleaseDownload[] = []
  for (const platform of PLATFORMS) {
    const name = product.releases.downloads?.[platform]
    if (name === undefined) continue
    const asset = found.assets.find((candidate) => candidate.name === name)
    if (asset === undefined) {
      warnings.push(`${product.id}: ${found.tag_name} has no asset "${name}" for ${platform}`)
      continue
    }
    downloads.push({ platform, url: asset.browser_download_url })
  }

  return {
    release: {
      version: found.tag_name,
      url: found.html_url,
      publishedAt: found.published_at,
      prerelease: found.prerelease,
      downloads,
    },
    warnings,
  }
}

/**
 * The marker each product site publishes at `/release.json`: what the site was built with, so the
 * release refresh can compare it with the latest release without any other source.
 */
export interface ReleaseMarker {
  readonly product: string
  readonly status: AvailabilityStatus
  readonly repository: string
  readonly version: string | null
  readonly builtAt: string
}

export function releaseMarker(product: ReleaseProduct, release: ReleaseInfo | null, builtAt: Date): ReleaseMarker {
  return {
    product: product.id,
    status: product.status,
    repository: product.releases.repository,
    version: release?.version ?? null,
    builtAt: builtAt.toISOString(),
  }
}

function failed(productId: string, repository: string, cause: string): ReleaseResult {
  return { release: null, warnings: [`${productId}: release of ${repository} not read (${cause})`] }
}

function isPublished(value: unknown): value is GitHubRelease {
  if (typeof value !== 'object' || value === null) return false
  const release = value as Partial<GitHubRelease>
  return (
    release.draft !== true &&
    typeof release.tag_name === 'string' &&
    typeof release.html_url === 'string' &&
    Array.isArray(release.assets)
  )
}
