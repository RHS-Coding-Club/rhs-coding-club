import { createIcon } from './create-icon'
import { BOB, FULL_TURN } from './moves'

export const UserCog = /* @__PURE__ */ createIcon('UserCog', [
  ['path', { d: 'M10 15H6a4 4 0 0 0-4 4v2' }],
  [
    'g',
    [
      ['path', { d: 'm14.305 16.53.923-.382' }],
      ['path', { d: 'm15.228 13.852-.923-.383' }],
      ['path', { d: 'm16.852 12.228-.383-.923' }],
      ['path', { d: 'm16.852 17.772-.383.924' }],
      ['path', { d: 'm19.148 12.228.383-.923' }],
      ['path', { d: 'm19.53 18.696-.382-.924' }],
      ['path', { d: 'm20.772 13.852.924-.383' }],
      ['path', { d: 'm20.772 16.148.924.383' }],
      ['circle', { cx: 18, cy: 15, r: 3 }],
    ],
    FULL_TURN,
    [18, 15],
  ],
  ['circle', { cx: 9, cy: 7, r: 4 }, BOB],
])
