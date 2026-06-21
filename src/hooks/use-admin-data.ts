import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

export function useAdminInventory() {
  return useQuery({
    queryKey: ["admin", "inventory"],
    queryFn: async () => {
      const res = await fetch("/api/admin/inventory")
      if (!res.ok) throw new Error("Failed to load inventory allocations")
      const json = await res.json()
      return json.items || json.data || json.products || json
    }
  })
}

export function useAdminCoupons() {
  return useQuery({
    queryKey: ["admin", "coupons"],
    queryFn: async () => {
      const res = await fetch("/api/admin/coupons")
      if (!res.ok) throw new Error("Failed to load coupons")
      return res.json()
    }
  })
}

export function useAdminCreateCoupon() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error("Failed to register coupon")
      const data = await res.json()
      if (!data.success) throw new Error(data.error || "Failed to register coupon")
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "coupons"] })
    }
  })
}

export function useAdminProducts() {
  return useQuery({
    queryKey: ["admin", "products"],
    queryFn: async () => {
      const res = await fetch("/api/products")
      if (!res.ok) throw new Error("Failed to load products")
      const json = await res.json()
      return json.items || json.data || json.products || json
    }
  })
}

export function useAdminCategories() {
  return useQuery({
    queryKey: ["admin", "categories"],
    queryFn: async () => {
      const res = await fetch("/api/products/categories")
      if (!res.ok) throw new Error("Failed to load categories")
      return res.json()
    }
  })
}

export function useAdminCustomers(page = 1, limit = 24) {
  return useQuery({
    queryKey: ["admin", "customers", page, limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      })
      const res = await fetch(`/api/pos/customers?${params}`)
      if (!res.ok) throw new Error("Failed to load customers")
      return res.json()
    }
  })
}

export function useAdminOrders(page = 1, limit = 20, search = "") {
  return useQuery({
    queryKey: ["admin", "orders", page, limit, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(search ? { search } : {}),
      })
      const res = await fetch(`/api/admin/orders?${params}`)
      if (!res.ok) throw new Error("Failed to load orders")
      return res.json()
    }
  })
}
