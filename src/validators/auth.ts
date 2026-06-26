import { z } from "zod"

export const PasswordSchema = z.string()
  .min(12, 'Password must be at least 12 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"), // Don't block login with complexity rules (legacy users)
})

export const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Invalid email address"),
  password: PasswordSchema,
})

export const AddressSchema = z.object({
  title: z.string().min(2, "Label must be at least 2 characters (e.g. Home, Office)").default("Home"),
  line1: z.string().min(5, "Address line 1 must be at least 5 characters"),
  line2: z.string().optional(),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().min(2, "State/Province must be at least 2 characters"),
  postalCode: z.string().min(4, "Postal code must be at least 4 characters"),
  country: z.string().min(2, "Country must be at least 2 characters"),
  phone: z.string().min(8, "Phone number must be at least 8 digits"),
  isDefaultShipping: z.boolean().default(false),
  isDefaultBilling: z.boolean().default(false),
})

export const ForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
})

export const ResetPasswordSchema = z.object({
  token: z.string(),
  otp: z.string().optional(),
  password: PasswordSchema,
})
