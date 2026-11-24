import type { ComponentProps } from 'react'
import { AlertDialog as AlertDialogPrimitive } from 'radix-ui'
import { RaisedButton } from '#/components/raised-button'

/**
 * Footer buttons for an uncontrolled AlertDialog, drawn as RaisedButtons so
 * every confirmation in the admin panel looks the same. The action is
 * destructive by default; name it verb plus object ("Delete draft").
 */
export function ConfirmAction({
  variant = 'destructive',
  ...props
}: ComponentProps<typeof RaisedButton>) {
  return (
    <AlertDialogPrimitive.Action asChild>
      <RaisedButton variant={variant} {...props} />
    </AlertDialogPrimitive.Action>
  )
}

export function ConfirmCancel({
  children = 'Cancel',
  ...props
}: ComponentProps<typeof RaisedButton>) {
  return (
    <AlertDialogPrimitive.Cancel asChild>
      <RaisedButton variant="outline" {...props}>
        {children}
      </RaisedButton>
    </AlertDialogPrimitive.Cancel>
  )
}
