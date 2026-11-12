/* Nama wilayah yang seragam di semua layar: peta, daftar, kalimat Detektif, L6, Catatan Belajarku, dan panel guru.
   Dipakai juga oleh uji logika di Node (module.exports). */
(function (root) {
  var Nama = {
    /* nama provinsi pendek: DKI Jakarta, DI Yogyakarta; provinsi lain utuh. p: objek provinsi ({nama}) atau teks nama */
    prov: function (p) { var n = typeof p === 'string' ? p : p.nama; return n.replace('Daerah Khusus Ibukota ', 'DKI ').replace('Daerah Istimewa ', 'DI '); },
    /* nama kabupaten/kota tanpa awalan Kab./Kota (untuk urutan A-Z, huruf awal, dan pilihan ibu kota) */
    pendek: function (label) { return label.replace(/^(Kab\. Adm\.|Kota Adm\.|Kab\.|Kota)\s+/, ''); },
    /* pembanding urutan A-Z kabupaten/kota ({label}) menurut nama pendek, lalu label lengkap */
    urut: function (a, b) { return Nama.pendek(a.label).localeCompare(Nama.pendek(b.label), 'id') || a.label.localeCompare(b.label, 'id'); }
  };
  root.Nama = Nama;
  if (typeof module !== 'undefined') module.exports = Nama;
})(typeof window !== 'undefined' ? window : globalThis);
