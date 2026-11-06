import { apiRequest } from './apiClient';

export interface EnquiryItem {
  id: string;
  name: string;
  phone: string;
  email: string;
  serviceType: 'construction' | 'software';
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'closed';
  createdAt: string;
}

type EnquiryApiRow = {
  id: number | string;
  name: string;
  phone: string;
  email: string;
  service: 'construction' | 'software';
  message: string;
  status: 'pending' | 'new' | 'read' | 'replied' | 'closed';
  created_at: string;
};

const toUiStatus = (status: EnquiryApiRow['status']): EnquiryItem['status'] =>
  status === 'pending' ? 'new' : status;

const toApiStatus = (status: EnquiryItem['status']): string =>
  status === 'new' ? 'pending' : status;

const splitSubjectMessage = (raw: string): { subject: string; message: string } => {
  const text = raw || '';
  const match = text.match(/^Subject:\s*(.+?)\n\n([\s\S]*)$/i);
  if (!match) {
    return { subject: 'General Enquiry', message: text };
  }
  return { subject: match[1].trim() || 'General Enquiry', message: match[2].trim() };
};

const mapEnquiry = (row: EnquiryApiRow): EnquiryItem => {
  const parsed = splitSubjectMessage(row.message);
  return {
    id: String(row.id),
    name: row.name,
    phone: row.phone,
    email: row.email,
    serviceType: row.service,
    subject: parsed.subject,
    message: parsed.message,
    status: toUiStatus(row.status),
    createdAt: row.created_at,
  };
};

export async function getEnquiries(): Promise<EnquiryItem[]> {
  const data = await apiRequest<{ enquiries: EnquiryApiRow[] }>('api/enquiries/list&limit=1000');
  return (data.enquiries || []).map(mapEnquiry);
}

export async function updateEnquiryStatus(id: string, status: EnquiryItem['status']): Promise<void> {
  await apiRequest(`api/enquiries/update/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status: toApiStatus(status) }),
  });
}

export async function deleteEnquiry(id: string): Promise<void> {
  await apiRequest(`api/enquiries/delete/${id}`, { method: 'DELETE' });
}

