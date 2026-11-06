import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Image as ImageIcon, LayoutGrid, LayoutList, MoreVertical } from 'lucide-react';
import { getGalleryItems, addGalleryItem, updateGalleryItem, deleteGalleryItem, searchGalleryItems } from '../../../data/gallery';
import { GalleryItem, ServiceType } from '../../../data/types';
import { validateGalleryItem } from '../../../data/validation';
import { ImageUpload } from './ImageUpload';
import { deleteImage, uploadImages } from '../../../data/uploadService';
import { Modal } from './Modal';
import { Pagination } from './Pagination';
import { Button, Input, Select, Switch, Tag, Modal as AntModal, Form, Space, Dropdown, Card as AntCard } from 'antd';
import type { MenuProps } from 'antd';

export function GalleryManagement() {
  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterService, setFilterService] = useState<string>('');
  const [filterFeatured, setFilterFeatured] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [allGalleryItems, setAllGalleryItems] = useState<GalleryItem[]>([]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterService, filterFeatured]);

  // Form state
  const [formData, setFormData] = useState<Partial<GalleryItem> & { images?: string[] }>({
    serviceType: 'Construction Services',
    image: '',
    images: [],
    title: '',
    subtitle: '',
    sortOrder: 1,
    featured: false,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadGallery();
  }, [searchQuery, filterService, filterFeatured]);

  const loadGallery = async () => {
    setIsLoading(true);
    try {
      const items = searchQuery
        ? await searchGalleryItems(searchQuery)
        : await getGalleryItems(filterService || undefined, filterFeatured ? filterFeatured === 'true' : undefined);
      setAllGalleryItems(items);
    } catch {
      setAllGalleryItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Pagination
  const totalPages = Math.ceil(allGalleryItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const galleryItems = allGalleryItems.slice(startIndex, endIndex);

  const handleAdd = () => {
    const initialData = {
      serviceType: 'Construction Services',
      image: '',
      images: [],
      title: '',
      subtitle: '',
      sortOrder: 1,
      featured: false,
    };
    setFormData(initialData);
    setPendingFiles([]);
    form.resetFields();
    form.setFieldsValue(initialData);
    setFormErrors({});
    setModalMode('add');
    setModalOpen(true);
  };

  const handleEdit = (item: GalleryItem) => {
    setEditingItem(item);
    const editData = { ...item, image: item.image, images: [item.image] };
    setFormData(editData);
    setPendingFiles([]);
    form.setFieldsValue(editData);
    setFormErrors({});
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    AntModal.confirm({
      title: 'Delete Gallery Item',
      content: 'Are you sure you want to delete this gallery item?',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      okButtonProps: { loading: isDeleting === id },
      onOk: async () => {
        setIsDeleting(id);
        try {
          await deleteGalleryItem(id);
          await loadGallery();
        } finally {
          setIsDeleting(null);
        }
      },
    });
  };

  const handleSubmit = async () => {
    // Get current form values and merge with formData (for images which is outside form fields)
    const formValues = form.getFieldsValue();
    const submitData = { ...formData, ...formValues };

    // Validate that we have at least one image
    if (!submitData.images || submitData.images.length === 0) {
      setFormErrors({ image: 'Please upload at least one image' });
      return;
    }

    // Validate other fields
    if (!submitData.title) {
      setFormErrors({ title: 'Title is required' });
      return;
    }

    if (!submitData.serviceType) {
      setFormErrors({ serviceType: 'Service type is required' });
      return;
    }

    setIsSubmitting(true);
    let uploadedUrls: string[] = [];
    const persistedUrls = new Set<string>();
    try {
      if (modalMode === 'add') {
        if (pendingFiles.length === 0) {
          setFormErrors({ image: 'Please select at least one image' });
          return;
        }

        const uploadResults = await uploadImages(
          pendingFiles,
          'gallery',
          10
        );
        const failedUploads = uploadResults.filter((r) => !r.success);
        if (failedUploads.length > 0) {
          throw new Error(failedUploads[0]?.error || 'Some images failed to upload');
        }

        uploadedUrls = uploadResults
          .filter((r) => r.success && r.url)
          .map((r) => r.url!) as string[];

        // Create multiple gallery items, one for each image
        const items = uploadedUrls.map((imageUrl: string) => {
          const galleryItem = {
            serviceType: submitData.serviceType,
            image: imageUrl,
            title: submitData.title,
            subtitle: submitData.subtitle || '',
            sortOrder: submitData.sortOrder || 1,
            featured: submitData.featured || false,
          };

          // Validate each item
          const validation = validateGalleryItem(galleryItem);
          if (!validation.isValid) {
            throw new Error(validation.errors.map(e => e.message).join(', '));
          }

          return galleryItem;
        });

        // Add all items
        for (const item of items) {
          await addGalleryItem(item as Omit<GalleryItem, 'id' | 'createdAt' | 'updatedAt'>);
          persistedUrls.add(item.image);
        }
      } else if (modalMode === 'edit' && editingItem) {
        // For edit, only update with the first image (single image edit mode)
        const updateData = {
          ...submitData,
          image: submitData.images?.[0] || submitData.image
        };

        const validation = validateGalleryItem(updateData);
        if (!validation.isValid) {
          const errors: Record<string, string> = {};
          validation.errors.forEach(err => {
            errors[err.field] = err.message;
          });
          setFormErrors(errors);
          return;
        }

        await updateGalleryItem(editingItem.id, updateData);
      }

      setModalOpen(false);
      await loadGallery();
      form.resetFields();
      (formData.images || []).forEach((url) => {
        if (url.startsWith('blob:')) URL.revokeObjectURL(url);
      });
      setFormData({
        serviceType: 'Construction Services',
        image: '',
        images: [],
        title: '',
        subtitle: '',
        sortOrder: 1,
        featured: false,
      });
      setPendingFiles([]);
      setFormErrors({});
    } catch (error: any) {
      // Cleanup orphan files uploaded in this submit but not persisted in DB.
      if (modalMode === 'add' && uploadedUrls.length > 0) {
        const orphanUrls = uploadedUrls.filter((url) => !persistedUrls.has(url));
        await Promise.all(orphanUrls.map((url) => deleteImage(url)));
      }
      setFormErrors({ general: error.message || 'Failed to save gallery item' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setModalOpen(false);
    form.resetFields();
    (formData.images || []).forEach((url) => {
      if (url.startsWith('blob:')) URL.revokeObjectURL(url);
    });
    setFormData({
      serviceType: 'Construction Services',
      image: '',
      images: [],
      title: '',
      subtitle: '',
      sortOrder: 1,
      featured: false,
    });
    setPendingFiles([]);
    setFormErrors({});
  };

  const renderForm = () => (
    <Form
      form={form}
      layout="vertical"
      initialValues={formData}
      onValuesChange={(_, allValues) => setFormData({ ...formData, ...allValues })}
      onFinish={handleSubmit}
    >
      <div className="space-y-5">
        {formErrors.general && (
          <div className="p-4 rounded-lg" style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#dc2626' }}>
            {formErrors.general}
          </div>
        )}
        {/* Service Type & Sort Order - 2 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            label="Service Type"
            required
            validateStatus={formErrors.serviceType ? 'error' : ''}
            help={formErrors.serviceType}
          >
            <Select
              value={formData.serviceType}
              onChange={value => setFormData({ ...formData, serviceType: value as ServiceType })}
              options={[
                { value: 'Construction Services', label: 'Construction Services' },
                { value: 'Software Solutions', label: 'Software Solutions' },
              ]}
            />
          </Form.Item>

          <Form.Item
            label="Sort Order"
            help="Lower numbers appear first"
          >
            <Input
              type="number"
              value={formData.sortOrder}
              onChange={e => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 1 })}
              min={1}
            />
          </Form.Item>
        </div>

        {/* Image - Full width */}
        <Form.Item
          validateStatus={formErrors.image ? 'error' : ''}
          help={formErrors.image}
        >
          <ImageUpload
            images={formData.images || (formData.image ? [formData.image] : [])}
            onChange={images => {
              setFormData({ ...formData, images, image: images[0] || '' });
            }}
            deferUpload={modalMode === 'add'}
            pendingFiles={pendingFiles}
            onPendingFilesChange={setPendingFiles}
            maxImages={modalMode === 'add' ? 10 : 1}
            uploadType="gallery"
            label={modalMode === 'add' ? 'Gallery Images *' : 'Gallery Image *'}
            helpText={modalMode === 'add'
              ? 'Select multiple images to add them all with the same title and subtitle. Recommended: 1200x900px, JPG/PNG/WebP, Max 5MB each'
              : 'Recommended: 1200x900px, JPG/PNG/WebP, Max 5MB'}
          />
        </Form.Item>

        {/* Title & Subtitle - 2 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            label="Title"
            required
            validateStatus={formErrors.title ? 'error' : ''}
            help={formErrors.title}
          >
            <Input
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              maxLength={80}
              showCount
              placeholder="Enter gallery title"
            />
          </Form.Item>

          <Form.Item label="Subtitle">
            <Input
              value={formData.subtitle}
              onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
              maxLength={120}
              showCount
              placeholder="Optional subtitle"
            />
          </Form.Item>
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-3 pt-5 border-t" style={{ borderColor: '#e5e7eb' }}>
        <Button
          type="primary"
          htmlType="submit"
          loading={isSubmitting}
          disabled={isSubmitting}
          style={{ background: '#1e3a8a' }}
        >
          {modalMode === 'add' ? 'Add Gallery Item' : 'Update Gallery Item'}
        </Button>
        <Button onClick={handleCancel} disabled={isSubmitting}>
          Cancel
        </Button>
      </div>
    </Form>
  );

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#0f172a' }}>
            Gallery
          </h1>
          <p className="text-xs mt-1" style={{ color: '#64748b' }}>
            {allGalleryItems.length} {allGalleryItems.length === 1 ? 'image' : 'images'} total
          </p>
        </div>
        <Button
          type="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={handleAdd}
          loading={isLoading}
          style={{ background: '#1e3a8a' }}
        >
          New Image
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 p-4 rounded-lg" style={{ background: '#ffffff', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0' }}>
        {/* Search */}
        <div className="flex-1">
          <Input
            placeholder="Search images..."
            prefix={<Search className="w-4 h-4" style={{ color: '#94a3b8' }} />}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            allowClear
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <div>
            <Select
              placeholder="All Services"
              value={filterService || undefined}
              onChange={value => setFilterService(value || '')}
              allowClear
              style={{ width: 150 }}
              options={[
                { value: 'Construction Services', label: 'Construction' },
                { value: 'Software Solutions', label: 'Software' },
              ]}
            />
          </div>

          <div>
            <Select
              placeholder="All Images"
              value={filterFeatured || undefined}
              onChange={value => setFilterFeatured(value || '')}
              allowClear
              style={{ width: 150 }}
              options={[
                { value: 'true', label: 'Featured Only' },
                { value: 'false', label: 'Non-Featured' },
              ]}
            />
          </div>

          {/* View Switcher */}
          <div className="flex items-center rounded-lg border overflow-hidden" style={{ background: '#f8fafc', borderColor: '#e2e8f0' }}>
            <Button
              onClick={() => setViewMode('grid')}
              type={viewMode === 'grid' ? 'primary' : 'text'}
              icon={<LayoutGrid className="w-4 h-4" />}
              style={viewMode === 'grid' ? { background: '#1e3a8a' } : {}}
              title="Grid view"
            />
            <Button
              onClick={() => setViewMode('list')}
              type={viewMode === 'list' ? 'primary' : 'text'}
              icon={<LayoutList className="w-4 h-4" />}
              style={viewMode === 'list' ? { background: '#1e3a8a' } : {}}
              title="List view"
            />
          </div>
        </div>
      </div>

      {/* Gallery Display */}
      {viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {galleryItems.map(item => {
            const menuItems: MenuProps['items'] = [
              {
                key: 'edit',
                label: 'Edit',
                icon: <Edit className="w-3.5 h-3.5" />,
                onClick: () => handleEdit(item),
              },
              {
                key: 'delete',
                label: 'Delete',
                icon: <Trash2 className="w-3.5 h-3.5" />,
                danger: true,
                onClick: () => handleDelete(item.id),
              },
            ];

            return (
              <div key={item.id} className="relative group">
                <AntCard
                  hoverable
                  cover={<img src={item.image} alt={item.title} className="w-full h-48 object-cover" />}
                >
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-sm font-semibold line-clamp-1" style={{ color: '#0f172a' }}>
                        {item.title}
                      </h3>
                      {item.subtitle && (
                        <p className="text-xs mt-0.5 line-clamp-1" style={{ color: '#64748b' }}>
                          {item.subtitle}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      <Tag color={item.serviceType === 'Construction Services' ? 'blue' : 'orange'}>
                        {item.serviceType === 'Construction Services' ? 'Construction' : 'Software'}
                      </Tag>
                      {item.sortOrder && (
                        <Tag>Order: {item.sortOrder}</Tag>
                      )}
                    </div>
                  </div>
                </AntCard>
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
                    <Button
                      type="text"
                      icon={<MoreVertical className="w-4 h-4" />}
                      style={{ background: 'rgba(255, 255, 255, 0.9)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
                    />
                  </Dropdown>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View - Table Layout */
        <div className="rounded-lg overflow-hidden" style={{ background: '#ffffff', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0' }}>
          <table className="w-full">
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: '#64748b' }}>Thumbnail</th>
                <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: '#64748b' }}>Title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: '#64748b' }}>Service</th>
                <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: '#64748b' }}>Sort Order</th>
                <th className="px-4 py-3 text-right text-xs font-semibold" style={{ color: '#64748b' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {galleryItems.map((item, index) => (
                <tr
                  key={item.id}
                  className="transition-colors hover:bg-slate-50 cursor-pointer"
                  style={{ borderBottom: '1px solid #f1f5f9' }}
                >
                  {/* Thumbnail */}
                  <td className="px-4 py-3">
                    <img src={item.image} alt={item.title} className="w-16 h-16 object-cover rounded" />
                  </td>

                  {/* Title */}
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold line-clamp-1" style={{ color: '#0f172a' }}>
                        {item.title}
                      </p>
                      {item.subtitle && (
                        <p className="text-xs line-clamp-1 mt-0.5" style={{ color: '#64748b' }}>
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </td>

                  {/* Service */}
                  <td className="px-4 py-3">
                    <Tag color={item.serviceType === 'Construction Services' ? 'blue' : 'orange'}>
                      {item.serviceType === 'Construction Services' ? 'Construction' : 'Software'}
                    </Tag>
                  </td>

                  {/* Sort Order */}
                  <td className="px-4 py-3">
                    <span className="text-xs" style={{ color: '#64748b' }}>
                      {item.sortOrder}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <Space>
                      <Button
                        type="text"
                        icon={<Edit className="w-4 h-4" />}
                        onClick={() => handleEdit(item)}
                        title="Edit"
                      />
                      <Button
                        type="text"
                        danger
                        icon={<Trash2 className="w-4 h-4" />}
                        onClick={() => handleDelete(item.id)}
                        title="Delete"
                      />
                    </Space>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {allGalleryItems.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={allGalleryItems.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(items) => {
            setItemsPerPage(items);
            setCurrentPage(1);
          }}
        />
      )}

      {/* Empty State */}
      {allGalleryItems.length === 0 && (
        <div className="text-center py-20 rounded-xl border" style={{ background: '#ffffff', borderColor: '#e5e7eb' }}>
          <div className="p-4 rounded-full mx-auto mb-4 inline-flex" style={{ backgroundColor: '#d9770615' }}>
            <ImageIcon className="w-12 h-12" style={{ color: '#d97706' }} />
          </div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: '#111827' }}>
            No gallery items found
          </h3>
          <p className="text-sm mb-6" style={{ color: '#6b7280' }}>
            {searchQuery || filterService || filterFeatured ? 'Try adjusting your filters' : 'Get started by adding your first gallery image'}
          </p>
          <Button
            type="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleAdd}
            style={{ background: '#1e3a8a' }}
          >
            Add Gallery Image
          </Button>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={handleCancel}
        title={modalMode === 'add' ? 'Add Gallery Item' : 'Edit Gallery Item'}
        size="md"
      >
        {renderForm()}
      </Modal>
    </div>
  );
}
