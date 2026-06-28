"use server"

import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

async function isAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role as string)) {
    throw new Error("Unauthorized")
  }
}

// ---------------------------
// VEHICLE MAKES
// ---------------------------
export async function getVehicleMakes() {
  return db.vehicleMake.findMany({
    orderBy: { name: "asc" }
  })
}

export async function createVehicleMake(data: { name: string; slug: string; logo?: string }) {
  await isAdmin()
  return db.vehicleMake.create({ data })
}

export async function updateVehicleMake(id: string, data: { name: string; slug: string; logo?: string }) {
  await isAdmin()
  return db.vehicleMake.update({ where: { id }, data })
}

export async function deleteVehicleMake(id: string) {
  await isAdmin()
  return db.vehicleMake.delete({ where: { id } })
}

// ---------------------------
// VEHICLE MODELS
// ---------------------------
export async function getVehicleModels(makeId?: string) {
  return db.vehicleModel.findMany({
    where: makeId ? { makeId } : undefined,
    include: { make: true },
    orderBy: { name: "asc" }
  })
}

export async function createVehicleModel(data: { makeId: string; name: string; slug: string; scale?: string; type?: string; image?: string }) {
  await isAdmin()
  return db.vehicleModel.create({ data })
}

export async function updateVehicleModel(id: string, data: { makeId: string; name: string; slug: string; scale?: string; type?: string; image?: string }) {
  await isAdmin()
  return db.vehicleModel.update({ where: { id }, data })
}

export async function deleteVehicleModel(id: string) {
  await isAdmin()
  return db.vehicleModel.delete({ where: { id } })
}

// ---------------------------
// COMPATIBILITY (Linking Products)
// ---------------------------
export async function linkProductToModel(vehicleModelId: string, productId: string) {
  await isAdmin()
  return db.partCompatibility.create({
    data: { vehicleModelId, productId }
  })
}

export async function unlinkProductFromModel(vehicleModelId: string, productId: string) {
  await isAdmin()
  return db.partCompatibility.delete({
    where: {
      productId_vehicleModelId: { productId, vehicleModelId }
    }
  })
}

export async function getCompatibleParts(vehicleModelId: string) {
  const compatibilities = await db.partCompatibility.findMany({
    where: { vehicleModelId },
    include: {
      product: {
        include: {
          images: { take: 1, orderBy: { sortOrder: "asc" } },
          category: true
        }
      }
    }
  })
  return compatibilities.map(c => c.product)
}

export async function getProductCompatibleModels(productId: string) {
  const compatibilities = await db.partCompatibility.findMany({
    where: { productId },
    include: {
      vehicleModel: {
        include: { make: true }
      }
    }
  })
  return compatibilities.map(c => c.vehicleModel)
}
