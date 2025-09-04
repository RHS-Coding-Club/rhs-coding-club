'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X, Filter } from 'lucide-react';
import { useEventTags } from '@/hooks/useEvents';

export interface EventFilters {
  search: string;
  tags: string[];
  timeFilter: 'all' | 'upcoming' | 'past';
}

interface EventFiltersProps {
  filters: EventFilters;
  onFiltersChange: (filters: EventFilters) => void;
  className?: string;
}

export function EventFilters({ filters, onFiltersChange, className }: EventFiltersProps) {
  const { tags: availableTags } = useEventTags();
  const [showAllTags, setShowAllTags] = useState(false);

  const handleSearchChange = (search: string) => {
    onFiltersChange({ ...filters, search });
  };

  const handleTimeFilterChange = (timeFilter: EventFilters['timeFilter']) => {
    onFiltersChange({ ...filters, timeFilter });
  };

  const handleTagToggle = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    onFiltersChange({ ...filters, tags: newTags });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      search: '',
      tags: [],
      timeFilter: 'all',
    });
  };

  const hasActiveFilters = filters.search || filters.tags.length > 0 || filters.timeFilter !== 'all';
  const displayedTags = showAllTags ? availableTags : availableTags.slice(0, 8);

  return (
    <div className={className}>
      <div className="space-y-4">
        {/* Search and Time Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search events..."
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filters.timeFilter} onValueChange={handleTimeFilterChange}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="upcoming">Upcoming Events</SelectItem>
              <SelectItem value="past">Past Events</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tags Filter */}
        {availableTags.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filter by tags</span>
              </div>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="gap-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                  Clear filters
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {displayedTags.map(tag => (
                <Badge
                  key={tag}
                  variant={filters.tags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/80 transition-colors"
                  onClick={() => handleTagToggle(tag)}
                >
                  {tag}
                  {filters.tags.includes(tag) && (
                    <X className="h-3 w-3 ml-1" />
                  )}
                </Badge>
              ))}
              {availableTags.length > 8 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllTags(!showAllTags)}
                  className="h-6 px-2 text-xs"
                >
                  {showAllTags ? 'Show less' : `+${availableTags.length - 8} more`}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Active filters:</span>
            {filters.search && (
              <Badge variant="outline" className="gap-1">
                "{filters.search}"
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => handleSearchChange('')}
                />
              </Badge>
            )}
            {filters.timeFilter !== 'all' && (
              <Badge variant="outline" className="gap-1">
                {filters.timeFilter}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => handleTimeFilterChange('all')}
                />
              </Badge>
            )}
            <span className="text-xs">
              ({filters.tags.length} tag{filters.tags.length !== 1 ? 's' : ''} selected)
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
