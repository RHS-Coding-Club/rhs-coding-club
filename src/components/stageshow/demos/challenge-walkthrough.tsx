import { useMemo } from 'react'
import {
  Avatar,
  Badge,
  Bar,
  Button,
  Code,
  Count,
  Draft,
  Field,
  Icon,
  Roll,
  Stage,
  Tabs,
  Text,
  Window,
} from '#/components/stageshow/kit'
import type { Act, IconName } from '#/components/stageshow/kit'
import { StageSlot } from './shared'
import './challenge-walkthrough.css'

/*
  Challenges, "How it works": one window, three places, one solution's trip.

    Beat  Where         What happens                                   Step lit
    1     Challenges    the link is typed, Submit becomes Submitted    1 Submit a link
    2     Review        the officer writes a note and presses Pass     2 An officer reviews it
    3     Leaderboard   +points roll in, the row climbs past Leo       3 Points hit the board

  The window keeps its chrome and sidebar across the three; only the body
  crossfades (an 8px rise), and the sidebar's selection moves with each click.
  It plays once when scrolled into view; the poster is the payoff (the board
  after the climb) so a still, a thumbnail or reduced motion still tells the
  end of the story. The page's step list says what each beat is in words.
*/

type View = 'challenge' | 'review' | 'board'
type S = {
  view: View
  link: string
  focused: boolean
  submitted: boolean
  note: string
  editing: boolean
  passed: boolean
  scored: boolean
  climbed: boolean
}

const LINK = 'github.com/maya/sudoku'
const NOTE = 'Checks rows, columns, and boxes. Passed.'

const START: S = {
  view: 'challenge',
  link: '',
  focused: false,
  submitted: false,
  note: '',
  editing: false,
  passed: false,
  scored: false,
  climbed: false,
}
const END: S = {
  view: 'board',
  link: LINK,
  focused: false,
  submitted: true,
  note: NOTE,
  editing: false,
  passed: true,
  scored: true,
  climbed: true,
}

const NAV: { view: View; label: string; icon: IconName }[] = [
  { view: 'challenge', label: 'Challenges', icon: 'code' },
  { view: 'review', label: 'Review', icon: 'circle-check' },
  { view: 'board', label: 'Leaderboard', icon: 'trophy' },
]

// The phone's field is narrower, so its lines are shorter, never cut.
const CODE_SHORT = [
  'def valid(g):',
  '    rows = all(map(ok, g))',
  '    cols = all(map(ok, zip(*g)))',
]

const CODE = [
  'def valid(grid):',
  '    rows = all(len(set(r)) == 9 for r in grid)',
  '    cols = all(len(set(c)) == 9 for c in zip(*grid))',
  '    return rows and cols and boxes_ok(grid)',
]

