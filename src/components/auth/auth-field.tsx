import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { InputGroup, InputGroupAddon, InputGroupInput } from '#/components/ui/input-group'
import { Label } from '#/components/ui/label'

/**
 * An auth input with a leading icon (shadcn input-group, as in Efferd's
 * auth-5). The label is for screen readers; the placeholder carries it
 * visually.
 */
export function AuthField({
  id,
  label,
  icon,
  ...input
}: { id: string; label: string; icon: ReactNode } & Omit<
  React.ComponentProps<'input'>,
  'id' | 'name'
>) {
  return (
    <div>
      <Label htmlFor={id} className="sr-only">
        {label}
      </Label>
      <InputGroup className="h-11 rounded-xl">
        <InputGroupInput id={id} name={id} {...input} />
        <InputGroupAddon align="inline-start" className="[&_svg]:size-4">
          {icon}
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}

/** "By continuing, you agree to ..." under the auth forms. */
export function FinePrint({ action }: { action: string }) {
  return (
    <p className="text-muted-foreground text-xs leading-relaxed">
      By {action}, you agree to the{' '}
      <Link to="/terms" className="hover:text-foreground underline underline-offset-4">
        terms of use
      </Link>{' '}
      and the{' '}
      <Link to="/privacy" className="hover:text-foreground underline underline-offset-4">
        privacy notice
      </Link>
      .
    </p>
  )
}
