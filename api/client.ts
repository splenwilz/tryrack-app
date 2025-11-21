import * as SecureStore from 'expo-secure-store'
import type { AuthUser } from './auth/types'

const ACCESS_TOKEN_KEY = 'auth_access_token'
const REFRESH_TOKEN_KEY = 'auth_refresh_token'
const USER_STORAGE_KEY = 'auth_user'

/**
 * Custom error class for API errors with status code and parsed error message
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public originalError?: unknown,
    public isSessionExpired: boolean = false
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Pydantic validation error structure
 */
interface ValidationError {
  type?: string;
  loc?: (string | number)[];
  msg?: string;
  input?: unknown;
}

/**
 * Parse Pydantic/FastAPI validation error array
 * Converts validation errors to user-friendly messages
 */
function parseValidationErrors(errorArray: unknown[]): string {
  if (!Array.isArray(errorArray) || errorArray.length === 0) {
    return 'Validation error occurred';
  }

  const messages = errorArray.map((error: unknown) => {
    if (typeof error === 'object' && error !== null) {
      const validationError = error as ValidationError;
      const field = validationError.loc?.[validationError.loc.length - 1] || 'field';
      const message = validationError.msg || 'Invalid value';

      // Create user-friendly field names
      const fieldName = String(field)
        .replace(/_/g, ' ')
        .replace(/([A-Z])/g, ' $1')
        .trim()
        .split(' ')
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      return `${fieldName}: ${message}`;
    }
    return String(error);
  });

  return messages.join('. ');
}

/**
 * Parse error response from API
 * Extracts error message from JSON response (detail or message field)
 * Handles Pydantic validation errors (array format)
 * Ensures a string is always returned, even if the error field is an object
 */
async function parseErrorResponse(response: Response): Promise<string> {
  try {
    const errorText = await response.text();
    // Try to parse as JSON
    const errorJson = JSON.parse(errorText);

    // Extract detail or message field (common API error formats)
    const errorValue = errorJson.detail || errorJson.message || errorText;

    // Handle Pydantic validation errors (array format)
    if (Array.isArray(errorValue)) {
      return parseValidationErrors(errorValue);
    }

    // Ensure we always return a string
    if (typeof errorValue === 'string') {
      return errorValue;
    }

    // If it's an object, try to extract a meaningful message or stringify it
    if (typeof errorValue === 'object' && errorValue !== null) {
      // Try common nested error message fields
      if (errorValue.message && typeof errorValue.message === 'string') {
        return errorValue.message;
      }
      if (errorValue.error && typeof errorValue.error === 'string') {
        return errorValue.error;
      }
      // Fallback: stringify the object
      return JSON.stringify(errorValue);
    }

    // Fallback to error text
    return errorText || response.statusText || "An error occurred";
  } catch {
    // If parsing fails, use status text
    return response.statusText || "An error occurred";
  }
}

export function getApiBaseUrl(): string {
  const url = process.env.EXPO_PUBLIC_API_BASE_URL
  if (url) return url
  throw new Error("API base URL is not configured. Set EXPO_PUBLIC_API_BASE_URL.")
}

/**
 * Get access token from secure storage
 * @see https://docs.expo.dev/versions/latest/sdk/securestore/
 */
export async function getAccessToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY)
  } catch (error) {
    console.error('[API] Failed to get access token:', error)
    return null
  }
}

/**
 * Get refresh token from secure storage
 */
async function getRefreshToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY)
  } catch (error) {
    console.error('[API] Failed to get refresh token:', error)
    return null
  }
}

/**
 * Save tokens to secure storage
 */
export async function saveTokens(accessToken: string, refreshToken?: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken)
    if (refreshToken) {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken)
    }
  } catch (error) {
    console.error('[API] Failed to save tokens:', error)
    throw error
  }
}

/**
 * Persist the authenticated user profile
 */
export async function saveUser(user: AuthUser): Promise<void> {
  try {
    await SecureStore.setItemAsync(USER_STORAGE_KEY, JSON.stringify(user))
  } catch (error) {
    console.error('[API] Failed to save user:', error)
    throw error
  }
}

/**
 * Retrieve the cached user profile
 */
export async function getStoredUser(): Promise<AuthUser | null> {
  try {
    const stored = await SecureStore.getItemAsync(USER_STORAGE_KEY)
    return stored ? (JSON.parse(stored) as AuthUser) : null
  } catch (error) {
    console.error('[API] Failed to read stored user:', error)
    return null
  }
}

/**
 * Clear tokens from secure storage (on logout)
 */
