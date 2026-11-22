import { createIcon } from './create-icon'
import { FULL_TURN } from './moves'

export const Clock3 = /* @__PURE__ */ createIcon('Clock3', [
  ['circle', { cx: 12, cy: 12, r: 10 }],
  ['path', { d: 'M12 6v6h4' }, FULL_TURN, [12, 12]],
])
