import { NextRequest, NextResponse } from "next/server";
import { MuscleGroup, EquipmentType, ExperienceLevel } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import {
  workoutPlanSchema,
  aiWorkoutGenerationSchema,
  type AIWorkoutGenerationInput,
} from "@/lib/zod-schemas";
import {
  generateWeeklyPlan,
  checkBiomechanicalBalance,
  determineNextPhase,
  getWeekConfig,
  type TrainingPhase,
  type PeriodizationModel,
  type GeneratedSession,
  type GeneratedExercise,
} from "@/lib/periodization-engine";

// GET - Listar planos de treino do usuário autenticado
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Não autenticado" },
        { status: 401 },
      );
    }

    const plans = await prisma.workoutPlan.findMany({
      where: { userId: user.userId },
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
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: plans,
      count: plans.length,
    });
  } catch (error) {
    console.error("Error fetching workout plans:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao buscar planos de treino" },
      { status: 500 },
    );
  }
}

// POST - Criar plano de treino ou gerar via IA
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Não autenticado" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    // Se action=generate, usa o motor de IA
    if (action === "generate") {
      return await generateWorkoutPlan(body, user.userId);
    }

    // Caso contrário, cria manualmente com validação Zod
    const validated = workoutPlanSchema.safeParse(body);

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

    const { userId, name, sessions } = validated.data;

    // Criar plano com sessões e sets
    const plan = await prisma.workoutPlan.create({
      data: {
        userId,
        name,
        sessions: {
          create: sessions.map((session) => ({
            day: session.day,
            sets: {
              create: session.exercises.map((ex) => ({
                exerciseId: ex.exerciseId,
                targetSets: ex.targetSets,
                targetReps: ex.targetReps,
                actualReps: ex.actualReps,
                weightLifted: ex.weightLifted,
                rpe: ex.rpe,
              })),
            },
          })),
        },
      },
      include: {
        sessions: {
          include: {
            sets: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: plan }, { status: 201 });
  } catch (error) {
    console.error("Error creating workout plan:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao criar plano de treino" },
      { status: 500 },
    );
  }
}

// ============================================================
// AI WORKOUT GENERATION
// ============================================================

