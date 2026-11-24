import { createIcon } from './create-icon'

export const Printer = /* @__PURE__ */ createIcon(
  'Printer',
  [
    [
      'path',
      { d: 'M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2' },
    ],
    ['path', { d: 'M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6' }],
    [
      'rect',
      { x: '6', y: '14', width: '12', height: '8', rx: '1' },
      {
        // The page feeds out and settles back into the tray.
        animate: { y: [0, 3, 0] },
        transition: { duration: 0.6, ease: 'easeInOut', times: [0, 0.45, 1] },
      },
    ],
  ],
  { clip: true },
)
