"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, Search, Package, RefreshCw, X, Edit, Upload, ImagePlus } from "lucide-react"
import { toast } from "sonner"
import { adminCreateProduct, adminUpdateProduct } from "@/actions/product"
import { getProductAddons } from "@/actions/addons"
import { useQueryClient } from "@tanstack/react-query"
import Image from "next/image"

// --- Variants, Media, Docs actions ---
import { 
  adminAddVariant, adminUpdateVariant, adminAddProductVideo, 
  adminDeleteProductVideo, adminAddProductDocument, adminDeleteProductDocument,
  adminAddProductFeatureBlock, adminDeleteProductFeatureBlock,
  adminAddRelatedProduct, adminDeleteRelatedProduct
} from "@/actions/product"

// --- Sub-components (Tabs) will go here ---

