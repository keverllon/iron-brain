import { NextRequest, NextResponse } from "next/server";
import { calculateOneRM } from "@/lib/training-utils";
import { z } from "zod";

const oneRMSchema = z.object({
  weight: z.number().min(0).max(500, "Peso máximo: 500kg"),
  reps: z.number().int().min(1).max(30, "Reps máximo: 30"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = oneRMSchema.safeParse(body);

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

    const { weight, reps } = validated.data;
    const result = calculateOneRM(weight, reps);

    // Calcular porcentagens úteis
    const percentages = {
      "95%": Math.round(result.average * 0.95 * 10) / 10,
      "90%": Math.round(result.average * 0.9 * 10) / 10,
      "85%": Math.round(result.average * 0.85 * 10) / 10,
      "80%": Math.round(result.average * 0.8 * 10) / 10,
      "75%": Math.round(result.average * 0.75 * 10) / 10,
      "70%": Math.round(result.average * 0.7 * 10) / 10,
      "65%": Math.round(result.average * 0.65 * 10) / 10,
      "60%": Math.round(result.average * 0.6 * 10) / 10,
    };

    return NextResponse.json({
      success: true,
      data: {
        input: { weight, reps },
        oneRM: result,
        trainingPercentages: percentages,
      },
    });
  } catch (error) {
    console.error("Error calculating 1RM:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao calcular 1RM" },
      { status: 500 },
    );
  }
}
