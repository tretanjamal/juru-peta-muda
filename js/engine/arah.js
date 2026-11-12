/* Arah: 8 mata angin, sudut, dan aturan "arah yang jelas" (brief keputusan 4, GDD bagian 7).
   Sudut kompas: 0 = utara, 90 = timur, dihitung dengan y layar ke bawah. Dipakai gim dan uji logika (Node).
   Soal Desa Lang: jenis A (ketuk tempat di arah X dari acuan) dan jenis B (ketuk arah tempat Y dari acuan). */
(function (root) {
  var NAMA = ['utara', 'timur laut', 'timur', 'tenggara', 'selatan', 'barat daya', 'barat', 'barat laut'];
  var SINGKAT = ['U', 'TL', 'T', 'TG', 'S', 'BD', 'B', 'BL'];
  var BATAS = 10;   /* jarak minimal ke batas antar-arah, derajat */

  function sudut(a, b) { var s = Math.atan2(b[0] - a[0], a[1] - b[1]) * 180 / Math.PI; return (s + 360) % 360; }
  function indeks(s) { return Math.round(((s % 360) + 360) % 360 / 45) % 8; }
  /* jarak sudut s ke batas sektornya sendiri (0 sampai 22,5) */
  function jarakBatas(s) { var r = ((s % 45) + 45) % 45; return Math.abs(r - 22.5); }
  /* jarak sudut (derajat) dari s ke sektor arah i; 0 bila di dalam sektor */
  function jarakKeSektor(s, i) { var d = Math.abs(((s - i * 45) % 360 + 540) % 360 - 180); return Math.max(0, d - 22.5); }
  /* selisih dua arah dalam langkah 0-4 (4 = berlawanan) */
  function selisih(i, j) { var d = Math.abs(i - j) % 8; return d > 4 ? 8 - d : d; }

  var Arah = {
    NAMA: NAMA, SINGKAT: SINGKAT, BATAS: BATAS,
    sudut: sudut, indeks: indeks, jarakBatas: jarakBatas, jarakKeSektor: jarakKeSektor, selisih: selisih,
    nama: function (i) { return NAMA[((i % 8) + 8) % 8]; },
    utama: function (i) { return i % 2 === 0; },
    /* arah b dilihat dari a */
    dari: function (a, b) { var s = sudut(a, b); return { sudut: s, arah: indeks(s), jarak: jarakBatas(s), jelas: jarakBatas(s) >= BATAS }; },

    /* Jenis A: semua tempat di sektor arah dari acuan. Sah bila minimal satu tempat berarah jelas di sektor itu
       dan tidak ada tempat lain di dekat batas sektor (kurang dari BATAS derajat di luar sektor, atau di dalam sektor tetapi tidak jelas).
       Semua tempat di sektor diterima sebagai jawaban: "di sebelah selatan pasar" berlaku untuk sekolah maupun sawah.
       Mengembalikan daftar id (urut terdekat dulu) atau null. */
    sasaranA: function (tempat, acuanId, arah) {
      var acuan = tempat.filter(function (t) { return t.id === acuanId; })[0], hasil = [], pesaing = false;
      if (!acuan) return null;
      tempat.forEach(function (t) {
        if (t.id === acuanId) return;
        var s = sudut(acuan.titik, t.titik);
        if (indeks(s) === arah) { if (jarakBatas(s) >= BATAS) hasil.push(t); else pesaing = true; }
        else if (jarakKeSektor(s, arah) < BATAS) pesaing = true;
      });
      if (!hasil.length || pesaing) return null;
      hasil.sort(function (a, b) { return Math.hypot(a.titik[0] - acuan.titik[0], a.titik[1] - acuan.titik[1]) - Math.hypot(b.titik[0] - acuan.titik[0], b.titik[1] - acuan.titik[1]); });
      return hasil.map(function (t) { return t.id; });
    },
    /* Bank soal Desa Lang. jenis A: {jenis, acuan, arah, sasaran: [id]}; jenis B: {jenis, acuan, sasaran: id, arah}.
       Jenis B cukup berarah jelas: "Sawah ada di sebelah selatan pasar" tetap benar walau sekolah juga di selatan pasar. */
    bankDesa: function (tempat) {
      var bank = [];
      tempat.forEach(function (acuan) {
        for (var d = 0; d < 8; d++) {
          var s = Arah.sasaranA(tempat, acuan.id, d);
          if (s) bank.push({ jenis: 'A', acuan: acuan.id, arah: d, sasaran: s });
        }
        tempat.forEach(function (t) {
          if (t.id === acuan.id) return;
          var r = Arah.dari(acuan.titik, t.titik);
          if (r.jelas) bank.push({ jenis: 'B', acuan: acuan.id, sasaran: t.id, arah: r.arah });
        });
      });
      return bank;
    },
    /* Jenis kesalahan untuk umpan balik (GDD bagian 10). arahKetuk: arah tempat yang diketuk dari acuan; arahTugu: arahnya dari tugu. */
    jenisSalah: function (arahMinta, arahKetuk, o) {
      o = o || {};
      if (o.acuanDiketuk) return 'acuan';
      if (o.arahDariTugu === arahMinta && o.acuan !== 'tugu') return 'titik-acuan';
      var d = selisih(arahMinta, arahKetuk);
      if (d === 4) return 'berlawanan';
      if (d === 1) return 'arah-antara';
      return 'arah-lain';
    },
    /* Peta diputar searah jarum jam sebesar rot derajat: arah mata angin i tampak di arah layar mana (indeks 0-7, 0 = atas layar). */
    layar: function (i, rot) { return indeks(i * 45 + rot); }
  };
  root.Arah = Arah;
  if (typeof module !== 'undefined') module.exports = Arah;
})(typeof window !== 'undefined' ? window : globalThis);
