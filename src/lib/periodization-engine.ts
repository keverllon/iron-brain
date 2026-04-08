import { MuscleGroup, EquipmentType, ExperienceLevel } from "@prisma/client";
import {
  calculateOneRM,
  calculatePercentageOfOneRM,
  getVolumeRecommendation,
  parseRepRange,
} from "@/lib/training-utils";

// ============================================================
// TYPES - Fases de Periodização (Regra 19)
// ============================================================

export type TrainingPhase = "HYPERTROPHY" | "STRENGTH" | "DELOAD";

// ============================================================
// TYPES - Modelos de Periodização
// ============================================================

export type PeriodizationModel =
  | "LINEAR"
  | "UNDULATING"
  | "BLOCK"
  | "REVERSE_LINEAR";

export interface PeriodizationModelConfig {
  name: string;
  description: string;
  idealFor: string;
  weekConfigs: WeekConfig[];
}

export interface WeekConfig {
  week: number;
  repRange: { min: number; max: number };
  intensityPercentage: { min: number; max: number };
  setsPerExercise: number;
  restBetweenSets: string;
  description: string;
}

export interface PhaseConfig {
  phase: TrainingPhase;
  repRange: { min: number; max: number };
  intensityPercentage: { min: number; max: number };
  restBetweenSets: string;
  setsPerExercise: number;
  description: string;
}

export const PHASE_CONFIGS: Record<TrainingPhase, PhaseConfig> = {
  HYPERTROPHY: {
    phase: "HYPERTROPHY",
    repRange: { min: 8, max: 12 },
    intensityPercentage: { min: 65, max: 80 },
    restBetweenSets: "60-90 segundos",
    setsPerExercise: 4,
    description: "Foco em volume moderado-alto com intensidade moderada",
  },
  STRENGTH: {
    phase: "STRENGTH",
    repRange: { min: 3, max: 6 },
    intensityPercentage: { min: 80, max: 92 },
    restBetweenSets: "2-5 minutos",
    setsPerExercise: 5,
    description: "Foco em cargas altas com baixo volume",
  },
  DELOAD: {
    phase: "DELOAD",
    repRange: { min: 8, max: 10 },
    intensityPercentage: { min: 50, max: 60 },
    restBetweenSets: "60-120 segundos",
    setsPerExercise: 2,
    description: "Semana de recuperação ativa - reduzir volume e intensidade",
  },
};

// ============================================================
// PERIODIZATION MODELS - Configurações dos 4 modelos
// ============================================================

export const PERIODIZATION_MODELS: Record<
  PeriodizationModel,
  PeriodizationModelConfig
