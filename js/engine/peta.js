/* Peta Indonesia (Fase 2a): membaca config/peta-indonesia.js (garis bersama seperti TopoJSON, koordinat kisi datar yang sudah diproyeksikan)
   dan membuat jalur SVG untuk tampilan Indonesia (provinsi, detail kasar) dan tampilan provinsi (kabupaten/kota, detail rinci).
   Busur diurai sekali lalu disimpan. Transformasi T: x layar = ox + (x - vx) * s. Gim tidak menghitung proyeksi. */
(function (root) {
  var D = null, busurR = null, busurK = null, KAB = {}, PROV = {}, KAB_PROV = {};
  function urai(arcs) { return arcs.map(function (a) { var x = 0, y = 0; return a.map(function (p) { x += p[0]; y += p[1]; return [x, y]; }); }); }
  function siap() {
    if (D) return true;
    D = root.PETA_INDONESIA;
    if (!D) return false;
    busurR = urai(D.rinci.arcs); busurK = urai(D.kasar.arcs);
    D.kab.forEach(function (k) { KAB[k.kode] = k; (KAB_PROV[k.prov] = KAB_PROV[k.prov] || []).push(k); });
    D.provinsi.forEach(function (p) { PROV[p.kode] = p; });
    return true;
  }
  function dalam(pt, p) {
    var c = false;
    for (var i = 0, j = p.length - 1; i < p.length; j = i++)
      if (((p[i][1] > pt[1]) !== (p[j][1] > pt[1])) && (pt[0] < (p[j][0] - p[i][0]) * (pt[1] - p[i][1]) / (p[j][1] - p[i][1]) + p[i][0])) c = !c;
    return c;
  }
  var ringProv = null, ringKab = {};
  function ringsProv() { if (!ringProv) { ringProv = {}; D.provinsi.forEach(function (p) { ringProv[p.kode] = D.kasar.geom[p.kode].map(function (pl) { return cincin(busurK, pl[0]); }); }); } return ringProv; }
  function ringsKab(k) { if (!ringKab[k]) ringKab[k] = D.rinci.geom[k].map(function (pl) { return pl.map(function (r) { return cincin(busurR, r); }); }); return ringKab[k]; }
  function dalamPoligon(pt, pl) { if (!dalam(pt, pl[0])) return false; for (var h = 1; h < pl.length; h++) if (dalam(pt, pl[h])) return false; return true; }
  function titikBusur(arcs, i) { return i < 0 ? arcs[~i].slice().reverse() : arcs[i]; }
  function cincin(arcs, r) { var pts = []; r.forEach(function (i) { var t = titikBusur(arcs, i); pts = pts.concat(pts.length ? t.slice(1) : t); }); return pts; }
  function n1(v) { return Math.round(v * 10) / 10; }
  /* jalur SVG untuk geometri (daftar poligon, tiap poligon daftar cincin). minPx: cincin yang lebih kecil dari ini di layar dilewati (pulau mungil) */
  function jalur(arcs, geom, T, minPx) {
    var d = '';
    geom.forEach(function (pl) {
      pl.forEach(function (r, ri) {
        var pts = cincin(arcs, r);
        if (minPx && ri === 0) {
          var mnx = Infinity, mny = Infinity, mxx = -Infinity, mxy = -Infinity;
          pts.forEach(function (p) { mnx = Math.min(mnx, p[0]); mny = Math.min(mny, p[1]); mxx = Math.max(mxx, p[0]); mxy = Math.max(mxy, p[1]); });
          if (Math.max(mxx - mnx, mxy - mny) * T.s < minPx) return;
        }
        var lx = null, ly = null, s = '';
        pts.forEach(function (p, i) {
          var x = n1(T.ox + (p[0] - T.vx) * T.s), y = n1(T.oy + (p[1] - T.vy) * T.s);
          if (x === lx && y === ly) return;
          s += (s ? 'L' : 'M') + x + ' ' + y; lx = x; ly = y;
        });
        if (s) d += s + 'Z';
      });
    });
    return d;
  }
  var antre = null, busurDalam = null;
  /* busur yang dipakai lebih dari satu wilayah di SELURUH data (supaya batas dengan provinsi di luar tampilan tidak dikira pantai) */
  function BUSUR_DALAM() {
    if (busurDalam) return busurDalam;
    var hit = {}; busurDalam = {};
    Object.keys(D.rinci.geom).forEach(function (k) { D.rinci.geom[k].forEach(function (pl) { pl.forEach(function (r) { r.forEach(function (i) { var b = i < 0 ? ~i : i; hit[b] = (hit[b] || 0) + 1; }); }); }); });
    D.air.forEach(function (a) { a.geom.forEach(function (pl) { pl.forEach(function (r) { r.forEach(function (i) { var b = i < 0 ? ~i : i; hit[b] = (hit[b] || 0) + 1; }); }); }); });
    Object.keys(hit).forEach(function (b) { if (hit[b] > 1) busurDalam[b] = 1; });
    return busurDalam;
  }
  var Peta = {
    siap: siap,
    /* muat data peta (1,5 MB) saat diperlukan saja: skrip klasik disisipkan, jalan lewat file:// maupun http:// */
    muat: function (cb) {
      if (siap()) { cb(true); return; }
      if (antre) { antre.push(cb); return; }
      antre = [cb];
      var s = document.createElement('script');
      function beres(ok) { var a = antre; antre = null; a.forEach(function (f) { f(ok); }); }
      s.src = 'config/peta-indonesia.js';
      s.onload = function () { beres(siap()); };
      s.onerror = function () { beres(false); };
      document.head.appendChild(s);
    },
    data: function () { siap(); return D; },
    kab: function (k) { siap(); return KAB[k]; },
    prov: function (p) { siap(); return PROV[p]; },
    kabDi: function (p) { siap(); return (KAB_PROV[p] || []).slice(); },
    /* transformasi agar kotak [x0, y0, x1, y1] masuk ke kotak layar {x, y, w, h} dengan jarak tepi pad */
    pas: function (kotak, layar, pad) {
      pad = pad || 0;
      var w = kotak[2] - kotak[0] || 1, h = kotak[3] - kotak[1] || 1, s = Math.min((layar.w - pad * 2) / w, (layar.h - pad * 2) / h);
      return { s: s, vx: kotak[0], vy: kotak[1], ox: layar.x + (layar.w - w * s) / 2, oy: layar.y + (layar.h - h * s) / 2 };
    },
    P: function (pt, T) { return [T.ox + (pt[0] - T.vx) * T.s, T.oy + (pt[1] - T.vy) * T.s]; },
    kotakSemua: function () { siap(); var b = [Infinity, Infinity, -Infinity, -Infinity]; D.provinsi.forEach(function (p) { b[0] = Math.min(b[0], p.kotak[0]); b[1] = Math.min(b[1], p.kotak[1]); b[2] = Math.max(b[2], p.kotak[2]); b[3] = Math.max(b[3], p.kotak[3]); }); return b; },
    /* kotak sekumpulan kabupaten/kota (untuk zoom ke wilayah murid dan tetangganya) */
    kotakKab: function (kodes) {
      siap(); var b = [Infinity, Infinity, -Infinity, -Infinity];
      kodes.forEach(function (k) { D.rinci.geom[k].forEach(function (pl) { cincin(busurR, pl[0]).forEach(function (p) { b[0] = Math.min(b[0], p[0]); b[1] = Math.min(b[1], p[1]); b[2] = Math.max(b[2], p[0]); b[3] = Math.max(b[3], p[1]); }); }); });
      return b;
    },
    /* kotak wilayah tanpa pulau kecil yang jauh: tiap kabupaten/kota hanya poligon terluasnya */
    kotakKabUtama: function (kodes) {
      siap(); var b = [Infinity, Infinity, -Infinity, -Infinity];
      kodes.forEach(function (k) {
        var terbaik = null, luas = -1;
        D.rinci.geom[k].forEach(function (pl) {
          var r = cincin(busurR, pl[0]), mn = [Infinity, Infinity], mx = [-Infinity, -Infinity];
          r.forEach(function (p) { mn[0] = Math.min(mn[0], p[0]); mn[1] = Math.min(mn[1], p[1]); mx[0] = Math.max(mx[0], p[0]); mx[1] = Math.max(mx[1], p[1]); });
          var a = (mx[0] - mn[0]) * (mx[1] - mn[1]); if (a > luas) { luas = a; terbaik = [mn[0], mn[1], mx[0], mx[1]]; }
        });
        if (terbaik) { b[0] = Math.min(b[0], terbaik[0]); b[1] = Math.min(b[1], terbaik[1]); b[2] = Math.max(b[2], terbaik[2]); b[3] = Math.max(b[3], terbaik[3]); }
        var t = KAB[k].titik; b[0] = Math.min(b[0], t[0]); b[1] = Math.min(b[1], t[1]); b[2] = Math.max(b[2], t[0]); b[3] = Math.max(b[3], t[1]);
      });
      return b;
    },
    /* titik layar -> provinsi / kabupaten/kota (titik di dalam poligon; lubang enklave dihormati) */
    provPada: function (x, y, T) {
      siap(); var p = [(x - T.ox) / T.s + T.vx, (y - T.oy) / T.s + T.vy], R = ringsProv();
      for (var k in R) if (R[k].some(function (r) { return dalam(p, r); })) return k;
      return null;
    },
    kabPada: function (x, y, T, kodes) {
      siap(); var p = [(x - T.ox) / T.s + T.vx, (y - T.oy) / T.s + T.vy];
      for (var i = 0; i < kodes.length; i++) if (ringsKab(kodes[i]).some(function (pl) { return dalamPoligon(p, pl); })) return kodes[i];
      return null;
    },
    dKab: function (k, T, minPx) { siap(); return jalur(busurR, D.rinci.geom[k], T, minPx); },
    dProv: function (p, T, minPx) { siap(); return jalur(busurK, D.kasar.geom[p], T, minPx); },
    dAir: function (T, minPx) { siap(); return D.air.map(function (a) { return jalur(busurR, a.geom, T, minPx); }).join(''); },
    /* busur sekumpulan kabupaten/kota menurut jenis: 'pantai' (dipakai satu wilayah), 'prov' (dua wilayah beda provinsi),
       'kab' (dua wilayah seprovinsi). Untuk tampilan rinci yang garis provinsinya pas dengan isinya. */
    dBusur: function (kodes, T, jenis) {
      siap(); var pakai = {}, d = '';
      kodes.forEach(function (k) { D.rinci.geom[k].forEach(function (pl) { pl.forEach(function (r) { r.forEach(function (i) { var b = i < 0 ? ~i : i; (pakai[b] = pakai[b] || []).push(k); }); }); }); });
      Object.keys(pakai).forEach(function (b) {
        var u = pakai[b], ok = jenis === 'pantai' ? u.length === 1 && !(b in BUSUR_DALAM()) : u.length >= 2 && (jenis === 'prov' ? KAB[u[0]].prov !== KAB[u[1]].prov : KAB[u[0]].prov === KAB[u[1]].prov);
        if (!ok) return;
        busurR[b].forEach(function (q, i) { d += (i ? 'L' : 'M') + n1(T.ox + (q[0] - T.vx) * T.s) + ' ' + n1(T.oy + (q[1] - T.vy) * T.s); });
      });
      return d;
    },
    /* garis batas kabupaten/kota di dalam provinsi (busur yang dipakai dua wilayah sedaerah), untuk digambar putus-putus */
    dBatasDalam: function (p, T) {
      siap(); var pakai = {}, d = '';
      (KAB_PROV[p] || []).forEach(function (k) { D.rinci.geom[k.kode].forEach(function (pl) { pl.forEach(function (r) { r.forEach(function (i) { var b = i < 0 ? ~i : i; pakai[b] = (pakai[b] || 0) + 1; }); }); }); });
      Object.keys(pakai).forEach(function (b) {
        if (pakai[b] < 2) return;
        busurR[b].forEach(function (q, i) { d += (i ? 'L' : 'M') + n1(T.ox + (q[0] - T.vx) * T.s) + ' ' + n1(T.oy + (q[1] - T.vy) * T.s); });
      });
      return d;
    }
  };
  root.Peta = Peta;
  if (typeof module !== 'undefined') module.exports = Peta;
})(typeof window !== 'undefined' ? window : globalThis);
