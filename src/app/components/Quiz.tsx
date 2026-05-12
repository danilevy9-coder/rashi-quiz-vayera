"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { parshas, type Parsha, type QuizPart, type Question } from "../quizData";
import { summariesByParsha } from "../quizData/summaries";
import { type Player, getPlayerBestScores } from "../lib/supabase";
import { getXpProgress } from "../lib/levels";
import { playSound, preloadSounds } from "../lib/sounds";
import Results from "./Results";
import StudyScreen from "./StudyScreen";
import PlayerSelect from "./PlayerSelect";

// Encouraging messages that rotate — never boring
const CORRECT_MESSAGES = [
  "נכון!",
  "מצוין!",
  "יופי!",
  "נהדר!",
  "בול!",
  "כל הכבוד!",
  "בדיוק!",
  "מושלם!",
];
const STREAK_MESSAGES = [
  "אש! 🔥🔥",
  "מדהים! 🔥🔥🔥",
  "בלתי ניתן לעצירה! 🔥",
  "רצף מטורף! 🔥🔥",
];
const WRONG_MESSAGES = [
  "לא נכון, אבל לומדים מטעויות!",
  "אופס! בפעם הבאה תצליחו",
  "כמעט! נסו שוב בהמשך",
  "לא הפעם — השאלה תחזור",
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Build a final quiz from all parts — different every time
function buildFinalQuiz(count: number, parts: QuizPart[]): QuizPart {
  const allQuestions: Question[] = [];
  for (const part of parts) {
    for (const q of part.questions) {
      allQuestions.push(q);
    }
  }
  const selected = shuffle(allQuestions).slice(0, count);
  const questions = selected.map((q, i) => ({ ...q, id: i + 1 }));
  return {
    partId: 6,
    partTitle: "חידון אלופים",
    partSubtitle: "Final Challenge",
    questions,
  };
}

export default function Quiz() {
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [bestScores, setBestScores] = useState<Record<number, { score: number; total: number }>>({});
  const [selectedParsha, setSelectedParsha] = useState<Parsha | null>(null);
  const [selectedPart, setSelectedPart] = useState<QuizPart | null>(null);
  const [showStudy, setShowStudy] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);

  // Mastery-based quiz state
  const [questionQueue, setQuestionQueue] = useState<number[]>([]);
  const [queuePosition, setQueuePosition] = useState(0);
  const [masteredSet, setMasteredSet] = useState<Set<number>>(new Set());
  const [firstTryCorrect, setFirstTryCorrect] = useState(0);
  const retriedQuestions = useRef<Set<number>>(new Set());
  const [totalAttempts, setTotalAttempts] = useState(0);

  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [xp, setXp] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [finished, setFinished] = useState(false);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [showStreakBonus, setShowStreakBonus] = useState(false);
  const [floatingXp, setFloatingXp] = useState<number | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [feedbackEmoji, setFeedbackEmoji] = useState("");
  const [shuffledChoices, setShuffledChoices] = useState<
    { text: string; originalIndex: number }[]
  >([]);
  const [questionKey, setQuestionKey] = useState(0);
  const quizStartTimeRef = useRef<number>(0);

  const questions = selectedPart?.questions ?? [];
  const total = questions.length;
  const currentQuestionIndex = questionQueue[queuePosition] ?? 0;
  const question = quizStarted ? questions[currentQuestionIndex] : undefined;
  const masteredCount = masteredSet.size;
  const progress = total > 0 ? (masteredCount / total) * 100 : 0;

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
    setQuestionKey((k) => k + 1);
  }, [question]);

  // Initialize queue and start quiz
  const startQuiz = useCallback(() => {
    const indices = Array.from({ length: questions.length }, (_, i) => i);
    const shuffled = shuffle(indices);
    setQuestionQueue(shuffled);
    setQueuePosition(0);
    setMasteredSet(new Set());
    setFirstTryCorrect(0);
    retriedQuestions.current = new Set();
    setTotalAttempts(0);
    setSelected(null);
    setScore(0);
    setXp(0);
    setAnswered(false);
    setFinished(false);
    setStreak(0);
    setMaxStreak(0);
    setShowStreakBonus(false);
    setQuizStarted(true);
    setShowStudy(false);
    quizStartTimeRef.current = Date.now();
    playSound("start");
  }, [questions.length]);

  const handleSelect = useCallback(
    (originalIndex: number) => {
      if (answered) return;
      setSelected(originalIndex);
      setAnswered(true);
      setTotalAttempts((a) => a + 1);

      if (originalIndex === question!.correctIndex) {
        const newStreak = streak + 1;
        const isFirstTry = !retriedQuestions.current.has(currentQuestionIndex);
        const streakBonus = newStreak >= 3 ? 10 : newStreak >= 2 ? 5 : 0;
        const earned = (isFirstTry ? 10 : 5) + streakBonus;

        setScore((s) => s + 1);
        setXp((x) => x + earned);
        setStreak(newStreak);
        setMaxStreak((m) => Math.max(m, newStreak));

        // Track mastery
        setMasteredSet((prev) => {
          const next = new Set(prev);
          next.add(currentQuestionIndex);
          return next;
        });

        if (isFirstTry) {
          setFirstTryCorrect((f) => f + 1);
        }

        // Floating XP animation
        setFloatingXp(earned);
        setTimeout(() => setFloatingXp(null), 900);

        // Varied feedback
        if (newStreak >= 3) {
          setFeedbackMsg(pickRandom(STREAK_MESSAGES));
          setFeedbackEmoji("🎉");
          playSound("streak");
        } else {
          setFeedbackMsg(pickRandom(CORRECT_MESSAGES));
          setFeedbackEmoji("🎉");
          playSound("correct");
        }

        if (streakBonus > 0) {
          setShowStreakBonus(true);
          setTimeout(() => setShowStreakBonus(false), 1200);
        }
      } else {
        // Wrong answer — requeue question for later, no sound
        setStreak(0);
        retriedQuestions.current.add(currentQuestionIndex);

        setQuestionQueue((prev) => {
          const newQueue = [...prev];
          const insertAt = Math.min(
            queuePosition + 3 + Math.floor(Math.random() * 3),
            newQueue.length
          );
          newQueue.splice(insertAt, 0, currentQuestionIndex);
          return newQueue;
        });

        setFeedbackMsg(pickRandom(WRONG_MESSAGES));
        setFeedbackEmoji("📖");
      }
    },
    [answered, question, streak, currentQuestionIndex, queuePosition]
  );

  const handleNext = useCallback(() => {
    if (masteredCount >= total) {
      setFinished(true);
      playSound("complete");
    } else {
      setQueuePosition((p) => p + 1);
      setSelected(null);
      setAnswered(false);
    }
  }, [masteredCount, total]);

  const resetQuiz = useCallback(() => {
    setQuestionQueue([]);
    setQueuePosition(0);
    setMasteredSet(new Set());
    setFirstTryCorrect(0);
    retriedQuestions.current = new Set();
    setTotalAttempts(0);
    setSelected(null);
    setScore(0);
    setXp(0);
    setAnswered(false);
    setFinished(false);
    setStreak(0);
    setMaxStreak(0);
    setShowStreakBonus(false);
    setQuizStarted(false);
    setShowStudy(false);
  }, []);

  // ——— SCREENS ———

  // Player Selection
  if (!currentPlayer) {
    return <PlayerSelect onSelectPlayer={(p) => setCurrentPlayer(p)} />;
  }

  // Parsha Selection
  if (!selectedParsha) {
    const xpInfo = getXpProgress(currentPlayer.total_xp);

    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-10" dir="rtl">
        <div className="max-w-lg w-full text-center">
          {/* Player header */}
          <div className="flex items-center justify-between mb-6 bg-gray-50 rounded-2xl p-4 border-2 border-duo-gray animate-fade-in-up">
            <div className="flex items-center gap-3 text-right">
              <span className="text-3xl animate-bounce-in">{currentPlayer.avatar_emoji}</span>
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
            <div className="mb-6 bg-duo-gold/10 rounded-2xl p-4 border-2 border-duo-gold/30 animate-fade-in-up" style={{ animationDelay: "0.05s" }}>
              <div className="flex justify-between text-sm font-bold mb-1">
                <span className="text-duo-gold">{xpInfo.current.emoji} רמה {xpInfo.current.level}</span>
                <span className="text-duo-gray-dark">{xpInfo.next.emoji} רמה {xpInfo.next.level}</span>
              </div>
              <div className="h-3 bg-duo-gray rounded-full overflow-hidden">
                <div
                  className="h-full bg-duo-gold rounded-full transition-all duration-1000"
                  style={{ width: `${xpInfo.progressPct}%` }}
                />
              </div>
              <p className="text-xs text-duo-gray-dark mt-1">
                {xpInfo.xpNeeded - xpInfo.xpInLevel} XP עד לרמה הבאה
              </p>
            </div>
          )}

          <div className="text-6xl mb-3 animate-bounce-in">📖</div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-2 animate-fade-in-up">
            חידון רש&quot;י
          </h1>
          <p className="text-base text-duo-gray-dark mb-8">
            בחרו פרשה להתחיל
          </p>

          <div className="grid grid-cols-1 gap-3">
            {parshas.map((p, idx) => (
              <button
                key={p.slug}
                onClick={() => setSelectedParsha(p)}
                className="w-full text-right p-5 rounded-2xl border-2 border-b-4 border-duo-gray bg-white hover:border-duo-green hover:bg-duo-green-light active:border-b-2 active:mt-[2px] transition-all cursor-pointer group animate-fade-in-up"
                style={{ animationDelay: `${0.05 * (idx + 1)}s` }}
              >
                <div className="flex items-center gap-4">
                  <span className="w-14 h-14 rounded-xl bg-duo-blue text-white flex items-center justify-center text-3xl font-bold shrink-0 group-hover:scale-110 transition-transform">
                    {p.emoji}
                  </span>
                  <div className="flex-1">
                    <p className="text-xl font-bold text-foreground">פרשת {p.name}</p>
                    <p className="text-sm text-duo-gray-dark">{p.nameEn} • {p.parts.reduce((sum, pt) => sum + pt.questions.length, 0)} שאלות</p>
                  </div>
                  <span className="text-duo-gray-dark text-2xl group-hover:translate-x-[-4px] transition-transform">←</span>
                </div>
              </button>
            ))}
          </div>

          {/* Gemara Flashcards link */}
          <a
            href="/gemara"
            className="mt-6 w-full block p-5 rounded-2xl border-2 border-b-4 border-[#1a3a5c] bg-gradient-to-r from-[#1a3a5c] to-[#0d1f33] text-white hover:opacity-90 active:border-b-2 active:mt-[2px] transition-all cursor-pointer animate-fade-in-up"
            style={{ animationDelay: "0.25s" }}
          >
            <div className="flex items-center gap-4" dir="ltr">
              <span className="w-14 h-14 rounded-xl bg-white/15 flex items-center justify-center text-2xl font-bold shrink-0">
                &#x1F0CF;
              </span>
              <div className="flex-1 text-left">
                <p className="text-xl font-bold">Gemara Flashcards</p>
                <p className="text-sm text-white/70">Yevamos &middot; Zichru Simanim</p>
              </div>
              <span className="text-white/70 text-2xl">&rarr;</span>
            </div>
          </a>

          {/* Stats footer */}
          {currentPlayer.quizzes_completed > 0 && (
            <div className="mt-6 flex justify-center gap-6 text-sm text-duo-gray-dark font-semibold animate-fade-in">
              <span>🏆 {currentPlayer.quizzes_completed} חידונים</span>
              <span>🔥 רצף שיא: {currentPlayer.best_streak}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Part Selection
  if (!selectedPart) {
    const xpInfo = getXpProgress(currentPlayer.total_xp);
    const allPartsCompleted = selectedParsha.parts.every((p) => bestScores[p.partId]);

    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-10" dir="rtl">
        <div className="max-w-lg w-full text-center">
          {/* Player header */}
          <div className="flex items-center justify-between mb-6 bg-gray-50 rounded-2xl p-4 border-2 border-duo-gray animate-fade-in-up">
            <div className="flex items-center gap-3 text-right">
              <span className="text-3xl animate-bounce-in">{currentPlayer.avatar_emoji}</span>
              <div>
                <p className="text-lg font-bold text-foreground">{currentPlayer.name}</p>
                <p className="text-sm text-duo-gray-dark">
                  {xpInfo.current.emoji} {xpInfo.current.title} • ⚡ {currentPlayer.total_xp} XP
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedParsha(null)}
              className="text-sm text-duo-gray-dark hover:text-foreground font-semibold cursor-pointer"
            >
              ← החלף פרשה
            </button>
          </div>

          <div className="text-6xl mb-3 animate-bounce-in">📖</div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-2 animate-fade-in-up">
            חידון רש&quot;י
          </h1>
          <p className="text-xl text-duo-gray-dark font-semibold mb-2">פרשת {selectedParsha.name}</p>
          <p className="text-base text-duo-gray-dark mb-8">
            בחרו חלק להתחיל • שלטו בכל השאלות
          </p>

          <div className="grid grid-cols-1 gap-3">
            {selectedParsha.parts.map((part, idx) => {
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
                  className="w-full text-right p-5 rounded-2xl border-2 border-b-4 border-duo-gray bg-white hover:border-duo-green hover:bg-duo-green-light active:border-b-2 active:mt-[2px] transition-all cursor-pointer group animate-fade-in-up"
                  style={{ animationDelay: `${0.05 * (idx + 1)}s` }}
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`w-12 h-12 rounded-xl text-white flex items-center justify-center text-xl font-bold shrink-0 group-hover:scale-110 transition-transform ${
                        bestPct === 100
                          ? "bg-duo-gold"
                          : bestPct && bestPct >= 70
                          ? "bg-duo-green"
                          : "bg-duo-blue"
                      }`}
                    >
                      {bestPct === 100 ? "👑" : part.partId}
                    </span>
                    <div className="flex-1">
                      <p className="text-lg font-bold text-foreground">{part.partTitle}</p>
                      <p className="text-sm text-duo-gray-dark">{part.partSubtitle}</p>
                      {best && (
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-1.5 bg-duo-gray rounded-full overflow-hidden max-w-[100px]">
                            <div
                              className={`h-full rounded-full ${bestPct === 100 ? "bg-duo-gold" : "bg-duo-green"}`}
                              style={{ width: `${bestPct}%` }}
                            />
                          </div>
                          <span className={`text-xs font-bold ${bestPct === 100 ? "text-duo-gold" : "text-duo-green"}`}>
                            {best.score}/{best.total}
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="text-duo-gray-dark text-2xl group-hover:translate-x-[-4px] transition-transform">←</span>
                  </div>
                </button>
              );
            })}

            {/* Final Challenge — unlocks after all 5 parts completed */}
            {allPartsCompleted && (
              <button
                onClick={() => {
                  const finalQuiz = buildFinalQuiz(30, selectedParsha.parts);
                  setSelectedPart(finalQuiz);
                  setShowStudy(false);
                  setQuizStarted(false);
                }}
                className="w-full text-right p-5 rounded-2xl border-2 border-b-4 border-duo-gold bg-duo-gold/10 hover:bg-duo-gold/20 hover:border-duo-gold active:border-b-2 active:mt-[2px] transition-all cursor-pointer group animate-fade-in-up mt-4"
                style={{ animationDelay: `${0.05 * 7}s` }}
              >
                <div className="flex items-center gap-4">
                  <span className="w-12 h-12 rounded-xl bg-duo-gold text-white flex items-center justify-center text-xl font-bold shrink-0 group-hover:scale-110 transition-transform animate-pulse-slow">
                    🏆
                  </span>
                  <div className="flex-1">
                    <p className="text-lg font-bold text-foreground">חידון אלופים</p>
                    <p className="text-sm text-duo-gray-dark">Final Challenge — 30 שאלות מכל החלקים</p>
                  </div>
                  <span className="text-duo-gold text-2xl group-hover:translate-x-[-4px] transition-transform">←</span>
                </div>
              </button>
            )}
          </div>

          {/* Stats footer */}
          {currentPlayer.quizzes_completed > 0 && (
            <div className="mt-6 flex justify-center gap-6 text-sm text-duo-gray-dark font-semibold animate-fade-in">
              <span>🏆 {currentPlayer.quizzes_completed} חידונים</span>
              <span>🔥 רצף שיא: {currentPlayer.best_streak}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Study Screen (regular parts 1-5)
  if (showStudy && !quizStarted) {
    const parshaSummaries = summariesByParsha[selectedParsha.slug] ?? [];
    const summary = parshaSummaries.find((s) => s.partId === selectedPart.partId);
    if (summary) {
      return (
        <StudyScreen
          summary={summary}
          parshaSlug={selectedParsha.slug}
          partTitle={selectedPart.partTitle}
          partSubtitle={selectedPart.partSubtitle}
          onStartQuiz={startQuiz}
          onBack={() => {
            setSelectedPart(null);
            setShowStudy(false);
          }}
        />
      );
    }
  }

  // Final Quiz Start Screen
  if (!quizStarted && selectedPart.partId === 6) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-10" dir="rtl">
        <div className="max-w-md w-full text-center animate-pop-in">
          <div className="text-8xl mb-4 animate-bounce-in">🏆</div>
          <h1 className="text-4xl font-extrabold text-foreground mb-2">חידון אלופים</h1>
          <p className="text-lg text-duo-gray-dark font-semibold mb-2">30 שאלות מכל חלקי הפרשה</p>
          <p className="text-sm text-duo-gray-dark mb-8">שאלות שונות בכל פעם! שלטו בכולן כדי לסיים</p>
          <button
            onClick={startQuiz}
            className="w-full py-4 rounded-2xl border-2 border-b-4 border-duo-gold bg-duo-gold text-white font-bold text-lg mb-3 transition-all hover:brightness-110 active:border-b-2 active:mt-[2px] cursor-pointer"
          >
            🚀 יאללה מתחילים!
          </button>
          <button
            onClick={() => setSelectedPart(null)}
            className="w-full py-4 rounded-2xl border-2 border-b-4 border-duo-gray text-foreground font-bold text-lg transition-all hover:bg-gray-50 active:border-b-2 active:mt-[2px] cursor-pointer"
          >
            ← חזרה
          </button>
        </div>
      </div>
    );
  }

  // Results Screen
  if (finished) {
    return (
      <Results
        score={firstTryCorrect}
        total={total}
        xp={xp}
        parsha={selectedParsha.name}
        partTitle={selectedPart.partTitle}
        partId={selectedPart.partId}
        maxStreak={maxStreak}
        durationSeconds={Math.round((Date.now() - quizStartTimeRef.current) / 1000)}
        player={currentPlayer}
        totalAttempts={totalAttempts}
        onRestart={startQuiz}
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

  // Guard — quiz not started or no question
  if (!quizStarted || !question) return null;

  const isCorrect = selected === question.correctIndex;
  const isRetry = retriedQuestions.current.has(currentQuestionIndex);
  const staggerClasses = ["animate-stagger-1", "animate-stagger-2", "animate-stagger-3", "animate-stagger-4"];

  return (
    <div className="flex flex-col min-h-screen bg-white" dir="rtl">
      {/* Top Bar */}
      <div className="sticky top-0 bg-white z-10 px-4 pt-4 pb-2 border-b border-gray-100 shadow-sm">
        <div className="max-w-2xl mx-auto">
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
            <span className="text-xs text-duo-gray-dark font-semibold">{selectedPart.partTitle}</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Mastery counter */}
            <div className="flex items-center gap-1 shrink-0 text-sm font-bold text-duo-green">
              <span>✓</span>
              <span>{masteredCount}/{total}</span>
            </div>

            {/* Progress Bar — mastery-based */}
            <div className="flex-1 h-4 bg-duo-gray rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out relative ${
                  progress > 0 ? "progress-shimmer" : "bg-duo-green"
                }`}
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
                <span className="absolute -top-5 right-0 text-xs text-duo-gold font-bold animate-float-up">
                  +{streak >= 3 ? 10 : 5}
                </span>
              )}
              {floatingXp && (
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-sm text-duo-gold font-extrabold animate-float-up">
                  +{floatingXp}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Question Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 max-w-2xl mx-auto w-full">
        {/* Mastery progress text */}
        <div className="text-duo-gray-dark text-sm font-semibold mb-2 tracking-wide animate-fade-in">
          שלטתם ב-{masteredCount} מתוך {total} שאלות
        </div>

        {/* Streak indicator */}
        {streak >= 2 && !answered && (
          <div className="text-duo-gold text-sm font-bold mb-2 animate-bounce-in flex items-center gap-1">
            <span className="animate-pulse-slow">🔥</span>
            רצף של {streak}! {streak >= 3 ? "+10" : "+5"} בונוס XP
          </div>
        )}

        {/* Retry indicator */}
        {isRetry && !answered && (
          <div className="text-duo-blue text-xs font-semibold mb-2 animate-fade-in">
            🔄 שאלה חוזרת — הפעם תצליחו!
          </div>
        )}

        {/* Question */}
        <h2
          key={`q-${questionKey}`}
          className="text-2xl md:text-3xl font-bold text-center text-foreground mb-8 leading-relaxed animate-fade-in-up"
        >
          {question.question}
        </h2>

        {/* Choices */}
        <div className="grid grid-cols-1 gap-3 w-full">
          {shuffledChoices.length > 0 &&
            shuffledChoices.map((choice, displayIndex) => {
              const i = choice.originalIndex;
              let btnClass =
                "w-full text-right p-5 rounded-2xl border-2 border-b-4 text-lg md:text-xl font-semibold transition-all duration-150 cursor-pointer ";

              if (!answered) {
                btnClass +=
                  "border-duo-gray hover:border-duo-green hover:bg-duo-green-light active:border-b-2 active:mt-[2px] bg-white text-foreground";
              } else if (i === question.correctIndex) {
                btnClass += "border-duo-green bg-duo-green-light text-duo-green-dark animate-correct-flash";
              } else if (i === selected && !isCorrect) {
                btnClass += "border-duo-red bg-duo-red-light text-duo-red animate-shake";
              } else {
                btnClass += "border-duo-gray bg-gray-50 text-duo-gray-dark opacity-60";
              }

              const letterLabels = ["א", "ב", "ג", "ד"];

              return (
                <button
                  key={`${questionKey}-${i}`}
                  onClick={() => handleSelect(i)}
                  disabled={answered}
                  className={`${btnClass} ${staggerClasses[displayIndex] || ""}`}
                >
                  <span className="inline-flex items-center gap-3">
                    <span
                      className={`w-9 h-9 rounded-lg flex items-center justify-center text-base font-bold shrink-0 transition-colors ${
                        answered && i === question.correctIndex
                          ? "bg-duo-green text-white"
                          : answered && i === selected && !isCorrect
                          ? "bg-duo-red text-white"
                          : "bg-gray-100 text-duo-gray-dark"
                      }`}
                    >
                      {answered && i === question.correctIndex
                        ? "✓"
                        : answered && i === selected && !isCorrect
                        ? "✕"
                        : letterLabels[displayIndex]}
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
        <div className={`sticky bottom-0 animate-slide-up ${isCorrect ? "bg-duo-green-light" : "bg-duo-red-light"}`}>
          <div className="max-w-2xl mx-auto p-5 md:p-6">
            <div className="flex items-start gap-3 mb-3">
              <span className="text-3xl animate-bounce-in">{feedbackEmoji}</span>
              <div>
                <h3 className={`text-xl font-bold ${isCorrect ? "text-duo-green-dark" : "text-duo-red"}`}>
                  {feedbackMsg}
                </h3>
                {!isCorrect && (
                  <p className="text-duo-red text-sm font-semibold mt-0.5">
                    התשובה הנכונה: {question.choices[question.correctIndex]}
                  </p>
                )}
                {isCorrect && (
                  <p className="text-duo-green-dark text-sm font-semibold mt-0.5">
                    +{(isRetry ? 5 : 10) + (streak >= 3 ? 10 : streak >= 2 ? 5 : 0)} XP
                  </p>
                )}
              </div>
            </div>

            {/* Rashi Insight */}
            <div className="bg-white/60 rounded-xl p-4 mb-4">
              <p className="text-sm font-semibold text-duo-gray-dark tracking-wide mb-1">📖 פירוש רש&quot;י</p>
              <p className="text-base text-foreground leading-relaxed">{question.rashiInsight}</p>
            </div>

            <button
              onClick={handleNext}
              className={`w-full py-4 rounded-2xl border-2 border-b-4 text-white font-bold text-lg transition-all active:border-b-2 active:mt-[2px] cursor-pointer ${
                isCorrect
                  ? "bg-duo-green border-duo-green-dark hover:bg-duo-green-dark"
                  : "bg-duo-red border-[#e04343] hover:brightness-90"
              }`}
            >
              {masteredCount >= total ? "🎯 סיימתם! כל הכבוד!" : !isCorrect ? "הבנתי, המשך →" : "המשך →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
