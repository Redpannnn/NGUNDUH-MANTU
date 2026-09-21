"use client";

import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useInvitation } from "@/lib/invitation-store";

const BG_IMAGE =
  "https://the.invisimple.id/wp-content/uploads/2026/03/BG-ALL-PAGE-TEMA-2-.jpg";

// Couple photos — reuse the same capsule photos from slide 2.
const BRIDE_PHOTO =
  "https://imglinkv-3.vercel.app/api/images/cmtvmc47l3y66ch3r/file";
const GROOM_PHOTO =
  "https://imglinkv-3.vercel.app/api/images/cmtvmb39nk30zp56h/file";

// The "&" decorative separator between the bride and groom blocks.
const AMPERSAND_IMAGE =
  "https://the.invisimple.id/wp-content/uploads/2024/10/06.png";

// Bunga dekoratif tema 2 — ditaruh di pojok kanan atas foto bride.
const FLOWER_ASSET =
  "https://the.invisimple.id/wp-content/uploads/2026/03/TEMA-2-BUNGA.png";

// Staggered entrance animation for the content cluster.
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

export default function Slide3() {
  const goTo = useInvitation((s) => s.goTo);

  return (
    <main className="relative flex min-h-[100dvh] w-full flex-col items-center overflow-hidden bg-stone-100">
      {/* Background image — FIXED (parallax) so it stays put while the user
          scrolls through the long content. Using inline style position:fixed
          because Tailwind's `fixed` on an <img> inside an overflow-hidden
          parent can still scroll on iOS; the explicit fixed + inset-0 + the
          body being the scroll container keeps the bg truly stationary. */}
      <motion.img
        src={BG_IMAGE}
        alt="Latar slide mempelai"
        initial={{ scale: 1.08, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        className="h-full w-full object-cover"
        style={{ position: "fixed", inset: 0, zIndex: 0 }}
        loading="eager"
        // @ts-expect-error -- fetchPriority is valid in React 19 but not in older types
        fetchPriority="high"
      />

      {/* Subtle top darkening so the back button & salam stays readable */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-32 bg-gradient-to-b from-black/15 to-transparent"
      />

      {/* Back button — top-left, scroll back to slide 2 */}
      <button
        type="button"
        onClick={() => goTo("cover")}
        aria-label="Kembali ke cover"
        className="group absolute left-4 top-6 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-[#544c39]/40 bg-white/60 text-[#544c39] backdrop-blur-sm transition-colors hover:border-[#544c39] hover:bg-white hover:text-[#3a3424] sm:left-8 sm:top-8"
      >
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
      </button>

      {/* Content — capsule-shaped solid card (#640202) so it reads as one unified
          block against the fixed background. Semua teks putih. */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 flex w-[calc(100%-2rem)] max-w-[26rem] flex-col items-center rounded-b-full rounded-t-full border-2 border-[#f2cc6d] bg-[#640202]/80 px-6 pb-16 pt-16 shadow-[0_28px_60px_-20px_rgba(60,45,25,0.45)] my-10 mx-4"
      >
        {/* Doa pembuka */}
        <motion.div
          variants={item}
          className="flex w-full flex-col items-center text-center"
        >
          <p className="font-script text-center text-[0.72rem] leading-relaxed text-white sm:text-[0.78rem]">
            Maha Suci Allah yang telah menciptakan makhluk-Nya
            berpasang-pasangan. Ya Allah semoga ridho-Mu tercurah mengiringi
            pernikahan kami.
          </p>
        </motion.div>

        {/* ───── Groom block (dipindah ke atas per user request) ───── */}
        <motion.div
          variants={item}
          className="mt-4 flex w-full flex-col items-center"
        >
          {/* Capsule photo + bunga ornamen di pojok kiri atas (mirror dari bride) */}
          <div className="relative">
            <div className="relative z-[2] h-64 w-44 overflow-hidden rounded-full border border-white/70 shadow-[0_18px_45px_-12px_rgba(76,58,40,0.45)] ring-1 ring-stone-900/5 sm:h-72 sm:w-48">
              <img
                src={GROOM_PHOTO}
                alt="Foto mempelai pria"
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            {/* Bunga pojok kiri atas foto groom. Mirror (-scale-x-100) lewat
                wrapper div biar nggak ditimpa Framer Motion inline transform.
                Turun dikit + diperbesar (ukuran sama kayak bride). z-[1] di bawah foto. */}
            <div className="pointer-events-none absolute -left-10 top-0 z-[1] h-32 w-32 -scale-x-100 sm:h-36 sm:w-36">
              <motion.img
                src={FLOWER_ASSET}
                alt=""
                aria-hidden
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="h-full w-full object-contain"
                loading="lazy"
              />
            </div>
          </div>

          {/* Nama panggilan — font latin wedding (Great Vibes) */}
          <p className="font-wedding mt-4 text-[3rem] leading-none text-[#f2cc6d] sm:text-[3.4rem]">
            Fadhil
          </p>

          {/* Nama lengkap — font-script */}
          <p className="font-script mt-1 text-[0.85rem] text-white sm:text-[0.95rem]">
            Fadhil Rizqi Nur Syahid
          </p>

          {/* Putra dari — font-script */}
          <p className="font-script mt-3 text-[0.72rem] text-white sm:text-[0.78rem]">
            Putra Tunggal dari
          </p>
          <p className="font-script mt-1 text-[0.85rem] text-white sm:text-[0.95rem]">
            Bapak Bambang Suroso &amp; Ibu Mutmainah
          </p>
          <p className="font-script mt-1.5 max-w-[16rem] text-center text-[0.7rem] leading-relaxed text-white sm:text-[0.76rem]">
            Jl. Grogol No.12 RT 006 RW 003, Kelurahan Pudak Payung, Kec. Banyumanik, Kota Semarang
          </p>
        </motion.div>

        {/* ───── Ampersand separator ───── */}
        <motion.div variants={item} className="my-6 flex items-center justify-center">
          <img
            src={AMPERSAND_IMAGE}
            alt="Pernikahan"
            className="h-auto w-16 object-contain opacity-90 sm:w-20"
            loading="lazy"
          />
        </motion.div>

        {/* ───── Bride block (dipindah ke bawah per user request) ───── */}
        <motion.div
          variants={item}
          className="flex w-full flex-col items-center"
        >
          {/* Capsule photo + bunga ornamen di pojok kanan atas (index di bawah foto) */}
          <div className="relative">
            <div className="relative z-[2] h-64 w-44 overflow-hidden rounded-full border border-white/70 shadow-[0_18px_45px_-12px_rgba(76,58,40,0.45)] ring-1 ring-stone-900/5 sm:h-72 sm:w-48">
              <img
                src={BRIDE_PHOTO}
                alt="Foto mempelai wanita"
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            {/* Bunga pojok kanan atas foto bride. Turun dikit + diperbesar.
                z-[1] = di bawah foto (z-[2]). */}
            <motion.img
              src={FLOWER_ASSET}
              alt=""
              aria-hidden
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-none absolute -right-10 top-0 z-[1] h-32 w-32 object-contain sm:h-36 sm:w-36"
              loading="lazy"
            />
          </div>

          {/* Nama panggilan — font latin wedding (Great Vibes) */}
          <p className="font-wedding mt-4 text-[3rem] leading-none text-[#f2cc6d] sm:text-[3.4rem]">
            Meilany
          </p>

          {/* Nama lengkap — font-script */}
          <p className="font-script mt-1 text-[0.85rem] text-white sm:text-[0.95rem]">
            Meilany Nugraheni
          </p>

          {/* Putri dari — font-script */}
          <p className="font-script mt-3 text-[0.72rem] text-white sm:text-[0.78rem]">
            Putri Tunggal dari
          </p>
          <p className="font-script mt-1 text-[0.85rem] text-white sm:text-[0.95rem]">
            Bapak Sugeng Aminanto &amp; Ibu Siti Hidayati
          </p>
          <p className="font-script mt-1.5 max-w-[16rem] text-center text-[0.7rem] leading-relaxed text-white sm:text-[0.76rem]">
            Krajan 1 RT 003 RW 002, Desa Tegaron, Kec. Banyubiru, Kab. Semarang
          </p>
        </motion.div>
      </motion.div>
    </main>
  );
}
