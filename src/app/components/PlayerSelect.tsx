"use client";

import { useState, useEffect } from "react";
import { getPlayers, createPlayer, type Player } from "../lib/supabase";
import { getXpProgress } from "../lib/levels";

interface PlayerSelectProps {
  onSelectPlayer: (player: Player) => void;
}

const AVATAR_OPTIONS = ["📖", "🦁", "⭐", "🔥", "🎓", "👑", "🌟", "💎", "🦅", "🐉", "🎯", "💪"];

export default function PlayerSelect({ onSelectPlayer }: PlayerSelectProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewPlayer, setShowNewPlayer] = useState(false);
  const [name, setName] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("📖");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPlayers();
  }, []);

  async function loadPlayers() {
    try {
      const data = await getPlayers();
      setPlayers(data);
      if (data.length === 0) setShowNewPlayer(true);
    } catch {
      setError("שגיאה בטעינת השחקנים");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (players.some((p) => p.name === trimmed)) {
      setError("השם הזה כבר קיים!");
      return;
    }
    setCreating(true);
    setError("");
    try {
      const player = await createPlayer(trimmed, selectedEmoji);
      onSelectPlayer(player);
    } catch {
      setError("שגיאה ביצירת שחקן");
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center" dir="rtl">
        <div className="text-center animate-fade-in">
          <div className="text-6xl mb-4 animate-pop-in">📖</div>
          <p className="text-xl font-bold text-foreground">טוען...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-10" dir="rtl">
      <div className="max-w-lg w-full text-center animate-fade-in">
        <div className="text-6xl mb-4">📖</div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-2">
          חידון רש&quot;י
        </h1>
        <p className="text-xl text-duo-gray-dark font-semibold mb-8">
          בחרו שחקן כדי להתחיל
        </p>

        {!showNewPlayer ? (
          <>
            {/* Existing Players */}
            <p className="text-lg font-bold text-foreground mb-4">מי משחק?</p>
            <div className="grid grid-cols-1 gap-3 mb-4">
              {players.map((player) => {
                const xpInfo = getXpProgress(player.total_xp);
                return (
                  <button
                    key={player.id}
                    onClick={() => onSelectPlayer(player)}
                    className="w-full text-right p-4 rounded-2xl border-2 border-b-4 border-duo-gray bg-white hover:border-duo-green hover:bg-duo-green-light active:border-b-2 active:mt-[2px] transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <span className="w-14 h-14 rounded-xl bg-duo-green-light flex items-center justify-center text-3xl shrink-0 group-hover:scale-110 transition-transform">
                        {player.avatar_emoji}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-lg font-bold text-foreground truncate">
                          {player.name}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-duo-gray-dark">
                          <span>{xpInfo.current.emoji} {xpInfo.current.title}</span>
                          <span>•</span>
                          <span>⚡ {player.total_xp} XP</span>
                          <span>•</span>
                          <span>🏆 {player.quizzes_completed} חידונים</span>
                        </div>
                        {/* Level progress bar */}
                        {xpInfo.next && (
                          <div className="mt-1.5 h-2 bg-duo-gray rounded-full overflow-hidden">
                            <div
                              className="h-full bg-duo-gold rounded-full transition-all"
                              style={{ width: `${xpInfo.progressPct}%` }}
                            />
                          </div>
                        )}
                      </div>
                      <span className="text-duo-gray-dark text-2xl">←</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => {
                setShowNewPlayer(true);
                setError("");
              }}
              className="w-full py-4 rounded-2xl border-2 border-b-4 border-duo-blue bg-white text-duo-blue font-bold text-lg hover:bg-blue-50 active:border-b-2 active:mt-[2px] transition-all cursor-pointer"
            >
              ➕ שחקן חדש
            </button>
          </>
        ) : (
          <>
            {/* New Player Form */}
            <p className="text-lg font-bold text-foreground mb-4">שחקן חדש</p>

            {/* Avatar Selection */}
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {AVATAR_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`w-12 h-12 rounded-xl text-2xl flex items-center justify-center transition-all cursor-pointer ${
                    selectedEmoji === emoji
                      ? "bg-duo-green-light border-2 border-duo-green scale-110"
                      : "bg-gray-100 border-2 border-transparent hover:border-duo-gray"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Name Input */}
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="הכנס את השם שלך..."
              className="w-full p-4 rounded-2xl border-2 border-duo-gray text-lg font-semibold text-foreground text-center mb-4 focus:outline-none focus:border-duo-green transition-colors"
              autoFocus
              dir="rtl"
            />

            {error && (
              <p className="text-duo-red font-semibold text-sm mb-3">{error}</p>
            )}

            <button
              onClick={handleCreate}
              disabled={!name.trim() || creating}
              className={`w-full py-4 rounded-2xl font-bold text-lg transition-all cursor-pointer mb-3 ${
                name.trim()
                  ? "bg-duo-green text-white hover:bg-duo-green-dark active:brightness-90"
                  : "bg-duo-gray text-duo-gray-dark cursor-not-allowed"
              }`}
            >
              {creating ? "יוצר..." : "🚀 בואו נתחיל!"}
            </button>

            {players.length > 0 && (
              <button
                onClick={() => {
                  setShowNewPlayer(false);
                  setError("");
                }}
                className="w-full py-3 rounded-2xl border-2 border-duo-gray text-foreground font-bold transition-all hover:bg-gray-50 cursor-pointer"
              >
                ← חזרה לבחירת שחקן
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
