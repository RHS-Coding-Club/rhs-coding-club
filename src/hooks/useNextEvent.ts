'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Event } from '@/lib/firebase-collections';

interface NextEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  tags: string[];
  coverImage?: string;
}

interface NextEventData {
  nextEvent: NextEvent | null;
  loading: boolean;
  error: string | null;
}

export function useNextEvent(): NextEventData {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextEvent, setNextEvent] = useState<NextEvent | null>(null);

  useEffect(() => {
    const fetchNextEvent = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get the next upcoming event
        const eventsQuery = query(
          collection(db, 'events'),
          where('date', '>', new Date()),
          orderBy('date', 'asc'),
          limit(1)
        );
        
        const eventsSnapshot = await getDocs(eventsQuery);
        
        if (!eventsSnapshot.empty) {
          const eventDoc = eventsSnapshot.docs[0];
          const eventData = eventDoc.data() as Event;
          
          setNextEvent({
            id: eventDoc.id,
            title: eventData.title,
            description: eventData.description,
            date: eventData.date.toDate(),
            location: eventData.location,
            tags: eventData.tags || [],
            coverImage: eventData.coverImage,
          });
        } else {
          setNextEvent(null);
        }

      } catch (err) {
        console.error('Error fetching next event:', err);
        setError('Failed to load upcoming event');
      } finally {
        setLoading(false);
      }
    };

    fetchNextEvent();
  }, []);

  return {
    nextEvent,
    loading,
    error,
  };
}
