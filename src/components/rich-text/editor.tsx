import { useRef, useState } from 'react'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import type { Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Image from '@tiptap/extension-image'
import { Placeholder } from '@tiptap/extensions'
import {
  Bold,
  Code,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  LoaderCircle,
  Minus,
  Quote,
  Redo2,
  SquareCode,
  Strikethrough,
  Underline,
  Undo2,
} from 'lucide-react'
import { toast } from 'sonner'
import { EMPTY_DOC_JSON, parseRichText, safeHref } from '#/lib/rich-text'
import { cn } from '#/lib/utils'
import { uploadFile } from '#/components/image-upload'
import type { UploadPurpose } from '#/services/files'
import { Popover, PopoverContent, PopoverTrigger } from '#/components/ui/popover'
import { Input } from '#/components/ui/input'
import { RaisedButton } from '#/components/raised-button'
import { CODE_LANGUAGES, lowlight } from './lowlight'

export interface RichTextEditorProps {
  /** Stored JSON string (see lib/rich-text). Read once on mount. */
  value: string
  onChange: (json: string) => void
  placeholder?: string
  /** Where pasted/inserted images are uploaded. Omit to hide the image button. */
  imagePurpose?: UploadPurpose
  id?: string
  'aria-invalid'?: boolean
  className?: string
}

/**
 * The rich-text editor for posts, challenge prompts, and newsletters (Tiptap).
 * Emits a JSON document string; render it with <RichText>.
 */
export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start writing…',
  imagePurpose,
  id,
  className,
  ...aria
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        heading: { levels: [2, 3, 4] },
        link: { openOnClick: false, autolink: true, defaultProtocol: 'https' },
      }),
      CodeBlockLowlight.configure({ lowlight, defaultLanguage: 'python' }),
      Image.configure({ inline: false }),
      Placeholder.configure({ placeholder }),
    ],
    content: parseRichText(value || EMPTY_DOC_JSON),
    editorProps: {
      attributes: {
        class: 'rich-text min-h-64 px-5 py-4 outline-none',
        ...(id ? { id } : {}),
        ...(aria['aria-invalid'] ? { 'aria-invalid': 'true' } : {}),
      },
    },
    onUpdate: ({ editor: e }) => onChange(JSON.stringify(e.getJSON())),
  })

  return (
    <div
      className={cn(
        'bg-card border-input focus-within:ring-ring/50 focus-within:border-ring overflow-hidden rounded-2xl border transition-[box-shadow] focus-within:ring-3',
        aria['aria-invalid'] && 'border-destructive',
        className,
      )}
    >
      {editor ? (
        <Toolbar editor={editor} imagePurpose={imagePurpose} />
      ) : (
        <div className="border-border h-11 border-b" />
      )}
      <EditorContent editor={editor} />
    </div>
  )
}

