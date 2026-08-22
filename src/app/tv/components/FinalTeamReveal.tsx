"use client";

import { motion, AnimatePresence } from "motion/react";
import { useEffect, useMemo, useState, forwardRef } from "react";

type Props = {
  teamName: string;
  position: number;
  active?: boolean;
  onComplete?: () => void;
};

const positionTextMap: Record<number, string> = {
  1: "1st Place",
  2: "2nd Place",
  3: "3rd Place",
};

/* =========================================================
   COUNTDOWN
========================================================= */

const CountdownNumber = forwardRef<HTMLDivElement, { number: number }>(({ number }, ref) => {
  return (
    <motion.div
      ref={ref}
      key={number}
      className="absolute inset-0 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Main number */}
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.5,
          filter: "blur(20px)",
        }}
        animate={{
          opacity: 1,
          scale: 1,
          filter: "blur(0px)",
        }}
        exit={{
          opacity: 0,
          scale: 1.2,
          filter: "blur(12px)",
        }}
        transition={{
          duration: 0.5,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="
          relative
          z-20
          font-bold
          leading-none
          select-none
          text-[clamp(150px,22vw,360px)]
        "
        style={{
          background: "linear-gradient(180deg, #fbb86b 0%, #eb5b36 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {number}
      </motion.div>
    </motion.div>
  );
});
CountdownNumber.displayName = "CountdownNumber";

/* =========================================================
   POPPER (CONFETTI)
========================================================= */

function Popper() {
  const particles = useMemo(() => {
    return Array.from({ length: 150 }, (_, i) => {
      const angle = (Math.PI * 2 * i) / 150 + (Math.random() * 0.5);
      const velocity = 400 + Math.random() * 1000;
      const colors = ['#fbb86b', '#eb5b36', '#d65b29', '#ffffff', '#ffedd5'];
      return {
        id: i,
        x: Math.cos(angle) * velocity,
        y: (Math.sin(angle) * velocity) - 300 - (Math.random() * 600), // bias upwards heavily
        size: 6 + Math.random() * 14,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 720,
        delay: Math.random() * 0.15,
        duration: 2 + Math.random() * 2,
        isCircle: Math.random() > 0.5,
      };
    });
  }, []);

  return (
    <div className="absolute inset-0 z-40 pointer-events-none overflow-hidden flex items-center justify-center">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{
            width: p.size,
            height: p.isCircle ? p.size : p.size * 1.5,
            backgroundColor: p.color,
            borderRadius: p.isCircle ? '50%' : '2px',
          }}
          initial={{
            x: 0,
            y: 0,
            opacity: 1,
            scale: 0,
            rotate: 0,
          }}
          animate={{
            x: p.x,
            y: p.y + 1200, // gravity pulling down
            opacity: [1, 1, 0],
            scale: 1,
            rotate: p.rotation,
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: [0.25, 1, 0.5, 1], // easeOutQuart-ish
          }}
        />
      ))}
    </div>
  );
}

/* =========================================================
   FINAL TEAM REVEAL
========================================================= */

export default function FinalTeamReveal({
  teamName,
  position,
  active = true,
  onComplete,
}: Props) {
  const [stage, setStage] = useState<"idle" | "3" | "2" | "1" | "explosion" | "final">(
    "idle"
  );

  useEffect(() => {
    if (!active) {
      setStage("idle");
      return;
    }

    setStage("3");

    const timers = [
      setTimeout(() => setStage("2"), 900),
      setTimeout(() => setStage("1"), 1800),
      setTimeout(() => setStage("explosion"), 2700),
      setTimeout(() => setStage("final"), 3000), // slightly faster than explosion for popper
      setTimeout(() => {
        console.log("[TV] FINAL REVEAL COMPLETE");
        if (onComplete) onComplete();
      }, 15000), // complete after 15 seconds
    ];

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [active, teamName, position]);

  return (
    <div
      className="
        fixed
        inset-0
        z-[9999]
        w-screen
        h-screen
        overflow-hidden
        select-none
      "
      style={{
        background: "radial-gradient(circle at center 40%, #a13c12 0%, #4a1c0d 50%, #1a0803 100%)"
      }}
    >
      {/* =================================================
          BACKGROUND OVERLAYS
      ================================================= */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Subtle noise texture */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPHJlY3Qgd2lkdGg9IjEiIGhlaWdodD0iMSIgZmlsbD0iIzAwMCIgZmlsbC1vcGFjaXR5PSIwLjEiLz4KPC9zdmc+')] mix-blend-overlay" />
      </div>

      {/* =================================================
          COUNTDOWN
      ================================================= */}
      <AnimatePresence mode="wait">
        {stage === "3" && (
          <CountdownNumber key="count-3" number={3} />
        )}

        {stage === "2" && (
          <CountdownNumber key="count-2" number={2} />
        )}

        {stage === "1" && (
          <CountdownNumber key="count-1" number={1} />
        )}
      </AnimatePresence>

      {/* =================================================
          POPPER (Replaces Explosion)
      ================================================= */}
      {(stage === "explosion" || stage === "final") && <Popper />}

      {/* =================================================
          FINAL REVEAL
      ================================================= */}
      <AnimatePresence>
        {stage === "final" && (
          <motion.div
            className="
              absolute
              inset-0
              z-[100]
              flex
              flex-col
              items-center
              justify-center
              text-center
              px-6
            "
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              duration: 0.8,
            }}
          >
            {/* POSITION BADGE */}
            <motion.div
              initial={{
                opacity: 0,
                y: 20,
                scale: 0.8,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              transition={{
                duration: 1,
                delay: 0.3,
                ease: "easeOut",
              }}
              className="
                relative
                z-30
                mb-4
                px-6
                py-2
                rounded-full
                border border-[#fbb86b]/40
                bg-[#fbb86b]/10
                backdrop-blur-sm
              "
              style={{
                boxShadow: "0 0 20px rgba(235,91,54,0.4), inset 0 0 10px rgba(251,184,107,0.2)",
              }}
            >
              <span 
                className="text-[clamp(16px,2.5vw,32px)] font-bold tracking-[0.2em] uppercase"
                style={{
                  background: "linear-gradient(90deg, #ffedd5 0%, #fbb86b 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0px 2px 10px rgba(251,184,107,0.5))",
                }}
              >
                {positionTextMap[position] || `${position}th Place`}
              </span>
            </motion.div>

            {/* TEAM NAME */}
            <div
              className="
                relative
                z-20
                max-w-[92vw]
                overflow-hidden
                px-8
                py-4
              "
            >
              <motion.h1
                initial={{
                  opacity: 0,
                  y: 35,
                  scale: 0.92,
                  filter: "blur(18px)",
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  filter: "blur(0px)",
                }}
                transition={{
                  duration: 1.5,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="
                  font-black
                  lowercase
                  leading-[0.9]
                  tracking-[-0.04em]
                  break-words
                  text-[clamp(60px,13vw,220px)]
                "
                style={{
                  background: "linear-gradient(180deg, #fbb86b 0%, #eb5b36 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0px 15px 25px rgba(235,91,54,0.3))",
                }}
              >
                {teamName}
              </motion.h1>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}