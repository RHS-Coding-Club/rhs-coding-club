import { useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { RaisedButton } from '#/components/raised-button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '#/components/ui/alert-dialog'
import { PROJECT_LIMITS, projectInputSchema, projectYears } from '#/lib/schemas/projects'
import type { ProjectInput } from '#/lib/schemas/projects'
import { createProject, deleteProject, updateProject } from '#/server/projects'
import type { TeamMember } from '#/services/projects'
import { cn } from '#/lib/utils'
import { ChipInput } from './chip-input'
import { ScreenshotsField } from './screenshots-field'
import { TeammatePicker } from './teammate-picker'

type Field = keyof ProjectInput
type Errors = Partial<Record<Field | 'form', string>>

export interface ProjectFormInitial {
  id?: string
  title: string
  description: string
  tech: string[]
  repoUrl: string | null
  demoUrl: string | null
  year: number | null
  imageKeys: string[]
  /** Teammates other than the submitter. */
  teammates: TeamMember[]
  authorId: string
  status?: 'pending' | 'approved' | 'rejected'
}

const NO_YEAR = 'none'

/** Submit and edit share this form. Validation mirrors the server's schema. */
export function ProjectForm({
  initial,
  canChangeTeam,
  canDelete,
  isOfficer,
}: {
  initial: ProjectFormInitial
  canChangeTeam: boolean
  canDelete: boolean
  isOfficer: boolean
}) {
  const router = useRouter()
  const editing = Boolean(initial.id)
  const [title, setTitle] = useState(initial.title)
  const [description, setDescription] = useState(initial.description)
  const [tech, setTech] = useState(initial.tech)
  const [repoUrl, setRepoUrl] = useState(initial.repoUrl ?? '')
  const [demoUrl, setDemoUrl] = useState(initial.demoUrl ?? '')
  const [year, setYear] = useState<number | null>(initial.year)
  const [imageKeys, setImageKeys] = useState(initial.imageKeys)
  const [teammates, setTeammates] = useState(initial.teammates)
  const [errors, setErrors] = useState<Errors>({})
  const [pending, setPending] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const clear = (f: Field) => errors[f] && setErrors((e) => ({ ...e, [f]: undefined }))

  const resetsReview = editing && !isOfficer && initial.status === 'rejected'

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const input: ProjectInput = {
      title,
      description,
      tech,
      repoUrl,
      demoUrl,
      year,
      imageKeys,
      teammateIds: teammates.map((m) => m.id),
    }
    const parsed = projectInputSchema.safeParse(input)
    if (!parsed.success) {
      const next: Errors = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as Field
        next[key] ??= issue.message
      }
      setErrors(next)
      const first = Object.keys(next)[0]
      document.getElementById(`project-${first}`)?.focus()
      return
    }
    setErrors({})
    setPending(true)
    try {
      const { id } = initial.id
        ? await updateProject({ data: { ...input, id: initial.id } })
        : await createProject({ data: input })
      toast.success(
        editing
          ? isOfficer
            ? 'Project saved.'
            : 'Saved and sent back for review.'
          : 'Submitted. An officer will review it soon.',
      )
      await router.invalidate()
      await router.navigate({ to: '/projects/$id', params: { id } })
    } catch (err) {
      setErrors({
        form: err instanceof Error ? err.message : 'Could not save the project.',
      })
    } finally {
      setPending(false)
    }
  }

  async function onDelete() {
    if (!initial.id) return
    setDeleting(true)
    try {
      await deleteProject({ data: { id: initial.id } })
      toast.success('Project deleted.')
      await router.navigate({ to: isOfficer ? '/admin/projects' : '/projects' })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not delete the project.')
      setDeleting(false)
    }
  }

  const err = (f: Field) =>
    errors[f] ? (
      <p id={`project-${f}-error`} role="alert" className="text-destructive text-sm">
        {errors[f]}
      </p>
    ) : null
  const aria = (f: Field, hint?: string) => ({
    'aria-invalid': errors[f] ? true : undefined,
    'aria-describedby':
      [errors[f] ? `project-${f}-error` : null, hint].filter(Boolean).join(' ') ||
      undefined,
  })

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-10">
      <Section title="The basics">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="project-title">Project name</Label>
          <Input
            id="project-title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              clear('title')
            }}
            maxLength={PROJECT_LIMITS.title}
            placeholder="Library seat finder"
            className="h-11 rounded-xl"
            {...aria('title')}
          />
          {err('title')}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-4">
            <Label htmlFor="project-description">What it does</Label>
            <span
              className={cn(
                'font-mono text-xs',
                description.length > PROJECT_LIMITS.description
                  ? 'text-destructive'
                  : 'text-muted-foreground',
              )}
              aria-live="polite"
            >
              {description.length} / {PROJECT_LIMITS.description}
            </span>
          </div>
          <Textarea
            id="project-description"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value)
              clear('description')
            }}
            rows={7}
            placeholder="Who it's for, what problem it solves, and what you're proud of. Blank lines start new paragraphs."
            className="min-h-44 rounded-xl"
            {...aria('description')}
          />
          {err('description')}
        </div>

        <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_12rem]">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="project-tech">Tech stack</Label>
            <ChipInput
              id="project-tech"
              value={tech}
              onChange={setTech}
              max={PROJECT_LIMITS.tech}
              maxLength={PROJECT_LIMITS.techLength}
              placeholder="Type a language or tool, then Enter"
              invalid={Boolean(errors.tech)}
              describedBy="project-tech-hint"
            />
            <p id="project-tech-hint" className="text-muted-foreground text-xs">
              Up to {PROJECT_LIMITS.tech}, like Python, React, or Arduino.
            </p>
            {err('tech')}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="project-year">Year</Label>
            <Select
              value={year ? String(year) : NO_YEAR}
              onValueChange={(v) => setYear(v === NO_YEAR ? null : Number(v))}
            >
              <SelectTrigger id="project-year" className="h-11! w-full rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value={NO_YEAR}>Not sure</SelectItem>
                {projectYears().map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Section>

      <Section title="Links" hint="Both optional. Use full https:// links.">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="project-repoUrl">Code repository</Label>
            <Input
              id="project-repoUrl"
              type="url"
              inputMode="url"
              value={repoUrl}
              onChange={(e) => {
                setRepoUrl(e.target.value)
                clear('repoUrl')
              }}
              placeholder="https://github.com/RHS-Coding-Club/…"
              className="h-11 rounded-xl"
              {...aria('repoUrl')}
            />
            {err('repoUrl')}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="project-demoUrl">Live demo</Label>
            <Input
              id="project-demoUrl"
              type="url"
              inputMode="url"
              value={demoUrl}
              onChange={(e) => {
                setDemoUrl(e.target.value)
                clear('demoUrl')
              }}
              placeholder="https://…"
              className="h-11 rounded-xl"
              {...aria('demoUrl')}
            />
            {err('demoUrl')}
          </div>
        </div>
      </Section>

      <Section
        title="Screenshots"
        hint={`Up to ${PROJECT_LIMITS.images}. The first one is the cover on the showcase. No screenshots? We'll draw a cover from your stack.`}
      >
        <ScreenshotsField
          value={imageKeys}
          onChange={setImageKeys}
          max={PROJECT_LIMITS.images}
        />
        {err('imageKeys')}
      </Section>

      <Section
        title="Team"
        hint={
          canChangeTeam
            ? `Add up to ${PROJECT_LIMITS.teammates} club members. Everyone is credited on their profile and earns the project points when it's approved.`
            : 'Only the person who submitted the project can change the team.'
        }
      >
        <Label htmlFor="project-teammateIds" className="sr-only">
          Add teammates
        </Label>
        <TeammatePicker
          id="project-teammateIds"
          value={teammates}
          onChange={setTeammates}
          max={PROJECT_LIMITS.teammates}
          excludeIds={[initial.authorId]}
          disabled={!canChangeTeam}
        />
        {err('teammateIds')}
      </Section>

      {errors.form && (
        <p
          role="alert"
          className="bg-destructive/10 text-destructive ring-destructive/25 rounded-2xl px-4 py-3 text-sm ring-1"
        >
          {errors.form}
        </p>
      )}

      <div className="border-border flex flex-wrap items-center justify-between gap-4 border-t pt-8">
        <p className="text-muted-foreground max-w-md text-sm">
          {isOfficer && editing
            ? 'Officer edit: the project keeps its current status.'
            : resetsReview
              ? 'Saving sends the project back to the review queue.'
              : editing
                ? 'Changes go to the officers for review.'
                : 'An officer reviews every project before it goes on the public showcase.'}
        </p>
        <div className="flex flex-wrap gap-2">
          {canDelete && editing && (
            <RaisedButton
              type="button"
              variant="ghost"
              size="lg"
              onClick={() => setConfirmDelete(true)}
              className="text-destructive"
            >
              <Trash2 aria-hidden="true" />
              Delete
            </RaisedButton>
          )}
          <RaisedButton
            type="submit"
            size="lg"
            loading={pending}
            loadingText={editing ? 'Saving…' : 'Submitting…'}
          >
            {editing ? 'Save changes' : 'Submit for review'}
          </RaisedButton>
        </div>
      </div>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this project?</AlertDialogTitle>
            <AlertDialogDescription>
              It disappears for the whole team, along with its screenshots. Any project
              points it earned are taken back. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <RaisedButton variant="outline" onClick={() => setConfirmDelete(false)}>
              Keep it
            </RaisedButton>
            <RaisedButton
              variant="secondary"
              loading={deleting}
              loadingText="Deleting…"
              onClick={() => void onDelete()}
            >
              Delete project
            </RaisedButton>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  )
}

function Section({
  title,
  hint,
  children,
}: {
  title: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <fieldset className="grid gap-6 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-10">
      <legend className="sr-only">{title}</legend>
      <div>
        <p aria-hidden="true" className="text-lg font-semibold tracking-tight">
          {title}
        </p>
        {hint && <p className="text-muted-foreground mt-1.5 text-sm">{hint}</p>}
      </div>
      <div className="flex flex-col gap-6">{children}</div>
    </fieldset>
  )
}
