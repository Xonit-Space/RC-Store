"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Settings, Save, Bell, Shield } from "lucide-react"
import { toast } from "sonner"

type TabType = "general" | "security" | "notifications"

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("general")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setTimeout(() => {
      toast.success("Platform settings updated successfully")
      setIsSubmitting(false)
    }, 1000)
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
          <div className="border border-border/40 bg-background p-8">
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
                      defaultValue="Aussie Rigs Arena"
                      className="h-12 bg-transparent border-border/60 rounded-none focus-visible:ring-0 focus-visible:border-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Contact Email</label>
                    <Input
                      defaultValue="support@aussierigsarena.com"
                      type="email"
                      className="h-12 bg-transparent border-border/60 rounded-none focus-visible:ring-0 focus-visible:border-foreground"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Order Prefix</label>
                    <Input
                      defaultValue="ORD-"
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
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-racing-yellow"></div>
                    </label>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Session Timeout (Minutes)</label>
                    <Input
                      defaultValue="30"
                      type="number"
                      className="h-12 bg-transparent border-border/60 rounded-none focus-visible:ring-0 focus-visible:border-foreground"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Password Policy</label>
                    <select className="w-full h-12 bg-transparent border border-border/60 rounded-none focus-visible:ring-0 focus-visible:border-foreground px-3 text-sm outline-none">
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
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-racing-yellow"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-border/40 bg-muted/5">
                    <div>
                      <p className="text-sm font-bold text-foreground">Low Inventory Warning</p>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Email when stock hits threshold</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-racing-yellow"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-border/40 bg-muted/5">
                    <div>
                      <p className="text-sm font-bold text-foreground">Daily Summary</p>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Daily sales and traffic digest</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
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
