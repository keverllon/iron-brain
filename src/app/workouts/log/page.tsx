"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Save, CheckCircle } from "lucide-react";
import Header from "@/components/Header";
import { muscleGroupLabels } from "@/lib/labels";

interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  equipmentType: string;
}

interface WorkoutSet {
  id: string;
  exerciseId: string;
  exerciseName: string;
  targetSets: number;
  targetReps: string;
  actualReps: number;
  weightLifted: number;
  rpe: number;
  completed: boolean;
}

export default function LogWorkoutPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [sets, setSets] = useState<WorkoutSet[]>([]);
  const [selectedExercise, setSelectedExercise] = useState("");
  const [targetSets, setTargetSets] = useState(4);
  const [targetReps, setTargetReps] = useState("8-12");
  const [workoutName, setWorkoutName] = useState("Treino A");
  const [saved, setSaved] = useState(false);
  const [user, setUser] = useState<{ id: string; name: string; role: string } | null>(null);

  useEffect(() => {
    fetchExercises();
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

  async function fetchExercises() {
    try {
      const res = await fetch("/api/exercises");
      const data = await res.json();
      if (data.success) {
        setExercises(data.data);
      }
    } catch (error) {
      console.error("Error fetching exercises:", error);
    }
  }

  function addExercise() {
    if (!selectedExercise) return;
    const exercise = exercises.find((e) => e.id === selectedExercise);
    if (!exercise) return;

    const newSets: WorkoutSet[] = Array.from(
      { length: targetSets },
      (_, i) => ({
        id: `${selectedExercise}-${i}`,
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        targetSets: 1,
        targetReps: targetReps,
        actualReps: 0,
        weightLifted: 0,
        rpe: 7,
        completed: false,
      }),
    );

    setSets([...sets, ...newSets]);
    setSelectedExercise("");
  }

  function updateSet(id: string, field: keyof WorkoutSet, value: number) {
    setSets(sets.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  }

  function toggleComplete(id: string) {
    setSets(
      sets.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s)),
    );
  }

  function removeSet(id: string) {
    setSets(sets.filter((s) => s.id !== id));
  }

  function removeExercise(exerciseId: string) {
    setSets(sets.filter((s) => s.exerciseId !== exerciseId));
  }

  async function saveWorkout() {
    const completedSets = sets.filter((s) => s.completed);
    if (completedSets.length === 0) {
      alert("Complete pelo menos uma série antes de salvar.");
      return;
    }

    try {
      const res = await fetch("/api/workout-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id ?? "00000000-0000-0000-0000-000000000000",
          name: workoutName,
          sessions: [
            {
              day: new Date().toLocaleDateString("pt-BR", { weekday: "long" }),
              exercises: sets.map((s) => ({
                exerciseId: s.exerciseId,
                targetSets: 1,
                targetReps: s.targetReps,
                actualReps: s.completed ? s.actualReps : null,
                weightLifted: s.completed ? s.weightLifted : null,
                rpe: s.completed ? s.rpe : null,
              })),
            },
          ],
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert(`Erro: ${data.error}`);
      }
    } catch (error) {
      console.error("Error saving workout:", error);
      alert("Erro ao salvar treino.");
    }
  }

  const completedCount = sets.filter((s) => s.completed).length;
  const progress = sets.length > 0 ? (completedCount / sets.length) * 100 : 0;

  // Group sets by exercise
  const setsByExercise = new Map<string, WorkoutSet[]>();
  for (const set of sets) {
    const existing = setsByExercise.get(set.exerciseId) || [];
    existing.push(set);
    setsByExercise.set(set.exerciseId, existing);
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Header activeTab="workouts" user={user} onLogout={handleLogout} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Registrar Treino</h2>
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500"
              placeholder="Nome do treino"
            />
            <div className="text-sm text-zinc-400">
              {completedCount}/{sets.length} séries completadas
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400">Progresso do Treino</span>
            <span className="text-sm font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-3">
            <div
              className="bg-emerald-500 h-3 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Add Exercise */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6">
          <h3 className="font-semibold mb-4">Adicionar Exercício</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={selectedExercise}
              onChange={(e) => setSelectedExercise(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500">
              <option value="">Selecionar exercício...</option>
              {exercises.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name} (
                  {muscleGroupLabels[ex.muscleGroup] || ex.muscleGroup})
                </option>
              ))}
            </select>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Séries</label>
              <input
                type="number"
                value={targetSets}
                onChange={(e) => setTargetSets(parseInt(e.target.value))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500"
                min={1}
                max={10}
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Reps</label>
              <input
                type="text"
                value={targetReps}
                onChange={(e) => setTargetReps(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500"
                placeholder="8-12"
              />
            </div>
            <button
              onClick={addExercise}
              disabled={!selectedExercise}
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-medium transition-colors disabled:opacity-50">
              <Plus className="w-4 h-4" />
              Adicionar
            </button>
          </div>
        </div>

        {/* Workout Sets */}
        {Array.from(setsByExercise.entries()).map(
          ([exerciseId, exerciseSets]) => {
            const exerciseName = exerciseSets[0]?.exerciseName;
            return (
              <div
                key={exerciseId}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">{exerciseName}</h3>
                  <button
                    onClick={() => removeExercise(exerciseId)}
                    className="text-red-400 hover:text-red-300 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  {exerciseSets.map((set, index) => (
                    <SetRow
                      key={set.id}
                      set={set}
                      index={index + 1}
                      onUpdate={updateSet}
                      onToggle={toggleComplete}
                      onRemove={removeSet}
                    />
                  ))}
                </div>
              </div>
            );
          },
        )}

        {/* Save Button */}
        <div className="flex justify-end mt-6">
          <button
            onClick={saveWorkout}
            disabled={sets.length === 0}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-medium transition-colors disabled:opacity-50">
            {saved ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Salvo!
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Salvar Treino
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}

// ============================================================
// COMPONENTE DE SÉRIE
// ============================================================

function SetRow({
  set,
  index,
  onUpdate,
  onToggle,
  onRemove,
}: {
  set: WorkoutSet;
  index: number;
  onUpdate: (id: string, field: keyof WorkoutSet, value: number) => void;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div
      className={`flex items-center gap-4 p-3 rounded-lg ${
        set.completed
          ? "bg-emerald-500/10 border border-emerald-500/30"
          : "bg-zinc-800"
      }`}>
      <span className="text-sm font-medium w-8">#{index}</span>
      <div className="flex-1 grid grid-cols-3 gap-4">
        <div>
          <label className="text-xs text-zinc-400">Reps</label>
          <input
            type="number"
            value={set.actualReps || ""}
            onChange={(e) =>
              onUpdate(set.id, "actualReps", parseInt(e.target.value) || 0)
            }
            className="w-full bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-sm focus:outline-none focus:border-emerald-500"
            placeholder="0"
          />
        </div>
        <div>
          <label className="text-xs text-zinc-400">Peso (kg)</label>
          <input
            type="number"
            value={set.weightLifted || ""}
            onChange={(e) =>
              onUpdate(set.id, "weightLifted", parseFloat(e.target.value) || 0)
            }
            className="w-full bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-sm focus:outline-none focus:border-emerald-500"
            placeholder="0"
          />
        </div>
        <div>
          <label className="text-xs text-zinc-400">RPE (1-10)</label>
          <input
            type="number"
            value={set.rpe}
            onChange={(e) =>
              onUpdate(set.id, "rpe", parseInt(e.target.value) || 1)
            }
            className="w-full bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-sm focus:outline-none focus:border-emerald-500"
            min={1}
            max={10}
          />
        </div>
      </div>
      <button
        onClick={() => onToggle(set.id)}
        className={`p-2 rounded-lg transition-colors ${
          set.completed
            ? "bg-emerald-500 text-white"
            : "bg-zinc-700 hover:bg-zinc-600"
        }`}>
        <CheckCircle className="w-5 h-5" />
      </button>
      <button
        onClick={() => onRemove(set.id)}
        className="p-2 rounded-lg bg-zinc-700 hover:bg-red-500/20 hover:text-red-400 transition-colors">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
