import { MuscleGroup } from "@prisma/client";

// ============================================================
// 1RM PREDICTION - Fórmulas Científicas (Regra 18)
// ============================================================

export interface OneRMResult {
  brzycki: number;
  epley: number;
  average: number;
}

/**
 * Fórmula de Brzycki: 1RM = weight * (36 / (37 - reps))
 * Mais precisa para reps entre 2-10
 */
export function calculateOneRMBrzycki(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  if (reps >= 37) return weight; // Evita divisão por zero

  return weight * (36 / (37 - reps));
}

/**
 * Fórmula de Epley: 1RM = weight * (1 + reps/30)
 * Boa para reps entre 1-12
 */
export function calculateOneRMEpley(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;

  return weight * (1 + reps / 30);
}

/**
 * Calcula 1RM usando média das fórmulas Brzycki e Epley
 */
export function calculateOneRM(weight: number, reps: number): OneRMResult {
  const brzycki = calculateOneRMBrzycki(weight, reps);
  const epley = calculateOneRMEpley(weight, reps);
  const average = (brzycki + epley) / 2;

  return {
    brzycki: Math.round(brzycki * 10) / 10,
    epley: Math.round(epley * 10) / 10,
    average: Math.round(average * 10) / 10,
  };
}

/**
 * Calcula porcentagem do 1RM para determinar carga de treino
 */
export function calculatePercentageOfOneRM(
  oneRM: number,
  percentage: number,
): number {
  return Math.round(((oneRM * percentage) / 100) * 10) / 10;
}

// ============================================================
// VOLUME SEMANAL - Cálculo por Grupo Muscular (Regra 17)
// ============================================================

export interface WeeklyVolume {
  muscleGroup: MuscleGroup;
  totalSets: number;
  totalReps: number;
  totalVolume: number; // sets * reps * weight
  exercises: string[];
}

export interface WeeklyVolumeReport {
  muscleGroups: WeeklyVolume[];
  totalWeeklySets: number;
  totalWeeklyVolume: number;
}

/**
 * Calcula o volume semanal por grupo muscular
 * Deve ser chamado com os dados de todas as sessões da semana
 */
export function calculateWeeklyVolume(
  sessions: Array<{
    exercises: Array<{
      exercise: {
        name: string;
        muscleGroup: MuscleGroup;
      };
      targetSets: number;
      targetReps: string;
      actualReps: number | null;
      weightLifted: number | null;
    }>;
  }>,
): WeeklyVolumeReport {
  const volumeMap = new Map<MuscleGroup, WeeklyVolume>();

  for (const session of sessions) {
    for (const exerciseSet of session.exercises) {
      const muscleGroup = exerciseSet.exercise.muscleGroup;
      const reps = parseRepRange(exerciseSet.targetReps);
      const avgReps = (reps.min + reps.max) / 2;
      const actualReps = exerciseSet.actualReps ?? avgReps;
      const weight = exerciseSet.weightLifted ?? 0;

      const existing = volumeMap.get(muscleGroup);
      if (existing) {
        existing.totalSets += exerciseSet.targetSets;
        existing.totalReps += exerciseSet.targetSets * actualReps;
        existing.totalVolume += exerciseSet.targetSets * actualReps * weight;
        if (!existing.exercises.includes(exerciseSet.exercise.name)) {
          existing.exercises.push(exerciseSet.exercise.name);
        }
      } else {
        volumeMap.set(muscleGroup, {
          muscleGroup,
          totalSets: exerciseSet.targetSets,
          totalReps: exerciseSet.targetSets * actualReps,
          totalVolume: exerciseSet.targetSets * actualReps * weight,
          exercises: [exerciseSet.exercise.name],
        });
      }
    }
  }

  const muscleGroups = Array.from(volumeMap.values());
  const totalWeeklySets = muscleGroups.reduce(
    (sum, mg) => sum + mg.totalSets,
    0,
  );
  const totalWeeklyVolume = muscleGroups.reduce(
    (sum, mg) => sum + mg.totalVolume,
    0,
  );

  return {
    muscleGroups,
    totalWeeklySets,
    totalWeeklyVolume,
  };
}

// ============================================================
// PARSE REP RANGE - Converte string "8-12" para números
// ============================================================

export interface RepRange {
  min: number;
  max: number;
}

export function parseRepRange(repString: string): RepRange {
  const parts = repString.split("-").map((p) => parseInt(p.trim(), 10));

  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return { min: parts[0], max: parts[1] };
  }

  const single = parseInt(repString, 10);
  if (!isNaN(single)) {
    return { min: single, max: single };
  }

  return { min: 8, max: 12 }; // Default
}

// ============================================================
// PROGRESSIVE OVERLOAD - Regra 2 do TRAINING_LOGIC.md
// ============================================================

export interface OverloadRecommendation {
  newWeight: number;
  action: "INCREASE" | "MAINTAIN" | "DELOAD";
  reason: string;
}

/**
 * Aplica a regra de Progressive Overload:
 * - Se RPE < 8 e completou todas as reps: Aumentar 2.5-5kg
 * - Se RPE = 10 ou falha técnica: Manter ou reduzir 10% (Deload)
 */
export function calculateProgressiveOverload(
  currentWeight: number,
  completedReps: number,
  targetRepsMax: number,
  rpe: number,
): OverloadRecommendation {
  // Completou todas as repetições com RPE baixo -> Aumentar carga
  if (completedReps >= targetRepsMax && rpe < 8) {
    const increase = rpe <= 6 ? 5 : 2.5;
    return {
      newWeight: Math.round((currentWeight + increase) * 10) / 10,
      action: "INCREASE",
      reason: `Completou ${completedReps} reps com RPE ${rpe}. Aumentar ${increase}kg.`,
    };
  }

  // RPE máximo -> Deload ou manter
  if (rpe >= 10) {
    const deloadWeight = Math.round(currentWeight * 0.9 * 10) / 10;
    return {
      newWeight: deloadWeight,
      action: "DELOAD",
      reason: `RPE ${rpe} indica falha. Reduzir 10% para ${deloadWeight}kg (Deload).`,
    };
  }

  // RPE moderado -> Manter carga
  return {
    newWeight: currentWeight,
    action: "MAINTAIN",
    reason: `RPE ${rpe} está na zona ideal. Manter ${currentWeight}kg.`,
  };
}

// ============================================================
// VOLUME RECOMMENDATION - Baseado no nível de experiência
// ============================================================

export interface VolumeRecommendation {
  minSets: number;
  maxSets: number;
  recommendedFrequency: string;
  recommendedRPE: string;
}

export function getVolumeRecommendation(
  experienceLevel: "BEGINNER" | "INTERMEDIATE" | "ADVANCED",
): VolumeRecommendation {
  switch (experienceLevel) {
    case "BEGINNER":
      return {
        minSets: 8,
        maxSets: 12,
        recommendedFrequency: "FullBody 3x ou Upper/Lower 4x",
        recommendedRPE: "7-8 (2-3 reps na reserva)",
      };
    case "INTERMEDIATE":
      return {
        minSets: 12,
        maxSets: 16,
        recommendedFrequency: "PPL 6x ou Upper/Lower 4x",
        recommendedRPE: "8-9 (próximo à falha)",
      };
    case "ADVANCED":
      return {
        minSets: 16,
        maxSets: 22,
        recommendedFrequency: "Bro-Split (ABCDE) ou PPL + Ponto Fraco",
        recommendedRPE: "9-10 (falha técnica)",
      };
  }
}
