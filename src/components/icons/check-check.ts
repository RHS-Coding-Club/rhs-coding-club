import { createIcon } from './create-icon'

export const CheckCheck = /* @__PURE__ */ createIcon('CheckCheck', [
  [
    'path',
    { d: 'M18 6 7 17l-5-5' },
    {
      dash: '24',
      animate: { strokeDashoffset: [-24, 0], opacity: [0, 1] },
      transition: {
        strokeDashoffset: { duration: 0.45, ease: 'easeOut', delay: 0 },
        opacity: { duration: 0.25, delay: 0 },
      },
    },
  ],
  [
    'path',
    { d: 'm22 10-7.5 7.5L13 16' },
    {
      dash: '14',
      animate: { strokeDashoffset: [-14, 0], opacity: [0, 1] },
      transition: {
        strokeDashoffset: { duration: 0.45, ease: 'easeOut', delay: 0.25 },
        opacity: { duration: 0.25, delay: 0.25 },
      },
    },
  ],
])
