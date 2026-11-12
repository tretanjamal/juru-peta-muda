/* Level 6 Jelajah Nusantara (GDD bagian 9, TAMBAHAN; TP4 provinsiku, TP1 mata-angin).
   Sepuluh provinsi dicari di peta Indonesia dari petunjuk kelompok pulau dan arah terhadap provinsi acuan (js/engine/nusantara.js).
   Adaptif: 3 benar beruntun -> delapan arah, 2 salah beruntun -> arah utama saja. Petunjuk bertingkat: 1 pesan sesuai kesalahan
   (kelompok pulau atau arah), 2 kelompok pulau menyala + garis bantu dari provinsi acuan, 3 Lang menunjuk provinsinya.
   Soal yang dibantu petunjuk ke-3 diganti soal serupa di akhir (maks. 2). Waktu hanya untuk bonus bintang; Mode Santai tanpa waktu.
   Bintang: 1 = selesai, 2 = minimal 7 benar pada coba pertama, 3 = itu ditambah bonus waktu (Mode Santai: minimal 9). */
(function () {
  var L6 = null;
  var KOTAK = { x: 28, y: 140, w: 816, h: 410 }, JUMLAH = 10, BONUS_DETIK = 180;
  var POS_LANG = [1210, 712, 0.42];
  function n1(v) { return Math.round(v * 10) / 10; }

  Scenes.add('level6', {
    enter: function (root) {
      var W = Seni.W, S = STR.l6, santai = Save.data.settings.santai, t0 = performance.now(), rnd = U.TEST ? U.rng(606) : Math.random;
      Aud.musik('jelajah'); Aud.pramuatJingle('lengkap');
      var latar = '<rect width="1280" height="720" fill="' + W.kayu + '"/><rect width="1280" height="720" fill="url(#pola-kayu)"/>' +
        '<rect x="16" y="106" width="840" height="504" rx="18" fill="' + W.tinta + '" opacity=".28"/><rect x="16" y="100" width="840" height="504" rx="18" fill="' + W.kertas + '" stroke="' + W.tinta + '" stroke-width="4"/>' +
        '<rect x="28" y="140" width="816" height="410" rx="6" fill="' + W.laut + '" stroke="' + W.biru + '" stroke-width="2.5"/><rect x="28" y="140" width="816" height="410" rx="6" fill="url(#pola-laut)"/>';
      root.appendChild(U.h('div', 'lapis', Seni.svg(1280, 720, latar)));
      root.appendChild(U.h('h1', 'tersembunyi', UI.esc(U.fmt(STR.level.judul, { n: 6, nama: STR.level.nama[6] }))));
      var jp = U.h('p', 'judul-peta', UI.esc(S.judulPeta)); jp.style.cssText = 'left:28px;top:107px;width:816px'; jp.setAttribute('data-cek', 'judul peta'); root.appendChild(jp);
      var ct = U.h('p', 'catatan-peta', UI.esc(STR.peta.catatan)); ct.style.cssText = 'left:28px;top:566px;width:816px'; ct.setAttribute('data-cek', 'catatan peta'); root.appendChild(ct);
      var hud = UI.hud(root, { level: 6, sub: U.fmt(S.sub, { i: 1, n: JUMLAH }), jeda: { ulangi: function () { Scenes.go('level6'); } } });
      var lapisPeta = U.h('div', 'lapis lapis-peta'); root.appendChild(lapisPeta);
      var bantu = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      bantu.setAttribute('width', 1280); bantu.setAttribute('height', 720); bantu.setAttribute('viewBox', '0 0 1280 720'); bantu.setAttribute('class', 'lapis-bantu-teka'); bantu.setAttribute('aria-hidden', 'true');
      root.appendChild(bantu);
      var tangkap = U.h('div', 'tangkap-peta'); tangkap.style.cssText = 'left:' + KOTAK.x + 'px;top:' + KOTAK.y + 'px;width:' + KOTAK.w + 'px;height:' + KOTAK.h + 'px';
      root.appendChild(tangkap);
      var lapisTombol = U.h('div', 'lapis lapis-pin'); root.appendChild(lapisTombol);
      var kartu = U.h('div', 'panel kartu-petunjuk kartu-jelajah');
      kartu.style.cssText = 'left:872px;top:100px;width:392px;height:504px';
      kartu.innerHTML = '<div class="kepala"><span class="nomor" data-cek="nomor jelajah"></span></div><div class="isi"><span class="kompas"></span><p class="kalimat" data-cek="petunjuk jelajah"></p></div>' +
        '<div class="bonus-waktu" data-cek="bonus waktu"><span class="label-bonus"></span><span class="bilah-bonus"><span class="isi-bonus"></span></span></div>';
      kartu.appendChild(UI.tombolIkon('dengar', STR.ikon.dengarPetunjuk, function () { Voice.stop(); UI.bacakan(q ? kalimat(q) : '', true); }, { id: 'dengar-jelajah', cls: 'tombol-petunjuk' }));
      root.appendChild(kartu);
      var lapis = Bersama.lapisHidup(root);
      var lang = Bersama.lang(lapis, POS_LANG[0], POS_LANG[1], POS_LANG[2], { eks: 'senang' });
      var N = null, T = null, q = null, daftar = [], nomor = 0, salah = 0, siap = false, langsung = 0, petunjuk3 = 0, tambahan = 0, mis = {}, ditemukan = [];
      var ad = new Adaptif(0, 1, 0), dipakai = { prov: {}, pulau: {} }, bonusSisa = BONUS_DETIK, bonusHabis = false, waktuLalu = performance.now(), timer = 0;
      L6 = { hidup: true };
      function bacakan(t, eks) { return Save.data.settings.bacakan ? Bersama.ucap(t, { lang: lang, hud: hud, eks: eks }) : Promise.resolve(); }
      function namaPulau(p) { return p; }
      function kalimat(x) { return U.fmt(S.kalimat[x.jenis], { pulau: namaPulau(x.pulau), arah: x.p != null ? STR.arah[x.p] : '', R: N.P[x.acuan].nama, R2: x.acuan2 ? N.P[x.acuan2].nama : '' }); }
      function kalimatHtml(x) {
        var t = UI.esc(kalimat(x));
        [N.P[x.acuan].nama, x.acuan2 ? N.P[x.acuan2].nama : null, x.pulau].forEach(function (n) { if (n) t = t.replace(UI.esc(n), '<b class="nama-w">' + UI.esc(n).replace(/ /g, '&nbsp;') + '</b>'); });
        if (x.p != null) t = t.replace(UI.esc(STR.arah[x.p]), '<span class="arah-w">' + UI.esc(STR.arah[x.p]) + '</span>');
        return t;
      }

      /* ---------- bonus waktu: berjalan hanya saat bermain (tidak saat jeda, tab tersembunyi, atau Mode Santai) ---------- */
      function segarBonus() {
        var el = kartu.querySelector('.bonus-waktu');
        if (santai) { el.querySelector('.label-bonus').textContent = S.santai; el.querySelector('.bilah-bonus').style.display = 'none'; return; }
        el.querySelector('.label-bonus').textContent = S.bonus;
        el.querySelector('.isi-bonus').style.width = Math.max(0, bonusSisa / BONUS_DETIK * 100).toFixed(1) + '%';
      }
      timer = setInterval(function () {
        var t = performance.now(), dt = (t - waktuLalu) / 1000; waktuLalu = t;
        if (!L6.hidup || santai || bonusHabis || !q || q.ulang || Tween.paused || document.hidden || document.querySelector('.overlay')) return;
        bonusSisa -= dt;
        if (bonusSisa <= 0) { bonusSisa = 0; bonusHabis = true; UI.toast(S.bonusHabis); }
        segarBonus();
      }, 250);

      /* ---------- peta ---------- */
      function gambar(o) {
        o = o || {};
        var r = PetaIndo.indonesia({ kotak: KOTAK, sorotPulau: o.sorotPulau, sorot: o.sorot });
        T = r.T;
        var isi = '<svg x="28" y="140" width="816" height="410" overflow="hidden"><g transform="translate(-28 -140)">' + r.svg + '</g></svg>';
        /* provinsi yang sudah ditemukan: nama kecil */
        ditemukan.forEach(function (k) { var p = Peta.P(N.P[k].label, T); isi += Seni.teks(p[0], p[1] + 6, N.P[k].nama, { ukuran: 20, garis: W.kertas, tebalGaris: 5, tebal: false }); });
        /* provinsi acuan: garis jingga dan nama */
        if (q) [q.acuan, q.acuan2].forEach(function (k) {
          if (!k) return;
          isi += '<path d="' + Peta.dProv(k, T, 1) + '" fill="' + W.jingga + '" fill-opacity=".35" stroke="' + W.jinggaGelap + '" stroke-width="3.5" stroke-linejoin="round"/>';
          var p = Peta.P(N.P[k].label, T);
          isi += Seni.teks(p[0], p[1] - 12, N.P[k].nama, { ukuran: 20, garis: W.kertas, tebalGaris: 5 });
        });
        isi += '<g class="mawar-peta' + (o.kedip ? ' kedip-mawar' : '') + '">' + Seni.mawarAngin(796, 186, 34, { label8: false }) + '</g>';
        lapisPeta.innerHTML = Seni.svg(1280, 720, isi);
        /* tombol keyboard di titik label provinsi (ketukan jari ditangani poligon peta) */
        lapisTombol.innerHTML = '';
        Peta.data().provinsi.forEach(function (p, i) {
          var t = Peta.P(p.label, T), b = U.h('button', 'pin-wilayah pin-kibor');
          b.type = 'button'; b.dataset.id = 'prov-' + p.kode;
          b.style.left = Math.round(t[0] - 32) + 'px'; b.style.top = Math.round(t[1] - 32) + 'px';
          b.setAttribute('aria-label', U.fmt(STR.l4.aria.provinsi, { n: i + 1 }));
          b.addEventListener('click', function () { if (siap) ketuk(p.kode); });
          lapisTombol.appendChild(b);
        });
      }
      /* ketukan: provinsi yang terkena, atau provinsi mungil di dekatnya (DKI Jakarta, DI Yogyakarta) lewat PetaIndo.sasaranKetuk */
      tangkap.addEventListener('click', function (e) {
        if (!siap || !T) return;
        var p = Stage.toLocal(e.clientX, e.clientY), id = PetaIndo.sasaranKetuk(p, Peta.provPada(p.x, p.y, T), PetaIndo.daftarProv(), T);
        if (id) ketuk(id);
      });

      /* ---------- soal ---------- */
      function tampilkan() {
        if (!L6.hidup) return;
        if (nomor >= JUMLAH + tambahan) return selesai();
        if (!daftar[nomor]) daftar[nomor] = N.pilih(rnd, dipakai, ad.t);
        q = daftar[nomor];
        if (!q) return selesai();
        salah = 0; siap = true; q.p3 = false;
        bantu.innerHTML = '';
        hud.sub(q.ulang ? S.subUlang : U.fmt(S.sub, { i: nomor + 1, n: JUMLAH + tambahan })); hud.kemajuan(nomor, JUMLAH + tambahan);
        lang.eks('senang'); hud.potret('senang');
        gambar();
        kartu.querySelector('.nomor').textContent = U.fmt(S.kepala, { i: nomor + 1, n: JUMLAH + tambahan });
        kartu.querySelector('.kompas').innerHTML = Seni.kompasMini(q.p != null ? q.p : null, 92);
        var kal = kartu.querySelector('.kalimat');
        kal.innerHTML = kalimatHtml(q); Papan.pasKan(kal, 26, 20);
        UI.masuk(kartu);
        segarBonus();
        hud.instruksi(S.instruksi, false);
        var mulai = q.ulang ? bacakan(S.soalUlang) : Promise.resolve();
        mulai.then(function () { if (L6.hidup && siap) bacakan(kalimat(q)); });
        UI.idle.atur(function () { return siap ? { x: KOTAK.x + KOTAK.w / 2, y: KOTAK.y + KOTAK.h / 2 } : null; });
      }
      function arahDari(R, X) { return Arah.indeks(N.arah(R, X).sudut); }
      function ketuk(id) {
        UI.idle.reset(); Voice.stop();
        if (!q) return;
        var t = Peta.P(N.P[id].label, T);
        if (id === q.sasaran) {
          siap = false;
          var lgs = salah === 0;
          if (!q.ulang && lgs) langsung++;
          Save.catat('provinsiku', lgs); if (q.p != null) Save.catat('mata-angin', lgs);
          ad.catat(lgs);
          Aud.sfx('good'); UI.ledak(t[0], t[1], 14);
          ditemukan.push(id);
          gambar();
          UI.sembunyiTangan(true);
          lang.pose('hinggap', 'sorak'); hud.potret('sorak'); lang.terbangKe(POS_LANG[0], POS_LANG[1], POS_LANG[2], 300, 0);
          hud.keping(lgs ? 10 : 5); hud.kemajuan(nomor + 1, JUMLAH + tambahan);
          if (q.p3 && tambahan < 2) {
            /* soal serupa: provinsi lain di kelompok pulau yang sama */
            var s2 = null, grup = N.kelompok[q.pulau].filter(function (k) { return N.sasaran.indexOf(k) >= 0 && !dipakai.prov[k]; });
            for (var i = 0; i < grup.length && !s2; i++) { var c = N.petunjuk(grup[i], 1); if (c.length) { s2 = c[0]; dipakai.prov[grup[i]] = 1; } }
            if (s2) { s2.ulang = true; daftar[JUMLAH + tambahan] = s2; tambahan++; }
          }
          var kal = U.fmt(S.benar, { P: N.P[id].nama });
          hud.instruksi(kal, false);
          Promise.all([Bersama.ucap(kal, { lang: lang, hud: hud, eks: 'sorak' }), Tween.wait(1100)]).then(function () { if (L6.hidup) { nomor++; tampilkan(); } });
          return;
        }
        if (id === q.acuan || id === q.acuan2) { Aud.sfx('pop'); UI.toast(U.fmt(S.acuan, { R: N.P[id].nama })); return; }
        salah++;
        Save.catatSalah('provinsiku'); if (q.p != null) Save.catatSalah('mata-angin');
        ad.catat(false);
        Aud.sfx('bad');
        lang.eks('berpikir'); hud.potret('berpikir');
        var teks, kode = null;
        if (N.P[id].pulau !== q.pulau) { teks = U.fmt(S.salahPulau, { pulauX: N.P[id].pulau, pulau: q.pulau }); kode = 'pulau'; }
        else if (q.p != null) {
          var k = arahDari(q.acuan, id), js = Arah.jenisSalah(q.p, k, {});
          kode = js;
          teks = U.fmt(js === 'berlawanan' ? S.salahBerlawanan : S.salahArah, { ketuk: STR.arah[k], R: N.P[q.acuan].nama, arah: STR.arah[q.p] });
        } else if (q.jenis === 'batasDua' && !(N.bertetangga(id, q.acuan) && N.bertetangga(id, q.acuan2))) { teks = U.fmt(S.salahBatas, { R: N.P[N.bertetangga(id, q.acuan) ? q.acuan2 : q.acuan].nama }); kode = 'bukan-tetangga'; }
        else teks = S.salahUmum;
        if (kode) { Save.catatMis(kode); mis[kode] = (mis[kode] || 0) + 1; }
        var tk = santai ? Math.max(2, salah) : salah;
        if (tk >= 2) {
          gambar({ sorotPulau: q.pulau });
          var r = Peta.P(N.P[q.acuan].label, T);
          bantu.innerHTML = (q.p != null ? Seni.garisBantu(r[0], r[1], 150, q.p) : '') + '<circle cx="' + n1(r[0]) + '" cy="' + n1(r[1]) + '" r="22" class="cincin-acuan-teka"/>';
          teks = S.petunjuk2;
        } else gambar({ kedip: true });
        if (tk >= 3) {
          var ts = Peta.P(N.P[q.sasaran].label, T);
          gambar({ sorotPulau: q.pulau, sorot: q.sasaran });
          bantu.innerHTML += '<circle cx="' + n1(ts[0]) + '" cy="' + n1(ts[1]) + '" r="24" class="cincin-fitur"/>';
          lang.pose('terbang', 'senang'); lang.terbangKe(ts[0] + (ts[0] > 440 ? -90 : 90), ts[1] - 30, 0.3, 700);
          UI.tunjuk({ x: ts[0], y: ts[1] });
          if (!q.p3) { q.p3 = true; petunjuk3++; }
          teks = S.petunjuk3;
        }
        hud.instruksi(teks, false);
        Bersama.ucap(teks, { lang: lang, hud: hud, eks: 'berpikir' });
      }
      function selesai() {
        siap = false; q = null;
        var bintang = langsung >= 7 ? ((santai ? langsung >= 9 : !bonusHabis) ? 3 : 2) : 1;
        Save.catatLevel(6, { selesai: true, bintang: bintang, petunjuk3: petunjuk3, detik: Math.round((performance.now() - t0) / 1000) });
        var tip = Object.keys(mis).filter(function (k) { return STR.hasil.tip[k]; }).sort(function (a, b) { return mis[b] - mis[a]; })[0] || '';
        lang.pose('hinggap', 'bangga'); hud.potret('bangga');
        Aud.sfx('cap'); Aud.jingle('lengkap');
        hud.instruksi(S.selesai, false);
        Promise.all([Bersama.ucap(S.selesai, { lang: lang, hud: hud, eks: 'bangga' }), Tween.wait(1600)]).then(function () { if (L6.hidup) Scenes.go('hasil', { level: 6, bintang: bintang, tip: tip }); });
      }

      L6.berhenti = function () { clearInterval(timer); };
      L6.keadaan = function () { return { langkah: q ? 'soal' : (N ? 'selesai' : 'muat'), siap: siap, nomor: nomor, total: JUMLAH + tambahan, salah: salah, tingkat: ad.t, bonus: Math.round(bonusSisa) }; };
      L6.benar = function () { return siap && q ? ['prov-' + q.sasaran] : []; };
      L6.salah = function () {
        if (!siap || !q) return [];
        var lain = N.kelompok[q.pulau].filter(function (k) { return k !== q.sasaran && k !== q.acuan && k !== q.acuan2 && k !== '31'; })[0];
        return lain ? ['prov-' + lain] : [];
      };
      hud.instruksi(S.mulai, false);
      Peta.muat(function (ok) {
        if (!L6.hidup) return;
        if (!ok) { hud.instruksi(STR.l4.gagalMuat, false); return; }
        N = Nusantara.siapkan(Peta.data());
        bacakan(S.mulai);
        UI.pudarMasuk(lapisPeta);
        tampilkan();
      });
    },
    exit: function () { if (L6) { L6.hidup = false; if (L6.berhenti) L6.berhenti(); } UI.sembunyiTangan(true); },
    uji: {
      keadaan: function () { return L6 && L6.keadaan ? L6.keadaan() : { langkah: '', siap: false }; },
      benar: function () { return L6 && L6.benar ? L6.benar() : []; },
      salah: function () { return L6 && L6.salah ? L6.salah() : []; }
    }
  });
})();
