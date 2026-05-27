import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import Image from "next/image"

export default function CampaignsPage() {
  const campaigns = [
    {
      title: "The Architecture of Cloth",
      season: "AW26",
      image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop",
      description: "An exploration of structured forms and heavyweight fabrics designed to protect and endure."
    },
    {
      title: "Silent Movement",
      season: "SS26",
      image: "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071&auto=format&fit=crop",
      description: "Fluidity in motion. A capsule of lightweight, breathable layers for the transitional months."
    }
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Header />
      <main className="flex-1 pt-32 pb-24">
        <div className="px-6 md:px-12 lg:px-24 max-w-[1400px] mx-auto w-full mb-16">
          <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-4">Lookbooks</p>
          <h1 className="font-serif text-4xl md:text-5xl font-light text-foreground">Campaigns</h1>
        </div>

        <div className="space-y-32">
          {campaigns.map((campaign, index) => (
            <section key={index} className="w-full">
              <div className="px-6 md:px-12 lg:px-24 max-w-[1400px] mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 items-center">
                <div className={`md:col-span-7 ${index % 2 !== 0 ? 'md:order-2' : ''}`}>
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted/20">
                    <Image
                      src={campaign.image}
                      alt={campaign.title}
                      fill
                      className="object-cover object-center grayscale opacity-80"
                    />
                  </div>
                </div>
                <div className={`md:col-span-5 space-y-6 ${index % 2 !== 0 ? 'md:order-1' : ''}`}>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-accent font-bold">
                    {campaign.season}
                  </p>
                  <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-light text-foreground leading-tight">
                    {campaign.title}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {campaign.description}
                  </p>
                  <div className="pt-8">
                    <button className="text-[10px] tracking-[0.2em] uppercase font-bold border-b border-foreground text-foreground hover:text-accent hover:border-accent transition-colors pb-1">
                      Explore Campaign
                    </button>
                  </div>
                </div>
              </div>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
