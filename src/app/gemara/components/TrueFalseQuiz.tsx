"use client";

import { useState, useCallback, useRef } from "react";
import type { Daf } from "../data/yevamos";

interface TrueFalseQuizProps {
  dafim: Daf[];
  allDafim: Daf[];
  title: string;
  onBack: () => void;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

interface TFQuestion {
  statement: string;
  isTrue: boolean;
  explanation: string;
}

function generateTFQuestions(dafim: Daf[], allDafim: Daf[]): TFQuestion[] {
  const questions: TFQuestion[] = [];

  for (const daf of dafim) {
    const validPoints = daf.points.filter((p) => p.english);
    if (validPoints.length === 0) continue;
    const point = pickRandom(validPoints);

    // True statement: correct siman + correct point
    questions.push({
      statement: `Daf ${daf.dafHebrew} (${daf.siman}) discusses: "${point.english}"`,
      isTrue: true,
      explanation: `Correct! This is one of the 3 points of Daf ${daf.dafHebrew} - ${daf.siman}`,
    });

    // False: correct siman + WRONG point from another daf
    const otherDaf = pickRandom(allDafim.filter((d) => d.dafNumber !== daf.dafNumber));
    const otherPoint = otherDaf.points.find((p) => p.english);
    if (otherPoint) {
      questions.push({
        statement: `Daf ${daf.dafHebrew} (${daf.siman}) discusses: "${otherPoint.english}"`,
        isTrue: false,
        explanation: `That topic is actually from Daf ${otherDaf.dafHebrew} (${otherDaf.siman}), not ${daf.siman}`,
      });
    }

    // False: wrong siman assigned to correct daf
    const wrongSiman = pickRandom(allDafim.filter((d) => d.dafNumber !== daf.dafNumber));
    questions.push({
      statement: `The siman for Daf ${daf.dafHebrew} is "${wrongSiman.siman}"`,
      isTrue: false,
      explanation: `The siman for Daf ${daf.dafHebrew} is "${daf.siman}", not "${wrongSiman.siman}"`,
    });

    // True: correct siman for correct daf
    questions.push({
      statement: `The siman for Daf ${daf.dafHebrew} is "${daf.siman}"`,
      isTrue: true,
      explanation: `Correct! Daf ${daf.dafHebrew} = ${daf.siman}`,
    });
  }

  return shuffle(questions);
}

export default function TrueFalseQuiz({ dafim, allDafim, title, onBack }: TrueFalseQuizProps) {
  const [questions] = useState(() => generateTFQuestions(dafim, allDafim));
  const [queue, setQueue] = useState<number[]>(() => questions.map((_, i) => i));
  const [queuePos, setQueuePos] = useState(0);
  const [mastered, setMastered] = useState<Set<number>>(new Set());
  const [answered, setAnswered] = useState<boolean | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [finished, setFinished] = useState(false);
  const retriedSet = useRef<Set<number>>(new Set());

  const total = questions.length;
  const currentQIdx = queue[queuePos];
  const question = questions[currentQIdx];
  const progress = total > 0 ? (mastered.size / total) * 100 : 0;

  const handleAnswer = useCallback(
    (answer: boolean) => {
      if (showResult) return;
      setAnswered(answer);
      setShowResult(true);

      const isCorrect = answer === question.isTrue;

      if (isCorrect) {
        setStreak((s) => s + 1);
        setMaxStreak((m) => Math.max(m, streak + 1));
        setCorrect((c) => c + 1);
        const newMastered = new Set(mastered);
        newMastered.add(currentQIdx);
        setMastered(newMastered);
        if (newMastered.size >= total) {
          setTimeout(() => setFinished(true), 1200);
        }
      } else {
        setStreak(0);
        retriedSet.current.add(currentQIdx);
        setQueue((prev) => {
          const newQ = [...prev];
          const reinsertPos = Math.min(queuePos + 3 + Math.floor(Math.random() * 4), newQ.length);
          newQ.splice(reinsertPos, 0, currentQIdx);
          return newQ;
        });
      }
    },
    [showResult, question, streak, mastered, currentQIdx, total, queuePos]
  );

  const handleNext = () => {
    setAnswered(null);
    setShowResult(false);
    setQueuePos((p) => p + 1);
  };

  if (finished) {
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
        <div className="text-center animate-bounce-in mb-6">
          <p className="text-6xl mb-3">{pct >= 90 ? "\u{1F31F}" : pct >= 70 ? "\u{1F525}" : "\u{1F4AA}"}</p>
          <h2 className="text-2xl font-bold text-gray-800">Quiz Complete!</h2>
          <p className="text-gray-500 mt-1">{title}</p>
        </div>
        <div className="w-full max-w-sm space-y-3 animate-fade-in-up">
          <div className="flex items-center justify-between p-4 bg-duo-green-light rounded-xl">
            <span className="font-bold text-duo-green-dark">Correct</span>
            <span className="text-2xl font-bold text-duo-green-dark">{correct}/{total}</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-200">
            <span className="font-bold text-amber-700">Best Streak</span>
            <span className="text-2xl font-bold text-amber-700">{maxStreak}</span>
          </div>
        </div>
        <div className="flex gap-3 w-full max-w-sm mt-6">
          <button onClick={onBack} className="flex-1 py-3 rounded-xl border-2 border-b-4 border-duo-gray bg-white text-gray-600 font-bold active:border-b-2 active:mt-[2px]">
            Back
          </button>
          <button onClick={() => window.location.reload()} className="flex-1 py-3 rounded-xl border-2 border-b-4 border-duo-green bg-duo-green text-white font-bold active:border-b-2 active:mt-[2px]">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!question) return null;
  const isCorrect = answered !== null && answered === question.isTrue;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={onBack} className="text-gray-500 hover:text-gray-800 text-2xl font-light">&larr;</button>
          <span className="text-sm text-gray-500 font-medium">{mastered.size}/{total}</span>
          <div className="flex-1" />
          {streak >= 2 && <span className="text-sm font-bold text-duo-gold animate-pop-in">{streak} streak</span>}
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500 progress-shimmer" style={{ width: `${progress}%` }} />
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 max-w-lg mx-auto w-full">
        <span className="text-xs font-semibold text-white bg-duo-purple rounded-full px-3 py-1 mb-4">True or False?</span>

        <div className="w-full p-6 rounded-2xl bg-white border-2 border-gray-200 mb-8 animate-fade-in-up">
          <p className="text-lg font-medium text-gray-800 text-center leading-relaxed">
            {question.statement}
          </p>
        </div>

        {!showResult ? (
          <div className="flex gap-4 w-full max-w-sm">
            <button
              onClick={() => handleAnswer(true)}
              className="flex-1 py-5 rounded-xl border-2 border-b-4 border-duo-green bg-duo-green-light text-duo-green-dark font-bold text-xl active:border-b-2 active:mt-[2px] transition-all"
            >
              TRUE
            </button>
            <button
              onClick={() => handleAnswer(false)}
              className="flex-1 py-5 rounded-xl border-2 border-b-4 border-duo-red bg-duo-red-light text-duo-red font-bold text-xl active:border-b-2 active:mt-[2px] transition-all"
            >
              FALSE
            </button>
          </div>
        ) : (
          <div className={`w-full p-4 rounded-xl animate-slide-up ${isCorrect ? "bg-duo-green-light border-2 border-duo-green" : "bg-duo-red-light border-2 border-duo-red"}`}>
            <p className={`font-bold text-lg ${isCorrect ? "text-duo-green-dark" : "text-duo-red"}`}>
              {isCorrect ? "Correct!" : "Wrong!"}
            </p>
            <p className={`text-sm mt-1 ${isCorrect ? "text-duo-green-dark/80" : "text-duo-red/80"}`}>
              {question.explanation}
            </p>
            <button
              onClick={handleNext}
              className={`mt-3 w-full py-3 rounded-xl font-bold text-white ${isCorrect ? "bg-duo-green" : "bg-duo-red"} active:opacity-80`}
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
