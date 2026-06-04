import crypto from "crypto";

export const ANONYMOUS_COOKIE_NAME = "fashionatlas_uid";

export interface CookieContext {
  getHeader(name: string): string | undefined;
  setHeader(name: string, value: string): void;
}

export function getAnonymousUserId(context: CookieContext) {
  const cookieHeader = context.getHeader("cookie") || "";
  const cookies = parseCookies(cookieHeader);
  const existing = cookies[ANONYMOUS_COOKIE_NAME];
  if (existing && /^[a-f0-9-]{36}$/i.test(existing)) return existing;

  const userId = crypto.randomUUID();
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  context.setHeader(
    "set-cookie",
    `${ANONYMOUS_COOKIE_NAME}=${userId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000${secure}`,
  );
  return userId;
}

function parseCookies(cookieHeader: string) {
  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((cookies, part) => {
      const eqIndex = part.indexOf("=");
      if (eqIndex === -1) return cookies;

      const key = decodeURIComponent(part.slice(0, eqIndex).trim());
      const value = decodeURIComponent(part.slice(eqIndex + 1).trim());
      cookies[key] = value;
      return cookies;
    }, {});
}
