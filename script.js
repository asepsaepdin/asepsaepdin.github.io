/**
 * =========================================================
 * KONFIGURASI UNDANGAN
 * Ubah data di dalam CONFIG tanpa perlu mengubah HTML/CSS.
 * =========================================================
 */
const CONFIG = {
  guestFallback: "Bapak/Ibu/Saudara/i",

  groomParents: "Bapak [Nama Ayah] & Ibu [Nama Ibu]",
  brideParents: "Bapak [Nama Ayah] & Ibu [Nama Ibu]",

  // Isi ISO date lengkap agar countdown aktif.
  // Contoh: "2026-12-20T09:00:00+07:00"
  eventDateISO: "",

  akad: {
    day: "Tanggal akan diumumkan",
    time: "Pukul akan diumumkan",
    venue: "Lokasi akan diumumkan",
    address: "Bandung, Jawa Barat"
  },

  reception: {
    day: "Tanggal akan diumumkan",
    time: "Pukul akan diumumkan",
    venue: "Lokasi akan diumumkan",
    address: "Bandung, Jawa Barat"
  },

  agenda: {
    welcoming: "08.00",
    akad: "09.00",
    reception: "10.00"
  },

  location: {
    description: "Lokasi lengkap akan diinformasikan melalui pembaruan undangan.",
    venue: "Lokasi acara akan diumumkan",
    address: "Bandung, Jawa Barat",
    mapQuery: "Bandung, Jawa Barat"
  },

  // Format nomor WhatsApp internasional tanpa tanda +.
  whatsappNumber: "6281234567890"
};

const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

document.body.classList.add("invitation-locked");

/* ---------------------------------------------
   Isi data dari CONFIG
--------------------------------------------- */
function setText(selector, value) {
  const element = $(selector);
  if (element && value) element.textContent = value;
}

function hydrateInvitation() {
  setText("#groomParents", CONFIG.groomParents);
  setText("#brideParents", CONFIG.brideParents);

  setText("#akadDay", CONFIG.akad.day);
  setText("#akadTime", CONFIG.akad.time);
  setText("#akadVenue", CONFIG.akad.venue);
  setText("#akadAddress", CONFIG.akad.address);

  setText("#receptionDay", CONFIG.reception.day);
  setText("#receptionTime", CONFIG.reception.time);
  setText("#receptionVenue", CONFIG.reception.venue);
  setText("#receptionAddress", CONFIG.reception.address);

  setText("#heroDate", CONFIG.reception.day || CONFIG.akad.day);

  setText("#agenda1Time", CONFIG.agenda.welcoming);
  setText("#agenda2Time", CONFIG.agenda.akad);
  setText("#agenda3Time", CONFIG.agenda.reception);

  setText("#locationDescription", CONFIG.location.description);
  setText("#mapVenue", CONFIG.location.venue);
  setText("#mapAddress", CONFIG.location.address);

  const mapQuery = encodeURIComponent(CONFIG.location.mapQuery);
  $("#mapButton").href = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;
  $("#mapFrame").src = `https://www.google.com/maps?q=${mapQuery}&output=embed`;
}

/* ---------------------------------------------
   Nama tamu dari URL: index.html?to=Nama+Tamu
--------------------------------------------- */
function getGuestName() {
  const params = new URLSearchParams(window.location.search);
  return (params.get("to") || CONFIG.guestFallback).trim();
}

function hydrateGuest() {
  const guest = getGuestName();
  setText("#guestName", guest);
  $("#rsvpName").value = guest === CONFIG.guestFallback ? "" : guest;
}

/* ---------------------------------------------
   Membuka undangan
--------------------------------------------- */
const opening = $("#opening");
const openButton = $("#openInvitation");

openButton.addEventListener("click", () => {
  opening.classList.add("is-hidden");
  document.body.classList.remove("invitation-locked");
  window.setTimeout(() => {
    opening.setAttribute("aria-hidden", "true");
  }, 850);

  playChime();
  showToast("Bismillah, selamat datang di undangan kami ✦");
});

/* ---------------------------------------------
   Efek suara sederhana via Web Audio API
   Tidak membutuhkan file audio eksternal.
--------------------------------------------- */
let soundEnabled = true;
let audioContext;

function playChime() {
  if (!soundEnabled) return;

  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    const now = audioContext.currentTime;
    const notes = [523.25, 659.25, 783.99];

    notes.forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();

      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, now + index * 0.13);
      gain.gain.linearRampToValueAtTime(0.055, now + index * 0.13 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.13 + 0.7);

      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start(now + index * 0.13);
      oscillator.stop(now + index * 0.13 + 0.72);
    });
  } catch (error) {
    console.info("Efek suara tidak tersedia pada browser ini.");
  }
}

$("#soundToggle").addEventListener("click", (event) => {
  soundEnabled = !soundEnabled;
  event.currentTarget.classList.toggle("muted", !soundEnabled);
  event.currentTarget.setAttribute(
    "aria-label",
    soundEnabled ? "Nonaktifkan efek suara" : "Aktifkan efek suara"
  );

  if (soundEnabled) playChime();
});

