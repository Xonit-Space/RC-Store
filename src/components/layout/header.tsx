"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useCartStore } from "@/store/cart"
import { useSession } from "next-auth/react"

export function Header() {
  const { data: session } = useSession()
  const cartStore = useCartStore()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  
  const cartCount = cartStore.getItemCount()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

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

          <Link href="/customer" className="hidden md:block text-[11px] font-medium tracking-[0.2em] uppercase hover:text-accent transition-colors">
            Account
          </Link>

          <button className="hidden md:block text-[11px] font-medium tracking-[0.2em] uppercase hover:text-accent transition-colors">
            Search
          </button>

          <Link href="/cart" className="text-[11px] font-medium tracking-[0.2em] uppercase hover:text-accent transition-colors">
            Cart ({cartCount})
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
          <Link href="/customer" onClick={() => setIsMenuOpen(false)} className="font-serif text-4xl tracking-widest hover:text-accent transition-colors">
            ACCOUNT
          </Link>
        </div>
      )}
    </header>
  )
}
