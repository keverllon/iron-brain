import { z } from "zod";
import {
  MuscleGroup,
  TargetGender,
  EquipmentType,
  ExperienceLevel,
} from "@prisma/client";

// Schema para criação de exercício
export const exerciseSchema = z.object({
  name: z.string().min(3, "Nome do exercício deve ter pelo menos 3 caracteres"),
  muscleGroup: z.nativeEnum(MuscleGroup),
  equipmentType: z.nativeEnum(EquipmentType).default(EquipmentType.BARBELL),
  targetGender: z.nativeEnum(TargetGender).default(TargetGender.BOTH),
  isCompound: z.boolean().default(false),
});

export type ExerciseInput = z.infer<typeof exerciseSchema>;

// Schema para atualização de exercício
export const exerciseUpdateSchema = exerciseSchema.partial();

export type ExerciseUpdateInput = z.infer<typeof exerciseUpdateSchema>;

// Schema para registro de série executada
export const workoutSetSchema = z.object({
  exerciseId: z.string().uuid("ID do exercício inválido"),
  targetSets: z
    .number()
    .int()
    .min(1, "Mínimo de 1 série")
    .max(20, "Máximo de 20 séries"),
  targetReps: z.string().min(1, "Faixa de repetições obrigatória (ex: '8-12')"),
  actualReps: z.number().int().min(0).max(100).nullable().optional(),
  weightLifted: z.number().min(0).max(500).nullable().optional(),
  rpe: z
    .number()
    .int()
    .min(1, "RPE mínimo é 1")
    .max(10, "RPE máximo é 10")
    .nullable()
    .optional(),
});

export type WorkoutSetInput = z.infer<typeof workoutSetSchema>;

// Schema para sessão de treino
export const workoutSessionSchema = z.object({
  workoutPlanId: z.string().uuid("ID do plano de treino inválido"),
  day: z.string().min(1, "Dia da semana obrigatório"),
  exercises: z
    .array(workoutSetSchema)
    .min(1, "Sessão deve ter pelo menos 1 exercício"),
  completedAt: z.string().datetime().nullable().optional(),
});

export type WorkoutSessionInput = z.infer<typeof workoutSessionSchema>;

// Schema para plano de treino
export const workoutPlanSchema = z.object({
  userId: z.string().uuid("ID do usuário inválido"),
  name: z.string().min(3, "Nome do plano deve ter pelo menos 3 caracteres"),
  sessions: z
    .array(workoutSessionSchema)
    .min(1, "Plano deve ter pelo menos 1 sessão"),
});

export type WorkoutPlanInput = z.infer<typeof workoutPlanSchema>;

// Schema para geração de treino via IA
export const aiWorkoutGenerationSchema = z.object({
  userId: z.string().uuid("ID do usuário inválido"),
  experienceLevel: z.nativeEnum(ExperienceLevel),
  targetMuscleGroups: z
    .array(z.nativeEnum(MuscleGroup))
    .min(1, "Selecione pelo menos 1 grupo muscular"),
  availableEquipment: z
    .array(z.nativeEnum(EquipmentType))
    .min(1, "Selecione pelo menos 1 tipo de equipamento"),
  sessionsPerWeek: z.number().int().min(1).max(7),
  phase: z.enum(["HYPERTROPHY", "STRENGTH", "DELOAD"]).default("HYPERTROPHY"),
  periodizationModel: z
    .enum(["LINEAR", "UNDULATING", "BLOCK", "REVERSE_LINEAR"])
    .default("LINEAR"),
  exerciseWeights: z.record(z.string(), z.number()).optional(),
  workoutLocation: z.enum(["GYM", "HOME"]).optional(),
});

export type AIWorkoutGenerationInput = z.infer<
  typeof aiWorkoutGenerationSchema
>;

// Schema para atualização de carga (Progressive Overload)
export const progressiveOverloadSchema = z.object({
  exerciseId: z.string().uuid(),
  previousWeight: z.number().min(0).max(500),
  previousReps: z.number().int().min(1).max(100),
  previousRPE: z.number().int().min(1).max(10),
  targetRepsMin: z.number().int().min(1).max(100),
  targetRepsMax: z.number().int().min(1).max(100),
});

export type ProgressiveOverloadInput = z.infer<
  typeof progressiveOverloadSchema
>;
