import { createIcon } from './create-icon'

export const Send = /* @__PURE__ */ createIcon(
  'Send',
  [
    [
      'g',
      [
        [
          'path',
          {
            d: 'M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z',
          },
        ],
        ['path', { d: 'm21.854 2.147-10.94 10.939' }],
      ],
      {
        animate: { x: [0, 12, -12, 0], y: [0, -12, 12, 0], opacity: [1, 0, 0, 1] },
        transition: {
          duration: 0.9,
          ease: ['easeIn', 'easeInOut', 'easeOut'],
          times: [0, 0.4, 0.45, 1],
        },
      },
    ],
  ],
  { clip: true },
)
