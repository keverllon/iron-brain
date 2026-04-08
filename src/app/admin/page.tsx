"use client";

import { useState, useEffect } from "react";
import {
  Users,
  DollarSign,
  TrendingUp,
  Loader2,
  Plus,
  X,
  Eye,
  EyeOff,
  CheckCircle,
  CreditCard,
} from "lucide-react";
import Header from "@/components/Header";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  subscriptionStatus: string;
  subscriptionEndsAt?: string | null;
  createdAt: string;
}

interface AdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  newUsersThisMonth: number;
}

interface NewUserForm {
  name: string;
  email: string;
  password: string;
  role: "USER" | "ADMIN";
  subscriptionStatus: "FREE" | "ACTIVE" | "EXPIRED" | "CANCELLED";
  subscriptionEndsAt: string;
}

type ViewMode = "list" | "create" | "payment";

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [user, setUser] = useState<{ id: string; name: string; role: string } | null>(null);

  // Form state
  const [formData, setFormData] = useState<NewUserForm>({
    name: "",
    email: "",
    password: "",
    role: "USER",
    subscriptionStatus: "FREE",
    subscriptionEndsAt: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // Created user info for payment screen
  const [createdUser, setCreatedUser] = useState<User | null>(null);

  useEffect(() => {
    fetchAdminData();
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
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

  async function fetchAdminData() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/users?page=1&limit=50");
      const data = await res.json();

      if (data.success) {
        setUsers(data.data.users);
        setStats({
          totalUsers: data.data.pagination.total,
          activeSubscriptions: data.data.users.filter(
            (u: User) => u.subscriptionStatus === "ACTIVE",
          ).length,
          monthlyRevenue: 0,
          newUsersThisMonth: 0,
        });
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);

    if (formData.password.length < 6) {
      setFormError("A senha deve ter pelo menos 6 caracteres");
      setFormLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          subscriptionStatus: formData.subscriptionStatus,
          subscriptionEndsAt: formData.subscriptionEndsAt || null,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setCreatedUser(data.data);
        setViewMode("payment");
        // Reset form
        setFormData({
          name: "",
          email: "",
          password: "",
          role: "USER",
          subscriptionStatus: "FREE",
          subscriptionEndsAt: "",
        });
        // Refresh user list
        fetchAdminData();
      } else {
        setFormError(data.error || "Erro ao criar usuário");
      }
    } catch {
      setFormError("Erro de conexão. Tente novamente.");
    } finally {
      setFormLoading(false);
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const subscriptionColors: Record<string, string> = {
    FREE: "bg-zinc-700 text-zinc-300",
    ACTIVE: "bg-emerald-500/20 text-emerald-400",
    EXPIRED: "bg-red-500/20 text-red-400",
    CANCELLED: "bg-yellow-500/20 text-yellow-400",
  };

  const subscriptionLabels: Record<string, string> = {
    FREE: "Gratuito",
    ACTIVE: "Ativo",
    EXPIRED: "Expirado",
    CANCELLED: "Cancelado",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-emerald-500" />
          <p className="text-zinc-400">Carregando painel admin...</p>
        </div>
      </div>
    );
  }

  // Payment View
  if (viewMode === "payment" && createdUser) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <Header activeTab="admin" user={user} onLogout={handleLogout} />

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            {/* Success Message */}
            <div className="bg-zinc-900 border border-emerald-500/30 rounded-xl p-6 mb-6 text-center">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h2 className="text-xl font-semibold mb-2">
                Cliente criado com sucesso!
              </h2>
              <p className="text-zinc-400">
                {createdUser.name} - {createdUser.email}
              </p>
            </div>

            {/* Payment Configuration */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <CreditCard className="w-6 h-6 text-emerald-500" />
                <h3 className="text-lg font-semibold">
                  Configurar Pagamento do Cliente
                </h3>
              </div>

              <div className="space-y-6">
                {/* Client Info */}
                <div className="bg-zinc-800 rounded-lg p-4">
                  <h4 className="font-medium mb-3">Dados do Cliente</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-zinc-400">Nome:</span>
                      <p className="font-medium">{createdUser.name}</p>
                    </div>
                    <div>
                      <span className="text-zinc-400">Email:</span>
                      <p className="font-medium">{createdUser.email}</p>
                    </div>
                    <div>
                      <span className="text-zinc-400">Status:</span>
                      <span
                        className={`ml-2 px-2 py-0.5 rounded text-xs ${
                          subscriptionColors[createdUser.subscriptionStatus]
                        }`}>
                        {subscriptionLabels[createdUser.subscriptionStatus]}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-400">Criado em:</span>
                      <p className="font-medium">
                        {new Date(createdUser.createdAt).toLocaleDateString(
                          "pt-BR",
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Plan Selection */}
                <div className="bg-zinc-800 rounded-lg p-4">
                  <h4 className="font-medium mb-3">Selecionar Plano</h4>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-4 bg-zinc-700/50 rounded-lg cursor-pointer hover:bg-zinc-700 transition-colors">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="plan"
                          value="monthly"
                          defaultChecked
                          className="w-4 h-4 text-emerald-500"
                        />
                        <div>
                          <p className="font-medium">Plano Mensal</p>
                          <p className="text-xs text-zinc-400">
                            Acesso completo por 30 dias
                          </p>
                        </div>
                      </div>
                      <span className="text-emerald-400 font-semibold">
                        R$ 49,90/mês
                      </span>
                    </label>

                    <label className="flex items-center justify-between p-4 bg-zinc-700/50 rounded-lg cursor-pointer hover:bg-zinc-700 transition-colors">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="plan"
                          value="annual"
                          className="w-4 h-4 text-emerald-500"
                        />
                        <div>
                          <p className="font-medium">Plano Anual</p>
                          <p className="text-xs text-zinc-400">
                            Economia de 20% - Acesso por 12 meses
                          </p>
                        </div>
                      </div>
                      <span className="text-emerald-400 font-semibold">
                        R$ 479,90/ano
                      </span>
                    </label>
                  </div>
                </div>

                {/* Payment Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setViewMode("list")}
                    className="flex-1 bg-zinc-700 hover:bg-zinc-600 rounded-lg py-3 font-medium transition-colors">
                    Voltar para lista
                  </button>
                  <button
                    onClick={() => {
                      // Here you would integrate with Stripe or payment gateway
                      alert(
                        "Integração com gateway de pagamento será implementada",
                      );
                    }}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 rounded-lg py-3 font-medium transition-colors flex items-center justify-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Ativar Pagamento
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Create User View
  if (viewMode === "create") {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <Header activeTab="admin" user={user} onLogout={handleLogout} />

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                  Cadastrar Novo Cliente
                </h2>
                <button
                  onClick={() => setViewMode("list")}
                  className="text-zinc-400 hover:text-zinc-300">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
                  <p className="text-red-400 text-sm">{formError}</p>
                </div>
              )}

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">
                    Nome completo
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500"
                    placeholder="Nome do cliente"
                    required
                    minLength={2}
                  />
                </div>

                <div>
                  <label className="block text-sm text-zinc-400 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500"
                    placeholder="cliente@email.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-zinc-400 mb-1">
                    Senha
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:border-emerald-500"
                      placeholder="Mínimo 6 caracteres"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-300">
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">
                      Tipo de Conta
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          role: e.target.value as "USER" | "ADMIN",
                        })
                      }
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500">
                      <option value="USER">Usuário</option>
                      <option value="ADMIN">Administrador</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">
                      Status da Assinatura
                    </label>
                    <select
                      value={formData.subscriptionStatus}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          subscriptionStatus: e.target.value as
                            | "FREE"
                            | "ACTIVE"
                            | "EXPIRED"
                            | "CANCELLED",
                        })
                      }
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500">
                      <option value="FREE">Gratuito</option>
                      <option value="ACTIVE">Ativo</option>
                      <option value="EXPIRED">Expirado</option>
                      <option value="CANCELLED">Cancelado</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-zinc-400 mb-1">
                    Data de Expiração da Assinatura (opcional)
                  </label>
                  <input
                    type="date"
                    value={formData.subscriptionEndsAt}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        subscriptionEndsAt: e.target.value,
                      })
                    }
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className="flex-1 bg-zinc-700 hover:bg-zinc-600 rounded-lg py-2.5 font-medium transition-colors">
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 rounded-lg py-2.5 font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {formLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Criar Cliente
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // List View (default)
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Header activeTab="admin" />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Painel Administrativo</h2>
          <button
            onClick={() => setViewMode("create")}
            className="bg-emerald-600 hover:bg-emerald-700 rounded-lg px-4 py-2 font-medium transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Novo Cliente
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={<Users className="w-5 h-5" />}
              label="Total de Usuários"
              value={stats.totalUsers.toString()}
              change={`+${stats.newUsersThisMonth} este mês`}
              positive
            />
            <StatCard
              icon={<TrendingUp className="w-5 h-5" />}
              label="Assinaturas Ativas"
              value={stats.activeSubscriptions.toString()}
              change={`${stats.totalUsers > 0 ? Math.round((stats.activeSubscriptions / stats.totalUsers) * 100) : 0}% conversão`}
              positive
            />
            <StatCard
              icon={<DollarSign className="w-5 h-5" />}
              label="Receita Mensal"
              value={`R$ ${stats.monthlyRevenue.toLocaleString("pt-BR")}`}
              change="+12% vs mês anterior"
              positive
            />
            <StatCard
              icon={<Users className="w-5 h-5" />}
              label="Novos Usuários (Mês)"
              value={stats.newUsersThisMonth.toString()}
              change="+8% vs mês anterior"
              positive
            />
          </div>
        )}

        {/* Users Table */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Gerenciar Usuários</h3>
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500 w-64"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-3 px-4 text-sm text-zinc-400 font-medium">
                    Nome
                  </th>
                  <th className="text-left py-3 px-4 text-sm text-zinc-400 font-medium">
                    Email
                  </th>
                  <th className="text-left py-3 px-4 text-sm text-zinc-400 font-medium">
                    Role
                  </th>
                  <th className="text-left py-3 px-4 text-sm text-zinc-400 font-medium">
                    Assinatura
                  </th>
                  <th className="text-left py-3 px-4 text-sm text-zinc-400 font-medium">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-zinc-800/50 hover:bg-zinc-800/50">
                    <td className="py-3 px-4">{user.name}</td>
                    <td className="py-3 px-4 text-zinc-400">{user.email}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          user.role === "ADMIN"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-zinc-700 text-zinc-300"
                        }`}>
                        {user.role === "ADMIN" ? "Admin" : "Usuário"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          subscriptionColors[user.subscriptionStatus]
                        }`}>
                        {subscriptionLabels[user.subscriptionStatus]}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button className="text-sm text-emerald-400 hover:text-emerald-300">
                          Editar
                        </button>
                        <button className="text-sm text-red-400 hover:text-red-300">
                          Bloquear
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Settings */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">
            Configurações de Pagamento
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-zinc-800 rounded-lg p-4">
              <h4 className="font-medium mb-2">Stripe</h4>
              <p className="text-sm text-zinc-400 mb-4">
                Configure sua conta Stripe para receber pagamentos
              </p>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-zinc-400">
                    Stripe Publishable Key
                  </label>
                  <input
                    type="text"
                    placeholder="pk_test_..."
                    className="w-full bg-zinc-700 border border-zinc-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400">
                    Stripe Secret Key
                  </label>
                  <input
                    type="password"
                    placeholder="sk_test_..."
                    className="w-full bg-zinc-700 border border-zinc-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <button className="w-full bg-emerald-600 hover:bg-emerald-700 rounded-lg py-2 text-sm font-medium transition-colors">
                  Salvar Configurações
                </button>
              </div>
            </div>
            <div className="bg-zinc-800 rounded-lg p-4">
              <h4 className="font-medium mb-2">Planos de Assinatura</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-zinc-700/50 rounded">
                  <div>
                    <p className="font-medium">Plano Mensal</p>
                    <p className="text-xs text-zinc-400">R$ 49,90/mês</p>
                  </div>
                  <span className="text-emerald-400 text-sm">Ativo</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-zinc-700/50 rounded">
                  <div>
                    <p className="font-medium">Plano Anual</p>
                    <p className="text-xs text-zinc-400">R$ 479,90/ano</p>
                  </div>
                  <span className="text-emerald-400 text-sm">Ativo</span>
                </div>
                <button className="w-full bg-zinc-700 hover:bg-zinc-600 rounded-lg py-2 text-sm font-medium transition-colors">
                  + Adicionar Plano
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

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
