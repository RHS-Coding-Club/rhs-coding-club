import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { Lock } from 'lucide-react'
import { EmptyState } from '#/components/empty-state'
import { RaisedButton } from '#/components/raised-button'
import { ProjectForm } from '#/components/projects/project-form'
import { ProjectFormShell } from '#/components/projects/form-shell'
import { hasRole } from '#/lib/roles'
import { getProjectForEdit } from '#/server/projects'

export const Route = createFileRoute('/_authed/projects/$id/edit')({
  loader: async ({ params }) => {
    try {
      return { edit: await getProjectForEdit({ data: { id: params.id } }), error: null }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'You cannot edit this project.'
      if (/not found/i.test(message)) throw notFound()
      return { edit: null, error: message }
    }
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: `Edit ${loaderData?.edit?.project.title ?? 'project'} · RHS Coding Club`,
      },
      { name: 'robots', content: 'noindex' },
    ],
  }),
  component: EditProjectPage,
})

function EditProjectPage() {
  const { edit, error } = Route.useLoaderData()
  const { user, theme } = Route.useRouteContext()
  const { id } = Route.useParams()
  const isOfficer = hasRole(user.role, 'officer')

  if (!edit) {
    return (
      <ProjectFormShell
        title="Edit project"
        description="This project can't be changed from here."
        back={{ label: 'Back to the project', to: '/projects/$id', id }}
        initialDark={theme === 'dark'}
      >
        <EmptyState
          icon={<Lock />}
          title={error}
          action={
            <RaisedButton asChild variant="outline">
              <Link to="/projects/$id" params={{ id }}>
                Back to the project
              </Link>
            </RaisedButton>
          }
        >
          Approved projects are locked so the showcase stays accurate. Message an officer
          with what you&apos;d like changed.
        </EmptyState>
      </ProjectFormShell>
    )
  }

  const { project, canChangeTeam, canDelete } = edit
  return (
    <ProjectFormShell
      title={`Edit ${project.title}`}
      description={
        isOfficer
          ? 'Officer edit. Changes go live as soon as you save.'
          : 'Update the details and save. Your changes go back to an officer for review.'
      }
      back={{ label: 'Back to the project', to: '/projects/$id', id: project.id }}
      initialDark={theme === 'dark'}
    >
      <ProjectForm
        initial={{
          id: project.id,
          title: project.title,
          description: project.description,
          tech: project.tech,
          repoUrl: project.repoUrl,
          demoUrl: project.demoUrl,
          year: project.year,
          imageKeys: project.imageKeys,
          teammates: project.team.filter((m) => m.id !== project.authorId),
          authorId: project.authorId,
          status: project.status,
        }}
        canChangeTeam={canChangeTeam}
        canDelete={canDelete}
        isOfficer={isOfficer}
      />
    </ProjectFormShell>
  )
}
