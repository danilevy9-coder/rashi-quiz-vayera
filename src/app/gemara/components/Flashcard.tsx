"use client";

import { useState, useCallback } from "react";
import type { Daf } from "../data/yevamos";

interface FlashcardProps {
  daf: Daf;
  onRate: (rating: "knew" | "partial" | "forgot") => void;
  showRating: boolean;
}

export default function Flashcard({ daf, onRate, showRating }: FlashcardProps) {
  const [flipped, setFlipped] = useState(false);

  const handleFlip = useCallback(() => {
    setFlipped((f) => !f);
  }, []);

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Card */}
      <div
        className="relative w-full cursor-pointer"
        style={{ perspective: "1000px", minHeight: "340px" }}
        onClick={handleFlip}
      >
        <div
          className="relative w-full h-full transition-transform duration-500"
          style={{
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            minHeight: "340px",
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 rounded-2xl border-2 border-b-4 border-[#1a3a5c] bg-gradient-to-br from-[#1a3a5c] to-[#0d1f33] text-white flex flex-col items-center justify-center p-8 gap-4"
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="text-sm font-medium text-blue-300 tracking-wide uppercase">
              Daf {daf.dafHebrew} · {daf.perekNameHebrew}
            </div>
            <div className="text-7xl font-bold text-white">{daf.dafHebrew}</div>
            <div className="mt-2 px-5 py-2 rounded-full bg-white/15 text-xl font-semibold">
              {daf.siman}
            </div>
            <div className="text-sm text-blue-200 mt-4">Tap to reveal 3 points</div>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 rounded-2xl border-2 border-b-4 border-duo-green bg-white flex flex-col p-6 gap-3"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="text-sm font-medium text-gray-400">
                Daf {daf.dafHebrew} · {daf.siman}
              </div>
              <div className="text-xs text-gray-400 bg-gray-100 rounded-full px-3 py-1">
                {daf.perekNameHebrew}
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-3 justify-center">
              {daf.points.map((point, i) => (
                <div
                  key={i}
                  className="flex gap-3 items-start animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.1}s`, animationFillMode: "both" }}
                >
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#1a3a5c] text-white text-sm font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-base font-medium text-gray-800 leading-snug" dir="rtl">
                      {point.hebrew}
                    </p>
                    {point.english && (
                      <p className="text-sm text-gray-500 mt-0.5 leading-snug">
                        {point.english}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {daf.story && (
              <div className="mt-2 p-3 bg-amber-50 rounded-xl border border-amber-200">
                <p className="text-xs text-amber-700 font-medium mb-1">Siman Story</p>
                <p className="text-sm text-amber-900 leading-relaxed">{daf.story}</p>
              </div>
            )}

            <div className="text-xs text-gray-400 text-center mt-1">Tap to flip back</div>
          </div>
        </div>
      </div>

      {/* Rating buttons - only visible when card is flipped */}
      {flipped && showRating && (
        <div className="mt-5 flex gap-3 justify-center animate-fade-in-up">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setFlipped(false);
              onRate("forgot");
            }}
            className="flex-1 max-w-[130px] py-3 rounded-xl border-2 border-b-4 border-duo-red bg-duo-red-light text-duo-red font-bold text-sm active:border-b-2 active:mt-[2px] transition-all"
          >
            Forgot
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setFlipped(false);
              onRate("partial");
            }}
            className="flex-1 max-w-[130px] py-3 rounded-xl border-2 border-b-4 border-duo-gold bg-amber-50 text-amber-700 font-bold text-sm active:border-b-2 active:mt-[2px] transition-all"
          >
            Partial
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setFlipped(false);
              onRate("knew");
            }}
            className="flex-1 max-w-[130px] py-3 rounded-xl border-2 border-b-4 border-duo-green bg-duo-green-light text-duo-green-dark font-bold text-sm active:border-b-2 active:mt-[2px] transition-all"
          >
            Knew It
          </button>
        </div>
      )}
    </div>
  );
}
