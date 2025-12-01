import { prisma } from "@/lib/prisma.js";
import { NotFoundError, ConflictError } from "@/utils/errors.js";

interface CreateCategoryInput {
  name: string;
  description?: string;
}

export async function createCategory(
  input: CreateCategoryInput
): Promise<any> {
  // Generate slug from name
  const slug = input.name.toLowerCase().replace(/\s+/g, "-");

  // Check if slug already exists
  const existingCategory = await prisma.category.findUnique({
    where: { slug },
  });

  if (existingCategory) {
    throw new ConflictError("Category with this name already exists");
  }

  const category = await prisma.category.create({
    data: {
      name: input.name,
      slug,
      description: input.description,
    },
  });

  return formatCategory(category);
}

export async function getCategories(): Promise<any[]> {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return categories.map(formatCategory);
}

export async function getCategoryBySlug(slug: string): Promise<any> {
  const category = await prisma.category.findUnique({
    where: { slug },
  });

  if (!category) {
    throw new NotFoundError("Category");
  }

  return formatCategory(category);
}

export async function getCategoryById(id: string): Promise<any> {
  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) {
    throw new NotFoundError("Category");
  }

  return formatCategory(category);
}

export async function updateCategory(id: string, input: CreateCategoryInput): Promise<any> {
  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) {
    throw new NotFoundError("Category");
  }

  // Check if new slug conflicts
  if (input.name && input.name !== category.name) {
    const newSlug = input.name.toLowerCase().replace(/\s+/g, "-");
    const existing = await prisma.category.findUnique({
      where: { slug: newSlug },
    });

    if (existing && existing.id !== id) {
      throw new ConflictError("Category with this name already exists");
    }
  }

  const updated = await prisma.category.update({
    where: { id },
    data: {
      ...(input.name && {
        name: input.name,
        slug: input.name.toLowerCase().replace(/\s+/g, "-"),
      }),
      ...(input.description && { description: input.description }),
    },
  });

  return formatCategory(updated);
}

export async function deleteCategory(id: string): Promise<void> {
  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) {
    throw new NotFoundError("Category");
  }

  await prisma.category.delete({
    where: { id },
  });
}

function formatCategory(category: any): any {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
  };
}
