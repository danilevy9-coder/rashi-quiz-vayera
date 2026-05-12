"use client";

import { useState, useEffect, useMemo } from "react";
import { getDafimByPerek, getAllDafim, MASECHTA_NAME, MASECHTA_NAME_EN, TOTAL_DAFIM, type Perek } from "./data/yevamos";
import FlashcardSession from "./components/FlashcardSession";
import GemaraQuiz from "./components/GemaraQuiz";
import Link from "next/link";

type Rating = "knew" | "partial" | "forgot";
type ActiveMode = null | { type: "study" | "quiz"; scope: "all" | number }; // number = perek number

const STORAGE_KEY = "gemara-flashcard-ratings";

function loadRatings(): Record<number, Rating> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveRatings(ratings: Record<number, Rating>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ratings));
  } catch {}
}

function MasteryDot({ rating }: { rating?: Rating }) {
  if (!rating) return <span className="w-2.5 h-2.5 rounded-full bg-gray-200" />;
  if (rating === "knew") return <span className="w-2.5 h-2.5 rounded-full bg-duo-green" />;
  if (rating === "partial") return <span className="w-2.5 h-2.5 rounded-full bg-duo-gold" />;
  return <span className="w-2.5 h-2.5 rounded-full bg-duo-red" />;
}

function PerekCard({
  perek,
  ratings,
  onStudy,
  onQuiz,
}: {
  perek: Perek;
  ratings: Record<number, Rating>;
  onStudy: () => void;
  onQuiz: () => void;
}) {
  const total = perek.dafim.length;
  const knew = perek.dafim.filter((d) => ratings[d.dafNumber] === "knew").length;
  const partial = perek.dafim.filter((d) => ratings[d.dafNumber] === "partial").length;
  const forgot = perek.dafim.filter((d) => ratings[d.dafNumber] === "forgot").length;
  const reviewed = knew + partial + forgot;

  return (
    <div className="w-full p-4 rounded-xl border-2 border-gray-200 bg-white">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-[#1a3a5c] text-white flex items-center justify-center text-lg font-bold">
          {perek.number}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-800 text-base" dir="rtl">
            {perek.nameHebrew}
          </h3>
          <p className="text-sm text-gray-500">
            {perek.name} &middot; {total} dafim
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          {reviewed > 0 ? (
            <>
              <span className="text-xs text-gray-400">
                {reviewed}/{total}
              </span>
              <div className="flex gap-0.5">
                {perek.dafim.map((d) => (
                  <MasteryDot key={d.dafNumber} rating={ratings[d.dafNumber]} />
                ))}
              </div>
            </>
          ) : (
            <span className="text-xs text-gray-400">Not started</span>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onStudy}
          className="flex-1 py-2.5 rounded-lg border-2 border-b-4 border-duo-gray bg-white text-gray-700 font-bold text-sm active:border-b-2 active:mt-[2px] transition-all"
        >
          Study
        </button>
        <button
          onClick={onQuiz}
          className="flex-1 py-2.5 rounded-lg border-2 border-b-4 border-duo-green bg-duo-green text-white font-bold text-sm active:border-b-2 active:mt-[2px] transition-all"
        >
          Quiz
        </button>
      </div>
    </div>
  );
}

export default function GemaraPage() {
  const [ratings, setRatings] = useState<Record<number, Rating>>({});
  const [activeMode, setActiveMode] = useState<ActiveMode>(null);
  const [mounted, setMounted] = useState(false);

  const prakim = useMemo(() => getDafimByPerek(), []);
  const allDafim = useMemo(() => getAllDafim(), []);

  useEffect(() => {
    setRatings(loadRatings());
    setMounted(true);
  }, []);

  const handleSaveRatings = (newRatings: Record<number, Rating>) => {
    setRatings(newRatings);
    saveRatings(newRatings);
  };

  // Active session
  if (activeMode) {
    const dafim =
      activeMode.scope === "all"
        ? allDafim
        : prakim.find((p) => p.number === activeMode.scope)?.dafim || [];

    const title =
      activeMode.scope === "all"
        ? `${MASECHTA_NAME} - All Dafim`
        : (() => {
            const p = prakim.find((pk) => pk.number === activeMode.scope);
            return p ? `${p.nameHebrew} · Perek ${p.number}` : "";
          })();

    if (activeMode.type === "study") {
      return (
        <FlashcardSession
          dafim={dafim}
          title={title}
          onBack={() => setActiveMode(null)}
          savedRatings={ratings}
          onSaveRatings={handleSaveRatings}
        />
      );
    }

    return (
      <GemaraQuiz
        dafim={dafim}
        allDafim={allDafim}
        title={title}
        onBack={() => setActiveMode(null)}
      />
    );
  }

  // Stats
  const totalRated = Object.keys(ratings).length;
  const knew = Object.values(ratings).filter((r) => r === "knew").length;
  const partial = Object.values(ratings).filter((r) => r === "partial").length;
  const forgot = Object.values(ratings).filter((r) => r === "forgot").length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#1a3a5c] text-white">
        <div className="max-w-2xl mx-auto px-4 py-5">
          <div className="flex items-center gap-3 mb-4">
            <Link
              href="/"
              className="text-white/70 hover:text-white text-xl font-light"
            >
              &larr;
            </Link>
            <div className="flex-1" />
            <span className="text-sm text-white/60 font-medium">Zichru</span>
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-1" dir="rtl">
              {MASECHTA_NAME}
            </h1>
            <p className="text-white/70 text-sm">
              {MASECHTA_NAME_EN} &middot; {TOTAL_DAFIM} Dafim &middot; {prakim.length} Prakim
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Progress overview */}
        {mounted && totalRated > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 animate-fade-in-up">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-800">Your Progress</h2>
              <span className="text-sm text-gray-500">
                {totalRated}/{TOTAL_DAFIM} reviewed
              </span>
            </div>
            <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden flex">
              {knew > 0 && (
                <div
                  className="h-full bg-duo-green transition-all"
                  style={{ width: `${(knew / TOTAL_DAFIM) * 100}%` }}
                />
              )}
              {partial > 0 && (
                <div
                  className="h-full bg-duo-gold transition-all"
                  style={{ width: `${(partial / TOTAL_DAFIM) * 100}%` }}
                />
              )}
              {forgot > 0 && (
                <div
                  className="h-full bg-duo-red transition-all"
                  style={{ width: `${(forgot / TOTAL_DAFIM) * 100}%` }}
                />
              )}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-duo-green inline-block" /> {knew} knew
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-duo-gold inline-block" /> {partial} partial
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-duo-red inline-block" /> {forgot} forgot
              </span>
            </div>
          </div>
        )}

        {/* Top action buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setActiveMode({ type: "study", scope: "all" })}
            className="py-4 rounded-xl border-2 border-b-4 border-[#1a3a5c] bg-[#1a3a5c] text-white font-bold text-base active:border-b-2 active:mt-[2px] transition-all"
          >
            Study All
          </button>
          <button
            onClick={() => setActiveMode({ type: "quiz", scope: "all" })}
            className="py-4 rounded-xl border-2 border-b-4 border-duo-green bg-duo-green text-white font-bold text-base active:border-b-2 active:mt-[2px] transition-all"
          >
            Quiz All
          </button>
        </div>

        {/* Prakim list */}
        <div>
          <h2 className="font-bold text-gray-800 mb-3">By Perek</h2>
          <div className="space-y-3">
            {prakim.map((perek) => (
              <PerekCard
                key={perek.number}
                perek={perek}
                ratings={ratings}
                onStudy={() => setActiveMode({ type: "study", scope: perek.number })}
                onQuiz={() => setActiveMode({ type: "quiz", scope: perek.number })}
              />
            ))}
          </div>
        </div>

        {/* Reset progress */}
        {mounted && totalRated > 0 && (
          <div className="text-center pt-4 pb-8">
            <button
              onClick={() => {
                if (confirm("Reset all flashcard progress?")) {
                  setRatings({});
                  saveRatings({});
                }
              }}
              className="text-sm text-gray-400 hover:text-duo-red transition-colors"
            >
              Reset Progress
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
