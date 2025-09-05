'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNextEvent } from '@/hooks/useNextEvent';
import { formatDistanceToNow } from 'date-fns';

export function NextEventBanner() {
  const { nextEvent, loading, error } = useNextEvent();

  if (loading || error || !nextEvent) {
    return null;
  }

  const isWithinWeek = nextEvent.date.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;
  const isToday = new Date().toDateString() === nextEvent.date.toDateString();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="mb-6"
    >
      <Card className={`overflow-hidden transition-all duration-200 hover:shadow-md ${
        isToday 
          ? 'bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-700' 
          : isWithinWeek 
            ? 'bg-gradient-to-r from-primary/8 to-primary/12 border-primary/30'
            : 'bg-gradient-to-r from-primary/5 to-primary/8 border-primary/20'
      }`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={`p-2 rounded-full ${
                isToday 
                  ? 'bg-gray-100 dark:bg-gray-800' 
                  : 'bg-primary/10'
              }`}>
                <Calendar className={`h-4 w-4 ${
                  isToday 
                    ? 'text-gray-600 dark:text-gray-400' 
                    : 'text-primary'
                }`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {isToday ? 'Today' : 'Next Event'}
                  </span>
                  {isToday && (
                    <Badge variant="default" className="text-xs px-2 py-0 h-5 bg-gray-800 text-white dark:bg-white dark:text-gray-900">
                      Today!
                    </Badge>
                  )}
                  {!isToday && isWithinWeek && (
                    <Badge variant="secondary" className="text-xs px-2 py-0 h-5 bg-primary/10 text-primary">
                      This Week
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground truncate">
                    {nextEvent.title}
                  </h3>
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(nextEvent.date, { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
            
            <Button 
              size="sm" 
              className={`shrink-0 ${
                isToday 
                  ? 'bg-gray-800 hover:bg-gray-900 text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100' 
                  : ''
              }`}
              asChild
            >
              <Link href={`/events/${nextEvent.id}`}>
                {isToday ? 'Join Now' : 'Learn More'}
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
