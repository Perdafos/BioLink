import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

async function exchangeCode(platform: string, code: string, redirectUri: string) {
  if (platform === 'instagram') {
    const appId = Deno.env.get('META_APP_ID');
    const appSecret = Deno.env.get('META_APP_SECRET');
    const response = await fetch('https://graph.facebook.com/v23.0/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: appId || '',
        client_secret: appSecret || '',
        redirect_uri: redirectUri,
        code,
      }),
    });
    const token = await response.json();
    if (!response.ok || !token.access_token) throw new Error(token.error?.message || 'Instagram token exchange failed');
    return { accessToken: token.access_token, refreshToken: null, expiresIn: token.expires_in };
  }

  if (platform === 'youtube') {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: Deno.env.get('YOUTUBE_CLIENT_ID') || '',
        client_secret: Deno.env.get('YOUTUBE_CLIENT_SECRET') || '',
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });
    const token = await response.json();
    if (!response.ok || !token.access_token) throw new Error(token.error_description || 'YouTube token exchange failed');
    return { accessToken: token.access_token, refreshToken: token.refresh_token || null, expiresIn: token.expires_in };
  }

  const response = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_key: Deno.env.get('TIKTOK_CLIENT_KEY') || '',
      client_secret: Deno.env.get('TIKTOK_CLIENT_SECRET') || '',
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });
  const token = await response.json();
  if (!response.ok || token.error || !token.access_token) throw new Error(token.error_description || 'TikTok token exchange failed');
  return { accessToken: token.access_token, refreshToken: token.refresh_token || null, expiresIn: token.expires_in };
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const callbackUrl =
    Deno.env.get('SOCIAL_OAUTH_CALLBACK_URL') ||
    `${supabaseUrl}/functions/v1/social-oauth-start`;

  const admin = createClient(supabaseUrl, serviceRoleKey);

  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  if (request.method === 'GET' && code && state) {
    const { data: oauthState } = await admin
      .from('oauth_states')
      .select('*')
      .eq('state', state)
      .maybeSingle();

    if (!oauthState) {
      return new Response('OAuth state is invalid or expired.', { status: 400 });
    }

    try {
      const tokens = await exchangeCode(oauthState.platform, code, callbackUrl);
      let accountId = '';
      let username = oauthState.platform;

      if (oauthState.platform === 'instagram') {
        const profileResponse = await fetch(
          `https://graph.facebook.com/v23.0/me/accounts?fields=instagram_business_account{id,username,name,profile_picture_url,followers_count}&access_token=${tokens.accessToken}`
        );
        const profile = await profileResponse.json();
        const instagram = profile.data?.find((page: any) => page.instagram_business_account)?.instagram_business_account;
        if (instagram) {
          accountId = instagram.id;
          username = instagram.username || instagram.name || username;
        }
      } else if (oauthState.platform === 'youtube') {
        const profileResponse = await fetch(
          'https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true',
          { headers: { Authorization: `Bearer ${tokens.accessToken}` } }
        );
        const profile = await profileResponse.json();
        const channel = profile.items?.[0];
        if (channel) {
          accountId = channel.id;
          username = channel.snippet?.title || username;
        }
      } else {
        const profileResponse = await fetch(
          'https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,avatar_url',
          { headers: { Authorization: `Bearer ${tokens.accessToken}` } }
        );
        const profile = await profileResponse.json();
        const user = profile.data?.user;
        if (user) {
          accountId = user.open_id;
          username = user.display_name || username;
        }
      }

      await admin.from('social_connections').upsert({
        user_id: oauthState.user_id,
        platform: oauthState.platform,
        account_id: accountId || null,
        username,
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        token_expires_at: tokens.expiresIn
          ? new Date(Date.now() + Number(tokens.expiresIn) * 1000).toISOString()
          : null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,platform' });

      await admin.from('oauth_states').delete().eq('state', state);
      const separator = oauthState.return_url.includes('?') ? '&' : '?';
      return Response.redirect(
        `${oauthState.return_url}${separator}connected=${encodeURIComponent(oauthState.platform)}&account=${encodeURIComponent(username)}`,
        302
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'OAuth failed';
      const separator = oauthState.return_url.includes('?') ? '&' : '?';
      return Response.redirect(`${oauthState.return_url}${separator}oauth_error=${encodeURIComponent(message)}`, 302);
    }
  }

  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return json({ error: 'Unauthorized' }, 401);

  const auth = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: authData, error: authError } = await auth.auth.getUser();
  if (authError || !authData.user) return json({ error: 'Unauthorized' }, 401);

  const body = await request.json();
  const platform = String(body.platform || '');
  if (!['instagram', 'tiktok', 'tiktok-business', 'youtube'].includes(platform)) {
    return json({ error: 'Unsupported platform' }, 400);
  }

  const state = crypto.randomUUID();
  await admin.from('oauth_states').insert({
    state,
    user_id: authData.user.id,
    platform,
    return_url: String(body.returnUrl || Deno.env.get('APP_URL') || supabaseUrl),
  });

  let authUrl = '';
  if (platform === 'instagram') {
    authUrl =
      `https://www.facebook.com/v23.0/dialog/oauth?` +
      new URLSearchParams({
        client_id: Deno.env.get('META_APP_ID') || '',
        redirect_uri: callbackUrl,
        state,
        scope: 'instagram_basic,instagram_manage_insights,pages_show_list',
        response_type: 'code',
      });
  } else if (platform === 'youtube') {
    authUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      new URLSearchParams({
        client_id: Deno.env.get('YOUTUBE_CLIENT_ID') || '',
        redirect_uri: callbackUrl,
        state,
        scope: 'openid email https://www.googleapis.com/auth/youtube.readonly',
        response_type: 'code',
        access_type: 'offline',
        include_granted_scopes: 'true',
        prompt: 'consent',
      });
  } else {
    authUrl =
      `https://www.tiktok.com/v2/auth/authorize/` +
      `?${new URLSearchParams({
        client_key: Deno.env.get('TIKTOK_CLIENT_KEY') || '',
        redirect_uri: callbackUrl,
        state,
        scope: 'user.info.basic,user.info.stats',
        response_type: 'code',
      })}`;
  }

  return json({ url: authUrl });
});
