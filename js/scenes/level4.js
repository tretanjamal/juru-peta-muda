/* Level 4 Dari Indonesia ke Rumahku (GDD bagian 9; TP3 jenjang-wilayah, TP4 provinsiku).
   1. Jenjang wilayah: lima kotak bersarang, ketuk nama untuk kotak yang menyala (dari luar ke dalam).
   2. Pilih provinsi: peta Indonesia berkelompok pulau -> kelompok diperbesar -> provinsi (peta atau daftar).
   3. Pilih kabupaten/kota: peta provinsi + daftar A-Z; kartu "Kota dan Kabupaten itu berbeda" untuk nama kembar.
   4. Ada wilayah bawaan kelas: pilihan diperiksa. Tidak ada: murid mengonfirmasi, lalu menemukan lagi di peta tanpa nama.
   5. Jenjang ditampilkan ulang dengan nama wilayah murid.
   Panel "Untuk guru" (tahan 3 detik) memasang wilayah bawaan kelas. Peta Indonesia dimuat malas (Peta.muat). */
(function () {
  var L4 = null;
  var POS_LANG = [1196, 706, 0.5];
  var KOTAK = GambarL4.KOTAK;
  var namaPendek = Nama.pendek, urutNama = Nama.urut;
  function namaProv(p) { return PetaIndo.namaProv(p); }
  /* soal kota atau kabupaten: pilihan 1 menukar kota dengan kabupaten, pilihan 2 menukar jenjang (gubernur, kecamatan) */
  var MIS_KOTAKAB = [null, 'kota-kab', 'jenjang'];

  Scenes.add('level4', {
    enter: function (root) {
      var W = Seni.W, S = STR.l4, t0 = performance.now(), santai = Save.data.settings.santai, rnd = U.TEST ? U.rng(404) : Math.random;
      var kelas = Save.data.kelas && Save.data.kelas.prov && Save.data.kelas.kab ? { prov: Save.data.kelas.prov, kab: Save.data.kelas.kab } : null;
      Aud.musik('jelajah'); Aud.pramuatJingle('lengkap');
      var latar = '<rect width="1280" height="720" fill="' + W.kayu + '"/><rect width="1280" height="720" fill="url(#pola-kayu)"/>' +
        '<rect x="16" y="106" width="840" height="504" rx="18" fill="' + W.tinta + '" opacity=".28"/><rect x="16" y="100" width="840" height="504" rx="18" fill="' + W.kertas + '" stroke="' + W.tinta + '" stroke-width="4"/>';
      root.appendChild(U.h('div', 'lapis', Seni.svg(1280, 720, latar)));
      root.appendChild(U.h('h1', 'tersembunyi', UI.esc(U.fmt(STR.level.judul, { n: 4, nama: STR.level.nama[4] }))));
      var jp = U.h('p', 'judul-peta'); jp.style.cssText = 'left:28px;top:107px;width:816px'; jp.setAttribute('data-cek', 'judul peta'); root.appendChild(jp);
      var ct = U.h('p', 'catatan-peta', UI.esc(STR.peta.catatan)); ct.style.cssText = 'left:28px;top:566px;width:816px'; ct.setAttribute('data-cek', 'catatan peta'); root.appendChild(ct);
      var hud = UI.hud(root, { level: 4, sub: S.sub[0], jeda: { ulangi: function () { Scenes.go('level4'); } } });
      var lapisPeta = U.h('div', 'lapis lapis-peta'); root.appendChild(lapisPeta);
      var tangkap = U.h('div', 'tangkap-peta'); tangkap.style.cssText = 'left:' + KOTAK.x + 'px;top:' + KOTAK.y + 'px;width:' + KOTAK.w + 'px;height:' + KOTAK.h + 'px;display:none';
      root.appendChild(tangkap);
      var lapisTombol = U.h('div', 'lapis lapis-pin'); root.appendChild(lapisTombol);
      var panel = U.h('div', 'panel-kanan'); panel.style.cssText = 'left:872px;top:100px;width:392px;height:504px';
      panel.innerHTML = '<p class="judul-panel" data-cek="judul panel"></p><div class="daftar-kanan"></div>';
      root.appendChild(panel);
      var judulPanel = panel.querySelector('.judul-panel'), daftar = panel.querySelector('.daftar-kanan');
      var bawah = U.h('div', 'lapis lapis-pin'); root.appendChild(bawah);
      var lapis = Bersama.lapisHidup(root);
      var lang = Bersama.lang(lapis, POS_LANG[0], POS_LANG[1], POS_LANG[2], { eks: 'senang' });
      var langkah = 'jenjang', siap = false, salahTotal = 0, salahIni = 0, mis = {}, T = null, fokus = null, pilihProv = null, pilihKab = null, target = null;
      L4 = { hidup: true, target: kelas || { prov: '35', kab: '35.27' } };
      function bacakan(teks, eks) { return Save.data.settings.bacakan ? Bersama.ucap(teks, { lang: lang, hud: hud, eks: eks }) : Promise.resolve(); }
      function instruksi(teks, eks, html) { hud.instruksi(teks, false, html); if (eks) { lang.eks(eks); hud.potret(eks); } return bacakan(teks, eks); }
      function tebal(teks, kata) { var h = UI.esc(teks), k = UI.esc(kata), i = h.indexOf(k); return i < 0 ? h : h.slice(0, i) + '<b>' + k + '</b>' + h.slice(i + k.length); }
      function kosongkan() { lapisTombol.innerHTML = ''; daftar.innerHTML = ''; bawah.innerHTML = ''; var pgl = panel.querySelector('.penanda-gulir'); if (pgl) pgl.remove(); UI.sembunyiTangan(true); UI.pudarMasuk(lapisPeta); }
      function tombolDaftar(teks, id, onTap, kelas2) {
        var b = Input.button(UI.esc(teks), 'ketiga tombol-daftar ' + (kelas2 || ''), function () { if (siap) onTap(b); }, { id: id });
        daftar.appendChild(b);
        UI.masuk(b, Math.min(10, daftar.children.length));
        return b;
      }
      function salahKena(kode) { salahTotal++; salahIni++; if (kode) { Save.catatMis(kode); mis[kode] = (mis[kode] || 0) + 1; } }

      /* ---------- 1. jenjang wilayah ---------- */
      var isiKotak = [], tunjukJenjang = 0;
      function gambarJenjang(sorot, nama, mini) { lapisPeta.innerHTML = Seni.svg(1280, 720, GambarL4.jenjang(sorot, nama, mini)); }
      function mulaiJenjang() {
        langkah = 'jenjang'; kosongkan(); salahIni = 0;
        jp.textContent = ''; ct.style.display = 'none';
        hud.sub(S.sub[0]); hud.kemajuan(0, 5);
        judulPanel.textContent = S.jenjang.judulPanel;
        var urut = [0, 1, 2, 3, 4].sort(function () { return rnd() - 0.5; });
        if (urut.join('') === '01234') urut = [2, 0, 4, 1, 3];
        urut.forEach(function (i) {
          var b = tombolDaftar(S.jenjang.label[i], 'label-' + i, function () { ketukLabel(i, b); }, 'label-jenjang');
          b.dataset.label = i;
        });
        isiKotak = [];
        gambarJenjang(0);
        tombolGuru();
        siap = true;
        instruksi(S.jenjang.ajak, 'senang');
        UI.idle.atur(function () { return siap && langkah === 'jenjang' ? daftar.querySelector('[data-label="' + isiKotak.length + '"]') : null; });
      }
      function ketukLabel(i, b) {
        var tuju = isiKotak.length;
        UI.idle.reset(); Voice.stop();
        if (i === tuju) {
          Save.catat('jenjang-wilayah', salahIni === 0);
          Aud.sfx('tak');
          var t = UI.titik(b); if (t) UI.ledak(t.x, t.y, 10);
          b.disabled = true; b.classList.add('terpakai'); b.classList.remove('sorot-daftar');
          isiKotak.push(S.jenjang.label[i]);
          salahIni = 0; tunjukJenjang = 0; UI.sembunyiTangan(true);
          hud.keping(10); hud.kemajuan(isiKotak.length, 5);
          if (isiKotak.length < 5) {
            gambarJenjang(isiKotak.length, isiKotak);
            instruksi(i === 0 ? S.jenjang.benarTerbesar : U.fmt(S.jenjang.benar, { nama: S.jenjang.label[i] }), 'sorak');
          } else selesaiJenjang();
          return;
        }
        salahKena(i > tuju ? 'jenjang' : null);
        Save.catatSalah('jenjang-wilayah');
        Aud.sfx('bad'); UI.goyang(b);
        var tingkat = santai ? Math.max(2, salahIni) : salahIni, teks = U.fmt(i > tuju ? S.jenjang.salahKecil : S.jenjang.salahBesar, { pilihan: S.jenjang.label[i] });
        var benarEl = daftar.querySelector('[data-label="' + tuju + '"]');
        if (tingkat >= 2) { teks = S.jenjang.petunjuk2; benarEl.classList.add('sorot-daftar'); }
        if (tingkat >= 3) { teks = S.jenjang.petunjuk3; UI.tunjuk(benarEl, { arah: 'kiri' }); tunjukJenjang++; }
        instruksi(teks, 'berpikir');
      }
      function selesaiJenjang() {
        siap = false;
        gambarJenjang(null, isiKotak, true);
        lang.pose('hinggap', 'sorak'); hud.potret('sorak');
        hud.instruksi(S.jenjang.banyak, false);
        Promise.all([bacakan(S.jenjang.banyak, 'bangga'), Tween.wait(2200)]).then(function () { if (L4.hidup) mulaiKotaKab(0); });
      }
      /* membedakan kota dengan kabupaten (TP3): dua soal pilihan, petunjuk dari pesan salah, jawaban benar ditunjuk setelah salah kedua */
      function mulaiKotaKab(n) {
        var K = S.jenjang.kotaKab, q = K.soal[n];
        if (!q) { siap = false; return muatPeta.then(function () { if (L4.hidup) mulaiPulau(); }); }
        langkah = 'kotaKab'; kosongkan(); salahIni = 0;
        judulPanel.textContent = K.judulPanel;
        var urut = [0, 1, 2].sort(function () { return rnd() - 0.5; });
        urut.forEach(function (i) {
          var b = tombolDaftar(q.pilihan[i], 'kotakab-' + i, function () {
            UI.idle.reset(); Voice.stop();
            if (i === 0) {
              siap = false; Save.catat('jenjang-wilayah', salahIni === 0); Aud.sfx('good'); UI.lompat(b); hud.keping(salahIni ? 5 : 10);
              Array.prototype.forEach.call(daftar.querySelectorAll('button'), function (x) { x.disabled = true; });
              Promise.all([instruksi(q.benar, 'sorak'), Tween.wait(1200)]).then(function () { if (L4.hidup) mulaiKotaKab(n + 1); });
              return;
            }
            salahKena(MIS_KOTAKAB[i]); Save.catatSalah('jenjang-wilayah'); Aud.sfx('bad'); UI.goyang(b); b.disabled = true;
            if (salahIni >= 2 || santai) UI.tunjuk(daftar.querySelector('[data-id="kotakab-0"]'), { arah: 'kiri' });
            instruksi(q.salah[i], 'berpikir');
          }, 'label-jenjang');
          b.dataset.benar = i === 0 ? '1' : '';
        });
        siap = true;
        instruksi(q.tanya, 'senang');
        UI.idle.atur(function () { return siap && langkah === 'kotaKab' ? daftar.querySelector('.tombol-daftar') : null; });
      }

      /* ---------- peta ---------- */
      var muatPeta = new Promise(function (ok) { Peta.muat(function (berhasil) { ok(berhasil); }); });
      /* peta Indonesia atau provinsi di dalam bingkai (js/scenes/level4Gambar.js); T dipakai ketukan peta */
      function pasangPeta(r) { T = r.T; lapisPeta.innerHTML = Seni.svg(1280, 720, GambarL4.bingkaiPeta(r.svg)); tangkap.style.display = 'block'; return r; }
      function gambarIndonesia(o) { o.kotak = KOTAK; return pasangPeta(PetaIndo.indonesia(o)); }
      function gambarProvinsi(o) { o.kotak = KOTAK; return pasangPeta(PetaIndo.provinsi(o)); }
      tangkap.addEventListener('click', function (e) {
        if (!siap || !T) return;
        var p = Stage.toLocal(e.clientX, e.clientY);
        if (langkah === 'pulau' || langkah === 'provinsi' || langkah === 'temukanProv') {
          var pv = PetaIndo.sasaranKetuk(p, Peta.provPada(p.x, p.y, T), PetaIndo.daftarProv(), T); if (pv) ketukProvinsi(pv);
        } else if (langkah === 'kab' || langkah === 'temukanKab') {
          var kode = Peta.kabDi(pilihProv), kb = PetaIndo.sasaranKetuk(p, Peta.kabPada(p.x, p.y, T, kode.map(function (k) { return k.kode; })), kode, T); if (kb) ketukKab(kb);
        }
      });
      function tombolPeta(id, x, y, aria, onTap) {
        /* tombol keyboard saja: ketukan jari/mouse ditangani poligon peta (tombol 64 px yang bertumpuk bisa salah sasaran) */
        var b = U.h('button', 'pin-wilayah pin-kibor'); b.type = 'button'; b.dataset.id = id;
        b.style.left = Math.round(x - 32) + 'px'; b.style.top = Math.round(y - 32) + 'px';
        b.setAttribute('aria-label', aria);
        b.addEventListener('click', function () { if (siap) onTap(b); });
        lapisTombol.appendChild(b);
        return b;
      }
      /* panah "masih ada di bawah" selama daftar bisa digulir */
      function penandaGulir() {
        var lama = panel.querySelector('.penanda-gulir'); if (lama) lama.remove();
        var pg = U.h('span', 'penanda-gulir', UI.ikon('panah', 30)); pg.setAttribute('aria-hidden', 'true'); panel.appendChild(pg);
        function segar() { pg.style.display = daftar.scrollHeight - daftar.scrollTop - daftar.clientHeight > 8 ? '' : 'none'; }
        daftar.onscroll = segar; setTimeout(segar, 60);
      }
      function kotakDalam(q) { return q[0] > KOTAK.x + 10 && q[0] < KOTAK.x + KOTAK.w - 10 && q[1] > KOTAK.y + 10 && q[1] < KOTAK.y + KOTAK.h - 10; }

      /* ---------- 2. pulau dan provinsi ---------- */
      function mulaiPulau() {
        if (!Peta.siap()) { instruksi(S.gagalMuat, 'berpikir'); return; }
        langkah = 'pulau'; kosongkan(); salahIni = 0; fokus = null;
        ct.style.display = '';
        hud.sub(S.sub[1]); hud.kemajuan(0, 2);
        jp.textContent = S.judulIndonesia;
        gambarIndonesia({ labelPulau: true });
        judulPanel.textContent = S.pulau.judulPanel;
        PetaIndo.PULAU.forEach(function (nama, i) { tombolDaftar(nama, 'pulau-' + i, function () { pilihPulau(nama); }, 'dua-kolom'); });
        tombolGuru();
        siap = true;
        instruksi(S.pulau.ajak, 'senang');
        UI.idle.atur(function () { return siap && langkah === 'pulau' ? daftar.querySelector('.tombol-daftar') : null; });
      }
      function pilihPulau(nama) {
        UI.idle.reset();
        langkah = 'provinsi'; fokus = nama; kosongkan();
        Aud.sfx('whoosh');
        lang.pose('terbang', 'senang');
        lang.terbangKe(POS_LANG[0] - 40, POS_LANG[1] - 30, POS_LANG[2], 300, 20).then(function () { if (L4.hidup) { lang.pose('hinggap', 'senang'); lang.terbangKe(POS_LANG[0], POS_LANG[1], POS_LANG[2], 300, 0); } });
        gambarIndonesia({ fokus: nama, labelProv: true });
        judulPanel.textContent = U.fmt(S.provinsi.judulPanel, { pulau: nama });
        var grup = PetaIndo.kelompok()[nama];
        grup.slice().sort(function (a, b) { return namaProv(Peta.prov(a)).localeCompare(namaProv(Peta.prov(b)), 'id'); }).forEach(function (p) {
          tombolDaftar(namaProv(Peta.prov(p)), 'prov-' + p, function () { ketukProvinsi(p); }, 'dua-kolom');
        });
        bawah.appendChild(Input.button('<span class="ikon-balik">' + UI.ikon('panah', 30) + '</span>' + UI.esc(S.pulau.lain), 'ketiga', function () { if (siap) mulaiPulau(); }, { x: 872, y: 620, w: 230, h: 64, font: 22, id: 'pulau-lain' }));
        siap = true;
        instruksi(S.provinsi.ajak, 'senang');
        UI.idle.atur(function () { return siap && langkah === 'provinsi' ? daftar.querySelector('.tombol-daftar') : null; });
      }
      function ketukProvinsi(p) {
        UI.idle.reset(); Voice.stop();
        if (langkah === 'pulau') { pilihPulau(Peta.prov(p).pulau); return; }
        if (langkah === 'temukanProv') return cekTemukanProv(p);
        if (langkah !== 'provinsi') return;
        if (fokus && Peta.prov(p).pulau !== fokus) { pilihPulau(Peta.prov(p).pulau); return; }
        Aud.sfx('pilih');
        gambarIndonesia({ fokus: fokus, labelProv: true, terpilih: p });
        if (kelas) {
          if (p === kelas.prov) { Save.catat('provinsiku', salahIni === 0); Aud.sfx('good'); hud.keping(salahIni ? 5 : 10); pilihProv = p; siap = false; instruksi(S.guruCek.provBenar, 'sorak').then(function () { if (L4.hidup) mulaiKab(); }); return; }
          salahKena(); Save.catatSalah('provinsiku'); Aud.sfx('bad');
          var tk = santai ? Math.max(2, salahIni) : salahIni, pul = Peta.prov(kelas.prov).pulau;
          if (tk >= 2 && fokus !== pul) { pilihPulau(pul); }
          if (tk >= 3) { gambarIndonesia({ fokus: pul, labelProv: true, sorot: kelas.prov }); var bt = daftar.querySelector('[data-id="prov-' + kelas.prov + '"]'); if (bt) UI.tunjuk(bt, { arah: 'kiri' }); }
          instruksi(U.fmt(S.guruCek.provSalah, { pulau: pul }), 'berpikir');
          return;
        }
        konfirmasi(U.fmt(S.provinsi.tanya, { P: namaProv(Peta.prov(p)) }), function (ya) {
          if (ya) { pilihProv = p; mulaiKab(); } else gambarIndonesia({ fokus: fokus, labelProv: true });
        });
      }
      /* kartu konfirmasi di panel kanan bawah */
      function konfirmasi(teks, cb) {
        siap = false;
        instruksi(teks, 'senang');
        bawah.innerHTML = '';
        var ya = Input.button(UI.esc(S.provinsi.ya), 'utama', function () { bawah.innerHTML = ''; siap = true; cb(true); }, { x: 872, y: 620, w: 190, h: 64, font: 24, id: 'konfirm-ya' });
        var tidak = Input.button(UI.esc(S.provinsi.bukan), 'ketiga', function () { bawah.innerHTML = ''; siap = true; if (langkah === 'provinsi') pilihPulau(fokus); else if (langkah === 'kab') mulaiKab(true); cb(false); }, { x: 1072, y: 620, w: 192, h: 64, font: 20, id: 'konfirm-bukan' });
        bawah.appendChild(ya); bawah.appendChild(tidak);
        setTimeout(function () { if (ya.isConnected) ya.focus({ preventScroll: true }); }, 50);
        UI.idle.atur(function () { return ya.isConnected ? ya : null; });
      }

      /* ---------- 3. kabupaten/kota ---------- */
      function mulaiKab(ulang) {
        langkah = 'kab'; kosongkan(); if (!ulang) salahIni = 0;
        hud.sub(S.sub[2]); hud.kemajuan(1, 2);
        var pr = Peta.prov(pilihProv);
        jp.textContent = U.fmt(S.judulProvinsi, { P: namaProv(pr).toUpperCase() });
        gambarProvinsi({ prov: pilihProv, warna: true });
        judulPanel.textContent = S.kab.judulPanel;
        var hurufLalu = '';
        Peta.kabDi(pilihProv).slice().sort(urutNama).forEach(function (k) {
          var h = namaPendek(k.label).charAt(0).toUpperCase();
          if (h !== hurufLalu) { hurufLalu = h; var sep = U.h('p', 'huruf-daftar', UI.esc(h)); sep.setAttribute('aria-hidden', 'true'); daftar.appendChild(sep); }
          tombolDaftar(k.label, 'kab-' + k.kode, function () { ketukKab(k.kode); });
        });
        penandaGulir();
        siap = true;
        instruksi(S.kab.ajak, 'senang');
        UI.idle.atur(function () { return siap && langkah === 'kab' ? daftar.querySelector('.tombol-daftar') : null; });
      }
      function kembarDari(k) {
        var n = namaPendek(Peta.kab(k).label);
        return Peta.kabDi(Peta.kab(k).prov).filter(function (x) { return x.kode !== k && namaPendek(x.label) === n; }).map(function (x) { return x.kode; })[0] || null;
      }
      function ketukKab(k) {
        UI.idle.reset(); Voice.stop();
        if (langkah === 'temukanKab') return cekTemukanKab(k);
        if (langkah !== 'kab') return;
        Aud.sfx('pilih');
        var kb = kembarDari(k);
        if (kb && !kelas) return kartuKembar(k, kb, function (pilih) { lanjutKab(pilih); });
        lanjutKab(k);
      }
      function lanjutKab(k) {
        gambarProvinsi({ prov: pilihProv, warna: true, terpilih: k });
        var item = daftar.querySelector('[data-id="kab-' + k + '"]'); if (item) item.scrollIntoView({ block: 'nearest' });
        if (kelas) {
          if (k === kelas.kab) { Save.catat('provinsiku', salahIni === 0); Aud.sfx('good'); hud.keping(salahIni ? 5 : 10); pilihKab = k; siap = false; instruksi(S.guruCek.kabBenar, 'sorak').then(function () { if (L4.hidup) akhir(); }); return; }
          var kembar = kembarDari(k) === kelas.kab;
          salahKena(kembar ? 'kembar' : null); Save.catatSalah('provinsiku'); Aud.sfx('bad');
          var tk = santai ? Math.max(2, salahIni) : salahIni, teks = kembar ? U.fmt(S.guruCek.kembar, { A: Peta.kab(k).label, B: Peta.kab(kelas.kab).label }) : S.guruCek.kabSalah;
          if (tk >= 2) { var tandai = {}; tandai[kelas.kab] = W.jinggaTerang; Peta.kab(kelas.kab).tetangga.forEach(function (t) { if (Peta.kab(t[0]).prov === pilihProv) tandai[t[0]] = W.jinggaTerang; }); gambarProvinsi({ prov: pilihProv, warna: true, tandai: tandai }); teks = kembar ? teks : S.temukan.petunjuk2Kab; }
          if (tk >= 3) { gambarProvinsi({ prov: pilihProv, warna: true, sorot: kelas.kab }); var bt = daftar.querySelector('[data-id="kab-' + kelas.kab + '"]'); if (bt) { bt.scrollIntoView({ block: 'nearest' }); UI.tunjuk(bt, { arah: 'kiri' }); } teks = S.temukan.petunjuk3; }
          instruksi(teks, 'berpikir');
          return;
        }
        konfirmasi(U.fmt(S.kab.tanya, { K: Peta.kab(k).label, P: namaProv(Peta.prov(pilihProv)) }), function (ya) {
          if (ya) { pilihKab = k; Save.data.wilayah = { prov: pilihProv, kab: k }; Save.save(); mulaiTemukanProv(); }
        });
      }
      /* kartu "Kota dan Kabupaten itu berbeda": dua batas disorot dengan dua warna */
      function kartuKembar(a, b, cb) {
        siap = false;
        var tandai = {}; tandai[a] = W.jinggaTerang; tandai[b] = Seni.ISI.sage;
        gambarProvinsi({ prov: pilihProv, warna: false, tandai: tandai });
        var o = UI.overlay(S.kembar.judul, 'panel-kembar');
        o.body.insertAdjacentHTML('beforeend', '<p class="teks-kembar" data-cek="kembar">' + UI.esc(U.fmt(S.kembar.isi, { A: Peta.kab(a).label, B: Peta.kab(b).label })) + '</p><p class="teks-kembar beda-kembar">' + UI.esc(S.kembar.beda) + '</p><p class="teks-kembar"><b>' + UI.esc(S.kembar.pilih) + '</b></p>');
        /* peta kecil di dalam kartu: dua wilayah kembar dengan dua warna (peta besar tertutup kartu) */
        o.body.insertAdjacentHTML('beforeend', '<div class="peta-kembar">' + GambarL4.petaKembar(a, b, pilihProv, tandai) + '</div>');
        var baris = U.h('div', 'baris-tombol');
        [a, b].forEach(function (k, i) {
          baris.appendChild(Input.button('<span class="kotak-warna" style="background:' + (i ? Seni.ISI.sage : W.jinggaTerang) + '"></span>' + UI.esc(Peta.kab(k).label), i ? 'kedua' : 'utama', function () { o.close(); siap = true; cb(k); }, { id: 'kembar-' + k }));
        });
        o.body.appendChild(baris);
        bacakan(U.fmt(S.kembar.isi, { A: Peta.kab(a).label, B: Peta.kab(b).label }));
      }

      /* ---------- 4. temukan lagi di peta tanpa nama ---------- */
      function tombolProvTanpaNama() {
        lapisTombol.innerHTML = '';
        Peta.data().provinsi.forEach(function (p, i) { var q = Peta.P(p.label, T); if (kotakDalam(q)) tombolPeta('peta-prov-' + p.kode, q[0], q[1], U.fmt(S.aria.provinsi, { n: i + 1 }), function () { ketukProvinsi(p.kode); }); });
      }
      function tombolKabTanpaNama() {
        lapisTombol.innerHTML = '';
        Peta.kabDi(pilihProv).forEach(function (k, i) { var q = Peta.P(k.titik, T); if (kotakDalam(q)) tombolPeta('peta-kab-' + k.kode, q[0], q[1], U.fmt(S.aria.wilayah, { n: i + 1 }), function () { ketukKab(k.kode); }); });
      }
      function mulaiTemukanProv() {
        langkah = 'temukanProv'; kosongkan(); salahIni = 0;
        hud.sub(S.sub[3]); hud.kemajuan(0, 2);
        jp.textContent = S.judulIndonesia;
        judulPanel.textContent = S.temukan.dicari;
        daftar.innerHTML = '<p class="yang-dicari" data-cek="yang dicari">' + UI.esc('Provinsi ' + namaProv(Peta.prov(pilihProv))) + '</p>';
        gambarIndonesia({});
        tombolProvTanpaNama();
        siap = true;
        instruksi(S.temukan.ajakProv, 'senang');
        /* isyarat: ketuk di peta (tidak menunjuk jawabannya) */
        UI.idle.atur(function () { return siap && langkah === 'temukanProv' ? { x: KOTAK.x + KOTAK.w / 2, y: KOTAK.y + KOTAK.h / 2 } : null; });
      }
      function cekTemukanProv(p) {
        if (p === pilihProv) {
          Save.catat('provinsiku', salahIni === 0); Aud.sfx('good'); hud.keping(salahIni ? 5 : 10);
          var q = Peta.P(Peta.prov(p).label, T); UI.ledak(q[0], q[1], 14);
          siap = false; UI.sembunyiTangan(true);
          gambarIndonesia({ terpilih: p });
          instruksi(U.fmt(S.temukan.benarProv, { P: namaProv(Peta.prov(p)) }), 'sorak').then(function () { return Tween.wait(600); }).then(function () { if (L4.hidup) mulaiTemukanKab(); });
          return;
        }
        salahKena(); Save.catatSalah('provinsiku'); Aud.sfx('bad');
        var tk = santai ? Math.max(2, salahIni) : salahIni, pul = Peta.prov(pilihProv).pulau, teks = U.fmt(S.temukan.salahProv, { pulau: pul });
        if (tk >= 2) { gambarIndonesia({ sorotPulau: pul }); tombolProvTanpaNama(); teks = S.temukan.petunjuk2Prov; }
        if (tk >= 3) { gambarIndonesia({ sorotPulau: pul, sorot: pilihProv }); tombolProvTanpaNama(); var q2 = Peta.P(Peta.prov(pilihProv).label, T); UI.tunjuk({ x: q2[0], y: q2[1] }); teks = S.temukan.petunjuk3; }
        instruksi(teks, 'berpikir');
      }
      function mulaiTemukanKab() {
        langkah = 'temukanKab'; kosongkan(); salahIni = 0;
        hud.kemajuan(1, 2);
        jp.textContent = U.fmt(S.judulProvinsi, { P: namaProv(Peta.prov(pilihProv)).toUpperCase() });
        gambarProvinsi({ prov: pilihProv, warna: true });
        tombolKabTanpaNama();
        judulPanel.textContent = S.temukan.dicari;
        daftar.innerHTML = '<p class="yang-dicari" data-cek="yang dicari">' + UI.esc(Peta.kab(pilihKab).label) + '</p>';
        siap = true;
        instruksi(S.temukan.ajakKab, 'senang');
        UI.idle.atur(function () { return siap && langkah === 'temukanKab' ? { x: KOTAK.x + KOTAK.w / 2, y: KOTAK.y + KOTAK.h / 2 } : null; });
      }
      function cekTemukanKab(k) {
        if (k === pilihKab) {
          Save.catat('provinsiku', salahIni === 0); Aud.sfx('good'); hud.keping(salahIni ? 5 : 10);
          var q = Peta.P(Peta.kab(k).titik, T); UI.ledak(q[0], q[1], 14);
          siap = false; UI.sembunyiTangan(true);
          gambarProvinsi({ prov: pilihProv, warna: true, terpilih: k });
          instruksi(U.fmt(S.temukan.benarKab, { K: Peta.kab(k).label }), 'sorak').then(function () { return Tween.wait(600); }).then(function () { if (L4.hidup) akhir(); });
          return;
        }
        salahKena(kembarDari(k) === pilihKab ? 'kembar' : null); Save.catatSalah('provinsiku'); Aud.sfx('bad');
        var aK = Peta.kab(k).arah[pilihKab], tk = santai ? Math.max(2, salahIni) : salahIni;
        /* arah hanya disebut bila jelas: jauh dari batas sektor, 80% luas di sektor, bentang paling lebar 270 derajat */
        var teks = aK && Arah.jarakBatas(aK[0]) >= Arah.BATAS && aK[1] >= 80 && aK[2] <= 270 ? U.fmt(S.temukan.salahKab, { X: Peta.kab(k).label, arah: STR.arah[Arah.indeks(aK[0])] }) : U.fmt(S.temukan.salahKabUmum, { X: Peta.kab(k).label });
        if (tk >= 2) { var tandai = {}; tandai[pilihKab] = W.jinggaTerang; Peta.kab(pilihKab).tetangga.forEach(function (t) { if (Peta.kab(t[0]).prov === pilihProv) tandai[t[0]] = W.jinggaTerang; }); gambarProvinsi({ prov: pilihProv, warna: true, tandai: tandai }); tombolKabTanpaNama(); teks = S.temukan.petunjuk2Kab; }
        if (tk >= 3) { gambarProvinsi({ prov: pilihProv, warna: true, sorot: pilihKab }); tombolKabTanpaNama(); var q2 = Peta.P(Peta.kab(pilihKab).titik, T); UI.tunjuk({ x: q2[0], y: q2[1] }); teks = S.temukan.petunjuk3; }
        instruksi(teks, 'berpikir');
      }

      /* ---------- 5. alamat wilayahku ---------- */
      function akhir() {
        langkah = 'akhir'; kosongkan(); siap = false;
        if (kelas) { pilihProv = kelas.prov; pilihKab = kelas.kab; }
        Save.data.wilayah = { prov: pilihProv, kab: pilihKab }; Save.save();
        tangkap.style.display = 'none'; ct.style.display = 'none';
        /* ringkasan alamat wilayah di panel kanan */
        judulPanel.textContent = S.akhir.judul;
        daftar.innerHTML = '<ol class="alamat-wilayah" data-cek="alamat wilayah">' + ['Indonesia', 'Provinsi ' + namaProv(Peta.prov(pilihProv)), Peta.kab(pilihKab).label].map(function (t) { return '<li>' + UI.esc(t) + '</li>'; }).join('') +
          '<li class="umum">' + UI.esc(S.akhir.kecamatan) + '</li><li class="umum">' + UI.esc(S.akhir.desa) + '</li></ol>';
        Array.prototype.forEach.call(daftar.querySelectorAll('li'), function (li, i) { UI.masuk(li, i * 3); });
        hud.sub(S.sub[4]); hud.kemajuan(2, 2);
        jp.textContent = S.akhir.judul.toUpperCase();
        gambarJenjang(null, ['Indonesia', namaProv(Peta.prov(pilihProv)), Peta.kab(pilihKab).label, S.akhir.kecamatan, S.akhir.desa]);
        lang.pose('hinggap', 'bangga'); hud.potret('bangga');
        Aud.sfx('cap'); Aud.jingle('lengkap');
        var bintang = salahTotal === 0 ? 3 : salahTotal <= 2 ? 2 : 1;
        Save.catatLevel(4, { selesai: true, bintang: bintang, petunjuk3: tunjukJenjang, detik: Math.round((performance.now() - t0) / 1000) });
        var tip = Object.keys(mis).filter(function (k) { return STR.hasil.tip[k]; }).sort(function (a, b) { return mis[b] - mis[a]; })[0] || '';
        hud.instruksi(S.akhir.kata, false);
        Promise.all([Bersama.ucap(S.akhir.kata, { lang: lang, hud: hud, eks: 'bangga' }), Tween.wait(2600)]).then(function () {
          if (L4.hidup) Scenes.go('hasil', { level: 4, bintang: bintang, tip: tip });
        });
      }

      /* panel "Untuk guru" (tahan 3 detik, pilih wilayah kelas): js/scenes/guruWilayah.js */
      function tombolGuru() { GuruWilayah.tombol(bawah, { sebelum: function () { siap = false; }, sesudah: function () { siap = true; } }); }

      /* ---------- kait uji ---------- */
      function adaKonfirm() { return !!document.querySelector('[data-id="konfirm-ya"]'); }
      function adaKembar() { var e = document.querySelector('.panel-kembar [data-id^="kembar-"]'); return e ? e.dataset.id : null; }
      L4.keadaan = function () { return { langkah: langkah, siap: siap || adaKonfirm() || !!adaKembar(), salah: salahIni, kelas: !!kelas, fokus: fokus, prov: pilihProv, kab: pilihKab, termuat: Peta.siap() }; };
      L4.benar = function () {
        if (adaKonfirm()) return ['konfirm-ya'];
        if (adaKembar()) return document.querySelector('[data-id="kembar-' + L4.target.kab + '"]') ? ['kembar-' + L4.target.kab] : [adaKembar()];
        if (!siap) return [];
        var t = L4.target;
        switch (langkah) {
          case 'jenjang': return ['label-' + isiKotak.length];
          case 'kotaKab': return ['kotakab-0'];
          case 'pulau': return ['pulau-' + PetaIndo.PULAU.indexOf(Peta.prov(t.prov).pulau)];
          case 'provinsi': return document.querySelector('[data-id="konfirm-ya"]') ? ['konfirm-ya'] : (fokus === Peta.prov(t.prov).pulau ? ['prov-' + t.prov] : ['pulau-lain']);
          case 'kab': if (document.querySelector('[data-id="konfirm-ya"]')) return ['konfirm-ya']; if (document.querySelector('[data-id="kembar-' + t.kab + '"]')) return ['kembar-' + t.kab]; return ['kab-' + t.kab];
          case 'temukanProv': return ['peta-prov-' + pilihProv];
          case 'temukanKab': return ['peta-kab-' + pilihKab];
        }
        return [];
      };
      L4.salah = function () {
        if (!siap) return [];
        var t = L4.target;
        switch (langkah) {
          case 'jenjang': return ['label-' + Math.min(4, isiKotak.length + 1)];
          case 'kotaKab': var kk = [1, 2].filter(function (i) { var e = document.querySelector('[data-id="kotakab-' + i + '"]'); return e && !e.disabled; })[0]; return kk ? ['kotakab-' + kk] : [];
          case 'temukanProv': var lain = Peta.data().provinsi.filter(function (p) { return p.kode !== pilihProv && document.querySelector('[data-id="peta-prov-' + p.kode + '"]'); })[0]; return lain ? ['peta-prov-' + lain.kode] : [];
          case 'temukanKab': var lk = Peta.kabDi(pilihProv).filter(function (k) { return k.kode !== pilihKab && document.querySelector('[data-id="peta-kab-' + k.kode + '"]'); })[0]; return lk ? ['peta-kab-' + lk.kode] : [];
          case 'provinsi': if (kelas) { var lp = PetaIndo.kelompok()[fokus].filter(function (p) { return p !== t.prov; })[0]; return lp ? ['prov-' + lp] : []; } return [];
          case 'kab': if (kelas) { var lk2 = Peta.kabDi(pilihProv).filter(function (k) { return k.kode !== t.kab; })[0]; return lk2 ? ['kab-' + lk2.kode] : []; } return [];
        }
        return [];
      };
      mulaiJenjang();
    },
    exit: function () { if (L4) L4.hidup = false; UI.sembunyiTangan(true); },
    uji: {
      keadaan: function () { return L4 && L4.keadaan ? L4.keadaan() : { langkah: '', siap: false }; },
      benar: function () { return L4 && L4.benar ? L4.benar() : []; },
      salah: function () { return L4 && L4.salah ? L4.salah() : []; },
      aturTarget: function (prov, kab) { if (L4) L4.target = { prov: prov, kab: kab }; }
    }
  });
})();
