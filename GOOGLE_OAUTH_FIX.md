# Fix Google OAuth Error: redirect_uri_mismatch

## 🚨 Error yang Terjadi
```
Error 400: redirect_uri_mismatch
Akses diblokir: Permintaan aplikasi ini tidak valid
```

## 🔧 Cara Memperbaiki (5 Langkah)

### 1. Buka Google Cloud Console
- Pergi ke: https://console.cloud.google.com/
- Login dengan akun Google Anda
- Buat project baru atau pilih yang sudah ada

### 2. Enable Google+ API
- Pergi ke **"APIs & Services"** > **"Library"**
- Cari **"Google+ API"** dan klik **"Enable"**

### 3. Buat OAuth 2.0 Credentials
- Pergi ke **"APIs & Services"** > **"Credentials"**
- Klik **"+ CREATE CREDENTIALS"**
- Pilih **"OAuth 2.0 Client IDs"**
- Application type: **"Web application"**
- Name: **"WMX Services"**

### 4. Configure Redirect URIs
**PENTING:** Pastikan URIs ini PERSIS seperti di bawah ini:

**Authorized JavaScript origins:**
```
http://localhost:3000
```

**Authorized redirect URIs:**
```
http://localhost:3000/api/auth/callback/google
```

### 5. Update Environment Variables
Setelah membuat credentials, copy **Client ID** dan **Client secret**, lalu update file `.env.local`:

```bash
# Google OAuth
GOOGLE_CLIENT_ID="123456789-abcdefghijk.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-your_actual_client_secret_here"
```

## 🔄 Restart Development Server
Setelah update environment variables:

```bash
# Stop server (Ctrl+C)
# Lalu start lagi:
npm run dev
```

## ✅ Test Login
1. Buka: http://localhost:3000/auth/signin
2. Klik **"Continue with Google"**
3. Harus redirect ke Google dengan benar (tanpa error)

## 🚨 Common Mistakes
- ❌ Lupa menambahkan `/api/auth/callback/google` di redirect URI
- ❌ Menggunakan `https` untuk localhost (harus `http`)
- ❌ Tidak restart server setelah update environment
- ❌ Copy-paste salah client ID/secret

## 📱 Untuk Production
Jika deploy ke Vercel atau domain lain, tambahkan juga:

**JavaScript origins:**
```
https://your-domain.com
```

**Redirect URIs:**
```
https://your-domain.com/api/auth/callback/google
```

## 🔍 Debug
Jika masih error, cek:
1. Browser Network tab untuk melihat redirect URL yang dikirim
2. Pastikan tidak ada trailing slash di URLs
3. Cek case-sensitive di URIs
4. Pastikan project Google Cloud Console yang benar
