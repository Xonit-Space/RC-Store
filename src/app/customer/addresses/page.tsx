"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { MapPin, Target, Zap } from "lucide-react"
import { useCustomer } from "@/components/providers/customer-provider"
import { AddressModal } from "@/components/customer/address-modal"

export default function CustomerAddressesPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { profile } = useCustomer()

  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<any>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/customer/addresses")
    }
  }, [status, router])

  const handleSetDefaultAddress = async (id: string, isShipping: boolean, isBilling: boolean) => {
    try {
      const addr = profile?.addresses?.find((a: any) => a.id === id)
      if (!addr) return

      const res = await fetch(`/api/customer/addresses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: addr.title,
          line1: addr.line1,
          line2: addr.line2 || undefined,
          city: addr.city,
          state: addr.state,
          postalCode: addr.postalCode,
          country: addr.country,
          phone: addr.phone,
          isDefaultShipping: isShipping,
          isDefaultBilling: isBilling
        })
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Default address updated")
        router.refresh()
        // Ideally we should reload the profile context or do window.location.reload()
        window.location.reload()
      } else {
        toast.error(data.error || "Failed to update default address")
      }
    } catch {
      toast.error("An error occurred")
    }
  }

  const handleDeleteAddress = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return
    try {
      const res = await fetch(`/api/customer/addresses/${id}`, { method: "DELETE" })
      const data = await res.json()
      if (data.success) {
        toast.success("Address deleted")
        router.refresh()
        window.location.reload()
      } else {
        toast.error(data.error || "Failed to delete address")
      }
    } catch {
      toast.error("An error occurred")
    }
  }

  if (status === "loading") {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <p className="text-[10px] tracking-[0.3em] uppercase text-primary font-mono animate-pulse">
          Loading...
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 p-6 md:p-12 pb-24 md:pb-32 font-sans w-full max-w-5xl mx-auto">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-8 mb-12 gap-8">
        <div>
          <p className="text-[10px] tracking-[0.3em] uppercase text-primary mb-2 font-mono font-bold flex items-center gap-2">
            <Zap className="w-3 h-3" /> Address Book
          </p>
          <h1 className="font-heading text-4xl md:text-5xl font-black text-foreground uppercase tracking-wider">
            My Addresses
          </h1>
        </div>
        <button
          onClick={() => {
            setEditingAddress(null)
            setIsAddAddressOpen(true)
          }}
          className="bg-primary text-black px-6 py-3 font-mono text-[11px] font-bold tracking-widest uppercase hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <Target className="w-4 h-4" /> Add Address
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {profile?.addresses?.length === 0 ? (
          <div className="md:col-span-2 py-16 text-center glass-dark border border-white/5 rounded-xl">
            <MapPin className="h-12 w-12 mx-auto text-white/20 mb-4" />
            <p className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-6">No addresses saved</p>
            <button
              onClick={() => {
                setEditingAddress(null)
                setIsAddAddressOpen(true)
              }}
              className="text-[11px] font-mono tracking-widest uppercase text-primary border-b border-primary pb-1 inline-flex items-center gap-2 group hover:text-primary/90 transition-colors"
            >
              Add your first address
            </button>
          </div>
        ) : (
          profile?.addresses?.map((addr: any) => (
            <div key={addr.id} className="glass-dark border border-white/5 p-6 rounded-xl relative group hover:border-racing-yellow/30 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[12px] font-mono font-bold tracking-widest uppercase text-foreground">{addr.title}</span>
                <div className="flex flex-col items-end gap-1">
                  {(addr.isDefaultShipping || addr.isDefaultBilling) && (
                    <span className="text-[9px] font-mono font-bold tracking-widest uppercase text-black bg-primary px-2 py-0.5 rounded">
                      Default
                    </span>
                  )}
                </div>
              </div>
              <div className="text-xs font-mono text-muted-foreground leading-relaxed uppercase space-y-1">
                <p>{addr.line1}</p>
                {addr.line2 && <p>{addr.line2}</p>}
                <p>{addr.city}, {addr.state} {addr.postalCode}</p>
                <p>{addr.country}</p>
                <p className="pt-2 tracking-widest text-white/60">{addr.phone}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
                <div className="flex gap-4">
                  <button 
                    onClick={() => {
                      setEditingAddress(addr)
                      setIsAddAddressOpen(true)
                    }}
                    className="text-[10px] font-mono uppercase text-muted-foreground hover:text-white transition-colors tracking-widest font-bold"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteAddress(addr.id)}
                    className="text-[10px] font-mono uppercase text-red-500 hover:text-red-400 transition-colors tracking-widest font-bold"
                  >
                    Delete
                  </button>
                </div>
                {(!addr.isDefaultShipping || !addr.isDefaultBilling) && (
                  <button 
                    onClick={() => handleSetDefaultAddress(addr.id, true, true)}
                    className="text-[10px] font-mono uppercase text-primary hover:text-primary/80 transition-colors tracking-widest font-bold"
                  >
                    Set Default
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <AddressModal 
        isOpen={isAddAddressOpen}
        onClose={() => setIsAddAddressOpen(false)}
        onSuccess={() => {
          window.location.reload()
        }}
        editingAddress={editingAddress}
        isFirstAddress={profile?.addresses?.length === 0}
      />
    </div>
  )
}
