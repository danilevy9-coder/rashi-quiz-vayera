"use client";

import { useState, useMemo, useCallback } from "react";
import type { Daf } from "../data/yevamos";

interface LearnModeProps {
  dafim: Daf[];
  allDafim: Daf[];
  title: string;
  onBack: () => void;
  imageFolder: string;
  masechtaId: string;
}

const LESSON_SIZE = 3;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function learnedKey(masechtaId: string) {
  return `gemara-learned-${masechtaId}`;
}

function loadLearned(masechtaId: string): Set<number> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(learnedKey(masechtaId));
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveLearned(masechtaId: string, learned: Set<number>) {
  try {
    localStorage.setItem(learnedKey(masechtaId), JSON.stringify([...learned]));
  } catch {}
}

// ── Teaching steps ──────────────────────────────────────────────

type TeachKind = "hook" | "story" | "points" | "check";
interface TeachStep {
  kind: TeachKind;
  daf: Daf;
}

interface QuizQuestion {
  prompt: string;
  promptSub?: string;
  options: string[];
  correct: string;
  rtlOptions?: boolean;
  isRetry?: boolean;
}

function buildCheckQuestion(daf: Daf, lessonDafim: Daf[], allDafim: Daf[]): QuizQuestion {
  // Quick 2-choice check right after teaching a daf
  if (Math.random() < 0.5 || daf.points.length === 0) {
    const distractor = shuffle(allDafim.filter((d) => d.dafNumber !== daf.dafNumber))[0];
    return {
      prompt: `Quick check: what's the siman for Daf ${daf.dafHebrew}?`,
      options: shuffle([`${daf.siman} (${daf.simanHebrew})`, `${distractor.siman} (${distractor.simanHebrew})`]),
      correct: `${daf.siman} (${daf.simanHebrew})`,
    };
  }
  const correctPoint = daf.points[Math.floor(Math.random() * daf.points.length)];
  const otherDaf = shuffle(allDafim.filter((d) => d.dafNumber !== daf.dafNumber && d.points.length > 0))[0];
  const wrongPoint = otherDaf.points[Math.floor(Math.random() * otherDaf.points.length)];
  return {
    prompt: `Quick check: which of these is on Daf ${daf.dafHebrew}?`,
    promptSub: `${daf.siman} (${daf.simanHebrew})`,
    options: shuffle([correctPoint.english, wrongPoint.english]),
    correct: correctPoint.english,
  };
}

function buildMiniQuiz(lessonDafim: Daf[], allDafim: Daf[]): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  const others = (exclude: Daf) => allDafim.filter((d) => d.dafNumber !== exclude.dafNumber);

  for (const daf of lessonDafim) {
    // daf → siman
    const simanDistractors = shuffle(others(daf)).slice(0, 3).map((d) => d.siman);
    questions.push({
      prompt: `What's the siman for Daf ${daf.dafHebrew}?`,
      options: shuffle([daf.siman, ...simanDistractors]),
      correct: daf.siman,
    });

    // alternate: siman → daf, or point → daf
    if (Math.random() < 0.5 || daf.points.length === 0) {
      const dafDistractors = shuffle(others(daf)).slice(0, 3).map((d) => `Daf ${d.dafHebrew}`);
      questions.push({
        prompt: `Which daf is "${daf.siman}"?`,
        promptSub: daf.simanHebrew,
        options: shuffle([`Daf ${daf.dafHebrew}`, ...dafDistractors]),
        correct: `Daf ${daf.dafHebrew}`,
      });
    } else {
      const point = daf.points[Math.floor(Math.random() * daf.points.length)];
      const dafDistractors = shuffle(lessonDafim.filter((d) => d.dafNumber !== daf.dafNumber))
        .map((d) => `Daf ${d.dafHebrew} — ${d.siman}`);
      const extra = shuffle(others(daf))
        .filter((d) => !lessonDafim.some((l) => l.dafNumber === d.dafNumber))
        .slice(0, 3 - dafDistractors.length)
        .map((d) => `Daf ${d.dafHebrew} — ${d.siman}`);
      questions.push({
        prompt: `Which daf teaches: "${point.english}"?`,
        options: shuffle([`Daf ${daf.dafHebrew} — ${daf.siman}`, ...dafDistractors, ...extra]),
        correct: `Daf ${daf.dafHebrew} — ${daf.siman}`,
      });
    }
  }
  return shuffle(questions);
}

