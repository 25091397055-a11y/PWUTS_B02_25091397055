# Sistem Peminjaman Alat Pendukung Praktikum dan Mata Kuliah

UTS Pemrograman Web, D4 Manajemen Informatika 2025

Nama: Prahma Agis Shevina 

NIM: 25091397055

Kelompok 2 (2025B), proposal "Sistem Peminjaman Alat Pendukung Praktikum dan Mata Kuliah”

## Cara menjalankan
Ajax (`$.load`) dan form POST butuh server HTTP, jadi jangan buka dengan klik ganda.
```
python server.py      # lalu buka http://localhost:8000
```
Data pengajuan tersimpan di `data/pengajuan.json`.

## Struktur file
| Item | File | Isi |
|---|---|---|
| 2.a | `index.html`, `css/style.css`, `js/app.js` | Layout utama responsif, menu Ajax, gambar |
| 2.b | `pages/katalog.html` | Katalog, pencarian, simulasi stok dan alur status |
| 2.c | `pages/pengajuan.html`, `server.py` | Form pengajuan dengan validasi jQuery sebelum kirim ke server |
| 2.e | `README.md` | Catatan ini |

## Cakupan: peran Mahasiswa
Pembagian tugas kelompok berdasarkan peran; bagian ini mengerjakan **Mahasiswa** (FR-01 sampai FR-08 pada SRS). Peran Admin Lab dan Admin Sistem dikerjakan anggota lain.

| Kode SRS | Fitur | Lokasi |
|---|---|---|
| FR-01, NFR-03 | Login/logout, akun terkunci 5x gagal login (terbuka otomatis setelah 5 menit) | `js/sistem.js` (`R.login`) |
| FR-02 | Menu dan akses halaman sesuai peran | `js/sistem.js` (`MENU`, `AKSES`) |
| FR-03 | Ubah password sendiri | `R.password` |
| FR-04 | Katalog, pencarian, filter, dan stok | `pages/katalog.html` |
| FR-05, FR-06 | Form pengajuan dengan validasi stok dan durasi | `pages/pengajuan.html`, `js/app.js` |
| FR-07 | Batalkan pengajuan saat Menunggu Review | `R.riwayat` |
| FR-08 | Status, riwayat, dan notifikasi | `R.riwayat`, `R.notifikasi` |

Akun demo: **25091397055 / mhs123**. Riwayat berisi contoh data dengan status berbeda (Dikembalikan, Ditolak, Dipinjam, Siap Diambil, Menunggu Review) karena proses review dilakukan Admin Lab.

Data disimpan di `localStorage` browser, sedangkan form pengajuan dikirim ke server lewat POST `/api/pengajuan` (butuh `python server.py`). Di GitHub Pages, validasi tetap berjalan tetapi pengiriman ke server tidak tersedia.

## Penjelasan teknis
- **Responsive**: CSS grid/flex, `@media (max-width:760px)` mengubah menu menjadi tombol ☰.
- **Ajax**: link menu memakai atribut `data-page`; jQuery `.load('pages/xxx.html')` mengganti isi `#content` tanpa reload.
- **Interaktif (2.b)**: pencarian dan urutan katalog, simulasi jumlah, tanggal kembali maksimal, sisa stok, dan animasi status (stok berkurang saat Dipinjam, kembali saat Dikembalikan).
- **Validasi (2.c)**: semua field wajib; NIM 11 digit; jumlah ≤ stok; durasi ≤ batas alat (Proyektor 1 hari, lainnya 3 hari); kelas A/B/C/D/I. Form baru dikirim lewat `$.ajax POST /api/pengajuan` jika valid.
- **Gambar**: ilustrasi SVG di folder `img/`.
- **Batasan**: password belum di-hash (bcrypt di SRS butuh backend) dan data hanya ada di browser yang dipakai.
- Struktur pada tabel di atas: item 2.a (`index.html`, CSS, navigasi Ajax), 2.b (`pages/katalog.html`), 2.c (`pages/pengajuan.html`).
