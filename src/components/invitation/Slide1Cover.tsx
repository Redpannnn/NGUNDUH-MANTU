"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { useInvitation } from "@/lib/invitation-store";
import Birds from "@/components/invitation/Birds";

const BG_IMAGE =
  "https://the.invisimple.id/wp-content/uploads/2026/03/TEMA-2-COVER-BUKA-UNDANGAN-.jpg";
const COUPLE_PHOTO =
  "https://imglinkv-3.vercel.app/api/images/cmtve6fsli5003xyd/file";

// Staggered entrance animation
const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.15,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function Slide1Cover() {
  const openInvitation = useInvitation((s) => s.openInvitation);

  // Guest name — di-resolve dari URL ?to=<code|name>.
  //   • ?to=budi      → lookup ke DB /api/guests/lookup → "Budi Santoso" (jika terdaftar)
  //   • ?to=Budi+Sapo → tidak terdaftar → tampil "Budi Sapo" literal
  //   • (tanpa ?to=)  → fallback "Tamu Undangan"
  const [guestName, setGuestName] = useState("Tamu Undangan");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("to");
    if (!raw) return;
    const decoded = decodeURIComponent(raw.replace(/\+/g, " ")).trim();
    if (!decoded) return;

    // Cek di database dulu — kalau code terdaftar, pakai nama lengkapnya.
    fetch(`/api/guests/lookup?code=${encodeURIComponent(decoded)}`)
      .then((r) => r.json())
      .then((data) => {
        setGuestName(data?.name ?? decoded);
      })
      .catch(() => {
        setGuestName(decoded);
      });
  }, []);

  return (
    <main className="relative flex h-[100dvh] w-full flex-col items-center overflow-hidden bg-stone-100">
      {/* Background image */}
      <motion.img
        src={BG_IMAGE}
        alt="Latar undangan pernikahan"
        initial={{ scale: 1.08, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 h-full w-full object-cover"
        loading="eager"
        // @ts-expect-error -- fetchPriority is valid in React 19 but not in older types
        fetchPriority="high"
      />

      {/* (White fade di bawah dihapus — sekarang bg asli tampil apa adanya) */}

      {/* Subtle darkening at very top so the eyebrow text stays readable on bright photos */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/15 to-transparent"
      />

      {/* Content */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 flex h-full w-full flex-col items-center"
      >
        {/* Single centered column: The Wedding of → foto → nama → recipient block → button.
            justify-center biar grup ter-center vertikal (nggak nempel ke atas). */}
        <div className="relative flex w-full flex-1 flex-col items-center justify-center px-6 pt-4 pb-3">
          {/* Flock of 6 birds flying left↔right across the upper area */}
          <Birds />
          {/* Eyebrow — wedding script calligraphy, sits above the photo.
              Dikecilin + `mb-3` (dari mb-8) biar foto naik deket tulisan. */}
          <motion.p
            variants={item}
            className="font-wedding mb-1 text-[1.9rem] leading-none text-[#544c39] sm:text-[2.3rem]"
          >
            The Wedding of
          </motion.p>

          {/* Row container holding the couple photo.
              mt-2 biar foto geser dikit ke bawah dari tulisan. */}
          <div className="relative mt-2 flex w-full items-center justify-center">
            {/* Pill / capsule shaped photo — the couple (diperbesar dikit) */}
            <motion.div
              variants={item}
              className="relative z-[2] h-[215px] w-[148px] overflow-hidden rounded-full border border-white/70 shadow-[0_18px_45px_-12px_rgba(76,58,40,0.45)] ring-1 ring-stone-900/5 sm:h-[262px] sm:w-[181px]"
            >
              <img
                src={COUPLE_PHOTO}
                alt="Foto mempelai Fadhil & Meilany"
                className="h-full w-full object-cover"
                loading="eager"
              />
            </motion.div>
          </div>

          {/* Names — ALL CAPS, sit right below the photo.
              mt-4 biar nama geser dikit ke bawah dari foto. */}
          <motion.div
            variants={item}
            className="mt-3 flex flex-col items-center"
          >
            <h1 className="font-serif-display whitespace-nowrap text-center text-[1.2rem] font-medium uppercase tracking-[0.04em] text-[#740404] sm:text-[1.7rem]">
              Fadhil{" "}
              <span className="font-script text-[1.4em] font-normal italic text-[#740404]">
                &amp;
              </span>{" "}
              Meilany
            </h1>
          </motion.div>

          {/* Recipient block — mt-1 biar naik deket nama mempelai. */}
          <motion.div
            variants={item}
            className="mt-1 flex w-full max-w-[20rem] flex-col items-center"
          >
            {/* Kepada Yth. — font disamain dengan Bapak/Ibu/Saudara/i */}
            <p className="font-serif-display text-[0.72rem] text-[#3a3424] sm:text-[0.8rem]">
              Kepada Yth.
            </p>
            <p className="font-serif-display text-[0.72rem] text-[#3a3424] sm:text-[0.8rem]">
              Bapak/Ibu/Saudara/i
            </p>
            <p className="font-serif-display mt-0.5 text-[0.9rem] font-medium italic text-[#3a3424] sm:text-[1rem]">
              {guestName}
            </p>
            <p className="font-script mt-1 text-center text-[0.66rem] italic leading-relaxed text-black sm:text-[0.72rem]">
              *Mohon maaf jika ada kesalahan dalam penulisan nama / gelar.
            </p>
          </motion.div>

          {/* Button — diketat margin biar naik dikit. */}
          <motion.div
            variants={item}
            className="w-full pt-2"
          >
            <motion.button
              type="button"
              onClick={openInvitation}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="group mx-auto flex h-[1.8rem] w-full max-w-[9.6rem] items-center justify-center gap-1.5 rounded-full border border-[#740404]/40 bg-[#740404] px-3.5 text-[0.43rem] uppercase tracking-[0.28em] text-white backdrop-blur-sm transition-colors hover:border-[#740404] hover:bg-[#740404]/90 hover:text-white sm:text-[0.47rem]"
            >
              <Mail className="size-2.5 transition-transform group-hover:-rotate-6" />
              <span>Buka Undangan</span>
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </main>
  );
}
