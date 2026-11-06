// Available icons for portfolio items
// Using lucide-react icon names

export const availableIcons = [
  // Construction & Building
  { name: 'Building', category: 'Construction', keywords: ['office', 'building', 'structure'] },
  { name: 'Building2', category: 'Construction', keywords: ['building', 'office', 'commercial'] },
  { name: 'Home', category: 'Construction', keywords: ['house', 'home', 'residential'] },
  { name: 'Warehouse', category: 'Construction', keywords: ['warehouse', 'storage', 'industrial'] },
  { name: 'Factory', category: 'Construction', keywords: ['factory', 'manufacturing', 'industrial'] },
  { name: 'Hammer', category: 'Construction', keywords: ['tool', 'construction', 'build'] },
  { name: 'Wrench', category: 'Construction', keywords: ['tool', 'fix', 'maintenance'] },
  { name: 'HardHat', category: 'Construction', keywords: ['safety', 'construction', 'worker'] },
  { name: 'Ruler', category: 'Construction', keywords: ['measure', 'plan', 'design'] },
  { name: 'PaintBucket', category: 'Construction', keywords: ['paint', 'renovation', 'interior'] },

  // Technology & Software
  { name: 'Code', category: 'Software', keywords: ['code', 'development', 'programming'] },
  { name: 'Code2', category: 'Software', keywords: ['code', 'html', 'development'] },
  { name: 'Laptop', category: 'Software', keywords: ['computer', 'laptop', 'device'] },
  { name: 'Monitor', category: 'Software', keywords: ['screen', 'display', 'desktop'] },
  { name: 'Smartphone', category: 'Software', keywords: ['mobile', 'phone', 'app'] },
  { name: 'Tablet', category: 'Software', keywords: ['tablet', 'device', 'mobile'] },
  { name: 'Database', category: 'Software', keywords: ['database', 'storage', 'data'] },
  { name: 'Server', category: 'Software', keywords: ['server', 'hosting', 'cloud'] },
  { name: 'Cloud', category: 'Software', keywords: ['cloud', 'storage', 'hosting'] },
  { name: 'Wifi', category: 'Software', keywords: ['network', 'wireless', 'internet'] },
  { name: 'Globe', category: 'Software', keywords: ['web', 'internet', 'global'] },
  { name: 'Layout', category: 'Software', keywords: ['design', 'ui', 'interface'] },
  { name: 'Palette', category: 'Software', keywords: ['design', 'color', 'branding'] },
  { name: 'Boxes', category: 'Software', keywords: ['components', 'modules', 'package'] },
  { name: 'Package', category: 'Software', keywords: ['package', 'deployment', 'product'] },
  { name: 'ShoppingCart', category: 'Software', keywords: ['ecommerce', 'shop', 'cart'] },
  { name: 'Store', category: 'Software', keywords: ['shop', 'retail', 'ecommerce'] },
  { name: 'CreditCard', category: 'Software', keywords: ['payment', 'transaction', 'finance'] },
  { name: 'DollarSign', category: 'Software', keywords: ['money', 'finance', 'payment'] },
  { name: 'TrendingUp', category: 'Software', keywords: ['analytics', 'growth', 'chart'] },
  { name: 'BarChart', category: 'Software', keywords: ['chart', 'analytics', 'data'] },
  { name: 'PieChart', category: 'Software', keywords: ['chart', 'analytics', 'statistics'] },
  { name: 'Activity', category: 'Software', keywords: ['analytics', 'monitoring', 'metrics'] },
  { name: 'Zap', category: 'Software', keywords: ['fast', 'performance', 'speed'] },
  { name: 'Cpu', category: 'Software', keywords: ['processor', 'computing', 'performance'] },
  { name: 'HardDrive', category: 'Software', keywords: ['storage', 'disk', 'data'] },
  { name: 'Lock', category: 'Software', keywords: ['security', 'privacy', 'encryption'] },
  { name: 'Shield', category: 'Software', keywords: ['security', 'protection', 'safe'] },
  { name: 'Key', category: 'Software', keywords: ['access', 'security', 'password'] },
  { name: 'Users', category: 'Software', keywords: ['team', 'people', 'collaboration'] },
  { name: 'UserCheck', category: 'Software', keywords: ['user', 'verification', 'approved'] },
  { name: 'Mail', category: 'Software', keywords: ['email', 'message', 'communication'] },
  { name: 'MessageSquare', category: 'Software', keywords: ['chat', 'message', 'communication'] },
  { name: 'Bell', category: 'Software', keywords: ['notification', 'alert', 'reminder'] },
  { name: 'Calendar', category: 'Software', keywords: ['schedule', 'date', 'time'] },
  { name: 'Clock', category: 'Software', keywords: ['time', 'schedule', 'duration'] },
  { name: 'Settings', category: 'Software', keywords: ['config', 'preferences', 'options'] },
  { name: 'Sliders', category: 'Software', keywords: ['controls', 'settings', 'adjust'] },
  { name: 'FileText', category: 'Software', keywords: ['document', 'file', 'text'] },
  { name: 'Folder', category: 'Software', keywords: ['directory', 'files', 'storage'] },
  { name: 'Search', category: 'Software', keywords: ['find', 'lookup', 'query'] },
  { name: 'Filter', category: 'Software', keywords: ['sort', 'organize', 'refine'] },

  // Healthcare (if needed)
  { name: 'Stethoscope', category: 'Healthcare', keywords: ['medical', 'health', 'doctor'] },
  { name: 'Heart', category: 'Healthcare', keywords: ['health', 'medical', 'care'] },
  { name: 'Pill', category: 'Healthcare', keywords: ['medicine', 'pharmacy', 'health'] },

  // General
  { name: 'Star', category: 'General', keywords: ['featured', 'favorite', 'rating'] },
  { name: 'Award', category: 'General', keywords: ['achievement', 'success', 'quality'] },
  { name: 'Target', category: 'General', keywords: ['goal', 'objective', 'aim'] },
  { name: 'CheckCircle', category: 'General', keywords: ['complete', 'done', 'success'] },
  { name: 'Flag', category: 'General', keywords: ['milestone', 'marker', 'goal'] },
  { name: 'Bookmark', category: 'General', keywords: ['save', 'mark', 'favorite'] },
  { name: 'Briefcase', category: 'General', keywords: ['business', 'work', 'professional'] },
  { name: 'Lightbulb', category: 'General', keywords: ['idea', 'innovation', 'solution'] },
  { name: 'Rocket', category: 'General', keywords: ['launch', 'startup', 'growth'] },
];

export const searchIcons = (query: string): typeof availableIcons => {
  const lowerQuery = query.toLowerCase();
  return availableIcons.filter(
    icon =>
      icon.name.toLowerCase().includes(lowerQuery) ||
      icon.category.toLowerCase().includes(lowerQuery) ||
      icon.keywords.some(keyword => keyword.includes(lowerQuery))
  );
};

export const getIconsByCategory = (category: string): typeof availableIcons => {
  return availableIcons.filter(icon => icon.category === category);
};

export const getIconCategories = (): string[] => {
  return Array.from(new Set(availableIcons.map(icon => icon.category)));
};
