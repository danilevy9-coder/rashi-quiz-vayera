import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

// Read API key from .env.local
const envFile = fs.readFileSync(path.join(root, ".env.local"), "utf-8");
const apiKey = envFile.match(/OPENAI_API_KEY=(.+)/)?.[1]?.trim();
if (!apiKey || apiKey === "paste-your-key-here") {
  console.error("Please set OPENAI_API_KEY in .env.local");
  process.exit(1);
}

// Read summaries from the TS file
const summaryFile = fs.readFileSync(
  path.join(root, "src/app/quizData/summaries.ts"),
  "utf-8"
);

// Extract parsha slugs and their summaries
function extractParshas(content) {
  const parshas = {};
  // Match each parsha key block
  const parshaRegex = /["']?([\w-]+)["']?\s*:\s*\[/g;
  let parshaMatch;
  while ((parshaMatch = parshaRegex.exec(content)) !== null) {
    const slug = parshaMatch[1];
    if (slug === "partId") continue; // skip false matches

    // Find the array content for this parsha
    const startIdx = parshaMatch.index + parshaMatch[0].length;
    let depth = 1;
    let i = startIdx;
    while (depth > 0 && i < content.length) {
      if (content[i] === "[") depth++;
      if (content[i] === "]") depth--;
      i++;
    }
    const arrayContent = content.slice(startIdx, i - 1);

    // Extract parts from this array
    const parts = [];
    const partRegex = /partId:\s*(\d+),[\s\S]*?hebrew:\s*`([\s\S]*?)`,\s*\n\s*english:\s*`([\s\S]*?)`/g;
    let match;
    while ((match = partRegex.exec(arrayContent)) !== null) {
      parts.push({
        partId: parseInt(match[1]),
        hebrew: match[2],
        english: match[3],
      });
    }
    if (parts.length > 0) {
      parshas[slug] = parts;
    }
  }
  return parshas;
}

const parshas = extractParshas(summaryFile);
const slugs = Object.keys(parshas);
console.log(`Found ${slugs.length} parshas: ${slugs.join(", ")}`);

const audioRoot = path.join(root, "public/audio");

async function generateAudio(text, outputPath, voice = "nova") {
  if (fs.existsSync(outputPath)) {
    console.log(`  Skipping ${path.basename(outputPath)} (already exists)`);
    return;
  }

  console.log(`  Generating ${path.basename(outputPath)}...`);
  const response = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "tts-1-hd",
      input: text,
      voice: voice,
      response_format: "mp3",
      speed: 0.95,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error(`  ERROR for ${path.basename(outputPath)}: ${response.status} ${err}`);
    return;
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(outputPath, buffer);
  console.log(`  ✓ ${path.basename(outputPath)} (${(buffer.length / 1024).toFixed(0)} KB)`);
}

for (const [slug, parts] of Object.entries(parshas)) {
  const parshaDir = path.join(audioRoot, slug);
  if (!fs.existsSync(parshaDir)) {
    fs.mkdirSync(parshaDir, { recursive: true });
  }

  console.log(`\n=== ${slug} ===`);
  for (const part of parts) {
    console.log(`Part ${part.partId}:`);
    await generateAudio(part.hebrew, path.join(parshaDir, `part${part.partId}-he.mp3`), "nova");
    await generateAudio(part.english, path.join(parshaDir, `part${part.partId}-en.mp3`), "nova");
  }
}

console.log("\n✅ All audio files generated!");
