import { useState } from 'react'
import { Link, createFileRoute, notFound, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { AdminPageHeader } from '#/components/admin/admin-page-header'
import { RaisedButton } from '#/components/raised-button'
import { serverErrorMessage } from '#/lib/schemas/community'
import { approveMcpAction, getPendingMcpAction, rejectMcpAction } from '#/server/mcp'

export const Route = createFileRoute('/_admin/admin/mcp/$id')({
  loader: async ({ params }) => {
    const action = await getPendingMcpAction({ data: { id: params.id } })
    if (!action) throw notFound()
    return action
  },
  head: () => ({ meta: [{ title: 'Approve an action · Admin · RHS Coding Club' }] }),
  component: ApproveMcpAction,
})

const STATUS_MESSAGE = {
  approved: 'You approved this, and it ran.',
  rejected: 'You rejected this. Nothing happened.',
  failed: 'You approved this, but it failed.',
  expired: 'This request expired. Nothing happened. Ask the app to try again.',
} as const

function prettyArgs(args: string) {
  try {
    return JSON.stringify(JSON.parse(args), null, 2)
  } catch {
    return args
  }
}

/** Where a risky tool call waits for the person whose app asked for it. */
function ApproveMcpAction() {
  const action = Route.useLoaderData()
  const router = useRouter()
  const approve = useServerFn(approveMcpAction)
  const reject = useServerFn(rejectMcpAction)
  const [pending, setPending] = useState<'approve' | 'reject' | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function decide(decision: 'approve' | 'reject') {
    setPending(decision)
    setError(null)
    try {
      await (decision === 'approve' ? approve : reject)({ data: { id: action.id } })
    } catch (err) {
      setError(serverErrorMessage(err))
    }
    await router.invalidate({ sync: true })
    setPending(null)
  }

  return (
    <>
      <AdminPageHeader
        eyebrow="AI access"
        title="An app wants to do this"
        description="Check it yourself before you approve. The app may have read something written to trick it."
      />
      <div className="grid max-w-2xl gap-6">
        <p className="text-xl break-words whitespace-pre-wrap">{action.summary}</p>

        <details className="text-sm">
          <summary className="text-muted-foreground cursor-pointer">
            What the app sent ({action.tool})
          </summary>
          <pre className="bg-muted mt-2 overflow-x-auto rounded-lg p-3 font-mono text-xs">
            {prettyArgs(action.args)}
          </pre>
        </details>

        {error && (
          <p role="alert" className="text-destructive text-sm">
            {error}
          </p>
        )}

        {action.status === 'pending' ? (
          <div className="flex flex-wrap gap-2.5">
            <RaisedButton
              type="button"
              loading={pending === 'approve'}
              loadingText="Running…"
              disabled={pending !== null}
              onClick={() => void decide('approve')}
            >
              Approve
            </RaisedButton>
            <RaisedButton
              type="button"
              variant="outline"
              disabled={pending !== null}
              onClick={() => void decide('reject')}
            >
              Reject
            </RaisedButton>
          </div>
        ) : (
          <div className="grid gap-3">
            <p role="status" className="text-sm">
              {STATUS_MESSAGE[action.status]}
            </p>
            {action.error && <p className="text-destructive text-sm">{action.error}</p>}
            <RaisedButton asChild variant="outline" className="w-fit">
              <Link to="/admin/mcp">Back to AI access</Link>
            </RaisedButton>
          </div>
        )}
      </div>
    </>
  )
}
