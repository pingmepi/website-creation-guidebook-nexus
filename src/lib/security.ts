/**
 * Security configuration and utilities
 * Implements security headers and policies to protect against common web vulnerabilities
 */

// Content Security Policy configuration
export const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Required for Vite in development
    "'unsafe-eval'", // Required for Vite in development
    "https://cdn.jsdelivr.net", // For external libraries
    "https://unpkg.com", // For external libraries
    "localhost:*", // Allow localhost scripts for development
    "127.0.0.1:*", // Allow localhost scripts for development
    "blob:", // For worker scripts
    "data:" // For inline scripts
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for styled components and CSS-in-JS
    "https://fonts.googleapis.com",
    "localhost:*", // Allow localhost styles for development
    "127.0.0.1:*" // Allow localhost styles for development
  ],
  'font-src': [
    "'self'",
    "https://fonts.gstatic.com",
    "data:" // For base64 encoded fonts
  ],
  'img-src': [
    "'self'",
    "data:", // For base64 images
    "blob:", // For generated images
    "https:", // Allow HTTPS images
    "*.supabase.co", // Supabase storage
    "*.supabase.com" // Supabase storage
  ],
  'connect-src': [
    "'self'",
    "*.supabase.co", // Supabase API
    "*.supabase.com", // Supabase API
    "https://api.openai.com", // OpenAI API
    "https://accounts.google.com", // Google OAuth
    "https://oauth2.googleapis.com", // Google OAuth
    "wss:", // WebSocket connections
    "ws:", // WebSocket connections (dev)
    "localhost:*", // Allow localhost connections for development
    "127.0.0.1:*", // Allow localhost connections for development
    "http://localhost:*", // Allow HTTP localhost for development
    "https://localhost:*" // Allow HTTPS localhost for development
  ],
  'frame-ancestors': ["'none'"], // Prevent clickjacking
  'base-uri': ["'self'"], // Restrict base URI
  'form-action': ["'self'"], // Restrict form submissions
  'upgrade-insecure-requests': [] // Upgrade HTTP to HTTPS
};

// Generate CSP header value
export const generateCSPHeader = (): string => {
  return Object.entries(CSP_DIRECTIVES)
    .map(([directive, sources]) => {
      if (sources.length === 0) {
        return directive;
      }
      return `${directive} ${sources.join(' ')}`;
    })
    .join('; ');
};

// Security headers configuration
export const SECURITY_HEADERS = {
  // Content Security Policy
  'Content-Security-Policy': generateCSPHeader(),
  
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Enable XSS protection
  'X-XSS-Protection': '1; mode=block',
  
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  
  // Strict Transport Security (HTTPS only)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  
  // Referrer Policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions Policy (Feature Policy)
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'accelerometer=()',
    'gyroscope=()'
  ].join(', ')
};

// CORS configuration for development
export const CORS_CONFIG = {
  origin: process.env.NODE_ENV === 'development'
    ? ['http://localhost:8080', 'http://localhost:8081', 'http://localhost:3000']
    : [
        'https://your-domain.com',
        'https://your-app.vercel.app'
      ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ]
};

/**
 * Sanitize user input to prevent XSS attacks
 */
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

/**
 * Validate file uploads
 */
export const validateFileUpload = (file: File): { valid: boolean; error?: string } => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size too large. Maximum size is 5MB.' };
  }
  
  return { valid: true };
};

/**
 * Rate limiting configuration
 */
export const RATE_LIMITS = {
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5 // 5 attempts per window
  },
  api: {
    windowMs: 60 * 1000, // 1 minute
    max: 100 // 100 requests per minute
  },
  upload: {
    windowMs: 60 * 1000, // 1 minute
    max: 10 // 10 uploads per minute
  }
};
