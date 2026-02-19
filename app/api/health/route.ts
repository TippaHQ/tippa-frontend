import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Check each table exists by attempting a count query
    const tables = [
      "profiles",
      "cascade_dependencies",
      "cascade_rules",
      "transactions",
      "monthly_flow_stats",
      "notification_preferences",
      "profile_analytics",
    ]

    const results: Record<string, { exists: boolean; count: number }> = {}

    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select("*", { count: "exact", head: true })

      results[table] = {
        exists: !error,
        count: count ?? 0,
      }
    }

    const allExist = Object.values(results).every((r) => r.exists)

    return NextResponse.json({
      status: allExist ? "healthy" : "degraded",
      database: "connected",
      tables: results,
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
