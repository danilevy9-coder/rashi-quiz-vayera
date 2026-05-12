"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import type { Daf } from "../data/yevamos";

// ── Question types ──────────────────────────────────────────────

type QuestionType =
  | "siman-from-daf"      // Given daf letter, pick the siman
  | "daf-from-siman"      // Given siman, pick the daf letter
  | "point-belongs"       // Given a siman, which point belongs to it?
  | "point-to-daf"        // Given a point, which daf/siman is it from?
  | "odd-one-out"         // 4 points shown, which one is NOT from this daf?
  | "complete-the-set";   // 2 points shown from a daf, pick the missing 3rd

interface GeneratedQuestion {
  type: QuestionType;
  prompt: string;
  promptSub?: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
}

// ── Helpers ─────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}

// Get distractor dafim (not the target daf)
function getDistractors(allDafim: Daf[], target: Daf, count: number): Daf[] {
  const others = allDafim.filter((d) => d.dafNumber !== target.dafNumber);
  return pickN(others, count);
}

// ── Question generators ────────────────────────────────────────

function genSimanFromDaf(daf: Daf, allDafim: Daf[]): GeneratedQuestion {
  const distractors = getDistractors(allDafim, daf, 3);
  const choices = shuffle([daf.siman, ...distractors.map((d) => d.siman)]);
  return {
    type: "siman-from-daf",
    prompt: `What is the siman for Daf ${daf.dafHebrew}?`,
    promptSub: `(${daf.perekNameHebrew})`,
    choices,
    correctIndex: choices.indexOf(daf.siman),
    explanation: `Daf ${daf.dafHebrew} = ${daf.siman}`,
  };
}

function genDafFromSiman(daf: Daf, allDafim: Daf[]): GeneratedQuestion {
  const distractors = getDistractors(allDafim, daf, 3);
  const label = (d: Daf) => `Daf ${d.dafHebrew} (${d.perekNameHebrew})`;
  const choices = shuffle([label(daf), ...distractors.map(label)]);
  return {
    type: "daf-from-siman",
    prompt: `Which daf has the siman "${daf.siman}"?`,
    choices,
    correctIndex: choices.indexOf(label(daf)),
    explanation: `"${daf.siman}" is the siman for Daf ${daf.dafHebrew}`,
  };
}

function genPointBelongs(daf: Daf, allDafim: Daf[]): GeneratedQuestion {
  const correctPoint = pickRandom(daf.points.filter((p) => p.hebrew));
  const distractors = getDistractors(allDafim, daf, 3);
  const wrongPoints = distractors
    .flatMap((d) => d.points.filter((p) => p.hebrew))
    .slice(0, 3);

  const pointLabel = (p: { hebrew: string; english: string }) =>
    p.english || p.hebrew;

  const correct = pointLabel(correctPoint);
  const choices = shuffle([correct, ...wrongPoints.map(pointLabel)]).slice(0, 4);

  // Make sure correct answer is in choices (in case of duplicates)
  if (!choices.includes(correct)) {
    choices[0] = correct;
  }

  return {
    type: "point-belongs",
    prompt: `Which topic belongs to Daf ${daf.dafHebrew} (${daf.siman})?`,
    choices,
    correctIndex: choices.indexOf(correct),
    explanation: `This is one of the 3 points of Daf ${daf.dafHebrew} – ${daf.siman}`,
  };
}

function genPointToDaf(daf: Daf, allDafim: Daf[]): GeneratedQuestion {
  const point = pickRandom(daf.points.filter((p) => p.hebrew));
  const distractors = getDistractors(allDafim, daf, 3);
  const label = (d: Daf) => `${d.siman} (Daf ${d.dafHebrew})`;
  const correct = label(daf);
  const choices = shuffle([correct, ...distractors.map(label)]);
  const pointText = point.english || point.hebrew;

  return {
    type: "point-to-daf",
    prompt: pointText,
    promptSub: "Which daf discusses this?",
    choices,
    correctIndex: choices.indexOf(correct),
    explanation: `This topic is from Daf ${daf.dafHebrew} – ${daf.siman}`,
  };
}

