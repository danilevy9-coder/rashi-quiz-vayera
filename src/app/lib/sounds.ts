// Sound effect system with variety — never plays the same sound twice in a row

type SoundCategory = "correct" | "wrong" | "streak" | "levelup" | "perfect" | "complete";

const SOUND_COUNTS: Record<SoundCategory, number> = {
  correct: 8,
  wrong: 5,
  streak: 3,
  levelup: 2,
  perfect: 1,
  complete: 2,
};

// Track last played index per category to avoid repetition
const lastPlayed: Record<string, number> = {};

// Audio cache
const audioCache: Record<string, HTMLAudioElement> = {};

function getAudioElement(src: string): HTMLAudioElement {
  if (!audioCache[src]) {
    audioCache[src] = new Audio(src);
    audioCache[src].preload = "auto";
  }
  return audioCache[src];
}

function pickRandom(category: SoundCategory): number {
  const count = SOUND_COUNTS[category];
  if (count === 1) return 1;

  const last = lastPlayed[category] ?? -1;
  let pick: number;
  do {
    pick = Math.floor(Math.random() * count) + 1;
  } while (pick === last && count > 1);

  lastPlayed[category] = pick;
  return pick;
}

export function playSound(category: SoundCategory): void {
  try {
    const index = pickRandom(category);
    const src = `/audio/sfx/${category}${index}.mp3`;
    const audio = getAudioElement(src);
    audio.currentTime = 0;
    audio.play().catch(() => {
      // Silently fail — audio may not be loaded yet or autoplay blocked
    });
  } catch {
    // Ignore errors — sounds are non-critical
  }
}

// Preload all sound effects
export function preloadSounds(): void {
  for (const [category, count] of Object.entries(SOUND_COUNTS)) {
    for (let i = 1; i <= count; i++) {
      const src = `/audio/sfx/${category}${i}.mp3`;
      getAudioElement(src);
    }
  }
}
