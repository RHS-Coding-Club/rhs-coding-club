import { createIcon } from './create-icon'
import { BOB, TICK } from './moves'

export const UserCheck = /* @__PURE__ */ createIcon('UserCheck', [
  ['path', { d: 'm16 11 2 2 4-4' }, TICK, [19, 11]],
  ['path', { d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' }],
  ['circle', { cx: 9, cy: 7, r: 4 }, BOB],
])
