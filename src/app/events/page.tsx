'use client';

import { useState, useMemo } from 'react';
import { Container } from '@/components/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, Users, Trophy, Coffee, LayoutDashboard, Clock } from 'lucide-react';
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
  const [activeSection, setActiveSection] = useState<string>('upcoming');

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
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">Events</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join our workshops, competitions, and networking events. 
              Connect with fellow coders and expand your skills.
            </p>
          </div>

          {/* Modern Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="relative overflow-hidden">
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-blue-500/10" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-muted-foreground">Upcoming Events</CardTitle>
                  <div className="p-2 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400"><CalendarDays className="h-4 w-4" /></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold">{totalUpcoming}</div>
                <p className="text-xs text-muted-foreground mt-1">Don&apos;t miss out!</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-green-500/10" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-muted-foreground">Total Attendees</CardTitle>
                  <div className="p-2 rounded-md bg-green-500/10 text-green-600 dark:text-green-400"><Users className="h-4 w-4" /></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold">{totalGoing}</div>
                <p className="text-xs text-muted-foreground mt-1">Join the community</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-amber-500/10" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-muted-foreground">Events Completed</CardTitle>
                  <div className="p-2 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400"><Trophy className="h-4 w-4" /></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold">{pastEvents.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Learning sessions</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-purple-500/10" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-muted-foreground">Event Types</CardTitle>
                  <div className="p-2 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400"><Coffee className="h-4 w-4" /></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold">6+</div>
                <p className="text-xs text-muted-foreground mt-1">Variety & fun</p>
              </CardContent>
            </Card>
          </div>

          {/* Responsive navigation */}
          <div className="lg:grid lg:grid-cols-12 lg:gap-6">
            <div className="lg:hidden mb-4">
              <Tabs value={activeSection} onValueChange={setActiveSection}>
                <TabsList className="flex-wrap">
                  <TabsTrigger value="upcoming">Upcoming ({filteredUpcomingEvents.length})</TabsTrigger>
                  <TabsTrigger value="past">Past ({filteredPastEvents.length})</TabsTrigger>
                  <TabsTrigger value="all">All ({filteredAllEvents.length})</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Sidebar */}
            <aside className="hidden lg:block lg:col-span-3 xl:col-span-2">
              <Card className="sticky top-24">
                <CardContent className="p-3">
                  <nav className="space-y-1">
                    {[
                      { key: 'upcoming', label: `Upcoming (${filteredUpcomingEvents.length})`, icon: Clock },
                      { key: 'past', label: `Past (${filteredPastEvents.length})`, icon: Trophy },
                      { key: 'all', label: `All (${filteredAllEvents.length})`, icon: LayoutDashboard },
                    ].map(({ key, label, icon: Icon }) => (
                      <button
                        key={key}
                        onClick={() => setActiveSection(key)}
                        className={`w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                          activeSection === key ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-foreground'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{label}</span>
                      </button>
                    ))}
                  </nav>
                </CardContent>
              </Card>
            </aside>

            {/* Content */}
            <div className="lg:col-span-9 xl:col-span-10 space-y-6 mt-6 lg:mt-0">
              {/* Filters */}
              <EventFilters
                filters={filters}
                onFiltersChange={setFilters}
                className="bg-card p-6 rounded-lg border"
              />

              <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-6">
                <TabsList className="lg:hidden" />

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
                <li>Join our Discord for real-time updates and discussions</li>
              </ul>
            </CardContent>
          </Card>
          </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
