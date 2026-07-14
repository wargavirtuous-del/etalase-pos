# Etalase — Aplikasi Kasir

Project ini siap dipakai di komputer sendiri, dan siap di-deploy ke Vercel/Netlify agar bisa diakses lewat internet.

## 1. Coba dulu di komputer sendiri (opsional tapi disarankan)

Butuh Node.js versi 18+ (download di https://nodejs.org kalau belum ada).

```bash
npm install
npm run dev
```

Buka alamat yang muncul di terminal (biasanya `http://localhost:5173`). Coba semua fitur dulu sebelum deploy.

## 2. Deploy ke Vercel (gratis, direkomendasikan)

**Langkah A — Simpan project ke GitHub:**
1. Buat akun di https://github.com kalau belum punya
2. Buat repository baru (kosong), misal nama `etalase-pos`
3. Di folder project ini, jalankan:
   ```bash
   git init
   git add .
   git commit -m "Versi awal aplikasi kasir"
   git branch -M main
   git remote add origin https://github.com/USERNAME/etalase-pos.git
   git push -u origin main
   ```

**Langkah B — Hubungkan ke Vercel:**
1. Buat akun di https://vercel.com (bisa langsung pakai akun GitHub)
2. Klik "Add New Project" → pilih repository `etalase-pos` yang tadi di-push
3. Vercel otomatis mendeteksi ini project Vite — biarkan pengaturan default
4. Klik "Deploy"
5. Setelah selesai (sekitar 1 menit), kamu dapat link seperti `etalase-pos.vercel.app` — ini yang dipakai untuk buka aplikasi dari HP/laptop/tablet manapun

## 3. Alur Update Selanjutnya (Penting!)

Setiap kali kamu minta saya menambah fitur atau ubah tampilan di chat:
1. Saya update file `src/App.jsx` (dan file lain kalau perlu) di sini
2. Kamu download ulang file yang saya kasih, lalu ganti file yang sama di folder project kamu
3. Jalankan:
   ```bash
   git add .
   git commit -m "Update: [jelaskan perubahannya]"
   git push
   ```
4. Vercel otomatis build & deploy ulang dalam 1-2 menit — tidak perlu setting apapun lagi

## 4. Soal Tema & Tampilan

Semua warna aplikasi diatur di satu tempat: objek `c` di baris paling atas `src/App.jsx` (background, warna aksen mint/amber/coral, dst). Kalau mau ganti tema, cukup bilang ke saya "ubah tema jadi warna X" atau kasih contoh palet warna yang kamu suka — saya update objek itu, kamu tinggal ganti file & push lagi.

## 5. Catatan Data

Data (produk, transaksi, stok) tersimpan di `localStorage` browser masing-masing device. Artinya:
- Data **tidak otomatis sinkron** antar device/komputer kasir yang berbeda
- Kalau kamu buka dari 2 laptop berbeda, masing-masing akan punya datanya sendiri
- Kalau nanti butuh multi-kasir dengan data yang sama secara real-time, itu butuh backend + database sungguhan (Supabase/Firebase adalah pilihan tercepat) — bilang saja kalau sudah sampai tahap itu, saya bantu rancang.
