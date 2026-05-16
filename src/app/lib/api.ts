/**
 * API base URL — empty string for web (relative URLs),
 * full Vercel URL for Capacitor native builds.
 *
 * Set NEXT_PUBLIC_API_BASE in .env or Capacitor config
 * when building for native (e.g. "https://rashi-quizz.vercel.app")
 */
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";
