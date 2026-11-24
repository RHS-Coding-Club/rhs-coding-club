import {
  Avatar,
  Badge,
  Bar,
  BrandMark,
  Button,
  Check,
  Collapse,
  Count,
  Facepile,
  Field,
  Icon,
  Roll,
  Stage,
  Text,
  Toggle,
  Window,
} from '#/components/stageshow/kit'
import type { Act } from '#/components/stageshow/kit'
import { StageSlot } from './shared'
import type { Size } from './shared'
import './bento-demos.css'

/*
  The pictures for the home page's "Everything a member gets" bento, planned
  as one set (stageshow references/bento.md):

    Tile          Span   Kind        The one thing                       Moves
    Reviews       2 × 2  Hero UI     a solution goes Submit to Passed    the cursor submits, the officer's note drops in, +100 lands
    Hard points   1 × 1  Stat        "200 pts", on the one navy tile     counts up once (page HTML, not a stage)
    Leaderboard   1 × 2  Component   your row climbing the board         points roll, the row slides up past two others
    Events        1 × 1  Component   one RSVP                            the switch turns on, the count ticks to 7
    Projects      2 × 1  Object      a stack of shipped projects         still
    GitHub org    2 × 1  Collection  members of the org                  the invite ring closes

  One window in the grid (the hero's). Each picture is its own Stage at the
  slot's measured size, so its type draws at 1:1 and the tile owns the crop.
  Each plays one beat, once, as it scrolls in; the hero is the only cursor.
*/

type Theme = 'light' | 'dark'

/* ---------------- Reviews (hero) ---------------- */

type ReviewStep = 'draft' | 'review' | 'passed'
type Review = { step: ReviewStep; note: boolean }
const REVIEW_START: Review = { step: 'draft', note: false }
const REVIEW_END: Review = { step: 'passed', note: true }

const STATUS: Record<ReviewStep, string> = {
  draft: 'Not submitted',
  review: 'In review',
  passed: 'Passed',
}

async function reviewScript(a: Act<Review>) {
  await a.wait(700)
  await a.move({ at: 'submit', x: 0.72, y: 0.7 })
  await a.wait(180)
  await a.click()
  await a.set({ step: 'review' })
  await a.wait(1500)
  await a.set({ note: true })
  await a.wait(900)
  await a.set({ step: 'passed' })
  await a.move('rest', { duration: 700 })
}

export function ReviewPicture({ theme }: { theme: Theme }) {
  return (
    <StageSlot className="h-full w-full">
      {({ width, height }) => {
        const compact = width < 420
        return (
          <Stage<Review>
            width={width}
            height={height}
            theme={theme}
            initial={REVIEW_START}
            poster={REVIEW_END}
            play="once"
            script={reviewScript}
            cursor={{ at: 'rest', ripple: true }}
            className="cb-stage"
          >
            {(s) => (
              <>
                <span
                  className="cb-rest"
                  data-target="rest"
                  style={{ left: width - 64, top: height - 56 }}
                />
                <Window
                  title="Challenges"
                  lights="grey"
                  className="cb-review"
                  style={{
                    top: compact ? 16 : 24,
                    left: compact ? 16 : 24,
                    width: Math.max(compact ? 360 : 540, width + 24),
                    height: height + 40,
                  }}
                >
                  <div
                    className="cb-review-body"
                    style={{ maxWidth: Math.min(460, width - (compact ? 16 : 24)) }}
                  >
                    <div className="cb-review-head">
                      <Badge tone="warning" dot>
                        Medium
                      </Badge>
                    </div>
                    <Text className="cb-review-title">Spiral matrix</Text>

                    <div className="cb-submit">
                      <Field
                        value={compact ? 'github.com/maya' : 'github.com/maya/spiral'}
                        className="cb-field"
                        leading={<Icon name="link" size={14} />}
                      />
                      <Button
                        variant={s.step === 'draft' ? 'primary' : 'secondary'}
                        icon={
                          s.step === 'draft' ? undefined : <Icon name="check" size={14} />
                        }
                        data-target="submit"
                        data-cursor="pointer"
                      >
                        {s.step === 'draft' ? 'Submit' : 'Submitted'}
                      </Button>
                    </div>

                    <div className="cb-status">
                      <Check
                        on={s.step === 'passed'}
                        pending={s.step === 'review'}
                        size={16}
                      />
                      <Roll variant="fade" className="cb-status-word">
                        {STATUS[s.step]}
                      </Roll>
                      <span
                        className="cb-points"
                        data-on={s.step === 'passed' || undefined}
                      >
                        +100
                        <span className="cb-points-unit">pts</span>
                      </span>
                    </div>

                    <Collapse open={s.note} reveal="drop">
                      <div className="cb-note">
                        <Avatar name="Sam" size={26} tone="accent" />
                        <div className="cb-note-text">
                          <Text className="cb-note-name">Sam</Text>
                          <Text wrap className="cb-note-body">
                            Handles the one-row grid too. Nice work.
                          </Text>
                        </div>
                      </div>
                    </Collapse>
                    <div className="cb-filler" aria-hidden>
                      <Bar w={180} h={6} tone={2} />
                      <Bar w={132} h={6} tone={1} />
                    </div>
                  </div>
                </Window>
              </>
            )}
          </Stage>
        )
      }}
    </StageSlot>
  )
}

