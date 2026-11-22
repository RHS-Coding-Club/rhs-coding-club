import { createIcon } from './create-icon'

export const Minimize = /* @__PURE__ */ createIcon('Minimize', [
  [
    'path',
    { d: 'M8 3v3a2 2 0 0 1-2 2H3' },
    {
      animate: { x: [0, 1.5, -0.3, 0], y: [0, 1.5, -0.3, 0] },
      transition: { duration: 0.6, ease: 'easeInOut', times: [0, 0.35, 0.7, 1] },
    },
  ],
  [
    'path',
    { d: 'M21 8h-3a2 2 0 0 1-2-2V3' },
    {
      animate: { x: [0, -1.5, 0.3, 0], y: [0, 1.5, -0.3, 0] },
      transition: { duration: 0.6, ease: 'easeInOut', times: [0, 0.35, 0.7, 1] },
    },
  ],
  [
    'path',
    { d: 'M3 16h3a2 2 0 0 1 2 2v3' },
    {
      animate: { x: [0, 1.5, -0.3, 0], y: [0, -1.5, 0.3, 0] },
      transition: { duration: 0.6, ease: 'easeInOut', times: [0, 0.35, 0.7, 1] },
    },
  ],
  [
    'path',
    { d: 'M16 21v-3a2 2 0 0 1 2-2h3' },
    {
      animate: { x: [0, -1.5, 0.3, 0], y: [0, -1.5, 0.3, 0] },
      transition: { duration: 0.6, ease: 'easeInOut', times: [0, 0.35, 0.7, 1] },
    },
  ],
])
