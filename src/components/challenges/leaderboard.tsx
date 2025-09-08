'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Medal, Award } from 'lucide-react';
import { User } from '@/lib/firebase-collections';

interface LeaderboardProps {
  users: User[];
  currentUserId?: string;
}

export function Leaderboard({ users, currentUserId }: LeaderboardProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <Badge className="bg-yellow-500 text-white">1st</Badge>;
      case 2:
        return <Badge className="bg-gray-400 text-white">2nd</Badge>;
      case 3:
        return <Badge className="bg-amber-600 text-white">3rd</Badge>;
      default:
        return <Badge variant="outline">#{rank}</Badge>;
    }
  };

  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">No participants with points yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user, index) => {
            const rank = index + 1;
            const isCurrentUser = user.id === currentUserId;
            
            return (
              <div
                key={user.id}
                className={`flex items-center gap-4 p-3 rounded-lg border ${
                  isCurrentUser ? 'bg-primary/5 border-primary' : 'bg-background'
                }`}
              >
                <div className="flex items-center justify-center w-8">
                  {getRankIcon(rank)}
                </div>
                
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar || user.photoURL} alt={user.displayName || user.name || user.email || 'User'} />
                  <AvatarFallback>
                    {(user.displayName || user.name)
                      ? (user.displayName || user.name)!.split(' ').map(n => n[0]).join('').toUpperCase()
                      : user.email 
                        ? user.email.substring(0, 2).toUpperCase()
                        : 'U'
                    }
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">
                      {user.displayName || user.name || user.email?.split('@')[0] || `User ${user.id.substring(0, 6)}`}
                    </p>
                    {isCurrentUser && <Badge variant="secondary">You</Badge>}
                  </div>
                  {user.gradYear && (
                    <p className="text-sm text-muted-foreground">Class of {user.gradYear}</p>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">{user.points || 0}</span>
                  <span className="text-sm text-muted-foreground">pts</span>
                </div>
                
                {rank <= 3 && (
                  <div className="ml-2">
                    {getRankBadge(rank)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
