import Link from "next/link";
import { Dumbbell, LogOut, User } from "lucide-react";

const NAV_ITEMS: { href: string; label: string; tabKey: string }[] = [
  { href: "/", label: "Dashboard", tabKey: "dashboard" },
  { href: "/exercises", label: "Exercícios", tabKey: "exercises" },
  { href: "/workouts", label: "Treinos", tabKey: "workouts" },
  { href: "/progress", label: "Progresso", tabKey: "progress" },
];

interface HeaderProps {
  activeTab?: string;
  user?: { name: string; role: string } | null;
  onLogout?: () => void;
}

export default function Header({
  activeTab,
  user,
  onLogout,
}: HeaderProps) {
  return (
    <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Dumbbell className="w-8 h-8 text-emerald-500" />
          <h1 className="text-xl font-bold">IRON BRAIN</h1>
        </Link>
        <nav className="flex gap-2 items-center">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === item.tabKey
                  ? "bg-emerald-600 text-white"
                  : "hover:bg-zinc-800"
              }`}
            >
              {item.label}
            </Link>
          ))}
          {user ? (
            <div className="flex items-center gap-2 ml-2">
              <div className="flex items-center gap-2 px-3 py-2 bg-zinc-800 rounded-lg">
                <User className="w-4 h-4 text-emerald-500" />
                <span className="text-sm">{user.name}</span>
              </div>
              {user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-sm transition-colors"
                >
                  Admin
                </Link>
              )}
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center gap-2 text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </button>
              )}
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
            >
              Entrar
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
