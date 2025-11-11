'use client';

import { useState, useEffect } from 'react';
import { getUserBadges, Badge } from '@/lib/services/badges';
import { Award, Sparkles, Star, Crown, Gem, Loader2 } from 'lucide-react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface BadgeDisplayProps {
  userId: string;
  maxDisplay?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

const RARITY_CONFIG = {
  common: {
    label: 'Common',
    color: 'bg-slate-500',
    icon: Star,
    border: 'border-slate-500',
    gradient: 'from-slate-400 to-slate-600',
  },
  rare: {
    label: 'Rare',
    color: 'bg-blue-500',
    icon: Sparkles,
    border: 'border-blue-500',
    gradient: 'from-blue-400 to-blue-600',
  },
  epic: {
    label: 'Epic',
    color: 'bg-purple-500',
    icon: Gem,
    border: 'border-purple-500',
    gradient: 'from-purple-400 to-purple-600',
  },
  legendary: {
    label: 'Legendary',
    color: 'bg-amber-500',
    icon: Crown,
    border: 'border-amber-500',
    gradient: 'from-amber-400 to-amber-600',
  },
};

const SIZE_CONFIG = {
  sm: {
    container: 'w-12 h-12',
    border: 'border-2',
    icon: 'h-6 w-6',
  },
  md: {
    container: 'w-16 h-16',
    border: 'border-3',
    icon: 'h-8 w-8',
  },
  lg: {
    container: 'w-24 h-24',
    border: 'border-4',
    icon: 'h-12 w-12',
  },
};

