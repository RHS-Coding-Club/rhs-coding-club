'use client';

import { forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { useIsTouchDevice } from '@/hooks/useViewport';

const responsiveButtonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        xl: 'h-12 rounded-md px-10 text-base',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
        'icon-lg': 'h-12 w-12',
      },
      responsive: {
        true: '',
        false: '',
      },
      touchOptimized: {
        true: 'min-h-[44px] min-w-[44px]',
        false: '',
      },
    },
    compoundVariants: [
      {
        responsive: true,
        size: 'default',
        class: 'h-10 px-4 py-2 sm:h-11 sm:px-6 sm:py-3',
      },
      {
        responsive: true,
        size: 'sm',
        class: 'h-8 px-3 py-1 sm:h-9 sm:px-4 sm:py-2',
      },
      {
        responsive: true,
        size: 'lg',
        class: 'h-11 px-6 py-3 sm:h-12 sm:px-8 sm:py-4 text-base',
      },
      {
        responsive: true,
        size: 'xl',
        class: 'h-12 px-8 py-4 sm:h-14 sm:px-10 sm:py-5 text-base sm:text-lg',
      },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'default',
      responsive: false,
      touchOptimized: false,
    },
  }
);

export interface ResponsiveButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof responsiveButtonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
  autoTouchOptimization?: boolean;
}

const ResponsiveButton = forwardRef<HTMLButtonElement, ResponsiveButtonProps>(
  (
    {
      className,
      variant,
      size,
      responsive = true,
      touchOptimized,
      autoTouchOptimization = true,
      asChild = false,
      loading = false,
      loadingText,
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isTouchDevice = useIsTouchDevice();
    const shouldOptimizeForTouch = autoTouchOptimization ? isTouchDevice : touchOptimized;
    
    const Comp = asChild ? Slot : 'button';
    
    return (
      <Comp
        className={cn(
          responsiveButtonVariants({
            variant,
            size,
            responsive,
            touchOptimized: shouldOptimizeForTouch,
          }),
          fullWidth && 'w-full',
          loading && 'cursor-wait',
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        aria-disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {loading ? loadingText || 'Loading...' : children}
      </Comp>
    );
  }
);

ResponsiveButton.displayName = 'ResponsiveButton';

export { ResponsiveButton, responsiveButtonVariants };
