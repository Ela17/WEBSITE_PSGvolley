import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { AUTH_CONFIG } from '@/lib/env';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Validazione input
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username e password obbligatori' },
        { status: 400 }
      );
    }

    console.log('🔐 Tentativo login per:', username);

    // Verifica username
    if (username !== AUTH_CONFIG.adminUsername) {
      console.log('❌ Username errato');
      return NextResponse.json(
        { error: 'Credenziali non valide' },
        { status: 401 }
      );
    }

    // Verifica password con bcrypt
    const isPasswordValid = await bcrypt.compare(
      password,
      AUTH_CONFIG.adminPasswordHash
    );

    if (!isPasswordValid) {
      console.log('❌ Password errata');
      return NextResponse.json(
        { error: 'Credenziali non valide' },
        { status: 401 }
      );
    }

    console.log('✅ Login SUCCESS per:', username);

    // Crea sessione con tipo SessionData
    const response = NextResponse.json({ success: true });
    const session = await getIronSession<SessionData>(request, response, sessionOptions);
    
    session.user = {
      username: AUTH_CONFIG.adminUsername,
      isLoggedIn: true,
    };
    
    await session.save();

    return response;
  } catch (error) {
    console.error('❌ Errore durante login:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
