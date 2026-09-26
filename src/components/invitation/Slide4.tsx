"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { useInvitation } from "@/lib/invitation-store";

const BG_IMAGE =
  "https://the.invisimple.id/wp-content/uploads/2026/03/BG-ALL-PAGE-TEMA-2-.jpg";

// Bunga dekoratif tema 2 — ditaruh di pojok kartu acara.
const FLOWER_ASSET =
  "https://the.invisimple.id/wp-content/uploads/2026/03/TEMA-2-BUNGA.png";

// Target countdown: Ngunduh Mantu — Sabtu, 12 Desember 2026, 09:00 WIB (UTC+7).
// 09:00 WIB = 02:00 UTC → 2026-12-12T02:00:00Z.
// (Sebelumnya countdown ke Akad Nikah 30 Nov 2026, sekarang ke Ngunduh Mantu
//  per user request — biar countdown ngarah ke acara utama terakhir.)
const AKAD_TARGET = new Date("2026-12-12T06:00:00Z").getTime();

// Link Google Maps khusus untuk lokasi Akad Nikah (Mushola Al Maabdah).
const AKAD_MAP_URL = "https://maps.app.goo.gl/u5Tmtumsag47Uj9k9";

// Alamat Kediaman Mempelai Pria (lokasi Ngunduh Mantu).
const NGUNDUH_MANTU_ADDRESS =
  "Jl. Grogol No.12 RT 006 RW 003, Pudakpayung, Banyumanik, Semarang";

// Link Google Maps khusus untuk Ngunduh Mantu (Kediaman Mempelai Pria).
const NGUNDUH_MANTU_MAP_URL = "https://maps.app.goo.gl/D2JUtb8jTU5gRRwS6";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15, delayChildren: 0.15 } },
};
const item = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const },
  },
};

/** Live countdown to AKAD_TARGET. Returns days/hours/minutes/seconds left. */
function useCountdown(target: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, target - now);
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1_000);
  return { days, hours, minutes, seconds };
}

