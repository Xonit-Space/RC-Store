"use client"

import { useState, useEffect } from "react"
import { Instagram } from "lucide-react"
import { getGalleryImages } from "@/actions/landing-page"
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"

export function CustomerGallery() {
  const [images, setImages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [api, setApi] = useState<CarouselApi>()
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    getGalleryImages().then((data) => {
      setImages(data)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!api) return

    setCurrentIndex(api.selectedScrollSnap())

    api.on("select", () => {
      setCurrentIndex(api.selectedScrollSnap())
    })
  }, [api])

  if (loading) {
    return (
      <section className="bg-muted py-24 border-t border-border">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex gap-4 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="min-w-[280px] h-[280px] bg-background animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (!images.length) return null

  return (
    <section className="bg-muted py-24 border-t border-border overflow-hidden">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col items-center text-center mb-16">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-primary">In The Wild</p>
          </div>
          <h2 className="font-heading font-black text-4xl text-foreground uppercase tracking-wider mb-4">
            Customer Gallery
          </h2>
          <p className="text-muted-foreground flex items-center gap-2">
            Tag us <span className="font-mono text-foreground">@RCStoreOfficial</span> to be featured
          </p>
        </div>

        {/* Gallery Carousel */}
        <div className="relative -mx-6 md:-mx-12 px-6 md:px-12 pb-8">
          <Carousel
            opts={{
              align: "center",
              loop: true,
            }}
            plugins={[
              Autoplay({
                delay: 2500,
                stopOnInteraction: false,
                stopOnMouseEnter: true,
              }),
            ]}
            setApi={setApi}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {images.map((img, index) => {
                const isActive = index === currentIndex

                return (
                  <CarouselItem key={img.id} className="pl-4 basis-[280px] sm:basis-[320px]">
                    <div className={`relative group w-full aspect-square bg-background overflow-hidden border transition-colors duration-300 ${isActive ? 'border-racing-yellow/50' : 'border-border hover:border-racing-yellow/30'}`}>
                      <img 
                        src={img.imageUrl} 
                        alt={img.caption || "Customer Gallery Image"} 
                        className={`w-full h-full object-cover transition-all duration-700 ${isActive ? 'grayscale-0 scale-110' : 'grayscale group-hover:grayscale-0 group-hover:scale-110'}`}
                      />
                      
                      {/* Overlay */}
                      <div className={`absolute inset-0 bg-gradient-to-t from-carbon-dark via-carbon-dark/20 to-transparent flex flex-col justify-end p-6 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Instagram className="w-4 h-4 text-foreground" />
                            <span className="font-mono text-xs font-bold text-foreground">{img.authorName}</span>
                          </div>
                        </div>
                        {img.caption && (
                          <p className="text-sm text-white/80 line-clamp-2">
                            {img.caption}
                          </p>
                        )}
                      </div>
                    </div>
                  </CarouselItem>
                )
              })}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </section>
  )
}
