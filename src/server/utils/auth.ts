import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import type { Role } from "@shared/types";

export interface AccessTokenPayload {
  sub: string; // user id
  role: Role;
  username: string;
}

const ACCESS_SECRET = () => {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("JWT_SECRET is not set");
  return s;
};
const REFRESH_SECRET = () => {
  const s = process.env.JWT_REFRESH_SECRET;
  if (!s) throw new Error("JWT_REFRESH_SECRET is not set");
  return s;
};

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, ACCESS_SECRET(), { expiresIn: process.env.JWT_ACCESS_TTL || "15m" });
}

export function signRefreshToken(userId: string): string {
  return jwt.sign({ sub: userId }, REFRESH_SECRET(), { expiresIn: process.env.JWT_REFRESH_TTL || "7d" });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, ACCESS_SECRET()) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): { sub: string } {
  return jwt.verify(token, REFRESH_SECRET()) as { sub: string };
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/** Hash used only to look up/revoke refresh tokens stored in DB — never store raw tokens. */
export function hashToken(token: string): string {
  // Cheap non-cryptographic-purpose hash is fine here since the token itself
  // is already a high-entropy signed JWT; bcrypt would be overkill/slow.
  return require("crypto").createHash("sha256").update(token).digest("hex");
}
