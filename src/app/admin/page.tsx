"use client";

import { useState, useEffect, useCallback } from "react";
import { getAllPlayersWithStats, getAllAttempts, type Player, type QuizAttempt } from "../lib/supabase";
import { getLevelForXp } from "../lib/levels";

const ADMIN_PIN = "1234"; // Change this to your preferred PIN

const PART_NAMES: Record<number, string> = {
  1: "ביקור המלאכים",
  2: "תפילת אברהם וסדום",
  3: "חורבן סדום ולוט",
  4: "אבימלך ולידת יצחק",
  5: "ברית אבימלך והעקידה",
};

function formatDuration(seconds: number): string {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("he-IL", {
    day: "numeric",
    month: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type AttemptWithPlayer = QuizAttempt & { player_name?: string; player_emoji?: string };

export default function AdminPage() {
  const [pin, setPin] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [attempts, setAttempts] = useState<AttemptWithPlayer[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [view, setView] = useState<"overview" | "players" | "activity">("overview");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [p, a] = await Promise.all([getAllPlayersWithStats(), getAllAttempts()]);
      setPlayers(p);
      setAttempts(a as AttemptWithPlayer[]);
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authenticated) loadData();
  }, [authenticated, loadData]);

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-sm w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-500 mb-6">Enter PIN to access</p>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && pin === ADMIN_PIN) setAuthenticated(true);
            }}
            placeholder="PIN"
            className="w-full p-4 rounded-xl border-2 border-gray-200 text-center text-2xl tracking-widest mb-4 focus:outline-none focus:border-blue-500"
            autoFocus
          />
          <button
            onClick={() => {
              if (pin === ADMIN_PIN) setAuthenticated(true);
            }}
            className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Enter
          </button>
        </div>
      </div>
    );
  }

  // Stats calculations
  const totalQuizzes = attempts.length;
  const totalTimeSec = attempts.reduce((sum, a) => sum + (a.duration_seconds || 0), 0);
  const avgScore = totalQuizzes > 0
    ? Math.round(attempts.reduce((sum, a) => sum + (a.score / a.total_questions) * 100, 0) / totalQuizzes)
    : 0;
  const perfectScores = attempts.filter((a) => a.score === a.total_questions).length;

  const playerAttempts = selectedPlayer
    ? attempts.filter((a) => a.player_id === selectedPlayer)
    : attempts;

  // Parts completion matrix
  const playerPartMatrix = players.map((p) => {
    const pAttempts = attempts.filter((a) => a.player_id === p.id);
    const partBests: Record<number, { score: number; total: number; time: number }> = {};
    for (const a of pAttempts) {
      const prev = partBests[a.part_id];
      if (!prev || a.score > prev.score) {
        partBests[a.part_id] = { score: a.score, total: a.total_questions, time: a.duration_seconds || 0 };
      }
    }
    return {
      player: p,
      parts: partBests,
      totalAttempts: pAttempts.length,
      totalTime: pAttempts.reduce((s, a) => s + (a.duration_seconds || 0), 0),
    };
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📊</span>
            <h1 className="text-xl font-bold text-gray-900">Rashi Quiz — Admin</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 cursor-pointer"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-6xl mx-auto px-4 flex gap-1">
          {(["overview", "players", "activity"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setView(tab);
                setSelectedPlayer(null);
              }}
              className={`px-4 py-2 text-sm font-semibold rounded-t-lg cursor-pointer transition-colors ${
                view === tab
                  ? "bg-gray-50 text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab === "overview" ? "Overview" : tab === "players" ? "Players" : "Activity Log"}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Overview Tab */}
        {view === "overview" && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Players" value={players.length} icon="👥" />
              <StatCard label="Quizzes Taken" value={totalQuizzes} icon="📝" />
              <StatCard label="Avg Score" value={`${avgScore}%`} icon="📊" />
              <StatCard label="Perfect Scores" value={perfectScores} icon="👑" />
              <StatCard label="Total Time" value={`${Math.round(totalTimeSec / 60)} min`} icon="⏱" />
              <StatCard
                label="Avg Time/Quiz"
                value={totalQuizzes > 0 ? formatDuration(Math.round(totalTimeSec / totalQuizzes)) : "—"}
                icon="⏳"
              />
              <StatCard
                label="Best Streak"
                value={players.length > 0 ? Math.max(...players.map((p) => p.best_streak)) : 0}
                icon="🔥"
              />
              <StatCard
                label="Total XP Earned"
                value={players.reduce((s, p) => s + p.total_xp, 0)}
                icon="⚡"
              />
            </div>

            {/* Player × Part Matrix */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h2 className="font-bold text-gray-900">Progress Matrix</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500">
                      <th className="text-left px-4 py-2 font-semibold">Player</th>
                      <th className="text-left px-4 py-2 font-semibold">Level</th>
                      {[1, 2, 3, 4, 5].map((p) => (
                        <th key={p} className="text-center px-3 py-2 font-semibold">
                          Part {p}
                        </th>
                      ))}
                      <th className="text-center px-3 py-2 font-semibold">Attempts</th>
                      <th className="text-center px-3 py-2 font-semibold">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {playerPartMatrix.map(({ player, parts, totalAttempts, totalTime }) => {
                      const levelInfo = getLevelForXp(player.total_xp);
                      return (
                        <tr key={player.id} className="border-t border-gray-100 hover:bg-blue-50">
                          <td className="px-4 py-3 font-semibold">
                            <button
                              onClick={() => {
                                setSelectedPlayer(player.id);
                                setView("activity");
                              }}
                              className="flex items-center gap-2 hover:text-blue-600 cursor-pointer"
                            >
                              <span>{player.avatar_emoji}</span>
                              <span>{player.name}</span>
                            </button>
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {levelInfo.emoji} {levelInfo.level}
                          </td>
                          {[1, 2, 3, 4, 5].map((partId) => {
                            const best = parts[partId];
                            if (!best) {
                              return (
                                <td key={partId} className="text-center px-3 py-3">
                                  <span className="text-gray-300">—</span>
                                </td>
                              );
                            }
                            const pct = Math.round((best.score / best.total) * 100);
                            return (
                              <td key={partId} className="text-center px-3 py-3">
                                <span
                                  className={`inline-block px-2 py-1 rounded-lg text-xs font-bold ${
                                    pct === 100
                                      ? "bg-yellow-100 text-yellow-800"
                                      : pct >= 70
                                      ? "bg-green-100 text-green-800"
                                      : pct >= 50
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {best.score}/{best.total}
                                </span>
                              </td>
                            );
                          })}
                          <td className="text-center px-3 py-3 text-gray-600">{totalAttempts}</td>
                          <td className="text-center px-3 py-3 text-gray-600">
                            {Math.round(totalTime / 60)}m
                          </td>
                        </tr>
                      );
                    })}
                    {players.length === 0 && (
                      <tr>
                        <td colSpan={9} className="text-center py-8 text-gray-400">
                          No players yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Players Tab */}
        {view === "players" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {players.map((player) => {
              const levelInfo = getLevelForXp(player.total_xp);
              const pAttempts = attempts.filter((a) => a.player_id === player.id);
              const totalTime = pAttempts.reduce((s, a) => s + (a.duration_seconds || 0), 0);
              const avgPct = pAttempts.length > 0
                ? Math.round(pAttempts.reduce((s, a) => s + (a.score / a.total_questions) * 100, 0) / pAttempts.length)
                : 0;
              const partsCompleted = new Set(pAttempts.map((a) => a.part_id)).size;

              return (
                <div
                  key={player.id}
                  className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    setSelectedPlayer(player.id);
                    setView("activity");
                  }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl">{player.avatar_emoji}</span>
                    <div>
                      <p className="text-lg font-bold text-gray-900">{player.name}</p>
                      <p className="text-sm text-gray-500">
                        {levelInfo.emoji} {levelInfo.title} (Level {levelInfo.level})
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-lg font-bold text-yellow-600">⚡ {player.total_xp}</p>
                      <p className="text-xs text-gray-500">XP</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-lg font-bold text-blue-600">{player.quizzes_completed}</p>
                      <p className="text-xs text-gray-500">Quizzes</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-lg font-bold text-green-600">{avgPct}%</p>
                      <p className="text-xs text-gray-500">Avg Score</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-lg font-bold text-red-600">🔥 {player.best_streak}</p>
                      <p className="text-xs text-gray-500">Best Streak</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-lg font-bold text-purple-600">{partsCompleted}/5</p>
                      <p className="text-xs text-gray-500">Parts Done</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-lg font-bold text-gray-600">{Math.round(totalTime / 60)}m</p>
                      <p className="text-xs text-gray-500">Total Time</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-3">
                    Joined: {formatDate(player.created_at)}
                  </p>
                </div>
              );
            })}
            {players.length === 0 && (
              <div className="col-span-2 text-center py-12 text-gray-400">
                No players yet
              </div>
            )}
          </div>
        )}

        {/* Activity Log Tab */}
        {view === "activity" && (
          <div className="space-y-4">
            {/* Player filter */}
            {selectedPlayer && (
              <div className="flex items-center gap-3 bg-blue-50 rounded-xl px-4 py-3 border border-blue-200">
                <span className="text-sm text-blue-700 font-semibold">
                  Filtering: {players.find((p) => p.id === selectedPlayer)?.name}
                </span>
                <button
                  onClick={() => setSelectedPlayer(null)}
                  className="text-blue-500 hover:text-blue-700 font-bold cursor-pointer text-sm"
                >
                  ✕ Clear
                </button>
              </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h2 className="font-bold text-gray-900">
                  {selectedPlayer ? "Player History" : "All Activity"} ({playerAttempts.length})
                </h2>
              </div>
              <div className="divide-y divide-gray-100">
                {playerAttempts.map((attempt) => {
                  const pct = Math.round((attempt.score / attempt.total_questions) * 100);
                  return (
                    <div key={attempt.id} className="px-4 py-3 hover:bg-gray-50 flex items-center gap-4">
                      <div className="shrink-0 text-2xl">
                        {(attempt as AttemptWithPlayer).player_emoji || "📖"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm">
                          {(attempt as AttemptWithPlayer).player_name} — Part {attempt.part_id}: {PART_NAMES[attempt.part_id]}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(attempt.completed_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-sm shrink-0">
                        <span
                          className={`px-2 py-1 rounded-lg font-bold ${
                            pct === 100
                              ? "bg-yellow-100 text-yellow-800"
                              : pct >= 70
                              ? "bg-green-100 text-green-800"
                              : pct >= 50
                              ? "bg-blue-100 text-blue-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {attempt.score}/{attempt.total_questions} ({pct}%)
                        </span>
                        <span className="text-yellow-600 font-semibold">
                          ⚡{attempt.xp_earned}
                        </span>
                        {attempt.max_streak >= 2 && (
                          <span className="text-red-500 font-semibold">
                            🔥{attempt.max_streak}
                          </span>
                        )}
                        <span className="text-gray-400">
                          ⏱ {formatDuration(attempt.duration_seconds)}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {playerAttempts.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    No quiz attempts yet
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 font-semibold">{label}</p>
    </div>
  );
}
