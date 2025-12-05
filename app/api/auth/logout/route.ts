import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({ success: true });
    const session = await getIronSession<SessionData>(request, response, sessionOptions);
    
    // Distruggi la sessione
    session.destroy();
    
    console.log('✅ Logout eseguito');
    
    return response;
  } catch (error) {
    console.error('❌ Errore durante logout:', error);
    return NextResponse.json(
      { error: 'Errore durante il logout' },
      { status: 500 }
    );
  }
}