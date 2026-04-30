import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

// Read API key from .env.local
const envFile = fs.readFileSync(path.join(root, ".env.local"), "utf-8");
const apiKey = envFile.match(/OPENAI_API_KEY=(.+)/)?.[1]?.trim();
if (!apiKey) {
  console.error("Please set OPENAI_API_KEY in .env.local");
  process.exit(1);
}

const outputDir = path.join(root, "public/audio/sfx");
fs.mkdirSync(outputDir, { recursive: true });

// Sound effects — varied Hebrew phrases for each category
const SOUNDS = {
  correct: [
    "!מצוין",
    "!נכון מאוד",
    "!יופי של תשובה",
    "!מדהים",
    "!בול פגיעה",
    "!כל הכבוד",
    "!נהדר",
    "!בדיוק ככה",
  ],
  wrong: [
    "לא נורא, נסה שוב",
    "קרוב! בפעם הבאה",
    "!אל תוותר",
    "!המשך לנסות",
    "עוד קצת ותצליח",
  ],
  streak: [
    "וואו, רצף מטורף!",
    "!אתה בוער, אש",
    "!בלתי ניתן לעצירה",
  ],
  levelup: [
    "!מזל טוב, עלית רמה",
    "!רמה חדשה, כל הכבוד",
  ],
  perfect: [
    "!מושלם, ציון מושלם, אלוף",
  ],
  complete: [
    "!כל הכבוד, סיימת את החידון",
    "!יופי, סיימת, כל הכבוד",
  ],
};

// Use different voices for variety
const VOICES = ["nova", "shimmer", "alloy", "echo", "fable", "onyx"];

async function generateAudio(text, filename, voice = "nova") {
  const outPath = path.join(outputDir, filename);
  if (fs.existsSync(outPath)) {
    console.log(`  Skipping ${filename} (already exists)`);
    return;
  }

  console.log(`  Generating ${filename} — "${text}" [voice: ${voice}]`);
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
      speed: 1.1, // Slightly faster for sound effects
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

// Generate all sound effects
for (const [category, phrases] of Object.entries(SOUNDS)) {
  console.log(`\n${category.toUpperCase()}:`);
  for (let i = 0; i < phrases.length; i++) {
    // Pick a different voice for each sound in the category for variety
    const voice = VOICES[i % VOICES.length];
    await generateAudio(phrases[i], `${category}${i + 1}.mp3`, voice);
  }
}

console.log("\n✅ All sound effects generated!");