/* ---------------- Leaderboard ---------------- */

type Board = { climbed: boolean }
const PEOPLE = [
  { id: 'ava', name: 'Ava', pts: 540 },
  { id: 'leo', name: 'Leo', pts: 505 },
  { id: 'noor', name: 'Noor', pts: 470 },
  { id: 'you', name: 'You', pts: 410 },
] as const
const YOU_AFTER = 520

async function boardScript(a: Act<Board>) {
  await a.wait(900)
  await a.set({ climbed: true })
}

export function LeaderboardPicture({ theme }: { theme: Theme }) {
  return (
    <StageSlot className="h-full w-full">
      {({ width, height }) => (
        <Stage<Board>
          width={width}
          height={height}
          theme={theme}
          initial={{ climbed: false }}
          poster={{ climbed: true }}
          play="once"
          script={boardScript}
          className="cb-stage"
        >
          {(s) => {
            const order = s.climbed
              ? ['ava', 'you', 'leo', 'noor']
              : ['ava', 'leo', 'noor', 'you']
            return (
              <div
                className="cb-board"
                style={{ width: width - 48, height: height + 80 }}
              >
                {PEOPLE.map((p) => {
                  const rank = order.indexOf(p.id)
                  const you = p.id === 'you'
                  const pts = you && s.climbed ? YOU_AFTER : p.pts
                  return (
                    <div
                      key={p.id}
                      className="cb-board-row"
                      data-you={you || undefined}
                      style={{ transform: `translateY(${rank * 52}px)` }}
                    >
                      <Roll className="cb-board-rank">{String(rank + 1)}</Roll>
                      <Avatar name={p.name} size={26} tone={you ? 'accent' : 'person'} />
                      <Text className="cb-board-name">{p.name}</Text>
                      <span className="cb-board-pts">
                        <Count value={pts} duration={800} />
                      </span>
                    </div>
                  )
                })}
                {[4, 5, 6].map((rank) => (
                  <div
                    key={rank}
                    className="cb-board-row cb-board-row--filler"
                    style={{ transform: `translateY(${rank * 52}px)` }}
                  >
                    <Bar w={8} h={6} tone={2} />
                    <Bar w={26} h={26} r={13} tone={2} />
                    <Bar w={[52, 40, 60][rank - 4]} h={6} tone={2} />
                    <Bar w={28} h={6} tone={2} className="cb-board-pts" />
                  </div>
                ))}
              </div>
            )
          }}
        </Stage>
      )}
    </StageSlot>
  )
}

/* ---------------- Events ---------------- */

type Rsvp = { going: boolean }

async function rsvpScript(a: Act<Rsvp>) {
  await a.wait(1100)
  await a.set({ going: true })
}

