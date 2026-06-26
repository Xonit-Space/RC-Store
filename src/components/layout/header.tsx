"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X, Terminal, HelpCircle, Heart, Search, ChevronDown, Clock } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useCartStore } from "@/store/cart"
import { signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useDebounce } from "@/hooks/use-debounce"

function AnnouncementBar() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 })
  const [promoTitle, setPromoTitle] = useState("EOFY Sale")
  const [targetDate, setTargetDate] = useState<Date | null>(null)
  const [isActive, setIsActive] = useState(true) // assume true to prevent flash of hidden content

  useEffect(() => {
    async function loadPromo() {
      try {
        const res = await fetch("/api/promotion")
        if (res.ok) {
          const json = await res.json()
          if (json.success && json.data) {
            setPromoTitle(json.data.title)
            setTargetDate(new Date(json.data.endDate))
            setIsActive(true)
          } else {
            setIsActive(false)
          }
        }
      } catch (err) {
        console.error("Failed to load promo")
      }
    }
    loadPromo()
  }, [])

  useEffect(() => {
    if (!targetDate) return

    const timer = setInterval(() => {
      const now = new Date().getTime()
      const distance = targetDate.getTime() - now

      if (distance < 0) {
        clearInterval(timer)
        setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 })
        setIsActive(false)
        return
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        mins: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        secs: Math.floor((distance % (1000 * 60)) / 1000)
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  if (!isActive) return null;

  return (
    <div suppressHydrationWarning className="w-full bg-racing-yellow text-carbon-dark py-2 px-6 flex flex-col md:flex-row items-center justify-between text-[10px] font-mono font-bold uppercase tracking-widest relative z-[60]">
      <div className="flex flex-wrap items-center justify-center gap-4 mb-2 md:mb-0">
        <Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link>
        <span className="opacity-50">|</span>
        <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
        <span className="opacity-50">|</span>
        <Link href="/customer" className="hover:text-white transition-colors">My Garage</Link>
        <span className="opacity-50">|</span>
        <Link href="/wishlist" className="hover:text-white transition-colors flex items-center gap-1">
          <Heart className="h-3 w-3" /> Wishlist
        </Link>
      </div>
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 animate-pulse" />
        <span>{promoTitle} Ends In:</span>
        <span className="bg-carbon-dark text-racing-yellow px-2 py-0.5 rounded-sm">
          {timeLeft.days}d {timeLeft.hours}h {timeLeft.mins}m {timeLeft.secs}s
        </span>
      </div>
    </div>
  )
}

export function Header() {
  const { data: session } = useSession()
  const router = useRouter()
  const cartStore = useCartStore()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  const debouncedSearchQuery = useDebounce(searchQuery, 500)
  const cartCount = cartStore.getItemCount()

  useEffect(() => {
    useCartStore.persist.rehydrate()
    setMounted(true)
    const handleScroll = () => {
      setScrolled(window.scrollY > 30)
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

  const accountUrl = session?.user
    ? (session.user.role as string) === "SUPER_ADMIN" || (session.user.role as string) === "ADMIN"
      ? "/admin"
      : (session.user.role as string) === "STAFF"
        ? "/admin/pos"
        : "/customer"
    : "/login"

  return (
    <>
      <header suppressHydrationWarning className={`fixed top-0 z-50 w-full transition-all duration-500 ${scrolled ? "glass-dark border-b border-racing-yellow/40 shadow-[0_0_20px_rgba(255, 204, 0,0.1)]" : "bg-gradient-to-b from-black to-carbon-dark/80"}`}>
      <AnnouncementBar />
      <div className={`transition-all duration-500 ${scrolled ? "py-2" : "py-4"}`}>
        <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center justify-between w-full md:w-auto">
            <button className="md:hidden text-white hover:text-racing-yellow transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <Menu strokeWidth={2} className="h-6 w-6" />
            </button>
            
            <Link href="/" className="font-heading font-black text-2xl md:text-3xl tracking-widest text-foreground uppercase drop-shadow-[0_0_10px_rgba(255, 204, 0,0.5)]">
              <img src="/Transparent/logo yellow0.png" alt="Aussie Rigs Arena" className="h-8 w-auto object-contain scale-[4] md:scale-[5] origin-left pointer-events-none" />
            </Link>

            {/* Mobile Actions */}
            <div className="flex md:hidden items-center gap-4">
              <button onClick={() => setIsSearchOpen(true)}>
                <Search className="h-5 w-5 text-white/80 hover:text-white transition-colors" />
              </button>
              <Link href="/cart" className="relative">
                <Terminal className="h-5 w-5 text-racing-yellow" />
                {mounted && cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-racing-yellow text-carbon-dark text-[9px] font-bold px-1 rounded-full">{cartCount}</span>
                )}
              </Link>
            </div>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-2xl px-8 relative">
            <div className="relative w-full group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                 <Search className="h-4 w-4 text-white/70 group-focus-within:text-racing-yellow transition-colors" />
              </div>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH RC CARS, DRONES, PARTS..." 
                className="w-full h-10 bg-white/5 border border-white/10 hover:border-racing-yellow/50 focus:border-racing-yellow text-sm font-mono text-white pl-12 pr-28 outline-none placeholder:text-white/50 uppercase tracking-wider transition-all"
              />
              <button onClick={handleSearch} className="absolute right-0 top-0 h-full px-4 bg-racing-yellow text-carbon-dark text-[10px] font-mono font-bold tracking-[0.1em] uppercase hover:bg-neon-yellow transition-colors">
                Search
              </button>
            </div>
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/part-finder" className="flex items-center gap-1 text-[11px] font-mono font-bold tracking-[0.1em] uppercase text-racing-yellow hover:text-white transition-colors border border-racing-yellow/50 px-3 py-1.5 hover:bg-racing-yellow/10">
              <Terminal className="h-3 w-3" /> Part Finder
            </Link>

            <Link href="/help" className="text-white/80 hover:text-racing-yellow transition-colors">
              <HelpCircle className="h-5 w-5" />
            </Link>

            {session ? (
              <div className="flex items-center gap-4">
                <Link href={accountUrl} className="text-[11px] font-mono font-bold tracking-[0.2em] uppercase text-white hover:text-racing-yellow transition-colors">
                  Account
                </Link>
                <button onClick={() => signOut({ callbackUrl: '/' })} className="text-[11px] font-mono font-bold tracking-[0.2em] uppercase text-red-500 hover:text-red-400 transition-colors">
                  Log Out
                </button>
              </div>
            ) : (
              <Link href="/login" className="text-[11px] font-mono font-bold tracking-[0.2em] uppercase text-white hover:text-racing-yellow transition-colors">
                Login
              </Link>
            )}

            <Link href="/cart" className="flex items-center gap-2 text-[11px] font-mono font-bold tracking-[0.2em] uppercase text-white hover:text-racing-yellow transition-colors">
              Cart {mounted && cartCount > 0 ? <span className="bg-racing-yellow text-carbon-dark px-1.5 py-0.5 rounded-sm">{cartCount}</span> : null}
            </Link>
          </div>
        </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] glass-dark flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-300">
          <button className="absolute top-6 left-6 text-foreground hover:text-racing-yellow transition-colors" onClick={() => setIsMenuOpen(false)}>
            <X strokeWidth={2} className="h-8 w-8" />
          </button>
          
          <Link href="/part-finder" onClick={() => setIsMenuOpen(false)} className="font-heading font-black uppercase text-3xl tracking-widest text-racing-yellow hover:text-white transition-colors">
            Part Finder
          </Link>
          <Link href="/products" onClick={() => setIsMenuOpen(false)} className="font-heading font-black uppercase text-3xl tracking-widest text-foreground hover:text-racing-yellow transition-colors">
            Shop All
          </Link>
          <Link href="/customer" onClick={() => setIsMenuOpen(false)} className="font-heading font-black uppercase text-3xl tracking-widest text-foreground hover:text-racing-yellow transition-colors">
            My Garage
          </Link>
          <Link href={accountUrl} onClick={() => setIsMenuOpen(false)} className="font-heading font-black uppercase text-3xl tracking-widest text-foreground hover:text-racing-yellow transition-colors">
            Account
          </Link>
          {session ? (
            <button onClick={() => { signOut({ callbackUrl: '/' }); setIsMenuOpen(false); }} className="font-heading font-black uppercase text-3xl tracking-widest text-red-500 hover:text-red-400 transition-colors mt-8">
              Log Out
            </button>
          ) : (
            <Link href="/login" onClick={() => setIsMenuOpen(false)} className="font-heading font-black uppercase text-3xl tracking-widest text-foreground hover:text-racing-yellow transition-colors mt-8">
              Login
            </Link>
          )}
        </div>
      )}

      {/* Mobile Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[100] glass-dark flex flex-col items-center justify-start pt-32 px-6 animate-in fade-in duration-300 md:hidden">
          <button className="absolute top-6 right-6 text-foreground hover:text-racing-yellow transition-colors" onClick={() => setIsSearchOpen(false)}>
            <X strokeWidth={2} className="h-8 w-8" />
          </button>
          <form onSubmit={handleSearch} className="w-full relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2">
               <Search className="h-6 w-6 text-racing-yellow" />
            </div>
            <input 
              type="text" 
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH RC CARS..." 
              className="w-full bg-transparent border-b-2 border-racing-yellow text-2xl font-heading font-black text-foreground pl-10 pb-4 outline-none placeholder:text-muted-foreground uppercase tracking-widest"
            />
          </form>
        </div>
      )}
    </>
  )
}
