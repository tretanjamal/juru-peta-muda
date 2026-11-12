/* Panel "Untuk guru" di Level 4: tombol ditahan 3 detik (mencegah murid membuka tanpa sengaja), lalu guru memilih
   provinsi dan kabupaten/kota sekolah (wilayah kelas). Wilayah kelas disimpan di perangkat saja (Save.data.kelas).
   GuruWilayah.tombol(induk, cb): pasang tombol. cb.sebelum() saat panel dibuka, cb.sesudah() saat ditutup.
   Simpan atau Hapus memuat ulang Level 4 supaya alurnya mengikuti wilayah kelas yang baru. */
(function (root) {
  var urutNama = Nama.urut;

  function tombol(induk, cb) {
    var S = STR.l4, waktu = null;
    var b = Input.button(UI.ikon('guru', 30) + '<span class="teks-guru-tombol">' + UI.esc(S.guru.tombol) + '<small>' + UI.esc(S.guru.tahan) + '</small></span>', 'ketiga tahan-guru', null, { x: 24, y: 624, w: 240, h: 72, id: 'untuk-guru' });
    function mulai() {
      if (waktu) return;
      b.classList.add('ditahan');
      var t1 = performance.now();
      waktu = setInterval(function () {
        var e = Math.min(1, (performance.now() - t1) / 3000);
        b.style.setProperty('--tahan', (e * 100).toFixed(0) + '%');
        if (e >= 1) { batal(); Aud.sfx('pilih'); buka(cb || {}); }
      }, 50);
    }
    function batal() { clearInterval(waktu); waktu = null; b.classList.remove('ditahan'); b.style.setProperty('--tahan', '0%'); }
    b.addEventListener('pointerdown', mulai); b.addEventListener('pointerup', batal); b.addEventListener('pointerleave', batal); b.addEventListener('pointercancel', batal);
    b.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); mulai(); } });
    b.addEventListener('keyup', function (e) { if (e.key === 'Enter' || e.key === ' ') batal(); });
    induk.appendChild(b);
    return b;
  }

  function buka(cb) {
    var S = STR.l4;
    if (cb.sebelum) cb.sebelum();
    Peta.muat(function (ok) {
      if (!ok) { if (cb.sesudah) cb.sesudah(); UI.toast(S.gagalMuat); return; }
      var G = S.guru, o = UI.overlay(G.judul, 'panel-guru-wilayah'), D = Peta.data();
      var k0 = Save.data.kelas || {};
      function teksSekarang() { var k = Save.data.kelas; return U.fmt(G.sekarang, { w: k && k.kab ? Peta.kab(k.kab).label + ', ' + PetaIndo.namaProv(k.prov) : G.belum }); }
      o.body.insertAdjacentHTML('beforeend', '<p class="teks-guru-wilayah">' + UI.esc(G.isi) + '</p><p class="teks-guru-wilayah sekarang" data-cek="guru sekarang">' + UI.esc(teksSekarang()) + '</p>' +
        '<label class="pilih-guru">' + UI.esc(G.prov) + '<select data-id="guru-prov"></select></label><label class="pilih-guru">' + UI.esc(G.kab) + '<select data-id="guru-kab"></select></label>');
      var sp = o.body.querySelector('[data-id="guru-prov"]'), sk = o.body.querySelector('[data-id="guru-kab"]');
      sp.innerHTML = '<option value="">' + UI.esc(G.kosong) + '</option>' + D.provinsi.slice().sort(function (a, b) { return Nama.prov(a).localeCompare(Nama.prov(b), 'id'); }).map(function (p) { return '<option value="' + p.kode + '">' + UI.esc(Nama.prov(p)) + '</option>'; }).join('');
      function isiKab() { sk.innerHTML = '<option value="">' + UI.esc(G.kosong) + '</option>' + (sp.value ? Peta.kabDi(sp.value).slice().sort(urutNama).map(function (k) { return '<option value="' + k.kode + '">' + UI.esc(k.label) + '</option>'; }).join('') : ''); }
      sp.value = k0.prov || ''; isiKab(); sk.value = k0.kab || '';
      sp.addEventListener('change', isiKab);
      var baris = U.h('div', 'baris-tombol');
      baris.appendChild(Input.button(UI.esc(G.simpan), 'utama', function () {
        if (!sp.value || !sk.value) { UI.goyang(sk); return; }
        Save.data.kelas = { prov: sp.value, kab: sk.value }; Save.save(); UI.toast(G.tersimpan); o.close(); Scenes.go('level4');
      }, { id: 'guru-simpan' }));
      baris.appendChild(Input.button(UI.esc(G.hapus), 'ketiga', function () { Save.data.kelas = { prov: '', kab: '' }; Save.save(); UI.toast(G.terhapus); o.close(); Scenes.go('level4'); }, { id: 'guru-hapus' }));
      o.body.appendChild(baris);
      UI.tombolTutup(o);
      o.onClose = function () { if (cb.sesudah) cb.sesudah(); };
    });
  }

  root.GuruWilayah = { tombol: tombol, buka: buka };
})(window);
