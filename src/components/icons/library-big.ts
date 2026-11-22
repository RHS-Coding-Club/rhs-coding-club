import { createIcon } from './create-icon'

export const LibraryBig = /* @__PURE__ */ createIcon('LibraryBig', [
  [
    'g',
    [
      ['rect', { width: 8, height: 18, x: 3, y: 3, rx: 1 }],
      ['path', { d: 'M7 3v18' }],
    ],
    {
      animate: { y: [0, -1.2, 0.4, 0] },
      transition: { duration: 0.6, ease: 'easeInOut', times: [0, 0.35, 0.7, 1] },
    },
  ],
  [
    'path',
    {
      d: 'M20.4 18.9c.2.5-.1 1.1-.6 1.3l-1.9.7c-.5.2-1.1-.1-1.3-.6L11.1 5.1c-.2-.5.1-1.1.6-1.3l1.9-.7c.5-.2 1.1.1 1.3.6Z',
    },
    {
      animate: { rotate: [0, 8, -3, 0] },
      transition: {
        duration: 0.6,
        ease: 'easeInOut',
        times: [0, 0.35, 0.7, 1],
        delay: 0.1,
      },
    },
    [18.5, 20],
  ],
])
