/* Boot: simpanan, layar muat (huruf, lapisan diam yang dipanggang, daftar suara perangkat), lalu layar judul.
   Kait uji window.__test hanya aktif dengan ?test=1 dan tidak terlihat oleh murid. */
(function () {
  Save.load();
  bootStage();
  UI.applySettings();
  document.title = STR.judul.lengkap;
  document.getElementById('rotate-text').textContent = STR.putar;
  /* Arah memakai nama arah dari strings.js (sumber teks untuk guru) */
  if (STR.arah && STR.arah.length === 8) { Arah.NAMA.length = 0; STR.arah.forEach(function (a) { Arah.NAMA.push(a); }); }
  Muat.buka();

  function suaraSiap() {
    return new Promise(function (ok) {
      var ss = window.speechSynthesis;
      if (!ss || (ss.getVoices() || []).length) { ok(); return; }
      ss.addEventListener('voiceschanged', function () { ok(); });
      setTimeout(ok, 1200);
    });
  }
  var huruf = ['700 40px Fredoka', '600 32px Fredoka', '400 24px Andika', '700 24px Andika'].map(function (f) { return document.fonts.load(f).catch(function () { }); });
  Promise.all(huruf).then(function () {
    Muat.atur(0.35);
    /* lapisan diam dipanggang menjadi gambar supaya elemen SVG hidup tetap sedikit (GDD bagian 15) */
    return Promise.all([
      Seni.panggang('desa', 820, 552, Seni.desaAtas(PULAU_LATIHAN.desa)),
      Seni.panggang('judulLatar', 1280, 720, Scenes.reg.judul.latarDiam())
    ]);
  }).then(function () {
    Muat.atur(0.8);
    return suaraSiap();
  }).then(function () {
    Muat.atur(1);
    return Muat.tunggu();
  }).then(function () {
    Muat.tutup();
    Scenes.go('judul');
  });

  /* lama bermain (untuk Ringkasan untuk Guru), tidak dihitung saat tab tersembunyi atau di layar judul */
  setInterval(function () {
    if (Loop.paused || Stage.portrait || !Scenes.name || Scenes.name === 'judul') return;
    Save.data.detik++;
    if (Save.data.detik % 15 === 0) Save.save();
  }, 1000);

  if (U.TEST) {
    window.__test = {
      scene: function () { return Scenes.name; },
      keadaan: function () {
        var c = Scenes.cur, k = c && c.uji ? c.uji.keadaan() : {}, o = { scene: Scenes.name, busy: Scenes.busy, overlay: !!document.querySelector('.overlay') }, n;
        for (n in k) o[n] = k[n];
        o.siap = !!k.siap && !Scenes.busy;
        return o;
      },
      benar: function () { return Scenes.cur && Scenes.cur.uji ? Scenes.cur.uji.benar() : []; },
      salah: function () { return Scenes.cur && Scenes.cur.uji ? Scenes.cur.uji.salah() : []; },
      keLevel: function (n) { Scenes.go('level' + n); },
      ke: function (nama, p) { Scenes.go(nama, p); },
      aturSantai: function (b) { Save.data.settings.santai = !!b; Save.save(); },
      lewatiHook: function () { Save.data.hook = true; Save.save(); },
      simpanan: function () { return JSON.parse(JSON.stringify(Save.data)); },
      ucapan: function () { return Voice.log.slice(); },
      luap: function () { return UI.cekLuap(); },
      bankDesa: function () { return Arah.bankDesa(PULAU_LATIHAN.desa.tempat); },
      /* semua kalimat papan instruksi L1 diuji tinggi barisnya (hanya bisa saat Level 1 terbuka) */
      cekTeksL1: function () { var c = Scenes.cur; return c && c.L1cek ? c.L1cek() : null; }
    };
  }
})();