> = {
  LINEAR: {
    name: "Periodização Linear",
    description:
      "Começa com alto volume e baixa intensidade, progredindo para baixo volume e alta intensidade ao longo das semanas.",
    idealFor:
      "Iniciantes ou pessoas voltando a treinar após longo período de inatividade",
    weekConfigs: [
      {
        week: 1,
        repRange: { min: 12, max: 15 },
        intensityPercentage: { min: 55, max: 65 },
        setsPerExercise: 3,
        restBetweenSets: "60 segundos",
        description: "Fase de adaptação - volume alto, intensidade baixa",
      },
      {
        week: 2,
        repRange: { min: 10, max: 12 },
        intensityPercentage: { min: 65, max: 75 },
        setsPerExercise: 4,
        restBetweenSets: "75 segundos",
        description: "Aumento gradual de carga",
      },
      {
        week: 3,
        repRange: { min: 8, max: 10 },
        intensityPercentage: { min: 75, max: 85 },
        setsPerExercise: 4,
        restBetweenSets: "90 segundos",
        description: "Transição para hipertrofia",
      },
      {
        week: 4,
        repRange: { min: 6, max: 8 },
        intensityPercentage: { min: 80, max: 90 },
        setsPerExercise: 5,
        restBetweenSets: "120 segundos",
        description: "Fase de força - carga alta, volume baixo",
      },
    ],
  },
  UNDULATING: {
    name: "Periodização Ondulatória",
    description:
      "Altera volume e intensidade a cada treino, evitando estagnação e tédio.",
    idealFor: "Praticantes intermediários e avançados com boa base técnica",
    weekConfigs: [
      {
        week: 1,
        repRange: { min: 6, max: 8 },
        intensityPercentage: { min: 80, max: 90 },
        setsPerExercise: 5,
        restBetweenSets: "120-180 segundos",
        description: "Dia de Força - cargas altas, poucas repetições",
      },
      {
        week: 2,
        repRange: { min: 8, max: 12 },
        intensityPercentage: { min: 65, max: 80 },
        setsPerExercise: 4,
        restBetweenSets: "60-90 segundos",
        description: "Dia de Hipertrofia - cargas médias, repetições médias",
      },
      {
        week: 3,
        repRange: { min: 12, max: 15 },
        intensityPercentage: { min: 55, max: 65 },
        setsPerExercise: 3,
        restBetweenSets: "45-60 segundos",
        description: "Dia de Resistência - cargas leves, muitas repetições",
      },
      {
        week: 4,
        repRange: { min: 8, max: 10 },
        intensityPercentage: { min: 70, max: 80 },
        setsPerExercise: 4,
        restBetweenSets: "90 segundos",
        description:
          "Semana de transição - equilíbrio entre volume e intensidade",
      },
    ],
  },
  BLOCK: {
    name: "Periodização em Blocos",
    description:
      "Divide o treinamento em blocos especializados de 2-4 semanas, cada um com foco específico.",
    idealFor:
      "Atletas de alto rendimento, powerlifters ou pessoas com objetivos de performance específicos",
    weekConfigs: [
      {
        week: 1,
        repRange: { min: 10, max: 15 },
        intensityPercentage: { min: 60, max: 70 },
        setsPerExercise: 4,
        restBetweenSets: "60-90 segundos",
        description: "Bloco de Acumulação - foco em volume/hipertrofia",
      },
      {
        week: 2,
        repRange: { min: 10, max: 15 },
        intensityPercentage: { min: 60, max: 70 },
        setsPerExercise: 5,
        restBetweenSets: "60-90 segundos",
        description: "Bloco de Acumulação - aumento de volume",
      },
      {
        week: 3,
        repRange: { min: 4, max: 6 },
        intensityPercentage: { min: 85, max: 95 },
        setsPerExercise: 5,
        restBetweenSets: "180-300 segundos",
        description: "Bloco de Transmutação - foco em força máxima",
      },
      {
        week: 4,
        repRange: { min: 3, max: 5 },
        intensityPercentage: { min: 90, max: 100 },
        setsPerExercise: 3,
        restBetweenSets: "180-300 segundos",
        description: "Bloco de Realização - peaking para competição",
      },
    ],
  },
  REVERSE_LINEAR: {
    name: "Periodização Linear Reversa",
    description:
      "Começa com alta intensidade e baixo volume, progredindo para baixa intensidade e alto volume.",
    idealFor:
      "Atletas de resistência ou fisiculturistas em fase de definição (cutting)",
    weekConfigs: [
      {
        week: 1,
        repRange: { min: 4, max: 6 },
        intensityPercentage: { min: 85, max: 95 },
        setsPerExercise: 5,
        restBetweenSets: "180-300 segundos",
        description: "Fase de força - carga máxima, volume mínimo",
      },
      {
        week: 2,
        repRange: { min: 6, max: 8 },
        intensityPercentage: { min: 75, max: 85 },
        setsPerExercise: 4,
        restBetweenSets: "120 segundos",
        description: "Transição - redução gradual de carga",
      },
      {
        week: 3,
        repRange: { min: 10, max: 12 },
        intensityPercentage: { min: 65, max: 75 },
        setsPerExercise: 4,
        restBetweenSets: "90 segundos",
        description: "Fase de hipertrofia - aumento de volume",
      },
      {
        week: 4,
        repRange: { min: 15, max: 20 },
        intensityPercentage: { min: 50, max: 60 },
        setsPerExercise: 3,
        restBetweenSets: "45-60 segundos",
        description:
          "Fase de resistência muscular - volume máximo, carga mínima",
      },
    ],
  },
};

