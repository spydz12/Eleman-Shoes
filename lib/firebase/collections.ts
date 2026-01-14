export const COLLECTIONS = {
  BRANDS: 'brands',
  DIVISIONS: 'divisions',
  CATEGORIES: 'categories',
  PRODUCTS: 'products',
  ORDERS: 'orders',
  CLIENTS: 'clients',
  INVOICES: 'invoices',
  SETTINGS: 'settings',
  LOGS: 'activity_logs',
} as const;

export const STORAGE_PATHS = {
  BRANDS: 'brands',
  PRODUCTS: 'products',
  INVOICES: 'invoices',
} as const;

export const DEFAULT_DIVISIONS = [
  { name: 'LEATHER', nameAr: 'جلد', slug: 'leather', order: 1 },
  { name: 'DRESS SHOES', nameAr: 'أحذية رسمية', slug: 'dress-shoes', order: 2 },
] as const;
