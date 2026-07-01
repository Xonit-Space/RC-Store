"use client"

import { Home, LogOut, Bell, Sun, Moon } from "lucide-react"
import Link from "next/link"
import { signOut } from "next-auth/react"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

interface HeaderProps {
  user: any
}

const pageTitles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/products": "Products",
  "/admin/categories": "Categories",
  "/admin/addons": "Addons",
  "/admin/inventory": "Inventory",
  "/admin/part-finder": "Part Finder",
  "/admin/orders": "Orders",
  "/admin/customers": "Customers",
  "/admin/coupons": "Coupons",
  "/admin/reviews": "Reviews",
  "/admin/blog": "Blog",
  "/admin/gallery": "Gallery",
  "/admin/analytics": "Analytics",
  "/admin/settings": "Settings",
}

function usePageTitle() {
  const pathname = usePathname()
  // Match exact first, then prefix
  if (pageTitles[pathname]) return pageTitles[pathname]
  const matched = Object.entries(pageTitles).find(
    ([key]) => key !== "/admin" && pathname.startsWith(key)
  )
  return matched ? matched[1] : "Admin"
}

export function Header({ user }: HeaderProps) {
  const pageTitle = usePageTitle()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  return (
    <header className="h-14 border-b border-border/40 bg-zinc-50 dark:bg-background/95 backdrop-blur-sm flex items-center px-4 md:px-6 shrink-0 sticky top-0 z-40 gap-4">
      {/* Left: Logo + Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <Link href="/" className="flex items-center gap-2 group shrink-0" title="Go to store">
          <div className="h-7 w-7 bg-primary/10 border border-primary/30 flex items-center justify-center rounded-sm">
            <Home strokeWidth={1.5} className="w-3.5 h-3.5 text-primary" />
          </div>
        </Link>
        <span className="text-border/60 text-sm hidden sm:block">·</span>
        <div className="flex items-center gap-2 min-w-0 hidden sm:flex">
          <span className="text-[10px] font-medium tracking-[0.15em] uppercase text-muted-foreground truncate">
            Aussie Rigs Arena
          </span>
          <span className="text-[8px] font-bold tracking-[0.2em] uppercase text-primary border border-primary/30 bg-primary/5 px-1.5 py-0.5 rounded-sm">
            Admin
          </span>
        </div>
      </div>

      {/* Center: Current Page Title */}
      <div className="flex-1 flex items-center justify-center">
        <h1 className="text-sm font-semibold text-foreground tracking-wide">
          {pageTitle}
        </h1>
      </div>

      {/* Right: User Info + Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Theme Toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-md transition-colors"
          >
            {theme === "dark" ? (
              <Sun strokeWidth={1.5} className="w-4 h-4" />
            ) : (
              <Moon strokeWidth={1.5} className="w-4 h-4" />
            )}
          </button>
        )}

        {/* Notification placeholder */}
        <button
          className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-md transition-colors"
          title="Notifications"
        >
          <Bell strokeWidth={1.5} className="w-4 h-4" />
        </button>

        {/* User Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-border/40">
          <div className="h-7 w-7 bg-primary/20 border border-primary/30 flex items-center justify-center text-[11px] font-bold uppercase text-primary rounded-sm shrink-0">
            {user.name?.[0] || "A"}
          </div>
          <div className="text-right hidden sm:block leading-none">
            <p className="text-[11px] font-semibold text-foreground">{user.name || "Admin"}</p>
            <p className="text-[9px] text-muted-foreground tracking-wider uppercase">{user.role?.replace("_", " ")}</p>
          </div>
        </div>

        {/* Sign Out */}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          title="Sign Out"
          className="h-8 w-8 flex items-center justify-center border border-border/40 hover:border-destructive/50 hover:bg-destructive/5 text-muted-foreground hover:text-destructive transition-colors rounded-md ml-1"
        >
          <LogOut strokeWidth={1.5} className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  )
}
