import { ClientOnly } from '@tanstack/react-router'
import {
  Avatar,
  Badge,
  Bar,
  Button,
  Check,
  Collapse,
  Icon,
  LockScreen,
  Notification,
  Phone,
  Roll,
  Stage,
  Window,
} from '#/components/stageshow/kit'
import type { Act } from '#/components/stageshow/kit'
import { useIsDark } from '#/hooks/use-is-dark'
import '#/components/stageshow/demos/club-look.css'

/*
  /join: what happens after you apply, from both sides at once. Its layout
  lives in the "Join: approval demo" block of src/styles.css.
  Gold copied: device-pair (the desktop pinned top-left and off the bottom,
  the phone straddling its right edge over empty margin, present from frame
  one) with dark-hero's row that opens at the top of a list and a status that
  changes on its own pill.

  Beats: Max's application drops in at the top of the officers' queue and
  pushes the list down; the cursor presses Approve, which turns to Approved on
  itself while the row's pill goes Pending → Approved and the count rolls; a
  beat later the notification lands on Max's lock screen. The poster is that
  last frame.
*/

type S = { arrived: boolean; approved: boolean; notified: boolean }

const START: S = { arrived: false, approved: false, notified: false }
const DONE: S = { arrived: true, approved: true, notified: true }

async function script(a: Act<S>) {
  await a.wait(700)
  a.mark('arrive')
  a.put({ arrived: true })
  await a.wait(1100)
  await a.move({ at: 'approve', x: 0.75, y: 0.62 })
  await a.click()
  a.mark('approve')
  a.put({ approved: true })
  void a.move({ at: 'queue', x: 0.5, y: 0.96 })
  await a.wait(1000)
  a.mark('notify')
  a.put({ notified: true })
}

const FILLER = [
  { name: 82, meta: 120 },
  { name: 64, meta: 96 },
  { name: 74, meta: 132 },
]

export function ApprovalDemo({ initialDark }: { initialDark: boolean }) {
  const dark = useIsDark(initialDark)
  return (
    <ClientOnly
      fallback={
        <div
          className="mx-auto aspect-[960/500] w-full max-w-[960px]"
          aria-hidden="true"
        />
      }
    >
      <div
        role="img"
        aria-label="An officer approves Max's application in the queue, and a notification that he's in lands on his phone."
      >
        <Stage<S>
          width={960}
          height={500}
          compact={{ below: 720, width: 358, height: 560 }}
          theme={dark ? 'dark' : 'light'}
          initial={START}
          poster={DONE}
          script={script}
          play="once"
          cursor={{
            at: { wide: { x: 520, y: 470 }, compact: { x: 250, y: 290 } },
            style: 'real',
          }}
          className="club-look approval-demo"
        >
          {(s, _rect, layout) => {
            const compact = layout === 'compact'
            return (
              <>
                <Window className="ad-win" url="club/admin/applications" urlShape="pill">
                  <div className="ad-body" data-target="queue">
                    <div className="ad-head">
                      <div className="ad-title">Applications</div>
                      <Badge tone="neutral" className="ad-count">
                        <Roll>{String((s.arrived ? 3 : 2) - (s.approved ? 1 : 0))}</Roll>
                        &nbsp;pending
                      </Badge>
                    </div>
                    <div className="ad-list">
                      <Collapse open={s.arrived} reveal="drop">
                        <div className="ad-row" data-lead>
                          <Avatar name="Max Member" size={30} tone="accent" />
                          <span className="ad-lines">
                            <span className="ad-name">Max Member</span>
                            <span className="ad-meta">
                              10th grade · Python, JavaScript
                            </span>
                          </span>
                          {!compact && (
                            <Badge
                              tone={s.approved ? 'success' : 'warning'}
                              className="ad-status"
                              icon={
                                <Check on={s.approved} pending={!s.approved} size={12} />
                              }
                            >
                              <Roll variant="fade">
                                {s.approved ? 'Approved' : 'Pending'}
                              </Roll>
                            </Badge>
                          )}
                          <Button
                            variant="primary"
                            size="medium"
                            data-target="approve"
                            className="ad-approve"
                            data-done={s.approved || undefined}
                            icon={
                              s.approved ? (
                                <Icon name="check" size={13} stroke={2} />
                              ) : undefined
                            }
                          >
                            {s.approved ? 'Approved' : 'Approve'}
                          </Button>
                        </div>
                      </Collapse>
                      {FILLER.map((f, i) => (
                        <div key={i} className="ad-row">
                          <Avatar size={30} plain />
                          <span className="ad-lines">
                            <Bar w={f.name} h={7} tone={3} />
                            <Bar w={f.meta} h={6} tone={2} />
                          </span>
                          {!compact && <Bar w={64} h={20} r={10} tone={1} />}
                          <Bar w={72} h={28} r={8} tone={2} />
                        </div>
                      ))}
                    </div>
                  </div>
                </Window>

                <Phone
                  width={compact ? 232 : 250}
                  frame="pro"
                  dark
                  wallpaper="linear-gradient(172deg, var(--brand-sky) 0%, var(--brand-blue) 38%, var(--brand-navy) 72%, var(--brand-midnight) 100%)"
                  className="ad-phone"
                >
                  <LockScreen size="satellite" stack="top" date="Tuesday, November 24">
                    <Collapse open={s.notified} reveal="drop">
                      <Notification
                        icon={<img src="/logo-128.webp" alt="" width={38} height={38} />}
                        title="RHS Coding Club"
                        body="You’re in, Max. Your member dashboard is unlocked."
                      />
                    </Collapse>
                  </LockScreen>
                </Phone>
              </>
            )
          }}
        </Stage>
      </div>
    </ClientOnly>
  )
}