function genOddOneOut(daf: Daf, allDafim: Daf[]): GeneratedQuestion {
  const validPoints = daf.points.filter((p) => p.hebrew);
  if (validPoints.length < 2) return genSimanFromDaf(daf, allDafim); // fallback

  const distractor = pickRandom(getDistractors(allDafim, daf, 5));
  const oddPoint = pickRandom(distractor.points.filter((p) => p.hebrew));
  if (!oddPoint) return genSimanFromDaf(daf, allDafim); // fallback

  const pointLabel = (p: { hebrew: string; english: string }) =>
    p.english || p.hebrew;

  const oddLabel = pointLabel(oddPoint);
  const correctPoints = validPoints.slice(0, 3).map(pointLabel);
  const choices = shuffle([...correctPoints.slice(0, 3), oddLabel]).slice(0, 4);

  if (!choices.includes(oddLabel)) {
    choices[3] = oddLabel;
  }

  return {
    type: "odd-one-out",
    prompt: `Which topic does NOT belong to Daf ${daf.dafHebrew} (${daf.siman})?`,
    choices,
    correctIndex: choices.indexOf(oddLabel),
    explanation: `"${oddLabel}" is from Daf ${distractor.dafHebrew} (${distractor.siman}), not Daf ${daf.dafHebrew}`,
  };
}

function genCompleteTheSet(daf: Daf, allDafim: Daf[]): GeneratedQuestion {
  const validPoints = daf.points.filter((p) => p.hebrew);
  if (validPoints.length < 3) return genSimanFromDaf(daf, allDafim);

  const shuffled = shuffle(validPoints);
  const shown = shuffled.slice(0, 2);
  const missing = shuffled[2];
  const distractorPoints = getDistractors(allDafim, daf, 5)
    .flatMap((d) => d.points.filter((p) => p.hebrew));

  const pointLabel = (p: { hebrew: string; english: string }) =>
    p.english || p.hebrew;

  const correct = pointLabel(missing);
  const wrongs = shuffle(distractorPoints).slice(0, 3).map(pointLabel);
  const choices = shuffle([correct, ...wrongs]).slice(0, 4);

  if (!choices.includes(correct)) {
    choices[0] = correct;
  }

  return {
    type: "complete-the-set",
    prompt: `Daf ${daf.dafHebrew} (${daf.siman}) — what's the missing 3rd point?`,
    promptSub: `1) ${pointLabel(shown[0])}\n2) ${pointLabel(shown[1])}\n3) ???`,
    choices,
    correctIndex: choices.indexOf(correct),
    explanation: `The 3 points of ${daf.siman}: ${validPoints.map(pointLabel).join(" · ")}`,
  };
}

// ── Generate a quiz from a set of dafim ─────────────────────────

const GENERATORS = [
  genSimanFromDaf,
  genDafFromSiman,
  genPointBelongs,
  genPointToDaf,
  genOddOneOut,
  genCompleteTheSet,
];

function generateQuiz(dafim: Daf[], allDafim: Daf[], questionsPerDaf: number = 2): GeneratedQuestion[] {
  const questions: GeneratedQuestion[] = [];

  for (const daf of dafim) {
    // Pick random question types for this daf
    const gens = shuffle(GENERATORS).slice(0, questionsPerDaf);
    for (const gen of gens) {
      questions.push(gen(daf, allDafim));
    }
  }

  return shuffle(questions);
}

// ── Encouraging messages ────────────────────────────────────────

const CORRECT_MSGS = ["Correct!", "Exactly!", "Nailed it!", "Yes!", "Perfect!"];
const WRONG_MSGS = ["Not quite!", "Oops!", "Almost!", "Try to remember..."];

// ── Component ───────────────────────────────────────────────────

