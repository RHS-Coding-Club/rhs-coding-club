import { useState } from 'react'
import { Link, createFileRoute, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { toast } from 'sonner'
import { Bot } from '#/components/icons/bot'
import { AdminPageHeader } from '#/components/admin/admin-page-header'
import { EmptyState } from '#/components/empty-state'
import { RaisedButton } from '#/components/raised-button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '#/components/ui/alert-dialog'
import { Label } from '#/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { fmtDate } from '#/lib/format'
import { serverErrorMessage } from '#/lib/schemas/community'
import { disconnectMcpClient, getMcpOverview, setMcpClientApproval } from '#/server/mcp'

export const Route = createFileRoute('/_admin/admin/mcp/')({
  loader: () => getMcpOverview(),
  head: () => ({ meta: [{ title: 'AI access · Admin · RHS Coding Club' }] }),
  component: AdminMcp,
})

const OUTCOME_LABEL = {
  ok: 'Done',
  error: 'Failed',
  denied: 'Not allowed',
  'awaiting-approval': 'Asked for approval',
  approved: 'Approved and done',
  rejected: 'Rejected',
} as const

type ApprovalMode = 'website' | 'in-app' | 'skip'
type TrustingMode = Exclude<ApprovalMode, 'website'>

const APPROVAL_LABEL: Record<ApprovalMode, string> = {
  website: 'Approve here on the website',
  'in-app': "Approve in the app's own prompt",
  skip: "No approval: the app's Allow button is enough",
}

const APPROVAL_DONE: Record<ApprovalMode, string> = {
  website: 'Risky actions from this app wait for your approval here.',
  'in-app': 'Risky actions from this app ask you in the app, or here if it can’t.',
  skip: 'Risky actions from this app run when you press Allow in it.',
}

const TRUST_WARNING: Record<TrustingMode, string> = {
  'in-app':
    'Deletes, role changes, and newsletters to the whole club will run when the app reports that you pressed Approve. This website can’t check that a person saw the prompt, so only pick this for an app you trust to show it.',
  skip: 'Deletes, role changes, and newsletters to the whole club will run as soon as you press Allow in the app, with nothing to approve here. Keep the app asking before each tool, and don’t pick “Always allow” for risky ones: an AI can be misled by something it reads, like a contact-form message.',
}

function AdminMcp() {
  const { mcpUrl, connections, pending, activity, seesEveryone } = Route.useLoaderData()
  const router = useRouter()
  const disconnect = useServerFn(disconnectMcpClient)
  const [busy, setBusy] = useState<string | null>(null)
  const setApproval = useServerFn(setMcpClientApproval)
  // A choice that trusts the app, waiting on its "are you sure".
  const [confirming, setConfirming] = useState<{
    clientId: string
    name: string
    mode: TrustingMode
  } | null>(null)

  async function onApproval(clientId: string, mode: ApprovalMode) {
    setBusy(clientId)
    try {
      await setApproval({ data: { clientId, mode } })
      await router.invalidate({ sync: true })
      toast.success(APPROVAL_DONE[mode])
    } catch (err) {
      toast.error(serverErrorMessage(err))
    } finally {
      setBusy(null)
    }
  }

  async function onDisconnect(clientId: string) {
    setBusy(clientId)
    try {
      await disconnect({ data: { clientId } })
      await router.invalidate({ sync: true })
      toast.success('Disconnected.')
    } catch (err) {
      toast.error(serverErrorMessage(err))
    } finally {
      setBusy(null)
    }
  }

  return (
    <>
      <AdminPageHeader
        eyebrow="MCP server"
        title="AI access"
        description={`Connect an AI app to ${mcpUrl} and it can do what you can do in this panel, as you. Risky actions wait for your approval here, unless you choose otherwise for an app below.`}
      />

      <div className="grid gap-8">
        {pending.length > 0 && (
          <section aria-labelledby="mcp-pending">
            <h2 id="mcp-pending" className="mb-3 text-lg font-medium">
              Waiting for your approval
            </h2>
            <ul className="divide-border border-border divide-y rounded-xl border">
              {pending.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-4 p-4">
                  <p className="line-clamp-2 min-w-0 text-sm">{p.summary}</p>
                  <RaisedButton asChild size="sm">
                    <Link to="/admin/mcp/$id" params={{ id: p.id }}>
                      Review
                    </Link>
                  </RaisedButton>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section aria-labelledby="mcp-connections">
          <h2 id="mcp-connections" className="mb-3 text-lg font-medium">
            Your connected apps
          </h2>
          {connections.length === 0 ? (
            <EmptyState icon={<Bot />} title="No apps connected">
              Apps you connect show up here so you can cut them off.
            </EmptyState>
          ) : (
            <ul className="divide-border border-border divide-y rounded-xl border">
              {connections.map((c) => (
                <li
                  key={c.clientId}
                  className="flex items-center justify-between gap-4 p-4"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{c.name ?? 'Unnamed app'}</p>
                    <p className="text-muted-foreground font-mono text-xs break-all">
                      {c.clientId}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Connected {fmtDate(c.connectedAt)}
                    </p>
                    <div className="mt-3 grid gap-1.5">
                      <Label htmlFor={`approval-${c.clientId}`} className="font-normal">
                        Risky actions
                      </Label>
                      <Select
                        value={c.approval}
                        disabled={busy !== null}
                        onValueChange={(v) => {
                          const mode = v as ApprovalMode
                          if (mode === 'website') void onApproval(c.clientId, mode)
                          else
                            setConfirming({
                              clientId: c.clientId,
                              name: c.name ?? 'this app',
                              mode,
                            })
                        }}
                      >
                        <SelectTrigger
                          id={`approval-${c.clientId}`}
                          className="w-full max-w-xs"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.keys(APPROVAL_LABEL) as ApprovalMode[]).map((m) => (
                            <SelectItem key={m} value={m}>
                              {APPROVAL_LABEL[m]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <RaisedButton
                    type="button"
                    variant="outline"
                    size="sm"
                    loading={busy === c.clientId}
                    loadingText="Disconnecting…"
                    disabled={busy !== null}
                    onClick={() => void onDisconnect(c.clientId)}
                  >
                    Disconnect
                  </RaisedButton>
                </li>
              ))}
            </ul>
          )}
        </section>

        <AlertDialog
          open={confirming !== null}
          onOpenChange={(open) => !open && setConfirming(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Trust {confirming?.name}?</AlertDialogTitle>
              <AlertDialogDescription>
                {confirming && TRUST_WARNING[confirming.mode]}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (confirming) void onApproval(confirming.clientId, confirming.mode)
                  setConfirming(null)
                }}
              >
                Trust this app
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <section aria-labelledby="mcp-activity">
          <h2 id="mcp-activity" className="mb-3 text-lg font-medium">
            {seesEveryone ? 'Recent activity, everyone' : 'Your recent activity'}
          </h2>
          {activity.length === 0 ? (
            <p className="text-muted-foreground text-sm">No tool calls yet.</p>
          ) : (
            <div className="border-border overflow-x-auto rounded-xl border">
              <table className="w-full text-left text-sm">
                <thead className="text-muted-foreground text-xs">
                  <tr>
                    <th className="p-3 font-medium">When</th>
                    <th className="p-3 font-medium">Who</th>
                    <th className="p-3 font-medium">Tool</th>
                    <th className="p-3 font-medium">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-border divide-y">
                  {activity.map((a) => (
                    <tr key={a.id}>
                      <td className="p-3 whitespace-nowrap">{fmtDate(a.createdAt)}</td>
                      <td className="p-3 whitespace-nowrap">{a.userName}</td>
                      <td className="p-3 font-mono text-xs">{a.tool}</td>
                      <td className="p-3">
                        {OUTCOME_LABEL[a.outcome]}
                        {a.detail && (
                          <span className="text-muted-foreground block text-xs">
                            {a.detail}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </>
  )
}
