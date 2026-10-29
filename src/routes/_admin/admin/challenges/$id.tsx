import { useState } from 'react'
import { Link, createFileRoute, notFound, useRouter } from '@tanstack/react-router'
import { Eye, Trash2 } from 'lucide-react'
import { AdminPageHeader } from '#/components/admin/admin-page-header'
import { RaisedButton } from '#/components/raised-button'
import { ChallengeForm } from '#/components/challenges/challenge-form'
import { DeleteChallengeDialog } from '#/components/challenges/delete-challenge'
import { getAdminChallenge } from '#/server/challenges'

export const Route = createFileRoute('/_admin/admin/challenges/$id')({
  loader: async ({ params }) => {
    const data = await getAdminChallenge({ data: { id: params.id } })
    if (!data.challenge) throw notFound()
    return { ...data, challenge: data.challenge }
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: `${loaderData?.challenge.title ?? 'Challenge'} · Admin · RHS Coding Club`,
      },
    ],
  }),
  component: EditChallenge,
})

function EditChallenge() {
  const { challenge, points } = Route.useLoaderData()
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)

  return (
    <>
      <AdminPageHeader
        eyebrow={`Week ${challenge.weekNo}`}
        title="Edit challenge"
        description={
          challenge.submissions > 0
            ? `${challenge.submissions} ${challenge.submissions === 1 ? 'submission' : 'submissions'}, ${challenge.solves} passed.`
            : 'No submissions yet.'
        }
        actions={
          <>
            <RaisedButton asChild variant="outline">
              <Link to="/challenges/$id" params={{ id: challenge.id }}>
                <Eye aria-hidden="true" />
                Preview
              </Link>
            </RaisedButton>
            <RaisedButton variant="ghost" onClick={() => setConfirming(true)}>
              <Trash2 aria-hidden="true" />
              Delete
            </RaisedButton>
          </>
        }
      />
      <ChallengeForm
        key={challenge.id}
        pointsByDifficulty={points}
        solves={challenge.solves}
        initial={challenge}
      />
      <DeleteChallengeDialog
        challenge={challenge}
        open={confirming}
        onOpenChange={setConfirming}
        onDeleted={() => router.navigate({ to: '/admin/challenges' })}
      />
    </>
  )
}
