"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Truck, MapPin, Phone, Mail, Clock, CheckCircle, XCircle, AlertCircle, Plus, Search, Filter, RefreshCw, UserCheck, Package, Eye, Calendar, Printer, X, Check } from "lucide-react"

export function CourierManagement() {
  const [couriers, setCouriers] = useState<any[]>([])
  const [deliveries, setDeliveries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [courierSearch, setCourierSearch] = useState("")
  const [courierFilter, setCourierFilter] = useState("all")
  
  const [deliverySearch, setDeliverySearch] = useState("")
  const [deliveryFilter, setDeliveryFilter] = useState("all")

  // Add courier form state
  const [isAddCourierOpen, setIsAddCourierOpen] = useState(false)
  const [courierName, setCourierName] = useState("")
  const [courierPhone, setCourierPhone] = useState("")
  const [courierEmail, setCourierEmail] = useState("")
  const [courierStatus, setCourierStatus] = useState("ACTIVE")

  // Waybill printable model state
  const [selectedDeliveryForWaybill, setSelectedDeliveryForWaybill] = useState<any>(null)

  // 1. Fetch couriers and shipments
  const loadCourierLogisticsData = async () => {
    setError(null)
    try {
      const courRes = await fetch("/api/couriers")
      if (!courRes.ok) throw new Error("Failed to load courier drivers")
      const courData = await courRes.json()
      setCouriers(courData.data || [])

      const delRes = await fetch("/api/deliveries")
      if (!delRes.ok) throw new Error("Failed to load active shipments log")
      const delData = await delRes.json()
      setDeliveries(delData.data || [])
    } catch (err: any) {
      setError(err.message || "Failed to load logistics databases")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadCourierLogisticsData()
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    loadCourierLogisticsData()
  }

  // 2. Add New Courier Profile
  const handleAddCourierSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!courierName) return
    try {
      const res = await fetch("/api/couriers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: courierName,
          phone: courierPhone,
          email: courierEmail,
          status: courierStatus
        })
      })

      if (!res.ok) throw new Error("Failed to register driver")
      const result = await res.json()
      if (result.success) {
        setCouriers([result.data, ...couriers])
        setIsAddCourierOpen(false)
        setCourierName("")
        setCourierPhone("")
        setCourierEmail("")
      }
    } catch (err) {
      console.error(err)
    }
  }

  // 3. Filtering logic
  const filteredCouriers = useMemo(() => {
    return couriers.filter((c) => {
      const matchesSearch = c.name.toLowerCase().includes(courierSearch.toLowerCase()) || c.phone.includes(courierSearch)
      const matchesFilter = courierFilter === "all" || c.status === courierFilter
      return matchesSearch && matchesFilter
    })
  }, [couriers, courierSearch, courierFilter])

  const filteredDeliveries = useMemo(() => {
    return deliveries.filter((d) => {
      const matchesSearch = d.orderNumber.toLowerCase().includes(deliverySearch.toLowerCase()) || 
                            d.customerName.toLowerCase().includes(deliverySearch.toLowerCase()) ||
                            (d.trackingNumber && d.trackingNumber.toLowerCase().includes(deliverySearch.toLowerCase()))
      const matchesFilter = deliveryFilter === "all" || d.status === deliveryFilter
      return matchesSearch && matchesFilter
    })
  }, [deliveries, deliverySearch, deliveryFilter])

  // 4. Compute Dynamic logistics stats
  const stats = useMemo(() => {
    const totalC = couriers.length
    const activeC = couriers.filter((c) => c.status === "ACTIVE").length
    const totalD = deliveries.length
    const pendingD = deliveries.filter((d) => d.status === "PENDING" || d.status === "PROCESSING").length
    const dispatchedD = deliveries.filter((d) => d.status === "DISPATCHED").length
    const deliveredD = deliveries.filter((d) => d.status === "DELIVERED").length

    return { totalC, activeC, totalD, pendingD, dispatchedD, deliveredD }
  }, [couriers, deliveries])

  return (
    <div className="space-y-6 overflow-y-auto pr-1 h-[calc(100vh-8rem)]">
      {/* Upper header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Logistics & Courier Dashboard</h2>
          <p className="text-xs text-muted-foreground font-medium">Manage driver rosters, track shipments and issue waybills</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsAddCourierOpen(true)}
            className="h-10 px-4 bg-foreground hover:opacity-90 active:scale-95 transition text-background font-bold text-xs rounded-none flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Courier Driver
          </button>
          <button
            onClick={handleRefresh}
            className="h-10 px-4 border border-border/40 bg-card hover:bg-muted/50 rounded-none text-xs font-bold text-foreground/70 flex items-center gap-2 active:scale-95 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Stats Widget Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border/40 p-4 rounded-none flex items-center shadow-sm">
          <div className="h-10 w-10 rounded-none bg-muted text-foreground flex items-center justify-center shrink-0">
            <Truck className="h-5 w-5" />
          </div>
          <div className="ml-3 min-w-0">
            <p className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-wider truncate">Registered Drivers</p>
            <p className="text-xl font-extrabold text-foreground mt-0.5">{stats.totalC}</p>
          </div>
        </div>

        <div className="bg-card border border-border/40 p-4 rounded-none flex items-center shadow-sm">
          <div className="h-10 w-10 rounded-none bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <UserCheck className="h-5 w-5" />
          </div>
          <div className="ml-3 min-w-0">
            <p className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-wider truncate">Active Roster</p>
            <p className="text-xl font-extrabold text-foreground mt-0.5">{stats.activeC}</p>
          </div>
        </div>

        <div className="bg-card border border-border/40 p-4 rounded-none flex items-center shadow-sm">
          <div className="h-10 w-10 rounded-none bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Package className="h-5 w-5" />
          </div>
          <div className="ml-3 min-w-0">
            <p className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-wider truncate">Total Packages</p>
            <p className="text-xl font-extrabold text-foreground mt-0.5">{stats.totalD}</p>
          </div>
        </div>

        <div className="bg-card border border-border/40 p-4 rounded-none flex items-center shadow-sm">
          <div className="h-10 w-10 rounded-none bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div className="ml-3 min-w-0">
            <p className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-wider truncate">Pending Dispatches</p>
            <p className="text-xl font-extrabold text-foreground mt-0.5">{stats.pendingD}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Active Couriers Drivers List */}
        <div className="xl:col-span-1 bg-card border border-border/40 rounded-none p-4 shadow-sm flex flex-col h-[520px]">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
            <UserCheck className="h-4.5 w-4.5 text-foreground" />
            <span>Delivery Roster</span>
          </h3>

          <div className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                placeholder="Search driver..."
                value={courierSearch}
                onChange={(e) => setCourierSearch(e.target.value)}
                className="pl-8 h-9 w-full bg-muted/5 border border-muted/10 rounded-none text-xs font-semibold focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
            <select
              value={courierFilter}
              onChange={(e) => setCourierFilter(e.target.value)}
              className="h-9 border border-muted/10 bg-muted/5 text-xs font-semibold px-2 rounded-none outline-none"
            >
              <option value="all">All</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredCouriers.map((c) => (
              <div key={c.id} className="border border-muted/5 bg-muted/5/50 p-3 rounded-none flex items-center justify-between hover:bg-muted/5 transition">
                <div className="min-w-0">
                  <p className="font-bold text-foreground text-xs truncate">{c.name}</p>
                  <p className="text-[10px] text-muted-foreground font-bold mt-0.5">📞 {c.phone}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                      c.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-muted/10 text-foreground"
                    }`}>
                      {c.status}
                    </span>
                    <span className="text-[9px] text-muted-foreground font-bold">⭐ {c.rating} ({c.totalDeliveries} trips)</span>
                  </div>
                </div>
              </div>
            ))}
            {filteredCouriers.length === 0 && (
              <p className="text-center text-xs font-bold text-muted-foreground py-12">No drivers registered</p>
            )}
          </div>
        </div>

        {/* Deliveries Dispatch Log Table */}
        <div className="xl:col-span-2 bg-card border border-border/40 rounded-none p-4 shadow-sm flex flex-col h-[520px]">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
            <Package className="h-4.5 w-4.5 text-foreground" />
            <span>Active Dispatch Log</span>
          </h3>

          <div className="flex flex-col sm:flex-row gap-2 mb-3 justify-between items-center w-full">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                placeholder="Search Order Number or Customer..."
                value={deliverySearch}
                onChange={(e) => setDeliverySearch(e.target.value)}
                className="pl-8 h-9 w-full bg-muted/5 border border-muted/10 rounded-none text-xs font-semibold focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>

            <div className="flex gap-2 w-full sm:w-auto shrink-0 justify-end">
              {["all", "PENDING", "DISPATCHED", "DELIVERED"].map((status) => (
                <button
                  key={status}
                  onClick={() => setDeliveryFilter(status)}
                  className={`px-3 py-1.5 text-[10px] font-extrabold rounded-none border capitalize transition ${
                    deliveryFilter === status
                      ? "bg-foreground text-background border-foreground"
                      : "bg-card hover:bg-muted/50 border-border/40 text-foreground/70"
                  }`}
                >
                  {status === "all" ? "All Shipments" : status.toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-x-auto overflow-y-auto pr-1">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-muted/10 text-[10px] font-extrabold text-muted-foreground uppercase">
                  <th className="py-2.5 font-extrabold">Order / Code</th>
                  <th className="py-2.5 font-extrabold">Recipient</th>
                  <th className="py-2.5 font-extrabold">Courier Driver</th>
                  <th className="py-2.5 font-extrabold text-center">Status</th>
                  <th className="py-2.5 font-extrabold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-muted/5">
                {filteredDeliveries.map((d) => (
                  <tr key={d.id} className="hover:bg-muted/5/50 transition">
                    <td className="py-3 pr-2">
                      <p className="font-extrabold text-foreground">{d.orderNumber}</p>
                      <p className="text-[9px] text-muted-foreground font-bold mt-0.5 truncate max-w-28">{d.trackingNumber}</p>
                    </td>
                    <td className="py-3 pr-2">
                      <p className="font-bold text-foreground">{d.customerName}</p>
                      <p className="text-[9px] text-muted-foreground font-bold mt-0.5 truncate max-w-32">📍 {d.address}</p>
                    </td>
                    <td className="py-3 pr-2 font-semibold text-foreground/70">
                      {d.courierName ? (
                        <div className="flex items-center gap-1">
                          <Truck className="h-3 w-3 text-muted-foreground" />
                          <span>{d.courierName}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-muted-foreground font-bold italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 pr-2 text-center">
                      <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full inline-block ${
                        d.status === "DELIVERED"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : d.status === "DISPATCHED"
                          ? "bg-blue-50 text-blue-700 border border-blue-100"
                          : "bg-amber-50 text-amber-700 border border-amber-100"
                      }`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => setSelectedDeliveryForWaybill(d)}
                        className="h-7 w-7 rounded-none border border-border/40 text-foreground/70 hover:bg-muted/5 inline-flex items-center justify-center active:scale-95 transition"
                        title="Print Waybill Label"
                      >
                        <Printer className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredDeliveries.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-xs font-bold text-muted-foreground">
                      No active shipments matching filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── ADD COURIER MODAL ── */}
      {isAddCourierOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border/40 rounded-none p-6 w-full max-w-md shadow-2xl animate-in scale-in duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-foreground">Add New Courier Driver</h3>
              <button
                onClick={() => setIsAddCourierOpen(false)}
                className="h-8 w-8 rounded-full hover:bg-muted/10 flex items-center justify-center text-muted/50 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddCourierSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-muted/50 block mb-1">Driver&apos;s Name</label>
                <input
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  required
                  className="h-11 w-full border border-border/40 px-3 rounded-none outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted/50 block mb-1">Phone Number</label>
                <input
                  value={courierPhone}
                  onChange={(e) => setCourierPhone(e.target.value)}
                  required
                  className="h-11 w-full border border-border/40 px-3 rounded-none outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                  placeholder="e.g. +94 77 987 6543"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted/50 block mb-1">Email Address</label>
                <input
                  value={courierEmail}
                  onChange={(e) => setCourierEmail(e.target.value)}
                  type="email"
                  className="h-11 w-full border border-border/40 px-3 rounded-none outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                  placeholder="driver@couriers.com"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted/50 block mb-1">Roster Status</label>
                <select
                  value={courierStatus}
                  onChange={(e) => setCourierStatus(e.target.value)}
                  className="h-11 w-full border border-border/40 px-3 rounded-none outline-none focus:ring-2 focus:ring-primary/20 text-sm font-semibold"
                >
                  <option value="ACTIVE">Active (On Call)</option>
                  <option value="INACTIVE">Inactive (Off Roster)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full h-12 bg-primary text-white rounded-none text-xs font-bold hover:bg-primary/95 transition mt-6 active:scale-95 shadow"
              >
                Save My Profile
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── PRINTABLE THERMAL WAYBILL MODAL ── */}
      {selectedDeliveryForWaybill && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border/40 rounded-none w-full max-w-sm overflow-hidden shadow-2xl flex flex-col animate-in scale-in duration-200">
            {/* Header toolbar */}
            <div className="flex justify-between items-center p-4 border-b">
              <h4 className="text-xs font-extrabold text-foreground uppercase tracking-wide">Waybill Thermal Preview</h4>
              <button
                onClick={() => setSelectedDeliveryForWaybill(null)}
                className="h-7 w-7 rounded-full hover:bg-muted/10 flex items-center justify-center text-muted/50 transition"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Thermal Slip Content */}
            <div className="p-6 bg-muted/5 overflow-y-auto max-h-[380px]">
              <div className="bg-background border-2 border-border/40 p-4 rounded-none shadow-inner font-mono text-[11px] text-foreground space-y-4">
                <div className="text-center space-y-1">
                  <h3 className="font-extrabold text-sm uppercase tracking-widest text-foreground">AUSSIE RIGS ARENA LOGISTICS</h3>
                  <p className="text-[9px] text-muted-foreground font-bold">1 Waybill Ave, Colombo, LK</p>
                  <p className="text-[10px] font-extrabold pt-2">TRACKING SLIP PREVIEW</p>
                </div>

                <div className="border-t border-dashed border-border/40 pt-3 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ORDER NO:</span>
                    <span className="font-bold">{selectedDeliveryForWaybill.orderNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">WAYBILL:</span>
                    <span className="font-bold text-[10px]">{selectedDeliveryForWaybill.trackingNumber || "PENDING"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">DATE:</span>
                    <span className="font-bold">2026-05-27</span>
                  </div>
                </div>

                <div className="border-t border-dashed border-border/40 pt-3 space-y-1">
                  <p className="text-muted-foreground font-extrabold">DELIVER TO RECIPIENT:</p>
                  <p className="font-extrabold text-foreground text-xs">{selectedDeliveryForWaybill.customerName}</p>
                  <p className="text-muted/50 leading-tight text-[10px] font-bold">{selectedDeliveryForWaybill.address}</p>
                  <p className="text-muted/50 text-[10px] font-bold">📞 {selectedDeliveryForWaybill.customerPhone}</p>
                </div>

                <div className="border-t border-dashed border-border/40 pt-3 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">DISPATCHED BY:</span>
                    <span className="font-bold">{selectedDeliveryForWaybill.courierName || "General Logistics"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">DISPATCH NOTES:</span>
                    <span className="font-bold">{selectedDeliveryForWaybill.notes || "Fragile Care"}</span>
                  </div>
                </div>

                <div className="border-t-2 border-dashed border-muted-foreground/30 pt-4 flex flex-col items-center justify-center space-y-1">
                  {/* Mock Barcode Block */}
                  <div className="w-48 h-8 bg-foreground flex items-center justify-center text-white text-[9px] tracking-[6px] font-extrabold">
                    *SL123456789*
                  </div>
                  <p className="text-[8px] text-muted-foreground font-bold uppercase tracking-wider">Scan waybill upon delivery arrival</p>
                </div>
              </div>
            </div>

            {/* Print trigger */}
            <div className="p-4 border-t bg-muted/5/50 flex gap-3">
              <button
                onClick={() => setSelectedDeliveryForWaybill(null)}
                className="flex-1 h-11 border border-border/40 hover:bg-muted/10 rounded-none text-xs font-bold text-foreground/70 transition"
              >
                Close Preview
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 h-11 bg-foreground text-white hover:bg-foreground rounded-none text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 shadow"
              >
                <Printer className="h-4 w-4" /> Print Thermal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
