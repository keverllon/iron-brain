import { NextRequest, NextResponse } from "next/server";
import {
  PrismaClient,
  MuscleGroup,
  EquipmentType,
  ExperienceLevel,
} from "@prisma/client";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import {
  workoutPlanSchema,
  aiWorkoutGenerationSchema,
} from "@/lib/zod-schemas";
import {
  generateWeeklyPlan,
  checkBiomechanicalBalance,
  determineNextPhase,
  getWeekConfig,
  type TrainingPhase,
  type PeriodizationModel,
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
    const validated = aiWorkoutGenerationSchema.omit({ userId: true }).safeParse(body);

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
    } = validated.data as any;

    // Buscar exercícios disponíveis no banco
    const exercises = await prisma.exercise.findMany({
      where: {
        equipmentType: { in: availableEquipment },
      },
    });

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
    let previousWeights: Record<string, number> = {};
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

    // Obter configuração da semana atual (sempre semana 1 para novo treino)
    const weekConfig = getWeekConfig(
      periodizationModel as PeriodizationModel,
      1,
    );

    // Gerar plano com o motor de periodização
    const generatedPlan = generateWeeklyPlan({
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

    // Verificar equilíbrio biomecânico
    const balanceCheck = checkBiomechanicalBalance(generatedPlan.sessions);

    // Salvar no banco
    const plan = await prisma.workoutPlan.create({
      data: {
        userId,
        name: generatedPlan.name,
        sessions: {
          create: generatedPlan.sessions.map((session) => ({
            day: session.day,
            sets: {
              create: session.exercises.map((ex) => {
                // Buscar exercise ID pelo nome (case-insensitive)
                const exercise = exerciseMap.get(ex.name.toLowerCase());
                if (!exercise) {
                  console.warn(`Exercício não encontrado: ${ex.name}`);
                }
                return {
                  exerciseId: exercise?.id ?? "",
                  targetSets: ex.sets,
                  targetReps: ex.targetReps,
                  weightLifted: ex.estimatedWeight,
                };
              }),
            },
          })),
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
          generatedPlan,
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
