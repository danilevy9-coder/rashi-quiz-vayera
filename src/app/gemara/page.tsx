"use client";

import { useState, useEffect, useMemo } from "react";
import { getDafimByPerek, getAllDafim, MASECHTA_NAME, MASECHTA_NAME_EN, TOTAL_DAFIM, type Perek, type Daf } from "./data/yevamos";
import FlashcardSession from "./components/FlashcardSession";
import Link from "next/link";

type Rating = "knew" | "partial" | "forgot";

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
  onSelect,
}: {
  perek: Perek;
  ratings: Record<number, Rating>;
  onSelect: () => void;
}) {
  const total = perek.dafim.length;
  const knew = perek.dafim.filter((d) => ratings[d.dafNumber] === "knew").length;
  const partial = perek.dafim.filter((d) => ratings[d.dafNumber] === "partial").length;
  const forgot = perek.dafim.filter((d) => ratings[d.dafNumber] === "forgot").length;
  const reviewed = knew + partial + forgot;
  const pct = total > 0 ? Math.round((knew / total) * 100) : 0;

  return (
    <button
      onClick={onSelect}
      className="w-full text-right p-4 rounded-xl border-2 border-b-4 border-gray-200 bg-white hover:border-[#1a3a5c] active:border-b-2 active:mt-[2px] transition-all group"
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#1a3a5c] text-white flex items-center justify-center text-lg font-bold">
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
    </button>
  );
}

export default function GemaraPage() {
  const [ratings, setRatings] = useState<Record<number, Rating>>({});
  const [selectedPerek, setSelectedPerek] = useState<Perek | null>(null);
  const [studyAll, setStudyAll] = useState(false);
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
  if (selectedPerek) {
    return (
      <FlashcardSession
        dafim={selectedPerek.dafim}
        perek={selectedPerek}
        title={`${selectedPerek.nameHebrew} · Perek ${selectedPerek.number}`}
        onBack={() => setSelectedPerek(null)}
        savedRatings={ratings}
        onSaveRatings={handleSaveRatings}
      />
    );
  }

  if (studyAll) {
    return (
      <FlashcardSession
        dafim={allDafim}
        title={`כל המסכת · ${MASECHTA_NAME}`}
        onBack={() => setStudyAll(false)}
        savedRatings={ratings}
        onSaveRatings={handleSaveRatings}
      />
    );
  }

  // Stats
  const totalRated = Object.keys(ratings).length;
  const knew = Object.values(ratings).filter((r) => r === "knew").length;
  const partial = Object.values(ratings).filter((r) => r === "partial").length;
  const forgot = Object.values(ratings).filter((r) => r === "forgot").length;
  const masteryPct = TOTAL_DAFIM > 0 ? Math.round((knew / TOTAL_DAFIM) * 100) : 0;

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
            <span className="text-sm text-white/60 font-medium">Zichru Flashcards</span>
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
            {/* Progress bar */}
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

        {/* Study All button */}
        <button
          onClick={() => setStudyAll(true)}
          className="w-full py-4 rounded-xl border-2 border-b-4 border-[#1a3a5c] bg-[#1a3a5c] text-white font-bold text-lg active:border-b-2 active:mt-[2px] transition-all"
        >
          Study All Dafim
        </button>

        {/* Prakim list */}
        <div>
          <h2 className="font-bold text-gray-800 mb-3">By Perek</h2>
          <div className="space-y-3">
            {prakim.map((perek) => (
              <PerekCard
                key={perek.number}
                perek={perek}
                ratings={ratings}
                onSelect={() => setSelectedPerek(perek)}
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
