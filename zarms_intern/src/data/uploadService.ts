import { apiRequest } from './apiClient';

const API_BASE = (import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000/backend/index.php?request=').replace(/\/$/, '');

function buildUploadUrl(action: string) {
  // The backend expects: /backend/index.php?request=api/upload/{action}
  const url = `${API_BASE}api/upload/${action}`;
  console.log('Upload URL:', url);
  return url;
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

export interface UploadResult {
  success: boolean;
  url?: string;
  thumbnailUrl?: string;
  filename?: string;
  message?: string;
  error?: string;
}

/**
 * Upload a single image to the server
 * @param file The file to upload
 * @param type The type of upload (gallery, portfolio, profile, general)
 * @param createThumbnail Whether to create a thumbnail
 * @returns Upload result with URL
 */
export async function uploadImage(
  file: File,
  type: 'gallery' | 'portfolio' | 'profile' | 'general' = 'general',
  createThumbnail = false
): Promise<UploadResult> {
  try {
    console.log('Uploading single image:', file.name, 'type:', type);

    // Create FormData for multipart upload
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', type);
    if (createThumbnail) {
      formData.append('thumbnail', 'true');
    }

    const token = getAuthToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = buildUploadUrl('image');
    console.log('POST', url);

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      headers,
    });

    console.log('Response status:', response.status);

    const responseText = await response.text();
    console.log('Response text:', responseText);

    if (!response.ok) {
      let errorMessage = 'Upload failed';
      try {
        const error = JSON.parse(responseText);
        errorMessage = error.message || errorMessage;
      } catch {
        errorMessage = responseText || errorMessage;
      }
      return {
        success: false,
        error: errorMessage,
      };
    }

    const data = JSON.parse(responseText);
    return {
      success: true,
      url: data.data.url,
      thumbnailUrl: data.data.thumbnailUrl,
      filename: data.data.filename,
      message: data.data.message,
    };
  } catch (error: any) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error.message || 'Upload failed',
    };
  }
}

/**
 * Upload multiple images to the server
 * @param files The files to upload
 * @param type The type of upload (gallery, portfolio, profile, general)
 * @param maxFiles Maximum number of files allowed
 * @returns Array of upload results
 */
export async function uploadImages(
  files: File[],
  type: 'gallery' | 'portfolio' | 'profile' | 'general' = 'general',
  maxFiles = 10
): Promise<UploadResult[]> {
  try {
    console.log('Uploading', files.length, 'images as', type);

    // Create FormData for multipart upload
    const formData = new FormData();
    files.forEach((file) => {
      // Use [] so PHP always treats this as a multi-file field
      formData.append('images[]', file);
    });
    formData.append('type', type);
    formData.append('maxFiles', String(maxFiles));

    const token = getAuthToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = buildUploadUrl('images');
    console.log('POST', url);
    console.log('Token:', token ? `${token.substring(0, 20)}...` : 'No token');
    console.log('Headers:', headers);
    console.log('FormData entries:');
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}:`, value.name, value.type, value.size);
      } else {
        console.log(`  ${key}:`, value);
      }
    }

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      headers,
    });

    console.log('Response status:', response.status, response.statusText);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('Response text length:', responseText.length);
    console.log('Response text (first 1000 chars):', responseText.substring(0, 1000));

    if (!response.ok) {
      let errorMessage = 'Upload failed';
      // Check if response is HTML (error page)
      if (responseText.trim().startsWith('<')) {
        errorMessage = 'Server returned an error page. Check backend logs.';
        // Try to extract error message from HTML
        const match = responseText.match(/<title>(.*?)<\/title>/i);
        if (match) {
          errorMessage += ` (${match[1]})`;
        }
      } else {
        try {
          const error = JSON.parse(responseText);
          errorMessage = error.message || errorMessage;
        } catch {
          errorMessage = responseText || errorMessage;
        }
      }
      throw new Error(errorMessage);
    }

    // Check if response is HTML
    if (responseText.trim().startsWith('<')) {
      throw new Error('Server returned HTML instead of JSON. Check backend error logs.');
    }

    const data = JSON.parse(responseText);
    return data.data.files.map((file: any) => ({
      success: true,
      url: file.url,
      filename: file.filename,
    }));
  } catch (error: any) {
    console.error('Upload error:', error);
    return files.map(() => ({
      success: false,
      error: error.message || 'Upload failed',
    }));
  }
}

/**
 * Delete an image by URL
 * @param url The URL of the image to delete
 * @returns Success status
 */
export async function deleteImage(url: string): Promise<boolean> {
  try {
    await apiRequest('api/upload/delete', {
      method: 'DELETE',
      body: JSON.stringify({ url }),
    });
    return true;
  } catch {
    return false;
  }
}
