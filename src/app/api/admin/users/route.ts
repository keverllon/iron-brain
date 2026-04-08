import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import { z } from "zod";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const createUserSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  role: z.enum(["ADMIN", "USER"]).default("USER"),
  subscriptionStatus: z
    .enum(["FREE", "ACTIVE", "EXPIRED", "CANCELLED"])
    .default("FREE"),
  subscriptionEndsAt: z.string().nullable().optional(),
});

// Types definidos manualmente até o db push ser executado
type UserRole = "ADMIN" | "USER";
type SubscriptionStatus = "FREE" | "ACTIVE" | "EXPIRED" | "CANCELLED";

interface UserWithAuth {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  subscriptionStatus: SubscriptionStatus;
  subscriptionEndsAt: Date | null;
  createdAt: Date;
}

// GET - Listar todos os usuários (apenas ADMIN)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          subscriptionStatus: true,
          subscriptionEndsAt: true,
          createdAt: true,
        },
      }) as Promise<UserWithAuth[]>,
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao buscar usuários" },
      { status: 500 },
    );
  }
}

// POST - Criar novo usuário (pelo admin)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createUserSchema.safeParse(body);

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

    const {
      name,
      email,
      password,
      role,
      subscriptionStatus,
      subscriptionEndsAt,
    } = validated.data;

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Email já cadastrado" },
        { status: 409 },
      );
    }

    // Hash da senha
    const passwordHash = await bcrypt.hash(password, 10);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
        subscriptionStatus,
        subscriptionEndsAt: subscriptionEndsAt
          ? new Date(subscriptionEndsAt)
          : null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        subscriptionStatus: true,
        subscriptionEndsAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao criar usuário" },
      { status: 500 },
    );
  }
}

// PUT - Atualizar role ou subscription de um usuário
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID do usuário é obrigatório" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { role, subscriptionStatus, subscriptionEndsAt } = body;

    const user = (await prisma.user.update({
      where: { id },
      data: {
        ...(role && { role }),
        ...(subscriptionStatus && { subscriptionStatus }),
        ...(subscriptionEndsAt && {
          subscriptionEndsAt: new Date(subscriptionEndsAt),
        }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        subscriptionStatus: true,
        subscriptionEndsAt: true,
        createdAt: true,
      },
    })) as UserWithAuth;

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao atualizar usuário" },
      { status: 500 },
    );
  }
}

// DELETE - Remover usuário (soft delete)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID do usuário é obrigatório" },
        { status: 400 },
      );
    }

    await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true, message: "Usuário removido" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao remover usuário" },
      { status: 500 },
    );
  }
}
