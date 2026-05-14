/**
 * ═══════════════════════════════════════════════════════════
 *  PART 2 — AI CHAVRUSA  (Requires OpenAI)
 *
 *  API route that proxies requests to OpenAI with daf context.
 *  Supports three modes:
 *    - "explain"   → Explain a point at a chosen depth
 *    - "chavrusa"  → Free-form Q&A about the daf
 *    - "mnemonic"  → Generate personalized siman stories
 * ═══════════════════════════════════════════════════════════
 */

import OpenAI from "openai";

export const dynamic = "force-dynamic";

// Lazy-init so the build doesn't fail when the env var is missing
let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

interface DafContext {
  dafNumber: number;
  dafHebrew: string;
  siman: string;
  simanHebrew: string;
  perekName: string;
  perekNameHebrew: string;
  points: { hebrew: string; english: string }[];
  story: string;
}

interface ChavrosaRequest {
  mode: "explain" | "chavrusa" | "mnemonic";
  daf: DafContext;
  // For explain mode
  pointIndex?: number;
  depth?: "simple" | "medium" | "deep";
  // For chavrusa mode
  question?: string;
  history?: { role: "user" | "assistant"; content: string }[];
  // For mnemonic mode
  personalContext?: string;
}

function buildSystemPrompt(mode: string, daf: DafContext): string {
  const pointsList = daf.points
    .map(
      (p, i) =>
        `  ${i + 1}. Hebrew: ${p.hebrew}\n     English: ${p.english}`
    )
    .join("\n");

  const base = `You are a warm, knowledgeable Gemara study partner (chavrusa). You are studying Masechet Yevamos, Daf ${daf.dafHebrew} (${daf.dafNumber}).

Perek: ${daf.perekNameHebrew} (${daf.perekName})
Siman (mnemonic): ${daf.siman} (${daf.simanHebrew})
Siman story: ${daf.story || "N/A"}

The ${daf.points.length} key points on this daf:
${pointsList}

Important guidelines:
- Be conversational and encouraging, like a real chavrusa
- Use both Hebrew terms and English explanations
- When referencing Talmudic concepts, briefly explain them for learners
- Keep responses SHORT and concise — aim for 2-3 short paragraphs maximum
- Always finish your thought cleanly. Never stop mid-sentence or mid-idea.
- Use the siman and story to help anchor explanations in memory`;

  if (mode === "explain") {
    return (
      base +
      `\n\nYour task is to EXPLAIN a specific point from this daf. Adjust your depth based on the requested level:
- Simple: Use everyday analogies, assume no background. Like explaining to a beginner.
- Medium: Assume basic Gemara vocabulary. Include the logical flow.
- Deep: Full shakla v'tarya. Reference related sugyos. Scholar level.`
    );
  }

  if (mode === "mnemonic") {
    return (
      base +
      `\n\nYour task is to create a PERSONALIZED mnemonic story that weaves the user's personal context with the siman and all ${daf.points.length} key points of this daf. Make it vivid, funny, and memorable. The story should naturally encode all the key information so that recalling the story helps recall the content.`
    );
  }

  // chavrusa mode
  return (
    base +
    `\n\nYou are having a free-form learning conversation about this daf. Answer questions, explore "what if" scenarios, explain connections to other parts of Shas, and help the student truly understand the sugya. If the student asks something beyond this daf's scope, you can discuss it but gently guide back to the daf's content.`
  );
}

export async function POST(request: Request) {
  try {
    const body: ChavrosaRequest = await request.json();
    const { mode, daf } = body;

    if (!daf || !mode) {
      return Response.json(
        { error: "Missing required fields: mode, daf" },
        { status: 400 }
      );
    }

    const systemPrompt = buildSystemPrompt(mode, daf);
    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
    ];

    if (mode === "explain") {
      const pointIdx = body.pointIndex ?? 0;
      const point = daf.points[pointIdx];
      const depth = body.depth ?? "medium";

      if (!point) {
        return Response.json(
          { error: "Invalid point index" },
          { status: 400 }
        );
      }

      messages.push({
        role: "user",
        content: `Please explain point #${pointIdx + 1} at a ${depth} level:\n\nHebrew: ${point.hebrew}\nEnglish: ${point.english}`,
      });
    } else if (mode === "mnemonic") {
      const personalCtx = body.personalContext || "my daily life";
      messages.push({
        role: "user",
        content: `Create a personalized mnemonic story for this daf using: "${personalCtx}". Weave in the siman "${daf.siman}" and all ${daf.points.length} key points.`,
      });
    } else {
      // chavrusa mode — include conversation history
      if (body.history) {
        for (const msg of body.history) {
          messages.push({ role: msg.role, content: msg.content });
        }
      }
      if (body.question) {
        messages.push({ role: "user", content: body.question });
      }
    }

    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7,
      max_tokens: 300,
    });

    const reply = completion.choices[0]?.message?.content || "";

    return Response.json({ reply });
  } catch (err: unknown) {
    console.error("Chavrusa API error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
