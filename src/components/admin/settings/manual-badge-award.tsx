'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/auth-context';
import {
  getAllBadges,
  awardBadgeToUser,
  revokeBadgeFromUser,
  getUserBadges,
  Badge,
} from '@/lib/services/badges';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Award,
  UserPlus,
  Loader2,
  Search,
  X,
} from 'lucide-react';
import Image from 'next/image';

interface User {
  id: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role: string;
}

const RARITY_CONFIG = {
  common: {
    label: 'Common',
    color: 'bg-slate-500',
    border: 'border-slate-500',
  },
  rare: {
    label: 'Rare',
    color: 'bg-blue-500',
    border: 'border-blue-500',
  },
  epic: {
    label: 'Epic',
    color: 'bg-purple-500',
    border: 'border-purple-500',
  },
  legendary: {
    label: 'Legendary',
    color: 'bg-amber-500',
    border: 'border-amber-500',
  },
};

export function ManualBadgeAward() {
  const { userProfile } = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedBadge, setSelectedBadge] = useState<string>('');
  const [userBadges, setUserBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [awarding, setAwarding] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState('');

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedUser) {
      loadUserBadges();
    } else {
      setUserBadges([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [badgesData, usersData] = await Promise.all([
        getAllBadges(true), // Include inactive
        loadUsers(),
      ]);
      setBadges(badgesData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async (): Promise<User[]> => {
    try {
      const usersRef = collection(db, 'users');
      // Don't order by displayName as it may not exist for all users
      const snapshot = await getDocs(usersRef);
      const users = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as User));
      
      // Sort in memory instead, handling missing displayNames
      return users.sort((a, b) => {
        const nameA = (a.displayName || a.email || '').toLowerCase();
        const nameB = (b.displayName || b.email || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });
    } catch (error) {
      console.error('Error loading users:', error);
      return [];
    }
  };

  const loadUserBadges = async () => {
    if (!selectedUser) return;
    
    try {
      const badges = await getUserBadges(selectedUser);
      setUserBadges(badges);
    } catch (error) {
      console.error('Error loading user badges:', error);
    }
  };

  const handleAwardBadge = async () => {
    if (!selectedUser || !selectedBadge || !userProfile?.uid) {
      alert('Please select both a user and a badge.');
      return;
    }

    // Check if user already has this badge
    if (userBadges.some(b => b.id === selectedBadge)) {
      alert('This user already has this badge.');
      return;
    }

    // Verify admin/officer role
    if (!userProfile.role || !['admin', 'officer'].includes(userProfile.role)) {
      alert('You do not have permission to award badges. Only admins and officers can award badges.');
      return;
    }

    try {
      setAwarding(true);
      console.log('Awarding badge:', { 
        userId: selectedUser, 
        badgeId: selectedBadge, 
        awardedBy: userProfile.uid,
        userRole: userProfile.role 
      });
      
      await awardBadgeToUser(selectedUser, selectedBadge, userProfile.uid);
      await loadUserBadges();
      setSelectedBadge('');
      alert('Badge awarded successfully!');
    } catch (error) {
      console.error('Error awarding badge:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to award badge: ${errorMessage}. Please try again.`);
    } finally {
      setAwarding(false);
    }
  };

  const handleRevokeBadge = async (badgeId: string) => {
    if (!selectedUser) return;

    if (!confirm('Are you sure you want to revoke this badge from the user?')) {
      return;
    }

    try {
      setRevoking(badgeId);
      await revokeBadgeFromUser(selectedUser, badgeId);
      await loadUserBadges();
      alert('Badge revoked successfully.');
    } catch (error) {
      console.error('Error revoking badge:', error);
      alert('Failed to revoke badge. Please try again.');
    } finally {
      setRevoking(null);
    }
  };

  const filteredUsers = users.filter(user => {
    const searchLower = userSearch.toLowerCase();
    return (
      user.displayName?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower)
    );
  });

  const availableBadges = badges.filter(badge => 
    !userBadges.some(ub => ub.id === badge.id)
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Manual Badge Award
            </CardTitle>
            <CardDescription className="mt-2">
              Manually award or revoke badges for specific users
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : (
          <>
            {/* User Selection */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="user-search">Select User</Label>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="user-search"
                    placeholder="Search by name or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a user..." />
                </SelectTrigger>
                <SelectContent>
                  {filteredUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center gap-2">
                        <span>{user.displayName || user.email}</span>
                        <span className="text-xs text-muted-foreground">
                          ({user.role})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Award Badge Section */}
            {selectedUser && (
              <>
                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-4">Award New Badge</h3>
                  <div className="flex gap-3">
                    <Select
                      value={selectedBadge}
                      onValueChange={setSelectedBadge}
                      disabled={availableBadges.length === 0}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue 
                          placeholder={
                            availableBadges.length === 0 
                              ? "User has all badges" 
                              : "Select a badge to award..."
                          } 
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {availableBadges.map((badge) => (
                          <SelectItem key={badge.id} value={badge.id}>
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${RARITY_CONFIG[badge.rarity].color}`} />
                              <span>{badge.name}</span>
                              <span className="text-xs text-muted-foreground">
                                ({RARITY_CONFIG[badge.rarity].label})
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button
                      onClick={handleAwardBadge}
                      disabled={!selectedBadge || awarding}
                      className="gap-2"
                    >
                      {awarding ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Awarding...
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4" />
                          Award Badge
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Current Badges */}
                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-4">
                    Current Badges ({userBadges.length})
                  </h3>
                  {userBadges.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      This user has no badges yet.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {userBadges.map((badge) => (
                        <div
                          key={badge.id}
                          className="flex items-center gap-3 p-3 border rounded-lg bg-card"
                        >
                          <div className={`relative w-12 h-12 flex-shrink-0 rounded-full border-2 ${RARITY_CONFIG[badge.rarity].border} overflow-hidden bg-background`}>
                            <Image
                              src={badge.imageUrl}
                              alt={badge.name}
                              fill
                              className="object-cover"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{badge.name}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <div className={`w-2 h-2 rounded-full ${RARITY_CONFIG[badge.rarity].color}`} />
                              <span className="text-xs text-muted-foreground">
                                {RARITY_CONFIG[badge.rarity].label}
                              </span>
                            </div>
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRevokeBadge(badge.id)}
                            disabled={revoking === badge.id}
                            className="gap-2"
                          >
                            {revoking === badge.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <X className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
