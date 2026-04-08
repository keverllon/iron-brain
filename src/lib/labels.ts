export const muscleGroupLabels: Record<string, string> = {
  CHEST: "Peito",
  BACK: "Costas",
  LEGS: "Pernas",
  SHOULDERS: "Ombros",
  ARMS: "Braços",
  CORE: "Core",
  FULLBODY: "Corpo Inteiro",
};

export const equipmentLabels: Record<string, string> = {
  BARBELL: "Barra",
  DUMBBELL: "Halter",
  MACHINE_PLATE: "Máquina Peso",
  MACHINE_CABLE: "Cabo/Polia",
  BODYWEIGHT: "Peso Corporal",
};

export const experienceLevelLabels: Record<string, string> = {
  BEGINNER: "Iniciante",
  INTERMEDIATE: "Intermediário",
  ADVANCED: "Avançado",
};

export const phaseLabels: Record<string, string> = {
  HYPERTROPHY: "Hipertrofia",
  STRENGTH: "Força",
  DELOAD: "Deload",
};

export const periodizationModelLabels: Record<string, string> = {
  LINEAR: "Linear",
  UNDULATING: "Ondulatória",
  BLOCK: "Blocos",
  REVERSE_LINEAR: "Linear Reversa",
};

export const dayLabels: Record<string, string> = {
  SEGUNDA: "Seg",
  TERCA: "Ter",
  QUARTA: "Qua",
  QUINTA: "Qui",
  SEXTA: "Sex",
  SABADO: "Sáb",
  DOMINGO: "Dom",
  default: "Seg,Ter,Qua,Qui,Sex,Sáb,Dom",
  // Also support actual full names to avoid mismatch
  "Segunda-feira": "Segunda",
  "Terça-feira": "Terça",
  "Quarta-feira": "Quarta",
  "Quinta-feira": "Quinta",
  "Sexta-feira": "Sexta",
  Sábado: "Sábado",
  Domingo: "Domingo",
};
