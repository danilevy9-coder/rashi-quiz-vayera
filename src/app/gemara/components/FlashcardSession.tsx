"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import type { Daf, Perek } from "../data/yevamos";
import Flashcard from "./Flashcard";

type Rating = "knew" | "partial" | "forgot";

interface RatedDaf {
  dafNumber: number;
  rating: Rating;
}

interface FlashcardSessionProps {
  dafim: Daf[];
  perek?: Perek;
  title: string;
  onBack: () => void;
  savedRatings: Record<number, Rating>;
  onSaveRatings: (ratings: Record<number, Rating>) => void;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type SessionMode = "ordered" | "shuffle" | "weak-first";

export default function FlashcardSession({
  dafim,
  title,
  onBack,
  savedRatings,
  onSaveRatings,
}: FlashcardSessionProps) {
  const [mode, setMode] = useState<SessionMode | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionRatings, setSessionRatings] = useState<Record<number, Rating>>({});
  const [finished, setFinished] = useState(false);

  const orderedDafim = useMemo(() => {
    if (!mode) return dafim;
    if (mode === "shuffle") return shuffle(dafim);
    if (mode === "weak-first") {
      // Put forgot first, then partial, then new (no rating), then knew
      const priority = (d: Daf) => {
        const r = savedRatings[d.dafNumber];
        if (r === "forgot") return 0;
        if (r === "partial") return 1;
        if (!r) return 2;
        return 3; // knew
      };
      return [...dafim].sort((a, b) => priority(a) - priority(b));
    }
    return dafim;
  }, [dafim, mode, savedRatings]);

  const currentDaf = orderedDafim[currentIndex];
  const total = orderedDafim.length;
  const progress = total > 0 ? ((currentIndex + (finished ? 1 : 0)) / total) * 100 : 0;

  const handleRate = useCallback(
    (rating: Rating) => {
      const newRatings = { ...sessionRatings, [currentDaf.dafNumber]: rating };
      setSessionRatings(newRatings);

      // Save immediately
      const merged = { ...savedRatings, [currentDaf.dafNumber]: rating };
      onSaveRatings(merged);

      // Move to next or finish
      setTimeout(() => {
        if (currentIndex + 1 >= total) {
          setFinished(true);
        } else {
          setCurrentIndex((i) => i + 1);
        }
      }, 300);
    },
    [currentDaf, currentIndex, total, sessionRatings, savedRatings, onSaveRatings]
  );

  // Mode selection screen
  if (mode === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <button
            onClick={onBack}
            className="text-gray-500 hover:text-gray-800 text-2xl font-light"
          >
            &larr;
          </button>
          <h1 className="font-bold text-lg text-gray-800">{title}</h1>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
          <div className="text-center mb-2">
            <p className="text-5xl mb-3">&#x1F0CF;</p>
            <h2 className="text-xl font-bold text-gray-800">Study Mode</h2>
            <p className="text-gray-500 mt-1">{total} cards in this set</p>
          </div>

          <button
            onClick={() => setMode("ordered")}
            className="w-full max-w-sm py-4 rounded-xl border-2 border-b-4 border-[#1a3a5c] bg-[#1a3a5c] text-white font-bold text-base active:border-b-2 active:mt-[2px] transition-all"
          >
            In Order (Daf by Daf)
          </button>
          <button
            onClick={() => setMode("shuffle")}
            className="w-full max-w-sm py-4 rounded-xl border-2 border-b-4 border-duo-blue bg-white text-duo-blue font-bold text-base active:border-b-2 active:mt-[2px] transition-all"
          >
            Shuffled
          </button>
          {Object.keys(savedRatings).length > 0 && (
            <button
              onClick={() => setMode("weak-first")}
              className="w-full max-w-sm py-4 rounded-xl border-2 border-b-4 border-duo-gold bg-white text-amber-700 font-bold text-base active:border-b-2 active:mt-[2px] transition-all"
            >
              Weak Cards First
            </button>
          )}
        </div>
      </div>
    );
  }

  // Finished screen
  if (finished) {
    const knew = Object.values(sessionRatings).filter((r) => r === "knew").length;
    const partial = Object.values(sessionRatings).filter((r) => r === "partial").length;
    const forgot = Object.values(sessionRatings).filter((r) => r === "forgot").length;
    const pct = total > 0 ? Math.round((knew / total) * 100) : 0;

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
          <div className="text-center animate-bounce-in">
            <p className="text-6xl mb-3">{pct >= 80 ? "&#x1F31F;" : pct >= 50 ? "&#x1F4AA;" : "&#x1F4D6;"}</p>
            <h2 className="text-2xl font-bold text-gray-800">Session Complete!</h2>
            <p className="text-gray-500 mt-1">{title}</p>
          </div>

          <div className="w-full max-w-sm space-y-3 animate-fade-in-up">
            <div className="flex items-center justify-between p-4 bg-duo-green-light rounded-xl">
              <span className="font-bold text-duo-green-dark">Knew It</span>
              <span className="text-2xl font-bold text-duo-green-dark">{knew}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-200">
              <span className="font-bold text-amber-700">Partial</span>
              <span className="text-2xl font-bold text-amber-700">{partial}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-duo-red-light rounded-xl">
              <span className="font-bold text-duo-red">Forgot</span>
              <span className="text-2xl font-bold text-duo-red">{forgot}</span>
            </div>
          </div>

          <div className="flex gap-3 w-full max-w-sm mt-4">
            <button
              onClick={() => {
                setCurrentIndex(0);
                setSessionRatings({});
                setFinished(false);
                setMode(null);
              }}
              className="flex-1 py-3 rounded-xl border-2 border-b-4 border-duo-gray bg-white text-gray-600 font-bold text-sm active:border-b-2 active:mt-[2px] transition-all"
            >
              Study Again
            </button>
            <button
              onClick={onBack}
              className="flex-1 py-3 rounded-xl border-2 border-b-4 border-duo-green bg-duo-green text-white font-bold text-sm active:border-b-2 active:mt-[2px] transition-all"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active study screen
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={onBack}
            className="text-gray-500 hover:text-gray-800 text-2xl font-light"
          >
            &larr;
          </button>
          <span className="text-sm text-gray-500 font-medium">
            {currentIndex + 1} / {total}
          </span>
          <div className="flex-1" />
          <span className="text-xs text-gray-400">
            {mode === "ordered" ? "In Order" : mode === "shuffle" ? "Shuffled" : "Weak First"}
          </span>
        </div>
        {/* Progress bar */}
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out progress-shimmer"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      {/* Card area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col items-center">
        <div className="my-auto w-full">
          <Flashcard key={currentDaf.dafNumber} daf={currentDaf} onRate={handleRate} showRating={true} />
        </div>
      </div>

      {/* Nav arrows */}
      <div className="flex items-center justify-between px-6 pb-6">
        <button
          onClick={() => currentIndex > 0 && setCurrentIndex((i) => i - 1)}
          disabled={currentIndex === 0}
          className="px-4 py-2 rounded-lg text-gray-400 disabled:opacity-30 hover:text-gray-600 font-medium"
        >
          &larr; Prev
        </button>
        <button
          onClick={() => {
            if (currentIndex + 1 < total) {
              setCurrentIndex((i) => i + 1);
            }
          }}
          disabled={currentIndex + 1 >= total}
          className="px-4 py-2 rounded-lg text-gray-400 disabled:opacity-30 hover:text-gray-600 font-medium"
        >
          Skip &rarr;
        </button>
      </div>
    </div>
  );
}
