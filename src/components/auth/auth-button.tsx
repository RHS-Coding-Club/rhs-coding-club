'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AuthForm } from './auth-form';
import { UserAvatar } from './user-avatar';

export function AuthButton() {
  const { user, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (loading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        Loading...
      </Button>
    );
  }

  if (user) {
    return <UserAvatar />;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 xl:h-9 px-3 xl:px-4 rounded-lg border-muted-foreground/20 hover:bg-muted/50 transition-all duration-200 font-medium text-xs xl:text-sm"
        >
          Sign In
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] p-0 pb-6">
        <DialogHeader className="px-8 pt-8 pb-0">
          <DialogTitle className="sr-only">Sign In to RHS Coding Club</DialogTitle>
        </DialogHeader>
        <AuthForm onClose={() => setIsOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
