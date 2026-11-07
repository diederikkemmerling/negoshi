import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { secretKey } from "./store";
import { getUsers, type User } from "./model";

const COOKIE = "ns_studio";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

const sign = (v: string) => crypto.createHmac("sha256", secretKey()).update(v).digest("base64url");

export async function startSession(user: User) {
  const payload = Buffer.from(JSON.stringify({ u: user.id, exp: Date.now() + MAX_AGE * 1000, p: (user.pass || "").slice(-12) })).toString("base64url");
  (await cookies()).set(COOKIE, `${payload}.${sign(payload)}`, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: MAX_AGE });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

/** Current user, or null. A password change invalidates older sessions. */
export async function currentUser(): Promise<User | null> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  const [payload, mac] = raw.split(".");
  if (!payload || !mac) return null;
  const want = Buffer.from(sign(payload));
  const got = Buffer.from(mac);
  if (want.length !== got.length || !crypto.timingSafeEqual(want, got)) return null;
  let data: { u: string; exp: number; p: string };
  try { data = JSON.parse(Buffer.from(payload, "base64url").toString()); } catch { return null; }
  if (data.exp < Date.now()) return null;
  const user = (await getUsers()).find((u) => u.id === data.u);
  if (!user || user.disabled || (user.pass || "").slice(-12) !== data.p) return null;
  return user;
}

export async function requireUser(): Promise<User> {
  const u = await currentUser();
  if (!u) redirect("/studio/login");
  return u;
}

export async function requireEditor(): Promise<User> {
  const u = await requireUser();
  if (u.role !== "editor") redirect("/studio");
  return u;
}
