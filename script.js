/*
  ============================================================
  KONFIGURASI UTAMA
  Ubah data pada objek CONFIG sesuai informasi acara Anda.
  ============================================================
*/
const CONFIG = {
  groom: "Asep Saepudin, ST.",
  bride: "apt. Reihanna Yasmine Fauzia, S.Farm",

  // Gunakan format ISO dengan zona WIB (+07:00).
  eventStart: "2026-08-17T08:00:00+07:00",
  eventEnd: "2026-08-17T14:00:00+07:00",
  eventDateLabel: "Senin, 17 Agustus 2026",
  akadTime: "08.00–09.30 WIB",
  receptionTime: "10.00–14.00 WIB",

  venueName: "Gedung / Masjid [Nama Tempat]",
  venueAddress: "[Alamat lengkap lokasi acara]",

  // Embed: buka Google Maps > Bagikan > Sematkan peta > salin URL di atribut src.
  mapEmbedUrl:
    "https://www.google.com/maps?q=Bandung%2C%20Indonesia&output=embed",

  // Tautan navigasi Google Maps.
  mapNavigationUrl:
    "https://www.google.com/maps/search/?api=1&query=Bandung%2C%20Indonesia",

  // Gunakan format internasional tanpa tanda +, spasi, atau strip. Contoh: 6281234567890
  whatsappNumber: "6281234567890",

  bankName: "[Nama Bank]",
  accountNumberDisplay: "0000 0000 0000",
  accountNumberCopy: "000000000000",
  accountHolder: "a.n. Asep Saepudin"
};

const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

const cover = $("#cover");
const mainContent = $("#mainContent");
const openButton = $("#openInvitation");
const mobileNav = $(".mobile-nav");
const soundToggle = $("#soundToggle");
const toast = $("#toast");

let toastTimer;
let audioContext;
let ambientNodes = [];
let isAmbientPlaying = false;

/* -------------------------------------------------------------------------- */
/* Personalisasi nama tamu
   Gunakan: index.html?to=Bapak%20Ahmad%20dan%20Keluarga
---------------------------------------------------------------------------- */
function setGuestName() {
  const params = new URLSearchParams(window.location.search);
  const guest = params.get("to") || params.get("kepada");
  if (guest && guest.trim()) {
    $("#guestName").textContent = guest.trim();
    $("#rsvpName").value = guest.trim();
  }
}

/* -------------------------------------------------------------------------- */
/* Memasukkan konfigurasi ke halaman
---------------------------------------------------------------------------- */
function hydrateContent() {
  $$("[data-event-date-label]").forEach(
    (el) => (el.textContent = CONFIG.eventDateLabel)
  );
  $$("[data-akad-time]").forEach((el) => (el.textContent = CONFIG.akadTime));
  $$("[data-reception-time]").forEach(
    (el) => (el.textContent = CONFIG.receptionTime)
  );
  $$("[data-venue-name]").forEach((el) => (el.textContent = CONFIG.venueName));
  $$("[data-venue-address]").forEach(
    (el) => (el.textContent = CONFIG.venueAddress)
  );

  $("#mapFrame").src = CONFIG.mapEmbedUrl;
  $("#mapsButton").href = CONFIG.mapNavigationUrl;

  $("#bankName").textContent = CONFIG.bankName;
  $("#accountNumber").textContent = CONFIG.accountNumberDisplay;
  $("#accountHolder").textContent = CONFIG.accountHolder;
  $("#copyAccount").dataset.copy = CONFIG.accountNumberCopy;
}

/* -------------------------------------------------------------------------- */
/* Membuka undangan
---------------------------------------------------------------------------- */
function openInvitation() {
  cover.classList.add("is-opened");
  document.body.classList.remove("is-locked");
  mainContent.removeAttribute("inert");
  mobileNav.classList.add("is-visible");
  soundToggle.classList.add("is-visible");

  window.setTimeout(() => {
    cover.setAttribute("hidden", "");
    $("#home").scrollIntoView({ behavior: "smooth", block: "start" });
  }, 850);
}

