/**
 * ═══════════════════════════════════════════════════════════
 *  KEEPALIVE
 *
 *  Hit by a Vercel Cron (see vercel.json) on a schedule so the
 *  Supabase project never sits idle long enough to be paused
 *  (free-tier projects pause after 7 days of inactivity).
 *
 *  Runs a trivial read so the cron generates real DB activity.
 * ═══════════════════════════════════════════════════════════
 */

import { createClient } from "@supabase/supabase-js";

// Always run on the server, never cache.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  // If CRON_SECRET is configured, require Vercel's cron auth header.
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    return Response.json(
      { ok: false, error: "Supabase env vars missing" },
      { status: 500 }
    );
  }

  const supabase = createClient(url, key);

  // Cheap HEAD-style count query — just enough to count as activity.
  const { error } = await supabase
    .from("players")
    .select("id", { count: "exact", head: true });

  if (error) {
    return Response.json(
      { ok: false, pingedAt: new Date().toISOString(), error: error.message },
      { status: 500 }
    );
  }

  return Response.json({ ok: true, pingedAt: new Date().toISOString() });
}
