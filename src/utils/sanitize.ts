/**
 * Input Sanitization Utilities
 * Uses DOMPurify to sanitize user input and prevent XSS attacks
 */

import DOMPurify from 'dompurify';

/**
 * Sanitize text input - strips all HTML tags
 */
export function sanitizeText(input: string): string {
    if (!input || typeof input !== 'string') return '';
    return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
}

/**
 * Sanitize HTML input - allows safe HTML tags
 */
export function sanitizeHtml(input: string): string {
    if (!input || typeof input !== 'string') return '';
    return DOMPurify.sanitize(input, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br'],
        ALLOWED_ATTR: []
    });
}

/**
 * Sanitize URL - validates and sanitizes URLs
 */
export function sanitizeUrl(input: string): string {
    if (!input || typeof input !== 'string') return '';

    // Remove any HTML/script content first
    const cleaned = DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });

    // Validate URL protocol
    try {
        const url = new URL(cleaned);
        if (!['http:', 'https:', 'data:'].includes(url.protocol)) {
            return '';
        }
        return url.href;
    } catch {
        // If it's a relative path, just clean it
        return cleaned.replace(/[<>'"]/g, '');
    }
}

/**
 * Sanitize canvas text input - for fabric.js text objects
 */
export function sanitizeCanvasText(input: string): string {
    if (!input || typeof input !== 'string') return '';

    // Strip all HTML and limit special characters
    const sanitized = DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });

    // Remove potentially problematic characters for canvas
    return sanitized
        .replace(/[<>]/g, '')
        .trim();
}

/**
 * Sanitize object properties recursively (for JSON data)
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
    if (!obj || typeof obj !== 'object') return obj;

    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            sanitized[key] = sanitizeText(value);
        } else if (Array.isArray(value)) {
            sanitized[key] = value.map(item =>
                typeof item === 'string' ? sanitizeText(item) :
                    typeof item === 'object' ? sanitizeObject(item as Record<string, unknown>) : item
            );
        } else if (typeof value === 'object' && value !== null) {
            sanitized[key] = sanitizeObject(value as Record<string, unknown>);
        } else {
            sanitized[key] = value;
        }
    }

    return sanitized as T;
}

/**
 * Sanitize address data specifically
 */
export function sanitizeAddress(address: {
    name?: string;
    street_address?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
}): typeof address {
    return {
        name: address.name ? sanitizeText(address.name) : undefined,
        street_address: address.street_address ? sanitizeText(address.street_address) : undefined,
        city: address.city ? sanitizeText(address.city) : undefined,
        state: address.state ? sanitizeText(address.state) : undefined,
        postal_code: address.postal_code ? sanitizeText(address.postal_code).replace(/[^a-zA-Z0-9\s-]/g, '') : undefined,
        country: address.country ? sanitizeText(address.country) : undefined,
    };
}
