/* Layar judul (GDD bagian 8): gulungan logo, pita tagline, MULAI, Informasi, Referensi, Pengembang;
   Pulau Latihan dari atas dengan Lang terbang, awan berbayang, perahu, ombak, mawar angin, dan juru peta cilik.
   MULAI selalu ke Kantor Peta dulu; hook 10 detik diputar saat Level 1 dipilih pertama kali (permintaan kreator). */
(function () {
  var lepas = null;
  var GAYA = {
    pelangi: { warna: 'jingga', pola: 'polos' }, bukithijau: { warna: 'hijau', pola: 'titik' }, gunungawan: { warna: 'cokelat', pola: 'datar' },
    camar: { warna: 'pasir', pola: 'polos' }, danauteduh: { warna: 'sage', pola: 'miring' }, hutandamar: { warna: 'hijau', pola: 'silang' },
    pantaibiru: { warna: 'sage', pola: 'ombak' }, lembahmawar: { warna: 'pasir', pola: 'tegak' }
  };
  var OMBAK = [[60, 250], [45, 390], [170, 500], [420, 560], [640, 545], [860, 460], [985, 300], [900, 200], [600, 105], [330, 130]];
  /* laut dan pulau tidak bergerak: dipanggang sekali (js/main.js) */
  function latarDiam() {
    var D = PULAU_LATIHAN, semua = {}, W = Seni.W;
    D.wilayah.forEach(function (w) { semua[w.id] = true; });
    var peta = Seni.petaDari(D, { x: 574, y: 156, w: 696, h: 470, vb: [30, 100, 950, 520], berwarna: semua, gaya: GAYA, ombak: [], labelLuar: false });
    return '<rect width="1280" height="720" fill="' + W.laut + '"/><rect width="1280" height="720" fill="url(#pola-laut)"/>' + peta.svg;
  }
  function ombakHidup() {
    var D = PULAU_LATIHAN, s = Math.min(696 / 950, 470 / 520), ox = 574 + (696 - 950 * s) / 2, oy = 156 + (470 - 520 * s) / 2;
    return OMBAK.map(function (p) { return Seni.ombak(ox + (p[0] - 30) * s, oy + (p[1] - 100) * s); }).join('');
  }
  Scenes.add('judul', {
    latarDiam: latarDiam,
    enter: function (root) {
      Aud.musik('judul');
      var J = STR.judul, W = Seni.W;
      root.appendChild(U.h('div', 'lapis', Seni.lapisDiam('judulLatar', 1280, 720, latarDiam())));
      var hidup = U.h('div', 'lapis');
      hidup.innerHTML = Seni.svg(1280, 720,
        ombakHidup() +
        '<g class="melayang"><path d="M820 470q60-26 110-8q50-18 110 8q-50 10-110 2q-60 8-110-2z" fill="' + W.tinta + '" opacity=".14"/></g>' +
        Seni.perahu(612, 150, 0.8) + Seni.perahu(1046, 646, 0.62) +
        Seni.burung(740, 112, 1.1) + Seni.burung(776, 96, 0.8) +
        Seni.awan(650, 112, 0.9, 'awan-a') + Seni.awan(1010, 520, 0.72, 'awan-b') +
        '<g class="melayang">' + Seni.lang(930, 300, 0.62, { pose: 'terbang', ekspresi: 'senang', gerak: true }) + '</g>' +
        Seni.awan(1130, 150, 1.05, 'awan-b') +
        Seni.mawarAngin(1182, 612, 70, { label8: false }) +
        Seni.logo(40, 34) + Seni.pita(72, 356, 456, 62, J.tagline) +
        Seni.juruPeta(700, 724, 0.8, { gerak: true }));
      root.appendChild(hidup);
      root.appendChild(U.h('h1', 'tersembunyi', UI.esc(J.lengkap)));
      var mulai = Input.button(STR.tombol.mulai, 'utama', function () { Scenes.go('kantorPeta'); }, { x: 112, y: 448, w: 340, h: 100, font: 56, id: 'mulai' });
      root.appendChild(mulai);
      [['info', 36, 168], ['referensi', 216, 168], ['pengembang', 396, 184]].forEach(function (b) {
        root.appendChild(Input.button(STR.tombol[b[0]], 'ketiga', function () { UI.info(b[0]); }, { x: b[1], y: 584, w: b[2], h: 64, font: 24, id: b[0] }));
      });
      lepas = UI.pojok(root);
      setTimeout(function () { if (mulai.isConnected) mulai.focus({ preventScroll: true }); }, 60);
    },
    exit: function () { if (lepas) lepas(); lepas = null; },
    uji: {
      keadaan: function () { return { langkah: 'judul', siap: true }; },
      benar: function () { return ['mulai']; },
      salah: function () { return []; }
    }
  });
})();
