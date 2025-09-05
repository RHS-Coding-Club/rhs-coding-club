'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNextEvent } from '@/hooks/useNextEvent';
import { formatDistanceToNow, format } from 'date-fns';

export function NextEventBanner() {
  const { nextEvent, loading, error } = useNextEvent();

  if (loading || error || !nextEvent) {
    return null;
  }

  const isWithinWeek = nextEvent.date.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="mb-8"
    >
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20 overflow-hidden">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Next Event</span>
                {isWithinWeek && (
                  <Badge variant="destructive" className="text-xs">
                    This Week!
                  </Badge>
                )}
              </div>
              
              <h3 className="text-lg md:text-xl font-bold mb-2">{nextEvent.title}</h3>
              
              <p className="text-muted-foreground mb-4 line-clamp-2 text-sm md:text-base">
                {nextEvent.description}
              </p>
              
              <div className="flex flex-col md:flex-row md:flex-wrap gap-2 md:gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{format(nextEvent.date, 'PPP')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{nextEvent.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDistanceToNow(nextEvent.date, { addSuffix: true })}</span>
                </div>
              </div>
              
              {nextEvent.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4 lg:mb-0">
                  {nextEvent.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {nextEvent.tags.length > 3 && (
                    <span className="text-xs text-muted-foreground">
                      +{nextEvent.tags.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex flex-row lg:flex-col gap-2 w-full lg:w-auto">
              <Button size="sm" className="flex-1 lg:flex-none" asChild>
                <Link href={`/events/${nextEvent.id}`}>
                  <span className="hidden md:inline">View Details</span>
                  <span className="md:hidden">Details</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="sm" variant="outline" className="flex-1 lg:flex-none" asChild>
                <Link href="/events">
                  All Events
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
