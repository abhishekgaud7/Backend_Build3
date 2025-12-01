import { prisma } from "@/lib/prisma.js";
import { NotFoundError, AuthorizationError } from "@/utils/errors.js";
import type { ProductResponse } from "@/types/index.js";
import type { Decimal } from "@prisma/client/runtime/library";

interface CreateProductInput {
  name: string;
  description: string;
  price: string;
  unit: string;
  categoryId: string;
  stockQuantity: string;
}

interface UpdateProductInput {
  name?: string;
  description?: string;
  price?: string;
  unit?: string;
  categoryId?: string;
  stockQuantity?: string;
}

export async function createProduct(
  sellerId: string,
  input: CreateProductInput
): Promise<ProductResponse> {
  // Generate slug from name
  const slug = input.name.toLowerCase().replace(/\s+/g, "-") + `-${Date.now()}`;

  const product = await prisma.product.create({
    data: {
      name: input.name,
      slug,
      description: input.description,
      price: parseFloat(input.price),
      unit: input.unit,
      categoryId: input.categoryId,
      sellerId,
      stockQuantity: parseInt(input.stockQuantity),
    },
  });

  return formatProduct(product);
}

export async function updateProduct(
  productId: string,
  sellerId: string,
  role: string,
  input: UpdateProductInput
): Promise<ProductResponse> {
  // Check ownership
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new NotFoundError("Product");
  }

  if (role !== "ADMIN" && product.sellerId !== sellerId) {
    throw new AuthorizationError("You can only update your own products");
  }

  const updated = await prisma.product.update({
    where: { id: productId },
    data: {
      ...(input.name && { name: input.name }),
      ...(input.description && { description: input.description }),
      ...(input.price && { price: parseFloat(input.price) }),
      ...(input.unit && { unit: input.unit }),
      ...(input.categoryId && { categoryId: input.categoryId }),
      ...(input.stockQuantity && {
        stockQuantity: parseInt(input.stockQuantity),
      }),
    },
  });

  return formatProduct(updated);
}

export async function deleteProduct(
  productId: string,
  sellerId: string,
  role: string
): Promise<void> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new NotFoundError("Product");
  }

  if (role !== "ADMIN" && product.sellerId !== sellerId) {
    throw new AuthorizationError("You can only delete your own products");
  }

  await prisma.product.update({
    where: { id: productId },
    data: { isActive: false },
  });
}

export async function getProduct(productId: string): Promise<ProductResponse> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new NotFoundError("Product");
  }

  return formatProduct(product);
}

export async function getProducts(
  searchTerm?: string,
  categorySlug?: string,
  page: number = 1,
  limit: number = 10
): Promise<{ products: ProductResponse[]; total: number }> {
  const skip = (page - 1) * limit;

  const where: any = {
    isActive: true,
  };

  if (searchTerm) {
    where.name = {
      contains: searchTerm,
      mode: "insensitive",
    };
  }

  if (categorySlug) {
    where.category = {
      slug: categorySlug,
    };
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products: products.map(formatProduct),
    total,
  };
}

export async function getSellerProducts(
  sellerId: string,
  page: number = 1,
  limit: number = 10
): Promise<{ products: ProductResponse[]; total: number }> {
  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: { sellerId },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.count({ where: { sellerId } }),
  ]);

  return {
    products: products.map(formatProduct),
    total,
  };
}

function formatProduct(product: any): ProductResponse {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price.toString(),
    unit: product.unit,
    categoryId: product.categoryId,
    sellerId: product.sellerId,
    stockQuantity: product.stockQuantity,
    isActive: product.isActive,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}
