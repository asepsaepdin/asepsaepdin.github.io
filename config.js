/*
  PENGATURAN UTAMA UNDANGAN
  Ubah nilai pada file ini tanpa perlu menyentuh index.html.
*/
window.WEDDING_CONFIG = {
  couple: {
    groom: "Asep Saepudin, ST.",
    bride: "apt. Reihanna Yasmine Fauzia, S.Farm"
  },
  event: {
    isoStart: "2026-08-17T08:00:00+07:00",
    isoEnd: "2026-08-17T14:00:00+07:00",
    akadTime: "08.00 – 09.30 WIB",
    receptionTime: "10.00 – 14.00 WIB",
    akadVenue: "Pawon Joglo",
    akadAddress: "Jl. Siliwangi No.172, Jalaksana, Kec. Jalaksana, Kabupaten Kuningan, Jawa Barat 45554",
    receptionVenue: "Pawon Joglo",
    receptionAddress: "Jl. Siliwangi No.172, Jalaksana, Kec. Jalaksana, Kabupaten Kuningan, Jawa Barat 45554"
  },
  maps: {
    // Gunakan alamat yang spesifik, contoh: "Gedung X, Jalan Y, Bandung"
    query: "Jl. Siliwangi No.172, Jalaksana, Kec. Jalaksana, Kabupaten Kuningan, Jawa Barat 45554"
  },
  contact: {
    // Format internasional tanpa tanda +, contoh: 6281234567890
    whatsapp: "628986986951"
  }
};


const openInvitationButton =
    document.getElementById("openInvitation");

if (openInvitationButton) {
    openInvitationButton.addEventListener("click", function () {
        musicStarted = false;
        playBacksound();
    });
}