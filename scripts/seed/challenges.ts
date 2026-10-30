import { DAY, doc, q } from './util'
import type { SeedContext } from './util'

const HOUR = 60 * 60 * 1000

interface SeedChallenge {
  id: string
  week: number
  title: string
  description: string
  prompt: string
  difficulty: 'easy' | 'medium' | 'hard'
  points: number
  sampleInput: string | null
  sampleOutput: string | null
  /** Days from now (negative = past). null = draft. */
  publishedIn: number | null
}

const CHALLENGES: SeedChallenge[] = [
  {
    id: 'c_seed_1',
    week: 1,
    title: 'FizzBuzz, but make it yours',
    description: 'The classic warmup with a twist: you pick the rules.',
    difficulty: 'easy',
    points: 50,
    publishedIn: -49,
    prompt: doc(
      'Print the numbers from 1 to `n`. For multiples of 3 print `Fizz`, for multiples of 5 print `Buzz`, and for multiples of both print `FizzBuzz`.',
      { h2: 'The twist' },
      'Once the classic version works, make the rules data instead of `if` statements, so adding "multiples of 7 print `Bazz`" is a one-line change.',
      {
        list: [
          'Read `n` from input.',
          'Keep the rules in a list or map.',
          'No hard-coded 15.',
        ],
      },
    ),
    sampleInput: '15',
    sampleOutput:
      '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz',
  },
  {
    id: 'c_seed_2',
    week: 2,
    title: 'Reverse a linked list',
    description: 'Flip a singly linked list in place without making a new one.',
    difficulty: 'medium',
    points: 100,
    publishedIn: -42,
    prompt: doc(
      'Write `reverse(head)` that reverses a singly linked list and returns the new head. Do it in place: no new nodes, no arrays.',
      {
        code: 'class Node:\n    def __init__(self, value, next=None):\n        self.value = value\n        self.next = next',
      },
      { h3: 'Stretch goal' },
      'Write it twice: once with a loop and once recursively. Which one would you trust with a list of a million nodes?',
    ),
    sampleInput: '1 -> 2 -> 3 -> 4 -> 5',
    sampleOutput: '5 -> 4 -> 3 -> 2 -> 1',
  },
  {
    id: 'c_seed_3',
    week: 3,
    title: 'Build a tiny URL shortener',
    description: 'Turn long links into six-character codes and back again.',
    difficulty: 'hard',
    points: 200,
    publishedIn: -35,
    prompt: doc(
      'Build two functions: `shorten(url)` returns a six-character code, and `expand(code)` returns the original URL.',
      {
        list: [
          'Codes use only `a-z`, `A-Z`, and `0-9`.',
          'Shortening the same URL twice returns the same code.',
          'Two different URLs never share a code.',
        ],
      },
      'You can keep everything in memory. Bonus points from the reviewer (not the leaderboard) if you put it behind a real web page.',
    ),
    sampleInput: 'shorten("https://riponhigh.org/clubs/coding")',
    sampleOutput: '"aZ3k9Q"',
  },
  {
    id: 'c_seed_4',
    week: 4,
    title: 'Palindrome sentences',
    description:
      'Decide if a sentence reads the same backward, ignoring spaces and case.',
    difficulty: 'easy',
    points: 50,
    publishedIn: -28,
    prompt: doc(
      'Given a line of text, print `true` if it is a palindrome once you drop everything that is not a letter or digit and ignore case. Otherwise print `false`.',
      'Try it without building a reversed copy of the string: walk in from both ends instead.',
    ),
    sampleInput: 'Never odd or even.',
    sampleOutput: 'true',
  },
  {
    id: 'c_seed_5',
    week: 5,
    title: 'Minutes left in the period',
    description:
      'Given the bell schedule and a time, say which period it is and how long is left.',
    difficulty: 'medium',
    points: 100,
    publishedIn: -21,
    prompt: doc(
      'The first line of input is the bell schedule: one period per line as `name start end` in 24-hour time. The last line is the current time.',
      'Print the current period and the minutes left in it. Between periods, print `passing` and the minutes until the next bell. After school, print `done`.',
      { h3: 'Watch out for' },
      {
        list: [
          'Lunch is a period too.',
          'Rally days shift every bell; your code should not care.',
        ],
      },
    ),
    sampleInput: '1 08:00 08:55\n2 09:00 09:55\nlunch 12:05 12:40\n09:41',
    sampleOutput: '2 14',
  },
  {
    id: 'c_seed_6',
    week: 6,
    title: 'H2O: find the leak',
    description: 'Spot the hours where water use jumps far above normal.',
    difficulty: 'medium',
    points: 100,
    publishedIn: -14,
    prompt: doc(
      'A warmup for the H2O hackathon. You get one reading per hour: gallons used. Flag every hour that is more than double the average of the six hours before it.',
      {
        code: 'readings = [12, 10, 11, 13, 12, 11, 40, 12, 11]\n# hour 6 (40 gallons) is a spike',
      },
      'Print the indexes of the spikes, one per line. Skip the first six hours, since they have no full window.',
    ),
    sampleInput: '12 10 11 13 12 11 40 12 11',
    sampleOutput: '6',
  },
  {
    id: 'c_seed_7',
    week: 7,
    title: 'Spiral matrix',
    description: 'Print a grid in clockwise spiral order, outside in.',
    difficulty: 'hard',
    points: 200,
    publishedIn: -7,
    prompt: doc(
      'Read an `m` by `n` grid of numbers and print them in clockwise spiral order, starting at the top-left corner.',
      'It has to work for grids that are not square, and for a single row or column.',
      { h3: 'Rules' },
      {
        list: [
          'No recursion.',
          'Visit each cell exactly once.',
          'O(1) extra space besides the output.',
        ],
      },
    ),
    sampleInput: '3 4\n1 2 3 4\n5 6 7 8\n9 10 11 12',
    sampleOutput: '1 2 3 4 8 12 11 10 9 5 6 7',
  },
  {
    id: 'c_seed_8',
    week: 8,
    title: 'Group the anagrams',
    description: 'Sort a list of words into groups that use exactly the same letters.',
    difficulty: 'easy',
    points: 50,
    publishedIn: -1,
    prompt: doc(
      'You get a list of lowercase words, one per line. Group the words that are anagrams of each other and print each group on its own line.',
      {
        list: [
          'Words inside a group keep their input order.',
          'Groups are ordered by their first word.',
          'A word with no anagram is a group of one.',
        ],
      },
      'Hint: what could you use as a key so that `listen` and `silent` land in the same bucket?',
      { code: 'def key(word):\n    ...  # same for every anagram' },
    ),
    sampleInput: 'listen\nenlist\ngoogle\nsilent\ninlets\nbanana',
    sampleOutput: 'listen enlist silent inlets\ngoogle\nbanana',
  },
  {
    id: 'c_seed_9',
    week: 9,
    title: 'Sudoku validator',
    description: 'Check whether a filled-in 9x9 sudoku grid follows every rule.',
    difficulty: 'hard',
    points: 200,
    publishedIn: 5,
    prompt: doc(
      'Read nine lines of nine digits. Print `valid` if every row, column, and 3x3 box holds the digits 1 to 9 exactly once. Otherwise print the first rule that breaks.',
      { h3: 'Output format' },
      'Use `row 4`, `column 7`, or `box 2` (boxes numbered left to right, top to bottom, from 1).',
    ),
    sampleInput:
      '534678912\n672195348\n198342567\n859761423\n426853791\n713924856\n961537284\n287419635\n345286179',
    sampleOutput: 'valid',
  },
  {
    id: 'c_seed_10',
    week: 10,
    title: 'Run-length encoding',
    description: 'Compress repeated letters into counts, then undo it.',
    difficulty: 'easy',
    points: 50,
    publishedIn: null,
    prompt: doc(
      'Write `encode` and `decode`. `encode("aaabccdddd")` returns `3a1b2c4d`; `decode` turns it back.',
      'Draft: still deciding whether single letters should drop the 1.',
    ),
    sampleInput: 'aaabccdddd',
    sampleOutput: '3a1b2c4d',
  },
]

