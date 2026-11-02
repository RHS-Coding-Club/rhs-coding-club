import { createFileRoute } from '@tanstack/react-router'
import { AdminPageHeader } from '#/components/admin/admin-page-header'
import { ChallengeForm } from '#/components/challenges/challenge-form'
import { listAdminChallenges } from '#/server/challenges'

export const Route = createFileRoute('/_admin/admin/challenges/new')({
  loader: async () => {
    const { points, nextWeekNo } = await listAdminChallenges()
    return { points, nextWeekNo }
  },
  head: () => ({ meta: [{ title: 'New challenge · Admin · RHS Coding Club' }] }),
  component: NewChallenge,
})

function NewChallenge() {
  const { points, nextWeekNo } = Route.useLoaderData()
  return (
    <>
      <AdminPageHeader
        eyebrow="Challenges"
        title="New challenge"
        description="Write the prompt, set the difficulty, and decide when it goes live."
      />
      <ChallengeForm
        pointsByDifficulty={points}
        initial={{
          title: '',
          description: '',
          prompt: '',
          difficulty: 'easy',
          points: points.easy,
          weekNo: nextWeekNo,
          sampleInput: null,
          sampleOutput: null,
          publishedAt: null,
        }}
      />
    </>
  )
}
