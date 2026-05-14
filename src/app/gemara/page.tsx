"use client";

import { useState, useEffect, useMemo } from "react";
import {
  getDafimByPerek as getYevamosPerakim,
  getAllDafim as getYevamosAllDafim,
  MASECHTA_NAME as YEVAMOS_NAME,
  MASECHTA_NAME_EN as YEVAMOS_NAME_EN,
  TOTAL_DAFIM as YEVAMOS_TOTAL,
  type Perek,
} from "./data/yevamos";
import {
  getDafimByPerek as getSuccahPerakim,
  getAllDafim as getSuccahAllDafim,
  MASECHTA_NAME as SUCCAH_NAME,
  MASECHTA_NAME_EN as SUCCAH_NAME_EN,
  TOTAL_DAFIM as SUCCAH_TOTAL,
} from "./data/succah";
import FlashcardSession from "./components/FlashcardSession";
import GemaraQuiz from "./components/GemaraQuiz";
import MatchingGame from "./components/MatchingGame";
import SequenceDrill from "./components/SequenceDrill";
import SpeedRound from "./components/SpeedRound";
import TrueFalseQuiz from "./components/TrueFalseQuiz";
import ImageQuiz from "./components/ImageQuiz";
import WhatDafQuiz from "./components/WhatDafQuiz";
import SugyaSimulator from "./components/SugyaSimulator";
import Link from "next/link";

type Rating = "knew" | "partial" | "forgot";
type GameType = "study" | "quiz" | "matching" | "sequence" | "speed" | "truefalse" | "image" | "whatdaf" | "journey";
type ActiveMode = null | { type: GameType; scope: "all" | number };
type MasechtaId = "yevamos" | "succah";

interface MasechtaConfig {
  id: MasechtaId;
  name: string;
  nameEn: string;
  total: number;
  getPrakim: () => Perek[];
  getAllDafim: () => import("./data/yevamos").Daf[];
  imageFolder: string;
  storageKey: string;
}

const MASECHTOS: MasechtaConfig[] = [
  {
    id: "yevamos",
    name: YEVAMOS_NAME,
    nameEn: YEVAMOS_NAME_EN,
    total: YEVAMOS_TOTAL,
    getPrakim: getYevamosPerakim,
    getAllDafim: getYevamosAllDafim,
    imageFolder: "yevamos",
    storageKey: "gemara-flashcard-ratings",
  },
  {
    id: "succah",
    name: SUCCAH_NAME,
    nameEn: SUCCAH_NAME_EN,
    total: SUCCAH_TOTAL,
    getPrakim: getSuccahPerakim,
    getAllDafim: getSuccahAllDafim,
    imageFolder: "succah",
    storageKey: "gemara-flashcard-ratings-succah",
  },
];

function loadRatings(key: string): Record<number, Rating> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveRatings(key: string, ratings: Record<number, Rating>) {
  try {
    localStorage.setItem(key, JSON.stringify(ratings));
  } catch {}
}

function MasteryDot({ rating }: { rating?: Rating }) {
  if (!rating) return <span className="w-2.5 h-2.5 rounded-full bg-gray-200" />;
  if (rating === "knew") return <span className="w-2.5 h-2.5 rounded-full bg-duo-green" />;
  if (rating === "partial") return <span className="w-2.5 h-2.5 rounded-full bg-duo-gold" />;
  return <span className="w-2.5 h-2.5 rounded-full bg-duo-red" />;
}

// ── Game type picker (shown after choosing a perek or "all") ─────

