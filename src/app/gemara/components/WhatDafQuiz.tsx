"use client";

import { useState, useCallback, useRef } from "react";
import type { Daf } from "../data/yevamos";

interface WhatDafQuizProps {
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

interface WhatDafQuestion {
  daf: Daf;
  pointHebrew: string;
  pointEnglish: string;
  choices: string[];
  correctIndex: number;
}

function generateQuestions(dafim: Daf[], allDafim: Daf[]): WhatDafQuestion[] {
  const questions: WhatDafQuestion[] = [];

  for (const daf of dafim) {
    const validPoints = daf.points.filter((p) => p.hebrew || p.english);
    if (validPoints.length === 0) continue;

    // Pick one random point from this daf
    const point = pickRandom(validPoints);
    const label = (d: Daf) => `Daf ${d.dafHebrew} — ${d.siman}`;
    const correct = label(daf);
    const distractors = shuffle(allDafim.filter((d) => d.dafNumber !== daf.dafNumber))
      .slice(0, 3)
      .map(label);
    const choices = shuffle([correct, ...distractors]);

    questions.push({
      daf,
      pointHebrew: point.hebrew,
      pointEnglish: point.english,
      choices,
      correctIndex: choices.indexOf(correct),
    });
  }

  return shuffle(questions);
}

const CORRECT_MSGS = ["Correct!", "Nailed it!", "Yes!", "Exactly!", "Perfect!"];
const WRONG_MSGS = ["Not quite!", "Oops!", "That's not it!", "Try to remember..."];

export default function WhatDafQuiz({ dafim, allDafim, title, onBack }: WhatDafQuizProps) {
  const [questions] = useState(() => generateQuestions(dafim, allDafim));
  const [queue, setQueue] = useState<number[]>(() => questions.map((_, i) => i));
  const [queuePos, setQueuePos] = useState(0);
  const [mastered, setMastered] = useState<Set<number>>(new Set());
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [firstTryCorrect, setFirstTryCorrect] = useState(0);
  const [finished, setFinished] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const retriedSet = useRef<Set<number>>(new Set());

  const total = questions.length;
  const progress = total > 0 ? (mastered.size / total) * 100 : 0;
  const currentQIdx = queue[queuePos];
  const question = questions[currentQIdx];

  const handleChoice = useCallback(
    (choiceIdx: number) => {
      if (showResult) return;
      setSelected(choiceIdx);
      setShowResult(true);

      const isCorrect = choiceIdx === question.correctIndex;

      if (isCorrect) {
        const newStreak = streak + 1;
        setStreak(newStreak);
        if (newStreak > maxStreak) setMaxStreak(newStreak);
        setFeedbackMsg(pickRandom(CORRECT_MSGS));
        const newMastered = new Set(mastered);
        newMastered.add(currentQIdx);
        setMastered(newMastered);
        if (!retriedSet.current.has(currentQIdx)) {
          setFirstTryCorrect((c) => c + 1);
        }
        if (newMastered.size >= total) {
          setTimeout(() => setFinished(true), 1200);
        }
      } else {
        setStreak(0);
        setFeedbackMsg(pickRandom(WRONG_MSGS));
        retriedSet.current.add(currentQIdx);
        setQueue((prev) => {
          const newQ = [...prev];
          const reinsertPos = Math.min(queuePos + 3 + Math.floor(Math.random() * 4), newQ.length);
          newQ.splice(reinsertPos, 0, currentQIdx);
          return newQ;
        });
      }
    },
    [showResult, question, streak, maxStreak, mastered, currentQIdx, total, queuePos]
  );

  const handleNext = useCallback(() => {
    setSelected(null);
    setShowResult(false);
    setQueuePos((p) => p + 1);
  }, []);

  // Finished
  if (finished) {
    const pct = total > 0 ? Math.round((firstTryCorrect / total) * 100) : 0;
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
        <div className="text-center animate-bounce-in mb-6">
          <p className="text-6xl mb-3">{pct >= 90 ? "\u{1F31F}" : pct >= 70 ? "\u{1F525}" : "\u{1F4AA}"}</p>
          <h2 className="text-2xl font-bold text-gray-800">Quiz Complete!</h2>
          <p className="text-gray-500 mt-1">{title}</p>
        </div>
        <div className="w-full max-w-sm space-y-3 animate-fade-in-up">
          <div className="flex items-center justify-between p-4 bg-duo-green-light rounded-xl">
            <span className="font-bold text-duo-green-dark">First Try</span>
            <span className="text-2xl font-bold text-duo-green-dark">{firstTryCorrect}/{total}</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-200">
            <span className="font-bold text-amber-700">Best Streak</span>
            <span className="text-2xl font-bold text-amber-700">{maxStreak}</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
            <span className="font-bold text-gray-600">Score</span>
            <span className="text-2xl font-bold text-gray-800">{pct}%</span>
          </div>
        </div>
        <div className="flex gap-3 w-full max-w-sm mt-6">
          <button onClick={onBack} className="flex-1 py-3 rounded-xl border-2 border-b-4 border-duo-gray bg-white text-gray-600 font-bold active:border-b-2 active:mt-[2px]">Back</button>
          <button onClick={() => window.location.reload()} className="flex-1 py-3 rounded-xl border-2 border-b-4 border-duo-green bg-duo-green text-white font-bold active:border-b-2 active:mt-[2px]">Try Again</button>
        </div>
      </div>
    );
  }

