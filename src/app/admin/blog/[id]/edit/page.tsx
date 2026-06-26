"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { updateBlogPost, getBlogCategories, createBlogCategory, getBlogPostById } from "@/actions/blog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function EditBlogPostPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [categories, setCategories] = useState<any[]>([])
  
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [content, setContent] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [published, setPublished] = useState(false)
  const [newCatName, setNewCatName] = useState("")

  useEffect(() => {
    async function loadData() {
      setFetching(true)
      const [catsRes, postRes] = await Promise.all([
        getBlogCategories(),
        getBlogPostById(params.id)
      ])

      if (catsRes.success && catsRes.data) {
        setCategories(catsRes.data)
      }

      if (postRes.success && postRes.data) {
        const p = postRes.data
        setTitle(p.title)
        setSlug(p.slug)
        setContent(p.content)
        setCategoryId(p.categoryId)
        setPublished(p.published)
      } else {
        toast.error("Failed to load post")
      }
      setFetching(false)
    }
    loadData()
  }, [params.id])

  const handleTitleChange = (val: string) => {
    setTitle(val)
  }

  const handleAddCategory = async () => {
    if (!newCatName) return
    const catSlug = newCatName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")
    const res = await createBlogCategory(newCatName, catSlug)
    if (res.success && res.data) {
      setCategories([...categories, res.data])
      setCategoryId(res.data.id)
      setNewCatName("")
      toast.success("Category added")
    } else {
      toast.error("Failed to add category")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!categoryId) return toast.error("Please select or create a category")
    
    setLoading(true)
    const res = await updateBlogPost(params.id, {
      title,
      slug,
      content,
      categoryId,
      published
    })

    if (res.success) {
      toast.success("Blog post updated")
      router.push("/admin/blog")
    } else {
      toast.error(res.error)
    }
    setLoading(false)
  }

  if (fetching) {
    return <div className="p-8 text-center text-muted-foreground uppercase tracking-widest text-xs">Loading post...</div>
  }

  return (
    <div className="max-w-4xl space-y-8 font-sans">
      <div className="flex items-center gap-4 pb-6 border-b border-border/40">
        <Link href="/admin/blog">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground border border-border/40">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h2 className="font-sans text-3xl font-light text-foreground leading-none">
            Edit Blog Post
          </h2>
        </div>
      </div>

      <div className="border border-border/40 bg-background p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Post Title</label>
            <Input 
              required
              value={title}
              onChange={e => handleTitleChange(e.target.value)}
              className="h-12 bg-transparent border-border/60 rounded-none focus-visible:ring-0 focus-visible:border-foreground"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">URL Slug</label>
            <Input 
              required
              value={slug}
              onChange={e => setSlug(e.target.value)}
              className="h-12 bg-transparent border-border/60 rounded-none focus-visible:ring-0 focus-visible:border-foreground font-mono"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Category</label>
            <div className="flex gap-4">
              <select 
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="flex-1 h-12 bg-transparent border border-border/60 rounded-none focus-visible:ring-0 focus-visible:border-foreground px-3 text-sm outline-none text-foreground"
                required
              >
                <option value="" disabled>Select a category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 mt-2">
              <Input 
                placeholder="New Category Name"
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                className="h-10 bg-transparent border-border/60 rounded-none focus-visible:ring-0 focus-visible:border-foreground text-sm flex-1"
              />
              <Button type="button" onClick={handleAddCategory} className="h-10 rounded-none border border-border/60 bg-muted/10 hover:bg-muted/20 text-xs uppercase tracking-widest font-bold">
                Add
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Content (Markdown/HTML)</label>
            <textarea
              required
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full h-64 bg-transparent border border-border/60 rounded-none focus-visible:ring-0 focus-visible:border-foreground p-4 text-sm font-mono outline-none resize-y text-foreground"
            />
          </div>

          <div className="flex items-center justify-between p-4 border border-border/40 bg-muted/5">
            <div>
              <p className="text-sm font-bold text-foreground">Publish Status</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Make visible to public immediately</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={published} onChange={e => setPublished(e.target.checked)} />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-racing-yellow"></div>
            </label>
          </div>

          <div className="pt-4 border-t border-border/40 flex justify-end">
            <Button 
              type="submit" 
              disabled={loading}
              className="h-12 rounded-none bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest px-8 hover:bg-primary/90 transition-colors"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
