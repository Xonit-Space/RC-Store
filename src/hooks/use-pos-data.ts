import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

export function usePosProducts() {
  return useQuery({
    queryKey: ["pos", "products"],
    queryFn: async () => {
      const res = await fetch("/api/pos/products")
      if (!res.ok) throw new Error("Failed to fetch POS catalog")
      const json = await res.json()
      return json.data || []
    }
  })
}

export function usePosCustomers() {
  return useQuery({
    queryKey: ["pos", "customers"],
    queryFn: async () => {
      const res = await fetch("/api/pos/customers")
      if (!res.ok) throw new Error("Failed to fetch customer accounts")
      const json = await res.json()
      return json.data || []
    }
  })
}

export function usePosCheckout() {
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch("/api/pos/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error("Checkout transaction failed")
      const result = await res.json()
      if (!result.success) throw new Error(result.error || "Checkout failed")
      return result
    }
  })
}

export function usePosCreateCustomer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch("/api/pos/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error("Failed to register customer")
      const result = await res.json()
      if (!result.success) throw new Error(result.error || "Failed to register customer")
      return result.data
    },
    onSuccess: (newCustomer) => {
      queryClient.setQueryData(["pos", "customers"], (old: any[]) => {
        return old ? [newCustomer, ...old] : [newCustomer]
      })
    }
  })
}
