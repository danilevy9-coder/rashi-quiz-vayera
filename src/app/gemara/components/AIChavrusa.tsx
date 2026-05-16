"use client";

/**
 * ═══════════════════════════════════════════════════════════
 *  PART 2 — AI CHAVRUSA PANEL  (Requires OpenAI)
 *
 *  Slide-up panel with three AI modes:
 *    1. Explain It To Me — depth-selectable point explanations
 *    2. Ask Anything    — free-form chavrusa Q&A
 *    3. My Story        — personalized mnemonic generator
 * ═══════════════════════════════════════════════════════════
 */

import { useState, useRef, useEffect, useCallback } from "react";
import type { Daf } from "../data/yevamos";
import { API_BASE } from "../../lib/api";

interface AIChavrosaProps {
  daf: Daf;
  isOpen: boolean;
  onClose: () => void;
}

type AIMode = "explain" | "chavrusa" | "mnemonic";
type Depth = "simple" | "medium" | "deep";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function dafToContext(daf: Daf) {
  return {
    dafNumber: daf.dafNumber,
    dafHebrew: daf.dafHebrew,
    siman: daf.siman,
    simanHebrew: daf.simanHebrew,
    perekName: daf.perekName,
    perekNameHebrew: daf.perekNameHebrew,
    points: daf.points,
    story: daf.story,
  };
}

