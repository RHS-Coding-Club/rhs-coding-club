import { createIcon } from './create-icon'
import { QUARTER_TURN } from './moves'

export const FolderPlus = /* @__PURE__ */ createIcon('FolderPlus', [
  [
    'g',
    [
      [
        'path',
        {
          d: 'M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z',
        },
      ],
      [
        'g',
        [
          ['path', { d: 'M12 10v6' }],
          ['path', { d: 'M9 13h6' }],
        ],
        QUARTER_TURN,
        [12, 13],
      ],
    ],
    {
      animate: { y: [0, -1.2, 0.4, 0] },
      transition: { duration: 0.6, ease: 'easeInOut', times: [0, 0.35, 0.7, 1] },
    },
  ],
])
