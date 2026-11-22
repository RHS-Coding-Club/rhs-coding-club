import { createIcon } from './create-icon'
import { FULL_TURN } from './moves'

export const Clock = /* @__PURE__ */ createIcon('Clock', [
  ['circle', { cx: 12, cy: 12, r: 10 }],
  ['path', { d: 'M12 6v6l4 2' }, FULL_TURN, [12, 12]],
])
