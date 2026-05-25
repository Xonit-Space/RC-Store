"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Sparkles, Zap, Shield } from "lucide-react"

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    {
      title: "AI-Powered Shopping Experience",
      subtitle: "Discover products tailored just for you",
      cta: "Shop Now",
      image: "/placeholder.svg?height=600&width=800",
      badge: "New AI Features",
    },
    {
      title: "Lightning Fast Delivery",
      subtitle: "Get your orders delivered in record time",
      cta: "Track Orders",
      image: "/placeholder.svg?height=600&width=800",
      badge: "Same Day Delivery",
    },
    {
      title: "Secure & Trusted Platform",
      subtitle: "Shop with confidence on our secure platform",
      cta: "Learn More",
      image: "/placeholder.svg?height=600&width=800",
      badge: "100% Secure",
    },
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [slides.length])

  const currentSlideData = slides[currentSlide]

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-950 dark:via-background dark:to-purple-950">
      <div className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge className="w-fit" variant="secondary">
                <Sparkles className="w-3 h-3 mr-1" />
                {currentSlideData.badge}
              </Badge>

              <h1 className="text-4xl md:text-6xl font-bold leading-tight">{currentSlideData.title}</h1>

              <p className="text-xl text-muted-foreground max-w-md">{currentSlideData.subtitle}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="group">
                {currentSlideData.cta}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button variant="outline" size="lg">
                Watch Demo
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              <div className="text-center">
                <Zap className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <p className="text-sm font-medium">Lightning Fast</p>
              </div>
              <div className="text-center">
                <Sparkles className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <p className="text-sm font-medium">AI-Powered</p>
              </div>
              <div className="text-center">
                <Shield className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <p className="text-sm font-medium">100% Secure</p>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900">
              <img
                src={currentSlideData.image || "/placeholder.svg"}
                alt="Hero"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Slide Indicators */}
            <div className="flex justify-center space-x-2 mt-6">
              {slides.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentSlide ? "bg-blue-600" : "bg-gray-300"
                  }`}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