export function RsvpPicture({ theme }: { theme: Theme }) {
  return (
    <StageSlot className="h-full w-full">
      {({ width, height }) => (
        <Stage<Rsvp>
          width={width}
          height={height}
          theme={theme}
          initial={{ going: false }}
          poster={{ going: true }}
          play="once"
          script={rsvpScript}
          className="cb-stage"
        >
          {(s) => (
            <div
              className="cb-events"
              style={{ width: width - 48, top: Math.max(0, height - 68 - 24) }}
            >
              <div className="cb-event">
                <span className="cb-event-date">
                  <span className="cb-event-month">Dec</span>
                  <span className="cb-event-day">5</span>
                </span>
                <span className="cb-event-text">
                  <span className="cb-event-name">Hackathon</span>
                  <Roll className="cb-event-count">{`${s.going ? 7 : 6} going`}</Roll>
                </span>
                <Toggle on={s.going} className="cb-event-toggle" />
              </div>
            </div>
          )}
        </Stage>
      )}
    </StageSlot>
  )
}

/* ---------------- Projects ---------------- */

export function ProjectsPicture({ theme }: { theme: Theme }) {
  return (
    <StageSlot className="h-full w-full">
      {({ width, height }) => {
        const cardW = Math.min(230, width - 112)
        return (
          <Stage width={width} height={height} theme={theme} className="cb-stage">
            {() => (
              <div
                className="cb-stack"
                style={{
                  width: cardW,
                  left: (width - cardW) / 2,
                  top: Math.max(18, (height - 150) / 2),
                }}
              >
                <div className="cb-paper cb-paper--back" style={{ rotate: '-6deg' }} />
                <div className="cb-paper cb-paper--mid" style={{ rotate: '4deg' }} />
                <div className="cb-paper cb-paper--top" style={{ rotate: '-2deg' }}>
                  <div className="cb-paper-cover">
                    <span>Python</span>
                    <span>Flask</span>
                  </div>
                  <div className="cb-paper-body">
                    <Text className="cb-paper-title">Library seat finder</Text>
                    <Facepile names={['Ana', 'Ben', 'Kai']} size={20} overlap={5} />
                  </div>
                </div>
              </div>
            )}
          </Stage>
        )
      }}
    </StageSlot>
  )
}

/* ---------------- GitHub org ---------------- */

const FACES = [
  'J',
  'M',
  'T',
  'R',
  'E',
  'L',
  'D',
  'S',
  'P',
  'N',
  'O',
  'C',
  'H',
  'V',
  'B',
  'G',
  'F',
  'W',
]

type Org = { joined: boolean }

async function orgScript(a: Act<Org>) {
  await a.wait(1300)
  await a.set({ joined: true })
}

export function OrgPicture({ theme }: { theme: Theme }) {
  return (
    <StageSlot className="h-full w-full">
      {({ width, height }) => {
        const pitch = 46
        const cols = Math.ceil((width + pitch) / pitch) + 1
        const focusCol = Math.min(2, cols - 1)
        return (
          <Stage<Org>
            width={width}
            height={height}
            theme={theme}
            initial={{ joined: false }}
            poster={{ joined: true }}
            play="once"
            script={orgScript}
            className="cb-stage"
          >
            {(s) => (
              <div className="cb-org">
                {[0, 1, 2].map((row) => (
                  <div
                    key={row}
                    className="cb-org-row"
                    style={{
                      top: (height - 3 * pitch + 10) / 2 + row * pitch,
                      left: row === 1 ? 12 - pitch / 2 : 12,
                    }}
                  >
                    {Array.from({ length: cols }, (_, i) => {
                      const focus = row === 1 && i === focusCol
                      if (focus) {
                        return (
                          <span key={i} className="cb-org-focus">
                            <span className="cb-org-me">
                              <Avatar
                                name="Me"
                                size={36}
                                tone="accent"
                                ring={s.joined ? 'confirmed' : 'waiting'}
                              />
                              <span className="cb-org-mark">
                                <BrandMark brand="github" size={12} tile={false} />
                              </span>
                            </span>
                            <Badge
                              tone="success"
                              icon={<Icon name="check" size={12} />}
                              className="cb-org-badge"
                              data-on={s.joined || undefined}
                            >
                              Invite accepted
                            </Badge>
                          </span>
                        )
                      }
                      return (
                        <Avatar
                          key={i}
                          name={FACES[(row * 7 + i) % FACES.length]}
                          size={36}
                          tone="person"
                          className="cb-org-face"
                        />
                      )
                    })}
                  </div>
                ))}
              </div>
            )}
          </Stage>
        )
      }}
    </StageSlot>
  )
}

export type { Size }
