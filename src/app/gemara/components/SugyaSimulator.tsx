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

import { useState, useMemo, useCallback } from "react";
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
  const [act, setAct] = useState(0); // 0=scene, 1..3=points, 4=connections
  const [revealedPoints, setRevealedPoints] = useState<Set<number>>(new Set());
  const [thinkingPoint, setThinkingPoint] = useState<number | null>(null);
  // ── PART 2: AI Chavrusa panel state ──
  const [aiOpen, setAiOpen] = useState(false);

  const imageSrc = `/images/${imageFolder}/daf-${daf.dafNumber}.jpg`;

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
    // Sort by most shared concepts, then by proximity
    return Array.from(connected.values())
      .sort((a, b) => {
        if (b.sharedConcepts.length !== a.sharedConcepts.length)
          return b.sharedConcepts.length - a.sharedConcepts.length;
        return (
          Math.abs(a.daf.dafNumber - daf.dafNumber) -
          Math.abs(b.daf.dafNumber - daf.dafNumber)
        );
      })
      .slice(0, 8);
  }, [dafConcepts, daf.dafNumber, allDafim]);

  const handleRevealPoint = (idx: number) => {
    setThinkingPoint(null);
    setRevealedPoints((prev) => new Set([...prev, idx]));
  };

  const handleThink = (idx: number) => {
    setThinkingPoint(idx);
  };

  const totalActs = daf.points.length + 2; // scene + N points + connections
  const progress = ((act + 1) / totalActs) * 100;

  // Navigation between dafim in the set
  const dafIndex = allDafim.findIndex((d) => d.dafNumber === daf.dafNumber);
  const prevDaf = dafIndex > 0 ? allDafim[dafIndex - 1] : null;
  const nextDaf = dafIndex < allDafim.length - 1 ? allDafim[dafIndex + 1] : null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3 max-w-3xl mx-auto">
          <button
            onClick={onBack}
            className="text-gray-500 hover:text-gray-800 text-2xl font-light"
          >
            &larr;
          </button>
          <div className="flex-1">
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1a3a5c] rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <span className="text-sm text-gray-400 font-medium ml-2">
            {act + 1}/{totalActs}
          </span>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-6">
          {/* ── ACT 0: The Scene ── */}
          {act === 0 && (
            <div className="animate-fade-in-up">
              {/* Siman hero */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#1a3a5c]/10 text-[#1a3a5c] text-sm font-medium mb-4">
                  {daf.perekNameHebrew} &middot; Perek {daf.perekNumber}
                </div>
                <div className="text-8xl font-bold text-[#1a3a5c] mb-2 animate-pop-in">
                  {daf.dafHebrew}
                </div>
                <h2 className="text-2xl font-bold text-gray-800">{daf.siman}</h2>
                <p className="text-sm text-gray-500 mt-1" dir="rtl">
                  {daf.simanHebrew}
                </p>
              </div>

              {/* Image */}
              <div className="rounded-2xl overflow-hidden border-2 border-gray-200 bg-white mb-5">
                <img
                  src={imageSrc}
                  alt={`Daf ${daf.dafHebrew} - ${daf.siman}`}
                  className="w-full h-auto"
                />
              </div>

              {/* Story */}
              {daf.story && (
                <div className="bg-amber-50 rounded-2xl border-2 border-amber-200 p-5 mb-6 animate-fade-in-up" style={{ animationDelay: "0.2s", animationFillMode: "both" }}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">📖</span>
                    <h3 className="font-bold text-amber-800">The Story</h3>
                  </div>
                  <p className="text-amber-900 leading-relaxed">{daf.story}</p>
                </div>
              )}

              {/* Teaser */}
              <div className="bg-[#1a3a5c]/5 rounded-2xl border-2 border-[#1a3a5c]/20 p-5 animate-fade-in-up" style={{ animationDelay: "0.35s", animationFillMode: "both" }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">🤔</span>
                  <h3 className="font-bold text-[#1a3a5c]">What&apos;s on this Daf?</h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  This daf covers <strong>{daf.points.length} key topics</strong>.
                  In the next steps, you&apos;ll encounter each one — but first,
                  try to recall or predict what they might be before revealing them.
                </p>
                {daf.points[0]?.english && (
                  <p className="text-gray-500 text-sm mt-3 italic">
                    Hint: The first topic relates to&hellip; &quot;{daf.points[0].english.split(" ").slice(0, 4).join(" ")}&hellip;&quot;
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ── ACT 1-3: The Points (interactive reveals) ── */}
          {act >= 1 && act <= daf.points.length && (() => {
            const pointIndex = act - 1;
            const point = daf.points[pointIndex];
            if (!point) return null;
            const isRevealed = revealedPoints.has(pointIndex);
            const isThinking = thinkingPoint === pointIndex;

            return (
              <div className="animate-fade-in-up" key={`point-${pointIndex}`}>
                {/* Point header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-[#1a3a5c] text-white flex items-center justify-center text-lg font-bold">
                    {pointIndex + 1}
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">
                      Point {pointIndex + 1} of {daf.points.length}
                    </p>
                    <p className="text-xs text-gray-400">
                      Daf {daf.dafHebrew} &middot; {daf.siman}
                    </p>
                  </div>
                </div>

                {/* The challenge */}
                {!isRevealed && !isThinking && (
                  <div className="animate-fade-in">
                    <div className="bg-gradient-to-br from-[#1a3a5c] to-[#0d1f33] rounded-2xl p-6 text-white text-center mb-6">
                      <span className="text-4xl mb-4 block">🧠</span>
                      <h3 className="text-xl font-bold mb-2">
                        Can you recall point #{pointIndex + 1}?
                      </h3>
                      <p className="text-blue-200 text-sm">
                        Think about what the {pointIndex + 1}
                        {pointIndex === 0 ? "st" : pointIndex === 1 ? "nd" : "rd"}{" "}
                        topic on Daf {daf.dafHebrew} ({daf.siman}) is about.
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleThink(pointIndex)}
                        className="flex-1 py-4 rounded-xl border-2 border-b-4 border-duo-gold bg-amber-50 text-amber-700 font-bold active:border-b-2 active:mt-[2px] transition-all"
                      >
                        Let me think&hellip;
                      </button>
                      <button
                        onClick={() => handleRevealPoint(pointIndex)}
                        className="flex-1 py-4 rounded-xl border-2 border-b-4 border-[#1a3a5c] bg-white text-[#1a3a5c] font-bold active:border-b-2 active:mt-[2px] transition-all"
                      >
                        Show me
                      </button>
                    </div>
                  </div>
                )}

                {/* Thinking mode */}
                {isThinking && !isRevealed && (
                  <div className="animate-fade-in">
                    <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 text-center mb-6">
                      <span className="text-4xl mb-3 block animate-pulse-slow">💭</span>
                      <h3 className="text-lg font-bold text-amber-800 mb-2">
                        Take your time&hellip;
                      </h3>
                      <p className="text-amber-700 text-sm">
                        Picture the <strong>{daf.siman}</strong> in your mind.
                        What was the {pointIndex + 1}
                        {pointIndex === 0 ? "st" : pointIndex === 1 ? "nd" : "rd"}{" "}
                        key discussion on this daf?
                      </p>
                    </div>

                    <button
                      onClick={() => handleRevealPoint(pointIndex)}
                      className="w-full py-4 rounded-xl border-2 border-b-4 border-duo-green bg-duo-green text-white font-bold text-lg active:border-b-2 active:mt-[2px] transition-all"
                    >
                      Reveal the answer
                    </button>
                  </div>
                )}

                {/* Revealed point */}
                {isRevealed && (
                  <div className="animate-pop-in">
                    <div className="bg-white border-2 border-duo-green rounded-2xl p-6 mb-4">
                      <div className="flex items-start gap-3 mb-4">
                        <span className="text-2xl">✅</span>
                        <div className="flex-1">
                          <p
                            className="text-lg font-bold text-gray-800 leading-snug mb-2"
                            dir="rtl"
                          >
                            {point.hebrew}
                          </p>
                          {point.english && (
                            <p className="text-gray-600 leading-relaxed">
                              {point.english}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Previously revealed points */}
                    {pointIndex > 0 && (
                      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 mb-4">
                        <p className="text-xs text-gray-400 font-medium mb-3 uppercase tracking-wide">
                          Previously covered
                        </p>
                        {daf.points.slice(0, pointIndex).map((prevPoint, pi) => (
                          <div
                            key={pi}
                            className="flex items-start gap-2 mb-2 last:mb-0"
                          >
                            <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-500 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                              {pi + 1}
                            </span>
                            <p className="text-sm text-gray-500">
                              {prevPoint.english || prevPoint.hebrew}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()}

          {/* ── ACT 4: Connections ── */}
          {act === daf.points.length + 1 && (
            <div className="animate-fade-in-up">
              {/* Summary card */}
              <div className="bg-gradient-to-br from-[#1a3a5c] to-[#0d1f33] rounded-2xl p-6 text-white mb-6">
                <div className="text-center mb-4">
                  <span className="text-4xl mb-2 block">🎯</span>
                  <h3 className="text-xl font-bold">
                    Daf {daf.dafHebrew} — {daf.siman}
                  </h3>
                  <p className="text-blue-200 text-sm mt-1">Complete!</p>
                </div>

                <div className="space-y-3">
                  {daf.points.map((point, i) => (
                    <div key={i} className="flex items-start gap-3 animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s`, animationFillMode: "both" }}>
                      <span className="w-6 h-6 rounded-full bg-white/20 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-white/90 text-sm font-medium" dir="rtl">
                          {point.hebrew}
                        </p>
                        {point.english && (
                          <p className="text-blue-200 text-xs mt-0.5">
                            {point.english}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Concept connections */}
              {dafConcepts.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <span>🔗</span> Concepts on this Daf
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {dafConcepts.map((c) => (
                      <span
                        key={c.id}
                        className="px-3 py-1.5 rounded-full bg-[#1a3a5c]/10 text-[#1a3a5c] text-sm font-medium"
                      >
                        {c.name}{" "}
                        <span className="text-[#1a3a5c]/50">
                          ({c.dafNumbers.length} dafim)
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Connected dafim */}
              {connectedDafim.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <span>🌐</span> Related Dafim
                  </h3>
                  <div className="space-y-2">
                    {connectedDafim.map(({ daf: cd, sharedConcepts }, i) => (
                      <button
                        key={cd.dafNumber}
                        onClick={() => onNavigate(cd)}
                        className="w-full text-left p-3 rounded-xl border-2 border-gray-200 bg-white hover:border-[#1a3a5c] active:border-b-2 transition-all flex items-center gap-3 animate-fade-in-up"
                        style={{ animationDelay: `${i * 0.05}s`, animationFillMode: "both" }}
                      >
                        <span className="w-10 h-10 rounded-lg bg-[#1a3a5c]/10 text-[#1a3a5c] font-bold text-lg flex items-center justify-center flex-shrink-0">
                          {cd.dafHebrew}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-800 text-sm">
                            Daf {cd.dafHebrew} — {cd.siman}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            Shared: {sharedConcepts.join(", ")}
                          </p>
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
                  <button
                    onClick={() => onNavigate(prevDaf)}
                    className="flex-1 py-3 rounded-xl border-2 border-b-4 border-gray-300 bg-white text-gray-600 font-bold active:border-b-2 active:mt-[2px] transition-all"
                  >
                    &larr; Daf {prevDaf.dafHebrew}
                  </button>
                )}
                {nextDaf && (
                  <button
                    onClick={() => onNavigate(nextDaf)}
                    className="flex-1 py-3 rounded-xl border-2 border-b-4 border-[#1a3a5c] bg-[#1a3a5c] text-white font-bold active:border-b-2 active:mt-[2px] transition-all"
                  >
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
          {act > 0 && (
            <button
              onClick={() => {
                setAct((a) => a - 1);
                setThinkingPoint(null);
              }}
              className="flex-1 py-3 rounded-xl border-2 border-b-4 border-gray-300 bg-white text-gray-600 font-bold active:border-b-2 active:mt-[2px] transition-all"
            >
              Back
            </button>
          )}
          {/* ── PART 2: AI Chavrusa button ── */}
          <button
            onClick={() => setAiOpen(true)}
            className="py-3 px-4 rounded-xl border-2 border-b-4 border-emerald-400 bg-emerald-50 text-emerald-700 font-bold active:border-b-2 active:mt-[2px] transition-all text-sm"
          >
            🤖 AI
          </button>
          {act < totalActs - 1 && (
            <button
              onClick={() => {
                setAct((a) => a + 1);
                setThinkingPoint(null);
              }}
              disabled={
                act >= 1 &&
                act <= daf.points.length &&
                !revealedPoints.has(act - 1)
              }
              className="flex-1 py-3 rounded-xl border-2 border-b-4 border-[#1a3a5c] bg-[#1a3a5c] text-white font-bold active:border-b-2 active:mt-[2px] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
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
