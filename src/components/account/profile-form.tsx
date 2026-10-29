import { useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import { toast } from 'sonner'
import { ImageUpload } from '#/components/image-upload'
import { RaisedButton } from '#/components/raised-button'
import { UserAvatar } from '#/components/user-avatar'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { Textarea } from '#/components/ui/textarea'
import { BIO_MAX, SKILLS_MAX, gradYearRange, profileSchema } from '#/lib/schemas/account'
import { cn } from '#/lib/utils'
import { saveProfile } from '#/server/account'
import { fieldErrors, serverMessage } from './form-helpers'
import { SkillsInput } from './skills-input'

export interface ProfileValues {
  name: string
  bio: string | null
  gradYear: number | null
  skills: string[]
  githubUsername: string | null
  avatarKey: string | null
  image: string | null
}

/**
 * Name, bio, grad year, skills, GitHub, and photo. Validated with the same
 * Zod schema the server uses; the header picks up the new name and avatar
 * after save.
 */
export function ProfileForm({ initial }: { initial: ProfileValues }) {
  const router = useRouter()
  const [name, setName] = useState(initial.name)
  const [bio, setBio] = useState(initial.bio ?? '')
  const [gradYear, setGradYear] = useState<number | null>(initial.gradYear)
  const [skills, setSkills] = useState(initial.skills)
  const [github, setGithub] = useState(initial.githubUsername ?? '')
  const [avatarKey, setAvatarKey] = useState(initial.avatarKey)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const { min, max } = gradYearRange()
  const years = Array.from({ length: max - min + 1 }, (_, i) => max - i)
  if (gradYear && !years.includes(gradYear)) years.push(gradYear)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    const parsed = profileSchema.safeParse({
      name,
      bio,
      gradYear,
      skills,
      githubUsername: github,
      avatarKey,
    })
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error))
      return
    }
    setErrors({})
    setPending(true)
    try {
      await saveProfile({
        data: { name, bio, gradYear, skills, githubUsername: github, avatarKey },
      })
      setGithub(parsed.data.githubUsername ?? '')
      setSkills(parsed.data.skills)
      toast.success('Profile saved.')
      await router.invalidate()
    } catch (err) {
      setFormError(serverMessage(err))
    } finally {
      setPending(false)
    }
  }

  const err = (key: string) =>
    errors[key] ? (
      <p id={`${key}-error`} role="alert" className="text-destructive text-sm">
        {errors[key]}
      </p>
    ) : null

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6" noValidate>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <ImageUpload
            value={avatarKey}
            onChange={setAvatarKey}
            purpose="avatar"
            label="Upload"
            aspect="aspect-square"
            className="size-24 shrink-0 [&>button]:rounded-full [&>button:first-child]:text-xs"
          />
          {!avatarKey && initial.image && (
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <UserAvatar user={{ name, image: initial.image }} className="size-8" />
              Using your sign-in photo
            </div>
          )}
        </div>
        <p className="text-muted-foreground text-sm sm:ml-auto sm:max-w-64">
          A square photo works best. Remove it to go back to{' '}
          {initial.image ? 'your Google or GitHub photo' : 'your initials'}.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          {err('name')}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="gradYear">Graduation year</Label>
          <Select
            value={gradYear ? String(gradYear) : 'none'}
            onValueChange={(v) => setGradYear(v === 'none' ? null : Number(v))}
          >
            <SelectTrigger id="gradYear" className="w-full">
              <SelectValue placeholder="Pick a year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Not set</SelectItem>
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  Class of {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {err('gradYear')}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between">
          <Label htmlFor="bio">Bio</Label>
          <span
            className={cn(
              'font-mono text-xs',
              bio.length > BIO_MAX ? 'text-destructive' : 'text-muted-foreground',
            )}
            aria-live="polite"
          >
            {bio.length}/{BIO_MAX}
          </span>
        </div>
        <Textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          placeholder="What you like to build, what you’re learning, what you teach at RAP."
          aria-invalid={Boolean(errors.bio)}
          aria-describedby={errors.bio ? 'bio-error' : undefined}
        />
        {err('bio')}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between">
          <Label htmlFor="skills">Skills</Label>
          <span className="text-muted-foreground font-mono text-xs">
            {skills.length}/{SKILLS_MAX}
          </span>
        </div>
        <SkillsInput
          id="skills"
          value={skills}
          onChange={setSkills}
          describedBy="skills-hint"
        />
        <p id="skills-hint" className="text-muted-foreground text-xs">
          Press Enter or type a comma to add one.
        </p>
        {err('skills')}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="github">GitHub username</Label>
        <div className="relative">
          <span className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 font-mono text-sm">
            github.com/
          </span>
          <Input
            id="github"
            value={github}
            onChange={(e) => setGithub(e.target.value)}
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            className="pl-[6.4rem] font-mono"
            aria-invalid={Boolean(errors.githubUsername)}
            aria-describedby={errors.githubUsername ? 'githubUsername-error' : undefined}
          />
        </div>
        {err('githubUsername')}
      </div>

      {formError && (
        <p role="alert" className="text-destructive text-sm">
          {formError}
        </p>
      )}
      <div>
        <RaisedButton type="submit" size="lg" loading={pending} loadingText="Saving…">
          Save profile
        </RaisedButton>
      </div>
    </form>
  )
}
