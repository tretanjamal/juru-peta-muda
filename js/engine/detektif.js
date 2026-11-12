/* Detektif Letak (L5 bagian 2, GDD bagian 11): 5 pertanyaan pilihan tentang kabupaten/kota murid dari data peta Indonesia.
   Delapan jenis; jenis yang tidak berlaku untuk wilayah murid dilewati. Setiap pertanyaan punya tepat satu pilihan benar,
   pengecoh dari arah yang berseberangan dan dari tetangga lain (tidak pernah dari wilayah yang juga benar), pesan khusus per jenis
   kesalahan, dan data sorot untuk petunjuk tingkat 2. Arah memakai aturan jelas yang sama dengan teka-teki (js/engine/teka.js). */
(function (root) {
  var A = root.Arah || (typeof require !== 'undefined' ? require('./arah.js') : null);
  var Teka = root.Teka || (typeof require !== 'undefined' ? require('./teka.js') : null);

  function kapital(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function isi(s, o) { return s.replace(/\{(\w+)\}/g, function (x, k) { return o[k] != null ? o[k] : x; }); }
  function acakUrut(a, rnd) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  var Nama = root.Nama || (typeof require !== 'undefined' ? require('./nama.js') : null);
  /* nama tanpa awalan Kab./Kota, dan nama provinsi pendek yang sama dengan peta (DKI Jakarta, DI Yogyakarta) */
  var namaPendek = Nama.pendek, nmP = Nama.prov;
  function jenisSalahArah(benar, x) { return A.jenisSalah(benar, x, {}); }

  /* konteks satu wilayah murid */
  function konteks(D, kode, opsi) {
    var K = {}, P = {}; D.kab.forEach(function (k) { K[k.kode] = k; }); D.provinsi.forEach(function (p) { P[p.kode] = p; });
    var k = K[kode], m = Teka.modelIndonesia(D, k.prov);
    var darat = k.tetangga.map(function (t) { return t[0]; });
    var sama = darat.filter(function (x) { return K[x].prov === k.prov; });
    var laut = (k.laut || []).map(function (x) { return x[0]; });
    var tampil = opsi.tampil || [kode].concat(sama, k.kedua || [], laut);
    /* lihat(x): nama wilayah x terbaca di peta murid (opsi.tampil dari L5); tanpa opsi.tampil semua dianggap terlihat */
    var lihat = opsi.tampil ? function (x) { return tampil.indexOf(x) >= 0; } : function () { return true; };
    /* lihatProv(pv): nama provinsi tetangga tertulis di peta (opsi.tampilProv dari L5) */
    var lihatProv = opsi.tampilProv ? function (pv) { return opsi.tampilProv.indexOf(pv) >= 0; } : function () { return true; };
    return { K: K, P: P, k: k, m: m, kode: kode, darat: darat, sama: sama, laut: laut, tampil: tampil, lihat: lihat, lihatProv: lihatProv, S: opsi.STR || root.STR, rnd: opsi.rnd || Math.random };
  }
  function pilihan(teks, benar, nilai, salah, pesan) { return { teks: teks, benar: benar, nilai: nilai, salah: benar ? null : salah, pesan: benar ? null : pesan }; }

  /* ---------- jenis pertanyaan: masing-masing mengembalikan pertanyaan atau null ---------- */
  var JENIS = {};

  /* 1. Tetangga di arah tertentu: "Wilayah mana yang berbatasan di sebelah barat Kab. X?" */
  JENIS.tetanggaDiArah = function (c, pakai) {
    var m = c.m, S = c.S.detektif, kode = c.kode, pakaiLaut = !c.sama.length;
    var calon = pakaiLaut ? c.laut : c.sama, lain = pakaiLaut ? c.laut : c.darat;
    var opsi = [];
    calon.forEach(function (T) {
      if (!c.lihat(T)) return;
      for (var d = 0; d < 8; d++) {
        if (Teka.relArah(m, kode, T, d) !== 'ya') continue;
        if (pakaiLaut && m.laut(T, kode) !== 'ya') continue;
        var unik = lain.every(function (N) { return N === T || Teka.relArah(m, kode, N, d) === 'tidak'; });
        if (unik && !pakai['tda' + T] && !pakai['arah' + T]) opsi.push([T, d]);
      }
    });
    if (!opsi.length) return null;
    var pil = opsi[Math.floor(c.rnd() * opsi.length)], T = pil[0], d = pil[1];
    /* pengecoh: tetangga lain yang jelas BUKAN di arah itu, utamakan yang berseberangan; lalu wilayah cincin kedua */
    var pengecoh = lain.filter(function (N) { return N !== T && c.lihat(N) && Teka.relArah(m, kode, N, d) === 'tidak'; });
    pengecoh.sort(function (a, b) { return skorSeberang(m, kode, b, d) - skorSeberang(m, kode, a, d); });
    var cadangan = (c.k.kedua || []).filter(function (N) { return lain.indexOf(N) < 0 && c.lihat(N) && Teka.relArah(m, kode, N, d) === 'tidak'; });
    var dua = pengecoh.slice(0, 2).concat(cadangan).slice(0, 2);
    if (dua.length < 2) return null;
    var K = m.nama(kode), arah = A.NAMA[d];
    var pil3 = [pilihan(m.nama(T), true, T)].concat(dua.map(function (N) {
      var tetangga = lain.indexOf(N) >= 0, aN = m.arah(kode, N), arahN = aN ? A.NAMA[A.indeks(aN.sudut)] : null;
      if (tetangga && arahN && Teka.relArah(m, kode, N, A.indeks(aN.sudut)) === 'ya')
        return pilihan(m.nama(N), false, N, 'arah', isi(S.salah.arah, { X: m.nama(N), arahX: arahN, K: K, arah: arah }));
      return pilihan(m.nama(N), false, N, tetangga ? 'arah' : 'bukan-tetangga', isi(tetangga ? S.salah.arahUmum : S.salah['bukan-tetangga'], { X: m.nama(N), K: K, arah: arah }));
    }));
    pakai['tda' + T] = 1;
    return { jenis: 'tetanggaDiArah', teks: isi(pakaiLaut ? S.tetanggaDiArahLaut : S.tetanggaDiArah, { arah: arah, K: K }), pilihan: pil3,
      benarTeks: isi(S.benar.arah, { T: m.nama(T), arah: arah, K: K }), data: { T: T, d: d, laut: pakaiLaut }, sorot: { acuan: kode, arah: d, wilayah: [] }, petunjuk3: { wilayah: [T] } };
  };
  function skorSeberang(m, kode, N, d) { var a = m.arah(kode, N); return a ? A.selisih(A.indeks(a.sudut), d) : 0; }

  /* 2. Arah tetangga tertentu: "Kab. Pamekasan ada di sebelah mana dari Kab. Sampang?" */
  JENIS.arahTetangga = function (c, pakai) {
    var m = c.m, S = c.S.detektif, kode = c.kode, calon = c.sama.length ? c.sama : c.laut, opsi = [];
    calon.forEach(function (T) {
      if (pakai['tda' + T] || pakai['arah' + T] || !c.lihat(T)) return;
      for (var d = 0; d < 8; d++) if (Teka.relArah(m, kode, T, d) === 'ya') opsi.push([T, d]);
    });
    if (!opsi.length) return null;
    var pil = opsi[Math.floor(c.rnd() * opsi.length)], T = pil[0], d = pil[1];
    var q = soalArah(c, d, function (x) { return Teka.relArah(m, kode, T, x) === 'tidak'; });
    if (!q) return null;
    pakai['arah' + T] = 1;
    var K = m.nama(kode);
    return { jenis: 'arahTetangga', teks: isi(S.arahTetangga, { T: m.nama(T), K: K }), pilihan: q,
      benarTeks: isi(S.benar.arah, { T: m.nama(T), arah: A.NAMA[d], K: K }), data: { T: T, d: d }, sorot: { acuan: kode, arah: null, wilayah: [T] }, petunjuk3: { arah: d } };
  };
  /* pilihan arah: benar, berlawanan, dan satu arah bersebelahan (dua-duanya jelas salah menurut cek) */
  function soalArah(c, d, salahJelas) {
    var S = c.S.detektif, kandidat = [(d + 4) % 8].concat(acakUrut([(d + 1) % 8, (d + 7) % 8], c.rnd), acakUrut([(d + 2) % 8, (d + 6) % 8], c.rnd));
    var dua = kandidat.filter(salahJelas).slice(0, 2);
    if (dua.length < 2) return null;
    return [pilihan(kapital(A.NAMA[d]), true, d)].concat(dua.map(function (x) {
      var js = jenisSalahArah(d, x), a = (d + 7) % 8, b = (d + 1) % 8;
      var pesan = js === 'berlawanan' ? isi(S.salah.berlawanan, { X: A.NAMA[x], arah: A.NAMA[d] }) :
        js === 'arah-antara' && d % 2 === 1 ? isi(S.salah['arah-antara'], { Arah: kapital(A.NAMA[d]), a: A.NAMA[a], b: A.NAMA[b] }) : S.salah['arah-lain'];
      return pilihan(kapital(A.NAMA[x]), false, x, js, pesan);
    }));
  }

  /* 3. Arah ibu kota provinsi (dilewati bila wilayah murid adalah ibu kota, Jakarta, atau arah tidak jelas) */
  JENIS.arahIbukota = function (c) {
    var p = c.P[c.k.prov], a = c.k.arahIbukota, S = c.S.detektif;
    if (!p.ibukota || p.ibukota.kab === c.kode || !a || A.jarakBatas(a[0]) < A.BATAS) return null;
    var d = A.indeks(a[0]);
    var q = soalArah(c, d, function (x) { return A.jarakKeSektor(a[0], x) >= A.BATAS; });
    if (!q) return null;
    var K = c.m.nama(c.kode);
    return { jenis: 'arahIbukota', teks: isi(S.arahIbukota, { I: p.ibukota.nama, K: K }), pilihan: q,
      benarTeks: isi(S.benar.arahIbukota, { I: p.ibukota.nama, arah: A.NAMA[d], K: K }), data: { d: d, ibukota: p.ibukota.kab }, sorot: { acuan: c.kode, arah: null, wilayah: [p.ibukota.kab], bintang: true }, petunjuk3: { arah: d }, zoomProvinsi: true };
  };

  /* 4. Provinsi tetangga */
  JENIS.provinsiTetangga = function (c) {
    var S = c.S.detektif, kode = c.kode, prov = c.k.prov;
    var ada = {}; c.k.tetangga.forEach(function (t) { var pv = c.K[t[0]].prov; if (pv !== prov) ada[pv] = Math.max(ada[pv] || 0, t[1]); });
    var benar = Object.keys(ada).filter(function (pv) { return ada[pv] >= 1 && c.lihatProv(pv); });
    if (!benar.length) return null;
    var P = benar[Math.floor(c.rnd() * benar.length)];
    /* pengecoh: provinsi tetangga provinsiku yang tidak bersentuhan dengan wilayahku, lalu provinsi sepulau */
    var tetProv = {};
    c.m.ids.forEach(function (x) { c.K[x].tetangga.forEach(function (t) { var pv = c.K[t[0]].prov; if (pv !== prov) tetProv[pv] = 1; }); });
    var bukan = function (pv) { return pv !== prov && !ada[pv]; };
    var calon = acakUrut(Object.keys(tetProv).filter(bukan), c.rnd);
    var sepulau = acakUrut(Object.keys(c.P).filter(function (pv) { return bukan(pv) && c.P[pv].pulau === c.P[prov].pulau && calon.indexOf(pv) < 0; }), c.rnd);
    var dua = calon.concat(sepulau).slice(0, 2);
    if (dua.length < 2) return null;
    var K = c.m.nama(kode);
    return { jenis: 'provinsiTetangga', teks: isi(S.provinsiTetangga, { K: K }),
      pilihan: [pilihan(nmP(c.P[P]), true, P)].concat(dua.map(function (pv) { return pilihan(nmP(c.P[pv]), false, pv, 'provinsi-bukan-tetangga', isi(S.salah['provinsi-bukan-tetangga'], { X: nmP(c.P[pv]), K: K })); })),
      benarTeks: isi(S.benar.provinsiTetangga, { K: K, P: nmP(c.P[P]) }), data: { P: P }, sorot: { acuan: kode, wilayah: c.k.tetangga.filter(function (t) { return c.K[t[0]].prov === P; }).map(function (t) { return t[0]; }) }, petunjuk3: { provinsi: P } };
  };

  /* 5. Berbatasan dengan laut: satu dari tiga wilayah yang tampil berbeda sifat pantainya */
  JENIS.pantai = function (c) {
    var m = c.m, S = c.S.detektif, ya = [], tidak = [];
    c.tampil.forEach(function (x) { if (c.K[x].prov !== c.k.prov) return; var v = m.pantai(x); if (v === 'ya') ya.push(x); else if (v === 'tidak') tidak.push(x); });
    var bentuk = [];
    if (ya.length >= 1 && tidak.length >= 2) bentuk.push('pantaiYa');
    if (tidak.length >= 1 && ya.length >= 2) bentuk.push('pantaiTidak');
    if (!bentuk.length) return null;
    var b = bentuk[Math.floor(c.rnd() * bentuk.length)], kelompokBenar = b === 'pantaiYa' ? ya : tidak, kelompokSalah = b === 'pantaiYa' ? tidak : ya;
    /* utamakan wilayah murid sebagai salah satu pilihan */
    var urutB = acakUrut(kelompokBenar, c.rnd), urutS = acakUrut(kelompokSalah, c.rnd);
    [urutB, urutS].forEach(function (u) { var i = u.indexOf(c.kode); if (i > 0) { u.splice(i, 1); u.unshift(c.kode); } });
    var T = urutB[0], dua = urutS.slice(0, 2);
    return { jenis: 'pantai', teks: S[b], pilihan: [pilihan(m.nama(T), true, T)].concat(dua.map(function (x) {
      return pilihan(m.nama(x), false, x, 'pantai', isi(b === 'pantaiYa' ? S.salah.pantaiTidak : S.salah.pantaiYa, { X: m.nama(x) }));
    })), benarTeks: isi(S.benar[b], { T: m.nama(T) }), data: { T: T, bentuk: b }, sorot: { laut: true, wilayah: [] }, petunjuk3: { wilayah: [T] } };
  };

  /* 6. Mengelilingi atau dikelilingi */
  JENIS.dikelilingi = function (c) {
    var m = c.m, S = c.S.detektif, kode = c.kode, K = m.nama(kode), daftar = c.sama.filter(function (x) { return c.lihat(x); });
    var dalam = daftar.filter(function (x) { return m.mengelilingi(kode, x) === 'ya'; });
    var luar = daftar.filter(function (x) { return m.mengelilingi(x, kode) === 'ya'; });
    var bentuk = dalam.length ? 'mengelilingi' : luar.length ? 'dikelilingi' : null;
    if (!bentuk) return null;
    var T = (bentuk === 'mengelilingi' ? dalam : luar)[0];
    var pengecoh = c.tampil.filter(function (x) {
      return x !== T && x !== kode && c.K[x].prov === c.k.prov && (bentuk === 'mengelilingi' ? m.mengelilingi(kode, x) === 'tidak' : m.mengelilingi(x, kode) === 'tidak');
    });
    var dua = acakUrut(pengecoh, c.rnd).slice(0, 2);
    if (dua.length < 2) return null;
    return { jenis: 'dikelilingi', teks: isi(S[bentuk], { K: K }), pilihan: [pilihan(m.nama(T), true, T)].concat(dua.map(function (x) {
      return pilihan(m.nama(x), false, x, 'kelilingi', isi(bentuk === 'mengelilingi' ? S.salah.tidakDalam : S.salah.tidakKeliling, { X: m.nama(x), K: K }));
    })), benarTeks: isi(S.benar[bentuk], { T: m.nama(T), K: K }), data: { T: T, bentuk: bentuk }, sorot: { acuan: kode, wilayah: [kode] }, petunjuk3: { wilayah: [T] } };
  };

  /* 7. Jumlah tetangga darat (semua provinsi); dilewati bila ada batas yang terlalu pendek untuk terlihat atau tetangga yang namanya tidak terbaca */
  JENIS.jumlahTetangga = function (c) {
    var S = c.S.detektif, t = c.k.tetangga, n = t.length;
    /* n = 0: wilayah pulau, semua sisinya laut (tetap pertanyaan yang baik untuk murid kepulauan) */
    if (n > 8 || t.some(function (x) { return x[1] < 2 || !c.lihat(x[0]); })) return null;
    var lain = acakUrut([n + 1, n - 1 >= 0 ? n - 1 : n + 2], c.rnd), K = c.m.nama(c.kode);
    return { jenis: 'jumlahTetangga', teks: isi(S.jumlahTetangga, { K: K }), pilihan: [pilihan(String(n), true, n)].concat(lain.map(function (x) {
      return pilihan(String(x), false, x, 'hitung', isi(n ? S.salah.hitung : S.salah.hitungNol, { K: K }));
    })), benarTeks: isi(n ? S.benar.jumlahTetangga : S.benar.jumlahNol, { n: n, K: K }), data: { n: n }, sorot: { acuan: c.kode, laut: !n, wilayah: t.map(function (x) { return x[0]; }) }, petunjuk3: { wilayah: t.map(function (x) { return x[0]; }) } };
  };

  /* 8. Ibu kota provinsi (miskonsepsi: ibu kota dianggap provinsinya) */
  JENIS.ibukotaProvinsi = function (c) {
    var S = c.S.detektif, p = c.P[c.k.prov];
    if (!p.ibukota) return null;
    var I = p.ibukota.nama, low = function (s) { return s.toLowerCase(); };
    var mirip = low(nmP(p)).indexOf(low(I)) >= 0 || low(I).indexOf(low(nmP(p))) >= 0;
    var lain = c.m.ids.filter(function (x) { return x !== p.ibukota.kab && low(namaPendek(c.K[x].label)) !== low(I) && low(namaPendek(c.K[x].label)) !== low(nmP(p)); });
    /* utamakan wilayah murid sendiri sebagai pengecoh (bila bukan ibu kota), lalu kota lain */
    lain.sort(function (a, b) { return (b === c.kode) - (a === c.kode) || (c.K[b].jenis === 'kota') - (c.K[a].jenis === 'kota'); });
    var opsi = [];
    if (!mirip) opsi.push(pilihan(nmP(p), false, 'prov', 'ibukota-provinsi', isi(S.salah['ibukota-provinsi'], { P: nmP(p), I: I })));
    var nama = [], dilihat = [];
    lain.forEach(function (x) { var n = namaPendek(c.K[x].label); if (dilihat.indexOf(n) < 0 && n !== I) { dilihat.push(n); nama.push([n, x]); } });
    for (var i = 0; opsi.length < 2 && i < nama.length; i++) opsi.push(pilihan(nama[i][0], false, nama[i][1], 'bukan-ibukota', isi(S.salah['bukan-ibukota'], { X: nama[i][0], P: nmP(p) })));
    if (opsi.length < 2) return null;
    return { jenis: 'ibukotaProvinsi', teks: isi(S.ibukotaProvinsi, { P: nmP(p) }), pilihan: [pilihan(I, true, p.ibukota.kab)].concat(opsi),
      benarTeks: isi(S.benar.ibukotaProvinsi, { P: nmP(p), I: I }), data: { I: p.ibukota.kab }, sorot: { wilayah: [p.ibukota.kab], bintang: true }, petunjuk3: { wilayah: [p.ibukota.kab] }, zoomProvinsi: true };
  };

  /* 9. Tetangga atau bukan: "Mana yang berbatasan langsung dengan Kab. X?" atau "Mana yang tidak berbatasan ...?" */
  JENIS.tetangga = function (c) {
    var m = c.m, S = c.S.detektif, kode = c.kode, K = m.nama(kode), ya = [], tidak = [];
    c.tampil.forEach(function (x) {
      if (x === kode || c.K[x].prov !== c.k.prov) return;
      var v = m.tetangga(x, kode); if (v === 'ya') ya.push(x); else if (v === 'tidak') tidak.push(x);
    });
    var bentuk = [];
    if (ya.length >= 1 && tidak.length >= 2) bentuk.push('tetanggaYa');
    if (tidak.length >= 1 && ya.length >= 2) bentuk.push('tetanggaBukan');
    if (!bentuk.length) return null;
    var b = bentuk[Math.floor(c.rnd() * bentuk.length)], kb = acakUrut(b === 'tetanggaYa' ? ya : tidak, c.rnd), ks = acakUrut(b === 'tetanggaYa' ? tidak : ya, c.rnd);
    var T = kb[0];
    return { jenis: 'tetangga', teks: isi(S[b], { K: K }), pilihan: [pilihan(m.nama(T), true, T)].concat(ks.slice(0, 2).map(function (x) {
      return pilihan(m.nama(x), false, x, b === 'tetanggaYa' ? 'bukan-tetangga' : 'tetangga', isi(b === 'tetanggaYa' ? S.salah['bukan-tetangga'] : S.salah.bersentuhan, { X: m.nama(x), K: K }));
    })), benarTeks: isi(S.benar[b], { T: m.nama(T), K: K }), data: { T: T, bentuk: b }, sorot: { acuan: kode, wilayah: [kode] }, petunjuk3: { wilayah: [T] } };
  };

  /* 10. Arah wilayahku dilihat dari tetangga: "Kab. Sampang ada di sebelah mana dari Kab. Pamekasan?" */
  JENIS.arahDariTetangga = function (c, pakai) {
    var m = c.m, S = c.S.detektif, kode = c.kode, calon = c.sama.length ? c.sama : c.laut, opsi = [];
    calon.forEach(function (T) {
      if (pakai['arah' + T] || pakai['dari' + T] || !c.lihat(T)) return;
      for (var d = 0; d < 8; d++) if (Teka.relArah(m, T, kode, d) === 'ya') opsi.push([T, d]);
    });
    if (!opsi.length) return null;
    var pil = opsi[Math.floor(c.rnd() * opsi.length)], T = pil[0], d = pil[1];
    var q = soalArah(c, d, function (x) { return Teka.relArah(m, T, kode, x) === 'tidak'; });
    if (!q) return null;
    pakai['dari' + T] = 1;
    var K = m.nama(kode);
    return { jenis: 'arahDariTetangga', teks: isi(S.arahDariTetangga, { T: m.nama(T), K: K }), pilihan: q,
      benarTeks: isi(S.benar.arah, { T: K, arah: A.NAMA[d], K: m.nama(T) }), data: { T: T, d: d }, sorot: { acuan: T, arah: null, wilayah: [kode] }, petunjuk3: { arah: d } };
  };

  /* 11. Provinsiku */
  JENIS.provinsiku = function (c) {
    var S = c.S.detektif, prov = c.k.prov, K = c.m.nama(c.kode);
    var tetProv = {};
    c.m.ids.forEach(function (x) { c.K[x].tetangga.forEach(function (t) { var pv = c.K[t[0]].prov; if (pv !== prov) tetProv[pv] = 1; }); });
    var calon = acakUrut(Object.keys(tetProv), c.rnd).concat(acakUrut(Object.keys(c.P).filter(function (pv) { return pv !== prov && !tetProv[pv] && c.P[pv].pulau === c.P[prov].pulau; }), c.rnd));
    calon = calon.concat(acakUrut(Object.keys(c.P).filter(function (pv) { return pv !== prov && calon.indexOf(pv) < 0; }), c.rnd));
    var dua = calon.slice(0, 2);
    return { jenis: 'provinsiku', teks: isi(S.provinsiku, { K: K }), pilihan: [pilihan(nmP(c.P[prov]), true, prov)].concat(dua.map(function (pv) {
      return pilihan(nmP(c.P[pv]), false, pv, 'provinsi-lain', S.salah['provinsi-lain']);
    })), benarTeks: isi(S.benar.provinsiku, { K: K, P: nmP(c.P[prov]) }), data: { P: prov }, sorot: { judul: true, wilayah: [] }, petunjuk3: { provinsi: prov } };
  };

  /* 12. Kelompok pulau provinsiku */
  var PULAU = ['Sumatra', 'Jawa', 'Kalimantan', 'Sulawesi', 'Bali dan Nusa Tenggara', 'Maluku', 'Papua'];
  JENIS.pulau = function (c) {
    var S = c.S.detektif, p = c.P[c.k.prov], i = PULAU.indexOf(p.pulau);
    if (i < 0) return null;
    /* pengecoh: kelompok pulau di dekatnya dalam urutan barat ke timur */
    var lain = PULAU.filter(function (x) { return x !== p.pulau; }).sort(function (a, b) { return Math.abs(PULAU.indexOf(a) - i) - Math.abs(PULAU.indexOf(b) - i) || c.rnd() - 0.5; });
    return { jenis: 'pulau', teks: isi(S.pulau, { P: nmP(p) }), pilihan: [pilihan(p.pulau, true, p.pulau)].concat(lain.slice(0, 2).map(function (x) {
      return pilihan(x, false, x, 'pulau-lain', S.salah['pulau-lain']);
    })), benarTeks: isi(S.benar.pulau, { P: nmP(p), I: p.pulau }), data: { pulau: p.pulau }, sorot: { wilayah: [] }, petunjuk3: { pulau: p.pulau } };
  };

  /* jenis inti dulu (tetangga dan arahnya), lalu jenis membaca peta, lalu satu jenis pengetahuan wilayah */
  var INTI = ['tetanggaDiArah', 'arahTetangga'],
    PETA = ['arahIbukota', 'provinsiTetangga', 'pantai', 'dikelilingi', 'jumlahTetangga', 'tetangga', 'arahDariTetangga'],
    TAHU = ['ibukotaProvinsi', 'provinsiku', 'pulau'],
    /* jenis membaca peta yang lebih mudah (melihat langsung) dan yang lebih menantang (arah dari sudut pandang lain, menghitung) */
    MUDAH = ['tetangga', 'pantai', 'provinsiTetangga'], SULIT = ['arahDariTetangga', 'arahIbukota', 'dikelilingi', 'jumlahTetangga'];

  /* 5 pertanyaan dengan minimal 4 jenis berbeda bila tersedia */
  function buat(D, kode, opsi) {
    opsi = opsi || {};
    var c = konteks(D, kode, opsi), pakai = {}, hasil = [], n = opsi.jumlah || 5, dicoba = {};
    function coba(j) { if (hasil.length >= n || dicoba[j]) return; dicoba[j] = 1; var q = JENIS[j](c, pakai); if (q) hasil.push(q); }
    INTI.forEach(coba);
    /* opsi.tingkat 0: jenis mudah dulu; 2: jenis menantang dulu; lainnya acak */
    var dulu = opsi.tingkat === 0 ? MUDAH : opsi.tingkat === 2 ? SULIT : [];
    var urutPeta = (dulu.length ? acakUrut(dulu, c.rnd) : []).concat(acakUrut(PETA, c.rnd).filter(function (j) { return dulu.indexOf(j) < 0; }));
    urutPeta.forEach(function (j) { if (hasil.length < n - 1) coba(j); });
    ['ibukotaProvinsi'].concat(acakUrut(['provinsiku', 'pulau'], c.rnd)).forEach(coba);
    /* masih kurang: ulangi jenis yang bisa muncul lebih dari sekali (tetangga lain atau arah lain) */
    for (var u = 0; hasil.length < n && u < 8; u++) { var q = JENIS[['arahTetangga', 'tetanggaDiArah', 'arahDariTetangga'][u % 3]](c, pakai); if (q) hasil.push(q); }
    hasil = hasil.slice(0, n);
    hasil.forEach(function (q) { q.pilihan = acakUrut(q.pilihan, c.rnd); });
    return hasil;
  }

  /* pemeriksa mandiri (dipakai uji logika): memeriksa ulang kebenaran setiap pilihan dari data */
  function periksa(D, kode, q) {
    var c = konteks(D, kode, {}), m = c.m, masalah = [], benar = q.pilihan.filter(function (p) { return p.benar; })[0];
    function salah(p) { return !p.benar; }
    switch (q.jenis) {
      case 'tetanggaDiArah':
        if (Teka.relArah(m, kode, benar.nilai, q.data.d) !== 'ya') masalah.push('jawaban tidak jelas di arah itu');
        if (!q.data.laut && m.tetangga(benar.nilai, kode) === 'tidak') masalah.push('jawaban bukan tetangga');
        q.pilihan.filter(salah).forEach(function (p) {
          var diArah = Teka.relArah(m, kode, p.nilai, q.data.d) !== 'tidak', tet = q.data.laut ? m.laut(p.nilai, kode) === 'ya' : m.tetangga(p.nilai, kode) !== 'tidak';
          if (diArah && tet) masalah.push('pengecoh ' + p.teks + ' juga bisa benar');
        });
        break;
      case 'arahTetangga':
        if (Teka.relArah(m, kode, q.data.T, benar.nilai) !== 'ya') masalah.push('arah jawaban tidak jelas');
        q.pilihan.filter(salah).forEach(function (p) { if (Teka.relArah(m, kode, q.data.T, p.nilai) !== 'tidak') masalah.push('arah pengecoh ' + p.teks + ' tidak jelas salah'); });
        break;
      case 'arahIbukota':
        var s = c.k.arahIbukota[0];
        if (A.indeks(s) !== benar.nilai || A.jarakBatas(s) < A.BATAS) masalah.push('arah ibu kota salah atau tidak jelas');
        q.pilihan.filter(salah).forEach(function (p) { if (A.jarakKeSektor(s, p.nilai) < A.BATAS) masalah.push('pengecoh arah ibu kota terlalu dekat'); });
        break;
      case 'provinsiTetangga':
        var bersentuh = function (pv) { return c.k.tetangga.some(function (t) { return c.K[t[0]].prov === pv; }); };
        if (!bersentuh(benar.nilai)) masalah.push('provinsi jawaban tidak bersentuhan');
        q.pilihan.filter(salah).forEach(function (p) { if (bersentuh(p.nilai) || p.nilai === c.k.prov) masalah.push('pengecoh provinsi ' + p.teks + ' bersentuhan'); });
        break;
      case 'pantai':
        var mau = q.data.bentuk === 'pantaiYa' ? 'ya' : 'tidak';
        if (m.pantai(benar.nilai) !== mau) masalah.push('sifat pantai jawaban salah');
        q.pilihan.filter(salah).forEach(function (p) { if (m.pantai(p.nilai) !== (mau === 'ya' ? 'tidak' : 'ya')) masalah.push('pengecoh pantai ' + p.teks + ' ragu'); });
        break;
      case 'dikelilingi':
        var cek = function (x) { return q.data.bentuk === 'mengelilingi' ? m.mengelilingi(kode, x) : m.mengelilingi(x, kode); };
        if (cek(benar.nilai) !== 'ya') masalah.push('jawaban tidak dikelilingi');
        q.pilihan.filter(salah).forEach(function (p) { if (cek(p.nilai) !== 'tidak') masalah.push('pengecoh keliling ragu'); });
        break;
      case 'jumlahTetangga':
        if (benar.nilai !== c.k.tetangga.length) masalah.push('jumlah tetangga salah');
        break;
      case 'ibukotaProvinsi':
        if (benar.nilai !== c.P[c.k.prov].ibukota.kab) masalah.push('ibu kota salah');
        q.pilihan.filter(salah).forEach(function (p) { if (p.teks === benar.teks) masalah.push('pengecoh sama dengan ibu kota'); });
        break;
      case 'tetangga':
        var mauT = q.data.bentuk === 'tetanggaYa' ? 'ya' : 'tidak';
        if (m.tetangga(benar.nilai, kode) !== mauT) masalah.push('jawaban tetangga salah');
        q.pilihan.filter(salah).forEach(function (p) { if (m.tetangga(p.nilai, kode) !== (mauT === 'ya' ? 'tidak' : 'ya')) masalah.push('pengecoh tetangga ' + p.teks + ' ragu'); });
        break;
      case 'arahDariTetangga':
        if (Teka.relArah(m, q.data.T, kode, benar.nilai) !== 'ya') masalah.push('arah dari tetangga tidak jelas');
        q.pilihan.filter(salah).forEach(function (p) { if (Teka.relArah(m, q.data.T, kode, p.nilai) !== 'tidak') masalah.push('pengecoh arah dari tetangga ragu'); });
        break;
      case 'provinsiku':
        if (benar.nilai !== c.k.prov) masalah.push('provinsi salah');
        q.pilihan.filter(salah).forEach(function (p) { if (p.nilai === c.k.prov) masalah.push('pengecoh provinsi sama'); });
        break;
      case 'pulau':
        if (benar.nilai !== c.P[c.k.prov].pulau) masalah.push('pulau salah');
        break;
      default: masalah.push('jenis tidak dikenal ' + q.jenis);
    }
    return masalah;
  }

  var Detektif = { buat: buat, periksa: periksa, JENIS: JENIS };
  root.Detektif = Detektif;
  if (typeof module !== 'undefined') module.exports = Detektif;
})(typeof window !== 'undefined' ? window : globalThis);
