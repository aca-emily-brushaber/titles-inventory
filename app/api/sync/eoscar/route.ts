import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    message: "Sync completed (mock)",
    total_fetched: 0,
    created: 0,
    skipped: 0,
    failed: 0,
  })
}
