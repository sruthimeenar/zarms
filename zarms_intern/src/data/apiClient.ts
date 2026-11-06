import { errorHandler, handleApiError } from './errorHandler';

const API_BASE = (import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000/backend/index.php?request=').replace(/\/$/, '');

function buildUrl(path: string) {
  const normalizedPath = path.replace(/^\//, '');
  if (API_BASE.includes('request=')) {
    return `${API_BASE}${normalizedPath}`;
  }
  return `${API_BASE}/${normalizedPath}`;
}

function getAuthToken(): string | null {
  const stored = sessionStorage.getItem('zarms_current_session');
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored);
    return parsed?.token || null;
  } catch {
    return null;
  }
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const requestUrl = buildUrl(path);

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;

  try {
    response = await fetch(requestUrl, {
      ...options,
      headers,
    });
  } catch (error) {
    // Handle network errors (backend not running, CORS, etc.)
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'unknown-origin';
      const debugMessage =
        import.meta.env.VITE_APP_ENV === 'development'
          ? `Unable to connect to backend. URL: ${requestUrl} | Origin: ${origin}`
          : 'Unable to connect to backend. Please ensure the backend server is running.';
      throw handleApiError(debugMessage, { path, status: 0 });
    }
    throw handleApiError(`Network error: ${error}`, { path, status: 0 });
  }

  // Parse JSON response first
  let data: any;
  let responseText = '';

  try {
    responseText = await response.text();
    if (!responseText) {
      data = {};
    } else {
      data = JSON.parse(responseText);
    }
  } catch (error) {
    // If JSON parsing fails, check if it's HTML (PHP error)
    if (responseText.includes('<') && responseText.includes('>')) {
      throw handleApiError('Server error - check backend logs for PHP errors', { path, status: response.status });
    }
    throw handleApiError('Invalid response from server', { path, status: response.status });
  }

  // Handle HTTP errors (401, 403, 404, 500, etc.)
  if (!response.ok) {
    const errorMessage = data?.message || data?.error || `Request failed: ${response.status}`;
    throw handleApiError(errorMessage, { path, status: response.status });
  }

  // Check for API-level errors (success: false)
  if (data.success === false) {
    throw handleApiError(data?.message || 'Request failed', { path, status: response.status });
  }

  // Return data.data if it exists, otherwise return data directly
  const result = data.data ?? data;

  // Log the result for debugging (only in development)
  if (import.meta.env.VITE_APP_ENV === 'development') {
    console.log('✅ API Response:', { path, result, status: response.status });
  }

  return result as T;
}

export function toServiceLabel(service: string): 'Construction Services' | 'Software Solutions' {
  return service === 'software' ? 'Software Solutions' : 'Construction Services';
}

export function toServiceCode(service: string): 'construction' | 'software' {
  return service === 'Software Solutions' ? 'software' : 'construction';
}
