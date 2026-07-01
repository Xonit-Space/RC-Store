import Link from "next/link"

interface ImageBannerProps {
  banner: {
    title?: string | null
    desktopImage: string
    tabletImage: string
    mobileImage: string
    link?: string | null
  }
}

export function ImageBanner({ banner }: ImageBannerProps) {
  if (!banner) return null

  const content = (
    <div className="w-full relative overflow-hidden bg-muted group">
      <picture className="w-full h-full block">
        {/* Desktop size: screens >= 1024px */}
        <source media="(min-width: 1024px)" srcSet={banner.desktopImage} />
        {/* Tablet size: screens >= 768px */}
        <source media="(min-width: 768px)" srcSet={banner.tabletImage} />
        {/* Mobile size: default fallback */}
        <img 
          src={banner.mobileImage} 
          alt={banner.title || "Promotional Banner"} 
          loading="lazy" 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
        />
      </picture>
    </div>
  )

  if (banner.link) {
    return (
      <Link href={banner.link} className="block w-full">
        {content}
      </Link>
    )
  }

  return content
}
