'use client';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ChallengeFiltersProps {
  selectedDifficulty: string;
  selectedStatus: string;
  onDifficultyChange: (difficulty: string) => void;
  onStatusChange: (status: string) => void;
  onClearFilters: () => void;
}

export function ChallengeFilters({
  selectedDifficulty,
  selectedStatus,
  onDifficultyChange,
  onStatusChange,
  onClearFilters,
}: ChallengeFiltersProps) {
  const hasActiveFilters = selectedDifficulty !== 'all' || selectedStatus !== 'all';

  return (
    <div className="flex flex-wrap gap-4 items-center">
      <div className="space-y-1">
        <label className="text-sm font-medium">Difficulty</label>
        <Select value={selectedDifficulty} onValueChange={onDifficultyChange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Status</label>
        <Select value={selectedStatus} onValueChange={onStatusChange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="not-attempted">Not Attempted</SelectItem>
            <SelectItem value="pending">Under Review</SelectItem>
            <SelectItem value="pass">Passed</SelectItem>
            <SelectItem value="fail">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <Button variant="outline" size="sm" onClick={onClearFilters}>
          Clear Filters
        </Button>
      )}
    </div>
  );
}