export async function clearTokens(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY)
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY)
    await SecureStore.deleteItemAsync(USER_STORAGE_KEY)
  } catch (error) {
    console.error('[API] Failed to clear tokens:', error)
  }
}

// Global refresh lock to prevent parallel token refreshes
// If multiple requests hit 401 simultaneously, they'll share the same refresh
let refreshPromise: Promise<boolean> | null = null

/**
 * Refresh access token using refresh token
 * Calls your backend refresh endpoint and updates stored tokens
 * Matches the Next.js pattern: POST to /api/auth/refresh with refresh_token
 * 
 * Uses a global lock to prevent parallel refreshes when multiple requests hit 401 simultaneously
 */
async function triggerRefresh(): Promise<boolean> {
  // If a refresh is already in progress, wait for it instead of starting a new one
  if (refreshPromise) {
    console.log('[API] [REFRESH] Refresh already in progress, waiting for existing refresh...')
    return refreshPromise
  }

  // Start new refresh and store the promise
  refreshPromise = (async (): Promise<boolean> => {
    const refreshStartTime = Date.now()
    console.log('[API] [REFRESH] Starting token refresh...')

    try {
      const refreshToken = await getRefreshToken()
      if (!refreshToken) {
        console.log('[API] [REFRESH] No refresh token available')
        // Clear tokens if no refresh token (session expired)
        await clearTokens()
        return false
      }

      const apiBaseUrl = getApiBaseUrl()
      // Backend refresh token endpoint
      const refreshEndpoint = `${apiBaseUrl}/api/v1/auth/refresh-token`

      console.log('[API] [REFRESH] Calling refresh endpoint:', refreshEndpoint)

      const fetchStartTime = Date.now()
      const response = await fetch(refreshEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      })
      const fetchDuration = Date.now() - fetchStartTime

      console.log('[API] [REFRESH] Response:', {
        status: response.status,
        statusText: response.statusText,
        duration: `${fetchDuration}ms`,
      })

      if (!response.ok) {
        // If 401 or 403, refresh token is invalid - clear auth
        if (response.status === 401 || response.status === 403) {
          console.log('[API] [REFRESH] Refresh token invalid (401/403)')
          await clearTokens()
          return false
        }
        console.log(`[API] [REFRESH] Refresh failed: ${response.status}`)
        await clearTokens()
        return false
      }

      const data = await response.json()
      const totalDuration = Date.now() - refreshStartTime

      // Backend returns: { access_token: string, refresh_token: string }
      if (data.access_token) {
        await saveTokens(data.access_token, data.refresh_token)
        console.log('[API] [REFRESH] Token refreshed successfully:', {
          totalDuration: `${totalDuration}ms`,
          hasNewRefreshToken: !!data.refresh_token,
        })
        return true
      }

      console.error('[API] [REFRESH] Refresh response missing access_token:', data)
      await clearTokens()
      return false
    } catch (e) {
      const totalDuration = Date.now() - refreshStartTime
      console.error('[API] [REFRESH] Token refresh failed:', {
        error: e instanceof Error ? e.message : String(e),
        duration: `${totalDuration}ms`,
      })
      // Clear tokens on any error (matches Next.js pattern)
      await clearTokens()
      return false
    } finally {
      // Clear the refresh promise so future requests can refresh again
      refreshPromise = null
    }
  })()

  return refreshPromise
}

/**
 * API client with improved error handling
 * Parses error responses and throws user-friendly error messages
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
 */