// ============================================================
// DEFAULT WEIGHTS - Pesos padrão para exercícios sem histórico
// ============================================================

/**
 * Retorna um peso padrão baseado no grupo muscular e tipo de exercício
 * Valores conservadores para iniciantes sem histórico de treino
 */
function getDefaultWeight(
  exercise: ExerciseCandidate,
  phase: TrainingPhase,
): number {
  // Pesos baseados no grupo muscular (em kg)
  const baseWeights: Record<MuscleGroup, number> = {
    CHEST: 20, // Supino reto vazio + anilhas leves
    BACK: 25, // Remada com barra leve
    LEGS: 30, // Agachamento com barra vazia + anilhas
    SHOULDERS: 15, // Desenvolvimento com halteres leves
    ARMS: 10, // Rosca direta com barra leve
    CORE: 0, // Exercícios de core geralmente são bodyweight
    FULLBODY: 20, // Média para full body
  };

  let weight = baseWeights[exercise.muscleGroup] || 20;

  // Ajustar baseado no tipo de exercício
  if (exercise.isCompound) {
    weight = Math.round(weight * 1.2); // Compostos permitem mais peso
  }

  // Ajustar baseado no equipamento
  if (exercise.equipmentType === "DUMBBELL") {
    weight = Math.round(weight * 0.6); // Halteres são por braço
  } else if (
    exercise.equipmentType === "MACHINE_PLATE" ||
    exercise.equipmentType === "MACHINE_CABLE"
  ) {
    weight = Math.round(weight * 0.8); // Máquinas são mais fáceis
  } else if (exercise.equipmentType === "BODYWEIGHT") {
    weight = 0; // Bodyweight não tem peso externo
  }

  // Ajustar baseado na fase
  if (phase === "STRENGTH") {
    weight = Math.round(weight * 1.3); // Fase de força usa mais peso
  } else if (phase === "DELOAD") {
    weight = Math.round(weight * 0.6); // Deload usa menos peso
  }

  return Math.max(weight, 0); // Garantir que não seja negativo
}

// ============================================================
// EXERCISE SELECTION - Seleção inteligente por equipamento
// ============================================================

export interface ExerciseCandidate {
  name: string;
  muscleGroup: MuscleGroup;
  equipmentType: EquipmentType;
  isCompound: boolean;
  priority: number; // 1-5 (1 = mais prioritário)
}

/**
 * Seleciona exercícios baseado nos equipamentos disponíveis
 * Prioriza exercícios compostos (compound) primeiro
 */
export function selectExercises(
  availableExercises: Array<{
    name: string;
    muscleGroup: MuscleGroup;
    equipmentType: EquipmentType;
    isCompound: boolean;
  }>,
  targetMuscleGroup: MuscleGroup,
  availableEquipment: EquipmentType[],
): ExerciseCandidate[] {
  return availableExercises
    .filter(
      (ex) =>
        ex.muscleGroup === targetMuscleGroup &&
        availableEquipment.includes(ex.equipmentType),
    )
    .map((ex) => ({
      ...ex,
      priority: ex.isCompound ? 1 : 3,
    }))
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 4); // Máximo 4 exercícios por grupo muscular
}

// ============================================================
// WORKOUT GENERATION - Geração de treino por sessão
// ============================================================

export interface GeneratedExercise {
  name: string;
  muscleGroup: MuscleGroup;
  equipmentType: EquipmentType;
  sets: number;
  targetReps: string;
  estimatedWeight?: number;
  restBetweenSets: string;
  notes?: string;
}

