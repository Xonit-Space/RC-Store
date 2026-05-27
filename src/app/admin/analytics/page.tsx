"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw, TrendingUp, DollarSign, Calendar, BarChart2 } from "lucide-react"

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<any>({
    totalRevenue: 124530,
    totalOrders: 2350,
    avgBasketValue: 53.00,
  })
  const [loading, setLoading] = useState(false)

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 h-64">
        <RefreshCw className="h-8 w-8 text-primary animate-spin" />
        <span className="text-xs font-bold text-slate-400 mt-2">Loading telemetry...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="pb-4 border-b">
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight leading-snug">Telemetry Analytics Canvas</h2>
        <p className="text-xs text-slate-400 font-semibold mt-0.5">Visualize transaction distributions and platform revenue streams.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-slate-100 rounded-2xl shadow-sm bg-card p-5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
            <CardTitle className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Average Basket Value</CardTitle>
            <DollarSign className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent className="p-0 pt-3">
            <div className="text-2xl font-extrabold text-slate-800 tracking-tight">Rs. {stats.avgBasketValue.toFixed(2)}</div>
            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wide">Per unique transaction</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-100 rounded-2xl shadow-sm bg-card p-5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
            <CardTitle className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Revenues Run-Rate</CardTitle>
            <TrendingUp className="w-5 h-5 text-green-500 animate-pulse" />
          </CardHeader>
          <CardContent className="p-0 pt-3">
            <div className="text-2xl font-extrabold text-slate-800 tracking-tight">Rs. {(stats.totalRevenue * 12).toLocaleString()}</div>
            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wide">Projected Annualised Rate</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-100 rounded-2xl shadow-sm bg-card p-5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
            <CardTitle className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Active Subscribers</CardTitle>
            <BarChart2 className="w-5 h-5 text-blue-500" />
          </CardHeader>
          <CardContent className="p-0 pt-3">
            <div className="text-2xl font-extrabold text-slate-800 tracking-tight">8,549 Accounts</div>
            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wide">98.5% Active status checking</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-slate-100 rounded-2xl shadow-sm bg-card overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-5">
          <CardTitle className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">Hourly Conversions distribution</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-64 bg-slate-50 border border-slate-100 border-dashed rounded-xl flex flex-col items-center justify-center p-6 text-center">
            <TrendingUp className="h-10 w-10 text-slate-300 mb-2" />
            <p className="text-xs font-bold text-slate-600">Hourly Distribution graph</p>
            <span className="text-[10px] text-slate-400 mt-0.5">Integrations to standard analytical engines are live and streaming metrics to dashboards.</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
