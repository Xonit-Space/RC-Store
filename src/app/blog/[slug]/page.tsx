import { getBlogPostBySlug } from "@/actions/blog"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Calendar, User, ArrowLeft } from "lucide-react"
import { Header } from "@/components/layout/header"

export const dynamic = "force-dynamic"

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const res = await getBlogPostBySlug(params.slug)
  const post = res.success && res.data ? res.data : null

  if (!post) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-black text-white selection:bg-racing-yellow selection:text-carbon-dark">
      <Header />
      
      <article className="pt-32 pb-24 container mx-auto px-6 md:px-12">
        <div className="max-w-3xl mx-auto space-y-12">
          
          <Link href="/blog" className="inline-flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase text-white/50 hover:text-racing-yellow transition-colors">
            <ArrowLeft className="w-3 h-3" /> BACK TO CIRCUIT
          </Link>

          <header className="space-y-6 fade-up-section visible">
            <div className="flex items-center gap-4 text-[10px] font-mono tracking-widest uppercase text-white/50">
              {post.category && (
                <span className="text-racing-yellow border border-racing-yellow/30 px-2 py-0.5">
                  {post.category.name}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {post.author?.name || "Admin"}
              </span>
            </div>
            
            <h1 className="font-heading text-4xl md:text-6xl font-black uppercase tracking-tighter leading-tight">
              {post.title}
            </h1>
          </header>

          <div className="prose prose-invert prose-yellow max-w-none font-sans prose-p:text-white/80 prose-headings:font-heading prose-headings:uppercase prose-headings:tracking-tighter prose-a:text-racing-yellow prose-a:no-underline hover:prose-a:underline">
            {/* 
              A proper markdown/HTML renderer should be used here if it was a real app.
              Using dangerouslySetInnerHTML for the sake of the requirement.
            */}
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>

        </div>
      </article>
    </main>
  )
}