export interface GeneratedSession {
  day: string;
  focus: MuscleGroup;
  exercises: GeneratedExercise[];
  totalSets: number;
  estimatedDuration: string;
}

export interface GeneratedWorkoutPlan {
  name: string;
  phase: TrainingPhase;
  sessions: GeneratedSession[];
  weeklyVolumePerMuscle: Record<string, number>;
}

/**
 * Obtém a configuração da semana atual baseada no modelo de periodização
 */
export function getWeekConfig(
  model: PeriodizationModel,
  currentWeek: number,
): WeekConfig {
  const modelConfig = PERIODIZATION_MODELS[model];
  const weekIndex = (currentWeek - 1) % modelConfig.weekConfigs.length;
  return modelConfig.weekConfigs[weekIndex];
}

/**
 * Gera uma sessão de treino para um grupo muscular específico
 */
export function generateSession(
  day: string,
  focus: MuscleGroup,
  exercises: ExerciseCandidate[],
  phase: TrainingPhase,
  estimatedOneRM?: number,
  previousWeights?: Record<string, number>,
  weekConfig?: WeekConfig,
): GeneratedSession {
  // Usar configuração da semana se disponível, senão usar configuração da fase
  const config = weekConfig
    ? {
        repRange: weekConfig.repRange,
        intensityPercentage: weekConfig.intensityPercentage,
        restBetweenSets: weekConfig.restBetweenSets,
        setsPerExercise: weekConfig.setsPerExercise,
        description: weekConfig.description,
      }
    : PHASE_CONFIGS[phase];

  const generatedExercises: GeneratedExercise[] = [];
  let totalSets = 0;

  for (const exercise of exercises) {
    const sets = config.setsPerExercise;
    const reps = `${config.repRange.min}-${config.repRange.max}`;

    let estimatedWeight: number | undefined;

    // Priorizar peso anterior com progressão de 2.5%
    if (previousWeights?.[exercise.name]) {
      estimatedWeight = Math.round(previousWeights[exercise.name] * 1.025);
    } else if (estimatedOneRM) {
      const avgIntensity =
        (config.intensityPercentage.min + config.intensityPercentage.max) / 2;
      estimatedWeight = calculatePercentageOfOneRM(
        estimatedOneRM,
        avgIntensity,
      );
    } else {
      // Peso padrão baseado no tipo de exercício e grupo muscular
      estimatedWeight = getDefaultWeight(exercise, phase);
    }

    generatedExercises.push({
      name: exercise.name,
      muscleGroup: exercise.muscleGroup,
      equipmentType: exercise.equipmentType,
      sets,
      targetReps: reps,
      estimatedWeight,
      restBetweenSets: config.restBetweenSets,
      notes: exercise.isCompound
        ? "Exercício composto - priorize a forma"
        : undefined,
    });

    totalSets += sets;
  }

  // Estimativa de duração: ~2 min por série + 1 min de aquecimento
  const estimatedDuration = `${Math.ceil(totalSets * 2 + 5)} min`;

  return {
    day,
    focus,
    exercises: generatedExercises,
    totalSets,
    estimatedDuration,
  };
}

// ============================================================
// FULL PLAN GENERATION - Gera plano semanal completo
// ============================================================

interface WorkoutGenerationParams {
  experienceLevel: ExperienceLevel;
  targetMuscleGroups: MuscleGroup[];
  availableEquipment: EquipmentType[];
  availableExercises: Array<{
    name: string;
    muscleGroup: MuscleGroup;
    equipmentType: EquipmentType;
    isCompound: boolean;
  }>;
  sessionsPerWeek: number;
  phase: TrainingPhase;
  periodizationModel?: PeriodizationModel;
  estimatedOneRMs?: Record<string, number>;
  previousWeights?: Record<string, number>;
}

