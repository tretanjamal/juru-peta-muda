# Kredit: Juru Peta Muda: Letak Kota dan Kabupatenku

Gim Edukasi IPAS Fase B, ID 255. Kreator: Jamaluddin, UPTD SMPN 2 Robatal. Tahun 2026.

## Huruf (SIL Open Font License 1.1, dibundel di `assets/fonts/`)
- **Fredoka** 600 dan 700, The Fredoka Project Authors. Lisensi: `assets/fonts/OFL-Fredoka.txt`.
- **Andika** 400 dan 700, SIL International. Lisensi: `assets/fonts/OFL-Andika.txt`.

## Gambar
- Tokoh, peta, dan antarmuka (Lang si elang Jawa, juru peta cilik, Desa Lang, Pulau Latihan, Pulau Seberang, peta Indonesia, mawar angin, kartu, ikon) digambar dengan kode SVG di `js/engine/seni.js`. Tidak ada gambar dari internet dan tidak ada emoji.
- Gambar buatan kecerdasan artifisial, dibuat kreator pada 10 November 2026 dengan prompt di `docs/ASET-PROMPT.md` (layanan: ChatGPT, sesuai alur `PROMPT-ASET.md`; perlu dikonfirmasi kreator), lalu dipotong dan dikompres ke WebP oleh `tools/aset/olah-aset.js`:
  - `assets/img/kantor-peta.webp`: latar Kantor Peta (prompt no. 1, acuan gaya).
  - `assets/img/dekor-1.webp` sampai `dekor-5.webp`: kompas meja, bola dunia, teropong, kapal hias, bingkai emas (prompt no. 3-7). Peta Indonesia di dalam bingkai digambar kode dari data peta.
  - Key art (`docs/aset/keyart-16x9.png`, prompt no. 2), tidak ikut zip. Thumbnail utama `dist/thumbnail-840x472.png` digambar dengan sistem SVG gim (peta Indonesia dari data, Lang, juru peta cilik, mawar angin, judul); thumbnail alternatif `dist/thumbnail-alt-840x472.png` memakai key art AI ini ditambah judul.
  - SVG lama tetap menjadi cadangan bila gambar tidak termuat.
- Foto pengembang: milik kreator (`assets/img/pengembang.webp`), diolah dari foto kreator `jamal.png` (dipotong persegi kepala dan bahu, 360 x 360, WebP) oleh `tools/aset/olah-aset.js`.
- Foto pengembang kedua: milik Rimawan Haritzah, S.Pd. (Guru SD Negeri Kauman Bantul), `assets/img/pengembang-2.webp`, diolah dari `Rimawan Haritzah.jpe` (dipotong persegi kepala dan bahu, 360 x 360, WebP) oleh `tools/aset/olah-aset.js`.

## Suara dan musik
- Musik latar "tema judul" dan "tema bermain" serta jingle "peta lengkap" dan "hasil" dibuat kreator pada 10 November 2026 dengan layanan pembuat musik kecerdasan artifisial memakai prompt di `docs/ASET-PROMPT.md` bagian B3 (nama layanan dan lisensinya perlu dilengkapi kreator). Diolah oleh `tools/aset/olah-aset.js`: dicampur mono, loop mulus dengan pudar-silang satu birama, dinormalkan, MP3 mono 96 kbps (encoder bawaan Windows), lalu dibungkus `js/data/musik_*.js` supaya jalan lewat `file://`.
- Bila berkas musik gagal dimuat, musik sintesis WebAudio di `js/engine/audio.js` yang dipakai. Efek suara tetap disintesis WebAudio.
- Suara Lang memakai suara bawaan perangkat (speechSynthesis id-ID). Naskah: `naskah_audio.csv`.

## Data peta
- Desa Lang, Pulau Latihan, Provinsi Tanjung Jauh, dan Pulau Seberang adalah tempat rekaan, dibuat oleh `tools/pulau/buat-pulau.js`.
- Peta Indonesia (`config/peta-indonesia.js`):
  - **Batas kabupaten/kota**: geoBoundaries gbOpen IDN ADM2 v6 (Runfola dkk., 2020), bersumber dari data BPS, WFP, dan OCHA ROAP (tahun 2020), lisensi Creative Commons Attribution 3.0 IGO. Diunduh 10 November 2026 dari GitHub `wmgeolab/geoBoundaries` (commit `9469f09`).
  - **Perubahan**: bentuk disederhanakan (mapshaper), perairan digambar sebagai danau, satu kawasan hutan tanpa kabupaten digabung ke Kab. Semarang, nama 2020 yang berganti diperbarui, dan wilayah dikelompokkan menjadi 38 provinsi.
  - **Kode dan nama wilayah**: Kepmendagri Nomor 300.2.2-2138 Tahun 2025 yang diubah oleh Kepmendagri Nomor 300.2.2-2430 Tahun 2025, diambil lewat basis data `cahyadsn/wilayah` (lisensi MIT, Copyright (c) 2017-2025 Cahya DSN).
  - **Koordinat 7 ibu kota provinsi di kabupaten**: pengetahuan geografi umum, perlu diverifikasi.
  - Rincian: `docs/DATA-PETA.md`.
- Alat pengembangan (tidak ikut dibagikan): mapshaper 0.6.121 (MPL-2.0) untuk menyederhanakan peta.
- Catatan di setiap peta: "Peta untuk belajar. Batas wilayah bukan rujukan resmi."

## Kode yang dipakai ulang
- Mesin gim (`util`, `tween`, `scene`, `input`, `save`, `audio` dengan antrean suara, `ui`, `muat`, `fullscreen`, `adaptif`), alat uji, dan `tools/zip.py` disalin dan disesuaikan dari gim kreator sebelumnya: Kafe Cilik (483), yang merangkum bagian dari Lompat Waktu, Kurir Kota (221), dan Pabrik Ajaib (577).

## Kecerdasan artifisial
- Kode dan teks disusun dengan bantuan Claude (Anthropic). Pengembang memeriksa dan bertanggung jawab atas isinya.
- Gambar latar Kantor Peta, perlengkapannya, key art, serta musik dan jingle dibuat dengan alat kecerdasan artifisial (rincian di bagian Gambar dan Suara di atas).
- Saat dimainkan, gim tidak memakai KA, tidak memerlukan internet, dan tidak mengirim data apa pun.
