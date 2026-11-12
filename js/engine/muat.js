/* Layar muat: logo, garis pantai Pulau Latihan yang tergambar sedikit demi sedikit sebagai batang kemajuan, dan satu "Tahukah kamu?".
   Pola dari Kafe Cilik (asal Lompat Waktu): tampil minimal MIN ms supaya sempat terbaca, kemajuan tidak pernah mundur. */
(function (root) {
  var MIN = U.TEST && !/[?&]muat=1/.test(location.search) ? 0 : 1800, el = null, t0 = 0, nilai = 0, panjang = 1;
  function garisPantai() {
    var D = root.PULAU_LATIHAN, pts = [];
    ['p_bh_n', 'p_ga', 'p_kc', 'p_dt', 'p_hd_n', 'p_tj', 'p_hd_s', 'p_pb', 'p_lm'].forEach(function (k) { var t = D.garis[k].titik; pts = pts.concat(pts.length ? t.slice(1) : t); });
    return pts.map(function (p, i) { return (i ? 'L' : 'M') + Math.round((p[0] - 30) * 0.42) + ' ' + Math.round((p[1] - 100) * 0.42); }).join('') + 'Z';
  }
  var Muat = {
    buka: function () {
      t0 = performance.now(); nilai = 0;
      var tips = STR.muatTips, W = Seni.W;
      el = U.h('div', '',
        '<div class="muat-logo">' + Seni.svg(540, 300, Seni.logo(8, 0), { vb: '0 0 540 300' }) + '</div>' +
        '<div class="muat-peta">' + Seni.svg(420, 210, '<rect x="2" y="2" width="416" height="206" rx="16" fill="' + W.laut + '" stroke="' + W.tinta + '" stroke-width="4"/>' +
          '<g transform="translate(16 18)"><path id="muat-pulau-isi" d="' + garisPantai() + '" fill="' + Seni.ISI.hijau + '" opacity="0"/>' +
          '<path id="muat-pulau" d="' + garisPantai() + '" fill="none" stroke="' + W.tinta + '" stroke-width="4" stroke-linejoin="round"/></g>') + '</div>' +
        '<div class="muat-teks"></div>' +
        '<div class="muat-tip"><b>' + UI.esc(STR.muatTahu) + '</b>' + UI.esc(tips[Math.floor(Math.random() * tips.length)]) + '</div>');
      el.id = 'muat';
      Stage.el.appendChild(el);
      var p = el.querySelector('#muat-pulau');
      try { panjang = p.getTotalLength() || 1; } catch (e) { panjang = 1600; }
      p.style.strokeDasharray = panjang;
      Muat.atur(0);
    },
    /* k: 0 sampai 1; garis pantai tergambar, lalu daratan terisi warna */
    atur: function (k) {
      if (!el) return;
      nilai = Math.max(nilai, k);
      el.querySelector('#muat-pulau').style.strokeDashoffset = panjang * (1 - nilai);
      el.querySelector('#muat-pulau-isi').setAttribute('opacity', nilai >= 1 ? 1 : 0);
      el.querySelector('.muat-teks').textContent = STR.muat + '... ' + Math.round(nilai * 100) + '%';
    },
    tunggu: function () { return new Promise(function (ok) { setTimeout(ok, Math.max(0, MIN - (performance.now() - t0))); }); },
    tutup: function () {
      if (!el) return;
      var e = el;
      el = null;
      if (!MIN) { e.remove(); return; }
      e.classList.add('tutup');
      setTimeout(function () { e.remove(); }, 420);
    }
  };
  root.Muat = Muat;
})(window);
