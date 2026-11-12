/* Semua teks antarmuka Juru Peta Muda (CLAUDE.md bagian 2), supaya mudah ditinjau guru.
   Kalimat untuk anak kelas 3-4: bahasa Indonesia baku, pendek, instruksi maksimal 2 baris.
   {kunci} diisi gim. Kalimat yang diucapkan Lang juga tercatat di naskah_audio.csv (tools/gen-naskah.js). */
window.STR = {
  judul: { lengkap: 'Juru Peta Muda: Letak Kota dan Kabupatenku', a: 'JURU PETA', b: 'MUDA', tagline: 'Letak Kota dan Kabupatenku' },
  putar: 'Putar perangkatmu supaya mendatar, lalu ayo bermain lagi.',
  muat: 'Menyiapkan peta',
  muatTahu: 'Tahukah kamu? ',
  muatTips: [
    'Elang Jawa adalah satwa langka Indonesia. Jambulnya panjang dan ujungnya putih.',
    'Peta adalah gambar suatu tempat yang dilihat dari atas.',
    'Matahari terbit di sebelah timur dan terbenam di sebelah barat.',
    'Mawar angin menunjukkan arah. Huruf U berarti utara.',
    'Indonesia punya 38 provinsi.'
  ],
  tombol: {
    mulai: 'MULAI', info: 'Informasi', referensi: 'Referensi', pengembang: 'Pengembang', lanjut: 'Lanjut', ulangi: 'Ulangi',
    tutup: 'Tutup', beranda: 'Beranda', legenda: 'Legenda', hasil: 'Hasil Belajarku', guru: 'Catatan Belajarku'
  },
  ikon: {
    pengaturan: 'Pengaturan', layarPenuh: 'Layar penuh', keluarPenuh: 'Keluar dari layar penuh', suaraNyala: 'Suara nyala, ketuk untuk senyap',
    suaraMati: 'Suara mati, ketuk untuk menyalakan', fsDitolak: 'Layar penuh tidak tersedia di perangkat ini.', dengarInstruksi: 'Dengar instruksi lagi', dengarPetunjuk: 'Dengar kartu petunjuk',
    jeda: 'Jeda', legenda: 'Legenda peta', gembok: 'terkunci', koin: 'Keping kompas', beranda: 'Beranda'
  },
  level: {
    judul: 'Level {n} {nama}', kecil: 'Level {n}',
    nama: ['', 'Kompas Lang', 'Baca Peta', 'Teka-teki Pulau', 'Dari Indonesia ke Rumahku', 'Puzzle Provinsiku', 'Jelajah Nusantara'],
    soal: 'Soal {i} dari {n}',
    pendek: ['', 'Kompas Lang', 'Baca Peta', 'Teka-teki Pulau', 'Ke Rumahku', 'Puzzle Provinsiku', 'Jelajah Nusantara']
  },
  /* 8 arah mata angin (sama dengan js/engine/arah.js; uji logika memastikan keduanya sama) */
  arah: ['utara', 'timur laut', 'timur', 'tenggara', 'selatan', 'barat daya', 'barat', 'barat laut'],
  arahSingkat: ['U', 'TL', 'T', 'TG', 'S', 'BD', 'B', 'BL'],
  /* tempat di Desa Lang: nama di kalimat dan label di peta */
  tempat: {
    tugu: ['tugu', 'Tugu'], pohon: ['pohon sarang', 'Pohon Sarang'], pasar: ['pasar', 'Pasar'], sekolah: ['sekolah', 'Sekolah'],
    sawah: ['sawah', 'Sawah'], kolam: ['kolam ikan', 'Kolam Ikan'], puskesmas: ['puskesmas', 'Puskesmas'], lapangan: ['lapangan', 'Lapangan'],
    balai: ['balai desa', 'Balai Desa']
  },
  peta: { desa: 'PETA DESA LANG', catatan: 'Peta untuk belajar. Batas wilayah bukan rujukan resmi.', mawar: 'Mawar angin' },
  hook: {
    naik: 'Dari atas, desa terlihat seperti peta!',
    utara: 'Rumahku ada di utara. Ketuk!',
    salah: 'Utara ada di atas mawar angin. Cari pohon besar di utara.',
    benar: 'Kamu bisa membaca arah! Ayo bantu Kantor Peta.',
    cap: 'BAGUS!',
    lewati: 'Lewati'
  },
  l1: {
    a: 'Ketuk tempat di sebelah {arah} {acuan}.',
    b: '{Tempat} ada di sebelah mana dari {acuan}?',
    benar: 'Benar! {Tempat} ada di sebelah {arah} {acuan}.',
    pandu: [
      'Di peta ini, utara ada di atas. Ketuk tempat di utara tugu.',
      'Cari huruf T. Ketuk tempat di sebelah timur tugu.'
    ],
    panduB: 'Sekarang ketuk arahnya di mawar angin.',
    panduBSingkat: 'Ketuk arahnya di mawar angin.',
    salah: {
      berlawanan: 'Itu {kebalikan}. {Arah} ada di arah yang berlawanan.',
      timur: 'Itu barat. Timur ada di arah matahari terbit.',
      barat: 'Itu timur. Barat berlawanan dengan arah matahari terbit.',
      'arah-antara': '{Arah} ada di antara {a} dan {b}.',
      'arah-utama': 'Itu {ketuk}. Cari huruf {singkat} di mawar angin.',
      'arah-lain': 'Lihat mawar angin lagi. Cari huruf {singkat}.',
      'titik-acuan': 'Lihat dari {acuan}, bukan dari tugu.',
      acuan: 'Itu titik acuannya. Cari tempat lain.'
    },
    petunjuk2: 'Lihat garis bantu dari {acuan}. Arah {arah} menyala.',
    petunjuk3: 'Lihat, Lang menunjukkan tempatnya. Ketuk di sana.',
    petunjuk3B: 'Lihat, arahnya menyala di mawar angin. Ketuk di sana.',
    soalUlang: 'Ayo coba soal yang mirip.',
    selesai: 'Hebat! Kamu bisa memakai delapan arah mata angin.'
  },
  /* templat kalimat kartu petunjuk L3 dan L5 (js/engine/teka.js); {T} kartu, {R} wilayah acuan, {arah}, {ciri} */
  teka: {
    arah: '{T} ada di sebelah {arah} {R}.',
    batas: '{T} berbatasan langsung dengan {R}.',
    arahPantai: '{T} ada di sebelah {arah} {R} dan berbatasan dengan laut.',
    batasPantai: '{T} berbatasan dengan {R} dan dengan laut.',
    batasDarat: '{T} berbatasan dengan {R}, tetapi tidak berbatasan dengan laut.',
    mengelilingi: '{T} mengelilingi {R}.',
    dikelilingi: '{T} dikelilingi oleh {R}.',
    laut: '{T} ada di seberang laut, di sebelah {arah} {R}.',
    lautSaja: '{T} dipisahkan oleh laut dari {R}.',
    ciri: '{T} {ciri}.',
    pedalaman: '{T} tidak berbatasan dengan laut.',
    /* papan teka-teki (js/scenes/papan.js) */
    kepala: 'KARTU PETUNJUK {i}/{n}',
    kepalaTanya: 'SOAL SERUPA',
    terkunci: 'Kartu ini belum bisa ditebak. Pasang kartu lain dulu.',
    pinAria: 'Wilayah tanpa nama {n}',
    tumpukan: '{n} kartu lagi menunggu',
    sudahBernama: 'Wilayah itu sudah bernama.',
    pilihDulu: 'Pilih kartu nama dulu.',
    instruksi: 'Baca kartu petunjuk, lalu tempel kartu nama di peta.',
    benar: 'Tepat! Kartu menempel di peta.',
    salah: {
      berlawanan: 'Itu di sebelah {ketuk} {R}. Cari di arah sebaliknya.',
      arahAntara: '{Arah} ada di antara {a} dan {b}.',
      arahUtama: 'Itu di sebelah {ketuk}. Cari huruf {singkat} di mawar angin.',
      arahLain: 'Itu di sebelah {ketuk} {R}. Cari arah {arah}.',
      pantaiTidak: 'Wilayah itu tidak berbatasan dengan laut.',
      pantaiYa: 'Wilayah itu berbatasan dengan laut.',
      bukanTetangga: 'Wilayah itu tidak bersentuhan dengan {R}.',
      tidakKeliling: 'Wilayah itu tidak mengelilingi {R}.',
      tidakDalam: 'Wilayah itu tidak berada di dalam {R}.',
      bukanLaut: 'Wilayah itu tidak dipisahkan laut dari {R}.',
      ciri: 'Cari wilayah yang {ciri}.',
      acuan: 'Itu wilayah acuannya. Cari wilayah lain.',
      umum: 'Baca lagi kartu petunjuknya.'
    },
    petunjuk2: {
      arah: 'Lihat garis bantu dari {R}. Arah {arah} menyala.',
      acuan: 'Lihat {R} yang menyala, lalu baca petunjuknya lagi.',
      ciri: 'Lihat bagian peta yang menyala.',
      pedalaman: 'Cari wilayah yang tidak menyentuh laut sama sekali.'
    },
    petunjuk3: 'Lang menunjukkan wilayahnya. Tempel kartunya di sana.',
    petunjuk3Tanya: 'Tangan menunjukkan wilayahnya. Ketuk di sana.',
    tanya: 'Ketuk wilayah di sebelah {arah} {R}.',
    soalUlang: 'Ayo coba soal yang mirip.'
  },
  /* Level 3 Teka-teki Pulau */
  l3: {
    sub: 'Level 3 · Teka-teki {i} dari 2',
    subUlang: 'Level 3 · Soal serupa',
    judulPeta: ['PETA PROVINSI PULAU LATIHAN', 'PETA PROVINSI PULAU SEBERANG'],
    mulai: ['Angin menerbangkan nama di peta ini. Ayo tempel lagi!', 'Pulau Seberang juga kehilangan nama. Petunjuknya berantai!'],
    lengkap: 'Peta lengkap! Kantor Peta memberi cap.',
    selesai: 'Hebat! Kamu bisa menemukan wilayah dari petunjuk.',
    legenda: { ibukota: 'Ibu kota provinsi', prov: 'Batas provinsi', kab: 'Batas kabupaten/kota', sungai: 'Sungai', skala: '10 km' }
  },
  /* Level 2 Baca Peta */
  l2: {
    sub: 'Level 2 · Soal {i} dari {n}',
    judulPeta: 'PETA PROVINSI PULAU LATIHAN',
    judulDiputar: 'PETA PROVINSI PULAU LATIHAN (DIPUTAR)',
    legendaJudul: 'Legenda',
    legenda: { ibukota: 'Ibu kota provinsi', kota: 'Kota', prov: 'Batas provinsi', kab: 'Batas kabupaten/kota', sungai: 'Sungai', gunung: 'Gunung', danau: 'Danau', skala: 'Skala: 1 ruas = 10 km' },
    judul: { tanya: 'Peta ini menggambarkan apa?', pilihan: ['Provinsi Pulau Latihan', 'Kota Pelangi', 'Laut Camar'],
      salahKota: 'Kota Pelangi hanya ibu kotanya. Lihat judul peta.', salahLaut: 'Laut Camar adalah nama laut. Lihat judul peta.', benar: 'Benar! Judul peta menyebut Provinsi Pulau Latihan.' },
    ibukota: { tanya: 'Cari simbol ibu kota provinsi di legenda, lalu ketuk di peta.', benar: 'Benar! Bintang adalah simbol ibu kota provinsi.', salah: 'Itu {fitur}. Simbol ibu kota adalah bintang.' },
    batas: { tanya: 'Ketuk garis batas provinsi di peta.', benar: 'Benar! Batas provinsi adalah garis tebal.', salah: 'Itu batas kabupaten/kota, garis putus-putus. Cari garis tebal.', salahLain: 'Itu {fitur}. Cari garis tebal di legenda.' },
    simbol: { gunung: 'Ketuk gunung di peta.', sungai: 'Ketuk sungai di peta.', benar: 'Benar! Itu simbol {fitur}.', salah: 'Itu {fitur}. Cari simbol {target} di legenda.' },
    skala: { tanya: 'Berapa jarak {A} ke {B}?', satuan: '{n} km', salahRuas: 'Itu jumlah ruasnya. Satu ruas sama dengan 10 km.', salahHitung: 'Hitung lagi ruas pada penggaris. Satu ruas 10 km.', benar: 'Benar! {n} ruas kali 10 km sama dengan {km} km.' },
    putar: { tanya: 'Peta ini diputar. Ketuk wilayah di sebelah {arah} Kota Pelangi.', salahAtas: 'Peta diputar. Utara ada di arah huruf U, bukan di atas layar.', salah: 'Lihat mawar angin yang ikut berputar. Cari huruf {singkat}.', benar: 'Benar! {T} ada di sebelah {arah} Kota Pelangi.' },
    fitur: { ibukota: 'ibu kota provinsi', gunung: 'gunung', sungai: 'sungai', danau: 'danau', prov: 'batas provinsi', kab: 'batas kabupaten/kota', pelabuhan: 'pelabuhan' },
    petunjuk2: 'Lihat legenda yang menyala.',
    petunjuk2Putar: 'Lihat garis bantu dari Kota Pelangi. Arah {arah} menyala.',
    petunjuk3: 'Lang menunjukkan jawabannya.',
    kotaCamar: 'Kota Camar', desaDamar: 'Desa Damar',
    selesai: 'Hebat! Kamu bisa membaca judul, legenda, dan skala peta.'
  },
  /* Level 4 Dari Indonesia ke Rumahku */
  l4: {
    sub: ['Level 4 · Jenjang wilayah', 'Level 4 · Provinsiku', 'Level 4 · Kabupaten/kotaku', 'Level 4 · Temukan lagi', 'Level 4 · Alamat wilayahku'],
    memuat: 'Menyiapkan peta Indonesia...',
    judulIndonesia: 'PETA INDONESIA', judulProvinsi: 'PETA PROVINSI {P}',
    gagalMuat: 'Peta Indonesia belum bisa dibuka. Coba lagi.',
    jenjang: {
      label: ['Indonesia', 'Provinsi', 'Kabupaten/Kota', 'Kecamatan', 'Desa/Kelurahan'],
      ajak: 'Ketuk nama untuk kotak yang menyala. Mulai dari yang terbesar.',
      judulPanel: 'Nama wilayah',
      benar: 'Tepat! {nama} ada di dalam kotak yang lebih besar.',
      benarTerbesar: 'Tepat! Indonesia adalah kotak terbesar.',
      salahKecil: 'Kotak ini lebih besar. {pilihan} ada di dalamnya.',
      salahBesar: '{pilihan} lebih besar. Kotak luarnya sudah terisi.',
      petunjuk2: 'Lihat nama yang menyala.',
      petunjuk3: 'Lang menunjukkan namanya. Ketuk nama itu.',
      banyak: 'Satu provinsi memuat banyak kabupaten dan kota.',
      kotaKab: {
        judulPanel: 'Kota atau kabupaten?',
        soal: [
          { tanya: 'Siapa yang memimpin sebuah kota?', pilihan: ['Wali kota', 'Bupati', 'Gubernur'], benar: 'Benar! Kota dipimpin wali kota.', salah: [null, 'Bupati memimpin kabupaten. Kota dipimpin wali kota.', 'Gubernur memimpin provinsi. Kota dipimpin wali kota.'] },
          { tanya: 'Mana yang biasanya lebih luas dan punya banyak desa?', pilihan: ['Kabupaten', 'Kota', 'Kecamatan'], benar: 'Benar! Kabupaten lebih luas dan punya banyak desa.', salah: [null, 'Kota umumnya perkotaan dan tidak seluas kabupaten. Kabupaten punya banyak desa.', 'Kecamatan lebih kecil, bagian dari kabupaten atau kota. Kabupaten luas dan punya banyak desa.'] }
        ]
      },
      mini: ['Kab.', 'Kota', 'Kab.', 'Kota']
    },
    pulau: {
      ajak: 'Provinsimu ada di kelompok pulau mana? Ketuk kelompok pulaunya.',
      judulPanel: 'Kelompok pulau',
      lain: 'Pulau lain'
    },
    provinsi: {
      ajak: 'Ketuk provinsimu di peta atau di daftar.',
      judulPanel: 'Provinsi di {pulau}',
      tanya: 'Provinsi {P}. Benar ini provinsimu?',
      ya: 'Ya, benar', bukan: 'Bukan, pilih lagi'
    },
    kab: {
      ajak: 'Ketuk kabupaten atau kotamu di peta atau di daftar.',
      judulPanel: 'Kabupaten dan kota',
      tanya: '{K}, Provinsi {P}. Benar ini wilayahmu?'
    },
    kembar: {
      judul: 'Kota dan Kabupaten itu berbeda',
      isi: '{A} dan {B} adalah dua wilayah yang berbeda. Lihat batasnya di peta.',
      beda: 'Kota dipimpin wali kota dan umumnya perkotaan. Kabupaten dipimpin bupati, lebih luas, dan punya banyak desa.',
      pilih: 'Wilayahmu yang mana?'
    },
    guruCek: {
      provBenar: 'Tepat! Itu provinsi kelas kita.',
      kabBenar: 'Tepat! Itu wilayah kelas kita.',
      provSalah: 'Bukan itu. Provinsi kelas kita ada di {pulau}.',
      kabSalah: 'Bukan itu. Coba ketuk wilayah lain.',
      kembar: 'Hampir! {A} dan {B} berbeda. Coba yang satunya.'
    },
    temukan: {
      dicari: 'Yang dicari',
      ajakProv: 'Sekarang temukan lagi provinsimu di peta tanpa nama.',
      ajakKab: 'Temukan lagi wilayahmu di peta provinsi tanpa nama.',
      benarProv: 'Hebat! Itu Provinsi {P}.',
      benarKab: 'Hebat! Itu {K}.',
      salahProv: 'Bukan itu. Provinsimu ada di kelompok pulau {pulau}.',
      salahKab: 'Itu {X}. Wilayahmu ada di sebelah {arah} wilayah itu.',
      salahKabUmum: 'Itu {X}. Wilayahmu ada di tempat lain, lihat lagi petanya.',
      petunjuk2Prov: 'Lihat pulau yang menyala. Provinsimu ada di sana.',
      petunjuk2Kab: 'Lihat wilayah yang menyala. Wilayahmu salah satunya.',
      petunjuk3: 'Lang menunjukkan tempatnya. Ketuk di sana.'
    },
    akhir: {
      judul: 'Alamat wilayahku',
      kecamatan: 'Kecamatanku', desa: 'Desa/kelurahanku',
      kata: 'Inilah wilayahmu, dari Indonesia sampai desamu!'
    },
    aria: { provinsi: 'Provinsi {n}', wilayah: 'Wilayah {n}' },
    guru: {
      tombol: 'Untuk guru', tahan: 'Tahan 3 detik',
      judul: 'Wilayah bawaan kelas',
      isi: 'Pilih wilayah sekolah. Murid akan diperiksa terhadap wilayah ini. Tersimpan hanya di perangkat ini.',
      prov: 'Provinsi', kab: 'Kabupaten/kota', kosong: '(belum dipilih)',
      simpan: 'Simpan', hapus: 'Hapus bawaan', tersimpan: 'Wilayah bawaan kelas tersimpan.', terhapus: 'Wilayah bawaan kelas dihapus.',
      sekarang: 'Sekarang: {w}', belum: 'belum ada'
    }
  },
  /* Level 5 Puzzle Provinsiku */
  l5: {
    sub: ['Level 5 · Puzzle tetangga', 'Level 5 · Detektif Letak'],
    judulPeta: 'PETA PROVINSI {P}',
    mulai: 'Nama tetangga {K} terbang tertiup angin. Ayo tempel lagi!',
    lengkap: 'Peta tetanggamu lengkap! Kantor Peta memberi cap.',
    detektif: 'Sekarang jadi detektif! Jawab pertanyaan tentang wilayahmu.',
    kepala: 'DETEKTIF LETAK {i}/{n}',
    selesai: 'Hebat! Kamu mengenal tetangga wilayahmu.',
    belumPilih: 'Pilih wilayahmu dulu di Level 4, ya.',
    keL4: 'Ke Level 4',
    tunjuk: 'Lihat, tangan menunjukkan jawabannya.',
    pilihJawaban: 'Baca pertanyaannya, lalu pilih jawabanmu.'
  },
  /* Level 6 Jelajah Nusantara (TAMBAHAN, js/engine/nusantara.js) */
  l6: {
    sub: 'Level 6 · Provinsi {i} dari {n}',
    subUlang: 'Level 6 · Soal serupa',
    judulPeta: 'PETA INDONESIA',
    mulai: 'Ayo jelajah Nusantara! Temukan provinsi dari petunjuk pulau dan arah.',
    instruksi: 'Baca petunjuk di kartu, lalu ketuk provinsinya di peta.',
    kepala: 'JELAJAH {i}/{n}',
    kalimat: {
      arah: 'Provinsi ini ada di kelompok pulau {pulau}, di sebelah {arah} Provinsi {R}.',
      batasArah: 'Provinsi ini ada di kelompok pulau {pulau}, di sebelah {arah} Provinsi {R}, dan berbatasan langsung dengannya.',
      batasDua: 'Provinsi ini ada di kelompok pulau {pulau} dan berbatasan dengan Provinsi {R} serta Provinsi {R2}.',
      sisa: 'Provinsi ini ada di kelompok pulau {pulau}, tetapi bukan Provinsi {R}.'
    },
    benar: 'Benar! Itu Provinsi {P}.',
    salahPulau: 'Provinsi itu ada di kelompok pulau {pulauX}. Cari di {pulau}.',
    salahBerlawanan: 'Provinsi itu ada di sebelah {ketuk} Provinsi {R}. Cari di arah sebaliknya.',
    salahArah: 'Provinsi itu ada di sebelah {ketuk} Provinsi {R}. Cari di sebelah {arah}.',
    salahBatas: 'Provinsi itu tidak berbatasan dengan Provinsi {R}.',
    salahUmum: 'Baca lagi petunjuknya, lalu lihat peta.',
    acuan: 'Itu Provinsi {R}, provinsi acuannya. Cari provinsi lain.',
    petunjuk2: 'Lihat kelompok pulau yang menyala dan provinsi acuannya.',
    petunjuk3: 'Lang menunjukkan provinsinya. Ketuk di sana.',
    bonus: 'Bonus waktu', bonusHabis: 'Waktu bonus habis. Tetap lanjutkan, ya!', santai: 'Mode Santai: tanpa waktu',
    soalUlang: 'Ayo cari provinsi yang mirip.',
    selesai: 'Hebat! Kamu bisa menjelajah provinsi di seluruh Nusantara.'
  },
  /* Detektif Letak L5 (js/engine/detektif.js); {K} wilayah murid, {T} wilayah lain, {I} ibu kota, {P} provinsi */
  detektif: {
    judul: 'Detektif Letak',
    ajak: 'Sekarang jadi detektif! Jawab 5 pertanyaan tentang wilayahmu.',
    tetanggaDiArah: 'Wilayah mana yang berbatasan dengan {K} di sebelah {arah}?',
    tetanggaDiArahLaut: 'Wilayah mana yang ada di seberang laut, di sebelah {arah} {K}?',
    arahTetangga: '{T} ada di sebelah mana dari {K}?',
    arahIbukota: '{I}, ibu kota provinsimu, ada di sebelah mana dari {K}?',
    provinsiTetangga: 'Provinsi mana yang berbatasan dengan {K}?',
    pantaiYa: 'Mana yang berbatasan dengan laut?',
    pantaiTidak: 'Mana yang tidak berbatasan dengan laut?',
    mengelilingi: 'Wilayah mana yang dikelilingi oleh {K}?',
    dikelilingi: '{K} dikelilingi oleh wilayah mana?',
    jumlahTetangga: 'Berapa kabupaten dan kota yang berbatasan darat dengan {K}?',
    ibukotaProvinsi: 'Apa nama ibu kota Provinsi {P}?',
    tetanggaYa: 'Mana yang berbatasan langsung dengan {K}?',
    tetanggaBukan: 'Mana yang tidak berbatasan dengan {K}?',
    arahDariTetangga: '{K} ada di sebelah mana dari {T}?',
    provinsiku: '{K} ada di provinsi mana?',
    pulau: 'Provinsi {P} ada di kelompok pulau mana?',
    benar: {
      tetanggaYa: 'Benar! {T} berbatasan langsung dengan {K}.',
      tetanggaBukan: 'Benar! {T} tidak bersentuhan dengan {K}.',
      provinsiku: 'Benar! {K} ada di Provinsi {P}.',
      pulau: 'Benar! Provinsi {P} ada di kelompok pulau {I}.',
      arah: 'Benar! {T} ada di sebelah {arah} {K}.',
      arahIbukota: 'Benar! {I} ada di sebelah {arah} {K}.',
      provinsiTetangga: 'Benar! {K} berbatasan dengan Provinsi {P}.',
      pantaiYa: 'Benar! {T} berbatasan dengan laut.',
      pantaiTidak: 'Benar! {T} tidak berbatasan dengan laut.',
      mengelilingi: 'Benar! {T} dikelilingi oleh {K}.',
      dikelilingi: 'Benar! {K} dikelilingi oleh {T}.',
      jumlahTetangga: 'Benar! Ada {n} wilayah yang bersentuhan dengan {K}.',
      jumlahNol: 'Benar! {K} tidak bersentuhan darat dengan wilayah lain. Semua sisinya laut.',
      ibukotaProvinsi: 'Benar! Ibu kota Provinsi {P} adalah {I}.'
    },
    salah: {
      arah: '{X} ada di sebelah {arahX}. Cari yang di sebelah {arah}.',
      arahUmum: '{X} tidak di sebelah {arah}. Lihat mawar angin.',
      'bukan-tetangga': '{X} tidak bersentuhan dengan {K}.',
      bersentuhan: '{X} bersentuhan dengan {K}. Lihat garis batasnya.',
      'provinsi-lain': 'Lihat judul peta. Nama provinsimu tertulis di sana.',
      'pulau-lain': 'Ingat peta Indonesia. Cari kelompok pulau tempat provinsimu.',
      berlawanan: 'Itu arah sebaliknya. Lihat lagi mawar angin.',
      'arah-antara': '{Arah} ada di antara {a} dan {b}.',
      'arah-lain': 'Lihat mawar angin, lalu bandingkan letaknya.',
      'provinsi-bukan-tetangga': 'Provinsi {X} tidak bersentuhan dengan {K}.',
      pantaiYa: '{X} berbatasan dengan laut.',
      pantaiTidak: '{X} tidak berbatasan dengan laut.',
      tidakDalam: '{X} tidak berada di dalam {K}.',
      tidakKeliling: '{X} tidak mengelilingi {K}.',
      hitung: 'Hitung lagi semua wilayah yang bersentuhan dengan {K}.',
      hitungNol: 'Lihat lagi: apakah ada daratan lain yang bersentuhan dengan {K}?',
      'ibukota-provinsi': '{P} adalah nama provinsinya. Ibu kotanya ditandai bintang.',
      'bukan-ibukota': '{X} bukan ibu kota provinsi. Cari simbol bintang.'
    }
  },
  /* kalimat keterampilan dalam bahasa anak (GDD bagian 4) */
  tag: {
    'mata-angin': 'Aku bisa memakai 8 arah mata angin.',
    'baca-peta': 'Aku bisa membaca legenda dan skala peta.',
    'jenjang-wilayah': 'Aku bisa mengurutkan wilayah dari negara sampai desa, dan membedakan kota dengan kabupaten.',
    provinsiku: 'Aku bisa menunjukkan provinsiku di peta Indonesia.',
    kabkotaku: 'Aku bisa menyebutkan tetangga kabupaten/kotaku dan arahnya.',
    'nalar-letak': 'Aku bisa menemukan wilayah dari petunjuk.'
  },
  hasil: {
    judul: 'Hasil Belajarku', kuasai: 'Yang sudah aku kuasai', kosong: 'Ayo main lagi supaya terlihat kemajuanmu.',
    status: { dikuasai: 'Dikuasai', berkembang: 'Berkembang', latihan: 'Perlu latihan', belum: 'Belum dicoba' },
    keping: 'Keping kompas: {n}', latih: 'Ayo latih lagi', latihUmum: 'Baca huruf di mawar angin: U, T, S, B, lalu arah di antaranya.',
    tip: {
      berlawanan: 'Timur dan barat saling berlawanan. Matahari terbit di timur.',
      'arah-antara': 'Timur laut ada di antara utara dan timur.',
      'titik-acuan': 'Lihat arah dari tempat yang disebut, bukan dari tugu.',
      'arah-lain': 'Cari huruf arahnya di mawar angin sebelum mengetuk.',
      'bukan-tetangga': 'Dua wilayah berbatasan bila garis batasnya bersentuhan.', pulau: 'Lihat dulu kelompok pulaunya, baru cari arahnya.', 'utara-atas': 'Utara ada di arah huruf U pada mawar angin, walau peta diputar.', skala: 'Satu ruas skala mewakili jarak 10 km.', batas: 'Batas provinsi digambar lebih tebal daripada batas kabupaten/kota.', 'ibukota-provinsi': 'Ibu kota provinsi ditandai bintang. Provinsinya jauh lebih luas.', 'kota-kab': 'Kota dipimpin wali kota. Kabupaten dipimpin bupati dan punya banyak desa.'
    },
    lanjut: 'Lanjut', ulangi: 'Ulangi'
  },
  /* panel catatan belajar: dibaca murid sendiri (permintaan kreator), bisa ditunjukkan ke guru; tanpa label TP */
  guru: {
    judul: 'Catatan Belajarku',
    catatan: 'Tanpa namamu, hanya ada di perangkat ini. Tunjukkan kepada gurumu, ya!',
    kolomTag: 'Keterampilanmu', kolomStatus: 'Statusmu', kolomBukti: 'Langsung benar',
    status: { dikuasai: 'Dikuasai', berkembang: 'Berkembang', latihan: 'Perlu latihan', belum: 'Belum dicoba' },
    nama: {
      'mata-angin': 'Memakai 8 arah mata angin', 'baca-peta': 'Membaca legenda dan skala peta', 'jenjang-wilayah': 'Mengurutkan jenjang wilayah',
      provinsiku: 'Menunjukkan letak provinsiku', kabkotaku: 'Mengenal tetangga wilayahku', 'nalar-letak': 'Menemukan wilayah dari petunjuk'
    },
    petunjuk3: 'Dibantu Lang sampai ditunjukkan: {n} kali',
    level: 'Level yang sudah kamu selesaikan: {daftar}.', levelBelum: 'belum ada', bintang: '{n} bintang',
    misJudul: 'Yang masih sering tertukar olehmu: {daftar}.',
    mis: {
      berlawanan: 'arah yang berlawanan, misalnya timur dan barat', 'arah-antara': 'arah di antara, misalnya timur laut dan timur',
      'titik-acuan': 'melihat arah dari tempat yang salah', 'arah-lain': 'arah lain', acuan: 'mengetuk tempat acuannya',
      'bukan-tetangga': 'wilayah berdekatan yang tidak bersentuhan', pulau: 'kelompok pulau sebuah provinsi', 'utara-atas': 'arah utara di peta yang diputar', skala: 'jumlah ruas dan kilometer pada skala',
      batas: 'garis batas provinsi dan batas kabupaten/kota', 'ibukota-provinsi': 'ibu kota dan provinsinya', kembar: 'kota dan kabupaten yang namanya sama', 'kota-kab': 'ciri dan pemimpin kota dan kabupaten', jenjang: 'urutan provinsi dan kabupaten'
    },
    santai: 'Mode Santai: {s}', lama: 'Lama bermain: {m} menit',
    kelas: 'Wilayah kelasmu: {w}.', kelasBelum: 'belum dipasang oleh guru',
    dikuasaiAturan: 'Dikuasai: sudah dicoba minimal 5 kali dan 80% langsung benar.',
    cp: 'Gim ini mengikuti Capaian Pembelajaran IPAS Fase B.'
  },
  pilih: {
    judul: 'Kantor Peta',
    terkunci: 'Selesaikan Level {n} dulu untuk membuka peta ini.',
    belumAda: 'Peta ini sedang dibuat dan belum ada di versi uji ini.',
    dekor: { 1: 'Kantor Peta dapat kompas besar!', 2: 'Kantor Peta dapat bola dunia!', 3: 'Kantor Peta dapat teropong!', 4: 'Kantor Peta dapat kapal hias!', 5: 'Kantor Peta dapat peta berbingkai!' },
    santai: 'Mode Santai'
  },
  jeda: { judul: 'Jeda', lanjut: 'Lanjut', ulangi: 'Ulangi level', kantor: 'Kantor Peta', pengaturan: 'Pengaturan', beranda: 'Beranda' },
  pengaturan: {
    judul: 'Pengaturan', nyala: 'Nyala', mati: 'Mati',
    musik: 'Musik', efek: 'Efek suara', suara: 'Suara Lang', suaraCatatan: 'Memakai suara bawaan perangkat.',
    bacakan: 'Bacakan instruksi', santai: 'Mode Santai', santaiCatatan: 'Garis bantu arah selalu tampil.',
    kurangi: 'Kurangi animasi', kurangiCatatan: 'Diatur oleh perangkat ini.',
    tanpaSuara: 'Suara Lang tidak tersedia di perangkat ini. Baca teksnya, ya.',
    muridBaru: 'Murid baru', muridBaruCatatan: 'Menghapus progres di perangkat ini.', hapus: 'Hapus progres', yakin: 'Ketuk lagi untuk hapus'
  },
  legenda: {
    judul: 'Legenda', tab: { arah: 'Mata Angin', simbol: 'Simbol Peta' },
    arahCatatan: 'Arah selalu dibaca dari mawar angin di peta.',
    arahUtama: 'Arah utama: utara, timur, selatan, barat.',
    arahAntara: 'Arah antara: timur laut, tenggara, barat daya, barat laut.',
    simbol: [
      ['ibukota', 'Ibu kota provinsi'], ['prov', 'Batas provinsi'], ['kab', 'Batas kabupaten/kota'], ['sungai', 'Sungai'],
      ['gunung', 'Gunung'], ['danau', 'Danau'], ['laut', 'Laut']
    ],
    simbolCatatan: 'Garis tebal untuk batas provinsi, garis putus-putus untuk batas kabupaten/kota.'
  },
  /* Informasi (Tujuan, Cara Main, Misi), Referensi (Sumber Materi, Data Peta, Kecerdasan Artifisial), Pengembang (sama dengan gim lain kreator) */
  info: {
    info: {
      judul: 'Informasi',
      tab: { tujuan: 'Tujuan', cara: 'Cara Main', misi: 'Misi' },
      pengantar: 'Kantor Peta butuh juru peta muda! Bantu Lang si elang Jawa melengkapi peta yang namanya hilang.',
      /* tujuan pembelajaran dalam satu kalimat (permintaan kreator) */
      tujuanJudul: 'Tujuan belajar',
      tujuan: 'Setelah bermain, kamu bisa menunjukkan letak provinsi dan kabupaten/kotamu di peta Indonesia serta menyebutkan wilayah di sekitarnya dengan delapan arah mata angin.',
      meta: 'Mata pelajaran IPAS. Sekitar 20-25 menit untuk 6 level.',
      cara: [
        'Dengarkan Lang. Ketuk tombol dengar bila ingin mendengar lagi.',
        'Lihat mawar angin di peta. Huruf U berarti utara.',
        'Ketuk tempat atau arah yang diminta.',
        'Seret kartu nama ke peta, atau ketuk kartunya lalu ketuk wilayahnya.'
      ],
      caraCatatan: 'Tidak ada game over. Salah? Lang memberi petunjuk. Legenda berisi simbol peta dan nama arah.',
      misiJudul: 'Selesaikan peta satu per satu:',
      misi: [
        ['Level 1 Kompas Lang', 'Pakai 8 arah mata angin di Desa Lang.'],
        ['Level 2 Baca Peta', 'Baca legenda, garis batas, dan skala.'],
        ['Level 3 Teka-teki Pulau', 'Tempel nama wilayah dari kartu petunjuk.'],
        ['Level 4 Dari Indonesia ke Rumahku', 'Temukan provinsi dan kabupaten/kotamu.'],
        ['Level 5 Puzzle Provinsiku', 'Pasang nama tetangga kabupaten/kotamu.'],
        ['Level 6 Jelajah Nusantara', 'Temukan provinsi dari petunjuk pulau dan arah.']
      ],
      misiCatatan: 'Setiap peta yang lengkap mendapat cap Kantor Peta!'
    },
    referensi: {
      judul: 'Referensi',
      tab: { sumber: 'Sumber Materi', data: 'Data Peta', ka: 'Kecerdasan Artifisial' },
      sumberPengantar: 'Sumber materi gim ini:',
      /* sama dengan gim kreator Pelestarian Sumber Daya Alam: capaian pembelajaran dan panduan mata pelajaran */
      sumber: [
        ['Badan Standar, Kurikulum, dan Asesmen Pendidikan (2025).', 'Keputusan Kepala BSKAP Nomor 046/H/KR/2025 tentang Capaian Pembelajaran.', 'Kementerian Pendidikan Dasar dan Menengah Republik Indonesia.'],
        ['Dr. Cucun Sutinah, M.Pd., dkk. (2025).', 'Panduan Mata Pelajaran Ilmu Pengetahuan Alam dan Sosial (IPAS) Fase B dan C.', 'Badan Standar, Kurikulum, dan Asesmen Pendidikan, Kementerian Pendidikan Dasar dan Menengah Republik Indonesia.']
      ],
      topik: 'Topik gim ini: Geografi dan Bentang Alam, Letak Kota/Kabupaten (IPAS).',
      huruf: 'Huruf Fredoka (The Fredoka Project Authors) dan Andika (SIL International), lisensi SIL Open Font License.',
      dataPengantar: 'Pulau Latihan, Pulau Seberang, dan Desa Lang adalah tempat rekaan untuk latihan.',
      data: [
        ['Kode dan nama wilayah', 'Kepmendagri Nomor 300.2.2-2138 Tahun 2025 yang diubah oleh Nomor 300.2.2-2430 Tahun 2025 (basis data cahyadsn/wilayah, MIT).'],
        ['Batas wilayah', 'geoBoundaries dari data BPS, WFP, dan OCHA ROAP (2020), lisensi CC BY 3.0 IGO; disederhanakan dan dikelompokkan menjadi 38 provinsi.'],
        ['Catatan', 'Peta untuk belajar. Batas wilayah bukan rujukan resmi.']
      ],
      kaPengantar: 'Pengembang memakai kecerdasan artifisial (KA) sebagai alat bantu.',
      ka: [
        ['Kode dan teks', 'Disusun dengan bantuan Claude (Anthropic).'],
        ['Gambar dan suara', 'Tokoh, peta, dan efek suara dibuat program. Latar Kantor Peta, perlengkapannya, dan musik dibuat dengan alat KA, lalu diperiksa pengembang.'],
        ['Pemeriksaan', 'Diuji otomatis. Pengembang bertanggung jawab atas isinya.'],
        ['Saat bermain', 'Tanpa KA, tanpa internet, dan tidak mengirim data apa pun.']
      ],
      kaRujukanJudul: 'Rujukan',
      kaRujukan: ['Purwarianti, A., dkk. (2025).', 'Panduan Pemanfaatan Kecerdasan Artifisial untuk Guru PAUD, Pendidikan Dasar, dan Pendidikan Menengah.', 'Jakarta: Pusat Kurikulum dan Pembelajaran & Pusat Standar dan Kebijakan Pendidikan.']
    },
    pengembang: {
      judul: 'Pengembang',
      /* satu halaman per pengembang, berpindah dengan tombol panah (pola gim 107) */
      orang: [
        { foto: 'pengembang', fotoAlt: 'Foto Jamaluddin', nama: 'Jamaluddin', baris: ['UPTD SMPN 2 Robatal', 'jamaluddin551@guru.smp.belajar.id', 'Instagram: @tretanjamal', 'Tahun pembuatan: 2026'],
          daftarJudul: 'Prestasi dan Pengalaman',
          daftar: [
            'Narasumber Digitalisasi Pembelajaran Kemendikdasmen',
            'Guru Pejuang Digital',
            'Juara 1 Lomba Inovasi Guru SMP Kabupaten Sampang 2026',
            'Juara 1 Guru Inspiratif SMP Kabupaten Sampang 2026',
            'Komunitas Belajar Terbaik BLPT Kemendikdasmen 2024'
          ] },
        { foto: 'pengembang2', fotoAlt: 'Foto Rimawan Haritzah', nama: 'Rimawan Haritzah, S.Pd.', baris: ['Guru SD Negeri Kauman Bantul', 'Tahun pembuatan: 2026'] }
      ],
      sebelum: 'Pengembang sebelumnya', berikut: 'Pengembang berikutnya', halaman: 'Pengembang {i} dari {n}'
    }
  }
};
