// Middleware to handle public routes without authentication
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log('MIDDLEWARE PATHNAME:', pathname); // debug log
  
  // Define public paths that don't require authentication
  const publicPaths = [
    '/',
    '/auth',
    '/login',
    '/register',
    '/notification-demo', // Added for testing the notification system
  ];
  
  // ทุก path ที่ขึ้นต้นด้วย /public ไม่ต้อง auth
  // ครอบคลุมทุก /public path (เช่น /public, /public/, /public/xxx)
  const isPublicPath = pathname.startsWith('/public') || publicPaths.includes(pathname);
  
  // If it's a public path, allow access without authentication
  if (isPublicPath) {
    return NextResponse.next();
  }
  
  // For protected routes, check if user has auth token
  const token = request.cookies.get('auth_token')?.value;
  
  // If no token found and not a public path, redirect to auth
  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }
  
  // Allow access to protected routes with token
  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
