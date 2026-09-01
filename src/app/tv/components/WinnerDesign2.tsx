"use client";

import React from "react";
import { motion } from "motion/react";
import { AllWinnersConfig } from "./AllWinnersRouter";

const isArabic = (text?: string) => /[\u0600-\u06FF]/.test(text || '');

type WinnerItem = {
  studentName?: string;
  name?: string;
  teamName?: string;
  team?: string;
  teamColor?: string;
  points?: number;
};

type PositionWinner = {
  position: 1 | 2 | 3;
  names: string;
  teamName?: string;
  programName?: string;
  exists: boolean;
};

const WinnerNode = ({
  winner,
  isFirst = false,
  delay,
}: {
  winner: PositionWinner;
  isFirst?: boolean;
  delay: number;
}) => {
  if (!winner.exists) return null;

  return (
    <motion.div
      initial={{ x: -40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{
        duration: 0.7,
        delay,
        ease: "easeOut",
      }}
      className={`
        flex items-center
        w-full
        gap-[clamp(14px,1.8vw,32px)]
        ${isFirst ? "scale-[1.06] origin-left" : ""}
      `}
    >
      {/* POSITION CIRCLE */}
      <div
        className={`
          shrink-0
          rounded-full
          flex
          items-center
          justify-center
          relative
          bg-gradient-to-br
          from-white
          to-[#f7f4ff]
          border
          border-[#9b5cff]
          shadow-[0_0_25px_rgba(139,92,246,0.35)]
          ${isFirst
            ? `
                w-[clamp(82px,8.2vw,158px)]
                h-[clamp(82px,8.2vw,158px)]
                border-[clamp(3px,0.35vw,6px)]
              `
            : `
                w-[clamp(68px,6.7vw,130px)]
                h-[clamp(68px,6.7vw,130px)]
                border-[clamp(3px,0.3vw,5px)]
              `
          }
        `}
      >
        {/* INNER RING */}
        <div
          className="
            absolute
            inset-[7%]
            rounded-full
            border
            border-purple-300/40
          "
        />

        {/* NUMBER */}
        <span
          className={`
            relative
            z-10
            font-black
            leading-none
            text-[#7c3aed]
            ${isFirst
              ? "text-[clamp(42px,4.2vw,80px)]"
              : "text-[clamp(34px,3.4vw,64px)]"
            }
          `}
        >
          {winner.position}
        </span>
      </div>

      {/* WINNER DETAILS */}
      <div className="min-w-0 flex flex-col justify-center">
        {/* WINNER NAME */}
        <h2
          className={`
            font-black
            uppercase
            text-white
            leading-[0.95]
            tracking-tight
            break-words
            ${isFirst
              ? "text-[clamp(24px,3vw,52px)]"
              : "text-[clamp(20px,2.35vw,40px)]"
            }
          `}
        >
          {winner.names !== "—"
            ? winner.names
            : winner.teamName}
        </h2>

        {/* TEAM NAME */}
        <div
          dir={isArabic(winner.teamName) ? 'rtl' : 'ltr'}
          className={`
            uppercase
            break-words
            min-w-0
            max-w-full
            mt-[clamp(8px,1vw,16px)]
            leading-[1.2]
            text-[#a855f7]
            ${isArabic(winner.teamName) ? 'font-ge-ss-two font-bold' : 'tracking-wide font-bold'}
            ${isFirst
              ? "text-[clamp(20px,3vw,36px)]"
              : "text-[clamp(16px,2vw,28px)]"
            }
          `}
        >
          {winner.teamName || "TEAM"}
        </div>

        {/* PROGRAM NAME */}
        <div
          className={`
            uppercase
            font-medium
            tracking-wide
            mt-[clamp(4px,0.5vw,8px)]
            text-white/65
            ${isFirst
              ? "text-[clamp(12px,1vw,18px)]"
              : "text-[clamp(10px,0.8vw,14px)]"
            }
          `}
        >
          {winner.programName}
        </div>
      </div>

      {/* CONNECTION LINE */}
      <div
        className="
          hidden
          md:block
          flex-1
          min-w-[40px]
          h-[1px]
          ml-2
          bg-gradient-to-r
          from-purple-500/60
          via-purple-400/25
          to-transparent
        "
      />
    </motion.div>
  );
};

export default function WinnerDesign2({
  programName,
  language,
  category,
  eventName = "AL MAHSAN",
  eventYear,
  winnersByPosition,
  id = "winner-design-2",
}: AllWinnersConfig) {
  /*
   * Convert winnersByPosition into
   * position-based data.
   */
  const getPositionWinner = (
    position: 1 | 2 | 3
  ): PositionWinner => {
    const winners =
      (winnersByPosition?.[position] || []) as WinnerItem[];

    const names = winners
      .map(
        (winner) =>
          winner.studentName ||
          winner.name ||
          ""
      )
      .filter(Boolean)
      .join(" • ");

    const teamNames = Array.from(
      new Set(
        winners.map(w => w.teamName || w.team || "").filter(Boolean)
      )
    ).join(" • ");

    return {
      position,
      names: names || "—",
      teamName: teamNames || "TEAM",
      programName,
      exists: winners.length > 0,
    };
  };

  const first = getPositionWinner(1);
  const second = getPositionWinner(2);
  const third = getPositionWinner(3);

  return (
    <div
      id={id}
      className="
        fixed
        inset-0
        w-full
        h-full
        overflow-hidden
        select-none
        bg-[#090211]
        text-white
      "
    >
      {/* =====================================================
          BACKGROUND EFFECTS
      ====================================================== */}

      <div
        className="
          absolute
          inset-0
          overflow-hidden
          pointer-events-none
        "
      >
        {/* RIGHT PURPLE GLOW */}
        <div
          className="
            absolute
            right-[-12vw]
            top-[12vh]
            w-[48vw]
            aspect-square
            rounded-full
            bg-purple-700/20
            blur-[120px]
          "
        />

        {/* LEFT PURPLE GLOW */}
        <div
          className="
            absolute
            left-[-18vw]
            top-[12vh]
            w-[48vw]
            aspect-square
            rounded-full
            bg-violet-900/15
            blur-[120px]
          "
        />

        {/* LEFT LARGE RING */}
        <div
          className="
            absolute
            left-[-15vw]
            top-[15vh]
            w-[48vw]
            aspect-square
            rounded-full
            border
            border-white/[0.055]
          "
        />

        {/* LEFT INNER RING */}
        <div
          className="
            absolute
            left-[-10vw]
            top-[22vh]
            w-[38vw]
            aspect-square
            rounded-full
            border
            border-white/[0.035]
          "
        />

        {/* RIGHT RING */}
        <div
          className="
            absolute
            right-[4vw]
            top-[23vh]
            w-[32vw]
            aspect-square
            rounded-full
            border
            border-purple-400/[0.08]
          "
        />

        {/* RIGHT INNER RING */}
        <div
          className="
            absolute
            right-[7vw]
            top-[26vh]
            w-[28vw]
            aspect-square
            rounded-full
            border
            border-purple-400/[0.06]
          "
        />

        {/* DOT TEXTURE */}
        <div
          className="
            absolute
            inset-0
            opacity-[0.04]
          "
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.8) 0.7px, transparent 0.7px)",
            backgroundSize: "7px 7px",
          }}
        />
      </div>

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div
        className="
          relative
          z-40
          w-full
          shrink-0
          px-[clamp(28px,4.5vw,86px)]
          pt-[clamp(28px,5vh,58px)]
        "
      >
        <motion.div
          initial={{
            opacity: 0,
            y: -20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.8,
          }}
          className="w-full flex flex-col items-center justify-center text-center relative"
        >
          {/* ABSOLUTE TOP LEFT INFO */}
          <div className="absolute top-0 left-0 text-left">
            <div className="text-white/75 font-bold uppercase tracking-[0.35em] text-[clamp(11px,1vw,19px)]">
              {eventName} {eventYear}
            </div>
          </div>

          {/* ABSOLUTE TOP RIGHT LIVE STATUS */}
          <div className="absolute top-0 right-0 flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-black/30 backdrop-blur-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.9)]" />
            <span className="text-white font-bold uppercase tracking-[0.15em] text-[10px] md:text-xs">LIVE</span>
          </div>

          {/* MAIN CENTERED HEADER */}
          <h1
            className="text-white/90 font-black uppercase text-center leading-tight mt-6"
            style={{
              fontSize: "clamp(20px, 1.8vw, 32px)",
              letterSpacing: "0.2em",
              textShadow: "0 4px 20px rgba(255,255,255,0.2)"
            }}
          >
            CONGRATULATIONS<br />WINNERS
          </h1>

          <h2
            dir={isArabic(programName) ? "rtl" : "ltr"}
            className={`text-white font-black uppercase tracking-tight leading-none mt-3 max-w-[85vw] break-words ${isArabic(programName) ? 'font-ge-ss-two' : ''}`}
            style={{
              fontSize: "clamp(36px, 4.5vw, 72px)",
              letterSpacing: isArabic(programName) ? "normal" : "clamp(0.08em, 0.15vw, 0.15em)",
              textShadow: "0 4px 30px rgba(255,255,255,0.4)"
            }}
          >
            {programName}
          </h2>

          <div className="mt-4 text-purple-300 font-bold uppercase tracking-[0.3em] text-[clamp(14px,1.2vw,22px)]">
            {language || "OTHER"} <span className="mx-3 text-purple-400/50">•</span> {category || "GENERAL"}
          </div>
        </motion.div>
      </div>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <div
        className="
          relative
          z-30
          w-full
          flex-1
          min-h-0
          flex
          items-center
          justify-between
          px-[clamp(28px,6vw,115px)]
          pb-[clamp(30px,6vh,75px)]
          pt-[clamp(20px,3vh,40px)]
        "
      >
        {/* =================================================
            LEFT WINNERS
        ================================================== */}

        <div
          className="
            flex
            flex-col
            justify-center
            w-[58%]
            h-full
            gap-[clamp(24px,4vh,48px)]
          "
        >
          {/* 1ST PLACE */}

          <WinnerNode
            winner={first}
            isFirst={true}
            delay={0.3}
          />

          {/* 2ND PLACE */}

          <WinnerNode
            winner={second}
            delay={0.5}
          />

          {/* 3RD PLACE */}

          <WinnerNode
            winner={third}
            delay={0.7}
          />
        </div>

        {/* =================================================
            RIGHT WINNERS CIRCLE
        ================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            scale: 0.85,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            duration: 0.9,
            delay: 0.5,
          }}
          className="
            relative
            flex
            items-center
            justify-center
            shrink-0
            w-[clamp(300px,31vw,590px)]
            aspect-square
          "
        >
          {/* OUTER RING */}

          <div
            className="
              absolute
              inset-[-8%]
              rounded-full
              border
              border-purple-400/[0.07]
            "
          />

          {/* SECOND RING */}

          <div
            className="
              absolute
              inset-[-5%]
              rounded-full
              border
              border-purple-400/[0.10]
            "
          />

          {/* INNER RING */}

          <div
            className="
              absolute
              inset-[-2.5%]
              rounded-full
              border
              border-purple-400/[0.14]
            "
          />

          {/* PURPLE GLOW */}

          <div
            className="
              absolute
              inset-[-10%]
              rounded-full
              bg-purple-600/15
              blur-[70px]
            "
          />

          {/* MAIN WINNERS CIRCLE */}

          <div
            className="
              absolute
              inset-0
              rounded-full
              flex
              flex-col
              items-center
              justify-center
              text-center
              border
              border-white/20
              shadow-[0_0_80px_rgba(139,44,255,0.4)]
            "
            style={{
              background:
                "radial-gradient(circle at 35% 25%, #9630ff 0%, #7c20df 42%, #6115bd 75%, #4a0d8f 100%)",
            }}
          >
            {/* CONGRATULATIONS */}

            <div
              className="
                text-white
                font-bold
                uppercase
                tracking-[0.4em]
                text-[clamp(9px,0.8vw,15px)]
                mb-3
              "
            >
              CONGRATULATIONS
            </div>

            {/* WINNERS */}

            <div
              className="
                text-white
                font-black
                uppercase
                tracking-wider
                leading-none
                text-[clamp(32px,4.3vw,76px)]
              "
            >
              WINNERS
            </div>

            {/* DECORATIVE LINE */}

            <div
              className="
                flex
                items-center
                justify-center
                gap-3
                mt-5
                opacity-70
              "
            >
              <div
                className="
                  h-px
                  w-[clamp(30px,3vw,55px)]
                  bg-gradient-to-r
                  from-transparent
                  to-white
                "
              />

              <div
                className="
                  w-[6px]
                  h-[6px]
                  rotate-45
                  bg-white
                "
              />

              <div
                className="
                  h-px
                  w-[clamp(30px,3vw,55px)]
                  bg-gradient-to-l
                  from-transparent
                  to-white
                "
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}