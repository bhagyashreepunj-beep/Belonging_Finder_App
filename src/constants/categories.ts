export interface CategoryOption {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export const DEFAULT_CATEGORIES: CategoryOption[] = [
  { id: 'documents', name: 'Documents & Papers', icon: 'file-text', color: '#2563EB' },
  { id: 'electronics', name: 'Electronics & Gadgets', icon: 'smartphone', color: '#7C3AED' },
  { id: 'keys', name: 'Keys & Access Cards', icon: 'key', color: '#F59E0B' },
  { id: 'jewelry', name: 'Jewellery & Valuables', icon: 'gem', color: '#EC4899' },
  { id: 'clothing', name: 'Clothing & Accessories', icon: 'shirt', color: '#06B6D4' },
  { id: 'tools', name: 'Tools & Hardware', icon: 'wrench', color: '#64748B' },
  { id: 'medicine', name: 'Medical & Healthcare', icon: 'heart', color: '#EF4444' },
  { id: 'household', name: 'Household & Kitchen', icon: 'home', color: '#10B981' },
  { id: 'other', name: 'Other Belongings', icon: 'box', color: '#8B5CF6' },
];