function Toolbar({
  editor,
  imagePurpose,
}: {
  editor: Editor
  imagePurpose?: UploadPurpose
}) {
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive('bold'),
      italic: e.isActive('italic'),
      underline: e.isActive('underline'),
      strike: e.isActive('strike'),
      code: e.isActive('code'),
      h2: e.isActive('heading', { level: 2 }),
      h3: e.isActive('heading', { level: 3 }),
      bullet: e.isActive('bulletList'),
      ordered: e.isActive('orderedList'),
      quote: e.isActive('blockquote'),
      codeBlock: e.isActive('codeBlock'),
      language: (e.getAttributes('codeBlock').language as string | undefined) ?? '',
      link: e.isActive('link'),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  })
  const chain = () => editor.chain().focus()

  return (
    <div
      role="toolbar"
      aria-label="Formatting"
      className="border-border bg-muted/40 flex flex-wrap items-center gap-0.5 border-b px-2 py-1.5"
    >
      <Tool label="Bold" active={state.bold} onClick={() => chain().toggleBold().run()}>
        <Bold />
      </Tool>
      <Tool
        label="Italic"
        active={state.italic}
        onClick={() => chain().toggleItalic().run()}
      >
        <Italic />
      </Tool>
      <Tool
        label="Underline"
        active={state.underline}
        onClick={() => chain().toggleUnderline().run()}
      >
        <Underline />
      </Tool>
      <Tool
        label="Strikethrough"
        active={state.strike}
        onClick={() => chain().toggleStrike().run()}
      >
        <Strikethrough />
      </Tool>
      <Tool
        label="Inline code"
        active={state.code}
        onClick={() => chain().toggleCode().run()}
      >
        <Code />
      </Tool>
      <Divider />
      <Tool
        label="Heading"
        active={state.h2}
        onClick={() => chain().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 />
      </Tool>
      <Tool
        label="Subheading"
        active={state.h3}
        onClick={() => chain().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 />
      </Tool>
      <Tool
        label="Bulleted list"
        active={state.bullet}
        onClick={() => chain().toggleBulletList().run()}
      >
        <List />
      </Tool>
      <Tool
        label="Numbered list"
        active={state.ordered}
        onClick={() => chain().toggleOrderedList().run()}
      >
        <ListOrdered />
      </Tool>
      <Tool
        label="Quote"
        active={state.quote}
        onClick={() => chain().toggleBlockquote().run()}
      >
        <Quote />
      </Tool>
      <Tool
        label="Code block"
        active={state.codeBlock}
        onClick={() => chain().toggleCodeBlock().run()}
      >
        <SquareCode />
      </Tool>
      {state.codeBlock && (
        <select
          aria-label="Code language"
          value={state.language}
          onChange={(e) =>
            chain().updateAttributes('codeBlock', { language: e.target.value }).run()
          }
          className="bg-background border-input h-7 rounded-md border px-1.5 font-mono text-xs"
        >
          {CODE_LANGUAGES.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
      )}
      <Tool label="Divider" onClick={() => chain().setHorizontalRule().run()}>
        <Minus />
      </Tool>
      <Divider />
      <LinkTool editor={editor} active={state.link} />
      {imagePurpose && <ImageTool editor={editor} purpose={imagePurpose} />}
      <div className="ml-auto flex gap-0.5">
        <Tool label="Undo" disabled={!state.canUndo} onClick={() => chain().undo().run()}>
          <Undo2 />
        </Tool>
        <Tool label="Redo" disabled={!state.canRedo} onClick={() => chain().redo().run()}>
          <Redo2 />
        </Tool>
      </div>
    </div>
  )
}

function Tool({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string
  active?: boolean
  disabled?: boolean
  onClick?: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      // Keep the caret in the editor so typing continues after a click.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        'text-muted-foreground hover:bg-foreground/8 hover:text-foreground inline-flex size-8 items-center justify-center rounded-lg transition-colors disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4',
        active && 'bg-primary/15 text-foreground',
      )}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <span aria-hidden="true" className="bg-border mx-1 h-5 w-px" />
}

function LinkTool({ editor, active }: { editor: Editor; active: boolean }) {
  const [open, setOpen] = useState(false)
  const [href, setHref] = useState('')

  const apply = () => {
    const clean = safeHref(href.match(/^[a-z]+:|^\//i) ? href : `https://${href}`)
    if (!href.trim()) editor.chain().focus().extendMarkRange('link').unsetLink().run()
    else if (clean)
      editor.chain().focus().extendMarkRange('link').setLink({ href: clean }).run()
    else return toast.error('Links must start with http, https, or mailto.')
    setOpen(false)
  }

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (o) setHref((editor.getAttributes('link').href as string | undefined) ?? '')
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          title="Link"
          aria-label="Link"
          aria-pressed={active}
          className={cn(
            'text-muted-foreground hover:bg-foreground/8 hover:text-foreground inline-flex size-8 items-center justify-center rounded-lg [&_svg]:size-4',
            active && 'bg-primary/15 text-foreground',
          )}
        >
          <Link2 />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3" align="start">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            apply()
          }}
        >
          <Input
            autoFocus
            value={href}
            onChange={(e) => setHref(e.target.value)}
            placeholder="https://…"
            aria-label="Link address"
          />
          <RaisedButton type="submit" size="md">
            {href.trim() ? 'Apply' : 'Remove'}
          </RaisedButton>
        </form>
      </PopoverContent>
    </Popover>
  )
}

function ImageTool({ editor, purpose }: { editor: Editor; purpose: UploadPurpose }) {
  const input = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)

  const upload = async (file: File) => {
    setBusy(true)
    try {
      const key = await uploadFile(file, purpose)
      editor
        .chain()
        .focus()
        .setImage({ src: `/files/${key}`, alt: '' })
        .run()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setBusy(false)
      if (input.current) input.current.value = ''
    }
  }

  return (
    <>
      <Tool label="Insert image" disabled={busy} onClick={() => input.current?.click()}>
        {busy ? <LoaderCircle className="animate-spin" /> : <ImagePlus />}
      </Tool>
      <input
        ref={input}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void upload(file)
        }}
      />
    </>
  )
}
