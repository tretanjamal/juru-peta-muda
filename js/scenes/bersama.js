/* Bersama: potongan adegan yang dipakai hook dan Level 1: Lang hidup (ekspresi, pose, paruh bergerak saat bicara, terbang),
   peta Desa Lang dari atas (tempat berupa tombol, cincin titik acuan, garis bantu), dan mawar angin yang arahnya bisa diketuk. */
(function (root) {
  var NS = 'http://www.w3.org/2000/svg';
  function namaTempat(id, besar) { var t = STR.tempat[id]; return t ? t[besar ? 1 : 0] : id; }
  function besarAwal(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  var Bersama = {
    namaTempat: namaTempat,
    besarAwal: besarAwal,
    /* lapisan SVG seukuran panggung untuk tokoh dan bantuan yang bergerak (tidak menangkap ketukan) */
    lapisHidup: function (induk, kelas) {
      var s = document.createElementNS(NS, 'svg');
      s.setAttribute('width', 1280); s.setAttribute('height', 720); s.setAttribute('viewBox', '0 0 1280 720');
      s.setAttribute('class', 'lapis-hidup ' + (kelas || '')); s.setAttribute('aria-hidden', 'true');
      induk.appendChild(s);
      return s;
    },
    /* Lang di lapisan SVG. o: pose (hinggap | terbang), eks */
    lang: function (induk, x, y, s, o) {
      o = o || {};
      var g = document.createElementNS(NS, 'g'), eks = o.eks || 'senang', pose = o.pose || 'hinggap';
      function gambar() { g.innerHTML = Seni.lang(0, 0, 1, { pose: pose, ekspresi: eks, gerak: true }); }
      induk.appendChild(g);
      var api = {
        g: g, x: x, y: y, s: s,
        eks: function (e) { if (e === eks) return; eks = e; gambar(); },
        pose: function (p, e) { pose = p; if (e) eks = e; gambar(); },
        /* paruh membuka-menutup mengikuti kata, tanpa menggambar ulang tubuh (animasi diam tidak terulang) */
        mulut: function (buka) { var m = g.querySelector('.mulut-buka'); if (m) m.style.display = buka || eks === 'sorak' ? '' : 'none'; },
        geser: function (x2, y2, s2) { api.x = x2; api.y = y2; if (s2 != null) api.s = s2; g.setAttribute('transform', 'translate(' + api.x.toFixed(1) + ' ' + api.y.toFixed(1) + ') scale(' + api.s.toFixed(3) + ')'); },
        terbangKe: function (x2, y2, s2, ms, lengkung) {
          var x0 = api.x, y0 = api.y, s0 = api.s, s1 = s2 == null ? s0 : s2, L = lengkung == null ? 50 : lengkung;
          if (UI.kurangi) { api.geser(x2, y2, s1); return Promise.resolve(); }
          return Tween.run(ms || 800, function (e) { api.geser(x0 + (x2 - x0) * e, y0 + (y2 - y0) * e - Math.sin(e * Math.PI) * L, s0 + (s1 - s0) * e); }, Ease.easeInOutCubic);
        }
      };
      gambar(); api.geser(x, y, s);
      return api;
    },
    /* Lang berbicara (id-ID): paruh Lang dan potret HUD bergerak mengikuti kata. Tanpa suara: selesai setelah waktu baca. */
    ucap: function (teks, o) {
      o = o || {};
      UI.cekSuara();
      var n = teks.split(/\s+/).length;
      return Voice.say(teks, {
        tokoh: 'lang', lang: 'id-ID',
        onWord: function (i) {
          var buka = i < n && i % 2 === 0;
          if (o.lang) o.lang.mulut(buka);
          if (o.hud) o.hud.potret(buka ? 'bicara' : (o.eks || 'senang'));
        }
      });
    },

    /* Peta Desa Lang dari atas. x, y = sudut kiri atas di panggung (ukuran desa 820 x 552).
       o.onTempat(id, el): tempat diketuk. Mengembalikan pengendali. */
    petaDesa: function (induk, x, y, o) {
      o = o || {};
      var D = PULAU_LATIHAN.desa, w = D.ukuran[0], h = D.ukuran[1];
      var wadah = U.h('div', 'peta-desa' + (o.kelas ? ' ' + o.kelas : ''));
      wadah.style.cssText = 'left:' + x + 'px;top:' + y + 'px;width:' + w + 'px;height:' + h + 'px';
      wadah.innerHTML = Seni.lapisDiam('desa', w, h, Seni.desaAtas(D));
      var bantu = document.createElementNS(NS, 'svg');
      bantu.setAttribute('width', w); bantu.setAttribute('height', h); bantu.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
      bantu.setAttribute('class', 'lapis-bantu'); bantu.setAttribute('aria-hidden', 'true');
      wadah.appendChild(bantu);
      var tombol = {};
      D.tempat.forEach(function (t) {
        var b = U.h('button', 'tempat-desa');
        b.type = 'button'; b.dataset.id = 'tempat-' + t.id; b.dataset.tempat = t.id;
        b.style.left = (t.titik[0] - 60) + 'px'; b.style.top = (t.titik[1] - 60) + 'px';
        b.setAttribute('aria-label', namaTempat(t.id, true));
        var nama = namaTempat(t.id, true);
        b.innerHTML = Seni.svg(120, 120, Seni.tempat(t.id), { vb: '-60 -60 120 120' }) +
          '<span class="label-tempat"><span data-cek="label ' + t.id + '">' + UI.esc(nama) + '</span></span>';
        b.addEventListener('pointerdown', function () { Aud.init(); });
        b.addEventListener('click', function () { if (o.onTempat) o.onTempat(t.id, b); });
        wadah.appendChild(b);
        tombol[t.id] = b;
      });
      induk.appendChild(wadah);
      var byId = {}; D.tempat.forEach(function (t) { byId[t.id] = t; });
      var api = {
        el: wadah, tombol: tombol, D: D,
        titik: function (id) { var t = byId[id].titik; return { x: x + t[0], y: y + t[1] }; },
        /* cincin titik acuan berdenyut */
        acuan: function (id) {
          Array.prototype.forEach.call(wadah.querySelectorAll('.tempat-desa'), function (b) { b.classList.toggle('acuan', b.dataset.tempat === id); });
          api._acuan = id; api.gambarBantu();
        },
        _acuan: null, _sektor: null, _garis: false, _matahari: false,
        /* garis bantu 8 arah dari titik acuan. sektor: arah yang disorot (atau null) */
        bantu: function (garis, sektor) { api._garis = !!garis; api._sektor = sektor == null ? null : sektor; api.gambarBantu(); },
        matahari: function (on) { api._matahari = on; api.gambarBantu(); },
        gambarBantu: function () {
          var s = '';
          if (api._acuan) {
            var t = byId[api._acuan].titik;
            s += '<circle cx="' + t[0] + '" cy="' + t[1] + '" r="64" fill="none" stroke="' + Seni.W.jingga + '" stroke-width="6" stroke-dasharray="12 9" class="cincin-acuan"/>';
            if (api._garis) s += Seni.garisBantu(t[0], t[1], 300, api._sektor == null ? undefined : api._sektor);
          }
          if (api._matahari) s += Seni.matahari(D.matahari[0], D.matahari[1], 22, 'denyut');
          bantu.innerHTML = s;
        },
        aktif: function (on) { Array.prototype.forEach.call(wadah.querySelectorAll('.tempat-desa'), function (b) { b.disabled = !on; }); },
        sorot: function (id, on) { if (tombol[id]) tombol[id].classList.toggle('sorot', on !== false); }
      };
      return api;
    },

    /* Mawar angin besar dengan 8 arah yang bisa diketuk (Level 1 jenis B). cx, cy, r di panggung. o.onArah(i) */
    mawar: function (induk, cx, cy, r, o) {
      o = o || {};
      var s = document.createElementNS(NS, 'svg'), uk = Math.max(20, Math.round(r * 0.3)), uk8 = Math.max(20, Math.round(r * 0.2));
      s.setAttribute('width', 1280); s.setAttribute('height', 720); s.setAttribute('viewBox', '0 0 1280 720');
      s.setAttribute('class', 'lapis-mawar'); s.setAttribute('aria-hidden', 'true');
      induk.appendChild(s);
      var sorot, tombol = [], kedip = false;
      function gambar() { s.innerHTML = '<g class="' + (kedip ? 'kedip-mawar' : '') + '">' + Seni.mawarAngin(cx, cy, r, { label8: true, sorot: sorot }) + '</g>'; }
      for (var i = 0; i < 8; i++) (function (k) {
        var jarak = k % 2 ? r * 0.62 + uk8 * 1.05 : r * 0.94 + uk * 0.66, a = k * Math.PI / 4;
        var b = U.h('button', 'arah-mawar');
        b.type = 'button'; b.dataset.id = 'arah-' + k; b.disabled = true;
        b.style.left = Math.round(cx + Math.sin(a) * jarak - 34) + 'px'; b.style.top = Math.round(cy - Math.cos(a) * jarak - 34) + 'px';
        b.setAttribute('aria-label', STR.arah[k]);
        b.addEventListener('pointerdown', function () { Aud.init(); });
        b.addEventListener('click', function () { if (o.onArah) o.onArah(k, b); });
        induk.appendChild(b);
        tombol.push(b);
      })(i);
      gambar();
      return {
        tombol: tombol,
        aktif: function (on) { tombol.forEach(function (b) { b.disabled = !on; }); induk.classList.toggle('mawar-aktif', !!on); },
        sorot: function (i) { sorot = i == null ? undefined : i; gambar(); },
        kedip: function (on) { kedip = on !== false; gambar(); if (kedip) setTimeout(function () { kedip = false; gambar(); }, 2400); }
      };
    }
  };
  root.Bersama = Bersama;
})(window);
