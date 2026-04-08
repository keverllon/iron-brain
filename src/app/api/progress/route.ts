import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// ============================================================
// GET /api/progress - Retorna dados de progresso do usuário
// ============================================================

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Não autenticado" },
        { status: 401 },
      );
    }

    const userId = user.userId;
    const { searchParams } = new URL(request.url);
    const weeks = parseInt(searchParams.get("weeks") || "6", 10);

    // Buscar todos os planos de treino do usuário
    const workoutPlans = await prisma.workoutPlan.findMany({
      where: { userId },
      include: {
        sessions: {
          include: {
            sets: {
              include: {
                exercise: true,
              },
            },
          },
          orderBy: { completedAt: "asc" },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    if (workoutPlans.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          strengthProgress: [],
          weeklyVolume: [],
          rpeProgress: [],
          stats: {
            maxStrength: 0,
            avgVolume: 0,
            avgRPE: 0,
            completedWorkouts: 0,
          },
        },
      });
    }

    // Processar dados para gráficos
    const strengthProgress = calculateStrengthProgress(workoutPlans, weeks);
    const weeklyVolume = calculateWeeklyVolume(workoutPlans, weeks);
    const rpeProgress = calculateRPEProgress(workoutPlans, weeks);
    const stats = calculateStats(workoutPlans);

    return NextResponse.json({
      success: true,
      data: {
        strengthProgress,
        weeklyVolume,
        rpeProgress,
        stats,
      },
    });
  } catch (error) {
    console.error("Error fetching progress:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao buscar progresso" },
      { status: 500 },
    );
  }
}

// ============================================================
// Funções Auxiliares de Cálculo
// ============================================================

interface StrengthDataPoint {
  week: string;
  [exercise: string]: string | number;
}

interface VolumeDataPoint {
  week: string;
  [muscleGroup: string]: string | number;
}

interface RPEDataPoint {
  week: string;
  avgRPE: number;
  workouts: number;
}

interface Stats {
  maxStrength: number;
  avgVolume: number;
  avgRPE: number;
  completedWorkouts: number;
}

function calculateStrengthProgress(
  workoutPlans: Array<{
    sessions: Array<{
      sets: Array<{
        exercise: { name: string };
        weightLifted: number | null;
        actualReps: number | null;
      }>;
      completedAt: Date | null;
    }>;
  }>,
  weeks: number,
): StrengthDataPoint[] {
  // Agrupar por semana baseado na data de conclusão
  const weekMap = new Map<number, Map<string, number>>();

  for (const plan of workoutPlans) {
    for (const session of plan.sessions) {
      if (!session.completedAt) continue;

      const weekNumber = getWeekNumber(session.completedAt);
      if (!weekMap.has(weekNumber)) {
        weekMap.set(weekNumber, new Map());
      }

      const weekExercises = weekMap.get(weekNumber)!;

      for (const set of session.sets) {
        if (set.weightLifted && set.weightLifted > 0) {
          const exerciseName = normalizeExerciseName(set.exercise.name);
          const currentMax = weekExercises.get(exerciseName) || 0;
          weekExercises.set(
            exerciseName,
            Math.max(currentMax, set.weightLifted),
          );
        }
      }
    }
  }

  // Converter para array de dados
  const result: StrengthDataPoint[] = [];
  const sortedWeeks = Array.from(weekMap.keys()).sort((a, b) => a - b);

  for (const weekNum of sortedWeeks) {
    const weekExercises = weekMap.get(weekNum)!;
    const dataPoint: StrengthDataPoint = { week: `Semana ${weekNum}` };

    // Pegar os principais exercícios para tracking
    const mainExercises = [
      "Supino Reto",
      "Agachamento Livre",
      "Levantamento Terra",
    ];
    for (const exercise of mainExercises) {
      const value = weekExercises.get(exercise);
      if (value !== undefined) {
        dataPoint[exercise] = value;
      }
    }

    // Adicionar outros exercícios
    for (const [name, weight] of weekExercises) {
      if (!mainExercises.includes(name)) {
        dataPoint[name] = weight;
      }
    }

    result.push(dataPoint);
  }

  return result.slice(-weeks);
}

