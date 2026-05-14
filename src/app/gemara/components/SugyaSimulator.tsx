"use client";

/**
 * ═══════════════════════════════════════════════════════════
 *  PART 1 — SUGYA SIMULATOR  (No AI required)
 *
 *  Three sub-views:
 *    1. Map View    – visual masechta overview, siman per daf
 *    2. Journey     – interactive 3-act per-daf deep dive
 *    3. Concept Web – cross-reference explorer
 * ═══════════════════════════════════════════════════════════
 */

import { useState, useMemo, useCallback, useEffect } from "react";
import type { Daf, Perek } from "../data/yevamos";
// ── PART 2 import (AI Chavrusa) ──
import AIChavrusa from "./AIChavrusa";

// ── Concept extraction ─────────────────────────────────────

interface Concept {
  id: string;
  name: string;
  nameHebrew: string;
  dafNumbers: number[];
}

const CONCEPT_KEYWORDS: { id: string; name: string; nameHebrew: string; patterns: RegExp }[] = [
  { id: "yibum", name: "Yibum", nameHebrew: "יבום", patterns: /\byibum\b|יבום|יבמ/i },
  { id: "chalitzah", name: "Chalitzah", nameHebrew: "חליצה", patterns: /\bchalitzah\b|חליצ/i },
  { id: "ervah", name: "Ervah / Arayos", nameHebrew: "ערוה", patterns: /\bervah\b|\barayos\b|ערו[הת]|עריות/i },
  { id: "tzarah", name: "Tzarah (Co-wife)", nameHebrew: "צרה", patterns: /\btzar[ao][hs]?\b|צר[הו]ת|צרה/i },
  { id: "kohen", name: "Kohen / Kehunah", nameHebrew: "כהן", patterns: /\bkohen\b|\bkehun/i },
  { id: "terumah", name: "Terumah", nameHebrew: "תרומה", patterns: /\bterumah?\b|תרומ/i },
  { id: "mamzer", name: "Mamzer", nameHebrew: "ממזר", patterns: /\bmamzer\b|ממזר/i },
  { id: "maamar", name: "Maamar", nameHebrew: "מאמר", patterns: /\bmaamar\b|מאמר/i },
  { id: "get", name: "Get (Divorce)", nameHebrew: "גט", patterns: /\bget\b|גט\b|גירוש/i },
  { id: "mishnah", name: "Mishnah Analysis", nameHebrew: "משנה", patterns: /\bmishnah\b|משנה/i },
  { id: "machlokes", name: "Machlokes", nameHebrew: "מחלוקת", patterns: /\bmachlokes\b|מחלוק/i },
  { id: "conversion", name: "Conversion (Geirus)", nameHebrew: "גירות", patterns: /\bconver[st]/i },
  { id: "kiddushin", name: "Kiddushin", nameHebrew: "קידושין", patterns: /\bkiddush/i },
  { id: "eved", name: "Eved / Slavery", nameHebrew: "עבד", patterns: /\beved\b|עבד/i },
  { id: "milah", name: "Milah / Bris", nameHebrew: "מילה", patterns: /\bmilah?\b|מילה|ערל/i },
  { id: "witnesses", name: "Witnesses (Eidim)", nameHebrew: "עדים", patterns: /\bwitness/i },
  { id: "inheritance", name: "Inheritance", nameHebrew: "ירושה", patterns: /\binheritanc/i },
  { id: "kesubah", name: "Kesubah", nameHebrew: "כתובה", patterns: /\bkesubah?\b|כתובת|כתובה/i },
];

function extractConcepts(allDafim: Daf[]): Concept[] {
  const concepts: Concept[] = [];
  for (const kw of CONCEPT_KEYWORDS) {
    const matchingDafim: number[] = [];
    for (const daf of allDafim) {
      const allText = [
        ...daf.points.map((p) => p.english),
        ...daf.points.map((p) => p.hebrew),
        daf.story,
      ].join(" ");
      if (kw.patterns.test(allText)) {
        matchingDafim.push(daf.dafNumber);
      }
    }
    if (matchingDafim.length >= 2) {
      concepts.push({
        id: kw.id,
        name: kw.name,
        nameHebrew: kw.nameHebrew,
        dafNumbers: matchingDafim,
      });
    }
  }
  return concepts.sort((a, b) => b.dafNumbers.length - a.dafNumbers.length);
}

// ── Types ──────────────────────────────────────────────────

type SubView = "map" | "journey" | "concepts";

interface SugyaSimulatorProps {
  dafim: Daf[];
  allDafim: Daf[];
  title: string;
  onBack: () => void;
  imageFolder?: string;
}

// ── Map View ───────────────────────────────────────────────

