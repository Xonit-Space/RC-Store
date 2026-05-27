import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import Image from "next/image"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Header />
      <main className="flex-1 pt-24 pb-24">
        {/* Hero Section */}
        <section className="px-6 md:px-12 lg:px-24 mb-24 max-w-[1400px] mx-auto">
          <div className="max-w-3xl space-y-8">
            <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">Our Story</p>
            <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-light text-foreground leading-[1.1] tracking-tight">
              Redefining luxury through architectural minimalism.
            </h1>
          </div>
        </section>

        {/* Editorial Image */}
        <section className="w-full h-[60vh] md:h-[80vh] relative mb-24">
          <div className="absolute inset-0 bg-muted/20" />
          <Image 
            src="/placeholder.svg" 
            alt="NeoShop Ultra Atelier" 
            fill 
            className="object-cover object-center grayscale opacity-80"
          />
        </section>

        {/* Content Section */}
        <section className="px-6 md:px-12 lg:px-24 max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-24">
          <div className="md:col-span-5 space-y-6">
            <h2 className="font-serif text-3xl md:text-4xl font-light text-foreground">
              The Foundation
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Founded in 2026, NeoShop Ultra emerged from a desire to strip away the excess of modern fashion and focus entirely on silhouette, material, and construction.
            </p>
          </div>
          <div className="md:col-span-7 space-y-6 md:mt-32">
            <h2 className="font-serif text-3xl md:text-4xl font-light text-foreground">
              Our Philosophy
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We believe that true luxury is quiet. It doesn't shout. It is felt in the weight of a brass zipper, the drape of heavy organic cotton, and the precision of a hidden seam. Every piece in our collection is an exploration of form and function, designed to endure rather than follow seasonal trends.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Our atelier operates on principles of absolute transparency and uncompromising quality. We source our materials from historic mills and work with artisans who share our obsession with detail.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
