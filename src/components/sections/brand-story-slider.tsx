"use client"

import * as React from "react"
import { Star } from "lucide-react"
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"

export function BrandStorySlider({ reviews }: { reviews: any[] }) {
  const plugin = React.useRef(
    Autoplay({ delay: 3500, stopOnInteraction: true })
  )

  if (!reviews || reviews.length === 0) {
    return null
  }

  return (
    <Carousel
      plugins={[plugin.current]}
      className="w-full"
      opts={{ loop: true }}
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
    >
      <CarouselContent>
        {reviews.map(review => (
          <CarouselItem key={review.id}>
            <div className="glass-dark p-6 border border-border hover:border-racing-yellow/40 transition-colors h-full flex flex-col justify-between">
              <div>
                <div className="flex gap-1 mb-3 text-primary">
                  {[...Array(review.rating || 5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-muted-foreground font-sans text-sm leading-relaxed mb-6">
                  &quot;{review.comment || "Great product!"}&quot;
                </p>
              </div>
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                PILOT // {review.user?.name || review.user?.email || "Anonymous"}
              </p>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  )
}
