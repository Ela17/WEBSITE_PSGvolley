import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignora la pagina di login stessa
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  // Verifica se c'è il cookie di sessione
  const authCookie = request.cookies.get('admin_auth')?.value;
  
  // Se cookie valido, continua
  if (authCookie === 'authenticated') {
    return NextResponse.next();
  }

  // Altrimenti redirect a login
  const loginUrl = new URL('/admin/login', request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: '/admin/:path*',
};