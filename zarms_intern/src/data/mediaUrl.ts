const API_BASE = (import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000/backend/index.php?request=').replace(/\/$/, '');

function getBackendBaseUrl(): string {
  if (API_BASE.includes('index.php?request=')) {
    return API_BASE.split('index.php?request=')[0].replace(/\/$/, '');
  }
  return API_BASE.replace(/\/$/, '');
}

function getSiteBaseUrl(): string {
  const backendBase = getBackendBaseUrl();
  return backendBase.replace(/\/backend$/i, '');
}

export function normalizeMediaUrl(url?: string | null): string {
  if (!url) return '';
  let value = String(url).trim();
  if (!value) return '';

  value = value.replace(/\\/g, '/');

  // Migrate legacy URLs from /backend/uploads/... to /public/uploads/...
  value = value.replace(/\/backend\/uploads\//i, '/public/uploads/');

  // Fix malformed URLs like:
  // http://localhost/ZarmsTec/backend/C:/.../backend/config/../uploads/gallery/x.png
  const uploadsMatch = value.match(/(?:public\/)?uploads\/.+$/i);
  if (uploadsMatch) {
    let suffix = uploadsMatch[0].replace(/^\/+/, '');
    if (!/^public\/uploads\//i.test(suffix)) {
      suffix = `public/${suffix}`;
    }
    return `${getSiteBaseUrl()}/${suffix}`;
  }

  // Absolute paths accidentally stored in DB.
  if (/^[A-Za-z]:\//.test(value)) {
    const idx = value.toLowerCase().indexOf('/uploads/');
    if (idx >= 0) {
      return `${getSiteBaseUrl()}/public/${value.slice(idx + 1)}`;
    }
    return `${getSiteBaseUrl()}/${value.split('/').pop()}`;
  }

  // Relative uploads path.
  if (value.startsWith('uploads/')) {
    return `${getSiteBaseUrl()}/public/${value}`;
  }

  if (value.startsWith('public/uploads/')) {
    return `${getSiteBaseUrl()}/${value}`;
  }

  // Root-relative path.
  if (value.startsWith('/')) {
    return `${window.location.origin}${value}`;
  }

  return value;
}