function EventCard({
  title,
  date,
  time,
  venue,
  address,
  mapUrl,
}: {
  title: string;
  date: string;
  /** Jam acara. Kalau undefined, baris jam tidak dirender. */
  time?: string;
  venue: string;
  /** Alamat venue. Kalau undefined, baris alamat tidak dirender. */
  address?: string;
  /** Link Google Maps khusus. Kalau dikasih, dipakai apa adanya.
   *  Kalau undefined, fallback ke search URL otomatis dari venue + address. */
  mapUrl?: string;
}) {
  // Kalau ada custom mapUrl (mis. short link maps.app.goo.gl) pakai itu;
  // kalau tidak, bangun search URL dari venue (+ address kalau ada).
  const href =
    mapUrl ??
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      address ? `${venue}, ${address}` : venue
    )}`;

  return (
    <motion.div
      variants={item}
      className="relative flex w-full max-w-[22rem] flex-col items-center overflow-hidden rounded-3xl bg-[#f4f4ec] px-6 py-8 text-center shadow-[0_22px_50px_-18px_rgba(60,45,25,0.4)]"
    >
      {/* Bunga dekoratif pojok kanan atas (z-10, di atas konten). */}
      <img
        src={FLOWER_ASSET}
        alt=""
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-8 z-10 h-32 w-32 object-contain sm:h-36 sm:w-36"
        loading="lazy"
      />
      <h3 className="font-wedding relative z-[1] text-[2.4rem] leading-none text-[#544c39] sm:text-[2.8rem]">
        {title}
      </h3>

      <p className="font-script relative z-[1] mt-3 text-[0.95rem] text-[#3a3424] sm:text-[1.05rem]">
        {date}
      </p>

      {time && (
        <p className="font-script relative z-[1] mt-2 text-[0.9rem] text-[#3a3424] sm:text-[1rem]">
          {time}
        </p>
      )}

      <span
        aria-hidden
        className="relative z-[1] my-4 h-px w-20 bg-gradient-to-r from-transparent via-[#544c39]/40 to-transparent"
      />

      <p className="font-script relative z-[1] text-[0.95rem] font-medium text-[#3a3424] sm:text-[1.05rem]">
        {venue}
      </p>
      {address && (
        <p className="font-script relative z-[1] mt-1 text-[0.72rem] leading-relaxed text-[#3a3424] sm:text-[0.78rem]">
          {address}
        </p>
      )}

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative z-[1] mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[#544c39]/40 bg-white/60 px-5 text-[0.62rem] font-medium uppercase tracking-[0.24em] text-[#544c39] backdrop-blur-sm transition-colors hover:border-[#544c39] hover:bg-white hover:text-[#3a3424] sm:text-[0.68rem]"
      >
        <MapPin className="size-3.5 transition-transform group-hover:-translate-y-0.5" />
        Lihat Lokasi
      </a>
    </motion.div>
  );
}

/**
 * CombinedEventCard — satu kartu solid (#f4f4ec) yang menampung beberapa sesi
 * acara (mis. Resepsi + Tamu Undangan) sekaligus, dengan venue/alamat/tombol
 * lokasi yang dibagian. Cocok ketika beberapa sesi hanya beda jam tapi lokasinya
 * sama, sehingga tidak perlu dibuat kartu terpisah.
 */
type Session = { title: string; date: string; time: string };

function CombinedEventCard({
  sessions,
  venue,
  address,
  mapUrl,
}: {
  sessions: Session[];
  venue: string;
  address: string;
  /** Link Google Maps khusus. Kalau dikasih, dipakai apa adanya.
   *  Kalau undefined, fallback ke search URL otomatis dari venue + address. */
  mapUrl?: string;
}) {
  const href =
    mapUrl ??
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${venue}, ${address}`
    )}`;

  return (
    <motion.div
      variants={item}
      className="relative flex w-full max-w-[22rem] flex-col items-center overflow-hidden rounded-3xl bg-[#f4f4ec] px-6 py-8 text-center shadow-[0_22px_50px_-18px_rgba(60,45,25,0.4)]"
    >
      {/* Bunga dekoratif pojok kiri bawah (z-10, di atas konten). */}
      <img
        src={FLOWER_ASSET}
        alt=""
        aria-hidden
        className="pointer-events-none absolute -bottom-8 -left-8 z-10 h-32 w-32 object-contain sm:h-36 sm:w-36"
        loading="lazy"
      />
      {sessions.map((s, i) => (
        <div key={i} className={i > 0 ? "relative z-[1] mt-7 w-full flex flex-col items-center" : "relative z-[1] w-full flex flex-col items-center"}>
          <h3 className="font-wedding text-[2.4rem] leading-none text-[#544c39] sm:text-[2.8rem]">
            {s.title}
          </h3>
          <p className="font-script mt-3 text-[0.95rem] text-[#3a3424] sm:text-[1.05rem]">
            {s.date}
          </p>
          <p className="font-script mt-2 text-[0.9rem] text-[#3a3424] sm:text-[1rem]">
            {s.time}
          </p>
        </div>
      ))}

      <span
        aria-hidden
        className="relative z-[1] my-4 h-px w-20 bg-gradient-to-r from-transparent via-[#544c39]/40 to-transparent"
      />

      <p className="font-script relative z-[1] text-[0.95rem] font-medium text-[#3a3424] sm:text-[1.05rem]">
        {venue}
      </p>
      <p className="font-script relative z-[1] mt-1 text-[0.72rem] leading-relaxed text-[#3a3424] sm:text-[0.78rem]">
        {address}
      </p>

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative z-[1] mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[#544c39]/40 bg-white/60 px-5 text-[0.62rem] font-medium uppercase tracking-[0.24em] text-[#544c39] backdrop-blur-sm transition-colors hover:border-[#544c39] hover:bg-white hover:text-[#3a3424] sm:text-[0.68rem]"
      >
        <MapPin className="size-3.5 transition-transform group-hover:-translate-y-0.5" />
        Lihat Lokasi
      </a>
    </motion.div>
  );
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  const padded = String(value).padStart(2, "0");
  return (
    <div className="flex flex-col items-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f4f4ec] font-latin text-[1.4rem] font-medium text-[#3a3424] shadow-[0_8px_20px_-8px_rgba(60,45,25,0.4)] sm:h-16 sm:w-16 sm:text-[1.7rem]">
        {padded}
      </div>
      <span className="font-latin mt-2 text-[0.55rem] font-medium uppercase tracking-[0.2em] text-white sm:text-[0.6rem]">
        {label}
      </span>
    </div>
  );
}

export default function Slide4() {
  const { days, hours, minutes, seconds } = useCountdown(AKAD_TARGET);

  return (
    <main className="relative flex min-h-[100dvh] w-full flex-col items-center overflow-hidden bg-stone-100">
      {/* Background image — fixed (parallax) like slide 3 */}
      <motion.img
        src={BG_IMAGE}
        alt="Latar slide acara"
        initial={{ scale: 1.08, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        className="h-full w-full object-cover"
        style={{ position: "fixed", inset: 0, zIndex: 0 }}
        loading="eager"
      />
      {/* Bg solid overlay #7c0000 (80% opacity, no blur) — di slide 4 aja.
          position: absolute (bukan fixed) supaya cuma nutupin area slide 4,
          nggak bocor ke slide lain. Bg dasar masih tembus samar redup. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] bg-[#7c0000]/80"
      />
      {/* Content */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 flex w-full flex-col items-center px-6 py-20"
      >
        {/* SAVE THE DATE — putih biar kontras di atas overlay merah */}
        <motion.h2
          variants={item}
          className="font-wedding text-[2.6rem] leading-none text-white sm:text-[3.2rem]"
        >
          Save The Date
        </motion.h2>

        {/* Ngunduh Mantu — venue Kediaman Mempelai Pria.
            Dipindah ke ATAS (sebelum Akad Nikah) per user request.
            (Resepsi & Tamu Undangan diubah jadi Ngunduh Mantu per user request.) */}
        <div className="mt-12 flex w-full justify-center">
          <CombinedEventCard
            sessions={[
              {
                title: "Tasyakuran Ngunduh Mantu",
                date: "Sabtu, 12 Desember 2026",
                time: "Pukul 13.00 WIB - Selesai",
              },
            ]}
            venue="Kediaman Mempelai Pria"
            address={NGUNDUH_MANTU_ADDRESS}
            mapUrl={NGUNDUH_MANTU_MAP_URL}
          />
        </div>

        {/* Akad Nikah — dipindah ke BAWAH per user request.
            Jam & alamat dihapus; cuma judul, tanggal, venue, & tombol lokasi.
            Tombol "Lihat Lokasi" pakai custom Google Maps link. */}
        <div className="mt-8 flex w-full justify-center">
          <EventCard
            title="Akad Nikah"
            date="Senin, 30 November 2026"
            venue="Mushola Al Maabdah"
            mapUrl={AKAD_MAP_URL}
          />
        </div>

        {/* Countdown */}
        <motion.div
          variants={item}
          className="mt-14 flex w-full flex-col items-center"
        >
          <p className="font-latin text-[0.72rem] font-medium uppercase tracking-[0.32em] text-white sm:text-[0.78rem]">
            Menuju hari bahagia
          </p>

          <div className="mt-6 flex items-start gap-3 sm:gap-4">
            <CountdownUnit value={days} label="Hari" />
            <span className="font-latin mt-5 text-[1.4rem] text-white sm:text-[1.7rem]">:</span>
            <CountdownUnit value={hours} label="Jam" />
            <span className="font-latin mt-5 text-[1.4rem] text-white sm:text-[1.7rem]">:</span>
            <CountdownUnit value={minutes} label="Menit" />
            <span className="font-latin mt-5 text-[1.4rem] text-white sm:text-[1.7rem]">:</span>
            <CountdownUnit value={seconds} label="Detik" />
          </div>
        </motion.div>
      </motion.div>
    </main>
  );
}
