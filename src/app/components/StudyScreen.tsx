"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { PartSummary } from "../quizData/summaries";

interface StudyScreenProps {
  summary: PartSummary;
  parshaSlug: string;
  partTitle: string;
  partSubtitle: string;
  onStartQuiz: () => void;
  onBack: () => void;
}

export default function StudyScreen({
  summary,
  parshaSlug,
  partTitle,
  partSubtitle,
  onStartQuiz,
  onBack,
}: StudyScreenProps) {
  const [lang, setLang] = useState<"hebrew" | "english">("hebrew");
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const text = lang === "hebrew" ? summary.hebrew : summary.english;
  const audioSrc = `/audio/${parshaSlug}/part${summary.partId}-${lang === "hebrew" ? "he" : "en"}.mp3`;

  // Create / swap audio element when language or part changes
  useEffect(() => {
    const audio = new Audio(audioSrc);
    audio.preload = "metadata";
    audioRef.current = audio;

    audio.addEventListener("loadedmetadata", () => {
      setDuration(audio.duration);
    });

    audio.addEventListener("timeupdate", () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration > 0) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    });

    audio.addEventListener("ended", () => {
      setIsPlaying(false);
      setProgress(100);
    });

    audio.addEventListener("error", () => {
      setIsPlaying(false);
      setProgress(0);
    });

    // Reset state
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);

    return () => {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    };
  }, [audioSrc]);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
  }, []);

  const togglePlayback = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const seekTo = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = clickX / rect.width;
    audio.currentTime = pct * audio.duration;
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-white flex flex-col" dir={lang === "hebrew" ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="sticky top-0 bg-white z-10 border-b border-gray-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => {
              stopAudio();
              onBack();
            }}
            className="text-duo-gray-dark hover:text-foreground transition-colors cursor-pointer text-sm font-semibold"
          >
            ← {lang === "hebrew" ? "חזרה" : "Back"}
          </button>
          <span className="text-sm font-bold text-foreground">{partTitle}</span>
          <div className="w-12" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full">
        {/* Title */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">📖</div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground mb-1">
            {lang === "hebrew" ? "סיכום לפני החידון" : "Study Summary"}
          </h1>
          <p className="text-sm text-duo-gray-dark font-semibold">
            {partSubtitle}
          </p>
        </div>

        {/* Language Toggle */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-4 max-w-xs mx-auto">
          <button
            onClick={() => {
              stopAudio();
              setLang("hebrew");
            }}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
              lang === "hebrew"
                ? "bg-white text-foreground shadow-sm"
                : "text-duo-gray-dark"
            }`}
          >
            עברית
          </button>
          <button
            onClick={() => {
              stopAudio();
              setLang("english");
            }}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
              lang === "english"
                ? "bg-white text-foreground shadow-sm"
                : "text-duo-gray-dark"
            }`}
          >
            English
          </button>
        </div>

        {/* Audio Player */}
        <div className="mb-4 bg-gray-50 rounded-2xl border-2 border-duo-gray p-4">
          <div className="flex items-center gap-3">
            {/* Play/Pause Button */}
            <button
              onClick={togglePlayback}
              className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold transition-all cursor-pointer shrink-0 ${
                isPlaying
                  ? "bg-duo-red text-white"
                  : "bg-duo-blue text-white"
              }`}
            >
              {isPlaying ? "⏸" : "▶"}
            </button>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground mb-1.5">
                {isPlaying
                  ? lang === "hebrew" ? "מושמע כעת..." : "Now playing..."
                  : lang === "hebrew" ? "הקשיבו לסיכום" : "Listen to summary"}
              </p>

              {/* Progress Bar (clickable) */}
              <div
                className="h-2.5 bg-duo-gray rounded-full overflow-hidden cursor-pointer"
                onClick={seekTo}
              >
                <div
                  className="h-full bg-duo-blue rounded-full transition-all duration-150"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Time */}
              <div className="flex justify-between mt-1">
                <span className="text-xs text-duo-gray-dark font-semibold">
                  {formatTime(currentTime)}
                </span>
                <span className="text-xs text-duo-gray-dark font-semibold">
                  {duration > 0 ? formatTime(duration) : "--:--"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Text */}
        <div className="bg-gray-50 rounded-3xl border-2 border-duo-gray p-5 md:p-6 mb-6">
          <div className="prose prose-lg max-w-none">
            {text.split("\n\n").map((paragraph, i) => (
              <p
                key={i}
                className="text-base md:text-lg leading-relaxed text-foreground mb-4 last:mb-0"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Tip */}
        <div className="bg-duo-green-light rounded-2xl p-4 mb-6 flex items-start gap-3">
          <span className="text-2xl shrink-0">💡</span>
          <p className="text-sm font-semibold text-duo-green-dark">
            {lang === "hebrew"
              ? "טיפ: קראו בעיון — רוב התשובות מוסתרות בתוך הסיכום!"
              : "Tip: Read carefully — most answers are hidden in this summary!"}
          </p>
        </div>
      </div>

      {/* Start Quiz Button */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => {
              stopAudio();
              onStartQuiz();
            }}
            className="w-full py-4 rounded-2xl bg-duo-green text-white font-bold text-lg transition-all hover:bg-duo-green-dark active:brightness-90 cursor-pointer"
          >
            {lang === "hebrew" ? "🚀 התחל חידון" : "🚀 Start Quiz"}
          </button>
        </div>
      </div>
    </div>
  );
}
