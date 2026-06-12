"use client";

import { useState, useMemo } from "react";
import type { Daf } from "../data/yevamos";

interface StoryDetectiveProps {
  dafim: Daf[];
  allDafim: Daf[];
  title: string;
  onBack: () => void;
  imageFolder: string;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface PointOption {
  text: string;
  hebrew: string;
  isCorrect: boolean;
}

function buildOptions(daf: Daf, allDafim: Daf[]): PointOption[] {
  const correct: PointOption[] = daf.points.map((p) => ({
    text: p.english,
    hebrew: p.hebrew,
    isCorrect: true,
  }));
  // Distractors from other dafim — prefer the same perek so they're plausible
  const samePerek = allDafim.filter((d) => d.dafNumber !== daf.dafNumber && d.perekNumber === daf.perekNumber);
  const rest = allDafim.filter((d) => d.dafNumber !== daf.dafNumber && d.perekNumber !== daf.perekNumber);
  const pool = [...shuffle(samePerek), ...shuffle(rest)];
  const distractors: PointOption[] = [];
  for (const d of pool) {
    if (distractors.length >= daf.points.length) break;
    const p = d.points[Math.floor(Math.random() * d.points.length)];
    if (p && !distractors.some((x) => x.text === p.english)) {
      distractors.push({ text: p.english, hebrew: p.hebrew, isCorrect: false });
    }
  }
  return shuffle([...correct, ...distractors]);
}

export default function StoryDetective({ dafim, allDafim, title, onBack, imageFolder }: StoryDetectiveProps) {
  const rounds = useMemo(() => dafim.filter((d) => d.points.length > 0), [dafim]);
  const [roundIdx, setRoundIdx] = useState(0);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [checked, setChecked] = useState(false);
  const [totalFound, setTotalFound] = useState(0);
  const [totalPossible, setTotalPossible] = useState(0);
  const [optionsKey, setOptionsKey] = useState(0); // forces option rebuild per round

  const daf = rounds[roundIdx];

  const options = useMemo(
    () => (daf ? buildOptions(daf, allDafim) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [daf, allDafim, optionsKey]
  );

  const needed = daf?.points.length ?? 0;

  const toggle = (i: number) => {
    if (checked) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else if (next.size < needed) next.add(i);
      return next;
    });
  };

  const handleCheck = () => {
    if (selected.size !== needed) return;
    const found = [...selected].filter((i) => options[i].isCorrect).length;
    setTotalFound((t) => t + found);
    setTotalPossible((t) => t + needed);
    setChecked(true);
  };

  const handleNext = () => {
    setSelected(new Set());
    setChecked(false);
    setOptionsKey((k) => k + 1);
    setRoundIdx((i) => i + 1);
  };

