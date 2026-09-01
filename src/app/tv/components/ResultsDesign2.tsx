"use client";

import { motion } from "motion/react";
import { IResult } from "@/types";

const isArabic = (text?: string) => /[\u0600-\u06FF]/.test(text || '');

export default function ResultsDesign2({
  results,
  revealStage = 'WINNER'
}: {
  results: IResult[];
  revealStage?: 'PLACE' | 'WINNER';
}) {
  if (!results || results.length === 0) return null;

  const result = results[0];

  const position = result.position || 1;

  const suffix =
    position === 1
      ? "ST"
      : position === 2
        ? "ND"
        : position === 3
          ? "RD"
          : "TH";

  const program = result.programId as any;
  const programName = program?.name || "PROGRAM";

  const teamName =
    (result.teamId as any)?.name || "";

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#080b13] text-white select-none">

      {/* =========================================================
          BACKGROUND
      ========================================================= */}

      {/* Main blue light from top */}
      <div
        className="
          absolute
          left-1/2
          top-[-25%]
          h-[90%]
          w-[45%]
          -translate-x-1/2
          rounded-full
          bg-blue-500/20
          blur-[120px]
        "
      />

      {/* Center glow */}
      <div
        className="
          absolute
          left-1/2
          top-1/2
          h-[55%]
          w-[45%]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-indigo-500/10
          blur-[100px]
        "
      />

      {/* Subtle grid */}
      <div
        className="
          absolute
          inset-0
          opacity-[0.08]
          bg-[linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)]
          bg-[size:45px_45px]
        "
      />

      {/* Dark vignette */}
      <div
        className="
          absolute
          inset-0
          bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.7)_100%)]
        "
      />

      {/* =========================================================
          TOP BRAND
      ========================================================= */}

      <div className="absolute left-12 top-10 z-20">
        <div className="text-3xl font-bold tracking-tight text-white">
          AL MAHSAN
        </div>
      </div>



      {/* =========================================================
          MAIN CONTENT
      ========================================================= */}

      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center">

        {/* Program */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="
            absolute
            top-[6%]
            text-center
          "
        >
          <div className="text-3xl font-black tracking-[0.45em] text-white uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
            {programName}
          </div>
        </motion.div>

        {/* =====================================================
            WINNERS LIST
        ===================================================== */}

        <div className="flex flex-row flex-wrap justify-center items-center w-full max-w-[95%] mt-12 gap-8 md:gap-12">
          {results.map((result, idx) => {
            const position = result.position || 1;
            const suffix =
              position === 1 ? "ST" : position === 2 ? "ND" : position === 3 ? "RD" : "TH";
            const teamName = (result.teamId as any)?.name || "";
            const isMultiple = results.length > 1;

            return (
              <div key={`${result.studentName}-${idx}`} className="flex flex-col items-center flex-1 min-w-0 max-w-full">
                {/* BIG POSITION NUMBER */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.7, y: 40 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 1, delay: idx * 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className="relative mt-4"
                >
                  <div className="absolute inset-0 scale-75 rounded-full bg-blue-500/20 blur-[80px]" />
                  <div
                    className={`
                      relative font-black leading-[0.8] tracking-[-0.08em] text-transparent
                      [-webkit-text-stroke:3px_rgba(96,165,250,0.95)] drop-shadow-[0_0_25px_rgba(59,130,246,0.7)]
                      ${isMultiple ? "text-[clamp(100px,14vw,220px)]" : "text-[clamp(220px,25vw,430px)]"}
                    `}
                  >
                    {position}
                    <span className="text-[0.4em] tracking-normal relative -top-[0.4em] ml-1 [-webkit-text-stroke:2px_rgba(96,165,250,0.95)] text-transparent">
                      {suffix}
                    </span>
                  </div>
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-blue-300/20 via-transparent to-fuchsia-500/20 bg-clip-text" />
                </motion.div>

                {/* POSITION LINE */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + idx * 0.15, duration: 0.7 }}
                  className="mt-[-10px] text-center w-full"
                >
                  <div className="mx-auto mt-7 h-px w-full max-w-[288px] bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_15px_rgba(96,165,250,0.9)]" />
                </motion.div>

                {/* WINNER NAME & TEAM */}
                {revealStage === 'WINNER' && (
                  <motion.div
                    initial={{ opacity: 0, y: 35, filter: "blur(12px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 1, delay: idx * 0.15 }}
                    className="mt-8 max-w-[95%] text-center"
                  >
                    <h1
                      className={`
                        font-light uppercase leading-tight tracking-[0.08em] text-white
                        drop-shadow-[0_0_25px_rgba(255,255,255,0.18)] break-words
                        ${isMultiple ? "text-[clamp(32px,5vw,75px)]" : "text-[clamp(55px,7vw,120px)]"}
                      `}
                    >
                      {result.studentName || "WINNER"}
                    </h1>

                    {teamName && (
                      <div
                        dir={isArabic(teamName) ? "rtl" : "ltr"}
                        className={`
                          font-medium uppercase text-blue-300 break-words min-w-0 max-w-full leading-[1.2]
                          ${isArabic(teamName) ? 'font-ge-ss-two' : 'tracking-[0.35em]'}
                          ${isMultiple ? "mt-4 md:mt-5 text-[clamp(20px,2.5vw,40px)]" : "mt-6 md:mt-10 text-[clamp(32px,4vw,60px)]"}
                        `}
                      >
                        {teamName}
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* =========================================================
          DECORATIVE LIGHT RIBBONS
      ========================================================= */}

      <motion.div
        initial={{ x: "-20%", opacity: 0 }}
        animate={{ x: "0%", opacity: 0.8 }}
        transition={{ duration: 1.5 }}
        className="
          pointer-events-none
          absolute
          bottom-[18%]
          left-[-8%]
          h-32
          w-[45%]
          rotate-[-12deg]
          rounded-full
          border-t
          border-blue-400/50
          shadow-[0_-5px_30px_rgba(59,130,246,0.35)]
        "
      />

      <motion.div
        initial={{ x: "20%", opacity: 0 }}
        animate={{ x: "0%", opacity: 0.5 }}
        transition={{
          delay: 0.3,
          duration: 1.5,
        }}
        className="
          pointer-events-none
          absolute
          right-[-10%]
          top-[20%]
          h-40
          w-[40%]
          rotate-[18deg]
          rounded-full
          border-t
          border-fuchsia-400/30
          shadow-[0_-5px_30px_rgba(168,85,247,0.25)]
        "
      />

      {/* Bottom subtle line */}
      <div className="absolute bottom-8 left-10 right-10 h-px bg-white/10" />



    </div>
  );
}