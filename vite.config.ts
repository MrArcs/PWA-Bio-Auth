import fs from 'fs';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const certPath = path.resolve(__dirname, 'certs/localhost.pem');
    const keyPath = path.resolve(__dirname, 'certs/localhost-key.pem');
    const httpsConfig = (fs.existsSync(certPath) && fs.existsSync(keyPath))
      ? {
          cert: fs.readFileSync(certPath),
          key: fs.readFileSync(keyPath),
        }
      : true; // falls back to self-signed if custom certs are missing

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        https: httpsConfig,
      },
      plugins: [react(), basicSsl()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
