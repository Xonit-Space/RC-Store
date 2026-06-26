"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { getVehicleMakes, getVehicleModels, createVehicleMake, createVehicleModel, deleteVehicleMake, deleteVehicleModel } from "@/actions/part-finder"
import { Package, Plus, Trash2, FolderTree, ArrowRight } from "lucide-react"

export default function AdminPartFinderPage() {
  const [makes, setMakes] = useState<any[]>([])
  const [models, setModels] = useState<any[]>([])
  
  const [newMakeName, setNewMakeName] = useState("")
  const [newMakeSlug, setNewMakeSlug] = useState("")
  
  const [selectedMake, setSelectedMake] = useState<string>("")
  const [newModelName, setNewModelName] = useState("")
  const [newModelSlug, setNewModelSlug] = useState("")
  const [newModelScale, setNewModelScale] = useState("1/10")
  const [newModelType, setNewModelType] = useState("Off-Road")

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

  useEffect(() => {
    loadData()
  }, [])

  const handleAddMake = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createVehicleMake({ name: newMakeName, slug: newMakeSlug })
      toast.success("Vehicle Make added")
      setNewMakeName("")
      setNewMakeSlug("")
      loadData()
    } catch {
      toast.error("Failed to add Make")
    }
  }

  const handleAddModel = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMake) {
      toast.error("Select a Make first")
      return
    }
    try {
      await createVehicleModel({
        makeId: selectedMake,
        name: newModelName,
        slug: newModelSlug,
        scale: newModelScale,
        type: newModelType
      })
      toast.success("Vehicle Model added")
      setNewModelName("")
      setNewModelSlug("")
      loadData()
    } catch {
      toast.error("Failed to add Model")
    }
  }

  const handleDeleteMake = async (id: string) => {
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
    <div className="space-y-8">
      <div className="pb-6 border-b border-border/40">
        <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-1">
          Catalog Logic
        </p>
        <h2 className="font-sans text-3xl font-light text-foreground leading-none">
          Part Finder Management
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* MAKES SECTION */}
        <div className="space-y-6 border border-border/40 p-6 bg-muted/5">
          <div className="flex items-center gap-2 border-b border-border/40 pb-4">
            <FolderTree className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">Vehicle Makes</h3>
          </div>

          <form onSubmit={handleAddMake} className="flex gap-2">
            <input 
              required
              placeholder="Name (e.g. Traxxas)"
              className="flex-1 bg-background border border-border/40 text-xs p-2 uppercase tracking-wider"
              value={newMakeName}
              onChange={(e) => {
                setNewMakeName(e.target.value)
                setNewMakeSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'))
              }}
            />
            <input 
              required
              placeholder="slug"
              className="w-32 bg-background border border-border/40 text-xs p-2 text-muted-foreground"
              value={newMakeSlug}
              readOnly
            />
            <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 hover:opacity-90">
              <Plus className="w-4 h-4" />
            </button>
          </form>

          <div className="space-y-2">
            {makes.map(make => (
              <div key={make.id} className="flex justify-between items-center bg-background border border-border/40 p-3">
                <span className="text-xs font-bold uppercase tracking-wider text-foreground">{make.name}</span>
                <button onClick={() => handleDeleteMake(make.id)} className="text-terracotta hover:bg-terracotta/10 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* MODELS SECTION */}
        <div className="space-y-6 border border-border/40 p-6 bg-muted/5">
          <div className="flex items-center gap-2 border-b border-border/40 pb-4">
            <Package className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">Vehicle Models</h3>
          </div>

          <form onSubmit={handleAddModel} className="space-y-3">
            <select 
              required
              value={selectedMake}
              onChange={e => setSelectedMake(e.target.value)}
              className="w-full bg-background border border-border/40 text-xs p-3 uppercase tracking-wider"
            >
              <option value="">-- SELECT MAKE --</option>
              {makes.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            
            <div className="flex gap-2">
              <input 
                required
                placeholder="Model Name (e.g. X-Maxx)"
                className="flex-1 bg-background border border-border/40 text-xs p-2 uppercase tracking-wider"
                value={newModelName}
                onChange={(e) => {
                  setNewModelName(e.target.value)
                  setNewModelSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'))
                }}
              />
              <input 
                required
                placeholder="Scale (1/5)"
                className="w-24 bg-background border border-border/40 text-xs p-2 uppercase tracking-wider"
                value={newModelScale}
                onChange={(e) => setNewModelScale(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
               <input 
                required
                placeholder="Type (Monster Truck)"
                className="flex-1 bg-background border border-border/40 text-xs p-2 uppercase tracking-wider"
                value={newModelType}
                onChange={(e) => setNewModelType(e.target.value)}
              />
              <button type="submit" className="bg-primary text-primary-foreground px-6 py-2 hover:opacity-90 font-bold uppercase tracking-widest text-[10px]">
                Add Model
              </button>
            </div>
          </form>

          <div className="space-y-2 mt-4 max-h-[400px] overflow-y-auto">
            {models.map(model => (
              <div key={model.id} className="flex justify-between items-center bg-background border border-border/40 p-3 group">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">{model.make?.name}</p>
                  <p className="text-xs font-bold uppercase tracking-wider text-foreground">{model.name} <span className="opacity-50 font-normal">({model.scale})</span></p>
                </div>
                <div className="flex items-center gap-2">
                  <a href={`/admin/part-finder/${model.id}`} className="text-[10px] text-primary uppercase tracking-widest hover:underline flex items-center gap-1">
                    Manage Parts <ArrowRight className="w-3 h-3" />
                  </a>
                  <button onClick={() => handleDeleteModel(model.id)} className="text-terracotta hover:bg-terracotta/10 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
