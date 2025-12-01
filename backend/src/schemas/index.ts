import { z } from "zod";

// Auth Schemas
export const RegisterSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  phone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits"),
  role: z.enum(["BUYER", "SELLER"]).default("BUYER"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
});

export const RegisterRequestSchema = RegisterSchema.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  }
).omit({ confirmPassword: true });

export const LoginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

// Profile Schemas
export const UpdateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  phone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits").optional(),
});

// Category Schemas
export const CategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  description: z.string().optional(),
});

// Product Schemas
export const CreateProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Price must be a positive number",
  }),
  unit: z.string().min(1, "Unit is required"),
  categoryId: z.string().min(1, "Category is required"),
  stockQuantity: z.string().refine((val) => !isNaN(parseInt(val)) && parseInt(val) >= 0, {
    message: "Stock quantity must be a non-negative number",
  }),
});

export const UpdateProductSchema = CreateProductSchema.partial();

// Address Schemas
export const CreateAddressSchema = z.object({
  label: z.string().min(1, "Label is required"),
  line1: z.string().min(1, "Address line 1 is required"),
  line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits"),
  isDefault: z.boolean().optional().default(false),
});

export const UpdateAddressSchema = CreateAddressSchema.partial();

// Order Schemas
export const CreateOrderItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.string().refine((val) => !isNaN(parseInt(val)) && parseInt(val) > 0, {
    message: "Quantity must be a positive number",
  }),
});

export const CreateOrderSchema = z.object({
  items: z.array(CreateOrderItemSchema).min(1, "At least one item is required"),
  addressId: z.string().min(1, "Address is required"),
});

export const UpdateOrderStatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"]),
});

// Support Ticket Schemas
export const CreateSupportTicketSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  description: z.string().min(1, "Description is required"),
});

export const UpdateSupportTicketSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]),
});

export const CreateSupportMessageSchema = z.object({
  message: z.string().min(1, "Message is required"),
});

// Query Schemas
export const PaginationSchema = z.object({
  page: z.string().refine((val) => !isNaN(parseInt(val)) && parseInt(val) > 0, {
    message: "Page must be a positive number",
  }).optional().default("1"),
  limit: z.string().refine((val) => !isNaN(parseInt(val)) && parseInt(val) > 0, {
    message: "Limit must be a positive number",
  }).optional().default("10"),
});

export const ProductsQuerySchema = PaginationSchema.extend({
  search: z.string().optional(),
  categorySlug: z.string().optional(),
});

// Type exports
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type LoginRequest = z.infer<typeof LoginSchema>;
export type UpdateProfileRequest = z.infer<typeof UpdateProfileSchema>;
export type CreateProductRequest = z.infer<typeof CreateProductSchema>;
export type UpdateProductRequest = z.infer<typeof UpdateProductSchema>;
export type CreateAddressRequest = z.infer<typeof CreateAddressSchema>;
export type UpdateAddressRequest = z.infer<typeof UpdateAddressSchema>;
export type CreateOrderRequest = z.infer<typeof CreateOrderSchema>;
export type UpdateOrderStatusRequest = z.infer<typeof UpdateOrderStatusSchema>;
export type CreateSupportTicketRequest = z.infer<typeof CreateSupportTicketSchema>;
export type UpdateSupportTicketRequest = z.infer<typeof UpdateSupportTicketSchema>;
export type CreateSupportMessageRequest = z.infer<typeof CreateSupportMessageSchema>;
