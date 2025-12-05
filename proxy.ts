import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';

export async function proxy(request: NextRequest) {
  // Percorsi che richiedono autenticazione
  const protectedPaths = ['/admin'];
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path) && 
    request.nextUrl.pathname !== '/admin/login'
  );

  if (!isProtectedPath) {
    return NextResponse.next();
  }

  // Verifica sessione
  const response = NextResponse.next();
  const session = await getIronSession<SessionData>(request, response, sessionOptions);

  if (!session.user?.isLoggedIn) {
    // Redirect al login se non autenticato
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('from', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};