# Application Security Architecture & Mitigations

This document details the security architecture implemented in Aussie Rigs Arena, aligned with OWASP Top 10 and ASVS guidelines.

## 1. Authentication Flow
- **NextAuth v5 (Auth.js)** is configured with the `PrismaAdapter` running fully server-side.
- Credentials are exchanged over HTTPS only.
- Sessions are managed via HttpOnly, Secure, SameSite=Lax cookies using NextAuth's `jwt` strategy.
- Short session lifespans are enforced, with token contents strictly containing standard claims (ID, role, name, email) without leaking sensitive application states.

## 2. Authorization (RBAC)
- **Role-Based Access Control** is strictly implemented on both the API and UI level.
- Three distinct roles: `SUPER_ADMIN`, `ADMIN`, `CUSTOMER`.
- UI/Route protection is enforced via `src/middleware.ts` for Edge deployment, immediately redirecting unauthenticated users.
- Server-side helpers (`requireAuth`, `requireRole`, `requireAdmin`) defined in `src/lib/auth/permissions.ts` guarantee authorization logic is verified on the backend before any database mutation or protected query occurs.

## 3. Password Hashing & Policies
- **Argon2id** is utilized for hashing passwords. It provides significant resistance against GPU-based cracking and side-channel attacks.
- Strong password policy enforced via Zod validation on registration:
  - Minimum 12 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character

## 4. Rate Limiting
- **Login Protection:** Implemented an LRU-cache memory fallback (`src/lib/security/rate-limit.ts`) to prevent brute force attacks on authentication endpoints.
- Rate limiting is strictly applied to login attempts, registration, and password reset flows to prevent enumeration and denial-of-service.

## 5. Account Lockout & Login Attempt Tracking
- All login attempts (successful and failed) are recorded in the `LoginAttempt` table.
- **Account Lockout:** Upon 5 consecutive failed login attempts, the account is temporarily locked for 15 minutes, neutralizing automated credential stuffing.

## 6. Audit Logging
- High-privilege events and critical user mutations (e.g., successful login, password changes) are logged to the `AuditLog` table.
- Captures the exact action, entity ID, and timestamp to satisfy non-repudiation requirements.

## 7. Security Headers & CSRF Mitigation
- Standard Next.js 14 Server Actions automatically carry built-in CSRF origin checks.
- `src/middleware.ts` forcefully injects strict security headers globally:
  - `Content-Security-Policy` (CSP) strictly defining trusted origins.
  - `Strict-Transport-Security` (HSTS) forcing TLS.
  - `X-Frame-Options: DENY` neutralizing clickjacking.
  - `X-Content-Type-Options: nosniff` mitigating MIME-sniffing.
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy` to disable access to browser features (camera, mic) to mitigate specific exploit vectors.

## 8. Threat Mitigations (OWASP Top 10)
- **A01:2021-Broken Access Control:** Server-side route handlers enforce explicit `requireRole()` checks. No reliance on client-side routing guards.
- **A02:2021-Cryptographic Failures:** TLS enforced everywhere. Argon2 hashes passwords. Reset tokens are hashed (SHA-256) before DB storage.
- **A03:2021-Injection:** Prisma ORM mitigates SQL injection natively.
- **A07:2021-Identification and Authentication Failures:** Addressed by rate limiting, account lockouts, secure session management, and robust password policies.

## 9. Next Steps
- Consider upgrading rate limiting to Upstash Redis for distributed cache capability as traffic scales.
- Implement TOTP (MFA) via the newly defined `UserSecurity` table to mandate 2FA for `ADMIN` and `SUPER_ADMIN` roles.
