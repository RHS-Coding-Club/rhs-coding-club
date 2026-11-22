import { createIcon } from './create-icon'

export const FolderGit2 = /* @__PURE__ */ createIcon('FolderGit2', [
  [
    'path',
    { d: 'M18 19a5 5 0 0 1-5-5v8' },
    {
      dash: '16 30',
      animate: { strokeDashoffset: [16, 0] },
      transition: { duration: 0.45, ease: 'easeOut', delay: 0.1 },
    },
  ],
  [
    'path',
    {
      d: 'M9 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v5',
    },
  ],
  [
    'circle',
    { cx: 13, cy: 12, r: 2 },
    {
      animate: { scale: [1, 1.25, 0.92, 1] },
      transition: { duration: 0.6, ease: 'easeInOut', times: [0, 0.35, 0.7, 1] },
    },
    [13, 12],
  ],
  [
    'circle',
    { cx: 20, cy: 19, r: 2 },
    {
      animate: { scale: [1, 1.25, 0.92, 1] },
      transition: {
        duration: 0.6,
        ease: 'easeInOut',
        times: [0, 0.35, 0.7, 1],
        delay: 0.12,
      },
    },
    [20, 19],
  ],
])
