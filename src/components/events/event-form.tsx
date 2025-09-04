'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, CalendarIcon, X, Plus } from 'lucide-react';
import { useEventActions } from '@/hooks/useEvents';
import { CreateEventData, UpdateEventData, EventWithRsvps } from '@/lib/services/events';

const eventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(1, 'Description is required'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  location: z.string().min(1, 'Location is required').max(100, 'Location must be less than 100 characters'),
  tags: z.string().optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

interface EventFormProps {
  event?: EventWithRsvps;
  onSubmit?: (eventId?: string) => void;
  onCancel?: () => void;
}

const commonTags = [
  'Workshop',
  'Competition',
  'Speaker',
  'Networking',
  'Beginner',
  'Intermediate',
  'Advanced',
  'React',
  'Python',
  'JavaScript',
  'Web Development',
  'AI/ML',
  'Career',
  'Hackathon',
  'Social',
];

export function EventForm({ event, onSubmit, onCancel }: EventFormProps) {
  const { createEvent, updateEvent, loading } = useEventActions();
  const [tags, setTags] = useState<string[]>(event?.tags || []);
  const [newTag, setNewTag] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: event ? {
      title: event.title,
      description: event.description,
      date: format(event.date.toDate(), 'yyyy-MM-dd'),
      time: format(event.date.toDate(), 'HH:mm'),
      location: event.location,
      tags: event.tags?.join(', ') || '',
    } : {
      date: format(new Date(), 'yyyy-MM-dd'),
      time: '15:30', // Default to 3:30 PM
    },
  });

  const handleAddTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      const newTags = [...tags, tag];
      setTags(newTags);
      setValue('tags', newTags.join(', '));
    }
    setNewTag('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    setValue('tags', newTags.join(', '));
  };

  const onFormSubmit = async (data: EventFormData) => {
    try {
      // Combine date and time
      const eventDateTime = new Date(`${data.date}T${data.time}`);
      
      const eventData = {
        title: data.title,
        description: data.description,
        date: eventDateTime,
        location: data.location,
        tags: tags,
      };

      let eventId: string | null = null;

      if (event) {
        // Update existing event
        const updateData: UpdateEventData = {
          id: event.id,
          ...eventData,
        };
        const success = await updateEvent(updateData);
        if (success) {
          eventId = event.id;
        }
      } else {
        // Create new event
        eventId = await createEvent(eventData as CreateEventData);
      }

      if (eventId) {
        onSubmit?.(eventId);
      }
    } catch (error) {
      console.error('Error submitting event:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {event ? 'Edit Event' : 'Create New Event'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Enter event title"
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Describe your event..."
              rows={4}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                {...register('date')}
              />
              {errors.date && (
                <p className="text-sm text-red-600">{errors.date.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time *</Label>
              <Input
                id="time"
                type="time"
                {...register('time')}
              />
              {errors.time && (
                <p className="text-sm text-red-600">{errors.time.message}</p>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              {...register('location')}
              placeholder="Enter event location"
            />
            {errors.location && (
              <p className="text-sm text-red-600">{errors.location.message}</p>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-4">
            <Label>Tags</Label>
            
            {/* Current Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-red-600"
                      onClick={() => handleRemoveTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}

            {/* Add Custom Tag */}
            <div className="flex gap-2">
              <Input
                placeholder="Add custom tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag(newTag);
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => handleAddTag(newTag)}
                disabled={!newTag}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Common Tags */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Quick Add:</Label>
              <div className="flex flex-wrap gap-2">
                {commonTags.map(tag => (
                  <Badge
                    key={tag}
                    variant={tags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/80 transition-colors"
                    onClick={() => {
                      if (tags.includes(tag)) {
                        handleRemoveTag(tag);
                      } else {
                        handleAddTag(tag);
                      }
                    }}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Hidden field for tags */}
          <input type="hidden" {...register('tags')} />

          {/* Form Actions */}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Saving...' : (event ? 'Update Event' : 'Create Event')}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
