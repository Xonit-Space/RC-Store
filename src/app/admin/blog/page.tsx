"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { getBlogPosts, deleteBlogPost } from "@/actions/blog"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2, Eye } from "lucide-react"
import { toast } from "sonner"
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog"

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchPosts = async () => {
    setLoading(true)
    const res = await getBlogPosts()
    if (res.success && res.data) {
      setPosts(res.data)
    } else {
      toast.error(res.error || "Failed to load posts")
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  const confirmDelete = async () => {
    if (!deleteId) return
    const id = deleteId
    setDeleteId(null)
    const res = await deleteBlogPost(id)
    if (res.success) {
      toast.success("Post deleted")
      fetchPosts()
    } else {
      toast.error(res.error || "Failed to delete post")
    }
  }

  return (
    <div className="space-y-8 font-sans">
      <div className="flex justify-between items-end pb-6 border-b border-border/40">
        <div>
          <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-1">
            Content
          </p>
          <h2 className="font-sans text-3xl font-light text-foreground leading-none">
            Blog Posts
          </h2>
        </div>
        <Link href="/admin/blog/new">
          <Button className="rounded-none bg-primary text-primary-foreground font-bold uppercase tracking-widest text-xs hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4 mr-2" /> New Post
          </Button>
        </Link>
      </div>

      <div className="bg-white dark:bg-background border border-border/40 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] transition-all duration-300 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/5 border-b border-border/40 text-[10px] uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="p-4 font-bold">Title</th>
              <th className="p-4 font-bold">Category</th>
              <th className="p-4 font-bold">Status</th>
              <th className="p-4 font-bold">Date</th>
              <th className="p-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground uppercase tracking-widest text-xs">
                  Loading...
                </td>
              </tr>
            ) : posts.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground uppercase tracking-widest text-xs">
                  No posts found.
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={post.id} className="border-b border-border/20 transition-colors">
                  <td className="p-4 font-medium text-foreground">{post.title}</td>
                  <td className="p-4 text-muted-foreground">{post.category?.name || "Uncategorized"}</td>
                  <td className="p-4">
                    <span className={`text-[9px] uppercase tracking-widest px-2 py-1 font-bold border ${post.published ? "bg-forest/10 text-forest border-forest/20" : "bg-racing-yellow/10 text-primary border-racing-yellow/20"}`}>
                      {post.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {new Date(post.createdAt).toLocaleDateString("en-US")}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {post.published && (
                      <Link href={`/blog/${post.slug}`} target="_blank">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                    )}
                    <Link href={`/admin/blog/${post.id}/edit`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(post.id)} className="h-8 w-8 text-muted-foreground hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post?</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete this post? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
