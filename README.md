# Undangan Pernikahan Digital — Asep & Reihanna

Aplikasi undangan pernikahan digital responsif untuk desktop dan telepon, tanpa foto mempelai. Desain menggunakan ornamen geometris, siluet masjid, tipografi Arab, warna cerah, animasi scroll, countdown, Google Maps, dan RSVP WhatsApp.

## Menjalankan

1. Ekstrak ZIP.
2. Buka `index.html` langsung di browser, atau jalankan server lokal:

```bash
python -m http.server 8000
```

3. Buka `http://localhost:8000`.

## Mengubah Data

Buka `script.js`, lalu ubah objek `CONFIG` di bagian paling atas:

- `groomParents` dan `brideParents`
- `eventDateISO`
- Data `akad`
- Data `reception`
- Waktu pada `agenda`
- Data lokasi dan `mapQuery`
- `whatsappNumber`

Contoh tanggal untuk zona waktu Indonesia Barat:

```js
eventDateISO: "2026-12-20T09:00:00+07:00"
```

Contoh lokasi:

```js
location: {
  description: "Akad dan walimah dilaksanakan di lokasi yang sama.",
  venue: "Gedung Contoh Bandung",
  address: "Jl. Contoh No. 1, Bandung, Jawa Barat",
  mapQuery: "Gedung Contoh Bandung"
}
```

## Nama Tamu Otomatis

Tambahkan parameter `to` pada URL:

```text
index.html?to=Bapak+Asep+dan+Keluarga
```

Nama tersebut akan tampil pada sampul dan otomatis mengisi kolom RSVP.

## Google Maps

Tidak memerlukan API key. Peta memakai URL embed berdasarkan `location.mapQuery`. Untuk akurasi terbaik, isi nama gedung sekaligus alamat lengkap atau koordinat.

Contoh koordinat:

```js
mapQuery: "-6.917464, 107.619123"
```

## Sumber Dalil dalam Undangan

- QS. Ar-Rūm [30]: 21 — https://quran.com/30/21
- QS. An-Nūr [24]: 32 — https://quran.com/24/32
- Ṣaḥīḥ al-Bukhārī no. 5066 — https://sunnah.com/bukhari:5066
- Sunan Abī Dāwud no. 2130 — https://sunnah.com/abudawud:2130

Terjemahan Indonesia dalam halaman dibuat sebagai parafrasa ringkas agar mudah dibaca. Tautan sumber asli tersedia pada setiap kartu dalil.
