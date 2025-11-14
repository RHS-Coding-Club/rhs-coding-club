'use client';

import { useState, useEffect } from 'react';
import { Container } from '@/components/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Trophy, 
  Award, 
  Calendar, 
  FolderOpen, 
  Target,
  Loader2,
  ArrowLeft,
  Crown,
  Sparkles,
  Star,
  Gem
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getUserBadges, Badge as BadgeType } from '@/lib/services/badges';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';

interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role: string;
  points?: number;
  createdAt: Timestamp;
}

interface UserBadgeWithDate extends BadgeType {
  awardedAt: Timestamp;
}

interface Project {
  id: string;
  title: string;
  description: string;
  tech: string[];
  approved: boolean;
  createdAt: Timestamp;
}

interface ChallengeSubmission {
  id: string;
  challengeId: string;
  challengeTitle: string;
  status: 'pass' | 'fail' | 'pending';
  points: number;
  submittedAt: Timestamp;
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

export default function MemberProfilePage() {
  const params = useParams();
  const userId = params.userId as string;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [badges, setBadges] = useState<UserBadgeWithDate[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [submissions, setSubmissions] = useState<ChallengeSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('badges');
  const [stats, setStats] = useState({
    totalBadges: 0,
    totalPoints: 0,
    projectsSubmitted: 0,
    challengesCompleted: 0,
  });

  useEffect(() => {
    if (userId) {
      loadMemberData();
    }
  }, [userId]);

  const loadMemberData = async () => {
    try {
      setLoading(true);

      // Load user profile
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        setLoading(false);
        return;
      }

      const profileData = { uid: userDoc.id, ...userDoc.data() } as UserProfile;
      setProfile(profileData);

      // Load badges with awarded dates
      const userBadgesRef = collection(db, 'user-badges');
      const badgesQuery = query(userBadgesRef, where('userId', '==', userId));
      const badgesSnapshot = await getDocs(badgesQuery);
      
      const badgesWithDates: UserBadgeWithDate[] = [];
      for (const docSnap of badgesSnapshot.docs) {
        const badgeData = docSnap.data();
        const badgeDoc = await getDoc(doc(db, 'badges', badgeData.badgeId));
        if (badgeDoc.exists() && badgeDoc.data().isActive) {
          badgesWithDates.push({
            id: badgeDoc.id,
            ...badgeDoc.data(),
            awardedAt: badgeData.awardedAt,
          } as UserBadgeWithDate);
        }
      }
      
      // Sort badges by rarity (legendary first) then by awarded date
      const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
      badgesWithDates.sort((a, b) => {
        const rarityDiff = rarityOrder[a.rarity] - rarityOrder[b.rarity];
        if (rarityDiff !== 0) return rarityDiff;
        return b.awardedAt?.toMillis() - a.awardedAt?.toMillis();
      });
      
      setBadges(badgesWithDates);

      // Load projects
      const projectsRef = collection(db, 'projects');
      const projectsQuery = query(
        projectsRef, 
        where('authorId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      const projectsSnapshot = await getDocs(projectsQuery);
      const projectsData = projectsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Project[];
      setProjects(projectsData);

      // Load challenge submissions
      const submissionsRef = collection(db, 'submissions');
      const submissionsQuery = query(
        submissionsRef,
        where('userId', '==', userId),
        orderBy('submittedAt', 'desc'),
        limit(10)
      );
      const submissionsSnapshot = await getDocs(submissionsQuery);
      
      const submissionsData: ChallengeSubmission[] = [];
      for (const docSnap of submissionsSnapshot.docs) {
        const submissionData = docSnap.data();
        // Fetch challenge title
        const challengeDoc = await getDoc(doc(db, 'challenges', submissionData.challengeId));
        submissionsData.push({
          id: docSnap.id,
          challengeId: submissionData.challengeId,
          challengeTitle: challengeDoc.exists() ? challengeDoc.data().title : 'Unknown Challenge',
          status: submissionData.status,
          points: submissionData.points || 0,
          submittedAt: submissionData.submittedAt,
        });
      }
      setSubmissions(submissionsData);

      // Calculate stats
      const passedSubmissions = submissionsData.filter(s => s.status === 'pass').length;
      const approvedProjects = projectsData.filter(p => p.approved).length;
      setStats({
        totalBadges: badgesWithDates.length,
        totalPoints: profileData.points || 0,
        projectsSubmitted: approvedProjects,
        challengesCompleted: passedSubmissions,
      });

    } catch (error) {
      console.error('Error loading member data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'officer':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'member':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
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

  if (!profile) {
    return (
      <div className="py-20">
        <Container>
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Member Not Found</h1>
            <p className="text-muted-foreground">This member profile does not exist.</p>
            <Link 
              href="/leaderboard" 
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Leaderboard
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="py-20">
      <Container>
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Back Button */}
          <Link 
            href="/leaderboard" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Leaderboard
          </Link>

          {/* Profile Header */}
          <Card className="shadow-lg">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <Avatar className="h-24 w-24 border-4 border-primary/20">
                  <AvatarImage src={profile.photoURL} alt={profile.displayName} />
                  <AvatarFallback className="text-2xl">
                    {profile.displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 text-center md:text-left space-y-4">
                  <div className="space-y-2">
                    <h1 className="text-3xl md:text-4xl font-bold">{profile.displayName}</h1>
                    <p className="text-lg text-muted-foreground">{profile.email}</p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                    <Badge className={getRoleColor(profile.role)}>
                      {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                    </Badge>
                    {profile.createdAt && (
                      <span className="text-sm text-muted-foreground">
                        Member since {new Date(profile.createdAt.toDate()).toLocaleDateString('en-US', { 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </span>
                    )}
                  </div>

                  {/* Top 3 Badges */}
                  {badges.length > 0 && (
                    <div className="flex items-center justify-center md:justify-start gap-2">
                      <span className="text-sm text-muted-foreground">Top Badges:</span>
                      <div className="flex gap-2">
                        {badges.slice(0, 3).map((badge) => {
                          const RarityIcon = RARITY_CONFIG[badge.rarity].icon;
                          return (
                            <div
                              key={badge.id}
                              className={`relative w-10 h-10 border-2 ${RARITY_CONFIG[badge.rarity].border} rounded-full overflow-hidden bg-background shadow-lg ${RARITY_CONFIG[badge.rarity].glow}`}
                              title={badge.name}
                            >
                              <Image
                                src={badge.imageUrl}
                                alt={badge.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{stats.totalPoints}</div>
                  <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                    <Trophy className="h-3 w-3" />
                    Total Points
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-500">{stats.totalBadges}</div>
                  <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                    <Award className="h-3 w-3" />
                    Badges Earned
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">{stats.challengesCompleted}</div>
                  <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                    <Target className="h-3 w-3" />
                    Challenges
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-500">{stats.projectsSubmitted}</div>
                  <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                    <FolderOpen className="h-3 w-3" />
                    Projects
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="badges">Badges ({badges.length})</TabsTrigger>
              <TabsTrigger value="projects">Projects ({projects.length})</TabsTrigger>
              <TabsTrigger value="challenges">Challenges ({submissions.length})</TabsTrigger>
            </TabsList>

            {/* Badges Tab */}
            <TabsContent value="badges" className="space-y-4">
              {badges.length === 0 ? (
                <Card className="shadow-md">
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No badges earned yet</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {badges.map((badge) => {
                    const RarityIcon = RARITY_CONFIG[badge.rarity].icon;
                    return (
                      <Card key={badge.id} className="overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className={`relative w-16 h-16 border-3 ${RARITY_CONFIG[badge.rarity].border} rounded-full overflow-hidden bg-background flex-shrink-0 shadow-lg ${RARITY_CONFIG[badge.rarity].glow}`}>
                              <Image
                                src={badge.imageUrl}
                                alt={badge.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <h3 className="font-semibold truncate">{badge.name}</h3>
                                <RarityIcon className={`h-4 w-4 flex-shrink-0 ${RARITY_CONFIG[badge.rarity].color.replace('bg-', 'text-')}`} />
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                {badge.description}
                              </p>
                              <div className="flex items-center justify-between">
                                <Badge variant="secondary" className="text-xs">
                                  {RARITY_CONFIG[badge.rarity].label}
                                </Badge>
                                {badge.awardedAt && (
                                  <span className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(badge.awardedAt.toDate(), { addSuffix: true })}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* Projects Tab */}
            <TabsContent value="projects" className="space-y-4">
              {projects.length === 0 ? (
                <Card className="shadow-md">
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No projects submitted yet</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {projects.map((project) => (
                    <Card key={project.id} className="shadow-md hover:shadow-xl transition-all duration-300">
                      <CardHeader>
                        <CardTitle className="text-lg">{project.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {project.description}
                        </p>
                        {project.tech && project.tech.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {project.tech.map((tech, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {project.createdAt && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {formatDistanceToNow(project.createdAt.toDate(), { addSuffix: true })}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Challenges Tab */}
            <TabsContent value="challenges" className="space-y-4">
              {submissions.length === 0 ? (
                <Card className="shadow-md">
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No challenge submissions yet</p>
                  </CardContent>
                </Card>
              ) : (
                <Card className="shadow-md">
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {submissions.map((submission) => (
                        <div key={submission.id} className="p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium truncate">{submission.challengeTitle}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge 
                                  variant={
                                    submission.status === 'pass' 
                                      ? 'default' 
                                      : submission.status === 'fail' 
                                      ? 'destructive' 
                                      : 'secondary'
                                  }
                                  className="text-xs"
                                >
                                  {submission.status.toUpperCase()}
                                </Badge>
                                {submission.status === 'pass' && (
                                  <span className="text-xs text-muted-foreground">
                                    +{submission.points} points
                                  </span>
                                )}
                              </div>
                            </div>
                            {submission.submittedAt && (
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {formatDistanceToNow(submission.submittedAt.toDate(), { addSuffix: true })}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </Container>
    </div>
  );
}
