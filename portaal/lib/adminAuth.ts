import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "crypto";

// Simple signed admin session, separate from Supabase auth.
// We derive an HMAC secret from ADMIN_PASSWORD and sign a fixed payload with
// an issued-at timestamp. The cookie is httpOnly so it cannot be read by JS.

const COOKIE_NAME = "admin_session";
const MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours

function getSecret(): string {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) {
    throw new Error(
      "ADMIN_PASSWORD is niet ingesteld. Voeg deze toe aan je omgevingsvariabelen."
    );
  }
  return pw;
}

function sign(value: string): string {
  return crypto
    .createHmac("sha256", getSecret())
    .update(value)
    .digest("hex");
}

// Build a token of the form `<issuedAt>.<signature>`.
function makeToken(): string {
  const issuedAt = Date.now().toString();
  const signature = sign(issuedAt);
  return `${issuedAt}.${signature}`;
}

function verifyToken(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [issuedAt, signature] = parts;

  const expected = sign(issuedAt);
  // Constant-time compare.
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  if (!crypto.timingSafeEqual(a, b)) return false;

  // Check expiry.
  const issued = Number(issuedAt);
  if (!Number.isFinite(issued)) return false;
  const ageSeconds = (Date.now() - issued) / 1000;
  return ageSeconds <= MAX_AGE_SECONDS;
}

// Compare a submitted password against ADMIN_PASSWORD (constant-time).
export function checkPassword(submitted: string): boolean {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return false;
  const a = Buffer.from(submitted);
  const b = Buffer.from(pw);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function setAdminSession() {
  cookies().set(COOKIE_NAME, makeToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export function clearAdminSession() {
  cookies().delete(COOKIE_NAME);
}

export function isAdmin(): boolean {
  const token = cookies().get(COOKIE_NAME)?.value;
  try {
    return verifyToken(token);
  } catch {
    return false;
  }
}

// Use in admin Server Components / actions. Redirects when not logged in.
export function requireAdmin() {
  if (!isAdmin()) {
    redirect("/admin/login");
  }
}
