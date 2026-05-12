"use client";

import { useState, useCallback, useMemo } from "react";
import type { Daf } from "../data/yevamos";

interface MatchingGameProps {
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

interface MatchItem {
  id: number;
  label: string;
  matchId: number; // pairs share same matchId
  side: "left" | "right";
}

export default function MatchingGame({ dafim, title, onBack }: MatchingGameProps) {
  // Take a batch of dafim (max 6 at a time for playability)
  const BATCH_SIZE = 6;
  const [batchIndex, setBatchIndex] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);

  const batches = useMemo(() => {
    const shuffled = shuffle(dafim);
    const result: Daf[][] = [];
    for (let i = 0; i < shuffled.length; i += BATCH_SIZE) {
      result.push(shuffled.slice(i, i + BATCH_SIZE));
    }
    return result;
  }, [dafim]);

  const currentBatch = batches[batchIndex];
  const isLastBatch = batchIndex >= batches.length - 1;

  // Build items for current batch
  const [leftItems] = useState<string[]>(() => []);
  const [rightItems] = useState<string[]>(() => []);

  const items = useMemo(() => {
    if (!currentBatch) return { left: [] as MatchItem[], right: [] as MatchItem[] };
    const left = shuffle(
      currentBatch.map((d, i) => ({
        id: i * 2,
        label: `Daf ${d.dafHebrew}`,
        matchId: d.dafNumber,
        side: "left" as const,
      }))
    );
    const right = shuffle(
      currentBatch.map((d, i) => ({
        id: i * 2 + 1,
        label: d.siman,
        matchId: d.dafNumber,
        side: "right" as const,
      }))
    );
    return { left, right };
  }, [currentBatch, batchIndex]);

  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [selectedRight, setSelectedRight] = useState<number | null>(null);
  const [matched, setMatched] = useState<Set<number>>(new Set()); // matchIds
  const [wrongPair, setWrongPair] = useState<{ left: number; right: number } | null>(null);
  const [batchComplete, setBatchComplete] = useState(false);

  const handleLeftClick = useCallback(
    (item: MatchItem) => {
      if (matched.has(item.matchId)) return;
      setWrongPair(null);
      setSelectedLeft(item.id);

      if (selectedRight !== null) {
        const rightItem = items.right.find((r) => r.id === selectedRight);
        if (rightItem) {
          setTotalAttempts((a) => a + 1);
          if (item.matchId === rightItem.matchId) {
            const newMatched = new Set(matched);
            newMatched.add(item.matchId);
            setMatched(newMatched);
            setSelectedLeft(null);
            setSelectedRight(null);
            setTotalCorrect((c) => c + 1);
            if (newMatched.size === currentBatch.length) {
              setBatchComplete(true);
            }
          } else {
            setWrongPair({ left: item.id, right: selectedRight });
            setTimeout(() => {
              setWrongPair(null);
              setSelectedLeft(null);
              setSelectedRight(null);
            }, 600);
          }
        }
      }
    },
    [selectedRight, matched, items.right, currentBatch]
  );

  const handleRightClick = useCallback(
    (item: MatchItem) => {
      if (matched.has(item.matchId)) return;
      setWrongPair(null);
      setSelectedRight(item.id);

      if (selectedLeft !== null) {
        const leftItem = items.left.find((l) => l.id === selectedLeft);
        if (leftItem) {
          setTotalAttempts((a) => a + 1);
          if (item.matchId === leftItem.matchId) {
            const newMatched = new Set(matched);
            newMatched.add(item.matchId);
            setMatched(newMatched);
            setSelectedLeft(null);
            setSelectedRight(null);
            setTotalCorrect((c) => c + 1);
            if (newMatched.size === currentBatch.length) {
              setBatchComplete(true);
            }
          } else {
            setWrongPair({ left: selectedLeft, right: item.id });
            setTimeout(() => {
              setWrongPair(null);
              setSelectedLeft(null);
              setSelectedRight(null);
            }, 600);
          }
        }
      }
    },
    [selectedLeft, matched, items.left, currentBatch]
  );

  const handleNextBatch = () => {
    setBatchIndex((i) => i + 1);
    setMatched(new Set());
    setSelectedLeft(null);
    setSelectedRight(null);
    setBatchComplete(false);
    setWrongPair(null);
  };

