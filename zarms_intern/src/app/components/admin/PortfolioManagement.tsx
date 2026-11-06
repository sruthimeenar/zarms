import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Filter, X, LayoutGrid, LayoutList, MoreVertical, FolderOpen } from 'lucide-react';
import * as Icons from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button, Input, Select, Switch, Tag, Modal as AntModal, Form, Space, Dropdown, Card as AntCard, Menu } from 'antd';
import type { MenuProps } from 'antd';
import { getPortfolioItems, addPortfolioItem, updatePortfolioItem, deletePortfolioItem, searchPortfolioItems } from '../../../data/portfolio';
import { PortfolioItem, ServiceType } from '../../../data/types';
import { validatePortfolioItem } from '../../../data/validation';
import { ImageUpload } from './ImageUpload';
import { IconPicker } from './IconPicker';
import { Pagination } from './Pagination';

const { TextArea } = Input;

export function PortfolioManagement() {
  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterService, setFilterService] = useState<string>('');
  const [filterFeatured, setFilterFeatured] = useState<string>('');
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [allPortfolioItems, setAllPortfolioItems] = useState<PortfolioItem[]>([]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterService, filterFeatured]);

  // Form state
  const [formData, setFormData] = useState<Partial<PortfolioItem>>({
    serviceType: 'Construction Services',
    projectName: '',
    description: '',
    images: [],
    icon: 'Building',
    subtitle: '',
    shortSummary: '',
    projectLocation: '',
    featured: false,
    tags: [],
  });

  useEffect(() => {
    loadPortfolio();
  }, [searchQuery, filterService, filterFeatured]);

  const loadPortfolio = async () => {
    try {
      const items = searchQuery
        ? await searchPortfolioItems(searchQuery)
        : await getPortfolioItems(filterService || undefined, undefined, filterFeatured ? filterFeatured === 'true' : undefined);
      setAllPortfolioItems(items);
    } catch (error) {
      setAllPortfolioItems([]);
    }
  };

  // Pagination
  const totalPages = Math.ceil(allPortfolioItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const portfolioItems = allPortfolioItems.slice(startIndex, endIndex);

  const handleAdd = () => {
    const initialData = {
      serviceType: 'Construction Services',
      projectName: '',
      description: '',
      images: [],
      icon: 'Building',
      subtitle: '',
      shortSummary: '',
      projectLocation: '',
      featured: false,
      tags: [],
    };
    setFormData(initialData);
    form.setFieldsValue(initialData);
    setModalMode('add');
    setModalOpen(true);
  };

  const handleEdit = (item: PortfolioItem) => {
    setEditingItem(item);
    setFormData(item);
    form.setFieldsValue(item);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    AntModal.confirm({
      title: 'Delete Portfolio Item',
      content: 'Are you sure you want to delete this portfolio item?',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        await deletePortfolioItem(id);
        await loadPortfolio();
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const dataToSubmit = { ...formData, ...values };

      const validation = validatePortfolioItem(dataToSubmit);
      if (!validation.isValid) {
        return;
      }

      if (modalMode === 'add') {
        await addPortfolioItem(dataToSubmit as Omit<PortfolioItem, 'id' | 'createdAt' | 'updatedAt'>);
      } else if (modalMode === 'edit' && editingItem) {
        await updatePortfolioItem(editingItem.id, dataToSubmit);
      }

      setModalOpen(false);
      await loadPortfolio();
      form.resetFields();
      setFormData({
        serviceType: 'Construction Services',
        projectName: '',
        description: '',
        images: [],
        icon: 'Building',
        subtitle: '',
        shortSummary: '',
        status: 'Ongoing',
        projectLocation: '',
        featured: false,
        tags: [],
      });
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleCancel = () => {
    setModalOpen(false);
    form.resetFields();
    setFormData({
      serviceType: 'Construction Services',
      projectName: '',
      description: '',
      images: [],
      icon: 'Building',
      subtitle: '',
      shortSummary: '',
      projectLocation: '',
      featured: false,
      tags: [],
    });
  };

  const IconComponent = Icons[formData.icon as keyof typeof Icons] as any;

  const getDropdownMenu = (item: PortfolioItem): MenuProps['items'] => [
    {
      key: 'edit',
      label: 'Edit',
      icon: <Edit className="w-4 h-4" />,
      onClick: () => handleEdit(item),
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: <Trash2 className="w-4 h-4" />,
      danger: true,
      onClick: () => handleDelete(item.id),
    },
  ];

  const renderForm = () => (
    <Form
      form={form}
      layout="vertical"
      initialValues={formData}
      onValuesChange={(_, allValues) => setFormData({ ...formData, ...allValues })}
    >
      <div className="space-y-4">
        {/* Service Type */}
        <Form.Item
          label="Service Type"
          name="serviceType"
          rules={[{ required: true, message: 'Please select service type' }]}
        >
          <Select>
            <Select.Option value="Construction Services">Construction Services</Select.Option>
            <Select.Option value="Software Solutions">Software Solutions</Select.Option>
          </Select>
        </Form.Item>

        {/* Project Name */}
        <Form.Item
          label="Project Name"
          name="projectName"
          rules={[{ required: true, message: 'Please enter project name' }]}
        >
          <Input placeholder="Enter project name" maxLength={80} showCount />
        </Form.Item>

        {/* Subtitle & Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div key="subtitle-field">
            <Form.Item label="Subtitle" name="subtitle">
              <Input placeholder="Optional subtitle" maxLength={100} showCount />
            </Form.Item>
          </div>

          <div key="location-field">
            <Form.Item label="Project Location" name="projectLocation">
              <Input placeholder="City, State" />
            </Form.Item>
          </div>
        </div>

        {/* Short Summary */}
        <Form.Item label="Short Summary" name="shortSummary">
          <Input placeholder="Brief project summary" maxLength={140} showCount />
        </Form.Item>

        {/* Description */}
        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: 'Please enter description' }]}
        >
          <TextArea rows={4} placeholder="Detailed project description" maxLength={500} showCount />
        </Form.Item>

        {/* Icon Picker */}
        <Form.Item label="Icon">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowIconPicker(!showIconPicker)}
              icon={IconComponent ? <IconComponent className="w-4 h-4" /> : null}
            >
              {formData.icon || 'Select Icon'}
            </Button>
          </div>
          {showIconPicker && (
            <div className="mt-2">
              <IconPicker
                selectedIcon={formData.icon || 'Building'}
                onSelect={(icon) => {
                  setFormData({ ...formData, icon });
                  form.setFieldsValue({ icon });
                  setShowIconPicker(false);
                }}
              />
            </div>
          )}
        </Form.Item>

        {/* Images */}
        <Form.Item label="Project Images">
          <ImageUpload
            images={formData.images || []}
            onChange={(images) => {
              setFormData({ ...formData, images });
              form.setFieldsValue({ images });
            }}
            maxImages={5}
            uploadType="portfolio"
          />
        </Form.Item>

        {/* Tags */}
        <Form.Item label="Tags (comma-separated)" name="tags">
          <Input
            placeholder="React, Modern, Sustainable"
            value={formData.tags?.join(', ')}
            onChange={(e) => {
              const tags = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
              setFormData({ ...formData, tags });
              form.setFieldsValue({ tags });
            }}
          />
        </Form.Item>

        {/* Featured */}
        <Form.Item label="Featured Project" name="featured" valuePropName="checked">
          <Switch />
        </Form.Item>
      </div>
    </Form>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#111827' }}>Portfolio Management</h1>
          <p className="text-sm mt-1" style={{ color: '#6b7280' }}>
            Manage your construction and software project portfolio
          </p>
        </div>
        <Button type="primary" icon={<Plus className="w-4 h-4" />} onClick={handleAdd}>
          Add New Project
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-6 p-4 rounded-lg" style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div key="search-filter">
            <Input
              placeholder="Search projects..."
              prefix={<Search className="w-4 h-4" style={{ color: '#9ca3af' }} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              allowClear
            />
          </div>

          <div key="service-filter">
            <Select
              placeholder="All Services"
              value={filterService || undefined}
              onChange={setFilterService}
              allowClear
              style={{ width: '100%' }}
            >
              <Select.Option value="Construction Services">Construction</Select.Option>
              <Select.Option value="Software Solutions">Software</Select.Option>
            </Select>
          </div>

          <div key="featured-filter">
            <Select
              placeholder="Featured Status"
              value={filterFeatured || undefined}
              onChange={setFilterFeatured}
              allowClear
              style={{ width: '100%' }}
            >
              <Select.Option value="true">Featured Only</Select.Option>
              <Select.Option value="false">Non-Featured</Select.Option>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t" style={{ borderColor: '#e5e7eb' }}>
          <p className="text-sm" style={{ color: '#6b7280' }}>
            Showing {portfolioItems.length} of {allPortfolioItems.length} projects
          </p>
          <Space>
            <Button
              key="grid-view"
              icon={<LayoutGrid className="w-4 h-4" />}
              type={viewMode === 'grid' ? 'primary' : 'default'}
              onClick={() => setViewMode('grid')}
            />
            <Button
              key="list-view"
              icon={<LayoutList className="w-4 h-4" />}
              type={viewMode === 'list' ? 'primary' : 'default'}
              onClick={() => setViewMode('list')}
            />
          </Space>
        </div>
      </div>

      {/* Content */}
      {portfolioItems.length === 0 ? (
        <div className="text-center py-16 rounded-lg" style={{ background: '#f9fafb', border: '2px dashed #e5e7eb' }}>
          <FolderOpen className="w-16 h-16 mx-auto mb-4" style={{ color: '#d1d5db' }} />
          <h3 className="text-lg font-semibold mb-2" style={{ color: '#374151' }}>No Projects Found</h3>
          <p className="mb-4" style={{ color: '#6b7280' }}>
            {searchQuery || filterService ? 'Try adjusting your filters' : 'Get started by adding your first project'}
          </p>
          {!searchQuery && !filterService && (
            <Button type="primary" icon={<Plus className="w-4 h-4" />} onClick={handleAdd}>
              Add Project
            </Button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolioItems.map((item) => {
            const ItemIcon = Icons[item.icon as keyof typeof Icons] as any;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -4 }}
              >
                <AntCard
                  hoverable
                  cover={
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={item.images[0] || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80'}
                        alt={item.projectName}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3">
                        <Dropdown menu={{ items: getDropdownMenu(item) }} trigger={['click']}>
                          <Button
                            type="text"
                            icon={<MoreVertical className="w-4 h-4" />}
                            style={{ background: 'rgba(255, 255, 255, 0.9)' }}
                          />
                        </Dropdown>
                      </div>
                      {item.featured && (
                        <div className="absolute top-3 left-3">
                          <Tag color="gold">Featured</Tag>
                        </div>
                      )}
                    </div>
                  }
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Tag>{item.serviceType === 'Construction Services' ? 'Construction' : 'Software'}</Tag>
                    </div>
                    <h3 className="text-lg font-bold" style={{ color: '#111827' }}>{item.projectName}</h3>
                    {item.subtitle && (
                      <p className="text-sm" style={{ color: '#6b7280' }}>{item.subtitle}</p>
                    )}
                    {item.projectLocation && (
                      <p className="text-sm" style={{ color: '#9ca3af' }}>📍 {item.projectLocation}</p>
                    )}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-2">
                        {item.tags.slice(0, 3).map((tag, i) => (
                          <Tag key={i} color="blue">{tag}</Tag>
                        ))}
                        {item.tags.length > 3 && <Tag>+{item.tags.length - 3}</Tag>}
                      </div>
                    )}
                  </div>
                </AntCard>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {portfolioItems.map((item) => {
            const ItemIcon = Icons[item.icon as keyof typeof Icons] as any;
            return (
              <AntCard key={item.id}>
                <div className="flex items-start gap-4">
                  <img
                    src={item.images[0] || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80'}
                    alt={item.projectName}
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-bold" style={{ color: '#111827' }}>{item.projectName}</h3>
                          {item.featured && <Tag color="gold">Featured</Tag>}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <Tag>{item.serviceType === 'Construction Services' ? 'Construction' : 'Software'}</Tag>
                          {item.projectLocation && <span className="text-sm" style={{ color: '#6b7280' }}>📍 {item.projectLocation}</span>}
                        </div>
                        <p className="text-sm mb-2" style={{ color: '#6b7280' }}>
                          {item.shortSummary || item.description.substring(0, 150)}...
                        </p>
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {item.tags.map((tag, i) => (
                              <Tag key={i} color="blue">{tag}</Tag>
                            ))}
                          </div>
                        )}
                      </div>
                      <Dropdown menu={{ items: getDropdownMenu(item) }} trigger={['click']}>
                        <Button type="text" icon={<MoreVertical className="w-4 h-4" />} />
                      </Dropdown>
                    </div>
                  </div>
                </div>
              </AntCard>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
            totalItems={allPortfolioItems.length}
          />
        </div>
      )}

      {/* Modal */}
      <AntModal
        title={modalMode === 'add' ? 'Add New Project' : 'Edit Project'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={handleCancel}
        width={800}
        okText={modalMode === 'add' ? 'Add Project' : 'Save Changes'}
      >
        {renderForm()}
      </AntModal>
    </div>
  );
}
