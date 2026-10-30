import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { ImageUpload } from '#/components/image-upload'
import { fileUrl } from '#/lib/files'

/**
 * Up to `max` screenshots. Each uploads to R2 on pick; the first one is the
 * cover. Reorder with the arrow buttons, remove with the x.
 */
export function ScreenshotsField({
  value,
  onChange,
  max,
}: {
  value: string[]
  onChange: (keys: string[]) => void
  max: number
}) {
  const move = (from: number, to: number) => {
    const next = [...value]
    const [key] = next.splice(from, 1)
    next.splice(to, 0, key)
    onChange(next)
  }

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3" aria-label="Screenshots">
      {value.map((key, i) => (
        <li
          key={key}
          className="group bg-muted ring-border/70 relative aspect-video overflow-hidden rounded-2xl ring-1"
        >
          <img
            src={fileUrl(key)}
            alt=""
            className="absolute inset-0 size-full object-cover"
          />
          {i === 0 && (
            <span className="bg-background/85 absolute top-2 left-2 rounded-full px-2 py-0.5 text-xs font-medium shadow">
              Cover
            </span>
          )}
          <div className="absolute inset-x-2 bottom-2 flex justify-between gap-1">
            <div className="flex gap-1">
              <IconButton
                label={`Move screenshot ${i + 1} earlier`}
                disabled={i === 0}
                onClick={() => move(i, i - 1)}
              >
                <ChevronLeft className="size-4" />
              </IconButton>
              <IconButton
                label={`Move screenshot ${i + 1} later`}
                disabled={i === value.length - 1}
                onClick={() => move(i, i + 1)}
              >
                <ChevronRight className="size-4" />
              </IconButton>
            </div>
            <IconButton
              label={`Remove screenshot ${i + 1}`}
              onClick={() => onChange(value.filter((k) => k !== key))}
            >
              <X className="size-4" />
            </IconButton>
          </div>
        </li>
      ))}
      {value.length < max && (
        <li>
          <ImageUpload
            value={null}
            onChange={(key) => key && onChange([...value, key])}
            purpose="project"
            label={value.length ? 'Add another' : 'Add a screenshot'}
          />
        </li>
      )}
    </ul>
  )
}

function IconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="bg-background/85 hover:bg-background focus-visible:ring-ring/60 inline-flex size-8 items-center justify-center rounded-full shadow outline-none focus-visible:ring-2 disabled:opacity-40"
    >
      {children}
    </button>
  )
}
