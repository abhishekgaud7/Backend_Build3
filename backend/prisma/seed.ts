import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Clear existing data (for development only)
  await prisma.supportMessage.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.address.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const buyer = await prisma.user.create({
    data: {
      name: "Test Buyer",
      email: "buyer@example.com",
      phone: "9876543210",
      role: "BUYER",
    },
  });

  const seller = await prisma.user.create({
    data: {
      name: "Test Seller",
      email: "seller@example.com",
      phone: "9876543211",
      role: "SELLER",
    },
  });

  const admin = await prisma.user.create({
    data: {
      name: "Test Admin",
      email: "admin@example.com",
      phone: "9876543212",
      role: "ADMIN",
    },
  });

  console.log("✅ Created test users (use Supabase auth to sign in):");
  console.log(`   Buyer: buyer@example.com`);
  console.log(`   Seller: seller@example.com`);
  console.log(`   Admin: admin@example.com`);

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "Cement",
        slug: "cement",
        description: "Portland cement and cement products",
      },
    }),
    prisma.category.create({
      data: {
        name: "Steel",
        slug: "steel",
        description: "Steel bars, rods, and structural steel",
      },
    }),
    prisma.category.create({
      data: {
        name: "Sand & Aggregates",
        slug: "sand-aggregates",
        description: "Sand, gravel, and aggregate materials",
      },
    }),
    prisma.category.create({
      data: {
        name: "Bricks & Blocks",
        slug: "bricks-blocks",
        description: "Bricks, blocks, and masonry materials",
      },
    }),
  ]);

  console.log("✅ Created 4 categories");

  // Create sample products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: "Portland Cement 50kg",
        slug: "portland-cement-50kg",
        description: "High-quality Portland cement suitable for construction",
        price: "500.00",
        unit: "bag",
        categoryId: categories[0].id,
        sellerId: seller.id,
        stockQuantity: 500,
      },
    }),
    prisma.product.create({
      data: {
        name: "Steel TMT Bar 16mm",
        slug: "steel-tmt-bar-16mm",
        description: "Thermo-mechanically treated steel bars",
        price: "650.00",
        unit: "piece",
        categoryId: categories[1].id,
        sellerId: seller.id,
        stockQuantity: 200,
      },
    }),
    prisma.product.create({
      data: {
        name: "River Sand",
        slug: "river-sand",
        description: "High-quality river sand for construction",
        price: "100.00",
        unit: "ton",
        categoryId: categories[2].id,
        sellerId: seller.id,
        stockQuantity: 1000,
      },
    }),
    prisma.product.create({
      data: {
        name: "Red Bricks",
        slug: "red-bricks",
        description: "Standard red bricks for walls",
        price: "0.50",
        unit: "piece",
        categoryId: categories[3].id,
        sellerId: seller.id,
        stockQuantity: 5000,
      },
    }),
  ]);

  console.log("✅ Created 4 sample products");

  // Create a sample address
  const address = await prisma.address.create({
    data: {
      userId: buyer.id,
      label: "Home",
      line1: "123 Main Street",
      city: "Gwalior",
      state: "MP",
      pincode: "474001",
      isDefault: true,
    },
  });

  console.log("✅ Created sample address");

  // Create a sample order
  const order = await prisma.order.create({
    data: {
      userId: buyer.id,
      addressId: address.id,
      subtotal: 1000,
      tax: 50,
      deliveryFee: 50,
      total: 1100,
      items: {
        create: [
          {
            productId: products[0].id,
            quantity: 2,
            unitPrice: 500,
            lineTotal: 1000,
          },
        ],
      },
    },
  });

  console.log("✅ Created sample order");

  console.log("\n🎉 Database seed completed successfully!");
  console.log("\nYou can now login with:");
  console.log("  Buyer: buyer@example.com / TestBuyer123");
  console.log("  Seller: seller@example.com / TestSeller123");
  console.log("  Admin: admin@example.com / TestAdmin123");
}

main()
  .catch((error) => {
    console.error("❌ Seed error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
