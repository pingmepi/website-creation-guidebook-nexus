import type { Plugin } from 'vite';
import { SECURITY_HEADERS } from './security';

/**
 * Vite plugin to add security headers during development
 */
export function securityHeadersPlugin(): Plugin {
  return {
    name: 'security-headers',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Add security headers to all responses
        Object.entries(SECURITY_HEADERS).forEach(([header, value]) => {
          res.setHeader(header, value);
        });
        
        // Add CORS headers for development
        if (process.env.NODE_ENV === 'development') {
          res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins in development
          res.setHeader('Access-Control-Allow-Credentials', 'true');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
        }
        
        next();
      });
    }
  };
}
