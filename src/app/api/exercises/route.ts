import { NextRequest, NextResponse } from "next/server";
import {
  PrismaClient,
  MuscleGroup,
  EquipmentType,
  TargetGender,
} from "@prisma/client";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { exerciseSchema, exerciseUpdateSchema } from "@/lib/zod-schemas";

// GET - Listar exercícios com filtros opcionais (público)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const muscleGroup = searchParams.get("muscleGroup") as MuscleGroup | null;
    const equipmentType = searchParams.get(
      "equipmentType",
    ) as EquipmentType | null;
    const isCompound = searchParams.get("isCompound");
    const targetGender = searchParams.get(
      "targetGender",
    ) as TargetGender | null;

    const where: Record<string, unknown> = {};

    if (muscleGroup) where.muscleGroup = muscleGroup;
    if (equipmentType) where.equipmentType = equipmentType;
    if (isCompound !== null) where.isCompound = isCompound === "true";
    if (targetGender) {
      where.OR = [
        { targetGender: targetGender },
        { targetGender: TargetGender.BOTH },
      ];
    }

    const exercises = await prisma.exercise.findMany({
      where,
      orderBy: { name: "asc" },
      take: 200, // Limite maior para garantir que retorna todos
    });

    console.log(`Encontrados ${exercises.length} exercícios no banco`);

    return NextResponse.json({
      success: true,
      data: exercises,
      count: exercises.length,
    });
  } catch (error) {
    console.error("Error fetching exercises:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao buscar exercícios" },
      { status: 500 },
    );
  }
}

// POST - Criar novo exercício (requer admin)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Apenas administradores podem criar exercícios" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const validated = exerciseSchema.safeParse(body);

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

    const exercise = await prisma.exercise.create({
      data: validated.data,
    });

    return NextResponse.json(
      { success: true, data: exercise },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating exercise:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao criar exercício" },
      { status: 500 },
    );
  }
}

// PUT - Atualizar exercício (requer admin)
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Apenas administradores podem editar exercícios" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID do exercício é obrigatório" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const validated = exerciseUpdateSchema.safeParse(body);

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

    const existing = await prisma.exercise.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Exercício não encontrado" },
        { status: 404 },
      );
    }

    const exercise = await prisma.exercise.update({
      where: { id },
      data: validated.data,
    });

    return NextResponse.json({ success: true, data: exercise });
  } catch (error) {
    console.error("Error updating exercise:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao atualizar exercício" },
      { status: 500 },
    );
  }
}

// DELETE - Remover exercício (requer admin, soft delete via deletedAt)
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Apenas administradores podem remover exercícios" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID do exercício é obrigatório" },
        { status: 400 },
      );
    }

    const existing = await prisma.exercise.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Exercício não encontrado" },
        { status: 404 },
      );
    }

    await prisma.exercise.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Exercício removido com sucesso",
    });
  } catch (error) {
    console.error("Error deleting exercise:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao remover exercício" },
      { status: 500 },
    );
  }
}
