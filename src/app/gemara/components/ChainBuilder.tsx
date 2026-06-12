"use client";

import { useState, useMemo, useCallback } from "react";
import type { Daf } from "../data/yevamos";

interface ChainBuilderProps {
  dafim: Daf[];
  title: string;
  onBack: () => void;
  imageFolder: string;
}

// How many recent dafim you rebuild after each new one is added
const RECALL_WINDOW = 6;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function ChainBuilder({ dafim, title, onBack, imageFolder }: ChainBuilderProps) {
  // learnedCount = how many dafim (in order) have been introduced so far
  const [learnedCount, setLearnedCount] = useState(0);
  const [phase, setPhase] = useState<"learn" | "recall" | "done">(dafim.length > 0 ? "learn" : "done");
  const [mistakes, setMistakes] = useState(0);
  const [linksForged, setLinksForged] = useState(0);

  // Recall round state
  const [filled, setFilled] = useState(0); // how many slots of the window are filled
  const [wrongPick, setWrongPick] = useState<number | null>(null);
  const [recallOptions, setRecallOptions] = useState<Daf[]>([]);

  const currentDaf = dafim[learnedCount]; // the daf being taught in "learn" phase

  const windowDafim = useMemo(() => {
    const count = Math.min(learnedCount, RECALL_WINDOW);
    return dafim.slice(learnedCount - count, learnedCount);
  }, [dafim, learnedCount]);

  const startRecall = useCallback((newLearnedCount: number) => {
    const count = Math.min(newLearnedCount, RECALL_WINDOW);
    const window = dafim.slice(newLearnedCount - count, newLearnedCount);
    setRecallOptions(shuffle(window));
    setFilled(0);
    setWrongPick(null);
    setPhase("recall");
  }, [dafim]);

  const handleLearned = () => {
    const next = learnedCount + 1;
    setLearnedCount(next);
    if (next === 1) {
      // Nothing to recall yet — teach the next daf
      if (next >= dafim.length) setPhase("done");
      else setPhase("learn");
    } else {
      startRecall(next);
    }
  };

  const handleRecallPick = (daf: Daf) => {
    if (wrongPick !== null) return;
    const expected = windowDafim[filled];
    if (daf.dafNumber === expected.dafNumber) {
      const nextFilled = filled + 1;
      setFilled(nextFilled);
      setLinksForged((l) => l + 1);
      if (nextFilled >= windowDafim.length) {
        // Window rebuilt — move on
        setTimeout(() => {
          if (learnedCount >= dafim.length) setPhase("done");
          else setPhase("learn");
        }, 700);
      }
    } else {
      setMistakes((m) => m + 1);
      setWrongPick(daf.dafNumber);
      setTimeout(() => setWrongPick(null), 600);
    }
  };

  const progress = dafim.length > 0 ? (learnedCount / dafim.length) * 100 : 100;

  const header = (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center gap-3 mb-2">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-800 text-2xl font-light">
          &larr;
        </button>
        <span className="text-sm text-gray-500 font-medium">{title}</span>
        <div className="flex-1" />
        <span className="text-sm font-bold text-duo-blue">
          {"\u{1F517}"} {learnedCount}/{dafim.length}
        </span>
      </div>
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500 progress-shimmer" style={{ width: `${progress}%` }} />
      </div>
    </header>
  );

  // ── Done ──
  if (phase === "done") {
    const total = linksForged + mistakes;
    const pct = total > 0 ? Math.round((linksForged / total) * 100) : 100;
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
        <div className="text-center animate-bounce-in mb-6">
          <p className="text-6xl mb-3">{pct >= 90 ? "⛓️" : "\u{1F4AA}"}</p>
          <h2 className="text-2xl font-bold text-gray-800">Chain Complete!</h2>
          <p className="text-gray-500 mt-1">{title}</p>
        </div>
        <div className="w-full max-w-sm space-y-3 animate-fade-in-up">
          <div className="flex items-center justify-between p-4 bg-duo-green-light rounded-xl">
            <span className="font-bold text-duo-green-dark">Dafim Chained</span>
            <span className="text-2xl font-bold text-duo-green-dark">{learnedCount}</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
            <span className="font-bold text-gray-600">Recall Accuracy</span>
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

  // ── Learn a new link ──
  if (phase === "learn" && currentDaf) {
    const imgSrc = `/images/${imageFolder}/daf-${currentDaf.dafNumber}.jpg`;
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {header}
        <div className="flex-1 px-4 py-6 max-w-lg mx-auto w-full flex flex-col">
          <p className="text-center text-xs font-bold text-duo-blue tracking-wide mb-3 animate-pop-in">
            NEW LINK IN THE CHAIN
          </p>
          <div className="bg-white rounded-2xl border-2 border-duo-blue p-5 text-center animate-fade-in-up">
            <div className="flex items-center justify-center gap-3">
              <span className="text-4xl font-bold text-[#1a3a5c]" dir="rtl">{currentDaf.dafHebrew}</span>
              <span className="text-2xl text-gray-300">&rarr;</span>
              <div className="text-left">
                <p className="text-2xl font-bold text-gray-800" dir="rtl">{currentDaf.simanHebrew}</p>
                <p className="font-bold text-duo-green-dark">{currentDaf.siman}</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">Daf {currentDaf.dafNumber}</p>
          </div>
          <img
            src={imgSrc}
            alt={`Daf ${currentDaf.dafHebrew} illustration`}
            loading="lazy"
            className="mt-4 w-full rounded-xl border border-gray-200 animate-fade-in-up"
          />
          <div className="mt-4 bg-blue-50 border border-duo-blue rounded-xl p-4">
            <p className="text-sm text-gray-700 leading-relaxed">{currentDaf.story}</p>
          </div>
          <button
            onClick={handleLearned}
            className="mt-5 w-full py-3 rounded-xl border-2 border-b-4 border-duo-blue bg-duo-blue text-white font-bold active:border-b-2 active:mt-[2px] transition-all"
          >
            {learnedCount === 0 ? "Start my chain \u{1F517}" : "Add it — now rebuild the chain \u{1F517}"}
          </button>
        </div>
      </div>
    );
  }

  // ── Recall: rebuild the recent chain in order ──
  const complete = filled >= windowDafim.length;
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {header}
      <div className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
        <p className="text-center text-sm text-gray-600 font-bold mb-1">Rebuild the chain in order</p>
        <p className="text-center text-xs text-gray-400 mb-5">
          Tap the siman for each daf, starting from Daf {windowDafim[0]?.dafHebrew}
        </p>

        {/* Chain slots */}
        <div className="space-y-2 mb-6">
          {windowDafim.map((d, i) => {
            const isFilled = i < filled;
            const isNext = i === filled;
            return (
              <div
                key={d.dafNumber}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                  isFilled
                    ? "border-duo-green bg-duo-green-light"
                    : isNext
                    ? "border-duo-blue bg-blue-50 animate-pulse"
                    : "border-dashed border-gray-300 bg-white"
                }`}
              >
                <span
                  className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold ${
                    isFilled ? "bg-duo-green text-white" : "bg-[#1a3a5c] text-white"
                  }`}
                >
                  {d.dafHebrew}
                </span>
                {isFilled ? (
                  <span className="font-bold text-duo-green-dark animate-pop-in">{d.siman}</span>
                ) : (
                  <span className="text-gray-400 font-bold">{isNext ? "?" : ""}</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Options */}
        {!complete ? (
          <div className="grid grid-cols-2 gap-2">
            {recallOptions.map((d) => {
              const used = windowDafim.findIndex((w) => w.dafNumber === d.dafNumber) < filled;
              const isWrong = wrongPick === d.dafNumber;
              return (
                <button
                  key={d.dafNumber}
                  onClick={() => handleRecallPick(d)}
                  disabled={used}
                  className={`py-3 px-3 rounded-xl border-2 border-b-4 font-bold transition-all ${
                    used
                      ? "border-gray-200 bg-gray-100 text-gray-300"
                      : isWrong
                      ? "border-duo-red bg-duo-red-light text-duo-red animate-shake"
                      : "border-duo-gray bg-white text-gray-800 active:border-b-2 active:mt-[2px]"
                  }`}
                >
                  {d.siman}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-lg font-bold text-duo-green-dark animate-bounce-in">
            Chain solid! {"\u{1F517}"}
          </p>
        )}
      </div>
    </div>
  );
}
