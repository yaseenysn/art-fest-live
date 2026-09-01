"use client";

import { motion } from "motion/react";
import { IResult } from "@/types";

export default function ResultsDesign2({
  results,
  revealStage = 'WINNER'
}: {
  results: IResult[];
  revealStage?: 'PLACE' | 'WINNER';
}) {
  const isArabic = (text?: string) => /[\u0600-\u06FF]/.test(text || '');

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
    <div className="relative h-[100dvh] w-full overflow-hidden bg-[#080b13] text-white select-none">

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
            BIG POSITION NUMBER
        ===================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            scale: 0.7,
            y: 40,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}
          transition={{
            duration: 1,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="relative mt-4"
        >

          {/* Glow behind number */}
          <div
            className="
              absolute
              inset-0
              scale-75
              rounded-full
              bg-blue-500/20
              blur-[80px]
            "
          />

          {/* Number */}
          <div
            className="
              relative
              text-[clamp(150px,25vw,430px)]
              font-black
              leading-[0.8]
              tracking-[-0.08em]
              text-transparent
              [-webkit-text-stroke:3px_rgba(96,165,250,0.95)]
              drop-shadow-[0_0_25px_rgba(59,130,246,0.7)]
            "
          >
            {position}
            <span className="text-[0.4em] tracking-normal relative -top-[0.4em] ml-1 [-webkit-text-stroke:2px_rgba(96,165,250,0.95)] text-transparent">
              {suffix}
            </span>
          </div>

          {/* Inner blue highlight */}
          <div
            className="
              pointer-events-none
              absolute
              inset-0
              bg-gradient-to-b
              from-blue-300/20
              via-transparent
              to-fuchsia-500/20
              bg-clip-text
            "
          />
        </motion.div>

        {/* =====================================================
            POSITION
        ===================================================== */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.35,
            duration: 0.7,
          }}
          className="
            mt-[-10px]
            text-center
          "
        >


          {/* Thin glowing line */}
          <div className="mx-auto mt-7 h-px w-72 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_15px_rgba(96,165,250,0.9)]" />
        </motion.div>

        {/* =====================================================
            WINNER NAME
        ===================================================== */}

        {revealStage === 'WINNER' && (
          <motion.div
            key="winner-name"
            initial={{
              opacity: 0,
              y: 35,
              filter: "blur(12px)",
            }}
            animate={{
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
            }}
            transition={{
              duration: 1,
            }}
            className="
              mt-8
              max-w-[85%]
              text-center
              flex flex-col
              items-center
            "
          >
            <h1
              dir={isArabic(result.studentName) ? "rtl" : "ltr"}
              className={`
                text-[clamp(32px,5vw,100px)]
                font-light
                uppercase
                leading-tight
                tracking-[0.08em]
                text-white
                drop-shadow-[0_0_25px_rgba(255,255,255,0.18)]
                break-words
                max-w-full
                ${isArabic(result.studentName) ? 'font-ge-ss-two' : ''}
              `}
            >
              {result.studentName}
            </h1>

            {teamName && (
              <div
                dir={isArabic(teamName) ? "rtl" : "ltr"}
                className={`
                  mt-4 md:mt-6
                  font-bold
                  uppercase
                  text-blue-200
                  drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]
                  break-words
                  max-w-full
                  leading-[1.2]
                  ${isArabic(teamName) ? 'font-ge-ss-two text-[clamp(24px,4vw,72px)]' : 'tracking-[0.2em] text-[clamp(20px,3.5vw,64px)]'}
                `}
              >
                {teamName}
              </div>
            )}
          </motion.div>
        )}



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