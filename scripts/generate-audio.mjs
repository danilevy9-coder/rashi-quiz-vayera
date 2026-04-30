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

// Import summaries
const { summaries } = await import("../src/app/quizData/summaries.ts").catch(async () => {
  // Fallback: read the TS file and extract data manually
  const content = fs.readFileSync(
    path.join(root, "src/app/quizData/summaries.ts"),
    "utf-8"
  );
  // We'll just read the JSON parts directly
  const parts = [];
  for (let i = 1; i <= 5; i++) {
    const jsonFile = fs.readFileSync(
      path.join(root, `src/app/quizData/part${i}.json`),
      "utf-8"
    );
    parts.push(JSON.parse(jsonFile));
  }
  return { summaries: null, parts };
});

// Read summaries from the TS file by evaluating the template literals
const summaryFile = fs.readFileSync(
  path.join(root, "src/app/quizData/summaries.ts"),
  "utf-8"
);

// Extract Hebrew and English texts using regex
function extractTexts(content) {
  const results = [];
  const partRegex = /partId:\s*(\d+),[\s\S]*?hebrew:\s*`([\s\S]*?)`,\s*\n\s*english:\s*`([\s\S]*?)`/g;
  let match;
  while ((match = partRegex.exec(content)) !== null) {
    results.push({
      partId: parseInt(match[1]),
      hebrew: match[2],
      english: match[3],
    });
  }
  return results;
}

const parts = extractTexts(summaryFile);
console.log(`Found ${parts.length} parts to generate audio for.`);

const outputDir = path.join(root, "public/audio");

async function generateAudio(text, filename, voice = "nova") {
  const outPath = path.join(outputDir, filename);
  if (fs.existsSync(outPath)) {
    console.log(`  Skipping ${filename} (already exists)`);
    return;
  }

  console.log(`  Generating ${filename}...`);
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
    console.error(`  ERROR for ${filename}: ${response.status} ${err}`);
    return;
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(outPath, buffer);
  console.log(`  ✓ ${filename} (${(buffer.length / 1024).toFixed(0)} KB)`);
}

for (const part of parts) {
  console.log(`\nPart ${part.partId}:`);
  await generateAudio(part.hebrew, `part${part.partId}-he.mp3`, "nova");
  await generateAudio(part.english, `part${part.partId}-en.mp3`, "nova");
}

console.log("\n✅ All audio files generated!");
