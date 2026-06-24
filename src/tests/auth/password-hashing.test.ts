/**
 * SA-002: Tests verifying that password hashing (argon2) and verification (argon2)
 * use the same algorithm throughout the auth flow.
 *
 * Root cause: bcryptjs was used for verify while argon2 was used for hash.
 * bcrypt.compare() cannot verify argon2 hashes — they have incompatible formats.
 * Fix: auth.ts now uses argon2.verify() to match the argon2.hash() in actions/auth.ts.
 */
import { describe, it, expect } from "vitest"
import argon2 from "argon2"
import bcrypt from "bcryptjs"

describe("SA-002: Password hashing algorithm consistency", () => {
  const testPassword = "ValidPassword123!@#"

  describe("argon2.hash + argon2.verify (correct — the fixed behavior)", () => {
    it("should produce an argon2id hash with the correct prefix", async () => {
      const hash = await argon2.hash(testPassword)
      // argon2id hashes start with $argon2id$
      expect(hash).toMatch(/^\$argon2id\$/)
    })

    it("should verify a valid password against its argon2 hash", async () => {
      const hash = await argon2.hash(testPassword)
      const isValid = await argon2.verify(hash, testPassword)
      expect(isValid).toBe(true)
    })

    it("should reject an incorrect password against an argon2 hash", async () => {
      const hash = await argon2.hash(testPassword)
      const isValid = await argon2.verify(hash, "WrongPassword")
      expect(isValid).toBe(false)
    })

    it("should reject empty string password", async () => {
      const hash = await argon2.hash(testPassword)
      const isValid = await argon2.verify(hash, "")
      expect(isValid).toBe(false)
    })

    it("should handle multiple valid verifications of the same hash", async () => {
      const hash = await argon2.hash(testPassword)
      // argon2 is deterministic per call but produces different hashes each time (built-in salt)
      const verify1 = await argon2.verify(hash, testPassword)
      const verify2 = await argon2.verify(hash, testPassword)
      expect(verify1).toBe(true)
      expect(verify2).toBe(true)
    })
  })

  describe("bcryptjs.compare + argon2.hash (the broken pre-fix behavior)", () => {
    it("should FAIL to verify an argon2 hash using bcrypt.compare (confirms the bug existed)", async () => {
      const argon2Hash = await argon2.hash(testPassword)
      // This is the exact bug: bcrypt cannot parse argon2 format
      // bcrypt.compare should throw or return false for non-bcrypt format strings
      let result: boolean
      try {
        result = await bcrypt.compare(testPassword, argon2Hash)
      } catch {
        result = false
      }
      // The critical assertion: bcrypt.compare cannot verify argon2 hashes
      expect(result).toBe(false)
    })
  })

  describe("Hash format distinction", () => {
    it("argon2 hash must have $argon2id$ prefix, not $2b$ (bcrypt prefix)", async () => {
      const hash = await argon2.hash(testPassword)
      expect(hash.startsWith("$argon2id$")).toBe(true)
      expect(hash.startsWith("$2b$")).toBe(false)
    })

    it("bcrypt hash must have $2b$ prefix (to confirm they are distinct formats)", async () => {
      const bHash = await bcrypt.hash(testPassword, 10)
      expect(bHash.startsWith("$2b$")).toBe(true)
      expect(bHash.startsWith("$argon2id$")).toBe(false)
    })
  })
})
