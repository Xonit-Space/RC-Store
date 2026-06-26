import Image from "next/image"
import { Check, Package, AlertTriangle, ShieldAlert, Cpu } from "lucide-react"

interface ProductContentSectionsProps {
  product: any
}

export function ProductContentSections({ product }: ProductContentSectionsProps) {
  const hasFeatures = product.features && product.features.length > 0
  const hasIncluded = product.includedItems && product.includedItems.length > 0
  const hasRequired = product.requiredItems && product.requiredItems.length > 0
  const hasNotes = !!product.notes
  const hasVideos = product.videos && product.videos.length > 0
  const hasSpecs = product.attributes && product.attributes.length > 0
  const hasFeatureBlocks = product.featureBlocks && product.featureBlocks.length > 0
  const fbtProducts = product.relatedSource?.filter((r: any) => r.relationType === "FREQUENTLY_BOUGHT_TOGETHER")
  const spareParts = product.relatedSource?.filter((r: any) => r.relationType === "ACCESSORY" || r.relationType === "COMPATIBLE")
  const recommended = product.relatedSource?.filter((r: any) => r.relationType === "UPGRADE")
  const hasDocuments = product.documents && product.documents.length > 0
  const reviews = product.reviews || []
  const questions = product.questions || []

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 space-y-24 py-16">
      
      {/* 7. Frequently Bought Together */}
      {fbtProducts && fbtProducts.length > 0 && (
        <section className="border border-border/40 p-8 bg-muted/5">
          <h2 className="font-serif text-2xl mb-8">Frequently Bought Together</h2>
          <div className="flex flex-col md:flex-row gap-8 items-center">
            {/* Logic for rendering FBT items goes here (simplified for space) */}
            <p className="text-muted-foreground text-sm tracking-widest uppercase">Select items to buy together</p>
          </div>
        </section>
      )}

      {/* 9. Feature Cards / Marketing Blocks */}
      {hasFeatureBlocks && (
        <section className="grid md:grid-cols-2 gap-8">
          {product.featureBlocks.map((block: any) => (
            <div key={block.id} className="border border-border/40 overflow-hidden group">
              {block.image && (
                <div className="relative aspect-video bg-muted overflow-hidden">
                  <Image 
                    src={block.image} 
                    alt={block.title} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-700 mix-blend-luminosity hover:mix-blend-normal" 
                  />
                </div>
              )}
              <div className="p-8 bg-background">
                <h3 className="text-xl font-serif mb-4">{block.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{block.description}</p>
              </div>
            </div>
          ))}
        </section>
      )}

      <div className="grid md:grid-cols-12 gap-12">
        {/* Left Column: Description, Features, Specs */}
        <div className="md:col-span-8 space-y-16">
          
          {/* 8. Product Description */}
          <section>
            <h2 className="font-serif text-2xl mb-6">Product Overview</h2>
            <div className="prose prose-invert max-w-none text-muted-foreground text-sm leading-relaxed" 
                 dangerouslySetInnerHTML={{ __html: product.description || "<p>Detailed description not available.</p>" }} />
          </section>

          {/* 10. Features List */}
          {hasFeatures && (
            <section>
              <h2 className="font-serif text-2xl mb-6">Key Features</h2>
              <ul className="grid sm:grid-cols-2 gap-4">
                {product.features.map((feature: string, idx: number) => (
                  <li key={idx} className="flex gap-3 text-sm text-muted-foreground items-start">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 15. Specifications Table */}
          {hasSpecs && (
            <section>
              <h2 className="font-serif text-2xl mb-6">Specifications</h2>
              <div className="border border-border/40 divide-y divide-border/40">
                {product.attributes.map((attr: any) => (
                  <div key={attr.id} className="flex flex-col sm:flex-row text-sm">
                    <div className="sm:w-1/3 bg-muted/20 p-4 font-bold text-foreground text-[10px] tracking-widest uppercase">
                      {attr.name}
                    </div>
                    <div className="sm:w-2/3 p-4 text-muted-foreground">
                      {attr.value}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 14. Videos */}
          {hasVideos && (
            <section>
              <h2 className="font-serif text-2xl mb-6">Product Videos</h2>
              <div className="grid sm:grid-cols-2 gap-6">
                {product.videos.map((video: any) => (
                  <div key={video.id} className="space-y-4">
                    <div className="aspect-video bg-muted relative">
                      <iframe 
                        src={video.url} 
                        title={video.title}
                        className="absolute inset-0 w-full h-full"
                        allowFullScreen
                      />
                    </div>
                    <p className="text-xs font-bold tracking-widest uppercase">{video.title}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>

        {/* Right Column: Included, Required, Notes */}
        <div className="md:col-span-4 space-y-12">
          
          {/* 11. Included Items */}
          {hasIncluded && (
            <section className="border border-border/40 p-6 bg-muted/5">
              <div className="flex items-center gap-3 mb-6">
                <Package className="w-5 h-5 text-foreground" />
                <h3 className="font-serif text-xl">What&apos;s in the Box</h3>
              </div>
              <ul className="space-y-3">
                {product.includedItems.map((item: string, idx: number) => (
                  <li key={idx} className="flex gap-3 text-sm text-muted-foreground items-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-border shrink-0 mt-1.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 12. Required Items */}
          {hasRequired && (
            <section className="border border-border/40 p-6 bg-muted/5">
              <div className="flex items-center gap-3 mb-6">
                <Cpu className="w-5 h-5 text-terracotta" />
                <h3 className="font-serif text-xl">Required to Complete</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-4">This item requires additional parts to operate:</p>
              <ul className="space-y-3">
                {product.requiredItems.map((item: string, idx: number) => (
                  <li key={idx} className="flex gap-3 text-sm text-terracotta/80 items-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-terracotta/50 shrink-0 mt-1.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 13. Notes */}
          {hasNotes && (
            <section className="border border-border/40 p-6 bg-racing-yellow/5">
              <div className="flex items-center gap-3 mb-6">
                <ShieldAlert className="w-5 h-5 text-racing-yellow" />
                <h3 className="font-serif text-xl text-racing-yellow">Important Notes</h3>
              </div>
              <div className="prose prose-invert max-w-none text-racing-yellow/80 text-sm leading-relaxed" 
                   dangerouslySetInnerHTML={{ __html: product.notes }} />
            </section>
          )}

          {/* 20. PDF Downloads */}
          {hasDocuments && (
            <section className="border border-border/40 p-6 bg-muted/5">
              <h3 className="font-serif text-xl mb-6">Downloads & Manuals</h3>
              <div className="space-y-4">
                {product.documents.map((doc: any) => (
                  <a key={doc.id} href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 border border-border/40 hover:bg-muted/10 transition-colors">
                    <span className="text-sm font-medium text-foreground">{doc.name}</span>
                    <span className="text-xs tracking-widest uppercase text-muted-foreground">{doc.type}</span>
                  </a>
                ))}
              </div>
            </section>
          )}

        </div>
      </div>

      {/* 16. Parts / Spare Parts */}
      {spareParts && spareParts.length > 0 && (
        <section className="pt-16 border-t border-border/40">
          <h2 className="font-serif text-3xl mb-12">Spare Parts & Accessories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {spareParts.map((item: any) => (
              <a key={item.id} href={`/products/${item.related?.slug}`} className="group border border-border/40 p-4 block hover:border-foreground/40 transition-colors bg-muted/5">
                <div className="aspect-square relative bg-muted mb-4">
                  <Image src={item.related?.images?.[0]?.url || item.related?.images?.[0] || "/placeholder.svg"} alt={item.related?.name} fill className="object-cover mix-blend-luminosity group-hover:mix-blend-normal" />
                </div>
                <h4 className="text-sm font-bold truncate">{item.related?.name}</h4>
                <p className="text-xs text-muted-foreground mt-1">Rs. {Number(item.related?.price).toLocaleString()}</p>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* 17. Customer Reviews & 18. Questions & Answers */}
      <section id="reviews" className="pt-16 border-t border-border/40">
        <div className="grid md:grid-cols-2 gap-16">
          
          {/* Reviews */}
          <div>
            <h2 className="font-serif text-3xl mb-8">Customer Reviews</h2>
            <div className="space-y-8">
              {reviews.length > 0 ? reviews.map((review: any) => (
                <div key={review.id} className="border-b border-border/40 pb-8">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-foreground">{review.user?.name || "Verified Buyer"}</span>
                    <div className="flex text-primary text-xs">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i}>{i < review.rating ? "★" : "☆"}</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
                  <span className="text-[10px] text-muted-foreground/60 mt-4 block">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground">No reviews yet. Be the first to review this product!</p>
              )}
            </div>
          </div>

          {/* Q&A */}
          <div>
            <h2 className="font-serif text-3xl mb-8">Questions & Answers</h2>
            <div className="space-y-8">
              {questions.length > 0 ? questions.map((q: any) => (
                <div key={q.id} className="border-b border-border/40 pb-8">
                  <div className="mb-4">
                    <p className="text-sm font-bold text-foreground">Q: {q.question}</p>
                    <span className="text-[10px] text-muted-foreground mt-1 block">Asked by {q.user?.name || "Customer"} on {new Date(q.createdAt).toLocaleDateString()}</span>
                  </div>
                  {q.answers?.map((a: any) => (
                    <div key={a.id} className="bg-muted/10 p-4 border-l-2 border-primary mt-4">
                      <p className="text-sm text-muted-foreground">A: {a.answer}</p>
                      <span className="text-[10px] text-muted-foreground/60 mt-2 block">Answered by {a.user?.name || "Staff"} on {new Date(a.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              )) : (
                <p className="text-sm text-muted-foreground">Have a question? Feel free to ask!</p>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* 19. Recommended Products */}
      {recommended && recommended.length > 0 && (
        <section className="pt-16 border-t border-border/40">
          <h2 className="font-serif text-3xl mb-12">Recommended Upgrades</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {recommended.map((item: any) => (
              <a key={item.id} href={`/products/${item.related?.slug}`} className="group border border-border/40 p-4 block hover:border-foreground/40 transition-colors bg-muted/5">
                <div className="aspect-square relative bg-muted mb-4">
                  <Image src={item.related?.images?.[0]?.url || item.related?.images?.[0] || "/placeholder.svg"} alt={item.related?.name} fill className="object-cover mix-blend-luminosity group-hover:mix-blend-normal" />
                </div>
                <h4 className="text-sm font-bold truncate">{item.related?.name}</h4>
                <p className="text-xs text-muted-foreground mt-1">Rs. {Number(item.related?.price).toLocaleString()}</p>
              </a>
            ))}
          </div>
        </section>
      )}

    </div>
  )
}
