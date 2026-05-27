"use client"

import { CourierManagement } from "@/components/admin/courier-management"

export default function AdminCouriersPage() {
  return (
    <div className="space-y-6">
      <div className="pb-4 border-b">
        <h2 className="text-2xl font-extrabold text-foreground tracking-tight leading-snug">Courier Logistics Operations</h2>
        <p className="text-xs text-muted-foreground font-semibold mt-0.5">Manage delivery zones assignments and track real-time dispatches.</p>
      </div>

      <CourierManagement />
    </div>
  )
}
