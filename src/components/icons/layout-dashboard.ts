import { createIcon } from './create-icon'

export const LayoutDashboard = /* @__PURE__ */ createIcon('LayoutDashboard', [
  [
    'rect',
    { width: 7, height: 9, x: 3, y: 3, rx: 1 },
    {
      animate: { scale: [1, 0.78, 1.1, 1] },
      transition: { duration: 0.51, ease: 'easeInOut', times: [0, 0.35, 0.75, 1] },
    },
    [6.5, 7.5],
  ],
  [
    'rect',
    { width: 7, height: 5, x: 14, y: 3, rx: 1 },
    {
      animate: { scale: [1, 0.78, 1.1, 1] },
      transition: {
        duration: 0.51,
        ease: 'easeInOut',
        times: [0, 0.35, 0.75, 1],
        delay: 0.048,
      },
    },
    [17.5, 5.5],
  ],
  [
    'rect',
    { width: 7, height: 9, x: 14, y: 12, rx: 1 },
    {
      animate: { scale: [1, 0.78, 1.1, 1] },
      transition: {
        duration: 0.51,
        ease: 'easeInOut',
        times: [0, 0.35, 0.75, 1],
        delay: 0.096,
      },
    },
    [17.5, 16.5],
  ],
  [
    'rect',
    { width: 7, height: 5, x: 3, y: 16, rx: 1 },
    {
      animate: { scale: [1, 0.78, 1.1, 1] },
      transition: {
        duration: 0.51,
        ease: 'easeInOut',
        times: [0, 0.35, 0.75, 1],
        delay: 0.144,
      },
    },
    [6.5, 18.5],
  ],
])
