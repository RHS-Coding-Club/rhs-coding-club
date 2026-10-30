import { useRef, useState } from 'react'
import { ImagePlus, LoaderCircle, X } from 'lucide-react'
import { toast } from 'sonner'
import { fileUrl } from '#/lib/files'
import { cn } from '#/lib/utils'
import { uploadImage } from '#/server/files'
import type { UploadPurpose } from '#/services/files'

/** Uploads one image to R2 and returns its key (or null when cleared). */
export async function uploadFile(file: File, purpose: UploadPurpose) {
  const form = new FormData()
  form.set('file', file)
  form.set('purpose', purpose)
  const { key } = await uploadImage({ data: form })
  return key
}

/**
 * A click-or-drop image field. Controlled by an R2 key; uploads immediately on
 * pick and reports the new key. `aspect` sets the preview box shape.
 */
export function ImageUpload({
  value,
  onChange,
  purpose,
  label = 'Upload an image',
  aspect = 'aspect-video',
  className,
}: {
  value: string | null
  onChange: (key: string | null) => void
  purpose: UploadPurpose
  label?: string
  aspect?: string
  className?: string
}) {
  const input = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [over, setOver] = useState(false)

  const pick = async (file: File | undefined) => {
    if (!file) return
    setBusy(true)
    try {
      onChange(await uploadFile(file, purpose))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setBusy(false)
      if (input.current) input.current.value = ''
    }
  }

  return (
    <div className={cn('relative', aspect, className)}>
      <button
        type="button"
        onClick={() => input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setOver(true)
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setOver(false)
          void pick(e.dataTransfer.files[0])
        }}
        className={cn(
          'border-input bg-muted/40 hover:bg-muted/70 text-muted-foreground absolute inset-0 flex flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border border-dashed text-sm transition-colors',
          over && 'border-primary bg-primary/10',
          value && 'border-solid',
        )}
        aria-label={value ? 'Replace image' : label}
      >
        {value ? (
          <img
            src={fileUrl(value)}
            alt=""
            className="absolute inset-0 size-full object-cover"
          />
        ) : busy ? null : (
          <>
            <ImagePlus className="size-6" aria-hidden="true" />
            {label}
          </>
        )}
        {busy && (
          <span className="bg-background/70 absolute inset-0 flex items-center justify-center">
            <LoaderCircle className="size-6 animate-spin" aria-hidden="true" />
          </span>
        )}
      </button>
      {value && !busy && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="bg-background/85 hover:bg-background absolute top-2 right-2 inline-flex size-8 items-center justify-center rounded-full shadow"
          aria-label="Remove image"
        >
          <X className="size-4" />
        </button>
      )}
      <input
        ref={input}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
        className="hidden"
        onChange={(e) => void pick(e.target.files?.[0])}
      />
    </div>
  )
}
