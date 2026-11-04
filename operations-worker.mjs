import legacy from './worker.js';
import { handleOperations } from './server/operations.mjs';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/ops/')) return handleOperations(request, env);
    if (['/ops', '/ops/', '/ops/index.html'].includes(url.pathname)) {
      const response = await env.ASSETS.fetch(new Request(new URL('/ops/index.html', url), request));
      const headers = new Headers(response.headers);
      headers.set('Cache-Control', 'no-store');
      headers.set('X-Robots-Tag', 'noindex, nofollow');
      headers.set('Referrer-Policy', 'no-referrer');
      headers.set('X-Content-Type-Options', 'nosniff');
      headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
      return new Response(response.body, { status: response.status, headers });
    }
    return legacy.fetch(request, env, ctx);
  },
};
