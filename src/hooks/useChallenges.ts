'use client';

import { useState, useEffect, useCallback } from 'react';
import { Challenge, Submission, User } from '@/lib/firebase-collections';
import { challengesService } from '@/lib/services/challenges';

export function useChallenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      setLoading(true);
      const data = await challengesService.getAllChallenges();
      setChallenges(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load challenges');
    } finally {
      setLoading(false);
    }
  };

  return { challenges, loading, error, refetch: loadChallenges };
}

export function useChallenge(id: string) {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadChallenge = useCallback(async () => {
    try {
      setLoading(true);
      const data = await challengesService.getChallengeById(id);
      setChallenge(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load challenge');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadChallenge();
    }
  }, [id, loadChallenge]);

  return { challenge, loading, error, refetch: loadChallenge };
}

export function useSubmissions(challengeId?: string, userId?: string) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      let data: Submission[] = [];
      
      if (challengeId && userId) {
        const submission = await challengesService.getUserSubmission(challengeId, userId);
        data = submission ? [submission] : [];
      } else if (challengeId) {
        data = await challengesService.getSubmissionsForChallenge(challengeId);
      } else if (userId) {
        data = await challengesService.getUserSubmissions(userId);
      }
      
      setSubmissions(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  }, [challengeId, userId]);

  useEffect(() => {
    if (challengeId || userId) {
      loadSubmissions();
    }
  }, [challengeId, userId, loadSubmissions]);

  return { submissions, loading, error, refetch: loadSubmissions };
}

export function useLeaderboard(limit: number = 10) {
  const [leaderboard, setLeaderboard] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      const data = await challengesService.getLeaderboard(limit);
      setLeaderboard(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  return { leaderboard, loading, error, refetch: loadLeaderboard };
}

export function usePendingSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPendingSubmissions();
  }, []);

  const loadPendingSubmissions = async () => {
    try {
      setLoading(true);
      const data = await challengesService.getPendingSubmissions();
      setSubmissions(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pending submissions');
    } finally {
      setLoading(false);
    }
  };

  return { submissions, loading, error, refetch: loadPendingSubmissions };
}