interface SeedSubmission {
  id: string
  challengeId: string
  userId: string
  language: string
  platform: string
  url: string
  code: string | null
  status: 'pending' | 'pass' | 'fail'
  feedback: string | null
  /** Hours ago it was (last) submitted. */
  submittedAgo: number
  /** Hours ago it was reviewed (pass/fail only). */
  reviewedAgo?: number
}

const ANAGRAM_PY = `from collections import defaultdict
import sys

def group_anagrams(words):
    groups = defaultdict(list)
    for word in words:
        groups["".join(sorted(word))].append(word)
    return list(groups.values())

words = sys.stdin.read().split()
for group in group_anagrams(words):
    print(" ".join(group))`

const SPIRAL_JS = `function spiral(grid) {
  const out = []
  let top = 0, bottom = grid.length - 1
  let left = 0, right = grid[0].length - 1
  while (top <= bottom && left <= right) {
    for (let c = left; c <= right; c++) out.push(grid[top][c])
    top++
    for (let r = top; r <= bottom; r++) out.push(grid[r][right])
    right--
    for (let c = right; c >= left; c--) out.push(grid[bottom][c])
    bottom--
    for (let r = bottom; r >= top; r--) out.push(grid[r][left])
    left++
  }
  return out
}`

const LEAK_PY = `def spikes(readings):
    out = []
    for i in range(6, len(readings)):
        window = readings[i - 6:i]
        if readings[i] > 2 * (sum(window) / 6):
            out.append(i)
    return out`

