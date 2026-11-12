/* Gambar peta Indonesia untuk layar L4 dan L5 (data: js/engine/peta.js, dimuat malas dengan Peta.muat).
   - indonesia(): 38 provinsi (detail kasar) berwarna per kelompok pulau, atau satu kelompok diperbesar (detail rinci).
   - provinsi(): kabupaten/kota satu provinsi (rinci) berwarna lima warna tanpa tetangga sewarna, provinsi tetangga abu-abu,
     batas provinsi utuh, batas kabupaten/kota putus-putus, pantai, dan danau.
   Semua koordinat layar memakai transformasi T dari Peta.pas. */
(function (root) {
  var PULAU = ['Sumatra', 'Jawa', 'Kalimantan', 'Sulawesi', 'Bali dan Nusa Tenggara', 'Maluku', 'Papua'];
  var WARNA_PULAU = { Sumatra: 'hijau', Jawa: 'jingga', Kalimantan: 'sage', Sulawesi: 'pasir', 'Bali dan Nusa Tenggara': 'cokelat', Maluku: 'hijau', Papua: 'jingga' };
  var LIMA = ['hijau', 'pasir', 'jingga', 'sage', 'cokelat'];
  var cacheWarnaProv = null, cacheWarnaKab = {};
  function n1(v) { return Math.round(v * 10) / 10; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function teks(x, y, t, o) { return Seni.teks(x, y, t, Object.assign({ ukuran: 20, garis: Seni.W.kertas, tebalGaris: 5 }, o || {})); }

  function kelompok() {
    var g = {}; PULAU.forEach(function (p) { g[p] = []; });
    Peta.data().provinsi.forEach(function (p) { (g[p.pulau] = g[p.pulau] || []).push(p.kode); });
    return g;
  }
  /* pewarnaan rakus: tetangga tidak sewarna */
  function warnai(ids, tetangga) {
    var w = {};
    ids.slice().sort(function (a, b) { return tetangga(b).length - tetangga(a).length; }).forEach(function (id) {
      var dipakai = tetangga(id).map(function (t) { return w[t]; });
      w[id] = LIMA.filter(function (c) { return dipakai.indexOf(c) < 0; })[0] || LIMA[0];
    });
    return w;
  }
  function warnaProv() {
    if (cacheWarnaProv) return cacheWarnaProv;
    var D = Peta.data(), tet = {};
    D.provinsi.forEach(function (p) { tet[p.kode] = {}; });
    D.kab.forEach(function (k) { k.tetangga.forEach(function (t) { var p2 = Peta.kab(t[0]).prov; if (p2 !== k.prov) { tet[k.prov][p2] = 1; tet[p2][k.prov] = 1; } }); });
    return (cacheWarnaProv = warnai(D.provinsi.map(function (p) { return p.kode; }), function (id) { return Object.keys(tet[id]); }));
  }
  function warnaKab(prov) {
    if (cacheWarnaKab[prov]) return cacheWarnaKab[prov];
    var kab = Peta.kabDi(prov).map(function (k) { return k.kode; });
    return (cacheWarnaKab[prov] = warnai(kab, function (id) { return Peta.kab(id).tetangga.map(function (t) { return t[0]; }).filter(function (x) { return kab.indexOf(x) >= 0; }); }));
  }
  function titikPulau(nama, T) {
    var ps = kelompok()[nama], x = 0, y = 0;
    ps.forEach(function (k) { var p = Peta.P(Peta.prov(k).label, T); x += p[0]; y += p[1]; });
    return [x / ps.length, y / ps.length];
  }

  /* o: kotak {x,y,w,h}, fokus (nama kelompok pulau atau null), labelPulau, labelProv, sorot (kode provinsi berdenyut), terpilih, abu (true: semua abu kecuali fokus) */
  function indonesia(o) {
    var D = Peta.data(), W = Seni.W, ISI = Seni.ISI, g = '', T, grup = kelompok();
    var fokus = o.fokus ? grup[o.fokus] : null;
    if (fokus) {
      /* kelompok pulau diperbesar: detail rinci, batas provinsi dari busur bersama sehingga pas dengan isinya */
      var kab = []; fokus.forEach(function (p) { Peta.kabDi(p).forEach(function (k) { kab.push(k.kode); }); });
      T = o.T || Peta.pas(Peta.kotakKabUtama(kab), o.kotak, 14);
      /* provinsi di luar kelompok: abu-abu (kasar) */
      D.provinsi.forEach(function (p) { if (fokus.indexOf(p.kode) < 0) g += '<path d="' + Peta.dProv(p.kode, T, 3) + '" fill="' + ISI.luar + '" stroke="' + W.tinta + '" stroke-opacity=".5" stroke-width="1.5"/>'; });
      var wp = warnaProv();
      fokus.forEach(function (p) {
        var d = Peta.kabDi(p).map(function (k) { return Peta.dKab(k.kode, T, 2); }).join('');
        g += '<path d="' + d + '" fill="' + ISI[wp[p]] + '" stroke="' + ISI[wp[p]] + '" stroke-width="1" class="' + (o.sorot === p ? 'denyut' : '') + '"/>';
        if (o.terpilih === p) g += '<path d="' + d + '" fill="' + W.jingga + '" fill-opacity=".45"/>';
      });
      g += '<path d="' + Peta.dAir(T, 3) + '" fill="' + W.laut + '" stroke="' + W.tinta + '" stroke-width="1.5"/>';
      g += '<path d="' + Peta.dBusur(kab, T, 'prov') + '" fill="none" stroke="' + W.tinta + '" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>';
      g += '<path d="' + Peta.dBusur(kab, T, 'pantai') + '" fill="none" stroke="' + W.tinta + '" stroke-width="2.2" stroke-linejoin="round"/>';
    } else {
      T = o.T || Peta.pas(Peta.kotakSemua(), o.kotak, 8);
      D.provinsi.forEach(function (p) {
        var warna = o.abu ? ISI.kosong : ISI[WARNA_PULAU[p.pulau]];
        /* petunjuk: kelompok pulau yang dicari menyala jingga, kelompok lain abu-abu */
        if (o.sorotPulau) warna = p.pulau === o.sorotPulau ? W.jinggaTerang : ISI.luar;
        g += '<path d="' + Peta.dProv(p.kode, T, 1.2) + '" fill="' + warna + '" stroke="' + W.tinta + '" stroke-width="1.2" stroke-linejoin="round" class="' + (o.sorot === p.kode ? 'denyut' : '') + '"/>';
        if (o.terpilih === p.kode) g += '<path d="' + Peta.dProv(p.kode, T, 1.2) + '" fill="' + W.jingga + '" fill-opacity=".6"/>';
      });
    }
    if (o.labelPulau && !fokus) PULAU.forEach(function (nama) {
      var q = titikPulau(nama, T), geser = { Sumatra: [-10, -30], Jawa: [-40, 38], Kalimantan: [0, -6], Sulawesi: [10, -40], 'Bali dan Nusa Tenggara': [40, 42], Maluku: [0, -54], Papua: [0, -30] }[nama] || [0, 0];
      g += teks(q[0] + geser[0], q[1] + geser[1], nama, { ukuran: 22, judul: true, warna: W.tinta, tebalGaris: 6 });
    });
    if (o.labelProv && fokus) fokus.forEach(function (p) {
      var pr = Peta.prov(p), q = Peta.P(pr.label, T);
      g += teks(q[0], q[1] + 7, namaProv(pr), { ukuran: 20 });
    });
    return { svg: g, T: T };
  }

  /* o: kotak, prov, T, warna (true: lima warna; false: krem), sorot (kode kab berdenyut), terpilih, tandai {kode: warna isi}, label (true: nama di titik label) */
  function provinsi(o) {
    var D = Peta.data(), W = Seni.W, ISI = Seni.ISI, g = '';
    var kab = Peta.kabDi(o.prov).map(function (k) { return k.kode; });
    var T = o.T || Peta.pas(Peta.kotakKabUtama(kab), o.kotak, 16);
    /* tetangga di provinsi lain yang tampak: abu-abu rinci (batasnya pas) */
    var vx0 = T.vx, vy0 = T.vy, vx1 = T.vx + o.kotak.w / T.s, vy1 = T.vy + o.kotak.h / T.s;
    var luar = D.kab.filter(function (k) {
      if (k.prov === o.prov) return false;
      var r = k.jari * 6 + 4000; return k.titik[0] > vx0 - r && k.titik[0] < vx1 + r && k.titik[1] > vy0 - r && k.titik[1] < vy1 + r;
    }).map(function (k) { return k.kode; });
    luar.forEach(function (k) { g += '<path d="' + Peta.dKab(k, T, 2) + '" fill="' + ISI.luar + '" stroke="' + ISI.luar + '" stroke-width="1"/>'; });
    var wk = warnaKab(o.prov);
    kab.forEach(function (k) {
      var isi = o.tandai && o.tandai[k] ? o.tandai[k] : (o.warna === false ? ISI.kosong : ISI[wk[k]]);
      g += '<path d="' + Peta.dKab(k, T, 1.5) + '" fill="' + isi + '" stroke="' + isi + '" stroke-width="1" class="' + (o.sorot === k ? 'denyut' : '') + '"/>';
      if (o.terpilih === k) g += '<path d="' + Peta.dKab(k, T, 1.5) + '" fill="' + W.jingga + '" fill-opacity=".55"/>';
    });
    g += '<path d="' + Peta.dAir(T, 2) + '" fill="' + W.laut + '" stroke="' + W.tinta + '" stroke-width="2"/>';
    var semua = kab.concat(luar);
    g += '<path d="' + Peta.dBatasDalam(o.prov, T) + '" fill="none" stroke="' + W.tinta + '" stroke-opacity=".75" stroke-width="2" stroke-dasharray="7 6" stroke-linecap="round"/>';
    g += '<path d="' + Peta.dBusur(semua, T, 'prov') + '" fill="none" stroke="' + W.tinta + '" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>';
    g += '<path d="' + Peta.dBusur(semua, T, 'prov') + '" fill="none" stroke="' + W.jingga + '" stroke-width="1.6" stroke-dasharray="1 8" stroke-linecap="round"/>';
    g += '<path d="' + Peta.dBusur(semua, T, 'pantai') + '" fill="none" stroke="' + W.tinta + '" stroke-width="2.6" stroke-linejoin="round"/>';
    /* ibu kota provinsi */
    var pr = Peta.prov(o.prov);
    if (pr.ibukota && o.ibukota !== false) { var q = Peta.P(pr.ibukota.titik, T); g += Seni.ibuKota(q[0], q[1], 12); }
    if (o.label) kab.forEach(function (k) { var t = Peta.P(Peta.kab(k).titik, T); g += teks(t[0], t[1] + 7, Peta.kab(k).label, { ukuran: 20 }); });
    return { svg: g, T: T, kab: kab, luar: luar };
  }

  /* nama provinsi yang sama di peta, daftar, dan kalimat (DKI Jakarta, DI Yogyakarta; nama lain utuh) */
  function namaProv(p) { return Nama.prov(typeof p === 'string' ? Peta.prov(p) : p); }
  /* ketukan peta: poligon yang terkena (kena), kecuali ada wilayah mungil di layar (jari x skala <= 18 px) yang titik labelnya
     dalam 24 px dan jauh lebih dekat daripada label wilayah yang terkena. daftar: [{kode, titik, jari}] dalam satuan peta. */
  function sasaranKetuk(p, kena, daftar, T) {
    var terbaik = null, jarak = 24, byKode = {};
    daftar.forEach(function (w) {
      byKode[w.kode] = w;
      if (w.jari * T.s > 18) return;
      var q = Peta.P(w.titik, T), d2 = Math.hypot(q[0] - p.x, q[1] - p.y);
      if (d2 < jarak) { jarak = d2; terbaik = w.kode; }
    });
    if (!terbaik || terbaik === kena) return kena || terbaik;
    if (!kena || !byKode[kena]) return terbaik;
    var qk = Peta.P(byKode[kena].titik, T);
    return jarak < 0.5 * Math.hypot(qk[0] - p.x, qk[1] - p.y) ? terbaik : kena;
  }
  /* daftar sasaran provinsi untuk sasaranKetuk. jari = jari lingkaran dalam terbesar dari kabupaten/kotanya, bukan kotak pembatas,
     supaya provinsi bertanah sempit dengan pulau jauh (Sulawesi Utara, Gorontalo, Bali) tetap mendapat sasaran ketuk */
  var cacheProv = null;
  function daftarProv() {
    if (!cacheProv) cacheProv = Peta.data().provinsi.map(function (x) { return { kode: x.kode, titik: x.label, jari: Math.max.apply(null, Peta.kabDi(x.kode).map(function (k) { return k.jari; })) }; });
    return cacheProv;
  }
  root.PetaIndo = { namaProv: namaProv, sasaranKetuk: sasaranKetuk, daftarProv: daftarProv, PULAU: PULAU, WARNA_PULAU: WARNA_PULAU, kelompok: kelompok, indonesia: indonesia, provinsi: provinsi, warnaKab: warnaKab, warnaProv: warnaProv, esc: esc };
})(window);
