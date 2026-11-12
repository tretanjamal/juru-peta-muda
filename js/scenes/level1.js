/* Level 1 Kompas Lang (GDD bagian 9, TP1, tag mata-angin). Desa Lang dari atas, mawar angin besar di kanan.
   Jenis A: ketuk tempat di arah yang disebut dari titik acuan (Lang tidak menyebut nama tempatnya).
   Jenis B: ketuk arah di mawar angin untuk tempat yang disebut.
   Urutan dasar: soal 1-4 arah utama dari tugu (1-2 dipandu tangan), 5-6 arah antara, 7-10 titik acuan berpindah.
   Adaptif: 3 benar beruntun naik satu tingkat, 2 salah beruntun turun (dalam batas satu tingkat dari urutan dasar).
   Petunjuk bertingkat: 1 pesan sesuai jenis kesalahan + mawar angin berkedip; 2 garis bantu dan sektor arah; 3 Lang terbang dan tangan menunjuk.
   Soal yang dibantu petunjuk ke-3 diulang dalam bentuk serupa di akhir level (maks. 2). */
(function () {
  var L1 = null;
  var JUMLAH = 10;

  function namaArah(i) { return STR.arah[((i % 8) + 8) % 8]; }
  function tebal(teksAman, kata) { var k = UI.esc(kata), i = teksAman.indexOf(k); return i < 0 ? teksAman : teksAman.slice(0, i) + '<b>' + k + '</b>' + teksAman.slice(i + k.length); }

  Scenes.add('level1', {
    enter: function (root) {
      var W = Seni.W, D = PULAU_LATIHAN.desa, GEN = new SoalDesa(D.tempat), BANK = GEN.bank, santai = Save.data.settings.santai, t0 = performance.now();
      var nama = Bersama.namaTempat, besar = Bersama.besarAwal;
      Aud.musik('jelajah'); Aud.pramuatJingle('lengkap');

      /* latar: meja kayu, kertas peta, kartu mawar angin */
      var latar = U.h('div', 'lapis');
      latar.innerHTML = Seni.svg(1280, 720,
        '<rect width="1280" height="720" fill="' + W.kayu + '"/><rect width="1280" height="720" fill="url(#pola-kayu)"/>' +
        '<rect x="16" y="106" width="844" height="604" rx="18" fill="' + W.tinta + '" opacity=".28"/>' +
        '<rect x="16" y="100" width="844" height="604" rx="18" fill="' + W.kertas + '" stroke="' + W.tinta + '" stroke-width="4"/>' +
        '<rect x="876" y="106" width="388" height="352" rx="24" fill="' + W.tinta + '" opacity=".28"/>' +
        '<rect x="876" y="100" width="388" height="352" rx="24" fill="' + W.kertas + '" stroke="' + W.tinta + '" stroke-width="4"/>' +
        '<ellipse cx="944" cy="700" rx="62" ry="8" fill="' + W.tinta + '" opacity=".18"/>' +
        '<g transform="translate(946 664) rotate(-24)"><rect x="-56" y="-14" width="74" height="28" rx="6" fill="' + W.cokelat + '" stroke="' + W.tinta + '" stroke-width="4"/><rect x="14" y="-18" width="44" height="36" rx="6" fill="' + W.jinggaGelap + '" stroke="' + W.tinta + '" stroke-width="4"/><rect x="-74" y="-10" width="22" height="20" rx="4" fill="' + W.pasirGelap + '" stroke="' + W.tinta + '" stroke-width="4"/><path d="M-30-14v28M0-14v28" stroke="' + W.tinta + '" stroke-width="3"/></g>' +
        '<ellipse cx="1206" cy="700" rx="52" ry="8" fill="' + W.tinta + '" opacity=".18"/>' +
        [[1186, 684, W.kertas], [1226, 684, W.pasir], [1206, 660, W.lautTerang]].map(function (r) { return '<rect x="' + (r[0] - 22) + '" y="' + (r[1] - 46) + '" width="44" height="62" rx="20" transform="rotate(90 ' + r[0] + ' ' + r[1] + ')" fill="' + r[2] + '" stroke="' + W.tinta + '" stroke-width="3"/><ellipse cx="' + (r[0] + 30) + '" cy="' + r[1] + '" rx="8" ry="11" fill="' + W.pasirTerang + '" stroke="' + W.tinta + '" stroke-width="2.5"/>'; }).join(''));
      root.appendChild(latar);
      root.appendChild(U.h('h1', 'tersembunyi', UI.esc(U.fmt(STR.level.judul, { n: 1, nama: STR.level.nama[1] }))));
      var jp = U.h('p', 'judul-peta', UI.esc(STR.peta.desa));
      jp.style.cssText = 'left:28px;top:107px;width:820px'; jp.setAttribute('data-cek', 'judul peta');
      root.appendChild(jp);
      var lm = U.h('p', 'label-mawar', UI.esc(STR.peta.mawar));
      lm.style.cssText = 'left:896px;top:112px'; root.appendChild(lm);

      var hud = UI.hud(root, { level: 1, jeda: { ulangi: function () { Scenes.go('level1'); } } });
      var peta = Bersama.petaDesa(root, 28, 144, { onTempat: ketukTempat });
      var mawar = Bersama.mawar(root, 1070, 290, 100, { onArah: ketukArah });
      var lapis = Bersama.lapisHidup(root);
      var POS_LANG = [1070, 702, 0.62];
      var lang = Bersama.lang(lapis, POS_LANG[0], POS_LANG[1], POS_LANG[2], { eks: 'senang' });

      var daftar = [], tambahan = 0, nomor = 0, soal = null, salah = 0, siap = false, petunjuk3 = 0, adaP3 = false, mis = {};
      var ad = new Adaptif(-1, 1, 0);
      L1 = { hidup: true };
      function total() { return JUMLAH + tambahan; }
      function bacakan(teks) { return Save.data.settings.bacakan ? Bersama.ucap(teks, { lang: lang, hud: hud }) : Promise.resolve(); }

      /* ---------- memilih soal: js/engine/soaldesa.js ---------- */
      /* ---------- menampilkan soal ---------- */
      function tampilkan() {
        if (!L1.hidup) return;
        soal = daftar[nomor] || (daftar[nomor] = GEN.pilih(nomor, ad.t));
        salah = 0; adaP3 = false;
        peta.acuan(soal.acuan); peta.bantu(santai, null); peta.matahari(false);
        mawar.sorot(null); mawar.aktif(soal.jenis === 'B'); peta.aktif(soal.jenis === 'A');
        Object.keys(peta.tombol).forEach(function (id) { peta.sorot(id, false); });
        hud.sub(U.fmt(STR.level.soal, { i: nomor + 1, n: total() }));
        hud.kemajuan(nomor, total());
        lang.eks('senang'); hud.potret('senang');
        var teks, html;
        if (soal.jenis === 'A') {
          teks = soal.pandu != null ? STR.l1.pandu[soal.pandu] : U.fmt(STR.l1.a, { arah: namaArah(soal.arah), acuan: nama(soal.acuan) });
          /* nama arah ditebalkan (kemunculan huruf kecil pertama; "Utara" di awal kalimat pandu tidak ikut) */
          html = tebal(UI.esc(teks), namaArah(soal.arah));
        } else {
          teks = U.fmt(STR.l1.b, { Tempat: besar(nama(soal.sasaran)), acuan: nama(soal.acuan) });
          html = tebal(UI.esc(teks), besar(nama(soal.sasaran)));
        }
        hud.instruksi(teks, false, html);
        siap = true;
        var mulai = soal.ulang ? bacakan(STR.l1.soalUlang) : (soal.panduB ? bacakan(STR.l1.panduB) : Promise.resolve());
        mulai.then(function () { if (L1.hidup && siap) return bacakan(teks); });
        pandu();
        UI.idle.atur(function () { return siap ? sasaranEl() : null; });
      }
      function sasaranEl() { return soal.jenis === 'A' ? peta.tombol[soal.sasaran[0]] : mawar.tombol[soal.arah]; }
      /* onboarding: soal 1-2 tangan menunjuk huruf arah di mawar angin, lalu tempatnya; jenis B pertama menunjuk mawar angin */
      function pandu() {
        if (soal.pandu != null) {
          UI.tunjuk(mawar.tombol[soal.arah]);
          Tween.wait(1800).then(function () { if (L1.hidup && siap && soal.pandu != null && !salah) UI.tunjuk(peta.tombol[soal.sasaran[0]]); });
        } else if (soal.panduB) UI.tunjuk(mawar.tombol[soal.arah === 0 ? 2 : 0], { sumber: 'idle' });
      }

      /* ---------- jawaban ---------- */
      function ketukTempat(id, el) {
        if (!siap || !soal) return;
        UI.idle.reset();
        if (soal.jenis === 'B') { mawar.kedip(); UI.toast(STR.l1.panduBSingkat); return; }
        Voice.stop();
        if (soal.sasaran.indexOf(id) >= 0) benar(el, id); else salahTempat(el, id);
      }
      function ketukArah(k, el) {
        if (!siap || !soal || soal.jenis !== 'B') return;
        UI.idle.reset(); Voice.stop();
        if (k === soal.arah) benar(el, soal.sasaran); else salahArah(el, k);
      }
      function benar(el, tempatId) {
        siap = false;
        peta.aktif(false); mawar.aktif(false); UI.sembunyiTangan(true);
        var langsung = salah === 0;
        Save.catat('mata-angin', langsung);
        ad.catat(langsung);
        Aud.sfx('good');
        UI.lompat(el);
        var q = UI.titik(el); if (q) UI.ledak(q.x, q.y, 14);
        if (soal.jenis === 'B') mawar.sorot(soal.arah); else peta.sorot(tempatId, true);
        lang.terbangKe(POS_LANG[0], POS_LANG[1], POS_LANG[2], 300, 0);
        lang.pose('hinggap', 'sorak'); hud.potret('sorak');
        hud.keping(langsung ? 10 : 5);
        if (adaP3 && tambahan < 2) { var s = GEN.serupa(soal); if (s) { daftar[JUMLAH + tambahan] = s; tambahan++; } }
        var kalimat = U.fmt(STR.l1.benar, { Tempat: besar(nama(tempatId)), arah: namaArah(soal.arah), acuan: nama(soal.acuan) });
        hud.instruksi(kalimat, false, tebal(UI.esc(kalimat), namaArah(soal.arah)));
        hud.kemajuan(nomor + 1, total());
        Promise.all([Bersama.ucap(kalimat, { lang: lang, hud: hud, eks: 'sorak' }), Tween.wait(1200)]).then(function () {
          if (!L1.hidup) return;
          nomor++;
          if (nomor < total()) tampilkan(); else selesai();
        });
      }
      /* jenis kesalahan: tempat yang diketuk dilihat dari titik acuan, dan dari tugu (untuk miskonsepsi titik acuan) */
      function salahTempat(el, id) {
        var acuan = peta.titik(soal.acuan), t = peta.titik(id), tugu = peta.titik('tugu'), arahKetuk = null, kode;
        if (id === soal.acuan) kode = 'acuan';
        else {
          arahKetuk = Arah.dari([acuan.x, acuan.y], [t.x, t.y]).arah;
          kode = Arah.jenisSalah(soal.arah, arahKetuk, { acuan: soal.acuan, arahDariTugu: id === 'tugu' ? null : Arah.dari([tugu.x, tugu.y], [t.x, t.y]).arah });
        }
        tolak(el, kode, arahKetuk);
      }
      function salahArah(el, k) { tolak(el, Arah.jenisSalah(soal.arah, k, {}), k); }
      function pesan(kode, arahKetuk) {
        return pesanUntuk(kode, soal.arah, arahKetuk, soal.acuan);
      }
      function pesanUntuk(kode, a, arahKetuk, acuan) {
        var S = STR.l1.salah;
        switch (kode) {
          case 'acuan': return U.fmt(S.acuan, { acuan: nama(acuan), arah: namaArah(a) });
          case 'titik-acuan': return U.fmt(S['titik-acuan'], { acuan: nama(acuan) });
          case 'berlawanan': return a === 2 ? S.timur : (a === 6 ? S.barat : U.fmt(S.berlawanan, { kebalikan: namaArah(arahKetuk), Arah: besar(namaArah(a)) }));
          case 'arah-antara': return a % 2 ? U.fmt(S['arah-antara'], { Arah: besar(namaArah(a)), a: namaArah(a - 1), b: namaArah(a + 1) }) : U.fmt(S['arah-utama'], { ketuk: namaArah(arahKetuk), singkat: STR.arahSingkat[a] });
          default: return U.fmt(S['arah-lain'], { singkat: STR.arahSingkat[a] });
        }
      }
      /* Uji: semua kalimat yang mungkin tampil di papan instruksi L1 dicoba satu per satu; yang lebih dari 2 baris dilaporkan. */
      function semuaTeks() {
        var t = [], A = STR.l1;
        STR.l1.pandu.forEach(function (x) { t.push(x); });
        [A.panduB, A.panduBSingkat, A.petunjuk3, A.petunjuk3B, A.soalUlang, A.selesai].forEach(function (x) { t.push(x); });
        BANK.forEach(function (q) {
          if (q.jenis === 'A') {
            t.push(U.fmt(A.a, { arah: namaArah(q.arah), acuan: nama(q.acuan) }));
            q.sasaran.forEach(function (s) { t.push(U.fmt(A.benar, { Tempat: besar(nama(s)), arah: namaArah(q.arah), acuan: nama(q.acuan) })); });
          } else {
            t.push(U.fmt(A.b, { Tempat: besar(nama(q.sasaran)), acuan: nama(q.acuan) }));
            t.push(U.fmt(A.benar, { Tempat: besar(nama(q.sasaran)), arah: namaArah(q.arah), acuan: nama(q.acuan) }));
          }
        });
        D.tempat.forEach(function (tp) {
          for (var a = 0; a < 8; a++) {
            t.push(U.fmt(A.petunjuk2, { acuan: nama(tp.id), arah: namaArah(a) }));
            ['acuan', 'titik-acuan'].forEach(function (k) { t.push(pesanUntuk(k, a, null, tp.id)); });
            for (var k = 0; k < 8; k++) if (k !== a) t.push(pesanUntuk(Arah.jenisSalah(a, k, {}), a, k, tp.id));
          }
        });
        return t.filter(function (x, i) { return t.indexOf(x) === i; });
      }
      L1.cekSemuaTeks = function () {
        var el = document.querySelector('.teks-instruksi'), lama = el.innerHTML, gagal = [], daftarT = semuaTeks();
        daftarT.forEach(function (x) {
          el.textContent = x; el.classList.remove('padat');
          if (el.scrollHeight > el.clientHeight + 2) el.classList.add('padat');
          if (el.scrollHeight > el.clientHeight + 8) gagal.push(x + ' (' + el.scrollHeight + ' px)');
        });
        el.innerHTML = lama;
        return { jumlah: daftarT.length, gagal: gagal };
      };
      function tolak(el, kode, arahKetuk) {
        salah++;
        Save.catatSalah('mata-angin'); Save.catatMis(kode); mis[kode] = (mis[kode] || 0) + 1;
        Aud.sfx('bad'); UI.goyang(el);
        lang.eks('berpikir'); hud.potret('berpikir');
        var teks = pesan(kode, arahKetuk), tingkat = santai ? Math.max(2, salah) : salah;
        if (kode === 'berlawanan' && (soal.arah === 2 || soal.arah === 6)) peta.matahari(true);
        if (tingkat >= 2) {
          peta.bantu(true, soal.arah);
          teks = U.fmt(STR.l1.petunjuk2, { acuan: nama(soal.acuan), arah: namaArah(soal.arah) });
        } else mawar.kedip();
        if (tingkat >= 3) {
          teks = soal.jenis === 'A' ? STR.l1.petunjuk3 : STR.l1.petunjuk3B;
          if (!adaP3) { adaP3 = true; petunjuk3++; }
          var sas = sasaranEl();
          if (soal.jenis === 'A') {
            var p = peta.titik(soal.sasaran[0]);
            lang.pose('terbang', 'senang');
            /* Lang melayang di samping sasaran (bukan di atasnya) supaya judul peta dan sasaran tetap terlihat */
            lang.terbangKe(p.x + (p.x > 640 ? -112 : 112), p.y - 6, 0.34, 700);
            peta.sorot(soal.sasaran[0], true);
          } else mawar.sorot(soal.arah);
          UI.tunjuk(sas);
        }
        hud.instruksi(teks, false, tebal(UI.esc(teks), namaArah(soal.arah)));
        Bersama.ucap(teks, { lang: lang, hud: hud, eks: 'berpikir' });
      }

      /* ---------- selesai ---------- */
      function selesai() {
        siap = false; soal = null;
        var bintang = petunjuk3 === 0 ? 3 : (petunjuk3 <= 2 ? 2 : 1);
        Save.catatLevel(1, { selesai: true, bintang: bintang, petunjuk3: petunjuk3, detik: Math.round((performance.now() - t0) / 1000) });
        var tip = Object.keys(mis).sort(function (a, b) { return mis[b] - mis[a]; })[0] || '';
        lang.pose('hinggap', 'bangga'); hud.potret('bangga');
        hud.sub(U.fmt(STR.level.kecil, { n: 1 })); hud.kemajuan(total(), total());
        var cap = U.h('div', 'cap-lengkap', Seni.svg(260, 260, Seni.cap(130, 130, 104, -12)));
        cap.style.cssText = 'left:308px;top:290px';
        root.appendChild(cap);
        Aud.sfx('cap'); Aud.jingle('lengkap');
        var jadi = UI.kurangi ? Promise.resolve() : Tween.run(420, function (e) { cap.style.scale = (2.2 - 1.2 * e).toFixed(3); cap.style.opacity = Math.min(1, e * 2); }, Ease.easeOutBack);
        hud.instruksi(STR.l1.selesai, false);
        Promise.all([jadi, Bersama.ucap(STR.l1.selesai, { lang: lang, hud: hud, eks: 'bangga' }), Tween.wait(1600)]).then(function () {
          if (L1.hidup) Scenes.go('hasil', { level: 1, bintang: bintang, tip: tip });
        });
      }

      L1.keadaan = function () { return { langkah: soal ? 'soal' : 'selesai', siap: siap, nomor: nomor, total: total(), jenis: soal && soal.jenis, acuan: soal && soal.acuan, arah: soal ? soal.arah : null, salah: salah, ad: ad.t }; };
      L1.benar = function () { if (!soal || !siap) return []; return soal.jenis === 'A' ? ['tempat-' + soal.sasaran[0]] : ['arah-' + soal.arah]; };
      /* jawaban salah untuk bot: arah berlawanan bila ada, supaya pesan khusus ikut teruji */
      L1.salah = function () {
        if (!soal || !siap) return [];
        if (soal.jenis === 'B') return ['arah-' + ((soal.arah + 4) % 8)];
        var acuan = peta.titik(soal.acuan), lain = D.tempat.filter(function (t) { return soal.sasaran.indexOf(t.id) < 0 && t.id !== soal.acuan; });
        lain.sort(function (a, b) { var pa = peta.titik(a.id), pb = peta.titik(b.id); return Arah.selisih(Arah.dari([acuan.x, acuan.y], [pb.x, pb.y]).arah, soal.arah) - Arah.selisih(Arah.dari([acuan.x, acuan.y], [pa.x, pa.y]).arah, soal.arah); });
        return lain.length ? ['tempat-' + lain[0].id] : [];
      };
      tampilkan();
    },
    exit: function () { if (L1) L1.hidup = false; UI.sembunyiTangan(true); },
    L1cek: function () { return L1 && L1.cekSemuaTeks ? L1.cekSemuaTeks() : null; },
    uji: {
      keadaan: function () { return L1 && L1.keadaan ? L1.keadaan() : { langkah: '', siap: false }; },
      benar: function () { return L1 && L1.benar ? L1.benar() : []; },
      salah: function () { return L1 && L1.salah ? L1.salah() : []; }
    }
  });
})();