function MapView({
  dafim,
  prakim,
  onSelectDaf,
}: {
  dafim: Daf[];
  prakim: Perek[];
  onSelectDaf: (daf: Daf) => void;
}) {
  return (
    <div className="px-4 py-6 max-w-3xl mx-auto">
      <div className="text-center mb-6 animate-fade-in">
        <p className="text-sm text-gray-500">
          Tap any daf to begin the interactive journey
        </p>
      </div>

      {prakim.map((perek) => (
        <div key={perek.number} className="mb-8 animate-fade-in-up">
          {/* Perek header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-[#1a3a5c] text-white flex items-center justify-center text-sm font-bold">
              {perek.number}
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-base" dir="rtl">
                פרק {perek.number} — {perek.nameHebrew}
              </h3>
              <p className="text-xs text-gray-500">{perek.name}</p>
            </div>
          </div>

          {/* Daf grid */}
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
            {perek.dafim
              .filter((d) => dafim.some((dd) => dd.dafNumber === d.dafNumber))
              .map((daf, i) => (
                <button
                  key={daf.dafNumber}
                  onClick={() => onSelectDaf(daf)}
                  className="flex flex-col items-center gap-1 p-2 rounded-xl border-2 border-b-4 border-gray-200 bg-white hover:border-[#1a3a5c] active:border-b-2 active:mt-[2px] transition-all group"
                  style={{
                    animationDelay: `${i * 0.03}s`,
                    animationFillMode: "both",
                  }}
                >
                  <span className="text-2xl font-bold text-[#1a3a5c] group-hover:scale-110 transition-transform">
                    {daf.dafHebrew}
                  </span>
                  <span className="text-[10px] text-gray-500 leading-tight text-center truncate w-full">
                    {daf.siman}
                  </span>
                </button>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Journey Mode ───────────────────────────────────────────
// Redesigned: TEACHES the material step-by-step instead of testing recall.
// Flow: Intro → Learn each point (with AI explanation) → Decode the story → Check yourself → Connections

const POINT_COLORS = [
  { bg: "bg-blue-50", border: "border-blue-300", text: "text-blue-800", badge: "bg-blue-600", light: "text-blue-600", highlight: "bg-blue-100" },
  { bg: "bg-emerald-50", border: "border-emerald-300", text: "text-emerald-800", badge: "bg-emerald-600", light: "text-emerald-600", highlight: "bg-emerald-100" },
  { bg: "bg-violet-50", border: "border-violet-300", text: "text-violet-800", badge: "bg-violet-600", light: "text-violet-600", highlight: "bg-violet-100" },
];

function JourneyMode({
  daf,
  allDafim,
  concepts,
  onBack,
  onNavigate,
  imageFolder,
}: {
  daf: Daf;
  allDafim: Daf[];
  concepts: Concept[];
  onBack: () => void;
  onNavigate: (daf: Daf) => void;
  imageFolder: string;
}) {
  // Steps: 0=intro, 1..N=learn each point, N+1=decode story, N+2=check yourself, N+3=connections
  const numPoints = daf.points.length;
  const STEP_INTRO = 0;
  const STEP_FIRST_POINT = 1;
  const STEP_LAST_POINT = numPoints;
  const STEP_DECODE = numPoints + 1;
  const STEP_CHECK = numPoints + 2;
  const STEP_CONNECTIONS = numPoints + 3;
  const totalSteps = numPoints + 4;

  const [step, setStep] = useState(0);
  // ── PART 2: AI Chavrusa panel state ──
  const [aiOpen, setAiOpen] = useState(false);
  // ── PART 2: AI auto-explain for each point ──
  const [aiExplanations, setAiExplanations] = useState<Record<number, string>>({});
  const [aiLoading, setAiLoading] = useState<Record<number, boolean>>({});
  // Check-yourself quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number | null>>({});
  const [quizRevealed, setQuizRevealed] = useState<Set<number>>(new Set());

  const imageSrc = `/images/${imageFolder}/daf-${daf.dafNumber}.jpg`;
  const progress = ((step + 1) / totalSteps) * 100;

  // Navigation between dafim in the set
  const dafIndex = allDafim.findIndex((d) => d.dafNumber === daf.dafNumber);
  const prevDaf = dafIndex > 0 ? allDafim[dafIndex - 1] : null;
  const nextDaf = dafIndex < allDafim.length - 1 ? allDafim[dafIndex + 1] : null;

  // Find concepts this daf participates in
  const dafConcepts = useMemo(
    () => concepts.filter((c) => c.dafNumbers.includes(daf.dafNumber)),
    [concepts, daf.dafNumber]
  );

  // Find connected dafim through shared concepts
  const connectedDafim = useMemo(() => {
    const connected = new Map<number, { daf: Daf; sharedConcepts: string[] }>();
    for (const concept of dafConcepts) {
      for (const dafNum of concept.dafNumbers) {
        if (dafNum === daf.dafNumber) continue;
        const d = allDafim.find((dd) => dd.dafNumber === dafNum);
        if (!d) continue;
        const existing = connected.get(dafNum);
        if (existing) {
          existing.sharedConcepts.push(concept.name);
        } else {
          connected.set(dafNum, { daf: d, sharedConcepts: [concept.name] });
        }
      }
    }
    return Array.from(connected.values())
      .sort((a, b) => {
        if (b.sharedConcepts.length !== a.sharedConcepts.length)
          return b.sharedConcepts.length - a.sharedConcepts.length;
        return Math.abs(a.daf.dafNumber - daf.dafNumber) - Math.abs(b.daf.dafNumber - daf.dafNumber);
      })
      .slice(0, 8);
  }, [dafConcepts, daf.dafNumber, allDafim]);

  // Build a simple comprehension quiz from the daf data
  const quizQuestions = useMemo(() => {
    // For each point, create a question: "Which of these is discussed on this daf?"
    // One correct answer (from this daf), others from neighboring dafim
    return daf.points.map((point, i) => {
      const distractors: string[] = [];
      for (const other of allDafim) {
        if (other.dafNumber === daf.dafNumber) continue;
        for (const op of other.points) {
          if (op.english && distractors.length < 2) {
            distractors.push(op.english);
          }
        }
        if (distractors.length >= 2) break;
      }
      const correctText = point.english || point.hebrew;
      const choices = [correctText, ...distractors.slice(0, 2)];
      // Shuffle deterministically based on daf+point index
      const seed = daf.dafNumber * 10 + i;
      const shuffled = choices.map((c, ci) => ({ text: c, orig: ci }))
        .sort((a, b) => {
          const ha = ((a.orig + seed) * 2654435761) >>> 0;
          const hb = ((b.orig + seed) * 2654435761) >>> 0;
          return ha - hb;
        });
      const correctIdx = shuffled.findIndex(s => s.orig === 0);
      return { question: `Point ${i + 1}: Which topic is on Daf ${daf.dafHebrew} (${daf.siman})?`, choices: shuffled.map(s => s.text), correctIdx };
    });
  }, [daf, allDafim]);

  // ── PART 2: On-demand AI explanation fetch ──
  const fetchExplanation = useCallback((pointIndex: number) => {
    if (aiExplanations[pointIndex] || aiLoading[pointIndex]) return;
    setAiLoading(prev => ({ ...prev, [pointIndex]: true }));
    fetch("/api/chavrusa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "explain",
        pointIndex,
        depth: "simple",
        daf: {
          dafNumber: daf.dafNumber, dafHebrew: daf.dafHebrew,
          siman: daf.siman, simanHebrew: daf.simanHebrew,
          perekName: daf.perekName, perekNameHebrew: daf.perekNameHebrew,
          points: daf.points, story: daf.story,
        },
      }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.reply) setAiExplanations(prev => ({ ...prev, [pointIndex]: data.reply }));
      })
      .catch(() => {})
      .finally(() => setAiLoading(prev => ({ ...prev, [pointIndex]: false })));
  }, [daf, aiExplanations, aiLoading]);

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3 max-w-3xl mx-auto">
          <button onClick={onBack} className="text-gray-500 hover:text-gray-800 text-2xl font-light">&larr;</button>
          <div className="flex-1">
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#1a3a5c] rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <span className="text-sm text-gray-400 font-medium ml-2">{step + 1}/{totalSteps}</span>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-6">

          {/* ═══ STEP 0: INTRODUCTION — Meet the Daf ═══ */}
          {step === STEP_INTRO && (
            <div className="animate-fade-in-up">
              {/* The mnemonic system explained */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#1a3a5c]/10 text-[#1a3a5c] text-sm font-medium mb-4">
                  {daf.perekNameHebrew} &middot; Perek {daf.perekNumber}
                </div>
                <div className="text-8xl font-bold text-[#1a3a5c] mb-2 animate-pop-in">{daf.dafHebrew}</div>
                <h2 className="text-2xl font-bold text-gray-800">{daf.siman}</h2>
                <p className="text-sm text-gray-500 mt-1" dir="rtl">{daf.simanHebrew}</p>
              </div>

              {/* How the mnemonic works */}
              <div className="bg-[#1a3a5c]/5 rounded-2xl border-2 border-[#1a3a5c]/20 p-5 mb-5 animate-fade-in-up" style={{ animationDelay: "0.15s", animationFillMode: "both" }}>
                <h3 className="font-bold text-[#1a3a5c] mb-2">How the Siman Works</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  The letter <strong className="text-[#1a3a5c] text-lg">{daf.dafHebrew}</strong> is Daf {daf.dafNumber} in the masechta.
                  The word <strong>&quot;{daf.siman}&quot;</strong> ({daf.simanHebrew}) starts with the letter <strong>{daf.dafHebrew}</strong>,
                  creating a visual anchor. The story below weaves this image together with the {numPoints} key topics
                  you&apos;re about to learn.
                </p>
              </div>

              {/* Image */}
              <div className="rounded-2xl overflow-hidden border-2 border-gray-200 bg-white mb-0 animate-fade-in-up" style={{ animationDelay: "0.25s", animationFillMode: "both" }}>
                <img src={imageSrc} alt={`Daf ${daf.dafHebrew} - ${daf.siman}`} className="w-full h-auto" />
              </div>

              {/* Siman label — yellow box like the Zichru PDF */}
              <div className="bg-amber-100 border-2 border-amber-300 rounded-2xl px-5 py-3 mb-5 flex items-center justify-center gap-3 animate-fade-in-up" style={{ animationDelay: "0.3s", animationFillMode: "both" }}>
                <span className="text-2xl font-bold text-[#1a3a5c]">{daf.dafHebrew}</span>
                <span className="text-amber-400 text-lg">|</span>
                <span className="text-lg font-bold text-amber-900">{daf.siman}</span>
                <span className="text-amber-400 text-lg">|</span>
                <span className="text-lg font-bold text-amber-800" dir="rtl">{daf.simanHebrew}</span>
              </div>

              {/* What you'll learn */}
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-5 animate-fade-in-up" style={{ animationDelay: "0.35s", animationFillMode: "both" }}>
                <h3 className="font-bold text-gray-800 mb-3">What You&apos;ll Learn</h3>
                <div className="space-y-2.5">
                  {daf.points.map((point, i) => {
                    const color = POINT_COLORS[i % POINT_COLORS.length];
                    return (
                      <div key={i} className={`flex items-start gap-3 p-3 rounded-xl ${color.bg} border ${color.border}`}>
                        <span className={`w-7 h-7 rounded-full ${color.badge} text-white text-sm font-bold flex items-center justify-center flex-shrink-0 mt-0.5`}>{i + 1}</span>
                        <div>
                          {point.english && <p className={`text-sm font-medium ${color.text}`}>{point.english}</p>}
                          <p className="text-xs text-gray-500 mt-0.5" dir="rtl">{point.hebrew}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ═══ STEPS 1-N: LEARN EACH POINT ═══ */}
          {step >= STEP_FIRST_POINT && step <= STEP_LAST_POINT && (() => {
            const pi = step - 1;
            const point = daf.points[pi];
            if (!point) return null;
            const color = POINT_COLORS[pi % POINT_COLORS.length];

            return (
              <div className="animate-fade-in-up" key={`learn-${pi}`}>
                {/* Point badge */}
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-10 h-10 rounded-full ${color.badge} text-white flex items-center justify-center text-lg font-bold`}>{pi + 1}</div>
                  <div>
                    <p className={`text-sm font-bold ${color.light}`}>Point {pi + 1} of {numPoints}</p>
                    <p className="text-xs text-gray-400">Daf {daf.dafHebrew} &middot; {daf.siman}</p>
                  </div>
                </div>

                {/* The point content — presented as teaching, not testing */}
                <div className={`rounded-2xl border-2 ${color.border} ${color.bg} p-6 mb-5`}>
                  <p className="text-xl font-bold text-gray-800 leading-snug mb-3" dir="rtl">{point.hebrew}</p>
                  {point.english && <p className={`text-base ${color.text} leading-relaxed font-medium`}>{point.english}</p>}
                </div>

                {/* ── PART 2: AI explanation (on-demand) ── */}
                <div className="mb-5">
                  {aiLoading[pi] && (
                    <div className="bg-white rounded-2xl border-2 border-gray-200 p-5 animate-fade-in">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-lg">🤖</span>
                        <span className="text-sm font-bold text-gray-500">AI Chavrusa is explaining...</span>
                      </div>
                      <div className="h-4 bg-gray-100 rounded animate-pulse-slow mb-2 w-3/4" />
                      <div className="h-4 bg-gray-100 rounded animate-pulse-slow mb-2 w-full" />
                      <div className="h-4 bg-gray-100 rounded animate-pulse-slow w-2/3" />
                    </div>
                  )}
                  {aiExplanations[pi] && (
                    <div className="bg-white rounded-2xl border-2 border-emerald-200 p-5 animate-fade-in-up">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">🤖</span>
                        <h4 className="font-bold text-emerald-700 text-sm">AI Chavrusa Explains</h4>
                      </div>
                      <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{aiExplanations[pi]}</div>
                    </div>
                  )}
                  {!aiLoading[pi] && !aiExplanations[pi] && (
                    <button
                      onClick={() => fetchExplanation(pi)}
                      className="w-full py-3.5 rounded-xl border-2 border-b-4 border-emerald-400 bg-emerald-50 text-emerald-700 font-bold active:border-b-2 active:mt-[2px] transition-all flex items-center justify-center gap-2"
                    >
                      <span>🤖</span> Ask AI Chavrusa to Explain
                    </button>
                  )}
                </div>

                {/* How this point connects to the siman */}
                <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4 mb-5 animate-fade-in-up" style={{ animationDelay: "0.15s", animationFillMode: "both" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`w-6 h-6 rounded-full ${color.badge} text-white text-xs font-bold flex items-center justify-center`}>{pi + 1}</span>
                    <span className="text-sm font-bold text-amber-700">In the Siman Story</span>
                  </div>
                  <p className="text-sm text-amber-800 leading-relaxed italic">&quot;{daf.story}&quot;</p>
                  <p className="text-xs text-amber-600 mt-2">The siman <strong>{daf.siman}</strong> ({daf.simanHebrew}) anchors all {numPoints} points into one memorable image.</p>
                </div>

                {/* Previously learned points */}
                {pi > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 p-4 animate-fade-in-up" style={{ animationDelay: "0.2s", animationFillMode: "both" }}>
                    <p className="text-xs text-gray-400 font-medium mb-2 uppercase tracking-wide">Already Learned</p>
                    {daf.points.slice(0, pi).map((prev, prevI) => {
                      const pc = POINT_COLORS[prevI % POINT_COLORS.length];
                      return (
                        <div key={prevI} className="flex items-start gap-2 mb-1.5 last:mb-0">
                          <span className={`w-5 h-5 rounded-full ${pc.badge} text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5`}>{prevI + 1}</span>
                          <p className="text-sm text-gray-500">{prev.english || prev.hebrew}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}

          {/* ═══ STEP N+1: DECODE THE STORY ═══ */}
          {step === STEP_DECODE && (
            <div className="animate-fade-in-up">
              <div className="text-center mb-5">
                <span className="text-4xl mb-2 block">📖</span>
                <h2 className="text-xl font-bold text-gray-800">Decode the Story</h2>
                <p className="text-sm text-gray-500 mt-1">Now that you&apos;ve learned the {numPoints} points, see how they all fit into one story.</p>
              </div>

              {/* The full story, highlighted */}
              <div className="bg-amber-50 rounded-2xl border-2 border-amber-300 p-6 mb-5">
                <p className="text-amber-900 text-base leading-relaxed font-medium">&quot;{daf.story}&quot;</p>
              </div>

              {/* Point-by-point story mapping */}
              <div className="space-y-3 mb-5">
                {daf.points.map((point, i) => {
                  const color = POINT_COLORS[i % POINT_COLORS.length];
                  return (
                    <div key={i} className={`flex items-start gap-3 p-4 rounded-xl ${color.bg} border ${color.border} animate-fade-in-up`} style={{ animationDelay: `${i * 0.1}s`, animationFillMode: "both" }}>
                      <span className={`w-7 h-7 rounded-full ${color.badge} text-white text-sm font-bold flex items-center justify-center flex-shrink-0 mt-0.5`}>{i + 1}</span>
                      <div>
                        <p className={`font-bold ${color.text} text-sm`}>{point.english || point.hebrew}</p>
                        <p className="text-xs text-gray-500 mt-1" dir="rtl">{point.hebrew}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* The key insight */}
              <div className="bg-[#1a3a5c]/5 rounded-2xl border-2 border-[#1a3a5c]/20 p-5">
                <h3 className="font-bold text-[#1a3a5c] mb-2">The Memory Anchor</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  When you think of <strong className="text-[#1a3a5c]">&quot;{daf.siman}&quot;</strong>,
                  the story should play in your mind — and each scene in the story maps to a key topic.
                  The letter <strong className="text-[#1a3a5c] text-lg">{daf.dafHebrew}</strong> leads
                  to <strong>{daf.siman}</strong>, which leads to the story, which leads to the {numPoints} points.
                </p>
                <div className="flex items-center justify-center gap-3 mt-4 text-[#1a3a5c] font-bold">
                  <span className="text-2xl">{daf.dafHebrew}</span>
                  <span className="text-gray-300">&rarr;</span>
                  <span>{daf.siman}</span>
                  <span className="text-gray-300">&rarr;</span>
                  <span>Story</span>
                  <span className="text-gray-300">&rarr;</span>
                  <span>{numPoints} Points</span>
                </div>
              </div>
            </div>
          )}

          {/* ═══ STEP N+2: CHECK YOURSELF ═══ */}
          {step === STEP_CHECK && (
            <div className="animate-fade-in-up">
              <div className="text-center mb-5">
                <span className="text-4xl mb-2 block">✅</span>
                <h2 className="text-xl font-bold text-gray-800">Check Yourself</h2>
                <p className="text-sm text-gray-500 mt-1">Now that you&apos;ve learned this daf, see if you can recognize the topics.</p>
              </div>

              <div className="space-y-5">
                {quizQuestions.map((q, qi) => {
                  const answered = quizAnswers[qi] != null;
                  const revealed = quizRevealed.has(qi);
                  const color = POINT_COLORS[qi % POINT_COLORS.length];
                  return (
                    <div key={qi} className="bg-white rounded-2xl border-2 border-gray-200 p-5 animate-fade-in-up" style={{ animationDelay: `${qi * 0.1}s`, animationFillMode: "both" }}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`w-7 h-7 rounded-full ${color.badge} text-white text-sm font-bold flex items-center justify-center`}>{qi + 1}</span>
                        <p className="font-bold text-gray-800 text-sm">{q.question}</p>
                      </div>
                      <div className="space-y-2">
                        {q.choices.map((choice, ci) => {
                          const isSelected = quizAnswers[qi] === ci;
                          const isCorrect = ci === q.correctIdx;
                          let btnClass = "border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-400";
                          if (revealed) {
                            if (isCorrect) btnClass = "border-duo-green bg-duo-green-light text-duo-green-dark";
                            else if (isSelected && !isCorrect) btnClass = "border-duo-red bg-duo-red-light text-duo-red";
                            else btnClass = "border-gray-200 bg-gray-50 text-gray-400";
                          } else if (isSelected) {
                            btnClass = "border-[#1a3a5c] bg-[#1a3a5c]/10 text-[#1a3a5c]";
                          }
                          return (
                            <button
                              key={ci}
                              disabled={revealed}
                              onClick={() => setQuizAnswers(prev => ({ ...prev, [qi]: ci }))}
                              className={`w-full text-left p-3 rounded-xl border-2 text-sm transition-all ${btnClass}`}
                            >
                              {choice}
                            </button>
                          );
                        })}
                      </div>
                      {answered && !revealed && (
                        <button
                          onClick={() => setQuizRevealed(prev => new Set([...prev, qi]))}
                          className={`mt-3 w-full py-2.5 rounded-xl border-2 border-b-4 ${color.border} ${color.bg} ${color.text} font-bold text-sm active:border-b-2 active:mt-[2px] transition-all`}
                        >
                          Check Answer
                        </button>
                      )}
                      {revealed && (
                        <div className={`mt-3 p-3 rounded-xl text-sm ${quizAnswers[qi] === q.correctIdx ? "bg-duo-green-light text-duo-green-dark" : "bg-duo-red-light text-duo-red"}`}>
                          {quizAnswers[qi] === q.correctIdx
                            ? "Correct! You learned this well."
                            : `Not quite — the answer is: "${q.choices[q.correctIdx]}"`
                          }
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═══ STEP N+3: CONNECTIONS ═══ */}
          {step === STEP_CONNECTIONS && (
            <div className="animate-fade-in-up">
              {/* Summary card */}
              <div className="bg-gradient-to-br from-[#1a3a5c] to-[#0d1f33] rounded-2xl p-6 text-white mb-6">
                <div className="text-center mb-4">
                  <span className="text-4xl mb-2 block">🎯</span>
                  <h3 className="text-xl font-bold">Daf {daf.dafHebrew} — {daf.siman}</h3>
                  <p className="text-blue-200 text-sm mt-1">You&apos;ve completed this daf!</p>
                </div>
                <div className="space-y-3">
                  {daf.points.map((point, i) => {
                    const color = POINT_COLORS[i % POINT_COLORS.length];
                    return (
                      <div key={i} className="flex items-start gap-3 animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s`, animationFillMode: "both" }}>
                        <span className={`w-6 h-6 rounded-full ${color.badge} text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5`}>{i + 1}</span>
                        <div>
                          <p className="text-white/90 text-sm font-medium" dir="rtl">{point.hebrew}</p>
                          {point.english && <p className="text-blue-200 text-xs mt-0.5">{point.english}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Concept connections */}
              {dafConcepts.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><span>🔗</span> Concepts on this Daf</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {dafConcepts.map((c) => (
                      <span key={c.id} className="px-3 py-1.5 rounded-full bg-[#1a3a5c]/10 text-[#1a3a5c] text-sm font-medium">
                        {c.name} <span className="text-[#1a3a5c]/50">({c.dafNumbers.length} dafim)</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Connected dafim */}
              {connectedDafim.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><span>🌐</span> Related Dafim</h3>
                  <div className="space-y-2">
                    {connectedDafim.map(({ daf: cd, sharedConcepts }, i) => (
                      <button key={cd.dafNumber} onClick={() => onNavigate(cd)}
                        className="w-full text-left p-3 rounded-xl border-2 border-gray-200 bg-white hover:border-[#1a3a5c] transition-all flex items-center gap-3 animate-fade-in-up"
                        style={{ animationDelay: `${i * 0.05}s`, animationFillMode: "both" }}>
                        <span className="w-10 h-10 rounded-lg bg-[#1a3a5c]/10 text-[#1a3a5c] font-bold text-lg flex items-center justify-center flex-shrink-0">{cd.dafHebrew}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-800 text-sm">Daf {cd.dafHebrew} — {cd.siman}</p>
                          <p className="text-xs text-gray-500 truncate">Shared: {sharedConcepts.join(", ")}</p>
                        </div>
                        <span className="text-gray-300">&rarr;</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigate prev/next */}
              <div className="flex gap-3 mt-6">
                {prevDaf && (
                  <button onClick={() => onNavigate(prevDaf)} className="flex-1 py-3 rounded-xl border-2 border-b-4 border-gray-300 bg-white text-gray-600 font-bold active:border-b-2 active:mt-[2px] transition-all">
                    &larr; Daf {prevDaf.dafHebrew}
                  </button>
                )}
                {nextDaf && (
                  <button onClick={() => onNavigate(nextDaf)} className="flex-1 py-3 rounded-xl border-2 border-b-4 border-[#1a3a5c] bg-[#1a3a5c] text-white font-bold active:border-b-2 active:mt-[2px] transition-all">
                    Daf {nextDaf.dafHebrew} &rarr;
                  </button>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Bottom navigation */}
      <div className="bg-white border-t border-gray-200 px-4 py-3">
        <div className="max-w-2xl mx-auto flex gap-3">
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)} className="flex-1 py-3 rounded-xl border-2 border-b-4 border-gray-300 bg-white text-gray-600 font-bold active:border-b-2 active:mt-[2px] transition-all">
              Back
            </button>
          )}
          {/* ── PART 2: AI Chavrusa button ── */}
          <button onClick={() => setAiOpen(true)} className="py-3 px-4 rounded-xl border-2 border-b-4 border-emerald-400 bg-emerald-50 text-emerald-700 font-bold active:border-b-2 active:mt-[2px] transition-all text-sm">
            🤖 AI
          </button>
          {step < totalSteps - 1 && (
            <button onClick={() => setStep(s => s + 1)} className="flex-1 py-3 rounded-xl border-2 border-b-4 border-[#1a3a5c] bg-[#1a3a5c] text-white font-bold active:border-b-2 active:mt-[2px] transition-all">
              Continue
            </button>
          )}
        </div>
      </div>

      {/* ── PART 2: AI Chavrusa panel ── */}
      <AIChavrusa daf={daf} isOpen={aiOpen} onClose={() => setAiOpen(false)} />
    </div>
  );
}

// ── Concept Web View ───────────────────────────────────────

function ConceptWebView({
  concepts,
  allDafim,
  onSelectDaf,
}: {
  concepts: Concept[];
  allDafim: Daf[];
  onSelectDaf: (daf: Daf) => void;
}) {
  const [expandedConcept, setExpandedConcept] = useState<string | null>(null);

  return (
    <div className="px-4 py-6 max-w-3xl mx-auto">
      <div className="text-center mb-6 animate-fade-in">
        <h2 className="text-xl font-bold text-gray-800 mb-1">Concept Web</h2>
        <p className="text-sm text-gray-500">
          See how topics thread through the masechta
        </p>
      </div>

      <div className="space-y-3">
        {concepts.map((concept, i) => {
          const isExpanded = expandedConcept === concept.id;
          return (
            <div
              key={concept.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${i * 0.04}s`, animationFillMode: "both" }}
            >
              <button
                onClick={() =>
                  setExpandedConcept(isExpanded ? null : concept.id)
                }
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  isExpanded
                    ? "border-[#1a3a5c] bg-[#1a3a5c]/5"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🔗</span>
                    <div>
                      <h3 className="font-bold text-gray-800">
                        {concept.name}
                      </h3>
                      <p className="text-sm text-gray-500" dir="rtl">
                        {concept.nameHebrew}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-[#1a3a5c]/10 text-[#1a3a5c] text-sm font-bold px-2.5 py-1 rounded-full">
                      {concept.dafNumbers.length}
                    </span>
                    <span
                      className={`text-gray-400 transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    >
                      ▼
                    </span>
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="mt-2 ml-4 border-l-2 border-[#1a3a5c]/20 pl-4 pb-2 space-y-2 animate-fade-in">
                  {/* Visual daf chain */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {concept.dafNumbers.map((num) => {
                      const d = allDafim.find(
                        (dd) => dd.dafNumber === num
                      );
                      if (!d) return null;
                      return (
                        <button
                          key={num}
                          onClick={() => onSelectDaf(d)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#1a3a5c] text-white text-sm font-bold hover:bg-[#2a4a6c] transition-colors"
                        >
                          {d.dafHebrew}
                        </button>
                      );
                    })}
                  </div>

                  {/* Detail list */}
                  {concept.dafNumbers.map((num) => {
                    const d = allDafim.find(
                      (dd) => dd.dafNumber === num
                    );
                    if (!d) return null;
                    // Find which point mentions this concept
                    const relevantPoint = d.points.find((p) => {
                      const text = `${p.english} ${p.hebrew}`;
                      return concept.id
                        ? CONCEPT_KEYWORDS.find(
                            (kw) => kw.id === concept.id
                          )?.patterns.test(text)
                        : false;
                    });

                    return (
                      <button
                        key={num}
                        onClick={() => onSelectDaf(d)}
                        className="w-full text-left p-3 rounded-lg bg-white border border-gray-100 hover:border-[#1a3a5c]/30 transition-all flex items-start gap-3"
                      >
                        <span className="w-8 h-8 rounded-md bg-[#1a3a5c]/10 text-[#1a3a5c] font-bold text-sm flex items-center justify-center flex-shrink-0">
                          {d.dafHebrew}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 text-sm">
                            {d.siman}
                          </p>
                          {relevantPoint && (
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                              {relevantPoint.english || relevantPoint.hebrew}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────

export default function SugyaSimulator({
  dafim,
  allDafim,
  title,
  onBack,
  imageFolder = "yevamos",
}: SugyaSimulatorProps) {
  const [subView, setSubView] = useState<SubView>("map");
  const [journeyDaf, setJourneyDaf] = useState<Daf | null>(null);

  const prakim = useMemo(() => {
    const map = new Map<number, Perek>();
    for (const d of dafim) {
      if (!map.has(d.perekNumber)) {
        map.set(d.perekNumber, {
          number: d.perekNumber,
          name: d.perekName,
          nameHebrew: d.perekNameHebrew,
          dafim: [],
        });
      }
      map.get(d.perekNumber)!.dafim.push(d);
    }
    return Array.from(map.values()).sort((a, b) => a.number - b.number);
  }, [dafim]);

  const concepts = useMemo(() => extractConcepts(allDafim), [allDafim]);

  const handleSelectDaf = useCallback((daf: Daf) => {
    setJourneyDaf(daf);
    setSubView("journey");
  }, []);

  const handleNavigate = useCallback((daf: Daf) => {
    setJourneyDaf(daf);
  }, []);

  // Journey mode is full-screen
  if (subView === "journey" && journeyDaf) {
    return (
      <JourneyMode
        key={journeyDaf.dafNumber}
        daf={journeyDaf}
        allDafim={allDafim}
        concepts={concepts}
        onBack={() => {
          setSubView("map");
          setJourneyDaf(null);
        }}
        onNavigate={handleNavigate}
        imageFolder={imageFolder}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-[#1a3a5c] text-white">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={onBack}
              className="text-white/70 hover:text-white text-2xl font-light"
            >
              &larr;
            </button>
            <div className="flex-1" />
            <span className="text-sm text-white/60 font-medium">
              Sugya Simulator
            </span>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold" dir="rtl">
              {title}
            </h1>
            <p className="text-white/60 text-sm mt-1">
              Interactive Journey &middot; {dafim.length} Dafim
            </p>
          </div>
        </div>
      </header>

      {/* Tab bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex">
          {(
            [
              { key: "map", label: "Map", emoji: "🗺️" },
              { key: "concepts", label: "Concepts", emoji: "🔗" },
            ] as { key: SubView; label: string; emoji: string }[]
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSubView(tab.key)}
              className={`flex-1 py-3 text-sm font-bold text-center transition-colors border-b-3 ${
                subView === tab.key
                  ? "border-[#1a3a5c] text-[#1a3a5c]"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab.emoji} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {subView === "map" && (
          <MapView
            dafim={dafim}
            prakim={prakim}
            onSelectDaf={handleSelectDaf}
          />
        )}
        {subView === "concepts" && (
          <ConceptWebView
            concepts={concepts}
            allDafim={allDafim}
            onSelectDaf={handleSelectDaf}
          />
        )}
      </div>
    </div>
  );
}