export function ChallengeWalkthrough({
  theme,
  hard,
  onStep,
}: {
  theme: 'light' | 'dark'
  /** Points for a hard challenge, from settings. */
  hard: number
  /** Which of the three steps is playing (0 to 2), or null when it's done. */
  onStep: (step: number | null) => void
}) {
  // The phone design types a shorter link, so it fits its narrower field.
  const scripts = useMemo(() => {
    const make = (link: string) => async (a: Act<S>) => {
      onStep(0)
      await a.wait(600)
      await a.move({ at: 'link', x: 0.55, y: 0.5 })
      await a.click()
      await a.set({ focused: true })
      await a.type('link', link)
      await a.wait(250)
      await a.move({ at: 'submit', x: 0.75, y: 0.68 })
      await a.click()
      await a.set({ submitted: true, focused: false })
      await a.wait(900)

      onStep(1)
      await a.move({ at: 'nav-review', x: 0.8, y: 0.6 })
      await a.click()
      await a.set({ view: 'review' })
      await a.wait(700)
      await a.move({ at: 'draft', x: 0.7, y: 0.5 })
      await a.click()
      await a.set({ editing: true })
      await a.type('note', NOTE, { interval: 28 })
      await a.wait(300)
      await a.move({ at: 'pass', x: 0.75, y: 0.68 })
      await a.click()
      await a.set({ passed: true, editing: false })
      await a.wait(900)

      onStep(2)
      await a.move({ at: 'nav-board', x: 0.8, y: 0.6 })
      await a.click()
      await a.set({ view: 'board' })
      await a.wait(500)
      await a.set({ scored: true })
      await a.wait(1000)
      await a.set({ climbed: true })
      await a.wait(900)
      await a.move('rest', { duration: 800 })
      onStep(null)
    }
    return { wide: make(LINK), compact: make('github.com/maya') }
  }, [onStep])

  const before = 410
  const people = [
    { id: 'ava', name: 'Ava', pts: before + hard + 110 },
    { id: 'leo', name: 'Leo', pts: before + hard - 20 },
    { id: 'maya', name: 'Maya', pts: before },
    { id: 'noor', name: 'Noor', pts: before - 30 },
  ]

  return (
    <StageSlot className="h-full w-full">
      {({ width, height }) => {
        const compact = width < 560
        const inset = compact ? 16 : 28
        return (
          <Stage<S>
            width={width}
            height={height}
            theme={theme}
            initial={START}
            poster={END}
            play="once"
            script={compact ? scripts.compact : scripts.wide}
            cursor={{ at: 'rest', ripple: true }}
            className="cw-stage"
          >
            {(s) => {
              const views = (
                <div
                  className="cw-views"
                  style={{ height: height - inset - 38 - (compact ? 58 : 18) - 20 }}
                >
                  {/* 1. The challenge, where the member submits */}
                  <section
                    className="cw-view"
                    data-on={s.view === 'challenge' || undefined}
                  >
                    <div className="cw-head">
                      <Badge tone="danger" dot>
                        Hard
                      </Badge>
                      <Text className="cw-faint">Week 9</Text>
                    </div>
                    <Text className="cw-title">Sudoku validator</Text>
                    <div className="cw-lines">
                      <Bar w={compact ? 220 : 300} h={6} tone={2} />
                      <Bar w={compact ? 160 : 230} h={6} tone={2} />
                    </div>
                    <div className="cw-submit">
                      <Field
                        value={s.link}
                        placeholder="Link to your solution"
                        focused={s.focused}
                        className="cw-field"
                        leading={<Icon name="link" size={14} />}
                        box={{ 'data-target': 'link', 'data-cursor': 'ibeam' }}
                      />
                      <Button
                        variant={s.submitted ? 'secondary' : 'primary'}
                        icon={s.submitted ? <Icon name="check" size={14} /> : undefined}
                        data-target="submit"
                      >
                        {s.submitted ? 'Submitted' : 'Submit'}
                      </Button>
                    </div>
                  </section>

                  {/* 2. The officer's review */}
                  <section
                    className="cw-view cw-view--review"
                    data-on={s.view === 'review' || undefined}
                  >
                    <div className="cw-head">
                      <Avatar name="Maya" size={22} />
                      <Text className="cw-strong">Maya</Text>
                      <Text className="cw-faint">Sudoku validator</Text>
                    </div>
                    <Code lines={compact ? CODE_SHORT : CODE} className="cw-code" />
                    <div className="cw-note" data-target="draft" data-cursor="ibeam">
                      <Draft
                        value={s.note}
                        full={NOTE}
                        editing={s.editing}
                        placeholder="Leave a note for Maya"
                      />
                    </div>
                    <div className="cw-actions">
                      <Button>Needs work</Button>
                      <Button
                        variant={s.passed ? 'secondary' : 'primary'}
                        icon={s.passed ? <Icon name="check" size={14} /> : undefined}
                        data-target="pass"
                      >
                        {s.passed ? 'Passed' : 'Pass'}
                      </Button>
                    </div>
                  </section>

                  {/* 3. The board */}
                  <section className="cw-view" data-on={s.view === 'board' || undefined}>
                    <div className="cw-head">
                      <Text className="cw-title cw-title--small">This semester</Text>
                    </div>
                    <div className="cw-board">
                      {people.map((p) => {
                        const order = s.climbed
                          ? ['ava', 'maya', 'leo', 'noor']
                          : ['ava', 'leo', 'maya', 'noor']
                        const rank = order.indexOf(p.id)
                        const maya = p.id === 'maya'
                        return (
                          <div
                            key={p.id}
                            className="cw-row"
                            data-me={maya || undefined}
                            style={{ transform: `translateY(${rank * 46}px)` }}
                          >
                            <Roll className="cw-rank">{String(rank + 1)}</Roll>
                            <Avatar
                              name={p.name}
                              size={24}
                              tone={maya ? 'accent' : 'person'}
                            />
                            <Text className="cw-name">{p.name}</Text>
                            <span className="cw-right">
                              {maya && (
                                <span className="cw-gain" data-on={s.scored || undefined}>
                                  +{hard}
                                </span>
                              )}
                              <span className="cw-pts">
                                <Count
                                  value={maya && s.scored ? p.pts + hard : p.pts}
                                  duration={800}
                                />
                              </span>
                            </span>
                          </div>
                        )
                      })}
                      {[4, 5, 6].map((rank) => (
                        <div
                          key={rank}
                          className="cw-row cw-row--filler"
                          aria-hidden
                          style={{ transform: `translateY(${rank * 46}px)` }}
                        >
                          <Bar w={8} h={6} tone={2} />
                          <Bar w={24} h={24} r={12} tone={2} />
                          <Bar w={[64, 48, 72][rank - 4]} h={6} tone={2} />
                          <Bar w={28} h={6} tone={2} />
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              )

              const active = NAV.findIndex((n) => n.view === s.view)
              return (
                <>
                  <span
                    className="cw-rest"
                    data-target="rest"
                    style={{ left: width - 56, top: height - 48 }}
                  />
                  {compact ? (
                    <Window
                      lights="grey"
                      className="cw-window"
                      style={{
                        left: inset,
                        top: inset,
                        width: width - inset + 40,
                        height: height + 40,
                      }}
                    >
                      <div className="cw-tabs" style={{ width: width - inset * 2 }}>
                        <Tabs
                          items={NAV.map((n) => n.label)}
                          value={active}
                          targets={['nav-challenge', 'nav-review', 'nav-board']}
                        />
                      </div>
                      <div className="cw-body" style={{ width: width - inset * 2 }}>
                        {views}
                      </div>
                    </Window>
                  ) : (
                    <Window
                      lights="grey"
                      sidebarWidth={164}
                      className="cw-window"
                      style={{
                        left: inset,
                        top: inset,
                        width: width - inset + 48,
                        height: height + 40,
                      }}
                      sidebar={
                        <nav className="cw-side">
                          {NAV.map((n) => (
                            <span
                              key={n.view}
                              className="cw-nav"
                              data-active={n.view === s.view || undefined}
                              data-target={`nav-${n.view === 'challenge' ? 'challenge' : n.view}`}
                            >
                              <Icon name={n.icon} size={15} />
                              <Text>{n.label}</Text>
                            </span>
                          ))}
                        </nav>
                      }
                    >
                      <div
                        className="cw-body"
                        style={{ width: width - inset - 164 - 28 }}
                      >
                        {views}
                      </div>
                    </Window>
                  )}
                </>
              )
            }}
          </Stage>
        )
      }}
    </StageSlot>
  )
}