export async function apiClient<T>(url: string, options?: RequestInit): Promise<T> {
  const apiBaseUrl = getApiBaseUrl()
  const totalStartTime = Date.now()

  async function makeRequest(isRetry: boolean = false): Promise<Response> {
    const requestId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    const attemptLabel = isRetry ? '[RETRY]' : '[INITIAL]'

    // Get access token from secure storage
    const accessToken = await getAccessToken()

    const isFormDataBody =
      typeof FormData !== 'undefined' && options?.body instanceof FormData

    const headers: Record<string, string> = {
      ...(options?.headers as Record<string, string> ?? {}),
    }

    const hasContentTypeHeader = Object.keys(headers).some(
      (key) => key.toLowerCase() === 'content-type',
    )

    if (!isFormDataBody && !hasContentTypeHeader) {
      headers['Content-Type'] = 'application/json'
    }

    // Add Authorization header if token exists
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`
    }

    const targetUrl = url.startsWith('http') ? url : `${apiBaseUrl}${url}`

    const fetchOptions: RequestInit = {
      ...options,
      headers,
    }

    // Log request details
    console.log(`[API] ${attemptLabel} Request [${requestId}]:`, {
      method: options?.method || 'GET',
      url: targetUrl,
      hasAuth: !!accessToken,
      authTokenPreview: accessToken ? `${accessToken.substring(0, 20)}...` : 'none',
      isFormData: isFormDataBody,
      contentType: headers['Content-Type'],
      bodySize: options?.body ? (typeof options.body === 'string' ? options.body.length : 'FormData') : 'none',
    })

    const fetchStartTime = Date.now()

    try {
      const response = await fetch(targetUrl, fetchOptions)
      const fetchDuration = Date.now() - fetchStartTime

      // Log response details
      console.log(`[API] ${attemptLabel} Response [${requestId}]:`, {
        status: response.status,
        statusText: response.statusText,
        duration: `${fetchDuration}ms`,
        contentType: response.headers.get('content-type'),
        hasAuthError: response.status === 401,
      })

      return response
    } catch (fetchError) {
      const fetchDuration = Date.now() - fetchStartTime

      // Handle network errors (connection refused, DNS errors, etc.)
      console.error(`[API] ${attemptLabel} Network Error [${requestId}]:`, {
        url: targetUrl,
        error: fetchError instanceof Error ? fetchError.message : String(fetchError),
        duration: `${fetchDuration}ms`,
        apiBaseUrl,
      })

      throw new ApiError(
        0,
        fetchError instanceof Error
          ? `Network error: ${fetchError.message}`
          : 'Network error: Failed to connect to server',
        fetchError
      )
    }
  }

  let res = await makeRequest()

  if (res.status === 401) {
    console.log('[API] 401 Unauthorized - Attempting token refresh...')
    const refreshStartTime = Date.now()

    // Detect token expiration by attempting refresh
    // If refresh succeeds → access token was expired (now refreshed)
    // If refresh fails → session expired (refresh token invalid/expired)
    const refreshed = await triggerRefresh()
    const refreshDuration = Date.now() - refreshStartTime

    if (refreshed) {
      console.log(`[API] Token refresh succeeded (${refreshDuration}ms) - Retrying original request...`)

      // Refresh succeeded - access token was expired, now we have a new one
      // Retry the original request with new token
      res = await makeRequest(true)

      // If still 401 after refresh, the original request had invalid credentials
      // (not a token expiry issue - e.g., wrong user/permissions)
      if (res.status === 401) {
        const msg = await parseErrorResponse(res)
        console.log('[API] Still 401 after refresh - Invalid credentials, not token expiry')
        throw new ApiError(401, msg, undefined, false) // Not session expired, invalid request
      }
      // Success - token refresh worked and request succeeded!
      console.log('[API] Request succeeded after token refresh')
    } else {
      // Refresh failed - session is truly expired (refresh token invalid/expired)
      console.log(`[API] Token refresh failed (${refreshDuration}ms) - Session expired`)
      const msg = await parseErrorResponse(res)
      throw new ApiError(401, msg || 'Session expired. Please sign in again.', undefined, true)
    }
  }

  if (!res.ok) {
    const errorMessage = await parseErrorResponse(res);
    const totalDuration = Date.now() - totalStartTime

    // Log server errors for debugging
    if (res.status >= 500) {
      console.error('[API] Server Error:', {
        status: res.status,
        statusText: res.statusText,
        url,
        message: errorMessage,
        totalDuration: `${totalDuration}ms`,
      })
    } else {
      console.log('[API] Client Error:', {
        status: res.status,
        statusText: res.statusText,
        url,
        message: errorMessage,
        totalDuration: `${totalDuration}ms`,
      })
    }

    throw new ApiError(res.status, errorMessage);
  }

  const responseContentType = res.headers.get('content-type') ?? ''
  const totalDuration = Date.now() - totalStartTime

  let result: T

  if (responseContentType.includes('application/json')) {
    result = await res.json()
    console.log('[API] Request Success:', {
      url,
      status: res.status,
      totalDuration: `${totalDuration}ms`,
      responseType: 'JSON',
    })
    return result
  }

  if (res.status === 204 || responseContentType.length === 0) {
    // No content to return (e.g., 204 No Content)
    console.log('[API] Request Success:', {
      url,
      status: res.status,
      totalDuration: `${totalDuration}ms`,
      responseType: 'No Content',
    })
    return undefined as T
  }

  // Fallback: return plain text for non-JSON responses
  const responseText = await res.text()
  console.log('[API] Request Success:', {
    url,
    status: res.status,
    totalDuration: `${totalDuration}ms`,
    responseType: 'Text',
    textLength: responseText.length,
  })
  return responseText as unknown as T
}