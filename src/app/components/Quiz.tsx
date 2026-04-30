"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { parts, type QuizPart } from "../quizData";
import { summaries } from "../quizData/summaries";
import { type Player, getPlayerBestScores, saveQuizAttempt, updatePlayerStats, updatePlayerBestStreak } from "../lib/supabase";
import { getLevelForXp, getXpProgress } from "../lib/levels";
import { playSound, preloadSounds } from "../lib/sounds";
import Results from "./Results";
import StudyScreen from "./StudyScreen";
import PlayerSelect from "./PlayerSelect";

export default function Quiz() {
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [bestScores, setBestScores] = useState<Record<number, { score: number; total: number }>>({});
  const [selectedPart, setSelectedPart] = useState<QuizPart | null>(null);
  const [showStudy, setShowStudy] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [xp, setXp] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [finished, setFinished] = useState(false);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [showStreakBonus, setShowStreakBonus] = useState(false);
  const [shuffledChoices, setShuffledChoices] = useState<
    { text: string; originalIndex: number }[]
  >([]);
  const quizStartTimeRef = useRef<number>(0);

  const questions = selectedPart?.questions ?? [];
  const total = questions.length;
  const question = questions[currentIndex];
  const progress = total > 0 ? ((currentIndex + (answered ? 1 : 0)) / total) * 100 : 0;

  // Preload sounds on mount
  useEffect(() => {
    preloadSounds();
  }, []);

  // Load best scores when player is selected
  useEffect(() => {
    if (currentPlayer) {
      getPlayerBestScores(currentPlayer.id)
        .then(setBestScores)
        .catch(() => {});
    }
  }, [currentPlayer]);

  // Shuffle choices when question changes
  useEffect(() => {
    if (!question) return;
    const choices = question.choices.map((text, i) => ({ text, originalIndex: i }));
    for (let i = choices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [choices[i], choices[j]] = [choices[j], choices[i]];
    }
    setShuffledChoices(choices);
  }, [question]);

  const handleSelect = useCallback(
    (originalIndex: number) => {
      if (answered) return;
      setSelected(originalIndex);
      setAnswered(true);

      if (originalIndex === question.correctIndex) {
        const newStreak = streak + 1;
        const streakBonus = newStreak >= 3 ? 10 : newStreak >= 2 ? 5 : 0;
        setScore((s) => s + 1);
        setXp((x) => x + 10 + streakBonus);
        setStreak(newStreak);
        setMaxStreak((m) => Math.max(m, newStreak));

        // Play sound — streak sound if on a streak, otherwise correct
        if (newStreak >= 3) {
          playSound("streak");
        } else {
          playSound("correct");
        }

        if (streakBonus > 0) {
          setShowStreakBonus(true);
          setTimeout(() => setShowStreakBonus(false), 1200);
        }
      } else {
        setHearts((h) => Math.max(0, h - 1));
        setStreak(0);
        playSound("wrong");
      }
    },
    [answered, question?.correctIndex, streak]
  );

  const handleNext = useCallback(() => {
    if (currentIndex + 1 >= total) {
      setFinished(true);
      playSound("complete");
    } else {
      setCurrentIndex((i) => i + 1);
      setSelected(null);
      setAnswered(false);
    }
  }, [currentIndex, total]);

  const resetQuiz = useCallback(() => {
    setCurrentIndex(0);
    setSelected(null);
    setScore(0);
    setHearts(5);
    setXp(0);
    setAnswered(false);
    setFinished(false);
    setStreak(0);
    setMaxStreak(0);
    setShowStreakBonus(false);
    setQuizStarted(false);
    setShowStudy(false);
  }, []);

  // Player Selection Screen
  if (!currentPlayer) {
    return <PlayerSelect onSelectPlayer={(p) => setCurrentPlayer(p)} />;
  }

  // Part Selection Screen
  if (!selectedPart) {
    const xpInfo = getXpProgress(currentPlayer.total_xp);

    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-10" dir="rtl">
        <div className="max-w-lg w-full text-center animate-fade-in">
          {/* Player header */}
          <div className="flex items-center justify-between mb-6 bg-gray-50 rounded-2xl p-4 border-2 border-duo-gray">
            <div className="flex items-center gap-3 text-right">
              <span className="text-3xl">{currentPlayer.avatar_emoji}</span>
              <div>
                <p className="text-lg font-bold text-foreground">{currentPlayer.name}</p>
                <p className="text-sm text-duo-gray-dark">
                  {xpInfo.current.emoji} {xpInfo.current.title} • ⚡ {currentPlayer.total_xp} XP
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setCurrentPlayer(null);
                setBestScores({});
              }}
              className="text-sm text-duo-gray-dark hover:text-foreground font-semibold cursor-pointer"
            >
              החלף שחקן
            </button>
          </div>

          {/* Level progress */}
          {xpInfo.next && (
            <div className="mb-6 bg-duo-gold/10 rounded-2xl p-4 border-2 border-duo-gold/30">
              <div className="flex justify-between text-sm font-bold mb-1">
                <span className="text-duo-gold">{xpInfo.current.emoji} רמה {xpInfo.current.level}</span>
                <span className="text-duo-gray-dark">{xpInfo.next.emoji} רמה {xpInfo.next.level}</span>
              </div>
              <div className="h-3 bg-duo-gray rounded-full overflow-hidden">
                <div
                  className="h-full bg-duo-gold rounded-full transition-all duration-500"
                  style={{ width: `${xpInfo.progressPct}%` }}
                />
              </div>
              <p className="text-xs text-duo-gray-dark mt-1">
                {xpInfo.xpNeeded - xpInfo.xpInLevel} XP עד לרמה הבאה
              </p>
            </div>
          )}

          <div className="text-6xl mb-4">📖</div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-2">
            חידון רש&quot;י
          </h1>
          <p className="text-xl text-duo-gray-dark font-semibold mb-2">
            פרשת וירא
          </p>
          <p className="text-base text-duo-gray-dark mb-8">
            בחרו חלק להתחיל • 20 שאלות בכל חלק
          </p>

          <div className="grid grid-cols-1 gap-3">
            {parts.map((part) => {
              const best = bestScores[part.partId];
              const bestPct = best ? Math.round((best.score / best.total) * 100) : null;

              return (
                <button
                  key={part.partId}
                  onClick={() => {
                    setSelectedPart(part);
                    setShowStudy(true);
                    setQuizStarted(false);
                  }}
                  className="w-full text-right p-5 rounded-2xl border-2 border-b-4 border-duo-gray bg-white hover:border-duo-green hover:bg-duo-green-light active:border-b-2 active:mt-[2px] transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <span className={`w-12 h-12 rounded-xl text-white flex items-center justify-center text-xl font-bold shrink-0 group-hover:scale-110 transition-transform ${
                      bestPct === 100
                        ? "bg-duo-gold"
                        : bestPct && bestPct >= 70
                        ? "bg-duo-green"
                        : "bg-duo-blue"
                    }`}>
                      {bestPct === 100 ? "👑" : part.partId}
                    </span>
                    <div className="flex-1">
                      <p className="text-lg font-bold text-foreground">
                        {part.partTitle}
                      </p>
                      <p className="text-sm text-duo-gray-dark">
                        {part.partSubtitle}
                      </p>
                      {best && (
                        <p className="text-xs font-bold mt-1 text-duo-green">
                          שיא: {best.score}/{best.total} ({bestPct}%)
                        </p>
                      )}
                    </div>
                    <span className="text-duo-gray-dark text-2xl">←</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Stats footer */}
          {currentPlayer.quizzes_completed > 0 && (
            <div className="mt-6 flex justify-center gap-6 text-sm text-duo-gray-dark font-semibold">
              <span>🏆 {currentPlayer.quizzes_completed} חידונים</span>
              <span>🔥 רצף שיא: {currentPlayer.best_streak}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Study Screen
  if (showStudy && !quizStarted) {
    const summary = summaries.find((s) => s.partId === selectedPart.partId);
    if (summary) {
      return (
        <StudyScreen
          summary={summary}
          partTitle={selectedPart.partTitle}
          partSubtitle={selectedPart.partSubtitle}
          onStartQuiz={() => {
            setShowStudy(false);
            setQuizStarted(true);
            setCurrentIndex(0);
            setSelected(null);
            setScore(0);
            setHearts(5);
            setXp(0);
            setAnswered(false);
            setFinished(false);
            setStreak(0);
            setMaxStreak(0);
            setShowStreakBonus(false);
            quizStartTimeRef.current = Date.now();
          }}
          onBack={() => {
            setSelectedPart(null);
            setShowStudy(false);
          }}
        />
      );
    }
  }

  // Results Screen
  if (finished) {
    return (
      <Results
        score={score}
        total={total}
        xp={xp}
        parsha="וירא"
        partTitle={selectedPart.partTitle}
        partId={selectedPart.partId}
        maxStreak={maxStreak}
        durationSeconds={Math.round((Date.now() - quizStartTimeRef.current) / 1000)}
        player={currentPlayer}
        onRestart={resetQuiz}
        onHome={() => {
          setSelectedPart(null);
          resetQuiz();
        }}
        onSaved={(updatedPlayer) => {
          setCurrentPlayer(updatedPlayer);
          getPlayerBestScores(updatedPlayer.id)
            .then(setBestScores)
            .catch(() => {});
        }}
      />
    );
  }

  // No Hearts Left
  if (hearts <= 0 && !answered) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-10" dir="rtl">
        <div className="max-w-md w-full text-center animate-pop-in">
          <div className="text-8xl mb-4">💔</div>
          <h1 className="text-4xl font-extrabold text-duo-red mb-2">
            נגמרו הלבבות!
          </h1>
          <p className="text-lg text-duo-gray-dark font-semibold mb-6">
            ענית נכון על {score} מתוך {currentIndex} שאלות
          </p>

          <div className="bg-gray-50 rounded-3xl p-6 mb-6 border-2 border-duo-gray">
            <p className="text-3xl font-extrabold text-foreground mb-1">⚡ {xp} XP</p>
            <p className="text-sm text-duo-gray-dark">XP שנצברו</p>
          </div>

          <button
            onClick={resetQuiz}
            className="w-full py-4 rounded-2xl bg-duo-green text-white font-bold text-lg mb-3 transition-all hover:bg-duo-green-dark active:brightness-90 cursor-pointer"
          >
            🔄 נסה שוב
          </button>
          <button
            onClick={() => {
              setSelectedPart(null);
              resetQuiz();
            }}
            className="w-full py-4 rounded-2xl border-2 border-b-4 border-duo-gray text-foreground font-bold text-lg transition-all hover:bg-gray-50 active:border-b-2 active:mt-[2px] cursor-pointer"
          >
            🏠 חזרה לתפריט
          </button>
        </div>
      </div>
    );
  }

  const isCorrect = selected === question.correctIndex;

  // Heart display
  const heartDisplay = [];
  for (let i = 0; i < 5; i++) {
    heartDisplay.push(
      <span key={i} className={`text-lg transition-all duration-300 ${i < hearts ? "scale-100 opacity-100" : "scale-75 opacity-30 grayscale"}`}>
        ❤️
      </span>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white" dir="rtl">
      {/* Top Bar */}
      <div className="sticky top-0 bg-white z-10 px-4 pt-4 pb-2 border-b border-gray-100 shadow-sm">
        <div className="max-w-2xl mx-auto">
          {/* Back button + Part name */}
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => {
                setSelectedPart(null);
                resetQuiz();
              }}
              className="text-duo-gray-dark hover:text-foreground transition-colors cursor-pointer text-sm font-semibold"
            >
              ✕ יציאה
            </button>
            <span className="text-xs text-duo-gray-dark font-semibold">
              {selectedPart.partTitle}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Hearts */}
            <div className="flex items-center gap-0.5 shrink-0">
              {heartDisplay}
            </div>

            {/* Progress Bar */}
            <div className="flex-1 h-4 bg-duo-gray rounded-full overflow-hidden">
              <div
                className="h-full bg-duo-green rounded-full transition-all duration-500 ease-out relative"
                style={{ width: `${progress}%` }}
              >
                {progress > 8 && (
                  <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/30 to-transparent" />
                )}
              </div>
            </div>

            {/* XP */}
            <div className="flex items-center gap-1 text-duo-gold font-bold text-base shrink-0 relative">
              <span>⚡</span>
              <span>{xp}</span>
              {showStreakBonus && (
                <span className="absolute -top-5 right-0 text-xs text-duo-gold font-bold animate-confetti">
                  +{streak >= 3 ? 10 : 5}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Question Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 max-w-2xl mx-auto w-full">
        {/* Question Counter */}
        <div className="text-duo-gray-dark text-sm font-semibold mb-2 tracking-wide">
          שאלה {currentIndex + 1} מתוך {total}
        </div>

        {/* Streak indicator */}
        {streak >= 2 && !answered && (
          <div className="text-duo-gold text-sm font-bold mb-2 animate-pop-in">
            🔥 רצף של {streak}! {streak >= 3 ? "+10" : "+5"} בונוס XP
          </div>
        )}

        {/* Question */}
        <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-8 leading-relaxed animate-fade-in">
          {question.question}
        </h2>

        {/* Choices */}
        <div className="grid grid-cols-1 gap-3 w-full">
          {shuffledChoices.length > 0 && shuffledChoices.map((choice, displayIndex) => {
            const i = choice.originalIndex;
            let btnClass =
              "w-full text-right p-5 rounded-2xl border-2 border-b-4 text-lg md:text-xl font-semibold transition-all duration-150 cursor-pointer ";

            if (!answered) {
              btnClass +=
                "border-duo-gray hover:border-duo-green hover:bg-duo-green-light active:border-b-2 active:mt-[2px] bg-white text-foreground";
            } else if (i === question.correctIndex) {
              btnClass += "border-duo-green bg-duo-green-light text-duo-green-dark";
            } else if (i === selected && !isCorrect) {
              btnClass += "border-duo-red bg-duo-red-light text-duo-red animate-shake";
            } else {
              btnClass += "border-duo-gray bg-gray-50 text-duo-gray-dark opacity-60";
            }

            const letterLabels = ["א", "ב", "ג", "ד"];

            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={answered}
                className={btnClass}
              >
                <span className="inline-flex items-center gap-3">
                  <span className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-base font-bold text-duo-gray-dark shrink-0">
                    {letterLabels[displayIndex]}
                  </span>
                  <span className="leading-relaxed">{choice.text}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Feedback Banner */}
      {answered && (
        <div
          className={`sticky bottom-0 animate-slide-up ${
            isCorrect ? "bg-duo-green-light" : "bg-duo-red-light"
          }`}
        >
          <div className="max-w-2xl mx-auto p-5 md:p-6">
            <div className="flex items-start gap-3 mb-3">
              <span className="text-3xl">{isCorrect ? "🎉" : "😔"}</span>
              <div>
                <h3
                  className={`text-xl font-bold ${
                    isCorrect ? "text-duo-green-dark" : "text-duo-red"
                  }`}
                >
                  {isCorrect
                    ? streak >= 3
                      ? "מדהים! 🔥🔥🔥"
                      : streak >= 2
                      ? "נכון! 🔥"
                      : "נכון!"
                    : "לא נכון"}
                </h3>
                {!isCorrect && (
                  <p className="text-duo-red text-sm font-semibold mt-0.5">
                    התשובה הנכונה: {question.choices[question.correctIndex]}
                  </p>
                )}
                {isCorrect && (
                  <p className="text-duo-green-dark text-sm font-semibold mt-0.5">
                    +{10 + (streak >= 3 ? 10 : streak >= 2 ? 5 : 0)} XP
                  </p>
                )}
              </div>
            </div>

            {/* Rashi Insight */}
            <div className="bg-white/60 rounded-xl p-4 mb-4">
              <p className="text-sm font-semibold text-duo-gray-dark tracking-wide mb-1">
                📖 פירוש רש&quot;י
              </p>
              <p className="text-base text-foreground leading-relaxed">
                {question.rashiInsight}
              </p>
            </div>

            <button
              onClick={handleNext}
              className={`w-full py-4 rounded-2xl text-white font-bold text-lg transition-all active:brightness-90 cursor-pointer ${
                isCorrect
                  ? "bg-duo-green hover:bg-duo-green-dark"
                  : "bg-duo-red hover:brightness-90"
              }`}
            >
              {currentIndex + 1 >= total ? "לתוצאות" : "המשך"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
