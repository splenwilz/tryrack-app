
/**
 * Environment Configuration
 * Centralized configuration for API endpoints and external services
 * 
 * Based on Expo environment variable best practices:
 * https://docs.expo.dev/guides/environment-variables/
 */

// OAuth Configuration
export const OAUTH_CONFIG = {
    // Redirect URI scheme for mobile app (matches app.json scheme, without ://)
    REDIRECT_SCHEME: process.env.EXPO_PUBLIC_OAUTH_REDIRECT_SCHEME || 'tryrackapp',
    REDIRECT_PATH: process.env.EXPO_PUBLIC_OAUTH_REDIRECT_PATH || 'auth/callback',

    // Response type for OAuth flow
    RESPONSE_TYPE: 'code',
} as const;