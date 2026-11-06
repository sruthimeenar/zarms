import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Shield, ShieldCheck, User as UserIcon, Mail, Phone, MoreVertical } from 'lucide-react';
import { getAllUsers, addAdmin, updateUser, deleteUser, setPrimaryAdmin, getCurrentSession } from '../../../data/authService';
import { User, UserRole, AccountStatus } from '../../../data/authTypes';
import { Modal } from './Modal';
import { Pagination } from './Pagination';
import { Button, Input, Select, Alert, Tag, Dropdown, Modal as AntModal, Card as AntCard, Space } from 'antd';
import type { MenuProps } from 'antd';

export function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(getCurrentSession().user);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    role: 'admin' as UserRole,
    status: 'active' as AccountStatus,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isSettingPrimary, setIsSettingPrimary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterRole, filterStatus]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch {
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setFormData({
      name: '',
      email: '',
      mobile: '',
      password: '',
      role: 'admin',
      status: 'active',
    });
    setFormErrors({});
    setModalMode('add');
    setEditingUser(null);
    setModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      password: '',
      role: user.role,
      status: user.status,
    });
    setFormErrors({});
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleDelete = (userId: string) => {
    AntModal.confirm({
      title: 'Delete User',
      content: 'Are you sure you want to delete this user? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      okButtonProps: { loading: isDeleting === userId },
      onOk: async () => {
        setIsDeleting(userId);
        try {
          const result = await deleteUser(userId);
          if (result.success) {
            await loadUsers();
          } else {
            AntModal.error({
              title: 'Error',
              content: result.message,
            });
          }
        } finally {
          setIsDeleting(null);
        }
      },
    });
  };

  const handleSetPrimary = (userId: string) => {
    AntModal.confirm({
      title: 'Set Primary Admin',
      content: 'Set this admin as the primary admin? They will receive all registration OTP emails.',
      okText: 'Set as Primary',
      cancelText: 'Cancel',
      okButtonProps: { loading: isSettingPrimary === userId },
      onOk: async () => {
        setIsSettingPrimary(userId);
        try {
          const result = await setPrimaryAdmin(userId);
          if (result.success) {
            await loadUsers();
          } else {
            AntModal.error({
              title: 'Error',
              content: result.message,
            });
          }
        } finally {
          setIsSettingPrimary(null);
        }
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setIsSubmitting(true);

    try {
      if (modalMode === 'add') {
        const result = await addAdmin(formData.name, formData.email, formData.mobile);
        if (result.success) {
          await loadUsers();
          setModalOpen(false);
        } else {
          setFormErrors({ general: result.message });
        }
      } else if (modalMode === 'edit' && editingUser) {
        const updates: Partial<User> = {
          name: formData.name,
          email: formData.email,
          mobile: formData.mobile,
          role: formData.role,
          status: formData.status,
        };

        const result = await updateUser(editingUser.id, updates);
        if (result.success) {
          await loadUsers();
          setModalOpen(false);
        } else {
          setFormErrors({ general: result.message });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const allFilteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.mobile.includes(searchQuery);

    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalPages = Math.ceil(allFilteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const filteredUsers = allFilteredUsers.slice(startIndex, endIndex);

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    superadmins: users.filter(u => u.role === 'superadmin').length,
    active: users.filter(u => u.status === 'active').length,
    primary: users.find(u => u.primary),
  };

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-5">
      {formErrors.general && (
        <Alert title={formErrors.general} type="error" showIcon />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
            Full Name <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
            Email <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            disabled={modalMode === 'edit'}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
            Mobile <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <Input
            type="tel"
            value={formData.mobile}
            onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '') })}
            maxLength={10}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
            Role
          </label>
          <Select
            value={formData.role}
            onChange={(value) => setFormData({ ...formData, role: value as UserRole })}
            disabled={modalMode === 'edit' && currentUser?.role !== 'superadmin'}
            style={{ width: '100%' }}
            options={[
              { value: 'admin', label: 'Admin' },
              { value: 'superadmin', label: 'Superadmin' },
            ]}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
            Status
          </label>
          <Select
            value={formData.status}
            onChange={(value) => setFormData({ ...formData, status: value as AccountStatus })}
            disabled={modalMode === 'edit' && currentUser?.role !== 'superadmin'}
            style={{ width: '100%' }}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'suspended', label: 'Suspended' },
              { value: 'inactive', label: 'Inactive' },
            ]}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-5 border-t" style={{ borderColor: '#e5e7eb' }}>
        <Button
          type="primary"
          htmlType="submit"
          loading={isSubmitting}
          disabled={isSubmitting}
          style={{ background: '#1e3a8a' }}
        >
          {modalMode === 'add' ? 'Add Admin' : 'Update Admin'}
        </Button>
        <Button onClick={() => setModalOpen(false)} disabled={isSubmitting}>
          Cancel
        </Button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#0f172a' }}>
            Users Management
          </h1>
          <p className="text-xs mt-1" style={{ color: '#64748b' }}>
            {allFilteredUsers.length} {allFilteredUsers.length === 1 ? 'user' : 'users'} total
          </p>
        </div>
        <Button
          type="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={handleAdd}
          loading={isLoading}
          style={{ background: '#1e3a8a' }}
        >
          Add Admin
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-lg" style={{ background: '#ffffff', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0' }}>
          <p className="text-xs font-medium mb-1" style={{ color: '#64748b' }}>Total Users</p>
          <p className="text-2xl font-bold" style={{ color: '#0f172a' }}>{stats.total}</p>
        </div>
        <div className="p-5 rounded-lg" style={{ background: '#ffffff', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0' }}>
          <p className="text-xs font-medium mb-1" style={{ color: '#64748b' }}>Admins</p>
          <p className="text-2xl font-bold" style={{ color: '#1e3a8a' }}>{stats.admins}</p>
        </div>
        <div className="p-5 rounded-lg" style={{ background: '#ffffff', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0' }}>
          <p className="text-xs font-medium mb-1" style={{ color: '#64748b' }}>Active</p>
          <p className="text-2xl font-bold" style={{ color: '#10b981' }}>{stats.active}</p>
        </div>
        <div className="p-5 rounded-lg" style={{ background: '#ffffff', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0' }}>
          <p className="text-xs font-medium mb-1" style={{ color: '#64748b' }}>Primary Admin</p>
          <p className="text-sm font-semibold truncate" style={{ color: '#0f172a' }}>{stats.primary?.name || 'Not set'}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 p-4 rounded-lg" style={{ background: '#ffffff', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0' }}>
        <div className="flex-1">
          <Input
            placeholder="Search users..."
            prefix={<Search className="w-4 h-4" style={{ color: '#94a3b8' }} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            allowClear
          />
        </div>

        <div className="flex gap-2">
          <Select
            value={filterRole}
            onChange={(value) => setFilterRole(value)}
            style={{ width: 130 }}
            options={[
              { value: 'all', label: 'All Roles' },
              { value: 'admin', label: 'Admin' },
              { value: 'superadmin', label: 'Superadmin' },
            ]}
          />

          <Select
            value={filterStatus}
            onChange={(value) => setFilterStatus(value)}
            style={{ width: 130 }}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'suspended', label: 'Suspended' },
              { value: 'inactive', label: 'Inactive' },
            ]}
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-lg" style={{ background: '#ffffff', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0', overflow: 'visible' }}>
        <table className="w-full" style={{ overflow: 'visible' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: '#64748b' }}>User</th>
              <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: '#64748b' }}>Contact</th>
              <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: '#64748b' }}>Role</th>
              <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: '#64748b' }}>Status</th>
              <th className="px-4 py-3 text-right text-xs font-semibold" style={{ color: '#64748b' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => {
              return (
                <tr
                  key={user.id}
                  className="transition-colors hover:bg-slate-50 cursor-pointer"
                  style={{ borderBottom: '1px solid #f1f5f9' }}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: user.primary ? '#fef3c7' : '#eff6ff' }}>
                        {user.primary ? (
                          <ShieldCheck className="w-5 h-5" style={{ color: '#d97706' }} />
                        ) : (
                          <UserIcon className="w-5 h-5" style={{ color: '#1e3a8a' }} />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: '#0f172a' }}>{user.name}</p>
                        {user.primary && (
                          <span className="text-xs font-medium" style={{ color: '#d97706' }}>Primary Admin</span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-xs" style={{ color: '#64748b' }}>
                      <Mail className="w-3.5 h-3.5" />
                      <span className="truncate max-w-[200px]">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs mt-1" style={{ color: '#64748b' }}>
                      <Phone className="w-3.5 h-3.5" />
                      <span>{user.mobile}</span>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <Tag color={user.role === 'superadmin' ? 'gold' : 'blue'}>
                      {user.role === 'superadmin' && <Shield className="w-3 h-3 inline mr-1" />}
                      {user.role === 'superadmin' ? 'Superadmin' : 'Admin'}
                    </Tag>
                  </td>

                  <td className="px-4 py-3">
                    <Tag color={user.status === 'active' ? 'success' : user.status === 'suspended' ? 'error' : 'default'}>
                      <span className="capitalize">{user.status}</span>
                    </Tag>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Dropdown
                        menu={{
                          items: [
                            ...(currentUser?.role === 'superadmin' && !user.primary ? [{
                              key: 'primary',
                              label: 'Set as Primary',
                              icon: <ShieldCheck className="w-3.5 h-3.5" />,
                              onClick: () => handleSetPrimary(user.id),
                            }] : []),
                            {
                              key: 'edit',
                              label: 'Edit',
                              icon: <Edit className="w-3.5 h-3.5" />,
                              onClick: () => handleEdit(user),
                            },
                            ...(!user.primary ? [{
                              key: 'delete',
                              label: 'Delete',
                              icon: <Trash2 className="w-3.5 h-3.5" />,
                              danger: true,
                              onClick: () => handleDelete(user.id),
                            }] : []),
                          ],
                        }}
                        trigger={['click']}
                        placement="bottomRight"
                      >
                        <Button
                          type="text"
                          icon={<MoreVertical className="w-4 h-4" />}
                        />
                      </Dropdown>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {allFilteredUsers.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={allFilteredUsers.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(items) => {
            setItemsPerPage(items);
            setCurrentPage(1);
          }}
        />
      )}

      {/* Empty State */}
      {allFilteredUsers.length === 0 && (
        <div className="text-center py-20 rounded-xl border" style={{ background: '#ffffff', borderColor: '#e5e7eb' }}>
          <div className="p-4 rounded-full mx-auto mb-4 inline-flex" style={{ backgroundColor: '#1e3a8a15' }}>
            <UserIcon className="w-12 h-12" style={{ color: '#1e3a8a' }} />
          </div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: '#111827' }}>
            No users found
          </h3>
          <p className="text-sm mb-6" style={{ color: '#6b7280' }}>
            {searchQuery || filterRole !== 'all' || filterStatus !== 'all'
              ? 'Try adjusting your filters'
              : 'Get started by adding your first admin'}
          </p>
          <Button
            type="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleAdd}
            loading={isLoading}
            style={{ background: '#1e3a8a' }}
          >
            Add Admin
          </Button>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalMode === 'add' ? 'Add Admin' : 'Edit Admin'}
        size="md"
      >
        {renderForm()}
      </Modal>
    </div>
  );
}
