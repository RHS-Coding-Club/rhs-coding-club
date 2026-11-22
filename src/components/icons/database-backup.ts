import { createIcon } from './create-icon'

export const DatabaseBackup = /* @__PURE__ */ createIcon(
  'DatabaseBackup',
  [
    [
      'ellipse',
      { cx: 12, cy: 5, rx: 4, ry: 1.3 },
      {
        extra: true,
        animate: { y: [-11, 0, 0.6, 0], opacity: [0, 1, 1, 0, 0] },
        transition: {
          y: {
            duration: 0.8,
            times: [0, 0.4, 0.5, 1],
            ease: ['easeIn', 'easeOut', 'easeInOut'],
          },
          opacity: { duration: 0.8, times: [0, 0.1, 0.4, 0.5, 1], ease: 'easeInOut' },
        },
      },
    ],
    [
      'ellipse',
      { cx: 12, cy: 5, rx: 9, ry: 3 },
      {
        animate: { y: [0, 0, 1, -0.3, 0] },
        transition: { duration: 0.8, ease: 'easeInOut', times: [0, 0.4, 0.58, 0.8, 1] },
      },
    ],
    [
      'g',
      [
        ['path', { d: 'M21 9.3V5' }],
        ['path', { d: 'M3 5v14a9 3 0 0 0 6.47 2.88' }],
      ],
      {
        animate: { scaleY: [1, 1, 0.96, 1.01, 1] },
        transition: { duration: 0.8, ease: 'easeInOut', times: [0, 0.4, 0.6, 0.82, 1] },
      },
      [12, 22],
    ],
    [
      'path',
      { d: 'M3 12a9 3 0 0 0 5 2.69' },
      {
        animate: { y: [0, 0, 1.4, -0.35, 0] },
        transition: { duration: 0.8, ease: 'easeInOut', times: [0, 0.45, 0.63, 0.84, 1] },
      },
    ],
    [
      'g',
      [
        ['path', { d: 'M12 12v4h4' }],
        [
          'path',
          {
            d: 'M13 20a5 5 0 0 0 9-3 4.5 4.5 0 0 0-4.5-4.5c-1.33 0-2.54.54-3.41 1.41L12 16',
          },
        ],
      ],
      {
        animate: { rotate: [0, -35, 8, 0] },
        transition: { duration: 0.7, ease: 'easeInOut', times: [0, 0.4, 0.75, 1] },
      },
      [17.5, 17],
    ],
  ],
  { clip: true },
)
