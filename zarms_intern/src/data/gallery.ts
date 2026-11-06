import { GalleryItem } from './types';
import { apiRequest, toServiceCode, toServiceLabel } from './apiClient';
import { normalizeMediaUrl } from './mediaUrl';

type GalleryApiRow = {
  id: number;
  image_url: string;
  service: 'construction' | 'software';
  title: string;
  description?: string | null;
  featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
};

const mapGalleryItem = (row: GalleryApiRow | undefined | null): GalleryItem | null => {
  if (!row || !row.id) return null;

  return {
    id: String(row.id),
    serviceType: toServiceLabel(row.service),
    image: normalizeMediaUrl(row.image_url),
    title: row.title || '',
    subtitle: row.description || '',
    sortOrder: row.display_order || 0,
    featured: !!row.featured,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
};

export async function getGalleryItems(serviceType?: string, featured?: boolean): Promise<GalleryItem[]> {
  const params = new URLSearchParams();
  if (serviceType) params.set('service', toServiceCode(serviceType));
  if (featured !== undefined) params.set('featured', String(featured));

  const query = params.toString();
  const data = await apiRequest<{ images: GalleryApiRow[] }>(`api/gallery/list${query ? `&${query}` : ''}`);

  return (data.images || [])
    .map(mapGalleryItem)
    .filter((item): item is GalleryItem => item !== null);
}

export async function addGalleryItem(item: Omit<GalleryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<GalleryItem> {
  const data = await apiRequest<{ image: GalleryApiRow }>('api/gallery/create', {
    method: 'POST',
    body: JSON.stringify({
      imageUrl: item.image,
      service: toServiceCode(item.serviceType),
      title: item.title,
      description: item.subtitle || null,
      featured: !!item.featured,
      displayOrder: item.sortOrder || 1,
    }),
  });

  return mapGalleryItem(data.image);
}

export async function updateGalleryItem(id: string, updates: Partial<GalleryItem>): Promise<GalleryItem> {
  const payload: Record<string, unknown> = {};

  if (updates.image !== undefined) payload.imageUrl = updates.image;
  if (updates.serviceType !== undefined) payload.service = toServiceCode(updates.serviceType);
  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.subtitle !== undefined) payload.description = updates.subtitle;
  if (updates.featured !== undefined) payload.featured = updates.featured;
  if (updates.sortOrder !== undefined) payload.displayOrder = updates.sortOrder;

  const data = await apiRequest<{ image: GalleryApiRow }>(`api/gallery/update/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

  return mapGalleryItem(data.image);
}

export async function deleteGalleryItem(id: string): Promise<void> {
  await apiRequest(`api/gallery/delete/${id}`, { method: 'DELETE' });
}

export async function searchGalleryItems(query: string): Promise<GalleryItem[]> {
  const items = await getGalleryItems();
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter((item) =>
    item.title.toLowerCase().includes(q) || (item.subtitle || '').toLowerCase().includes(q)
  );
}
