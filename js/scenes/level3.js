/* Level 3 Teka-teki Pulau (GDD bagian 9, TP6 nalar-letak, TP1 mata-angin). Papan bersama: js/scenes/papan.js.
   Teka-teki 1 Pulau Latihan: Kota Pelangi terpasang, 7 petunjuk dari Kota Pelangi (profil acuan); kartu pertama dipandu tangan.
   Teka-teki 2 Pulau Seberang: Kota Mercusuar terpasang di ujung utara; petunjuk berantai, gabungan, dan ciri (profil berantai).
   Kartu yang dibantu petunjuk ke-3 diulang sebagai soal serupa di akhir level (maks. 2).
   Bintang dari 14 kartu yang tepat pada coba pertama: 3 = 12+, 2 = 9+, 1 = selesai. */
(function () {
  var L3 = null;
  var POS_LANG = [1068, 602, 0.76];
  var TEKA = [
    {
      data: function () { return PULAU_LATIHAN; }, profil: 'acuan', hanyaAcuan: true,
      kotak: { x: 28, y: 140, w: 816, h: 410, vb: [20, 40, 970, 585] },
      gaya: {
        pelangi: { warna: 'jingga', pola: 'polos' }, bukithijau: { warna: 'hijau', pola: 'titik' }, gunungawan: { warna: 'cokelat', pola: 'datar' },
        camar: { warna: 'pasir', pola: 'polos' }, danauteduh: { warna: 'sage', pola: 'miring' }, hutandamar: { warna: 'hijau', pola: 'silang' },
        pantaibiru: { warna: 'sage', pola: 'ombak' }, lembahmawar: { warna: 'pasir', pola: 'tegak' }
      },
      gantung: { pelangi: [466, 390], camar: [470, 88], gunungawan: [262, 88], danauteduh: [690, 104], pantaibiru: [450, 582], lembahmawar: [190, 582] },
      ombak: [[60, 250], [45, 390], [170, 500], [420, 560], [640, 545], [860, 460], [985, 300], [900, 200], [600, 105], [330, 130]],
      posLaut: [[52, 147], [782, 596]], posLuar: [967, 485],
      fitur: { sungaiLembayung: [430, 298], gunungAwan: [338, 196], danauTeduh: [618, 228] },
      legenda: ['ibukota', 'prov', 'kab', 'skala']
    },
    {
      data: function () { return PULAU_SEBERANG; }, profil: 'berantai', hanyaAcuan: false,
      kotak: { x: 28, y: 140, w: 816, h: 410, vb: [130, 28, 800, 590] },
      gaya: {
        mercusuar: { warna: 'jingga', pola: 'polos' }, karangindah: { warna: 'pasir', pola: 'titik' }, kenari: { warna: 'sage', pola: 'miring' },
        telukkerang: { warna: 'cokelat', pola: 'ombak' }, rimbaraya: { warna: 'hijau', pola: 'silang' }, kebunpala: { warna: 'pasir', pola: 'datar' },
        ombakputih: { warna: 'cokelat', pola: 'tegak' }, lerengkopi: { warna: 'sage', pola: 'titik' }
      },
      /* plat wilayah kecil digantung di laut (satuan peta); Rimba Raya (pedalaman, luas) memakai titik labelnya */
      gantung: { mercusuar: [823, 78], kenari: [910, 258], kebunpala: [910, 366], ombakputih: [996, 467], karangindah: [90, 186], telukkerang: [90, 323], lerengkopi: [90, 546] },
      ombak: [[150, 250], [120, 430], [230, 590], [700, 610], [880, 380], [860, 140], [640, 40], [330, 50]],
      posLaut: [[150, 70], [880, 600]],
      fitur: { sungaiBening: [420, 368], teluk: [300, 372], gunungKabut: [438, 515], danauKaca: [668, 345], pulauKerapu: [776, 523] },
      legenda: ['ibukota', 'kab', 'sungai', 'skala']
    }
  ];

  function latar(W) {
    var g = '<rect width="1280" height="720" fill="' + W.kayu + '"/><rect width="1280" height="720" fill="url(#pola-kayu)"/>';
    g += '<rect x="16" y="106" width="840" height="504" rx="18" fill="' + W.tinta + '" opacity=".28"/>';
    g += '<rect x="16" y="100" width="840" height="504" rx="18" fill="' + W.kertas + '" stroke="' + W.tinta + '" stroke-width="4"/>';
    g += '<rect x="28" y="140" width="816" height="410" rx="6" fill="' + W.laut + '" stroke="' + W.biru + '" stroke-width="2.5"/>';
    g += '<rect x="28" y="140" width="816" height="410" rx="6" fill="url(#pola-laut)"/>';
    /* ekor balon kartu petunjuk ke arah Lang */
    g += '<path d="M1036 378L1058 412L1080 378Z" fill="' + W.kertas + '" stroke="' + W.tinta + '" stroke-width="4" stroke-linejoin="round"/><path d="M1039 374H1077" stroke="' + W.kertas + '" stroke-width="6"/>';
    /* perlengkapan Kantor Peta: teropong dan bola dunia */
    g += '<ellipse cx="948" cy="600" rx="62" ry="8" fill="' + W.tinta + '" opacity=".18"/>';
    g += '<g transform="translate(950 562) rotate(-24)"><rect x="-56" y="-14" width="74" height="28" rx="6" fill="' + W.cokelat + '" stroke="' + W.tinta + '" stroke-width="4"/><rect x="14" y="-18" width="44" height="36" rx="6" fill="' + W.jinggaGelap + '" stroke="' + W.tinta + '" stroke-width="4"/><rect x="-74" y="-10" width="22" height="20" rx="4" fill="' + W.pasirGelap + '" stroke="' + W.tinta + '" stroke-width="4"/><path d="M-30-14v28M0-14v28" stroke="' + W.tinta + '" stroke-width="3"/></g>';
    g += '<ellipse cx="1206" cy="600" rx="40" ry="7" fill="' + W.tinta + '" opacity=".18"/><path d="M1180 598h52l-8-14h-36z" fill="' + W.cokelat + '" stroke="' + W.tinta + '" stroke-width="4" stroke-linejoin="round"/><path d="M1206 584v-14" stroke="' + W.tinta + '" stroke-width="5"/>';
    g += '<circle cx="1206" cy="532" r="40" fill="' + W.laut + '" stroke="' + W.tinta + '" stroke-width="4"/><path d="M1180 512q14 6 20-6q10 4 6 16q-12 6-6 18q-14 4-22-10zM1214 540q10-8 18 2q-2 12-12 14q-8-6-6-16z" fill="' + W.hijau + '" stroke="' + W.tinta + '" stroke-width="3" stroke-linejoin="round"/><path d="M1160 532a46 46 0 0 0 92 0" fill="none" stroke="' + W.jinggaGelap + '" stroke-width="5"/>';
    return g;
  }
  /* legenda satu baris di tepi bawah kertas peta */
  function legenda(jenis, skalaPx) {
    var W = Seni.W, S = STR.l3.legenda;
    function ik(isi, w) { return '<svg width="' + w + '" height="26" viewBox="0 0 ' + w + ' 26" aria-hidden="true">' + isi + '</svg>'; }
    var p = Math.max(24, Math.round(skalaPx));
    var bagian = {
      ibukota: ik(Seni.ibuKota(13, 13, 11), 26) + S.ibukota,
      prov: ik('<path d="M3 13H33" stroke="' + W.tinta + '" stroke-width="7" stroke-linecap="round"/><path d="M3 13H33" stroke="' + W.jingga + '" stroke-width="2" stroke-dasharray="1 9" stroke-linecap="round"/>', 36) + S.prov,
      kab: ik('<path d="M3 13H33" stroke="' + W.tinta + '" stroke-width="2.6" stroke-dasharray="9 7" stroke-linecap="round"/>', 36) + S.kab,
      sungai: ik('<path d="M3 15Q12 7 20 13T36 11" fill="none" stroke="' + W.tinta + '" stroke-width="7" stroke-linecap="round"/><path d="M3 15Q12 7 20 13T36 11" fill="none" stroke="' + W.laut + '" stroke-width="3.6" stroke-linecap="round"/>', 40) + S.sungai,
      skala: ik('<path d="M3 18H' + (p + 3) + '" stroke="' + W.tinta + '" stroke-width="3"/><path d="M3 18H' + (p / 2 + 3) + '" stroke="' + W.tinta + '" stroke-width="8"/><path d="M3 10V22M' + (p / 2 + 3) + ' 12V22M' + (p + 3) + ' 10V22" stroke="' + W.tinta + '" stroke-width="3"/>', p + 6) + S.skala
    };
    return jenis.map(function (j) { return '<span>' + bagian[j] + '</span>'; }).join('');
  }

  window.KonfigPulau = TEKA;   /* dipakai L2 Baca Peta (warna dan letak plat yang sama) */
  Scenes.add('level3', {
    enter: function (root) {
      var W = Seni.W, santai = Save.data.settings.santai, t0 = performance.now(), rnd = U.TEST ? U.rng(303) : Math.random;
      Aud.musik('jelajah'); Aud.pramuatJingle('lengkap');
      root.appendChild(U.h('div', 'lapis', Seni.svg(1280, 720, latar(W))));
      root.appendChild(U.h('h1', 'tersembunyi', UI.esc(U.fmt(STR.level.judul, { n: 3, nama: STR.level.nama[3] }))));
      var jp = U.h('p', 'judul-peta'); jp.style.cssText = 'left:28px;top:107px;width:816px'; jp.setAttribute('data-cek', 'judul peta'); root.appendChild(jp);
      var lg = U.h('div', 'legenda-baris'); lg.style.cssText = 'left:28px;top:553px;width:816px'; lg.setAttribute('data-cek', 'legenda'); root.appendChild(lg);
      var ct = U.h('p', 'catatan-peta', UI.esc(STR.peta.catatan)); ct.style.cssText = 'left:28px;top:578px;width:816px'; ct.setAttribute('data-cek', 'catatan peta'); root.appendChild(ct);
      var hud = UI.hud(root, { level: 3, sub: U.fmt(STR.l3.sub, { i: 1 }), jeda: { ulangi: function () { Scenes.go('level3'); } } });
      var lapis = Bersama.lapisHidup(root);
      var lang = Bersama.lang(lapis, POS_LANG[0], POS_LANG[1], POS_LANG[2], { eks: 'senang' });
      var ke = 0, papan = null, langsung = 0, p3 = [], mis = {}, langkah = 'teka', profil2 = null;
      L3 = { hidup: true };

      function mulaiTeka(i) {
        if (!L3.hidup) return;
        ke = i; langkah = 'teka';
        var T = TEKA[i], P = T.data(), m = Teka.modelPulau(P);
        var jangkar = P.wilayah.filter(function (w) { return w.ibukota; })[0].id, kartu = m.ids.filter(function (x) { return x !== jangkar; });
        /* adaptif: bila teka-teki pertama sulit (kurang dari 4 dari 7 kartu langsung benar, atau Lang menunjukkan jawaban),
           teka-teki kedua memakai profil 'provinsi' (petunjuk arah dan laut yang lebih langsung) alih-alih petunjuk berantai */
        var profil = i === 1 && profil2 ? profil2 : T.profil;
        var h = Teka.buat(m, kartu, jangkar, [], { profil: profil, hanyaAcuan: T.hanyaAcuan, rnd: rnd, percobaan: 30 });
        if (!h && profil !== T.profil) { profil = T.profil; h = Teka.buat(m, kartu, jangkar, [], { profil: profil, hanyaAcuan: T.hanyaAcuan, rnd: rnd, percobaan: 30 }); }
        var urut = h ? h.petunjuk.map(function (c) { return c.kartu; }) : kartu;
        var peta = Papan.petaPulau(P, { x: T.kotak.x, y: T.kotak.y, w: T.kotak.w, h: T.kotak.h, vb: T.kotak.vb, gaya: T.gaya, gantung: T.gantung, ombak: T.ombak, posLaut: T.posLaut, posLuar: T.posLuar, fitur: T.fitur, mawar: { cx: 772, cy: 208, r: 46 } });
        var s = Math.min(T.kotak.w / T.kotak.vb[2], T.kotak.h / T.kotak.vb[3]);
        jp.textContent = STR.l3.judulPeta[i];
        lg.innerHTML = legenda(T.legenda, (P.skala.ruas / P.skala.kmPerSatuan) * s);
        if (papan) papan.bersihkan();
        papan = Papan.buat(root, {
          peta: peta, model: m, kartu: urut, jangkar: jangkar, konteks: [], petunjuk: h ? h.petunjuk : [], opsi: { profil: profil, hanyaAcuan: T.hanyaAcuan },
          hud: hud, lang: lang, posLang: POS_LANG, maksBaki: 5, lebarKartu: 222, tag: ['nalar-letak'], tagArah: 'mata-angin', pandu: i === 0,
          santai: santai, panjangBantu: 150, onSelesai: selesaiTeka
        });
        papan.mis = mis;
        root.appendChild(lapis);   /* Lang selalu di atas peta */
        hud.sub(U.fmt(STR.l3.sub, { i: i + 1 }));
        hud.instruksi(STR.l3.mulai[i], false);
        lang.eks('senang'); hud.potret('senang');
        var kal = STR.l3.mulai[i];
        papan.mulai();
        if (Save.data.settings.bacakan) { Voice.stop(); Bersama.ucap(kal, { lang: lang, hud: hud }).then(function () { if (L3.hidup) hud.instruksi(STR.teka.instruksi, false); }); }
        else Tween.wait(2600).then(function () { if (L3.hidup && langkah === 'teka') hud.instruksi(STR.teka.instruksi, false); });
      }
      function cap() {
        var c = U.h('div', 'cap-lengkap', Seni.svg(260, 260, Seni.cap(130, 130, 104, -12)));
        c.style.cssText = 'left:306px;top:216px';
        root.appendChild(c);
        Aud.sfx('cap'); Aud.jingle('lengkap');
        var jadi = UI.kurangi ? Promise.resolve() : Tween.run(420, function (e) { c.style.scale = (2.2 - 1.2 * e).toFixed(3); c.style.opacity = Math.min(1, e * 2); }, Ease.easeOutBack);
        return jadi.then(function () { return c; });
      }
      function selesaiTeka(stat) {
        langsung += stat.langsung;
        if (ke === 0) profil2 = stat.langsung < 4 || stat.p3.length ? 'provinsi' : null;
        stat.p3.forEach(function (id) { p3.push({ teka: ke, id: id }); });
        langkah = 'lengkap';
        UI.idle.atur(function () { return null; });
        lang.pose('hinggap', 'bangga'); hud.potret('bangga');
        papan.gambarLengkap();
        hud.instruksi(STR.l3.lengkap, false);
        cap().then(function (c) {
          return Promise.all([Bersama.ucap(STR.l3.lengkap, { lang: lang, hud: hud, eks: 'bangga' }), Tween.wait(1700)]).then(function () {
            if (!L3.hidup) return;
            c.remove();
            if (ke === 0) mulaiTeka(1);
            else ulang(0);
          });
        });
      }
      /* soal serupa di akhir level (maks. 2), di peta Pulau Seberang yang sudah lengkap */
      function ulang(n) {
        if (!L3.hidup) return;
        var jumlah = Math.min(2, p3.length);
        if (n >= jumlah) return selesai();
        langkah = 'tanya';
        hud.sub(STR.l3.subUlang); hud.kemajuan(n, jumlah);
        lang.pose('hinggap', 'senang'); hud.potret('senang');
        var q = papan.buatSerupa(L3.dipakai || [], rnd);
        if (!q) return selesai();
        (L3.dipakai = L3.dipakai || []).push(q.acuan + '>' + q.p);
        papan.tanya(q).then(function () { ulang(n + 1); });
      }
      function selesai() {
        langkah = 'selesai';
        var bintang = langsung >= 12 ? 3 : langsung >= 9 ? 2 : 1;
        Save.catatLevel(3, { selesai: true, bintang: bintang, petunjuk3: p3.length, detik: Math.round((performance.now() - t0) / 1000) });
        var tip = Object.keys(mis).filter(function (k) { return STR.hasil.tip[k]; }).sort(function (a, b) { return mis[b] - mis[a]; })[0] || '';
        lang.pose('hinggap', 'bangga'); hud.potret('bangga');
        hud.instruksi(STR.l3.selesai, false);
        Promise.all([Bersama.ucap(STR.l3.selesai, { lang: lang, hud: hud, eks: 'bangga' }), Tween.wait(1400)]).then(function () {
          if (L3.hidup) Scenes.go('hasil', { level: 3, bintang: bintang, tip: tip });
        });
      }

      L3.keadaan = function () { var k = papan ? papan.keadaan() : {}; k.langkah = langkah; k.teka = ke; k.langsung = langsung; k.profil2 = profil2; return k; };
      L3.benar = function () { return papan && (langkah === 'teka' || langkah === 'tanya') ? papan.benar() : []; };
      L3.salah = function () { return papan && (langkah === 'teka' || langkah === 'tanya') ? papan.salah() : []; };
      mulaiTeka(0);
    },
    exit: function () { if (L3) L3.hidup = false; UI.sembunyiTangan(true); },
    uji: {
      keadaan: function () { var k = L3 && L3.keadaan ? L3.keadaan() : { langkah: '' }; k.siap = !!k.siap; return k; },
      benar: function () { return L3 && L3.benar ? L3.benar() : []; },
      salah: function () { return L3 && L3.salah ? L3.salah() : []; }
    }
  });
})();
