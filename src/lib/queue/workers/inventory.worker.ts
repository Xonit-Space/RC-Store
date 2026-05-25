import { Job } from "bullmq"
import { createWorker } from "../worker"

export const inventoryWorker = createWorker("inventory", async (job: Job) => {
  const { action, items, orderId } = job.data
  console.log(`[InventoryWorker] Processing ${action} for order ${orderId}`)
  
  // Simulate inventory DB update
  await new Promise(resolve => setTimeout(resolve, 400))
  
  return { updated: true, itemsCount: items?.length }
})
