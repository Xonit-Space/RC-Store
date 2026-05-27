"use client"

import { POSManagement } from "@/components/admin/pos-management"

export default function AdminPosPage() {
  return (
    <div className="space-y-6">
      <div className="pb-4 border-b">
        <h2 className="text-2xl font-extrabold text-foreground tracking-tight leading-snug">Point of Sale (POS)</h2>
        <p className="text-xs text-muted-foreground font-semibold mt-0.5">Real-time scan-and-pay in-store operations terminal.</p>
      </div>

      <POSManagement />
    </div>
  )
}
