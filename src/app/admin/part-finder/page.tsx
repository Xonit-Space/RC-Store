"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { getVehicleMakes, getVehicleModels, createVehicleMake, createVehicleModel, deleteVehicleMake, deleteVehicleModel } from "@/actions/part-finder"
import { Package, Plus, Trash2, FolderTree, ArrowRight, ChevronDown, ChevronRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useQuery } from "@tanstack/react-query"
import { getCategories } from "@/actions/categories"
import { getAddons } from "@/actions/addons"
import { FullProductEditModal } from "@/components/admin/product/full-product-edit-modal"
import { ModelPartsGrid } from "@/components/admin/part-finder/model-parts-grid"

export default function AdminPartFinderPage() {
  const [makes, setMakes] = useState<any[]>([])
  const [models, setModels] = useState<any[]>([])
  
  const [expandedMakes, setExpandedMakes] = useState<string[]>([])

  const [isMakeModalOpen, setIsMakeModalOpen] = useState(false)
  const [newMakeName, setNewMakeName] = useState("")
  const [newMakeSlug, setNewMakeSlug] = useState("")
  
  const [isModelModalOpen, setIsModelModalOpen] = useState(false)
  const [selectedMakeForModel, setSelectedMakeForModel] = useState<string>("")
  const [newModelName, setNewModelName] = useState("")
  const [newModelSlug, setNewModelSlug] = useState("")
  const [newModelScale, setNewModelScale] = useState("1/10")
  const [newModelType, setNewModelType] = useState("Off-Road")

  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadData = async () => {
    try {
      const makesData = await getVehicleMakes()
      const modelsData = await getVehicleModels()
      setMakes(makesData)
      setModels(modelsData)
    } catch (error) {
      toast.error("Failed to load part finder data")
    }
  }

  // ─── Data fetching for Product Modal ───────────────────────────────────────
  const { data: dbCategories = [] } = useQuery({
    queryKey: ["admin", "categories-data"],
    queryFn: () => getCategories()
  })
  const { data: availableAddons = [] } = useQuery({
    queryKey: ["admin", "addons-data"],
    queryFn: () => getAddons()
  })

  // ─── Modal state ────────────────────────────────────────────────────────────
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [editingProductId, setEditingProductId] = useState("")
  const [initialModelId, setInitialModelId] = useState("")

  const openEditPartModal = (productId: string) => {
    setEditingProductId(productId)
    setInitialModelId("")
    setIsProductModalOpen(true)
  }

  const openAddPartModal = (modelId: string) => {
    setEditingProductId("")
    setInitialModelId(modelId)
    setIsProductModalOpen(true)
  }

  useEffect(() => {
    loadData()
  }, [])

  const toggleMake = (makeId: string) => {
    setExpandedMakes(prev => 
      prev.includes(makeId) ? prev.filter(id => id !== makeId) : [...prev, makeId]
    )
  }

  const handleAddMake = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await createVehicleMake({ name: newMakeName, slug: newMakeSlug })
      toast.success("Vehicle Make added")
      setNewMakeName("")
      setNewMakeSlug("")
      setIsMakeModalOpen(false)
      loadData()
    } catch {
      toast.error("Failed to add Make")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddModel = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMakeForModel) {
      toast.error("Select a Make first")
      return
    }
    setIsSubmitting(true)
    try {
      await createVehicleModel({
        makeId: selectedMakeForModel,
        name: newModelName,
        slug: newModelSlug,
        scale: newModelScale,
        type: newModelType
      })
      toast.success("Vehicle Model added")
      setNewModelName("")
      setNewModelSlug("")
      setIsModelModalOpen(false)
      if (!expandedMakes.includes(selectedMakeForModel)) {
        setExpandedMakes(prev => [...prev, selectedMakeForModel])
      }
      loadData()
    } catch {
      toast.error("Failed to add Model")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteMake = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if(!confirm("Delete this Make and all its models?")) return
    try {
      await deleteVehicleMake(id)
      toast.success("Deleted Make")
      loadData()
    } catch {
      toast.error("Failed to delete")
    }
  }

  const handleDeleteModel = async (id: string) => {
    if(!confirm("Delete this Model?")) return
    try {
      await deleteVehicleModel(id)
      toast.success("Deleted Model")
      loadData()
    } catch {
      toast.error("Failed to delete")
    }
  }

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-border/40">
        <div>
          <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-1">
            Catalog Logic
          </p>
          <h2 className="font-sans text-3xl font-light text-foreground leading-none">
            Part Finder Management
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsMakeModalOpen(true)}
            className="h-10 px-5 rounded-none bg-foreground text-background font-semibold text-[10px] uppercase tracking-widest hover:bg-foreground/90 transition-colors"
          >
            <Plus className="h-3.5 w-3.5 mr-2" /> Add Make
          </Button>
          <Button
            onClick={() => setIsModelModalOpen(true)}
            className="h-10 px-5 rounded-none bg-background text-foreground border border-foreground font-semibold text-[10px] uppercase tracking-widest hover:bg-muted transition-colors"
          >
            <Plus className="h-3.5 w-3.5 mr-2" /> Add Model
          </Button>
        </div>
      </div>

      <div className="max-w-4xl space-y-4">
        {makes.length === 0 ? (
           <div className="border border-border/40 p-12 text-center bg-background">
            <FolderTree className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
              No Vehicle Makes
            </p>
            <p className="text-[10px] text-muted-foreground mt-2">
              Start by adding a new make
            </p>
          </div>
        ) : (
          makes.map(make => {
            const isExpanded = expandedMakes.includes(make.id)
            const makeModels = models.filter(m => m.makeId === make.id)
            return (
              <div key={make.id} className="bg-white dark:bg-background border border-border/40 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] transition-all duration-300">
                <div 
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => toggleMake(make.id)}
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? <ChevronDown className="w-5 h-5 text-muted-foreground" /> : <ChevronRight className="w-5 h-5 text-muted-foreground" />}
                    <div>
                      <h3 className="text-base font-bold uppercase tracking-wider text-foreground">{make.name}</h3>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{makeModels.length} Models</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      onClick={(e) => handleDeleteMake(make.id, e)} 
                      className="text-terracotta hover:bg-terracotta/10 hover:text-terracotta p-2 h-auto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-4 pt-0 border-t border-border/40 bg-muted/5">
                    {makeModels.length === 0 ? (
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground p-4 text-center">No models added yet.</p>
                    ) : (
                      <div className="grid grid-cols-1 gap-6 mt-4">
                        {makeModels.map(model => (
                          <div key={model.id} className="bg-white dark:bg-background border border-border/40 p-4 flex flex-col group hover:border-racing-yellow/50 transition-colors">
                            
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm font-bold uppercase tracking-wider text-foreground">{model.name} <span className="opacity-50 font-normal">({model.scale})</span></p>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{model.type}</p>
                              </div>
                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" onClick={() => handleDeleteModel(model.id)} className="text-terracotta hover:bg-terracotta/10 hover:text-terracotta p-1.5 h-auto">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </div>
                            
                            {/* NEW: Parts Grid Rendered Inline */}
                            <div className="mt-4 pt-4 border-t border-border/40">
                              <ModelPartsGrid 
                                modelId={model.id}
                                onEditPart={openEditPartModal}
                                onAddPart={() => openAddPartModal(model.id)}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Add Make Modal */}
      {isMakeModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-background border border-border/40 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] relative">
            <div className="flex items-start justify-between p-6 border-b border-border/40">
              <h3 className="font-sans text-xl font-light text-foreground">
                New Vehicle Make
              </h3>
              <button onClick={() => setIsMakeModalOpen(false)} className="text-muted-foreground hover:text-foreground transition">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <form id="make-form" onSubmit={handleAddMake} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Make Name</label>
                  <input 
                    required
                    placeholder="e.g. Traxxas"
                    className="w-full bg-white dark:bg-background border border-border/60 h-10 px-3 focus:outline-none focus:border-foreground transition-colors text-sm"
                    value={newMakeName}
                    onChange={(e) => {
                      setNewMakeName(e.target.value)
                      setNewMakeSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'))
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Slug</label>
                  <input 
                    required
                    className="w-full bg-muted/50 border border-border/60 h-10 px-3 text-sm text-muted-foreground"
                    value={newMakeSlug}
                    readOnly
                  />
                </div>
              </form>
            </div>
            <div className="flex gap-4 justify-end px-6 py-4 border-t border-border/40 bg-muted/5">
              <Button type="button" variant="outline" onClick={() => setIsMakeModalOpen(false)} disabled={isSubmitting} className="rounded-none h-10 text-xs uppercase tracking-widest">Cancel</Button>
              <Button type="submit" form="make-form" disabled={isSubmitting} className="rounded-none h-10 bg-foreground text-background text-xs uppercase tracking-widest">
                {isSubmitting ? "Saving..." : "Add Make"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Model Modal */}
      {isModelModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-background border border-border/40 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] relative">
            <div className="flex items-start justify-between p-6 border-b border-border/40">
              <h3 className="font-sans text-xl font-light text-foreground">
                New Vehicle Model
              </h3>
              <button onClick={() => setIsModelModalOpen(false)} className="text-muted-foreground hover:text-foreground transition">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <form id="model-form" onSubmit={handleAddModel} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Select Make</label>
                  <select 
                    required
                    value={selectedMakeForModel}
                    onChange={e => setSelectedMakeForModel(e.target.value)}
                    className="w-full bg-white dark:bg-background border border-border/60 h-10 px-3 focus:outline-none focus:border-foreground transition-colors text-sm"
                  >
                    <option value="">-- SELECT MAKE --</option>
                    {makes.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Model Name</label>
                    <input 
                      required
                      placeholder="e.g. X-Maxx"
                      className="w-full bg-white dark:bg-background border border-border/60 h-10 px-3 focus:outline-none focus:border-foreground transition-colors text-sm"
                      value={newModelName}
                      onChange={(e) => {
                        setNewModelName(e.target.value)
                        setNewModelSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'))
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Scale</label>
                    <input 
                      required
                      placeholder="1/10"
                      className="w-full bg-white dark:bg-background border border-border/60 h-10 px-3 focus:outline-none focus:border-foreground transition-colors text-sm"
                      value={newModelScale}
                      onChange={(e) => setNewModelScale(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Type</label>
                  <input 
                    required
                    placeholder="e.g. Monster Truck"
                    className="w-full bg-white dark:bg-background border border-border/60 h-10 px-3 focus:outline-none focus:border-foreground transition-colors text-sm"
                    value={newModelType}
                    onChange={(e) => setNewModelType(e.target.value)}
                  />
                </div>
              </form>
            </div>
            <div className="flex gap-4 justify-end px-6 py-4 border-t border-border/40 bg-muted/5">
              <Button type="button" variant="outline" onClick={() => setIsModelModalOpen(false)} disabled={isSubmitting} className="rounded-none h-10 text-xs uppercase tracking-widest">Cancel</Button>
              <Button type="submit" form="model-form" disabled={isSubmitting} className="rounded-none h-10 bg-foreground text-background text-xs uppercase tracking-widest">
                {isSubmitting ? "Saving..." : "Add Model"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Product Edit Modal */}
      <FullProductEditModal 
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        initialProductId={editingProductId}
        initialVehicleModelId={initialModelId}
        dbCategories={dbCategories}
        availableAddons={availableAddons}
        onSuccess={() => {
          // You could invalidate queries here, but the queries themselves handles invalidation on update
        }}
      />
    </div>
  )
}
