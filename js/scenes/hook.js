/* Hook 10 detik (GDD bagian 3): desa dari samping, Lang terbang, kamera naik sampai desa terlihat dari atas seperti peta.
   "Rumahku ada di utara. Ketuk!" Murid mengetuk pohon sarang di utara, Lang menukik sambil berkicau, keping bertambah, lalu Level 1.
   Hanya diputar pada permainan pertama. */
(function () {
  var H = null;
  Scenes.add('hook', {
    enter: function (root) {
      var W = Seni.W, D = PULAU_LATIHAN.desa, siap = false, selesai = false;
      H = { hidup: true };
      Aud.musik('judul');
      /* lapis 1: desa dari samping */
      var samping = U.h('div', 'lapis hook-samping', Seni.svg(1280, 720, Seni.desaSamping()));
      root.appendChild(samping);
      /* lapis 2: desa dari atas di dalam wadah berperspektif (dimiringkan lalu ditegakkan) */
      var langit = U.h('div', 'lapis hook-langit', Seni.svg(1280, 720, '<rect width="1280" height="720" fill="' + W.laut + '"/><rect width="1280" height="720" fill="url(#pola-laut)"/>'));
      langit.style.opacity = 0;
      root.appendChild(langit);
      var ruang = U.h('div', 'hook-ruang');
      root.appendChild(ruang);
      var peta = Bersama.petaDesa(ruang, 0, 0, { kelas: 'hook-peta', onTempat: ketuk });
      peta.el.style.left = '120px'; peta.el.style.top = '130px';
      peta.aktif(false);
      ruang.style.opacity = 0;
      var awan = Bersama.lapisHidup(root, 'hook-awan');
      awan.innerHTML = Seni.awan(260, 110, 0.8, 'awan-a') + Seni.awan(860, 640, 0.7, 'awan-b');
      awan.style.opacity = 0;
      /* mawar angin */
      var mawar = U.h('div', 'lapis hook-mawar', Seni.svg(1280, 720, '<g class="denyut">' + Seni.mawarAngin(1110, 380, 96, { label8: true, sorot: 0 }) + '</g>'));
      mawar.style.opacity = 0; mawar.style.pointerEvents = 'none';
      root.appendChild(mawar);
      var lapis = Bersama.lapisHidup(root);
      var lang = Bersama.lang(lapis, 630, 166, 0.36, { eks: 'senang' });
      var teks = U.h('p', 'hook-teks', '');
      teks.setAttribute('aria-live', 'polite'); teks.setAttribute('data-cek', 'teks hook');
      root.appendChild(teks);
      function tulis(t) { teks.textContent = t; teks.style.visibility = t ? 'visible' : 'hidden'; }
      function bicara(t) { tulis(t); return Bersama.ucap(t, { lang: lang }); }
      tulis('');
      var pohon = peta.tombol.pohon;
      var pohonPanggung = function () { var t = D.tempat[1].titik; return { x: 120 + t[0], y: 130 + t[1] }; };

      /* urutan: terbang, kamera naik, mawar angin, ajakan */
      Tween.wait(500).then(function () {
        if (!H.hidup) return;
        Aud.sfx('angin');
        lang.pose('terbang', 'senang');
        lang.terbangKe(640, 110, 0.5, 900, 30);
        bicara(STR.hook.naik);
        return Tween.wait(700);
      }).then(function () {
        if (!H.hidup) return;
        ruang.style.opacity = 1;
        var miring = function (e) {
          peta.el.style.transform = 'perspective(900px) rotateX(' + (64 * (1 - e)).toFixed(1) + 'deg) scale(' + (0.86 + 0.14 * e).toFixed(3) + ')';
          samping.style.opacity = (1 - e).toFixed(3); langit.style.opacity = e.toFixed(3); awan.style.opacity = e.toFixed(3);
        };
        if (UI.kurangi) { miring(1); return; }
        miring(0);
        return Tween.run(1500, function (e) { miring(e); }, Ease.easeInOutCubic);
      }).then(function () {
        if (!H.hidup) return;
        lang.terbangKe(1110, 150, 0.44, 600, 0);
        return UI.muncul(mawar);
      }).then(function () {
        if (!H.hidup) return;
        peta.aktif(true);
        peta.sorot('pohon', true);
        siap = true;
        bicara(STR.hook.utara);
        return Tween.wait(2600);
      }).then(function () { if (H.hidup && siap) UI.tunjuk(pohon); });
      UI.idle.atur(function () { return siap ? pohon : null; });

      function ketuk(id, el) {
        if (!siap || selesai) return;
        Voice.stop();
        if (id !== 'pohon') {
          Aud.sfx('bad'); UI.goyang(el);
          lang.eks('berpikir');
          mawar.classList.add('kedip-mawar');
          setTimeout(function () { mawar.classList.remove('kedip-mawar'); }, 1600);
          bicara(STR.hook.salah);
          UI.tunjuk(pohon);
          return;
        }
        selesai = true; siap = false;
        UI.sembunyiTangan(true); peta.aktif(false);
        Aud.sfx('good'); Aud.sfx('kicau');
        var p = pohonPanggung();
        lang.pose('terbang', 'sorak');
        lang.terbangKe(p.x, p.y - 40, 0.4, 700, -20).then(function () {
          if (!H.hidup) return;
          lang.pose('hinggap', 'sorak');
          lang.geser(p.x, p.y + 10, 0.4);
          UI.ledak(p.x, p.y, 18);
          Save.tambahKeping(10);
          Aud.sfx('koin');
          var cap = U.h('div', 'cap-hook', Seni.svg(200, 200, Seni.cap(100, 100, 80, -10).replace('LENGKAP', UI.esc(STR.hook.cap))));
          cap.style.cssText = 'left:' + (p.x + 70) + 'px;top:' + (p.y - 40) + 'px';
          root.appendChild(cap);
          Aud.sfx('cap');
          if (!UI.kurangi) Tween.run(380, function (e) { cap.style.scale = (2 - e).toFixed(3); cap.style.opacity = Math.min(1, e * 2); }, Ease.easeOutBack);
          var koin = U.h('div', 'koin-melayang', UI.ikon('koin', 46) + '<span>+10</span>');
          koin.style.cssText = 'left:' + (p.x - 50) + 'px;top:' + (p.y - 110) + 'px';
          root.appendChild(koin);
          if (!UI.kurangi) Tween.run(900, function (e) { koin.style.translate = '0 ' + (-40 * e).toFixed(1) + 'px'; koin.style.opacity = (1 - Math.max(0, e - 0.6) / 0.4).toFixed(2); }, Ease.easeOutCubic);
          Save.data.hook = true; Save.save();
          return Promise.all([bicara(STR.hook.benar), Tween.wait(1800)]);
        }).then(function () { if (H.hidup) Scenes.go('level1'); });
      }
      H.keadaan = function () { return { langkah: 'hook', siap: siap }; };
    },
    exit: function () { if (H) H.hidup = false; UI.sembunyiTangan(true); },
    uji: {
      keadaan: function () { return H && H.keadaan ? H.keadaan() : { langkah: 'hook', siap: false }; },
      benar: function () { return ['tempat-pohon']; },
      salah: function () { return ['tempat-sawah']; }
    }
  });
})();