const GAME_TYPES: { type: GameType; title: string; desc: string; color: string; border: string; bg: string; emoji: string }[] = [
  {
    type: "journey",
    title: "Sugya Simulator",
    desc: "Interactive journey: explore the map, uncover each point, discover connections",
    color: "text-indigo-700",
    border: "border-indigo-400",
    bg: "bg-indigo-50",
    emoji: "\uD83D\uDDFA\uFE0F",
  },
  {
    type: "study",
    title: "Flashcards",
    desc: "Flip cards to review siman, 3 points + illustration",
    color: "text-[#1a3a5c]",
    border: "border-[#1a3a5c]",
    bg: "bg-[#1a3a5c]/5",
    emoji: "\uD83D\uDCDA",
  },
  {
    type: "quiz",
    title: "Multiple Choice",
    desc: "6 question types: pick the point, odd one out, complete the set...",
    color: "text-duo-green-dark",
    border: "border-duo-green",
    bg: "bg-duo-green-light",
    emoji: "\u2753",
  },
  {
    type: "image",
    title: "Identify the Picture",
    desc: "See the illustration, pick the correct daf",
    color: "text-orange-700",
    border: "border-orange-400",
    bg: "bg-orange-50",
    emoji: "\uD83D\uDDBC\uFE0F",
  },
  {
    type: "whatdaf",
    title: "What Daf Is This?",
    desc: "Read a topic and pick which daf it comes from",
    color: "text-teal-700",
    border: "border-teal-400",
    bg: "bg-teal-50",
    emoji: "\uD83D\uDCA1",
  },
  {
    type: "truefalse",
    title: "True or False",
    desc: "Is this statement about the daf correct?",
    color: "text-duo-purple",
    border: "border-duo-purple",
    bg: "bg-purple-50",
    emoji: "\u2696\uFE0F",
  },
  {
    type: "speed",
    title: "Speed Round",
    desc: "60 seconds - how many can you answer?",
    color: "text-duo-red",
    border: "border-duo-red",
    bg: "bg-duo-red-light",
    emoji: "\u23F1\uFE0F",
  },
  {
    type: "matching",
    title: "Matching",
    desc: "Tap to pair daf numbers with their simanim",
    color: "text-duo-blue",
    border: "border-duo-blue",
    bg: "bg-blue-50",
    emoji: "\uD83D\uDD17",
  },
  {
    type: "sequence",
    title: "Order the Simanim",
    desc: "Put simanim in correct daf order to build the chain",
    color: "text-amber-700",
    border: "border-duo-gold",
    bg: "bg-amber-50",
    emoji: "\uD83D\uDD22",
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

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Choose a Mode</h2>

        <div className="max-w-sm mx-auto space-y-3">
        {GAME_TYPES.map((g, i) => (
          <button
            key={g.type}
            onClick={() => onSelect(g.type)}
            className={`w-full p-4 rounded-xl border-2 border-b-4 ${g.border} ${g.bg} text-left active:border-b-2 active:mt-[2px] transition-all animate-fade-in-up`}
            style={{ animationDelay: `${i * 0.05}s`, animationFillMode: "both" }}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{g.emoji}</span>
              <div className="flex-1">
                <p className={`font-bold text-base ${g.color}`}>{g.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{g.desc}</p>
              </div>
            </div>
          </button>
        ))}
        </div>
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

// ── Masechta selection screen ──────────────────────────────────

function MasechtaSelector({ onSelect }: { onSelect: (m: MasechtaConfig) => void }) {
  return (
    <div className="min-h-screen bg-gray-50">
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
            <h1 className="text-3xl font-bold mb-1">Gemara Flashcards</h1>
            <p className="text-white/70 text-sm">Choose a Masechta to study</p>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        {MASECHTOS.map((m, i) => (
          <button
            key={m.id}
            onClick={() => onSelect(m)}
            className="w-full text-left p-6 rounded-xl border-2 border-b-4 border-gray-200 bg-white hover:border-[#1a3a5c] active:border-b-2 active:mt-[2px] transition-all animate-fade-in-up"
            style={{ animationDelay: `${i * 0.08}s`, animationFillMode: "both" }}
          >
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-[#1a3a5c] text-white flex items-center justify-center text-2xl font-bold" dir="rtl">
                {m.name}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-800 text-xl">{m.nameEn}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {m.total} Dafim
                </p>
              </div>
              <div className="text-gray-300 text-2xl font-light">&rarr;</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────────

export default function GemaraPage() {
  const [selectedMasechta, setSelectedMasechta] = useState<MasechtaConfig | null>(null);
  const [ratings, setRatings] = useState<Record<number, Rating>>({});
  // Two-step flow: first pick scope (perek or all), then pick game type
  const [pickedScope, setPickedScope] = useState<"all" | number | null>(null);
  const [activeMode, setActiveMode] = useState<ActiveMode>(null);
  const [mounted, setMounted] = useState(false);

  const masechta = selectedMasechta;
  const prakim = useMemo(() => masechta?.getPrakim() ?? [], [masechta]);
  const allDafim = useMemo(() => masechta?.getAllDafim() ?? [], [masechta]);
  const MASECHTA_NAME_VAL = masechta?.name ?? "";
  const MASECHTA_NAME_EN_VAL = masechta?.nameEn ?? "";
  const TOTAL_DAFIM_VAL = masechta?.total ?? 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (masechta) {
      setRatings(loadRatings(masechta.storageKey));
    }
  }, [masechta]);

  const handleSaveRatings = (newRatings: Record<number, Rating>) => {
    setRatings(newRatings);
    if (masechta) {
      saveRatings(masechta.storageKey, newRatings);
    }
  };

  // ── No masechta selected: show selector ──
  if (!masechta) {
    return <MasechtaSelector onSelect={setSelectedMasechta} />;
  }

  // ── Active game session ──
  if (activeMode) {
    const dafim =
      activeMode.scope === "all"
        ? allDafim
        : prakim.find((p) => p.number === activeMode.scope)?.dafim || [];

    const title =
      activeMode.scope === "all"
        ? `${MASECHTA_NAME_VAL}`
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
          imageFolder={masechta.imageFolder}
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

    if (activeMode.type === "speed") {
      return <SpeedRound dafim={dafim} allDafim={allDafim} title={title} onBack={goBack} />;
    }

    if (activeMode.type === "truefalse") {
      return <TrueFalseQuiz dafim={dafim} allDafim={allDafim} title={title} onBack={goBack} />;
    }

    if (activeMode.type === "image") {
      return <ImageQuiz dafim={dafim} allDafim={allDafim} title={title} imageFolder={masechta.imageFolder} onBack={goBack} />;
    }

    if (activeMode.type === "whatdaf") {
      return <WhatDafQuiz dafim={dafim} allDafim={allDafim} title={title} onBack={goBack} />;
    }

    if (activeMode.type === "journey") {
      return <SugyaSimulator dafim={dafim} allDafim={allDafim} title={title} onBack={goBack} imageFolder={masechta.imageFolder} />;
    }
  }

  // ── Game type picker ──
  if (pickedScope !== null) {
    const perekName =
      pickedScope === "all"
        ? `All Dafim (${TOTAL_DAFIM_VAL})`
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
            <button
              onClick={() => {
                setSelectedMasechta(null);
                setRatings({});
              }}
              className="text-white/70 hover:text-white text-xl font-light"
            >
              &larr;
            </button>
            <div className="flex-1" />
            <span className="text-sm text-white/60 font-medium">Zichru</span>
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-1" dir="rtl">{MASECHTA_NAME_VAL}</h1>
            <p className="text-white/70 text-sm">
              {MASECHTA_NAME_EN_VAL} &middot; {TOTAL_DAFIM_VAL} Dafim &middot; {prakim.length} Prakim
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
              <span className="text-sm text-gray-500">{totalRated}/{TOTAL_DAFIM_VAL} reviewed</span>
            </div>
            <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden flex">
              {knew > 0 && (
                <div className="h-full bg-duo-green transition-all" style={{ width: `${(knew / TOTAL_DAFIM_VAL) * 100}%` }} />
              )}
              {partial > 0 && (
                <div className="h-full bg-duo-gold transition-all" style={{ width: `${(partial / TOTAL_DAFIM_VAL) * 100}%` }} />
              )}
              {forgot > 0 && (
                <div className="h-full bg-duo-red transition-all" style={{ width: `${(forgot / TOTAL_DAFIM_VAL) * 100}%` }} />
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
          All {TOTAL_DAFIM_VAL} Dafim &rarr;
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
                  saveRatings(masechta.storageKey, {});
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
