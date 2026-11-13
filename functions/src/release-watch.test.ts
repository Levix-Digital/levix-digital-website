import { describe, expect, it } from 'vitest'
import { candidatesToAnnounce, releasesApiUrl, type GitHubRelease } from './release-watch'

const now = new Date('2026-11-13T12:00:00Z')
const release = (tag: string, publishedAt: string, extra: Partial<GitHubRelease> = {}): GitHubRelease => ({
  tag_name: tag,
  html_url: `https://github.com/Levix-Digital/gedo-releases/releases/tag/${tag}`,
  body: `Notes of ${tag}`,
  draft: false,
  prerelease: true,
  published_at: publishedAt,
  ...extra,
})

describe('candidatesToAnnounce', () => {
  it('takes the recent published release candidates, oldest first, with their notes and page', () => {
    const announcements = candidatesToAnnounce(
      'gedo',
      [release('v0.2.0-rc.2', '2026-11-13T10:00:00Z'), release('v0.2.0-rc.1', '2026-11-12T10:00:00Z')],
      now,
    )
    expect(announcements).toEqual([
      { product: 'gedo', version: 'v0.2.0-rc.1', downloadUrl: expect.stringContaining('/tag/v0.2.0-rc.1'), notes: 'Notes of v0.2.0-rc.1' },
      { product: 'gedo', version: 'v0.2.0-rc.2', downloadUrl: expect.stringContaining('/tag/v0.2.0-rc.2'), notes: 'Notes of v0.2.0-rc.2' },
    ])
  })

  it('skips releases, drafts, other tags, old candidates and unpublished ones', () => {
    const skipped = [
      release('v0.2.0', '2026-11-13T10:00:00Z', { prerelease: false }),
      release('v0.2.0-rc.3', '2026-11-13T10:00:00Z', { draft: true }),
      release('v0.2.0-beta.1', '2026-11-13T10:00:00Z'),
      release('v0.1.0-rc.1', '2026-11-09T10:00:00Z'),
      release('v0.2.0-rc.4', '', { published_at: null }),
    ]
    expect(candidatesToAnnounce('gedo', skipped, now)).toEqual([])
  })

  it('leaves out empty notes', () => {
    const [announcement] = candidatesToAnnounce('gedo', [release('v0.2.0-rc.1', '2026-11-13T10:00:00Z', { body: '  ' })], now)
    expect(announcement).not.toHaveProperty('notes')
  })

  it('reads the releases repository of the product', () => {
    expect(releasesApiUrl('gedo')).toBe('https://api.github.com/repos/Levix-Digital/gedo-releases/releases?per_page=20')
  })
})
