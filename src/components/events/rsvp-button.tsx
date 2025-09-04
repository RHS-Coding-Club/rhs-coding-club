'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Check, X, HelpCircle, ChevronDown, Calendar } from 'lucide-react';
import { useEventActions } from '@/hooks/useEvents';
import { cn } from '@/lib/utils';

interface RSVPButtonProps {
  eventId: string;
  currentRsvp?: 'YES' | 'NO' | 'MAYBE' | null;
  onRsvpChange?: () => void;
  disabled?: boolean;
  size?: 'sm' | 'default' | 'lg';
}

export function RSVPButton({
  eventId,
  currentRsvp,
  onRsvpChange,
  disabled = false,
  size = 'default',
}: RSVPButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { rsvpToEvent, removeRsvp, loading } = useEventActions();

  const handleRsvp = async (status: 'YES' | 'NO' | 'MAYBE') => {
    const success = await rsvpToEvent(eventId, status);
    if (success) {
      onRsvpChange?.();
      setIsOpen(false);
    }
  };

  const handleRemoveRsvp = async () => {
    const success = await removeRsvp(eventId);
    if (success) {
      onRsvpChange?.();
      setIsOpen(false);
    }
  };

  const getRsvpIcon = (status?: 'YES' | 'NO' | 'MAYBE' | null) => {
    switch (status) {
      case 'YES':
        return <Check className="h-4 w-4" />;
      case 'NO':
        return <X className="h-4 w-4" />;
      case 'MAYBE':
        return <HelpCircle className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getRsvpText = (status?: 'YES' | 'NO' | 'MAYBE' | null) => {
    switch (status) {
      case 'YES':
        return 'Going';
      case 'NO':
        return 'Not Going';
      case 'MAYBE':
        return 'Maybe';
      default:
        return 'RSVP';
    }
  };

  const getRsvpVariant = (status?: 'YES' | 'NO' | 'MAYBE' | null) => {
    switch (status) {
      case 'YES':
        return 'default';
      case 'NO':
        return 'secondary';
      case 'MAYBE':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant={getRsvpVariant(currentRsvp)}
          size={size}
          disabled={disabled || loading}
          className={cn(
            "gap-2",
            currentRsvp === 'YES' && "bg-green-600 hover:bg-green-700 text-white",
            currentRsvp === 'NO' && "bg-red-100 hover:bg-red-200 text-red-700",
            currentRsvp === 'MAYBE' && "bg-yellow-100 hover:bg-yellow-200 text-yellow-700"
          )}
        >
          {getRsvpIcon(currentRsvp)}
          {getRsvpText(currentRsvp)}
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem
          onClick={() => handleRsvp('YES')}
          className="gap-2 text-green-600 focus:text-green-600"
        >
          <Check className="h-4 w-4" />
          Going
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleRsvp('MAYBE')}
          className="gap-2 text-yellow-600 focus:text-yellow-600"
        >
          <HelpCircle className="h-4 w-4" />
          Maybe
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleRsvp('NO')}
          className="gap-2 text-red-600 focus:text-red-600"
        >
          <X className="h-4 w-4" />
          Not Going
        </DropdownMenuItem>
        {currentRsvp && (
          <>
            <div className="border-t my-1" />
            <DropdownMenuItem
              onClick={handleRemoveRsvp}
              className="gap-2 text-muted-foreground focus:text-muted-foreground"
            >
              <X className="h-4 w-4" />
              Remove RSVP
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
