/* Kantor Peta (Pilih Level, GDD bagian 8): dinding dengan jendela laut, rak gulungan peta, meja peta, dan 5 papan peta level.
   Perlengkapan bertambah setiap level selesai (diberi tahu sekali). Level terkunci bergembok; level yang belum dibuat diberi tahu dengan sopan. */
(function () {
  var LEVEL_ADA = [1, 2, 3, 4, 5, 6];
  var TITIK_DEKOR = { 1: [430, 430], 2: [300, 312], 3: [200, 452], 4: [90, 390], 5: [455, 120] };
  /* letak perlengkapan di atas latar gambar AI (kiri, atas, lebar, tinggi di panggung): meja, rak, dan dinding kanan jendela */
  var LETAK_GAMBAR = { 1: [79, 560, 82, 104], 2: [458, 312, 83, 124], 3: [255, 596, 150, 90], 4: [323, 326, 110, 110], 5: [520, 20, 160, 120] };
  var TITIK_GAMBAR = { 1: [120, 612], 2: [500, 372], 3: [330, 640], 4: [378, 380], 5: [600, 80] };
  /* latar Kantor Peta: gambar AI bila terdaftar di js/data/aset.js, SVG kode bila tidak ada atau gagal dimuat */
  function latar(root, dekor) {
    var src = Seni.gambar('kantorPeta'), lapis = U.h('div', 'lapis');
    function svg() { lapis.innerHTML = Seni.svg(1280, 720, Seni.kantorPeta({ dekor: dekor })); lapis.dataset.latar = 'svg'; }
    if (!src) { svg(); root.appendChild(lapis); return TITIK_DEKOR; }
    lapis.dataset.latar = 'gambar';
    function img(s, x, y, w, h, kelas) {
      var e = new Image(); e.src = s; e.alt = ''; e.draggable = false; e.className = 'lapis-gambar ' + (kelas || '');
      e.style.cssText = 'left:' + x + 'px;top:' + y + 'px;width:' + w + 'px;height:' + h + 'px';
      return e;
    }
    var bg = img(src, 0, 0, 1280, 720);
    bg.onerror = svg;
    lapis.appendChild(bg);
    for (var i = 1; i <= dekor; i++) {
      var s = Seni.gambar('dekor' + i), L = LETAK_GAMBAR[i];
      if (!s) continue;
      if (i === 5) bingkai(lapis, L);
      lapis.appendChild(img(s, L[0], L[1], L[2], L[3], 'dekor-gambar'));
    }
    root.appendChild(lapis);
    return TITIK_GAMBAR;
  }
  /* peta Indonesia berbingkai emas: laut dan provinsi digambar kode di lubang bingkai */
  function bingkai(lapis, L) {
    var lb = window.ASET.lubangBingkai || [0.09, 0.2, 0.82, 0.69], x = L[0] + lb[0] * L[2], y = L[1] + lb[1] * L[3], w = lb[2] * L[2], h = lb[3] * L[3];
    var el = U.h('div', 'lapis-gambar peta-bingkai');
    el.style.cssText = 'left:' + x.toFixed(1) + 'px;top:' + y.toFixed(1) + 'px;width:' + w.toFixed(1) + 'px;height:' + h.toFixed(1) + 'px';
    el.innerHTML = Seni.svg(w, h, '<rect width="' + w + '" height="' + h + '" fill="' + Seni.W.laut + '"/>');
    lapis.appendChild(el);
    if (window.Peta) Peta.muat(function (ok) {
      if (!ok || !el.isConnected) return;
      var T = Peta.pas(Peta.kotakSemua(), { x: 0, y: 0, w: w, h: h }, 4), d = '';
      Peta.data().provinsi.forEach(function (p) { d += Peta.dProv(p.kode, T, 1.5); });
      el.innerHTML = Seni.svg(w, h, '<rect width="' + w + '" height="' + h + '" fill="' + Seni.W.laut + '"/><path d="' + d + '" fill="' + Seni.W.hijau + '" stroke="' + Seni.W.tinta + '" stroke-width=".8" stroke-linejoin="round"/>');
    });
  }
  /* dipakai juga oleh layar Hasil Belajarku supaya latarnya sama */
  window.LatarKantor = latar;
  Scenes.add('kantorPeta', {
    LEVEL_ADA: LEVEL_ADA,
    enter: function (root) {
      Aud.musik('judul');
      var dekor = 0;
      while (dekor < 5 && Save.selesai(dekor + 1)) dekor++;
      var titikDekor = latar(root, dekor);
      if (dekor > Save.data.dekor) {
        Save.data.dekor = dekor; Save.save();
        setTimeout(function () {
          if (Scenes.name !== 'kantorPeta' || document.querySelector('.overlay')) return;
          UI.toast(STR.pilih.dekor[dekor], 'toast-dinding');
          Aud.sfx('good');
          var t = titikDekor[dekor]; if (t) UI.ledak(t[0], t[1], 14);
        }, 500);
      }
      root.appendChild(U.h('h1', 'judul-pilih', UI.esc(STR.pilih.judul)));
      var pertama = null;
      for (var n = 1; n <= 6; n++) (function (n) {
        var buka = Save.terbuka(n), l = Save.data.level[n], b = U.h('button', 'papan-pilih' + (buka ? '' : ' terkunci') + (l && l.selesai ? ' selesai' : ''));
        b.type = 'button'; b.dataset.id = 'level-' + n;
        b.style.left = '580px'; b.style.top = (150 + (n - 1) * 78) + 'px';
        var bintang = '';
        if (buka) for (var i = 0; i < 3; i++) bintang += UI.ikon('bintang', 34, !!(l && l.bintang > i));
        b.innerHTML = '<span class="nomor">' + n + '</span><span class="nama-level" data-cek="nama level ' + n + '">' + UI.esc(STR.level.nama[n]) + '</span>' +
          '<span class="bintang-level">' + (buka ? bintang : UI.ikon('gembok', 44)) + '</span>';
        b.setAttribute('aria-label', U.fmt(STR.level.judul, { n: n, nama: STR.level.nama[n] }) + (buka ? '' : ', ' + STR.ikon.gembok));
        b.addEventListener('pointerdown', function () { Aud.init(); Aud.sfx('click'); });
        b.addEventListener('click', function () {
          if (!buka) { Aud.sfx('gembok'); UI.goyang(b); UI.toast(U.fmt(STR.pilih.terkunci, { n: n - 1 }), 'toast-dinding'); return; }
          if (LEVEL_ADA.indexOf(n) < 0) { UI.toast(STR.pilih.belumAda, 'toast-dinding'); return; }
          /* latihan pembuka (hook) diputar sekali sebelum Level 1 yang pertama */
          Scenes.go(n === 1 && !Save.data.hook ? 'hook' : 'level' + n);
        });
        root.appendChild(b);
        if (n === 1 || (buka && !(l && l.selesai) && LEVEL_ADA.indexOf(n) >= 0)) pertama = b;
      })(n);
      /* baris bawah: Beranda, Legenda, Hasil Belajarku, Pengaturan */
      root.appendChild(UI.tombolIkon('beranda', STR.tombol.beranda, function () { Scenes.go('judul'); }, { x: 580, y: 636, id: 'beranda' }));
      root.appendChild(Input.button(UI.ikon('legenda', 34) + UI.esc(STR.tombol.legenda), 'ketiga', function () { UI.legenda(); }, { x: 660, y: 636, w: 190, h: 64, font: 24, id: 'pilih-legenda' }));
      var terakhir = [6, 5, 4, 3, 2, 1].filter(function (n) { return Save.selesai(n); })[0] || 0;
      var hasil = Input.button(UI.ikon('bintang', 34, true) + UI.esc(STR.tombol.hasil), 'ketiga', function () { Scenes.go('hasil', { level: terakhir }); }, { x: 866, y: 636, w: 270, h: 64, font: 22, id: 'pilih-hasil' });
      hasil.disabled = !terakhir;
      root.appendChild(hasil);
      root.appendChild(UI.tombolIkon('gerigi', STR.ikon.pengaturan, function () { UI.pengaturan(function () { Scenes.go('kantorPeta'); }); }, { x: 1156, y: 636, id: 'pilih-pengaturan' }));
      var santai = UI.barisSakelar(STR.pilih.santai, function () { return Save.data.settings.santai; }, function (v) { Save.data.settings.santai = v; Save.save(); }, 'pilih-santai');
      santai.classList.add('chip-santai');
      root.appendChild(santai);
      UI.idle.atur(function () { return pertama; });
      setTimeout(function () { if (pertama && pertama.isConnected) pertama.focus({ preventScroll: true }); }, 60);
    },
    uji: {
      keadaan: function () { return { langkah: 'pilih', siap: true }; },
      benar: function () { var n = LEVEL_ADA.filter(function (x) { return !Save.selesai(x); })[0]; return n ? ['level-' + n] : []; },
      salah: function () { return []; }
    }
  });
})();