/* -------------------------------------------------------------------------- */
/* Animasi elemen saat masuk viewport
---------------------------------------------------------------------------- */
function setupRevealObserver() {
  const elements = $$("[data-reveal]");

  elements.forEach((element) => {
    const delay = Number(element.dataset.delay || 0);
    element.style.setProperty("--delay", `${delay}ms`);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -35px 0px" }
  );

  elements.forEach((element) => observer.observe(element));
}

/* -------------------------------------------------------------------------- */
/* Kelopak dekoratif
---------------------------------------------------------------------------- */
function createPetals() {
  const field = $("#petalField");
  const total = window.innerWidth < 700 ? 12 : 22;

  for (let i = 0; i < total; i += 1) {
    const petal = document.createElement("i");
    petal.className = "petal";
    petal.style.left = `${Math.random() * 100}%`;
    petal.style.setProperty("--drift", `${-80 + Math.random() * 160}px`);
    petal.style.animationDuration = `${10 + Math.random() * 12}s`;
    petal.style.animationDelay = `${-Math.random() * 18}s`;
    petal.style.transform = `scale(${0.55 + Math.random() * 0.9})`;
    field.appendChild(petal);
  }
}

/* -------------------------------------------------------------------------- */
/* Hitung mundur
---------------------------------------------------------------------------- */
function updateCountdown() {
  const target = new Date(CONFIG.eventStart).getTime();
  const now = Date.now();
  const distance = Math.max(target - now, 0);

  const values = {
    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
    hours: Math.floor((distance / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((distance / (1000 * 60)) % 60),
    seconds: Math.floor((distance / 1000) % 60)
  };

  Object.entries(values).forEach(([key, value]) => {
    $(`#${key}`).textContent = String(value).padStart(2, "0");
  });

  if (distance === 0) {
    $(".countdown").setAttribute("aria-label", "Hari pelaksanaan acara");
  }
}

/* -------------------------------------------------------------------------- */
/* RSVP WhatsApp
---------------------------------------------------------------------------- */
function handleRsvp(event) {
  event.preventDefault();

  const name = $("#rsvpName").value.trim();
  const status = $("#rsvpStatus").value;
  const guestCount = $("#guestCount").value;
  const message = $("#rsvpMessage").value.trim() || "-";

  if (!name || !status) {
    showToast("Mohon lengkapi nama dan konfirmasi kehadiran.");
    return;
  }

  const text = [
    "Assalamu’alaikum warahmatullahi wabarakatuh.",
    "",
    `Saya *${name}* ingin mengonfirmasi undangan pernikahan ${CONFIG.groom} & ${CONFIG.bride}.`,
    "",
    `Konfirmasi: *${status}*`,
    `Jumlah tamu: *${guestCount} orang*`,
    `Doa/Pesan: ${message}`,
    "",
    "Jazakumullahu khairan."
  ].join("\n");

  const url = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

/* -------------------------------------------------------------------------- */
/* Tambah ke kalender melalui file .ics
---------------------------------------------------------------------------- */
function formatIcsDate(isoDate) {
  const date = new Date(isoDate);
  const pad = (number) => String(number).padStart(2, "0");

  return [
    date.getUTCFullYear(),
    pad(date.getUTCMonth() + 1),
    pad(date.getUTCDate()),
    "T",
    pad(date.getUTCHours()),
    pad(date.getUTCMinutes()),
    pad(date.getUTCSeconds()),
    "Z"
  ].join("");
}

function downloadCalendarEvent() {
  const uid = `asep-reihanna-${Date.now()}@undangan`;
  const description =
    "Walimatul 'Urs Asep Saepudin, ST. dan apt. Reihanna Yasmine Fauzia, S.Farm. Area tamu ikhwan dan akhwat dipisah.";
  const location = `${CONFIG.venueName}, ${CONFIG.venueAddress}`;

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Undangan Asep Reihanna//ID",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${formatIcsDate(new Date().toISOString())}`,
    `DTSTART:${formatIcsDate(CONFIG.eventStart)}`,
    `DTEND:${formatIcsDate(CONFIG.eventEnd)}`,
    `SUMMARY:Walimatul 'Urs Asep & Reihanna`,
    `DESCRIPTION:${description.replace(/\n/g, "\\n")}`,
    `LOCATION:${location.replace(/,/g, "\\,")}`,
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "walimatul-urs-asep-reihanna.ics";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);

  showToast("File kalender berhasil dibuat.");
}

/* -------------------------------------------------------------------------- */
/* Salin rekening
---------------------------------------------------------------------------- */
async function copyAccountNumber() {
  const number = $("#copyAccount").dataset.copy;

  try {
    await navigator.clipboard.writeText(number);
    $("#copyFeedback").textContent = "Nomor rekening berhasil disalin.";
    showToast("Nomor rekening berhasil disalin.");
  } catch {
    const temp = document.createElement("textarea");
    temp.value = number;
    document.body.appendChild(temp);
    temp.select();
    document.execCommand("copy");
    temp.remove();
    $("#copyFeedback").textContent = "Nomor rekening berhasil disalin.";
    showToast("Nomor rekening berhasil disalin.");
  }
}

/* -------------------------------------------------------------------------- */
/* Ambient Web Audio sederhana (tidak memakai berkas musik eksternal)
---------------------------------------------------------------------------- */
function startAmbientSound() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) {
    showToast("Browser ini belum mendukung Web Audio.");
    return;
  }

  audioContext = audioContext || new AudioContext();

  const master = audioContext.createGain();
  master.gain.value = 0.022;
  master.connect(audioContext.destination);

  // Akor lembut: C5, E5, G5, B5.
  [523.25, 659.25, 783.99, 987.77].forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = index % 2 === 0 ? "sine" : "triangle";
    oscillator.frequency.value = frequency / 2;
    gain.gain.value = 0.16 / (index + 1);

    oscillator.connect(gain);
    gain.connect(master);
    oscillator.start();

    ambientNodes.push(oscillator, gain);
  });

  isAmbientPlaying = true;
  soundToggle.setAttribute("aria-pressed", "true");
  soundToggle.setAttribute("aria-label", "Matikan suara ambient");
}

