import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixAdminRole() {
  try {
    console.log("🔧 Memperbaiki admin role...");
    
    // Admin emails yang harus dipastikan adalah ADMIN
    const adminEmails = [
      'tsagabbinary@gmail.com',
      // Tambahkan email admin lain di sini jika perlu
    ];

    console.log("📋 Admin emails yang akan diperbaiki:", adminEmails);

    for (const email of adminEmails) {
      // Cari user berdasarkan email
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (user) {
        if (user.role !== 'ADMIN') {
          console.log(`⬆️ Promoting ${email} dari ${user.role} ke ADMIN...`);
          
          await prisma.user.update({
            where: { id: user.id },
            data: { 
              role: 'ADMIN',
              updatedAt: new Date(),
            },
          });
          
          console.log(`✅ ${email} berhasil dipromosikan ke ADMIN`);
        } else {
          console.log(`✅ ${email} sudah ADMIN`);
        }
      } else {
        console.log(`❌ User dengan email ${email} tidak ditemukan di database`);
        console.log(`💡 Pastikan user sudah pernah login minimal sekali`);
      }
    }

    // Tampilkan semua users dan roles mereka
    console.log("\n📊 Daftar semua users dan roles:");
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    allUsers.forEach((user, index) => {
      const roleEmoji = user.role === 'ADMIN' ? '🔑' : '👤';
      console.log(`${index + 1}. ${roleEmoji} ${user.email} (${user.role}) - ${user.name || 'No name'}`);
      console.log(`   Created: ${user.createdAt.toISOString()}`);
      console.log(`   Updated: ${user.updatedAt.toISOString()}`);
      console.log('');
    });

    // Hitung statistik
    const totalUsers = allUsers.length;
    const adminCount = allUsers.filter(u => u.role === 'ADMIN').length;
    const clientCount = allUsers.filter(u => u.role === 'CLIENT').length;

    console.log("📈 Statistik:");
    console.log(`   Total users: ${totalUsers}`);
    console.log(`   Admins: ${adminCount}`);
    console.log(`   Clients: ${clientCount}`);

    if (adminCount === 0) {
      console.log("\n⚠️  PERINGATAN: Tidak ada admin di sistem!");
      console.log("💡 Jalankan: npm run db:seed untuk membuat admin");
    }

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Jalankan script
fixAdminRole();