  // All done
  if (batchIndex >= batches.length) {
    const pct = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 100;
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
        <div className="text-center animate-bounce-in mb-6">
          <p className="text-6xl mb-3">{pct >= 90 ? "\u{1F31F}" : "\u{1F4AA}"}</p>
          <h2 className="text-2xl font-bold text-gray-800">All Matched!</h2>
          <p className="text-gray-500 mt-1">{title}</p>
        </div>
        <div className="w-full max-w-sm space-y-3 animate-fade-in-up">
          <div className="flex items-center justify-between p-4 bg-duo-green-light rounded-xl">
            <span className="font-bold text-duo-green-dark">Accuracy</span>
            <span className="text-2xl font-bold text-duo-green-dark">{pct}%</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
            <span className="font-bold text-gray-600">Pairs Matched</span>
            <span className="text-2xl font-bold text-gray-800">{totalCorrect}</span>
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

  if (!currentBatch) return null;

  const progress = ((batchIndex + (batchComplete ? 1 : 0)) / batches.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={onBack} className="text-gray-500 hover:text-gray-800 text-2xl font-light">
            &larr;
          </button>
          <span className="text-sm text-gray-500 font-medium">
            Round {batchIndex + 1}/{batches.length}
          </span>
          <div className="flex-1" />
          <span className="text-sm font-bold text-duo-green">{matched.size}/{currentBatch.length} matched</span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500 progress-shimmer" style={{ width: `${progress}%` }} />
        </div>
      </header>

      <div className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
        <p className="text-center text-sm text-gray-500 mb-4">Tap a daf, then tap its matching siman</p>

        <div className="flex gap-3">
          {/* Left column: daf numbers */}
          <div className="flex-1 space-y-2">
            {items.left.map((item) => {
              const isMatched = matched.has(item.matchId);
              const isSelected = selectedLeft === item.id;
              const isWrong = wrongPair?.left === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleLeftClick(item)}
                  disabled={isMatched}
                  className={`w-full py-3 px-3 rounded-xl border-2 border-b-4 font-bold text-base transition-all ${
                    isMatched
                      ? "border-duo-green bg-duo-green-light text-duo-green-dark opacity-60"
                      : isWrong
                      ? "border-duo-red bg-duo-red-light text-duo-red animate-shake"
                      : isSelected
                      ? "border-duo-blue bg-blue-50 text-duo-blue"
                      : "border-duo-gray bg-white text-gray-800 active:border-b-2 active:mt-[2px]"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Right column: simanim */}
          <div className="flex-1 space-y-2">
            {items.right.map((item) => {
              const isMatched = matched.has(item.matchId);
              const isSelected = selectedRight === item.id;
              const isWrong = wrongPair?.right === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleRightClick(item)}
                  disabled={isMatched}
                  className={`w-full py-3 px-3 rounded-xl border-2 border-b-4 font-bold text-base transition-all ${
                    isMatched
                      ? "border-duo-green bg-duo-green-light text-duo-green-dark opacity-60"
                      : isWrong
                      ? "border-duo-red bg-duo-red-light text-duo-red animate-shake"
                      : isSelected
                      ? "border-duo-blue bg-blue-50 text-duo-blue"
                      : "border-duo-gray bg-white text-gray-800 active:border-b-2 active:mt-[2px]"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Next batch button */}
        {batchComplete && !isLastBatch && (
          <button
            onClick={handleNextBatch}
            className="mt-6 w-full py-3 rounded-xl border-2 border-b-4 border-duo-green bg-duo-green text-white font-bold animate-slide-up active:border-b-2 active:mt-[2px] transition-all"
          >
            Next Round &rarr;
          </button>
        )}
        {batchComplete && isLastBatch && (
          <button
            onClick={() => setBatchIndex(batches.length)}
            className="mt-6 w-full py-3 rounded-xl border-2 border-b-4 border-duo-green bg-duo-green text-white font-bold animate-slide-up active:border-b-2 active:mt-[2px] transition-all"
          >
            See Results
          </button>
        )}
      </div>
    </div>
  );
}
