import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createToken } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

type UserRole = "ADMIN" | "USER";
type SubscriptionStatus = "FREE" | "ACTIVE" | "EXPIRED" | "CANCELLED";

interface UserWithAuth {
  id: string;
  name: string;
  email: string;
  passwordHash: string | null;
  role: UserRole;
  subscriptionStatus: SubscriptionStatus;
}

// Usuário demo hardcoded (funciona sem banco)
const DEMO_USERS: Array<{
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  subscriptionStatus: SubscriptionStatus;
}> = [
  {
    id: "admin-001",
    name: "Administrador",
    email: "admin@ironbrain.com",
    password: "admin123",
    role: "ADMIN",
    subscriptionStatus: "ACTIVE",
  },
  {
    id: "user-001",
    name: "Usuário Demo",
    email: "user@ironbrain.com",
    password: "user123",
    role: "USER",
    subscriptionStatus: "ACTIVE",
  },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = loginSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Dados inválidos",
          details: validated.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { email, password } = validated.data;

    // Tentar banco primeiro
    try {
      const user = (await prisma.user.findUnique({
        where: { email },
      })) as UserWithAuth | null;

      if (user && user.passwordHash) {
        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (validPassword) {
          return createAuthResponse({
            userId: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
            subscriptionStatus: user.subscriptionStatus,
          });
        }
      }
    } catch {
      // Banco indisponível, usar demo
    }

    // Fallback: verificar usuários demo
    const demoUser = DEMO_USERS.find(
      (u) => u.email === email && u.password === password,
    );

    if (!demoUser) {
      return NextResponse.json(
        { success: false, error: "Email ou senha inválidos" },
        { status: 401 },
      );
    }

    // Garantir que usuário demo exista no banco (para FKs funcionarem)
    try {
      await prisma.user.upsert({
        where: { id: demoUser.id },
        update: {},
        create: {
          id: demoUser.id,
          name: demoUser.name,
          email: demoUser.email,
          passwordHash: await bcrypt.hash(demoUser.password, 10),
          role: demoUser.role,
          subscriptionStatus: demoUser.subscriptionStatus,
        },
      });
    } catch {
      // Se falhar, continuar mesmo assim (demo funciona sem banco)
    }

    return createAuthResponse({
      userId: demoUser.id,
      email: demoUser.email,
      role: demoUser.role,
      name: demoUser.name,
      subscriptionStatus: demoUser.subscriptionStatus,
    });
  } catch (error) {
    console.error("Error logging in:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao fazer login" },
      { status: 500 },
    );
  }
}

async function createAuthResponse(user: {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
  subscriptionStatus: SubscriptionStatus;
}) {
  const token = await createToken({
    userId: user.userId,
    email: user.email,
    role: user.role,
  });

  const response = NextResponse.json({
    success: true,
    data: {
      user: {
        id: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        subscriptionStatus: user.subscriptionStatus,
      },
      token,
    },
  });

  response.cookies.set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });

  return response;
}