const FIZZ_JAVA = `public class FizzBuzz {
    public static void main(String[] args) {
        int n = Integer.parseInt(args[0]);
        int[] divisors = {3, 5};
        String[] words = {"Fizz", "Buzz"};
        for (int i = 1; i <= n; i++) {
            StringBuilder line = new StringBuilder();
            for (int r = 0; r < divisors.length; r++) {
                if (i % divisors[r] == 0) line.append(words[r]);
            }
            System.out.println(line.length() > 0 ? line : String.valueOf(i));
        }
    }
}`

const SUBMISSIONS: SeedSubmission[] = [
  // Passes. The members seed grants their points (pe_seed_*), keep in step.
  {
    id: 's_seed_1',
    challengeId: 'c_seed_1',
    userId: 'u_seed_m1',
    language: 'Python',
    platform: 'GitHub',
    url: 'https://github.com/priya-n/club-challenges/blob/main/week1/fizzbuzz.py',
    code: 'RULES = [(3, "Fizz"), (5, "Buzz")]\n\nfor i in range(1, int(input()) + 1):\n    line = "".join(word for d, word in RULES if i % d == 0)\n    print(line or i)',
    status: 'pass',
    feedback: 'Rules as data, exactly the point. Clean.',
    submittedAgo: 7 * 24,
    reviewedAgo: 6 * 24,
  },
  {
    id: 's_seed_2',
    challengeId: 'c_seed_2',
    userId: 'u_seed_m1',
    language: 'Python',
    platform: 'GitHub',
    url: 'https://github.com/priya-n/club-challenges/blob/main/week2/reverse.py',
    code: 'def reverse(head):\n    prev = None\n    while head:\n        head.next, prev, head = prev, head, head.next\n    return prev',
    status: 'pass',
    feedback:
      'The tuple swap is slick. Add a comment next time so the rest of us can follow it.',
    submittedAgo: 4 * 24,
    reviewedAgo: 3 * 24,
  },
  {
    id: 's_seed_3',
    challengeId: 'c_seed_1',
    userId: 'u_seed_m2',
    language: 'JavaScript',
    platform: 'Replit',
    url: 'https://replit.com/@diegor/fizzbuzz-rules',
    code: null,
    status: 'pass',
    feedback: 'Works for every n we tried.',
    submittedAgo: 6 * 24,
    reviewedAgo: 5 * 24,
  },
  {
    id: 's_seed_4',
    challengeId: 'c_seed_1',
    userId: 'u_member',
    language: 'Java',
    platform: 'GitHub',
    url: 'https://github.com/maxmember/rhs-challenges/blob/main/FizzBuzz.java',
    code: FIZZ_JAVA,
    status: 'pass',
    feedback: 'Nice parallel arrays. A Map would read a little cleaner, but this passes.',
    submittedAgo: 5 * 24,
    reviewedAgo: 4 * 24,
  },
  {
    id: 's_seed_5',
    challengeId: 'c_seed_2',
    userId: 'u_seed_m3',
    language: 'C++',
    platform: 'GitHub',
    url: 'https://github.com/lenak/cs-practice/blob/main/reverse_list.cpp',
    code: null,
    status: 'pass',
    feedback: 'Both versions work. Good call noting the recursion depth problem.',
    submittedAgo: 2 * 24,
    reviewedAgo: 24,
  },
  // In the queue or sent back.
  {
    id: 's_seed_6',
    challengeId: 'c_seed_8',
    userId: 'u_member',
    language: 'Python',
    platform: 'GitHub',
    url: 'https://github.com/maxmember/rhs-challenges/blob/main/week8/anagrams.py',
    code: ANAGRAM_PY,
    status: 'pending',
    feedback: null,
    submittedAgo: 5,
  },
  {
    id: 's_seed_7',
    challengeId: 'c_seed_7',
    userId: 'u_member',
    language: 'JavaScript',
    platform: 'CodePen',
    url: 'https://codepen.io/maxmember/pen/spiral-matrix',
    code: SPIRAL_JS,
    status: 'fail',
    feedback:
      'Close! A single column like [[1],[2],[3]] prints 3 twice: after bottom-- the left-going loop runs again. Check top <= bottom before the last two loops.',
    submittedAgo: 4 * 24,
    reviewedAgo: 3 * 24,
  },
  {
    id: 's_seed_8',
    challengeId: 'c_seed_8',
    userId: 'u_seed_m1',
    language: 'TypeScript',
    platform: 'GitHub',
    url: 'https://github.com/priya-n/club-challenges/blob/main/week8/anagrams.ts',
    code: 'export function group(words: string[]) {\n  const m = new Map<string, string[]>()\n  for (const w of words) {\n    const k = [...w].sort().join("")\n    m.set(k, [...(m.get(k) ?? []), w])\n  }\n  return [...m.values()]\n}',
    status: 'pending',
    feedback: null,
    submittedAgo: 9,
  },
  {
    id: 's_seed_9',
    challengeId: 'c_seed_7',
    userId: 'u_seed_m2',
    language: 'Python',
    platform: 'Replit',
    url: 'https://replit.com/@diegor/spiral',
    code: null,
    status: 'pending',
    feedback: null,
    submittedAgo: 30,
  },
  {
    id: 's_seed_10',
    challengeId: 'c_seed_6',
    userId: 'u_seed_m4',
    language: 'Python',
    platform: 'GitHub',
    url: 'https://github.com/theob/h2o-warmup/blob/main/leak.py',
    code: LEAK_PY.replace('2 * (sum(window) / 6)', 'sum(window) / 6'),
    status: 'fail',
    feedback:
      'This flags anything above the average, not double it. Every hour after a quiet morning shows up.',
    submittedAgo: 6 * 24,
    reviewedAgo: 5 * 24,
  },
  {
    id: 's_seed_11',
    challengeId: 'c_seed_8',
    userId: 'u_seed_m3',
    language: 'Go',
    platform: 'GitHub',
    url: 'https://github.com/lenak/cs-practice/blob/main/anagrams.go',
    code: null,
    status: 'pending',
    feedback: null,
    submittedAgo: 2,
  },
  {
    id: 's_seed_12',
    challengeId: 'c_seed_6',
    userId: 'u_seed_m2',
    language: 'Python',
    platform: 'GitHub',
    url: 'https://github.com/diegor/h2o/blob/main/spikes.py',
    code: LEAK_PY,
    status: 'pending',
    feedback: null,
    submittedAgo: 50,
  },
  {
    id: 's_seed_13',
    challengeId: 'c_seed_4',
    userId: 'u_seed_m4',
    language: 'Other',
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/valid-palindrome/submissions/1234567',
    code: null,
    status: 'pending',
    feedback: null,
    submittedAgo: 72,
  },
]

