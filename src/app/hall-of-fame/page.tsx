'use client';

import { useState, useEffect } from 'react';
import { Container } from '@/components/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Crown, 
  Sparkles, 
  Gem,
  Star,
  Loader2,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import { collection, getDocs, query, limit, where, Timestamp } from 'firebase/firestore';
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

interface TopMember {
  userId: string;
  userName: string;
  userPhoto?: string;
  userPoints: number;
  badgeCount: number;
  legendaryCount: number;
  epicCount: number;
  rareCount: number;
  commonCount: number;
}

const RARITY_CONFIG = {
  common: {
    label: 'Common',
    color: 'bg-slate-500',
    icon: Star,
    border: 'border-slate-500',
    gradient: 'from-slate-400 to-slate-600',
    glow: 'shadow-slate-500/50',
  },
  rare: {
    label: 'Rare',
    color: 'bg-blue-500',
    icon: Sparkles,
    border: 'border-blue-500',
    gradient: 'from-blue-400 to-blue-600',
    glow: 'shadow-blue-500/50',
  },
  epic: {
    label: 'Epic',
    color: 'bg-purple-500',
    icon: Gem,
    border: 'border-purple-500',
    gradient: 'from-purple-400 to-purple-600',
    glow: 'shadow-purple-500/50',
  },
  legendary: {
    label: 'Legendary',
    color: 'bg-amber-500',
    icon: Crown,
    border: 'border-amber-500',
    gradient: 'from-amber-400 to-amber-600',
    glow: 'shadow-amber-500/50',
  },
};

