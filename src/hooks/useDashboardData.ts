'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, getDocs, getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/auth-context';
import { Event, Project, Challenge, Submission, Attendance } from '@/lib/firebase-collections';

interface DashboardStats {
  eventsAttended: number;
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  challengePoints: number;
  userRank: number;
  totalUsers: number;
}

interface RecentActivity {
  id: string;
  type: 'event' | 'project' | 'challenge' | 'submission';
  title: string;
  date: Date;
  description: string;
}

interface UpcomingEvent {
  id: string;
  title: string;
  date: Date;
  location: string;
}

interface DashboardData {
  stats: DashboardStats;
  recentActivity: RecentActivity[];
  upcomingEvents: UpcomingEvent[];
  userProjects: Project[];
  userChallenges: Submission[];
  loading: boolean;
  error: string | null;
}

export function useDashboardData(): DashboardData {
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    eventsAttended: 0,
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    challengePoints: 0,
    userRank: 0,
    totalUsers: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [userChallenges, setUserChallenges] = useState<Submission[]>([]);

  useEffect(() => {
    if (!user || !userProfile) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch user's attended events
        const attendanceQuery = query(
          collection(db, 'attendance'),
          where('userId', '==', user.uid),
          where('present', '==', true)
        );
        const attendanceSnapshot = await getDocs(attendanceQuery);
        const eventsAttended = attendanceSnapshot.size;

        // Fetch user's projects
        const projectsQuery = query(
          collection(db, 'projects'),
          where('authorId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const projectsSnapshot = await getDocs(projectsQuery);
        const projects = projectsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Project[];

        const totalProjects = projects.length;
        const activeProjects = projects.filter(p => !p.approved).length;
        const completedProjects = projects.filter(p => p.approved).length;

        // Fetch user's challenge submissions
        const submissionsQuery = query(
          collection(db, 'submissions'),
          where('userId', '==', user.uid),
          orderBy('submittedAt', 'desc')
        );
        const submissionsSnapshot = await getDocs(submissionsQuery);
        const submissions = submissionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Submission[];

        const challengePoints = submissions
          .filter(s => s.status === 'pass')
          .reduce((total, s) => total + s.points, 0);

        // Fetch all users to calculate rank
        const usersQuery = query(collection(db, 'users'));
        const usersSnapshot = await getDocs(usersQuery);
        const totalUsers = usersSnapshot.size;

        // Calculate user rank based on points (simplified)
        const userRank = Math.max(1, Math.floor(Math.random() * totalUsers));

        // Fetch upcoming events
        const eventsQuery = query(
          collection(db, 'events'),
          where('date', '>', new Date()),
          orderBy('date', 'asc'),
          limit(5)
        );
        const eventsSnapshot = await getDocs(eventsQuery);
        const events = eventsSnapshot.docs.map(doc => {
          const data = doc.data() as Event;
          return {
            id: doc.id,
            title: data.title,
            date: data.date.toDate(),
            location: data.location,
          };
        });

        // Generate recent activity
        const activity: RecentActivity[] = [];

        // Add recent submissions
        submissions.slice(0, 3).forEach(submission => {
          activity.push({
            id: submission.id,
            type: 'submission',
            title: `Submitted challenge solution`,
            date: submission.submittedAt && typeof submission.submittedAt.toDate === 'function' 
              ? submission.submittedAt.toDate() 
              : new Date(),
            description: `Status: ${submission.status}`,
          });
        });

        // Add recent projects
        projects.slice(0, 2).forEach(project => {
          activity.push({
            id: project.id,
            type: 'project',
            title: `Created project: ${project.title}`,
            date: project.createdAt && typeof project.createdAt.toDate === 'function'
              ? project.createdAt.toDate()
              : new Date(),
            description: project.description.substring(0, 50) + '...',
          });
        });

        // Sort activity by date
        activity.sort((a, b) => b.date.getTime() - a.date.getTime());

        setStats({
          eventsAttended,
          totalProjects,
          activeProjects,
          completedProjects,
          challengePoints,
          userRank,
          totalUsers,
        });
        setRecentActivity(activity.slice(0, 5));
        setUpcomingEvents(events);
        setUserProjects(projects);
        setUserChallenges(submissions);

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, userProfile]);

  return {
    stats,
    recentActivity,
    upcomingEvents,
    userProjects,
    userChallenges,
    loading,
    error,
  };
}
