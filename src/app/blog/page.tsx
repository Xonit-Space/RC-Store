import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import Link from "next/link"
import { BookOpen } from "lucide-react"

export const metadata = {
  title: "Blog | RC Store",
  description: "RC car tips, build guides, race reports, and the latest news from the RC hobby community.",
}

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-center text-center px-6 py-24">
        <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-8">
          <BookOpen className="w-10 h-10 text-racing-yellow" />
        </div>
        <h1 className="font-heading font-black text-4xl md:text-5xl text-white uppercase tracking-widest mb-4">
          RC Blog
        </h1>
        <p className="text-muted-foreground text-base max-w-md mb-8 leading-relaxed">
          Build guides, race reports, tuning tips, and community stories — coming soon. Be the first to know when we launch.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/products"
            className="bg-racing-yellow text-carbon-dark font-heading font-black uppercase tracking-widest px-8 py-3 text-sm hover:bg-racing-yellow/90 transition-colors"
          >
            Shop Now
          </Link>
          <Link
            href="/faq"
            className="bg-white/5 border border-white/10 text-white font-heading font-black uppercase tracking-widest px-8 py-3 text-sm hover:bg-white/10 transition-colors"
          >
            Visit FAQ
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
