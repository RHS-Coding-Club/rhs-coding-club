'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Crown, Sparkles, Gem, Star, Award, TrendingUp, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { collection, query, orderBy, limit, getDocs, doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';

interface BadgeAward {
  userId: string;
  userName: string;
  userPhoto?: string;
  badgeId: string;
  badgeName: string;
  badgeImage: string;
  badgeRarity: 'common' | 'rare' | 'epic' | 'legendary';
  awardedAt: Timestamp;
}

const RARITY_CONFIG = {
  common: {
    label: 'Common',
    color: 'bg-slate-500',
    icon: Star,
    border: 'border-slate-500',
    textColor: 'text-slate-500',
  },
  rare: {
    label: 'Rare',
    color: 'bg-blue-500',
    icon: Sparkles,
    border: 'border-blue-500',
    textColor: 'text-blue-500',
  },
  epic: {
    label: 'Epic',
    color: 'bg-purple-500',
    icon: Gem,
    border: 'border-purple-500',
    textColor: 'text-purple-500',
  },
  legendary: {
    label: 'Legendary',
    color: 'bg-amber-500',
    icon: Crown,
    border: 'border-amber-500',
    textColor: 'text-amber-500',
  },
};

interface RecentBadgeActivityProps {
  maxItems?: number;
}

export function RecentBadgeActivity({ maxItems = 10 }: RecentBadgeActivityProps) {
  const [awards, setAwards] = useState<BadgeAward[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRecentAwards = useCallback(async () => {
    try {
      setLoading(true);

      // Get recent user-badges
      const userBadgesRef = collection(db, 'user-badges');
      const recentQuery = query(userBadgesRef, orderBy('awardedAt', 'desc'), limit(maxItems));
      const snapshot = await getDocs(recentQuery);

      const awardsData: BadgeAward[] = [];

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();

        // Get user info
        const userDoc = await getDoc(doc(db, 'users', data.userId));
        if (!userDoc.exists()) continue;
        const userData = userDoc.data();

        // Get badge info
        const badgeDoc = await getDoc(doc(db, 'badges', data.badgeId));
        if (!badgeDoc.exists()) continue;
        const badgeData = badgeDoc.data();

        if (!badgeData.isActive) continue;

        awardsData.push({
          userId: data.userId,
          userName: userData.displayName || 'Unknown',
          userPhoto: userData.photoURL,
          badgeId: data.badgeId,
          badgeName: badgeData.name,
          badgeImage: badgeData.imageUrl,
          badgeRarity: badgeData.rarity,
          awardedAt: data.awardedAt,
        });
      }

      setAwards(awardsData);
    } catch (error) {
      console.error('Error loading recent badge awards:', error);
    } finally {
      setLoading(false);
    }
  }, [maxItems]);

  useEffect(() => {
    loadRecentAwards();
  }, [maxItems, loadRecentAwards]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Badge Awards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (awards.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Badge Awards
          </CardTitle>
          <Link
            href="/hall-of-fame"
            className="text-sm text-primary hover:underline"
          >
            View Hall of Fame →
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {awards.map((award, idx) => {
            const RarityIcon = RARITY_CONFIG[award.badgeRarity].icon;
            return (
              <div
                key={`${award.userId}-${award.badgeId}-${idx}`}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <Link href={`/members/${award.userId}`} className="flex-shrink-0">
                  <Avatar className="h-10 w-10 hover:ring-2 hover:ring-primary transition-all">
                    <AvatarImage src={award.userPhoto} alt={award.userName} />
                    <AvatarFallback>
                      {award.userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>

                <div className={`w-10 h-10 border-2 ${RARITY_CONFIG[award.badgeRarity].border} rounded-full overflow-hidden bg-background shadow-md flex-shrink-0 relative`}>
                  <Image
                    src={award.badgeImage}
                    alt={award.badgeName}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1 text-sm">
                    <Link
                      href={`/members/${award.userId}`}
                      className="font-semibold hover:text-primary transition-colors"
                    >
                      {award.userName}
                    </Link>
                    <span className="text-muted-foreground">earned</span>
                    <span className="font-medium truncate">{award.badgeName}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs flex items-center gap-1">
                      <RarityIcon className="h-3 w-3" />
                      {RARITY_CONFIG[award.badgeRarity].label}
                    </Badge>
                    {award.awardedAt && (
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(award.awardedAt.toDate(), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t text-center">
          <Link
            href="/hall-of-fame"
            className="text-sm text-primary hover:underline inline-flex items-center gap-1"
          >
            <Award className="h-4 w-4" />
            See All Badge Holders
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
