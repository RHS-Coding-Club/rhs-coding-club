'use client';

import { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { Award, Crown, Sparkles, Gem, Star, X } from 'lucide-react';
import Image from 'next/image';
import { Badge as BadgeType } from '@/lib/services/badges';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface BadgeCelebrationProps {
  badge: BadgeType;
  onClose: () => void;
}

const RARITY_CONFIG = {
  common: {
    label: 'Common',
    color: 'bg-slate-500',
    icon: Star,
    border: 'border-slate-500',
    gradient: 'from-slate-400 to-slate-600',
    glow: 'shadow-slate-500/50',
    confettiColors: ['#64748b', '#94a3b8', '#cbd5e1'],
  },
  rare: {
    label: 'Rare',
    color: 'bg-blue-500',
    icon: Sparkles,
    border: 'border-blue-500',
    gradient: 'from-blue-400 to-blue-600',
    glow: 'shadow-blue-500/50',
    confettiColors: ['#3b82f6', '#60a5fa', '#93c5fd'],
  },
  epic: {
    label: 'Epic',
    color: 'bg-purple-500',
    icon: Gem,
    border: 'border-purple-500',
    gradient: 'from-purple-400 to-purple-600',
    glow: 'shadow-purple-500/50',
    confettiColors: ['#a855f7', '#c084fc', '#e9d5ff'],
  },
  legendary: {
    label: 'Legendary',
    color: 'bg-amber-500',
    icon: Crown,
    border: 'border-amber-500',
    gradient: 'from-amber-400 to-amber-600',
    glow: 'shadow-amber-500/50',
    confettiColors: ['#f59e0b', '#fbbf24', '#fde68a'],
  },
};

export function BadgeCelebration({ badge, onClose }: BadgeCelebrationProps) {
  const [showConfetti, setShowConfetti] = useState(true);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    // Set window size for confetti
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    // Handle window resize
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);

    // Stop confetti after 5 seconds
    const confettiTimer = setTimeout(() => {
      setShowConfetti(false);
    }, 5000);

    // Auto-close after 10 seconds
    const autoCloseTimer = setTimeout(() => {
      onClose();
    }, 10000);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(confettiTimer);
      clearTimeout(autoCloseTimer);
    };
  }, [onClose]);

  const RarityIcon = RARITY_CONFIG[badge.rarity].icon;
  const config = RARITY_CONFIG[badge.rarity];

  return (
    <>
      {/* Confetti */}
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={badge.rarity === 'legendary' ? 500 : badge.rarity === 'epic' ? 300 : 200}
          colors={config.confettiColors}
          gravity={0.3}
        />
      )}

      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:bg-white/20"
        >
          <X className="h-6 w-6" />
        </Button>

        {/* Celebration Card */}
        <Card className="max-w-md w-full animate-in zoom-in-95 duration-500 border-2" style={{ borderColor: config.color.replace('bg-', '#') }}>
          <CardContent className="p-8 text-center space-y-6">
            {/* Badge Image with Glow */}
            <div className="relative mx-auto w-32 h-32 animate-in zoom-in-110 duration-700 delay-200">
              <div className={`absolute inset-0 rounded-full ${config.color} opacity-30 blur-2xl animate-pulse`} />
              <div className={`relative w-full h-full border-4 ${config.border} rounded-full overflow-hidden bg-background shadow-2xl ${config.glow}`}>
                <Image
                  src={badge.imageUrl}
                  alt={badge.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              {/* Floating Icon */}
              <div className={`absolute -top-2 -right-2 ${config.color} rounded-full p-2 shadow-lg ${config.glow} animate-bounce`}>
                <RarityIcon className="h-6 w-6 text-white" />
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2 animate-in slide-in-from-bottom-4 duration-700 delay-300">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Badge Unlocked! 
              </h2>
              <p className="text-xl font-semibold">{badge.name}</p>
            </div>

            {/* Description */}
            <p className="text-muted-foreground animate-in slide-in-from-bottom-4 duration-700 delay-400">
              {badge.description}
            </p>

            {/* Rarity Badge */}
            <div className="flex justify-center animate-in slide-in-from-bottom-4 duration-700 delay-500">
              <Badge 
                className={`${config.color} text-white border-0 px-4 py-1 text-sm font-semibold flex items-center gap-2`}
              >
                <RarityIcon className="h-4 w-4" />
                {config.label} Badge
              </Badge>
            </div>

            {/* Close Button */}
            <Button
              onClick={onClose}
              className="w-full animate-in slide-in-from-bottom-4 duration-700 delay-600"
              size="lg"
            >
              Awesome!
            </Button>

            {/* Sparkle Effects */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(8)].map((_, i) => (
                <Sparkles
                  key={i}
                  className={`absolute text-${config.color.replace('bg-', '')} opacity-50 animate-ping`}
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: '2s',
                  }}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

// Hook to manage badge celebrations
export function useBadgeCelebration() {
  const [celebrationBadge, setCelebrationBadge] = useState<BadgeType | null>(null);

  const celebrate = (badge: BadgeType) => {
    setCelebrationBadge(badge);
  };

  const closeCelebration = () => {
    setCelebrationBadge(null);
  };

  return {
    celebrationBadge,
    celebrate,
    closeCelebration,
  };
}
