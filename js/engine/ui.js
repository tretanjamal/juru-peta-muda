/* UI: komponen bersama Juru Peta Muda. Disalin dari Kafe Cilik (pola overlay, sakelar, Pengaturan dari Lompat Waktu) dan disesuaikan GDD bagian 12.
   Isi: pengaturan dan senyap, ikon pojok, HUD layar bermain, overlay (Pengaturan, Jeda, Legenda, Informasi, Ringkasan untuk Guru),
   toast, tangan penunjuk dan isyarat 8 detik, partikel, hitung naik, goyang, dan lompat. */
(function (root) {
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
  function stage() { return document.getElementById('stage'); }
  /* titik di panggung untuk elemen atau {x, y}; fy = letak vertikal (0 atas, 1 bawah) */
  function titik(sasaran, fy) {
    if (!sasaran) return null;
    if (sasaran.x != null && !sasaran.getBoundingClientRect) return sasaran;
    var r = sasaran.getBoundingClientRect();
    if (!r.width && !r.height) return null;
    return Stage.toLocal(r.left + r.width / 2, r.top + r.height * (fy == null ? 0.5 : fy));
  }
  var TAG = ['mata-angin', 'baca-peta', 'jenjang-wilayah', 'provinsiku', 'kabkotaku', 'nalar-letak'];

  var UI = {
    prefersReduced: !!(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches),
    kurangi: false,
    esc: esc,
    titik: titik,
    TAG: TAG,
    applySettings: function () {
      var s = Save.data.settings;
      Aud.setMuted(s.senyap); Aud.setBus('musik', s.musik); Aud.setBus('sfx', s.efek);
      UI.kurangi = s.kurangi || UI.prefersReduced;
      document.body.classList.toggle('kurangi-gerak', UI.kurangi);
      Tween.speed = UI.kurangi ? 0.4 : (U.TEST ? 0.3 : 1);
    },
    ikon: function (nama, ukuran, arg) { return Seni.ikon(nama, ukuran || 40, arg); },
    tombolIkon: function (nama, aria, onTap, o) {
      o = o || {}; o.aria = aria;
      return Input.button(UI.ikon(nama, o.ukuran || 40), 'ketiga ikon ' + (o.cls || ''), onTap, o);
    },
    /* suara perangkat untuk bahasa ini tersedia? */
    adaSuara: function (lang) { return Voice.available() && !!Voice.voice(lang, 'w'); },
    /* sekali per sesi: suara Lang diminta tetapi perangkat tidak punya suara bahasa Indonesia (daftar suara dimuat asinkron, jadi ditunggu dulu) */
    cekSuara: function () {
      if (UI._cekSuara || U.TEST || !Save.data.settings.bacakan) return;
      UI._cekSuara = true;
      /* juga bila peramban sama sekali tidak punya speechSynthesis; saat luring hanya suara lokal yang dihitung (Voice.voice) */
      setTimeout(function () { if (!UI._suaraDiberitahu && (!window.speechSynthesis || !Voice.voice('id-ID', 'w'))) { UI._suaraDiberitahu = true; UI.toast(STR.pengaturan.tanpaSuara); } }, 2500);
    },
    /* instruksi dibacakan Lang bila diizinkan; tanpa suara id-ID tidak ada jeda kosong */
    bacakan: function (teks, paksa) {
      if (!teks || (!paksa && !Save.data.settings.bacakan) || !UI.adaSuara('id-ID')) return Promise.resolve();
      return Voice.say(teks, { lang: 'id-ID', tokoh: 'lang' });
    },

    /* ikon pojok kanan atas layar judul: suara, layar penuh, pengaturan. Mengembalikan fungsi pembersih. */
    pojok: function (parent) {
      var s = Save.data.settings, x = 1196, fs = null;
      var atur = UI.tombolIkon('gerigi', STR.ikon.pengaturan, function () { UI.pengaturan(); }, { x: x, y: 16, id: 'pengaturan' });
      if (FS.supported()) {
        x -= 80;
        fs = UI.tombolIkon('layarPenuh', STR.ikon.layarPenuh, function () { FS.toggle(function () { UI.toast(STR.ikon.fsDitolak); }); }, { x: x, y: 16, id: 'layar-penuh' });
      }
      x -= 80;
      var snd = UI.tombolIkon(s.senyap ? 'senyap' : 'suara', '', function () { s.senyap = !s.senyap; Save.save(); UI.applySettings(); segar(); }, { x: x, y: 16, id: 'suara' });
      function segar() {
        Input.label(snd, UI.ikon(s.senyap ? 'senyap' : 'suara'));
        snd.setAttribute('aria-label', s.senyap ? STR.ikon.suaraMati : STR.ikon.suaraNyala);
        if (fs) fs.setAttribute('aria-label', FS.isFull() ? STR.ikon.keluarPenuh : STR.ikon.layarPenuh);
      }
      [snd, fs, atur].forEach(function (b) { if (b) parent.appendChild(b); });
      segar();
      FS.onChange(segar);
      return function () { FS.offChange(segar); };
    },

    /* HUD layar bermain (GDD bagian 14): papan level, papan instruksi dengan potret Lang, keping kompas, Legenda, Jeda.
       o: level, sub (teks kecil), jeda {ulangi} */
    hud: function (parent, o) {
      var h = { teks: '' };
      var pl = U.h('div', 'papan-hud papan-level');
      pl.style.cssText = 'left:16px;top:12px;width:316px;height:80px';
      pl.innerHTML = '<p class="kecil" data-cek="papan level kecil"></p><p class="judul-level" data-cek="judul level">' + esc((STR.level.pendek || [])[o.level] || STR.level.nama[o.level]) + '</p>' +
        '<div class="jejak">' + UI.ikon('mawar', 30) + '<span class="nilai-jejak"></span></div>';
      parent.appendChild(pl);
      /* judul level dipaskan supaya tidak menabrak jejak kemajuan di kanan */
      h.paskanJudul = function () {
        var jl = pl.querySelector('.judul-level'), jk = pl.querySelector('.jejak');
        jl.style.display = 'inline-block';
        var maks = 316 - 26 - jk.offsetWidth - 22;
        for (var u = 26; u >= 20; u--) { jl.style.fontSize = u + 'px'; if (jl.offsetWidth <= maks) break; }
      };
      h.sub = function (teks) { pl.querySelector('.kecil').textContent = teks; };
      h.kemajuan = function (i, n) { pl.querySelector('.nilai-jejak').textContent = i + '/' + n; h.paskanJudul(); };
      h.sub(o.sub || U.fmt(STR.level.kecil, { n: o.level }));
      var ins = U.h('div', 'papan-hud instruksi');
      ins.style.cssText = 'left:346px;top:12px;width:556px;height:80px';
      ins.innerHTML = '<span class="potret">' + Seni.potret(64, 'senang') + '</span><p class="teks-instruksi" aria-live="polite" data-cek="instruksi"></p>';
      ins.appendChild(UI.tombolIkon('dengar', STR.ikon.dengarInstruksi, function () { Voice.stop(); UI.bacakan(h.teks, true); }, { id: 'dengar-instruksi', cls: 'alir' }));
      parent.appendChild(ins);
      /* html: versi bertanda (arah dicetak tebal), teks: yang dibacakan */
      h.instruksi = function (teks, bacakan, html) {
        h.teks = teks;
        var el = ins.querySelector('.teks-instruksi');
        if (html) el.innerHTML = html; else el.textContent = teks;
        el.classList.remove('padat'); el.style.fontSize = ''; el.style.lineHeight = '';
        if (el.scrollHeight > el.clientHeight + 2) el.classList.add('padat');
        /* nama wilayah sungguhan bisa sangat panjang: kecilkan sampai muat 2 baris, paling kecil 20 px (ukuran label) */
        for (var u = 23; u >= 20 && el.scrollHeight > el.clientHeight + 6; u--) { el.style.fontSize = u + 'px'; el.style.lineHeight = Math.round(u * 1.25) + 'px'; }
        /* masih tiga baris di 20 px (nama wilayah sangat panjang): baris dirapatkan supaya tiga baris muat utuh, tidak terpotong */
        if (el.scrollHeight > el.clientHeight + 6) el.style.lineHeight = '21px';
        return bacakan === false ? Promise.resolve() : UI.bacakan(teks);
      };
      h.potret = function (eks) { ins.querySelector('.potret').innerHTML = Seni.potret(64, eks); };
      var chip = U.h('div', 'papan-hud chip-koin');
      chip.style.cssText = 'left:916px;top:14px;width:172px;height:68px';
      chip.setAttribute('aria-label', STR.ikon.koin);
      chip.innerHTML = UI.ikon('koin', 46) + '<span class="nilai" data-cek="keping"></span>';
      parent.appendChild(chip);
      h.kepingEl = chip.querySelector('.nilai');
      h.kepingEl.textContent = Save.data.keping;
      h.keping = function (tambah) {
        var dari = Save.data.keping, ke = Save.tambahKeping(tambah);
        Aud.sfx('koin');
        return UI.hitungNaik(h.kepingEl, dari, ke, function (v) { return String(v); }, 600);
      };
      parent.appendChild(UI.tombolIkon('legenda', STR.ikon.legenda, function () { UI.legenda(); }, { x: 1104, y: 16, id: 'legenda' }));
      parent.appendChild(UI.tombolIkon('jeda', STR.ikon.jeda, function () { UI.jeda(o.jeda || {}); }, { x: 1188, y: 16, id: 'jeda' }));
      return h;
    },

    /* panel modal bergaya kertas peta. Mengembalikan {el, body, panel, close} */
    overlay: function (judul, cls) {
      var ov = U.h('div', 'overlay'), panel = U.h('div', 'panel kertas ' + (cls || '')), opener = document.activeElement;
      panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'true'); panel.setAttribute('aria-label', judul);
      document.getElementById('scene-root').inert = true;
      document.querySelectorAll('.overlay').forEach(function (x) { x.inert = true; });
      document.querySelectorAll('.toast').forEach(function (x) { x.parentNode.removeChild(x); });
      panel.innerHTML = '<div class="pita-kepala">' + esc(judul) + '</div>';
      var body = U.h('div', 'isi-panel'); panel.appendChild(body); ov.appendChild(panel);
      stage().appendChild(ov);
      UI.sembunyiTangan(true);
      if (!UI.kurangi) panel.classList.add('panel-muncul');
      var api = {
        el: ov, body: body, panel: panel,
        close: function () {
          if (ov.parentNode) ov.parentNode.removeChild(ov);
          var rest = document.querySelectorAll('.overlay');
          if (rest.length) rest[rest.length - 1].inert = false; else document.getElementById('scene-root').inert = false;
          if (opener && opener.isConnected && !opener.disabled) opener.focus({ preventScroll: true });
          if (api.onClose) api.onClose();
        }
      };
      return api;
    },
    closeOverlays: function () {
      document.querySelectorAll('.overlay, .toast').forEach(function (x) { x.parentNode.removeChild(x); });
      UI._p.list = [];
      document.getElementById('scene-root').inert = false;
      UI.idle.fn = null;
      UI.sembunyiTangan(true);
    },
    tombolTutup: function (o, teks) {
      var b = Input.button(esc(teks || STR.tombol.tutup), 'kedua alir lebar', function () { o.close(); }, { id: 'tutup' });
      o.body.appendChild(b);
      setTimeout(function () { b.focus({ preventScroll: true }); }, 30);
      return b;
    },
    /* sakelar Nyala/Mati dengan label teks (bukan hanya warna) */
    barisSakelar: function (label, get, set, id, catatan, nonaktif) {
      var row = U.h('div', 'baris-sakelar');
      row.innerHTML = '<span class="label-sakelar">' + esc(label) + (catatan ? '<small>' + esc(catatan) + '</small>' : '') + '</span>';
      var b = Input.button('', 'sakelar alir', function () { set(!get()); cat(); }, { id: id, aria: label });
      function cat() {
        var on = get();
        b.classList.toggle('nyala', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
        Input.label(b, '<span class="kenop"></span><span class="teks-sakelar">' + (on ? STR.pengaturan.nyala : STR.pengaturan.mati) + '</span>');
      }
      if (nonaktif) b.disabled = true;
      cat(); row.appendChild(b);
      return row;
    },
    pengaturan: function (onClose) {
      var T = STR.pengaturan, s = Save.data.settings, o = UI.overlay(T.judul, 'panel-pengaturan');
      var grid = U.h('div', 'grid-sakelar');
      function simpan() { Save.save(); UI.applySettings(); }
      grid.appendChild(UI.barisSakelar(T.musik, function () { return s.musik; }, function (v) { s.musik = v; simpan(); }, 'sw-musik'));
      grid.appendChild(UI.barisSakelar(T.efek, function () { return s.efek; }, function (v) { s.efek = v; simpan(); }, 'sw-efek'));
      grid.appendChild(UI.barisSakelar(T.suara, function () { return s.suara; }, function (v) { s.suara = v; simpan(); if (!v) Voice.stop(); }, 'sw-suara', T.suaraCatatan));
      grid.appendChild(UI.barisSakelar(T.bacakan, function () { return s.bacakan; }, function (v) { s.bacakan = v; simpan(); }, 'sw-bacakan'));
      grid.appendChild(UI.barisSakelar(T.santai, function () { return s.santai; }, function (v) { s.santai = v; simpan(); }, 'sw-santai', T.santaiCatatan));
      grid.appendChild(UI.barisSakelar(T.kurangi, function () { return s.kurangi || UI.prefersReduced; }, function (v) { s.kurangi = v; simpan(); }, 'sw-kurangi', UI.prefersReduced ? T.kurangiCatatan : '', UI.prefersReduced));
      var row = U.h('div', 'baris-sakelar baris-lebar'), yakin = false;
      row.innerHTML = '<span class="label-sakelar">' + esc(T.muridBaru) + '<small>' + esc(T.muridBaruCatatan) + '</small></span>';
      var hapus = Input.button(esc(T.hapus), 'ketiga alir hapus', function () {
        if (!yakin) { yakin = true; Input.label(hapus, esc(T.yakin)); return; }
        Save.newStudent(); Scenes.go('judul');
      }, { id: 'murid-baru' });
      row.appendChild(hapus); grid.appendChild(row);
      o.body.appendChild(grid);
      UI.tombolTutup(o);
      o.onClose = onClose;
      return o;
    },
    /* menu jeda: permainan dan suara berhenti selama panel terbuka */
    jeda: function (opsi) {
      var T = STR.jeda, o = UI.overlay(T.judul, 'panel-jeda');
      Voice.jeda(); Tween.paused = true;
      function tombol(label, cls, id, fn) { var b = Input.button(esc(label), cls + ' alir lebar', fn, { id: id }); o.body.appendChild(b); return b; }
      var lanjut = tombol(T.lanjut, 'utama', 'jeda-lanjut', function () { o.close(); });
      tombol(T.ulangi, 'kedua', 'jeda-ulangi', function () { Voice.buangTertahan(); o.close(); if (opsi.ulangi) opsi.ulangi(); });
      tombol(T.kantor, 'ketiga', 'jeda-kantor', function () { Voice.buangTertahan(); o.close(); Scenes.go('kantorPeta'); });
      tombol(T.pengaturan, 'ketiga', 'jeda-pengaturan', function () { UI.pengaturan(); });
      tombol(T.beranda, 'ketiga', 'jeda-beranda', function () { Voice.buangTertahan(); o.close(); Scenes.go('judul'); });
      o.onClose = function () { Tween.paused = false; Voice.lanjutTertahan(); };
      setTimeout(function () { lanjut.focus({ preventScroll: true }); }, 30);
      return o;
    },
    /* Legenda bertab: mawar angin 8 arah dengan nama lengkap, dan simbol peta. Membuka legenda menjeda permainan. */
    legenda: function () {
      var L = STR.legenda, o = UI.overlay(L.judul, 'panel-legenda');
      Voice.jeda(); Tween.paused = true;
      var tabs = U.h('div', 'tab-buku'), isi = U.h('div', 'isi-legenda');
      isi.setAttribute('data-cek', 'isi legenda');
      function ikonSimbol(k) {
        var W = Seni.W, s;
        switch (k) {
          case 'ibukota': s = Seni.ibuKota(30, 18, 13); break;
          case 'prov': s = '<path d="M6 18H54" stroke="' + W.tinta + '" stroke-width="7" stroke-linecap="round"/><path d="M6 18H54" stroke="' + W.jingga + '" stroke-width="2" stroke-dasharray="1 9" stroke-linecap="round"/>'; break;
          case 'kab': s = '<path d="M6 18H54" stroke="' + W.tinta + '" stroke-width="2.6" stroke-dasharray="9 7" stroke-linecap="round"/>'; break;
          case 'sungai': s = '<path d="M6 22Q18 8 30 18T54 14" stroke="' + W.tinta + '" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M6 22Q18 8 30 18T54 14" stroke="' + W.laut + '" stroke-width="3.6" fill="none" stroke-linecap="round"/>'; break;
          case 'gunung': s = Seni.gunung(30, 20, 0.7); break;
          case 'danau': s = '<ellipse cx="30" cy="18" rx="22" ry="12" fill="' + W.laut + '" stroke="' + W.tinta + '" stroke-width="3"/>'; break;
          default: s = '<rect x="4" y="4" width="52" height="28" rx="6" fill="' + W.laut + '" stroke="' + W.tinta + '" stroke-width="3"/><path d="M12 18q5-5 10 0M32 22q5-5 10 0" stroke="#FFFFFF" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
        }
        return Seni.svg(60, 36, s);
      }
      var HAL = {
        arah: function () {
          var daftar = STR.arah.map(function (a, i) { return '<li><b>' + esc(STR.arahSingkat[i]) + '</b>' + esc(a) + '</li>'; }).join('');
          return '<div class="legenda-arah">' + Seni.svg(330, 330, Seni.mawarAngin(165, 165, 116, { label8: true })) +
            '<div class="legenda-kanan"><p class="sorot-info">' + esc(L.arahCatatan) + '</p><ul class="daftar-arah">' + daftar + '</ul>' +
            '<p>' + esc(L.arahUtama) + '</p><p>' + esc(L.arahAntara) + '</p></div></div>';
        },
        simbol: function () {
          return '<div class="legenda-simbol">' + L.simbol.map(function (r) { return '<div class="baris-simbol">' + ikonSimbol(r[0]) + '<span>' + esc(r[1]) + '</span></div>'; }).join('') +
            '</div><p class="kecil-info">' + esc(L.simbolCatatan) + '</p>';
        }
      };
      function pilih(k) {
        isi.innerHTML = HAL[k]();
        Array.prototype.forEach.call(tabs.children, function (b) { var on = b.dataset.id === 'tab-' + k; b.classList.toggle('aktif', on); b.setAttribute('aria-selected', on ? 'true' : 'false'); });
      }
      Object.keys(HAL).forEach(function (k) {
        var b = Input.button(esc(L.tab[k]), 'ketiga alir tab', function () { pilih(k); }, { id: 'tab-' + k, h: 64, font: 24 });
        b.setAttribute('role', 'tab');
        tabs.appendChild(b);
      });
      tabs.setAttribute('role', 'tablist');
      var tutup = Input.button(esc(STR.tombol.tutup), 'kedua alir tab tutup-tab', function () { o.close(); }, { id: 'tutup', h: 64, font: 24 });
      tabs.appendChild(tutup);
      o.body.appendChild(tabs); o.body.appendChild(isi);
      pilih('arah');
      setTimeout(function () { tutup.focus({ preventScroll: true }); }, 30);
      o.onClose = function () { Voice.stop(); Tween.paused = false; Voice.lanjutTertahan(); };
      return o;
    },
    /* Informasi (Tujuan, Cara Main, Misi), Referensi (Sumber Materi, Data Peta, KA), Pengembang. Tanpa tautan keluar. */
    info: function (jenis) {
      var D = STR.info[jenis], o = UI.overlay(D.judul, 'panel-info panel-' + jenis), HAL = null;
      function daftar(a, tag) { return '<' + (tag || 'ul') + ' class="daftar-info">' + a.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</' + (tag || 'ul') + '>'; }
      function baris(a) { return '<div class="baris-info">' + a.map(function (r) { return '<div><b>' + esc(r[0]) + '</b><span>' + esc(r[1]) + '</span></div>'; }).join('') + '</div>'; }
      function pustaka(r) { return '<p class="pustaka">' + esc(r[0]) + ' <i>' + esc(r[1]) + '</i> ' + esc(r[2]) + '</p>'; }
      if (jenis === 'info') HAL = {
        tujuan: function () { return '<p class="sorot-info">' + esc(D.pengantar) + '</p><p><b>' + esc(D.tujuanJudul) + '</b></p><p class="tujuan-satu">' + esc(D.tujuan) + '</p><p class="kecil-info">' + esc(D.meta) + '</p>'; },
        cara: function () { return daftar(D.cara, 'ol') + '<p class="kecil-info">' + esc(D.caraCatatan) + '</p>'; },
        misi: function () { return '<p><b>' + esc(D.misiJudul) + '</b></p>' + baris(D.misi) + '<p class="sorot-info">' + esc(D.misiCatatan) + '</p>'; }
      };
      if (jenis === 'referensi') HAL = {
        sumber: function () { return '<p><b>' + esc(D.sumberPengantar) + '</b></p>' + D.sumber.map(pustaka).join('') + '<p>' + esc(D.topik) + '</p><p class="kecil-info">' + esc(D.huruf) + '</p>'; },
        data: function () { return '<p>' + esc(D.dataPengantar) + '</p>' + baris(D.data); },
        ka: function () { return '<p>' + esc(D.kaPengantar) + '</p>' + baris(D.ka) + '<p><b>' + esc(D.kaRujukanJudul) + '</b></p>' + pustaka(D.kaRujukan); }
      };
      if (!HAL) {
        /* satu halaman per pengembang (foto, nama, sekolah, prestasi), berpindah dengan tombol panah kiri dan kanan */
        var ke = 0, n = D.orang.length;
        var bingkai = U.h('div', 'bingkai-pengembang'), kartu = U.h('div', 'kartu-pengembang'), titik = U.h('div', 'titik-pengembang');
        kartu.setAttribute('data-cek', 'info pengembang'); kartu.setAttribute('aria-live', 'polite');
        var tampil = function (k) {
          ke = k;
          var p = D.orang[k], foto = Seni.gambar(p.foto);
          kartu.innerHTML = '<div class="foto-pengembang">' + (foto ? '<img src="' + foto + '" alt="' + esc(p.fotoAlt) + '">' : Seni.potret(190, 'senang')) + '</div>' +
            '<div class="data-pengembang"><b class="nama-pengembang">' + esc(p.nama) + '</b>' + p.baris.map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('') + '</div>' +
            (p.daftar ? '<div class="prestasi"><b>' + esc(p.daftarJudul) + '</b>' + daftar(p.daftar) + '</div>' : '');
          kiri.disabled = k === 0; kanan.disabled = k === n - 1;
          titik.innerHTML = D.orang.map(function (x, j) { return '<span class="' + (j === k ? 'aktif' : '') + '"></span>'; }).join('');
          titik.setAttribute('aria-label', U.fmt(D.halaman, { i: k + 1, n: n }));
        };
        var kiri = Input.button('<span class="balik-x">' + UI.ikon('panah', 52) + '</span>', 'ketiga alir panah-pengembang', function () { if (ke > 0) tampil(ke - 1); }, { w: 96, h: 120, id: 'pengembang-sebelum', aria: D.sebelum });
        var kanan = Input.button(UI.ikon('panah', 52), 'ketiga alir panah-pengembang', function () { if (ke < n - 1) tampil(ke + 1); }, { w: 96, h: 120, id: 'pengembang-berikut', aria: D.berikut });
        bingkai.appendChild(kiri); bingkai.appendChild(kartu); bingkai.appendChild(kanan);
        o.body.appendChild(bingkai); o.body.appendChild(titik);
        tampil(0);
        UI.tombolTutup(o);
        return o;
      }
      var tabs = U.h('div', 'tab-buku'), isi = U.h('div', 'teks-info isi-tab');
      isi.setAttribute('data-cek', 'info ' + jenis);
      var pilih = function (k) {
        isi.innerHTML = HAL[k]();
        Array.prototype.forEach.call(tabs.children, function (b) { var on = b.dataset.id === 'tab-' + k; b.classList.toggle('aktif', on); b.setAttribute('aria-selected', on ? 'true' : 'false'); });
      };
      Object.keys(HAL).forEach(function (k) {
        var b = Input.button(esc(D.tab[k]), 'ketiga alir tab', function () { pilih(k); }, { id: 'tab-' + k, h: 64, font: 24 });
        b.setAttribute('role', 'tab');
        tabs.appendChild(b);
      });
      tabs.setAttribute('role', 'tablist');
      var tutup = Input.button(esc(STR.tombol.tutup), 'kedua alir tab tutup-tab', function () { o.close(); }, { id: 'tutup', h: 64, font: 24 });
      tabs.appendChild(tutup);
      o.body.appendChild(tabs); o.body.appendChild(isi);
      pilih(Object.keys(HAL)[0]);
      setTimeout(function () { tutup.focus({ preventScroll: true }); }, 30);
      return o;
    },
    /* Ringkasan untuk Guru: tanpa nama dan tanpa data pribadi */
    guru: function () {
      var G = STR.guru, o = UI.overlay(G.judul, 'panel-guru'), baris = '';
      TAG.forEach(function (t) {
        var k = Save.data.keterampilan[t], st = Save.status(t);
        baris += '<tr><td>' + esc(G.nama[t]) + '</td><td class="status-' + st + '">' + esc(G.status[st]) + '</td><td>' + (k ? k.benarAwal + ' / ' + k.kesempatan : '-') + '</td></tr>';
      });
      var p3 = 0, M = Save.data.miskonsepsi;
      function misHtml() {
        var k = Object.keys(M).sort(function (a, b) { return M[b] - M[a]; }).slice(0, 4);
        return k.length ? '<p>' + esc(U.fmt(G.misJudul, { daftar: k.map(function (x) { return (G.mis[x] || x) + ' (' + M[x] + ')'; }).join(', ') })) + '</p>' : '';
      }
      Object.keys(Save.data.level).forEach(function (n) { p3 += Save.data.level[n].petunjuk3 || 0; });
      o.body.insertAdjacentHTML('beforeend', '<div class="teks-guru" data-cek="guru">' +
        '<table><thead><tr><th>' + esc(G.kolomTag) + '</th><th>' + esc(G.kolomStatus) + '</th><th>' + esc(G.kolomBukti) + '</th></tr></thead><tbody>' + baris + '</tbody></table>' +
        misHtml() + '<p>' + esc(U.fmt(G.level, { daftar: [1, 2, 3, 4, 5, 6].filter(function (n) { return Save.selesai(n); }).map(function (n) { return 'L' + n + ' (' + U.fmt(G.bintang, { n: Save.data.level[n].bintang }) + ')'; }).join(', ') || G.levelBelum })) + '</p>' +
        '<p>' + esc(U.fmt(G.petunjuk3, { n: p3 })) + ' &middot; ' + esc(U.fmt(G.santai, { s: Save.data.settings.santai ? STR.pengaturan.nyala : STR.pengaturan.mati })) +
        ' &middot; ' + esc(U.fmt(G.lama, { m: Math.round(Save.data.detik / 60) })) + '</p>' +
        '<p class="kelas-guru" data-cek="kelas guru"></p>' +
        '<p class="kecil">' + esc(G.dikuasaiAturan) + ' ' + esc(G.catatan) + '</p><p class="kecil">' + esc(G.cp) + '</p></div>');
      /* wilayah bawaan kelas (dipasang guru di L4); nama dibaca dari data peta yang dimuat malas */
      var elKelas = o.body.querySelector('.kelas-guru'), k = Save.data.kelas;
      elKelas.textContent = U.fmt(G.kelas, { w: G.kelasBelum });
      if (k && k.kab && root.Peta) Peta.muat(function (ok) { if (ok && elKelas.isConnected && Peta.kab(k.kab)) elKelas.textContent = U.fmt(G.kelas, { w: Peta.kab(k.kab).label + ', ' + Nama.prov(Peta.prov(k.prov)) }); });
      UI.tombolTutup(o);
      return o;
    },
    /* teks yang meluap dari kotaknya: elemen bertanda data-cek, badan tombol, dan teks SVG bertanda data-maxw (dipakai uji) */
    cekLuap: function () {
      var hasil = [];
      Array.prototype.forEach.call(document.querySelectorAll('#stage [data-cek], #stage .tombol .badan'), function (el) {
        if (!el.offsetParent) return;
        if (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 8) hasil.push((el.getAttribute('data-cek') || el.textContent.trim().slice(0, 30)) + ': ' + el.scrollWidth + 'x' + el.scrollHeight + ' > ' + el.clientWidth + 'x' + el.clientHeight);
        var wadah = el.parentElement && el.parentElement.closest('.papan-hud, .panel, .panel-hasil, .papan-pilih, .label-tempat');
        if (wadah && wadah !== el) {
          var a = el.getBoundingClientRect(), b = wadah.getBoundingClientRect(), s = Stage.scale || 1;
          if (a.bottom > b.bottom + 2 * s || a.right > b.right + 2 * s) hasil.push((el.getAttribute('data-cek') || 'teks') + ': melewati wadah (bawah ' + Math.round((a.bottom - b.bottom) / s) + ' px, kanan ' + Math.round((a.right - b.right) / s) + ' px)');
        }
      });
      Array.prototype.forEach.call(document.querySelectorAll('#stage text[data-maxw]'), function (t) {
        var w = t.getComputedTextLength(), m = +t.getAttribute('data-maxw');
        if (w > m) hasil.push('svg "' + t.textContent + '": ' + Math.round(w) + ' > ' + m);
      });
      return hasil;
    },
    toast: function (text, kelas) {
      document.querySelectorAll('.toast').forEach(function (x) { x.parentNode.removeChild(x); });
      var t = U.h('div', 'toast' + (kelas ? ' ' + kelas : ''), esc(text));
      t.setAttribute('role', 'status');
      stage().appendChild(t);
      setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 2600);
    },

    /* tangan penunjuk: ujung telunjuk di titik sasaran; badan tangan ke kanan bawah, atau dibalik bila dekat tepi.
       sumber 'idle' hilang saat murid bergerak. */
    tangan: null, sumberTangan: '',
    tunjuk: function (sasaran, o) {
      o = o || {};
      var p = titik(sasaran, o.fy);
      if (!p) return;
      var kiri = p.x > 1100, atas = p.y > 560, rot = atas ? (kiri ? 160 : -160) : (kiri ? 20 : -20);
      if (!UI.tangan) { UI.tangan = U.h('div', 'tangan-penunjuk'); UI.tangan.setAttribute('aria-hidden', 'true'); }
      UI.tangan.innerHTML = Seni.svg(160, 160, '<g class="tusuk" style="--tx:' + (kiri ? 7 : -7) + 'px;--ty:' + (atas ? 9 : -9) + 'px">' + Seni.tangan(80, 80, 0.78, rot) + '</g>');
      stage().appendChild(UI.tangan);
      UI.tangan.style.left = Math.round(p.x - 80) + 'px';
      UI.tangan.style.top = Math.round(p.y - 80) + 'px';
      UI.tangan.classList.add('tampil');
      UI.sumberTangan = o.sumber || 'petunjuk';
    },
    sembunyiTangan: function (semua) {
      if (!UI.tangan) return;
      if (semua || UI.sumberTangan === 'idle') { UI.tangan.classList.remove('tampil'); UI.sumberTangan = ''; }
    },
    /* isyarat bila 8 detik tanpa aksi (CLAUDE.md bagian 4). fn mengembalikan elemen yang ditunjuk atau null. */
    idle: {
      fn: null, t: 0,
      atur: function (fn) { UI.idle.fn = fn; UI.idle.reset(); },
      reset: function () { UI.idle.t = performance.now(); UI.sembunyiTangan(false); },
      cek: function () {
        var I = UI.idle;
        if (!I.fn || Loop.paused || Tween.paused || Scenes.busy || document.querySelector('.overlay')) return;
        if (Voice.sibuk()) { I.t = performance.now(); return; }
        if (UI.sumberTangan === 'petunjuk') return;
        if (performance.now() - I.t > 8000 && UI.sumberTangan !== 'idle') { var el = I.fn(); if (el) UI.tunjuk(el, { sumber: 'idle' }); }
      }
    },

    /* partikel kecil saat benar: satu kanvas untuk semua (GDD bagian 15) */
    _p: { kanvas: null, ctx: null, list: [], jalan: false },
    ledak: function (x, y, n) {
      if (UI.kurangi) return;
      var P = UI._p, W = Seni.W, warna = [W.jingga, W.hijau, W.laut, W.kertas];
      if (!P.kanvas) {
        P.kanvas = U.h('canvas', 'kanvas-partikel'); P.kanvas.width = 1280; P.kanvas.height = 720;
        P.ctx = P.kanvas.getContext('2d');
      }
      if (!P.kanvas.parentNode) stage().appendChild(P.kanvas);
      for (var i = 0; i < (n || 14); i++) {
        var a = Math.random() * Math.PI * 2, v = 160 + Math.random() * 260;
        P.list.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 180, umur: 0, maks: 0.7 + Math.random() * 0.4, r: 5 + Math.random() * 6, w: warna[i % warna.length], b: i % 3 === 0 });
      }
      if (P.jalan) return;
      P.jalan = true;
      var akhir = performance.now();
      (function tick(ts) {
        var dt = Math.min(0.05, (ts - akhir) / 1000); akhir = ts;
        var c = P.ctx;
        c.clearRect(0, 0, 1280, 720);
        if (!Loop.paused) P.list.forEach(function (q) { q.umur += dt; q.x += q.vx * dt; q.y += q.vy * dt; q.vy += 520 * dt; });
        P.list = P.list.filter(function (q) { return q.umur < q.maks; });
        P.list.forEach(function (q) {
          var k = 1 - q.umur / q.maks;
          c.globalAlpha = Math.min(1, k * 1.5);
          c.fillStyle = q.w; c.strokeStyle = W.tinta; c.lineWidth = 2.5;
          c.beginPath();
          if (q.b) { for (var j = 0; j < 10; j++) { var rr = j % 2 ? q.r * 0.45 : q.r * 1.2, aa = j * Math.PI / 5 - Math.PI / 2; c.lineTo(q.x + rr * Math.cos(aa), q.y + rr * Math.sin(aa)); } c.closePath(); }
          else c.arc(q.x, q.y, q.r * 0.7, 0, Math.PI * 2);
          c.fill(); c.stroke();
        });
        c.globalAlpha = 1;
        if (P.list.length) requestAnimationFrame(tick); else { P.jalan = false; c.clearRect(0, 0, 1280, 720); }
      })(akhir);
    },
    /* angka menghitung naik dengan bunyi detak */
    hitungNaik: function (el, dari, ke, fmt, ms) {
      var lalu = dari;
      el.textContent = fmt(dari);
      return Tween.run(ms || 700, function (e) {
        var v = Math.round(dari + (ke - dari) * e);
        if (v !== lalu) { lalu = v; el.textContent = fmt(v); Aud.sfx('tick', 1 + e * 0.5); }
      }, Ease.easeOutCubic).then(function () { el.textContent = fmt(ke); });
    },
    /* goyang lembut untuk jawaban salah */
    goyang: function (el) {
      if (UI.kurangi) return Promise.resolve();
      return Tween.run(380, function (e, k) { el.style.translate = (Math.sin(k * Math.PI * 5) * 9 * (1 - k)).toFixed(1) + 'px 0'; }, Ease.linear).then(function () { el.style.translate = ''; });
    },
    /* lompatan kecil untuk jawaban benar */
    lompat: function (el) {
      if (UI.kurangi) return Promise.resolve();
      return Tween.run(420, function (e, k) { el.style.translate = '0 ' + (-Math.sin(k * Math.PI) * 18).toFixed(1) + 'px'; el.style.scale = (1 + Math.sin(k * Math.PI) * 0.08).toFixed(3); }, Ease.linear)
        .then(function () { el.style.translate = ''; el.style.scale = ''; });
    },
    /* muncul memantul (easeOutBack) */
    /* animasi CSS masuk (easeOutBack, 320 ms) dan pudar-masuk (300 ms) untuk pergantian langkah di dalam level;
       mati sendiri saat Kurangi animasi (body.kurangi-gerak) */
    masuk: function (el, urutan) {
      if (!el || UI.kurangi) return;
      el.classList.remove('masuk'); void el.offsetWidth;
      el.style.animationDelay = ((urutan || 0) * 40) + 'ms';
      el.classList.add('masuk');
    },
    pudarMasuk: function (el) {
      if (!el || UI.kurangi) return;
      el.classList.remove('pudar-masuk'); void el.offsetWidth; el.classList.add('pudar-masuk');
    },
    muncul: function (el, tunda) {
      if (UI.kurangi) { el.style.opacity = 1; return Promise.resolve(); }
      el.style.opacity = 0;
      return Tween.wait(tunda || 0).then(function () {
        return Tween.run(320, function (e) { el.style.opacity = Math.min(1, e * 2); el.style.scale = (0.4 + 0.6 * e).toFixed(3); }, Ease.easeOutBack);
      }).then(function () { el.style.scale = ''; el.style.opacity = 1; });
    }
  };
  document.addEventListener('pointerdown', function () { UI.idle.reset(); }, true);
  document.addEventListener('keydown', function () { UI.idle.reset(); }, true);
  setInterval(function () { UI.idle.cek(); }, 500);
  root.UI = UI;
})(window);