interface GemaraQuizProps {
  dafim: Daf[];
  allDafim: Daf[];
  title: string;
  onBack: () => void;
}

export default function GemaraQuiz({ dafim, allDafim, title, onBack }: GemaraQuizProps) {
  const [questions] = useState<GeneratedQuestion[]>(() =>
    generateQuiz(dafim, allDafim, 2)
  );

  // Mastery state
  const [queue, setQueue] = useState<number[]>(() =>
    questions.map((_, i) => i)
  );
  const [queuePos, setQueuePos] = useState(0);
  const [mastered, setMastered] = useState<Set<number>>(new Set());
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [firstTryCorrect, setFirstTryCorrect] = useState(0);
  const [finished, setFinished] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const retriedSet = useRef<Set<number>>(new Set());

  const total = questions.length;
  const progress = total > 0 ? (mastered.size / total) * 100 : 0;
  const currentQIdx = queue[queuePos];
  const question = questions[currentQIdx];

  const handleChoice = useCallback(
    (choiceIdx: number) => {
      if (showResult) return;
      setSelected(choiceIdx);
      setShowResult(true);

      const isCorrect = choiceIdx === question.correctIndex;

      if (isCorrect) {
        const newStreak = streak + 1;
        setStreak(newStreak);
        if (newStreak > maxStreak) setMaxStreak(newStreak);
        setFeedbackMsg(pickRandom(CORRECT_MSGS));

        // Mark as mastered
        const newMastered = new Set(mastered);
        newMastered.add(currentQIdx);
        setMastered(newMastered);

        if (!retriedSet.current.has(currentQIdx)) {
          setFirstTryCorrect((c) => c + 1);
        }

        // Check if done
        if (newMastered.size >= total) {
          setTimeout(() => setFinished(true), 1200);
        }
      } else {
        setStreak(0);
        setFeedbackMsg(pickRandom(WRONG_MSGS));
        retriedSet.current.add(currentQIdx);

        // Requeue 3-6 positions ahead
        setQueue((prev) => {
          const newQ = [...prev];
          const reinsertPos = Math.min(
            queuePos + 3 + Math.floor(Math.random() * 4),
            newQ.length
          );
          newQ.splice(reinsertPos, 0, currentQIdx);
          return newQ;
        });
      }
    },
    [showResult, question, streak, maxStreak, mastered, currentQIdx, total, queuePos]
  );

  const handleNext = useCallback(() => {
    setSelected(null);
    setShowResult(false);
    setQueuePos((p) => p + 1);
  }, []);

  // ── Finished screen ──
  if (finished) {
    const pct = total > 0 ? Math.round((firstTryCorrect / total) * 100) : 0;
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
        <div className="text-center animate-bounce-in mb-6">
          <p className="text-6xl mb-3">{pct >= 90 ? "\u{1F31F}" : pct >= 70 ? "\u{1F525}" : "\u{1F4AA}"}</p>
          <h2 className="text-2xl font-bold text-gray-800">Quiz Complete!</h2>
          <p className="text-gray-500 mt-1">{title}</p>
        </div>

        <div className="w-full max-w-sm space-y-3 animate-fade-in-up">
          <div className="flex items-center justify-between p-4 bg-duo-green-light rounded-xl">
            <span className="font-bold text-duo-green-dark">First Try Correct</span>
            <span className="text-2xl font-bold text-duo-green-dark">
              {firstTryCorrect}/{total}
            </span>
          </div>
          <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-200">
            <span className="font-bold text-amber-700">Best Streak</span>
            <span className="text-2xl font-bold text-amber-700">{maxStreak}</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
            <span className="font-bold text-gray-600">Score</span>
            <span className="text-2xl font-bold text-gray-800">{pct}%</span>
          </div>
        </div>

        <div className="flex gap-3 w-full max-w-sm mt-6">
          <button
            onClick={onBack}
            className="flex-1 py-3 rounded-xl border-2 border-b-4 border-duo-gray bg-white text-gray-600 font-bold active:border-b-2 active:mt-[2px] transition-all"
          >
            Back
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex-1 py-3 rounded-xl border-2 border-b-4 border-duo-green bg-duo-green text-white font-bold active:border-b-2 active:mt-[2px] transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!question) return null;

  const isCorrect = selected !== null && selected === question.correctIndex;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={onBack} className="text-gray-500 hover:text-gray-800 text-2xl font-light">
            &larr;
          </button>
          <span className="text-sm text-gray-500 font-medium">
            {mastered.size}/{total} mastered
          </span>
          <div className="flex-1" />
          {streak >= 2 && (
            <span className="text-sm font-bold text-duo-gold animate-pop-in">
              {streak} streak
            </span>
          )}
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out progress-shimmer"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      {/* Question */}
      <div className="flex-1 flex flex-col px-4 py-6 max-w-lg mx-auto w-full">
        {/* Question type badge */}
        <div className="mb-3">
          <span className="text-xs font-semibold text-white bg-[#1a3a5c] rounded-full px-3 py-1">
            {question.type === "siman-from-daf" && "What's the Siman?"}
            {question.type === "daf-from-siman" && "Which Daf?"}
            {question.type === "point-belongs" && "Pick the Point"}
            {question.type === "point-to-daf" && "Which Daf?"}
            {question.type === "odd-one-out" && "Odd One Out"}
            {question.type === "complete-the-set" && "Complete the Set"}
          </span>
        </div>

        {/* Prompt */}
        <h2 className="text-xl font-bold text-gray-800 mb-2 animate-fade-in-up">
          {question.prompt}
        </h2>
        {question.promptSub && (
          <p className="text-sm text-gray-500 mb-5 whitespace-pre-line">
            {question.promptSub}
          </p>
        )}

        {/* Choices */}
        <div className="space-y-3 flex-1">
          {question.choices.map((choice, i) => {
            let borderColor = "border-duo-gray";
            let bgColor = "bg-white";
            let textColor = "text-gray-800";

            if (showResult) {
              if (i === question.correctIndex) {
                borderColor = "border-duo-green";
                bgColor = "bg-duo-green-light";
                textColor = "text-duo-green-dark";
              } else if (i === selected && !isCorrect) {
                borderColor = "border-duo-red";
                bgColor = "bg-duo-red-light";
                textColor = "text-duo-red";
              }
            } else if (i === selected) {
              borderColor = "border-duo-blue";
              bgColor = "bg-blue-50";
            }

            return (
              <button
                key={i}
                onClick={() => handleChoice(i)}
                disabled={showResult}
                className={`w-full text-left p-4 rounded-xl border-2 border-b-4 ${borderColor} ${bgColor} ${textColor} font-medium transition-all ${
                  !showResult ? "active:border-b-2 active:mt-[2px] hover:border-[#1a3a5c]" : ""
                } animate-stagger-${i + 1}`}
              >
                {choice}
              </button>
            );
          })}
        </div>

        {/* Feedback bar */}
        {showResult && (
          <div
            className={`mt-4 p-4 rounded-xl animate-slide-up ${
              isCorrect
                ? "bg-duo-green-light border-2 border-duo-green"
                : "bg-duo-red-light border-2 border-duo-red"
            }`}
          >
            <p className={`font-bold text-lg ${isCorrect ? "text-duo-green-dark" : "text-duo-red"}`}>
              {feedbackMsg}
            </p>
            <p className={`text-sm mt-1 ${isCorrect ? "text-duo-green-dark/80" : "text-duo-red/80"}`}>
              {question.explanation}
            </p>
            <button
              onClick={handleNext}
              className={`mt-3 w-full py-3 rounded-xl font-bold text-white ${
                isCorrect ? "bg-duo-green" : "bg-duo-red"
              } active:opacity-80 transition-all`}
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
