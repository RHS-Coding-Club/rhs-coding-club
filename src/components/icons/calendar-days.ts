import { createIcon } from './create-icon'
import { RING } from './moves'

export const CalendarDays = /* @__PURE__ */ createIcon('CalendarDays', [
  ['path', { d: 'M8 2v4' }, RING],
  ['path', { d: 'M16 2v4' }, RING],
  ['rect', { width: 18, height: 18, x: 3, y: 4, rx: 2 }],
  ['path', { d: 'M3 10h18' }],
  [
    'path',
    { d: 'M8 14h.01' },
    {
      animate: { scale: [1, 1.7, 1] },
      transition: { duration: 0.45, ease: 'easeInOut', delay: 0.1 },
    },
    [8, 14],
  ],
  [
    'path',
    { d: 'M12 14h.01' },
    {
      animate: { scale: [1, 1.7, 1] },
      transition: { duration: 0.45, ease: 'easeInOut', delay: 0.17 },
    },
    [12, 14],
  ],
  [
    'path',
    { d: 'M16 14h.01' },
    {
      animate: { scale: [1, 1.7, 1] },
      transition: { duration: 0.45, ease: 'easeInOut', delay: 0.24 },
    },
    [16, 14],
  ],
  [
    'path',
    { d: 'M8 18h.01' },
    {
      animate: { scale: [1, 1.7, 1] },
      transition: { duration: 0.45, ease: 'easeInOut', delay: 0.31 },
    },
    [8, 18],
  ],
  [
    'path',
    { d: 'M12 18h.01' },
    {
      animate: { scale: [1, 1.7, 1] },
      transition: { duration: 0.45, ease: 'easeInOut', delay: 0.38 },
    },
    [12, 18],
  ],
  [
    'path',
    { d: 'M16 18h.01' },
    {
      animate: { scale: [1, 1.7, 1] },
      transition: { duration: 0.45, ease: 'easeInOut', delay: 0.45 },
    },
    [16, 18],
  ],
])
