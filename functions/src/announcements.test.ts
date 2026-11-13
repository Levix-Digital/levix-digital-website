import { describe, expect, it } from 'vitest'
import { AnnouncementError, announcementKey, announcementMails, type Announcement } from './announcements'
import { confirm, subscribe, unsubscribe } from './subscriptions'
import { linkToken, testSender, testService } from './test-support'

const announcement: Announcement = {
  product: 'gedo',
  version: 'v0.2.0-rc.1',
  downloadUrl: 'https://github.com/Levix-Digital/gedo/releases/tag/v0.2.0-rc.1',
  notes: 'Merges by meaning now cover Rust.',
}

async function subscriber(service: ReturnType<typeof testService>, email: string, product: 'gedo' | 'aurora', confirmIt = true) {
  const before = service.store.mails.length
  await subscribe(service, { email, product, consentVersion: '2026-11-13', consentText: 'consent', page: 'https://gedo.levix.digital/' })
  const text = service.store.mails[before]!.message.text
  if (confirmIt) await confirm(service, linkToken(text, 'confirm'))
  return text
}

describe('announcementMails', () => {
  it('writes one email per confirmed subscriber of the product only', async () => {
    const service = testService()
    await subscriber(service, 'ana@example.com', 'gedo')
    await subscriber(service, 'bo@example.com', 'gedo')
    await subscriber(service, 'pending@example.com', 'gedo', false)
    await subscriber(service, 'other@example.com', 'aurora')
    const mails = await announcementMails(service.store, announcement, testSender, service.now())
    expect(mails.map(({ mail }) => mail.to).sort()).toEqual(['ana@example.com', 'bo@example.com'])
    expect(mails[0]?.mail.message.subject).toBe('Gedo v0.2.0-rc.1: release candidate ready to test')
    expect(mails[0]?.mail.message.text).toContain(announcement.downloadUrl)
    expect(mails[0]?.mail.message.text).toContain('Merges by meaning now cover Rust.')
  })

  it('gives each email the subscriber own working unsubscribe link and the sender block (CASL)', async () => {
    const service = testService()
    await subscriber(service, 'ana@example.com', 'gedo')
    const mail = (await announcementMails(service.store, announcement, testSender, service.now()))[0]!.mail
    expect(mail.message.text).toContain('Levix Digital Inc., 31 Masters Square SE, Calgary, Alberta, Canada')
    expect(mail.headers['List-Unsubscribe']).toContain('/one-click-unsubscribe?token=')
    await unsubscribe(service, linkToken(mail.message.text, 'unsubscribe'))
    expect(await announcementMails(service.store, announcement, testSender, service.now())).toEqual([])
  })

  it.each([
    [{ ...announcement, version: 'v0.2.0' }, 'not a release candidate version'],
    [{ ...announcement, downloadUrl: 'http://example.com' }, 'must be an https address'],
  ])('refuses bad input', async (input, message) => {
    await expect(announcementMails(testService().store, input, testSender, new Date())).rejects.toThrow(AnnouncementError)
    await expect(announcementMails(testService().store, input, testSender, new Date())).rejects.toThrow(message)
  })

  it('records an announcement once', async () => {
    const service = testService()
    await subscriber(service, 'ana@example.com', 'gedo')
    const mails = await announcementMails(service.store, announcement, testSender, service.now())
    const key = announcementKey(announcement)
    expect(key).toBe('gedo-0.2.0-rc.1')
    expect(announcementKey({ ...announcement, version: '0.2.0-rc.1' })).toBe(key)
    expect(await service.store.recordAnnouncement(key, announcement, service.now(), mails)).toBe('recorded')
    expect(await service.store.recordAnnouncement(key, announcement, service.now(), mails)).toBe('exists')
  })

  it('resumes an announcement that stopped halfway, without a second email to anyone', async () => {
    const service = testService()
    for (const email of ['ana@example.com', 'bo@example.com', 'cy@example.com']) await subscriber(service, email, 'gedo')
    const before = service.store.mails.length
    const mails = await announcementMails(service.store, announcement, testSender, service.now())
    const key = announcementKey(announcement)
    service.store.failAfterMails = 1
    await expect(service.store.recordAnnouncement(key, announcement, service.now(), mails)).rejects.toThrow()
    expect(service.store.mails.length - before).toBe(1)
    expect(await service.store.recordAnnouncement(key, announcement, service.now(), mails)).toBe('recorded')
    const sent = service.store.mails.slice(before).map((mail) => mail.to).sort()
    expect(sent).toEqual(['ana@example.com', 'bo@example.com', 'cy@example.com'])
    expect(await service.store.recordAnnouncement(key, announcement, service.now(), mails)).toBe('exists')
  })
})
