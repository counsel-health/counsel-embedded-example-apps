import { NextRequest, NextResponse } from "next/server";
import { getSession } from "./lib/session";

// 1. All routes are protected by default, specify public routes below
const publicRoutes = ["/login"];

// https://github.com/vercel/next.js/discussions/36308
// next matcher won't match .well-known routes
const shouldSkipMiddleware = (path: string) => {
  return path.startsWith("/.well-known");
};

export default async function middleware(req: NextRequest) {
  // 2. Check if the current route is protected or public
  const path = req.nextUrl.pathname;
  const isPublicRoute = publicRoutes.includes(path);

  if (shouldSkipMiddleware(path)) {
    return NextResponse.next();
  }

  // 3. Decrypt the session from the cookie
  const session = await getSession();

  // 4. Redirect to /login if the user is not authenticated
  if (!isPublicRoute && !session.token) {
    console.log("Redirecting to login because user is not authenticated");
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // 5. Redirect to /dashboard if the user is already authenticated
  if (isPublicRoute && session.token) {
    console.log("Redirecting to dashboard because user is authenticated");
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
