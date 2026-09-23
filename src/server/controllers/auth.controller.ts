import type { Response, NextFunction } from "express";
import { prisma } from "@server/db/client";
import { loginSchema } from "@server/validators/schemas";
import { hashPassword, verifyPassword, signAccessToken, signRefreshToken, verifyRefreshToken, hashToken } from "@server/utils/auth";
import { AppError } from "@server/utils/errors";
import { ok } from "@server/utils/response";
import { audit } from "@server/middleware/audit";
import type { AuthedRequest } from "@server/middleware/auth";

const REFRESH_COOKIE = "refresh_token";
const isProd = process.env.NODE_ENV === "production";

function setRefreshCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/api/auth",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export async function login(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const { username, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findFirst({
      where: { OR: [{ username }, { email: username }], isActive: true },
    });
    // Constant-shape response whether user exists or not — avoid leaking which usernames exist.
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      throw AppError.unauthorized("Invalid username or password", "INVALID_CREDENTIALS");
    }

    const accessToken = signAccessToken({ sub: user.id, role: user.role, username: user.username });
    const refreshToken = signRefreshToken(user.id);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(refreshToken),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    setRefreshCookie(res, refreshToken);
    req.user = { id: user.id, role: user.role, username: user.username };
    await audit(req, "login", "user", user.id);

    return ok(res, {
      accessToken,
      user: { id: user.id, username: user.username, email: user.email, fullName: user.fullName, role: user.role },
    });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (!token) throw AppError.unauthorized("No refresh token", "NO_REFRESH_TOKEN");

    const payload = verifyRefreshToken(token);
    const stored = await prisma.refreshToken.findFirst({
      where: { userId: payload.sub, tokenHash: hashToken(token), revoked: false },
    });
    if (!stored || stored.expiresAt < new Date()) {
      throw AppError.unauthorized("Refresh token invalid or expired", "REFRESH_INVALID");
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.isActive) throw AppError.unauthorized();

    const accessToken = signAccessToken({ sub: user.id, role: user.role, username: user.username });
    return ok(res, { accessToken });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (token) {
      await prisma.refreshToken.updateMany({
        where: { tokenHash: hashToken(token) },
        data: { revoked: true },
      });
    }
    res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
    return ok(res, { loggedOut: true });
  } catch (err) {
    next(err);
  }
}

export async function me(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw AppError.unauthorized();
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) throw AppError.unauthorized();
    return ok(res, {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    });
  } catch (err) {
    next(err);
  }
}
