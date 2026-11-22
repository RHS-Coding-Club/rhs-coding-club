import { createIcon } from './create-icon'
import { BOB } from './moves'

export const Users = /* @__PURE__ */ createIcon('Users', [
  ['path', { d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' }],
  [
    'path',
    { d: 'M16 3.128a4 4 0 0 1 0 7.744' },
    {
      animate: { y: [0, -1.2, 0.4, 0] },
      transition: {
        duration: 0.6,
        ease: 'easeInOut',
        times: [0, 0.35, 0.7, 1],
        delay: 0.1,
      },
    },
  ],
  ['path', { d: 'M22 21v-2a4 4 0 0 0-3-3.87' }],
  ['circle', { cx: 9, cy: 7, r: 4 }, BOB],
])
