/* Pemilih soal Level 1 (Desa Lang). Terpisah dari layar supaya bisa diuji ribuan kali di Node (test/logic/soal-desa.js).
   Urutan dasar (GDD bagian 9): soal 1-2 dipandu (utara, timur dari tugu), soal 3-4 arah utama dari tugu (soal 4 jenis B),
   soal 5-6 arah antara dari tugu, soal 7-10 titik acuan berpindah. geser (-1..1) dari tingkat adaptif menggeser tingkat ini. */
(function (root) {
  var A = root.Arah || (typeof require !== 'undefined' ? require('./arah.js') : null);
  var JADWAL = [1, 1, 1, 1, 2, 2, 3, 3, 3, 3];
  function kunci(q) { return q.jenis + '|' + q.acuan + '|' + q.arah + '|' + (q.jenis === 'B' ? q.sasaran : ''); }
  function salin(q) { var h = {}; for (var k in q) h[k] = Array.isArray(q[k]) ? q[k].slice() : q[k]; return h; }

  function SoalDesa(tempat, rnd) {
    this.tempat = tempat; this.bank = A.bankDesa(tempat); this.rnd = rnd || Math.random;
    this.dipakai = {}; this.arahDipakai = {};
  }
  SoalDesa.JADWAL = JADWAL;
  SoalDesa.kunci = kunci;
  SoalDesa.prototype.tingkat = function (n, geser) { return Math.max(1, Math.min(3, JADWAL[Math.min(n, JADWAL.length - 1)] + (geser || 0))); };
  /* tingkat 1: arah utama dari tugu (jenis B baru boleh sesudah soal 4 memperkenalkannya); 2: semua dari tugu; 3: titik acuan lain */
  SoalDesa.prototype.calon = function (t, n) {
    return this.bank.filter(function (q) {
      if (t === 1) return q.acuan === 'tugu' && q.arah % 2 === 0 && (q.jenis === 'A' || n > 3);
      if (t === 2) return q.acuan === 'tugu';
      return q.acuan !== 'tugu';
    });
  };
  /* soal yang belum dipakai di level ini; bila tingkatnya habis, ambil dari tingkat tetangga (naik dulu) sebelum mengulang */
  SoalDesa.prototype.ambil = function (t, n, c) {
    var self = this, segar = function (d) { return d.filter(function (q) { return !self.dipakai[kunci(q)]; }); };
    var pilihan = segar(c);
    [t + 1, t - 1, t + 2, t - 2].forEach(function (t2) { if (!pilihan.length && t2 >= 1 && t2 <= 3) pilihan = segar(self.calon(t2, n)); });
    if (!pilihan.length) pilihan = c;
    var baru = pilihan.filter(function (q) { return !self.arahDipakai[q.arah]; });
    if (baru.length) pilihan = baru;
    return salin(pilihan[Math.floor(this.rnd() * pilihan.length)]);
  };
  SoalDesa.prototype.tandai = function (q) { this.dipakai[kunci(q)] = true; this.arahDipakai[q.arah] = true; return q; };
  /* soal ke-n (mulai 0) */
  SoalDesa.prototype.pilih = function (n, geser) {
    var q;
    if (n === 0) q = { jenis: 'A', acuan: 'tugu', arah: 0, sasaran: A.sasaranA(this.tempat, 'tugu', 0), pandu: 0 };
    else if (n === 1) q = { jenis: 'A', acuan: 'tugu', arah: 2, sasaran: A.sasaranA(this.tempat, 'tugu', 2), pandu: 1 };
    else {
      var self = this, t = this.tingkat(n, geser), c = this.calon(t, n);
      if (n === 3 && t <= 2) c = this.bank.filter(function (b) { return b.jenis === 'B' && b.acuan === 'tugu' && b.arah % 2 === 0; });
      else if (t === 2) { var antara = c.filter(function (b) { return b.arah % 2 === 1 && !self.dipakai[kunci(b)]; }); if (antara.length) c = antara; }
      q = this.ambil(t, n, c);
      if (n === 3 && q.jenis === 'B') q.panduB = true;
    }
    return this.tandai(q);
  };
  /* soal serupa untuk diulang di akhir level: jenis dan arah sama, titik acuan atau sasaran lain bila ada */
  SoalDesa.prototype.serupa = function (q) {
    var self = this, k = kunci(q), segar = function (b) { return kunci(b) !== k && !self.dipakai[kunci(b)]; };
    var c = this.bank.filter(function (b) { return b.jenis === q.jenis && b.arah === q.arah && segar(b); });
    if (!c.length) c = this.bank.filter(function (b) { return b.arah === q.arah && segar(b); });
    if (!c.length) return null;
    var h = salin(c[Math.floor(this.rnd() * c.length)]);
    h.ulang = true;
    return this.tandai(h);
  };
  root.SoalDesa = SoalDesa;
  if (typeof module !== 'undefined') module.exports = SoalDesa;
})(typeof window !== 'undefined' ? window : globalThis);
