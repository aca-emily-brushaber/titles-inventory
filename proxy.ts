import { NextResponse, type NextRequest } from "next/server"

/**
 * No auth gate -- titles management UI loads without login (per product requirements).
 * API routes are open in dev; lock down in production with real auth when integrated.
 */
export async function proxy(request: NextRequest) {
  return NextResponse.next({ request })
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