/**
 * Gera um plano de treino semanal completo baseado nos parâmetros
 * Respeita as regras do TRAINING_LOGIC.md
 */
export function generateWeeklyPlan(
  params: WorkoutGenerationParams,
): GeneratedWorkoutPlan {
  const {
    targetMuscleGroups,
    availableEquipment,
    availableExercises,
    sessionsPerWeek,
    phase,
    periodizationModel = "LINEAR",
    estimatedOneRMs,
    previousWeights,
  } = params;

  const volumeRec = getVolumeRecommendation(params.experienceLevel);
  const phaseConfig = PHASE_CONFIGS[phase];

  // Obter configuração da semana atual (sempre semana 1 para novo treino)
  const weekConfig = getWeekConfig(periodizationModel, 1);

  // Distribuir grupos musculares pelos dias
  const sessions: GeneratedSession[] = [];
  const days = [
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
    "Domingo",
  ];

  // Lógica de split baseada no nível e frequência
  const split = determineSplit(
    params.experienceLevel,
    sessionsPerWeek,
    targetMuscleGroups,
  );

  for (let i = 0; i < sessionsPerWeek && i < split.length; i++) {
    const dayFocus = split[i];
    const selectedExercises = selectExercises(
      availableExercises,
      dayFocus,
      availableEquipment,
    );

    const session = generateSession(
      days[i],
      dayFocus,
      selectedExercises,
      phase,
      estimatedOneRMs?.[dayFocus],
      previousWeights,
      weekConfig,
    );

    sessions.push(session);
  }

  // Calcular volume semanal por grupo muscular
  const weeklyVolumePerMuscle: Record<string, number> = {};
  for (const session of sessions) {
    const key = session.focus;
    weeklyVolumePerMuscle[key] =
      (weeklyVolumePerMuscle[key] || 0) + session.totalSets;
  }

  const planName = `Plano ${phase} - ${params.experienceLevel} - ${sessionsPerWeek}x/semana`;

  return {
    name: planName,
    phase,
    sessions,
    weeklyVolumePerMuscle,
  };
}

// ============================================================
// SPLIT DETERMINATION - Lógica de divisão de treino
// ============================================================

type MuscleSplit = MuscleGroup[];

/**
 * Determina o split de treino baseado no nível e frequência
 */
function determineSplit(
  experienceLevel: ExperienceLevel,
  sessionsPerWeek: number,
  targetMuscleGroups: MuscleGroup[],
): MuscleSplit {
  // Para iniciantes: FullBody ou Upper/Lower
  if (experienceLevel === "BEGINNER") {
    if (sessionsPerWeek <= 3) {
      // FullBody 3x
      return Array(sessionsPerWeek).fill(MuscleGroup.FULLBODY) as MuscleGroup[];
    }
    // Upper/Lower 4x
    return [
      MuscleGroup.FULLBODY,
      MuscleGroup.FULLBODY,
      MuscleGroup.FULLBODY,
      MuscleGroup.FULLBODY,
    ];
  }

  // Para intermediários: PPL ou Upper/Lower
  if (experienceLevel === "INTERMEDIATE") {
    if (sessionsPerWeek >= 6) {
      // PPL 6x (Push/Pull/Legs x2)
      return [
        MuscleGroup.CHEST,
        MuscleGroup.BACK,
        MuscleGroup.LEGS,
        MuscleGroup.SHOULDERS,
        MuscleGroup.ARMS,
        MuscleGroup.LEGS,
      ];
    }
    if (sessionsPerWeek === 5) {
      // Upper/Lower + Ponto fraco
      return [
        MuscleGroup.CHEST,
        MuscleGroup.LEGS,
        MuscleGroup.BACK,
        MuscleGroup.SHOULDERS,
        MuscleGroup.ARMS,
      ];
    }
    // Upper/Lower 4x
    return [
      MuscleGroup.CHEST,
      MuscleGroup.LEGS,
      MuscleGroup.BACK,
      MuscleGroup.SHOULDERS,
    ];
  }

  // Para avançados: Bro-Split ou PPL + Ponto Fraco
  return targetMuscleGroups.slice(0, sessionsPerWeek);
}

