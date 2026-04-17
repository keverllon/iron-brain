"use client";

import { useState, useEffect } from "react";
import {
  Dumbbell,
  Zap,
  Calculator,
  TrendingUp,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Trash2,
} from "lucide-react";
import Header from "@/components/Header";
import { muscleGroupLabels } from "@/lib/labels";

interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
}

interface WorkoutSet {
  id: string;
  exerciseId?: string;
  exercise?: Exercise;
  name?: string; // Fallback caso o backend mande achatado
  muscleGroup?: string; // Fallback caso o backend mande achatado
  targetSets: number;
  targetReps: string;
  actualReps: number | null;
  weightLifted: number | null;
  rpe: number | null;
}

interface WorkoutSession {
  id: string;
  day: string;
  weekNumber: number | null;
  completedAt: string | null;
  sets?: WorkoutSet[];
  exercises?: WorkoutSet[];
}

interface WorkoutPlan {
  id: string;
  name: string;
  createdAt: string;
  sessions: WorkoutSession[];
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const dayOrder = [
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
  "Domingo",
];

export default function WorkoutsPage() {
  const [activeTab, setActiveTab] = useState<"plans" | "generate" | "onerm">(
    "plans",
  );
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUserId(parsed.id);
        setUser(parsed);
      } catch {
        // Ignorar erro
      }
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchPlans();
    }
  }, [userId]);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignorar erro de logout
    }
    localStorage.removeItem("user");
    setUser(null);
    setUserId(null);
    setPlans([]);
    window.location.href = "/";
  }

  async function fetchPlans() {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/workout-plans");
      const data = await res.json();
      if (data.success) {
        setPlans(data.data);
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Header activeTab="workouts" user={user} onLogout={handleLogout} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Central de Treinos</h2>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <TabButton
            icon={<Dumbbell className="w-4 h-4" />}
            label="Meus Treinos"
            active={activeTab === "plans"}
            onClick={() => setActiveTab("plans")}
          />
          <TabButton
            icon={<Zap className="w-4 h-4" />}
            label="Gerar Treino"
            active={activeTab === "generate"}
            onClick={() => setActiveTab("generate")}
          />
          <TabButton
            icon={<Calculator className="w-4 h-4" />}
            label="Calcular 1RM"
            active={activeTab === "onerm"}
            onClick={() => setActiveTab("onerm")}
          />
        </div>

        {/* Tab Content */}
        {activeTab === "plans" && (
          <PlansTab
            plans={plans}
            loading={loading}
            userId={userId}
            onRefresh={fetchPlans}
          />
        )}
        {activeTab === "generate" && <GenerateWorkoutTab userId={userId} />}
        {activeTab === "onerm" && <OneRMCalculatorTab />}
      </main>
    </div>
  );
}

// ============================================================
// COMPONENTES
// ============================================================

function TabButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "bg-emerald-600 text-white"
          : "bg-zinc-900 border border-zinc-800 hover:bg-zinc-800"
      }`}>
      {icon}
      {label}
    </button>
  );
}

function PlansTab({
  plans,
  loading,
  userId,
  onRefresh,
}: {
  plans: WorkoutPlan[];
  loading: boolean;
  userId: string | null;
  onRefresh: () => void;
}) {
  if (!userId) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
        <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Faça login primeiro</h3>
        <p className="text-zinc-400">
          Você precisa estar logado para ver seus treinos.
        </p>
        <a
          href="/auth/login"
          className="inline-block mt-4 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-medium transition-colors">
          Entrar
        </a>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
        <Clock className="w-12 h-12 text-emerald-500 mx-auto mb-4 animate-spin" />
        <p className="text-zinc-400">Carregando seus treinos...</p>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
        <Dumbbell className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Nenhum treino encontrado</h3>
        <p className="text-zinc-400 mb-4">
          Gere seu primeiro treino com IA para começar.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {plans.map((plan) => (
        <PlanCard key={plan.id} plan={plan} onRefresh={onRefresh} />
      ))}
    </div>
  );
}

function PlanCard({
  plan,
  onRefresh,
}: {
  plan: WorkoutPlan;
  onRefresh: () => void;
}) {
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const completedSessions =
    plan.sessions?.filter((s) => s.completedAt).length || 0;
  const totalSessions = plan.sessions?.length || 0;
  const progress =
    totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

  const sortedSessions = [...(plan.sessions || [])].sort((a, b) => {
    const aWeek = a.weekNumber || 1;
    const bWeek = b.weekNumber || 1;
    if (aWeek !== bWeek) return aWeek - bWeek;
    const aIndex = dayOrder.indexOf(a.day.replace(/\(Semana \d+\)/, "").trim());
    const bIndex = dayOrder.indexOf(b.day.replace(/\(Semana \d+\)/, "").trim());
    return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
  });

  async function handleDelete() {
    if (!confirm("Tem certeza que deseja excluir este treino?")) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/workout-plans/${plan.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        onRefresh();
      } else {
        alert(`Erro: ${data.error}`);
      }
    } catch (error) {
      console.error("Error deleting plan:", error);
      alert("Erro ao excluir treino");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      {/* Plan Header */}
      <div className="p-6 border-b border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold">{plan.name}</h3>
            <p className="text-sm text-zinc-400">
              Criado em {new Date(plan.createdAt).toLocaleDateString("pt-BR")}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-2xl font-bold text-emerald-500">
                {Math.round(progress)}%
              </span>
              <p className="text-xs text-zinc-400">
                {completedSessions}/{totalSessions} treinos
              </p>
            </div>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors disabled:opacity-50"
              title="Excluir treino">
              {deleting ? (
                <Clock className="w-5 h-5 animate-spin" />
              ) : (
                <Trash2 className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-zinc-800 rounded-full h-2">
          <div
            className="bg-emerald-500 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Sessions */}
      <div className="divide-y divide-zinc-800">
        {sortedSessions.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            isExpanded={expandedSession === session.id}
            onToggle={() =>
              setExpandedSession(
                expandedSession === session.id ? null : session.id,
              )
            }
            onRefresh={onRefresh}
          />
        ))}
      </div>
    </div>
  );
}

function SessionCard({
  session,
  isExpanded,
  onToggle,
  onRefresh,
}: {
  session: WorkoutSession;
  isExpanded: boolean;
  onToggle: () => void;
  onRefresh: () => void;
}) {
  const [completing, setCompleting] = useState(false);
  const [setData, setSetData] = useState<Record<string, { actualReps: number | null; weightLifted: number | null; rpe: number | null }>>({});

  // Extrai os itens independente do nome que a API mandar (sets ou exercises)
  const sessionItems = session.sets || session.exercises || [];

  const completedSets = sessionItems.filter(
    (s) => s.actualReps !== null && s.actualReps > 0,
  ).length;
  const totalSets = sessionItems.length;

  async function markAsComplete() {
    setCompleting(true);
    try {
      const setsPayload = sessionItems.map((s) => {
        const updated = setData[s.id] || {};
        return {
          setId: s.id,
          actualReps: updated.actualReps ?? s.actualReps,
          weightLifted: updated.weightLifted ?? s.weightLifted,
          rpe: updated.rpe ?? s.rpe,
        };
      });

      const res = await fetch(`/api/workout-plans/${session.id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sets: setsPayload }),
      });
      const data = await res.json();
      if (data.success) {
        onRefresh();
      } else {
        alert(data.error || "Erro ao concluir treino");
      }
    } catch (error) {
      console.error("Error completing session:", error);
      alert("Erro ao conectar com o servidor");
    } finally {
      setCompleting(false);
    }
  }

  return (
    <div
      className={`${session.completedAt ? "bg-emerald-500/5" : "bg-zinc-900"}`}>
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-zinc-800/50 transition-colors">
        <div className="flex items-center gap-3">
          {session.completedAt ? (
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          ) : (
            <Clock className="w-5 h-5 text-zinc-500" />
          )}
          <div className="text-left">
            <span className="font-medium">{session.day}</span>
            {session.weekNumber && (
              <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded ml-2">
                Semana {session.weekNumber}
              </span>
            )}
            <span className="text-sm text-zinc-400 ml-2">
              ({completedSets}/{totalSets} séries)
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {session.completedAt && (
            <span className="text-xs text-emerald-500">
              Concluído em{" "}
              {new Date(session.completedAt).toLocaleDateString("pt-BR")}
            </span>
          )}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4">
          {/* Exercises */}
          {sessionItems.length === 0 ? (
            <div className="text-sm text-zinc-500 text-center py-4">
              Nenhum exercício encontrado neste dia.
            </div>
          ) : (
            <div className="space-y-3 mb-4">
              {sessionItems.map((set, index) => (
                <SetRow 
                  key={set.id || index} 
                  set={set} 
                  index={index + 1}
                  onUpdate={(field, value) => setSetData(prev => ({
                    ...prev,
                    [set.id]: { ...prev[set.id], [field]: value }
                  }))}
                />
              ))}
            </div>
          )}

          {/* Complete Button */}
          {!session.completedAt && sessionItems.length > 0 && (
            <button
              onClick={markAsComplete}
              disabled={completing}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-700 disabled:opacity-50 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
              {completing ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Marcar Treino como Concluído
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function SetRow({ set, index, onUpdate }: { set: WorkoutSet; index: number; onUpdate?: (field: string, value: number | null) => void }) {
  const [actualReps, setActualReps] = useState(
    set.actualReps?.toString() || "",
  );
  const [weight, setWeight] = useState(set.weightLifted?.toString() || "");
  const [rpe, setRpe] = useState(set.rpe?.toString() || "7");
  const [showOneRM, setShowOneRM] = useState(false);

  function handleChange(field: string, value: string) {
    const numValue = value ? parseFloat(value) : null;
    if (field === "actualReps") setActualReps(value);
    else if (field === "weight") setWeight(value);
    else if (field === "rpe") setRpe(value);
    if (onUpdate) onUpdate(field === "weight" ? "weightLifted" : field, numValue);
  }

  // Calcular 1RM estimado usando fórmula de Brzycki
  const currentWeight = parseFloat(weight) || 0;
  const currentReps = parseInt(actualReps) || 0;
  let estimatedOneRM = 0;
  if (currentWeight > 0 && currentReps > 0) {
    estimatedOneRM = Math.round(
      currentWeight / (1.0278 - 0.0278 * currentReps),
    );
  }

  // Fallback seguro caso os dados do exercício venham achatados da API
  const exerciseName = set.exercise?.name || set.name || "Exercício";
  const muscleGroupCode = set.exercise?.muscleGroup || set.muscleGroup || "";
  const muscleGroupLabel = muscleGroupCode
    ? muscleGroupLabels[muscleGroupCode]
    : "";

  return (
    <div className="bg-zinc-800 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-zinc-300">
          {index}. {exerciseName}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">{muscleGroupLabel}</span>
          {estimatedOneRM > 0 && (
            <button
              onClick={() => setShowOneRM(!showOneRM)}
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              1RM: {estimatedOneRM}kg
            </button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-xs text-zinc-500">Meta</label>
          <p className="text-sm">{set.targetReps} reps</p>
        </div>
        <div>
          <label className="text-xs text-zinc-500">Reps Realizadas</label>
          <input
            type="number"
            value={actualReps}
            onChange={(e) => handleChange("actualReps", e.target.value)}
            className="w-full bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-sm focus:outline-none focus:border-emerald-500"
            placeholder="0"
          />
        </div>
        <div>
          <label className="text-xs text-zinc-500">Peso (kg)</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => handleChange("weight", e.target.value)}
            className="w-full bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-sm focus:outline-none focus:border-emerald-500"
            placeholder="0"
          />
        </div>
      </div>
      <div className="mt-2 flex items-center gap-4">
        <div>
          <label className="text-xs text-zinc-500">RPE (1-10)</label>
          <input
            type="number"
            value={rpe}
            onChange={(e) => handleChange("rpe", e.target.value)}
            className="w-20 bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-sm focus:outline-none focus:border-emerald-500"
            min={1}
            max={10}
          />
        </div>
        {showOneRM && estimatedOneRM > 0 && (
          <div className="flex-1 bg-zinc-700 rounded-lg p-2">
            <p className="text-xs text-emerald-400 font-medium mb-1">
              Percentuais de 1RM ({estimatedOneRM}kg)
            </p>
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div className="text-center">
                <span className="text-zinc-400">95%</span>
                <p className="font-medium">
                  {Math.round(estimatedOneRM * 0.95)}kg
                </p>
              </div>
              <div className="text-center">
                <span className="text-zinc-400">90%</span>
                <p className="font-medium">
                  {Math.round(estimatedOneRM * 0.9)}kg
                </p>
              </div>
              <div className="text-center">
                <span className="text-zinc-400">85%</span>
                <p className="font-medium">
                  {Math.round(estimatedOneRM * 0.85)}kg
                </p>
              </div>
              <div className="text-center">
                <span className="text-zinc-400">80%</span>
                <p className="font-medium">
                  {Math.round(estimatedOneRM * 0.8)}kg
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const experienceLevels = [
  { value: "BEGINNER", label: "Iniciante", description: "0-6 meses de treino" },
  {
    value: "INTERMEDIATE",
    label: "Intermediário",
    description: "6 meses - 2 anos",
  },
  { value: "ADVANCED", label: "Avançado", description: "2-5 anos de treino" },
];

const periodizationModels = [
  {
    value: "LINEAR",
    label: "Periodização Linear",
    description: "Alto volume → Alta intensidade. Ideal para iniciantes",
    icon: "📈",
  },
  {
    value: "UNDULATING",
    label: "Periodização Ondulatória",
    description: "Varia a cada treino. Evita estagnação",
    icon: "🌊",
  },
  {
    value: "BLOCK",
    label: "Periodização em Blocos",
    description: "Foco especializado por bloco. Para atletas",
    icon: "🧱",
  },
  {
    value: "REVERSE_LINEAR",
    label: "Periodização Linear Reversa",
    description: "Alta intensidade → Alto volume. Para cutting",
    icon: "📉",
  },
];

function GenerateWorkoutTab({ userId }: { userId: string | null }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState("INTERMEDIATE");
  const [sessionsPerWeek, setSessionsPerWeek] = useState(4);
  const [selectedModel, setSelectedModel] = useState("LINEAR");
  const [selectedLocation, setSelectedLocation] = useState<"GYM" | "HOME">("GYM");
  const [showWeights, setShowWeights] = useState(false);
  const [exerciseWeights, setExerciseWeights] = useState<
    Record<string, number>
  >({});

  async function handleGenerate() {
    if (!userId) {
      setResult("Erro: Faça login para gerar treinos");
      return;
    }

    const equipment = selectedLocation === "GYM" 
      ? ["BARBELL", "DUMBBELL", "MACHINE_PLATE", "MACHINE_CABLE"]
      : ["BODYWEIGHT"];

    setLoading(true);
    try {
      const res = await fetch("/api/workout-plans?action=generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId,
          experienceLevel: selectedLevel,
          targetMuscleGroups: selectedLocation === "HOME" 
            ? ["FULLBODY"] 
            : ["CHEST", "BACK", "LEGS", "SHOULDERS", "ARMS"],
          availableEquipment: equipment,
          sessionsPerWeek: sessionsPerWeek,
          phase: "HYPERTROPHY",
          periodizationModel: selectedModel,
          workoutLocation: selectedLocation,
          exerciseWeights: showWeights ? exerciseWeights : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(
          `Treino "${data.data.generatedPlan.name}" gerado com sucesso! Volte para "Meus Treinos" para acompanhar.`,
        );
      } else {
        setResult(`Erro: ${data.error}`);
      }
    } catch (error) {
      setResult("Erro ao gerar treino");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Zap className="w-5 h-5 text-emerald-500" />
        Gerar Treino com IA
      </h3>
      <p className="text-zinc-400 mb-6">
        Gere um treino personalizado baseado no seu nível e equipamentos
        disponíveis.
      </p>

      {/* Nível de Experiência */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-zinc-300 mb-3">
          Nível de Experiência
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {experienceLevels.map((level) => (
            <button
              key={level.value}
              onClick={() => setSelectedLevel(level.value)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                selectedLevel === level.value
                  ? "border-emerald-500 bg-emerald-500/10"
                  : "border-zinc-700 bg-zinc-800 hover:border-zinc-600"
              }`}>
              <div className="font-medium">{level.label}</div>
              <div className="text-xs text-zinc-400">{level.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Local de Treino */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-zinc-300 mb-3">
          Onde você treina?
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setSelectedLocation("GYM")}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              selectedLocation === "GYM"
                ? "border-emerald-500 bg-emerald-500/10"
                : "border-zinc-700 bg-zinc-800 hover:border-zinc-600"
            }`}>
            <div className="font-medium">🏋️ Academia</div>
            <div className="text-xs text-zinc-400">Com equipamentos</div>
          </button>
          <button
            onClick={() => setSelectedLocation("HOME")}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              selectedLocation === "HOME"
                ? "border-emerald-500 bg-emerald-500/10"
                : "border-zinc-700 bg-zinc-800 hover:border-zinc-600"
            }`}>
            <div className="font-medium">🏠 Em Casa</div>
            <div className="text-xs text-zinc-400">Sem equipamentos</div>
          </button>
        </div>
      </div>

      {/* Sessões por Semana */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Treinos por Semana: {sessionsPerWeek}
        </label>
        <input
          type="range"
          min={2}
          max={6}
          value={sessionsPerWeek}
          onChange={(e) => setSessionsPerWeek(parseInt(e.target.value))}
          className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
        <div className="flex justify-between text-xs text-zinc-500 mt-1">
          <span>2</span>
          <span>3</span>
          <span>4</span>
          <span>5</span>
          <span>6</span>
        </div>
      </div>

      {/* Modelo de Periodização */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-zinc-300 mb-3">
          Modelo de Periodização
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {periodizationModels.map((model) => (
            <button
              key={model.value}
              onClick={() => setSelectedModel(model.value)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                selectedModel === model.value
                  ? "border-emerald-500 bg-emerald-500/10"
                  : "border-zinc-700 bg-zinc-800 hover:border-zinc-600"
              }`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{model.icon}</span>
                <span className="font-medium">{model.label}</span>
              </div>
              <div className="text-xs text-zinc-400">{model.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Pesos Iniciais */}
      <div className="mb-6">
        <button
          onClick={() => setShowWeights(!showWeights)}
          className="flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300">
          <TrendingUp className="w-4 h-4" />
          {showWeights ? "Ocultar" : "Configurar"} pesos iniciais (opcional)
        </button>
        {showWeights && (
          <div className="mt-4 p-4 bg-zinc-800 rounded-lg">
            <p className="text-xs text-zinc-400 mb-3">
              Informe os pesos que você usa atualmente para cada exercício. Isso
              ajudará a IA a gerar treinos mais precisos.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: "supino_reto", name: "Supino Reto" },
                { id: "agachamento", name: "Agachamento" },
                { id: "terra", name: "Levantamento Terra" },
                { id: "desenvolvimento", name: "Desenvolvimento" },
                { id: "rosca_direta", name: "Rosca Direta" },
                { id: "triceps_testa", name: "Tríceps Testa" },
              ].map((ex) => (
                <div key={ex.id}>
                  <label className="text-xs text-zinc-400">
                    {ex.name} (kg)
                  </label>
                  <input
                    type="number"
                    value={exerciseWeights[ex.id] || ""}
                    onChange={(e) =>
                      setExerciseWeights({
                        ...exerciseWeights,
                        [ex.id]: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-zinc-700 border border-zinc-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                    placeholder="0"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-medium transition-colors disabled:opacity-50">
        {loading ? "Gerando..." : "Gerar Treino"}
      </button>
      {result && (
        <div
          className={`mt-4 p-4 rounded-lg ${
            result.startsWith("Erro")
              ? "bg-red-500/10 border border-red-500/30 text-red-400"
              : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
          }`}>
          {result}
        </div>
      )}
    </div>
  );
}

function OneRMCalculatorTab() {
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [result, setResult] = useState<string | null>(null);

  async function handleCalculate() {
    const res = await fetch("/api/calculate/one-rm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        weight: parseFloat(weight),
        reps: parseInt(reps),
      }),
    });
    const data = await res.json();
    if (data.success) {
      setResult(
        `1RM Estimado: ${data.data.oneRM.average}kg\n\nPercentuais:\n` +
          Object.entries(data.data.trainingPercentages)
            .map(([pct, w]) => `${pct}: ${w}kg`)
            .join("\n"),
      );
    } else {
      setResult(`Erro: ${data.error}`);
    }
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Calculator className="w-5 h-5 text-emerald-500" />
        Calculadora 1RM
      </h3>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-sm text-zinc-400 mb-1 block">Peso (kg)</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500"
            placeholder="80"
          />
        </div>
        <div>
          <label className="text-sm text-zinc-400 mb-1 block">Repetições</label>
          <input
            type="number"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500"
            placeholder="8"
          />
        </div>
      </div>
      <button
        onClick={handleCalculate}
        className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-medium transition-colors">
        Calcular 1RM
      </button>
      {result && (
        <pre className="mt-4 bg-zinc-950 border border-zinc-800 rounded-lg p-4 text-sm text-zinc-300 whitespace-pre-wrap">
          {result}
        </pre>
      )}
    </div>
  );
}
