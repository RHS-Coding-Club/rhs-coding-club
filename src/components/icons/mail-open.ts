import { createIcon } from './create-icon'

export const MailOpen = /* @__PURE__ */ createIcon(
  'MailOpen',
  [
    [
      'g',
      [
        ['rect', { x: 7, y: 4, width: 10, height: 9.5, rx: 1, strokeWidth: 1.5 }],
        ['path', { d: 'M9.5 7.3h5', strokeWidth: 1.5 }],
        ['path', { d: 'M9.5 10.3h3', strokeWidth: 1.5 }],
      ],
      {
        extra: true,
        animate: { y: [-9, 0, 2], opacity: [0, 1, 1, 0] },
        transition: {
          y: { duration: 0.8, ease: 'easeInOut', times: [0, 0.4, 1] },
          opacity: { duration: 0.8, ease: 'easeOut', times: [0, 0.25, 0.6, 1] },
        },
      },
    ],
    [
      'path',
      {
        d: 'M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z',
      },
    ],
    ['path', { d: 'm22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10' }],
  ],
  { clip: true },
)
