"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Calendar, Activity, Target, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

interface UserInfo {
  id: string;
  name: string;
  email: string;
  role: string;
  subscriptionStatus: string;
}

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar se usuário está logado
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsLoading(false);
    } else {
      // Se não estiver logado, força o redirecionamento
      router.push("/auth/login");
    }
  }, [router]);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignorar erro no logout
    }
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    router.push("/auth/login");
  }

  // Se estiver carregando ou não tiver usuário, não renderiza o dashboard
  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Header activeTab="dashboard" user={user} onLogout={handleLogout} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">
            Bem-vindo, {user.name.split(" ")[0]}
          </h2>
          <p className="text-zinc-400">
            Seu assistente de treino inteligente com periodização via IA
          </p>
        </div>

        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          variants={staggerContainer}
          initial="initial"
          animate="animate">
          <motion.div variants={fadeInUp}>
            <StatCard
              icon={<Activity className="w-6 h-6" />}
              title="Volume Semanal"
              value="42 séries"
              subtitle="Dentro do range ideal"
              color="emerald"
            />
          </motion.div>
          <motion.div variants={fadeInUp}>
            <StatCard
              icon={<TrendingUp className="w-6 h-6" />}
              title="1RM Estimado"
              value="100 kg"
              subtitle="Supino Reto"
              color="blue"
            />
          </motion.div>
          <motion.div variants={fadeInUp}>
            <StatCard
              icon={<Calendar className="w-6 h-6" />}
              title="Fase Atual"
              value="Hipertrofia"
              subtitle="Semana 3 de 6"
              color="purple"
            />
          </motion.div>
          <motion.div variants={fadeInUp}>
            <StatCard
              icon={<Target className="w-6 h-6" />}
              title="Próximo Treino"
              value="Peito/Tríceps"
              subtitle="Segunda-feira"
              color="orange"
            />
          </motion.div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          variants={staggerContainer}
          initial="initial"
          animate="animate">
          <motion.div variants={fadeInUp}>
            <QuickAction
              icon={<Zap className="w-5 h-5" />}
              title="Gerar Treino com IA"
              description="Crie um treino personalizado baseado no seu nível e objetivos"
              action="Gerar Treino"
              href="/workouts"
            />
          </motion.div>
          <motion.div variants={fadeInUp}>
            <QuickAction
              icon={<TrendingUp className="w-5 h-5" />}
              title="Calcular 1RM"
              description="Estime seu máximo com base nas suas últimas séries"
              action="Calcular"
              href="/workouts"
            />
          </motion.div>
          <motion.div variants={fadeInUp}>
            <QuickAction
              icon={<Activity className="w-5 h-5" />}
              title="Registrar Treino"
              description="Registre suas séries, peso e RPE de hoje"
              action="Registrar"
              href="/workouts"
            />
          </motion.div>
        </motion.div>

        {/* Training Phase Info */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-500" />
            Fase de Treino: Hipertrofia
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-zinc-300 mb-2">Parâmetros</h4>
              <ul className="space-y-2 text-zinc-400">
                <li>• Repetições: 8-12 por série</li>
                <li>• Intensidade: 65-80% do 1RM</li>
                <li>• Descanso: 60-90 segundos</li>
                <li>• Séries por exercício: 4</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-zinc-300 mb-2">
                Volume por Músculo
              </h4>
              <ul className="space-y-2 text-zinc-400">
                <li>• Peito: 16 séries/sem (ideal)</li>
                <li>• Costas: 14 séries/sem (ideal)</li>
                <li>• Pernas: 12 séries/sem (ideal)</li>
                <li>• Ombros: 10 séries/sem (ideal)</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// ============================================================
// COMPONENTES AUXILIARES
// ============================================================

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
  color: "emerald" | "blue" | "purple" | "orange";
}

function StatCard({ icon, title, value, subtitle, color }: StatCardProps) {
  const colorClasses = {
    emerald: "text-emerald-500 bg-emerald-500/10",
    blue: "text-blue-500 bg-blue-500/10",
    purple: "text-purple-500 bg-purple-500/10",
    orange: "text-orange-500 bg-orange-500/10",
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 h-full">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>{icon}</div>
        <span className="text-sm text-zinc-400">{title}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-zinc-500 mt-1">{subtitle}</div>
    </div>
  );
}

interface QuickActionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action: string;
  href: string;
}

function QuickAction({
  icon,
  title,
  description,
  action,
  href,
}: QuickActionProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col h-full">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-lg bg-zinc-800 text-emerald-500">
          {icon}
        </div>
        <h4 className="font-medium">{title}</h4>
      </div>
      <p className="text-sm text-zinc-400 mb-4 flex-1">{description}</p>
      <a
        href={href}
        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm font-medium transition-colors">
        {action}
      </a>
    </div>
  );
}
