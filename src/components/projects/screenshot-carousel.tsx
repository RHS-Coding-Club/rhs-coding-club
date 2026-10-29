import { ClientOnly } from '@tanstack/react-router'
import Carousel from '#/components/bits/Carousel'
import { fileUrl } from '#/lib/files'
import { useIsDark } from '#/hooks/use-is-dark'

/**
 * Project screenshots on React Bits Carousel: drag or use the arrows, with a
 * slide counter. One screenshot renders as a plain framed image.
 */
export function ScreenshotCarousel({
  title,
  imageKeys,
  initialDark,
}: {
  title: string
  imageKeys: string[]
  initialDark: boolean
}) {
  const dark = useIsDark(initialDark)
  const items = imageKeys.map((key, i) => ({
    id: key,
    image: fileUrl(key),
    alt: `${title}, screenshot ${i + 1} of ${imageKeys.length}`,
  }))

  const still = (
    <div className="bg-muted relative aspect-[16/10] overflow-hidden rounded-4xl">
      <img
        src={items[0]?.image}
        alt={items[0]?.alt ?? ''}
        className="absolute inset-0 size-full object-cover"
      />
    </div>
  )
  if (items.length === 1) return still

  return (
    <ClientOnly fallback={still}>
      <Carousel
        items={items}
        baseWidth={1152}
        aspectRatio={16 / 10}
        radius={24}
        gap={20}
        peek={0}
        effect="slide"
        indicator="counter"
        arrows
        loop
        theme={dark ? 'dark' : 'light'}
        className="mx-auto"
      />
    </ClientOnly>
  )
}
