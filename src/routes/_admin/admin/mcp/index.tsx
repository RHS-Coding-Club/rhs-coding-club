import { useState } from 'react'
import { Link, createFileRoute, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { toast } from 'sonner'
import { Bot } from 'lucide-react'
import { AdminPageHeader } from '#/components/admin/admin-page-header'
import { EmptyState } from '#/components/empty-state'
import { RaisedButton } from '#/components/raised-button'
import { fmtDate } from '#/lib/format'
import { serverErrorMessage } from '#/lib/schemas/community'
import { disconnectMcpClient, getMcpOverview } from '#/server/mcp'

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

function AdminMcp() {
  const { mcpUrl, connections, pending, activity, seesEveryone } = Route.useLoaderData()
  const router = useRouter()
  const disconnect = useServerFn(disconnectMcpClient)
  const [busy, setBusy] = useState<string | null>(null)

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
        description={`Connect an AI app to ${mcpUrl} and it can do what you can do in this panel, as you. Risky actions wait for your approval here.`}
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
                  <p className="min-w-0 text-sm">{p.summary}</p>
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
            <EmptyState icon={<Bot />} title="Nothing connected.">
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
