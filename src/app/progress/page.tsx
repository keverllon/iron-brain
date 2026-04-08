"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  BarChart3,
  LineChart,
  Loader2,
} from "lucide-react";
import Header from "@/components/Header";
import {
  LineChart as ReLineChart,
  Line,
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// ============================================================
// TYPES
// ============================================================

interface StrengthDataPoint {
  week: string;
  [key: string]: string | number;
}

interface VolumeDataPoint {
  week: string;
  [key: string]: string | number;
}

interface RPEDataPoint {
  week: string;
  avgRPE: number;
  workouts: number;
}

interface ProgressStats {
  maxStrength: number;
  avgVolume: number;
  avgRPE: number;
  completedWorkouts: number;
}

interface ProgressData {
  strengthProgress: StrengthDataPoint[];
  weeklyVolume: VolumeDataPoint[];
  rpeProgress: RPEDataPoint[];
  stats: ProgressStats;
}

// Cores para grupos musculares
const muscleGroupColors: Record<string, string> = {
  peito: "#10b981",
  costas: "#3b82f6",
  pernas: "#8b5cf6",
  ombros: "#f59e0b",
  bracos: "#ef4444",
  core: "#ec4899",
  corpo: "#6b7280",
};

// Labels em português
const muscleGroupLabels: Record<string, string> = {
  peito: "Peito",
  costas: "Costas",
  pernas: "Pernas",
  ombros: "Ombros",
  bracos: "Braços",
  core: "Core",
  corpo: "Corpo",
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function ProgressPage() {
  const [activeChart, setActiveChart] = useState<"strength" | "volume" | "rpe">(
    "strength",
  );
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    fetchProgressData();
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser({ name: parsed.name, role: parsed.role });
      } catch {
        // Ignorar erro
      }
    }
  }, []);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignorar erro
    }
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/";
  }

  async function fetchProgressData() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/progress?weeks=6");
      const data = await res.json();

      if (data.success) {
        setProgressData(data.data);
      } else {
        setError(data.error || "Erro ao carregar progresso");
      }
    } catch (err) {
      console.error("Error fetching progress:", err);
      setError("Erro de conexão. Verifique o servidor.");
    } finally {
      setLoading(false);
    }
  }

  // Usar dados reais ou fallback para dados vazios
  const strengthData = progressData?.strengthProgress || [];
  const volumeData = progressData?.weeklyVolume || [];
  const rpeData = progressData?.rpeProgress || [];
  const stats = progressData?.stats || {
    maxStrength: 0,
    avgVolume: 0,
    avgRPE: 0,
    completedWorkouts: 0,
  };

  // Calcular mudança de força para o card
  const strengthChange = calculateStrengthChange(strengthData);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-emerald-500" />
          <p className="text-zinc-400">Carregando progresso...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchProgressData}
            className="px-4 py-2 bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors">
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Header activeTab="progress" user={user} onLogout={handleLogout} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Progresso do Treino</h2>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="Força Máxima"
            value={`${stats.maxStrength} kg`}
            change={strengthChange}
            positive={true}
          />
          <StatCard
            icon={<BarChart3 className="w-5 h-5" />}
            label="Volume Semanal Médio"
            value={`${stats.avgVolume} séries`}
            change={`${volumeData.length} semanas registradas`}
            positive={true}
          />
          <StatCard
            icon={<LineChart className="w-5 h-5" />}
            label="RPE Médio"
            value={stats.avgRPE.toFixed(1)}
            change={stats.avgRPE <= 8 ? "Zona ideal" : "Atenção ao volume"}
            positive={stats.avgRPE <= 8}
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="Treinos Completados"
            value={`${stats.completedWorkouts}`}
            change={
              stats.completedWorkouts > 0
                ? "Continue assim!"
                : "Registre seu primeiro treino"
            }
            positive={stats.completedWorkouts > 0}
          />
        </div>

        {/* Chart Type Selector */}
        <div className="flex gap-2 mb-6">
          <ChartButton
            label="Evolução de Carga"
            active={activeChart === "strength"}
            onClick={() => setActiveChart("strength")}
          />
          <ChartButton
            label="Volume Semanal"
            active={activeChart === "volume"}
            onClick={() => setActiveChart("volume")}
          />
          <ChartButton
            label="RPE Médio"
            active={activeChart === "rpe"}
            onClick={() => setActiveChart("rpe")}
          />
        </div>

        {/* Charts */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          {activeChart === "strength" && (
            <>
              <h3 className="text-lg font-semibold mb-4">
                Evolução de Carga (kg)
              </h3>
              {strengthData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <ReLineChart data={strengthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                    <XAxis dataKey="week" stroke="#71717a" />
                    <YAxis stroke="#71717a" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#18181b",
                        border: "1px solid #3f3f46",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    {getExerciseLines(strengthData).map((exercise) => (
                      <Line
                        key={exercise}
                        type="monotone"
                        dataKey={exercise}
                        stroke={getExerciseColor(exercise)}
                        strokeWidth={2}
                        dot={{ fill: getExerciseColor(exercise) }}
                        name={exercise}
                      />
                    ))}
                  </ReLineChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChartMessage message="Nenhum dado de carga registrado. Complete treinos para ver sua evolução." />
              )}
            </>
          )}

          {activeChart === "volume" && (
            <>
              <h3 className="text-lg font-semibold mb-4">
                Volume Semanal por Músculo (séries)
              </h3>
              {volumeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <ReBarChart data={volumeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                    <XAxis dataKey="week" stroke="#71717a" />
                    <YAxis stroke="#71717a" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#18181b",
                        border: "1px solid #3f3f46",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    {getMuscleGroups(volumeData).map((muscle) => (
                      <Bar
                        key={muscle}
                        dataKey={muscle}
                        fill={muscleGroupColors[muscle] || "#6b7280"}
                        name={muscleGroupLabels[muscle] || muscle}
                      />
                    ))}
                  </ReBarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChartMessage message="Nenhum dado de volume registrado. Complete treinos para ver seu volume semanal." />
              )}
            </>
          )}

          {activeChart === "rpe" && (
            <>
              <h3 className="text-lg font-semibold mb-4">
                RPE Médio e Treinos por Semana
              </h3>
              {rpeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <ReLineChart data={rpeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                    <XAxis dataKey="week" stroke="#71717a" />
                    <YAxis stroke="#71717a" domain={[0, 10]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#18181b",
                        border: "1px solid #3f3f46",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="avgRPE"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={{ fill: "#f59e0b" }}
                      name="RPE Médio"
                    />
                    <Line
                      type="monotone"
                      dataKey="workouts"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ fill: "#10b981" }}
                      name="Treinos"
                    />
                  </ReLineChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChartMessage message="Nenhum dado de RPE registrado. Complete treinos com RPE para ver sua evolução." />
              )}
            </>
          )}
        </div>

        {/* Insights */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">Insights da IA</h3>
          {stats.completedWorkouts > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {generateInsights(stats, strengthData, volumeData, rpeData)}
            </div>
          ) : (
            <p className="text-zinc-400 text-sm">
              Registre seus treinos para receber insights personalizados da IA.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

// ============================================================
// FUNÇÕES AUXILIARES
// ============================================================

function getExerciseLines(data: StrengthDataPoint[]): string[] {
  const exercises = new Set<string>();
  for (const point of data) {
    for (const key of Object.keys(point)) {
      if (key !== "week" && typeof point[key] === "number") {
        exercises.add(key);
      }
    }
  }
  return Array.from(exercises);
}

function getExerciseColor(exercise: string): string {
  const colors = [
    "#10b981",
    "#3b82f6",
    "#8b5cf6",
    "#f59e0b",
    "#ef4444",
    "#ec4899",
  ];
  let hash = 0;
  for (let i = 0; i < exercise.length; i++) {
    hash = exercise.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function getMuscleGroups(data: VolumeDataPoint[]): string[] {
  const muscles = new Set<string>();
  for (const point of data) {
    for (const key of Object.keys(point)) {
      if (key !== "week" && typeof point[key] === "number") {
        muscles.add(key);
      }
    }
  }
  return Array.from(muscles);
}

function calculateStrengthChange(data: StrengthDataPoint[]): string {
  if (data.length < 2) return "0 kg";
  const firstWeek = data[0];
  const lastWeek = data[data.length - 1];
  const exercises = getExerciseLines(data);
  if (exercises.length === 0) return "0 kg";

  let totalChange = 0;
  let count = 0;
  for (const exercise of exercises) {
    const first = firstWeek[exercise] as number | undefined;
    const last = lastWeek[exercise] as number | undefined;
    if (first && last) {
      totalChange += last - first;
      count++;
    }
  }
  const avgChange = count > 0 ? Math.round((totalChange / count) * 10) / 10 : 0;
  return avgChange >= 0 ? `+${avgChange} kg` : `${avgChange} kg`;
}

function generateInsights(
  stats: ProgressStats,
  strengthData: StrengthDataPoint[],
  volumeData: VolumeDataPoint[],
  rpeData: RPEDataPoint[],
) {
  const insights: Array<{
    title: string;
    description: string;
    type: "positive" | "warning" | "info";
  }> = [];

  // Insight de força
  if (strengthData.length >= 2) {
    const change = calculateStrengthChange(strengthData);
    const numChange = parseFloat(change.replace("+", ""));
    if (numChange > 0) {
      insights.push({
        title: "Progressão de Carga",
        description: `Você aumentou sua carga média em ${change}. Continue com a progressão consistente.`,
        type: "positive",
      });
    } else {
      insights.push({
        title: "Carga Estável",
        description:
          "Suas cargas estão estáveis. Considere aumentar o peso gradualmente.",
        type: "info",
      });
    }
  }

  // Insight de volume
  if (volumeData.length > 0) {
    const lastWeek = volumeData[volumeData.length - 1];
    let numSets = 0;
    for (const val of Object.values(lastWeek)) {
      if (typeof val === "number") {
        numSets += val;
      }
    }
    if (numSets < 10) {
      insights.push({
        title: "Volume Baixo",
        description: `Seu volume semanal está em ${numSets} séries. Considere aumentar para 12-16 séries por grupo muscular.`,
        type: "warning",
      });
    } else if (numSets > 22) {
      insights.push({
        title: "Volume Alto",
        description: `Seu volume semanal está em ${numSets} séries. Cuidado com overtraining.`,
        type: "warning",
      });
    }
  }

  // Insight de RPE
  if (rpeData.length > 0) {
    const lastRPE = rpeData[rpeData.length - 1].avgRPE;
    if (lastRPE >= 9) {
      insights.push({
        title: "RPE Elevado",
        description: `Seu RPE médio está em ${lastRPE}. Considere uma semana de deload para recuperação.`,
        type: "warning",
      });
    } else if (lastRPE <= 7) {
      insights.push({
        title: "RPE Moderado",
        description: `Seu RPE médio está em ${lastRPE}. Boa zona para hipertrofia.`,
        type: "positive",
      });
    }
  }

  // Fallback se não houver insights
  if (insights.length === 0) {
    insights.push({
      title: "Continue Registrando",
      description:
        "Complete mais treinos para receber insights personalizados.",
      type: "info",
    });
  }

  return insights
    .slice(0, 3)
    .map((insight, i) => <InsightCard key={i} {...insight} />);
}

// ============================================================
// COMPONENTES AUXILIARES
// ============================================================

function StatCard({
  icon,
  label,
  value,
  change,
  positive,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  change: string;
  positive: boolean;
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-lg bg-zinc-800 text-emerald-500">
          {icon}
        </div>
        <span className="text-sm text-zinc-400">{label}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div
        className={`text-xs mt-1 ${positive ? "text-emerald-400" : "text-red-400"}`}>
        {change}
      </div>
    </div>
  );
}

function ChartButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "bg-emerald-600 text-white"
          : "bg-zinc-900 border border-zinc-800 hover:bg-zinc-800"
      }`}>
      {label}
    </button>
  );
}

function InsightCard({
  title,
  description,
  type,
}: {
  title: string;
  description: string;
  type: "positive" | "warning" | "info";
}) {
  const colors = {
    positive: "border-emerald-500/30 bg-emerald-500/5",
    warning: "border-amber-500/30 bg-amber-500/5",
    info: "border-blue-500/30 bg-blue-500/5",
  };

  return (
    <div className={`border rounded-xl p-4 ${colors[type]}`}>
      <h4 className="font-medium mb-2">{title}</h4>
      <p className="text-sm text-zinc-400">{description}</p>
    </div>
  );
}

function EmptyChartMessage({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-[400px] text-zinc-500">
      <p className="text-center">{message}</p>
    </div>
  );
}
