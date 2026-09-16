import { useState } from 'react'
import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { Menu } from 'lucide-react'
import { hasRole } from '#/lib/roles'
import { AdminNav } from '#/components/admin/admin-nav'
import { Button } from '#/components/ui/button'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '#/components/ui/sheet'

/** Pathless layout: officers and admins only, wrapped in the admin sidebar shell. */
export const Route = createFileRoute('/_admin')({
  beforeLoad: ({ context, location }) => {
    if (!context.user) {
      throw redirect({ to: '/login', search: { redirect: location.href } })
    }
    if (!hasRole(context.user.role, 'officer')) {
      throw redirect({ to: '/dashboard' })
    }
    return { user: context.user }
  },
  component: AdminShell,
})

function AdminShell() {
  const { user } = Route.useRouteContext()
  const [open, setOpen] = useState(false)

  return (
    <div className="mx-auto flex w-full max-w-7xl gap-8 px-4 py-6 sm:px-6">
      <aside className="bg-sidebar border-sidebar-border sticky top-20 hidden h-[calc(100dvh-6rem)] w-56 shrink-0 self-start overflow-y-auto rounded-lg border p-3 lg:block">
        <p className="eyebrow px-2.5 pt-1 pb-3">Admin</p>
        <AdminNav role={user.role} />
      </aside>

      <div className="min-w-0 flex-1">
        <div className="mb-4 lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Menu className="size-4" />
                Admin menu
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-3">
              <SheetTitle className="eyebrow px-2.5 pt-1 pb-3">Admin</SheetTitle>
              <AdminNav role={user.role} onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>
        <Outlet />
      </div>
    </div>
  )
}
