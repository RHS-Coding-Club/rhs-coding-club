import { vi } from 'vitest'
import { env } from 'cloudflare:workers'
import { WorkerMailer } from 'worker-mailer'

export interface SentMail {
  to: string
  subject: string
  html: string
  text: string
  headers?: Record<string, string>
}

/** Turns real sending on against a fake SMTP connection and records each message. */
export function fakeMailer() {
  env.GMAIL_APP_PASSWORD = 'test-app-password'
  const sent: SentMail[] = []
  const connect = vi.spyOn(WorkerMailer, 'connect').mockResolvedValue({
    send: async (m: SentMail) => {
      sent.push(m)
    },
    close: async () => undefined,
  } as unknown as WorkerMailer)
  return { sent, connect }
}
