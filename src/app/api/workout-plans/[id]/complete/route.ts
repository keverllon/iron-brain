import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const completeSessionSchema = z.object({
  sets: z.array(
    z.object({
      setId: z.string().uuid(),
      actualReps: z.number().nullable().optional(),
      weightLifted: z.number().nullable().optional(),
      rpe: z.number().nullable().optional(),
    }),
  ),
});

export async function POST(
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
    const body = await request.json();
    const validated = completeSessionSchema.safeParse(body);

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

    const { sets } = validated.data;

    // Verificar que a sessão pertence a um plano do usuário
    const session = await prisma.workoutSession.findUnique({
      where: { id },
      include: { workoutPlan: { select: { userId: true } } },
    });

    if (!session || session.workoutPlan.userId !== user.userId) {
      return NextResponse.json(
        { success: false, error: "Sessão não encontrada" },
        { status: 404 },
      );
    }

    // Atualizar cada set com os dados reais
    for (const set of sets) {
      await prisma.workoutSet.update({
        where: { id: set.setId },
        data: {
          actualReps: set.actualReps,
          weightLifted: set.weightLifted,
          rpe: set.rpe,
        },
      });
    }

    // Marcar sessão como concluída
    await prisma.workoutSession.update({
      where: { id },
      data: { completedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      message: "Treino concluído com sucesso!",
    });
  } catch (error) {
    console.error("Error completing session:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao concluir treino" },
      { status: 500 },
    );
  }
}
