# 🚀 Setup Resend untuk Magic Link Authentication

## Langkah-langkah Setup Resend

### 1. Buat Akun Resend
1. Buka https://resend.com dan klik "Sign Up"
2. Daftar dengan email Anda (bisa menggunakan GitHub OAuth)
3. Verifikasi email Anda

### 2. Setup Domain (Opsional untuk Production)
Untuk development, Anda bisa menggunakan domain `resend.dev` yang sudah tersedia.

Untuk production:
1. Di dashboard Resend, klik "Domains"
2. Klik "Add Domain"
3. Masukkan domain Anda
4. Ikuti instruksi untuk menambahkan DNS records

### 3. Generate API Key
1. Di dashboard Resend, klik "API Keys" di sidebar
2. Klik "Create API Key"
3. Beri nama API key (contoh: "WMX Services Development")
4. Pilih permission "Full Access" 
5. Copy API key yang dihasilkan (format: `re_xxxxxxxxxxxx`)

### 4. Konfigurasi Environment Variables

Tambahkan ke file `.env` Anda:

```env
# Resend Configuration
RESEND_API_KEY="re_your_api_key_here"  # Ganti dengan API key Anda
EMAIL_FROM="WMX Services <onboarding@resend.dev>"  # Untuk dev, gunakan @resend.dev
EMAIL_ENABLED="true"

# NextAuth Configuration
NEXTAUTH_SECRET="your-secret-key"  # Generate dengan: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
```

**Catatan untuk development:**
- Gunakan email `onboarding@resend.dev` sebagai pengirim untuk testing
- Email akan terkirim ke alamat email asli yang Anda masukkan

**Untuk production:**
- Ganti `EMAIL_FROM` dengan domain yang sudah diverifikasi
- Contoh: `EMAIL_FROM="WMX Services <noreply@yourdomain.com>"`

### 5. Test Magic Link

1. Restart development server:
```bash
npm run dev
```

2. Buka http://localhost:3000/auth/signin
3. Masukkan email Anda
4. Klik "Sign in with Email"
5. Cek inbox email Anda untuk magic link
6. Klik link di email untuk login

## 🧪 Troubleshooting

### Email tidak terkirim?

1. **Cek API Key**
   - Pastikan `RESEND_API_KEY` sudah benar di `.env`
   - API key harus dimulai dengan `re_`

2. **Cek Resend Dashboard**
   - Login ke https://resend.com/emails
   - Cek tab "Emails" untuk melihat status pengiriman
   - Jika ada error, akan ditampilkan di sini

3. **Cek Console Log**
   - Lihat terminal tempat `npm run dev` berjalan
   - Cari error message terkait email

4. **Test Manual dengan cURL**
   ```bash
   curl -X POST 'https://api.resend.com/emails' \
     -H 'Authorization: Bearer re_YOUR_API_KEY' \
     -H 'Content-Type: application/json' \
     -d '{
       "from": "onboarding@resend.dev",
       "to": "your-email@example.com",
       "subject": "Test Email",
       "html": "<p>This is a test email</p>"
     }'
   ```

### Rate Limits

Resend Free tier limits:
- 100 emails/day
- 3,000 emails/month
- Unlimited untuk domain `resend.dev` (development only)

## 📝 Email Templates

Magic link email template sudah dikonfigurasi dengan design retro yang sesuai dengan theme website. Template bisa dilihat dan dimodifikasi di:
- File: `src/lib/auth.ts` 
- Function: `sendVerificationRequest`

## 🔒 Security Notes

1. **Jangan commit `.env` file** - Sudah ada di `.gitignore`
2. **API Key harus rahasia** - Jangan share atau expose di client-side
3. **Magic link expire** - Link berlaku 24 jam
4. **One-time use** - Link hanya bisa digunakan sekali

## 📚 Resources

- [Resend Documentation](https://resend.com/docs)
- [Resend Dashboard](https://resend.com)
- [NextAuth Email Provider](https://next-auth.js.org/providers/email)
- [React Email](https://react.email) - Untuk membuat email templates

## Support

Jika masih ada masalah, cek:
1. Resend Status: https://status.resend.com
2. NextAuth Debug Mode: Set `debug: true` di `authOptions`
3. Resend Support: support@resend.com
