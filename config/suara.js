/* Suara lewat speechSynthesis perangkat. Ubah angkanya di sini bila kurang pas setelah didengarkan.
   jenis: p pria, w wanita; suara perangkat yang sejenis didahulukan. pitch: nada bila suaranya sejenis,
   pitchLain: bila perangkat hanya punya suara lawan jenis. rate: kecepatan.
   Lang dan instruksi memakai id-ID. Nama wilayah sungguhan (Fase 2) juga dibacakan suara ini; teks selalu tampil. */
window.SUARA = {
  namaPria: /david|mark|guy|james|george|daniel|fred|ryan|andrew|brian|christopher|eric|roger|steffan|thomas|andika|ardi|\bmale\b|pria|laki/i,
  /* instruksi berbahasa Indonesia (dibacakan bila "Bacakan instruksi" nyala) */
  narasi: { jenis: 'w', pitch: 1.05, pitchLain: 1.08, rate: 0.95 },
  tokoh: {
    lang: { jenis: 'w', pitch: 1.12, pitchLain: 1.12, rate: 0.95 }   // Lang si elang: ceria, sedikit lebih tinggi
  }
};
