"use client";

import { useState, useEffect } from "react";
import { Search, Filter, BarChart3 } from "lucide-react";
import Header from "@/components/Header";
import { muscleGroupLabels, equipmentLabels } from "@/lib/labels";

interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  equipmentType: string;
  isCompound: boolean;
  targetGender: string;
}

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMuscle, setFilterMuscle] = useState("");
  const [filterEquipment, setFilterEquipment] = useState("");
  const [search, setSearch] = useState("");
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    fetchExercises();
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

  async function fetchExercises() {
    try {
      const params = new URLSearchParams();
      if (filterMuscle) params.set("muscleGroup", filterMuscle);
      if (filterEquipment) params.set("equipmentType", filterEquipment);

      const res = await fetch(`/api/exercises?${params}`);
      const data = await res.json();
      if (data.success) {
        setExercises(data.data);
      }
    } catch (error) {
      console.error("Error fetching exercises:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredExercises = exercises.filter((ex) =>
    search ? ex.name.toLowerCase().includes(search.toLowerCase()) : true,
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Header activeTab="exercises" user={user} onLogout={handleLogout} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-500" />
            Catálogo de Exercícios
          </h2>
          <span className="text-zinc-400">
            {filteredExercises.length} exercícios
          </span>
        </div>

        {/* Filters */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Buscar exercício..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
            <select
              value={filterMuscle}
              onChange={(e) => {
                setFilterMuscle(e.target.value);
                fetchExercises();
              }}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-500">
              <option value="">Todos os Músculos</option>
              {Object.entries(muscleGroupLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <select
              value={filterEquipment}
              onChange={(e) => {
                setFilterEquipment(e.target.value);
                fetchExercises();
              }}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-500">
              <option value="">Todos os Equipamentos</option>
              {Object.entries(equipmentLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                setFilterMuscle("");
                setFilterEquipment("");
                setSearch("");
                fetchExercises();
              }}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-sm hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2">
              <Filter className="w-4 h-4" />
              Limpar Filtros
            </button>
          </div>
        </div>

        {/* Exercise List */}
        {loading ? (
          <div className="text-center py-12 text-zinc-400">
            Carregando exercícios...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredExercises.map((exercise) => (
              <ExerciseCard key={exercise.id} exercise={exercise} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function ExerciseCard({ exercise }: { exercise: Exercise }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-lg">{exercise.name}</h3>
        {exercise.isCompound && (
          <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">
            Composto
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <span className="text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded">
          {muscleGroupLabels[exercise.muscleGroup] || exercise.muscleGroup}
        </span>
        <span className="text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded">
          {equipmentLabels[exercise.equipmentType] || exercise.equipmentType}
        </span>
      </div>
    </div>
  );
}