/* ---------------------------------------------
   Reveal animation
--------------------------------------------- */
const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.14, rootMargin: "0px 0px -40px" }
);

$$(".reveal").forEach((element) => revealObserver.observe(element));

/* ---------------------------------------------
   Navbar scroll state + active section
--------------------------------------------- */
const topbar = $("#topbar");
const backToTop = $("#backToTop");
const sections = $$("main section[id]");
const navLinks = $$(".desktop-nav a, .mobile-nav a");

function updateScrollUI() {
  const scrollY = window.scrollY;
  topbar.classList.toggle("scrolled", scrollY > 40);
  backToTop.classList.toggle("visible", scrollY > 700);

  let currentId = "home";
  sections.forEach((section) => {
    if (scrollY >= section.offsetTop - 220) currentId = section.id;
  });

  navLinks.forEach((link) => {
    const target = link.getAttribute("href");
    link.classList.toggle("active", target === `#${currentId}`);
  });
}

window.addEventListener("scroll", updateScrollUI, { passive: true });
updateScrollUI();

backToTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

/* ---------------------------------------------
   Countdown
--------------------------------------------- */
let countdownTimer;

function updateCountdown() {
  if (!CONFIG.eventDateISO) {
    $("#countdown").hidden = true;
    $("#countdownPlaceholder").hidden = false;
    return;
  }

  const eventTime = new Date(CONFIG.eventDateISO).getTime();

  if (Number.isNaN(eventTime)) {
    $("#countdown").hidden = true;
    $("#countdownPlaceholder").hidden = false;
    $("#countdownPlaceholder").textContent =
      "Format tanggal pada CONFIG.eventDateISO belum valid.";
    return;
  }

  $("#countdown").hidden = false;
  $("#countdownPlaceholder").hidden = true;

  const distance = eventTime - Date.now();

  if (distance <= 0) {
    clearInterval(countdownTimer);
    $("#countdown").innerHTML =
      "<div style='grid-column:1/-1'><strong>Alhamdulillah</strong><span>Hari bahagia telah tiba</span></div>";
    return;
  }

  const day = 1000 * 60 * 60 * 24;
  const hour = 1000 * 60 * 60;
  const minute = 1000 * 60;

  setText("#days", String(Math.floor(distance / day)).padStart(2, "0"));
  setText("#hours", String(Math.floor((distance % day) / hour)).padStart(2, "0"));
  setText("#minutes", String(Math.floor((distance % hour) / minute)).padStart(2, "0"));
  setText("#seconds", String(Math.floor((distance % minute) / 1000)).padStart(2, "0"));
}

updateCountdown();
countdownTimer = window.setInterval(updateCountdown, 1000);

/* ---------------------------------------------
   Card tilt pada perangkat pointer presisi
--------------------------------------------- */
const canTilt = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

if (canTilt) {
  $$(".tilt-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform =
        `perspective(900px) rotateX(${y * -5}deg) rotateY(${x * 5}deg) translateY(-3px)`;
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
}

/* ---------------------------------------------
   RSVP via WhatsApp
--------------------------------------------- */
$("#rsvpForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const name = $("#rsvpName").value.trim();
  const status = $("#rsvpStatus").value;
  const guests = $("#rsvpGuests").value;
  const message = $("#rsvpMessage").value.trim() || "-";

  if (!name || !status) {
    showToast("Mohon lengkapi nama dan konfirmasi kehadiran.");
    return;
  }

  const text = [
    "Assalamu’alaikum warahmatullahi wabarakatuh.",
    "",
    "Konfirmasi kehadiran Walimatul ‘Ursy Asep & Reihanna:",
    `Nama: ${name}`,
    `Status: ${status}`,
    `Jumlah tamu: ${guests}`,
    `Doa/ucapan: ${message}`,
    "",
    "Jazakumullahu khairan."
  ].join("\n");

  const whatsappURL =
    `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(text)}`;

  playChime();
  window.open(whatsappURL, "_blank", "noopener,noreferrer");
});

/* ---------------------------------------------
   Toast
--------------------------------------------- */
let toastTimer;

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast.classList.remove("show");
  }, 3200);
}

/* ---------------------------------------------
   Decorative particles generated in DOM
--------------------------------------------- */
function createParticles() {
  const layer = $(".ambient-layer");
  const symbols = ["✦", "✧", "·", "۞"];

  for (let i = 0; i < 16; i += 1) {
    const particle = document.createElement("span");
    particle.textContent = symbols[i % symbols.length];
    particle.setAttribute("aria-hidden", "true");

    Object.assign(particle.style, {
      position: "absolute",
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      color: i % 2 ? "rgba(232,184,95,.36)" : "rgba(13,91,86,.16)",
      fontSize: `${8 + Math.random() * 11}px`,
      animation: `twinkle ${2.4 + Math.random() * 3}s ease-in-out ${Math.random() * -4}s infinite`,
      pointerEvents: "none"
    });

    layer.appendChild(particle);
  }
}

hydrateInvitation();
hydrateGuest();
createParticles();
