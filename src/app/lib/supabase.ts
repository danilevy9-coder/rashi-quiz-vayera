import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- Types ---

export interface Player {
  id: string;
  name: string;
  avatar_emoji: string;
  total_xp: number;
  level: number;
  quizzes_completed: number;
  best_streak: number;
  created_at: string;
}

export interface QuizAttempt {
  id: string;
  player_id: string;
  part_id: number;
  score: number;
  total_questions: number;
  xp_earned: number;
  hearts_remaining: number;
  max_streak: number;
  duration_seconds: number;
  completed_at: string;
}

// --- Player API ---

export async function getPlayers(): Promise<Player[]> {
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .order("total_xp", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createPlayer(name: string, emoji: string): Promise<Player> {
  const { data, error } = await supabase
    .from("players")
    .insert({ name, avatar_emoji: emoji })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updatePlayerStats(
  playerId: string,
  xpToAdd: number,
  newLevel: number
): Promise<void> {
  const { error } = await supabase.rpc("add_player_xp", {
    p_id: playerId,
    xp_amount: xpToAdd,
    new_level: newLevel,
  });
  if (error) {
    // Fallback: manual update if RPC doesn't exist yet
    const { data: player } = await supabase
      .from("players")
      .select("total_xp, quizzes_completed")
      .eq("id", playerId)
      .single();
    if (player) {
      await supabase
        .from("players")
        .update({
          total_xp: player.total_xp + xpToAdd,
          level: newLevel,
          quizzes_completed: player.quizzes_completed + 1,
        })
        .eq("id", playerId);
    }
  }
}

export async function updatePlayerBestStreak(
  playerId: string,
  streak: number
): Promise<void> {
  const { data: player } = await supabase
    .from("players")
    .select("best_streak")
    .eq("id", playerId)
    .single();
  if (player && streak > player.best_streak) {
    await supabase
      .from("players")
      .update({ best_streak: streak })
      .eq("id", playerId);
  }
}

export async function saveQuizAttempt(attempt: Omit<QuizAttempt, "id" | "completed_at">): Promise<void> {
  const { error } = await supabase.from("quiz_attempts").insert(attempt);
  if (error) throw error;
}

export async function getPlayerAttempts(playerId: string): Promise<QuizAttempt[]> {
  const { data, error } = await supabase
    .from("quiz_attempts")
    .select("*")
    .eq("player_id", playerId)
    .order("completed_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getPlayerBestScores(
  playerId: string
): Promise<Record<number, { score: number; total: number }>> {
  const { data, error } = await supabase
    .from("quiz_attempts")
    .select("part_id, score, total_questions")
    .eq("player_id", playerId);
  if (error) throw error;

  const bests: Record<number, { score: number; total: number }> = {};
  for (const row of data ?? []) {
    const prev = bests[row.part_id];
    if (!prev || row.score > prev.score) {
      bests[row.part_id] = { score: row.score, total: row.total_questions };
    }
  }
  return bests;
}

// --- Admin API ---

export async function getAllPlayersWithStats(): Promise<Player[]> {
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .order("total_xp", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getAllAttempts(): Promise<(QuizAttempt & { player_name?: string })[]> {
  const { data, error } = await supabase
    .from("quiz_attempts")
    .select("*, players(name, avatar_emoji)")
    .order("completed_at", { ascending: false });
  if (error) throw error;
  // Flatten the join
  return (data ?? []).map((row: Record<string, unknown>) => {
    const players = row.players as { name: string; avatar_emoji: string } | null;
    return {
      ...row,
      player_name: players?.name ?? "Unknown",
      player_emoji: players?.avatar_emoji ?? "📖",
    };
  }) as (QuizAttempt & { player_name?: string; player_emoji?: string })[];
}
