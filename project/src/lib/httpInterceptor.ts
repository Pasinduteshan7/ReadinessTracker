/**
 * Global HTTP Interceptor for Employability Readiness Tracker
 * Intercepts all browser fetch requests to detect HTTP 401 (Unauthorized).
 * Automatically logs out the user, stores an expiration notice,
 * and redirects to the login screen.
 */

let isHandling401 = false;

export function setupHttpInterceptor(): void {
  if (typeof window === 'undefined' || !window.fetch) {
    return;
  }

  const originalFetch = window.fetch.bind(window);

  window.fetch = async (...args: Parameters<typeof fetch>): Promise<Response> => {
    let response: Response;
    try {
      response = await originalFetch(...args);
    } catch (networkError) {
      throw networkError;
    }

    if (response.status === 401) {
      const url = typeof args[0] === 'string'
        ? args[0]
        : (args[0] && 'url' in args[0])
          ? (args[0] as Request).url
          : '';

      // Do NOT trigger session expired on the login / register endpoints themselves
      const isAuthEndpoint =
        url.includes('/students/login') ||
        url.includes('/advisors/login') ||
        url.includes('/admin/login') ||
        url.includes('/students/register') ||
        url.includes('/advisors/register') ||
        url.includes('/admin/register');

      if (!isAuthEndpoint && !isHandling401) {
        isHandling401 = true;

        console.warn(`[Auth Interceptor] HTTP 401 detected on ${url}. Session expired, logging out...`);

        // Set session notice to show on the login page
        try {
          sessionStorage.setItem('auth_session_expired', 'Your session has expired. Please sign in again.');
        } catch {
          // Ignore storage quota/security errors
        }

        // Clear stored auth tokens and user data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        sessionStorage.removeItem('github_token');

        // Notify active components via window event
        window.dispatchEvent(new CustomEvent('auth:session_expired'));

        // Redirect to login smoothly
        setTimeout(() => {
          window.location.href = '/?session=expired';
        }, 100);
      }
    }

    return response;
  };
}
