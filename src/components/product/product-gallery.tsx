"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react"

interface ProductGalleryProps {
  images: string[]
  productName: string
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [isZooming, setIsZooming] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 })
  
  const displayImages = images?.length > 0 ? images : ["/placeholder.svg"]

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setActiveIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1))
  }

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setActiveIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1))
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZooming) return
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - left) / width) * 100
    const y = ((e.clientY - top) / height) * 100
    setMousePos({ x, y })
  }

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!isLightboxOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextImage()
      if (e.key === "ArrowLeft") prevImage()
      if (e.key === "Escape") setIsLightboxOpen(false)
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isLightboxOpen, activeIndex])

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4 w-full">
      {/* Thumbnails (Bottom on mobile, Left on desktop) */}
      <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto no-scrollbar md:w-24 md:max-h-[600px] py-2 md:py-0 px-1">
        {displayImages.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className={`relative flex-shrink-0 w-20 h-20 md:w-full md:h-24 border-2 transition-all overflow-hidden ${
              activeIndex === idx ? "border-primary" : "border-border/40 hover:border-foreground/40"
            }`}
          >
            <Image
              src={img}
              alt={`${productName} thumbnail ${idx + 1}`}
              fill
              sizes="96px"
              className="object-cover"
            />
          </button>
        ))}
      </div>

      {/* Main Image */}
      <div 
        className="relative flex-1 aspect-square md:aspect-auto md:min-h-[600px] bg-muted overflow-hidden group cursor-zoom-in border border-border/40"
        onClick={() => setIsLightboxOpen(true)}
        onMouseEnter={() => setIsZooming(true)}
        onMouseLeave={() => { setIsZooming(false); setMousePos({ x: 50, y: 50 }) }}
        onMouseMove={handleMouseMove}
      >
        <Image
          src={displayImages[activeIndex]}
          alt={`${productName} main image`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className={`object-cover transition-transform duration-200 ${isZooming ? "scale-[2]" : "scale-100"}`}
          style={isZooming ? { transformOrigin: `${mousePos.x}% ${mousePos.y}%` } : undefined}
        />

        {/* Hover Hint */}
        <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm p-2 text-foreground opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 text-xs font-bold tracking-widest uppercase">
          <ZoomIn className="w-4 h-4" /> Expand
        </div>

        {/* Navigation Arrows */}
        {displayImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 hover:bg-primary hover:text-primary-foreground backdrop-blur-sm flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 hover:bg-primary hover:text-primary-foreground backdrop-blur-sm flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Fullscreen Lightbox */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-12">
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 p-4 text-muted-foreground hover:text-foreground transition-colors z-50"
          >
            <X className="w-8 h-8" />
          </button>
          
          <div className="relative w-full h-full max-w-6xl max-h-[90vh]">
            <Image
              src={displayImages[activeIndex]}
              alt={`${productName} lightbox view`}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>

          {displayImages.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 md:left-12 top-1/2 -translate-y-1/2 p-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="w-10 h-10" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 md:right-12 top-1/2 -translate-y-1/2 p-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronRight className="w-10 h-10" />
              </button>
              
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs font-mono tracking-widest text-muted-foreground uppercase">
                {activeIndex + 1} / {displayImages.length}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
