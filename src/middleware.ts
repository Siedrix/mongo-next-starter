import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { NextRequestWithAuth } from "next-auth/middleware";

export default async function middleware(request: NextRequestWithAuth) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: `${process.env.NEXTAUTH_COOKIE_PREFIX || 'app'}.session-token`
  });
  const isAuthenticated = !!token;

  console.log("isAuthenticated", isAuthenticated);

  // Auth pages that should redirect to dashboard if user is logged in
  if (isAuthenticated && ["/login", "/register"].includes(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Protected pages that should redirect to login if user is not logged in
  if (!isAuthenticated && (request.nextUrl.pathname.startsWith("/dashboard") || request.nextUrl.pathname.startsWith("/admin"))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login", "/register"],
};