import Image, { ImageProps } from 'next/image';
import { cn } from '@/lib/utils';

interface ResponsiveImageProps extends Omit<ImageProps, 'src'> {
  src: string;
  fallback?: string;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'landscape';
  priority?: boolean;
}

export function ResponsiveImage({
  src,
  alt,
  fallback = '/placeholder.svg',
  aspectRatio = 'landscape',
  className,
  priority = false,
  ...props
}: ResponsiveImageProps) {
  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]',
  };

  return (
    <div className={cn('relative overflow-hidden', aspectRatioClasses[aspectRatio], className)}>
      <Image
        src={src || fallback}
        alt={alt}
        fill
        className="object-cover transition-transform duration-300 hover:scale-105"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        priority={priority}
        quality={85}
        {...props}
      />
    </div>
  );
}

interface OptimizedIconProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function OptimizedIcon({ name, size = 'md', className }: OptimizedIconProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  return (
    <div className={cn('flex-shrink-0', sizeClasses[size], className)}>
      <Image
        src={`/icons/${name}.svg`}
        alt={`${name} icon`}
        width={24}
        height={24}
        className="w-full h-full"
      />
    </div>
  );
}
