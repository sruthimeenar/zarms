import { PortfolioItem } from './types';
import { apiRequest, toServiceCode, toServiceLabel } from './apiClient';
import { normalizeMediaUrl } from './mediaUrl';

type PortfolioApiRow = {
  id: number;
  title: string;
  category: 'construction' | 'software';
  description: string;
  project_location?: string | null;
  featured: boolean;
  status: 'ongoing' | 'completed';
  technologies?: string[];
  images: string[];
  created_at: string;
  updated_at: string;
};

const mapPortfolioItem = (row: PortfolioApiRow | undefined | null): PortfolioItem | null => {
  if (!row || !row.id) return null;

  return {
    id: String(row.id),
    serviceType: toServiceLabel(row.category),
    projectName: row.title || 'Untitled Project',
    description: row.description || '',
    images: (row.images || []).map((img) => normalizeMediaUrl(img)).filter(Boolean),
    icon: row.category === 'construction' ? 'Building2' : 'Code2',
    subtitle: '',
    shortSummary: '',
    status: row.status === 'completed' ? 'Completed' : 'Ongoing',
    projectLocation: row.project_location || '',
    featured: !!row.featured,
    tags: row.technologies || [],
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
};

export async function getPortfolioItems(serviceType?: string, status?: string, featured?: boolean): Promise<PortfolioItem[]> {
  const params = new URLSearchParams();
  if (serviceType) params.set('category', toServiceCode(serviceType));
  if (status) params.set('status', status.toLowerCase());

  const query = params.toString();
  const data = await apiRequest<{ projects: PortfolioApiRow[] }>(`api/portfolio/list${query ? `&${query}` : ''}`);

  let items = (data.projects || [])
    .map(mapPortfolioItem)
    .filter((item): item is PortfolioItem => item !== null);

  if (featured !== undefined) {
    items = items.filter((item) => item.featured === featured);
  }

  return items;
}

export async function addPortfolioItem(item: Omit<PortfolioItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<PortfolioItem> {
  const payload = {
    title: item.projectName,
    category: toServiceCode(item.serviceType),
    description: item.description,
    projectUrl: null,
    completionDate: null,
    client: null,
    technologies: item.tags || [],
    projectLocation: item.projectLocation || null,
    featured: !!item.featured,
    images: item.images || [],
    status: item.status?.toLowerCase() || 'ongoing',
  };

  const data = await apiRequest<{ project: PortfolioApiRow }>('api/portfolio/create', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return mapPortfolioItem(data.project);
}

export async function updatePortfolioItem(id: string, updates: Partial<PortfolioItem>): Promise<PortfolioItem> {
  const payload: Record<string, unknown> = {};

  if (updates.projectName !== undefined) payload.title = updates.projectName;
  if (updates.serviceType !== undefined) payload.category = toServiceCode(updates.serviceType);
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.projectLocation !== undefined) payload.projectLocation = updates.projectLocation;
  if (updates.featured !== undefined) payload.featured = updates.featured;
  if (updates.tags !== undefined) payload.technologies = updates.tags;
  if (updates.images !== undefined) payload.images = updates.images;
  if (updates.status !== undefined) payload.status = updates.status.toLowerCase();

  const data = await apiRequest<{ project: PortfolioApiRow }>(`api/portfolio/update/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

  return mapPortfolioItem(data.project);
}

export async function deletePortfolioItem(id: string): Promise<void> {
  await apiRequest(`api/portfolio/delete/${id}`, { method: 'DELETE' });
}

export async function searchPortfolioItems(query: string): Promise<PortfolioItem[]> {
  if (!query.trim()) return getPortfolioItems();
  const data = await apiRequest<{ projects: PortfolioApiRow[] }>(`api/portfolio/list&search=${encodeURIComponent(query.trim())}`);
  return (data.projects || [])
    .map(mapPortfolioItem)
    .filter((item): item is PortfolioItem => item !== null);
}