// ── Component ───────────────────────────────────────────────────

export default function LearnMode({ dafim, allDafim, title, onBack, imageFolder, masechtaId }: LearnModeProps) {
  const lessons = useMemo(() => {
    const result: Daf[][] = [];
    for (let i = 0; i < dafim.length; i += LESSON_SIZE) {
      result.push(dafim.slice(i, i + LESSON_SIZE));
    }
    return result;
  }, [dafim]);

  const [learned, setLearned] = useState<Set<number>>(() => loadLearned(masechtaId));
  const [lessonIndex, setLessonIndex] = useState<number | null>(null);

  // In-lesson state
  const [stepIdx, setStepIdx] = useState(0);
  const [pointsRevealed, setPointsRevealed] = useState(0);
  const [checkSelected, setCheckSelected] = useState<string | null>(null);
  const [checkQuestion, setCheckQuestion] = useState<QuizQuestion | null>(null);
  // Mini-quiz state
  const [quizQueue, setQuizQueue] = useState<QuizQuestion[]>([]);
  const [quizPos, setQuizPos] = useState(0);
  const [quizSelected, setQuizSelected] = useState<string | null>(null);
  const [quizFirstTryCorrect, setQuizFirstTryCorrect] = useState(0);
  const [quizFirstTryTotal, setQuizFirstTryTotal] = useState(0);
  const [lessonDone, setLessonDone] = useState(false);

  const lessonDafim = useMemo(
    () => (lessonIndex !== null ? lessons[lessonIndex] : []),
    [lessons, lessonIndex]
  );

  const steps: TeachStep[] = useMemo(() => {
    const s: TeachStep[] = [];
    for (const daf of lessonDafim) {
      s.push({ kind: "hook", daf });
      s.push({ kind: "story", daf });
      s.push({ kind: "points", daf });
      s.push({ kind: "check", daf });
    }
    return s;
  }, [lessonDafim]);

  const startLesson = useCallback((idx: number) => {
    setLessonIndex(idx);
    setStepIdx(0);
    setPointsRevealed(0);
    setCheckSelected(null);
    setCheckQuestion(null);
    setQuizQueue([]);
    setQuizPos(0);
    setQuizSelected(null);
    setQuizFirstTryCorrect(0);
    setQuizFirstTryTotal(0);
    setLessonDone(false);
  }, []);

  const advanceStep = useCallback(() => {
    const next = stepIdx + 1;
    setPointsRevealed(0);
    setCheckSelected(null);
    setCheckQuestion(null);
    if (next >= steps.length) {
      // Teaching done — start the mini-quiz
      setQuizQueue(buildMiniQuiz(lessonDafim, allDafim));
      setQuizPos(0);
    }
    setStepIdx(next);
  }, [stepIdx, steps.length, lessonDafim, allDafim]);

  const finishLesson = useCallback(() => {
    const newLearned = new Set(learned);
    lessonDafim.forEach((d) => newLearned.add(d.dafNumber));
    setLearned(newLearned);
    saveLearned(masechtaId, newLearned);
    setLessonDone(true);
  }, [learned, lessonDafim, masechtaId]);

  const handleQuizAnswer = (option: string) => {
    if (quizSelected !== null) return;
    setQuizSelected(option);
    const q = quizQueue[quizPos];
    const correct = option === q.correct;
    if (!q.isRetry) {
      setQuizFirstTryTotal((t) => t + 1);
      if (correct) setQuizFirstTryCorrect((c) => c + 1);
    }
    if (!correct) {
      // Requeue 3-5 positions ahead so it comes back
      setQuizQueue((queue) => {
        const copy = [...queue];
        const insertAt = Math.min(copy.length, quizPos + 3 + Math.floor(Math.random() * 3));
        copy.splice(insertAt, 0, { ...q, isRetry: true });
        return copy;
      });
    }
  };

  const handleQuizContinue = () => {
    setQuizSelected(null);
    const next = quizPos + 1;
    if (next >= quizQueue.length) {
      finishLesson();
    } else {
      setQuizPos(next);
    }
  };

  // ── Lesson picker ──
  if (lessonIndex === null) {
    const firstUnfinished = lessons.findIndex((l) => l.some((d) => !learned.has(d.dafNumber)));
    const learnedCount = dafim.filter((d) => learned.has(d.dafNumber)).length;

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="text-gray-500 hover:text-gray-800 text-2xl font-light">
            &larr;
          </button>
          <div className="flex-1">
            <h1 className="font-bold text-lg text-gray-800">Guided Lessons</h1>
            <p className="text-xs text-gray-500">{title}</p>
          </div>
          <span className="text-sm font-bold text-duo-green">{learnedCount}/{dafim.length} learned</span>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-md mx-auto space-y-3">
            <p className="text-center text-sm text-gray-500 mb-4">
              Each lesson teaches {LESSON_SIZE} new dafim step by step, then checks you on them.
            </p>
            {lessons.map((lesson, i) => {
              const done = lesson.every((d) => learned.has(d.dafNumber));
              const isNext = i === firstUnfinished;
              return (
                <button
                  key={i}
                  onClick={() => startLesson(i)}
                  className={`w-full p-4 rounded-xl border-2 border-b-4 text-left active:border-b-2 active:mt-[2px] transition-all animate-fade-in-up ${
                    done
                      ? "border-duo-green bg-duo-green-light"
                      : isNext
                      ? "border-[#1a3a5c] bg-white"
                      : "border-gray-200 bg-white"
                  }`}
                  style={{ animationDelay: `${Math.min(i, 12) * 0.04}s`, animationFillMode: "both" }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-lg font-bold ${
                        done ? "bg-duo-green text-white" : "bg-[#1a3a5c] text-white"
                      }`}
                    >
                      {done ? "✓" : i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800">
                        Daf {lesson[0].dafHebrew}
                        {lesson.length > 1 && <> &ndash; {lesson[lesson.length - 1].dafHebrew}</>}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {done ? lesson.map((d) => d.siman).join(" · ") : `${lesson.length} dafim to learn`}
                      </p>
                    </div>
                    {isNext && !done && (
                      <span className="text-xs font-bold text-white bg-[#1a3a5c] px-2 py-1 rounded-full">START</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── Lesson complete ──
  if (lessonDone) {
    const pct = quizFirstTryTotal > 0 ? Math.round((quizFirstTryCorrect / quizFirstTryTotal) * 100) : 100;
    const hasNext = lessonIndex < lessons.length - 1;
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
        <div className="text-center animate-bounce-in mb-6">
          <p className="text-6xl mb-3">{pct >= 80 ? "\u{1F389}" : "\u{1F4AA}"}</p>
          <h2 className="text-2xl font-bold text-gray-800">Lesson Complete!</h2>
          <p className="text-gray-500 mt-1">
            You learned Daf {lessonDafim[0].dafHebrew}
            {lessonDafim.length > 1 && <> &ndash; {lessonDafim[lessonDafim.length - 1].dafHebrew}</>}
          </p>
        </div>
        <div className="w-full max-w-sm space-y-3 animate-fade-in-up">
          <div className="flex items-center justify-between p-4 bg-duo-green-light rounded-xl">
            <span className="font-bold text-duo-green-dark">Quiz Accuracy</span>
            <span className="text-2xl font-bold text-duo-green-dark">{pct}%</span>
          </div>
          {lessonDafim.map((d) => (
            <div key={d.dafNumber} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200">
              <span className="w-9 h-9 rounded-lg bg-[#1a3a5c] text-white flex items-center justify-center font-bold">
                {d.dafHebrew}
              </span>
              <span className="font-bold text-gray-700">{d.siman}</span>
              <span className="text-gray-400 text-sm mr-auto" dir="rtl">{d.simanHebrew}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-6 w-full max-w-sm">
          <button
            onClick={() => setLessonIndex(null)}
            className="flex-1 py-3 rounded-xl border-2 border-b-4 border-gray-300 bg-white text-gray-600 font-bold active:border-b-2 active:mt-[2px] transition-all"
          >
            All Lessons
          </button>
          {hasNext && (
            <button
              onClick={() => startLesson(lessonIndex + 1)}
              className="flex-1 py-3 rounded-xl border-2 border-b-4 border-duo-green bg-duo-green text-white font-bold active:border-b-2 active:mt-[2px] transition-all"
            >
              Next Lesson &rarr;
            </button>
          )}
        </div>
      </div>
    );
  }

  const inQuiz = stepIdx >= steps.length;
  const totalUnits = steps.length + (inQuiz ? quizQueue.length : lessonDafim.length * 2);
  const doneUnits = inQuiz ? steps.length + quizPos : stepIdx;
  const progress = (doneUnits / totalUnits) * 100;

  const header = (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center gap-3 mb-2">
        <button onClick={() => setLessonIndex(null)} className="text-gray-500 hover:text-gray-800 text-2xl font-light">
          &larr;
        </button>
        <span className="text-sm text-gray-500 font-medium">
          Lesson {lessonIndex + 1} · {inQuiz ? "Mini Quiz" : "Learning"}
        </span>
        <div className="flex-1" />
      </div>
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500 progress-shimmer" style={{ width: `${progress}%` }} />
      </div>
    </header>
  );

  // ── Mini quiz ──
  if (inQuiz) {
    const q = quizQueue[quizPos];
    if (!q) return null;
    const answered = quizSelected !== null;
    const wasCorrect = quizSelected === q.correct;

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {header}
        <div className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
          {q.isRetry && (
            <p className="text-center text-xs font-bold text-duo-gold mb-2 animate-pop-in">ONE MORE TRY {"\u{1F501}"}</p>
          )}
          <h2 className="text-lg font-bold text-gray-800 text-center mb-1">{q.prompt}</h2>
          {q.promptSub && (
            <p className="text-center text-gray-500 mb-4" dir="rtl">{q.promptSub}</p>
          )}
          <div className="space-y-2 mt-5">
            {q.options.map((opt) => {
              const isCorrectOpt = opt === q.correct;
              const isPicked = quizSelected === opt;
              return (
                <button
                  key={opt}
                  onClick={() => handleQuizAnswer(opt)}
                  disabled={answered}
                  className={`w-full py-3 px-4 rounded-xl border-2 border-b-4 font-bold text-left transition-all ${
                    answered && isCorrectOpt
                      ? "border-duo-green bg-duo-green-light text-duo-green-dark"
                      : answered && isPicked
                      ? "border-duo-red bg-duo-red-light text-duo-red animate-shake"
                      : answered
                      ? "border-gray-200 bg-white text-gray-400"
                      : "border-duo-gray bg-white text-gray-800 active:border-b-2 active:mt-[2px]"
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          {answered && (
            <button
              onClick={handleQuizContinue}
              className={`mt-6 w-full py-3 rounded-xl border-2 border-b-4 font-bold text-white animate-slide-up active:border-b-2 active:mt-[2px] transition-all ${
                wasCorrect ? "border-duo-green bg-duo-green" : "border-duo-red bg-duo-red"
              }`}
            >
              {wasCorrect ? "Continue →" : "Got it — it'll come back"}
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Teaching steps ──
  const step = steps[stepIdx];
  const daf = step.daf;
  const imgSrc = `/images/${imageFolder}/daf-${daf.dafNumber}.jpg`;

  if (step.kind === "hook") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {header}
        <div className="flex-1 px-4 py-6 max-w-lg mx-auto w-full flex flex-col">
          <p className="text-center text-xs font-bold text-[#1a3a5c] tracking-wide mb-3 animate-pop-in">NEW DAF</p>
          <div className="bg-white rounded-2xl border-2 border-[#1a3a5c] p-6 text-center animate-fade-in-up">
            <p className="text-sm text-gray-500 mb-1">Daf {daf.dafNumber}</p>
            <p className="text-6xl font-bold text-[#1a3a5c] mb-3" dir="rtl">{daf.dafHebrew}</p>
            <p className="text-3xl text-gray-300 mb-3">&darr;</p>
            <p className="text-3xl font-bold text-gray-800" dir="rtl">{daf.simanHebrew}</p>
            <p className="text-xl font-bold text-duo-green-dark mt-1">{daf.siman}</p>
            <p className="text-sm text-gray-500 mt-4 leading-relaxed">
              The letter for daf {daf.dafNumber} is <span className="font-bold" dir="rtl">{daf.dafHebrew}</span> &mdash; so
              the picture-word starts with it: <span className="font-bold" dir="rtl">{daf.simanHebrew}</span>.
              See the letter, remember the picture.
            </p>
          </div>
          <img
            src={imgSrc}
            alt={`Daf ${daf.dafHebrew} illustration`}
            loading="lazy"
            className="mt-4 w-full rounded-xl border border-gray-200 animate-fade-in-up"
          />
          <button
            onClick={advanceStep}
            className="mt-5 w-full py-3 rounded-xl border-2 border-b-4 border-duo-green bg-duo-green text-white font-bold active:border-b-2 active:mt-[2px] transition-all"
          >
            Got it &mdash; tell me the story &rarr;
          </button>
        </div>
      </div>
    );
  }

  if (step.kind === "story") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {header}
        <div className="flex-1 px-4 py-6 max-w-lg mx-auto w-full flex flex-col">
          <p className="text-center text-xs font-bold text-duo-purple tracking-wide mb-3">
            THE STORY &mdash; PICTURE IT IN YOUR HEAD
          </p>
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-9 h-9 rounded-lg bg-[#1a3a5c] text-white flex items-center justify-center font-bold">
              {daf.dafHebrew}
            </span>
            <span className="font-bold text-gray-800">{daf.siman}</span>
          </div>
          <img
            src={imgSrc}
            alt={`Daf ${daf.dafHebrew} illustration`}
            loading="lazy"
            className="w-full rounded-xl border border-gray-200 animate-fade-in-up"
          />
          <div className="mt-4 bg-purple-50 border-2 border-duo-purple rounded-xl p-4 animate-fade-in-up">
            <p className="text-gray-800 leading-relaxed">{daf.story}</p>
          </div>
          <p className="text-center text-xs text-gray-400 mt-3">
            Every detail in the story is one of the daf&apos;s key points. Look at the picture while you read it.
          </p>
          <button
            onClick={advanceStep}
            className="mt-5 w-full py-3 rounded-xl border-2 border-b-4 border-duo-green bg-duo-green text-white font-bold active:border-b-2 active:mt-[2px] transition-all"
          >
            Show me the 3 points &rarr;
          </button>
        </div>
      </div>
    );
  }

  if (step.kind === "points") {
    const allRevealed = pointsRevealed >= daf.points.length;
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {header}
        <div className="flex-1 px-4 py-6 max-w-lg mx-auto w-full flex flex-col">
          <p className="text-center text-xs font-bold text-duo-green-dark tracking-wide mb-3">
            THE {daf.points.length} POINTS OF DAF {daf.dafNumber}
          </p>
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="w-9 h-9 rounded-lg bg-[#1a3a5c] text-white flex items-center justify-center font-bold">
              {daf.dafHebrew}
            </span>
            <span className="font-bold text-gray-800">{daf.siman}</span>
            <span className="text-gray-400" dir="rtl">{daf.simanHebrew}</span>
          </div>
          <div className="space-y-3">
            {daf.points.map((p, i) => {
              const revealed = i < pointsRevealed;
              return (
                <div
                  key={i}
                  className={`rounded-xl border-2 p-4 transition-all ${
                    revealed ? "border-duo-green bg-white animate-pop-in" : "border-dashed border-gray-300 bg-gray-100"
                  }`}
                >
                  {revealed ? (
                    <div className="flex gap-3">
                      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-duo-green text-white flex items-center justify-center text-sm font-bold">
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-800">{p.english}</p>
                        {p.hebrew !== p.english && (
                          <p className="text-sm text-gray-500 mt-1" dir="rtl">{p.hebrew}</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-center text-gray-400 font-bold">Point {i + 1}</p>
                  )}
                </div>
              );
            })}
          </div>
          {!allRevealed ? (
            <button
              onClick={() => setPointsRevealed((n) => n + 1)}
              className="mt-5 w-full py-3 rounded-xl border-2 border-b-4 border-[#1a3a5c] bg-[#1a3a5c] text-white font-bold active:border-b-2 active:mt-[2px] transition-all"
            >
              Reveal point {pointsRevealed + 1}
            </button>
          ) : (
            <button
              onClick={advanceStep}
              className="mt-5 w-full py-3 rounded-xl border-2 border-b-4 border-duo-green bg-duo-green text-white font-bold animate-slide-up active:border-b-2 active:mt-[2px] transition-all"
            >
              Quick check &rarr;
            </button>
          )}
        </div>
      </div>
    );
  }

  // step.kind === "check"
  const q = checkQuestion ?? buildCheckQuestion(daf, lessonDafim, allDafim);
  if (!checkQuestion) setCheckQuestion(q);
  const answered = checkSelected !== null;
  const wasCorrect = checkSelected === q.correct;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {header}
      <div className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
        <h2 className="text-lg font-bold text-gray-800 text-center mb-1">{q.prompt}</h2>
        {q.promptSub && <p className="text-center text-gray-500 mb-4">{q.promptSub}</p>}
        <div className="space-y-2 mt-5">
          {q.options.map((opt) => {
            const isCorrectOpt = opt === q.correct;
            const isPicked = checkSelected === opt;
            return (
              <button
                key={opt}
                onClick={() => !answered && setCheckSelected(opt)}
                disabled={answered}
                className={`w-full py-3 px-4 rounded-xl border-2 border-b-4 font-bold text-left transition-all ${
                  answered && isCorrectOpt
                    ? "border-duo-green bg-duo-green-light text-duo-green-dark"
                    : answered && isPicked
                    ? "border-duo-red bg-duo-red-light text-duo-red animate-shake"
                    : answered
                    ? "border-gray-200 bg-white text-gray-400"
                    : "border-duo-gray bg-white text-gray-800 active:border-b-2 active:mt-[2px]"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
        {answered && (
          <>
            {!wasCorrect && (
              <p className="text-center text-sm text-gray-600 mt-4 animate-fade-in-up">
                Remember: Daf {daf.dafHebrew} = <span className="font-bold">{daf.siman}</span>{" "}
                <span dir="rtl">({daf.simanHebrew})</span>. Picture the story again!
              </p>
            )}
            <button
              onClick={advanceStep}
              className={`mt-5 w-full py-3 rounded-xl border-2 border-b-4 font-bold text-white animate-slide-up active:border-b-2 active:mt-[2px] transition-all ${
                wasCorrect ? "border-duo-green bg-duo-green" : "border-duo-red bg-duo-red"
              }`}
            >
              Continue &rarr;
            </button>
          </>
        )}
      </div>
    </div>
  );
}
