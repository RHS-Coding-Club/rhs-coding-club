import { createIcon } from './create-icon'

export const QrCode = /* @__PURE__ */ createIcon('QrCode', [
  [
    'rect',
    { width: 5, height: 5, x: 3, y: 3, rx: 1 },
    {
      animate: { scale: [1, 1.12, 0.96, 1] },
      transition: { duration: 0.5, ease: 'easeInOut', times: [0, 0.35, 0.7, 1] },
    },
    [5.5, 5.5],
  ],
  [
    'rect',
    { width: 5, height: 5, x: 16, y: 3, rx: 1 },
    {
      animate: { scale: [1, 1.12, 0.96, 1] },
      transition: {
        duration: 0.5,
        ease: 'easeInOut',
        times: [0, 0.35, 0.7, 1],
        delay: 0.06,
      },
    },
    [18.5, 5.5],
  ],
  [
    'rect',
    { width: 5, height: 5, x: 3, y: 16, rx: 1 },
    {
      animate: { scale: [1, 1.12, 0.96, 1] },
      transition: {
        duration: 0.5,
        ease: 'easeInOut',
        times: [0, 0.35, 0.7, 1],
        delay: 0.12,
      },
    },
    [5.5, 18.5],
  ],
  ['path', { d: 'M21 16h-3a2 2 0 0 0-2 2v3' }],
  ['path', { d: 'M12 7v3a2 2 0 0 1-2 2H7' }],
  [
    'path',
    { d: 'M12 3h.01' },
    {
      animate: { scale: [1, 1.6, 1] },
      transition: { duration: 0.35, ease: 'easeInOut', delay: 0.1 },
    },
    [12, 3],
  ],
  [
    'path',
    { d: 'M3 12h.01' },
    {
      animate: { scale: [1, 1.6, 1] },
      transition: { duration: 0.35, ease: 'easeInOut', delay: 0.14 },
    },
    [3, 12],
  ],
  [
    'path',
    { d: 'M16 12h1' },
    {
      animate: { scale: [1, 1.6, 1] },
      transition: { duration: 0.35, ease: 'easeInOut', delay: 0.18 },
    },
    [16.5, 12],
  ],
  [
    'path',
    { d: 'M21 12v.01' },
    {
      animate: { scale: [1, 1.6, 1] },
      transition: { duration: 0.35, ease: 'easeInOut', delay: 0.22 },
    },
    [21, 12],
  ],
  [
    'path',
    { d: 'M12 16v.01' },
    {
      animate: { scale: [1, 1.6, 1] },
      transition: { duration: 0.35, ease: 'easeInOut', delay: 0.26 },
    },
    [12, 16],
  ],
  [
    'path',
    { d: 'M12 21v-1' },
    {
      animate: { scale: [1, 1.6, 1] },
      transition: { duration: 0.35, ease: 'easeInOut', delay: 0.3 },
    },
    [12, 20.5],
  ],
  [
    'path',
    { d: 'M21 21v.01' },
    {
      animate: { scale: [1, 1.6, 1] },
      transition: { duration: 0.35, ease: 'easeInOut', delay: 0.34 },
    },
    [21, 21],
  ],
])
