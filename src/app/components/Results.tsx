"use client";

import { useState, useEffect } from "react";

interface ResultsProps {
  score: number;
  total: number;
  xp: number;
  parsha: string;
  partTitle: string;
  partId: number;
  onRestart: () => void;
  onHome: () => void;
}

function getGrade(score: number, total: number) {
  const pct = (score / total) * 100;
  if (pct === 100)
    return { emoji: "👑", title: "!מושלם", subtitle: "!את מלכת הרש\"י" };
  if (pct >= 90)
    return { emoji: "🌟", title: "!מדהים", subtitle: "!רש\"י היה גאה" };
  if (pct >= 70)
    return { emoji: "💪", title: "!כל הכבוד", subtitle: "!את באמת יודעת את זה" };
  if (pct >= 50)
    return { emoji: "📚", title: "!מאמץ יפה", subtitle: "!המשיכי ללמוד — את בדרך" };
  return { emoji: "🔄", title: "!המשיכי ללמוד", subtitle: "!חזרי על הפרשה ונסי שוב" };
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
  onRestart,
  onHome,
}: ResultsProps) {
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const grade = getGrade(score, total);
  const pct = Math.round((score / total) * 100);

  useEffect(() => {
    if (pct >= 70) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [pct]);

  const shareText = `📖 שלטתי בפרשת ${parsha} (${partTitle})!\n${score}/${total} תשובות נכונות (${pct}%) — ${xp} XP!\n\nמי יכול לנצח את הציון שלי? 🔥`;

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
            <ConfettiParticle
              key={i}
              delay={i * 60}
              left={5 + Math.random() * 90}
            />
          ))}
        </div>
      )}

      <div className="max-w-md w-full text-center animate-pop-in relative z-10">
        {/* Trophy */}
        <div className="text-8xl mb-4">{grade.emoji}</div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-2">
          {grade.title}
        </h1>
        <p className="text-lg text-duo-gray-dark font-semibold mb-8">
          {grade.subtitle}
        </p>

        {/* Score Card */}
        <div className="bg-gray-50 rounded-3xl p-6 mb-6 border-2 border-duo-gray">
          <p className="text-duo-gray-dark text-sm font-semibold tracking-wide mb-1">
            פרשת {parsha} • חלק {partId}: {partTitle}
          </p>
          <p className="text-5xl font-extrabold text-foreground mb-1">
            {score}/{total}
          </p>
          <p className="text-lg text-duo-gray-dark font-semibold">
            תשובות נכונות
          </p>

          <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-duo-gray">
            <div className="text-center">
              <p className="text-2xl font-bold text-duo-gold">⚡ {xp}</p>
              <p className="text-xs text-duo-gray-dark font-semibold">XP שנצברו</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-duo-green">{pct}%</p>
              <p className="text-xs text-duo-gray-dark font-semibold">דיוק</p>
            </div>
          </div>
        </div>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="w-full py-4 rounded-2xl bg-duo-blue text-white font-bold text-lg mb-3 transition-all hover:brightness-110 active:brightness-90 cursor-pointer"
        >
          {copied ? "✓ הועתק ללוח!" : "📤 שתפי תוצאה"}
        </button>

        {/* Challenge text */}
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
