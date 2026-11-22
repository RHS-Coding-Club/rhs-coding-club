import { createIcon } from './create-icon'
import { QUARTER_TURN } from './moves'

export const ImagePlus = /* @__PURE__ */ createIcon('ImagePlus', [
  [
    'g',
    [
      ['path', { d: 'M16 5h6' }],
      ['path', { d: 'M19 2v6' }],
    ],
    QUARTER_TURN,
    [19, 5],
  ],
  ['path', { d: 'M21 11.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5' }],
  ['path', { d: 'm21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21' }],
  [
    'circle',
    { cx: 9, cy: 9, r: 2 },
    {
      animate: { scale: [1, 1.35, 0.9, 1] },
      transition: {
        duration: 0.6,
        ease: 'easeInOut',
        times: [0, 0.35, 0.7, 1],
        delay: 0.1,
      },
    },
    [9, 9],
  ],
])
