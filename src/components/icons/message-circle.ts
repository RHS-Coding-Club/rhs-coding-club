import { createIcon } from './create-icon'

export const MessageCircle = /* @__PURE__ */ createIcon('MessageCircle', [
  [
    'path',
    {
      d: 'M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719',
    },
    {
      animate: { scale: [1, 0.7, 1.05, 1] },
      transition: { duration: 0.65, times: [0, 0.35, 0.75, 1], ease: 'easeInOut' },
    },
    [4, 20],
  ],
])
