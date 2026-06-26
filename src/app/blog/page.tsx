import Link from "next/link"
import { getPublishedBlogPosts } from "@/actions/blog"
import { Calendar, User, ChevronRight } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function BlogIndexPage() {
  const res = await getPublishedBlogPosts()
  const posts = res.success && res.data ? res.data : []

  return (
    <main className="min-h-screen bg-black text-white selection:bg-racing-yellow selection:text-carbon-dark">
            <div className="pt-32 pb-24 container mx-auto px-6 md:px-12">
        <div className="max-w-4xl mx-auto space-y-16">
          
          <div className="text-center space-y-6 fade-up-section visible">
            <p className="text-[10px] tracking-[0.4em] uppercase text-racing-yellow font-mono font-bold">
              KNOWLEDGE BASE // FIELD NOTES
            </p>
            <h1 className="font-heading text-5xl md:text-7xl font-black uppercase tracking-tighter drop-shadow-[0_0_15px_rgba(255,204,0,0.1)]">
              The <span className="text-racing-yellow">Circuit</span>
            </h1>
            <p className="text-sm font-mono text-white/50 tracking-widest uppercase max-w-2xl mx-auto">
              LATEST UPDATES, TECHNICAL GUIDES, AND NEWS FROM THE RC ARENA.
            </p>
          </div>

          <div className="grid gap-8">
            {posts.length === 0 ? (
              <div className="text-center p-16 border border-white/10 bg-carbon-dark/50">
                <p className="text-sm font-mono text-white/50 tracking-widest uppercase">
                  NO TRANSMISSIONS DETECTED.
                </p>
              </div>
            ) : (
              posts.map((post: any, idx: number) => (
                <div key={post.id} className={`fade-up-section visible group relative border border-white/10 bg-carbon-dark hover:border-racing-yellow/50 transition-colors p-8 md:p-10`} style={{ transitionDelay: `${idx * 100}ms` }}>
                  <div className="absolute top-0 left-0 w-1 h-full bg-racing-yellow/0 group-hover:bg-racing-yellow transition-colors" />
                  
                  <div className="flex flex-col md:flex-row gap-8 justify-between">
                    <div className="space-y-4 flex-1">
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
                      </div>
                      
                      <Link href={`/blog/${post.slug}`} className="block group-hover:text-racing-yellow transition-colors">
                        <h2 className="font-heading text-3xl md:text-4xl font-black uppercase tracking-tighter leading-none mb-4">
                          {post.title}
                        </h2>
                      </Link>
                      
                      {post.excerpt && (
                        <p className="text-white/70 font-sans leading-relaxed">
                          {post.excerpt}
                        </p>
                      )}
                      
                      {/* Extract some content if no excerpt */}
                      {!post.excerpt && (
                        <p className="text-white/70 font-sans leading-relaxed line-clamp-3">
                          {post.content.replace(/<[^>]+>/g, '')}
                        </p>
                      )}
                    </div>
                    
                    <div className="md:w-48 shrink-0 flex flex-col justify-between items-start md:items-end border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-6">
                      <div className="flex items-center gap-2 mb-6 md:mb-0">
                        <div className="h-8 w-8 bg-white/5 border border-white/10 flex items-center justify-center">
                          <User className="w-4 h-4 text-white/50" />
                        </div>
                        <div className="text-left md:text-right">
                          <p className="text-[10px] font-mono text-white/30 tracking-widest uppercase">Author</p>
                          <p className="text-[10px] font-mono text-white/80 tracking-widest uppercase">{post.author?.name || "Admin"}</p>
                        </div>
                      </div>
                      
                      <Link href={`/blog/${post.slug}`} className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest uppercase text-racing-yellow hover:text-neon-yellow transition-colors">
                        READ MORE <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
