import { createIcon } from './create-icon'

export const FileText = /* @__PURE__ */ createIcon('FileText', [
  [
    'g',
    [
      [
        'path',
        {
          d: 'M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z',
        },
      ],
      ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
      [
        'path',
        { d: 'M10 9H8' },
        {
          dash: '3',
          animate: { strokeDashoffset: [-3, 0], opacity: [0, 1] },
          transition: {
            strokeDashoffset: { duration: 0.4, ease: 'easeOut', delay: 0 },
            opacity: { duration: 0.25, ease: 'easeOut', delay: 0 },
          },
        },
      ],
      [
        'path',
        { d: 'M16 13H8' },
        {
          dash: '9',
          animate: { strokeDashoffset: [-9, 0], opacity: [0, 1] },
          transition: {
            strokeDashoffset: { duration: 0.4, ease: 'easeOut', delay: 0.15 },
            opacity: { duration: 0.25, ease: 'easeOut', delay: 0.15 },
          },
        },
      ],
      [
        'path',
        { d: 'M16 17H8' },
        {
          dash: '9',
          animate: { strokeDashoffset: [-9, 0], opacity: [0, 1] },
          transition: {
            strokeDashoffset: { duration: 0.4, ease: 'easeOut', delay: 0.3 },
            opacity: { duration: 0.25, ease: 'easeOut', delay: 0.3 },
          },
        },
      ],
    ],
    {
      animate: { scale: [1, 1.08, 0.98, 1] },
      transition: { duration: 0.6, ease: 'easeInOut', times: [0, 0.4, 0.75, 1] },
    },
    [12, 12],
  ],
])
