import { Link, createFileRoute } from '@tanstack/react-router'
import { UserPlus } from 'lucide-react'
import { EmptyState } from '#/components/empty-state'
import { RaisedButton } from '#/components/raised-button'
import { ProjectForm } from '#/components/projects/project-form'
import { ProjectFormShell } from '#/components/projects/form-shell'
import { hasRole } from '#/lib/roles'

export const Route = createFileRoute('/_authed/projects/new')({
  head: () => ({
    meta: [
      { title: 'Submit a project · RHS Coding Club' },
      {
        name: 'description',
        content: 'Submit a team project to the RHS Coding Club showcase.',
      },
    ],
  }),
  component: NewProjectPage,
})

function NewProjectPage() {
  const { user, theme } = Route.useRouteContext()
  const isMember = hasRole(user.role, 'member')

  return (
    <ProjectFormShell
      title="Submit a project"
      description="Tell us what you built and who built it with you. An officer reviews it, then it goes on the public showcase."
      back={{ label: 'All projects', to: '/projects' }}
      initialDark={theme === 'dark'}
    >
      {isMember ? (
        <ProjectForm
          initial={{
            title: '',
            description: '',
            tech: [],
            repoUrl: null,
            demoUrl: null,
            year: new Date().getFullYear(),
            imageKeys: [],
            teammates: [],
            authorId: user.id,
          }}
          canChangeTeam
          canDelete={false}
          isOfficer={hasRole(user.role, 'officer')}
        />
      ) : (
        <EmptyState
          icon={<UserPlus />}
          title="Projects are for club members"
          action={
            <RaisedButton asChild size="lg">
              <Link to="/join">Apply to join</Link>
            </RaisedButton>
          }
        >
          Your account is waiting on membership. Apply to join and, once an officer
          approves you, you can submit projects and be added to teams.
        </EmptyState>
      )}
    </ProjectFormShell>
  )
}
