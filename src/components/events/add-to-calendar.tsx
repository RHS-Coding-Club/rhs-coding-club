import { CalendarPlus, ChevronDown, Download, ExternalLink } from 'lucide-react'
import { googleCalendarUrl } from '#/lib/events'
import { RaisedButton } from '#/components/raised-button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'

/** One event into the visitor's calendar: an .ics download or a Google Calendar link. */
export function AddToCalendar({
  event,
  url,
  variant = 'outline',
  size = 'lg',
}: {
  event: {
    id: string
    title: string
    description: string
    location: string
    startsAt: Date
    endsAt: Date
  }
  url: string
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'md' | 'lg'
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <RaisedButton variant={variant} size={size}>
          <CalendarPlus aria-hidden="true" />
          Add to calendar
          <ChevronDown className="size-3.5 opacity-60" aria-hidden="true" />
        </RaisedButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-52">
        <DropdownMenuItem asChild>
          <a href={`/events/${event.id}/calendar.ics`} download>
            <Download aria-hidden="true" />
            Apple or Outlook (.ics)
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={googleCalendarUrl({ ...event, url })} target="_blank" rel="noreferrer">
            <ExternalLink aria-hidden="true" />
            Google Calendar
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
