import { useState } from 'react';
import { Search, X } from 'lucide-react';
import * as Icons from 'lucide-react';
import { availableIcons, searchIcons, getIconCategories } from '../../../data/icons';

interface IconPickerProps {
  selectedIcon: string;
  onSelect: (iconName: string) => void;
  onClose?: () => void;
}

export function IconPicker({ selectedIcon, onSelect, onClose }: IconPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...getIconCategories()];
  const filteredIcons = searchQuery
    ? searchIcons(searchQuery)
    : selectedCategory === 'All'
    ? availableIcons
    : availableIcons.filter(icon => icon.category === selectedCategory);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>
          Select Icon
        </h3>
        {onClose && (
          <button onClick={onClose} className="p-1 hover:opacity-70" style={{ color: 'var(--text-secondary)' }}>
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Search icons..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border"
          style={{
            background: 'var(--input-bg)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-primary)',
          }}
        />
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map(category => (
          <button
            key={category}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedCategory(category);
            }}
            className="px-3 py-1 rounded-full text-sm transition-colors cursor-pointer"
            style={{
              background: selectedCategory === category ? 'var(--brand-primary)' : 'var(--section-bg-light)',
              color: selectedCategory === category ? 'var(--text-inverse)' : 'var(--text-secondary)',
            }}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Icons Grid */}
      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 max-h-96 overflow-y-auto">
        {filteredIcons.map(iconData => {
          const IconComponent = Icons[iconData.name as keyof typeof Icons] as any;
          if (!IconComponent) return null;

          const isSelected = selectedIcon === iconData.name;
          return (
            <button
              key={iconData.name}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(iconData.name);
              }}
              className="p-3 rounded-lg transition-all hover:scale-110 cursor-pointer"
              style={{
                background: isSelected ? 'var(--brand-primary)' : 'var(--section-bg-light)',
                color: isSelected ? 'var(--text-inverse)' : 'var(--text-secondary)',
                border: isSelected ? '2px solid var(--brand-primary)' : '2px solid transparent',
              }}
              title={iconData.name}
            >
              <IconComponent className="w-6 h-6 mx-auto" />
            </button>
          );
        })}
      </div>

      {filteredIcons.length === 0 && (
        <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
          No icons found
        </div>
      )}
    </div>
  );
}
