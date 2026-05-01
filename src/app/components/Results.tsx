"use client";

import { useState, useEffect, useRef } from "react";
import { type Player, saveQuizAttempt, updatePlayerStats, updatePlayerBestStreak } from "../lib/supabase";
import { getLevelForXp, getXpProgress } from "../lib/levels";
import { playSound } from "../lib/sounds";

interface ResultsProps {
  score: number; // first-try correct count
  total: number;
  xp: number;
  parsha: string;
  partTitle: string;
  partId: number;
  maxStreak: number;
  durationSeconds: number;
  player: Player;
  totalAttempts: number;
  onRestart: () => void;
  onHome: () => void;
  onSaved: (updatedPlayer: Player) => void;
}

function getGrade(firstTryCorrect: number, total: number) {
  const pct = (firstTryCorrect / total) * 100;
  if (pct === 100)
    return { emoji: "👑", title: "!מושלם", subtitle: "כל התשובות נכונות בפעם הראשונה!" };
  if (pct >= 90)
    return { emoji: "🌟", title: "!מדהים", subtitle: "!רש\"י היה גאה" };
  if (pct >= 70)
    return { emoji: "💪", title: "!כל הכבוד", subtitle: "!שליטה מצוינת" };
  if (pct >= 50)
    return { emoji: "📚", title: "!יפה מאוד", subtitle: "!ההתמדה משתלמת" };
  return { emoji: "🌱", title: "!כל הכבוד שסיימתם", subtitle: "!חזרו ותשתפרו" };
}

function ConfettiParticle({ delay, left }: { delay: number; left: number }) {
  const colors = ["#58cc02", "#ffc800", "#ff4b4b", "#1cb0f6", "#ce82ff"];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const size = 8 + Math.random() * 8;
  const rotation = Math.random() * 360;

  return (
    <div
      className="absolute animate-confetti pointer-events-none"
      style={{
        left: `${left}%`,
        top: "50%",
        animationDelay: `${delay}ms`,
        animationDuration: `${1200 + Math.random() * 800}ms`,
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          backgroundColor: color,
          borderRadius: Math.random() > 0.5 ? "50%" : "2px",
          transform: `rotate(${rotation}deg)`,
        }}
      />
    </div>
  );
}

