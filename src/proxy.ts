import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// CORREÇÃO: Adicionado o mesmo fallback do auth.ts para garantir que a chave nunca fique vazia
const getJwtSecretKey = () => {
  const secret =
    process.env.JWT_SECRET || "chave-secreta-reserva-iron-brain-2026";
  return new TextEncoder().encode(secret);
};

const protectedRoutes = ["/admin", "/api/admin"];
const authRequiredApiRoutes = [
  "/api/exercises",
  "/api/progress",
  "/api/workout-plans",
];

function isProtectedPath(pathname: string): boolean {
  return protectedRoutes.some((route) => pathname.startsWith(route));
}

function requiresAuthApi(pathname: string): boolean {
  return authRequiredApiRoutes.some((route) => pathname.startsWith(route));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rotas protegidas: redirecionar para login se sem token
  if (isProtectedPath(pathname)) {
    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Verificar assinatura do JWT
    try {
      const { payload } = await jwtVerify(token, getJwtSecretKey()); // <-- CORREÇÃO AQUI
      const role = payload.role as string;

      // Rotas admin: verificar role de admin
      if (pathname.startsWith("/admin")) {
        if (role !== "ADMIN") {
          return NextResponse.redirect(new URL("/", request.url));
        }
      }
    } catch {
      // Token inválido ou expirado — redirecionar para login
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // API routes protegidas: retornar 401 se sem token
  if (requiresAuthApi(pathname)) {
    // Só proteger métodos que modificam ou lêem dados privados
    // GET /api/exercises pode ser público (catálogo)
    if (pathname.startsWith("/api/exercises") && request.method === "GET") {
      return NextResponse.next();
    }

    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Não autenticado" },
        { status: 401 },
      );
    }

    try {
      await jwtVerify(token, getJwtSecretKey()); // <-- CORREÇÃO AQUI
    } catch {
      return NextResponse.json(
        { success: false, error: "Token inválido ou expirado" },
        { status: 401 },
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/exercises/:path*",
    "/api/progress/:path*",
    "/api/workout-plans/:path*",
  ],
};
