/* Pustaka gambar SVG Juru Peta Muda. Dimulai dari mockup/seni.js (Fase 0), ditambah Desa Lang, Kantor Peta, ikon, dan pemanggang.
   Semua grafik digambar kode: tanpa emoji, tanpa gambar luar. Gaya: docs/GDD.md bagian 12
   (garis Tinta 4 px, dua cel datar, bayangan padat tanpa blur, sudut membulat). */
var Seni = (function () {
  'use strict';

  /* ---------- Palet (8 warna) dan turunannya ---------- */
  var W = {
    tinta: '#1E3A4C', kertas: '#FFF6E2', jingga: '#FF8C42', laut: '#8ED1E6',
    pasir: '#F2DFAE', hijau: '#6DBE6A', biru: '#2E6F95', cokelat: '#B8642E',
    jinggaGelap: '#C77845', hijauGelap: '#599D63', biruGelap: '#2A6283', cokelatGelap: '#925A36',
    kertasGelap: '#C7C7BD', pasirGelap: '#BDB696', lautGelap: '#72ABC0',
    jinggaTerang: '#FFBC8A', hijauTerang: '#AFD7A0', lautTerang: '#C1E2E4', pasirTerang: '#F8E9C5',
    kayu: '#D5A26E'
  };
  /* Isi wilayah: turunan palet (campur dengan Kertas), selalu dipasangkan dengan arsir supaya terbaca murid buta warna. */
  var ISI = { jingga: '#FFD3A8', hijau: '#C3E2B0', pasir: '#F6E6B8', sage: '#BCD9D0', cokelat: '#EDD0B2', luar: '#DAD8CF', kosong: '#FBF0D6' };
  /* Warna khusus elang Jawa (warna isi, seperti warna kulit tokoh, di luar palet) */
  var E = {
    kepala: '#C9773D', wajah: '#DE9558', mahkota: '#8A4B22', sayap: '#7A4220', sayapMuda: '#A85A2A', jambul: '#3A2416',
    perut: '#FFF3DC', loreng: '#B8642E', paruh: '#4A5560', paruhMuda: '#7A8792', sera: '#EAD9A6', kaki: '#F2B33D'
  };
  var KULIT = '#C68B59', KULIT_GELAP = '#A8703F', RAMBUT = '#2B211C';
  var ARAH = ['utara', 'timur laut', 'timur', 'tenggara', 'selatan', 'barat daya', 'barat', 'barat laut'];
  var SINGKAT = ['U', 'TL', 'T', 'TG', 'S', 'BD', 'B', 'BL'];

  function n(v) { return Math.round(v * 10) / 10; }
  function esc(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  var GARIS = ' stroke="' + W.tinta + '" stroke-linejoin="round" stroke-linecap="round"';

  /* ---------- Pola arsir ---------- */
  function defs() {
    var a = ' stroke="' + W.tinta + '" stroke-opacity=".2" stroke-width="2.2" fill="none" stroke-linecap="round"';
    return '<defs>' +
      '<pattern id="pola-miring" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 7H14"' + a + '/></pattern>' +
      '<pattern id="pola-datar" width="14" height="13" patternUnits="userSpaceOnUse"><path d="M0 6.5H14"' + a + '/></pattern>' +
      '<pattern id="pola-tegak" width="13" height="14" patternUnits="userSpaceOnUse"><path d="M6.5 0V14"' + a + '/></pattern>' +
      '<pattern id="pola-silang" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 8H16M8 0V16"' + a + '/></pattern>' +
      '<pattern id="pola-titik" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="4" cy="4" r="2.1" fill="' + W.tinta + '" fill-opacity=".22"/><circle cx="11" cy="11" r="2.1" fill="' + W.tinta + '" fill-opacity=".22"/></pattern>' +
      '<pattern id="pola-ombak" width="24" height="14" patternUnits="userSpaceOnUse"><path d="M0 8Q6 2 12 8T24 8"' + a + '/></pattern>' +
      '<pattern id="pola-laut" width="64" height="40" patternUnits="userSpaceOnUse"><path d="M6 12q6-5 12 0M38 30q6-5 12 0" stroke="#FFFFFF" stroke-opacity=".45" stroke-width="2.4" fill="none" stroke-linecap="round"/></pattern>' +
      '<pattern id="pola-kayu" width="220" height="60" patternUnits="userSpaceOnUse"><path d="M0 14C50 8 90 22 140 14S200 10 220 16M0 44C40 38 100 50 150 42S200 40 220 46" stroke="' + W.cokelat + '" stroke-opacity=".28" stroke-width="3" fill="none"/></pattern>' +
      '</defs>';
  }

  /* o: string atribut tambahan, atau {vb, kelas, attr}. Pola arsir hanya disertakan bila dipakai. */
  function svg(w, h, isi, o) {
    var ekstra = '', vb = '0 0 ' + w + ' ' + h;
    if (typeof o === 'string') ekstra = o;
    else if (o) { if (o.vb) vb = o.vb; if (o.kelas) ekstra += ' class="' + o.kelas + '"'; if (o.attr) ekstra += ' ' + o.attr; }
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="' + vb + '"' + ekstra + ' aria-hidden="true">' + (isi.indexOf('url(#pola') >= 0 ? defs() : '') + isi + '</svg>';
  }
  function g(tf, isi, kelas) { return '<g' + (tf ? ' transform="' + tf + '"' : '') + (kelas ? ' class="' + kelas + '"' : '') + '>' + isi + '</g>'; }

  /* ---------- Teks bantu ---------- */
  function teks(x, y, t, o) {
    o = o || {};
    return '<text x="' + n(x) + '" y="' + n(y) + '" font-family="' + (o.judul ? 'Fredoka' : 'Andika') + ', Trebuchet MS, Arial, sans-serif" font-weight="' + (o.tebal === false ? 400 : 700) +
      '" font-size="' + (o.ukuran || 20) + '" fill="' + (o.warna || W.tinta) + '" text-anchor="' + (o.jangkar || 'middle') + '"' +
      (o.spasi ? ' letter-spacing="' + o.spasi + '"' : '') + (o.maxw ? ' data-maxw="' + o.maxw + '"' : '') +
      (o.garis ? ' stroke="' + o.garis + '" stroke-width="' + (o.tebalGaris || 6) + '" paint-order="stroke" stroke-linejoin="round"' : '') +
      (o.attr || '') + '>' + esc(t) + '</text>';
  }

  /* ---------- Ikon (kotak 48, garis 4 px) ---------- */
  function ikon(nama, u, arg) {
    var s = ' fill="none" stroke="' + W.tinta + '" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"', isi = '';
    switch (nama) {
      case 'suara': isi = '<path d="M8 19h7l9-8v26l-9-8H8z" fill="' + W.jingga + '"' + s.slice(11) + '/><path d="M30 18q5 6 0 12M35 13q10 11 0 22"' + s + '/>'; break;
      case 'dengar': isi = '<path d="M7 19h7l9-8v26l-9-8H7z" fill="' + W.laut + '"' + s.slice(11) + '/><path d="M29 18q5 6 0 12M34 13q10 11 0 22"' + s + '/>'; break;
      case 'layarPenuh': isi = '<path d="M8 18V8h10M30 8h10v10M40 30v10H30M18 40H8V30"' + s + '/>'; break;
      case 'gerigi':
        var p = '';
        for (var i = 0; i < 8; i++) { var a = i * Math.PI / 4; p += '<rect x="20" y="3" width="8" height="10" rx="2" fill="' + W.pasirGelap + '" stroke="' + W.tinta + '" stroke-width="3" transform="rotate(' + (i * 45) + ' 24 24)"/>'; }
        isi = p + '<circle cx="24" cy="24" r="13" fill="' + W.pasir + '" stroke="' + W.tinta + '" stroke-width="4"/><circle cx="24" cy="24" r="5" fill="' + W.kertas + '" stroke="' + W.tinta + '" stroke-width="3"/>'; break;
      case 'jeda': isi = '<rect x="12" y="10" width="8" height="28" rx="3" fill="' + W.biru + '"' + s.slice(11) + '/><rect x="28" y="10" width="8" height="28" rx="3" fill="' + W.biru + '"' + s.slice(11) + '/>'; break;
      case 'legenda': isi = '<path d="M6 12l11-4 14 4 11-4v28l-11 4-14-4-11 4z" fill="' + W.pasirTerang + '"' + s.slice(11) + '/><path d="M17 8v28M31 12v28"' + s + '/><path d="M10 26l5-6 5 6z" fill="' + W.cokelat + '" stroke="' + W.tinta + '" stroke-width="2.5" stroke-linejoin="round"/><circle cx="37" cy="21" r="3" fill="' + W.jingga + '" stroke="' + W.tinta + '" stroke-width="2.5"/>'; break;
      case 'beranda': isi = '<path d="M8 23L24 9l16 14M13 20v19h22V20" fill="' + W.pasirTerang + '"' + s.slice(11) + '/><path d="M21 39v-9h6v9"' + s + '/>'; break;
      case 'info': isi = '<circle cx="24" cy="24" r="18" fill="' + W.laut + '"' + s.slice(11) + '/><path d="M24 22v12"' + s + '/><circle cx="24" cy="15" r="2.8" fill="' + W.tinta + '"/>'; break;
      case 'koin': isi = koinIsi(); break;
      case 'kunci': isi = '<rect x="11" y="21" width="26" height="20" rx="5" fill="' + W.pasir + '"' + s.slice(11) + '/><path d="M16 21v-5a8 8 0 0 1 16 0v5"' + s + '/><circle cx="24" cy="31" r="3" fill="' + W.tinta + '"/>'; break;
      case 'kartu': isi = '<path d="M14 8h20l6 6v26H14z" fill="' + W.kertas + '"' + s.slice(11) + '/><circle cx="21" cy="16" r="3" fill="' + W.jingga + '" stroke="' + W.tinta + '" stroke-width="2.5"/><path d="M19 26h14M19 33h10"' + s + '/>'; break;
      case 'senyap': isi = '<path d="M8 19h7l9-8v26l-9-8H8z" fill="' + W.kertasGelap + '"' + s.slice(11) + '/><path d="M31 18l10 12M41 18L31 30"' + s + '/>'; break;
      case 'bintang': isi = '<path d="' + bintangPath(24, 25.5, 20, 9) + '" fill="' + (arg ? W.jingga : W.kertasGelap) + '" stroke="' + W.tinta + '" stroke-width="3.5" stroke-linejoin="round"/>' + (arg ? '<path d="M17 18l4-1" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" opacity=".7"/>' : ''); break;
      case 'gembok': isi = '<rect x="11" y="21" width="26" height="20" rx="5" fill="' + W.pasirGelap + '"' + s.slice(11) + '/><path d="M16 21v-5a8 8 0 0 1 16 0v5"' + s + '/><circle cx="24" cy="31" r="3" fill="' + W.tinta + '"/>'; break;
      case 'panah': isi = '<path d="M10 24h26M26 13l11 11-11 11"' + s + '/>'; break;
      case 'ulang': isi = '<path d="M36 18a14 14 0 1 0 2 12"' + s + '/><path d="M38 8v11H27"' + s + '/>'; break;
      case 'guru': isi = '<rect x="10" y="8" width="28" height="34" rx="5" fill="' + W.kertas + '"' + s.slice(11) + '/><rect x="17" y="4" width="14" height="8" rx="3" fill="' + W.hijau + '" stroke="' + W.tinta + '" stroke-width="3"/><path d="M16 22h16M16 29h16M16 36h9"' + s + '/>'; break;
      case 'mawar': isi = '<circle cx="24" cy="24" r="18" fill="' + W.kertas + '"' + s.slice(11) + '/><path d="M24 7l4 13-4 4-4-4z" fill="' + W.jingga + '" stroke="' + W.tinta + '" stroke-width="2.5" stroke-linejoin="round"/><path d="M24 41l4-13-4-4-4 4z" fill="' + W.biru + '" stroke="' + W.tinta + '" stroke-width="2.5" stroke-linejoin="round"/><circle cx="24" cy="24" r="3" fill="' + W.tinta + '"/>'; break;
    }
    return '<svg width="' + u + '" height="' + u + '" viewBox="0 0 48 48" aria-hidden="true">' + isi + '</svg>';
  }
  function koinIsi() {
    return '<circle cx="24" cy="26" r="18" fill="' + W.jinggaGelap + '" stroke="' + W.tinta + '" stroke-width="4"/>' +
      '<circle cx="24" cy="23" r="18" fill="' + W.jingga + '" stroke="' + W.tinta + '" stroke-width="4"/>' +
      '<circle cx="24" cy="23" r="12" fill="none" stroke="' + W.kertas + '" stroke-opacity=".7" stroke-width="2.5"/>' +
      '<path d="M24 12l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="' + W.kertas + '" stroke="' + W.tinta + '" stroke-width="2" stroke-linejoin="round"/>';
  }

  /* ---------- Hiasan dunia ---------- */
  function awan(x, y, s, kelas) {
    var d = 'M-62 12Q-70-12-44-16Q-38-42-10-36Q6-58 32-42Q60-46 62-18Q84-12 74 12Z';
    return '<g class="' + (kelas || '') + '"><g transform="translate(' + n(x) + ' ' + n(y) + ') scale(' + s + ')">' +
      '<path d="' + d + '" transform="translate(26 40)" fill="' + W.tinta + '" opacity=".13"/>' +
      '<path d="' + d + '" fill="#FFFFFF" fill-opacity=".94" stroke="' + W.tinta + '" stroke-opacity=".55" stroke-width="3.5" stroke-linejoin="round"/>' +
      '<path d="M-40 4Q-10 10 24 4" fill="none" stroke="' + W.laut + '" stroke-opacity=".6" stroke-width="3" stroke-linecap="round"/></g></g>';
  }
  function perahu(x, y, s, kelas) {
    return '<g class="' + (kelas || 'perahu') + '"><g transform="translate(' + n(x) + ' ' + n(y) + ') scale(' + s + ')">' +
      '<path d="M-46 10q-12 2-22 0M-44 18q-14 3-28 0" stroke="#FFFFFF" stroke-opacity=".8" stroke-width="3" fill="none" stroke-linecap="round"/>' +
      '<path d="M-30 4h60l-10 16h-40z" fill="' + W.cokelat + '"' + GARIS + ' stroke-width="3.5"/>' +
      '<path d="M0 4V-40" stroke="' + W.tinta + '" stroke-width="3.5" stroke-linecap="round"/>' +
      '<path d="M3-38q22 14 20 36H3z" fill="' + W.kertas + '"' + GARIS + ' stroke-width="3"/>' +
      '<path d="M3-22q14 6 17 12" stroke="' + W.jingga + '" stroke-width="5" fill="none"/>' +
      '<path d="M-3-34q-14 12-16 32h16z" fill="' + W.pasirTerang + '"' + GARIS + ' stroke-width="3"/>' +
      '<path d="M0-40l10 4-10 4" fill="' + W.jingga + '" stroke="' + W.tinta + '" stroke-width="2"/></g></g>';
  }
  function ombak(x, y) { return '<path class="ombak" d="M' + n(x - 9) + ' ' + n(y) + 'q4.5-6 9 0t9 0" stroke="#FFFFFF" stroke-width="3" fill="none" stroke-linecap="round"/>'; }
  function burung(x, y, s) { return '<g class="burung"><path d="M' + n(x - 12 * s) + ' ' + n(y) + 'q' + n(6 * s) + ' ' + n(-8 * s) + ' ' + n(12 * s) + ' 0q' + n(6 * s) + ' ' + n(-8 * s) + ' ' + n(12 * s) + ' 0" stroke="' + W.tinta + '" stroke-width="3" fill="none" stroke-linecap="round"/></g>'; }
  function gunung(x, y, s) {
    return '<g transform="translate(' + n(x) + ' ' + n(y) + ') scale(' + s + ')">' +
      '<path d="M-26 14L-2-24L24 14Z" fill="' + W.cokelat + '"/><path d="M-2-24L24 14H6Z" fill="' + W.cokelatGelap + '"/>' +
      '<path d="M-11-9L-2-24L7-9L2-12L-2-7L-6-12Z" fill="' + W.pasirTerang + '"/>' +
      '<path d="M-26 14L-2-24L24 14Z" fill="none"' + GARIS + ' stroke-width="3.5"/></g>';
  }
  function bintangPath(cx, cy, r1, r2) {
    var p = '';
    for (var i = 0; i < 10; i++) { var r = i % 2 ? r2 : r1, a = -Math.PI / 2 + i * Math.PI / 5; p += (i ? 'L' : 'M') + n(cx + r * Math.cos(a)) + ' ' + n(cy + r * Math.sin(a)); }
    return p + 'Z';
  }
  function ibuKota(x, y, r) {
    return '<circle cx="' + n(x) + '" cy="' + n(y) + '" r="' + r + '" fill="' + W.kertas + '" stroke="' + W.tinta + '" stroke-width="3"/>' +
      '<path d="' + bintangPath(x, y + 0.5, r * 0.78, r * 0.34) + '" fill="' + W.jingga + '" stroke="' + W.tinta + '" stroke-width="2.2" stroke-linejoin="round"/>';
  }

  /* ---------- Mawar angin 8 arah ---------- */
  function mawarAngin(cx, cy, r, o) {
    o = o || {};
    var rot = o.rotasi || 0, sorot = o.sorot, uk = Math.max(20, Math.round(r * 0.3)), uk8 = Math.max(20, Math.round(r * 0.2));
    var label8 = o.label8 !== undefined ? o.label8 : r >= 96;
    var g = '<g transform="translate(' + n(cx) + ' ' + n(cy) + ') rotate(' + rot + ')">';
    g += '<circle r="' + n(r * 0.74) + '" fill="' + W.kertas + '" stroke="' + W.tinta + '" stroke-width="3.5"/>';
    g += '<circle r="' + n(r * 0.6) + '" fill="none" stroke="' + W.biru + '" stroke-width="2" stroke-dasharray="3 6" stroke-linecap="round"/>';
    function ujung(k, panjang, lebar, kiri, kanan) {
      var a = k * Math.PI / 4, ux = Math.sin(a), uy = -Math.cos(a), px = -uy, py = ux;
      var tx = ux * panjang, ty = uy * panjang, bx = ux * r * 0.12, by = uy * r * 0.12;
      var l = [bx + px * lebar, by + py * lebar], rr = [bx - px * lebar, by - py * lebar];
      return '<path d="M0 0L' + n(tx) + ' ' + n(ty) + 'L' + n(rr[0]) + ' ' + n(rr[1]) + 'Z" fill="' + kiri + '"/>' +
        '<path d="M0 0L' + n(tx) + ' ' + n(ty) + 'L' + n(l[0]) + ' ' + n(l[1]) + 'Z" fill="' + kanan + '"/>' +
        '<path d="M' + n(rr[0]) + ' ' + n(rr[1]) + 'L' + n(tx) + ' ' + n(ty) + 'L' + n(l[0]) + ' ' + n(l[1]) + 'L0 0Z" fill="none"' + GARIS + ' stroke-width="2.6"/>';
    }
    [1, 3, 5, 7].forEach(function (k) { var s = sorot === k; g += ujung(k, r * 0.62, r * 0.11, s ? W.jingga : W.kertas, s ? W.jinggaGelap : W.hijauGelap); });
    [0, 2, 4, 6].forEach(function (k) { var s = sorot === k || (k === 0 && sorot === undefined); g += ujung(k, r * 0.94, r * 0.15, k === 0 || s ? W.jingga : W.kertas, k === 0 || s ? W.jinggaGelap : W.biru); });
    g += '<circle r="' + n(r * 0.09) + '" fill="' + W.kertas + '" stroke="' + W.tinta + '" stroke-width="2.6"/>';
    function label(k, jarak, ukuran) {
      var a = k * Math.PI / 4, x = Math.sin(a) * jarak, y = -Math.cos(a) * jarak;
      var s = sorot === k, tk = SINGKAT[k];
      var bg = s ? '<rect x="' + n(x - ukuran * 0.36 * tk.length - 6) + '" y="' + n(y - ukuran * 0.62) + '" width="' + n(ukuran * 0.72 * tk.length + 12) + '" height="' + n(ukuran * 1.24) + '" rx="' + n(ukuran * 0.5) + '" fill="' + W.jingga + '" stroke="' + W.tinta + '" stroke-width="2.5" transform="rotate(' + (-rot) + ' ' + n(x) + ' ' + n(y) + ')"/>' : '';
      return bg + teks(x, y + ukuran * 0.36, tk, { judul: true, ukuran: ukuran, warna: k === 0 && !s ? W.jinggaGelap : W.tinta, garis: s ? undefined : W.kertas, tebalGaris: 5, attr: ' transform="rotate(' + (-rot) + ' ' + n(x) + ' ' + n(y) + ')"' });
    }
    [0, 2, 4, 6].forEach(function (k) { g += label(k, r * 0.94 + uk * 0.66, uk); });
    if (label8) [1, 3, 5, 7].forEach(function (k) { g += label(k, r * 0.62 + uk8 * 1.05, uk8); });
    return g + '</g>';
  }
  /* Mawar angin kecil untuk kartu petunjuk: arah sasaran menyala. */
  function kompasMini(arah, u) {
    var r = u / 2, g = '<svg width="' + u + '" height="' + u + '" viewBox="' + (-r) + ' ' + (-r) + ' ' + u + ' ' + u + '" aria-hidden="true">';
    g += '<circle r="' + n(r - 3) + '" fill="' + W.laut + '" fill-opacity=".35" stroke="' + W.tinta + '" stroke-width="3"/>';
    for (var k = 0; k < 8; k++) {
      var a = k * Math.PI / 4, on = k === arah, p = (k % 2 ? 0.5 : 0.62) * r + (on ? r * 0.18 : 0);
      var x = Math.sin(a) * p, y = -Math.cos(a) * p, px = Math.cos(a) * (on ? 7 : 4), py = Math.sin(a) * (on ? 7 : 4);
      g += '<path d="M' + n(px) + ' ' + n(py) + 'L' + n(x) + ' ' + n(y) + 'L' + n(-px) + ' ' + n(-py) + 'Z" fill="' + (on ? W.jingga : (k === 0 ? W.jinggaTerang : W.kertas)) + '"' + GARIS + ' stroke-width="2.4"/>';
    }
    g += '<circle r="5" fill="' + W.kertas + '" stroke="' + W.tinta + '" stroke-width="2.4"/>';
    g += teks(0, -r + 22, 'U', { judul: true, ukuran: 20, warna: W.jinggaGelap });
    return g + '</svg>';
  }

  /* ---------- Lang si elang Jawa ----------
     Titik asal di kaki (pose hinggap) atau di tengah badan (pose terbang). Ekspresi: senang, berpikir, bangga, sorak. */
  function mata(x, y, ex, gerak) {
    var dx = ex === 'berpikir' ? 3 : 0, dy = ex === 'berpikir' ? -4 : 0, g = '';
    if (ex === 'sorak') {
      return '<path d="M' + (x - 11) + ' ' + (y + 3) + 'Q' + x + ' ' + (y - 11) + ' ' + (x + 11) + ' ' + (y + 3) + '" fill="none" stroke="' + W.tinta + '" stroke-width="4.5" stroke-linecap="round"/>';
    }
    g += '<g class="' + (gerak ? 'mata' : '') + '">';
    g += '<ellipse cx="' + x + '" cy="' + y + '" rx="13" ry="15" fill="#FFFFFF" stroke="' + W.tinta + '" stroke-width="3"/>';
    g += '<circle cx="' + (x + dx) + '" cy="' + (y + 1 + dy) + '" r="9.5" fill="' + W.jingga + '"/>';
    g += '<circle cx="' + (x + dx) + '" cy="' + (y + 1 + dy) + '" r="6" fill="' + W.tinta + '"/>';
    g += '<circle cx="' + (x + dx + 3) + '" cy="' + (y - 3 + dy) + '" r="2.6" fill="#FFFFFF"/>';
    if (ex === 'bangga') g += '<path d="M' + (x - 14) + ' ' + (y + 1) + 'Q' + x + ' ' + (y - 22) + ' ' + (x + 14) + ' ' + (y + 1) + 'Q' + x + ' ' + (y - 6) + ' ' + (x - 14) + ' ' + (y + 1) + 'Z" fill="' + E.wajah + '" stroke="' + W.tinta + '" stroke-width="3" stroke-linejoin="round"/>';
    return g + '</g>';
  }
  function alis(ex) {
    var k = 'stroke="' + E.jambul + '" stroke-width="5" stroke-linecap="round" fill="none"';
    if (ex === 'berpikir') return '<path d="M-30-198Q-20-206-8-200" ' + k + '/><path d="M8-196Q20-196 30-194" ' + k + '/>';
    if (ex === 'bangga') return '<path d="M-30-197Q-19-201-8-195" ' + k + '/><path d="M8-195Q19-201 30-197" ' + k + '/>';
    if (ex === 'sorak') return '<path d="M-30-198Q-19-208-8-200" ' + k + '/><path d="M8-200Q19-208 30-198" ' + k + '/>';
    return '<path d="M-30-199Q-19-207-8-201" ' + k + '/><path d="M8-201Q19-207 30-199" ' + k + '/>';
  }
  function kepalaLang(ex, gerak) {
    var g = '', bicara = ex === 'bicara';
    if (bicara) ex = 'senang';
    /* jambul: 3 bulu panjang di belakang mahkota, ujung putih */
    g += '<g class="' + (gerak ? 'jambul' : '') + '">';
    var bulu = ex === 'bangga' || ex === 'sorak' ? [[-16, -262, -8], [2, -270, 0], [20, -262, 8]] : [[-12, -256, -10], [4, -264, -2], [20, -254, 6]];
    bulu.forEach(function (b) {
      g += '<path d="M' + (b[0] * 0.3 - 6) + ' -214Q' + (b[0] - 4) + ' ' + (b[1] + 24) + ' ' + b[0] + ' ' + b[1] + 'Q' + (b[0] + 8) + ' ' + (b[1] + 26) + ' ' + (b[0] * 0.3 + 6) + ' -214Z" fill="' + E.jambul + '"' + GARIS + ' stroke-width="3"/>';
      g += '<path d="M' + (b[0] - 1.5) + ' ' + (b[1] + 9) + 'Q' + b[0] + ' ' + (b[1] + 2) + ' ' + b[0] + ' ' + b[1] + 'Q' + (b[0] + 3) + ' ' + (b[1] + 6) + ' ' + (b[0] + 3) + ' ' + (b[1] + 10) + 'Z" fill="' + W.kertas + '"/>';
    });
    g += '</g>';
    /* kepala */
    g += '<circle cx="0" cy="-176" r="48" fill="' + E.kepala + '" stroke="' + W.tinta + '" stroke-width="4"/>';
    g += '<path d="M-42-198Q-30-226 0-226Q30-226 42-198Q24-210 0-210Q-24-210-42-198Z" fill="' + E.mahkota + '"/>';
    g += '<ellipse cx="0" cy="-168" rx="38" ry="26" fill="' + E.wajah + '"/>';
    /* tenggorokan putih dengan garis tengah gelap */
    g += '<path d="M-18-146Q0-124 18-146Q10-136 0-134Q-10-136-18-146Z" fill="' + W.kertas + '"/>';
    g += '<path d="M0-146V-131" stroke="' + E.mahkota + '" stroke-width="3.5" stroke-linecap="round"/>';
    g += '<circle cx="0" cy="-176" r="48" fill="none" stroke="' + W.tinta + '" stroke-width="4"/>';
    /* pipi */
    g += '<ellipse cx="-33" cy="-158" rx="8" ry="5" fill="' + W.jingga + '" opacity=".5"/><ellipse cx="33" cy="-158" rx="8" ry="5" fill="' + W.jingga + '" opacity=".5"/>';
    g += mata(-18, -180, ex, gerak) + mata(18, -180, ex, gerak) + alis(ex);
    /* paruh bengkok: sera pucat, paruh abu kebiruan */
    g += '<path d="M-12-170Q0-178 12-170L10-163H-10Z" fill="' + E.sera + '"' + GARIS + ' stroke-width="3"/>';
    /* paruh terbuka selalu ada; ditampilkan saat bersorak atau berbicara (pengendali di js/scenes/bersama.js mengubah tampilannya) */
    g += '<path class="mulut-buka" d="M-9-160Q0-146 9-160Z" fill="' + W.jinggaGelap + '"' + GARIS + ' stroke-width="3"' + (ex === 'sorak' || bicara ? '' : ' style="display:none"') + '/>';
    g += '<path d="M-11-164Q0-168 11-164Q10-152 3-144Q1-140-1-143Q2-150 0-154Q-6-154-11-164Z" fill="' + E.paruh + '"' + GARIS + ' stroke-width="3"/>';
    g += '<path d="M-5-162Q0-164 5-162" stroke="' + E.paruhMuda + '" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
    /* garis mulut tersenyum */
    if (ex !== 'berpikir') g += '<path d="M-17-164Q-14-158-9-158M17-164Q14-158 9-158" stroke="' + W.tinta + '" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
    else g += '<path d="M-16-161H-10M16-163Q13-161 10-161" stroke="' + W.tinta + '" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
    return g;
  }
  function sayapLipat(sisi, ex) {
    /* sisi -1 kiri layar, 1 kanan layar */
    var s = sisi, g = '';
    if (ex === 'sorak') {
      g += '<path d="M' + (s * 40) + ' -140Q' + (s * 92) + ' -190 ' + (s * 104) + ' -246Q' + (s * 84) + ' -236 ' + (s * 76) + ' -222Q' + (s * 70) + ' -236 ' + (s * 58) + ' -230Q' + (s * 66) + ' -196 ' + (s * 36) + ' -112Z" fill="' + E.sayap + '"' + GARIS + ' stroke-width="4"/>';
      g += '<path d="M' + (s * 46) + ' -148Q' + (s * 76) + ' -182 ' + (s * 84) + ' -214" stroke="' + E.sayapMuda + '" stroke-width="10" fill="none" stroke-linecap="round"/>';
      return g;
    }
    if (ex === 'berpikir' && s === 1) {
      /* sayap kanan diangkat ke dagu */
      g += '<path d="M44-138Q74-120 62-96Q50-80 24-92Q6-104 2-128Q14-124 24-118Q30-130 44-138Z" fill="' + E.sayap + '"' + GARIS + ' stroke-width="4"/>';
      g += '<path d="M8-126Q2-138 6-146Q14-140 16-130" fill="' + E.sayapMuda + '"' + GARIS + ' stroke-width="3"/>';
      return g;
    }
    var keluar = ex === 'bangga' ? 10 : 0;
    g += '<path d="M' + (s * 44) + ' -148Q' + (s * (74 + keluar)) + ' -112 ' + (s * (66 + keluar)) + ' -64Q' + (s * (60 + keluar)) + ' -34 ' + (s * (44 + keluar * 1.6)) + ' -20Q' + (s * 36) + ' -60 ' + (s * 30) + ' -104Q' + (s * 30) + ' -134 ' + (s * 44) + ' -148Z" fill="' + E.sayap + '"' + GARIS + ' stroke-width="4"/>';
    g += '<path d="M' + (s * 42) + ' -138Q' + (s * 62) + ' -112 ' + (s * 58) + ' -84" stroke="' + E.sayapMuda + '" stroke-width="10" fill="none" stroke-linecap="round"/>';
    g += '<path d="M' + (s * 50) + ' -60L' + (s * 58) + ' -56M' + (s * 47) + ' -44L' + (s * 55) + ' -40" stroke="' + W.kertas + '" stroke-opacity=".75" stroke-width="3.5" stroke-linecap="round"/>';
    return g;
  }
  function langHinggap(ex, gerak) {
    var g = '<ellipse cx="0" cy="4" rx="64" ry="10" fill="' + W.tinta + '" opacity=".18"/>';
    g += '<path d="M-20-46L-36 6Q0 20 36 6L20-46Z" fill="' + E.sayap + '"' + GARIS + ' stroke-width="4"/>';
    g += '<path d="M-31-10Q0 0 31-10M-27-27Q0-17 27-27" fill="none" stroke="' + E.perut + '" stroke-width="5" stroke-linecap="round" opacity=".85"/>';
    [-1, 1].forEach(function (s) {
      g += '<path d="M' + (s * 8) + ' -56Q' + (s * 30) + ' -44 ' + (s * 24) + ' -14H' + (s * 6) + 'Z" fill="' + E.perut + '"' + GARIS + ' stroke-width="3.5"/>';
      g += '<path d="M' + (s * 12) + ' -40l' + (s * 8) + ' 3M' + (s * 11) + ' -28l' + (s * 9) + ' 3" stroke="' + E.loreng + '" stroke-width="3" stroke-linecap="round"/>';
      g += '<path d="M' + (s * 15) + ' -14l' + (s * -9) + ' 12M' + (s * 15) + ' -14v14M' + (s * 15) + ' -14l' + (s * 10) + ' 12" stroke="' + W.tinta + '" stroke-width="11" stroke-linecap="round"/>';
      g += '<path d="M' + (s * 15) + ' -14l' + (s * -9) + ' 12M' + (s * 15) + ' -14v14M' + (s * 15) + ' -14l' + (s * 10) + ' 12" stroke="' + E.kaki + '" stroke-width="5.5" stroke-linecap="round"/>';
    });
    var puff = ex === 'bangga' ? 5 : 0;
    g += '<g class="' + (gerak ? 'napas' : '') + '">';
    g += '<ellipse cx="0" cy="-98" rx="' + (54 + puff) + '" ry="66" fill="' + E.perut + '" stroke="' + W.tinta + '" stroke-width="4"/>';
    [[-118, [-22, 0, 22]], [-100, [-33, -11, 11, 33]], [-82, [-30, -10, 10, 30]], [-64, [-20, 0, 20]]].forEach(function (b) {
      b[1].forEach(function (x) { g += '<path d="M' + (x - 7) + ' ' + b[0] + 'q7 6 14 0" stroke="' + E.loreng + '" stroke-width="3.5" fill="none" stroke-linecap="round"/>'; });
    });
    g += '<path d="M-46-128Q0-108 46-128Q40-156 0-160Q-40-156-46-128Z" fill="' + E.kepala + '"/>';
    g += sayapLipat(-1, ex) + (ex === 'berpikir' ? '' : sayapLipat(1, ex));
    g += '</g>';
    g += '<g class="' + (gerak ? 'toleh' : '') + '" transform="' + (ex === 'berpikir' ? 'rotate(6 0 -150)' : ex === 'bangga' ? 'rotate(-5 0 -150)' : '') + '">' + kepalaLang(ex, gerak) + '</g>';
    if (ex === 'berpikir') g += sayapLipat(1, ex) + '<circle cx="66" cy="-236" r="6" fill="' + W.kertas + '" stroke="' + W.tinta + '" stroke-width="3"/><circle cx="82" cy="-256" r="9" fill="' + W.kertas + '" stroke="' + W.tinta + '" stroke-width="3"/>';
    return g;
  }
  function langTerbang(ex, gerak) {
    var g = '';
    /* sayap terbentang (bawah sayap tampak sedikit), bergaris di bulu terbang */
    function sayap(s) {
      var d = 'M' + (s * 24) + ' -18Q' + (s * 90) + ' -78 ' + (s * 196) + ' -64Q' + (s * 206) + ' -54 ' + (s * 198) + ' -46Q' + (s * 214) + ' -40 ' + (s * 204) + ' -30Q' + (s * 216) + ' -22 ' + (s * 200) + ' -14Q' + (s * 208) + ' -4 ' + (s * 190) + ' -2Q' + (s * 192) + ' 10 ' + (s * 172) + ' 6Q' + (s * 150) + ' 26 ' + (s * 120) + ' 14Q' + (s * 96) + ' 30 ' + (s * 70) + ' 16Q' + (s * 48) + ' 26 ' + (s * 24) + ' 14Z';
      var x = '<path d="' + d + '" fill="' + E.sayap + '"' + GARIS + ' stroke-width="4"/>';
      x += '<path d="M' + (s * 34) + ' -14Q' + (s * 96) + ' -56 ' + (s * 170) + ' -50" stroke="' + E.sayapMuda + '" stroke-width="16" fill="none" stroke-linecap="round"/>';
      [[120, -24, 8], [148, -26, 4], [172, -30, 0]].forEach(function (b) {
        x += '<path d="M' + (s * b[0]) + ' ' + b[1] + 'l' + (s * 6) + ' ' + (26 + b[2]) + '" stroke="' + W.kertas + '" stroke-opacity=".6" stroke-width="4" stroke-linecap="round"/>';
      });
      return x;
    }
    g += '<g class="' + (gerak ? 'kepak-l' : '') + '" style="transform-origin:-24px -6px">' + sayap(-1) + '</g>';
    g += '<g class="' + (gerak ? 'kepak-r' : '') + '" style="transform-origin:24px -6px">' + sayap(1) + '</g>';
    g += '<path d="M-18 30L-28 84Q0 96 28 84L18 30Z" fill="' + E.sayap + '"' + GARIS + ' stroke-width="4"/>';
    g += '<path d="M-24 62Q0 70 24 62" stroke="' + E.perut + '" stroke-width="5" fill="none" stroke-linecap="round" opacity=".85"/>';
    g += '<ellipse cx="0" cy="12" rx="40" ry="50" fill="' + E.perut + '" stroke="' + W.tinta + '" stroke-width="4"/>';
    [[10, [-14, 6]], [26, [-20, 0, 20]], [42, [-10, 10]]].forEach(function (b) {
      b[1].forEach(function (x) { g += '<path d="M' + (x - 6) + ' ' + b[0] + 'q6 5 12 0" stroke="' + E.loreng + '" stroke-width="3.2" fill="none" stroke-linecap="round"/>'; });
    });
    g += '<path d="M-36-12Q0 6 36-12Q32-34 0-38Q-32-34-36-12Z" fill="' + E.kepala + '"/>';
    g += '<path d="M-12 58l-6 10M12 58l6 10" stroke="' + W.tinta + '" stroke-width="10" stroke-linecap="round"/><path d="M-12 58l-6 10M12 58l6 10" stroke="' + E.kaki + '" stroke-width="5" stroke-linecap="round"/>';
    g += '<g transform="translate(0 92) scale(.86)">' + kepalaLang(ex, gerak) + '</g>';
    return g;
  }
  function lang(x, y, skala, o) {
    o = o || {};
    var isi = o.pose === 'terbang' ? langTerbang(o.ekspresi || 'senang', o.gerak) : langHinggap(o.ekspresi || 'senang', o.gerak);
    return '<g transform="translate(' + n(x) + ' ' + n(y) + ') scale(' + skala + ')">' + isi + '</g>';
  }
  /* Potret bulat Lang untuk papan instruksi */
  function potretLang(u, ex) {
    return '<svg width="' + u + '" height="' + u + '" viewBox="-60 -232 120 120" aria-hidden="true"><defs><clipPath id="klip-potret-' + u + '"><circle cx="0" cy="-172" r="56"/></clipPath></defs>' +
      '<circle cx="0" cy="-172" r="56" fill="' + W.laut + '" stroke="' + W.tinta + '" stroke-width="4"/>' +
      '<g clip-path="url(#klip-potret-' + u + ')"><g transform="translate(0 6) scale(.92)">' + langHinggap(ex || 'senang', false) + '</g></g>' +
      '<circle cx="0" cy="-172" r="56" fill="none" stroke="' + W.tinta + '" stroke-width="4"/></svg>';
  }

  /* ---------- Juru peta cilik (setengah badan) ---------- */
  function juruPeta(x, y, s, o) {
    o = o || {};
    var g = '<g transform="translate(' + n(x) + ' ' + n(y) + ') scale(' + s + ')">';
    /* lengan kanan layar terangkat memegang kartu nama */
    g += '<path d="M58-104Q96-120 108-176" stroke="' + W.tinta + '" stroke-width="30" fill="none" stroke-linecap="round"/><path d="M58-104Q96-120 108-176" stroke="' + W.kertas + '" stroke-width="22" fill="none" stroke-linecap="round"/>';
    g += '<circle cx="109" cy="-184" r="15" fill="' + KULIT + '" stroke="' + W.tinta + '" stroke-width="3.5"/>';
    /* badan: kaus krem, rompi hijau */
    g += '<path d="M-84 0Q-86-84-58-110Q-30-124 0-124Q30-124 58-110Q86-84 84 0Z" fill="' + W.kertas + '"' + GARIS + ' stroke-width="4"/>';
    g += '<path d="M-82 0Q-84-80-58-108Q-40-118-26-120L-14 0Z" fill="' + W.hijau + '"' + GARIS + ' stroke-width="4"/>';
    g += '<path d="M82 0Q84-80 58-108Q40-118 26-120L14 0Z" fill="' + W.hijau + '"' + GARIS + ' stroke-width="4"/>';
    g += '<rect x="-66" y="-66" width="34" height="28" rx="6" fill="' + W.hijauGelap + '" stroke="' + W.tinta + '" stroke-width="3.5"/><rect x="32" y="-66" width="34" height="28" rx="6" fill="' + W.hijauGelap + '" stroke="' + W.tinta + '" stroke-width="3.5"/>';
    g += '<path d="M-22-122Q0-104 22-122L14-130H-14Z" fill="' + W.biru + '"' + GARIS + ' stroke-width="3.5"/>';
    /* lengan kiri layar memegang kompas */
    g += '<path d="M-60-100Q-80-60-34-44" stroke="' + W.tinta + '" stroke-width="30" fill="none" stroke-linecap="round"/><path d="M-60-100Q-80-60-34-44" stroke="' + W.kertas + '" stroke-width="22" fill="none" stroke-linecap="round"/>';
    g += '<circle cx="-14" cy="-48" r="30" fill="' + W.jinggaGelap + '" stroke="' + W.tinta + '" stroke-width="4"/><circle cx="-14" cy="-50" r="22" fill="' + W.kertas + '" stroke="' + W.tinta + '" stroke-width="3"/>';
    g += '<path d="M-14-68L-9-50H-19Z" fill="' + W.jingga + '" stroke="' + W.tinta + '" stroke-width="2"/><path d="M-14-32L-9-50H-19Z" fill="' + W.biru + '" stroke="' + W.tinta + '" stroke-width="2"/><circle cx="-14" cy="-50" r="3" fill="' + W.tinta + '"/>';
    g += '<circle cx="-34" cy="-40" r="14" fill="' + KULIT + '" stroke="' + W.tinta + '" stroke-width="3.5"/>';
    /* leher dan kepala */
    g += '<rect x="-14" y="-142" width="28" height="24" fill="' + KULIT_GELAP + '"/>';
    g += '<circle cx="-50" cy="-172" r="11" fill="' + KULIT + '" stroke="' + W.tinta + '" stroke-width="3.5"/><circle cx="50" cy="-172" r="11" fill="' + KULIT + '" stroke="' + W.tinta + '" stroke-width="3.5"/>';
    g += '<circle cx="0" cy="-176" r="50" fill="' + KULIT + '" stroke="' + W.tinta + '" stroke-width="4"/>';
    g += '<path d="M-50-176Q-52-214-20-224Q16-232 42-210Q52-196 50-176Q40-196 20-200Q-6-186-28-196Q-40-192-50-176Z" fill="' + RAMBUT + '"' + GARIS + ' stroke-width="3"/>';
    g += '<g class="' + (o.gerak ? 'mata' : '') + '"><ellipse cx="-18" cy="-174" rx="6.5" ry="8.5" fill="' + W.tinta + '"/><ellipse cx="18" cy="-174" rx="6.5" ry="8.5" fill="' + W.tinta + '"/><circle cx="-16" cy="-177" r="2.4" fill="#FFFFFF"/><circle cx="20" cy="-177" r="2.4" fill="#FFFFFF"/></g>';
    g += '<path d="M-28-190Q-18-196-8-190M8-190Q18-196 28-190" stroke="' + RAMBUT + '" stroke-width="4" fill="none" stroke-linecap="round"/>';
    g += '<ellipse cx="-30" cy="-156" rx="8" ry="5" fill="' + W.jingga + '" opacity=".45"/><ellipse cx="30" cy="-156" rx="8" ry="5" fill="' + W.jingga + '" opacity=".45"/>';
    g += '<path d="M-14-152Q0-138 14-152Q0-146-14-152Z" fill="' + W.kertas + '" stroke="' + W.tinta + '" stroke-width="3.5" stroke-linejoin="round"/>';
    /* topi penjelajah */
    g += '<ellipse cx="0" cy="-212" rx="84" ry="17" fill="' + W.pasir + '"' + GARIS + ' stroke-width="4"/>';
    g += '<path d="M-50-214Q-50-262 0-264Q50-262 50-214Z" fill="' + W.pasir + '"' + GARIS + ' stroke-width="4"/>';
    g += '<path d="M-50-222Q0-210 50-222V-212Q0-200-50-212Z" fill="' + W.jingga + '"' + GARIS + ' stroke-width="3"/>';
    g += '<path d="M-24-252Q-10-260 4-260" stroke="#FFFFFF" stroke-opacity=".6" stroke-width="5" fill="none" stroke-linecap="round"/>';
    /* kartu nama di tangan */
    g += '<path d="M109-184Q118-160 132-150" stroke="' + W.tinta + '" stroke-width="2.5" fill="none"/>';
    g += '<g transform="translate(132 -150) rotate(8)">' + bentukPlat(0, 0, 168, 58, ISI.jingga, 'Kota', 'Pelangi', { pin: false }) + '</g>';
    return g + '</g>';
  }

  /* ---------- Kartu nama dan plat ---------- */
  /* Plat di peta: menggantung dari tali (atas tengah), garis warna wilayah di kiri. x,y = titik tengah atas. */
  function bentukPlat(x, y, w, h, warna, awal, nama, o) {
    o = o || {};
    var l = x - w / 2, g = '';
    g += '<rect x="' + n(l) + '" y="' + n(y + 4) + '" width="' + w + '" height="' + h + '" rx="10" fill="' + W.tinta + '" opacity=".22"/>';
    g += '<rect x="' + n(l) + '" y="' + n(y) + '" width="' + w + '" height="' + h + '" rx="10" fill="' + W.kertas + '" stroke="' + W.tinta + '" stroke-width="3"/>';
    g += '<path d="M' + n(l + 1.5) + ' ' + n(y + 10) + 'a8.5 8.5 0 0 1 8.5-8.5h4v' + n(h - 3) + 'h-4a8.5 8.5 0 0 1-8.5-8.5z" fill="' + warna + '"/>';
    g += '<path d="M' + n(l + 14) + ' ' + n(y + 1.5) + 'v' + n(h - 3) + '" stroke="' + W.tinta + '" stroke-width="2"/>';
    g += '<circle cx="' + n(x) + '" cy="' + n(y + 7) + '" r="3.2" fill="' + W.pasirGelap + '" stroke="' + W.tinta + '" stroke-width="1.8"/>';
    var tx = l + 14 + (w - 14) / 2, mw = w - 26;
    if (awal) {
      g += teks(tx, y + h * 0.48, awal, { ukuran: 20, warna: W.biru, maxw: mw });
      g += teks(tx, y + h * 0.86, nama, { ukuran: 20, maxw: mw });
    } else g += teks(tx, y + h / 2 + 7, nama, { ukuran: 20, maxw: mw });
    return g;
  }
  /* Bentuk kartu nama di baki (label bertali): sisi kiri terpotong, lubang bercincin, tali melingkar. */
  function bentukKartu(w, h, o) {
    o = o || {};
    var c = 18, d = 'M' + c + ' 2H' + (w - 12) + 'Q' + (w - 2) + ' 2 ' + (w - 2) + ' 12V' + (h - 12) + 'Q' + (w - 2) + ' ' + (h - 2) + ' ' + (w - 12) + ' ' + (h - 2) + 'H' + c + 'L2 ' + (h - 2 - c) + 'V' + (2 + c) + 'Z';
    var g = '<svg class="bentuk" width="' + w + '" height="' + (h + 8) + '" viewBox="0 0 ' + w + ' ' + (h + 8) + '" aria-hidden="true">';
    g += '<path d="' + d + '" transform="translate(0 6)" fill="' + W.tinta + '" opacity=".3"/>';
    if (o.terpilih) g += '<path d="' + d + '" fill="none" stroke="' + W.jingga + '" stroke-width="12" stroke-linejoin="round"/>';
    g += '<path d="' + d + '" fill="' + (o.warna || W.kertas) + '" stroke="' + W.tinta + '" stroke-width="3.5" stroke-linejoin="round"/>';
    g += '<circle cx="22" cy="' + (h / 2) + '" r="9" fill="' + W.jingga + '" stroke="' + W.tinta + '" stroke-width="3"/><circle cx="22" cy="' + (h / 2) + '" r="3.6" fill="' + W.cokelat + '" stroke="' + W.tinta + '" stroke-width="2"/>';
    g += '<path d="M22 ' + (h / 2) + 'Q8 ' + (h / 2 - 18) + ' 14 ' + (h / 2 - 34) + '" stroke="' + W.tinta + '" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
    return g + '</svg>';
  }
  /* Pin kosong "?" untuk wilayah yang belum bernama */
  function pinKosong(x, y, kelas) {
    return '<g class="' + (kelas || '') + '"><circle cx="' + n(x) + '" cy="' + n(y) + '" r="17" fill="' + W.kertas + '" fill-opacity=".92" stroke="' + W.tinta + '" stroke-width="3" stroke-dasharray="6 4"/>' +
      teks(x, y + 7.5, '?', { judul: true, ukuran: 22, warna: W.biru }) + '</g>';
  }
  function pin(x, y) {
    return '<circle cx="' + n(x) + '" cy="' + n(y + 2) + '" r="7" fill="' + W.tinta + '" opacity=".25"/><circle cx="' + n(x) + '" cy="' + n(y) + '" r="7" fill="' + W.jingga + '" stroke="' + W.tinta + '" stroke-width="3"/>';
  }

  /* ---------- Peta dari data garis bersama (bentuk mirip TopoJSON) ---------- */
  function petaDari(data, o) {
    o = o || {};
    var vb = o.vb || [20, 40, 970, 585];
    var s = Math.min(o.w / vb[2], o.h / vb[3]);
    var ox = o.x + (o.w - vb[2] * s) / 2, oy = o.y + (o.h - vb[3] * s) / 2;
    function P(p) { return [ox + (p[0] - vb[0]) * s, oy + (p[1] - vb[1]) * s]; }
    function titikGaris(nama) { var b = nama[0] === '~', g = data.garis[b ? nama.slice(1) : nama].titik; return b ? g.slice().reverse() : g; }
    function cincin(daftar) { var pts = []; daftar.forEach(function (nm) { var t = titikGaris(nm); pts = pts.concat(pts.length ? t.slice(1) : t); }); return pts; }
    function dJalur(pts, tutup) { return pts.map(function (p, i) { var q = P(p); return (i ? 'L' : 'M') + n(q[0]) + ' ' + n(q[1]); }).join('') + (tutup ? 'Z' : ''); }
    function dWilayah(w) { var d = dJalur(cincin(w.garis), true); (w.pulau || []).forEach(function (pl) { d += dJalur(cincin(pl), true); }); return d; }
    var gaya = o.gaya || {}, berwarna = o.berwarna || {}, g = '';

    /* laut dangkal di sekitar pantai */
    g += '<g fill="' + W.lautTerang + '" stroke="' + W.lautTerang + '" stroke-width="' + n(30 * s) + '" stroke-linejoin="round">';
    data.wilayah.forEach(function (w) { g += '<path d="' + dWilayah(w) + '"/>'; });
    g += '</g><g fill="none" stroke="#FFFFFF" stroke-opacity=".55" stroke-width="2.5" stroke-dasharray="2 9" stroke-linecap="round">';
    data.wilayah.forEach(function (w) { g += '<path d="' + dWilayah(w) + '" transform="translate(0 0)" stroke-width="' + n(3) + '" style="paint-order:stroke"/>'; });
    g += '</g>';
    /* daratan */
    data.wilayah.forEach(function (w) {
      var st = gaya[w.id] || {}, warna = w.jenis === 'luar' ? ISI.luar : (berwarna[w.id] ? (ISI[st.warna] || ISI.pasir) : ISI.kosong);
      g += '<path d="' + dWilayah(w) + '" fill="' + warna + '"' + (o.sorot === w.id ? ' class="denyut"' : '') + '/>';
      if (berwarna[w.id] && st.pola && st.pola !== 'polos') g += '<path d="' + dWilayah(w) + '" fill="url(#pola-' + st.pola + ')"/>';
    });
    /* bentang alam */
    var b = data.bentang;
    if (b.danau) { var dp = P(b.danau.pusat); g += '<ellipse cx="' + n(dp[0]) + '" cy="' + n(dp[1]) + '" rx="' + n(b.danau.rx * s) + '" ry="' + n(b.danau.ry * s) + '" fill="' + W.laut + '" stroke="' + W.tinta + '" stroke-width="3"/>'; }
    b.sungai.forEach(function (sg) {
      g += '<path d="' + dJalur(sg.titik) + '" fill="none" stroke="' + W.tinta + '" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>';
      g += '<path d="' + dJalur(sg.titik) + '" fill="none" stroke="' + W.laut + '" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>';
    });
    /* batas */
    Object.keys(data.garis).forEach(function (k) {
      var gr = data.garis[k];
      if (gr.jenis === 'kab') g += '<path d="' + dJalur(gr.titik) + '" fill="none" stroke="' + W.tinta + '" stroke-opacity=".8" stroke-width="2.6" stroke-dasharray="9 7" stroke-linecap="round"/>';
    });
    Object.keys(data.garis).forEach(function (k) {
      var gr = data.garis[k];
      if (gr.jenis === 'prov') g += '<path d="' + dJalur(gr.titik) + '" fill="none" stroke="' + W.tinta + '" stroke-width="7" stroke-linecap="round"/><path d="' + dJalur(gr.titik) + '" fill="none" stroke="' + W.jingga + '" stroke-width="2" stroke-dasharray="1 9" stroke-linecap="round"/>';
      if (gr.jenis === 'pantai') g += '<path d="' + dJalur(gr.titik) + '" fill="none" stroke="' + W.tinta + '" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>';
    });
    if (o.gunung !== false) b.gunung.forEach(function (gn) { var q = P(gn.titik); g += gunung(q[0], q[1], gn.besar * Math.max(0.7, s)); });
    if (o.ombak) o.ombak.forEach(function (p) { var q = P(p); g += ombak(q[0], q[1]); });
    if (o.labelLaut) b.laut.forEach(function (l, i) { var q = P(o.posLaut && o.posLaut[i] ? o.posLaut[i] : l.titik); g += teks(q[0], q[1], l.nama, { ukuran: 20, warna: W.biru, spasi: 2, tebal: true, garis: W.lautTerang, tebalGaris: 5 }); });
    if (o.labelLuar !== false) data.wilayah.forEach(function (w) { if (w.jenis === 'luar') { var q = P(o.posLuar || w.label); g += teks(q[0], q[1] - 10, 'PROVINSI', { ukuran: 20, warna: '#6E6B63', spasi: 1 }) + teks(q[0], q[1] + 14, w.nama.replace('Provinsi ', '').toUpperCase(), { ukuran: 20, warna: '#6E6B63', spasi: 1 }); } });
    var ik = b.ibukota, iq = P(ik.titik);
    if (o.ibukota !== false) g += ibuKota(iq[0], iq[1], 14);
    return { svg: g, P: P, s: s, wilayah: data.wilayah };
  }

  /* Plat bertali: dari pin di titik label ke posisi gantung (satuan peta). */
  function platBertali(peta, w, posGantung, warna) {
    var lp = peta.P(w.label), awal = w.jenis === 'kota' ? 'Kota' : 'Kab.';
    var lebar = Math.max(110, Math.round(Math.max(w.nama.length, 4) * 11.6 + 40)), tinggi = 56, g = '';
    if (posGantung) {
      /* plat digantung di tempat lapang (biasanya laut), tali dari pin di titik label */
      var gp = peta.P(posGantung), atas = gp[1] - tinggi / 2;
      g += '<path d="M' + n(lp[0]) + ' ' + n(lp[1]) + 'Q' + n((lp[0] + gp[0]) / 2 + 10) + ' ' + n((lp[1] + atas) / 2) + ' ' + n(gp[0]) + ' ' + n(atas + 7) + '" stroke="' + W.tinta + '" stroke-width="2.6" fill="none"/>';
      g += bentukPlat(gp[0], atas, lebar, tinggi, warna, awal, w.nama);
      g += pin(lp[0], lp[1]);
    } else {
      /* wilayah besar: plat tergantung langsung di bawah pin */
      g += bentukPlat(lp[0], lp[1] - 4, lebar, tinggi, warna, awal, w.nama);
      g += pin(lp[0], lp[1] - 1);
    }
    return g;
  }
  /* Garis bantu 8 arah dari titik acuan, dengan sektor sorot */
  function garisBantu(x, y, panjang, sorot) {
    var g = '';
    if (sorot !== undefined) {
      var a1 = (sorot * 45 - 22.5) * Math.PI / 180, a2 = (sorot * 45 + 22.5) * Math.PI / 180;
      g += '<path d="M' + n(x) + ' ' + n(y) + 'L' + n(x + Math.sin(a1) * panjang) + ' ' + n(y - Math.cos(a1) * panjang) + 'A' + panjang + ' ' + panjang + ' 0 0 1 ' + n(x + Math.sin(a2) * panjang) + ' ' + n(y - Math.cos(a2) * panjang) + 'Z" fill="' + W.jingga + '" fill-opacity=".28" stroke="' + W.jingga + '" stroke-width="2.5"/>';
    }
    for (var k = 0; k < 8; k++) {
      var a = k * Math.PI / 4;
      g += '<path d="M' + n(x) + ' ' + n(y) + 'L' + n(x + Math.sin(a) * panjang) + ' ' + n(y - Math.cos(a) * panjang) + '" stroke="' + (k === sorot ? W.jinggaGelap : W.tinta) + '" stroke-opacity="' + (k === sorot ? 1 : 0.45) + '" stroke-width="' + (k === sorot ? 4 : 2.5) + '" stroke-dasharray="' + (k % 2 ? '4 7' : '10 6') + '" stroke-linecap="round"/>';
    }
    return g;
  }

  /* ---------- Tangan penunjuk (ujung telunjuk di titik asal) ---------- */
  function tangan(x, y, s, rot, kelas) {
    return '<g class="' + (kelas || '') + '"><g transform="translate(' + n(x) + ' ' + n(y) + ') rotate(' + (rot || 0) + ') scale(' + s + ')">' +
      '<path d="M-6 2V-2Q-6-10 0-10Q6-10 6-2V26Q10 22 16 24Q22 26 22 32Q26 28 32 31Q38 34 37 41Q42 40 45 45Q48 50 46 60Q44 76 34 86H4Q-8 76-16 62L-26 44Q-30 36-24 33Q-18 30-12 36L-6 44Z" transform="translate(0 10)" fill="' + W.tinta + '" opacity=".25"/>' +
      '<path d="M-6 2V-2Q-6-10 0-10Q6-10 6-2V26Q10 22 16 24Q22 26 22 32Q26 28 32 31Q38 34 37 41Q42 40 45 45Q48 50 46 60Q44 76 34 86H4Q-8 76-16 62L-26 44Q-30 36-24 33Q-18 30-12 36L-6 44Z" fill="#FFFFFF"' + GARIS + ' stroke-width="4"/>' +
      '<path d="M6 26V40M22 32V42M37 41V48" stroke="' + W.tinta + '" stroke-width="3" stroke-linecap="round"/>' +
      '<path d="M4 86H34V96H4Z" fill="' + W.jingga + '"' + GARIS + ' stroke-width="4"/></g></g>';
  }

  /* ---------- Cap Kantor Peta ---------- */
  function cap(x, y, r, rot) {
    var id = 'cap-' + Math.round(x) + '-' + Math.round(y);
    return '<g transform="translate(' + n(x) + ' ' + n(y) + ') rotate(' + (rot || -12) + ')" opacity=".92">' +
      '<defs><path id="' + id + '" d="M' + (-r * 0.72) + ' 0A' + (r * 0.72) + ' ' + (r * 0.72) + ' 0 1 1 ' + (r * 0.72) + ' 0"/></defs>' +
      '<circle r="' + r + '" fill="' + W.kertas + '" fill-opacity=".6" stroke="' + W.cokelat + '" stroke-width="6"/>' +
      '<circle r="' + n(r * 0.56) + '" fill="none" stroke="' + W.cokelat + '" stroke-width="3"/>' +
      '<text font-family="Fredoka, Arial, sans-serif" font-weight="700" font-size="' + n(r * 0.22) + '" fill="' + W.cokelat + '" letter-spacing="2"><textPath href="#' + id + '" startOffset="50%" text-anchor="middle">KANTOR PETA</textPath></text>' +
      '<path d="' + bintangPath(0, -r * 0.18, r * 0.2, r * 0.09) + '" fill="' + W.cokelat + '"/>' +
      teks(0, r * 0.2, 'LENGKAP', { judul: true, ukuran: Math.max(14, Math.round(r * 0.19)), warna: W.cokelat, maxw: Math.round(r * 1.06) }) + '</g>';
  }

  /* ---------- Logo dan pita ---------- */
  function logo(x, y) {
    var g = '<g transform="translate(' + x + ' ' + y + ')">';
    /* gulungan kertas peta */
    g += '<path d="M24 14H500Q520 14 520 34V262Q520 282 500 282H24Q4 282 4 262V34Q4 14 24 14Z" transform="translate(0 8)" fill="' + W.tinta + '" opacity=".28"/>';
    g += '<path d="M24 14H500Q520 14 520 34V262Q520 282 500 282H24Q4 282 4 262V34Q4 14 24 14Z" fill="' + W.kertas + '" stroke="' + W.tinta + '" stroke-width="5"/>';
    g += '<path d="M24 30H500M24 266H500" stroke="' + W.biru + '" stroke-width="2.5" stroke-dasharray="2 8" stroke-linecap="round"/>';
    g += '<path d="M-6 6Q-18 40-4 74Q8 40-6 6Z" fill="' + W.pasir + '"' + GARIS + ' stroke-width="4" transform="translate(10 -2)"/>';
    g += '<path d="M530 222Q542 256 528 290Q516 256 530 222Z" fill="' + W.pasir + '"' + GARIS + ' stroke-width="4" transform="translate(-10 0)"/>';
    g += teks(262, 130, 'JURU PETA', { judul: true, ukuran: 84, spasi: 2, maxw: 470 });
    g += teks(250, 240, 'MUDA', { judul: true, ukuran: 112, warna: W.jingga, garis: W.tinta, tebalGaris: 12, spasi: 6, maxw: 400 });
    g += mawarAngin(462, 212, 30, { label8: false }).replace(/<text[^>]*>[^<]*<\/text>/g, '');
    return g + '</g>';
  }
  function pita(x, y, w, h, t) {
    var g = '<path d="M' + (x - 26) + ' ' + (y + 12) + 'H' + (x + 10) + 'V' + (y + h + 12) + 'H' + (x - 26) + 'L' + (x - 10) + ' ' + (y + h / 2 + 12) + 'Z" fill="' + W.biruGelap + '"' + GARIS + ' stroke-width="4"/>';
    g += '<path d="M' + (x + w + 26) + ' ' + (y + 12) + 'H' + (x + w - 10) + 'V' + (y + h + 12) + 'H' + (x + w + 26) + 'L' + (x + w + 10) + ' ' + (y + h / 2 + 12) + 'Z" fill="' + W.biruGelap + '"' + GARIS + ' stroke-width="4"/>';
    g += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="6" fill="' + W.biru + '"' + GARIS + ' stroke-width="4"/>';
    g += teks(x + w / 2, y + h / 2 + 11, t, { judul: true, ukuran: 32, warna: W.kertas, maxw: w - 30 });
    return g;
  }

  /* ---------- Desa Lang dari atas (L1, hook): ikon tempat berpusat di (0,0), kotak sekitar 120 x 120 ---------- */
  var ATAP = ['#D9733F', W.cokelat, '#8F4A2A', W.biru];
  function bayang(isi, dx, dy) { return '<g transform="translate(' + (dx || 6) + ' ' + (dy || 7) + ')" opacity=".16">' + isi.replace(/fill="[^"]*"/g, 'fill="' + W.tinta + '"').replace(/stroke="[^"]*"/g, 'stroke="none"') + '</g>'; }
  function tempat(id) {
    var s = GARIS + ' stroke-width="3.5"', g = '';
    switch (id) {
      case 'pohon': {
        var tajuk = '<circle r="50" fill="' + W.hijau + '"' + s + '/>';
        g += bayang(tajuk, 7, 9) + tajuk;
        [[-20, -18, 17], [17, -22, 15], [-22, 17, 15], [19, 15, 17], [0, 26, 12]].forEach(function (c) { g += '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + c[2] + '" fill="#8ACB79"/>'; });
        [[-30, -2, 6], [30, -4, 5], [8, 38, 5]].forEach(function (c) { g += '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + c[2] + '" fill="' + W.hijauGelap + '" opacity=".6"/>'; });
        g += '<ellipse cx="0" cy="-2" rx="23" ry="17" fill="' + W.cokelat + '"' + s + '/><ellipse cx="0" cy="-3" rx="14" ry="9" fill="' + W.cokelatGelap + '"/>';
        g += '<path d="M-24-6l-8-3M22-8l9-4M-18 12l-7 6M20 10l8 5" stroke="' + W.cokelatGelap + '" stroke-width="3" stroke-linecap="round"/>';
        g += '<ellipse cx="-5" cy="-4" rx="5" ry="4" fill="' + W.kertas + '" stroke="' + W.tinta + '" stroke-width="2"/><ellipse cx="5" cy="-2" rx="5" ry="4" fill="' + W.kertas + '" stroke="' + W.tinta + '" stroke-width="2"/>';
        break;
      }
      case 'pasar': {
        var alas = '<rect x="-58" y="-46" width="116" height="92" rx="14" fill="' + W.pasirTerang + '"' + s + '/>';
        g += bayang(alas) + alas;
        [[W.jingga, -38], [W.laut, 0], [W.hijau, 38]].forEach(function (t) {
          var x = t[1] - 16;
          g += '<rect x="' + x + '" y="-36" width="32" height="58" rx="4" fill="' + W.kertas + '"' + GARIS + ' stroke-width="3"/>';
          for (var i = 0; i < 4; i += 2) g += '<rect x="' + (x + 1.5 + i * 8) + '" y="-34.5" width="8" height="55" fill="' + t[0] + '"/>';
          g += '<rect x="' + (x + 25.5) + '" y="-34.5" width="5" height="55" fill="' + t[0] + '"/>';
          g += '<path d="M' + t[1] + ' -36V22" stroke="' + W.tinta + '" stroke-width="2.5"/><rect x="' + x + '" y="-36" width="32" height="58" rx="4" fill="none"' + GARIS + ' stroke-width="3"/>';
        });
        [[-40, 34], [-26, 36], [26, 35], [40, 33]].forEach(function (c, i) { g += '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="5" fill="' + [W.jingga, W.hijau, '#E0453A', W.pasirGelap][i] + '" stroke="' + W.tinta + '" stroke-width="2"/>'; });
        break;
      }
      case 'sekolah': {
        var halaman = '<rect x="-58" y="-50" width="116" height="100" rx="12" fill="#E9DDB0"' + s + '/>';
        g += bayang(halaman) + halaman;
        g += '<path d="M-50-40H44V-2H14V40H-16V-2H-50Z" fill="#C9653A"' + s + '/>';
        g += '<path d="M-46-21H40M-1-21V36" stroke="' + W.tinta + '" stroke-width="3"/>';
        g += '<path d="M-38-36v9M-26-36v9M-14-36v9M10-36v9M22-36v9M34-36v9M-38-15v8M-26-15v8M22-15v8M34-15v8" stroke="#8F3F22" stroke-width="2.5" stroke-linecap="round"/>';
        g += '<path d="M-38 10V44" stroke="' + W.tinta + '" stroke-width="3.5" stroke-linecap="round"/><path d="M-38 10h22v7h-22z" fill="#E0453A" stroke="' + W.tinta + '" stroke-width="2.5"/><path d="M-38 17h22v7h-22z" fill="#FFFFFF" stroke="' + W.tinta + '" stroke-width="2.5"/>';
        break;
      }
      case 'sawah': {
        var bidang = '<rect x="-58" y="-46" width="116" height="92" rx="10" fill="' + W.hijau + '"' + s + '/>';
        g += bayang(bidang) + bidang;
        g += '<path d="M-58 0H58M4-46V46" stroke="' + W.laut + '" stroke-width="8"/><path d="M-58 0H58M4-46V46" stroke="' + W.tinta + '" stroke-width="1.5" stroke-dasharray="5 7" opacity=".4"/>';
        for (var r = -40; r < 46; r += 9) { if (Math.abs(r) < 6) continue; g += '<path d="M-52 ' + r + 'H-4M12 ' + r + 'H52" stroke="' + W.hijauGelap + '" stroke-width="2.5" stroke-linecap="round" opacity=".7"/>'; }
        g += '<rect x="22" y="-40" width="26" height="20" rx="3" fill="' + W.cokelat + '"' + GARIS + ' stroke-width="3"/><path d="M22-30H48" stroke="' + W.tinta + '" stroke-width="2.5"/>';
        g += '<rect x="-58" y="-46" width="116" height="92" rx="10" fill="none"' + s + '/>';
        break;
      }
      case 'kolam': {
        var air = '<path d="M-52-6Q-56-40-20-44Q14-50 40-36Q60-22 54 8Q50 40 14 44Q-26 50-46 28Q-54 16-52-6Z" fill="' + W.laut + '"' + s + '/>';
        g += bayang(air) + air;
        g += '<path d="M-38-6Q-40-30-14-32Q14-36 34-24" stroke="#FFFFFF" stroke-width="4" fill="none" stroke-linecap="round" opacity=".6"/>';
        [[-24, 18, 11], [28, -14, 9], [22, 26, 8]].forEach(function (c) { g += '<path d="M' + c[0] + ' ' + c[1] + 'm' + c[2] + ' 0a' + c[2] + ' ' + c[2] + ' 0 1 1 -3 -7l-' + (c[2] - 3) + ' 7z" fill="' + W.hijau + '" stroke="' + W.tinta + '" stroke-width="2.5" stroke-linejoin="round"/>'; });
        g += '<path d="M-6 4q12-9 22 0q-10 9-22 0zM16 4l8-6v12z" fill="' + W.jingga + '" stroke="' + W.tinta + '" stroke-width="2.5" stroke-linejoin="round"/><circle cx="-1" cy="2" r="1.6" fill="' + W.tinta + '"/>';
        break;
      }
      case 'puskesmas': {
        var hal = '<rect x="-58" y="-48" width="116" height="96" rx="12" fill="' + W.pasirTerang + '"' + s + '/>';
        g += bayang(hal) + hal;
        g += '<rect x="-46" y="-36" width="92" height="62" rx="6" fill="#DCE8EC"' + s + '/><path d="M-46-5H46" stroke="' + W.tinta + '" stroke-width="2.5" opacity=".5"/>';
        g += '<circle cx="0" cy="-5" r="18" fill="' + W.kertas + '"' + s + '/><path d="M-4-17h8v8h8v8h-8v8h-8v-8h-8v-8h8z" fill="' + W.hijau + '" stroke="' + W.tinta + '" stroke-width="2.5" stroke-linejoin="round"/>';
        g += '<rect x="-40" y="32" width="24" height="10" rx="3" fill="' + W.kertasGelap + '" stroke="' + W.tinta + '" stroke-width="2"/><rect x="16" y="32" width="24" height="10" rx="3" fill="' + W.kertasGelap + '" stroke="' + W.tinta + '" stroke-width="2"/>';
        break;
      }
      case 'lapangan': {
        var rumput = '<rect x="-60" y="-42" width="120" height="84" rx="8" fill="#76C068"' + s + '/>';
        g += bayang(rumput) + rumput;
        for (var k = -48; k < 50; k += 24) g += '<rect x="' + k + '" y="-38" width="12" height="76" fill="#88CC7A"/>';
        var p = ' fill="none" stroke="#FFFFFF" stroke-width="3"';
        g += '<rect x="-52" y="-34" width="104" height="68"' + p + '/><path d="M0-34V34"' + p + '/><circle r="12"' + p + '/><rect x="-52" y="-16" width="16" height="32"' + p + '/><rect x="36" y="-16" width="16" height="32"' + p + '/>';
        g += '<rect x="-58" y="-8" width="6" height="16" fill="#FFFFFF" stroke="' + W.tinta + '" stroke-width="2"/><rect x="52" y="-8" width="6" height="16" fill="#FFFFFF" stroke="' + W.tinta + '" stroke-width="2"/>';
        g += '<rect x="-60" y="-42" width="120" height="84" rx="8" fill="none"' + s + '/>';
        break;
      }
      case 'balai': {
        var lantai = '<rect x="-54" y="-54" width="108" height="108" rx="10" fill="' + W.pasir + '"' + s + '/>';
        g += bayang(lantai) + lantai;
        g += '<path d="M-44-44H44V44H-44Z" fill="' + W.cokelat + '"' + s + '/><path d="M-22-22H22V22H-22Z" fill="' + W.cokelatGelap + '"' + s + '/>';
        g += '<path d="M-44-44L-22-22M44-44L22-22M44 44L22 22M-44 44L-22 22" stroke="' + W.tinta + '" stroke-width="3"/>';
        g += '<path d="M-36-30H36M-36 30H36M-30-36V36M30-36V36" stroke="#D99A5E" stroke-width="2" opacity=".55"/>';
        g += '<rect x="-8" y="-8" width="16" height="16" rx="2" fill="' + W.jingga + '" stroke="' + W.tinta + '" stroke-width="2.5"/>';
        break;
      }
      case 'tugu': {
        var plaza = '<circle r="42" fill="' + W.pasirTerang + '"' + s + '/>';
        g += bayang(plaza) + plaza;
        g += '<circle r="32" fill="none" stroke="' + W.pasirGelap + '" stroke-width="3" stroke-dasharray="4 6"/>';
        g += '<rect x="-18" y="-18" width="36" height="36" rx="3" fill="' + W.kertasGelap + '"' + s + '/>';
        g += '<path d="M-12-12L0 0L12-12Z" fill="' + W.laut + '"/><path d="M12-12L0 0L12 12Z" fill="' + W.biru + '"/><path d="M12 12L0 0L-12 12Z" fill="' + W.biruGelap + '"/><path d="M-12 12L0 0L-12-12Z" fill="' + W.lautTerang + '"/>';
        g += '<path d="M-12-12H12V12H-12ZM-12-12L12 12M12-12L-12 12" fill="none" stroke="' + W.tinta + '" stroke-width="2.5" stroke-linejoin="round"/>';
        break;
      }
    }
    return g;
  }
  function rumah(x, y, w, rot) {
    var c = ATAP[w % ATAP.length], isi = '<rect x="-16" y="-12" width="32" height="24" rx="3" fill="' + c + '"' + GARIS + ' stroke-width="2.6"/>';
    return '<g transform="translate(' + x + ' ' + y + ') rotate(' + (rot || 0) + ')">' + '<rect x="-12" y="-6" width="32" height="24" rx="3" fill="' + W.tinta + '" opacity=".14"/>' + isi + '<path d="M-14 0H14" stroke="' + W.tinta + '" stroke-width="2"/><path d="M-10-6V6M10-6V6" stroke="' + W.tinta + '" stroke-width="1.4" opacity=".35"/></g>';
  }
  function pohonKecil(x, y, r) {
    return '<circle cx="' + (x + 4) + '" cy="' + (y + 6) + '" r="' + r + '" fill="' + W.tinta + '" opacity=".14"/><circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + W.hijau + '"' + GARIS + ' stroke-width="2.6"/>' +
      '<circle cx="' + n(x - r * 0.3) + '" cy="' + n(y - r * 0.3) + '" r="' + n(r * 0.42) + '" fill="#8ACB79"/>';
  }
  function matahari(x, y, r, kelas) {
    var g = '<g class="' + (kelas || '') + '"><circle cx="' + x + '" cy="' + y + '" r="' + (r + 10) + '" fill="' + W.jinggaTerang + '" opacity=".55"/>';
    for (var i = 0; i < 8; i++) { var a = i * Math.PI / 4; g += '<path d="M' + n(x + Math.cos(a) * (r + 6)) + ' ' + n(y + Math.sin(a) * (r + 6)) + 'L' + n(x + Math.cos(a) * (r + 16)) + ' ' + n(y + Math.sin(a) * (r + 16)) + '" stroke="' + W.jinggaGelap + '" stroke-width="4" stroke-linecap="round"/>'; }
    return g + '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + W.jingga + '"' + GARIS + ' stroke-width="3"/></g>';
  }
  /* Latar diam Desa Lang (tanah, sungai, jalan dari tugu, rumah, pohon, matahari terbit di timur). Dipanggang menjadi gambar. */
  function desaAtas(D) {
    var w = D.ukuran[0], h = D.ukuran[1], tugu = D.tempat[0].titik, g = '';
    g += '<rect width="' + w + '" height="' + h + '" rx="8" fill="#CFE6B8"/>';
    for (var i = 0; i < 90; i++) { var x = (i * 97) % w, y = (i * 61 + (i % 7) * 23) % h; g += '<path d="M' + x + ' ' + y + 'l3-6l3 6" stroke="#A9D497" stroke-width="2" fill="none" stroke-linecap="round"/>'; }
    var dS = D.sungai.map(function (p, k) { return (k ? 'L' : 'M') + p[0] + ' ' + p[1]; }).join('');
    g += '<path d="' + dS + '" stroke="' + W.tinta + '" stroke-width="34" fill="none" stroke-linejoin="round" stroke-linecap="round"/><path d="' + dS + '" stroke="' + W.laut + '" stroke-width="27" fill="none" stroke-linejoin="round" stroke-linecap="round"/>';
    g += '<path d="' + dS + '" stroke="#FFFFFF" stroke-width="3" fill="none" stroke-dasharray="3 14" stroke-linecap="round" opacity=".7"/>';
    var jalan = '';
    D.tempat.slice(1).forEach(function (t) { jalan += 'M' + tugu[0] + ' ' + tugu[1] + 'L' + t.titik[0] + ' ' + t.titik[1]; });
    g += '<path d="' + jalan + '" stroke="' + W.tinta + '" stroke-width="21" stroke-linecap="round" opacity=".85"/><path d="' + jalan + '" stroke="#EBD9A4" stroke-width="15" stroke-linecap="round"/>';
    g += '<path d="' + jalan + '" stroke="#D9C083" stroke-width="2" stroke-dasharray="6 10" stroke-linecap="round"/>';
    D.rumah.forEach(function (r) { g += rumah(r[0], r[1], r[2], r[3]); });
    D.pohon.forEach(function (p) { g += pohonKecil(p[0], p[1], p[2]); });
    g += matahari(D.matahari[0], D.matahari[1], 18);
    return g;
  }

  /* ---------- Desa dari samping (hook): kanvas 1280 x 720, pohon sarang di tengah ---------- */
  function rumahSamping(x, y, w, h, dinding, atap) {
    var g = '<rect x="' + (x + 8) + '" y="' + (y + 8) + '" width="' + w + '" height="' + h + '" fill="' + W.tinta + '" opacity=".12"/>';
    g += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + dinding + '"' + GARIS + ' stroke-width="4"/>';
    g += '<path d="M' + (x - 18) + ' ' + y + 'L' + (x + w / 2) + ' ' + (y - h * 0.72) + 'L' + (x + w + 18) + ' ' + y + 'Z" fill="' + atap + '"' + GARIS + ' stroke-width="4"/>';
    g += '<path d="M' + (x - 6) + ' ' + (y - 10) + 'L' + (x + w / 2) + ' ' + (y - h * 0.6) + '" stroke="#FFFFFF" stroke-width="3" opacity=".35" stroke-linecap="round"/>';
    g += '<rect x="' + (x + w / 2 - 14) + '" y="' + (y + h - 46) + '" width="28" height="46" rx="3" fill="' + W.cokelat + '"' + GARIS + ' stroke-width="3"/>';
    g += '<rect x="' + (x + 12) + '" y="' + (y + 18) + '" width="24" height="22" rx="3" fill="' + W.lautTerang + '"' + GARIS + ' stroke-width="3"/><rect x="' + (x + w - 36) + '" y="' + (y + 18) + '" width="24" height="22" rx="3" fill="' + W.lautTerang + '"' + GARIS + ' stroke-width="3"/>';
    return g;
  }
  function kelapa(x, y, tinggi, miring) {
    var tx = x + miring, ty = y - tinggi, g = '<path d="M' + x + ' ' + y + 'Q' + (x + miring * 0.2) + ' ' + (y - tinggi * 0.6) + ' ' + tx + ' ' + ty + '" stroke="' + W.tinta + '" stroke-width="16" fill="none" stroke-linecap="round"/>';
    g += '<path d="M' + x + ' ' + y + 'Q' + (x + miring * 0.2) + ' ' + (y - tinggi * 0.6) + ' ' + tx + ' ' + ty + '" stroke="' + W.cokelat + '" stroke-width="10" fill="none" stroke-linecap="round"/>';
    [[-70, 18], [-40, -22], [0, -34], [40, -22], [70, 18]].forEach(function (d) {
      g += '<path d="M' + tx + ' ' + ty + 'Q' + (tx + d[0] * 0.5) + ' ' + (ty + d[1] - 22) + ' ' + (tx + d[0]) + ' ' + (ty + d[1] + 10) + 'Q' + (tx + d[0] * 0.45) + ' ' + (ty + d[1] - 6) + ' ' + tx + ' ' + ty + 'Z" fill="' + W.hijau + '"' + GARIS + ' stroke-width="3"/>';
    });
    return g + '<circle cx="' + tx + '" cy="' + (ty + 6) + '" r="7" fill="' + W.cokelatGelap + '" stroke="' + W.tinta + '" stroke-width="2.5"/>';
  }
  function desaSamping() {
    var g = '<rect width="1280" height="720" fill="' + W.laut + '"/>';
    g += matahari(1080, 120, 40) + awan(250, 120, 1, 'awan-a') + awan(820, 96, 0.8, 'awan-b');
    g += '<path d="M0 470Q140 380 300 440T620 420T940 440T1280 410V720H0Z" fill="#B7DCA8"' + GARIS + ' stroke-width="4"/>';
    g += '<path d="M0 530Q200 470 420 520T860 500T1280 520V720H0Z" fill="#9CD08A"' + GARIS + ' stroke-width="4"/>';
    g += '<rect y="600" width="1280" height="120" fill="#8DC77B"/><path d="M0 600H1280" stroke="' + W.tinta + '" stroke-width="4"/>';
    g += '<path d="M0 636H1280V676H0Z" fill="#EBD9A4"/><path d="M0 636H1280M0 676H1280" stroke="' + W.tinta + '" stroke-width="3" opacity=".6"/>';
    g += kelapa(70, 610, 230, 30) + kelapa(1220, 610, 250, -36);
    g += rumahSamping(150, 500, 150, 100, W.kertas, W.cokelat) + rumahSamping(340, 520, 120, 80, W.jinggaTerang, '#8F4A2A');
    g += rumahSamping(790, 516, 130, 84, W.pasirTerang, '#D9733F') + rumahSamping(980, 500, 150, 100, W.lautTerang, W.cokelat);
    /* pohon sarang besar */
    g += '<path d="M612 610Q600 470 616 330M648 610Q660 470 644 330" stroke="' + W.tinta + '" stroke-width="5" fill="' + W.cokelat + '"/><path d="M612 610Q600 470 616 330L644 330Q660 470 648 610Z" fill="' + W.cokelat + '"' + GARIS + ' stroke-width="4"/>';
    g += '<path d="M616 420Q570 400 548 360M644 400Q690 380 712 344" stroke="' + W.tinta + '" stroke-width="14" stroke-linecap="round" fill="none"/><path d="M616 420Q570 400 548 360M644 400Q690 380 712 344" stroke="' + W.cokelat + '" stroke-width="8" stroke-linecap="round" fill="none"/>';
    g += '<path d="M480 300Q470 220 540 196Q560 140 630 150Q700 130 734 190Q800 210 790 280Q810 340 740 352Q700 380 630 366Q560 384 520 352Q470 340 480 300Z" fill="' + W.hijau + '"' + GARIS + ' stroke-width="4"/>';
    [[540, 250, 26], [612, 206, 24], [690, 232, 28], [742, 296, 20], [560, 320, 20], [660, 318, 22]].forEach(function (c) { g += '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + c[2] + '" fill="#8ACB79"/>'; });
    g += '<ellipse cx="630" cy="168" rx="40" ry="16" fill="' + W.cokelat + '"' + GARIS + ' stroke-width="3.5"/><path d="M596 162l-12-6M664 160l12-7M606 176l-10 6M656 176l10 6" stroke="' + W.cokelatGelap + '" stroke-width="3" stroke-linecap="round"/>';
    for (var x = 30; x < 1280; x += 64) { if (x > 560 && x < 700) continue; g += '<path d="M' + x + ' 612V590" stroke="' + W.tinta + '" stroke-width="5" stroke-linecap="round"/><path d="M' + x + ' 612V592" stroke="' + W.kertas + '" stroke-width="2" stroke-linecap="round"/>'; }
    g += '<path d="M0 598H1280" stroke="' + W.tinta + '" stroke-width="3" opacity=".35"/>';
    return g;
  }

  /* ---------- Kantor Peta (Pilih Level, Hasil Belajarku): dinding, jendela laut, rak gulungan peta, meja. dekor = jumlah level selesai ---------- */
  function kantorPeta(o) {
    o = o || {};
    var d = o.dekor || 0, g = '<rect width="1280" height="720" fill="' + W.pasirTerang + '"/>';
    for (var x = 0; x < 1280; x += 56) g += '<rect x="' + x + '" width="28" height="560" fill="#FFFFFF" opacity=".28"/>';
    g += '<rect y="556" width="1280" height="164" fill="' + W.cokelat + '"/><path d="M0 556H1280" stroke="' + W.tinta + '" stroke-width="5"/>';
    for (var p = 20; p < 1280; p += 160) g += '<rect x="' + p + '" y="580" width="128" height="118" rx="8" fill="none" stroke="' + W.cokelatGelap + '" stroke-width="4"/>';
    /* jendela ke laut */
    g += '<rect x="46" y="64" width="300" height="230" rx="12" fill="' + W.cokelat + '"' + GARIS + ' stroke-width="5"/><rect x="62" y="80" width="268" height="198" rx="6" fill="' + W.laut + '"' + GARIS + ' stroke-width="3"/>';
    g += '<rect x="62" y="80" width="268" height="198" fill="url(#pola-laut)"/><path d="M100 236Q150 200 200 214Q250 196 300 226L306 260H96Z" fill="' + ISI.hijau + '"' + GARIS + ' stroke-width="3"/>';
    g += awan(150, 122, 0.45) + '<path d="M196 80V278M62 179H330" stroke="' + W.cokelat + '" stroke-width="10"/><path d="M196 80V278M62 179H330" stroke="' + W.tinta + '" stroke-width="2" opacity=".4"/>';
    /* rak gulungan peta */
    g += '<rect x="40" y="356" width="320" height="16" rx="4" fill="' + W.cokelatGelap + '"' + GARIS + ' stroke-width="3"/>';
    [[110, 338, W.kertas], [172, 338, W.pasir], [141, 314, W.lautTerang]].forEach(function (r) {
      g += '<rect x="' + (r[0] - 46) + '" y="' + (r[1] - 12) + '" width="92" height="24" rx="12" fill="' + r[2] + '"' + GARIS + ' stroke-width="3"/>';
      g += '<ellipse cx="' + (r[0] + 40) + '" cy="' + r[1] + '" rx="7" ry="11" fill="' + W.pasirTerang + '" stroke="' + W.tinta + '" stroke-width="2.5"/><path d="M' + (r[0] + 40) + ' ' + (r[1] - 5) + 'a4 5 0 1 1 -1 9" stroke="' + W.pasirGelap + '" stroke-width="2" fill="none"/>';
      g += '<path d="M' + (r[0] - 20) + ' ' + (r[1] - 12) + 'v24" stroke="' + W.cokelat + '" stroke-width="4"/>';
    });
    if (d >= 2) g += '<circle cx="300" cy="312" r="34" fill="' + W.laut + '"' + GARIS + ' stroke-width="4"/><path d="M276 296q14 6 20-6q10 4 6 16q-12 6-6 18q-14 4-22-10z" fill="' + W.hijau + '" stroke="' + W.tinta + '" stroke-width="2.5"/><path d="M262 312a38 38 0 0 0 76 0" fill="none" stroke="' + W.jinggaGelap + '" stroke-width="5"/><path d="M300 346v8" stroke="' + W.tinta + '" stroke-width="5"/>';
    /* meja peta */
    g += '<rect x="24" y="470" width="500" height="34" rx="8" fill="#A65A2A"' + GARIS + ' stroke-width="4"/><path d="M56 504V556M492 504V556" stroke="' + W.tinta + '" stroke-width="12"/><path d="M56 504V556M492 504V556" stroke="#A65A2A" stroke-width="7"/>';
    g += '<path d="M70 470L96 420H330L360 470Z" fill="' + W.kertas + '"' + GARIS + ' stroke-width="3.5"/><path d="M130 456Q170 430 220 446Q270 430 300 452" stroke="' + W.biru + '" stroke-width="3" fill="none" stroke-dasharray="6 6"/>';
    if (d >= 1) g += mawarAngin(430, 430, 34, { label8: false }).replace(/<text[^>]*>[^<]*<\/text>/g, '');
    if (d >= 3) g += '<g transform="translate(200 452) rotate(-12)"><rect x="-40" y="-9" width="56" height="18" rx="5" fill="' + W.cokelat + '" stroke="' + W.tinta + '" stroke-width="3"/><rect x="12" y="-12" width="30" height="24" rx="5" fill="' + W.jinggaGelap + '" stroke="' + W.tinta + '" stroke-width="3"/></g>';
    if (d >= 4) g += '<path d="M60 408h60l-8 14H68z" fill="' + W.cokelat + '" stroke="' + W.tinta + '" stroke-width="3" stroke-linejoin="round"/><path d="M90 408V366M92 368q20 12 18 38H92zM88 372q-16 10-17 34h17z" fill="' + W.kertas + '" stroke="' + W.tinta + '" stroke-width="3" stroke-linejoin="round"/>';
    if (d >= 5) g += '<rect x="380" y="64" width="150" height="110" rx="8" fill="' + W.jinggaGelap + '"' + GARIS + ' stroke-width="4"/><rect x="392" y="76" width="126" height="86" rx="4" fill="' + W.laut + '" stroke="' + W.tinta + '" stroke-width="2.5"/><path d="M402 108q18-8 30 4q10 12-6 14zM438 96q16 2 22 14l-10 6zM466 120q12-10 24 0q-4 12-18 10zM490 100q10 4 18 14q-8 4-14 0z" fill="' + ISI.hijau + '" stroke="' + W.tinta + '" stroke-width="2"/>';
    return g;
  }

  /* ---------- Bantu ---------- */
  function gambar(k) { var A = window.ASET && window.ASET.gambar; return A ? A[k] || null : null; }
  /* Lapisan diam dipanggang sekali menjadi gambar (string SVG ke data URI). Teks tidak boleh ada di lapisan ini (huruf luar tidak dimuat). */
  var panggangan = {};
  function panggang(kunci, w, h, isi) {
    return new Promise(function (ok) {
      var im = new Image();
      im.onload = function () { panggangan[kunci] = im.src; ok(im.src); };
      im.onerror = function () { panggangan[kunci] = null; ok(null); };
      im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg(w, h, isi));
    });
  }
  function hasilPanggang(kunci) { return panggangan[kunci] || null; }
  /* lapisan siap pakai: gambar panggangan bila ada, SVG hidup bila tidak */
  function lapisDiam(kunci, w, h, isi) {
    var src = panggangan[kunci];
    return src ? '<img class="lapis-gambar" alt="" draggable="false" src="' + src + '" style="width:' + w + 'px;height:' + h + 'px">' : svg(w, h, isi);
  }

  return {
    W: W, ISI: ISI, ARAH: ARAH, SINGKAT: SINGKAT, svg: svg, g: g, defs: defs, teks: teks, ikon: ikon, koinIsi: koinIsi,
    awan: awan, perahu: perahu, ombak: ombak, burung: burung, gunung: gunung, ibuKota: ibuKota, bintangPath: bintangPath,
    mawarAngin: mawarAngin, kompasMini: kompasMini, lang: lang, potretLang: potretLang, potret: potretLang, juruPeta: juruPeta,
    bentukPlat: bentukPlat, bentukKartu: bentukKartu, pinKosong: pinKosong, pin: pin,
    petaDari: petaDari, platBertali: platBertali, garisBantu: garisBantu, tangan: tangan, cap: cap, logo: logo, pita: pita,
    tempat: tempat, rumah: rumah, pohonKecil: pohonKecil, matahari: matahari, desaAtas: desaAtas, desaSamping: desaSamping, kantorPeta: kantorPeta,
    gambar: gambar, panggang: panggang, hasilPanggang: hasilPanggang, lapisDiam: lapisDiam
  };
})();