/** Challenges and submissions. Owned by the challenges domain. */
export function seedChallenges({ now }: SeedContext): string[] {
  const lines: string[] = []
  // Deleting a seeded challenge cascades to its submissions.
  lines.push(`DELETE FROM submission WHERE id LIKE 's_seed_%';`)

  for (const ch of CHALLENGES) {
    const publishedAt = ch.publishedIn === null ? null : now + ch.publishedIn * DAY
    // Live ones count as already announced so a cron tick after seeding
    // does not email the seeded inboxes.
    const announcedAt = publishedAt !== null && publishedAt <= now ? publishedAt : null
    const createdAt = (publishedAt ?? now) - 3 * DAY
    lines.push(
      `INSERT INTO challenge (id, title, description, prompt, difficulty, sample_input, sample_output, points, week_no, published_at, announced_at, created_by, legacy_author_email, created_at, updated_at) VALUES (${q(ch.id)}, ${q(ch.title)}, ${q(ch.description)}, ${q(ch.prompt)}, ${q(ch.difficulty)}, ${q(ch.sampleInput)}, ${q(ch.sampleOutput)}, ${ch.points}, ${ch.week}, ${q(publishedAt)}, ${q(announcedAt)}, 'u_officer', NULL, ${createdAt}, ${createdAt});`,
    )
  }

  for (const s of SUBMISSIONS) {
    const submittedAt = now - s.submittedAgo * HOUR
    const reviewedAt = s.reviewedAgo === undefined ? null : now - s.reviewedAgo * HOUR
    lines.push(
      `INSERT INTO submission (id, challenge_id, user_id, language, platform, url, code, status, feedback, reviewed_by, reviewed_at, submitted_at, created_at, updated_at) VALUES (${q(s.id)}, ${q(s.challengeId)}, ${q(s.userId)}, ${q(s.language)}, ${q(s.platform)}, ${q(s.url)}, ${q(s.code)}, ${q(s.status)}, ${q(s.feedback)}, ${reviewedAt === null ? 'NULL' : "'u_officer'"}, ${q(reviewedAt)}, ${submittedAt}, ${submittedAt}, ${reviewedAt ?? submittedAt});`,
    )
  }

  return lines
}
