"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import type { Daf } from "../data/yevamos";

interface FlashcardProps {
  daf: Daf;
  onRate: (rating: "knew" | "partial" | "forgot") => void;
  showRating: boolean;
  imageFolder?: string;
}

export default function Flashcard({ daf, onRate, showRating, imageFolder = "yevamos" }: FlashcardProps) {
  const [flipped, setFlipped] = useState(false);
  const [showImage, setShowImage] = useState(false);

  const handleFlip = useCallback(() => {
    setFlipped((f) => !f);
    setShowImage(false);
  }, []);

  const imageSrc = `/images/${imageFolder}/daf-${daf.dafNumber}.jpg`;

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Card */}
      <div className="cursor-pointer" onClick={handleFlip}>
        {!flipped ? (
          /* Front */
          <div className="rounded-2xl border-2 border-b-4 border-[#1a3a5c] bg-gradient-to-br from-[#1a3a5c] to-[#0d1f33] text-white flex flex-col items-center justify-center p-8 gap-4 min-h-[320px] animate-fade-in">
            <div className="text-sm font-medium text-blue-300 tracking-wide uppercase">
              Daf {daf.dafHebrew} &middot; {daf.perekNameHebrew}
            </div>
            <div className="text-7xl font-bold text-white">{daf.dafHebrew}</div>
            <div className="mt-2 px-5 py-2 rounded-full bg-white/15 text-xl font-semibold">
              {daf.siman}
            </div>
            <div className="text-sm text-blue-200 mt-4">Tap to reveal 3 points</div>
          </div>
        ) : (
          /* Back */
          <div className="rounded-2xl border-2 border-b-4 border-duo-green bg-white flex flex-col p-6 gap-3 animate-fade-in">
            <div className="flex items-center justify-between mb-1">
              <div className="text-sm font-medium text-gray-400">
                Daf {daf.dafHebrew} &middot; {daf.siman}
              </div>
              <div className="text-xs text-gray-400 bg-gray-100 rounded-full px-3 py-1">
                {daf.perekNameHebrew}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {daf.points.map((point, i) => (
                point.hebrew ? (
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
                ) : null
              ))}
            </div>

            {daf.story && (
              <div className="mt-2 p-3 bg-amber-50 rounded-xl border border-amber-200">
                <p className="text-xs text-amber-700 font-medium mb-1">Siman Story</p>
                <p className="text-sm text-amber-900 leading-relaxed">{daf.story}</p>
              </div>
            )}

            {/* Illustration image */}
            {!showImage ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowImage(true);
                }}
                className="mt-2 w-full py-3 rounded-xl border-2 border-dashed border-duo-blue bg-blue-50 text-duo-blue font-bold text-sm hover:bg-blue-100 transition-all"
              >
                Show Illustration
              </button>
            ) : (
              <div className="mt-2 rounded-xl overflow-hidden border border-gray-200 animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
                <img
                  src={imageSrc}
                  alt={`Daf ${daf.dafHebrew} - ${daf.siman} illustration`}
                  className="w-full h-auto"
                  loading="lazy"
                />
              </div>
            )}

            <div className="text-xs text-gray-400 text-center mt-1">Tap card to flip back</div>
          </div>
        )}
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
