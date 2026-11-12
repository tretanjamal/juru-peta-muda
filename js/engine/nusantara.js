/* L6 Jelajah Nusantara (GDD bagian 9, TAMBAHAN): petunjuk "Provinsi ini ada di {pulau}, di sebelah {arah} Provinsi {R}".
   Arah antarprovinsi dihitung dari sebaran luas provinsi tujuan (sampel kisi di dalam poligon detail kasar), dilihat dari titik label
   provinsi acuan, dengan aturan jelas yang sama seperti teka-teki: sektor arah, minimal 10 derajat dari batas sektor, minimal 80% luas
   di sektor yang diperlebar, dan bentang di bawah 270 derajat. Petunjuk sah bila provinsi tujuan satu-satunya yang 'ya' di arah itu
   dan semua provinsi lain di kelompok pulau yang sama 'tidak'. Dipakai di peramban (window.Nusantara) dan Node (uji logika). */
(function (root) {
  var A = root.Arah || (typeof require !== 'undefined' ? require('./arah.js') : null);
  var Nama = root.Nama || (typeof require !== 'undefined' ? require('./nama.js') : null);
  var BUKAN_SASARAN = ['31'];   /* DKI Jakarta terlalu kecil untuk diketuk di peta Indonesia; tetap boleh menjadi acuan */
  function urai(arcs) { return arcs.map(function (a) { var x = 0, y = 0; return a.map(function (p) { x += p[0]; y += p[1]; return [x, y]; }); }); }
  function cincin(arcs, r) { var pts = []; r.forEach(function (i) { var t = i < 0 ? arcs[~i].slice().reverse() : arcs[i]; pts = pts.concat(pts.length ? t.slice(1) : t); }); return pts; }
  function dalam(pt, p) {
    var c = false;
    for (var i = 0, j = p.length - 1; i < p.length; j = i++)
      if (((p[i][1] > pt[1]) !== (p[j][1] > pt[1])) && (pt[0] < (p[j][0] - p[i][0]) * (pt[1] - p[i][1]) / (p[j][1] - p[i][1]) + p[i][0])) c = !c;
    return c;
  }
  function beda(a, b) { var d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; }

  function siapkan(D) {
    var busur = urai(D.kasar.arcs), P = {}, kelompok = {}, cache = {}, tet = {};
    /* provinsi bertetangga darat: ada pasangan kabupaten/kota lintas provinsi dengan batas minimal 1 km */
    D.provinsi.forEach(function (p) { tet[p.kode] = {}; });
    var provKab = {}; D.kab.forEach(function (k) { provKab[k.kode] = k.prov; });
    D.kab.forEach(function (k) { k.tetangga.forEach(function (t) { var p2 = provKab[t[0]]; if (p2 !== k.prov && t[1] >= 1) { tet[k.prov][p2] = 1; tet[p2][k.prov] = 1; } }); });
    function bertetangga(a, b) { return !!tet[a][b]; }
    D.provinsi.forEach(function (p) {
      var poli = D.kasar.geom[p.kode].map(function (pl) { return pl.map(function (r) { return cincin(busur, r); }); });
      var bb = [Infinity, Infinity, -Infinity, -Infinity];
      poli.forEach(function (pl) { pl[0].forEach(function (q) { bb[0] = Math.min(bb[0], q[0]); bb[1] = Math.min(bb[1], q[1]); bb[2] = Math.max(bb[2], q[0]); bb[3] = Math.max(bb[3], q[1]); }); });
      var step = Math.max(40, Math.sqrt((bb[2] - bb[0]) * (bb[3] - bb[1]) / 900)), sampel = [];
      for (var x = bb[0] + step / 2; x < bb[2]; x += step) for (var y = bb[1] + step / 2; y < bb[3]; y += step) {
        var pt = [x, y];
        if (poli.some(function (pl) { if (!dalam(pt, pl[0])) return false; for (var h = 1; h < pl.length; h++) if (dalam(pt, pl[h])) return false; return true; })) sampel.push(pt);
      }
      if (sampel.length < 12) poli.forEach(function (pl) { pl[0].forEach(function (q, i) { if (i % 2 === 0) sampel.push(q); }); });
      /* nama tampilan pendek yang sama dengan peta (DKI Jakarta, DI Yogyakarta) */
      P[p.kode] = { kode: p.kode, nama: Nama.prov(p), pulau: p.pulau, label: p.label, sampel: sampel, poli: poli };
      (kelompok[p.pulau] = kelompok[p.pulau] || []).push(p.kode);
    });
    /* arah X dilihat dari titik label R: [sudut rata-rata sebaran, persen di sektor diperlebar, bentang] */
    function arah(R, X) {
      var k = R + '>' + X;
      if (cache[k]) return cache[k];
      var a = P[R].label, sx = 0, sy = 0, ember = {}, masuk = 0;
      P[X].sampel.forEach(function (q) { var t = A.sudut(a, q); sx += Math.sin(t * Math.PI / 180); sy += Math.cos(t * Math.PI / 180); ember[Math.floor(t / 5)] = 1; });
      var s = (Math.atan2(sx, sy) * 180 / Math.PI + 360) % 360, i = A.indeks(s);
      P[X].sampel.forEach(function (q) { if (beda(A.sudut(a, q), i * 45) <= 45) masuk++; });
      return (cache[k] = { sudut: s, persen: Math.round(masuk / P[X].sampel.length * 100), bentang: Object.keys(ember).length * 5 });
    }
    function rel(R, X, d) {
      var a = arah(R, X);
      if (a.bentang > 270) return 'mungkin';
      var di = A.indeks(a.sudut) === d;
      if (di && A.jarakBatas(a.sudut) >= A.BATAS && a.persen >= 80) return 'ya';
      if (!di && A.jarakKeSektor(a.sudut, d) >= A.BATAS) return 'tidak';
      return 'mungkin';
    }
    /* petunjuk sah untuk provinsi X; tingkat 0: hanya arah utama (U, T, S, B), tingkat 1: delapan arah.
       Jenis: 'arah' (satu-satunya di arah itu dalam kelompok pulau), 'batasArah' (satu-satunya tetangga darat R di arah itu),
       'batasDua' (satu-satunya yang berbatasan dengan R dan R2), 'sisa' (kelompok pulau berisi dua provinsi). */
    function petunjuk(X, tingkat) {
      var grup = kelompok[P[X].pulau], hasil = [], pulau = P[X].pulau;
      grup.forEach(function (R) {
        if (R === X) return;
        for (var d = 0; d < 8; d++) {
          if (!tingkat && d % 2) continue;
          if (rel(R, X, d) !== 'ya') continue;
          if (grup.every(function (Y) { return Y === X || Y === R || rel(R, Y, d) === 'tidak'; })) hasil.push({ jenis: 'arah', sasaran: X, acuan: R, p: d, pulau: pulau });
          else if (bertetangga(R, X) && grup.every(function (Y) { return Y === X || Y === R || !bertetangga(R, Y) || rel(R, Y, d) === 'tidak'; })) hasil.push({ jenis: 'batasArah', sasaran: X, acuan: R, p: d, pulau: pulau });
        }
      });
      if (hasil.length) return hasil;
      /* cadangan tanpa arah */
      var tetX = grup.filter(function (R) { return R !== X && bertetangga(R, X); });
      for (var i = 0; i < tetX.length; i++) for (var j = i + 1; j < tetX.length; j++) {
        var a = tetX[i], b = tetX[j];
        if (grup.every(function (Y) { return Y === X || Y === a || Y === b || !(bertetangga(Y, a) && bertetangga(Y, b)); })) hasil.push({ jenis: 'batasDua', sasaran: X, acuan: a, acuan2: b, p: null, pulau: pulau });
      }
      if (!hasil.length && grup.length === 2) hasil.push({ jenis: 'sisa', sasaran: X, acuan: grup.filter(function (R) { return R !== X; })[0], p: null, pulau: pulau });
      return hasil;
    }
    /* sasaran: bukan provinsi mungil dan punya minimal satu petunjuk sah */
    var api = {};
    var sasaran = D.provinsi.map(function (p) { return p.kode; }).filter(function (k) { return BUKAN_SASARAN.indexOf(k) < 0 && petunjuk(k, 1).length; });
    /* n soal: kelompok pulau bergiliran supaya beragam; tingkat dari fungsi (adaptif) */
    function pilih(rnd, dipakai, tingkat) {
      var urutPulau = Object.keys(kelompok).sort(function (a, b) { return (dipakai.pulau[a] || 0) - (dipakai.pulau[b] || 0) || rnd() - 0.5; });
      for (var i = 0; i < urutPulau.length; i++) {
        var calon = kelompok[urutPulau[i]].filter(function (k) { return api.sasaran.indexOf(k) >= 0 && !dipakai.prov[k]; }).sort(function () { return rnd() - 0.5; });
        for (var j = 0; j < calon.length; j++) {
          var c = petunjuk(calon[j], tingkat);
          if (!c.length && tingkat === 0) c = petunjuk(calon[j], 1);
          if (c.length) { var q = c[Math.floor(rnd() * c.length)]; dipakai.prov[q.sasaran] = 1; dipakai.pulau[q.pulau] = (dipakai.pulau[q.pulau] || 0) + 1; return q; }
        }
      }
      return null;
    }
    return Object.assign(api, { P: P, kelompok: kelompok, arah: arah, rel: rel, petunjuk: petunjuk, pilih: pilih, sasaran: sasaran, bertetangga: bertetangga });
  }

  var Nusantara = { siapkan: siapkan, BUKAN_SASARAN: BUKAN_SASARAN };
  root.Nusantara = Nusantara;
  if (typeof module !== 'undefined') module.exports = Nusantara;
})(typeof window !== 'undefined' ? window : globalThis);
