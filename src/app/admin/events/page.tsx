'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Container } from '@/components/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  MapPin,
  Users,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Eye,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useEvents, useEventActions } from '@/hooks/useEvents';
import { EventForm } from '@/components/events/event-form';
import { EventWithRsvps } from '@/lib/services/events';
import { useAuth } from '@/contexts/auth-context';
import { ProtectedRoute } from '@/components/auth/protected-route';
import Link from 'next/link';

function AdminEventCard({ event, onEdit, onDelete }: {
  event: EventWithRsvps;
  onEdit: (event: EventWithRsvps) => void;
  onDelete: (event: EventWithRsvps) => void;
}) {
  const eventDate = event.date.toDate();
  const isPastEvent = eventDate < new Date();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-lg">{event.title}</CardTitle>
            <div className="flex flex-wrap gap-2">
              {event.tags?.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {isPastEvent && (
                <Badge variant="outline" className="text-xs">
                  Past Event
                </Badge>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/events/${event.id}`} className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  View Event
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(event)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Event
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(event)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Event
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {event.description}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{format(eventDate, 'MMM d, yyyy h:mm a')}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>
                {event.rsvpCount.yes} going, {event.rsvpCount.total} total RSVPs
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AdminEventsContent() {
  const { events, loading, refetch } = useEvents();
  const { deleteEvent } = useEventActions();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventWithRsvps | null>(null);

  const handleEdit = (event: EventWithRsvps) => {
    setEditingEvent(event);
    setEditDialogOpen(true);
  };

  const handleDelete = async (event: EventWithRsvps) => {
    const success = await deleteEvent(event.id);
    if (success) {
      refetch();
    }
  };

  const handleEventSubmit = (eventId?: string) => {
    setCreateDialogOpen(false);
    setEditDialogOpen(false);
    setEditingEvent(null);
    refetch();
  };

  const upcomingEvents = events.filter(event => event.date.toDate() > new Date());
  const pastEvents = events.filter(event => event.date.toDate() <= new Date());

  if (loading) {
    return (
      <div className="py-20">
        <Container>
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse space-y-8">
              <div className="h-8 bg-muted rounded w-1/4"></div>
              <div className="grid gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 bg-muted rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="py-20">
      <Container>
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Event Management</h1>
              <p className="text-muted-foreground">
                Create, edit, and manage club events
              </p>
            </div>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Event
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Event</DialogTitle>
                  <DialogDescription>
                    Fill in the details to create a new event for the club.
                  </DialogDescription>
                </DialogHeader>
                <EventForm
                  onSubmit={handleEventSubmit}
                  onCancel={() => setCreateDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{upcomingEvents.length}</div>
                <div className="text-sm text-muted-foreground">Upcoming Events</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">
                  {upcomingEvents.reduce((sum, event) => sum + event.rsvpCount.yes, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Expected Attendees</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{pastEvents.length}</div>
                <div className="text-sm text-muted-foreground">Events Completed</div>
              </CardContent>
            </Card>
          </div>

          {/* Events List */}
          <Tabs defaultValue="upcoming" className="space-y-6">
            <TabsList>
              <TabsTrigger value="upcoming">
                Upcoming ({upcomingEvents.length})
              </TabsTrigger>
              <TabsTrigger value="past">
                Past ({pastEvents.length})
              </TabsTrigger>
              <TabsTrigger value="all">
                All ({events.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-6">
              {upcomingEvents.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No upcoming events</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first event to get started.
                    </p>
                    <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="gap-2">
                          <Plus className="h-4 w-4" />
                          Create Event
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {upcomingEvents.map(event => (
                    <AdminEventCard
                      key={event.id}
                      event={event}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-6">
              {pastEvents.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No past events</h3>
                    <p className="text-muted-foreground">
                      Past events will appear here after they're completed.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {pastEvents.map(event => (
                    <AdminEventCard
                      key={event.id}
                      event={event}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="all" className="space-y-6">
              <div className="grid gap-6">
                {events.map(event => (
                  <AdminEventCard
                    key={event.id}
                    event={event}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Edit Dialog */}
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Event</DialogTitle>
                <DialogDescription>
                  Update the event details below.
                </DialogDescription>
              </DialogHeader>
              {editingEvent && (
                <EventForm
                  event={editingEvent}
                  onSubmit={handleEventSubmit}
                  onCancel={() => {
                    setEditDialogOpen(false);
                    setEditingEvent(null);
                  }}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>
      </Container>
    </div>
  );
}

export default function AdminEventsPage() {
  return (
    <ProtectedRoute requiredRoles={['admin', 'officer']}>
      <AdminEventsContent />
    </ProtectedRoute>
  );
}
