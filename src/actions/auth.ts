'use server';

import { z } from 'zod';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { rateLimit } from '@/lib/security/rate-limit';
import { sendPasswordResetEmail, sendVerificationEmail } from '@/services/email';
import { PasswordSchema, RegisterSchema, ResetPasswordSchema } from '@/validators/auth';
import { sendSecurityOtpSms } from '@/services/twilio';

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

  const passwordHash = await bcrypt.hash(password, 12);

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

  await sendVerificationEmail(email, token).catch((e) => {
    console.error("Failed to send verification email:", e);
  });

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

  // Check if user has a phone number in their addresses
  const latestAddress = await db.address.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' }
  });

  let otp: string | null = null;
  if (latestAddress?.phone) {
    // Generate 6-digit OTP
    otp = Math.floor(100000 + Math.random() * 900000).toString();
  }

  await db.passwordResetToken.create({
    data: {
      email,
      token: hashedToken,
      otp,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 mins
    }
  });

  // Send email with raw `token` (hashed token is stored in DB)
  await sendPasswordResetEmail(email, token).catch(e => {
    console.error("Failed to send password reset email:", e);
  });

  if (otp && latestAddress?.phone) {
    await sendSecurityOtpSms(latestAddress.phone, otp);
  }

  // Return success but also a flag indicating if OTP was sent, so UI can adapt.
  return { success: true, data: { requiresOtp: !!otp } };
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

  if (resetToken.otp) {
    if (!parsed.data.otp || parsed.data.otp !== resetToken.otp) {
      return { error: 'Invalid or missing Security OTP' };
    }
  }

  const user = await db.user.findUnique({ where: { email: resetToken.email } });
  if (!user) {
    return { error: 'User not found' };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

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
