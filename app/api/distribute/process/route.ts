import { NextResponse } from "next/server"
import { processDistributionQueue } from "@/lib/distribute"

export async function POST(request: Request) {
  // Validate API secret
  const authHeader = request.headers.get("authorization")
  const expectedSecret = process.env.DISTRIBUTE_API_SECRET
  if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const results = await processDistributionQueue()
    return NextResponse.json(results)
  } catch (err) {
    console.error("Distribution processing failed:", err)
    return NextResponse.json({ error: "Processing failed." }, { status: 500 })
  }
}
