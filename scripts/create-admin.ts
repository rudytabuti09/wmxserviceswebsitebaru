import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: "admin@wmx.com" }
    });

    if (existingAdmin) {
      // Update to ensure it's an admin
      await prisma.user.update({
        where: { email: "admin@wmx.com" },
        data: { 
          role: "ADMIN",
          name: "Admin User"
        }
      });
      console.log("✅ Admin user updated successfully!");
    } else {
      // Create new admin user
      await prisma.user.create({
        data: {
          email: "admin@wmx.com",
          name: "Admin User",
          role: "ADMIN"
        }
      });
      console.log("✅ Admin user created successfully!");
    }

    // Also create a test client user
    const existingClient = await prisma.user.findUnique({
      where: { email: "client@wmx.com" }
    });

    if (!existingClient) {
      await prisma.user.create({
        data: {
          email: "client@wmx.com",
          name: "Test Client",
          role: "CLIENT"
        }
      });
      console.log("✅ Client user created successfully!");
    }

    console.log("\n📋 Users in database:");
    const users = await prisma.user.findMany({
      select: {
        email: true,
        name: true,
        role: true
      }
    });
    
    users.forEach(user => {
      console.log(`   - ${user.email} (${user.role}): ${user.name}`);
    });

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
