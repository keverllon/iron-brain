import { NextRequest, NextResponse } from "next/server";
import { calculateProgressiveOverload } from "@/lib/training-utils";
import { z } from "zod";

const overloadSchema = z.object({
  currentWeight: z.number().min(0).max(500),
  completedReps: z.number().int().min(1).max(100),
  targetRepsMax: z.number().int().min(1).max(100),
  rpe: z.number().int().min(1).max(10),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = overloadSchema.safeParse(body);

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

    const { currentWeight, completedReps, targetRepsMax, rpe } = validated.data;

    const recommendation = calculateProgressiveOverload(
      currentWeight,
      completedReps,
      targetRepsMax,
      rpe,
    );

    return NextResponse.json({
      success: true,
      data: recommendation,
    });
  } catch (error) {
    console.error("Error calculating overload:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao calcular progressão de carga" },
      { status: 500 },
    );
  }
}
