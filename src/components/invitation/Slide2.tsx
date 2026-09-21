"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useInvitation } from "@/lib/invitation-store";

const BG_IMAGE =
  "https://the.invisimple.id/wp-content/uploads/2026/03/BG-ALL-PAGE-TEMA-2-.jpg";

// Couple photos that rotate every 3 seconds (loop back-and-forth).
const PHOTOS = [
  "https://imglinkv-3.vercel.app/api/images/cmtve6ayyv53zdqqx/file",
  "https://imglinkv-3.vercel.app/api/images/cmtve6eqk9rxkoeek/file",
];

const ROTATE_INTERVAL_MS = 3000;

// Bunga dekoratif tema 2 — ditaruh di pojok kiri & kanan bawah (kanan di-mirror).
const FLOWER_ASSET =
  "https://the.invisimple.id/wp-content/uploads/2026/03/TEMA-2-BUNGA.png";

// Ayat Ar-Rum:21 — displayed below the photo.
const AYAH_TEXT =
  "Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.";
const AYAH_SOURCE = "Q.S Ar-Rum : 21";

// Staggered entrance animation for the content cluster.
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.18, delayChildren: 0.15 } },
};
const item = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function Slide2() {
  const goTo = useInvitation((s) => s.goTo);

  // index of the currently-shown photo
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setIdx((v) => (v + 1) % PHOTOS.length);
    }, ROTATE_INTERVAL_MS);
    return () => clearInterval(t);
  }, []);

  return (
    <main className="relative flex min-h-[100dvh] w-full flex-col items-center overflow-hidden bg-stone-100">
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

      {/* Subtle top darkening so any top-corner content stays readable */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/15 to-transparent"
      />

      {/* Back button — top-left, subtle */}
      <button
        type="button"
        onClick={() => goTo("cover")}
        aria-label="Kembali ke cover"
        className="group absolute left-4 top-6 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-[#544c39]/40 bg-white/60 text-[#544c39] backdrop-blur-sm transition-colors hover:border-[#544c39] hover:bg-white hover:text-[#3a3424] sm:left-8 sm:top-8"
      >
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
      </button>

      {/* Content */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 flex h-[100dvh] w-full flex-col items-center justify-end px-6"
      >
        {/* Center card: bg putih 85% (agak transparan) grouping photo + ayah.
            rounded-t-full (atas melengkung ngikutin foto capsule), rounded-b-[4.5rem]
            (bawah melengkung lebih dalam, bukan siku/lancip). */}
        <motion.div
          variants={item}
          className="flex w-[315px] flex-col items-center rounded-b-[4.5rem] rounded-t-full bg-white/85 px-3 pb-8 pt-3 shadow-[0_28px_60px_-20px_rgba(60,45,25,0.55)] ring-1 ring-white/70 backdrop-blur-sm sm:w-[357px]"
        >
          {/* Capsule / pill shaped photo with crossfade transition. */}
          <div className="relative h-[374px] w-[291px] overflow-hidden rounded-full border border-white/70 shadow-[0_22px_55px_-15px_rgba(0,0,0,0.45)] ring-1 ring-white/10 sm:h-[416px] sm:w-[333px]">
            <AnimatePresence mode="sync">
              <motion.img
                key={idx}
                src={PHOTOS[idx]}
                alt={`Foto mempelai ${idx + 1}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.1, ease: "easeInOut" }}
                className="absolute inset-0 h-full w-full object-cover"
                loading="eager"
              />
            </AnimatePresence>

            {/* tiny dot indicators so guests can see how many photos there are */}
            <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
              {PHOTOS.map((_, i) => (
                <span
                  key={i}
                  className={`h-1 w-1 rounded-full transition-colors duration-500 ${
                    i === idx ? "bg-white" : "bg-white/40"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Ayah — Q.S Ar-Rum : 21 (doa warna hitam di atas kartu putih). */}
          <div className="mb-6 mt-5 flex w-full flex-col items-center">
            {/* ornamental quote mark */}
            <span
              aria-hidden
              className="font-script mb-2 text-3xl leading-none text-black/40"
            >
              &ldquo;
            </span>

            <p className="font-script text-center text-[0.82rem] leading-relaxed text-black sm:text-[0.9rem]">
              {AYAH_TEXT}
            </p>

            {/* thin ornamental divider */}
            <span
              aria-hidden
              className="my-4 h-px w-24 bg-gradient-to-r from-transparent via-black/40 to-transparent"
            />

            <p className="font-latin text-[0.66rem] font-medium uppercase tracking-[0.28em] text-black sm:text-[0.7rem]">
              {AYAH_SOURCE}
            </p>
          </div>

        </motion.div>
      </motion.div>

      {/* Bunga dekoratif — pojok kiri bawah (rotated 90°, turun dikit nutup siku card) */}
      <motion.img
        src={FLOWER_ASSET}
        alt=""
        aria-hidden
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute -bottom-12 -left-[10%] z-20 h-44 w-44 rotate-90 object-contain sm:h-56 sm:w-56"
        loading="lazy"
      />

      {/* Bunga dekoratif — pojok kanan bawah (mirror + rotated -90° biar mirror kiri) */}
      <motion.img
        src={FLOWER_ASSET}
        alt=""
        aria-hidden
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute -bottom-12 -right-[10%] z-20 h-44 w-44 -scale-x-100 -rotate-90 object-contain sm:h-56 sm:w-56"
        loading="lazy"
      />
    </main>
  );
}
