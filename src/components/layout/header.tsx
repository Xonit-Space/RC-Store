"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X, Terminal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useCartStore } from "@/store/cart"
import { signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useDebounce } from "@/hooks/use-debounce"

export function Header() {
  const { data: session } = useSession()
  const router = useRouter()
  const cartStore = useCartStore()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  // Phase 4: Debounce the search input to prevent API spam
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

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

  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      router.push(`/products?query=${encodeURIComponent(debouncedSearchQuery)}`)
    }
  }, [debouncedSearchQuery, router])

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
    <header className={`fixed top-0 z-50 w-full transition-all duration-500 ${scrolled ? "glass-dark border-b border-racing-red/40 py-2 shadow-[0_0_20px_rgba(255,30,30,0.1)]" : "bg-transparent py-4"}`}>
      <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
        
        {/* Left: Hamburger & Navigation */}
        <div className="flex items-center space-x-8 flex-1">
          <button className="md:hidden text-white hover:text-racing-red transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <Menu strokeWidth={2} className="h-6 w-6" />
          </button>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/products" className="text-[11px] font-mono font-bold tracking-[0.2em] uppercase text-gray-300 hover:text-racing-red hover:drop-shadow-[0_0_8px_rgba(255,30,30,0.8)] transition-all">
              Garage
            </Link>
            <Link href="/collections" className="text-[11px] font-mono font-bold tracking-[0.2em] uppercase text-gray-300 hover:text-racing-red hover:drop-shadow-[0_0_8px_rgba(255,30,30,0.8)] transition-all">
              Ecosystem
            </Link>
            <Link href="/campaigns" className="text-[11px] font-mono font-bold tracking-[0.2em] uppercase text-gray-300 hover:text-racing-red hover:drop-shadow-[0_0_8px_rgba(255,30,30,0.8)] transition-all">
              Pro League
            </Link>
            {session && (session.user.role === "SUPER_ADMIN" || session.user.role === "ADMIN") && (
              <Link href="/admin" className="text-[11px] font-mono font-bold tracking-[0.2em] uppercase text-racing-red hover:text-white transition-colors">
                Control Center
              </Link>
            )}
          </nav>
        </div>

        {/* Center: Brand Name */}
        <div className="flex-1 flex justify-center">
          <Link href="/" className="font-heading font-black text-2xl md:text-3xl tracking-widest text-white uppercase drop-shadow-[0_0_10px_rgba(255,30,30,0.5)]">
            NEOSHOP <span className="text-racing-red">ULTRA</span>
          </Link>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center justify-end space-x-6 md:space-x-8 flex-1">
          <div className="hidden md:block">
            <ThemeToggle />
          </div>

          <Link href={accountUrl} className="hidden md:block text-[11px] font-mono font-bold tracking-[0.2em] uppercase text-gray-300 hover:text-racing-red hover:drop-shadow-[0_0_8px_rgba(255,30,30,0.8)] transition-all">
            Driver ID
          </Link>

          {session && (
            <button 
              onClick={() => signOut({ callbackUrl: '/' })}
              className="hidden md:block text-[11px] font-mono font-bold tracking-[0.2em] uppercase text-red-500 hover:text-red-400 hover:drop-shadow-[0_0_8px_rgba(255,30,30,0.8)] transition-all"
            >
              Disconnect
            </button>
          )}

          <button 
            onClick={() => setIsSearchOpen(true)}
            className="hidden md:block text-[11px] font-mono font-bold tracking-[0.2em] uppercase text-gray-300 hover:text-racing-red hover:drop-shadow-[0_0_8px_rgba(255,30,30,0.8)] transition-all"
          >
            Scanner
          </button>

          <Link href="/cart" className="text-[11px] font-mono font-bold tracking-[0.2em] uppercase text-gray-300 hover:text-racing-red hover:drop-shadow-[0_0_8px_rgba(255,30,30,0.8)] transition-all">
            Bay {mounted && cartCount > 0 ? <span className="text-racing-red">({cartCount})</span> : null}
          </Link>
        </div>
      </div>

      {/* Mobile Fullscreen Menu overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 glass-dark flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-300">
          <button className="absolute top-6 left-6 text-white hover:text-racing-red transition-colors" onClick={() => setIsMenuOpen(false)}>
            <X strokeWidth={2} className="h-8 w-8" />
          </button>
          
          <Link href="/products" onClick={() => setIsMenuOpen(false)} className="font-heading font-black uppercase text-4xl tracking-widest text-white hover:text-racing-red transition-colors">
            GARAGE
          </Link>
          <Link href="/collections" onClick={() => setIsMenuOpen(false)} className="font-heading font-black uppercase text-4xl tracking-widest text-white hover:text-racing-red transition-colors">
            ECOSYSTEM
          </Link>
          <Link href={accountUrl} onClick={() => setIsMenuOpen(false)} className="font-heading font-black uppercase text-4xl tracking-widest text-white hover:text-racing-red transition-colors">
            DRIVER ID
          </Link>
          {session && (
            <button onClick={() => { signOut({ callbackUrl: '/' }); setIsMenuOpen(false); }} className="font-heading font-black uppercase text-4xl tracking-widest text-red-500 hover:text-red-400 transition-colors mt-8">
              DISCONNECT
            </button>
          )}
        </div>
      )}

      {/* Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 glass-dark flex flex-col items-center justify-start pt-32 px-6 animate-in fade-in duration-300">
          <button className="absolute top-6 right-6 md:right-12 text-white hover:text-racing-red transition-colors" onClick={() => setIsSearchOpen(false)}>
            <X strokeWidth={2} className="h-8 w-8" />
          </button>
          <form onSubmit={handleSearch} className="w-full max-w-2xl relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2">
               <Terminal className="h-6 w-6 text-racing-red animate-pulse" />
            </div>
            <input 
              type="text" 
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SCAN FOR MODELS OR PARTS..." 
              className="w-full bg-transparent border-b-2 border-racing-red text-2xl md:text-3xl font-heading font-black text-white pl-10 pb-4 outline-none placeholder:text-gray-600 uppercase tracking-widest"
            />
            <button type="submit" className="absolute right-0 top-1/2 -translate-y-1/2 text-[11px] font-mono font-bold tracking-[0.2em] uppercase text-racing-red hover:text-white transition-colors">
              Execute
            </button>
          </form>
        </div>
      )}
    </header>
  )
}
