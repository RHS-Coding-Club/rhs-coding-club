'use client';

import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const responsiveCardVariants = cva(
  'rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'border-border',
        outlined: 'border-2 border-border',
        elevated: 'shadow-md hover:shadow-lg',
        interactive: 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:translate-y-0',
        gradient: 'bg-gradient-to-br from-background to-muted border-border/50',
      },
      size: {
        sm: 'p-3 sm:p-4',
        default: 'p-4 sm:p-6',
        lg: 'p-6 sm:p-8',
        xl: 'p-8 sm:p-10',
      },
      responsive: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      {
        responsive: true,
        size: 'sm',
        class: 'p-3 sm:p-4',
      },
      {
        responsive: true,
        size: 'default',
        class: 'p-4 sm:p-6',
      },
      {
        responsive: true,
        size: 'lg',
        class: 'p-6 sm:p-8',
      },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'default',
      responsive: true,
    },
  }
);

export interface ResponsiveCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof responsiveCardVariants> {
  asChild?: boolean;
  loading?: boolean;
  fullHeight?: boolean;
}

const ResponsiveCard = forwardRef<HTMLDivElement, ResponsiveCardProps>(
  (
    {
      className,
      variant,
      size,
      responsive = true,
      loading = false,
      fullHeight = false,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          responsiveCardVariants({ variant, size, responsive }),
          fullHeight && 'h-full',
          loading && 'animate-pulse',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ResponsiveCard.displayName = 'ResponsiveCard';

const ResponsiveCardHeader = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { spacing?: 'sm' | 'default' | 'lg' }
>(({ className, spacing = 'default', ...props }, ref) => {
  const spacingClasses = {
    sm: 'space-y-1',
    default: 'space-y-1.5 sm:space-y-2',
    lg: 'space-y-2 sm:space-y-3',
  };

  return (
    <div
      ref={ref}
      className={cn('flex flex-col', spacingClasses[spacing], className)}
      {...props}
    />
  );
});
ResponsiveCardHeader.displayName = 'ResponsiveCardHeader';

const ResponsiveCardTitle = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & { level?: 1 | 2 | 3 | 4 | 5 | 6 }
>(({ className, level = 3, children, ...props }, ref) => {
  const levelClasses = {
    1: 'text-2xl sm:text-3xl lg:text-4xl',
    2: 'text-xl sm:text-2xl lg:text-3xl',
    3: 'text-lg sm:text-xl lg:text-2xl',
    4: 'text-base sm:text-lg',
    5: 'text-sm sm:text-base',
    6: 'text-xs sm:text-sm',
  };

  const baseClassName = cn(
    'font-semibold leading-none tracking-tight',
    levelClasses[level],
    className
  );

  switch (level) {
    case 1:
      return <h1 ref={ref} className={baseClassName} {...props}>{children}</h1>;
    case 2:
      return <h2 ref={ref} className={baseClassName} {...props}>{children}</h2>;
    case 3:
      return <h3 ref={ref} className={baseClassName} {...props}>{children}</h3>;
    case 4:
      return <h4 ref={ref} className={baseClassName} {...props}>{children}</h4>;
    case 5:
      return <h5 ref={ref} className={baseClassName} {...props}>{children}</h5>;
    case 6:
      return <h6 ref={ref} className={baseClassName} {...props}>{children}</h6>;
    default:
      return <h3 ref={ref} className={baseClassName} {...props}>{children}</h3>;
  }
});
ResponsiveCardTitle.displayName = 'ResponsiveCardTitle';

const ResponsiveCardDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm sm:text-base text-muted-foreground leading-relaxed', className)}
    {...props}
  />
));
ResponsiveCardDescription.displayName = 'ResponsiveCardDescription';

const ResponsiveCardContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { spacing?: 'sm' | 'default' | 'lg' }
>(({ className, spacing = 'default', ...props }, ref) => {
  const spacingClasses = {
    sm: 'pt-2 sm:pt-3',
    default: 'pt-4 sm:pt-6',
    lg: 'pt-6 sm:pt-8',
  };

  return (
    <div 
      ref={ref} 
      className={cn(spacingClasses[spacing], className)} 
      {...props} 
    />
  );
});
ResponsiveCardContent.displayName = 'ResponsiveCardContent';

const ResponsiveCardFooter = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { spacing?: 'sm' | 'default' | 'lg' }
>(({ className, spacing = 'default', ...props }, ref) => {
  const spacingClasses = {
    sm: 'pt-2 sm:pt-3',
    default: 'pt-4 sm:pt-6',
    lg: 'pt-6 sm:pt-8',
  };

  return (
    <div
      ref={ref}
      className={cn('flex items-center', spacingClasses[spacing], className)}
      {...props}
    />
  );
});
ResponsiveCardFooter.displayName = 'ResponsiveCardFooter';

export {
  ResponsiveCard,
  ResponsiveCardHeader,
  ResponsiveCardFooter,
  ResponsiveCardTitle,
  ResponsiveCardDescription,
  ResponsiveCardContent,
};
