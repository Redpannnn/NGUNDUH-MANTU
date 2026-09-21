"use client";

import { motion } from "framer-motion";

/**
 * Bird image source — a small bird PNG supplied by the user.
 */
const BIRD_IMAGE =
  "https://imglinkv-3.vercel.app/api/images/cmt0ur079djwa5esx/file";

type BirdConfig = {
  /** top offset as a percentage string (relative to the region height) */
  top: string;
  /** duration of one screen crossing (seconds) */
  duration: number;
  /** animation delay (seconds) — negative = start mid-flight so the flock is
   *  already scattered across the sky on page load */
  delay: number;
  /** width of the bird image in px (small!) */
  size: number;
  /** direction of travel this trip */
  reverse?: boolean;
  /** wing flap rate (seconds per up-down-up cycle) — varies per bird */
  flapSpeed: number;
  /** opacity, so some birds look further away */
  opacity?: number;
};

const BIRDS: BirdConfig[] = [
  { top: "14%", duration: 16, delay: 0,  size: 24, flapSpeed: 0.32, opacity: 0.85 },
  { top: "8%",  duration: 18, delay: 4,  size: 20, flapSpeed: 0.28, reverse: true, opacity: 0.85 },
  { top: "22%", duration: 20, delay: 7,  size: 26, flapSpeed: 0.36, opacity: 0.85 },
  { top: "6%",  duration: 15, delay: 10, size: 16, flapSpeed: 0.26, reverse: true, opacity: 0.85 },
  { top: "26%", duration: 22, delay: 2,  size: 22, flapSpeed: 0.3,  opacity: 0.85 },
  { top: "18%", duration: 17, delay: 13, size: 18, flapSpeed: 0.34, reverse: true, opacity: 0.85 },
];

// Birds travel across the full viewport width using vw units passed directly
// to Framer Motion (it handles vw reliably, unlike @keyframes CSS in some
// Chromium builds).
const FROM_X = "-10vw";
const TO_X = "110vw";

/**
 * A small flock of 6 birds (using the user-supplied bird PNG) flying
 * left↔right across the area they're placed in.
 *
 * Wing-flap motion: because the bird is a single raster PNG (not separable
 * SVG wings), we simulate flapping with a fast vertical scale oscillation on
 * the image — scaleY between ~1.0 (wings spread) and ~0.55 (wings tucked up),
 * anchored at the bird's center. This produces a visible "pumping" motion
 * that reads as flapping at small sizes.
 *
 * Place inside a `relative` parent that represents the "sky" region.
 */
export default function Birds() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {BIRDS.map((b, i) => {
        // vertical bob (px) — bird bobs up a little mid-flight.
        const bob = [0, -8, 0, -6, 0];
        const keyframesX = b.reverse
          ? [TO_X, "80vw", "50vw", "20vw", FROM_X]
          : [FROM_X, "20vw", "50vw", "80vw", TO_X];
        return (
          <motion.div
            key={i}
            className="absolute left-0"
            style={{
              top: b.top,
              width: b.size,
              height: b.size,
              opacity: b.opacity ?? 1,
              transformOrigin: "center",
            }}
            initial={{ x: FROM_X }}
            animate={{ x: keyframesX, y: bob }}
            transition={{
              duration: b.duration,
              delay: -b.delay, // negative = start mid-flight
              ease: "linear",
              repeat: Infinity,
              times: [0, 0.25, 0.5, 0.75, 1],
            }}
          >
            {/* Inner wrapper that handles the wing-flap scaleY oscillation
                SEPARATELY from the outer translate — so Framer Motion doesn't
                have to combine x/y and scale in one transform set. */}
            <motion.img
              src={BIRD_IMAGE}
              alt=""
              className="block h-full w-full object-contain"
              style={{ transformOrigin: "center" }}
              animate={{ scaleY: [1, 0.55, 1] }}
              transition={{
                duration: b.flapSpeed,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        );
      })}
    </div>
  );
}
