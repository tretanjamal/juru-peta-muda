/* Save: progres di localStorage (try/catch); tetap jalan bila penyimpanan diblokir. Tanpa data pribadi.
   Disalin dari Kafe Cilik dan disesuaikan: keping kompas, hiasan Kantor Peta, wilayah pilihan murid dan wilayah bawaan kelas
   (kode Kemendagri; hanya di perangkat ini, tidak dikirim ke mana pun). Data dibersihkan saat dimuat. */
(function (root) {
  var KEY = 'juruPeta.v1';
  var memory = null;
  var SETEL = { senyap: false, musik: true, efek: true, suara: true, bacakan: true, santai: false, kurangi: false };
  function fresh() {
    var s = {}, k;
    for (k in SETEL) s[k] = SETEL[k];
    return {
      settings: s,
      hook: false,        // hook 10 detik sudah diputar
      keping: 0,          // keping kompas
      dekor: 0,           // jumlah hiasan Kantor Peta yang sudah diperlihatkan
      level: {},          // nomor -> { selesai, bintang, petunjuk3, detik }
      keterampilan: {},   // tag -> { kesempatan, benarAwal, salah }
      miskonsepsi: {},    // kode -> jumlah muncul
      wilayah: { prov: '', kab: '' },   // pilihan murid (L4)
      kelas: { prov: '', kab: '' },     // wilayah bawaan kelas dari guru
      detik: 0            // lama bermain total
    };
  }
  function isObj(o) { return !!o && typeof o === 'object' && !Array.isArray(o); }
  function angka(v) { return typeof v === 'number' && isFinite(v) && v >= 0; }
  function kode(v) { return typeof v === 'string' && /^[0-9.]{0,8}$/.test(v) ? v : ''; }
  function clean(d) {
    var f = fresh(), k;
    if (!isObj(d)) return f;
    if (!isObj(d.settings)) d.settings = f.settings;
    for (k in f.settings) if (typeof d.settings[k] !== 'boolean') d.settings[k] = f.settings[k];
    for (k in d.settings) if (!(k in f.settings)) delete d.settings[k];
    if (typeof d.hook !== 'boolean') d.hook = false;
    ['keping', 'detik', 'dekor'].forEach(function (n) { if (!angka(d[n])) d[n] = f[n]; });
    ['level', 'keterampilan', 'miskonsepsi'].forEach(function (n) { if (!isObj(d[n])) d[n] = {}; });
    ['wilayah', 'kelas'].forEach(function (n) { if (!isObj(d[n])) d[n] = { prov: '', kab: '' }; d[n] = { prov: kode(d[n].prov), kab: kode(d[n].kab) }; });
    Object.keys(d.level).forEach(function (n) {
      var v = d.level[n];
      if (!isObj(v) || !angka(v.bintang) || typeof v.selesai !== 'boolean') delete d.level[n];
    });
    Object.keys(d.keterampilan).forEach(function (t) {
      var v = d.keterampilan[t];
      if (!isObj(v) || !angka(v.kesempatan) || !angka(v.benarAwal) || !angka(v.salah)) delete d.keterampilan[t];
    });
    Object.keys(d.miskonsepsi).forEach(function (t) { if (!angka(d.miskonsepsi[t])) delete d.miskonsepsi[t]; });
    Object.keys(d).forEach(function (k) { if (!(k in f)) delete d[k]; });
    return d;
  }
  function slot(tag) { return Save.data.keterampilan[tag] || (Save.data.keterampilan[tag] = { kesempatan: 0, benarAwal: 0, salah: 0 }); }

  var Save = {
    data: fresh(),
    load: function () {
      try {
        var raw = root.localStorage.getItem(KEY);
        if (raw) Save.data = clean(JSON.parse(raw));
      } catch (e) { Save.data = memory || fresh(); }
    },
    save: function () {
      memory = Save.data;
      try { root.localStorage.setItem(KEY, JSON.stringify(Save.data)); } catch (e) { /* diblokir: abaikan */ }
    },
    /* satu kesempatan keterampilan selesai; langsung = benar pada coba pertama */
    catat: function (tag, langsung) { var s = slot(tag); s.kesempatan++; if (langsung) s.benarAwal++; },
    catatSalah: function (tag) { slot(tag).salah++; },
    catatMis: function (kode) { if (kode) Save.data.miskonsepsi[kode] = (Save.data.miskonsepsi[kode] || 0) + 1; },
    /* status untuk Ringkasan untuk Guru (GDD bagian 4) */
    status: function (tag) {
      var s = Save.data.keterampilan[tag];
      if (!s || !s.kesempatan) return 'belum';
      var r = s.benarAwal / s.kesempatan;
      if (r >= 0.8 && s.kesempatan >= 5) return 'dikuasai';
      return r >= 0.5 ? 'berkembang' : 'latihan';
    },
    selesai: function (n) { var l = Save.data.level[n]; return !!(l && l.selesai); },
    terbuka: function (n) { return n <= 1 || Save.selesai(n - 1); },
    catatLevel: function (n, isi) {
      var lama = Save.data.level[n] || { selesai: false, bintang: 0, petunjuk3: 0, detik: 0 };
      Save.data.level[n] = {
        selesai: lama.selesai || !!isi.selesai,
        bintang: Math.max(lama.bintang, isi.bintang || 0),
        petunjuk3: isi.petunjuk3 || 0,
        detik: isi.detik || 0
      };
      Save.save();
    },
    tambahKeping: function (n) { Save.data.keping += n; Save.save(); return Save.data.keping; },
    /* Murid baru di perangkat yang sama: progres dan wilayah murid dihapus; pengaturan dan wilayah bawaan kelas tetap */
    newStudent: function () { var s = Save.data.settings, k = Save.data.kelas; Save.data = fresh(); Save.data.settings = s; Save.data.kelas = k; Save.save(); }
  };
  root.Save = Save;
})(typeof window !== 'undefined' ? window : globalThis);
