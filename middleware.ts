// middleware.ts (rinomina da proxy.ts)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Escludi API routes
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Escludi login page
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  // Proteggi pagine admin
  if (pathname.startsWith('/admin')) {
    const response = NextResponse.next();
    const session = await getIronSession<SessionData>(request, response, sessionOptions);

    if (!session.user?.isLoggedIn) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};