  if (!question) return null;
  const isCorrect = selected !== null && selected === question.correctIndex;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={onBack} className="text-gray-500 hover:text-gray-800 text-2xl font-light">&larr;</button>
          <span className="text-sm text-gray-500 font-medium">{mastered.size}/{total} mastered</span>
          <div className="flex-1" />
          {streak >= 2 && <span className="text-sm font-bold text-duo-gold animate-pop-in">{streak} streak</span>}
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500 progress-shimmer" style={{ width: `${progress}%` }} />
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col px-4 py-6 max-w-lg mx-auto w-full">
        <span className="text-xs font-semibold text-white bg-[#1a3a5c] rounded-full px-3 py-1 mb-4 self-start">What Daf Is This?</span>

        {/* Topic card */}
        <div className="w-full p-6 rounded-2xl bg-white border-2 border-gray-200 mb-6 animate-fade-in-up">
          {question.pointHebrew && (
            <p className="text-xl font-bold text-gray-800 leading-relaxed text-center mb-2" dir="rtl">
              {question.pointHebrew}
            </p>
          )}
          {question.pointEnglish && (
            <p className="text-base text-gray-500 text-center leading-relaxed">
              {question.pointEnglish}
            </p>
          )}
        </div>

        <p className="text-sm text-gray-400 text-center mb-4">Which daf discusses this topic?</p>

        {/* Choices */}
        <div className="space-y-3 flex-1">
          {question.choices.map((choice, i) => {
            let borderColor = "border-duo-gray";
            let bgColor = "bg-white";
            let textColor = "text-gray-800";

            if (showResult) {
              if (i === question.correctIndex) {
                borderColor = "border-duo-green";
                bgColor = "bg-duo-green-light";
                textColor = "text-duo-green-dark";
              } else if (i === selected && !isCorrect) {
                borderColor = "border-duo-red";
                bgColor = "bg-duo-red-light";
                textColor = "text-duo-red";
              }
            }

            return (
              <button
                key={i}
                onClick={() => handleChoice(i)}
                disabled={showResult}
                className={`w-full text-left p-4 rounded-xl border-2 border-b-4 ${borderColor} ${bgColor} ${textColor} font-bold transition-all ${
                  !showResult ? "active:border-b-2 active:mt-[2px] hover:border-[#1a3a5c]" : ""
                } animate-stagger-${i + 1}`}
              >
                {choice}
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {showResult && (
          <div className={`mt-4 p-4 rounded-xl animate-slide-up ${isCorrect ? "bg-duo-green-light border-2 border-duo-green" : "bg-duo-red-light border-2 border-duo-red"}`}>
            <p className={`font-bold text-lg ${isCorrect ? "text-duo-green-dark" : "text-duo-red"}`}>{feedbackMsg}</p>
            {!isCorrect && (
              <p className="text-sm mt-1 text-duo-red/80">
                This topic is from Daf {question.daf.dafHebrew} &mdash; {question.daf.siman}
              </p>
            )}
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
