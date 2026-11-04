import legacy from './worker.js';
import { handleOperations, operationsAvailable, isOwnerAuthenticated } from './server/operations.mjs';
import { privateAssets } from './server/ops-assets.mjs';
import { loginPage } from './server/owner-login.mjs';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/ops/')) return handleOperations(request, env);
    if (url.pathname === '/ops' || url.pathname.startsWith('/ops/')) {
      if (!operationsAvailable(env)) return new Response('운영실이 비활성 상태입니다.', { status: 503, headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' } });
      if (url.pathname === '/ops/login') {
        if (request.method === 'GET') return await isOwnerAuthenticated(request, env) ? new Response(null, { status: 303, headers: { Location: '/ops/', 'Cache-Control': 'no-store' } }) : loginPage();
        if (request.method !== 'POST') return new Response(null, { status: 405, headers: { 'Cache-Control': 'no-store' } });
        if (request.headers.get('Origin') !== url.origin) return new Response(null, { status: 403, headers: { 'Cache-Control': 'no-store' } });
        try {
          const text = await request.text();
          if (new TextEncoder().encode(text).length > 2048) return loginPage(true);
          const key = new URLSearchParams(text).get('key') || '';
          const response = await handleOperations(new Request(new URL('/api/ops/session', url), { method: 'POST', headers: { Origin: url.origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ key }) }), env);
          if (!response.ok) return loginPage(true);
          return new Response(null, { status: 303, headers: { Location: '/ops/', 'Set-Cookie': response.headers.get('Set-Cookie'), 'Cache-Control': 'no-store' } });
        } catch { return loginPage(true); }
      }
      if (!await isOwnerAuthenticated(request, env)) {
        const page = ['/ops', '/ops/', '/ops/index.html'].includes(url.pathname);
        return new Response(page ? null : '인증이 필요합니다.', { status: page ? 303 : 401, headers: { ...(page ? { Location: '/ops/login' } : {}), 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow', 'X-Content-Type-Options': 'nosniff' } });
      }
      if (!['GET', 'HEAD'].includes(request.method)) return new Response(null, { status: 405, headers: { 'Cache-Control': 'no-store' } });
      const path = ['/ops', '/ops/'].includes(url.pathname) ? '/ops/index.html' : url.pathname;
      const asset = privateAssets[path];
      if (!asset) return new Response(null, { status: 404, headers: { 'Cache-Control': 'no-store' } });
      const headers = new Headers({ 'Content-Type': asset.type });
      headers.set('Cache-Control', 'no-store');
      headers.set('X-Robots-Tag', 'noindex, nofollow');
      headers.set('Referrer-Policy', 'no-referrer');
      headers.set('X-Content-Type-Options', 'nosniff');
      headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
      return new Response(request.method === 'HEAD' ? null : asset.body, { headers });
    }
    return legacy.fetch(request, env, ctx);
  },
};