async function generateWorkoutPlan(body: unknown, userId: string) {
  try {
    const validated = aiWorkoutGenerationSchema
      .omit({ userId: true })
      .safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Dados inválidos para geração de treino",
          details: validated.error.flatten(),
        },
        { status: 400 },
      );
    }

    const {
      experienceLevel,
      targetMuscleGroups,
      availableEquipment,
      sessionsPerWeek,
      phase,
      periodizationModel,
      exerciseWeights,
      workoutLocation,
    } = validated.data as AIWorkoutGenerationInput;

    // Filtrar exercícios baseado no local de treino
    let exercises = await prisma.exercise.findMany();
    
    // Filtrar exercícios se for treino em casa ( BODYWEIGHT )
    if (workoutLocation === "HOME" || (availableEquipment.length === 1 && availableEquipment[0] === "BODYWEIGHT")) {
      exercises = exercises.filter(ex => ex.equipmentType === "BODYWEIGHT" || ex.equipmentType === "DUMBBELL");
    } else {
      // Para academia, filtrar por equipamentos disponíveis
      exercises = exercises.filter(ex => availableEquipment.includes(ex.equipmentType));
    }

    // Se não tiver exercícios suficientes para academia, criar padrão
    if (exercises.length < 5 && workoutLocation !== "HOME") {
      console.log("Banco de exercícios vazio. Criando lista padrão...");
      const defaultExercises = [
        {
          name: "Supino Reto",
          muscleGroup: "CHEST" as MuscleGroup,
          equipmentType: "BARBELL" as EquipmentType,
          isCompound: true,
        },
        {
          name: "Supino Inclinado Halteres",
          muscleGroup: "CHEST" as MuscleGroup,
          equipmentType: "DUMBBELL" as EquipmentType,
          isCompound: true,
        },
        {
          name: "Crucifixo",
          muscleGroup: "CHEST" as MuscleGroup,
          equipmentType: "DUMBBELL" as EquipmentType,
          isCompound: false,
        },
        {
          name: "Puxada Frontal",
          muscleGroup: "BACK" as MuscleGroup,
          equipmentType: "MACHINE_CABLE" as EquipmentType,
          isCompound: true,
        },
        {
          name: "Remada Curvada",
          muscleGroup: "BACK" as MuscleGroup,
          equipmentType: "BARBELL" as EquipmentType,
          isCompound: true,
        },
        {
          name: "Levantamento Terra",
          muscleGroup: "BACK" as MuscleGroup,
          equipmentType: "BARBELL" as EquipmentType,
          isCompound: true,
        },
        {
          name: "Agachamento Livre",
          muscleGroup: "LEGS" as MuscleGroup,
          equipmentType: "BARBELL" as EquipmentType,
          isCompound: true,
        },
        {
          name: "Leg Press",
          muscleGroup: "LEGS" as MuscleGroup,
          equipmentType: "MACHINE_PLATE" as EquipmentType,
          isCompound: true,
        },
        {
          name: "Cadeira Extensora",
          muscleGroup: "LEGS" as MuscleGroup,
          equipmentType: "MACHINE_PLATE" as EquipmentType,
          isCompound: false,
        },
        {
          name: "Desenvolvimento",
          muscleGroup: "SHOULDERS" as MuscleGroup,
          equipmentType: "DUMBBELL" as EquipmentType,
          isCompound: true,
        },
        {
          name: "Elevação Lateral",
          muscleGroup: "SHOULDERS" as MuscleGroup,
          equipmentType: "DUMBBELL" as EquipmentType,
          isCompound: false,
        },
        {
          name: "Rosca Direta",
          muscleGroup: "ARMS" as MuscleGroup,
          equipmentType: "BARBELL" as EquipmentType,
          isCompound: false,
        },
        {
          name: "Tríceps Testa",
          muscleGroup: "ARMS" as MuscleGroup,
          equipmentType: "DUMBBELL" as EquipmentType,
          isCompound: false,
        },
        {
          name: "Tríceps Pulley",
          muscleGroup: "ARMS" as MuscleGroup,
          equipmentType: "MACHINE_CABLE" as EquipmentType,
          isCompound: false,
        },
      ];

      try {
        await prisma.exercise.createMany({
          data: defaultExercises,
          skipDuplicates: true,
        });
        // Busca novamente no banco após criar
        exercises = await prisma.exercise.findMany();
      } catch (e) {
        console.error("Falha ao criar exercícios padrão:", e);
      }
    }

    // Criar mapa de exercícios por nome para busca rápida (case-insensitive)
    const exerciseMap = new Map<
      string,
      {
        id: string;
        name: string;
        muscleGroup: MuscleGroup;
        equipmentType: EquipmentType;
        isCompound: boolean;
      }
    >();
    for (const ex of exercises) {
      exerciseMap.set(ex.name.toLowerCase(), ex);
    }

    // Buscar pesos anteriores do usuário para progressão
    const previousWeights: Record<string, number> = {};
    if (!exerciseWeights) {
      const lastPlan = await prisma.workoutPlan.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: {
          sessions: {
            include: {
              sets: {
                include: { exercise: true },
              },
            },
          },
        },
      });

      if (lastPlan) {
        for (const session of lastPlan.sessions) {
          for (const set of session.sets) {
            if (set.weightLifted && set.exercise) {
              previousWeights[set.exercise.name] = set.weightLifted;
            }
          }
        }
      }
    }

    // Gerar plano com o motor de periodização - 4 semanas
    const totalWeeks = 4;
    const allSessions: { day: string; week: number }[] = [];
    const planWeeks: { week: number; config: unknown; sessions: GeneratedSession[]; weeklyVolumePerMuscle: Record<string, number> }[] = [];

    for (let week = 1; week <= totalWeeks; week++) {
      const weekConfig = getWeekConfig(
        periodizationModel as PeriodizationModel,
        week,
      );

      const generatedWeek = generateWeeklyPlan({
        experienceLevel: experienceLevel as ExperienceLevel,
        targetMuscleGroups: targetMuscleGroups as MuscleGroup[],
        availableEquipment: availableEquipment as EquipmentType[],
        availableExercises: exercises.map((ex) => ({
          name: ex.name,
          muscleGroup: ex.muscleGroup,
          equipmentType: ex.equipmentType,
          isCompound: ex.isCompound,
        })),
        sessionsPerWeek,
        phase: phase as TrainingPhase,
        previousWeights: exerciseWeights || previousWeights,
        periodizationModel: periodizationModel as PeriodizationModel,
      });

      planWeeks.push({
        week,
        config: weekConfig,
        sessions: generatedWeek.sessions,
        weeklyVolumePerMuscle: generatedWeek.weeklyVolumePerMuscle,
      });

      // Adicionar sessões desta semana
      allSessions.push(...generatedWeek.sessions.map(s => ({ ...s, week })));
    }

    // Gerar nome do plano
    const phaseLabel = phase === "HYPERTROPHY" ? "Hipertrofia" : phase === "STRENGTH" ? "Força" : "Deload";
    const planName = `${phaseLabel} - ${sessionsPerWeek}x/semana - ${totalWeeks} semanas`;

    // Verificar equilíbrio biomecânico da primeira semana
    const balanceCheck = checkBiomechanicalBalance(planWeeks[0].sessions);

    // Salvar no banco - criar uma sessão por semana (4 semanas de treino)
    // Cada "semana" terá sessionsPerWeek dias, então no total serão sessionsPerWeek * totalWeeks entradas
    const plan = await prisma.workoutPlan.create({
      data: {
        userId,
        name: planName,
        sessions: {
          create: planWeeks.flatMap((weekData) => 
            weekData.sessions.map((session: GeneratedSession) => ({
              day: `${session.day} (Semana ${weekData.week})`,
              weekNumber: weekData.week,
              sets: {
                create: session.exercises
                  .map((ex: GeneratedExercise) => {
                    const exercise = exerciseMap.get(ex.name.toLowerCase());
                    if (!exercise) {
                      console.warn(
                        `Exercício ignorado (não encontrado no banco): ${ex.name}`,
                      );
                      return null;
                    }
                    return {
                      exerciseId: exercise.id,
                      targetSets: ex.sets || 3,
                      targetReps: ex.targetReps || "8-12",
                      weightLifted: ex.estimatedWeight || 0,
                    };
                  })
                  .filter((set): set is NonNullable<typeof set> => set !== null),
              },
            }))
          ),
        },
      },
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

    return NextResponse.json(
      {
        success: true,
        data: {
          plan,
          generatedPlan: {
            name: planName,
            phase,
            sessions: allSessions,
            weeklyVolumePerMuscle: planWeeks[0].weeklyVolumePerMuscle,
          },
          planWeeks,
          biomechanicalBalance: balanceCheck,
          phaseProgression: determineNextPhase(phase as TrainingPhase, 0),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error generating workout plan:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao gerar plano de treino via IA" },
      { status: 500 },
    );
  }
}
