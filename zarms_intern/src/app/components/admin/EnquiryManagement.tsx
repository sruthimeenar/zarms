import { useState, useEffect } from 'react';
import { Plus, Search, MoreVertical, Trash2, Eye, Mail, Phone, Calendar, User as UserIcon, Briefcase, FileText } from 'lucide-react';
import { Modal } from './Modal';
import { Pagination } from './Pagination';
import { deleteEnquiry, EnquiryItem, getEnquiries, updateEnquiryStatus } from '../../../data/enquiries';

type Enquiry = EnquiryItem;

export function EnquiryManagement() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterService, setFilterService] = useState<string>('all');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [viewModal, setViewModal] = useState<Enquiry | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    loadEnquiries();
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus, filterService]);

  const loadEnquiries = async () => {
    try {
      const rows = await getEnquiries();
      setEnquiries(rows);
    } catch (error) {
      console.error('Failed to load enquiries:', error);
      setEnquiries([]);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteEnquiry(id);
    await loadEnquiries();
    setDeleteConfirm(null);
    setActiveDropdown(null);
  };

  const handleStatusChange = async (id: string, status: Enquiry['status']) => {
    await updateEnquiryStatus(id, status);
    setEnquiries((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
    setViewModal((prev) => (prev && prev.id === id ? { ...prev, status } : prev));
  };

  const handleView = async (enquiry: Enquiry) => {
    setViewModal(enquiry);
    if (enquiry.status === 'new') {
      await handleStatusChange(enquiry.id, 'read');
    }
  };

  const allFilteredEnquiries = enquiries.filter(enquiry => {
    const matchesSearch =
      enquiry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enquiry.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enquiry.subject.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'all' || enquiry.status === filterStatus;
    const matchesService = filterService === 'all' || enquiry.serviceType === filterService;

    return matchesSearch && matchesStatus && matchesService;
  });

  // Pagination
  const totalPages = Math.ceil(allFilteredEnquiries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const filteredEnquiries = allFilteredEnquiries.slice(startIndex, endIndex);

  const stats = {
    total: enquiries.length,
    new: enquiries.filter(e => e.status === 'new').length,
    read: enquiries.filter(e => e.status === 'read').length,
    replied: enquiries.filter(e => e.status === 'replied').length,
    closed: enquiries.filter(e => e.status === 'closed').length,
  };

  const getStatusColor = (status: Enquiry['status']) => {
    switch (status) {
      case 'new': return '#ef4444';
      case 'read': return '#d97706';
      case 'replied': return '#10b981';
      case 'closed': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status: Enquiry['status']) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#111827' }}>Enquiry Management</h1>
          <p className="text-sm mt-1" style={{ color: '#6b7280' }}>Manage customer enquiries from contact form</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-4 rounded-xl" style={{ background: '#ffffff', border: '1px solid #e5e7eb' }}>
          <div className="text-2xl font-bold mb-1" style={{ color: '#111827' }}>{stats.total}</div>
          <div className="text-sm" style={{ color: '#6b7280' }}>Total Enquiries</div>
        </div>
        <div className="p-4 rounded-xl" style={{ background: '#ffffff', border: '1px solid #e5e7eb' }}>
          <div className="text-2xl font-bold mb-1" style={{ color: '#ef4444' }}>{stats.new}</div>
          <div className="text-sm" style={{ color: '#6b7280' }}>New</div>
        </div>
        <div className="p-4 rounded-xl" style={{ background: '#ffffff', border: '1px solid #e5e7eb' }}>
          <div className="text-2xl font-bold mb-1" style={{ color: '#d97706' }}>{stats.read}</div>
          <div className="text-sm" style={{ color: '#6b7280' }}>Read</div>
        </div>
        <div className="p-4 rounded-xl" style={{ background: '#ffffff', border: '1px solid #e5e7eb' }}>
          <div className="text-2xl font-bold mb-1" style={{ color: '#10b981' }}>{stats.replied}</div>
          <div className="text-sm" style={{ color: '#6b7280' }}>Replied</div>
        </div>
        <div className="p-4 rounded-xl" style={{ background: '#ffffff', border: '1px solid #e5e7eb' }}>
          <div className="text-2xl font-bold mb-1" style={{ color: '#6b7280' }}>{stats.closed}</div>
          <div className="text-sm" style={{ color: '#6b7280' }}>Closed</div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-5 rounded-xl" style={{ background: '#ffffff', border: '1px solid #e5e7eb' }}>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="Search by name, email, or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border"
              style={{ borderColor: '#d1d5db', color: '#111827' }}
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 rounded-lg border"
            style={{ borderColor: '#d1d5db', color: '#111827' }}
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
            <option value="closed">Closed</option>
          </select>

          <select
            value={filterService}
            onChange={(e) => setFilterService(e.target.value)}
            className="px-4 py-2.5 rounded-lg border"
            style={{ borderColor: '#d1d5db', color: '#111827' }}
          >
            <option value="all">All Services</option>
            <option value="construction">Construction</option>
            <option value="software">Software</option>
          </select>
        </div>
      </div>

      {/* Enquiries List */}
      <div className="space-y-3">
        {filteredEnquiries.length === 0 ? (
          <div className="p-12 rounded-xl text-center" style={{ background: '#ffffff', border: '1px solid #e5e7eb' }}>
            <Mail className="w-16 h-16 mx-auto mb-4" style={{ color: '#d1d5db' }} />
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#111827' }}>No Enquiries Found</h3>
            <p style={{ color: '#6b7280' }}>
              {searchQuery || filterStatus !== 'all' || filterService !== 'all'
                ? 'Try adjusting your filters'
                : 'Enquiries from the contact form will appear here'}
            </p>
          </div>
        ) : (
          filteredEnquiries.map((enquiry) => (
            <div
              key={enquiry.id}
              className="p-5 rounded-xl relative"
              style={{ background: '#ffffff', border: '1px solid #e5e7eb' }}
            >
              <div className="flex items-start gap-4">
                {/* Status Indicator */}
                <div
                  className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                  style={{ background: getStatusColor(enquiry.status) }}
                />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base mb-1" style={{ color: '#111827' }}>
                        {enquiry.subject}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                        <div className="flex items-center gap-1.5" style={{ color: '#6b7280' }}>
                          <UserIcon className="w-4 h-4" />
                          <span>{enquiry.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5" style={{ color: '#6b7280' }}>
                          <Mail className="w-4 h-4" />
                          <span>{enquiry.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5" style={{ color: '#6b7280' }}>
                          <Phone className="w-4 h-4" />
                          <span>{enquiry.phone}</span>
                        </div>
                        <div className="flex items-center gap-1.5" style={{ color: '#6b7280' }}>
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(enquiry.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          background: `${getStatusColor(enquiry.status)}15`,
                          color: getStatusColor(enquiry.status)
                        }}
                      >
                        {getStatusLabel(enquiry.status)}
                      </span>
                      <span
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          background: enquiry.serviceType === 'construction' ? '#1e3a8a15' : '#d9770615',
                          color: enquiry.serviceType === 'construction' ? '#1e3a8a' : '#d97706'
                        }}
                      >
                        {enquiry.serviceType === 'construction' ? 'Construction' : 'Software'}
                      </span>

                      <div className="relative">
                        <button
                          onClick={() => setActiveDropdown(activeDropdown === enquiry.id ? null : enquiry.id)}
                          className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                          style={{ color: '#6b7280' }}
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>

                        {activeDropdown === enquiry.id && (
                          <div
                            className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg overflow-hidden z-10"
                            style={{ background: '#ffffff', border: '1px solid #e5e7eb' }}
                          >
                            <button
                              onClick={() => {
                                handleView(enquiry);
                                setActiveDropdown(null);
                              }}
                              className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-2"
                              style={{ color: '#374151' }}
                            >
                              <Eye className="w-4 h-4" />
                              <span className="text-sm">View Details</span>
                            </button>

                            <div className="border-t" style={{ borderColor: '#e5e7eb' }}>
                              <div className="px-3 py-2">
                                <p className="text-xs font-medium mb-1.5" style={{ color: '#6b7280' }}>Change Status</p>
                                {(['new', 'read', 'replied', 'closed'] as const).map(status => (
                                  <button
                                    key={status}
                                    onClick={() => {
                                      handleStatusChange(enquiry.id, status);
                                      setActiveDropdown(null);
                                    }}
                                    className="w-full px-2 py-1.5 text-left hover:bg-gray-50 rounded text-sm"
                                    style={{ color: getStatusColor(status) }}
                                  >
                                    {getStatusLabel(status)}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="border-t" style={{ borderColor: '#e5e7eb' }}>
                              <button
                                onClick={() => {
                                  setDeleteConfirm(enquiry.id);
                                  setActiveDropdown(null);
                                }}
                                className="w-full px-4 py-2.5 text-left hover:bg-red-50 flex items-center gap-2"
                                style={{ color: '#dc2626' }}
                              >
                                <Trash2 className="w-4 h-4" />
                                <span className="text-sm">Delete</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm line-clamp-2" style={{ color: '#6b7280' }}>
                    {enquiry.message}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {allFilteredEnquiries.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={allFilteredEnquiries.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(items) => {
            setItemsPerPage(items);
            setCurrentPage(1);
          }}
        />
      )}

      {/* View Modal */}
      {viewModal && (
        <Modal
          isOpen={!!viewModal}
          onClose={() => setViewModal(null)}
          title="Enquiry Details"
          size="md"
        >
          <div className="space-y-5">
            {/* Header Info */}
            <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: '#e5e7eb' }}>
              <div>
                <span
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{
                    background: `${getStatusColor(viewModal.status)}15`,
                    color: getStatusColor(viewModal.status)
                  }}
                >
                  {getStatusLabel(viewModal.status)}
                </span>
              </div>
              <span
                className="px-3 py-1 rounded-full text-xs font-medium"
                style={{
                  background: viewModal.serviceType === 'construction' ? '#1e3a8a15' : '#d9770615',
                  color: viewModal.serviceType === 'construction' ? '#1e3a8a' : '#d97706'
                }}
              >
                {viewModal.serviceType === 'construction' ? 'Construction Services' : 'Software Solutions'}
              </span>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#6b7280' }}>Name</label>
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4" style={{ color: '#6b7280' }} />
                  <p className="text-sm" style={{ color: '#111827' }}>{viewModal.name}</p>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#6b7280' }}>Phone</label>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" style={{ color: '#6b7280' }} />
                  <a href={`tel:${viewModal.phone}`} className="text-sm hover:underline" style={{ color: '#1e3a8a' }}>
                    {viewModal.phone}
                  </a>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#6b7280' }}>Email</label>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" style={{ color: '#6b7280' }} />
                  <a href={`mailto:${viewModal.email}`} className="text-sm hover:underline" style={{ color: '#1e3a8a' }}>
                    {viewModal.email}
                  </a>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#6b7280' }}>Date</label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" style={{ color: '#6b7280' }} />
                  <p className="text-sm" style={{ color: '#111827' }}>
                    {new Date(viewModal.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: '#6b7280' }}>Subject</label>
              <p className="text-sm font-medium" style={{ color: '#111827' }}>{viewModal.subject}</p>
            </div>

            {/* Message */}
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: '#6b7280' }}>Message</label>
              <div
                className="p-4 rounded-lg text-sm whitespace-pre-wrap"
                style={{ background: '#f9fafb', color: '#374151' }}
              >
                {viewModal.message}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t" style={{ borderColor: '#e5e7eb' }}>
              <select
                value={viewModal.status}
                onChange={(e) => handleStatusChange(viewModal.id, e.target.value as Enquiry['status'])}
                className="flex-1 px-4 py-2.5 rounded-lg border"
                style={{ borderColor: '#d1d5db', color: '#111827' }}
              >
                <option value="new">New</option>
                <option value="read">Read</option>
                <option value="replied">Replied</option>
                <option value="closed">Closed</option>
              </select>
              <button
                onClick={() => setViewModal(null)}
                className="px-6 py-2.5 rounded-lg font-medium"
                style={{ background: '#1e3a8a', color: '#ffffff' }}
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <Modal
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          title="Delete Enquiry"
          size="sm"
        >
          <div className="space-y-4">
            <p style={{ color: '#374151' }}>
              Are you sure you want to delete this enquiry? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 rounded-lg font-medium border"
                style={{ borderColor: '#d1d5db', color: '#374151' }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2.5 rounded-lg font-medium"
                style={{ background: '#dc2626', color: '#ffffff' }}
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
