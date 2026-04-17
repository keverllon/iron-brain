export interface WorkoutPlan {
  type: 'gym' | 'home';
  title: string;
  exercises: Exercise[];
  duration: number;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
}

export function generateHomeWorkout(difficulty: string, duration: number): WorkoutPlan {
  const exercises: Exercise[] = [];

  // Lógica para gerar treino em casa baseado na dificuldade
  const baseExercises = getHomeExercises(difficulty);

  return {
    type: 'home',
    title: 'Treino em Casa',
    exercises: baseExercises,
    duration,
  };
}

export function generateGymWorkout(difficulty: string, duration: number): WorkoutPlan {
  const exercises: Exercise[] = [];

  // Lógica para gerar treino de musculação na academia
  const baseExercises = getGymExercises(difficulty);

  return {
    type: 'gym',
    title: 'Treino Musculação',
    exercises: baseExercises,
    duration,
  };
}

function getHomeExercises(difficulty: string): Exercise[] {
  const exercisesMap: Record<string, Exercise[]> = {
    iniciante: [
      { name: 'Agachamentos', sets: 3, reps: '12 reps', rest: '45s' },
      { name: 'Flexões de braço (paredão)', sets: 3, reps: '10 reps', rest: '45s' },
      { name: 'Prancha', sets: 3, reps: '30s', rest: '30s' },
      { name: 'Abdominais', sets: 3, reps: '15 reps', rest: '30s' },
      { name: 'Elevação de pernas', sets: 3, reps: '12 reps', rest: '30s' },
    ],
    intermediario: [
      { name: 'Agachamentos saltos', sets: 4, reps: '15 reps', rest: '45s' },
      { name: 'Flexões de braço', sets: 4, reps: '12 reps', rest: '45s' },
      { name: 'Prancha lateral', sets: 3, reps: '45s', rest: '30s' },
      { name: 'Mountain climbers', sets: 4, reps: '20 reps', rest: '30s' },
      { name: 'Burpees', sets: 3, reps: '10 reps', rest: '60s' },
    ],
    avancado: [
      { name: 'Agachamentos com salto', sets: 4, reps: '20 reps', rest: '45s' },
      { name: 'Flexões de braço', sets: 4, reps: '10 reps', rest: '60s' },
      { name: 'Prancha com toque de ombro', sets: 4, reps: '20 reps', rest: '30s' },
      { name: 'Burpees com pull-up', sets: 4, reps: '15 reps', rest: '60s' },
      { name: 'Muscle-ups (simulado)', sets: 4, reps: '8 reps', rest: '90s' },
    ],
  };

  return exercisesMap[difficulty] || exercisesMap["iniciante"];
}

function getGymExercises(difficulty: string): Exercise[] {
  const exercisesMap: Record<string, Exercise[]> = {
    iniciante: [
      { name: 'Supino reto', sets: 3, reps: '12 reps', rest: '60s' },
      { name: 'Leg press', sets: 3, reps: '12 reps', rest: '60s' },
      { name: 'Puxada na barra', sets: 3, reps: '10 reps', rest: '60s' },
      { name: 'Cadeira extensora', sets: 3, reps: '12 reps', rest: '45s' },
      { name: 'Rosca direta', sets: 3, reps: '12 reps', rest: '45s' },
      { name: 'Tríceps pulley', sets: 3, reps: '12 reps', rest: '45s' },
    ],
    intermediario: [
      { name: 'Supino inclinado', sets: 4, reps: '10 reps', rest: '60s' },
      { name: 'Agachamento livre', sets: 4, reps: '10 reps', rest: '90s' },
      { name: 'Terra', sets: 4, reps: '8 reps', rest: '90s' },
      { name: 'Puxada na frente', sets: 4, reps: '10 reps', rest: '60s' },
      { name: 'Stiff', sets: 3, reps: '10 reps', rest: '60s' },
      { name: 'Rosca alternada', sets: 3, reps: '12 reps', rest: '45s' },
      { name: 'Tríceps testa', sets: 3, reps: '10 reps', rest: '45s' },
    ],
    avancado: [
      { name: 'Supino com halteres', sets: 4, reps: '8-12 reps', rest: '60s' },
      { name: 'Agachamento profundo', sets: 5, reps: '8 reps', rest: '120s' },
      { name: ' Levantamento terra sumô', sets: 5, reps: '6 reps', rest: '120s' },
      { name: 'Pull-ups com peso', sets: 4, reps: '8 reps', rest: '90s' },
      { name: 'Leg press unilateral', sets: 4, reps: '10 reps', rest: '60s' },
      { name: 'Rosca martelo', sets: 4, reps: '10 reps', rest: '45s' },
      { name: 'Tríceps corda', sets: 4, reps: '12 reps', rest: '45s' },
    ],
  };

  return exercisesMap[difficulty] || exercisesMap["iniciante"];
}