import { prisma } from "@/lib/prisma.js";
import { NotFoundError, AuthorizationError, ValidationError } from "@/utils/errors.js";
import type { OrderResponse, OrderItemResponse } from "@/types/index.js";

interface OrderItemInput {
  productId: string;
  quantity: number;
}

interface CreateOrderInput {
  items: OrderItemInput[];
  addressId: string;
}

const TAX_PERCENTAGE = 0.05; // 5% tax
const DELIVERY_FEE = 50; // Fixed delivery fee

export async function createOrder(
  userId: string,
  input: CreateOrderInput
): Promise<OrderResponse> {
  // Verify address belongs to user
  const address = await prisma.address.findUnique({
    where: { id: input.addressId },
  });

  if (!address || address.userId !== userId) {
    throw new NotFoundError("Address");
  }

  // Verify all products exist and get their prices
  const productIds = input.items.map((item) => item.productId);
  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
      isActive: true,
    },
  });

  if (products.length !== productIds.length) {
    throw new ValidationError("One or more products are not available");
  }

  // Create a map of products by ID for easy lookup
  const productMap = new Map(products.map((p) => [p.id, p]));

  // Calculate totals
  let subtotal = 0;
  const orderItems: any[] = [];

  for (const item of input.items) {
    const product = productMap.get(item.productId);
    if (!product) {
      throw new ValidationError(`Product ${item.productId} not found`);
    }

    const lineTotal = product.price * item.quantity;
    subtotal += lineTotal;

    orderItems.push({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: product.price,
      lineTotal,
    });
  }

  const tax = subtotal * TAX_PERCENTAGE;
  const total = subtotal + tax + DELIVERY_FEE;

  // Create order with items in a transaction
  const order = await prisma.order.create({
    data: {
      userId,
      addressId,
      subtotal,
      tax,
      deliveryFee: DELIVERY_FEE,
      total,
      items: {
        create: orderItems,
      },
    },
    include: {
      items: true,
    },
  });

  return formatOrder(order);
}

export async function getOrder(
  orderId: string,
  userId: string,
  role: string
): Promise<OrderResponse> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) {
    throw new NotFoundError("Order");
  }

  // Check authorization
  if (role !== "ADMIN" && order.userId !== userId) {
    throw new AuthorizationError("You can only view your own orders");
  }

  return formatOrder(order);
}

export async function getUserOrders(
  userId: string,
  page: number = 1,
  limit: number = 10
): Promise<{ orders: OrderResponse[]; total: number }> {
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { userId },
      include: { items: true },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.count({ where: { userId } }),
  ]);

  return {
    orders: orders.map(formatOrder),
    total,
  };
}

export async function getAllOrders(
  page: number = 1,
  limit: number = 10
): Promise<{ orders: OrderResponse[]; total: number }> {
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      include: { items: true },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.count(),
  ]);

  return {
    orders: orders.map(formatOrder),
    total,
  };
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: string,
  role: string
): Promise<OrderResponse> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) {
    throw new NotFoundError("Order");
  }

  // Only admin and sellers can update status
  if (role !== "ADMIN" && role !== "SELLER") {
    throw new AuthorizationError("Only admin and sellers can update order status");
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status: newStatus },
    include: { items: true },
  });

  return formatOrder(updated);
}

function formatOrder(order: any): OrderResponse {
  return {
    id: order.id,
    userId: order.userId,
    status: order.status,
    subtotal: order.subtotal.toString(),
    tax: order.tax.toString(),
    deliveryFee: order.deliveryFee.toString(),
    total: order.total.toString(),
    addressId: order.addressId,
    items: order.items.map((item: any) => formatOrderItem(item)),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}

function formatOrderItem(item: any): OrderItemResponse {
  return {
    id: item.id,
    productId: item.productId,
    quantity: item.quantity,
    unitPrice: item.unitPrice.toString(),
    lineTotal: item.lineTotal.toString(),
  };
}
