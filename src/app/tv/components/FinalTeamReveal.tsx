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
  4: "4th Place",
};

const isArabic = (text?: string) => /[\u0600-\u06FF]/.test(text || '');

/* =========================================================
   COUNTDOWN NUMBER
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
        y: (Math.sin(angle) * velocity) - 300 - (Math.random() * 600),
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
            y: p.y + 1200,
            opacity: [1, 1, 0],
            scale: 1,
            rotate: p.rotation,
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: [0.25, 1, 0.5, 1],
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
  const [stage, setStage] = useState<"idle" | "5" | "4" | "3" | "2" | "1" | "explosion" | "final">("idle");
  const isAr = isArabic(teamName);

  // ---------------------------------------------------------
  // Control Sequence Timing
  // ---------------------------------------------------------
  useEffect(() => {
    if (!active) {
      setStage("idle");
      return;
    }

    let timers: ReturnType<typeof setTimeout>[] = [];

    if (position === 1) {
      setStage("5");
      timers = [
        setTimeout(() => setStage("4"), 1200),
        setTimeout(() => setStage("3"), 2400),
        setTimeout(() => setStage("2"), 3600),
        setTimeout(() => setStage("1"), 4800),
        setTimeout(() => setStage("explosion"), 6000), // Dramatic explosion
        setTimeout(() => setStage("final"), 7500), // Wait 1.5s for explosion
      ];
    } else {
      setStage("3");
      timers = [
        setTimeout(() => setStage("2"), 1200),
        setTimeout(() => setStage("1"), 2400),
        setTimeout(() => setStage("explosion"), 3600), // Dramatic explosion
        setTimeout(() => setStage("final"), 5100), // Wait 1.5s for explosion
      ];
    }

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [active, teamName, position]);

  // ---------------------------------------------------------
  // Explosion Sound (Synthesized with AudioContext Fallback)
  // ---------------------------------------------------------
  useEffect(() => {
    if (stage !== "explosion" || !active) return;
    
    let ctx: AudioContext | null = null;
    let audio: HTMLAudioElement | null = null;

    try {
      audio = new Audio('/sounds/explosion.mp3');
      audio.volume = 1.0;
      audio.play().catch(() => {
        // Fallback: Synthesized explosion
        console.log('[Audio Note] /sounds/explosion.mp3 missing. Using fallback synthesized explosion.');
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;
        
        ctx = new AudioContextClass();
        
        // 1. Initial Crack (High frequency burst)
        const crack = ctx.createBufferSource();
        const crackBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
        const cData = crackBuffer.getChannelData(0);
        for(let i=0; i<cData.length; i++) cData[i] = (Math.random() * 2 - 1);
        crack.buffer = crackBuffer;
        
        const crackFilter = ctx.createBiquadFilter();
        crackFilter.type = 'highpass';
        crackFilter.frequency.value = 1500;
        
        const crackGain = ctx.createGain();
        crackGain.gain.setValueAtTime(1.5, ctx.currentTime);
        crackGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        
        crack.connect(crackFilter).connect(crackGain).connect(ctx.destination);
        crack.start();

        // 2. Punchy Boom (Sine wave rapid pitch drop)
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(160, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 0.3); // Drop pitch rapidly
        
        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(2.5, ctx.currentTime);
        oscGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        
        osc.connect(oscGain).connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);

        // 3. Heavy Rumble (Low frequency noise tail)
        const boom = ctx.createBufferSource();
        const boomBuffer = ctx.createBuffer(1, ctx.sampleRate * 2.0, ctx.sampleRate);
        const bData = boomBuffer.getChannelData(0);
        for(let i=0; i<bData.length; i++) bData[i] = (Math.random() * 2 - 1);
        boom.buffer = boomBuffer;
        
        const boomFilter = ctx.createBiquadFilter();
        boomFilter.type = 'lowpass';
        boomFilter.frequency.setValueAtTime(300, ctx.currentTime);
        boomFilter.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 1.2);
        
        const boomGain = ctx.createGain();
        boomGain.gain.setValueAtTime(2.0, ctx.currentTime); // Loud
        boomGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);
        
        boom.connect(boomFilter).connect(boomGain).connect(ctx.destination);
        boom.start();
      });
    } catch (e) {
      console.error(e);
    }

    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      if (ctx && ctx.state !== 'closed') {
        ctx.close().catch(() => {});
      }
    };
  }, [stage, active]);

  // ---------------------------------------------------------
  // Smooth Sweep Reveal Audio (Web Audio API)
  // ---------------------------------------------------------
  useEffect(() => {
    if (stage !== "final" || !active) return;

    let clickInterval: ReturnType<typeof setInterval>;
    let AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();

    const playSoftTick = () => {
      if (ctx.state === 'suspended') ctx.resume();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      // A soft, low-pitch click
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.04);
      
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    };

    let ticksPlayed = 0;
    const maxTicks = 18; // Enough ticks to cover the smooth animation duration

    const startDelay = setTimeout(() => {
      clickInterval = setInterval(() => {
        playSoftTick();
        ticksPlayed++;
        if (ticksPlayed >= maxTicks) {
          clearInterval(clickInterval);
        }
      }, 100);
    }, 300); // 300ms delay to perfectly sync with the animation delay

    return () => {
      clearTimeout(startDelay);
      clearInterval(clickInterval);
      if (ctx.state !== 'closed') {
        ctx.close().catch(() => {});
      }
    };
  }, [stage, active]);

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
        <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPHJlY3Qgd2lkdGg9IjEiIGhlaWdodD0iMSIgZmlsbD0iIzAwMCIgZmlsbC1vcGFjaXR5PSIwLjEiLz4KPC9zdmc+')] mix-blend-overlay" />
      </div>

      {/* =================================================
          COUNTDOWN
      ================================================= */}
      <AnimatePresence mode="wait">
        {stage === "5" && <CountdownNumber key="count-5" number={5} />}
        {stage === "4" && <CountdownNumber key="count-4" number={4} />}
        {stage === "3" && <CountdownNumber key="count-3" number={3} />}
        {stage === "2" && <CountdownNumber key="count-2" number={2} />}
        {stage === "1" && <CountdownNumber key="count-1" number={1} />}
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
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
                px-8
                py-4
              "
            >
              <motion.h1
                initial={{
                  opacity: 0,
                  y: 15,
                  scale: 0.96,
                  filter: "blur(12px)",
                  // For Arabic (RTL), hide from right side to left. For English, hide left to right.
                  clipPath: isAr ? "inset(0 0 0 100%)" : "inset(0 100% 0 0%)"
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  filter: "blur(0px)",
                  clipPath: "inset(0 0% 0 0%)"
                }}
                transition={{
                  duration: 2.0, // overall smooth fade/blur ease
                  ease: [0.16, 1, 0.3, 1],
                  clipPath: {
                    duration: 2.2, // elegant sweeping mask reveal
                    ease: [0.25, 1, 0.5, 1],
                    delay: 0.3 // slight delay after explosion
                  },
                  opacity: {
                    duration: 1.5,
                    delay: 0.3
                  }
                }}
                className={`
                  font-black
                  lowercase
                  leading-[0.9]
                  tracking-[-0.04em]
                  break-words
                  text-[clamp(60px,13vw,220px)]
                  ${isAr ? 'font-ge-ss-two' : ''}
                `}
                style={{
                  background: "linear-gradient(180deg, #fbb86b 0%, #eb5b36 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0px 15px 25px rgba(235,91,54,0.3))",
                  paddingBottom: "10px" // give space for drop shadow to not get clipped
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