import { prisma } from "@/lib/prisma.js";
import { NotFoundError, AuthorizationError } from "@/utils/errors.js";
import type { AddressResponse } from "@/types/index.js";

interface CreateAddressInput {
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

interface UpdateAddressInput {
  label?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  isDefault?: boolean;
}

export async function createAddress(
  userId: string,
  input: CreateAddressInput
): Promise<AddressResponse> {
  // If this is default, unset other defaults
  if (input.isDefault) {
    await prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.create({
    data: {
      userId,
      ...input,
    },
  });

  return formatAddress(address);
}

export async function getAddress(
  addressId: string,
  userId: string
): Promise<AddressResponse> {
  const address = await prisma.address.findUnique({
    where: { id: addressId },
  });

  if (!address) {
    throw new NotFoundError("Address");
  }

  if (address.userId !== userId) {
    throw new AuthorizationError("You can only view your own addresses");
  }

  return formatAddress(address);
}

export async function getUserAddresses(userId: string): Promise<AddressResponse[]> {
  const addresses = await prisma.address.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return addresses.map(formatAddress);
}

export async function updateAddress(
  addressId: string,
  userId: string,
  input: UpdateAddressInput
): Promise<AddressResponse> {
  const address = await prisma.address.findUnique({
    where: { id: addressId },
  });

  if (!address) {
    throw new NotFoundError("Address");
  }

  if (address.userId !== userId) {
    throw new AuthorizationError("You can only update your own addresses");
  }

  // If setting as default, unset others
  if (input.isDefault) {
    await prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });
  }

  const updated = await prisma.address.update({
    where: { id: addressId },
    data: input,
  });

  return formatAddress(updated);
}

export async function deleteAddress(
  addressId: string,
  userId: string
): Promise<void> {
  const address = await prisma.address.findUnique({
    where: { id: addressId },
  });

  if (!address) {
    throw new NotFoundError("Address");
  }

  if (address.userId !== userId) {
    throw new AuthorizationError("You can only delete your own addresses");
  }

  // Check if address is used in any orders
  const orderCount = await prisma.order.count({
    where: { addressId },
  });

  if (orderCount > 0) {
    throw new AuthorizationError(
      "Cannot delete address that is used in orders"
    );
  }

  await prisma.address.delete({
    where: { id: addressId },
  });
}

function formatAddress(address: any): AddressResponse {
  return {
    id: address.id,
    label: address.label,
    line1: address.line1,
    line2: address.line2,
    city: address.city,
    state: address.state,
    pincode: address.pincode,
    isDefault: address.isDefault,
    createdAt: address.createdAt.toISOString(),
    updatedAt: address.updatedAt.toISOString(),
  };
}