function calculateWeeklyVolume(
  workoutPlans: Array<{
    sessions: Array<{
      sets: Array<{
        exercise: { muscleGroup: string; name: string };
        targetSets: number;
        actualReps: number | null;
      }>;
      completedAt: Date | null;
    }>;
  }>,
  weeks: number,
): VolumeDataPoint[] {
  const weekMap = new Map<number, Map<string, number>>();

  for (const plan of workoutPlans) {
    for (const session of plan.sessions) {
      if (!session.completedAt) continue;

      const weekNumber = getWeekNumber(session.completedAt);
      if (!weekMap.has(weekNumber)) {
        weekMap.set(weekNumber, new Map());
      }

      const weekVolume = weekMap.get(weekNumber)!;

      for (const set of session.sets) {
        const muscleGroup = normalizeMuscleGroup(set.exercise.muscleGroup);
        const currentVolume = weekVolume.get(muscleGroup) || 0;
        weekVolume.set(muscleGroup, currentVolume + set.targetSets);
      }
    }
  }

  const result: VolumeDataPoint[] = [];
  const sortedWeeks = Array.from(weekMap.keys()).sort((a, b) => a - b);

  for (const weekNum of sortedWeeks) {
    const weekVolume = weekMap.get(weekNum)!;
    const dataPoint: VolumeDataPoint = { week: `Semana ${weekNum}` };

    for (const [muscle, sets] of weekVolume) {
      dataPoint[muscle] = sets;
    }

    result.push(dataPoint);
  }

  return result.slice(-weeks);
}

function calculateRPEProgress(
  workoutPlans: Array<{
    id: string;
    sessions: Array<{
      sets: Array<{
        rpe: number | null;
      }>;
      completedAt: Date | null;
    }>;
  }>,
  weeks: number,
): RPEDataPoint[] {
  const weekMap = new Map<
    number,
    { totalRPE: number; count: number; workouts: Set<string> }
  >();

  for (const plan of workoutPlans) {
    for (const session of plan.sessions) {
      if (!session.completedAt) continue;

      const weekNumber = getWeekNumber(session.completedAt);
      if (!weekMap.has(weekNumber)) {
        weekMap.set(weekNumber, { totalRPE: 0, count: 0, workouts: new Set() });
      }

      const weekData = weekMap.get(weekNumber)!;
      weekData.workouts.add(plan.id);

      for (const set of session.sets) {
        if (set.rpe !== null && set.rpe > 0) {
          weekData.totalRPE += set.rpe;
          weekData.count++;
        }
      }
    }
  }

  const result: RPEDataPoint[] = [];
  const sortedWeeks = Array.from(weekMap.keys()).sort((a, b) => a - b);

  for (const weekNum of sortedWeeks) {
    const weekData = weekMap.get(weekNum)!;
    result.push({
      week: `Semana ${weekNum}`,
      avgRPE:
        weekData.count > 0
          ? Math.round((weekData.totalRPE / weekData.count) * 10) / 10
          : 0,
      workouts: weekData.workouts.size,
    });
  }

  return result.slice(-weeks);
}

function calculateStats(
  workoutPlans: Array<{
    sessions: Array<{
      sets: Array<{
        weightLifted: number | null;
        rpe: number | null;
        targetSets: number;
      }>;
      completedAt: Date | null;
    }>;
  }>,
): Stats {
  let maxStrength = 0;
  let totalVolume = 0;
  let totalRPE = 0;
  let rpeCount = 0;
  let completedWorkouts = 0;
  let weekCount = 0;

  const weekSet = new Set<string>();

  for (const plan of workoutPlans) {
    for (const session of plan.sessions) {
      if (!session.completedAt) continue;

      completedWorkouts++;
      weekSet.add(getWeekNumber(session.completedAt).toString());

      for (const set of session.sets) {
        if (set.weightLifted && set.weightLifted > 0) {
          maxStrength = Math.max(maxStrength, set.weightLifted);
        }
        totalVolume += set.targetSets;
        if (set.rpe !== null && set.rpe > 0) {
          totalRPE += set.rpe;
          rpeCount++;
        }
      }
    }
  }

  weekCount = Math.max(weekSet.size, 1);

  return {
    maxStrength,
    avgVolume: Math.round(totalVolume / weekCount),
    avgRPE: rpeCount > 0 ? Math.round((totalRPE / rpeCount) * 10) / 10 : 0,
    completedWorkouts,
  };
}

// ============================================================
// Funções Auxiliares
// ============================================================

function getWeekNumber(date: Date): number {
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffWeeks = Math.floor(diffTime / (7 * 24 * 60 * 60 * 1000));
  return Math.max(1, diffWeeks);
}

function normalizeExerciseName(name: string): string {
  // Simplificar nomes para agrupamento
  const normalizations: Record<string, string> = {
    "Supino Reto com Barra": "Supino Reto",
    "Supino Reto (Barra)": "Supino Reto",
    "Agachamento Livre com Barra": "Agachamento Livre",
    "Agachamento (Barra)": "Agachamento Livre",
    "Levantamento Terra com Barra": "Levantamento Terra",
    "Terra (Barra)": "Levantamento Terra",
  };

  return normalizations[name] || name;
}

function normalizeMuscleGroup(muscleGroup: string): string {
  const normalizations: Record<string, string> = {
    CHEST: "peito",
    BACK: "costas",
    LEGS: "pernas",
    SHOULDERS: "ombros",
    ARMS: "bracos",
    CORE: "core",
    FULLBODY: "corpo",
  };

  return normalizations[muscleGroup] || muscleGroup.toLowerCase();
}
