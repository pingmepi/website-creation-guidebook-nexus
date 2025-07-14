# Custom T-Shirt Hub Documentation

*Last Updated: May 2024*

This directory contains comprehensive documentation for the Custom T-Shirt Hub project.

## Environment Setup

### Environment Variables

The project uses environment variables for configuration. To set up your local environment:

1. Copy the `.env.example` file to a new file named `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file and fill in the actual values for your environment:
   ```
   VITE_SUPABASE_URL=your_actual_supabase_url
   VITE_SUPABASE_ANON_KEY=your_actual_anon_key
   # ... other variables
   ```

3. The environment variables are loaded by Vite and made available to the client-side code through `import.meta.env.VITE_*`.

4. Only variables prefixed with `VITE_` will be exposed to your client-side code.

### Required Environment Variables

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key (public)

### Optional Environment Variables

- `VITE_USE_MOCK_IMAGE`: Set to "true" to use mock images instead of generating real ones
- `VITE_API_WEBHOOK_URL`: URL for the image generation webhook
- `VITE_AUTH_COOKIE_SECURE`: Set to "true" for production
- `VITE_AUTH_COOKIE_SAME_SITE`: Set to "lax" or "strict"
- `VITE_AUTH_COOKIE_DOMAIN`: Your domain name
- `VITE_ENABLE_RATE_LIMITING`: Set to "true" for production
- `VITE_CORS_ALLOWED_ORIGINS`: Comma-separated list of allowed origins

## Key Documentation Files

### Project Status & Planning

- [**Project Status**](./project_status.md) - Current state of the project, including implemented features, pending work, and known issues
- [**Feature Tracker**](./feature_tracker.md) - Detailed tracking of feature implementation status
- [**Product Requirements Document (PRD)**](./PRD.md) - Original product requirements and specifications

### Technical Documentation

- [**Tech Stack**](./tech_stack.md) - Overview of the technologies used in the project
- [**API Details**](./api_details.md) - Documentation of all APIs, including implementation status
- [**Security Checklist**](./security_checklist_updated.md) - Comprehensive security audit with implementation status

### Implementation Guides

- [**Test User Implementation Guide**](./test-user-implementation-guide.md) - Guide for implementing test user functionality

## Project Overview

The Custom T-Shirt Hub is a web application that allows users to design custom t-shirts through a guided, theme-based design flow. Users can select themes, answer questions to customize their design, and use a visual editor to make final adjustments before ordering.

## Current Status

The project has implemented core authentication and design functionality but requires security improvements and feature completion before it can be considered production-ready. See the [Project Status](./project_status.md) document for detailed information.

## Security Status

Several security issues have been identified and addressed, with remaining items to be completed:

**✅ Completed Security Improvements:**
1. Authentication tokens now stored in HttpOnly cookies (XSS protection)
2. Security headers implemented (CSP, XSS protection, CSRF protection)
3. Enhanced cookie configuration with secure settings

**🔄 Remaining Security Items:**
1. Unscoped API queries
2. Input sanitization for user content
3. Rate limiting on sensitive endpoints

See the [Security Checklist](./security_checklist_updated.md) for a detailed breakdown of security concerns and recommendations.

## Next Steps

The immediate focus should be on addressing the critical security issues identified in the security checklist, followed by completing the user dashboard and checkout flow. See the [Project Status](./project_status.md) document for detailed next steps.
