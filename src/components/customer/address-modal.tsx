"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { toast } from "sonner"
import { AddressSchema } from "@/validators/auth"
import { addCustomerAddress } from "@/actions/auth"
import { useSession } from "next-auth/react"

interface AddressModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  editingAddress?: any | null
  isFirstAddress?: boolean
}

export function AddressModal({ isOpen, onClose, onSuccess, editingAddress, isFirstAddress }: AddressModalProps) {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)

  const [addrTitle, setAddrTitle] = useState("Base Station")
  const [line1, setLine1] = useState("")
  const [line2, setLine2] = useState("")
  const [city, setCity] = useState("")
  const [addrState, setAddrState] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [country, setCountry] = useState("US")
  const [phone, setPhone] = useState("")

  useEffect(() => {
    if (editingAddress) {
      setAddrTitle(editingAddress.title || "")
      setLine1(editingAddress.line1 || "")
      setLine2(editingAddress.line2 || "")
      setCity(editingAddress.city || "")
      setAddrState(editingAddress.state || "")
      setPostalCode(editingAddress.postalCode || "")
      setCountry(editingAddress.country || "US")
      setPhone(editingAddress.phone || "")
    } else {
      setAddrTitle("Base Station")
      setLine1("")
      setLine2("")
      setCity("")
      setAddrState("")
      setPostalCode("")
      setCountry("US")
      setPhone("")
    }
  }, [editingAddress, isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const payload = {
      title: addrTitle,
      line1, 
      line2: line2 || undefined,
      city, 
      state: addrState, 
      postalCode, 
      country, 
      phone,
      isDefaultShipping: isFirstAddress,
      isDefaultBilling: isFirstAddress,
    }

    const validation = AddressSchema.safeParse(payload)
    if (!validation.success) {
      toast.error(validation.error.errors.map(err => err.message).join(", "))
      setLoading(false)
      return
    }

    try {
      if (editingAddress) {
        // Edit existing
        const res = await fetch(`/api/customer/addresses/${editingAddress.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        const data = await res.json()
        if (data.success) {
          toast.success("Address Updated")
          onSuccess()
          onClose()
        } else {
          toast.error(data.error || "Failed to update address")
        }
      } else {
        // Add new
        const response = await addCustomerAddress(session?.user?.id || "", payload)
        if (response.success) {
          toast.success("Address Saved")
          onSuccess()
          onClose()
        } else {
          toast.error(response.error || "Error saving address")
        }
      }
    } catch {
      toast.error("SYSTEM MALFUNCTION")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-carbon-dark/95 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="glass-dark border border-racing-yellow/50 p-8 w-full max-w-md shadow-[0_0_30px_rgba(255, 204, 0,0.15)] relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-racing-yellow to-transparent opacity-50" />
        <div className="flex justify-between items-center mb-8">
          <h3 className="font-heading text-2xl font-black tracking-wider text-foreground uppercase">
            {editingAddress ? "Edit Address" : "Add New Address"}
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <X strokeWidth={2} className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[9px] font-mono tracking-[0.25em] uppercase text-muted-foreground block">Address Title</label>
              <input
                value={addrTitle}
                onChange={(e) => setAddrTitle(e.target.value)}
                placeholder="HQ, Pit Stop"
                required
                className="w-full bg-muted border-b border-border pb-2 pt-2 px-2 text-sm text-foreground focus:outline-none focus:border-racing-yellow transition-colors font-mono uppercase placeholder-gray-600"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-mono tracking-[0.25em] uppercase text-muted-foreground block">Phone Number</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1..."
                required
                className="w-full bg-muted border-b border-border pb-2 pt-2 px-2 text-sm text-foreground focus:outline-none focus:border-racing-yellow transition-colors font-mono placeholder-gray-600"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-mono tracking-[0.25em] uppercase text-muted-foreground block">Address Line 1</label>
            <input
              value={line1}
              onChange={(e) => setLine1(e.target.value)}
              placeholder="Address Line 1"
              required
              className="w-full bg-muted border-b border-border pb-2 pt-2 px-2 text-sm text-foreground focus:outline-none focus:border-racing-yellow transition-colors font-mono placeholder-gray-600 uppercase"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-mono tracking-[0.25em] uppercase text-muted-foreground block">Unit / Level</label>
            <input
              value={line2}
              onChange={(e) => setLine2(e.target.value)}
              placeholder="Optional"
              className="w-full bg-muted border-b border-border pb-2 pt-2 px-2 text-sm text-foreground focus:outline-none focus:border-racing-yellow transition-colors font-mono placeholder-gray-600 uppercase"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[9px] font-mono tracking-[0.25em] uppercase text-muted-foreground block">City</label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className="w-full bg-muted border-b border-border pb-2 pt-2 px-2 text-sm text-foreground focus:outline-none focus:border-racing-yellow transition-colors font-mono uppercase"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-mono tracking-[0.25em] uppercase text-muted-foreground block">Region</label>
              <input
                value={addrState}
                onChange={(e) => setAddrState(e.target.value)}
                required
                className="w-full bg-muted border-b border-border pb-2 pt-2 px-2 text-sm text-foreground focus:outline-none focus:border-racing-yellow transition-colors font-mono uppercase"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-mono tracking-[0.25em] uppercase text-muted-foreground block">Zip Code</label>
              <input
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                required
                className="w-full bg-muted border-b border-border pb-2 pt-2 px-2 text-sm text-foreground focus:outline-none focus:border-racing-yellow transition-colors font-mono uppercase"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-mono tracking-[0.25em] uppercase text-muted-foreground block">Territory</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-muted border-b border-border pb-2 pt-2 px-2 text-[11px] font-mono tracking-wider text-foreground focus:outline-none focus:border-racing-yellow transition-colors appearance-none cursor-pointer uppercase"
              >
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="GB">United Kingdom</option>
                <option value="LK">Sri Lanka</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-4 border border-border text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-foreground hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-2/3 py-4 bg-primary text-[10px] font-heading font-black tracking-[0.2em] uppercase text-foreground hover:bg-primary/90 hover:shadow-[0_0_15px_rgba(255, 204, 0,0.5)] transition-all disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Address"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