// ============================================================
// PHASE PROGRESSION - Progressão entre fases
// ============================================================

export interface PhaseProgression {
  currentPhase: TrainingPhase;
  nextPhase: TrainingPhase;
  weeksInCurrentPhase: number;
  recommendation: string;
}

/**
 * Determina a progressão de fases baseada nas semanas de treino
 * Ciclo típico: Hipertrofia (4-6 semanas) -> Força (3-4 semanas) -> Deload (1 semana)
 */
export function determineNextPhase(
  currentPhase: TrainingPhase,
  weeksInPhase: number,
  userFeedback?: string,
): PhaseProgression {
  switch (currentPhase) {
    case "HYPERTROPHY":
      if (weeksInPhase >= 6) {
        return {
          currentPhase: "HYPERTROPHY",
          nextPhase: "STRENGTH",
          weeksInCurrentPhase: weeksInPhase,
          recommendation:
            "Transição para fase de Força. Aumentar cargas, reduzir reps.",
        };
      }
      return {
        currentPhase: "HYPERTROPHY",
        nextPhase: "HYPERTROPHY",
        weeksInCurrentPhase: weeksInPhase,
        recommendation: "Continuar fase de Hipertrofia.",
      };

    case "STRENGTH":
      if (weeksInPhase >= 4) {
        return {
          currentPhase: "STRENGTH",
          nextPhase: "DELOAD",
          weeksInCurrentPhase: weeksInPhase,
          recommendation: "Semana de Deload necessária. Reduzir volume em 50%.",
        };
      }
      return {
        currentPhase: "STRENGTH",
        nextPhase: "STRENGTH",
        weeksInCurrentPhase: weeksInPhase,
        recommendation: "Continuar fase de Força.",
      };

    case "DELOAD":
      return {
        currentPhase: "DELOAD",
        nextPhase: "HYPERTROPHY",
        weeksInCurrentPhase: weeksInPhase,
        recommendation:
          "Deload concluído. Retornar para Hipertrofia com cargas atualizadas.",
      };
  }
}

// ============================================================
// BIOMECHANICAL BALANCE - Validação anti-lesão (Regra 3)
// ============================================================

export interface BalanceCheck {
  isBalanced: boolean;
  pushSets: number;
  pullSets: number;
  recommendation: string;
}

/**
 * Verifica equilíbrio entre exercícios de empurrar e puxar
 * Para cada série de "Empurrar" horizontal, deve haver 1 série de "Puxar"
 */
export function checkBiomechanicalBalance(
  sessions: GeneratedSession[],
): BalanceCheck {
  let pushSets = 0;
  let pullSets = 0;

  const pushMuscles: MuscleGroup[] = [MuscleGroup.CHEST, MuscleGroup.SHOULDERS];
  const pullMuscles: MuscleGroup[] = [MuscleGroup.BACK];

  for (const session of sessions) {
    if (pushMuscles.includes(session.focus as MuscleGroup)) {
      pushSets += session.totalSets;
    }
    if (pullMuscles.includes(session.focus as MuscleGroup)) {
      pullSets += session.totalSets;
    }
  }

  const ratio = pushSets / Math.max(pullSets, 1);
  const isBalanced = ratio <= 1.2;

  let recommendation = "";
  if (!isBalanced) {
    recommendation = `Desequilíbrio detectado: ${pushSets} séries push vs ${pullSets} séries pull. Adicionar mais exercícios de puxada (remadas).`;
  } else {
    recommendation = "Equilíbrio biomecânico adequado.";
  }

  return {
    isBalanced,
    pushSets,
    pullSets,
    recommendation,
  };
}
