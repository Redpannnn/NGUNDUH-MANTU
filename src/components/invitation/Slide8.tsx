"use client";

import { motion } from "framer-motion";
import { useInvitation } from "@/lib/invitation-store";

const BG_IMAGE =
  "https://the.invisimple.id/wp-content/uploads/2026/03/BG-ALL-PAGE-TEMA-2-.jpg";

// Couple photo for the closing capsule.
const COUPLE_PHOTO =
  "https://imglinkv-3.vercel.app/api/images/cmtve6eqk9rxkoeek/file";

const CLOSING_DOA =
  "Merupakan suatu kebahagiaan dan kehormatan bagi kami, apabila Bapak/Ibu/Saudara/i, berkenan hadir dan memberikan do’a restu kepada kami.";

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

export default function Slide8() {
  const goTo = useInvitation((s) => s.goTo);

  return (
    <main className="relative flex min-h-[100dvh] w-full flex-col items-center overflow-hidden bg-stone-100">
      <motion.img
        src={BG_IMAGE}
        alt="Latar penutup"
        initial={{ scale: 1.08, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        className="h-full w-full object-cover"
        style={{ position: "fixed", inset: 0, zIndex: 0 }}
        loading="eager"
      />
      {/* Bg solid overlay putih (60% opacity, no blur) — di slide 8 aja.
          position: absolute supaya scoped ke slide 8, nggak bocor ke slide lain. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] bg-white/60"
      />
      <button
        type="button"
        onClick={() => goTo("cover")}
        aria-label="Kembali ke cover"
        className="group absolute left-4 top-6 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-[#544c39]/40 bg-white/60 text-[#544c39] backdrop-blur-sm transition-colors hover:border-[#544c39] hover:bg-white hover:text-[#3a3424] sm:left-8 sm:top-8"
      >
        <svg className="size-4 transition-transform group-hover:-translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 flex w-full max-w-[24rem] flex-col items-center px-6 py-20 text-center"
      >
        {/* Couple photo — capsule shape */}
        <motion.div
          variants={item}
          className="relative h-64 w-44 overflow-hidden rounded-full border border-white/70 shadow-[0_18px_45px_-12px_rgba(76,58,40,0.45)] ring-1 ring-stone-900/5 sm:h-72 sm:w-48"
        >
          <img
            src={COUPLE_PHOTO}
            alt="Foto pengantin Fadhil & Meilany"
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </motion.div>

        {/* Terima Kasih — font latin wedding (Great Vibes) */}
        <motion.h2
          variants={item}
          className="font-wedding mt-6 text-[3rem] leading-none text-[#544c39] sm:text-[3.6rem]"
        >
          Terima Kasih
        </motion.h2>

        {/* Doa */}
        <motion.p
          variants={item}
          className="font-script mt-5 text-[0.82rem] leading-relaxed text-black sm:text-[0.9rem]"
        >
          {CLOSING_DOA}
        </motion.p>

        {/* Wassalamu'alaikum */}
        <motion.p
          variants={item}
          className="font-script mt-5 text-[0.82rem] leading-relaxed text-black sm:text-[0.9rem]"
        >
          Wassalamu&rsquo;alaikum warahmatullahi wabarakatuh
        </motion.p>

        {/* thin ornamental divider */}
        <motion.span
          variants={item}
          aria-hidden
          className="my-6 h-px w-24 bg-gradient-to-r from-transparent via-[#544c39]/40 to-transparent"
        />

        {/* Kami yang berbahagia */}
        <motion.p
          variants={item}
          className="font-latin text-[0.62rem] font-medium uppercase tracking-[0.28em] text-black sm:text-[0.68rem]"
        >
          Kami yang berbahagia
        </motion.p>

        {/* Fadhil & Meilany — font latin wedding */}
        <motion.p
          variants={item}
          className="font-wedding mt-2 text-[2rem] leading-none text-[#5b0101] sm:text-[2.4rem]"
        >
          Fadhil &amp; Meilany
        </motion.p>
      </motion.div>
    </main>
  );
}
