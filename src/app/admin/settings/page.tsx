"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Settings, Save, Bell, Shield, Paintbrush } from "lucide-react"
import { toast } from "sonner"

export default function AdminSettingsPage() {
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
          <button className="w-full flex items-center gap-3 p-4 bg-muted/10 border border-border/40 text-left text-foreground">
            <Settings className="w-4 h-4 text-muted-foreground" />
            <span className="text-[10px] font-bold uppercase tracking-widest">General</span>
          </button>
          <button className="w-full flex items-center gap-3 p-4 hover:bg-muted/5 border border-transparent text-left text-muted-foreground transition-colors">
            <Shield className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Security</span>
          </button>
          <button className="w-full flex items-center gap-3 p-4 hover:bg-muted/5 border border-transparent text-left text-muted-foreground transition-colors">
            <Bell className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Notifications</span>
          </button>
          <button className="w-full flex items-center gap-3 p-4 hover:bg-muted/5 border border-transparent text-left text-muted-foreground transition-colors">
            <Paintbrush className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Appearance</span>
          </button>
        </div>

        <div className="lg:col-span-8">
          <div className="border border-border/40 bg-background p-8">
            <form onSubmit={handleSave} className="space-y-8">
              <div className="space-y-6">
                <div>
                  <h3 className="font-sans text-xl font-light text-foreground mb-1">Store Details</h3>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Manage core platform identity</p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Store Name</label>
                  <Input
                    defaultValue="NeoShop Ultra"
                    className="h-12 bg-transparent border-border/60 rounded-none focus-visible:ring-0 focus-visible:border-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Contact Email</label>
                  <Input
                    defaultValue="support@neoshop.com"
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