export default function HallOfFamePage() {
  const [topMembers, setTopMembers] = useState<TopMember[]>([]);
  const [recentAwards, setRecentAwards] = useState<BadgeAward[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('legendary');

  useEffect(() => {
    loadHallOfFameData();
  }, []);

  const loadHallOfFameData = async () => {
    try {
      setLoading(true);

      // Get all user-badges with badge and user info
      const userBadgesRef = collection(db, 'user-badges');
      const userBadgesSnapshot = await getDocs(userBadgesRef);

      // Map to store user badge counts
      const userBadgeMap = new Map<string, {
        userId: string;
        userName: string;
        userPhoto?: string;
        userPoints: number;
        badges: { rarity: string; badgeId: string }[];
      }>();

      // Recent awards array
      const awards: BadgeAward[] = [];

      for (const docSnap of userBadgesSnapshot.docs) {
        const data = docSnap.data();
        
        // Get user info
        const userDoc = await getDocs(query(collection(db, 'users'), where('__name__', '==', data.userId), limit(1)));
        if (userDoc.empty) continue;
        
        const userData = userDoc.docs[0].data();
        
        // Get badge info
        const badgeDoc = await getDocs(query(collection(db, 'badges'), where('__name__', '==', data.badgeId), limit(1)));
        if (badgeDoc.empty) continue;
        
        const badgeData = badgeDoc.docs[0].data();
        if (!badgeData.isActive) continue;

        // Add to user badge map
        if (!userBadgeMap.has(data.userId)) {
          userBadgeMap.set(data.userId, {
            userId: data.userId,
            userName: userData.displayName || 'Unknown',
            userPhoto: userData.photoURL,
            userPoints: userData.points || 0,
            badges: [],
          });
        }
        
        userBadgeMap.get(data.userId)!.badges.push({
          rarity: badgeData.rarity,
          badgeId: data.badgeId,
        });

        // Add to recent awards (we'll sort and limit later)
        awards.push({
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

      // Convert map to array and calculate counts
      const membersArray: TopMember[] = Array.from(userBadgeMap.values()).map(member => {
        const rarityCounts = {
          legendary: 0,
          epic: 0,
          rare: 0,
          common: 0,
        };

        member.badges.forEach(badge => {
          if (badge.rarity in rarityCounts) {
            rarityCounts[badge.rarity as keyof typeof rarityCounts]++;
          }
        });

        return {
          userId: member.userId,
          userName: member.userName,
          userPhoto: member.userPhoto,
          userPoints: member.userPoints,
          badgeCount: member.badges.length,
          legendaryCount: rarityCounts.legendary,
          epicCount: rarityCounts.epic,
          rareCount: rarityCounts.rare,
          commonCount: rarityCounts.common,
        };
      });

      // Sort by legendary count, then epic, then total badges
      membersArray.sort((a, b) => {
        if (b.legendaryCount !== a.legendaryCount) return b.legendaryCount - a.legendaryCount;
        if (b.epicCount !== a.epicCount) return b.epicCount - a.epicCount;
        return b.badgeCount - a.badgeCount;
      });

      setTopMembers(membersArray);

      // Sort recent awards by date and take top 20
      awards.sort((a, b) => {
        if (!a.awardedAt || !b.awardedAt) return 0;
        return b.awardedAt.toMillis() - a.awardedAt.toMillis();
      });
      setRecentAwards(awards.slice(0, 20));

    } catch (error) {
      console.error('Error loading Hall of Fame data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMembersByRarity = (rarity: 'legendary' | 'epic' | 'rare' | 'common') => {
    return topMembers.filter(member => {
      switch (rarity) {
        case 'legendary': return member.legendaryCount > 0;
        case 'epic': return member.epicCount > 0;
        case 'rare': return member.rareCount > 0;
        case 'common': return member.commonCount > 0;
        default: return false;
      }
    }).sort((a, b) => {
      const aCount = a[`${rarity}Count` as keyof TopMember] as number;
      const bCount = b[`${rarity}Count` as keyof TopMember] as number;
      return bCount - aCount;
    });
  };

  if (loading) {
    return (
      <div className="py-20">
        <Container>
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="py-20">
      <Container>
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-3">
              <Crown className="h-12 w-12 text-amber-500" />
              <h1 className="text-4xl md:text-5xl font-bold">Hall of Fame</h1>
              <Crown className="h-12 w-12 text-amber-500" />
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Celebrating our club&apos;s most dedicated members and their incredible achievements
            </p>
          </div>

          {/* Top 3 Members */}
          {topMembers.length >= 3 && (
            <div className="grid md:grid-cols-3 gap-6">
              {/* 2nd Place */}
              <Card className="md:order-1 order-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardContent className="pt-6 text-center space-y-4">
                  <div className="relative inline-block">
                    <Avatar className="h-20 w-20 border-4 border-slate-400">
                      <AvatarImage src={topMembers[1].userPhoto} alt={topMembers[1].userName} />
                      <AvatarFallback className="text-xl">
                        {topMembers[1].userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-400 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                      2
                    </div>
                  </div>
                  <div>
                    <Link 
                      href={`/members/${topMembers[1].userId}`}
                      className="font-bold hover:text-primary transition-colors"
                    >
                      {topMembers[1].userName}
                    </Link>
                    <div className="text-sm text-muted-foreground mt-1">
                      {topMembers[1].badgeCount} badges • {topMembers[1].userPoints} points
                    </div>
                  </div>
                  <div className="flex justify-center gap-3 text-xs">
                    {topMembers[1].legendaryCount > 0 && (
                      <div className="flex items-center gap-1">
                        <Crown className="h-3 w-3 text-amber-500" />
                        {topMembers[1].legendaryCount}
                      </div>
                    )}
                    {topMembers[1].epicCount > 0 && (
                      <div className="flex items-center gap-1">
                        <Gem className="h-3 w-3 text-purple-500" />
                        {topMembers[1].epicCount}
                      </div>
                    )}
                    {topMembers[1].rareCount > 0 && (
                      <div className="flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-blue-500" />
                        {topMembers[1].rareCount}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* 1st Place */}
              <Card className="md:order-2 order-1 border-2 border-amber-500 shadow-xl shadow-amber-500/30 hover:shadow-2xl hover:shadow-amber-500/40 transition-all duration-300 hover:scale-105">
                <CardContent className="pt-6 text-center space-y-4">
                  <div className="relative inline-block">
                    <Avatar className="h-24 w-24 border-4 border-amber-500">
                      <AvatarImage src={topMembers[0].userPhoto} alt={topMembers[0].userName} />
                      <AvatarFallback className="text-2xl">
                        {topMembers[0].userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                      <Crown className="h-5 w-5" />
                    </div>
                  </div>
                  <div>
                    <Link 
                      href={`/members/${topMembers[0].userId}`}
                      className="text-lg font-bold hover:text-primary transition-colors"
                    >
                      {topMembers[0].userName}
                    </Link>
                    <div className="text-sm text-muted-foreground mt-1">
                      {topMembers[0].badgeCount} badges • {topMembers[0].userPoints} points
                    </div>
                  </div>
                  <div className="flex justify-center gap-3 text-sm">
                    {topMembers[0].legendaryCount > 0 && (
                      <div className="flex items-center gap-1">
                        <Crown className="h-4 w-4 text-amber-500" />
                        {topMembers[0].legendaryCount}
                      </div>
                    )}
                    {topMembers[0].epicCount > 0 && (
                      <div className="flex items-center gap-1">
                        <Gem className="h-4 w-4 text-purple-500" />
                        {topMembers[0].epicCount}
                      </div>
                    )}
                    {topMembers[0].rareCount > 0 && (
                      <div className="flex items-center gap-1">
                        <Sparkles className="h-4 w-4 text-blue-500" />
                        {topMembers[0].rareCount}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* 3rd Place */}
              <Card className="md:order-3 order-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardContent className="pt-6 text-center space-y-4">
                  <div className="relative inline-block">
                    <Avatar className="h-20 w-20 border-4 border-amber-700">
                      <AvatarImage src={topMembers[2].userPhoto} alt={topMembers[2].userName} />
                      <AvatarFallback className="text-xl">
                        {topMembers[2].userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-700 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                      3
                    </div>
                  </div>
                  <div>
                    <Link 
                      href={`/members/${topMembers[2].userId}`}
                      className="font-bold hover:text-primary transition-colors"
                    >
                      {topMembers[2].userName}
                    </Link>
                    <div className="text-sm text-muted-foreground mt-1">
                      {topMembers[2].badgeCount} badges • {topMembers[2].userPoints} points
                    </div>
                  </div>
                  <div className="flex justify-center gap-3 text-xs">
                    {topMembers[2].legendaryCount > 0 && (
                      <div className="flex items-center gap-1">
                        <Crown className="h-3 w-3 text-amber-500" />
                        {topMembers[2].legendaryCount}
                      </div>
                    )}
                    {topMembers[2].epicCount > 0 && (
                      <div className="flex items-center gap-1">
                        <Gem className="h-3 w-3 text-purple-500" />
                        {topMembers[2].epicCount}
                      </div>
                    )}
                    {topMembers[2].rareCount > 0 && (
                      <div className="flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-blue-500" />
                        {topMembers[2].rareCount}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tabs for Badge Rarity */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="legendary" className="gap-1">
                <Crown className="h-4 w-4" />
                Legendary
              </TabsTrigger>
              <TabsTrigger value="epic" className="gap-1">
                <Gem className="h-4 w-4" />
                Epic
              </TabsTrigger>
              <TabsTrigger value="rare" className="gap-1">
                <Sparkles className="h-4 w-4" />
                Rare
              </TabsTrigger>
              <TabsTrigger value="recent" className="gap-1">
                <TrendingUp className="h-4 w-4" />
                Recent
              </TabsTrigger>
            </TabsList>

            {/* Legendary Tab */}
            <TabsContent value="legendary" className="space-y-4">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-amber-500" />
                    Legendary Badge Holders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {getMembersByRarity('legendary').length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No legendary badges earned yet</p>
                  ) : (
                    <div className="space-y-3">
                      {getMembersByRarity('legendary').map((member, idx) => (
                        <Link
                          key={member.userId}
                          href={`/members/${member.userId}`}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-bold text-muted-foreground w-6">
                              #{idx + 1}
                            </span>
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={member.userPhoto} alt={member.userName} />
                              <AvatarFallback>
                                {member.userName.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold">{member.userName}</div>
                              <div className="text-xs text-muted-foreground">
                                {member.badgeCount} total badges
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Crown className="h-5 w-5 text-amber-500" />
                            <span className="text-xl font-bold text-amber-500">
                              {member.legendaryCount}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Epic Tab */}
            <TabsContent value="epic" className="space-y-4">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gem className="h-5 w-5 text-purple-500" />
                    Epic Badge Holders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {getMembersByRarity('epic').length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No epic badges earned yet</p>
                  ) : (
                    <div className="space-y-3">
                      {getMembersByRarity('epic').map((member, idx) => (
                        <Link
                          key={member.userId}
                          href={`/members/${member.userId}`}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-bold text-muted-foreground w-6">
                              #{idx + 1}
                            </span>
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={member.userPhoto} alt={member.userName} />
                              <AvatarFallback>
                                {member.userName.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold">{member.userName}</div>
                              <div className="text-xs text-muted-foreground">
                                {member.badgeCount} total badges
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Gem className="h-5 w-5 text-purple-500" />
                            <span className="text-xl font-bold text-purple-500">
                              {member.epicCount}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Rare Tab */}
            <TabsContent value="rare" className="space-y-4">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-blue-500" />
                    Rare Badge Holders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {getMembersByRarity('rare').length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No rare badges earned yet</p>
                  ) : (
                    <div className="space-y-3">
                      {getMembersByRarity('rare').slice(0, 20).map((member, idx) => (
                        <Link
                          key={member.userId}
                          href={`/members/${member.userId}`}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-bold text-muted-foreground w-6">
                              #{idx + 1}
                            </span>
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={member.userPhoto} alt={member.userName} />
                              <AvatarFallback>
                                {member.userName.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold">{member.userName}</div>
                              <div className="text-xs text-muted-foreground">
                                {member.badgeCount} total badges
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-blue-500" />
                            <span className="text-xl font-bold text-blue-500">
                              {member.rareCount}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Recent Awards Tab */}
            <TabsContent value="recent" className="space-y-4">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Recent Badge Awards
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentAwards.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No recent badge awards</p>
                  ) : (
                    <div className="space-y-3">
                      {recentAwards.map((award, idx) => {
                        const RarityIcon = RARITY_CONFIG[award.badgeRarity].icon;
                        return (
                          <div
                            key={`${award.userId}-${award.badgeId}-${idx}`}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                          >
                            <Link href={`/members/${award.userId}`}>
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={award.userPhoto} alt={award.userName} />
                                <AvatarFallback>
                                  {award.userName.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            </Link>
                            <div className={`w-10 h-10 border-2 ${RARITY_CONFIG[award.badgeRarity].border} rounded-full overflow-hidden bg-background shadow-md ${RARITY_CONFIG[award.badgeRarity].glow} flex-shrink-0 relative`}>
                              <Image
                                src={award.badgeImage}
                                alt={award.badgeName}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <Link 
                                  href={`/members/${award.userId}`}
                                  className="font-semibold hover:text-primary transition-colors"
                                >
                                  {award.userName}
                                </Link>
                                <span className="text-sm text-muted-foreground">earned</span>
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
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </Container>
    </div>
  );
}
