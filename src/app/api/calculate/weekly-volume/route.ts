import { NextRequest, NextResponse } from "next/server";
import { calculateWeeklyVolume } from "@/lib/training-utils";
import { getVolumeRecommendation } from "@/lib/training-utils";
import { z } from "zod";
import { MuscleGroup } from "@prisma/client";

const weeklyVolumeSchema = z.object({
  experienceLevel: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  sessions: z.array(
    z.object({
      exercises: z.array(
        z.object({
          exercise: z.object({
            name: z.string(),
            muscleGroup: z.nativeEnum(MuscleGroup),
          }),
          targetSets: z.number().int().min(1),
          targetReps: z.string(),
          actualReps: z.number().int().nullable(),
          weightLifted: z.number().nullable(),
        }),
      ),
    }),
  ),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = weeklyVolumeSchema.safeParse(body);

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

    const { experienceLevel, sessions } = validated.data;

    // Calcular volume semanal
    const volumeReport = calculateWeeklyVolume(sessions);

    // Obter recomendações baseadas no nível
    const recommendations = getVolumeRecommendation(experienceLevel);

    // Verificar se algum grupo muscular está fora do range
    const volumeAnalysis = volumeReport.muscleGroups.map((mg) => {
      const isUnderVolume = mg.totalSets < recommendations.minSets;
      const isOverVolume = mg.totalSets > recommendations.maxSets;
      const isOptimal = !isUnderVolume && !isOverVolume;

      return {
        ...mg,
        isUnderVolume,
        isOverVolume,
        isOptimal,
        recommendation: isUnderVolume
          ? `Aumentar volume (atual: ${mg.totalSets}, mínimo: ${recommendations.minSets})`
          : isOverVolume
            ? `Reduzir volume (atual: ${mg.totalSets}, máximo: ${recommendations.maxSets})`
            : "Volume dentro do range ideal",
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        volumeReport: {
          ...volumeReport,
          muscleGroups: volumeAnalysis,
        },
        recommendations,
      },
    });
  } catch (error) {
    console.error("Error calculating weekly volume:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao calcular volume semanal" },
      { status: 500 },
    );
  }
}
