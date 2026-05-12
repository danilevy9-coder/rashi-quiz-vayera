"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { Daf } from "../data/yevamos";

interface SpeedRoundProps {
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

interface SpeedQuestion {
  prompt: string;
  choices: string[];
  correctIndex: number;
}

function generateSpeedQuestions(dafim: Daf[], allDafim: Daf[]): SpeedQuestion[] {
  const questions: SpeedQuestion[] = [];

  for (const daf of dafim) {
    // Type 1: What's the siman?
    const distractors = shuffle(allDafim.filter((d) => d.dafNumber !== daf.dafNumber)).slice(0, 3);
    const choices1 = shuffle([daf.siman, ...distractors.map((d) => d.siman)]);
    questions.push({
      prompt: `Daf ${daf.dafHebrew} = ?`,
      choices: choices1,
      correctIndex: choices1.indexOf(daf.siman),
    });

    // Type 2: Which daf?
    const label = (d: Daf) => `${d.dafHebrew} (${d.siman})`;
    const choices2 = shuffle([label(daf), ...distractors.map(label)]);
    const point = daf.points.find((p) => p.english);
    if (point) {
      questions.push({
        prompt: point.english.length > 50 ? point.english.slice(0, 50) + "..." : point.english,
        choices: choices2,
        correctIndex: choices2.indexOf(label(daf)),
      });
    }
  }

  return shuffle(questions);
}

const DURATION = 60; // seconds

export default function SpeedRound({ dafim, allDafim, title, onBack }: SpeedRoundProps) {
  const [questions] = useState(() => generateSpeedQuestions(dafim, allDafim));
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [flash, setFlash] = useState<"correct" | "wrong" | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!started || finished) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setFinished(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [started, finished]);

  const handleChoice = useCallback(
    (idx: number) => {
      if (finished) return;
      const q = questions[currentIdx];
      if (idx === q.correctIndex) {
        setScore((s) => s + 1);
        setFlash("correct");
      } else {
        setWrong((w) => w + 1);
        setFlash("wrong");
      }
      setTimeout(() => {
        setFlash(null);
        if (currentIdx + 1 >= questions.length) {
          setFinished(true);
        } else {
          setCurrentIdx((i) => i + 1);
        }
      }, 200);
    },
    [currentIdx, questions, finished]
  );

  // Start screen
  if (!started) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
        <div className="text-center animate-bounce-in">
          <p className="text-7xl mb-4">{"\u{23F1}"}</p>
          <h2 className="text-2xl font-bold text-gray-800">Speed Round</h2>
          <p className="text-gray-500 mt-2">{title}</p>
          <p className="text-lg text-gray-600 mt-4">
            Answer as many as you can in <span className="font-bold text-duo-red">{DURATION} seconds</span>
          </p>
        </div>
        <button
          onClick={() => setStarted(true)}
          className="mt-8 px-12 py-4 rounded-xl border-2 border-b-4 border-duo-green bg-duo-green text-white font-bold text-xl active:border-b-2 active:mt-[2px] transition-all"
        >
          GO!
        </button>
        <button onClick={onBack} className="mt-4 text-gray-400 hover:text-gray-600">
          Back
        </button>
      </div>
    );
  }

  // Finished screen
  if (finished) {
    const pct = score + wrong > 0 ? Math.round((score / (score + wrong)) * 100) : 0;
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
        <div className="text-center animate-bounce-in mb-6">
          <p className="text-6xl mb-3">{score >= 20 ? "\u{1F525}" : score >= 10 ? "\u{1F4AA}" : "\u{1F31F}"}</p>
          <h2 className="text-2xl font-bold text-gray-800">Time's Up!</h2>
          <p className="text-gray-500 mt-1">{title}</p>
        </div>
        <div className="w-full max-w-sm space-y-3 animate-fade-in-up">
          <div className="flex items-center justify-between p-4 bg-duo-green-light rounded-xl">
            <span className="font-bold text-duo-green-dark">Correct</span>
            <span className="text-3xl font-bold text-duo-green-dark">{score}</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-duo-red-light rounded-xl">
            <span className="font-bold text-duo-red">Wrong</span>
            <span className="text-3xl font-bold text-duo-red">{wrong}</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
            <span className="font-bold text-gray-600">Accuracy</span>
            <span className="text-3xl font-bold text-gray-800">{pct}%</span>
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

  const q = questions[currentIdx];
  const timerPct = (timeLeft / DURATION) * 100;

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-150 ${flash === "correct" ? "bg-duo-green-light" : flash === "wrong" ? "bg-duo-red-light" : "bg-gray-50"}`}>
      {/* Timer header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <button onClick={onBack} className="text-gray-500 hover:text-gray-800 text-2xl font-light">&larr;</button>
          <span className={`text-2xl font-bold tabular-nums ${timeLeft <= 10 ? "text-duo-red animate-pulse-slow" : "text-gray-800"}`}>
            {timeLeft}s
          </span>
          <span className="text-lg font-bold text-duo-green">{score}</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-linear ${timeLeft <= 10 ? "bg-duo-red" : "bg-duo-blue"}`}
            style={{ width: `${timerPct}%` }}
          />
        </div>
      </header>

      {/* Question */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-4 max-w-lg mx-auto w-full">
        <h2 className="text-xl font-bold text-gray-800 text-center mb-6">{q.prompt}</h2>
        <div className="w-full grid grid-cols-2 gap-3">
          {q.choices.map((choice, i) => (
            <button
              key={i}
              onClick={() => handleChoice(i)}
              className="py-4 px-3 rounded-xl border-2 border-b-4 border-duo-gray bg-white text-gray-800 font-bold text-sm text-center active:border-b-2 active:mt-[2px] hover:border-duo-blue transition-all"
            >
              {choice}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
