'use client';

import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Container } from '@/components/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Calendar,
  MapPin,
  Users,
  ArrowLeft,
  ExternalLink,
  Clock,
  Share2,
  CheckCircle,
  XCircle,
  HelpCircle,
} from 'lucide-react';
import { useEvent } from '@/hooks/useEvents';
import { RSVPButton } from '@/components/events/rsvp-button';
import { generateGoogleCalendarUrl } from '@/lib/services/events';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import { toast } from 'sonner';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const eventId = params.id as string;
  
  const { event, loading, error, refetch } = useEvent(eventId);

  if (loading) {
    return (
      <div className="py-20">
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-8">
              <div className="h-8 bg-muted rounded w-1/4"></div>
              <div className="h-12 bg-muted rounded w-3/4"></div>
              <div className="h-64 bg-muted rounded"></div>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="py-20">
        <Container>
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <h1 className="text-2xl font-bold">Event Not Found</h1>
            <p className="text-muted-foreground">
              The event you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => router.back()} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  const eventDate = event.date.toDate();
  const isPastEvent = eventDate < new Date();
  const googleCalendarUrl = generateGoogleCalendarUrl(event);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled sharing
      }
    } else {
      // Fallback to copying URL
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Event link copied to clipboard!');
    }
  };

  const formatDuration = (startDate: Date) => {
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // Assuming 2 hours
    return `${format(startDate, 'h:mm a')} - ${format(endDate, 'h:mm a')}`;
  };

  return (
    <div className="py-20">
      <Container>
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="gap-2 -ml-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Events
          </Button>

          {/* Event Header */}
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="space-y-4 flex-1">
                <div className="flex flex-wrap gap-2">
                  {event.tags?.map(tag => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                  {isPastEvent && (
                    <Badge variant="outline" className="text-muted-foreground">
                      Past Event
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                  {event.title}
                </h1>
              </div>
              <div className="flex gap-3 lg:flex-col lg:w-auto w-full">
                {!isPastEvent && (
                  <RSVPButton
                    eventId={event.id}
                    currentRsvp={event.userRsvp}
                    onRsvpChange={refetch}
                    size="lg"
                  />
                )}
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => window.open(googleCalendarUrl, '_blank')}
                  className="gap-2 flex-1 lg:flex-none"
                >
                  <ExternalLink className="h-4 w-4" />
                  Add to Calendar
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleShare}
                  className="gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>

            {/* Event Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-4 text-center">
                  <Calendar className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <div className="font-semibold">
                    {format(eventDate, 'MMM d, yyyy')}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(eventDate, 'EEEE')}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <div className="font-semibold">
                    {formatDuration(eventDate)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Duration
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <MapPin className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <div className="font-semibold">{event.location}</div>
                  <div className="text-sm text-muted-foreground">
                    Location
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <div className="font-semibold">{event.rsvpCount.yes}</div>
                  <div className="text-sm text-muted-foreground">
                    Going
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Event Description */}
          <Card>
            <CardHeader>
              <CardTitle>About This Event</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                {event.description.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 last:mb-0">
                    {paragraph}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* RSVP Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-600">Going</span>
                  </div>
                  <div className="text-2xl font-bold">{event.rsvpCount.yes}</div>
                </div>
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <HelpCircle className="h-5 w-5 text-yellow-600" />
                    <span className="font-semibold text-yellow-600">Maybe</span>
                  </div>
                  <div className="text-2xl font-bold">{event.rsvpCount.maybe}</div>
                </div>
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <span className="font-semibold text-red-600">Not Going</span>
                  </div>
                  <div className="text-2xl font-bold">{event.rsvpCount.no}</div>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Total Responses</div>
                <div className="text-xl font-semibold">{event.rsvpCount.total}</div>
              </div>
            </CardContent>
          </Card>

          {/* Event Guidelines for this specific event */}
          <Card>
            <CardHeader>
              <CardTitle>What to Expect</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                  Free event for all club members
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                  Bring your laptop for hands-on activities
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                  Opportunity to network with peers
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Call to Action */}
          {!isPastEvent && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-8 text-center space-y-4">
                <h3 className="text-xl font-semibold">Ready to Join?</h3>
                <p className="text-muted-foreground">
                  Don't miss out on this exciting event. RSVP now to secure your spot!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <RSVPButton
                    eventId={event.id}
                    currentRsvp={event.userRsvp}
                    onRsvpChange={refetch}
                    size="lg"
                  />
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => window.open(googleCalendarUrl, '_blank')}
                    className="gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Add to Calendar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </Container>
    </div>
  );
}
