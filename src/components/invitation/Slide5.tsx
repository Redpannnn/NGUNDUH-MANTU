"use client";

import { motion } from "framer-motion";
import { useInvitation } from "@/lib/invitation-store";

const BG_IMAGE =
  "https://the.invisimple.id/wp-content/uploads/2026/03/BG-ALL-PAGE-TEMA-2-.jpg";

// 9 foto Our Moment — layout masonry 3 kolom yang rapi & balance.
// Tiling (dengan grid-flow-dense):
//   Row1: P1 P1 P2   (P1 = big feature 2×2)
//   Row2: P1 P1 P3
//   Row3: P4 P5 P6
//   Row4: P7 P8 P9
const MOMENTS = [
  {
    src: "https://imglinkv-3.vercel.app/api/images/cmtve6ayyv53zdqqx/file",
    alt: "Momen 1",
    className: "col-span-2 row-span-2",
  },
  {
    src: "https://imglinkv-3.vercel.app/api/images/cmtve6fsli5003xyd/file",
    alt: "Momen 2",
    className: "col-span-1 row-span-1",
  },
  {
    src: "https://imglinkv-3.vercel.app/api/images/cmtve6eqk9rxkoeek/file",
    alt: "Momen 3",
    className: "col-span-1 row-span-1",
  },
  {
    src: "https://imglinkv-3.vercel.app/api/images/cmtvn83zai9ct3rdf/file",
    alt: "Momen 4",
    className: "col-span-1 row-span-1",
  },
  {
    src: "https://imglinkv-3.vercel.app/api/images/cmtvn85dd8xcs4f8j/file",
    alt: "Momen 5",
    className: "col-span-1 row-span-1",
  },
  {
    src: "https://imglinkv-3.vercel.app/api/images/cmtvn87lrep9fbobq/file",
    alt: "Momen 6",
    className: "col-span-1 row-span-1",
  },
  {
    src: "https://imglinkv-3.vercel.app/api/images/cmtvn86ob7wziof9v/file",
    alt: "Momen 7",
    className: "col-span-1 row-span-1",
  },
  {
    src: "https://imglinkv-3.vercel.app/api/images/cmtve6dkxrrwsizst/file",
    alt: "Momen 8",
    className: "col-span-1 row-span-1",
  },
  {
    src: "https://imglinkv-3.vercel.app/api/images/cmtve6h6sdq2yy7ey/file",
    alt: "Momen 9",
    className: "col-span-1 row-span-1",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};
const item = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function Slide5() {
  const goTo = useInvitation((s) => s.goTo);

  return (
    <main className="relative flex min-h-[100dvh] w-full flex-col items-center overflow-hidden bg-stone-100">
      {/* Background image — fixed (parallax) */}
      <motion.img
        src={BG_IMAGE}
        alt="Latar our moment"
        initial={{ scale: 1.08, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        className="h-full w-full object-cover"
        style={{ position: "fixed", inset: 0, zIndex: 0 }}
        loading="eager"
      />
      {/* Bg solid overlay #7c0000 (80% opacity, no blur) — di slide 5 aja.
          position: absolute supaya scoped ke slide 5, nggak bocor ke slide lain. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] bg-[#7c0000]/80"
      />
      {/* Back button */}
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

      {/* Content */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 flex w-full max-w-[26rem] flex-col items-center px-6 py-20"
      >
        <motion.h2
          variants={item}
          className="font-wedding text-[2.6rem] leading-none text-white sm:text-[3.2rem]"
        >
          Our Moment
        </motion.h2>

        <span
          aria-hidden
          className="my-6 h-px w-24 bg-gradient-to-r from-transparent via-white/40 to-transparent"
        />

        {/* Gallery grid — 3 cols, asymmetric spans for a masonry feel.
            grid-flow-dense membantu auto-placement menutup celah dengan rapi. */}
        <div className="grid w-full auto-rows-[7rem] grid-cols-3 gap-3 [grid-auto-flow:dense] sm:auto-rows-[8rem] sm:gap-4">
          {MOMENTS.map((m, i) => (
            <motion.div
              key={i}
              variants={item}
              className={`relative overflow-hidden rounded-2xl shadow-[0_10px_25px_-12px_rgba(60,45,25,0.45)] ${m.className}`}
            >
              <img
                src={m.src}
                alt={m.alt}
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                loading="lazy"
              />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </main>
  );
}
