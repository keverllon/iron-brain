import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// GET - Obter um plano específico (verifica ownership)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Não autenticado" },
        { status: 401 },
      );
    }

    const { id } = await params;

    const plan = await prisma.workoutPlan.findUnique({
      where: { id, userId: user.userId },
      include: {
        sessions: {
          include: {
            sets: {
              include: {
                exercise: true,
              },
            },
          },
        },
      },
    });

    if (!plan) {
      return NextResponse.json(
        { success: false, error: "Plano não encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: plan });
  } catch (error) {
    console.error("Error fetching workout plan:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao buscar plano de treino" },
      { status: 500 },
    );
  }
}

// DELETE - Excluir um plano de treino (cascade configurado no schema)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Não autenticado" },
        { status: 401 },
      );
    }

    const { id } = await params;

    // Verificar ownership antes de deletar
    const plan = await prisma.workoutPlan.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!plan || plan.userId !== user.userId) {
      return NextResponse.json(
        { success: false, error: "Plano não encontrado" },
        { status: 404 },
      );
    }

    // Deletar o plano (cascade deleta sessions e sets automaticamente)
    await prisma.workoutPlan.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Treino excluído com sucesso!",
    });
  } catch (error) {
    console.error("Error deleting workout plan:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao excluir treino" },
      { status: 500 },
    );
  }
}
