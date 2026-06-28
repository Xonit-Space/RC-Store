"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Settings, Save, Bell, Shield, Loader2 } from "lucide-react"
import { toast } from "sonner"

type TabType = "general" | "security" | "notifications"

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("general")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  const [settings, setSettings] = useState<Record<string, string>>({
    storeName: "RC Store",
    contactEmail: "support@rcstore.com",
    orderPrefix: "ORD-",
    require2fa: "true",
    sessionTimeout: "30",
    passwordPolicy: "standard",
    notifyNewOrder: "true",
    notifyLowInventory: "true",
    notifyDailySummary: "false"
  })

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/admin/settings")
        if (res.ok) {
          const { data } = await res.json()
          setSettings(prev => ({ ...prev, ...data }))
        }
      } catch (err) {
        console.error("Failed to load settings:", err)
      } finally {
        setIsLoading(false)
      }
    }
    loadSettings()
  }, [])

  const handleChange = (key: string, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [key]: String(value) }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      })
      if (!res.ok) throw new Error("Failed to save")
      toast.success("Platform settings updated successfully")
    } catch (err) {
      toast.error("Failed to update settings")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
  }

  return (
    <div className="space-y-8 font-sans">
      <div className="pb-6 border-b border-border/40">
        <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-1">
          Configuration
        </p>
        <h2 className="font-sans text-3xl font-light text-foreground leading-none">
          System Settings
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-2">
          <button 
            onClick={() => setActiveTab("general")}
            className={`w-full flex items-center gap-3 p-4 transition-colors text-left ${activeTab === "general" ? "bg-muted/10 border border-border/40 text-foreground" : "hover:bg-muted/5 border border-transparent text-muted-foreground"}`}
          >
            <Settings className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">General</span>
          </button>
          <button 
            onClick={() => setActiveTab("security")}
            className={`w-full flex items-center gap-3 p-4 transition-colors text-left ${activeTab === "security" ? "bg-muted/10 border border-border/40 text-foreground" : "hover:bg-muted/5 border border-transparent text-muted-foreground"}`}
          >
            <Shield className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Security</span>
          </button>
          <button 
            onClick={() => setActiveTab("notifications")}
            className={`w-full flex items-center gap-3 p-4 transition-colors text-left ${activeTab === "notifications" ? "bg-muted/10 border border-border/40 text-foreground" : "hover:bg-muted/5 border border-transparent text-muted-foreground"}`}
          >
            <Bell className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Notifications</span>
          </button>
        </div>

        <div className="lg:col-span-8">
          <div className="bg-white dark:bg-background border border-border/40 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] hover:shadow-[0_10px_40px_rgba(255,204,0,0.15)] dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] dark:hover:shadow-[0_0_50px_rgba(255,204,0,0.3)] hover:border-racing-yellow/50 transition-all duration-300 p-8">
            <form onSubmit={handleSave} className="space-y-8">
              
              {activeTab === "general" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div>
                    <h3 className="font-sans text-xl font-light text-foreground mb-1">Store Details</h3>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Manage core platform identity</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Store Name</label>
                    <Input
                      value={settings.storeName}
                      onChange={e => handleChange("storeName", e.target.value)}
                      className="h-12 bg-transparent border-border/60 rounded-none focus-visible:ring-0 focus-visible:border-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Contact Email</label>
                    <Input
                      value={settings.contactEmail}
                      onChange={e => handleChange("contactEmail", e.target.value)}
                      type="email"
                      className="h-12 bg-transparent border-border/60 rounded-none focus-visible:ring-0 focus-visible:border-foreground"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Order Prefix</label>
                    <Input
                      value={settings.orderPrefix}
                      onChange={e => handleChange("orderPrefix", e.target.value)}
                      className="h-12 bg-transparent border-border/60 rounded-none focus-visible:ring-0 focus-visible:border-foreground font-mono"
                    />
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-2">Example: ORD-10256</p>
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div>
                    <h3 className="font-sans text-xl font-light text-foreground mb-1">Security Standards</h3>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Protect access to the admin panel</p>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-border/40 bg-muted/5">
                    <div>
                      <p className="text-sm font-bold text-foreground">Two-Factor Authentication (2FA)</p>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Require 2FA for all admin accounts</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={settings.require2fa === "true"} onChange={e => handleChange("require2fa", e.target.checked)} />
                      <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-racing-yellow"></div>
                    </label>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Session Timeout (Minutes)</label>
                    <Input
                      value={settings.sessionTimeout}
                      onChange={e => handleChange("sessionTimeout", e.target.value)}
                      type="number"
                      className="h-12 bg-transparent border-border/60 rounded-none focus-visible:ring-0 focus-visible:border-foreground"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Password Policy</label>
                    <select 
                      value={settings.passwordPolicy}
                      onChange={e => handleChange("passwordPolicy", e.target.value)}
                      className="w-full h-12 bg-transparent border border-border/60 rounded-none focus-visible:ring-0 focus-visible:border-foreground px-3 text-sm outline-none"
                    >
                      <option value="standard">Standard (8+ chars, 1 number)</option>
                      <option value="strict">Strict (12+ chars, special char, uppercase)</option>
                    </select>
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div>
                    <h3 className="font-sans text-xl font-light text-foreground mb-1">Alert Preferences</h3>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Manage automated system emails</p>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-border/40 bg-muted/5">
                    <div>
                      <p className="text-sm font-bold text-foreground">New Order Alerts</p>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Email on successful checkout</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={settings.notifyNewOrder === "true"} onChange={e => handleChange("notifyNewOrder", e.target.checked)} />
                      <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-racing-yellow"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-border/40 bg-muted/5">
                    <div>
                      <p className="text-sm font-bold text-foreground">Low Inventory Warning</p>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Email when stock hits threshold</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={settings.notifyLowInventory === "true"} onChange={e => handleChange("notifyLowInventory", e.target.checked)} />
                      <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-racing-yellow"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-border/40 bg-muted/5">
                    <div>
                      <p className="text-sm font-bold text-foreground">Daily Summary</p>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Daily sales and traffic digest</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={settings.notifyDailySummary === "true"} onChange={e => handleChange("notifyDailySummary", e.target.checked)} />
                      <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-racing-yellow"></div>
                    </label>
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-border/40">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-12 rounded-none bg-foreground text-background text-xs font-bold uppercase tracking-widest px-8 hover:bg-foreground/90 transition-colors"
                >
                  {isSubmitting ? "Saving Config..." : (
                    <>
                      <Save className="w-4 h-4 mr-2" /> Save Configuration
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
