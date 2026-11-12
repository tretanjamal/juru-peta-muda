/* Level 5 Puzzle Provinsiku (GDD bagian 9; TP5 kabkotaku, TP6 nalar-letak, TP1 mata-angin).
   1. Puzzle: peta provinsi murid, wilayah murid terpasang, kartu nama tetangga (Teka.siapkanProvinsi), baki 4 kartu lebar 300 px.
      Wilayah sedaerah lain dan wilayah provinsi tetangga yang bersentuhan tampil abu-abu bernama.
   2. Detektif Letak: 5 pertanyaan pilihan (js/engine/detektif.js). Salah ke-1: pesan khusus + sorot di peta; salah ke-2: tangan menunjuk.
   Bintang dari kartu dan pertanyaan yang tepat pada coba pertama: 3 = 85%+, 2 = 60%+, 1 = selesai. */
(function () {
  var L5 = null;
  var POS_LANG = [1068, 602, 0.76];
  var KOTAK = { x: 28, y: 140, w: 816, h: 410 };

  function pecah(label) { var m = /^(Kab\. Adm\.|Kota Adm\.|Kab\.|Kota)\s+(.*)$/.exec(label); return m ? [m[1], m[2]] : ['', label]; }
  function n1(v) { return Math.round(v * 10) / 10; }

  /* Adaptor peta provinsi untuk Papan (js/scenes/papan.js) */
  function petaProvinsi(prov, kode, kartu, konteks, luar) {
    var W = Seni.W, ISI = Seni.ISI, wk = PetaIndo.warnaKab(prov);
    /* zoom: wilayah murid utuh ditambah titik label kartu (bukan seluruh luas kartu), supaya wilayah kecil di sekitarnya tetap cukup besar */
    var kb = Peta.kotakKabUtama([kode]);
    kartu.forEach(function (id) { var t = Peta.kab(id).titik; kb = [Math.min(kb[0], t[0]), Math.min(kb[1], t[1]), Math.max(kb[2], t[0]), Math.max(kb[3], t[1])]; });
    var T = Peta.pas(kb, KOTAK, 70);
    var semuaSasaran = [kode].concat(kartu, konteks);
    function titik(id) { var q = Peta.P(Peta.kab(id).titik, T); return { x: q[0], y: q[1] }; }
    function dalamKotak(t) { return t.x > KOTAK.x + 6 && t.x < KOTAK.x + KOTAK.w - 6 && t.y > KOTAK.y + 6 && t.y < KOTAK.y + KOTAK.h - 6; }
    /* plat nama: digeser bila menimpa plat lain, dengan tali dari pin */
    function platSemua(ids, warnaDari, cadang) {
      var kotakPakai = (cadang || []).slice(), g = '';
      ids.forEach(function (id) {
        var t = titik(id), lb = pecah(Peta.kab(id).label), lebar = Math.max(110, Math.round(Math.max(lb[1].length, 5) * 11.4 + 40)), tinggi = 56;
        var calon = [[0, 0], [0, 64], [0, -64], [lebar * 0.6 + 20, 20], [-lebar * 0.6 - 20, 20], [0, 120], [0, -120], [lebar * 0.6 + 20, -50], [-lebar * 0.6 - 20, -50]], pos = null;
        for (var i = 0; i < calon.length && !pos; i++) {
          var cx = t.x + calon[i][0], top = t.y - 4 + calon[i][1], k = [cx - lebar / 2, top, cx + lebar / 2, top + tinggi];
          if (k[0] < KOTAK.x + 4 || k[2] > KOTAK.x + KOTAK.w - 4 || k[1] < KOTAK.y + 4 || k[3] > KOTAK.y + KOTAK.h - 4) continue;
          if (kotakPakai.some(function (b) { return !(k[2] < b[0] || k[0] > b[2] || k[3] < b[1] || k[1] > b[3]); })) continue;
          pos = { cx: cx, top: top, k: k, geser: i > 0 };
        }
        if (!pos) pos = { cx: Math.min(Math.max(t.x, KOTAK.x + lebar / 2 + 4), KOTAK.x + KOTAK.w - lebar / 2 - 4), top: Math.min(Math.max(t.y - 4, KOTAK.y + 4), KOTAK.y + KOTAK.h - tinggi - 4), geser: true };
        if (pos.k) kotakPakai.push(pos.k);
        if (pos.geser) g += '<path d="M' + n1(t.x) + ' ' + n1(t.y) + 'L' + n1(pos.cx) + ' ' + n1(pos.top + 7) + '" stroke="' + W.tinta + '" stroke-width="2.4"/>';
        g += Seni.bentukPlat(pos.cx, pos.top, lebar, tinggi, warnaDari(id), lb[0], lb[1]);
        g += Seni.pin(t.x, t.y);
      });
      return { svg: g, kotak: kotakPakai };
    }
    /* label abu-abu yang muat pada gambar terakhir (yang tertutup plat atau label lain tidak tergambar) */
    var abuTampil = [], provTampil = [];
    /* nama provinsi tetangga di atas wilayah abu-abunya (satu per provinsi), di ruang yang masih kosong:
       dicoba di titik label kabupaten/kota provinsi itu yang paling luas lebih dulu */
    function labelProvLuar(luarSemua, kotakPakai) {
      var g = '', grup = {}; provTampil = [];
      luarSemua.forEach(function (id) { var pv = Peta.kab(id).prov; (grup[pv] = grup[pv] || []).push(id); });
      Object.keys(grup).forEach(function (pv) {
        var teks = Nama.prov(Peta.prov(pv)).toUpperCase(), w = teks.length * 13 + 16, pos = null;
        grup[pv].sort(function (a, b) { return Peta.kab(b).jari - Peta.kab(a).jari; });
        for (var i = 0; i < grup[pv].length && !pos; i++) {
          var t = titik(grup[pv][i]);
          [0, 30, -30].forEach(function (dy) {
            if (pos) return;
            var k = [t.x - w / 2, t.y + dy - 18, t.x + w / 2, t.y + dy + 8];
            if (k[0] < KOTAK.x + 4 || k[2] > KOTAK.x + KOTAK.w - 4 || k[1] < KOTAK.y + 4 || k[3] > KOTAK.y + KOTAK.h - 4) return;
            if (kotakPakai.some(function (b) { return !(k[2] < b[0] || k[0] > b[2] || k[3] < b[1] || k[1] > b[3]); })) return;
            pos = { x: t.x, y: t.y + dy, k: k };
          });
        }
        if (!pos) return;
        kotakPakai.push(pos.k); provTampil.push(pv);
        g += Seni.teks(pos.x, pos.y, teks, { ukuran: 20, warna: '#6E6B63', spasi: 1, tebal: true, garis: Seni.ISI.luar, tebalGaris: 5 });
      });
      return g;
    }
    function labelAbu(ids, kotakPakai) {
      var g = ''; abuTampil = [];
      ids.forEach(function (id) {
        var t = titik(id); if (!dalamKotak(t)) return;
        var teks = Peta.kab(id).label, w = teks.length * 9.6 + 10, k = [t.x - w / 2, t.y - 16, t.x + w / 2, t.y + 8];
        if (kotakPakai.some(function (b) { return !(k[2] < b[0] || k[0] > b[2] || k[3] < b[1] || k[1] > b[3]); })) return;
        kotakPakai.push(k); abuTampil.push(id);
        g += Seni.teks(t.x, t.y + 3, teks, { ukuran: 20, tebal: false, warna: '#5E5B53', garis: W.kertas, tebalGaris: 5 });
      });
      return g;
    }
    return {
      kotak: KOTAK, T: T, mawar: { cx: 792, cy: 192, r: 38 },
      abuTerlihat: function () { return abuTampil.slice(); },
      provTerlihat: function () { return provTampil.slice(); },
      ids: Peta.kabDi(prov).map(function (k) { return k.kode; }),
      label: function (id) { return pecah(Peta.kab(id).label); },
      titik: titik,
      /* ketukan: poligon yang terkena, atau wilayah mungil di dekatnya (PetaIndo.sasaranKetuk) */
      wilayahDi: function (x, y) { return PetaIndo.sasaranKetuk({ x: x, y: y }, Peta.kabPada(x, y, T, semuaSasaran), semuaSasaran.map(function (id) { return Peta.kab(id); }), T); },
      dWilayah: function (id) { return Peta.dKab(id, T, 1); },
      fitur: function () { return null; },
      svg: function (k) {
        var tandai = {}, bernama = Object.keys(k.bernama).filter(function (id) { return k.bernama[id]; });
        Peta.kabDi(prov).forEach(function (x) { tandai[x.kode] = '#EFE9DA'; });
        (k.abu || []).forEach(function (id) { tandai[id] = '#E3DED0'; });
        (k.kosong || []).forEach(function (id) { tandai[id] = ISI.kosong; });
        bernama.forEach(function (id) { tandai[id] = ISI[wk[id]]; });
        var r = PetaIndo.provinsi({ kotak: KOTAK, prov: prov, T: T, warna: false, tandai: tandai });
        /* sorot wilayah murid di dalam bingkai peta supaya garisnya terpotong rapi di tepi */
        var g = '<svg x="28" y="140" width="816" height="410" overflow="hidden"><g transform="translate(-28 -140)">' + r.svg + '<path d="' + Peta.dKab(kode, T, 1) + '" fill="none" stroke="' + W.jingga + '" stroke-width="4" stroke-linejoin="round"/></g></svg>';
        var urut = [kode].concat(bernama.filter(function (id) { return id !== kode; }));
        /* pin wilayah kosong dicadangkan dulu supaya plat dan label abu-abu tidak menutupinya; pin digambar paling atas */
        var cadang = (k.kosong || []).map(function (id) { var t = titik(id); return [t.x - 22, t.y - 22, t.x + 22, t.y + 22]; });
        var p = platSemua(urut, function (id) { return ISI[wk[id]]; }, cadang);
        g += labelAbu((k.abu || []).concat(luar), p.kotak);
        g += labelProvLuar(r.luar || [], p.kotak);
        g += p.svg;
        (k.kosong || []).forEach(function (id) { var t = titik(id); g += Seni.pinKosong(t.x, t.y, k.sorot === id ? 'denyut' : ''); });
        return g;
      }
    };
  }

  Scenes.add('level5', {
    enter: function (root) {
      var W = Seni.W, S = STR.l5, santai = Save.data.settings.santai, t0 = performance.now(), rnd = U.TEST ? U.rng(505) : Math.random;
      var wil = Save.data.wilayah && Save.data.wilayah.kab ? Save.data.wilayah : (Save.data.kelas && Save.data.kelas.kab ? Save.data.kelas : null);
      Aud.musik('jelajah'); Aud.pramuatJingle('lengkap');
      var latar = '<rect width="1280" height="720" fill="' + W.kayu + '"/><rect width="1280" height="720" fill="url(#pola-kayu)"/>' +
        '<rect x="16" y="106" width="840" height="504" rx="18" fill="' + W.tinta + '" opacity=".28"/><rect x="16" y="100" width="840" height="504" rx="18" fill="' + W.kertas + '" stroke="' + W.tinta + '" stroke-width="4"/>' +
        '<rect x="28" y="140" width="816" height="410" rx="6" fill="' + W.laut + '" stroke="' + W.biru + '" stroke-width="2.5"/><rect x="28" y="140" width="816" height="410" rx="6" fill="url(#pola-laut)"/>' +
        '<path d="M1036 378L1058 412L1080 378Z" fill="' + W.kertas + '" stroke="' + W.tinta + '" stroke-width="4" stroke-linejoin="round"/><path d="M1039 374H1077" stroke="' + W.kertas + '" stroke-width="6"/>';
      root.appendChild(U.h('div', 'lapis', Seni.svg(1280, 720, latar)));
      root.appendChild(U.h('h1', 'tersembunyi', UI.esc(U.fmt(STR.level.judul, { n: 5, nama: STR.level.nama[5] }))));
      var jp = U.h('p', 'judul-peta'); jp.style.cssText = 'left:28px;top:107px;width:816px'; jp.setAttribute('data-cek', 'judul peta'); root.appendChild(jp);
      var ct = U.h('p', 'catatan-peta', UI.esc(STR.peta.catatan)); ct.style.cssText = 'left:28px;top:566px;width:816px'; ct.setAttribute('data-cek', 'catatan peta'); root.appendChild(ct);
      var hud = UI.hud(root, { level: 5, sub: S.sub[0], jeda: { ulangi: function () { Scenes.go('level5'); } } });
      var lapis = Bersama.lapisHidup(root);
      var lang = Bersama.lang(lapis, POS_LANG[0], POS_LANG[1], POS_LANG[2], { eks: 'senang' });
      var langkah = 'muat', papan = null, teka = null, peta = null, langsung = 0, jumlah = 0, mis = {}, soal = [], nomor = 0, salahIni = 0, siap = false, petunjuk3 = 0;
      L5 = { hidup: true };

      if (!wil) {
        langkah = 'belum';
        hud.instruksi(S.belumPilih, false);
        root.appendChild(Input.button(UI.esc(S.keL4), 'utama', function () { Scenes.go('level4'); }, { x: 340, y: 320, w: 280, h: 72, font: 28, id: 'ke-l4' }));
        Bersama.ucap(S.belumPilih, { lang: lang, hud: hud });
        root.appendChild(lapis);
        return;
      }
      Peta.muat(function (ok) {
        if (!L5.hidup) return;
        if (!ok) { hud.instruksi(STR.l4.gagalMuat, false); return; }
        mulaiPuzzle();
      });

      /* ---------- 1. puzzle tetangga ---------- */
      function mulaiPuzzle() {
        langkah = 'teka';
        var k = Peta.kab(wil.kab), pr = Peta.prov(k.prov);
        teka = Teka.siapkanProvinsi(Peta.data(), wil.kab, { rnd: rnd });
        jp.textContent = U.fmt(S.judulPeta, { P: PetaIndo.namaProv(pr).toUpperCase() });
        hud.sub(S.sub[0]);
        peta = petaProvinsi(k.prov, wil.kab, teka.kartu, teka.konteks, teka.luar || []);
        papan = Papan.buat(root, {
          peta: peta, model: teka.model, kartu: teka.petunjuk.map(function (c) { return c.kartu; }), jangkar: wil.kab, konteks: teka.konteks, luar: teka.luar || [],
          petunjuk: teka.petunjuk, opsi: { profil: 'provinsi' }, hud: hud, lang: lang, posLang: POS_LANG, maksBaki: 4, lebarKartu: 300,
          tag: ['kabkotaku', 'nalar-letak'], tagArah: 'mata-angin', pandu: false, santai: santai, panjangBantu: 170, onSelesai: selesaiPuzzle
        });
        papan.mis = mis;
        root.appendChild(lapis);
        var kal = U.fmt(S.mulai, { K: k.label });
        hud.instruksi(kal, false);
        papan.mulai();
        if (Save.data.settings.bacakan) { Voice.stop(); Bersama.ucap(kal, { lang: lang, hud: hud }).then(function () { if (L5.hidup && langkah === 'teka') hud.instruksi(STR.teka.instruksi, false); }); }
        else Tween.wait(2600).then(function () { if (L5.hidup && langkah === 'teka') hud.instruksi(STR.teka.instruksi, false); });
      }
      function selesaiPuzzle(stat) {
        langkah = 'lengkap';
        langsung += stat.langsung; jumlah += stat.kartu; petunjuk3 += stat.p3.length;
        UI.idle.atur(function () { return null; });
        lang.pose('hinggap', 'bangga'); hud.potret('bangga');
        papan.gambarLengkap();
        hud.instruksi(S.lengkap, false);
        var c = U.h('div', 'cap-lengkap', Seni.svg(260, 260, Seni.cap(130, 130, 104, -12)));
        c.style.cssText = 'left:306px;top:216px'; root.appendChild(c);
        Aud.sfx('cap'); Aud.jingle('lengkap');
        var jadi = UI.kurangi ? Promise.resolve() : Tween.run(420, function (e) { c.style.scale = (2.2 - 1.2 * e).toFixed(3); c.style.opacity = Math.min(1, e * 2); }, Ease.easeOutBack);
        jadi.then(function () { return Promise.all([Bersama.ucap(S.lengkap, { lang: lang, hud: hud, eks: 'bangga' }), Tween.wait(1700)]); }).then(function () {
          if (!L5.hidup) return;
          c.remove();
          mulaiDetektif();
        });
      }

      /* ---------- 2. Detektif Letak ---------- */
      var lapisPeta = null, bantu = null, kartuTanya = null, daftarPilihan = null, Tz = null;
      function mulaiDetektif() {
        langkah = 'detektif';
        papan.bersihkan();
        lapisPeta = U.h('div', 'lapis lapis-peta'); root.insertBefore(lapisPeta, lapis);
        bantu = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        bantu.setAttribute('width', 1280); bantu.setAttribute('height', 720); bantu.setAttribute('viewBox', '0 0 1280 720'); bantu.setAttribute('class', 'lapis-bantu-teka'); bantu.setAttribute('aria-hidden', 'true');
        root.insertBefore(bantu, lapis);
        kartuTanya = U.h('div', 'panel kartu-petunjuk kartu-detektif');
        kartuTanya.style.cssText = 'left:872px;top:100px;width:392px;height:504px';
        kartuTanya.innerHTML = '<div class="kepala"><span class="nomor" data-cek="nomor detektif"></span></div><p class="kalimat tanya-detektif" data-cek="pertanyaan detektif"></p><div class="pilihan-detektif"></div>';
        kartuTanya.appendChild(UI.tombolIkon('dengar', STR.ikon.dengarPetunjuk, function () { Voice.stop(); UI.bacakan(soal[nomor] ? soal[nomor].teks : '', true); }, { id: 'dengar-detektif', cls: 'tombol-petunjuk' }));
        root.insertBefore(kartuTanya, lapis);
        UI.masuk(kartuTanya);
        daftarPilihan = kartuTanya.querySelector('.pilihan-detektif');
        /* Lang pindah ke pojok kanan bawah supaya kartu pertanyaan utuh */
        lang.terbangKe(1210, 712, 0.42, 500);
        /* pertanyaan membaca peta hanya memakai wilayah yang namanya terbaca di peta Detektif: plat nama, atau label abu-abu yang muat.
           tingkat dari hasil puzzle: kesulitan = jenis membaca peta yang lebih mudah dulu, lancar = yang lebih menantang dulu */
        var bernamaD = {}; [wil.kab].concat(teka.kartu).forEach(function (id) { bernamaD[id] = true; });
        peta.svg({ bernama: bernamaD, abu: teka.konteks, kosong: [] });   // sama dengan gambar peta Detektif, untuk mencatat label yang muat
        var abuOk = peta.abuTerlihat(), provOk = peta.provTerlihat(), terlihat = function (id) { return !!bernamaD[id] || abuOk.indexOf(id) >= 0; };
        var rasio = jumlah ? langsung / jumlah : 1, tingkat = petunjuk3 > 0 || rasio < 0.5 ? 0 : rasio >= 0.85 ? 2 : 1;
        soal = Detektif.buat(Peta.data(), wil.kab, { rnd: rnd, STR: STR, tingkat: tingkat, tampilProv: provOk, tampil: [wil.kab].concat(teka.kartu, teka.konteks, teka.luar || []).filter(function (id, i) { return i === 0 || terlihat(id); }) });
        L5.tingkat = tingkat;
        nomor = 0;
        hud.sub(S.sub[1]);
        Bersama.ucap(S.detektif, { lang: lang, hud: hud }).then(function () { });
        hud.instruksi(S.detektif, false);
        tampilSoal();
      }
      function gambarPetaDetektif(q, sorot) {
        var k = Peta.kab(wil.kab), isi;
        if (q && q.zoomProvinsi) {
          var r = PetaIndo.provinsi({ kotak: KOTAK, prov: k.prov, warna: true, tandai: (function () { var t = {}; t[wil.kab] = W.jinggaTerang; return t; })() });
          Tz = r.T;
          isi = '<svg x="28" y="140" width="816" height="410" overflow="hidden"><g transform="translate(-28 -140)">' + r.svg + '</g></svg>';
          var pr = Peta.prov(k.prov);
          if (pr.ibukota) { var qi = Peta.P(pr.ibukota.titik, Tz); isi += Seni.teks(qi[0], qi[1] - 18, pr.ibukota.nama, { ukuran: 20, garis: W.kertas, tebalGaris: 5 }); }
          var qk = Peta.P(k.titik, Tz); isi += Seni.teks(qk[0], qk[1] + 8, k.label, { ukuran: 20, garis: W.kertas, tebalGaris: 5 });
        } else {
          Tz = peta.T;
          var bernama = {}; [wil.kab].concat(teka.kartu).forEach(function (id) { bernama[id] = true; });
          isi = peta.svg({ bernama: bernama, abu: teka.konteks, kosong: [] });
        }
        isi += '<g class="mawar-peta">' + Seni.mawarAngin(792, 192, 38, { label8: false }) + '</g>';
        lapisPeta.innerHTML = Seni.svg(1280, 720, isi);
        bantu.innerHTML = sorot ? sorotSoal(q) : '';
      }
      function titikDi(id) { var q = Peta.P(Peta.kab(id).titik, Tz); return { x: q[0], y: q[1] }; }
      function sorotSoal(q) {
        var s = '', so = q.sorot || {};
        (so.wilayah || []).forEach(function (id) { s += '<path d="' + Peta.dKab(id, Tz, 1) + '" class="sorot-acuan"/>'; });
        if (so.acuan) { var t = titikDi(so.acuan); s += '<circle cx="' + n1(t.x) + '" cy="' + n1(t.y) + '" r="28" class="cincin-acuan-teka"/>'; if (so.arah != null) s += Seni.garisBantu(t.x, t.y, 170, so.arah); }
        return s;
      }
      function tampilSoal() {
        if (!L5.hidup) return;
        if (nomor >= soal.length) return selesai();
        var q = soal[nomor];
        salahIni = 0; siap = true;
        hud.kemajuan(nomor, soal.length);
        kartuTanya.querySelector('.nomor').textContent = U.fmt(S.kepala, { i: nomor + 1, n: soal.length });
        var kal = kartuTanya.querySelector('.tanya-detektif');
        kal.textContent = q.teks; Papan.pasKan(kal, 26, 20);
        daftarPilihan.innerHTML = '';
        q.pilihan.forEach(function (p, i) {
          var b = Input.button(UI.esc(p.teks), 'ketiga tombol-pilihan', function () { if (siap) jawab(p, b); }, { id: 'pilihan-' + i });
          b.dataset.benar = p.benar ? '1' : '';
          daftarPilihan.appendChild(b);
          var badan = b.querySelector('.badan'); Papan.pasKan(badan, 24, 20); UI.masuk(b, i + 1);
        });
        gambarPetaDetektif(q, false);
        lang.eks('senang'); hud.potret('senang');
        /* pertanyaan lengkap ada di kartu; papan instruksi cukup ajakan singkat (nama wilayah bisa sangat panjang) */
        hud.instruksi(S.pilihJawaban, false);
        if (Save.data.settings.bacakan) { Voice.stop(); Bersama.ucap(q.teks, { lang: lang, hud: hud }); }
        UI.idle.atur(function () { return siap ? daftarPilihan.querySelector('.tombol-pilihan:not(:disabled)') : null; });
      }
      var TAG_TAMBAH = { tetanggaDiArah: 'mata-angin', arahTetangga: 'mata-angin', arahDariTetangga: 'mata-angin', arahIbukota: 'mata-angin', provinsiTetangga: 'provinsiku', ibukotaProvinsi: 'provinsiku', provinsiku: 'provinsiku', pulau: 'provinsiku' };
      var MIS = { berlawanan: 'berlawanan', 'arah-antara': 'arah-antara', 'arah-lain': 'arah-lain', 'bukan-tetangga': 'bukan-tetangga', 'ibukota-provinsi': 'ibukota-provinsi', 'provinsi-bukan-tetangga': 'bukan-tetangga' };
      function jawab(p, b) {
        var q = soal[nomor];
        UI.idle.reset(); Voice.stop();
        if (p.benar) {
          siap = false;
          var lgs = salahIni === 0;
          jumlah++; if (lgs) langsung++;
          Save.catat('kabkotaku', lgs); if (TAG_TAMBAH[q.jenis]) Save.catat(TAG_TAMBAH[q.jenis], lgs);
          Aud.sfx('good'); UI.lompat(b); var t = UI.titik(b); if (t) UI.ledak(t.x, t.y, 12);
          b.classList.add('pilihan-benar');
          Array.prototype.forEach.call(daftarPilihan.querySelectorAll('button'), function (x) { x.disabled = true; });
          UI.sembunyiTangan(true);
          lang.pose('hinggap', 'sorak'); hud.potret('sorak');
          hud.keping(lgs ? 10 : 5); hud.kemajuan(nomor + 1, soal.length);
          gambarPetaDetektif(q, true);
          hud.instruksi(q.benarTeks, false);
          Promise.all([Bersama.ucap(q.benarTeks, { lang: lang, hud: hud, eks: 'sorak' }), Tween.wait(1300)]).then(function () { if (!L5.hidup) return; lang.eks('senang'); nomor++; tampilSoal(); });
          return;
        }
        salahIni++;
        Save.catatSalah('kabkotaku'); if (TAG_TAMBAH[q.jenis]) Save.catatSalah(TAG_TAMBAH[q.jenis]);
        if (MIS[p.salah]) { Save.catatMis(MIS[p.salah]); mis[MIS[p.salah]] = (mis[MIS[p.salah]] || 0) + 1; }
        Aud.sfx('bad'); UI.goyang(b); b.disabled = true;
        lang.eks('berpikir'); hud.potret('berpikir');
        var teks = p.pesan || STR.teka.salah.umum;
        gambarPetaDetektif(q, true);
        if (salahIni >= 2 || santai) {
          var benarEl = daftarPilihan.querySelector('[data-benar="1"]');
          if (salahIni >= 2 && benarEl) { UI.tunjuk(benarEl); teks = S.tunjuk; petunjuk3++; }
        }
        hud.instruksi(teks, false);
        Bersama.ucap(teks, { lang: lang, hud: hud, eks: 'berpikir' });
      }
      function selesai() {
        langkah = 'selesai'; siap = false;
        var rasio = jumlah ? langsung / jumlah : 1, bintang = rasio >= 0.85 ? 3 : rasio >= 0.6 ? 2 : 1;
        Save.catatLevel(5, { selesai: true, bintang: bintang, petunjuk3: petunjuk3, detik: Math.round((performance.now() - t0) / 1000) });
        var tip = Object.keys(mis).filter(function (k) { return STR.hasil.tip[k]; }).sort(function (a, b) { return mis[b] - mis[a]; })[0] || '';
        lang.pose('hinggap', 'bangga'); hud.potret('bangga');
        hud.instruksi(S.selesai, false);
        Promise.all([Bersama.ucap(S.selesai, { lang: lang, hud: hud, eks: 'bangga' }), Tween.wait(1400)]).then(function () { if (L5.hidup) Scenes.go('hasil', { level: 5, bintang: bintang, tip: tip }); });
      }

      L5.keadaan = function () {
        if (langkah === 'teka' && papan) { var k = papan.keadaan(); k.langkah = 'teka'; return k; }
        return { langkah: langkah, siap: siap, nomor: nomor, jumlah: soal.length, jenis: soal[nomor] && soal[nomor].jenis, salah: salahIni };
      };
      L5.benar = function () {
        if (langkah === 'teka' && papan) return papan.benar();
        if (langkah === 'belum') return ['ke-l4'];
        if (langkah !== 'detektif' || !siap) return [];
        var i = soal[nomor].pilihan.findIndex(function (p) { return p.benar; });
        return ['pilihan-' + i];
      };
      L5.salah = function () {
        if (langkah === 'teka' && papan) return papan.salah();
        if (langkah !== 'detektif' || !siap) return [];
        var i = soal[nomor].pilihan.findIndex(function (p, j) { return !p.benar && !daftarPilihan.querySelector('[data-id="pilihan-' + j + '"]').disabled; });
        return i >= 0 ? ['pilihan-' + i] : [];
      };
    },
    exit: function () { if (L5) L5.hidup = false; UI.sembunyiTangan(true); },
    uji: {
      keadaan: function () { return L5 && L5.keadaan ? L5.keadaan() : { langkah: '', siap: false }; },
      benar: function () { return L5 && L5.benar ? L5.benar() : []; },
      salah: function () { return L5 && L5.salah ? L5.salah() : []; }
    }
  });
})();
