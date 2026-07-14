import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/health
 * Lightweight health-check endpoint for load balancers + uptime monitors.
 *
 * Returns 200 + { status: "ok" } when the app + DB are both reachable.
 * Returns 503 + { status: "degraded" } when the DB is unreachable.
 *
 * No auth required — this is a public endpoint.
 */
export async function GET() {
  const start = Date.now();
  let dbOk = true;
  let dbError: string | undefined;

  try {
    // Cheapest possible DB round-trip — SELECT 1.
    await db.$queryRaw`SELECT 1`;
  } catch (err) {
    dbOk = false;
    dbError = err instanceof Error ? err.message : "unknown";
  }

  const latencyMs = Date.now() - start;

  if (!dbOk) {
    return NextResponse.json(
      {
        status: "degraded",
        db: false,
        dbError,
        latencyMs,
        time: new Date().toISOString(),
      },
      { status: 503 }
    );
  }

  return NextResponse.json(
    {
      status: "ok",
      db: true,
      latencyMs,
      time: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        // Allow monitors to cache briefly so they don't hammer the DB.
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
