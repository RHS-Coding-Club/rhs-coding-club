import { Container } from '@/components/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users } from 'lucide-react';

const upcomingEvents = [
  {
    title: 'Introduction to React Workshop',
    date: '2025-09-15',
    time: '3:30 PM - 5:00 PM',
    location: 'Computer Lab 1',
    attendees: 25,
    tags: ['Workshop', 'React', 'Beginner'],
  },
  {
    title: 'Coding Competition: Algorithm Challenge',
    date: '2025-09-22',
    time: '2:00 PM - 4:00 PM',
    location: 'Auditorium',
    attendees: 40,
    tags: ['Competition', 'Algorithms', 'All Levels'],
  },
  {
    title: 'Guest Speaker: Industry Professional',
    date: '2025-09-29',
    time: '3:30 PM - 4:30 PM',
    location: 'Conference Room',
    attendees: 30,
    tags: ['Speaker', 'Career', 'Networking'],
  },
];

export default function EventsPage() {
  return (
    <div className="py-20">
      <Container>
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">Events</h1>
            <p className="text-lg text-muted-foreground">
              Join our upcoming workshops, competitions, and networking events.
            </p>
          </div>

          <div className="space-y-8">
            <h2 className="text-2xl font-semibold">Upcoming Events</h2>
            <div className="grid gap-6">
              {upcomingEvents.map((event, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                      <CardTitle className="text-xl">{event.title}</CardTitle>
                      <div className="flex flex-wrap gap-2">
                        {event.tags.map(tag => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{event.date} at {event.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{event.attendees} expected attendees</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Event Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>All events are free for club members</li>
                <li>Please RSVP in advance for capacity planning</li>
                <li>Bring your laptop for hands-on workshops</li>
                <li>Events are held every Friday after school</li>
                <li>Food and refreshments will be provided</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </Container>
    </div>
  );
}
