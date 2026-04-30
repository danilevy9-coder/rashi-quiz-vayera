export interface LevelInfo {
  level: number;
  title: string;
  emoji: string;
  xpRequired: number;
}

export const LEVELS: LevelInfo[] = [
  { level: 1, title: "מתחיל", emoji: "🌱", xpRequired: 0 },
  { level: 2, title: "תלמיד", emoji: "📖", xpRequired: 100 },
  { level: 3, title: "חכם", emoji: "🧠", xpRequired: 250 },
  { level: 4, title: "מבין", emoji: "💡", xpRequired: 500 },
  { level: 5, title: "ידען", emoji: "⭐", xpRequired: 800 },
  { level: 6, title: "חריף", emoji: "🔥", xpRequired: 1200 },
  { level: 7, title: "למדן", emoji: "🎓", xpRequired: 1800 },
  { level: 8, title: "גאון", emoji: "👑", xpRequired: 2500 },
  { level: 9, title: "רב", emoji: "🏆", xpRequired: 3500 },
  { level: 10, title: "גדול הדור", emoji: "🌟", xpRequired: 5000 },
];

export function getLevelForXp(totalXp: number): LevelInfo {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalXp >= LEVELS[i].xpRequired) return LEVELS[i];
  }
  return LEVELS[0];
}

export function getNextLevel(currentLevel: number): LevelInfo | null {
  const idx = LEVELS.findIndex((l) => l.level === currentLevel);
  if (idx < 0 || idx >= LEVELS.length - 1) return null;
  return LEVELS[idx + 1];
}

export function getXpProgress(totalXp: number): {
  current: LevelInfo;
  next: LevelInfo | null;
  progressPct: number;
  xpInLevel: number;
  xpNeeded: number;
} {
  const current = getLevelForXp(totalXp);
  const next = getNextLevel(current.level);
  if (!next) {
    return { current, next: null, progressPct: 100, xpInLevel: 0, xpNeeded: 0 };
  }
  const xpInLevel = totalXp - current.xpRequired;
  const xpNeeded = next.xpRequired - current.xpRequired;
  const progressPct = Math.min(100, (xpInLevel / xpNeeded) * 100);
  return { current, next, progressPct, xpInLevel, xpNeeded };
}
