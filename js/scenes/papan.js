/* Papan teka-teki kartu nama (L3 dan L5, GDD bagian 6, 10, 14).
   Peta berwilayah dengan pin "?", kartu petunjuk dengan mawar angin kecil, baki kartu nama (seret, ATAU ketuk kartu lalu ketuk wilayah;
   keyboard: Tab ke kartu, Enter, panah ke pin wilayah, Enter), petunjuk bertingkat per kartu, dan pertanyaan serupa di akhir.
   Peta disediakan adaptor: Papan.petaPulau (pulau rekaan) atau adaptor peta Indonesia di level5.js. Adaptor menyediakan:
   kotak, svg(keadaan), titik(id), wilayahDi(x, y), dWilayah(id), fitur(ciri), mawar {cx, cy, r}, label(id) -> [awal, nama]. */
(function (root) {
  var NS = 'http://www.w3.org/2000/svg';
  function svgLapis(kelas) {
    var s = document.createElementNS(NS, 'svg');
    s.setAttribute('width', 1280); s.setAttribute('height', 720); s.setAttribute('viewBox', '0 0 1280 720');
    s.setAttribute('class', kelas); s.setAttribute('aria-hidden', 'true');
    return s;
  }
  function dalam(pt, p) {
    var c = false;
    for (var i = 0, j = p.length - 1; i < p.length; j = i++)
      if (((p[i][1] > pt[1]) !== (p[j][1] > pt[1])) && (pt[0] < (p[j][0] - p[i][0]) * (pt[1] - p[i][1]) / (p[j][1] - p[i][1]) + p[i][0])) c = !c;
    return c;
  }
  function n1(v) { return Math.round(v * 10) / 10; }
  function besar(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  /* teks dipaskan: kecilkan huruf sampai muat; bila nama terlalu panjang untuk satu baris, nama boleh diputus */
  function pasKan(el, maks, min, hanyaLebar) {
    el.classList.remove('boleh-putus');
    for (var u = maks; u >= min; u--) { el.style.fontSize = u + 'px'; el.style.lineHeight = Math.round(u * 1.3) + 'px'; if ((hanyaLebar || el.scrollHeight <= el.clientHeight + 5) && el.scrollWidth <= el.clientWidth + 1) return u; }
    el.classList.add('boleh-putus');
    if (hanyaLebar) return min;
    for (u = maks; u >= min; u--) { el.style.fontSize = u + 'px'; el.style.lineHeight = Math.round(u * 1.3) + 'px'; if (el.scrollHeight <= el.clientHeight + 5) return u; }
    return min;
  }

  /* ---------- Adaptor peta pulau rekaan (config/pulau-latihan.js) ---------- */
  /* o: x, y, w, h (kotak laut di panggung), vb, gaya {id: {warna, pola}}, gantung {id: [x, y] satuan peta}, ombak, posLaut, posLuar, fitur {ciri: [x, y]}, mawar {cx, cy, r} */
  function petaPulau(P, o) {
    var W = {}, ring = {};
    P.wilayah.forEach(function (w) { W[w.id] = w; });
    function titikGaris(nama) { var b = nama[0] === '~', g = P.garis[b ? nama.slice(1) : nama].titik; return b ? g.slice().reverse() : g; }
    function cincin(daftar) { var pts = []; daftar.forEach(function (nm) { var t = titikGaris(nm); pts = pts.concat(pts.length ? t.slice(1) : t); }); return pts; }
    P.wilayah.forEach(function (w) { ring[w.id] = [cincin(w.garis)].concat((w.pulau || []).map(cincin)); });
    var opsiPeta = { x: o.x, y: o.y, w: o.w, h: o.h, vb: o.vb };
    var dasar = Seni.petaDari(P, opsiPeta), Pt = dasar.P, s = dasar.s, nol = Pt([0, 0]);
    function keLayar(p) { var q = Pt(p); return { x: q[0], y: q[1] }; }
    function lebarPlat(nama) { return Math.max(110, Math.round(Math.max(nama.length, 4) * 11.6 + 40)); }
    function plat(id, p) {
      var w = W[id], warna = Seni.ISI[(o.gaya[id] || {}).warna] || Seni.ISI.pasir;
      if (w.ibukota) {
        /* ibu kota: plat tergantung dari simbol bintang (lurus bila di bawahnya, melengkung bila digantung di laut) */
        var ik = p.P(P.bentang.ibukota.titik), gp = p.P(o.gantung[id] || [P.bentang.ibukota.titik[0], P.bentang.ibukota.titik[1] + 70]);
        var tali = Math.abs(gp[0] - ik[0]) < 4 ? 'M' + n1(ik[0]) + ' ' + n1(ik[1] + 14) + 'V' + n1(gp[1] - 28) :
          'M' + n1(ik[0]) + ' ' + n1(ik[1] + 10) + 'Q' + n1((ik[0] + gp[0]) / 2) + ' ' + n1(Math.max(ik[1], gp[1]) + 16) + ' ' + n1(gp[0]) + ' ' + n1(gp[1] - 21);
        return '<path d="' + tali + '" stroke="' + Seni.W.tinta + '" stroke-width="2.6" fill="none"/>' +
          Seni.bentukPlat(gp[0], gp[1] - 28, lebarPlat(w.nama), 56, warna, w.jenis === 'kota' ? 'Kota' : 'Kab.', w.nama);
      }
      return Seni.platBertali(p, w, o.gantung[id] || null, warna);
    }
    return {
      kotak: { x: o.x, y: o.y, w: o.w, h: o.h },
      mawar: o.mawar,
      ids: P.wilayah.filter(function (w) { return w.jenis !== 'luar'; }).map(function (w) { return w.id; }),
      label: function (id) { var w = W[id]; return [w.jenis === 'kota' ? 'Kota' : w.jenis === 'kab' ? 'Kab.' : '', w.nama]; },
      titik: function (id) { return keLayar(W[id].label); },
      wilayahDi: function (x, y) {
        var p = [(x - nol[0]) / s, (y - nol[1]) / s];
        for (var id in ring) { if (W[id].jenis === 'luar') continue; if (ring[id].some(function (r) { return dalam(p, r); })) return id; }
        return null;
      },
      dWilayah: function (id) { return ring[id].map(function (r) { return r.map(function (p, i) { var q = Pt(p); return (i ? 'L' : 'M') + n1(q[0]) + ' ' + n1(q[1]); }).join('') + 'Z'; }).join(''); },
      fitur: function (k) { var f = (o.fitur || {})[k]; return f ? keLayar(f) : null; },
      svg: function (k) {
        var p = Seni.petaDari(P, Object.assign({}, opsiPeta, { berwarna: k.bernama, gaya: o.gaya, ombak: o.ombak, labelLaut: true, posLaut: o.posLaut, posLuar: o.posLuar, ibukota: false }));
        var g = p.svg;
        Object.keys(k.bernama).forEach(function (id) { if (k.bernama[id]) g += plat(id, p); });
        (k.kosong || []).forEach(function (id) { var q = p.P(W[id].label); g += Seni.pinKosong(q[0], q[1], k.sorot === id ? 'denyut' : ''); });
        var ik = p.P(P.bentang.ibukota.titik);
        g += Seni.ibuKota(ik[0], ik[1], 14);
        return g;
      }
    };
  }

  /* ---------- Papan ---------- */
  /* cfg: peta (adaptor), model (Teka), kartu [id urut jalur], jangkar, konteks [], luar [], petunjuk (jalur Teka), opsi (profil, hanyaAcuan),
     hud, lang, posLang [x, y, s], maksBaki, lebarKartu, tag [], tagArah, pandu, santai, onBenar(id, langsung), onSelesai(stat) */
  function buat(induk, cfg) {
    var peta = cfg.peta, m = cfg.model, W = Seni.W, S = STR.teka;
    var semua = cfg.kartu.slice(), kosong = semua.slice(), bernama = {}, konteksSemua = (cfg.konteks || []).concat(cfg.luar || []);
    bernama[cfg.jangkar] = true; (cfg.konteks || []).forEach(function (id) { if (m.ids.indexOf(id) >= 0) bernama[id] = 'abu'; });
    var jalur = {}; (cfg.petunjuk || []).forEach(function (c) { jalur[c.kartu] = c; });
    var opsiTeka = Object.assign({}, cfg.opsi || {}, { jangkar: cfg.jangkar, konteks: konteksSemua, luar: cfg.luar || [], rnd: U.rng ? U.rng(7) : Math.random });
    var keadaanTeka = { dipakaiJenis: {}, terakhir: null };
    var terpilih = null, siap = false, hidup = true, salahPer = {}, p3 = {}, langsung = 0, mode = 'pasang', tanyaQ = null, tanyaSalah = 0, petunjukAktif = {};
    var maks = cfg.maksBaki || 5, lebar = cfg.lebarKartu || 222, barusanSeret = false;
    var api = {};

    /* lapisan */
    var lapisPeta = U.h('div', 'lapis peta-teka');
    induk.appendChild(lapisPeta);
    var bantu = svgLapis('lapis-bantu-teka'); induk.appendChild(bantu);
    var tangkap = U.h('div', 'tangkap-peta');
    tangkap.style.cssText = 'left:' + peta.kotak.x + 'px;top:' + peta.kotak.y + 'px;width:' + peta.kotak.w + 'px;height:' + peta.kotak.h + 'px';
    tangkap.addEventListener('click', function (e) {
      if (!siap) return;
      var p = Stage.toLocal(e.clientX, e.clientY), id = peta.wilayahDi(p.x, p.y);
      if (id) ketukWilayah(id);
    });
    induk.appendChild(tangkap);
    var lapisPin = U.h('div', 'lapis lapis-pin'); induk.appendChild(lapisPin);

    /* kartu petunjuk */
    var kp = U.h('div', 'panel kartu-petunjuk');
    kp.style.cssText = 'left:872px;top:100px;width:392px;height:282px';
    kp.innerHTML = '<div class="kepala"><span class="nomor" data-cek="nomor petunjuk"></span></div><div class="isi"><span class="kompas"></span><p class="kalimat" data-cek="kalimat petunjuk"></p></div>';
    kp.appendChild(UI.tombolIkon('dengar', STR.ikon.dengarPetunjuk || STR.ikon.dengarInstruksi, function () { Voice.stop(); UI.bacakan(kp.dataset.teks || '', true); }, { id: 'dengar-petunjuk', cls: 'tombol-petunjuk' }));
    induk.appendChild(kp);
    var elNomor = kp.querySelector('.nomor'), elKompas = kp.querySelector('.kompas'), elKalimat = kp.querySelector('.kalimat');

    /* baki */
    var baki = U.h('div', 'baki'); induk.appendChild(baki);
    var lapisDepan = U.h('div', 'lapis lapis-seret'); induk.appendChild(lapisDepan);

    function bacakan(teks, eks) { return Save.data.settings.bacakan ? Bersama.ucap(teks, { lang: cfg.lang, hud: cfg.hud, eks: eks }) : Promise.resolve(); }
    function dikenal() { return Object.keys(bernama).concat(cfg.luar || []); }

    /* ---------- gambar ---------- */
    function gambarPeta(sorot) {
      var b = {}; Object.keys(bernama).forEach(function (id) { b[id] = bernama[id] === true; });
      var isi = peta.svg({ bernama: b, abu: Object.keys(bernama).filter(function (id) { return bernama[id] === 'abu'; }), kosong: mode === 'pasang' ? kosong : [], sorot: sorot });
      if (peta.mawar) isi += '<g class="mawar-peta">' + Seni.mawarAngin(peta.mawar.cx, peta.mawar.cy, peta.mawar.r, { label8: false }) + '</g>';
      lapisPeta.innerHTML = Seni.svg(1280, 720, isi);
      /* pin = tombol ketuk 64 px untuk wilayah kosong (keyboard: Tab/panah lalu Enter) */
      lapisPin.innerHTML = '';
      if (mode === 'tanya') {
        /* soal serupa: semua wilayah bisa diketuk (juga lewat keyboard), diberi nama lengkap */
        m.ids.forEach(function (id) {
          var t = peta.titik(id), b3 = U.h('button', 'pin-wilayah');
          b3.type = 'button'; b3.dataset.id = 'wilayah-' + id; b3.dataset.wilayah = id;
          b3.style.left = Math.round(t.x - 32) + 'px'; b3.style.top = Math.round(t.y - 32) + 'px';
          b3.setAttribute('aria-label', m.nama(id));
          b3.addEventListener('click', function () { if (siap) ketukWilayah(id); });
          lapisPin.appendChild(b3);
        });
        return;
      }
      if (mode !== 'pasang') return;
      kosong.slice().sort(function (a, c) { var pa = peta.titik(a), pc = peta.titik(c); return Math.round(pa.y / 90) - Math.round(pc.y / 90) || pa.x - pc.x; }).forEach(function (id, i) {
        var t = peta.titik(id), b2 = U.h('button', 'pin-wilayah');
        b2.type = 'button'; b2.dataset.id = 'pin-' + id; b2.dataset.wilayah = id;
        b2.style.left = Math.round(t.x - 32) + 'px'; b2.style.top = Math.round(t.y - 32) + 'px';
        b2.setAttribute('aria-label', U.fmt(S.pinAria, { n: i + 1 }));
        b2.addEventListener('click', function () { if (siap) ketukWilayah(id); });
        lapisPin.appendChild(b2);
      });
    }
    function kedipMawar() { var g = lapisPeta.querySelector('.mawar-peta'); if (g) { g.classList.remove('kedip-mawar'); void g.getBBox; g.classList.add('kedip-mawar'); } }

    /* petunjuk sah untuk kartu T pada keadaan sekarang (jalur dulu, bila tidak sah lagi cari yang lain) */
    function petunjuk(T) {
      if (petunjukAktif[T] && Teka.sah(m, petunjukAktif[T], kosong)) return petunjukAktif[T];
      var c = jalur[T] && Teka.sah(m, jalur[T], kosong) ? jalur[T] : Teka.petunjukUntuk(m, T, dikenal(), kosong, opsiTeka, keadaanTeka);
      petunjukAktif[T] = c;
      return c;
    }
    function gambarBaki() {
      baki.innerHTML = '';
      var tampak = kosong.slice(0, maks), sisa = kosong.length - tampak.length, jarak = Math.min(lebar + 14, (1186 - 14) / Math.max(1, Math.min(maks, tampak.length)));
      tampak.forEach(function (id, i) {
        var b = U.h('button', 'kartu-nama' + (id === terpilih ? ' terpilih' : '') + (petunjuk(id) ? '' : ' terkunci'));
        var lb = peta.label(id);
        b.type = 'button'; b.dataset.id = 'kartu-' + id; b.dataset.kartu = id;
        b.style.cssText = 'left:' + Math.round(14 + i * jarak) + 'px;top:8px;width:' + lebar + 'px';
        b.setAttribute('aria-label', (lb[0] ? lb[0] + ' ' : '') + lb[1]);
        b.innerHTML = Seni.bentukKartu(lebar, 80, { terpilih: id === terpilih }) + '<span class="teks"><span class="awal">' + UI.esc(lb[0]) + '</span><span class="nama" data-cek="kartu ' + UI.esc(lb[1]) + '">' + UI.esc(lb[1]) + '</span></span>' +
          (petunjuk(id) ? '' : '<span class="gembok">' + UI.ikon('gembok', 26) + '</span>');
        pasangSeret(b, id);
        b.addEventListener('click', function () { if (barusanSeret) { barusanSeret = false; return; } if (siap) pilih(id, true); });
        baki.appendChild(b);
        /* nama 22 px; bila tidak muat satu baris di 20 px, dua baris 20 px (tidak pernah di bawah ukuran label) */
        var nm = b.querySelector('.nama'); nm.classList.remove('dua-baris');
        if (pasKan(nm, 22, 20, true) === 20 && nm.scrollWidth > nm.clientWidth + 1) { nm.style.fontSize = ''; nm.style.lineHeight = ''; nm.classList.add('dua-baris'); }
      });
      if (sisa > 0) {
        var t = U.h('div', 'tumpukan');
        t.style.left = '1186px'; t.style.top = '8px';
        t.innerHTML = Seni.svg(62, 88, '<path d="M8 14H54V82H8Z" transform="translate(4 -6)" fill="' + W.kertasGelap + '" stroke="' + W.tinta + '" stroke-width="3" stroke-linejoin="round"/><path d="M8 14H54V82H8Z" fill="' + W.kertas + '" stroke="' + W.tinta + '" stroke-width="3.5" stroke-linejoin="round"/>') + '<span class="jumlah" data-cek="tumpukan">+' + sisa + '</span>';
        t.setAttribute('aria-label', U.fmt(S.tumpukan, { n: sisa }));
        baki.appendChild(t);
      }
    }
    function tampilPetunjuk(id) {
      var c = petunjuk(id), urut = semua.length - kosong.length + 1;
      elNomor.textContent = U.fmt(S.kepala, { i: urut, n: semua.length });
      if (!c) {
        elKompas.innerHTML = Seni.kompasMini(null, 92);
        elKalimat.textContent = S.terkunci; kp.dataset.teks = S.terkunci;
        pasKan(elKalimat, 26, 20);
        return null;
      }
      elKompas.innerHTML = Seni.kompasMini(typeof c.p === 'number' ? c.p : null, 92);
      elKalimat.innerHTML = Teka.kalimat(m, c, S, true);
      kp.dataset.teks = Teka.kalimat(m, c, S);
      pasKan(elKalimat, 26, 20);
      return c;
    }

    /* ---------- memilih kartu ---------- */
    function pilih(id, olehMurid) {
      if (!hidup || mode !== 'pasang') return;
      if (olehMurid) UI.idle.reset();
      var berubah = terpilih !== id;
      terpilih = id;
      bersihBantu();
      gambarBaki();
      var c = tampilPetunjuk(id);
      if (berubah || !olehMurid) {
        Voice.stop();
        if (c) bacakan(kp.dataset.teks);
        else if (olehMurid) { Aud.sfx('gembok'); bacakan(S.terkunci); }
      }
      if (olehMurid) Aud.sfx('pilih');
    }
    function pilihBerikut() {
      var bisa = kosong.filter(function (id) { return !!petunjuk(id); });
      pilih(bisa[0] || kosong[0], false);
    }

    /* ---------- seret ---------- */
    function pasangSeret(el, id) {
      el.addEventListener('pointerdown', function (e) {
        if (!siap || e.button > 0) return;
        Aud.init();
        var awal = Stage.toLocal(e.clientX, e.clientY), bayang = null, kotakAwal = UI.titik(el);
        try { el.setPointerCapture(e.pointerId); } catch (x) { }
        function gerak(ev) {
          var p = Stage.toLocal(ev.clientX, ev.clientY);
          if (!bayang && Math.hypot(p.x - awal.x, p.y - awal.y) > 10) {
            if (terpilih !== id) pilih(id, true);
            bayang = U.h('div', 'kartu-nama kartu-bayang');
            bayang.style.width = lebar + 'px';
            bayang.innerHTML = Seni.bentukKartu(lebar, 80, { terpilih: true }) + el.querySelector('.teks').outerHTML;
            lapisDepan.appendChild(bayang);
            el.classList.add('diseret');
            UI.sembunyiTangan(true);
          }
          if (bayang) {
            bayang.style.left = Math.round(p.x - lebar * 0.3) + 'px'; bayang.style.top = Math.round(p.y - 46) + 'px';
            var w = peta.wilayahDi(p.x, p.y);
            sorotSeret(w && kosong.indexOf(w) >= 0 ? w : null);
          }
        }
        function lepas(ev) {
          el.removeEventListener('pointermove', gerak); el.removeEventListener('pointerup', lepas); el.removeEventListener('pointercancel', lepas);
          if (!bayang) return;
          barusanSeret = true; setTimeout(function () { barusanSeret = false; }, 400);
          var p = Stage.toLocal(ev.clientX, ev.clientY), w = ev.type === 'pointercancel' ? null : peta.wilayahDi(p.x, p.y);
          sorotSeret(null);
          el.classList.remove('diseret');
          if (w && kosong.indexOf(w) >= 0) { api._bayang = bayang; coba(id, w); }
          else {
            if (w && bernama[w]) UI.toast(S.sudahBernama);
            /* kembali ke baki */
            var b0 = { x: parseFloat(bayang.style.left), y: parseFloat(bayang.style.top) }, tuju = kotakAwal ? { x: kotakAwal.x - lebar / 2, y: kotakAwal.y - 40 } : b0;
            if (UI.kurangi) bayang.remove();
            else Tween.run(220, function (e2) { bayang.style.left = (b0.x + (tuju.x - b0.x) * e2) + 'px'; bayang.style.top = (b0.y + (tuju.y - b0.y) * e2) + 'px'; }, Ease.easeInOutCubic).then(function () { bayang.remove(); });
          }
        }
        el.addEventListener('pointermove', gerak); el.addEventListener('pointerup', lepas); el.addEventListener('pointercancel', lepas);
      });
    }
    var sorotSeretId = null;
    function sorotSeret(id) {
      if (id === sorotSeretId) return;
      sorotSeretId = id;
      var lama = bantu.querySelector('.sorot-seret'); if (lama) lama.remove();
      if (id) { var g = document.createElementNS(NS, 'path'); g.setAttribute('d', peta.dWilayah(id)); g.setAttribute('class', 'sorot-seret'); bantu.appendChild(g); }
    }

    /* ---------- memasang ---------- */
    function ketukWilayah(id) {
      UI.idle.reset();
      if (mode === 'tanya') return jawabTanya(id);
      if (bernama[id]) { Aud.sfx('pop'); UI.toast(S.sudahBernama); return; }
      if (kosong.indexOf(id) < 0) return;
      if (!terpilih) { UI.toast(S.pilihDulu); return; }
      coba(terpilih, id);
    }
    function coba(id, w) {
      if (!siap) return;
      if (!petunjuk(id)) {
        /* kartu belum punya petunjuk: tidak dihitung salah, arahkan ke kartu lain */
        Aud.sfx('gembok'); UI.toast(S.terkunci);
        if (api._bayang) { api._bayang.remove(); api._bayang = null; }
        return;
      }
      Voice.stop();
      if (id === w) benar(id); else salah(id, w);
    }
    function elKartu(id) { return baki.querySelector('[data-kartu="' + id + '"]'); }
    function benar(id) {
      siap = false;
      var c = petunjuk(id), lgs = !salahPer[id];
      if (lgs) langsung++;
      (cfg.tag || []).forEach(function (t) { Save.catat(t, lgs); });
      if (cfg.tagArah && c && typeof c.p === 'number') Save.catat(cfg.tagArah, lgs);
      keadaanTeka.dipakaiJenis[c.jenis] = (keadaanTeka.dipakaiJenis[c.jenis] || 0) + 1; keadaanTeka.terakhir = id;
      UI.sembunyiTangan(true); bersihBantu();
      var tuju = peta.titik(id), el = elKartu(id), bayang = api._bayang; api._bayang = null;
      if (!bayang && el) {
        var t0 = UI.titik(el);
        bayang = U.h('div', 'kartu-nama kartu-bayang'); bayang.style.width = lebar + 'px';
        bayang.innerHTML = el.innerHTML; bayang.style.left = (t0.x - lebar / 2) + 'px'; bayang.style.top = (t0.y - 40) + 'px';
        lapisDepan.appendChild(bayang);
      }
      if (el) el.style.visibility = 'hidden';
      var b0 = bayang ? { x: parseFloat(bayang.style.left), y: parseFloat(bayang.style.top) } : null;
      var terbang = !bayang || UI.kurangi ? Promise.resolve() : Tween.run(300, function (e) {
        bayang.style.left = (b0.x + (tuju.x - lebar / 2 - b0.x) * e) + 'px'; bayang.style.top = (b0.y + (tuju.y - 40 - b0.y) * e) + 'px'; bayang.style.scale = (1 - 0.45 * e).toFixed(3);
      }, Ease.easeInOutCubic);
      terbang.then(function () {
        if (bayang) bayang.remove();
        if (!hidup) return;
        kosong.splice(kosong.indexOf(id), 1);
        bernama[id] = true;
        petunjukAktif = {};
        gambarPeta();
        Aud.sfx('tak');
        UI.ledak(tuju.x, tuju.y, 14);
        cfg.lang.pose('hinggap', 'sorak'); cfg.hud.potret('sorak');
        cfg.lang.terbangKe(cfg.posLang[0], cfg.posLang[1], cfg.posLang[2], 300, 0);
        cfg.hud.keping(lgs ? 10 : 5);
        cfg.hud.kemajuan(semua.length - kosong.length, semua.length);
        cfg.hud.instruksi(S.benar, false);
        if (cfg.onBenar) cfg.onBenar(id, lgs);
        return Promise.all([Tween.wait(650), Save.data.settings.bacakan ? Bersama.ucap(S.benar, { lang: cfg.lang, hud: cfg.hud, eks: 'sorak' }) : null]).then(function () {
          if (!hidup) return;
          cfg.lang.eks('senang'); cfg.hud.potret('senang');
          if (!kosong.length) return selesai();
          cfg.hud.instruksi(S.instruksi, false);
          siap = true;
          pilihBerikut();
          aturIdle();
        });
      });
    }
    /* jenis kesalahan dan pesannya */
    function jenisSalah(c, w) {
      var R = c.acuan, j = c.jenis, o = { R: R != null ? m.nama(R) : '', arah: typeof c.p === 'number' ? STR.arah[c.p] : '' };
      function arahDari(R2, X) { var a = m.arah(R2, X); if (a) return Arah.indeks(a.sudut); var t1 = m.titik(R2), t2 = m.titik(X); return Arah.indeks(Arah.sudut(t1, t2)); }
      if ((j === 'arah' || j === 'arahPantai' || j === 'laut') && R != null) {
        var ya = Teka.relArah(m, R, w, c.p) === 'ya';
        if (ya && j === 'arahPantai') return { kode: 'pantai', teks: S.salah.pantaiTidak };
        if (ya && j === 'laut') return { kode: 'laut', teks: U.fmt(S.salah.bukanLaut, o) };
        var k = arahDari(R, w), js = Arah.jenisSalah(c.p, k, {});
        o.ketuk = STR.arah[k]; o.singkat = STR.arahSingkat[c.p]; o.Arah = besar(o.arah); o.a = STR.arah[(c.p + 7) % 8]; o.b = STR.arah[(c.p + 1) % 8];
        if (js === 'berlawanan') return { kode: 'berlawanan', teks: U.fmt(S.salah.berlawanan, o) };
        if (js === 'arah-antara') return { kode: 'arah-antara', teks: U.fmt(c.p % 2 ? S.salah.arahAntara : S.salah.arahUtama, o) };
        return { kode: 'arah-lain', teks: U.fmt(S.salah.arahLain, o) };
      }
      if (j === 'batas' || j === 'batasPantai' || j === 'batasDarat') {
        if (m.tetangga(w, R) === 'tidak') return { kode: 'bukan-tetangga', teks: U.fmt(S.salah.bukanTetangga, o) };
        if (j === 'batasPantai') return { kode: 'pantai', teks: S.salah.pantaiTidak };
        if (j === 'batasDarat') return { kode: 'pantai', teks: S.salah.pantaiYa };
      }
      if (j === 'mengelilingi') return { kode: 'kelilingi', teks: U.fmt(S.salah.tidakKeliling, o) };
      if (j === 'dikelilingi') return { kode: 'kelilingi', teks: U.fmt(S.salah.tidakDalam, o) };
      if (j === 'lautSaja') return { kode: 'laut', teks: U.fmt(S.salah.bukanLaut, o) };
      if (j === 'pedalaman') return { kode: 'pantai', teks: S.salah.pantaiYa };
      if (j === 'ciri') return { kode: 'ciri', teks: U.fmt(S.salah.ciri, { ciri: m.namaCiri(c.p) }) };
      return { kode: 'lain', teks: S.salah.umum };
    }
    function salah(id, w) {
      var c = petunjuk(id);
      salahPer[id] = (salahPer[id] || 0) + 1;
      (cfg.tag || []).forEach(function (t) { Save.catatSalah(t); });
      var js = jenisSalah(c, w);
      if (['berlawanan', 'arah-antara', 'arah-lain', 'bukan-tetangga'].indexOf(js.kode) >= 0) { Save.catatMis(js.kode); if (cfg.tagArah && js.kode !== 'bukan-tetangga') Save.catatSalah(cfg.tagArah); }
      if (api.mis) api.mis[js.kode] = (api.mis[js.kode] || 0) + 1;
      Aud.sfx('bad');
      var el = elKartu(id), bayang = api._bayang; api._bayang = null;
      if (bayang) bayang.remove();
      if (el) UI.goyang(el);
      var pinEl = lapisPin.querySelector('[data-wilayah="' + w + '"]'); if (pinEl) UI.goyang(pinEl);
      cfg.lang.eks('berpikir'); cfg.hud.potret('berpikir');
      var tingkat = cfg.santai ? Math.max(2, salahPer[id]) : salahPer[id], teks = js.teks;
      if (tingkat >= 2) { sorotPetunjuk(c); teks = teksPetunjuk2(c); } else if (typeof c.p === 'number') kedipMawar();
      if (tingkat >= 3) {
        teks = S.petunjuk3;
        p3[id] = true;
        var t = peta.titik(id);
        cfg.lang.pose('terbang', 'senang');
        cfg.lang.terbangKe(t.x + (t.x > 440 ? -96 : 96), t.y - 30, 0.32, 700);
        gambarPeta(id);
        var pin2 = lapisPin.querySelector('[data-wilayah="' + id + '"]');
        if (pin2) UI.tunjuk(pin2);
      }
      cfg.hud.instruksi(teks, false, tebalkan(teks, c));
      Bersama.ucap(teks, { lang: cfg.lang, hud: cfg.hud, eks: 'berpikir' });
    }
    function tebalkan(teks, c) { var h = UI.esc(teks); if (c && typeof c.p === 'number') { var a = UI.esc(STR.arah[c.p]); var i = h.indexOf(a); if (i >= 0) h = h.slice(0, i) + '<b>' + a + '</b>' + h.slice(i + a.length); } return h; }
    function teksPetunjuk2(c) {
      var o = { R: c.acuan != null ? m.nama(c.acuan) : '', arah: typeof c.p === 'number' ? STR.arah[c.p] : '', ciri: c.jenis === 'ciri' ? m.namaCiri(c.p) : '' };
      if (typeof c.p === 'number') return U.fmt(S.petunjuk2.arah, o);
      if (c.jenis === 'ciri') return U.fmt(S.petunjuk2.ciri, o);
      if (c.jenis === 'pedalaman') return S.petunjuk2.pedalaman;
      return U.fmt(S.petunjuk2.acuan, o);
    }
    /* petunjuk tingkat 2: wilayah acuan menyala; arah: garis bantu 8 arah dan sektor; ciri: bagian peta menyala */
    function sorotPetunjuk(c) {
      var s = '';
      if (c.acuan != null && peta.dWilayah(c.acuan)) s += '<path d="' + peta.dWilayah(c.acuan) + '" class="sorot-acuan"/>';
      if (typeof c.p === 'number' && c.acuan != null) { var t = peta.titik(c.acuan); s += Seni.garisBantu(t.x, t.y, cfg.panjangBantu || 150, c.p); s += '<circle cx="' + n1(t.x) + '" cy="' + n1(t.y) + '" r="30" class="cincin-acuan-teka"/>'; }
      if (c.jenis === 'ciri' && peta.fitur(c.p)) { var f = peta.fitur(c.p); s += '<circle cx="' + n1(f.x) + '" cy="' + n1(f.y) + '" r="34" class="cincin-fitur"/>'; }
      bantu.innerHTML = s;
    }
    function bersihBantu() { bantu.innerHTML = ''; sorotSeretId = null; }

    /* ---------- selesai ---------- */
    function selesai() {
      siap = false; terpilih = null;
      baki.innerHTML = '';
      var stat = { kartu: semua.length, langsung: langsung, p3: Object.keys(p3), salah: salahPer };
      if (cfg.onSelesai) cfg.onSelesai(stat);
    }
    function aturIdle() {
      UI.idle.atur(function () {
        if (!siap || !hidup) return null;
        if (mode === 'tanya') return null;
        var el = terpilih && elKartu(terpilih);
        return el && el.style.visibility !== 'hidden' ? el : null;
      });
    }

    /* ---------- pertanyaan serupa (akhir level): ketuk wilayah dari kalimat arah, semua wilayah bernama ---------- */
    function jawabTanya(id) {
      if (!tanyaQ || !siap) return;
      Voice.stop();
      var q = tanyaQ, t = peta.titik(id);
      if (id === q.sasaran) {
        siap = false; bersihBantu();
        Save.catat(cfg.tagArah || 'mata-angin', tanyaSalah === 0);
        Aud.sfx('good'); UI.ledak(t.x, t.y, 14);
        cfg.lang.pose('hinggap', 'sorak'); cfg.hud.potret('sorak');
        cfg.lang.terbangKe(cfg.posLang[0], cfg.posLang[1], cfg.posLang[2], 300, 0);
        cfg.hud.keping(tanyaSalah ? 5 : 10);
        var kal = Teka.kalimat(m, { jenis: 'arah', kartu: id, acuan: q.acuan, p: q.p }, S);
        cfg.hud.instruksi(kal, false, tebalkan(kal, q));
        Promise.all([Tween.wait(900), Bersama.ucap(kal, { lang: cfg.lang, hud: cfg.hud, eks: 'sorak' })]).then(function () { if (hidup && q.selesai) q.selesai(); });
        return;
      }
      if (id === q.acuan) { UI.toast(S.salah.acuan); return; }
      tanyaSalah++;
      Save.catatSalah(cfg.tagArah || 'mata-angin');
      Aud.sfx('bad');
      cfg.lang.eks('berpikir'); cfg.hud.potret('berpikir');
      var c = { jenis: 'arah', kartu: q.sasaran, acuan: q.acuan, p: q.p }, js = jenisSalah(c, id), teks = js.teks;
      if (['berlawanan', 'arah-antara', 'arah-lain'].indexOf(js.kode) >= 0) Save.catatMis(js.kode);
      if (tanyaSalah >= 2 || cfg.santai) { sorotPetunjuk(c); teks = teksPetunjuk2(c); } else kedipMawar();
      if (tanyaSalah >= 3) { teks = S.petunjuk3Tanya; var ts = peta.titik(q.sasaran); UI.tunjuk(ts); bantu.innerHTML += '<circle cx="' + n1(ts.x) + '" cy="' + n1(ts.y) + '" r="30" class="cincin-fitur"/>'; }
      cfg.hud.instruksi(teks, false, tebalkan(teks, c));
      Bersama.ucap(teks, { lang: cfg.lang, hud: cfg.hud, eks: 'berpikir' });
    }
    /* q: {acuan, p (arah), sasaran}; kembalikan Promise selesai */
    api.tanya = function (q) {
      return new Promise(function (ok) {
        mode = 'tanya'; tanyaQ = q; tanyaSalah = 0; q.selesai = ok;
        terpilih = null; bersihBantu(); gambarPeta(); baki.innerHTML = ''; baki.style.visibility = 'hidden';
        var kal = U.fmt(S.tanya, { arah: STR.arah[q.p], R: m.nama(q.acuan) });
        elNomor.textContent = S.kepalaTanya;
        elKompas.innerHTML = Seni.kompasMini(q.p, 92);
        elKalimat.innerHTML = UI.esc(kal).replace(UI.esc(STR.arah[q.p]), '<span class="arah-w">' + UI.esc(STR.arah[q.p]) + '</span>');
        kp.dataset.teks = kal; pasKan(elKalimat, 26, 20); UI.masuk(kp);
        var t = peta.titik(q.acuan);
        bantu.innerHTML = '<circle cx="' + n1(t.x) + '" cy="' + n1(t.y) + '" r="30" class="cincin-acuan-teka"/>';
        cfg.hud.instruksi(kal, false, tebalkan(kal, q));
        siap = true;
        bacakan(S.soalUlang).then(function () { if (hidup && siap) return bacakan(kal); });
        UI.idle.atur(function () { return null; });
      });
    };
    /* pertanyaan serupa: arah dari wilayah acuan yang menunjuk tepat satu wilayah lain di peta lengkap */
    api.buatSerupa = function (hindari, rnd) {
      var ids = m.ids.filter(function (x) { return peta.titik(x); }), calon = [];
      ids.forEach(function (R) {
        for (var d = 0; d < 8; d++) {
          var ya = ids.filter(function (X) { return X !== R && Teka.relArah(m, R, X, d) === 'ya'; });
          if (ya.length !== 1) continue;
          var lain = ids.every(function (X) { return X === R || X === ya[0] || Teka.relArah(m, R, X, d) === 'tidak'; });
          if (lain && (hindari || []).indexOf(R + '>' + d) < 0) calon.push({ acuan: R, p: d, sasaran: ya[0] });
        }
      });
      if (!calon.length) return null;
      return calon[Math.floor((rnd || Math.random)() * calon.length)];
    };

    /* ---------- mulai ---------- */
    api.mulai = function () {
      mode = 'pasang';
      gambarPeta();
      cfg.hud.kemajuan(0, semua.length);
      siap = true;
      pilihBerikut();
      aturIdle();
      /* masuk: peta memudar masuk, kartu petunjuk dan kartu nama muncul berurutan */
      UI.pudarMasuk(lapisPeta); UI.masuk(kp, 0);
      Array.prototype.forEach.call(baki.children, function (c, i) { UI.masuk(c, i + 1); });
      /* onboarding kartu pertama: tangan menunjuk kartu petunjuk, lalu wilayahnya */
      if (cfg.pandu) {
        UI.tunjuk(kp, { arah: 'kiri' });
        Tween.wait(2200).then(function () {
          if (!hidup || !siap || salahPer[terpilih] || kosong.length !== semua.length) return;
          var pin = lapisPin.querySelector('[data-wilayah="' + terpilih + '"]');
          if (pin) UI.tunjuk(pin);
        });
      }
    };
    api.hentikan = function () { hidup = false; siap = false; UI.sembunyiTangan(true); };
    api.bersihkan = function () { [lapisPeta, bantu, tangkap, lapisPin, kp, baki, lapisDepan].forEach(function (e) { if (e.parentNode) e.parentNode.removeChild(e); }); };
    api.gambarLengkap = function () { mode = 'lihat'; gambarPeta(); };
    api.mis = {};
    /* kait uji */
    api.keadaan = function () { return { mode: mode, siap: siap, terpilih: terpilih, kosong: kosong.slice(), bisa: kosong.filter(function (id) { return !!petunjuk(id); }), salah: terpilih ? (salahPer[terpilih] || 0) : tanyaSalah, tanya: tanyaQ && { acuan: tanyaQ.acuan, p: tanyaQ.p } }; };
    api.benar = function () {
      if (!siap) return [];
      if (mode === 'tanya') return ['wilayah-' + tanyaQ.sasaran];
      if (!terpilih || !petunjuk(terpilih)) { var b = kosong.filter(function (id) { return !!petunjuk(id); })[0]; return b ? ['kartu-' + b, 'pin-' + b] : []; }
      return ['kartu-' + terpilih, 'pin-' + terpilih];
    };
    api.salah = function () {
      if (!siap) return [];
      if (mode === 'tanya') { var lain = m.ids.filter(function (x) { return x !== tanyaQ.sasaran && x !== tanyaQ.acuan; }); return lain.length ? ['wilayah-' + lain[0]] : []; }
      var T = terpilih && petunjuk(terpilih) ? terpilih : kosong.filter(function (id) { return !!petunjuk(id); })[0];
      var w = kosong.filter(function (x) { return x !== T; })[0];
      return T && w ? ['kartu-' + T, 'pin-' + w] : [];
    };
    api.titik = function (id) { return peta.titik(id); };
    api.ketukWilayah = function (id) { ketukWilayah(id); };
    return api;
  }

  root.Papan = { buat: buat, petaPulau: petaPulau, pasKan: pasKan };
})(window);
