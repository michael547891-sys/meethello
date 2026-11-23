import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { handleMeetingApi } from './server/meetingApi.js';

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) });
  res.end(payload);
}

function meetingApi() {
  return {
    name: 'meeting-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const raw = req.url || '/';
        const path = raw.split('?')[0];
        if (!path.startsWith('/api/')) return next();
        try {
          const rawBody = req.method === 'POST' ? (await readBody(req)).toString('utf8') : '';
          const result = await handleMeetingApi({
            method: req.method,
            pathname: path,
            rawBody,
            signature: req.headers['calendly-webhook-signature'] || '',
            headers: req.headers,
            remoteAddress: req.socket?.remoteAddress || '',
          });
          return sendJson(res, result.status, result.body);
        } catch (error) {
          return sendJson(res, error.status || 500, { error: error.message || 'Server error' });
        }
      });
    },
  };
}

function redirectToMeet() {
  return {
    name: 'redirect-to-meet',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const raw = req.url || '/';
        const q = raw.indexOf('?');
        const path = q === -1 ? raw : raw.slice(0, q);
        const search = q === -1 ? '' : raw.slice(q);
        if (path === '/' || path === '/meet' || path === '/meet/') {
          res.writeHead(302, { Location: `/wdd-fsvi-dmx${search}` });
          res.end();
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [meetingApi(), react(), redirectToMeet()],
  server: {
    host: true,        // listen on 127.0.0.1, ::1 and the network address
    port: 5173,
    strictPort: true,
    open: '/wdd-fsvi-dmx',
    watch: {
      usePolling: true,
      interval: 1000,
    },
  },
});
