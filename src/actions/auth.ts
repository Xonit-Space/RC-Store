'use server';

import { z } from 'zod';
import { db } from '@/lib/db';
import argon2 from 'argon2';
import crypto from 'crypto';
import { rateLimit } from '@/lib/security/rate-limit';
const passwordSchema = z.string()
  .min(12, 'Password must be at least 12 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export type ActionResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function addCustomerAddress(...args: any[]): Promise<ActionResponse> { return { success: true } }
export async function updateCustomerProfile(...args: any[]): Promise<ActionResponse> { return { success: true } }

export const registerSchema = z.object({
  email: z.string().email(),
  password: passwordSchema,
  name: z.string().min(1).optional(),
});

export const resetPasswordSchema = z.object({
  password: passwordSchema,
});

export async function registerUser(data: z.infer<typeof registerSchema>) {
  // Rate limiting check
  const rl = await rateLimit(`register:${data.email}`);
  if (!rl.success) {
    return { error: 'Too many requests. Please try again later.' };
  }

  const parsed = registerSchema.safeParse(data);
  if (!parsed.success) {
    return { error: 'Invalid input data' };
  }

  const { email, password, name } = parsed.data;

  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) {
    return { error: 'Email already exists' };
  }

  const passwordHash = await argon2.hash(password);

  // Generate Verification Token
  const token = crypto.randomUUID();

  await db.user.create({
    data: {
      email,
      passwordHash,
      name,
      security: {
        create: {}
      }
    }
  });

  await db.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    }
  });

  // TODO: Send email with token
  // await sendVerificationEmail(email, token);

  return { success: true };
}

export async function forgotPassword(email: string) {
  const rl = await rateLimit(`forgot-password:${email}`);
  if (!rl.success) {
    return { error: 'Too many requests. Please try again later.' };
  }

  if (!z.string().email().safeParse(email).success) {
    return { error: 'Invalid email' };
  }

  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    // Return success to prevent email enumeration
    return { success: true };
  }

  const token = crypto.randomUUID();
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  await db.passwordResetToken.create({
    data: {
      email,
      token: hashedToken,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 mins
    }
  });

  // TODO: Send email with raw `token`
  // await sendPasswordResetEmail(email, token);

  return { success: true };
}

export async function resetPassword(token: string, data: z.infer<typeof resetPasswordSchema>) {
  const parsed = resetPasswordSchema.safeParse(data);
  if (!parsed.success) {
    return { error: 'Invalid input data' };
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const resetToken = await db.passwordResetToken.findUnique({
    where: { token: hashedToken }
  });

  if (!resetToken || resetToken.expiresAt < new Date()) {
    return { error: 'Invalid or expired token' };
  }

  const user = await db.user.findUnique({ where: { email: resetToken.email } });
  if (!user) {
    return { error: 'User not found' };
  }

  const passwordHash = await argon2.hash(parsed.data.password);

  await db.user.update({
    where: { id: user.id },
    data: { passwordHash }
  });

  // Record password change time for session invalidation
  await db.userSecurity.upsert({
    where: { userId: user.id },
    update: { passwordChangedAt: new Date(), failedAttempts: 0, lockedUntil: null },
    create: { userId: user.id, passwordChangedAt: new Date(), failedAttempts: 0 }
  });

  await db.passwordResetToken.delete({ where: { id: resetToken.id } });

  // Audit log
  await db.auditLog.create({
    data: {
      userId: user.id,
      action: 'PASSWORD_CHANGE',
      entity: 'User',
      entityId: user.id,
      changes: JSON.stringify({ method: 'reset_flow' })
    }
  });

  return { success: true };
}
