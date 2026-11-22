import { createIcon } from './create-icon'

export const Sun = /* @__PURE__ */ createIcon('Sun', [
  [
    'g',
    [
      [
        'circle',
        { cx: 12, cy: 12, r: 4 },
        {
          animate: { scale: [1, 1.18, 1] },
          transition: { duration: 0.8, ease: 'easeInOut' },
        },
        [12, 12],
      ],
      [
        'g',
        [
          ['path', { d: 'M12 2v2' }],
          ['path', { d: 'M12 20v2' }],
          ['path', { d: 'm4.93 4.93 1.41 1.41' }],
          ['path', { d: 'm17.66 17.66 1.41 1.41' }],
          ['path', { d: 'M2 12h2' }],
          ['path', { d: 'M20 12h2' }],
          ['path', { d: 'm6.34 17.66-1.41 1.41' }],
          ['path', { d: 'm19.07 4.93-1.41 1.41' }],
        ],
        {
          animate: { opacity: [1, 0.7, 1] },
          transition: { duration: 0.8, ease: 'easeInOut' },
        },
      ],
    ],
    {
      animate: { rotate: [0, 14, -6, 0] },
      transition: { duration: 0.8, ease: 'easeInOut', times: [0, 0.4, 0.75, 1] },
    },
    [12, 12],
  ],
])