export default function Results({
  score,
  total,
  xp,
  parsha,
  partTitle,
  partId,
  maxStreak,
  durationSeconds,
  player,
  totalAttempts,
  onRestart,
  onHome,
  onSaved,
}: ResultsProps) {
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [leveledUp, setLeveledUp] = useState(false);
  const [newLevelEmoji, setNewLevelEmoji] = useState("");
  const [newLevelTitle, setNewLevelTitle] = useState("");
  const savedRef = useRef(false);

  const grade = getGrade(score, total);
  const firstTryPct = Math.round((score / total) * 100);
  const retries = totalAttempts - total;

  // Save results to Supabase (once)
  useEffect(() => {
    if (savedRef.current) return;
    savedRef.current = true;

    async function save() {
      try {
        const newTotalXp = player.total_xp + xp;
        const oldLevel = getLevelForXp(player.total_xp);
        const newLevel = getLevelForXp(newTotalXp);

        if (newLevel.level > oldLevel.level) {
          setLeveledUp(true);
          setNewLevelEmoji(newLevel.emoji);
          setNewLevelTitle(newLevel.title);
          setTimeout(() => playSound("levelup"), 500);
        } else if (firstTryPct === 100) {
          playSound("perfect");
        }

        await saveQuizAttempt({
          player_id: player.id,
          part_id: partId,
          score,
          total_questions: total,
          xp_earned: xp,
          hearts_remaining: 0,
          max_streak: maxStreak,
          duration_seconds: durationSeconds,
        });

        await updatePlayerStats(player.id, xp, newLevel.level);

        if (maxStreak > 0) {
          await updatePlayerBestStreak(player.id, maxStreak);
        }

        onSaved({
          ...player,
          total_xp: newTotalXp,
          level: newLevel.level,
          quizzes_completed: player.quizzes_completed + 1,
          best_streak: Math.max(player.best_streak, maxStreak),
        });
      } catch (err) {
        console.error("Failed to save results:", err);
      }
    }

    save();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  const newTotalXp = player.total_xp + xp;
  const xpInfo = getXpProgress(newTotalXp);

  const shareText = `📖 שלטתי בפרשת ${parsha} (${partTitle})!\n${total}/${total} שאלות נשלטו • ${score}/${total} נכון בפעם הראשונה (${firstTryPct}%)\n⚡ ${xp} XP • ${xpInfo.current.emoji} רמה ${xpInfo.current.level}: ${xpInfo.current.title}\n\nמי יכול לנצח את הציון שלי? 🔥`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `חידון רש"י — פרשת ${parsha}`,
          text: shareText,
        });
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden" dir="rtl">
      {/* Confetti */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {Array.from({ length: 30 }).map((_, i) => (
            <ConfettiParticle key={i} delay={i * 60} left={5 + Math.random() * 90} />
          ))}
        </div>
      )}

      <div className="max-w-md w-full text-center animate-pop-in relative z-10">
        {/* Level Up Banner */}
        {leveledUp && (
          <div className="mb-6 bg-duo-gold/20 rounded-2xl p-5 border-2 border-duo-gold animate-pop-in">
            <div className="text-5xl mb-2">{newLevelEmoji}</div>
            <p className="text-xl font-extrabold text-duo-gold">עלית רמה!</p>
            <p className="text-lg font-bold text-foreground">{newLevelTitle}</p>
          </div>
        )}

        {/* Trophy */}
        <div className="text-8xl mb-4">{grade.emoji}</div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-2">{grade.title}</h1>
        <p className="text-lg text-duo-gray-dark font-semibold mb-8">{grade.subtitle}</p>

        {/* Score Card */}
        <div className="bg-gray-50 rounded-3xl p-6 mb-6 border-2 border-duo-gray">
          <p className="text-duo-gray-dark text-sm font-semibold tracking-wide mb-1">
            פרשת {parsha} • {partId <= 5 ? `חלק ${partId}: ` : ""}{partTitle}
          </p>
          <p className="text-5xl font-extrabold text-duo-green mb-1">
            {total}/{total} ✓
          </p>
          <p className="text-lg text-duo-gray-dark font-semibold">שאלות נשלטו</p>

          <div className="flex justify-center gap-5 mt-4 pt-4 border-t border-duo-gray flex-wrap">
            <div className="text-center">
              <p className="text-2xl font-bold text-duo-gold">⚡ {xp}</p>
              <p className="text-xs text-duo-gray-dark font-semibold">XP שנצברו</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-duo-blue">{score}/{total}</p>
              <p className="text-xs text-duo-gray-dark font-semibold">נכון בפעם הראשונה</p>
            </div>
            {retries > 0 && (
              <div className="text-center">
                <p className="text-2xl font-bold text-duo-purple">🔄 {retries}</p>
                <p className="text-xs text-duo-gray-dark font-semibold">חזרות</p>
              </div>
            )}
            {maxStreak >= 2 && (
              <div className="text-center">
                <p className="text-2xl font-bold text-duo-red">🔥 {maxStreak}</p>
                <p className="text-xs text-duo-gray-dark font-semibold">רצף שיא</p>
              </div>
            )}
            <div className="text-center">
              <p className="text-2xl font-bold text-duo-gray-dark">
                ⏱ {Math.floor(durationSeconds / 60)}:{(durationSeconds % 60).toString().padStart(2, "0")}
              </p>
              <p className="text-xs text-duo-gray-dark font-semibold">זמן</p>
            </div>
          </div>
        </div>

        {/* XP Progress */}
        <div className="bg-duo-gold/10 rounded-2xl p-4 mb-6 border-2 border-duo-gold/30">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-lg">{xpInfo.current.emoji}</span>
            <span className="font-bold text-foreground">{xpInfo.current.title}</span>
            <span className="text-sm text-duo-gray-dark">• רמה {xpInfo.current.level}</span>
          </div>
          {xpInfo.next && (
            <>
              <div className="h-3 bg-duo-gray rounded-full overflow-hidden mb-1">
                <div
                  className="h-full bg-duo-gold rounded-full transition-all duration-1000"
                  style={{ width: `${xpInfo.progressPct}%` }}
                />
              </div>
              <p className="text-xs text-duo-gray-dark">
                ⚡ {newTotalXp} XP — עוד {xpInfo.xpNeeded - xpInfo.xpInLevel} עד {xpInfo.next.emoji}{" "}
                {xpInfo.next.title}
              </p>
            </>
          )}
          {!xpInfo.next && (
            <p className="text-sm font-bold text-duo-gold">⚡ {newTotalXp} XP — רמה מקסימלית!</p>
          )}
        </div>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="w-full py-4 rounded-2xl bg-duo-blue text-white font-bold text-lg mb-3 transition-all hover:brightness-110 active:brightness-90 cursor-pointer"
        >
          {copied ? "✓ הועתק ללוח!" : "📤 שתפי תוצאה"}
        </button>

        <p className="text-sm text-duo-gray-dark mb-6 italic">
          שלחי לחברה — בואו נראה מי מקבלת ציון יותר גבוה!
        </p>

        {/* Restart */}
        <button
          onClick={onRestart}
          className="w-full py-4 rounded-2xl bg-duo-green text-white font-bold text-lg mb-3 transition-all hover:bg-duo-green-dark active:brightness-90 cursor-pointer"
        >
          🔄 נסי שוב
        </button>

        {/* Home */}
        <button
          onClick={onHome}
          className="w-full py-4 rounded-2xl border-2 border-b-4 border-duo-gray text-foreground font-bold text-lg transition-all hover:bg-gray-50 active:border-b-2 active:mt-[2px] cursor-pointer"
        >
          🏠 חזרה לתפריט
        </button>
      </div>
    </div>
  );
}
