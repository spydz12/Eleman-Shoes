import { Timestamp } from 'firebase/firestore';

export interface Brand {
  id: string;
  name: string;
  nameAr: string;
  description?: string;
  descriptionAr?: string;
  logo?: string;
  status: 'active' | 'disabled';
  whatsappNumber?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Division {
  id: string;
  name: string;
  nameAr: string;
  slug: string;
  order: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Category {
  id: string;
  name: string;
  nameAr: string;
  divisionId: string;
  slug: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ColorVariant {
  name: string;
  nameAr: string;
  hexCode?: string;
  images: string[];
  mainImageIndex: number;
}

export interface Product {
  id: string;
  brand: 'edos' | 'eleman';
  category?: string;
  reference: string;
  nameFr: string;
  descriptionFr?: string;
  status: 'active' | 'hidden';
  colorVariants: ColorVariant[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface OrderItem {
  productId: string;
  referenceCode: string;
  nameFr: string;
  nameAr: string;
  quantity: number;
  image?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  companyName: string;
  country: string;
  whatsappNumber: string;
  email?: string;
  items: OrderItem[];
  notes?: string;
  status: 'pending' | 'preparing' | 'shipped' | 'completed';
  shippingCountry?: string;
  shippingMethod?: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
  deliveryNotes?: string;
  internalNotes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Client {
  id: string;
  companyName: string;
  country: string;
  whatsappNumber: string;
  email?: string;
  totalOrders: number;
  lastOrderDate?: Timestamp;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  clientId: string;
  brandId: string;
  items: OrderItem[];
  pdfUrl?: string;
  status: 'draft' | 'sent' | 'paid';
  createdAt: Timestamp;
  sentAt?: Timestamp;
}

export interface Settings {
  id: string;
  groupName: string;
  groupNameAr: string;
  primaryWhatsapp: string;
  primaryEmail: string;
  edosFootwearLogo?: string;
  elemanShoesLogo?: string;
  heroImageUrl?: string;
  themeColor?: string;
  updatedAt: Timestamp;
}

export interface ActivityLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  entityType: 'product' | 'order' | 'brand' | 'settings' | 'invoice';
  entityId?: string;
  details?: string;
  timestamp: Timestamp;
}
