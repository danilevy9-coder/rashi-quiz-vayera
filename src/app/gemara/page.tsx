"use client";

import { useState, useEffect, useMemo } from "react";
import { getDafimByPerek, getAllDafim, MASECHTA_NAME, MASECHTA_NAME_EN, TOTAL_DAFIM, type Perek } from "./data/yevamos";
import FlashcardSession from "./components/FlashcardSession";
import GemaraQuiz from "./components/GemaraQuiz";
import MatchingGame from "./components/MatchingGame";
import SequenceDrill from "./components/SequenceDrill";
import Link from "next/link";

type Rating = "knew" | "partial" | "forgot";
type GameType = "study" | "quiz" | "matching" | "sequence";
type ActiveMode = null | { type: GameType; scope: "all" | number };

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

// ── Game type picker (shown after choosing a perek or "all") ─────

const GAME_TYPES: { type: GameType; title: string; desc: string; color: string; border: string; bg: string }[] = [
  {
    type: "study",
    title: "Flashcards",
    desc: "Flip cards to review siman + 3 points",
    color: "text-[#1a3a5c]",
    border: "border-[#1a3a5c]",
    bg: "bg-[#1a3a5c]/5",
  },
  {
    type: "quiz",
    title: "Multiple Choice",
    desc: "6 question types with mastery tracking",
    color: "text-duo-green-dark",
    border: "border-duo-green",
    bg: "bg-duo-green-light",
  },
  {
    type: "matching",
    title: "Matching",
    desc: "Match daf numbers to their simanim",
    color: "text-duo-blue",
    border: "border-duo-blue",
    bg: "bg-blue-50",
  },
  {
    type: "sequence",
    title: "Order the Simanim",
    desc: "Put simanim in correct daf order",
    color: "text-amber-700",
    border: "border-duo-gold",
    bg: "bg-amber-50",
  },
];

function GameTypePicker({
  scope,
  onSelect,
  onBack,
  perekName,
}: {
  scope: "all" | number;
  onSelect: (type: GameType) => void;
  onBack: () => void;
  perekName: string;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-800 text-2xl font-light">
          &larr;
        </button>
        <h1 className="font-bold text-lg text-gray-800">{perekName}</h1>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-4">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Choose a Mode</h2>

        {GAME_TYPES.map((g, i) => (
          <button
            key={g.type}
            onClick={() => onSelect(g.type)}
            className={`w-full max-w-sm p-5 rounded-xl border-2 border-b-4 ${g.border} ${g.bg} text-left active:border-b-2 active:mt-[2px] transition-all animate-fade-in-up`}
            style={{ animationDelay: `${i * 0.06}s`, animationFillMode: "both" }}
          >
            <p className={`font-bold text-lg ${g.color}`}>{g.title}</p>
            <p className="text-sm text-gray-500 mt-0.5">{g.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Perek card ──────────────────────────────────────────────────

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

  return (
    <button
      onClick={onSelect}
      className="w-full text-left p-4 rounded-xl border-2 border-b-4 border-gray-200 bg-white hover:border-[#1a3a5c] active:border-b-2 active:mt-[2px] transition-all group"
    >
      <div className="flex items-center gap-3">
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
              <span className="text-xs text-gray-400">{reviewed}/{total}</span>
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

// ── Main page ───────────────────────────────────────────────────

export default function GemaraPage() {
  const [ratings, setRatings] = useState<Record<number, Rating>>({});
  // Two-step flow: first pick scope (perek or all), then pick game type
  const [pickedScope, setPickedScope] = useState<"all" | number | null>(null);
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

  // ── Active game session ──
  if (activeMode) {
    const dafim =
      activeMode.scope === "all"
        ? allDafim
        : prakim.find((p) => p.number === activeMode.scope)?.dafim || [];

    const title =
      activeMode.scope === "all"
        ? `${MASECHTA_NAME}`
        : (() => {
            const p = prakim.find((pk) => pk.number === activeMode.scope);
            return p ? `${p.nameHebrew} · Perek ${p.number}` : "";
          })();

    const goBack = () => {
      setActiveMode(null);
      setPickedScope(null);
    };

    if (activeMode.type === "study") {
      return (
        <FlashcardSession
          dafim={dafim}
          title={title}
          onBack={goBack}
          savedRatings={ratings}
          onSaveRatings={handleSaveRatings}
        />
      );
    }

    if (activeMode.type === "quiz") {
      return <GemaraQuiz dafim={dafim} allDafim={allDafim} title={title} onBack={goBack} />;
    }

    if (activeMode.type === "matching") {
      return <MatchingGame dafim={dafim} title={title} onBack={goBack} />;
    }

    if (activeMode.type === "sequence") {
      return <SequenceDrill dafim={dafim} title={title} onBack={goBack} />;
    }
  }

  // ── Game type picker ──
  if (pickedScope !== null) {
    const perekName =
      pickedScope === "all"
        ? `All Dafim (${TOTAL_DAFIM})`
        : (() => {
            const p = prakim.find((pk) => pk.number === pickedScope);
            return p ? `${p.nameHebrew} · ${p.name}` : "";
          })();

    return (
      <GameTypePicker
        scope={pickedScope}
        perekName={perekName}
        onSelect={(type) => setActiveMode({ type, scope: pickedScope })}
        onBack={() => setPickedScope(null)}
      />
    );
  }

  // ── Home / perek list ──
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
            <Link href="/" className="text-white/70 hover:text-white text-xl font-light">
              &larr;
            </Link>
            <div className="flex-1" />
            <span className="text-sm text-white/60 font-medium">Zichru</span>
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-1" dir="rtl">{MASECHTA_NAME}</h1>
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
              <span className="text-sm text-gray-500">{totalRated}/{TOTAL_DAFIM} reviewed</span>
            </div>
            <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden flex">
              {knew > 0 && (
                <div className="h-full bg-duo-green transition-all" style={{ width: `${(knew / TOTAL_DAFIM) * 100}%` }} />
              )}
              {partial > 0 && (
                <div className="h-full bg-duo-gold transition-all" style={{ width: `${(partial / TOTAL_DAFIM) * 100}%` }} />
              )}
              {forgot > 0 && (
                <div className="h-full bg-duo-red transition-all" style={{ width: `${(forgot / TOTAL_DAFIM) * 100}%` }} />
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

        {/* Study All */}
        <button
          onClick={() => setPickedScope("all")}
          className="w-full py-4 rounded-xl border-2 border-b-4 border-[#1a3a5c] bg-[#1a3a5c] text-white font-bold text-lg active:border-b-2 active:mt-[2px] transition-all"
        >
          All {TOTAL_DAFIM} Dafim &rarr;
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
                onSelect={() => setPickedScope(perek.number)}
              />
            ))}
          </div>
        </div>

        {/* Reset */}
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
