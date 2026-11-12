/* Teka-teki kartu nama (L3 dan L5, brief bagian 7, GDD bagian 11): generator petunjuk dan solver.
   Model peta (adaptor di bawah): wilayah, tetangga darat, arah, pantai, mengelilingi, tetangga laut, dan ciri.
   Kebenaran petunjuk bernilai tiga: 'ya', 'mungkin', 'tidak'. Data yang meragukan (arah dekat batas, sebagian di sektor,
   membentang mengelilingi, batas darat sangat pendek, pantai sangat pendek) bernilai 'mungkin', sehingga wilayah itu
   menjadi pesaing dan petunjuknya tidak dipakai.
   Petunjuk sah: berdasarkan wilayah yang sudah bernama, bernilai 'ya' untuk kartunya dan 'tidak' untuk SEMUA wilayah kosong lain.
   Karena kartu salah selalu kembali ke baki, wilayah yang bernama selalu benar, sehingga petunjuk sah menunjuk tepat satu wilayah.
   Generator membangun jalur tanpa menebak; solver mengenumerasi semua susunan untuk memastikan susunan tunggal. */
(function (root) {
  var A = root.Arah || (typeof require !== 'undefined' ? require('./arah.js') : null);
  var NILAI = { tidak: 0, mungkin: 1, ya: 2 }, NAMA_NILAI = ['tidak', 'mungkin', 'ya'];
  function dan() { var m = 2; for (var i = 0; i < arguments.length; i++) m = Math.min(m, NILAI[arguments[i]]); return NAMA_NILAI[m]; }
  function bukan(v) { return v === 'ya' ? 'tidak' : v === 'tidak' ? 'ya' : 'mungkin'; }
  function yt(b) { return b ? 'ya' : 'tidak'; }

  /* ---------- relasi arah: apakah X di sebelah d dari R ---------- */
  function relArah(m, R, X, d) {
    var a = m.arah(R, X);
    if (!a) {
      /* tanpa data luas: hanya bisa memastikan 'tidak' bila jauh dari sektor */
      var s = A.sudut(m.titik(R), m.titik(X));
      return A.jarakKeSektor(s, d) >= 25 ? 'tidak' : 'mungkin';
    }
    if (a.bentang > 270) return 'mungkin';
    var di = A.indeks(a.sudut) === d;
    if (di && A.jarakBatas(a.sudut) >= A.BATAS && a.persen >= 80) return 'ya';
    if (!di && A.jarakKeSektor(a.sudut, d) >= A.BATAS) return 'tidak';
    return 'mungkin';
  }

  /* ---------- jenis petunjuk ---------- */
  /* setiap jenis: nilai(m, T, R, p) untuk wilayah T (tempat kartu) dan R (acuan), p = parameter (arah atau ciri) */
  var JENIS = {
    arah: function (m, T, R, p) { return relArah(m, R, T, p); },
    batas: function (m, T, R) { return m.tetangga(T, R); },
    arahPantai: function (m, T, R, p) { return dan(relArah(m, R, T, p), m.pantai(T)); },
    batasPantai: function (m, T, R) { return dan(m.tetangga(T, R), m.pantai(T)); },
    batasDarat: function (m, T, R) { return dan(m.tetangga(T, R), bukan(m.pantai(T))); },
    mengelilingi: function (m, T, R) { return m.mengelilingi(T, R); },
    dikelilingi: function (m, T, R) { return m.mengelilingi(R, T); },
    laut: function (m, T, R, p) { return dan(m.laut(T, R), relArah(m, R, T, p)); },
    lautSaja: function (m, T, R) { return m.laut(T, R); },
    ciri: function (m, T, R, p) { return yt(m.ciri(T).indexOf(p) >= 0); },
    pedalaman: function (m, T) { return bukan(m.pantai(T)); }
  };
  /* bobot dasar per profil (makin besar makin disukai) */
  var PROFIL = {
    acuan: { arah: 10, arahPantai: 3, batas: 2, batasPantai: 2, batasDarat: 2, mengelilingi: 4, dikelilingi: 4, laut: 6, lautSaja: 2, ciri: 1, pedalaman: 1 },
    berantai: { arah: 6, arahPantai: 5, batas: 5, batasPantai: 4, batasDarat: 4, mengelilingi: 4, dikelilingi: 4, laut: 5, lautSaja: 3, ciri: 5, pedalaman: 4 },
    provinsi: { arah: 9, arahPantai: 4, batas: 4, batasPantai: 3, batasDarat: 3, mengelilingi: 6, dikelilingi: 6, laut: 8, lautSaja: 5, ciri: 2, pedalaman: 2 }
  };

  function nilai(m, c, wilayahT, wilayahR) { return JENIS[c.jenis](m, wilayahT, wilayahR, c.p); }
  /* petunjuk c sah bila 'ya' untuk kartunya dan 'tidak' untuk semua wilayah kosong lain (acuan harus sudah bernama) */
  function sah(m, c, kosong) {
    if (c.acuan != null && kosong.indexOf(c.acuan) >= 0) return false;
    if (nilai(m, c, c.kartu, c.acuan) !== 'ya') return false;
    for (var i = 0; i < kosong.length; i++) { var B = kosong[i]; if (B !== c.kartu && nilai(m, c, B, c.acuan) !== 'tidak') return false; }
    return true;
  }

  /* calon petunjuk untuk kartu T berdasarkan acuan yang sudah bernama */
  function calonPetunjuk(m, T, dikenal, opsi) {
    var hasil = [], acuan = opsi.hanyaAcuan ? [opsi.jangkar] : dikenal;
    acuan.forEach(function (R) {
      if (R === T) return;
      var lt = m.laut(T, R) === 'ya';
      for (var d = 0; d < 8; d++) {
        hasil.push({ jenis: 'arah', kartu: T, acuan: R, p: d });
        hasil.push({ jenis: 'arahPantai', kartu: T, acuan: R, p: d });
        if (lt) hasil.push({ jenis: 'laut', kartu: T, acuan: R, p: d });
      }
      if (lt) hasil.push({ jenis: 'lautSaja', kartu: T, acuan: R, p: null });
      ['batas', 'batasPantai', 'batasDarat', 'mengelilingi', 'dikelilingi'].forEach(function (j) { hasil.push({ jenis: j, kartu: T, acuan: R, p: null }); });
    });
    if (!opsi.hanyaAcuan) {
      m.ciri(T).forEach(function (c) { hasil.push({ jenis: 'ciri', kartu: T, acuan: null, p: c }); });
      hasil.push({ jenis: 'pedalaman', kartu: T, acuan: null, p: null });
    }
    return hasil;
  }

  /* skor calon: bobot profil, variasi jenis, kedekatan dengan jangkar dan kartu terakhir, hindari acuan abu-abu */
  function skor(c, keadaan, opsi, rnd) {
    var bobot = PROFIL[opsi.profil || 'provinsi'];
    var s = bobot[c.jenis] - (keadaan.dipakaiJenis[c.jenis] || 0) * 1.5 + rnd() * 2.5;
    if (c.acuan === opsi.jangkar) s += opsi.profil === 'acuan' ? 3 : 1.5;
    if (c.acuan != null && c.acuan === keadaan.terakhir) s += opsi.profil === 'berantai' ? 3 : 1;
    if (c.acuan != null && (opsi.konteks || []).indexOf(c.acuan) >= 0) s -= 2.5;   /* acuan abu-abu dipakai bila perlu saja */
    if (c.acuan != null && (opsi.luar || []).indexOf(c.acuan) >= 0) s -= 4;        /* wilayah provinsi lain: paling akhir */
    return s;
  }
  /* cukup tahu ada atau tidaknya petunjuk sah (lebih cepat daripada mencari yang terbaik) */
  function adaPetunjuk(m, T, dikenal, kosong, opsi) {
    var c = calonPetunjuk(m, T, dikenal, opsi);
    for (var i = 0; i < c.length; i++) if (sah(m, c[i], kosong)) return true;
    return false;
  }

  /* petunjuk terbaik untuk kartu T pada keadaan sekarang: [petunjuk, skor] */
  function terbaikUntuk(m, T, dikenal, kosong, opsi, keadaan) {
    var rnd = opsi.rnd || Math.random, terbaik = null, sk = -Infinity;
    calonPetunjuk(m, T, dikenal, opsi).forEach(function (c) {
      if (!sah(m, c, kosong)) return;
      var s = skor(c, keadaan, opsi, rnd);
      if (s > sk) { sk = s; terbaik = c; }
    });
    return [terbaik, sk];
  }
  /* dipakai layar saat murid memilih kartu di luar urutan jalur */
  function petunjukUntuk(m, T, dikenal, kosong, opsi, keadaan) {
    return terbaikUntuk(m, T, dikenal, kosong, opsi || {}, keadaan || { dipakaiJenis: {}, terakhir: null })[0];
  }

  /* ---------- generator ---------- */
  /* kartu: wilayah yang harus diberi nama; jangkar: wilayah yang sudah bernama di awal; konteks: wilayah lain yang bernama (abu-abu).
     opsi: profil, rnd, hanyaAcuan (semua petunjuk dari jangkar), percobaan. Mengembalikan {petunjuk: [...] urut jalur} atau null. */
  function buat(m, kartu, jangkar, konteks, opsi) {
    opsi = Object.assign({}, opsi || {}, { jangkar: jangkar, konteks: konteks || [] });
    var percobaan = opsi.percobaan || 12;
    for (var cb = 0; cb < percobaan; cb++) {
      var kosong = kartu.slice(), dikenal = [jangkar].concat(konteks || []), jalur = [], keadaan = { dipakaiJenis: {}, terakhir: null }, gagal = false;
      while (kosong.length) {
        var terbaik = null, sk = -Infinity;
        for (var i = 0; i < kosong.length; i++) {
          var hs = terbaikUntuk(m, kosong[i], dikenal, kosong, opsi, keadaan);
          if (hs[0] && hs[1] > sk) { sk = hs[1]; terbaik = hs[0]; }
        }
        if (!terbaik) { gagal = true; break; }
        jalur.push(terbaik);
        keadaan.dipakaiJenis[terbaik.jenis] = (keadaan.dipakaiJenis[terbaik.jenis] || 0) + 1;
        kosong.splice(kosong.indexOf(terbaik.kartu), 1);
        dikenal.push(terbaik.kartu);
        keadaan.terakhir = terbaik.kartu;
      }
      if (!gagal && hitungSusunan(m, kartu, jalur, 2) === 1) return { petunjuk: jalur, percobaan: cb + 1 };
    }
    return null;
  }

  /* ---------- solver: jumlah susunan nama yang memenuhi semua petunjuk (dihentikan pada batas) ---------- */
  function hitungSusunan(m, kartu, petunjuk, batas) {
    var tempat = {}, terpakai = {}, n = 0, urut = petunjuk.map(function (c) { return c.kartu; });
    kartu.forEach(function (k) { if (urut.indexOf(k) < 0) urut.push(k); });
    function wilayahNama(x) { return tempat[x] !== undefined ? tempat[x] : (kartu.indexOf(x) >= 0 ? undefined : x); }
    function cocok() {
      for (var i = 0; i < petunjuk.length; i++) {
        var c = petunjuk[i], wT = wilayahNama(c.kartu), wR = c.acuan == null ? null : wilayahNama(c.acuan);
        if (wT === undefined || wR === undefined) continue;
        if (nilai(m, c, wT, wR) === 'tidak') return false;
      }
      return true;
    }
    (function rekur(i) {
      if (n >= batas) return;
      if (i === urut.length) { n++; return; }
      for (var j = 0; j < kartu.length; j++) {
        var w = kartu[j];
        if (terpakai[w]) continue;
        tempat[urut[i]] = w; terpakai[w] = true;
        if (cocok()) rekur(i + 1);
        delete tempat[urut[i]]; terpakai[w] = false;
      }
    })(0);
    return n;
  }
  /* periksa jalur tanpa menebak secara terpisah (dipakai uji) */
  function periksaJalur(m, kartu, jangkar, konteks, petunjuk) {
    var kosong = kartu.slice(), masalah = [];
    petunjuk.forEach(function (c, i) {
      if (nilai(m, c, c.kartu, c.acuan) !== 'ya') masalah.push('petunjuk ' + (i + 1) + ' tidak benar untuk kartunya');
      kosong.forEach(function (B) { if (B !== c.kartu && nilai(m, c, B, c.acuan) !== 'tidak') masalah.push('petunjuk ' + (i + 1) + ' juga cocok untuk ' + B); });
      if (c.acuan != null && kosong.indexOf(c.acuan) >= 0) masalah.push('petunjuk ' + (i + 1) + ' mengacu ke kartu yang belum terpasang');
      if (c.acuan != null && c.acuan !== jangkar && (konteks || []).indexOf(c.acuan) < 0 && kartu.indexOf(c.acuan) < 0) masalah.push('petunjuk ' + (i + 1) + ' mengacu ke wilayah yang tidak tampil bernama');
      kosong.splice(kosong.indexOf(c.kartu), 1);
    });
    return masalah;
  }

  /* ---------- kalimat petunjuk ---------- */
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  /* html: nama wilayah tebal tanpa putus baris, arah berlatar jingga (GDD bagian 6) */
  function kalimat(m, c, T, html) {
    T = T || (root.STR && root.STR.teka);
    var nm = function (id) { var s = m.nama(id); return html ? '<b class="nama-w">' + esc(s).replace(/ /g, '&nbsp;') + '</b>' : s; };
    var ar = c.p != null && typeof c.p === 'number' ? (html ? '<span class="arah-w">' + A.NAMA[c.p] + '</span>' : A.NAMA[c.p]) : '';
    var o = { T: nm(c.kartu), R: c.acuan != null ? nm(c.acuan) : '', arah: ar, ciri: c.jenis === 'ciri' ? (html ? esc(m.namaCiri(c.p)) : m.namaCiri(c.p)) : '' };
    return T[c.jenis].replace(/\{(\w+)\}/g, function (x, k) { return o[k] != null ? o[k] : x; });
  }

  /* ---------- adaptor model ---------- */
  /* Pulau rekaan (config/pulau-latihan.js: PULAU_LATIHAN atau PULAU_SEBERANG, format sama) */
  function modelPulau(P) {
    var W = {}; P.wilayah.forEach(function (w) { W[w.id] = w; });
    function nama(id) { var w = W[id]; return w.jenis === 'kab' ? 'Kab. ' + w.nama : w.jenis === 'kota' ? 'Kota ' + w.nama : w.nama; }
    function tet(a, b) { return W[a].tetangga.some(function (t) { return t.id === b; }); }
    return {
      ids: P.wilayah.filter(function (w) { return w.jenis !== 'luar'; }).map(function (w) { return w.id; }),
      nama: nama,
      titik: function (id) { return W[id].label; },
      tetangga: function (a, b) { return yt(tet(a, b)); },
      arah: function (R, X) { var a = W[R].arah && W[R].arah[X]; return a ? { sudut: a.sudut, persen: a.persen, bentang: a.bentang } : null; },
      pantai: function (id) { return yt(W[id].pantai); },
      mengelilingi: function (T, R) { var a = W[R].arah && W[R].arah[T]; return yt(a && a.bentang > 270 && !W[R].pantai && tet(R, T)); },
      laut: function () { return 'tidak'; },
      ciri: function (id) { return W[id].ciri || []; },
      namaCiri: function (k) { return (P.namaCiri || {})[k] || k; },
      wilayah: W
    };
  }
  /* Indonesia (config/peta-indonesia.js) untuk satu provinsi; arah data: [sudut, persen, bentang] */
  var BATAS_PENDEK = 1, PANTAI_PENDEK = 2;   /* km; di bawahnya garis tidak terlihat di peta sederhana, jadi 'mungkin' */
  function modelIndonesia(D, prov) {
    var K = {}; D.kab.forEach(function (k) { K[k.kode] = k; });
    var tet = {};
    D.kab.forEach(function (k) { tet[k.kode] = {}; k.tetangga.forEach(function (t) { tet[k.kode][t[0]] = t[1]; }); });
    function tetangga(a, b) { var km = tet[a][b]; return !km ? 'tidak' : km >= BATAS_PENDEK ? 'ya' : 'mungkin'; }
    function pantai(id) { var p = K[id].pantai; return p >= PANTAI_PENDEK ? 'ya' : p > 0 ? 'mungkin' : 'tidak'; }
    function diLaut(R, T) { return (K[R].laut || []).some(function (x) { return x[0] === T; }); }
    return {
      ids: D.kab.filter(function (k) { return k.prov === prov; }).map(function (k) { return k.kode; }),
      nama: function (id) { return K[id].label; },
      titik: function (id) { return K[id].titik; },
      tetangga: tetangga,
      arah: function (R, X) { var a = K[R].arah[X]; return a ? { sudut: a[0], persen: a[1], bentang: a[2] } : null; },
      pantai: pantai,
      mengelilingi: function (T, R) {
        var a = K[R].arah[T];
        if (!a || !tet[R][T] || pantai(R) !== 'tidak') return 'tidak';
        return a[2] > 270 ? (tetangga(R, T) === 'ya' ? 'ya' : 'mungkin') : a[2] > 240 ? 'mungkin' : 'tidak';
      },
      /* dipisahkan laut: bukan tetangga darat dan saling tercatat sebagai tetangga laut; selain itu belum pasti */
      laut: function (T, R) {
        if (tet[T][R]) return 'tidak';
        return diLaut(R, T) || diLaut(T, R) ? 'ya' : 'mungkin';
      },
      ciri: function () { return []; },
      namaCiri: function (k) { return k; },
      kab: K
    };
  }
  /* Kartu L5: tetangga darat sedaerah (batas terpanjang dulu, maks. 7); bila kurang dari 3, tetangga dari tetangga sampai 3-4;
     wilayah pulau: tetangga laut sedaerah (maks. 4). */
  function kartuProvinsi(D, kode) {
    var K = {}; D.kab.forEach(function (k) { K[k.kode] = k; });
    var k = K[kode], sama = function (x) { return K[x] && K[x].prov === k.prov; };
    var darat = k.tetangga.filter(function (t) { return sama(t[0]); }).map(function (t) { return t[0]; }).slice(0, 7);
    if (darat.length >= 3) return darat;
    var hasil = darat.slice(), target = darat.length === 2 ? 3 : 4;
    if (darat.length) {
      var kedua = (k.kedua || []).filter(function (o) { return darat.indexOf(o) < 0 && o !== kode && sama(o); });
      /* tetangga kedua yang batasnya paling panjang dengan kartu darat */
      var pj = function (x) { return darat.reduce(function (s, d) { var t = K[d].tetangga.filter(function (u) { return u[0] === x; })[0]; return s + (t ? t[1] : 0); }, 0); };
      kedua.sort(function (a, b) { return pj(b) - pj(a); });
      hasil = hasil.concat(kedua.slice(0, target - hasil.length));
    }
    /* masih kurang: tetangga laut sedaerah (di daratan lain), terdekat dulu */
    (k.laut || []).forEach(function (x) { if (hasil.length < target && hasil.indexOf(x[0]) < 0 && sama(x[0])) hasil.push(x[0]); });
    return hasil;
  }
  /* Wilayah abu-abu bernama di L5: sedaerah dan bersentuhan dengan wilayah murid atau salah satu kartu */
  function konteksProvinsi(D, kode, kartu) {
    var K = {}; D.kab.forEach(function (k) { K[k.kode] = k; });
    var hasil = [], semua = [kode].concat(kartu);
    semua.forEach(function (x) {
      K[x].tetangga.concat(K[x].laut || []).forEach(function (t) {
        var o = t[0];
        if (K[o].prov === K[kode].prov && semua.indexOf(o) < 0 && hasil.indexOf(o) < 0) hasil.push(o);
      });
    });
    return hasil;
  }

  /* kartu yang bisa dipasang tanpa menebak, apa pun urutannya (penutupan: menambah wilayah bernama tidak pernah membuat petunjuk tidak sah) */
  function tutup(m, kartu, jangkar, konteks, opsi) {
    var kosong = kartu.slice(), dikenal = [jangkar].concat(konteks), dapat = [], ada = true;
    opsi = Object.assign({}, opsi, { jangkar: jangkar, konteks: konteks });
    while (ada && kosong.length) {
      ada = false;
      for (var i = 0; i < kosong.length; i++) {
        if (adaPetunjuk(m, kosong[i], dikenal, kosong, opsi)) { var T = kosong.splice(i, 1)[0]; dikenal.push(T); dapat.push(T); ada = true; break; }
      }
    }
    return dapat;
  }
  /* wilayah provinsi lain yang bersentuhan darat dengan wilayah murid atau kartu (tampil abu-abu bernama) */
  function luarProvinsi(D, kode, kartu) {
    var K = {}; D.kab.forEach(function (k) { K[k.kode] = k; });
    var hasil = [];
    [kode].concat(kartu).forEach(function (x) {
      K[x].tetangga.forEach(function (t) { if (K[t[0]].prov !== K[kode].prov && hasil.indexOf(t[0]) < 0) hasil.push(t[0]); });
    });
    return hasil;
  }
  /* Teka-teki L5 lengkap. Bila ada kartu yang saling bersaing sehingga tidak ada jalur tanpa menebak, satu kartu demi satu kartu
     dijadikan wilayah abu-abu bernama: kartu yang penghapusannya membuat paling banyak kartu lain terpecahkan (GDD bagian 11 langkah 4). */
  function siapkanProvinsi(D, kode, opsi) {
    var K = {}; D.kab.forEach(function (k) { K[k.kode] = k; });
    var m = modelIndonesia(D, K[kode].prov), kartu = kartuProvinsi(D, kode), konteks = konteksProvinsi(D, kode, kartu), keluar = [];
    var luar = luarProvinsi(D, kode, kartu);
    opsi = Object.assign({ profil: 'provinsi' }, opsi || {}, { luar: luar });
    var semuaKonteks = function () { return konteks.concat(luar); };
    while (kartu.length) {
      var dapat = tutup(m, kartu, kode, semuaKonteks(), opsi);
      if (dapat.length === kartu.length) break;
      var pilih = null, nilaiPilih = -1;
      kartu.forEach(function (c, i) {
        var sisa = kartu.filter(function (x) { return x !== c; });
        var v = tutup(m, sisa, kode, semuaKonteks().concat([c]), opsi).length * 100 + (dapat.indexOf(c) < 0 ? 50 : 0) + i;
        if (v > nilaiPilih) { nilaiPilih = v; pilih = c; }
      });
      kartu = kartu.filter(function (x) { return x !== pilih; }); konteks.push(pilih); keluar.push(pilih);
    }
    if (!kartu.length) return null;
    var h = buat(m, kartu, kode, semuaKonteks(), opsi);
    if (!h) return null;
    return { model: m, jangkar: kode, kartu: kartu, konteks: konteks, luar: luar, petunjuk: h.petunjuk, dikeluarkan: keluar };
  }

  var Teka = { buat: buat, petunjukUntuk: petunjukUntuk, sah: sah, hitungSusunan: hitungSusunan, periksaJalur: periksaJalur,
    kalimat: kalimat, relArah: relArah, nilai: nilai, JENIS: JENIS, PROFIL: PROFIL, tutup: tutup, siapkanProvinsi: siapkanProvinsi,
    modelPulau: modelPulau, modelIndonesia: modelIndonesia, kartuProvinsi: kartuProvinsi, konteksProvinsi: konteksProvinsi };
  root.Teka = Teka;
  if (typeof module !== 'undefined') module.exports = Teka;
})(typeof window !== 'undefined' ? window : globalThis);