export default function AIChavrusa({ daf, isOpen, onClose }: AIChavrosaProps) {
  const [aiMode, setAIMode] = useState<AIMode | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Explain mode state
  const [selectedPoint, setSelectedPoint] = useState(0);
  const [selectedDepth, setSelectedDepth] = useState<Depth>("medium");
  const [explanation, setExplanation] = useState<string | null>(null);

  // Chavrusa mode state
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Mnemonic mode state
  const [personalContext, setPersonalContext] = useState("");
  const [mnemonicStory, setMnemonicStory] = useState<string | null>(null);

  // Reset state when daf changes
  useEffect(() => {
    setAIMode(null);
    setExplanation(null);
    setChatHistory([]);
    setMnemonicStory(null);
    setError(null);
  }, [daf.dafNumber]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const callAPI = useCallback(
    async (body: Record<string, unknown>) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/api/chavrusa`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ daf: dafToContext(daf), ...body }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "API error");
        return data.reply as string;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Something went wrong";
        setError(msg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [daf]
  );

  const handleExplain = async () => {
    const reply = await callAPI({
      mode: "explain",
      pointIndex: selectedPoint,
      depth: selectedDepth,
    });
    if (reply) setExplanation(reply);
  };

  const handleChat = async () => {
    if (!chatInput.trim()) return;
    const question = chatInput.trim();
    setChatInput("");
    const newHistory: ChatMessage[] = [
      ...chatHistory,
      { role: "user", content: question },
    ];
    setChatHistory(newHistory);

    const reply = await callAPI({
      mode: "chavrusa",
      question,
      history: newHistory.slice(-10), // keep last 10 messages for context
    });
    if (reply) {
      setChatHistory((h) => [...h, { role: "assistant", content: reply }]);
    }
  };

  const handleMnemonic = async () => {
    const reply = await callAPI({
      mode: "mnemonic",
      personalContext: personalContext.trim() || "my daily life",
    });
    if (reply) setMnemonicStory(reply);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      {/* Backdrop */}
      <div className="flex-1 bg-black/40" onClick={onClose} />

      {/* Panel */}
      <div className="bg-white rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col animate-slide-up">
        {/* Handle + header */}
        <div className="px-6 pt-3 pb-4 border-b border-gray-100">
          <div className="w-10 h-1.5 bg-gray-200 rounded-full mx-auto mb-4" />
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                <span>🤖</span> AI Chavrusa
              </h2>
              <p className="text-xs text-gray-500">
                Daf {daf.dafHebrew} &middot; {daf.siman}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Mode selector */}
        {!aiMode && (
          <div className="px-6 py-6 space-y-3 overflow-y-auto">
            <button
              onClick={() => setAIMode("explain")}
              className="w-full p-4 rounded-xl border-2 border-b-4 border-emerald-400 bg-emerald-50 text-left active:border-b-2 active:mt-[2px] transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">💡</span>
                <div>
                  <p className="font-bold text-emerald-700">Explain It To Me</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Choose a point and depth level for a clear explanation
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setAIMode("chavrusa")}
              className="w-full p-4 rounded-xl border-2 border-b-4 border-blue-400 bg-blue-50 text-left active:border-b-2 active:mt-[2px] transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">💬</span>
                <div>
                  <p className="font-bold text-blue-700">Ask Anything</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Free-form Q&A — ask &quot;why&quot;, &quot;what if&quot;, explore the sugya
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setAIMode("mnemonic")}
              className="w-full p-4 rounded-xl border-2 border-b-4 border-purple-400 bg-purple-50 text-left active:border-b-2 active:mt-[2px] transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">✨</span>
                <div>
                  <p className="font-bold text-purple-700">My Story</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Generate a personalized mnemonic story using your own life
                  </p>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* ── Explain Mode ── */}
        {aiMode === "explain" && (
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <button
              onClick={() => {
                setAIMode(null);
                setExplanation(null);
              }}
              className="text-sm text-gray-400 hover:text-gray-600 mb-4"
            >
              &larr; Back to modes
            </button>

            {/* Point selector */}
            <p className="text-sm font-bold text-gray-700 mb-2">Choose a point:</p>
            <div className="space-y-2 mb-4">
              {daf.points.map((point, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedPoint(i);
                    setExplanation(null);
                  }}
                  className={`w-full text-left p-3 rounded-xl border-2 transition-all text-sm ${
                    selectedPoint === i
                      ? "border-emerald-400 bg-emerald-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <span className="font-bold text-gray-600">{i + 1}.</span>{" "}
                  {point.english || point.hebrew}
                </button>
              ))}
            </div>

            {/* Depth selector */}
            <p className="text-sm font-bold text-gray-700 mb-2">Depth:</p>
            <div className="flex gap-2 mb-5">
              {(
                [
                  { key: "simple", label: "Simple 🌱", color: "emerald" },
                  { key: "medium", label: "Medium 📖", color: "blue" },
                  { key: "deep", label: "Deep 🧠", color: "purple" },
                ] as { key: Depth; label: string; color: string }[]
              ).map((d) => (
                <button
                  key={d.key}
                  onClick={() => {
                    setSelectedDepth(d.key);
                    setExplanation(null);
                  }}
                  className={`flex-1 py-2.5 rounded-xl border-2 border-b-4 font-bold text-sm transition-all active:border-b-2 active:mt-[2px] ${
                    selectedDepth === d.key
                      ? "border-[#1a3a5c] bg-[#1a3a5c] text-white"
                      : "border-gray-200 bg-white text-gray-600"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>

            {/* Generate button */}
            <button
              onClick={handleExplain}
              disabled={loading}
              className="w-full py-3 rounded-xl border-2 border-b-4 border-emerald-500 bg-emerald-500 text-white font-bold active:border-b-2 active:mt-[2px] transition-all disabled:opacity-50"
            >
              {loading ? "Thinking..." : "Explain This Point"}
            </button>

            {/* Result */}
            {error && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}
            {explanation && (
              <div className="mt-4 p-4 rounded-xl bg-emerald-50 border-2 border-emerald-200 animate-fade-in-up">
                <div className="prose prose-sm max-w-none text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {explanation}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Chavrusa Mode ── */}
        {aiMode === "chavrusa" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 pt-3">
              <button
                onClick={() => {
                  setAIMode(null);
                  setChatHistory([]);
                }}
                className="text-sm text-gray-400 hover:text-gray-600 mb-2"
              >
                &larr; Back to modes
              </button>
            </div>

            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto px-6 py-3 space-y-3">
              {chatHistory.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">
                  <p className="text-3xl mb-3">💬</p>
                  <p>Ask anything about Daf {daf.dafHebrew} ({daf.siman})</p>
                  <div className="mt-4 space-y-2">
                    {[
                      "What's the main question on this daf?",
                      `How does the siman "${daf.siman}" connect to the content?`,
                      "Can you give me a modern-day example?",
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => {
                          setChatInput(suggestion);
                        }}
                        className="block w-full text-left px-4 py-2.5 rounded-xl bg-blue-50 text-blue-700 text-sm hover:bg-blue-100 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {chatHistory.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-[#1a3a5c] text-white rounded-br-md"
                        : "bg-gray-100 text-gray-800 rounded-bl-md"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-500 px-4 py-3 rounded-2xl rounded-bl-md text-sm">
                    Thinking
                    <span className="animate-pulse-slow">...</span>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Chat input */}
            <div className="px-4 py-3 border-t border-gray-100 bg-white">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleChat();
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask about this daf..."
                  disabled={loading}
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a3a5c] focus:outline-none text-sm disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={loading || !chatInput.trim()}
                  className="px-5 py-3 rounded-xl bg-[#1a3a5c] text-white font-bold text-sm disabled:opacity-40 active:scale-95 transition-transform"
                >
                  Send
                </button>
              </form>
            </div>

            {error && (
              <div className="px-6 pb-3">
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Mnemonic Mode ── */}
        {aiMode === "mnemonic" && (
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <button
              onClick={() => {
                setAIMode(null);
                setMnemonicStory(null);
              }}
              className="text-sm text-gray-400 hover:text-gray-600 mb-4"
            >
              &larr; Back to modes
            </button>

            {/* Current story */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
              <p className="text-xs text-amber-600 font-medium mb-1">
                Standard Siman Story
              </p>
              <p className="text-sm text-amber-800">
                {daf.story || "No standard story available for this daf."}
              </p>
            </div>

            {/* Personal context input */}
            <p className="text-sm font-bold text-gray-700 mb-2">
              Make it personal — what should the story include?
            </p>
            <p className="text-xs text-gray-500 mb-3">
              e.g. &quot;my kitchen&quot;, &quot;my drive to work&quot;, &quot;my kids&quot;, &quot;playing
              basketball&quot;
            </p>
            <input
              type="text"
              value={personalContext}
              onChange={(e) => setPersonalContext(e.target.value)}
              placeholder="e.g. my morning commute on the subway"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none text-sm mb-4"
            />

            <button
              onClick={handleMnemonic}
              disabled={loading}
              className="w-full py-3 rounded-xl border-2 border-b-4 border-purple-500 bg-purple-500 text-white font-bold active:border-b-2 active:mt-[2px] transition-all disabled:opacity-50"
            >
              {loading ? "Creating your story..." : "Generate My Story ✨"}
            </button>

            {error && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            {mnemonicStory && (
              <div className="mt-4 p-4 rounded-xl bg-purple-50 border-2 border-purple-200 animate-fade-in-up">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">✨</span>
                  <h3 className="font-bold text-purple-800">Your Personal Story</h3>
                </div>
                <div className="text-gray-800 text-sm whitespace-pre-wrap leading-relaxed">
                  {mnemonicStory}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
