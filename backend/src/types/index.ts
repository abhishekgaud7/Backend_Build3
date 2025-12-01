import type { Request } from "express";

export interface AuthUser {
  id: string;
  email: string;
  role: "BUYER" | "SELLER" | "ADMIN";
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  createdAt: string;
}

export interface ProductResponse {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  unit: string;
  categoryId: string;
  sellerId: string;
  stockQuantity: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderResponse {
  id: string;
  userId: string;
  status: string;
  subtotal: string;
  tax: string;
  deliveryFee: string;
  total: string;
  addressId: string;
  items: OrderItemResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItemResponse {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: string;
  lineTotal: string;
}

export interface AddressResponse {
  id: string;
  label: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SupportTicketResponse {
  id: string;
  userId: string;
  subject: string;
  description: string;
  status: string;
  messages?: SupportMessageResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface SupportMessageResponse {
  id: string;
  ticketId: string;
  senderType: string;
  message: string;
  createdAt: string;
}
