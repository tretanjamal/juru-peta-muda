/* Hasil Belajarku (GDD bagian 8): Lang bangga dan juru peta cilik di Kantor Peta, bintang muncul satu per satu dengan nada bertingkat,
   keping kompas, "Yang sudah aku kuasai" dalam bahasa anak, "Ayo latih lagi" dari miskonsepsi yang paling sering, tombol Lanjut.
   Ringkasan untuk Guru dibuka dari tombol di dalamnya. */
(function () {
  var TAG_LEVEL = { 6: ['provinsiku', 'mata-angin'], 1: ['mata-angin'], 2: ['baca-peta', 'mata-angin'], 3: ['nalar-letak', 'mata-angin'], 4: ['jenjang-wilayah', 'provinsiku'], 5: ['kabkotaku', 'nalar-letak', 'mata-angin'] };
  var hidup = false;
  Scenes.add('hasil', {
    enter: function (root, p) {
      hidup = true; Aud.pramuatJingle('hasil');
      var level = p.level || 1, data = Save.data.level[level] || { bintang: 0 }, bintang = p.bintang != null ? p.bintang : data.bintang, W = Seni.W;
      var dekor = 0;
      while (dekor < 5 && Save.selesai(dekor + 1)) dekor++;
      Aud.musik('judul');
      /* latar Kantor Peta yang sama dengan layar Pilih Level (gambar AI bila ada, SVG bila tidak), sedikit dipudarkan */
      if (window.LatarKantor) window.LatarKantor(root, Math.min(dekor, Save.data.dekor));
      else root.appendChild(U.h('div', 'lapis', Seni.svg(1280, 720, Seni.kantorPeta({ dekor: Math.min(dekor, Save.data.dekor) }))));
      root.appendChild(U.h('div', 'lapis', Seni.svg(1280, 720, '<rect width="1280" height="720" fill="' + W.pasirTerang + '" opacity=".35"/>')));
      var lapis = Bersama.lapisHidup(root);
      lapis.innerHTML = Seni.juruPeta(150, 724, 0.92, { gerak: true });
      var lang = Bersama.lang(lapis, 380, 560, 0.86, { eks: 'bangga' });
      var panel = U.h('div', 'panel-hasil');
      var tags = (TAG_LEVEL[level] || []).filter(function (t) { return Save.status(t) !== 'belum'; });
      var tip = p.tip && STR.hasil.tip[p.tip] ? STR.hasil.tip[p.tip] : ((TAG_LEVEL[level] || []).some(function (t) { return Save.status(t) === 'latihan'; }) ? STR.hasil.latihUmum : '');
      var bintangHtml = '';
      for (var i = 0; i < 3; i++) bintangHtml += '<span class="b' + i + '">' + UI.ikon('bintang', 84, false) + '</span>';
      panel.innerHTML = '<h1 class="judul-hasil">' + UI.esc(STR.hasil.judul) + '</h1>' +
        '<p class="sub-hasil" data-cek="sub hasil">' + UI.esc(U.fmt(STR.level.judul, { n: level, nama: STR.level.nama[level] })) + ' <span class="pisah">|</span> ' + UI.ikon('koin', 30) + ' ' + UI.esc(U.fmt(STR.hasil.keping, { n: Save.data.keping })) + '</p>' +
        '<div class="bintang-hasil" role="img" aria-label="' + bintang + ' / 3">' + bintangHtml + '</div>' +
        '<div class="kuasai" data-cek="kuasai"><h2>' + UI.esc(STR.hasil.kuasai) + '</h2><ul>' +
        (tags.length ? tags.map(function (t) { var s = Save.status(t); return '<li><span>' + UI.esc(STR.tag[t]) + '</span><span class="chip-status status-' + s + '">' + UI.esc(STR.hasil.status[s]) + '</span></li>'; }).join('') : '<li>' + UI.esc(STR.hasil.kosong) + '</li>') + '</ul></div>' +
        (tip ? '<div class="kuasai latih" data-cek="latih"><h2>' + UI.esc(STR.hasil.latih) + '</h2><p>' + UI.esc(tip) + '</p></div>' : '');
      var baris = U.h('div', 'baris-tombol');
      baris.setAttribute('data-cek', 'tombol hasil');
      var lanjut = Input.button(UI.esc(STR.hasil.lanjut), 'utama alir', function () { Scenes.go('kantorPeta'); }, { w: 180, h: 80, font: 30, id: 'hasil-lanjut' });
      baris.appendChild(lanjut);
      baris.appendChild(Input.button(UI.esc(STR.hasil.ulangi), 'ketiga alir', function () { Scenes.go('level' + level); }, { w: 170, h: 80, font: 26, id: 'hasil-ulangi' }));
      baris.appendChild(Input.button(UI.ikon('guru', 34) + UI.esc(STR.tombol.guru), 'kedua alir', function () { UI.guru(); }, { w: 300, h: 80, font: 20, id: 'hasil-guru' }));
      panel.appendChild(baris);
      root.appendChild(panel);
      /* nama level panjang (L4): baris judul kecil dipaskan 24 -> 20 px supaya tetap satu baris */
      var subH = panel.querySelector(".sub-hasil"); for (var uk = 24; uk >= 20 && subH.scrollWidth > subH.clientWidth + 1; uk--) subH.style.fontSize = uk + "px";
      /* bintang muncul satu per satu dengan nada bertingkat */
      var rantai = Tween.wait(600);
      for (var j = 0; j < bintang; j++) (function (k) {
        rantai = rantai.then(function () {
          if (!hidup) return;
          var el = panel.querySelector('.b' + k);
          el.innerHTML = UI.ikon('bintang', 84, true);
          Aud.sfx('star', k);
          var q = UI.titik(el, 0.5); if (q) UI.ledak(q.x, q.y, 10);
          return UI.kurangi ? Tween.wait(200) : Tween.run(380, function (e) { el.style.scale = (0.3 + 0.7 * e).toFixed(3); }, Ease.easeOutBack);
        });
      })(j);
      rantai.then(function () { if (hidup) { Aud.jingle('hasil', 'fanfare', bintang); lang.eks('sorak'); } });
      UI.idle.atur(function () { return lanjut; });
      setTimeout(function () { if (lanjut.isConnected) lanjut.focus({ preventScroll: true }); }, 60);
    },
    exit: function () { hidup = false; },
    uji: {
      keadaan: function () { return { langkah: 'hasil', siap: true }; },
      benar: function () { return ['hasil-lanjut']; },
      salah: function () { return []; }
    }
  });
})();
