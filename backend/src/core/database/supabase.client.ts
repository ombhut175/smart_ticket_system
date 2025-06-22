import { createClient, SupabaseClient } from '@supabase/supabase-js';

import { ENV } from '../../string-const';

/**
 * Returns a Supabase client.
 *
 * • When `accessToken` is provided the client adds `Authorization: Bearer <token>` to all outgoing requests.
 * • For login / signup flows pass **no token** so Supabase JS can return a fresh session.
 */
export const getSupabaseClient = (accessToken?: string): SupabaseClient => {
  const supabaseUrl = process.env[ENV.SUPABASE_URL];
  const supabaseAnon = process.env[ENV.SUPABASE_ANON_KEY];

  if (!supabaseUrl || !supabaseAnon) {
    throw new Error('Missing Supabase environment variables');
  }

  const options: Parameters<typeof createClient>[2] = {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  };

  if (accessToken) {
    options.global = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    } as any;
  }

  return createClient(supabaseUrl, supabaseAnon, options);
}; 