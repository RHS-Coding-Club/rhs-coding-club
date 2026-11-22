import { createIcon } from './create-icon'

export const Unlink = /* @__PURE__ */ createIcon('Unlink', [
  [
    'path',
    {
      d: 'm18.84 12.25 1.72-1.71h-.02a5.004 5.004 0 0 0-.12-7.07 5.006 5.006 0 0 0-6.95 0l-1.72 1.71',
    },
    {
      animate: { x: [0, 1, -0.3, 0], y: [0, -1, 0.3, 0] },
      transition: { duration: 0.6, ease: 'easeInOut', times: [0, 0.35, 0.7, 1] },
    },
  ],
  [
    'path',
    {
      d: 'm5.17 11.75-1.71 1.71a5.004 5.004 0 0 0 .12 7.07 5.006 5.006 0 0 0 6.95 0l1.71-1.71',
    },
    {
      animate: { x: [0, -1, 0.3, 0], y: [0, 1, -0.3, 0] },
      transition: { duration: 0.6, ease: 'easeInOut', times: [0, 0.35, 0.7, 1] },
    },
  ],
  [
    'line',
    { x1: 8, x2: 8, y1: 2, y2: 5 },
    {
      animate: { scale: [1, 1.4, 0.92, 1] },
      transition: {
        duration: 0.5,
        ease: 'easeInOut',
        times: [0, 0.35, 0.7, 1],
        delay: 0.05,
      },
    },
    [8, 3.5],
  ],
  [
    'line',
    { x1: 2, x2: 5, y1: 8, y2: 8 },
    {
      animate: { scale: [1, 1.4, 0.92, 1] },
      transition: {
        duration: 0.5,
        ease: 'easeInOut',
        times: [0, 0.35, 0.7, 1],
        delay: 0.05,
      },
    },
    [3.5, 8],
  ],
  [
    'line',
    { x1: 16, x2: 16, y1: 19, y2: 22 },
    {
      animate: { scale: [1, 1.4, 0.92, 1] },
      transition: {
        duration: 0.5,
        ease: 'easeInOut',
        times: [0, 0.35, 0.7, 1],
        delay: 0.1,
      },
    },
    [16, 20.5],
  ],
  [
    'line',
    { x1: 19, x2: 22, y1: 16, y2: 16 },
    {
      animate: { scale: [1, 1.4, 0.92, 1] },
      transition: {
        duration: 0.5,
        ease: 'easeInOut',
        times: [0, 0.35, 0.7, 1],
        delay: 0.1,
      },
    },
    [20.5, 16],
  ],
])
