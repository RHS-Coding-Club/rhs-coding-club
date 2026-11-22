import { createIcon } from './create-icon'

export const Globe = /* @__PURE__ */ createIcon('Globe', [
  ['circle', { cx: 12, cy: 12, r: 10 }],
  [
    'path',
    { d: 'M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20' },
    { animate: { scaleX: [1, -1, 1] }, transition: { duration: 0.9, ease: 'easeInOut' } },
    [12, 12],
  ],
  ['path', { d: 'M2 12h20' }],
])
