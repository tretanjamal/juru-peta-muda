/* Daftar aset terpusat (PROMPT-ASET.md Langkah 1). Hanya berkas yang benar-benar ada.
   Gambar yang tidak terdaftar memakai SVG kode; musik yang tidak terdaftar memakai sintesis WebAudio.
   Gambar dan musik AI diolah oleh tools/aset/olah-aset.js dari assets/masuk (lihat docs/ASET-PROMPT.md dan KREDIT.md). */
window.ASET = {
  gambar: {
    pengembang: 'assets/img/pengembang.webp',
    pengembang2: 'assets/img/pengembang-2.webp',
    /* logo Instagram dari kreator, untuk akun di menu Pengembang */
    instagram: 'assets/img/ikon-instagram.webp',
    /* latar Kantor Peta 1280x720 (gambar AI, acuan gaya) */
    kantorPeta: 'assets/img/kantor-peta.webp',
    /* perlengkapan Kantor Peta, hadiah L1-L5 (latar transparan) */
    dekor1: 'assets/img/dekor-1.webp',
    dekor2: 'assets/img/dekor-2.webp',
    dekor3: 'assets/img/dekor-3.webp',
    dekor4: 'assets/img/dekor-4.webp',
    dekor5: 'assets/img/dekor-5.webp'
  },
  /* lubang bingkai emas (pecahan lebar dan tinggi gambar): peta Indonesia digambar kode di dalamnya */
  lubangBingkai: [0.0889, 0.2074, 0.8222, 0.6852],
  /* musik berkas: js/data/musik_<kunci>.js (data URI, dimuat malas). mulai dan panjang dalam detik:
     loop mulus antara mulai dan mulai + panjang (pudar-silang sudah dipanggang oleh tools/aset/olah-aset.js) */
  audio: {
    bgm_judul: { mulai: 0.512, panjang: 88.5437 },
    bgm_jelajah: { mulai: 0.512, panjang: 92.562 },
    jingle_lengkap: { mulai: 0.012 },
    jingle_hasil: { mulai: 0.012 }
  }
};
