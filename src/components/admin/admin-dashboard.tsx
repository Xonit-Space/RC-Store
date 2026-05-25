"use client"

import { useState } from "react"
import { BarChart3, Package, Users, ShoppingCart, TrendingUp, Settings, Bell, Search, Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export function AdminDashboard() {
  const [activeModule, setActiveModule] = useState("overview")

  const stats = [
    {
      title: "Total Revenue",
      value: "$45,231.89",
      change: "+20.1%",
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      title: "Orders",
      value: "2,350",
      change: "+180.1%",
      icon: ShoppingCart,
      color: "text-blue-600",
    },
    {
      title: "Products",
      value: "12,234",
      change: "+19%",
      icon: Package,
      color: "text-purple-600",
    },
    {
      title: "Customers",
      value: "8,549",
      change: "+201",
      icon: Users,
      color: "text-orange-600",
    },
  ]

  const modules = [
    { id: "overview", name: "Overview", icon: BarChart3 },
    { id: "products", name: "Products", icon: Package },
    { id: "orders", name: "Orders", icon: ShoppingCart },
    { id: "customers", name: "Customers", icon: Users },
    { id: "settings", name: "Settings", icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">NEOSHOP ULTRA Admin</h1>
            <Badge variant="secondary">v2.0</Badge>
          </div>

          <div className="ml-auto flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-8 w-64" />
            </div>
            <Button variant="outline" size="icon">
              <Bell className="h-4 w-4" />
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-muted/10 min-h-[calc(100vh-4rem)]">
          <nav className="p-4 space-y-2">
            {modules.map((module) => (
              <Button
                key={module.id}
                variant={activeModule === module.id ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveModule(module.id)}
              >
                <module.icon className="h-4 w-4 mr-2" />
                {module.name}
              </Button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeModule === "overview" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Dashboard Overview</h2>
                <Button variant="outline">Export Report</Button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                  <Card key={stat.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                      <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <p className="text-xs text-muted-foreground">
                        <span className="text-green-600">{stat.change}</span> from last month
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Charts and Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
                      <p className="text-muted-foreground">Chart Component Here</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">Order #{1000 + i}</p>
                            <p className="text-sm text-muted-foreground">Customer {i}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${(Math.random() * 500 + 50).toFixed(2)}</p>
                            <Badge variant="outline">Processing</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeModule === "products" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Product Management</h2>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Product
                </Button>
              </div>

              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Product Management</h3>
                    <p className="text-muted-foreground">
                      Advanced product management features will be implemented here
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Add other module content as needed */}
        </main>
      </div>
    </div>
  )
}
