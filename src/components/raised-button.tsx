import { useLayoutEffect, useRef, useState } from 'react'
import type { ComponentProps, ReactNode } from 'react'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { LoaderCircle } from 'lucide-react'
import { Slot } from 'radix-ui'
import { cn } from '#/lib/utils'

/**
 * The site's button: a raised face (see `.raise` in styles.css) that lights
 * on hover and sinks on press, modeled on Kobra's Button. Primary is sky,
 * secondary is navy, outline sits on the card color, ghost has no face until
 * hovered.
 */
export const raisedButtonVariants = cva(
  "raise inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 font-medium whitespace-nowrap outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:not-aria-busy:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        primary: 'raise-primary',
        secondary: 'raise-secondary',
        outline: 'raise-outline',
        ghost: 'raise-ghost',
      },
      size: {
        sm: 'h-8 gap-1.5 rounded-[9px] px-3 text-sm',
        md: 'h-9 rounded-[10px] px-4 text-sm',
        lg: 'h-11 rounded-xl px-5 text-[15px]',
        xl: "h-12 rounded-[14px] px-6 text-base [&_svg:not([class*='size-'])]:size-[18px]",
        icon: 'size-9 rounded-[10px]',
        'icon-lg': 'size-11 rounded-xl',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

type RaisedButtonProps = ComponentProps<'button'> &
  VariantProps<typeof raisedButtonVariants> & {
    /** Render onto the single child (a router Link or an anchor) instead of a <button>. */
    asChild?: boolean
    /** Swaps the label for a spinner and `loadingText`, and blocks clicks. */
    loading?: boolean
    loadingText?: ReactNode
  }

export function RaisedButton({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  loadingText,
  disabled,
  children,
  ...props
}: RaisedButtonProps) {
  const classes = cn(raisedButtonVariants({ variant, size }), className)

  if (asChild) {
    return (
      <Slot.Root data-slot="button" className={classes} {...props}>
        {children}
      </Slot.Root>
    )
  }

  return (
    <button
      data-slot="button"
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      <SwapLabel state={loading ? 'busy' : 'idle'}>
        {loading ? (
          <>
            <LoaderCircle className="animate-spin" aria-hidden="true" />
            {loadingText ?? children}
          </>
        ) : (
          children
        )}
      </SwapLabel>
    </button>
  )
}

/**
 * Cross-fades the label when it changes (idle to busy and back): the old one
 * blurs out while the new one sharpens in, and the button's width springs to
 * fit the new label.
 */
function SwapLabel({ state, children }: { state: string; children: ReactNode }) {
  const reduced = useReducedMotion()
  const wrapRef = useRef<HTMLSpanElement>(null)
  const [width, setWidth] = useState<number | null>(null)

  // Measure the label for the current state (the one entering or resting);
  // the exiting one is popped out of flow and ignored.
  useLayoutEffect(() => {
    const node = wrapRef.current?.querySelector<HTMLElement>(`[data-swap="${state}"]`)
    if (!node) return
    const read = () => {
      if (node.isConnected && node.offsetWidth > 0) setWidth(node.offsetWidth)
    }
    read()
    const ro = new ResizeObserver(read)
    ro.observe(node)
    return () => ro.disconnect()
  }, [state])

  return (
    <motion.span
      ref={wrapRef}
      className="relative -mx-2 box-content grid grid-cols-1 items-center justify-items-center px-2 [mask-image:linear-gradient(to_right,transparent,black_0.25rem,black_calc(100%-0.25rem),transparent)]"
      initial={false}
      animate={width === null ? undefined : { width }}
      transition={
        reduced ? { duration: 0 } : { type: 'spring', bounce: 0, duration: 0.35 }
      }
    >
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={state}
          data-swap={state}
          className="inline-flex items-center gap-1.5 whitespace-nowrap [grid-area:1/1]"
          initial={{ opacity: 0, filter: 'blur(2px)', x: 4 }}
          animate={{ opacity: 1, filter: 'blur(0px)', x: 0 }}
          exit={{ opacity: 0, filter: 'blur(2px)', x: -4 }}
          transition={{ duration: reduced ? 0 : 0.2, ease: [0.23, 1, 0.32, 1] }}
        >
          {children}
        </motion.span>
      </AnimatePresence>
    </motion.span>
  )
}
