# Authentication Token Security Enhancement Task

## Background
Our T-shirt design application currently stores authentication tokens in localStorage, which presents a critical security vulnerability to XSS attacks. We need to migrate to using HttpOnly cookies for token storage as recommended in our security checklist.

## Current Implementation
- Authentication tokens from Supabase are currently stored in localStorage
- The authentication flow is implemented in `src/components/auth/LoginDialog.tsx` and related auth components
- Environment variables for cookie configuration already exist in `.env.example`:
  - `VITE_AUTH_COOKIE_SECURE`
  - `VITE_AUTH_COOKIE_SAME_SITE`
  - `VITE_AUTH_COOKIE_DOMAIN`

## Task Requirements

### 1. Create a Cookie-Based Auth Service
- Implement a service that handles authentication tokens via HttpOnly cookies instead of localStorage
- Ensure the service handles:
  - Token storage during login/signup
  - Token retrieval for authenticated requests
  - Token removal during logout
  - Token refresh when expired

### 2. Update Supabase Client Configuration
- Modify the Supabase client initialization to use cookie-based storage
- Implement the necessary configuration to make Supabase work with HttpOnly cookies
- Use the environment variables already defined in `.env.example`

### 3. Update Authentication Components
- Modify login, signup, and logout functionality to use the new cookie-based approach
- Ensure all authentication state management is updated accordingly
- Update any components that check for authentication status

### 4. Implement Server-Side Endpoints
- Create any necessary server-side endpoints (Supabase Edge Functions) to handle cookie management
- Implement proper CSRF protection for these endpoints
- Ensure secure cookie settings (HttpOnly, SameSite, Secure flags)

### 5. Testing Requirements
- Test the complete authentication flow:
  - Login
  - Signup
  - Logout
  - Session persistence
  - Token refresh
- Verify that tokens are no longer accessible via JavaScript in the browser

## Technical Guidelines

### Cookie Implementation
- Use HttpOnly cookies to prevent JavaScript access
- Set Secure flag to ensure cookies are only sent over HTTPS
- Configure SameSite attribute appropriately (Lax or Strict recommended)
- Set appropriate expiration/max-age for the cookies

### CSRF Protection
- Implement CSRF tokens for authentication endpoints
- Validate CSRF tokens on the server side

### Error Handling
- Implement proper error handling for authentication failures
- Provide clear user feedback without exposing sensitive information

## Resources
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers)
- [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)

## Deliverables
1. Updated authentication service with cookie-based token storage
2. Modified Supabase client configuration
3. Updated authentication components
4. Any necessary server-side endpoints
5. Documentation of changes and testing results

## Success Criteria
- Authentication tokens are stored in HttpOnly cookies, not localStorage
- Complete authentication flow works as expected
- Tokens cannot be accessed via JavaScript in the browser
- CSRF protection is implemented for authentication endpoints
- All environment variables are properly utilized