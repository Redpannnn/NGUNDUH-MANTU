"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useInvitation } from "@/lib/invitation-store";
import Slide1Cover from "@/components/invitation/Slide1Cover";
import Slide2 from "@/components/invitation/Slide2";
import Slide3 from "@/components/invitation/Slide3";
import Slide4 from "@/components/invitation/Slide4";
import Slide5 from "@/components/invitation/Slide5";
import Slide6 from "@/components/invitation/Slide6";
import Slide7 from "@/components/invitation/Slide7";
import Slide8 from "@/components/invitation/Slide8";
import GuestManager from "@/components/invitation/GuestManager";
import MusicPlayer from "@/components/invitation/MusicPlayer";

export default function Home() {
  const current = useInvitation((s) => s.current);

  // ?manage → tampilkan halaman admin manage tamu (bukan undangan).
  const [isManage, setIsManage] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsManage(
      new URLSearchParams(window.location.search).has("manage")
    );
  }, []);

  if (isManage) {
    return <GuestManager />;
  }

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="min-h-[100dvh] w-full"
        >
          {renderContent(current)}
        </motion.div>
      </AnimatePresence>

      {/* Floating music player — only visible after invitation is opened */}
      <MusicPlayer />
    </>
  );
}

function renderContent(current: string): React.ReactNode {
  // Cover (slide 1) — full screen, no scroll. Button "Buka Undangan" sets
  // current to "slide-2".
  if (current === "cover") {
    return <Slide1Cover />;
  }

  // Opened state — render slides 2-8 stacked in a scrollable container.
  // Users scroll down through all the sections (no button clicks between them).
  return (
    <div className="w-full">
      <Slide2 />
      <Slide3 />
      <Slide4 />
      <Slide5 />
      <Slide6 />
      <Slide7 />
      <Slide8 />
    </div>
  );
}
