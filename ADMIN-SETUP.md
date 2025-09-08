# Admin Setup Guide

## Cara Membuat Admin User

Ada beberapa cara untuk setup admin di aplikasi ini:

### 1. Database Seed (Recommended untuk Admin Pertama)

1. Edit file `prisma/seed.ts` dan tambahkan email GitHub Anda:
```typescript
const adminEmails = [
  'your-github-email@example.com', // Ganti dengan email GitHub Anda
];
```

2. Jalankan seed command:
```bash
npm run db:seed
```

### 2. Manual Database Update

Jika sudah ada user yang login dengan GitHub, update role-nya menjadi ADMIN:

```bash
# Menggunakan Prisma Studio
npx prisma studio

# Atau menggunakan SQL langsung (PostgreSQL)
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your-email@example.com';
```

### 3. Environment Variable (Alternative)

Tambahkan di `.env.local`:
```env
# Comma-separated list of admin emails
ADMIN_EMAILS=admin1@example.com,admin2@example.com
```

Kemudian modifikasi `src/lib/auth.ts` untuk auto-promote admin berdasarkan email.

### 4. Admin Management UI

Setelah ada minimal 1 admin, admin bisa:
1. Login ke aplikasi
2. Pergi ke `/admin/users`
3. Promote user lain menjadi admin
4. Demote admin lain menjadi client

## Security Notes

### Role-Based Access Control

Aplikasi menggunakan 2 role:
- `ADMIN`: Full access ke semua fitur admin
- `CLIENT`: Access ke fitur client saja

### Middleware Protection

File `src/middleware.ts` otomatis melindungi:
- `/admin/*` - Hanya bisa diakses oleh ADMIN
- `/client/*` - Bisa diakses oleh CLIENT dan ADMIN

### Best Practices

1. **Jangan hardcode admin emails di production code**
2. **Gunakan environment variables untuk sensitive data**
3. **Minimal harus ada 1 admin (sistem mencegah demote admin terakhir)**
4. **Audit log untuk track perubahan role (optional, belum diimplementasi)**

## Login Flow

1. User login dengan GitHub OAuth
2. System cek apakah email ada di database
3. Jika user baru: Create dengan role CLIENT
4. Jika user existing: Load role dari database
5. JWT token include role information
6. Middleware check role untuk protected routes

## Troubleshooting

### User tidak bisa login sebagai admin
1. Check apakah email sudah benar di database
2. Pastikan role = 'ADMIN' di database
3. Clear browser cookies dan login ulang
4. Check NextAuth session di browser DevTools

### Cannot access admin pages
1. Verify middleware.ts configuration
2. Check console untuk error messages
3. Ensure JWT token contains correct role

### Database seed error
1. Pastikan database connection string benar
2. Run `npx prisma generate` dulu
3. Check apakah ts-node terinstall

## Development Mode

Untuk development, bisa gunakan `src/lib/auth-dev.ts` yang memiliki bypass untuk testing.

## Contact

Jika ada masalah dengan admin setup, check:
1. Database logs
2. NextAuth debug logs (set `debug: true` in auth options)
3. Browser console untuk client-side errors
