import { describe, it, expect, vi, beforeEach } from "vitest"
import { forgotPassword } from "@/actions/auth"
import { sendPasswordResetEmail } from "@/services/email"
import { db } from "@/lib/db"

vi.mock("@/services/email", () => ({
  sendPasswordResetEmail: vi.fn().mockResolvedValue({ id: "mock_email_id" }),
}))

vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: vi.fn(),
    },
    passwordResetToken: {
      create: vi.fn(),
    },
  },
}))

vi.mock("@/lib/security/rate-limit", () => ({
  rateLimit: vi.fn().mockResolvedValue({ success: true }),
}))

describe("FLOW-002: Password reset email flow", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should generate a token and send an email when the user exists", async () => {
    // Mock user exists
    vi.mocked(db.user.findUnique).mockResolvedValue({ id: "user_abc", email: "test@example.com" } as any)
    
    // Mock token creation success
    vi.mocked(db.passwordResetToken.create).mockResolvedValue({} as any)

    const result = await forgotPassword("test@example.com")
    
    expect(result.success).toBe(true)
    expect(db.passwordResetToken.create).toHaveBeenCalledOnce()
    expect(sendPasswordResetEmail).toHaveBeenCalledOnce()
    
    // Assert email was called with correct arguments
    const [calledEmail, calledToken] = vi.mocked(sendPasswordResetEmail).mock.calls[0]
    expect(calledEmail).toBe("test@example.com")
    expect(calledToken).toBeTypeOf("string")
    expect(calledToken.length).toBeGreaterThan(10) // UUID check
  })

  it("should NOT send an email when the user does NOT exist, but return success", async () => {
    // Mock user does NOT exist
    vi.mocked(db.user.findUnique).mockResolvedValue(null)
    
    const result = await forgotPassword("missing@example.com")
    
    expect(result.success).toBe(true) // Prevent email enumeration
    expect(db.passwordResetToken.create).not.toHaveBeenCalled()
    expect(sendPasswordResetEmail).not.toHaveBeenCalled()
  })

  it("should return an error for an invalid email format", async () => {
    const result = await forgotPassword("invalid-email")
    
    expect(result.error).toBeDefined()
    expect(db.passwordResetToken.create).not.toHaveBeenCalled()
    expect(sendPasswordResetEmail).not.toHaveBeenCalled()
  })
})
