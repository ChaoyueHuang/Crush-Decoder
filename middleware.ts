import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const url = request.nextUrl
  const ref = url.searchParams.get("ref")
  if (!ref) return NextResponse.next()

  const response = NextResponse.next()
  response.cookies.set("ref_source", ref, {
    maxAge: 60 * 60 * 24,
    path: "/",
    sameSite: "lax",
  })
  return response
}

export const config = {
  matcher: "/:path*",
}