function stopAmbientSound() {
  ambientNodes.forEach((node) => {
    try {
      if (typeof node.stop === "function") node.stop();
      node.disconnect();
    } catch {
      // Node mungkin sudah dihentikan.
    }
  });

  ambientNodes = [];
  isAmbientPlaying = false;
  soundToggle.setAttribute("aria-pressed", "false");
  soundToggle.setAttribute("aria-label", "Aktifkan suara ambient");
}

function toggleAmbientSound() {
  if (isAmbientPlaying) {
    stopAmbientSound();
  } else {
    startAmbientSound();
  }
}

/* -------------------------------------------------------------------------- */
/* Navigasi aktif
---------------------------------------------------------------------------- */
function setupActiveNavigation() {
  const sections = ["home", "acara", "syariat", "lokasi", "rsvp"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const links = $$(".mobile-nav a");

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;

      links.forEach((link) => {
        const active = link.getAttribute("href") === `#${visible.target.id}`;
        link.classList.toggle("is-active", active);
      });
    },
    { threshold: [0.3, 0.55, 0.75] }
  );

  sections.forEach((section) => observer.observe(section));
}

/* -------------------------------------------------------------------------- */
/* Toast
---------------------------------------------------------------------------- */
function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");

  toastTimer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2600);
}

/* -------------------------------------------------------------------------- */
/* Inisialisasi
---------------------------------------------------------------------------- */
function init() {
  hydrateContent();
  setGuestName();
  createPetals();
  setupRevealObserver();
  setupActiveNavigation();
  updateCountdown();

  window.setInterval(updateCountdown, 1000);

  openButton.addEventListener("click", openInvitation);
  $("#rsvpForm").addEventListener("submit", handleRsvp);
  $("#addToCalendar").addEventListener("click", downloadCalendarEvent);
  $("#copyAccount").addEventListener("click", copyAccountNumber);
  soundToggle.addEventListener("click", toggleAmbientSound);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && isAmbientPlaying && audioContext) {
      audioContext.suspend();
    } else if (!document.hidden && isAmbientPlaying && audioContext) {
      audioContext.resume();
    }
  });
}

document.addEventListener("DOMContentLoaded", init);
