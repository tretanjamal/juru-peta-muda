/* Level 2 Baca Peta (GDD bagian 9; TP2 baca-peta, TP1 mata-angin). Pulau Latihan bernama lengkap, legenda penuh di kanan.
   1 judul peta (pilihan) · 2 simbol ibu kota (ketuk) · 3 garis batas provinsi (ketuk, pengecoh garis putus-putus)
   4 gunung atau sungai (ketuk) · 5-6 skala dengan penggaris bertali (pilihan, kelipatan 10 km)
   7-8 peta diputar 90 derajat, mawar angin ikut berputar (ketuk wilayah di arah yang diminta; miskonsepsi "utara selalu di atas").
   Soal yang dibantu petunjuk ke-3 diulang dalam bentuk serupa di akhir (maks. 2). Bintang dari benar coba pertama: 3 = 7+, 2 = 5+. */
(function () {
  var L2 = null;
  var POS_LANG = [1180, 706, 0.5];
  var KOTAK = { x: 28, y: 140, w: 816, h: 410 }, PUSAT = { x: 436, y: 345 };
  /* titik fitur (satuan peta Pulau Latihan) */
  var FITUR = {
    ibukota: [466, 326], gunung1: [338, 196], gunung2: [372, 218], gunung3: [150, 300], gunung4: [184, 326],
    sungai1: [438, 304], sungai2: [404, 268], sungai3: [599, 171.5], danau: [618, 228],
    prov: [842, 330], kab1: [302.3, 244.6], kab2: [637.4, 255.2], kab3: [396.8, 462.3], kab4: [530, 184], kab5: [283, 424.1],
    camar: [466, 176], damar: [566, 326]
  };
  function jenisFitur(k) { return k.replace(/[0-9]+$/, ''); }
  function n1(v) { return Math.round(v * 10) / 10; }
  /* putar 90 derajat searah jarum jam di sekitar PUSAT, dan kebalikannya */
  function putar(p) { return { x: PUSAT.x - (p.y - PUSAT.y), y: PUSAT.y + (p.x - PUSAT.x) }; }
  function balik(p) { return { x: PUSAT.x + (p.y - PUSAT.y), y: PUSAT.y - (p.x - PUSAT.x) }; }

  Scenes.add('level2', {
    enter: function (root) {
      var W = Seni.W, S = STR.l2, P = PULAU_LATIHAN, K = window.KonfigPulau[0], santai = Save.data.settings.santai, t0 = performance.now(), rnd = U.TEST ? U.rng(202) : Math.random;
      var m = Teka.modelPulau(P);
      Aud.musik('jelajah'); Aud.pramuatJingle('lengkap');
      var semuaWarna = {}; m.ids.forEach(function (id) { semuaWarna[id] = true; });
      var peta = Papan.petaPulau(P, { x: KOTAK.x, y: KOTAK.y, w: KOTAK.w, h: KOTAK.h, vb: K.kotak.vb, gaya: K.gaya, gantung: K.gantung, ombak: K.ombak, posLaut: K.posLaut, posLuar: K.posLuar, fitur: FITUR, mawar: { cx: 772, cy: 208, r: 46 } });
      /* peta diputar: kotak pandang dirapatkan ke pulau (provinsi tetangga di timur terpotong bingkai) supaya peta tegak 410 px tingginya */
      var VB_PUTAR = [36, 108, 810, 500], KOTAK_PUTAR = { x: PUSAT.x - 200, y: PUSAT.y - 123.5, w: 400, h: 247 };
      var petaR = Papan.petaPulau(P, { x: KOTAK_PUTAR.x, y: KOTAK_PUTAR.y, w: KOTAK_PUTAR.w, h: KOTAK_PUTAR.h, vb: VB_PUTAR, gaya: K.gaya, gantung: {}, fitur: FITUR });
      var s = Math.min(KOTAK.w / K.kotak.vb[2], KOTAK.h / K.kotak.vb[3]), ruasPx = (P.skala.ruas / P.skala.kmPerSatuan) * s;

      var latar = '<rect width="1280" height="720" fill="' + W.kayu + '"/><rect width="1280" height="720" fill="url(#pola-kayu)"/>' +
        '<rect x="16" y="106" width="840" height="504" rx="18" fill="' + W.tinta + '" opacity=".28"/><rect x="16" y="100" width="840" height="504" rx="18" fill="' + W.kertas + '" stroke="' + W.tinta + '" stroke-width="4"/>' +
        '<rect x="28" y="140" width="816" height="410" rx="6" fill="' + W.laut + '" stroke="' + W.biru + '" stroke-width="2.5"/><rect x="28" y="140" width="816" height="410" rx="6" fill="url(#pola-laut)"/>';
      root.appendChild(U.h('div', 'lapis', Seni.svg(1280, 720, latar)));
      root.appendChild(U.h('h1', 'tersembunyi', UI.esc(U.fmt(STR.level.judul, { n: 2, nama: STR.level.nama[2] }))));
      var jp = U.h('p', 'judul-peta'); jp.style.cssText = 'left:28px;top:107px;width:816px'; jp.setAttribute('data-cek', 'judul peta'); root.appendChild(jp);
      var ct = U.h('p', 'catatan-peta', UI.esc(STR.peta.catatan)); ct.style.cssText = 'left:28px;top:566px;width:816px'; ct.setAttribute('data-cek', 'catatan peta'); root.appendChild(ct);
      var hud = UI.hud(root, { level: 2, sub: U.fmt(S.sub, { i: 1, n: 8 }), jeda: { ulangi: function () { Scenes.go('level2'); } } });
      var lapisPeta = U.h('div', 'lapis lapis-peta'); root.appendChild(lapisPeta);
      var bantu = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      bantu.setAttribute('width', 1280); bantu.setAttribute('height', 720); bantu.setAttribute('viewBox', '0 0 1280 720'); bantu.setAttribute('class', 'lapis-bantu-teka'); bantu.setAttribute('aria-hidden', 'true');
      root.appendChild(bantu);
      var tangkap = U.h('div', 'tangkap-peta'); tangkap.style.cssText = 'left:' + KOTAK.x + 'px;top:' + KOTAK.y + 'px;width:' + KOTAK.w + 'px;height:' + KOTAK.h + 'px';
      root.appendChild(tangkap);
      var lapisTombol = U.h('div', 'lapis lapis-pin'); root.appendChild(lapisTombol);
      /* legenda penuh */
      var leg = U.h('div', 'panel-kanan panel-legenda-l2'); leg.style.cssText = 'left:872px;top:100px;width:392px;height:452px';
      function ik(isi, w) { return '<svg width="' + w + '" height="30" viewBox="0 0 ' + w + ' 30" aria-hidden="true">' + isi + '</svg>'; }
      var L = S.legenda, baris = {
        ibukota: ik(Seni.ibuKota(20, 15, 12), 40), kota: ik('<circle cx="20" cy="15" r="7" fill="' + W.kertas + '" stroke="' + W.tinta + '" stroke-width="3.5"/>', 40),
        prov: ik('<path d="M3 15H37" stroke="' + W.tinta + '" stroke-width="7" stroke-linecap="round"/><path d="M3 15H37" stroke="' + W.jingga + '" stroke-width="2" stroke-dasharray="1 9" stroke-linecap="round"/>', 40),
        kab: ik('<path d="M3 15H37" stroke="' + W.tinta + '" stroke-width="2.6" stroke-dasharray="9 7" stroke-linecap="round"/>', 40),
        sungai: ik('<path d="M3 17Q12 9 20 15T37 13" fill="none" stroke="' + W.tinta + '" stroke-width="7" stroke-linecap="round"/><path d="M3 17Q12 9 20 15T37 13" fill="none" stroke="' + W.laut + '" stroke-width="3.6" stroke-linecap="round"/>', 40),
        gunung: ik(Seni.gunung(20, 24, 0.75), 40), danau: ik('<ellipse cx="20" cy="15" rx="15" ry="9" fill="' + W.laut + '" stroke="' + W.tinta + '" stroke-width="3"/>', 40),
        skala: ik('<path d="M3 20H' + n1(ruasPx * 2 + 3) + '" stroke="' + W.tinta + '" stroke-width="3"/><path d="M3 20H' + n1(ruasPx + 3) + '" stroke="' + W.tinta + '" stroke-width="9"/><path d="M3 12V25M' + n1(ruasPx + 3) + ' 14V25M' + n1(ruasPx * 2 + 3) + ' 12V25" stroke="' + W.tinta + '" stroke-width="3"/>', Math.ceil(ruasPx * 2 + 8))
      };
      leg.innerHTML = '<p class="judul-panel" data-cek="judul legenda">' + UI.esc(S.legendaJudul) + '</p>' + Object.keys(baris).map(function (k) { return '<div class="baris-legenda-l2" data-k="' + k + '">' + baris[k] + '<span data-cek="legenda ' + k + '">' + UI.esc(L[k]) + '</span></div>'; }).join('');
      root.appendChild(leg);
      var bawah = U.h('div', 'lapis lapis-pin'); root.appendChild(bawah);
      var lapis = Bersama.lapisHidup(root);
      var lang = Bersama.lang(lapis, POS_LANG[0], POS_LANG[1], POS_LANG[2], { eks: 'senang' });

      /* daftar soal */
      var simbol = rnd() < 0.5 ? 'gunung' : 'sungai';
      var DASAR = [
        { jenis: 'judul' }, { jenis: 'ibukota' }, { jenis: 'batas' }, { jenis: 'simbol', target: simbol },
        { jenis: 'skala', A: 'ibukota', B: 'camar', nB: S.kotaCamar }, { jenis: 'skala', A: 'ibukota', B: 'damar', nB: STR.l2.desaDamar || 'Desa Damar' },
        { jenis: 'putar', arah: 0, sasaran: 'camar' }, { jenis: 'putar', arah: 2, sasaran: 'hutandamar' }
      ];
      var daftar = DASAR.slice(), nomor = 0, q = null, salah = 0, siap = false, langsung = 0, petunjuk3 = 0, tambahan = 0, mis = {};
      /* adaptif (3 benar beruntun naik, 2 salah beruntun turun): murid yang lancar mendapat arah diagonal di soal ke-8 */
      var ad = new Adaptif(0, 1, 0), DIAGONAL = [[1, 'danauteduh'], [5, 'lembahmawar'], [7, 'gunungawan']];
      L2 = { hidup: true };
      function bacakan(t, eks) { return Save.data.settings.bacakan ? Bersama.ucap(t, { lang: lang, hud: hud, eks: eks }) : Promise.resolve(); }
      function tebal(t, kata) { var h = UI.esc(t), k = UI.esc(kata || ''), i = kata ? h.indexOf(k) : -1; return i < 0 ? h : h.slice(0, i) + '<b>' + k + '</b>' + h.slice(i + k.length); }

      /* ---------- gambar ---------- */
      function gambarPeta(o) {
        o = o || {};
        var isi;
        if (q && q.jenis === 'putar') {
          var dasar = Seni.petaDari(P, { x: KOTAK_PUTAR.x, y: KOTAK_PUTAR.y, w: KOTAK_PUTAR.w, h: KOTAK_PUTAR.h, vb: VB_PUTAR, berwarna: semuaWarna, gaya: K.gaya, labelLuar: false, ibukota: true, gunung: false });
          /* dipotong ke bingkai peta; simbol gunung digambar tegak di posisi yang sudah diputar */
          isi = '<clipPath id="klip-putar"><rect x="' + KOTAK.x + '" y="' + KOTAK.y + '" width="' + KOTAK.w + '" height="' + KOTAK.h + '" rx="6"/></clipPath><g clip-path="url(#klip-putar)"><g transform="rotate(90 ' + PUSAT.x + ' ' + PUSAT.y + ')">' + dasar.svg + '</g>';
          P.bentang.gunung.forEach(function (gn) { var q0 = dasar.P(gn.titik), qg = putar({ x: q0[0], y: q0[1] }); isi += Seni.gunung(qg.x, qg.y, gn.besar * Math.max(0.7, dasar.s)); });
          isi += '</g>';
          var ik2 = putar(petaR.fitur('ibukota'));
          isi += Seni.teks(ik2.x + 4, ik2.y - 20, 'Kota Pelangi', { ukuran: 20, garis: W.kertas, tebalGaris: 5 });
          isi += '<g class="mawar-peta' + (o.kedip ? ' kedip-mawar' : '') + '">' + Seni.mawarAngin(744, 230, 56, { rotasi: 90, label8: false }) + '</g>';
        } else {
          isi = peta.svg({ bernama: semuaWarna, kosong: [] });
          isi += '<circle cx="' + n1(peta.fitur('camar').x) + '" cy="' + n1(peta.fitur('camar').y) + '" r="7" fill="' + W.kertas + '" stroke="' + W.tinta + '" stroke-width="3.5"/>';
          var dm = peta.fitur('damar');
          if (q && q.jenis === 'skala' && q.B === 'damar') isi += '<circle cx="' + n1(dm.x) + '" cy="' + n1(dm.y) + '" r="7" fill="' + W.kertas + '" stroke="' + W.tinta + '" stroke-width="3.5"/>' + Seni.teks(dm.x + 6, dm.y + 28, STR.l2.desaDamar || 'Desa Damar', { ukuran: 20, garis: W.kertas, tebalGaris: 5 });
          isi += '<g class="mawar-peta' + (o.kedip ? ' kedip-mawar' : '') + '">' + Seni.mawarAngin(772, 208, 46, { label8: false }) + '</g>';
          if (q && q.jenis === 'skala') isi += penggaris(peta.fitur(q.A), peta.fitur(q.B), o.angka);
        }
        lapisPeta.innerHTML = Seni.svg(1280, 720, isi);
      }
      /* penggaris bertali dengan ruas 10 km (berselang hitam-putih); angka ruas tampil sebagai bantuan setelah salah */
      function penggaris(a, b, angka) {
        var dx = b.x - a.x, dy = b.y - a.y, pj = Math.hypot(dx, dy), n = Math.round(pj / ruasPx), ux = dx / pj, uy = dy / pj, nx = -uy * 10, ny = ux * 10, g = '';
        g += '<path d="M' + n1(a.x) + ' ' + n1(a.y) + 'L' + n1(b.x) + ' ' + n1(b.y) + '" stroke="' + W.tinta + '" stroke-width="20" stroke-linecap="round"/><path d="M' + n1(a.x) + ' ' + n1(a.y) + 'L' + n1(b.x) + ' ' + n1(b.y) + '" stroke="' + W.kertas + '" stroke-width="14" stroke-linecap="round"/>';
        for (var i = 0; i < n; i++) {
          var x1 = a.x + ux * ruasPx * i, y1 = a.y + uy * ruasPx * i, x2 = a.x + ux * ruasPx * (i + 1), y2 = a.y + uy * ruasPx * (i + 1);
          g += '<path d="M' + n1(x1) + ' ' + n1(y1) + 'L' + n1(x2) + ' ' + n1(y2) + '" stroke="' + (i % 2 ? W.jinggaTerang : W.tinta) + '" stroke-width="10"/>';
          if (angka) g += Seni.teks((x1 + x2) / 2 + nx * 2.4, (y1 + y2) / 2 + ny * 2.4 + 7, String(i + 1), { ukuran: 20, judul: true, warna: W.jinggaGelap, garis: W.kertas, tebalGaris: 5 });
        }
        for (var j = 0; j <= n; j++) { var x = a.x + ux * ruasPx * j, y = a.y + uy * ruasPx * j; g += '<path d="M' + n1(x - nx) + ' ' + n1(y - ny) + 'L' + n1(x + nx) + ' ' + n1(y + ny) + '" stroke="' + W.tinta + '" stroke-width="3"/>'; }
        g += '<path d="M' + n1(a.x) + ' ' + n1(a.y) + 'L' + n1(b.x) + ' ' + n1(b.y) + '" stroke="' + W.tinta + '" stroke-width="2.5" fill="none" stroke-dasharray="0" opacity=".0"/>';
        return g;
      }
      function sorotLegenda(k) { Array.prototype.forEach.call(leg.querySelectorAll('.baris-legenda-l2'), function (e) { e.classList.toggle('sorot-legenda', e.dataset.k === k); }); }

      /* ---------- tombol ketuk fitur dan pilihan ---------- */
      function pinFitur(daftarK) {
        lapisTombol.innerHTML = '';
        daftarK.forEach(function (k) {
          var t = peta.fitur(k), b = U.h('button', 'pin-wilayah pin-fitur');
          b.type = 'button'; b.dataset.id = 'fitur-' + k; b.dataset.fitur = k;
          b.style.left = Math.round(t.x - 24) + 'px'; b.style.top = Math.round(t.y - 24) + 'px';
          b.setAttribute('aria-label', S.fitur[jenisFitur(k)] || k);
          b.addEventListener('click', function () { if (siap) ketukFitur(k, b); });
          lapisTombol.appendChild(b);
        });
      }
      function pinWilayahPutar() {
        lapisTombol.innerHTML = '';
        m.ids.forEach(function (id, i) {
          var t = putar(petaR.titik(id)), b = U.h('button', 'pin-wilayah pin-kibor');
          b.type = 'button'; b.dataset.id = 'putar-' + id;
          b.style.left = Math.round(t.x - 32) + 'px'; b.style.top = Math.round(t.y - 32) + 'px';
          b.setAttribute('aria-label', U.fmt(STR.l4.aria.wilayah, { n: i + 1 }));
          b.addEventListener('click', function () { if (siap) ketukWilayahPutar(id); });
          lapisTombol.appendChild(b);
        });
      }
      tangkap.addEventListener('click', function (e) {
        if (!siap || !q || q.jenis !== 'putar') return;
        var p = balik(Stage.toLocal(e.clientX, e.clientY)), id = petaR.wilayahDi(p.x, p.y);
        if (id) ketukWilayahPutar(id);
      });
      function pilihan(teks, i) {
        var b = Input.button(UI.esc(teks), 'ketiga tombol-pilihan', function () { if (siap) jawabPilihan(i, b); }, { x: 28 + i * 276, y: 618, w: 264, h: 80, font: 24, id: 'pilihan-' + i });
        bawah.appendChild(b);
        UI.masuk(b, i);
        return b;
      }

      /* ---------- soal ---------- */
      function tampilkan() {
        if (!L2.hidup) return;
        if (nomor >= daftar.length) return selesai();
        q = daftar[nomor];
        if (nomor === 7 && q.jenis === 'putar' && !q.ulang && ad.t >= 1) { var dg = DIAGONAL[Math.floor(rnd() * DIAGONAL.length)]; q = daftar[nomor] = { jenis: 'putar', arah: dg[0], sasaran: dg[1], diagonal: true }; }
        salah = 0; siap = true; q.p3 = false;
        lapisTombol.innerHTML = ''; bawah.innerHTML = ''; bantu.innerHTML = ''; sorotLegenda(null); jp.classList.remove('denyut');
        hud.sub(U.fmt(S.sub, { i: nomor + 1, n: daftar.length })); hud.kemajuan(nomor, daftar.length);
        jp.textContent = q.jenis === 'putar' ? S.judulDiputar : S.judulPeta;
        lang.eks('senang'); hud.potret('senang');
        gambarPeta();
        if (q.jenis === 'putar' && (!daftar[nomor - 1] || daftar[nomor - 1].jenis !== 'putar')) UI.pudarMasuk(lapisPeta);
        var teks;
        if (q.jenis === 'judul') { teks = S.judul.tanya; q.opsi = [0, 1, 2].sort(function () { return rnd() - 0.5; }); q.opsi.forEach(function (o, i) { pilihan(S.judul.pilihan[o], i); }); }
        else if (q.jenis === 'ibukota') { teks = S.ibukota.tanya; pinFitur(['ibukota', 'gunung1', 'danau', 'sungai2', 'camar']); }
        else if (q.jenis === 'batas') { teks = S.batas.tanya; pinFitur(['prov', 'kab1', 'kab2', 'kab3', 'kab4', 'kab5', 'sungai3']); }
        else if (q.jenis === 'simbol') { teks = S.simbol[q.target]; pinFitur(['gunung1', 'gunung3', 'sungai2', 'sungai3', 'danau']); }
        else if (q.jenis === 'skala') {
          var a = peta.fitur(q.A), b = peta.fitur(q.B); q.ruas = Math.round(Math.hypot(b.x - a.x, b.y - a.y) / ruasPx); q.km = q.ruas * 10;
          teks = U.fmt(S.skala.tanya, { A: 'Kota Pelangi', B: q.nB });
          var opsi = [q.km, q.ruas, q.km === 20 ? 40 : 20];
          q.opsi = opsi.map(function (v, i) { return { v: v, i: i }; }).sort(function () { return rnd() - 0.5; });
          q.opsi.forEach(function (o, i) { pilihan(U.fmt(S.skala.satuan, { n: o.v }), i); });
          sorotLegenda('skala');
        } else if (q.jenis === 'putar') { teks = U.fmt(S.putar.tanya, { arah: STR.arah[q.arah] }); pinWilayahPutar(); }
        q.teks = teks;
        hud.instruksi(teks, false, tebal(teks, q.jenis === 'putar' ? STR.arah[q.arah] : null));
        bacakan(teks);
        UI.idle.atur(function () { return siap ? (bawah.querySelector('.tombol') || lapisTombol.querySelector('.pin-wilayah:not(.pin-kibor)')) : null; });
      }
      function benarnya() {
        if (q.jenis === 'judul') return 'pilihan-' + q.opsi.indexOf(0);
        if (q.jenis === 'skala') return 'pilihan-' + q.opsi.findIndex(function (o) { return o.i === 0; });
        if (q.jenis === 'ibukota') return 'fitur-ibukota';
        if (q.jenis === 'batas') return 'fitur-prov';
        if (q.jenis === 'simbol') return 'fitur-' + (q.target === 'gunung' ? 'gunung1' : 'sungai2');
        if (q.jenis === 'putar') return 'putar-' + q.sasaran;
      }
      function benar(el, kalimat) {
        siap = false;
        var lgs = salah === 0;
        if (lgs) langsung++;
        ad.catat(lgs);
        Save.catat('baca-peta', lgs); if (q.jenis === 'putar') Save.catat('mata-angin', lgs);
        Aud.sfx('good'); if (el) { UI.lompat(el); var t = UI.titik(el); if (t) UI.ledak(t.x, t.y, 12); }
        UI.sembunyiTangan(true);
        lang.pose('hinggap', 'sorak'); hud.potret('sorak'); lang.terbangKe(POS_LANG[0], POS_LANG[1], POS_LANG[2], 300, 0);
        hud.keping(lgs ? 10 : 5); hud.kemajuan(nomor + 1, daftar.length);
        if (q.p3 && tambahan < 2) { var sr = serupa(q); if (sr) { daftar.push(sr); tambahan++; } }
        hud.instruksi(kalimat, false);
        Array.prototype.forEach.call(bawah.querySelectorAll('button'), function (b) { b.disabled = true; });
        Promise.all([Bersama.ucap(kalimat, { lang: lang, hud: hud, eks: 'sorak' }), Tween.wait(1200)]).then(function () { if (L2.hidup) { nomor++; tampilkan(); } });
      }
      function salahKena(el, teks, kode, tingkatLegenda) {
        salah++;
        Save.catatSalah('baca-peta'); if (q.jenis === 'putar') Save.catatSalah('mata-angin');
        if (kode) { Save.catatMis(kode); mis[kode] = (mis[kode] || 0) + 1; }
        Aud.sfx('bad'); if (el) UI.goyang(el);
        lang.eks('berpikir'); hud.potret('berpikir');
        var tk = santai ? Math.max(2, salah) : salah;
        if (tk >= 2) {
          if (tingkatLegenda) { sorotLegenda(tingkatLegenda); teks = S.petunjuk2; }
          if (q.jenis === 'putar') { var ik3 = putar(petaR.fitur('ibukota')), ar = (q.arah + 2) % 8; bantu.innerHTML = Seni.garisBantu(ik3.x, ik3.y, 120, ar) + '<circle cx="' + n1(ik3.x) + '" cy="' + n1(ik3.y) + '" r="22" class="cincin-acuan-teka"/>'; teks = U.fmt(S.petunjuk2Putar, { arah: STR.arah[q.arah] }); }
          if (q.jenis === 'skala') gambarPeta({ angka: true });
        } else if (q.jenis === 'putar') gambarPeta({ kedip: true });
        if (tk >= 3 || ((q.jenis === 'judul' || q.jenis === 'skala') && salah >= 2)) {
          var sas = root.querySelector('[data-id="' + benarnya() + '"]');
          if (q.jenis === 'putar') { var tp = putar(petaR.titik(q.sasaran)); UI.tunjuk(tp); bantu.innerHTML += '<circle cx="' + n1(tp.x) + '" cy="' + n1(tp.y) + '" r="26" class="cincin-fitur"/>'; }
          else if (sas) UI.tunjuk(sas);
          if (!q.p3) { q.p3 = true; petunjuk3++; }
          teks = S.petunjuk3;
        }
        hud.instruksi(teks, false, tebal(teks, q.jenis === 'putar' ? STR.arah[q.arah] : null));
        Bersama.ucap(teks, { lang: lang, hud: hud, eks: 'berpikir' });
      }
      function jawabPilihan(i, el) {
        UI.idle.reset(); Voice.stop();
        if (q.jenis === 'judul') {
          var o = q.opsi[i];
          if (o === 0) return benar(el, S.judul.benar);
          el.disabled = true; jp.classList.add('denyut');
          return salahKena(el, o === 1 ? S.judul.salahKota : S.judul.salahLaut, o === 1 ? 'ibukota-provinsi' : null);
        }
        if (q.jenis === 'skala') {
          var op = q.opsi[i];
          if (op.i === 0) return benar(el, U.fmt(S.skala.benar, { n: q.ruas, km: q.km }));
          el.disabled = true;
          return salahKena(el, op.i === 1 ? S.skala.salahRuas : S.skala.salahHitung, op.i === 1 ? 'skala' : null);
        }
      }
      function ketukFitur(k, el) {
        UI.idle.reset(); Voice.stop();
        var j = jenisFitur(k), nama = S.fitur[j];
        if (q.jenis === 'ibukota') { if (j === 'ibukota') return benar(el, S.ibukota.benar); return salahKena(el, U.fmt(S.ibukota.salah, { fitur: nama }), null, 'ibukota'); }
        if (q.jenis === 'batas') { if (j === 'prov') return benar(el, S.batas.benar); return salahKena(el, j === 'kab' ? S.batas.salah : U.fmt(S.batas.salahLain, { fitur: nama }), j === 'kab' ? 'batas' : null, 'prov'); }
        if (q.jenis === 'simbol') { if (j === q.target) return benar(el, U.fmt(S.simbol.benar, { fitur: nama })); return salahKena(el, U.fmt(S.simbol.salah, { fitur: nama, target: S.fitur[q.target] }), null, q.target); }
      }
      function ketukWilayahPutar(id) {
        UI.idle.reset(); Voice.stop();
        if (q.jenis !== 'putar') return;
        var el = lapisTombol.querySelector('[data-id="putar-' + id + '"]');
        if (id === q.sasaran) return benar(el, U.fmt(S.putar.benar, { T: m.nama(id), arah: STR.arah[q.arah] }));
        if (id === 'pelangi') { UI.toast(STR.teka.salah.acuan); return; }
        /* miskonsepsi: wilayah yang tampak di arah layar yang diminta (arah sebenarnya diputar 90 derajat) */
        var arahLayar = (q.arah + 6) % 8, atas = Teka.relArah(m, 'pelangi', id, arahLayar) === 'ya';
        salahKena(el, atas ? S.putar.salahAtas : U.fmt(S.putar.salah, { singkat: STR.arahSingkat[q.arah] }), atas ? 'utara-atas' : 'arah-lain');
      }
      /* soal serupa di akhir level */
      function serupa(x) {
        if (x.jenis === 'putar') { var sisa = [[6, 'bukithijau'], [4, 'pantaibiru'], [5, 'lembahmawar']].filter(function (a) { return a[0] !== x.arah; }); var pil = sisa[Math.floor(rnd() * sisa.length)]; return { jenis: 'putar', arah: pil[0], sasaran: pil[1], ulang: true }; }
        if (x.jenis === 'simbol' || x.jenis === 'ibukota' || x.jenis === 'batas') return { jenis: 'simbol', target: x.target === 'gunung' ? 'sungai' : 'gunung', ulang: true };
        if (x.jenis === 'skala') return { jenis: 'skala', A: x.A, B: x.B === 'camar' ? 'damar' : 'camar', nB: x.B === 'camar' ? (STR.l2.desaDamar || 'Desa Damar') : S.kotaCamar, ulang: true };
        return null;
      }
      function selesai() {
        siap = false; q = null;
        var bintang = langsung >= 7 ? 3 : langsung >= 5 ? 2 : 1;
        Save.catatLevel(2, { selesai: true, bintang: bintang, petunjuk3: petunjuk3, detik: Math.round((performance.now() - t0) / 1000) });
        var tip = Object.keys(mis).filter(function (k) { return STR.hasil.tip[k]; }).sort(function (a, b) { return mis[b] - mis[a]; })[0] || '';
        lang.pose('hinggap', 'bangga'); hud.potret('bangga');
        Aud.sfx('cap'); Aud.jingle('lengkap');
        hud.instruksi(S.selesai, false);
        Promise.all([Bersama.ucap(S.selesai, { lang: lang, hud: hud, eks: 'bangga' }), Tween.wait(1600)]).then(function () { if (L2.hidup) Scenes.go('hasil', { level: 2, bintang: bintang, tip: tip }); });
      }

      L2.keadaan = function () { return { langkah: q ? 'soal' : 'selesai', siap: siap, nomor: nomor, total: daftar.length, jenis: q && q.jenis, salah: salah }; };
      L2.benar = function () { return siap && q ? [benarnya()] : []; };
      L2.salah = function () {
        if (!siap || !q) return [];
        if (q.jenis === 'judul' || q.jenis === 'skala') { var b = Array.prototype.filter.call(bawah.querySelectorAll('button'), function (x) { return !x.disabled && x.dataset.id !== benarnya(); })[0]; return b ? [b.dataset.id] : []; }
        if (q.jenis === 'putar') { var atas = m.ids.filter(function (id) { return id !== q.sasaran && id !== 'pelangi' && Teka.relArah(m, 'pelangi', id, (q.arah + 6) % 8) === 'ya'; })[0]; return atas ? ['putar-' + atas] : []; }
        /* pengecoh sungguhan: fitur berjenis lain (gunung mana pun benar untuk soal gunung) */
        var mau = q.jenis === 'simbol' ? q.target : q.jenis === 'ibukota' ? 'ibukota' : 'prov';
        var lain = Array.prototype.filter.call(lapisTombol.querySelectorAll('.pin-wilayah'), function (x) { return x.dataset.fitur && jenisFitur(x.dataset.fitur) !== mau; })[0];
        return lain ? [lain.dataset.id] : [];
      };
      tampilkan();
    },
    exit: function () { if (L2) L2.hidup = false; UI.sembunyiTangan(true); },
    uji: {
      keadaan: function () { return L2 && L2.keadaan ? L2.keadaan() : { langkah: '', siap: false }; },
      benar: function () { return L2 && L2.benar ? L2.benar() : []; },
      salah: function () { return L2 && L2.salah ? L2.salah() : []; }
    }
  });
})();
