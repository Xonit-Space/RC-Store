import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

export function useAdminInventory(page = 1, limit = 15, search = "") {
  return useQuery({
    queryKey: ["admin", "inventory", page, limit, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(search ? { search } : {}),
      })
      const res = await fetch(`/api/admin/inventory?${params}`)
      if (!res.ok) throw new Error("Failed to load inventory allocations")
      const json = await res.json()
      return json || { data: [], pagination: { total: 0, totalPages: 0, page: 1, limit } }
    }
  })
}

export function useAdminCoupons() {
  return useQuery({
    queryKey: ["admin", "coupons"],
    queryFn: async () => {
      const res = await fetch("/api/admin/coupons")
      if (!res.ok) throw new Error("Failed to load coupons")
      const json = await res.json()
      return json.data || []
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

export function useAdminProducts(page = 1, limit = 10, search = "", categoryId = "") {
  return useQuery({
    queryKey: ["admin", "products", page, limit, search, categoryId],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(search ? { search } : {}),
        ...(categoryId ? { categoryId } : {}),
      })
      const res = await fetch(`/api/admin/products?${params}`)
      if (!res.ok) throw new Error("Failed to load products")
      const json = await res.json()
      return json.data || { products: [], pagination: { total: 0, pages: 0, page: 1, limit: 10 } }
    }
  })
}

export function useAdminProduct(productId: string) {
  return useQuery({
    queryKey: ["admin", "product", productId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/products/${productId}`)
      if (!res.ok) throw new Error("Failed to load product")
      const json = await res.json()
      return json.data || null
    },
    enabled: !!productId
  })
}

export function useAdminCategories() {
  return useQuery({
    queryKey: ["admin", "categories"],
    queryFn: async () => {
      const res = await fetch("/api/products/categories")
      if (!res.ok) throw new Error("Failed to load categories")
      const json = await res.json()
      return json.data || []
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
      const res = await fetch(`/api/admin/customers?${params}`)
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

export function useAdminReviews(page = 1, limit = 20, search = "") {
  return useQuery({
    queryKey: ["admin", "reviews", page, limit, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(search ? { search } : {}),
      })
      const res = await fetch(`/api/admin/reviews?${params}`)
      if (!res.ok) throw new Error("Failed to load reviews")
      return res.json()
    }
  })
}

export function useAdminUpdateReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, isApproved }: { id: string; isApproved: boolean }) => {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved }),
      })
      if (!res.ok) throw new Error("Failed to update review")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] })
    }
  })
}

export function useAdminDeleteReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to delete review")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] })
    }
  })
}
