'use client';

import { useState, useMemo } from 'react';
import { Container } from '@/components/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, Users, Trophy, Coffee } from 'lucide-react';
import { useEvents, useUpcomingEvents, usePastEvents } from '@/hooks/useEvents';
import { EventCard } from '@/components/events/event-card';
import { EventFilters, EventFilters as EventFiltersType } from '@/components/events/event-filters';
import { EventWithRsvps } from '@/lib/services/events';

function filterEvents(events: EventWithRsvps[], filters: EventFiltersType): EventWithRsvps[] {
  return events.filter(event => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        event.title.toLowerCase().includes(searchLower) ||
        event.description.toLowerCase().includes(searchLower) ||
        event.location.toLowerCase().includes(searchLower) ||
        event.tags?.some(tag => tag.toLowerCase().includes(searchLower));
      
      if (!matchesSearch) return false;
    }

    // Tags filter
    if (filters.tags.length > 0) {
      const hasMatchingTag = filters.tags.some(filterTag => 
        event.tags?.includes(filterTag)
      );
      if (!hasMatchingTag) return false;
    }

    return true;
  });
}

export default function EventsPage() {
  const [filters, setFilters] = useState<EventFiltersType>({
    search: '',
    tags: [],
    timeFilter: 'all',
  });

  const { events: allEvents, loading: allLoading, refetch: refetchAll } = useEvents();
  const { events: upcomingEvents, loading: upcomingLoading, refetch: refetchUpcoming } = useUpcomingEvents();
  const { events: pastEvents, loading: pastLoading, refetch: refetchPast } = usePastEvents();

  const handleRsvpChange = () => {
    refetchAll();
    refetchUpcoming();
    refetchPast();
  };

  // Filter events based on current filters
  const filteredUpcomingEvents = useMemo(() => 
    filterEvents(upcomingEvents, filters), 
    [upcomingEvents, filters]
  );
  
  const filteredPastEvents = useMemo(() => 
    filterEvents(pastEvents, filters), 
    [pastEvents, filters]
  );

  const filteredAllEvents = useMemo(() => {
    let events = allEvents;
    
    // Apply time filter
    if (filters.timeFilter === 'upcoming') {
      events = events.filter(event => event.date.toDate() > new Date());
    } else if (filters.timeFilter === 'past') {
      events = events.filter(event => event.date.toDate() < new Date());
    }
    
    return filterEvents(events, filters);
  }, [allEvents, filters]);

  const totalUpcoming = upcomingEvents.length;
  const totalGoing = upcomingEvents.reduce((sum, event) => sum + event.rsvpCount.yes, 0);

  return (
    <div className="py-20">
      <Container>
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">Events</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join our workshops, competitions, and networking events. 
              Connect with fellow coders and expand your skills.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <CalendarDays className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{totalUpcoming}</div>
                <div className="text-sm text-muted-foreground">Upcoming Events</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{totalGoing}</div>
                <div className="text-sm text-muted-foreground">Total Attendees</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Trophy className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{pastEvents.length}</div>
                <div className="text-sm text-muted-foreground">Events Completed</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <EventFilters
            filters={filters}
            onFiltersChange={setFilters}
            className="bg-card p-6 rounded-lg border"
          />

          {/* Events Tabs */}
          <Tabs defaultValue="upcoming" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upcoming">
                Upcoming ({filteredUpcomingEvents.length})
              </TabsTrigger>
              <TabsTrigger value="past">
                Past ({filteredPastEvents.length})
              </TabsTrigger>
              <TabsTrigger value="all">
                All ({filteredAllEvents.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-6">
              {upcomingLoading ? (
                <div className="text-center py-12">
                  <div className="text-muted-foreground">Loading upcoming events...</div>
                </div>
              ) : filteredUpcomingEvents.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <CalendarDays className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No upcoming events found</h3>
                    <p className="text-muted-foreground">
                      {filters.search || filters.tags.length > 0 
                        ? 'Try adjusting your filters to see more events.'
                        : 'Check back soon for new events!'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {filteredUpcomingEvents.map(event => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onRsvpChange={handleRsvpChange}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-6">
              {pastLoading ? (
                <div className="text-center py-12">
                  <div className="text-muted-foreground">Loading past events...</div>
                </div>
              ) : filteredPastEvents.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No past events found</h3>
                    <p className="text-muted-foreground">
                      {filters.search || filters.tags.length > 0 
                        ? 'Try adjusting your filters to see more events.'
                        : 'Past events will appear here.'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {filteredPastEvents.map(event => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onRsvpChange={handleRsvpChange}
                      showRsvpButton={false}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="all" className="space-y-6">
              {allLoading ? (
                <div className="text-center py-12">
                  <div className="text-muted-foreground">Loading events...</div>
                </div>
              ) : filteredAllEvents.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <CalendarDays className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No events found</h3>
                    <p className="text-muted-foreground">
                      {filters.search || filters.tags.length > 0 
                        ? 'Try adjusting your filters to see more events.'
                        : 'Events will appear here when they are created.'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {filteredAllEvents.map(event => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onRsvpChange={handleRsvpChange}
                      showRsvpButton={event.date.toDate() > new Date()}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Event Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coffee className="h-5 w-5" />
                Event Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>All events are free for club members</li>
                <li>Please RSVP in advance for capacity planning</li>
                <li>Bring your laptop for hands-on workshops</li>
                <li>Events are held every Friday after school (unless noted)</li>
                <li>Food and refreshments will be provided</li>
                <li>Join our Discord for real-time updates and discussions</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </Container>
    </div>
  );
}
