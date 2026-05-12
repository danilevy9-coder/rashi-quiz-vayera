"use client";

import { useState, useCallback, useMemo } from "react";
import type { Daf, Perek } from "../data/yevamos";

interface SequenceDrillProps {
  dafim: Daf[];
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

export default function SequenceDrill({ dafim, title, onBack }: SequenceDrillProps) {
  // The user needs to put the simanim in the correct daf order
  const sortedDafim = useMemo(
    () => [...dafim].sort((a, b) => a.dafNumber - b.dafNumber),
    [dafim]
  );

  const [remaining, setRemaining] = useState<Daf[]>(() => shuffle(sortedDafim));
  const [placed, setPlaced] = useState<Daf[]>([]);
  const [wrongId, setWrongId] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState(0);

  const nextExpected = sortedDafim[placed.length];
  const finished = placed.length === sortedDafim.length;
  const progress = (placed.length / sortedDafim.length) * 100;

  const handlePick = useCallback(
    (daf: Daf) => {
      if (!nextExpected) return;

      if (daf.dafNumber === nextExpected.dafNumber) {
        // Correct!
        setPlaced((prev) => [...prev, daf]);
        setRemaining((prev) => prev.filter((d) => d.dafNumber !== daf.dafNumber));
        setWrongId(null);
      } else {
        // Wrong
        setWrongId(daf.dafNumber);
        setMistakes((m) => m + 1);
        setTimeout(() => setWrongId(null), 500);
      }
    },
    [nextExpected]
  );

  if (finished) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
        <div className="text-center animate-bounce-in mb-6">
          <p className="text-6xl mb-3">{mistakes === 0 ? "\u{1F31F}" : mistakes <= 3 ? "\u{1F525}" : "\u{1F4AA}"}</p>
          <h2 className="text-2xl font-bold text-gray-800">Perfect Order!</h2>
          <p className="text-gray-500 mt-1">{title}</p>
        </div>
        <div className="w-full max-w-sm space-y-3 animate-fade-in-up">
          <div className="flex items-center justify-between p-4 bg-duo-green-light rounded-xl">
            <span className="font-bold text-duo-green-dark">Dafim Placed</span>
            <span className="text-2xl font-bold text-duo-green-dark">{sortedDafim.length}</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
            <span className="font-bold text-gray-600">Mistakes</span>
            <span className="text-2xl font-bold text-gray-800">{mistakes}</span>
          </div>
        </div>
        <button
          onClick={onBack}
          className="mt-6 py-3 px-8 rounded-xl border-2 border-b-4 border-duo-green bg-duo-green text-white font-bold active:border-b-2 active:mt-[2px] transition-all"
        >
          Done
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={onBack} className="text-gray-500 hover:text-gray-800 text-2xl font-light">
            &larr;
          </button>
          <span className="text-sm text-gray-500 font-medium">
            {placed.length}/{sortedDafim.length} placed
          </span>
          <div className="flex-1" />
          {mistakes > 0 && (
            <span className="text-sm text-duo-red font-medium">{mistakes} mistakes</span>
          )}
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500 progress-shimmer" style={{ width: `${progress}%` }} />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-lg mx-auto w-full">
        {/* Prompt */}
        <div className="text-center mb-4">
          <p className="text-sm text-gray-500">Tap the next siman in daf order</p>
          <p className="text-lg font-bold text-[#1a3a5c] mt-1">
            What comes at Daf {nextExpected?.dafHebrew}?
          </p>
        </div>

        {/* Already placed (chain so far) */}
        {placed.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2 justify-center">
            {placed.map((d) => (
              <span
                key={d.dafNumber}
                className="px-3 py-1.5 rounded-lg bg-duo-green-light text-duo-green-dark text-sm font-bold border border-duo-green"
              >
                {d.dafHebrew} {d.siman}
              </span>
            ))}
            <span className="px-3 py-1.5 rounded-lg bg-blue-50 text-duo-blue text-sm font-bold border-2 border-dashed border-duo-blue animate-pulse-slow">
              ?
            </span>
          </div>
        )}

        {/* Remaining choices */}
        <div className="grid grid-cols-2 gap-2">
          {remaining.map((daf) => (
            <button
              key={daf.dafNumber}
              onClick={() => handlePick(daf)}
              className={`py-3 px-3 rounded-xl border-2 border-b-4 font-bold text-sm transition-all ${
                wrongId === daf.dafNumber
                  ? "border-duo-red bg-duo-red-light text-duo-red animate-shake"
                  : "border-duo-gray bg-white text-gray-800 active:border-b-2 active:mt-[2px] hover:border-[#1a3a5c]"
              }`}
            >
              {daf.siman}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
