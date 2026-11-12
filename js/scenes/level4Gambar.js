/* Gambar Level 4 yang tidak bergantung pada keadaan permainan (dipisah dari js/scenes/level4.js supaya alurnya lebih ringkas).
   Semua fungsi mengembalikan teks SVG dalam ukuran panggung 1280 x 720 atau ukuran yang disebut. */
(function (root) {
  var KOTAK = { x: 28, y: 140, w: 816, h: 410 };
  var WARNA_KOTAK = ['lautTerang', 'hijau', 'pasir', 'jingga', 'cokelat'];

  /* kotak jenjang ke-i (0 Indonesia sampai 4 desa/kelurahan), bersarang dari luar ke dalam */
  function kotakJenjang(i) { return { x: 40 + i * 56, y: 150 + i * 46, w: 792 - i * 112, h: 440 - i * 92 }; }

  /* lima kotak bersarang. sorot: indeks kotak yang berdenyut; nama: label yang sudah ditempel; mini: tanda "banyak kabupaten dan kota" */
  function jenjang(sorot, nama, mini) {
    var W = Seni.W, g = '';
    for (var i = 0; i < 5; i++) {
      var k = kotakJenjang(i), isi = Seni.ISI[WARNA_KOTAK[i]] || W[WARNA_KOTAK[i]];
      g += '<rect x="' + k.x + '" y="' + (k.y + 5) + '" width="' + k.w + '" height="' + k.h + '" rx="18" fill="' + W.tinta + '" opacity=".16"/>';
      g += '<rect x="' + k.x + '" y="' + k.y + '" width="' + k.w + '" height="' + k.h + '" rx="18" fill="' + isi + '" stroke="' + W.tinta + '" stroke-width="3.5"/>';
      var sy = i === 4 ? k.y + 19 : k.y + 8;
      if (nama && nama[i]) {
        var lebar = Math.min(k.w - 24, Math.max(150, nama[i].length * 12 + 34));
        g += '<rect x="' + (k.x + 12) + '" y="' + sy + '" width="' + lebar + '" height="34" rx="12" fill="' + W.kertas + '" stroke="' + W.tinta + '" stroke-width="3"/>';
        g += Seni.teks(k.x + 12 + lebar / 2, sy + 24, nama[i], { ukuran: 20, maxw: lebar - 16, attr: ' data-cek="kotak ' + i + '"' });
      } else g += '<rect x="' + (k.x + 12) + '" y="' + sy + '" width="200" height="34" rx="12" fill="' + W.kertas + '" fill-opacity=".6" stroke="' + W.tinta + '" stroke-width="2.5" stroke-dasharray="7 6"/>';
      if (sorot === i) g += '<rect x="' + (k.x - 5) + '" y="' + (k.y - 5) + '" width="' + (k.w + 10) + '" height="' + (k.h + 10) + '" rx="22" fill="none" stroke="' + W.jingga + '" stroke-width="7" stroke-dasharray="16 10" class="denyut"/>';
    }
    if (mini) {
      /* satu provinsi memuat banyak kabupaten dan kota */
      var kp = kotakJenjang(1);
      STR.l4.jenjang.mini.forEach(function (t, j) {
        var x = kp.x + 250 + j * 98, y = kp.y + 8;
        g += '<rect x="' + x + '" y="' + y + '" width="88" height="34" rx="10" fill="' + Seni.ISI.pasir + '" stroke="' + W.tinta + '" stroke-width="3" class="muncul-mini"/>' + Seni.teks(x + 44, y + 24, t, { ukuran: 20 });
      });
    }
    return g;
  }

  /* bingkai peta (laut, isi peta yang dipotong ke bingkai, mawar angin) untuk hasil PetaIndo.indonesia atau PetaIndo.provinsi */
  function bingkaiPeta(isiSvg) {
    var W = Seni.W, K = KOTAK, kotak = ' x="' + K.x + '" y="' + K.y + '" width="' + K.w + '" height="' + K.h + '"';
    return '<rect' + kotak + ' rx="6" fill="' + W.laut + '" stroke="' + W.biru + '" stroke-width="2.5"/><rect' + kotak + ' rx="6" fill="url(#pola-laut)"/>' +
      '<svg' + kotak + ' overflow="hidden"><g transform="translate(' + (-K.x) + ' ' + (-K.y) + ')">' + isiSvg + '</g></svg>' + Seni.mawarAngin(796, 186, 34, { label8: false });
  }

  /* peta kecil 440 x 200 di kartu nama kembar: dua wilayah dengan dua warna, diperbesar ke wilayah yang lebih kecil */
  function petaKembar(a, b, prov, tandai) {
    var W = Seni.W, kecil = Peta.kab(a).luas < Peta.kab(b).luas ? a : b, bb = Peta.kotakKabUtama([kecil]), mg = Math.max(bb[2] - bb[0], bb[3] - bb[1]) * 1.6;
    bb = [bb[0] - mg, bb[1] - mg * 0.5, bb[2] + mg, bb[3] + mg * 0.5];
    var km = { x: 0, y: 0, w: 440, h: 200 }, Tm = Peta.pas(bb, km, 8), rm = PetaIndo.provinsi({ kotak: km, prov: prov, T: Tm, warna: false, tandai: tandai, ibukota: false });
    var lab = '';
    [a, b].forEach(function (k, i) { var q = Peta.P(Peta.kab(k).titik, Tm); lab += Seni.teks(q[0], q[1] + (i ? -14 : 26), Peta.kab(k).label, { ukuran: 20, garis: W.kertas, tebalGaris: 5 }); });
    return Seni.svg(440, 200, '<rect width="440" height="200" fill="' + W.laut + '"/>' + rm.svg + lab);
  }

  root.GambarL4 = { KOTAK: KOTAK, kotakJenjang: kotakJenjang, jenjang: jenjang, bingkaiPeta: bingkaiPeta, petaKembar: petaKembar };
})(window);
