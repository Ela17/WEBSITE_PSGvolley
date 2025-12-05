import { SessionOptions } from 'iron-session';
import { AUTH_CONFIG } from '@/lib/env';

export interface SessionData {
  user?: {
    username: string;
    isLoggedIn: boolean;
  };
}

export const sessionOptions: SessionOptions = {
  password: AUTH_CONFIG.sessionSecret,
  cookieName: 'psg_admin_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 giorni
  },
};