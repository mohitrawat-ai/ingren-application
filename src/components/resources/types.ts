// Enhanced types.ts - Add more preview capabilities
import {
  Globe,
  FileText,
  Package,
  Image,
  Presentation,
} from 'lucide-react';

export interface ItemType {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
  examples: string[];
}

export interface ResourceItem {
  id: number;
  type: string;
  title: string;
  url: string;
  description: string | null;
  tags: string[];
  createdAt: string;
  isUploaded: boolean;
  fileType?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
}

export interface NewItemForm {
  type: string;
  title: string;
  url: string;
  description: string;
  tags: string;
  file?: File;
  isFileUpload: boolean;
}

export const itemTypes: ItemType[] = [
  {
    value: 'company',
    label: 'Company Info',
    icon: Globe,
    color: 'bg-blue-500 dark:bg-blue-600',
    description: 'About us, mission, team bios, company news',
    examples: ['About Us page', 'Leadership team', 'Company values', 'Press releases']
  },
  {
    value: 'blog',
    label: 'Blog Posts',
    icon: FileText,
    color: 'bg-green-500 dark:bg-green-600',
    description: 'Thought leadership, industry insights, expertise',
    examples: ['Industry insights', 'How-to guides', 'Company updates', 'Expert opinions']
  },
  {
    value: 'product',
    label: 'Products/Services',
    icon: Package,
    color: 'bg-purple-500 dark:bg-purple-600',
    description: 'Product pages, features, demos, documentation',
    examples: ['Product overview', 'Feature descriptions', 'Demo videos', 'Technical docs']
  },
  {
    value: 'pitch-deck',
    label: 'Presentations',
    icon: Presentation,
    color: 'bg-orange-500 dark:bg-orange-600',
    description: 'Pitch decks, investor materials, sales presentations',
    examples: ['Investor pitch', 'Sales deck', 'Company overview', 'Product presentations']
  },
  {
    value: 'marketing',
    label: 'Marketing Materials',
    icon: Image,
    color: 'bg-pink-500 dark:bg-pink-600',
    description: 'Case studies, testimonials, brand guidelines',
    examples: ['Customer case studies', 'Success stories', 'Brand assets', 'Testimonials']
  }
];

// Enhanced preview capabilities
export const getPreviewType = (item: ResourceItem): 'pdf' | 'ppt' | 'website' | 'none' => {
  // PDF files
  if (item.isUploaded && item.fileType?.includes('pdf')) {
    return 'pdf';
  }
  
  // PowerPoint files
  if (item.isUploaded && (
    item.fileType?.includes('presentation') || 
    item.fileType?.includes('powerpoint') ||
    item.url.includes('.ppt') ||
    item.url.includes('.pptx')
  )) {
    return 'ppt';
  }
  
  // Website URLs (company info, blog posts, etc.)
  if (!item.isUploaded && isValidUrl(item.url)) {
    return 'website';
  }
  
  return 'none';
};

export const canPreview = (item: ResourceItem): boolean => {
  return getPreviewType(item) !== 'none';
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return url.startsWith('http://') || url.startsWith('https://');
  } catch {
    return false;
  }
};

// Helper functions
export const getTypeConfig = (type: string): ItemType => {
  return itemTypes.find(t => t.value === type) || itemTypes[0];
};

export const getFileIcon = (fileType?: string | null, url?: string) => {
  if (!fileType && url) {
    if (url.includes('.pdf')) return '📄';
    if (url.includes('.ppt') || url.includes('.pptx')) return '📊';
    if (url.includes('.doc') || url.includes('.docx')) return '📝';
  }
  
  if (fileType?.includes('pdf')) return '📄';
  if (fileType?.includes('presentation') || fileType?.includes('powerpoint')) return '📊';
  if (fileType?.includes('word') || fileType?.includes('document')) return '📝';
  return '🔗';
};