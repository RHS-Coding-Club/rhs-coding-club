import { createIcon } from './create-icon'
import { FLAP, TICK } from './moves'

export const MailCheck = /* @__PURE__ */ createIcon('MailCheck', [
  ['path', { d: 'M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8' }],
  ['path', { d: 'm22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7' }, FLAP, [12, 7]],
  ['path', { d: 'm16 19 2 2 4-4' }, TICK, [19, 19]],
])
