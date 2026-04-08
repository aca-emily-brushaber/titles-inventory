import { NextResponse } from "next/server"

export async function POST() {
  return NextResponse.json(
    { message: "Webhook endpoint stub. Implement with your backend." },
    { status: 200 }
  )
}
