(() => {
  "use strict";

  const config = window.WEDDING_CONFIG || {};
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const elements = {
    loader: $(".page-loader"),
    cover: $("#cover"),
    openButton: $("#openInvitation"),
    guestName: $("#guestName"),
    petalField: $("#petalField"),
    countdown: {
      days: $("#days"),
      hours: $("#hours"),
      minutes: $("#minutes"),
      seconds: $("#seconds")
    },
    saveDate: $("#saveDate"),
    backToTop: $("#backToTop"),
    toast: $("#toast"),
    rsvpForm: $("#rsvpForm"),
    formStatus: $("#formStatus")
  };

  function safeText(id, value) {
    const node = document.getElementById(id);
    if (node && typeof value === "string" && value.trim()) node.textContent = value;
  }

  function applyConfig() {
    const event = config.event || {};
    const maps = config.maps || {};

    safeText("akadTime", event.akadTime);
    safeText("receptionTime", event.receptionTime);
    safeText("akadVenue", event.akadVenue);
    safeText("akadAddress", event.akadAddress);
    safeText("receptionVenue", event.receptionVenue);
    safeText("receptionAddress", event.receptionAddress);
    safeText("mapVenue", event.receptionVenue);
    safeText("mapAddress", event.receptionAddress);
    safeText("locationSummary", `${event.receptionVenue || "Lokasi acara"}, ${event.receptionAddress || "alamat akan diperbarui"}`);

    const query = encodeURIComponent(maps.query || event.receptionAddress || "Bandung, Jawa Barat");
    const frame = $("#mapFrame");
    const mapLink = $("#mapLink");
    if (frame) frame.src = `https://www.google.com/maps?q=${query}&output=embed`;
    if (mapLink) mapLink.href = `https://www.google.com/maps/search/?api=1&query=${query}`;
  }

  function getGuestFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const guest = params.get("to") || params.get("kepada") || "Bapak/Ibu/Saudara/i";
    return guest.replace(/[<>]/g, "").trim().slice(0, 80) || "Bapak/Ibu/Saudara/i";
  }

  function createPetals() {
    if (!elements.petalField || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const count = window.innerWidth < 680 ? 18 : 34;
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < count; i += 1) {
      const petal = document.createElement("span");
      petal.className = "petal";
      petal.style.left = `${Math.random() * 100}%`;
      petal.style.setProperty("--size", `${8 + Math.random() * 13}px`);
      petal.style.setProperty("--duration", `${10 + Math.random() * 12}s`);
      petal.style.setProperty("--delay", `${-Math.random() * 18}s`);
      petal.style.setProperty("--drift", `${-70 + Math.random() * 140}px`);
      petal.style.setProperty("--opacity", `${0.35 + Math.random() * 0.55}`);
      fragment.appendChild(petal);
    }

    elements.petalField.appendChild(fragment);
  }

  function openInvitation() {
    elements.cover?.classList.add("is-open");
    document.body.classList.remove("locked");
    document.body.classList.add("invitation-open");
    sessionStorage.setItem("invitationOpened", "true");
    window.setTimeout(() => $("#home")?.focus?.(), 900);
  }

  function initCover() {
    if (elements.guestName) elements.guestName.textContent = getGuestFromUrl();
    elements.openButton?.addEventListener("click", openInvitation);

    if (sessionStorage.getItem("invitationOpened") === "true") {
      elements.cover?.classList.add("is-open");
      document.body.classList.remove("locked");
      document.body.classList.add("invitation-open");
    }
  }

  function updateCountdown() {
    const target = new Date(config.event?.isoStart || "2026-08-17T08:00:00+07:00").getTime();
    const now = Date.now();
    const distance = target - now;

    if (!Number.isFinite(target)) return;

    if (distance <= 0) {
      elements.countdown.days.textContent = "00";
      elements.countdown.hours.textContent = "00";
      elements.countdown.minutes.textContent = "00";
      elements.countdown.seconds.textContent = "00";
      return;
    }

    const day = 1000 * 60 * 60 * 24;
    const hour = 1000 * 60 * 60;
    const minute = 1000 * 60;
    const pad = (value) => String(value).padStart(2, "0");

    elements.countdown.days.textContent = pad(Math.floor(distance / day));
    elements.countdown.hours.textContent = pad(Math.floor((distance % day) / hour));
    elements.countdown.minutes.textContent = pad(Math.floor((distance % hour) / minute));
    elements.countdown.seconds.textContent = pad(Math.floor((distance % minute) / 1000));
  }

  function formatICSDate(dateValue) {
    const date = new Date(dateValue);
    return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  }

  function escapeICS(text = "") {
    return String(text)
      .replace(/\\/g, "\\\\")
      .replace(/\n/g, "\\n")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;");
  }

  function downloadCalendar() {
    const event = config.event || {};
    const title = "Pernikahan Asep & Reihanna";
    const description = "Undangan walimatul 'ursy Asep Saepudin, ST. dan apt. Reihanna Yasmine Fauzia, S.Farm.";
    const location = `${event.receptionVenue || ""}, ${event.receptionAddress || ""}`.replace(/^,\s*/, "");
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Asep & Reihanna//Wedding Invitation//ID",
      "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      `UID:${Date.now()}@asep-reihanna-wedding`,
      `DTSTAMP:${formatICSDate(new Date())}`,
      `DTSTART:${formatICSDate(event.isoStart || "2026-08-17T08:00:00+07:00")}`,
      `DTEND:${formatICSDate(event.isoEnd || "2026-08-17T14:00:00+07:00")}`,
      `SUMMARY:${escapeICS(title)}`,
      `DESCRIPTION:${escapeICS(description)}`,
      `LOCATION:${escapeICS(location)}`,
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "pernikahan-asep-reihanna-17-agustus-2026.ics";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast("Tanggal berhasil disiapkan untuk kalender.");
  }

  function initReveal() {
    const items = $$(".reveal");
    if (!("IntersectionObserver" in window)) {
      items.forEach((item) => item.classList.add("visible"));
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -35px" });

    items.forEach((item, index) => {
      item.style.transitionDelay = `${Math.min(index % 4, 3) * 80}ms`;
      observer.observe(item);
    });
  }

  function initNavigation() {
    const navLinks = $$(".floating-nav a");
    const sections = navLinks
      .map((link) => document.querySelector(link.getAttribute("href")))
      .filter(Boolean);

    const updateActive = () => {
      const position = window.scrollY + window.innerHeight * 0.35;
      let current = sections[0]?.id;
      sections.forEach((section) => {
        if (position >= section.offsetTop) current = section.id;
      });
      navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${current}`);
      });

      elements.backToTop?.classList.toggle("visible", window.scrollY > 700);
    };

    window.addEventListener("scroll", updateActive, { passive: true });
    updateActive();
    elements.backToTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  function initRipple() {
    $$(".ripple").forEach((button) => {
      button.addEventListener("click", (event) => {
        const circle = document.createElement("span");
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const rect = button.getBoundingClientRect();
        circle.className = "ripple-effect";
        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${event.clientX - rect.left - diameter / 2}px`;
        circle.style.top = `${event.clientY - rect.top - diameter / 2}px`;
        button.querySelector(".ripple-effect")?.remove();
        button.appendChild(circle);
      });
    });
  }

  let toastTimer;
  function showToast(message) {
    if (!elements.toast) return;
    window.clearTimeout(toastTimer);
    elements.toast.textContent = message;
    elements.toast.classList.add("show");
    toastTimer = window.setTimeout(() => elements.toast.classList.remove("show"), 3200);
  }

  function initRSVP() {
    elements.rsvpForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(elements.rsvpForm);
      const name = String(formData.get("name") || "").trim();
      const attendance = String(formData.get("attendance") || "").trim();
      const guestCount = String(formData.get("guestCount") || "1");
      const guestArea = String(formData.get("guestArea") || "Area umum");
      const wishes = String(formData.get("wishes") || "-").trim() || "-";
      const phone = String(config.contact?.whatsapp || "").replace(/\D/g, "");

      if (!name || !attendance) {
        elements.formStatus.textContent = "Mohon lengkapi nama dan konfirmasi kehadiran.";
        return;
      }

      if (!phone || /^6280+$/.test(phone)) {
        elements.formStatus.textContent = "Nomor WhatsApp belum diatur. Ubah contact.whatsapp pada config.js.";
        showToast("Silakan atur nomor WhatsApp pada config.js.");
        return;
      }

      const message = [
        "Assalamu'alaikum warahmatullahi wabarakatuh.",
        "",
        "Konfirmasi Undangan Pernikahan Asep & Reihanna",
        `Nama: ${name}`,
        `Kehadiran: ${attendance}`,
        `Jumlah tamu: ${guestCount} orang`,
        `Pilihan area: ${guestArea}`,
        `Doa/Ucapan: ${wishes}`,
        "",
        "Jazakumullahu khairan."
      ].join("\n");

      localStorage.setItem("weddingRSVP", JSON.stringify({ name, attendance, guestCount, guestArea, wishes }));
      elements.formStatus.textContent = "WhatsApp akan dibuka untuk mengirim konfirmasi.";
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    });

    try {
      const saved = JSON.parse(localStorage.getItem("weddingRSVP") || "null");
      if (saved) {
        $("#rsvpName").value = saved.name || "";
        $("#attendance").value = saved.attendance || "";
        $("#guestCount").value = saved.guestCount || "1";
        $("#guestArea").value = saved.guestArea || "Area umum";
        $("#wishes").value = saved.wishes === "-" ? "" : (saved.wishes || "");
      }
    } catch {
      localStorage.removeItem("weddingRSVP");
    }
  }

  function hideLoader() {
    window.setTimeout(() => elements.loader?.classList.add("hidden"), 380);
  }

  document.addEventListener("DOMContentLoaded", () => {
    applyConfig();
    initCover();
    createPetals();
    initReveal();
    initNavigation();
    initRipple();
    initRSVP();
    updateCountdown();
    window.setInterval(updateCountdown, 1000);
    elements.saveDate?.addEventListener("click", downloadCalendar);
  });

  window.addEventListener("load", hideLoader);
})();
