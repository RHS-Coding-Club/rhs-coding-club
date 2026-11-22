import { createIcon } from './create-icon'

export const List = /* @__PURE__ */ createIcon('List', [
  [
    'path',
    { d: 'M3 5h.01' },
    { animate: { scale: [1, 1.7, 1] }, transition: { duration: 0.4, ease: 'easeInOut' } },
    [3, 5],
  ],
  [
    'path',
    { d: 'M3 12h.01' },
    {
      animate: { scale: [1, 1.7, 1] },
      transition: { duration: 0.4, ease: 'easeInOut', delay: 0.12 },
    },
    [3, 12],
  ],
  [
    'path',
    { d: 'M3 19h.01' },
    {
      animate: { scale: [1, 1.7, 1] },
      transition: { duration: 0.4, ease: 'easeInOut', delay: 0.24 },
    },
    [3, 19],
  ],
  [
    'path',
    { d: 'M8 5h13' },
    {
      animate: { scaleX: [1, 0.55, 1] },
      transition: { duration: 0.5, ease: 'easeInOut', delay: 0.05 },
    },
    [8, 5],
  ],
  [
    'path',
    { d: 'M8 12h13' },
    {
      animate: { scaleX: [1, 0.55, 1] },
      transition: { duration: 0.5, ease: 'easeInOut', delay: 0.17 },
    },
    [8, 12],
  ],
  [
    'path',
    { d: 'M8 19h13' },
    {
      animate: { scaleX: [1, 0.55, 1] },
      transition: { duration: 0.5, ease: 'easeInOut', delay: 0.29 },
    },
    [8, 19],
  ],
])
