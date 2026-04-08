import { jwtVerify, SignJWT } from "jose";
import type { NextRequest } from "next/server";

export interface JWTPayload {
  userId: string;
  email: string;
  role: "ADMIN" | "USER";
  [key: string]: unknown;
}

// CORREÇÃO: Transformado em função com valor de fallback para evitar o erro "Zero-length key"
const getJwtSecretKey = () => {
  const secret =
    process.env.JWT_SECRET || "chave-secreta-reserva-iron-brain-2026";
  return new TextEncoder().encode(secret);
};

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey());
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser(
  request: NextRequest,
): Promise<JWTPayload | null> {
  const token = request.cookies.get("auth-token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function createToken(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(getJwtSecretKey());
}

export function setAuthCookie(response: Response, token: string): Response {
  if (response instanceof Response) {
    response.headers.append(
      "Set-Cookie",
      `auth-token=${token}; HttpOnly; Path=/; SameSite=Strict; Max-Age=${
        7 * 24 * 60 * 60
      };${process.env.NODE_ENV === "production" ? " Secure;" : ""}`,
    );
  }
  return response;
}
