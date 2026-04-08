import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    imported: [],
    skipped: 0,
    message: "OnBase endpoint stub. Implement with your backend.",
  })
}
