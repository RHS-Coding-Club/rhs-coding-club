'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut, User, Settings, Shield } from 'lucide-react';
import Link from 'next/link';

export function UserAvatar() {
  const { user, userProfile, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!user || !userProfile) {
    return null;
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800';
      case 'officer':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'member':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 border-gray-200 dark:border-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-4 h-4 text-red-600 dark:text-red-400" />;
      case 'officer':
        return <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      default:
        return <User className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:ring-2 hover:ring-primary/20 transition-all duration-200">
          <Avatar className="h-10 w-10 border-2 border-background shadow-md">
            <AvatarImage src={userProfile.photoURL} alt={userProfile.displayName} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-medium">
              {getInitials(userProfile.displayName)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72 p-0" align="end" forceMount>
        {/* User Profile Header */}
        <div className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 border-b">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12 border-2 border-primary/20">
              <AvatarImage src={userProfile.photoURL} alt={userProfile.displayName} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-medium text-sm">
                {getInitials(userProfile.displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {userProfile.displayName}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {userProfile.email}
              </p>
              <div className="mt-2">
                <Badge
                  variant="outline"
                  className={`text-xs font-medium ${getRoleColor(userProfile.role)}`}
                >
                  <span className="flex items-center gap-1">
                    {getRoleIcon(userProfile.role)}
                    {userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)}
                  </span>
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="p-2">
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link href="/dashboard" className="flex items-center px-3 py-2 rounded-md">
              <User className="mr-3 h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Dashboard</span>
            </Link>
          </DropdownMenuItem>
          
          {(userProfile.role === 'admin' || userProfile.role === 'officer') && (
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/admin" className="flex items-center px-3 py-2 rounded-md">
                <Shield className="mr-3 h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Admin Panel</span>
              </Link>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem className="cursor-pointer px-3 py-2">
            <Settings className="mr-3 h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Settings</span>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="my-2" />
        
        {/* Logout Button */}
        <div className="p-2">
          <DropdownMenuItem 
            onClick={handleLogout} 
            disabled={isLoggingOut}
            className="cursor-pointer px-3 py-3 text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-900/20 rounded-md font-medium"
          >
            <LogOut className="mr-3 h-4 w-4" />
            <span>{isLoggingOut ? 'Signing out...' : 'Sign out'}</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
