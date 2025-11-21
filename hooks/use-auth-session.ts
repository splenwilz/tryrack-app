import { useEffect, useState } from 'react';
import { getAccessToken, getStoredUser } from '@/api/client';
import type { AuthUser } from '@/api/auth/types';

/**
 * Hook to check if user has an active session
 * Checks for both access token and stored user data
 * 
 * @returns Object with session status and user data
 * @see https://github.com/expo/expo/blob/main/docs/pages/router/advanced/authentication.mdx
 */
export function useAuthSession() {
    const [session, setSession] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        async function checkSession() {
            try {
                // Check for both access token and user data
                const [accessToken, user] = await Promise.all([
                    getAccessToken(),
                    getStoredUser(),
                ]);

                // User is authenticated if they have both token and user data
                if (isMounted) {
                    setSession(accessToken && user ? user : null);
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('[Auth] Failed to check session:', error);
                if (isMounted) {
                    setSession(null);
                    setIsLoading(false);
                }
            }
        }

        checkSession();

        return () => {
            isMounted = false;
        };
    }, []);

    return {
        session,
        isAuthenticated: !!session,
        isLoading,
    };
}

