'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { eventService, EventWithRsvps, CreateEventData, UpdateEventData } from '@/lib/services/events';
import { toast } from 'sonner';

export function useEvents() {
  const [events, setEvents] = useState<EventWithRsvps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedEvents = await eventService.getAllEvents(user?.uid);
      setEvents(fetchedEvents);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [user]);

  return {
    events,
    loading,
    error,
    refetch: fetchEvents,
  };
}

export function useUpcomingEvents(limitCount = 10) {
  const [events, setEvents] = useState<EventWithRsvps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedEvents = await eventService.getUpcomingEvents(user?.uid, limitCount);
      setEvents(fetchedEvents);
    } catch (err) {
      console.error('Error fetching upcoming events:', err);
      setError('Failed to fetch upcoming events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [user, limitCount]);

  return {
    events,
    loading,
    error,
    refetch: fetchEvents,
  };
}

export function usePastEvents(limitCount = 10) {
  const [events, setEvents] = useState<EventWithRsvps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedEvents = await eventService.getPastEvents(user?.uid, limitCount);
      setEvents(fetchedEvents);
    } catch (err) {
      console.error('Error fetching past events:', err);
      setError('Failed to fetch past events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [user, limitCount]);

  return {
    events,
    loading,
    error,
    refetch: fetchEvents,
  };
}

export function useEvent(eventId: string) {
  const [event, setEvent] = useState<EventWithRsvps | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchEvent = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedEvent = await eventService.getEventById(eventId, user?.uid);
      setEvent(fetchedEvent);
    } catch (err) {
      console.error('Error fetching event:', err);
      setError('Failed to fetch event');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) {
      fetchEvent();
    }
  }, [eventId, user]);

  return {
    event,
    loading,
    error,
    refetch: fetchEvent,
  };
}

export function useEventTags() {
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTags = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedTags = await eventService.getAllTags();
      setTags(fetchedTags);
    } catch (err) {
      console.error('Error fetching tags:', err);
      setError('Failed to fetch tags');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  return {
    tags,
    loading,
    error,
    refetch: fetchTags,
  };
}

export function useEventActions() {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const createEvent = async (eventData: CreateEventData) => {
    if (!user) {
      toast.error('You must be logged in to create events');
      return null;
    }

    try {
      setLoading(true);
      const eventId = await eventService.createEvent(eventData, user.uid);
      toast.success('Event created successfully');
      return eventId;
    } catch (err) {
      console.error('Error creating event:', err);
      toast.error('Failed to create event');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateEvent = async (eventData: UpdateEventData) => {
    try {
      setLoading(true);
      await eventService.updateEvent(eventData);
      toast.success('Event updated successfully');
      return true;
    } catch (err) {
      console.error('Error updating event:', err);
      toast.error('Failed to update event');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      setLoading(true);
      await eventService.deleteEvent(eventId);
      toast.success('Event deleted successfully');
      return true;
    } catch (err) {
      console.error('Error deleting event:', err);
      toast.error('Failed to delete event');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const rsvpToEvent = async (eventId: string, status: 'YES' | 'NO' | 'MAYBE') => {
    if (!user) {
      toast.error('You must be logged in to RSVP');
      return false;
    }

    try {
      setLoading(true);
      await eventService.rsvpToEvent(eventId, user.uid, status);
      toast.success(`RSVP updated to ${status}`);
      return true;
    } catch (err) {
      console.error('Error updating RSVP:', err);
      toast.error('Failed to update RSVP');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeRsvp = async (eventId: string) => {
    if (!user) {
      toast.error('You must be logged in to remove RSVP');
      return false;
    }

    try {
      setLoading(true);
      await eventService.removeRsvp(eventId, user.uid);
      toast.success('RSVP removed');
      return true;
    } catch (err) {
      console.error('Error removing RSVP:', err);
      toast.error('Failed to remove RSVP');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    createEvent,
    updateEvent,
    deleteEvent,
    rsvpToEvent,
    removeRsvp,
  };
}
