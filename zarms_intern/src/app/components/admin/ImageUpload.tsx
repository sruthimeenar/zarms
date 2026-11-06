import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { validateImageFile } from '../../../data/validation';
import { uploadImage, uploadImages } from '../../../data/uploadService';

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  label?: string;
  helpText?: string;
  uploadType?: 'gallery' | 'portfolio' | 'profile' | 'general';
  deferUpload?: boolean;
  pendingFiles?: File[];
  onPendingFilesChange?: (files: File[]) => void;
}

export function ImageUpload({
  images,
  onChange,
  maxImages = 5,
  label,
  helpText,
  uploadType = 'general',
  deferUpload = false,
  pendingFiles = [],
  onPendingFilesChange
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // Check if adding all files would exceed maxImages
    if (images.length + files.length > maxImages) {
      setError(`Can only add ${maxImages - images.length} more image(s)`);
      return;
    }

    setError('');
    setUploading(true);

    try {
      // Validate all files first
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const validation = validateImageFile(file);

        if (!validation.isValid) {
          setError(validation.errors[0]?.message || 'Invalid file');
          setUploading(false);
          return;
        }
      }

      console.log('Uploading', files.length, 'files as', uploadType);

      if (deferUpload) {
        const selectedFiles = Array.from(files);
        const previewUrls = selectedFiles.map((file) => URL.createObjectURL(file));
        onPendingFilesChange?.([...pendingFiles, ...selectedFiles]);
        onChange([...images, ...previewUrls]);
      } else {
        // Upload files to server
        const uploadResults = await uploadImages(
          Array.from(files),
          uploadType,
          maxImages
        );

        console.log('Upload results:', uploadResults);

        // Check if any uploads failed
        const failedUploads = uploadResults.filter(r => !r.success);
        if (failedUploads.length > 0) {
          const errorMsg = failedUploads[0]?.error || 'Some images failed to upload';
          console.error('Upload failed:', errorMsg);
          setError(errorMsg);
          return;
        }

        // Add successful uploads to images list
        const newUrls = uploadResults
          .filter(r => r.success && r.url)
          .map(r => r.url!);

        console.log('Successfully uploaded:', newUrls.length, 'images');
        onChange([...images, ...newUrls]);
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const removeImage = (index: number) => {
    const currentImage = images[index];
    if (currentImage?.startsWith('blob:')) {
      URL.revokeObjectURL(currentImage);
    }
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
    if (deferUpload && onPendingFilesChange) {
      const newPendingFiles = pendingFiles.filter((_, i) => i !== index);
      onPendingFilesChange(newPendingFiles);
    }
    setError('');
  };

  return (
    <div className="space-y-3">
      {label && (
        <label className="block font-medium" style={{ color: 'var(--text-primary)' }}>
          {label}
        </label>
      )}

      {/* Uploaded Images */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((img, index) => (
            <div key={index} className="relative group">
              <img
                src={img}
                alt={`Upload ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
                style={{ border: '1px solid var(--border-color)' }}
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                style={{ background: 'rgba(0, 0, 0, 0.7)', color: 'white' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {images.length < maxImages && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
            dragActive ? 'border-blue-500 bg-blue-50' : ''
          } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          style={{
            borderColor: dragActive ? 'var(--brand-primary)' : 'var(--border-color)',
            background: dragActive ? 'var(--section-bg-light)' : 'transparent',
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            onChange={handleFileInput}
            className="hidden"
            disabled={uploading}
          />
          <div className="flex flex-col items-center gap-2">
            {uploading ? (
              <Loader2 className="w-12 h-12 animate-spin" style={{ color: 'var(--brand-primary)' }} />
            ) : dragActive ? (
              <Upload className="w-12 h-12" style={{ color: 'var(--brand-primary)' }} />
            ) : (
              <ImageIcon className="w-12 h-12" style={{ color: 'var(--text-muted)' }} />
            )}
            <div>
              <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                {uploading
                  ? 'Uploading...'
                  : dragActive
                  ? 'Drop images here'
                  : `Click to upload ${maxImages > 1 ? 'multiple images' : 'an image'} or drag and drop`}
              </p>
              {helpText && (
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                  {helpText}
                </p>
              )}
              {maxImages > 1 && !uploading && (
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  You can select up to {maxImages} images at once
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-sm" style={{ color: 'var(--error)' }}>
          {error}
        </p>
      )}

      {/* Image Count */}
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
        {images.length} / {maxImages} images uploaded
      </p>
    </div>
  );
}
