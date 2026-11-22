import { createIcon } from './create-icon'

export const Check = /* @__PURE__ */ createIcon('Check', [
  [
    'path',
    { d: 'M20 6 9 17l-5-5' },
    {
      dash: '24',
      animate: { strokeDashoffset: [-24, 0], scale: [0.9, 1.12, 1], opacity: [0, 1] },
      transition: {
        strokeDashoffset: { duration: 0.5, ease: 'easeOut' },
        scale: { duration: 0.55, ease: 'easeInOut', times: [0, 0.6, 1] },
        opacity: { duration: 0.25, ease: 'easeOut' },
      },
    },
    [12, 12],
  ],
])
