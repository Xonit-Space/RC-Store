"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useCartStore } from "@/store/cart"
import { signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export function Header() {
  const { data: session } = useSession()
  const router = useRouter()
  const cartStore = useCartStore()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  const cartCount = cartStore.getItemCount()

  useEffect(() => {
    useCartStore.persist.rehydrate()
    setMounted(true)
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?query=${encodeURIComponent(searchQuery)}`)
      setIsSearchOpen(false)
      setSearchQuery("")
    }
  }

  const accountUrl = session
    ? (session.user.role as string) === "SUPER_ADMIN" || (session.user.role as string) === "ADMIN"
      ? "/admin"
      : (session.user.role as string) === "STAFF"
        ? "/admin/pos"
        : "/customer"
    : "/login"

  return (
    <header className={`fixed top-0 z-50 w-full transition-all duration-500 ${scrolled ? "bg-background/90 backdrop-blur-md border-b border-border/50 py-2" : "bg-transparent py-4"}`}>
      <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
        
        {/* Left: Hamburger & Navigation */}
        <div className="flex items-center space-x-8 flex-1">
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <Menu strokeWidth={1} className="h-6 w-6 text-foreground" />
          </button>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/products" className="text-[11px] font-medium tracking-[0.2em] uppercase hover:text-accent transition-colors">
              Shop
            </Link>
            <Link href="/collections" className="text-[11px] font-medium tracking-[0.2em] uppercase hover:text-accent transition-colors">
              Collections
            </Link>
            <Link href="/campaigns" className="text-[11px] font-medium tracking-[0.2em] uppercase hover:text-accent transition-colors">
              Campaigns
            </Link>
            {session && (session.user.role === "SUPER_ADMIN" || session.user.role === "ADMIN") && (
              <Link href="/admin" className="text-[11px] font-medium tracking-[0.2em] uppercase text-accent hover:text-foreground transition-colors">
                Admin
              </Link>
            )}
          </nav>
        </div>

        {/* Center: Brand Name (Editorial Serif) */}
        <div className="flex-1 flex justify-center">
          <Link href="/" className="font-serif text-2xl md:text-3xl tracking-widest text-foreground">
            NEOSHOP
          </Link>
        </div>

        {/* Right: Actions (Text-led) */}
        <div className="flex items-center justify-end space-x-6 md:space-x-8 flex-1">
          <div className="hidden md:block">
            <ThemeToggle />
          </div>

          <Link href={accountUrl} className="hidden md:block text-[11px] font-medium tracking-[0.2em] uppercase hover:text-accent transition-colors">
            Account
          </Link>

          {session && (
            <button 
              onClick={() => signOut({ callbackUrl: '/' })}
              className="hidden md:block text-[11px] font-medium tracking-[0.2em] uppercase text-red-500 hover:text-red-700 transition-colors"
            >
              Sign Out
            </button>
          )}

          <button 
            onClick={() => setIsSearchOpen(true)}
            className="hidden md:block text-[11px] font-medium tracking-[0.2em] uppercase hover:text-accent transition-colors"
          >
            Search
          </button>

          <Link href="/cart" className="text-[11px] font-medium tracking-[0.2em] uppercase hover:text-accent transition-colors">
            Cart {mounted && cartCount > 0 ? `(${cartCount})` : null}
          </Link>
        </div>
      </div>

      {/* Mobile Fullscreen Menu overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-300">
          <button className="absolute top-6 left-6" onClick={() => setIsMenuOpen(false)}>
            <X strokeWidth={1} className="h-8 w-8 text-foreground" />
          </button>
          
          <Link href="/products" onClick={() => setIsMenuOpen(false)} className="font-serif text-4xl tracking-widest hover:text-accent transition-colors">
            SHOP
          </Link>
          <Link href="/collections" onClick={() => setIsMenuOpen(false)} className="font-serif text-4xl tracking-widest hover:text-accent transition-colors">
            COLLECTIONS
          </Link>
          <Link href={accountUrl} onClick={() => setIsMenuOpen(false)} className="font-serif text-4xl tracking-widest hover:text-accent transition-colors">
            ACCOUNT
          </Link>
          {session && (
            <button onClick={() => { signOut({ callbackUrl: '/' }); setIsMenuOpen(false); }} className="font-serif text-4xl tracking-widest text-red-500 hover:text-red-700 transition-colors mt-8">
              SIGN OUT
            </button>
          )}
        </div>
      )}

      {/* Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-start pt-32 px-6 animate-in fade-in duration-300">
          <button className="absolute top-6 right-6 md:right-12" onClick={() => setIsSearchOpen(false)}>
            <X strokeWidth={1} className="h-8 w-8 text-foreground" />
          </button>
          <form onSubmit={handleSearch} className="w-full max-w-2xl relative">
            <input 
              type="text" 
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search catalog..." 
              className="w-full bg-transparent border-b border-foreground text-2xl md:text-4xl font-serif text-foreground pb-4 outline-none placeholder:text-muted-foreground/50"
            />
            <button type="submit" className="absolute right-0 top-1/2 -translate-y-1/2 text-[11px] font-medium tracking-[0.2em] uppercase hover:text-accent transition-colors">
              Enter
            </button>
          </form>
        </div>
      )}
    </header>
  )
}
