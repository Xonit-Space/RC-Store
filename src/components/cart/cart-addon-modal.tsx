"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { getProductAddons } from "@/actions/addons"
import { useCartStore } from "@/store/cart"
import { useSession } from "next-auth/react"
import { useLoading } from "@/components/providers/loading-provider"
import { toast } from "sonner"

export function CartAddonModal({
  isOpen,
  onClose,
  cartItem
}: {
  isOpen: boolean
  onClose: () => void
  cartItem: any
}) {
  const [addons, setAddons] = useState<any[]>([])
  const [selectedAddon, setSelectedAddon] = useState<any | null>(null)
  const cartStore = useCartStore()
  const { data: session } = useSession()
  const { withLoading } = useLoading()
  
  useEffect(() => {
    if (isOpen && cartItem) {
      const productId = cartItem.product?.id
      if (productId) {
        getProductAddons(productId).then(data => {
          setAddons(data || [])
          if (data && data.length > 0) {
            setSelectedAddon(data[0])
          }
        })
      }
    }
  }, [isOpen, cartItem])

  const handleAddToCart = async () => {
    if (!selectedAddon) return
    try {
      await withLoading(cartStore.addItem({
        variantId: selectedAddon.id,
        addonId: selectedAddon.id,
        parentProductId: cartItem.id,
        quantity: 1,
        product: {
          id: selectedAddon.id,
          name: selectedAddon.name,
          price: selectedAddon.price,
          imageUrl: selectedAddon.image || "/placeholder.svg",
          size: "",
          color: ""
        }
      }, session?.user?.id))
      toast.success("Addon added to cart")
      onClose()
    } catch (error: any) {
      toast.error(error.message || "Failed to add addon")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden flex flex-col md:flex-row h-[80vh] md:h-[600px] border-border/40 gap-0">
        
        {/* Left Sidebar */}
        <div className="w-full md:w-1/3 border-r border-border/40 bg-muted/10 overflow-y-auto p-4 flex flex-col gap-2 relative">
          <h3 className="font-bold text-lg mb-2">Available Addons</h3>
          {addons.length === 0 ? (
            <p className="text-sm text-muted-foreground">No addons available for this product.</p>
          ) : (
            addons.map(addon => (
              <div 
                key={addon.id} 
                onClick={() => setSelectedAddon(addon)}
                className={`p-3 border rounded-lg cursor-pointer transition-colors flex items-center gap-3 ${selectedAddon?.id === addon.id ? 'border-primary bg-primary/5' : 'border-border/40 hover:bg-muted/50'}`}
              >
                <div className="h-12 w-12 bg-background border rounded overflow-hidden shrink-0">
                  <img src={addon.image || "/placeholder.svg"} alt={addon.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{addon.name}</p>
                  <p className="text-xs text-muted-foreground">{addon.price.toLocaleString("en-AU", {style: 'currency', currency: 'AUD'})}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Main Content */}
        <div className="w-full md:w-2/3 p-6 flex flex-col h-full bg-background relative">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold">Addon Details</h2>
            <Button variant="outline" size="sm" onClick={onClose} className="shrink-0 z-50">
              Cancel
            </Button>
          </div>
          
          {selectedAddon ? (
            <div className="flex-1 flex flex-col justify-between overflow-y-auto">
              <div className="space-y-6">
                <div className="aspect-video w-full bg-muted rounded-lg overflow-hidden border border-border/40">
                  <img src={selectedAddon.image || "/placeholder.svg"} alt={selectedAddon.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedAddon.name}</h3>
                  <p className="text-lg font-semibold text-primary mt-1">{selectedAddon.price.toLocaleString("en-AU", {style: 'currency', currency: 'AUD'})}</p>
                  <div className="mt-4 text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedAddon.description || "No description available."}
                  </div>
                </div>
              </div>
              <div className="pt-6 mt-auto">
                <Button onClick={handleAddToCart} className="w-full font-bold h-12">
                  Add {selectedAddon.name} to Cart
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              Select an addon to view details
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
