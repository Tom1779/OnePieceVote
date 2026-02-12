// app/auth/callback/route.js
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect to home page with clean URL (no tokens in URL)
  return NextResponse.redirect(new URL('/', requestUrl.origin));
}