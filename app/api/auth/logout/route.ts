import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ 
    success: true,
    message: 'Logout effettuato con successo'
  });

  // Cancella cookie di sessione
  response.cookies.set({
    name: 'admin_auth',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0, // Cancella immediatamente
    path: '/',
  });

  return response;
}