export function BadgeDisplay({ 
  userId, 
  maxDisplay = 5, 
  size = 'md',
  showCount = true 
}: BadgeDisplayProps) {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  useEffect(() => {
    loadUserBadges();
  }, [userId]);

  const loadUserBadges = async () => {
    try {
      setLoading(true);
      const data = await getUserBadges(userId);
      setBadges(data);
    } catch (error) {
      console.error('Error loading user badges:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Loading badges...</span>
      </div>
    );
  }

  if (badges.length === 0) {
    return null;
  }

  const displayBadges = badges.slice(0, maxDisplay);
  const remainingCount = badges.length - maxDisplay;

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        {displayBadges.map((badge) => (
          <button
            key={badge.id}
            onClick={() => setSelectedBadge(badge)}
            className={`relative ${SIZE_CONFIG[size].container} ${SIZE_CONFIG[size].border} ${RARITY_CONFIG[badge.rarity].border} rounded-full overflow-hidden bg-background hover:scale-110 transition-transform cursor-pointer group`}
            title={badge.name}
          >
            <Image
              src={badge.imageUrl}
              alt={badge.name}
              fill
              className="object-cover"
            />
            {/* Rarity glow effect on hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${RARITY_CONFIG[badge.rarity].gradient} opacity-0 group-hover:opacity-20 transition-opacity`} />
          </button>
        ))}

        {remainingCount > 0 && showCount && (
          <div className={`${SIZE_CONFIG[size].container} ${SIZE_CONFIG[size].border} border-dashed border-muted-foreground/25 rounded-full flex items-center justify-center bg-muted text-muted-foreground font-semibold text-sm`}>
            +{remainingCount}
          </div>
        )}
      </div>

      {/* Badge Detail Dialog */}
      {selectedBadge && (
        <Dialog open={!!selectedBadge} onOpenChange={() => setSelectedBadge(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Badge Details
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Badge Preview */}
              <div className="flex flex-col items-center gap-4">
                <div className={`relative w-32 h-32 border-4 ${RARITY_CONFIG[selectedBadge.rarity].border} rounded-full overflow-hidden bg-background shadow-lg`}>
                  <Image
                    src={selectedBadge.imageUrl}
                    alt={selectedBadge.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="text-center">
                  <h3 className="text-xl font-bold">{selectedBadge.name}</h3>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <div className={`w-3 h-3 rounded-full ${RARITY_CONFIG[selectedBadge.rarity].color}`} />
                    <span className="text-sm font-medium text-muted-foreground">
                      {RARITY_CONFIG[selectedBadge.rarity].label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedBadge.description}
                </p>
              </div>

              {/* Criteria */}
              <div>
                <h4 className="font-semibold mb-2">How to Earn</h4>
                <div className="text-sm text-muted-foreground bg-muted rounded-lg p-3">
                  {selectedBadge.criteria.type === 'custom' ? (
                    <p>{selectedBadge.criteria.condition || 'Special achievement'}</p>
                  ) : (
                    <p>
                      {selectedBadge.criteria.type === 'points' && `Earn ${selectedBadge.criteria.threshold} points`}
                      {selectedBadge.criteria.type === 'challenges' && `Complete ${selectedBadge.criteria.threshold} challenges`}
                      {selectedBadge.criteria.type === 'events' && `Attend ${selectedBadge.criteria.threshold} events`}
                      {selectedBadge.criteria.type === 'projects' && `Submit ${selectedBadge.criteria.threshold} projects`}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

interface BadgeGridProps {
  userId: string;
  columns?: number;
}

export function BadgeGrid({ userId, columns = 4 }: BadgeGridProps) {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  useEffect(() => {
    loadUserBadges();
  }, [userId]);

  const loadUserBadges = async () => {
    try {
      setLoading(true);
      const data = await getUserBadges(userId);
      setBadges(data);
    } catch (error) {
      console.error('Error loading user badges:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-sm text-muted-foreground">Loading badges...</p>
        </div>
      </div>
    );
  }

  if (badges.length === 0) {
    return (
      <div className="text-center py-12">
        <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
        <h3 className="font-semibold mb-2">No badges yet</h3>
        <p className="text-sm text-muted-foreground">
          Complete challenges, attend events, and contribute to earn badges!
        </p>
      </div>
    );
  }

  const gridCols = {
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
  }[columns] || 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4';

  return (
    <>
      <div className={`grid ${gridCols} gap-4`}>
        {badges.map((badge) => (
          <button
            key={badge.id}
            onClick={() => setSelectedBadge(badge)}
            className="flex flex-col items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors group"
          >
            <div className={`relative w-20 h-20 border-3 ${RARITY_CONFIG[badge.rarity].border} rounded-full overflow-hidden bg-background group-hover:scale-110 transition-transform`}>
              <Image
                src={badge.imageUrl}
                alt={badge.name}
                fill
                className="object-cover"
              />
              <div className={`absolute inset-0 bg-gradient-to-br ${RARITY_CONFIG[badge.rarity].gradient} opacity-0 group-hover:opacity-20 transition-opacity`} />
            </div>
            
            <div className="text-center">
              <p className="font-medium text-sm line-clamp-1">{badge.name}</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <div className={`w-2 h-2 rounded-full ${RARITY_CONFIG[badge.rarity].color}`} />
                <span className="text-xs text-muted-foreground">
                  {RARITY_CONFIG[badge.rarity].label}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Badge Detail Dialog */}
      {selectedBadge && (
        <Dialog open={!!selectedBadge} onOpenChange={() => setSelectedBadge(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Badge Details
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Badge Preview */}
              <div className="flex flex-col items-center gap-4">
                <div className={`relative w-32 h-32 border-4 ${RARITY_CONFIG[selectedBadge.rarity].border} rounded-full overflow-hidden bg-background shadow-lg`}>
                  <Image
                    src={selectedBadge.imageUrl}
                    alt={selectedBadge.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="text-center">
                  <h3 className="text-xl font-bold">{selectedBadge.name}</h3>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <div className={`w-3 h-3 rounded-full ${RARITY_CONFIG[selectedBadge.rarity].color}`} />
                    <span className="text-sm font-medium text-muted-foreground">
                      {RARITY_CONFIG[selectedBadge.rarity].label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedBadge.description}
                </p>
              </div>

              {/* Criteria */}
              <div>
                <h4 className="font-semibold mb-2">How to Earn</h4>
                <div className="text-sm text-muted-foreground bg-muted rounded-lg p-3">
                  {selectedBadge.criteria.type === 'custom' ? (
                    <p>{selectedBadge.criteria.condition || 'Special achievement'}</p>
                  ) : (
                    <p>
                      {selectedBadge.criteria.type === 'points' && `Earn ${selectedBadge.criteria.threshold} points`}
                      {selectedBadge.criteria.type === 'challenges' && `Complete ${selectedBadge.criteria.threshold} challenges`}
                      {selectedBadge.criteria.type === 'events' && `Attend ${selectedBadge.criteria.threshold} events`}
                      {selectedBadge.criteria.type === 'projects' && `Submit ${selectedBadge.criteria.threshold} projects`}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
