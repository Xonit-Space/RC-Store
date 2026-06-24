import { describe, it, expect, beforeAll, afterAll } from "vitest"
import { Job } from "bullmq"
import { queueConnection, emailQueue, analyticsQueue } from "@/lib/queue"
import { emailWorker } from "@/lib/queue/workers/email.worker"
import { analyticsWorker } from "@/lib/queue/workers/analytics.worker"

describe("Aussie Rigs Arena Enterprise Background Queue Infrastructure", () => {
  beforeAll(async () => {
    // Clear out testing queues if they exist to start fresh
    await emailQueue.obliterate({ force: true }).catch(() => {})
    await analyticsQueue.obliterate({ force: true }).catch(() => {})
  })

  afterAll(async () => {
    await emailWorker.close()
    await analyticsWorker.close()
    await queueConnection.quit()
  })

  it("should successfully enqueue an email job and process it asynchronously via BullMQ workers", async () => {
    const job = await emailQueue.add("test_email", {
      to: "test@neoshop.ultra",
      subject: "Test Job",
      html: "<p>Processing</p>"
    })

    expect(job).toBeDefined()
    expect(job.id).toBeDefined()

    // Wait for the worker to process the job
    const completedJob = await new Promise<Job | undefined>((resolve) => {
      emailWorker.on("completed", (j) => {
        if (j.id === job.id) resolve(j)
      })
      // Timeout guard
      setTimeout(() => resolve(undefined), 3000)
    })

    expect(completedJob).toBeDefined()
    expect(completedJob?.returnvalue.delivered).toBe(true)
  })

  it("should safely process analytical aggregations via analytics worker queue", async () => {
    const job = await analyticsQueue.add("test_analytics", {
      event: "TEST_EVENT",
      userId: "usr_tester_99"
    })

    const completedJob = await new Promise<Job | undefined>((resolve) => {
      analyticsWorker.on("completed", (j) => {
        if (j.id === job.id) resolve(j)
      })
      setTimeout(() => resolve(undefined), 3000)
    })

    expect(completedJob).toBeDefined()
    expect(completedJob?.returnvalue.processed).toBe(true)
    expect(completedJob?.returnvalue.event).toBe("TEST_EVENT")
  })
})