  // ── All done ──
  if (!daf) {
    const pct = totalPossible > 0 ? Math.round((totalFound / totalPossible) * 100) : 100;
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
        <div className="text-center animate-bounce-in mb-6">
          <p className="text-6xl mb-3">{pct >= 90 ? "\u{1F575}️" : "\u{1F4AA}"}</p>
          <h2 className="text-2xl font-bold text-gray-800">Case Closed!</h2>
          <p className="text-gray-500 mt-1">{title}</p>
        </div>
        <div className="w-full max-w-sm space-y-3 animate-fade-in-up">
          <div className="flex items-center justify-between p-4 bg-duo-green-light rounded-xl">
            <span className="font-bold text-duo-green-dark">Clues Found</span>
            <span className="text-2xl font-bold text-duo-green-dark">
              {totalFound}/{totalPossible}
            </span>
          </div>
          <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
            <span className="font-bold text-gray-600">Accuracy</span>
            <span className="text-2xl font-bold text-gray-800">{pct}%</span>
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

  const progress = (roundIdx / rounds.length) * 100;
  const foundThisRound = [...selected].filter((i) => options[i].isCorrect).length;
  const imgSrc = `/images/${imageFolder}/daf-${daf.dafNumber}.jpg`;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={onBack} className="text-gray-500 hover:text-gray-800 text-2xl font-light">
            &larr;
          </button>
          <span className="text-sm text-gray-500 font-medium">
            Story {roundIdx + 1}/{rounds.length}
          </span>
          <div className="flex-1" />
          {totalPossible > 0 && (
            <span className="text-sm font-bold text-duo-green">
              {totalFound}/{totalPossible} clues
            </span>
          )}
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500 progress-shimmer" style={{ width: `${progress}%` }} />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-5 max-w-lg mx-auto w-full">
        {/* The story (the clue) */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="w-9 h-9 rounded-lg bg-[#1a3a5c] text-white flex items-center justify-center font-bold">
            {daf.dafHebrew}
          </span>
          <span className="font-bold text-gray-800">{daf.siman}</span>
          <span className="text-gray-400 text-sm" dir="rtl">{daf.simanHebrew}</span>
        </div>
        <img
          src={imgSrc}
          alt={`Daf ${daf.dafHebrew} illustration`}
          loading="lazy"
          className="w-full rounded-xl border border-gray-200 mb-3"
        />
        <div className="bg-amber-50 border-2 border-duo-gold rounded-xl p-4 mb-4">
          <p className="text-sm text-gray-800 leading-relaxed">{daf.story}</p>
        </div>

        <p className="text-center text-sm font-bold text-gray-700 mb-1">
          {"\u{1F50D}"} This story hides {needed} points — find them
        </p>
        <p className="text-center text-xs text-gray-400 mb-4">
          {checked
            ? foundThisRound === needed
              ? "Perfect — you cracked it!"
              : `You found ${foundThisRound} of ${needed}`
            : `Selected ${selected.size}/${needed}`}
        </p>

        {/* Point options */}
        <div className="space-y-2">
          {options.map((opt, i) => {
            const isSelected = selected.has(i);
            let cls = "border-duo-gray bg-white text-gray-800 active:border-b-2 active:mt-[2px]";
            if (!checked && isSelected) {
              cls = "border-duo-blue bg-blue-50 text-duo-blue";
            } else if (checked) {
              if (isSelected && opt.isCorrect) cls = "border-duo-green bg-duo-green-light text-duo-green-dark";
              else if (isSelected && !opt.isCorrect) cls = "border-duo-red bg-duo-red-light text-duo-red animate-shake";
              else if (opt.isCorrect) cls = "border-duo-green bg-white text-duo-green-dark";
              else cls = "border-gray-200 bg-white text-gray-400";
            }
            return (
              <button
                key={i}
                onClick={() => toggle(i)}
                disabled={checked}
                className={`w-full py-3 px-4 rounded-xl border-2 border-b-4 font-bold text-left text-sm transition-all ${cls}`}
              >
                {opt.text}
                {checked && opt.isCorrect && !isSelected && (
                  <span className="block text-xs font-normal mt-1">{"⬆️"} This one was hiding in the story</span>
                )}
              </button>
            );
          })}
        </div>

        {!checked ? (
          <button
            onClick={handleCheck}
            disabled={selected.size !== needed}
            className={`mt-5 w-full py-3 rounded-xl border-2 border-b-4 font-bold text-white transition-all ${
              selected.size === needed
                ? "border-duo-green bg-duo-green active:border-b-2 active:mt-[2px]"
                : "border-gray-300 bg-gray-300"
            }`}
          >
            Check {"\u{1F50D}"}
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="mt-5 w-full py-3 rounded-xl border-2 border-b-4 border-duo-green bg-duo-green text-white font-bold animate-slide-up active:border-b-2 active:mt-[2px] transition-all"
          >
            {roundIdx + 1 >= rounds.length ? "See Results" : "Next Story →"}
          </button>
        )}
      </div>
    </div>
  );
}
