"use client"

import React, { useState, useEffect, useMemo } from "react"
import { usePosStore, OrderItem } from "@/store/usePosStore"
import { Search, Plus, Trash2, Users, Coins, Calculator, Check, X, ShieldAlert, MonitorDot, AlertCircle } from "lucide-react"

export function POSManagement() {
  const { orderItems, addItem, increaseQty, decreaseQty, setQty, clearCart } = usePosStore()
  
  const [products, setProducts] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false)
  const [customerSearchQuery, setCustomerSearchQuery] = useState("")
  
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [cashReceived, setCashReceived] = useState<string>("")
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CARD" | "CREDIT">("CASH")
  const [isCompleteOpen, setIsCompleteOpen] = useState(false)
  const [completedOrderNo, setCompletedOrderNo] = useState("")

  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false)
  const [newCustName, setNewCustName] = useState("")
  const [newCustPhone, setNewCustPhone] = useState("")
  const [newCustEmail, setNewCustEmail] = useState("")

  // 1. Fetch initial POS products and customer records
  const fetchPosData = async () => {
    setLoading(true)
    setError(null)
    try {
      const prodRes = await fetch("/api/pos/products")
      if (!prodRes.ok) throw new Error("Failed to fetch POS catalog")
      const prodData = await prodRes.json()
      setProducts(prodData || [])

      const custRes = await fetch("/api/pos/customers")
      if (!custRes.ok) throw new Error("Failed to fetch customer accounts")
      const custData = await custRes.json()
      setCustomers(custData.data || [])
    } catch (err: any) {
      setError(err.message || "Failed to load database resources")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosData()
  }, [])

  // 2. Barcode scanner physical event hook
  useEffect(() => {
    let barcodeString = ""
    let timeoutId: NodeJS.Timeout | null = null

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        if (barcodeString.length > 0) {
          const matchedItem = products.find((p) => p.barcode === barcodeString)
          if (matchedItem) {
            addItem(matchedItem)
          }
          barcodeString = ""
        }
        return
      }

      if (e.key.length === 1) {
        barcodeString += e.key
        if (timeoutId) clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          barcodeString = ""
        }, 50)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [products, addItem])

  // 3. Compute active checkout subtotals
  const subtotal = useMemo(() => {
    return orderItems.reduce((sum, item) => sum + item.price * item.qty, 0)
  }, [orderItems])

  const tax = useMemo(() => subtotal * 0.08, [subtotal])
  const total = useMemo(() => subtotal + tax, [subtotal])

  // 4. Filtering criteria
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (p.barcode && p.barcode.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesCategory = categoryFilter === "all" || 
                              (categoryFilter === "jacket" && p.name.toLowerCase().includes("jacket")) ||
                              (categoryFilter === "pants" && p.name.toLowerCase().includes("pants"))
      return matchesSearch && matchesCategory
    })
  }, [products, searchQuery, categoryFilter])

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const q = customerSearchQuery.toLowerCase()
      return c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.email.toLowerCase().includes(q)
    })
  }, [customers, customerSearchQuery])

  // 5. Handle Live Customer Registration
  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCustName) return
    try {
      const response = await fetch("/api/pos/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCustName, phone: newCustPhone, email: newCustEmail })
      })
      if (!response.ok) throw new Error("Failed to register customer")
      const result = await response.json()
      if (result.success) {
        setSelectedCustomer(result.data)
        setCustomers([result.data, ...customers])
        setIsNewCustomerOpen(false)
        setIsCustomerModalOpen(false)
        setNewCustName("")
        setNewCustPhone("")
        setNewCustEmail("")
      }
    } catch (err) {
      console.error(err)
    }
  }

  // 6. Submit POS sale checkout
  const handleProcessPayment = async () => {
    try {
      const checkoutPayload = {
        customerId: selectedCustomer?.id || undefined,
        items: orderItems.map((it) => ({
          variantId: it.id,
          quantity: it.qty,
          unitPrice: it.price
        })),
        payment: {
          paymentType: paymentMethod,
          amount: total,
          cashReceived: paymentMethod === "CASH" ? Number(cashReceived) || total : 0,
          changeToGive: paymentMethod === "CASH" ? Math.max(0, (Number(cashReceived) || total) - total) : 0
        },
        note: `POS Store Sale - Method: ${paymentMethod}`
      }

      const res = await fetch("/api/pos/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(checkoutPayload)
      })

      if (!res.ok) throw new Error("Checkout transaction failed")
      const result = await res.json()
      
      if (result.success) {
        setCompletedOrderNo(result.data.orderNumber)
        clearCart()
        setSelectedCustomer(null)
        setCashReceived("")
        setIsPaymentModalOpen(false)
        setIsCompleteOpen(true)
        // Refresh products list to show decremented stocks
        fetchPosData()
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]">
      {/* Product Catalog Grid (Left Side) */}
      <div className="flex-1 flex flex-col min-w-0 bg-card rounded-2xl border p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mb-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Scan Barcode or Search name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-11 w-full bg-muted/40 border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium transition"
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            {["all", "jacket", "pants"].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-4 py-2 text-xs font-bold rounded-xl border capitalize transition active:scale-95 ${
                  categoryFilter === cat
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-white hover:bg-slate-50 border-slate-200 text-slate-600"
                }`}
              >
                {cat}s
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 animate-pulse">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-slate-100 dark:bg-slate-800 rounded-2xl h-40" />
            ))}
          </div>
        ) : error ? (
          <div className="flex-grow flex flex-col items-center justify-center text-center p-6">
            <ShieldAlert className="h-12 w-12 text-red-500 mb-2" />
            <p className="text-sm font-semibold text-slate-700">{error}</p>
            <button onClick={fetchPosData} className="mt-4 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl">
              Retry Load
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center text-center py-16 text-slate-400">
            <AlertCircle className="h-12 w-12 text-slate-300 mb-3" />
            <p className="font-semibold text-sm">No items match your filters</p>
          </div>
        ) : (
          <div className="flex-grow overflow-y-auto pr-1">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => addItem(p)}
                  className="group bg-white hover:bg-slate-50/50 border border-slate-100 rounded-2xl p-3 flex flex-col justify-between cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="aspect-square bg-slate-50 rounded-xl overflow-hidden mb-3 relative flex items-center justify-center">
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="object-cover w-full h-full group-hover:scale-105 transition duration-300" />
                    ) : (
                      <MonitorDot className="h-8 w-8 text-slate-300" />
                    )}
                    <span className="absolute bottom-2 right-2 text-[10px] font-bold bg-slate-900/80 text-white px-2 py-0.5 rounded-md backdrop-blur-sm">
                      {p.barcode ? "SKU" : "POS"}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-xs line-clamp-2 leading-tight min-h-8">
                      {p.name}
                    </h3>
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-extrabold text-blue-600 text-sm">
                        Rs. {p.price.toLocaleString()}
                      </span>
                      <div className="h-7 w-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition">
                        <Plus className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Cart & Customer Panel (Right Side) */}
      <div className="w-full lg:w-[420px] bg-card rounded-2xl border p-4 flex flex-col shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
          <span>Checkout Register</span>
          <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-extrabold">Active</span>
        </h2>

        {/* Customer Selector Block */}
        <div className="border border-slate-100 rounded-2xl p-3 bg-slate-50/50 mb-4">
          {selectedCustomer ? (
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-slate-800 text-sm">{selectedCustomer.name}</p>
                <p className="text-[11px] text-slate-400 font-bold mt-1">📞 {selectedCustomer.phone}</p>
                {selectedCustomer.email && <p className="text-[11px] text-slate-400 font-bold">✉️ {selectedCustomer.email}</p>}
                <p className="text-[10px] text-emerald-600 font-extrabold mt-1.5 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded inline-block">
                  ⭐ Loyalty points: {selectedCustomer.points}
                </p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-xs text-red-500 hover:text-red-700 font-bold border border-red-200 bg-white px-3 py-1 rounded-xl transition"
              >
                Clear
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsCustomerModalOpen(true)}
              className="w-full h-12 flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 hover:border-primary/50 text-slate-500 hover:text-primary transition font-bold text-sm bg-white"
            >
              <Users className="h-4 w-4" />
              Add or Select Customer
            </button>
          )}
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto pr-1 mb-4 space-y-3">
          {orderItems.map((item) => (
            <div key={item.id} className="flex gap-3 pb-3 border-b border-slate-100 items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800 text-xs truncate">{item.name}</p>
                <p className="text-xs text-blue-600 font-extrabold mt-1">
                  Rs. {item.price.toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => decreaseQty(item.id)}
                  className="h-8 w-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold flex items-center justify-center active:scale-95 transition"
                >
                  –
                </button>
                <span className="text-sm font-bold text-slate-900 w-6 text-center">{item.qty}</span>
                <button
                  onClick={() => increaseQty(item.id)}
                  className="h-8 w-8 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-extrabold flex items-center justify-center active:scale-95 transition"
                >
                  +
                </button>
                <button
                  onClick={() => setQty(item.id, 0)}
                  className="h-8 w-8 rounded-lg border border-red-100 text-red-500 hover:bg-red-50 flex items-center justify-center transition ml-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}

          {orderItems.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center py-12 text-slate-400">
              <Coins className="h-10 w-10 text-slate-300 mb-2" />
              <p className="text-xs font-semibold">Your checkouts cart is empty</p>
            </div>
          )}
        </div>

        {/* Total Ledger Block */}
        <div className="pt-4 border-t border-slate-100 space-y-2.5">
          <div className="flex justify-between text-xs font-semibold text-slate-500">
            <span>Basket Subtotal</span>
            <span>Rs. {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-xs font-semibold text-slate-500">
            <span>Tax (8%)</span>
            <span>Rs. {tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between font-extrabold text-blue-600 text-base pt-1">
            <span>Grand Total</span>
            <span>Rs. {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={() => {
                clearCart()
                setSelectedCustomer(null)
              }}
              className="flex-1 h-12 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 transition active:scale-95"
            >
              Reset
            </button>
            <button
              onClick={() => {
                if (total > 0) setIsPaymentModalOpen(true)
              }}
              disabled={total === 0}
              className="flex-[2] h-12 bg-primary text-primary-foreground hover:bg-primary/95 disabled:opacity-50 rounded-xl text-xs font-bold transition shadow-sm active:scale-95"
            >
              Pay & Checkout
            </button>
          </div>
        </div>
      </div>

      {/* ── CUSTOMER SELECTOR MODAL ── */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl animate-in scale-in duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">
                {isNewCustomerOpen ? "Register New Customer" : "Select Customer Profile"}
              </h3>
              <button
                onClick={() => {
                  setIsCustomerModalOpen(false)
                  setIsNewCustomerOpen(false)
                }}
                className="h-8 w-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {isNewCustomerOpen ? (
              <form onSubmit={handleCreateCustomer} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Full Name</label>
                  <input
                    value={newCustName}
                    onChange={(e) => setNewCustName(e.target.value)}
                    required
                    className="h-11 w-full border border-slate-200 px-3 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                    placeholder="Enter customer name"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Phone Number</label>
                  <input
                    value={newCustPhone}
                    onChange={(e) => setNewCustPhone(e.target.value)}
                    required
                    className="h-11 w-full border border-slate-200 px-3 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                    placeholder="e.g. +94 77 123 4567"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Email Address</label>
                  <input
                    value={newCustEmail}
                    onChange={(e) => setNewCustEmail(e.target.value)}
                    type="email"
                    className="h-11 w-full border border-slate-200 px-3 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                    placeholder="customer@domain.com"
                  />
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsNewCustomerOpen(false)}
                    className="flex-1 h-11 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 transition"
                  >
                    Back to Search
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-11 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/95 transition"
                  >
                    Register Customer
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <input
                  placeholder="Search by Name, Phone, or Email..."
                  value={customerSearchQuery}
                  onChange={(e) => setCustomerSearchQuery(e.target.value)}
                  className="h-11 w-full border border-slate-200 px-3 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                />

                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                  {filteredCustomers.map((cust) => (
                    <div
                      key={cust.id}
                      onClick={() => {
                        setSelectedCustomer(cust)
                        setIsCustomerModalOpen(false)
                      }}
                      className="border border-slate-100 hover:border-primary/30 p-3 rounded-xl hover:bg-slate-50/50 cursor-pointer flex justify-between items-center transition"
                    >
                      <div>
                        <p className="font-bold text-slate-800 text-xs">{cust.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">📞 {cust.phone} | {cust.email}</p>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        Pts: {cust.points}
                      </span>
                    </div>
                  ))}
                  {filteredCustomers.length === 0 && (
                    <p className="text-center py-6 text-xs text-slate-400 font-bold">No customers found</p>
                  )}
                </div>

                <button
                  onClick={() => setIsNewCustomerOpen(true)}
                  className="w-full h-11 bg-blue-50 text-blue-600 rounded-xl font-bold text-xs hover:bg-blue-100/80 transition"
                >
                  Create New Customer Account
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── PAYMENT CALCULATOR MODAL ── */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in scale-in duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Calculator className="h-5 w-5 text-blue-600" />
                <span>Finalize POS checkout</span>
              </h3>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="h-8 w-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl mb-4 text-center">
              <span className="text-xs font-bold text-slate-500 block mb-1">TOTAL AMOUNT DUE</span>
              <span className="text-2xl font-extrabold text-blue-600">
                Rs. {total.toLocaleString()}
              </span>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-3 gap-2.5 mb-4">
              {["CASH", "CARD", "CREDIT"].map((method) => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method as any)}
                  className={`h-11 rounded-xl text-xs font-bold border transition ${
                    paymentMethod === method
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white hover:bg-slate-50 text-slate-600 border-slate-200"
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>

            {paymentMethod === "CASH" && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">CASH RECEIVED</label>
                  <input
                    type="number"
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    required
                    className="h-11 w-full border border-slate-200 px-3 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                    placeholder="Enter amount cash..."
                  />
                </div>

                <div className="flex gap-2">
                  {[2000, 5000, 10000].map((val) => (
                    <button
                      key={val}
                      onClick={() => setCashReceived(String(val))}
                      className="flex-1 h-9 rounded-lg border border-slate-200 text-xs font-extrabold text-slate-600 hover:bg-slate-50 active:scale-95 transition"
                    >
                      Rs. {val}
                    </button>
                  ))}
                </div>

                {Number(cashReceived) >= total && (
                  <div className="flex justify-between items-center p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl">
                    <span className="text-xs font-bold text-emerald-800">CHANGE TO GIVE:</span>
                    <span className="font-extrabold text-emerald-800 text-sm">
                      Rs. {(Number(cashReceived) - total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
              </div>
            )}

            {paymentMethod === "CREDIT" && (
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-amber-900 text-xs font-bold space-y-1 animate-in fade-in duration-150">
                <p>⚠️ Store Credit checkout policies:</p>
                <p className="font-medium text-[11px] text-amber-700 pt-1">
                  Ensure the selected customer has sufficient credit limit before proceeding with this option.
                </p>
              </div>
            )}

            <button
              onClick={handleProcessPayment}
              disabled={paymentMethod === "CASH" && Number(cashReceived) < total}
              className="w-full h-12 bg-primary text-white hover:bg-primary/95 disabled:opacity-50 transition rounded-xl text-xs font-bold mt-6 active:scale-95 shadow"
            >
              Confirm Checkout Payment
            </button>
          </div>
        </div>
      )}

      {/* ── ORDER COMPLETE POPUP ── */}
      {isCompleteOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-sm text-center shadow-2xl animate-in scale-in duration-200">
            <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8" />
            </div>

            <h3 className="text-lg font-bold text-slate-800">Order Completed</h3>
            <p className="text-xs text-slate-400 font-bold mt-1">Invoice Reference: #{completedOrderNo}</p>

            <div className="my-6 border-t border-dashed border-slate-200" />
            <p className="text-slate-500 text-xs font-semibold leading-relaxed">
              The sale was recorded successfully in the e-commerce database. Inventory counts have been synchronized.
            </p>

            <button
              onClick={() => setIsCompleteOpen(false)}
              className="mt-6 w-full h-11 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition active:scale-95"
            >
              Continue Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
