import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // List of admin emails - add your email here
  const adminEmails = [
    'tsagabbinary@gmail.com', // Ganti dengan email GitHub Anda
    // Add more admin emails as needed
  ];

  console.log('🌱 Starting seed...');

  for (const email of adminEmails) {
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        role: 'ADMIN',
      },
      create: {
        email,
        name: 'Admin User',
        role: 'ADMIN',
      },
    });

    console.log(`✅ Admin user created/updated: ${user.email}`);
  }

  console.log('🌱 Seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
