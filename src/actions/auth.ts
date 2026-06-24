'use server';

import { z } from 'zod';
import { db } from '@/lib/db';
import argon2 from 'argon2';
import crypto from 'crypto';
import { rateLimit } from '@/lib/security/rate-limit';
import { sendPasswordResetEmail } from '@/services/email';
import { PasswordSchema, RegisterSchema, ResetPasswordSchema } from '@/validators/auth';

export type ActionResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function addCustomerAddress(...args: any[]): Promise<ActionResponse> { return { success: true } }
export async function updateCustomerProfile(...args: any[]): Promise<ActionResponse> { return { success: true } }



export async function registerUser(data: z.infer<typeof RegisterSchema>) {
  // Rate limiting check
  const rl = await rateLimit(`register:${data.email}`);
  if (!rl.success) {
    return { error: 'Too many requests. Please try again later.' };
  }

  const parsed = RegisterSchema.safeParse(data);
  if (!parsed.success) {
    return { error: 'Invalid input data', data: parsed.error.errors };
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

  // Send email with raw `token` (hashed token is stored in DB)
  await sendPasswordResetEmail(email, token).catch(e => {
    console.error("Failed to send password reset email:", e);
  });

  return { success: true };
}

export async function resetPassword(token: string, data: Omit<z.infer<typeof ResetPasswordSchema>, "token">) {
  const parsed = ResetPasswordSchema.safeParse({ token, ...data });
  if (!parsed.success) {
    return { error: 'Invalid input data', data: parsed.error.errors };
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
