"use client"

import { useState, useEffect, useTransition } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { 
  Settings, 
  Save, 
  RefreshCw, 
  Shield, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  DollarSign, 
  Database,
  Sliders,
  Globe,
  Activity,
  AlertCircle
} from "lucide-react"
import { toast } from "sonner"
import { getSiteSettings, updateSiteSettingsBulk, getRecentAuditLogs } from "@/actions/settings"

type TabType = "general" | "commerce" | "integrations" | "audit"

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("general")
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  const loadData = async () => {
    setLoading(true)
    try {
      const [settingsRes, logsRes] = await Promise.all([
        getSiteSettings(),
        getRecentAuditLogs()
      ])

      if (settingsRes.success && settingsRes.data) {
        setSettings(settingsRes.data)
      } else {
        toast.error(settingsRes.error || "Failed to load site configurations")
      }

      if (logsRes.success && logsRes.data) {
        setAuditLogs(logsRes.data)
      } else {
        toast.error(logsRes.error || "Failed to load operations logs")
      }
    } catch (err) {
      toast.error("Unexpected error occurred while fetching platform telemetry.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      try {
        const res = await updateSiteSettingsBulk(settings)
        if (res.success) {
          toast.success("Platform settings successfully synchronized with central database!")
          // Reload audit logs to show the changes
          const logsRes = await getRecentAuditLogs()
          if (logsRes.success && logsRes.data) {
            setAuditLogs(logsRes.data)
          }
        } else {
          toast.error(res.error || "Failed to apply settings adjustment.")
        }
      } catch (err) {
        toast.error("Critical database sync error occurred.")
      }
    })
  }

  const handleToggle = (key: string, checked: boolean) => {
    setSettings((prev) => ({
      ...prev,
      [key]: checked ? "true" : "false"
    }))
  }

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value
    }))
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 h-64 font-sans">
        <RefreshCw className="h-8 w-8 text-primary animate-spin" />
        <span className="text-xs font-bold text-slate-400 mt-2">Loading platform configuration matrix...</span>
      </div>
    )
  }

  const tabs = [
    { id: "general", name: "General Shop", icon: Sliders },
    { id: "commerce", name: "Commerce & Shipping", icon: DollarSign },
    { id: "integrations", name: "Integrations & Sync", icon: Globe },
    { id: "audit", name: "Audit Trail Telemetry", icon: Activity }
  ]

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight leading-snug">Platform Settings</h2>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">Control global storefront variables, checkout thresholds, payment bridges, and audit operational logs.</p>
        </div>
        
        {activeTab !== "audit" && (
          <Button
            onClick={handleSave}
            disabled={isPending}
            className="h-11 px-5 rounded-xl bg-primary text-white font-bold hover:bg-primary/95 transition active:scale-95 flex items-center justify-center shadow-md shadow-primary/10"
          >
            {isPending ? (
              <>
                <RefreshCw className="h-4.5 w-4.5 mr-2 animate-spin" />
                Synchronizing...
              </>
            ) : (
              <>
                <Save className="h-4.5 w-4.5 mr-2" /> Save Configuration
              </>
            )}
          </Button>
        )}
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-slate-100 pb-px gap-2 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 -mb-px shrink-0 outline-none ${
                isActive
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.name}
            </button>
          )
        })}
      </div>

      {/* Tab Contents */}
      <div className="pt-2">
        {activeTab === "general" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border border-slate-100 rounded-2xl shadow-sm bg-card overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-5">
                  <CardTitle className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">General Store Identity</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Store Name</Label>
                      <Input
                        type="text"
                        value={settings["store_name"] || ""}
                        onChange={(e) => handleChange("store_name", e.target.value)}
                        placeholder="e.g. NeoShop Ultra"
                        className="h-11 border-slate-200 rounded-xl"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Support Email Address</Label>
                      <Input
                        type="email"
                        value={settings["store_email"] || ""}
                        onChange={(e) => handleChange("store_email", e.target.value)}
                        placeholder="e.g. support@neoshop.com"
                        className="h-11 border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Store Hotline Contact</Label>
                    <Input
                      type="text"
                      value={settings["store_phone"] || ""}
                      onChange={(e) => handleChange("store_phone", e.target.value)}
                      placeholder="e.g. +94 77 123 4567"
                      className="h-11 border-slate-200 rounded-xl"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-slate-100 rounded-2xl shadow-sm bg-card overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-5">
                  <CardTitle className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Storefront Access Control</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl bg-slate-50/40">
                    <div className="space-y-0.5">
                      <p className="text-xs font-extrabold text-slate-700">Open Public Checkout</p>
                      <p className="text-[10px] text-slate-400 font-semibold max-w-md">When disabled, customers can browse items but cannot finalize purchases (Under Maintenance mode).</p>
                    </div>
                    <Switch
                      checked={settings["store_status_open"] === "true"}
                      onCheckedChange={(checked) => handleToggle("store_status_open", checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border border-slate-100 rounded-2xl shadow-sm bg-card overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-5">
                  <CardTitle className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">System Info & Node Details</CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs font-semibold py-1">
                      <span className="text-slate-400 uppercase tracking-wide text-[10px]">Framework</span>
                      <span className="text-slate-700">Next.js v14.2.16</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-semibold py-1">
                      <span className="text-slate-400 uppercase tracking-wide text-[10px]">Database Engine</span>
                      <span className="text-slate-700">PostgreSQL (Prisma Client)</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-semibold py-1">
                      <span className="text-slate-400 uppercase tracking-wide text-[10px]">Active Node Cluster</span>
                      <span className="text-slate-700 font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded">ap-south-1a</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-semibold py-1">
                      <span className="text-slate-400 uppercase tracking-wide text-[10px]">Telemetry Status</span>
                      <span className="flex items-center gap-1.5 text-green-600">
                        <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                        Nominal Live
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "commerce" && (
          <div className="max-w-3xl space-y-6">
            <Card className="border border-slate-100 rounded-2xl shadow-sm bg-card overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-5">
                <CardTitle className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Fiscal & Threshold Parameters</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sales Tax Rate (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={settings["tax_rate"] || ""}
                      onChange={(e) => handleChange("tax_rate", e.target.value)}
                      placeholder="e.g. 12.0"
                      className="h-11 border-slate-200 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Free Shipping Minimum (Rs.)</Label>
                    <Input
                      type="number"
                      value={settings["free_shipping_threshold"] || ""}
                      onChange={(e) => handleChange("free_shipping_threshold", e.target.value)}
                      placeholder="e.g. 150.0"
                      className="h-11 border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Default Shop Currency</Label>
                  <select
                    value={settings["currency"] || "LKR"}
                    onChange={(e) => handleChange("currency", e.target.value)}
                    className="h-11 border border-slate-200 rounded-xl w-full text-xs font-bold text-slate-600 px-3 outline-none"
                  >
                    <option value="LKR">LKR (Sri Lankan Rupee)</option>
                    <option value="USD">USD (United States Dollar)</option>
                    <option value="EUR">EUR (Euro)</option>
                    <option value="GBP">GBP (British Pound)</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "integrations" && (
          <div className="max-w-3xl space-y-6">
            <Card className="border border-slate-100 rounded-2xl shadow-sm bg-card overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-5">
                <CardTitle className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">External Gateways & Modules</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl bg-slate-50/40">
                  <div className="space-y-0.5">
                    <p className="text-xs font-extrabold text-slate-700">Stripe Payment Bridge</p>
                    <p className="text-[10px] text-slate-400 font-semibold max-w-md">Enable real-time transaction processing via secure Stripe checkouts.</p>
                  </div>
                  <Switch
                    checked={settings["stripe_enabled"] === "true"}
                    onCheckedChange={(checked) => handleToggle("stripe_enabled", checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl bg-slate-50/40">
                  <div className="space-y-0.5">
                    <p className="text-xs font-extrabold text-slate-700">Real-Time POS Sessions Sync</p>
                    <p className="text-[10px] text-slate-400 font-semibold max-w-md">Keep administrative Point of Sale terminals synchronized with inventory stock locking.</p>
                  </div>
                  <Switch
                    checked={settings["pos_sync_enabled"] === "true"}
                    onCheckedChange={(checked) => handleToggle("pos_sync_enabled", checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl bg-slate-50/40">
                  <div className="space-y-0.5">
                    <p className="text-xs font-extrabold text-slate-700">Logistics Auto-Assign Couriers</p>
                    <p className="text-[10px] text-slate-400 font-semibold max-w-md">Automatically route dispatched shipment operations logs to free active couriers.</p>
                  </div>
                  <Switch
                    checked={settings["courier_auto_assign"] === "true"}
                    onCheckedChange={(checked) => handleToggle("courier_auto_assign", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "audit" && (
          <Card className="border border-slate-100 rounded-2xl shadow-sm bg-card overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-5 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">System Operations Audit Trail</CardTitle>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Showing recent configuration alterations logged by administrators.</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={loadData}
                className="h-8 px-3 text-[10px] font-bold rounded-lg border-slate-200 text-slate-600 flex items-center hover:bg-slate-50 active:scale-95 transition"
              >
                <RefreshCw className="h-3 w-3 mr-1" /> Reload Logs
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {auditLogs.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-500">No operations logs registered yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/40 text-slate-400 font-extrabold uppercase text-[9px] tracking-wider">
                        <th className="p-4">Timestamp</th>
                        <th className="p-4">Actor</th>
                        <th className="p-4">Action</th>
                        <th className="p-4">Entity Context</th>
                        <th className="p-4 max-w-xs truncate">Log Changes Meta</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600 font-semibold">
                      {auditLogs.map((log) => {
                        const actor = log.user?.name || log.user?.email || "System Daemon"
                        const role = log.user?.role || "SYSTEM"
                        
                        return (
                          <tr key={log.id} className="hover:bg-slate-50/40 transition">
                            <td className="p-4 font-mono text-[10px] text-slate-400">
                              {new Date(log.createdAt).toLocaleString()}
                            </td>
                            <td className="p-4">
                              <span className="block text-slate-700 font-bold">{actor}</span>
                              <span className="text-[9px] text-slate-400 uppercase font-extrabold tracking-wide">{role}</span>
                            </td>
                            <td className="p-4">
                              <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-indigo-50 text-indigo-700 border border-indigo-100">
                                {log.action}
                              </span>
                            </td>
                            <td className="p-4 text-slate-500 font-mono text-[10px]">
                              {log.entity} #{log.entityId || "SYSTEM"}
                            </td>
                            <td className="p-4 text-[10px] font-mono max-w-xs truncate text-slate-400" title={log.changes}>
                              {log.changes || "N/A"}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
