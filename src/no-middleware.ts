import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(request: { nextUrl: { pathname: string; }; url: string | URL | undefined; }) {
  const session = await auth();
  
  // Protect all routes except login, api, etc
  if (!session && !request.nextUrl.pathname.startsWith('/login') && 
      !request.nextUrl.pathname.startsWith('/api/auth')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|login|favicon.ico).*)',
  ],
};