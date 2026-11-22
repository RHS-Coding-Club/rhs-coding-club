import { createIcon } from './create-icon'

export const CodeXml = /* @__PURE__ */ createIcon('CodeXml', [
  [
    'path',
    { d: 'm18 16 4-4-4-4' },
    {
      animate: { x: [0, 1, -0.3, 0] },
      transition: { duration: 0.6, ease: 'easeInOut', times: [0, 0.35, 0.7, 1] },
    },
  ],
  [
    'path',
    { d: 'm6 8-4 4 4 4' },
    {
      animate: { x: [0, -1, 0.3, 0] },
      transition: { duration: 0.6, ease: 'easeInOut', times: [0, 0.35, 0.7, 1] },
    },
  ],
  [
    'path',
    { d: 'm14.5 4-5 16' },
    {
      animate: { rotate: [0, 10, -3, 0] },
      transition: { duration: 0.6, ease: 'easeInOut', times: [0, 0.35, 0.7, 1] },
    },
    [12, 12],
  ],
])
