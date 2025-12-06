import { NextResponse } from "next/server"

export const runtime = "edge"

export function GET(request: Request) {
  const url = new URL("/logo.png", request.url)
  return NextResponse.redirect(url)
}
