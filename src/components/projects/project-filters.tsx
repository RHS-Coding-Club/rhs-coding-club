'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Filter } from 'lucide-react';
import { projectService } from '@/lib/services/projects';

interface ProjectFiltersProps {
  selectedTags: string[];
  selectedYear: number | null;
  onTagsChange: (tags: string[]) => void;
  onYearChange: (year: number | null) => void;
  onReset: () => void;
}

export function ProjectFilters({ 
  selectedTags, 
  selectedYear, 
  onTagsChange, 
  onYearChange, 
  onReset 
}: ProjectFiltersProps) {
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [showAllTags, setShowAllTags] = useState(false);

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [tags, years] = await Promise.all([
          projectService.getTechnologies(),
          projectService.getYears()
        ]);
        setAvailableTags(tags);
        setAvailableYears(years);
      } catch (error) {
        console.error('Error loading filter options:', error);
      }
    };

    loadFilters();
  }, []);

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const displayedTags = showAllTags ? availableTags : availableTags.slice(0, 12);
  const hasActiveFilters = selectedTags.length > 0 || selectedYear !== null;

  return (
    <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <h3 className="font-medium">Filters</h3>
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            <X className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>

      {/* Year Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Year</label>
        <Select 
          value={selectedYear?.toString() || "all"} 
          onValueChange={(value) => onYearChange(value === "all" ? null : parseInt(value))}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All years" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All years</SelectItem>
            {availableYears.map(year => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Technology Tags */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Technologies</label>
        <div className="flex flex-wrap gap-2">
          {displayedTags.map(tag => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={() => handleTagToggle(tag)}
            >
              {tag}
              {selectedTags.includes(tag) && (
                <X className="h-3 w-3 ml-1" />
              )}
            </Badge>
          ))}
        </div>
        
        {availableTags.length > 12 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAllTags(!showAllTags)}
          >
            {showAllTags ? 'Show Less' : `Show ${availableTags.length - 12} More`}
          </Button>
        )}
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Active Filters</label>
          <div className="flex flex-wrap gap-2">
            {selectedYear && (
              <Badge variant="secondary">
                Year: {selectedYear}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => onYearChange(null)}
                />
              </Badge>
            )}
            {selectedTags.map(tag => (
              <Badge key={tag} variant="secondary">
                {tag}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => handleTagToggle(tag)}
                />
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
