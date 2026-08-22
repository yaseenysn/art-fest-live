"use client";

import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { AllWinnersConfig } from "./AllWinnersRouter";

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
};

const WinnerNode = ({
  winner,
  topClass,
  leftClass,
  delay,
}: {
  winner: PositionWinner;
  topClass: string;
  leftClass: string;
  delay: number;
}) => {
  if (!winner.teamName) return null;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={`
        absolute
        -translate-x-1/2
        -translate-y-1/2
        z-30
        ${leftClass}
        ${topClass}
      `}
    >

      {/* ======================================================
          NAME
          ====================================================== */}

      <div
        className="
          absolute
          bottom-[100%]
          left-1/2
          -translate-x-1/2
          mb-[18px]
          w-[300px] md:w-[500px]
          text-center
          whitespace-nowrap
        "
      >
        <h2
          className="
            font-black uppercase tracking-wider
            text-[#eb5b36]
            drop-shadow-sm
            text-[clamp(24px,4vw,65px)] leading-tight
            truncate max-w-full
          "
        >
          {winner.teamName}
        </h2>
        <p
          className="
            font-medium uppercase tracking-widest
            text-[#8b4513]/70 mt-1
            text-[clamp(14px,2vw,32px)]
            truncate max-w-full
          "
        >
          {winner.programName}
        </p>
      </div>

      {/* ======================================================
          IMAGE NODE
          ====================================================== */}
      <div className="relative flex flex-col items-center justify-center">
        <div
          className="
            w-[clamp(80px,15vw,260px)]
            h-[clamp(80px,15vw,260px)]
            rounded-full
            border-[6px] border-[#eb5b36]
            shadow-xl shadow-orange-900/20
            bg-gradient-to-br from-white to-[#fff8f5]
            flex items-center justify-center
            relative z-10
          "
        >
          <span className="text-[#eb5b36] font-black text-[clamp(40px,8vw,140px)] leading-none">
            {winner.position}
          </span>
        </div>

        {/* Outer glow ring */}
        <div
          className="
            absolute
            inset-[-15%]
            rounded-full
            border-[2px] border-[#eb5b36]/30
            animate-pulse
            pointer-events-none
          "
        />
      </div>
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



  /* ============================================================
     WINNER DATA
     Multiple winners stay in the SAME position.
     ============================================================ */

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

    return {
      position,
      names: names || "—",
      teamName: winners[0]?.teamName || winners[0]?.team,
      programName: programName,
    };
  };

  const first = getPositionWinner(1);
  const second = getPositionWinner(2);
  const third = getPositionWinner(3);



  return (

    /* ==========================================================
       FULL SCREEN VIEWPORT
       ========================================================== */

    <div
      id={id}
      className="
        fixed
        inset-0
        overflow-hidden
        bg-[#090211]
        select-none
      "
    >

      {/* ========================================================
          RESPONSIVE ARTWORK
          ======================================================== */}

      <div
        className="
          absolute
          inset-0
          w-full
          h-full
        "
      >

        {/* ======================================================
            BACKGROUND
            ====================================================== */}

        <div className="absolute inset-0 overflow-hidden">

          {/* Right Purple Glow */}

          <div
            className="
              absolute
              right-[-250px]
              top-[80px]
              w-[850px]
              h-[850px]
              rounded-full
              bg-purple-700/15
              blur-[150px]
            "
          />

          {/* Left Glow */}

          <div
            className="
              absolute
              left-[-300px]
              top-[100px]
              w-[750px]
              h-[750px]
              rounded-full
              bg-purple-900/10
              blur-[130px]
            "
          />

          {/* Background Rings */}

          <div
            className="
              absolute
              left-[-260px]
              top-[140px]
              w-[850px]
              h-[850px]
              rounded-full
              border
              border-white/[0.05]
            "
          />

          <div
            className="
              absolute
              left-[-180px]
              top-[220px]
              w-[700px]
              h-[700px]
              rounded-full
              border
              border-white/[0.04]
            "
          />

          {/* Dot Texture */}

          <div
            className="
              absolute
              inset-0
              opacity-[0.045]
            "
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.6) 0.8px, transparent 0.8px)",
              backgroundSize: "7px 7px",
            }}
          />

        </div>


        {/* ======================================================
            EVENT NAME
            ====================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            x: -25,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            duration: 0.7,
          }}
          className="
            absolute
            left-[80px]
            top-[55px]
            z-40
          "
        >

          <div
            className="
              text-white/75
              font-bold
              uppercase
              tracking-[0.35em]
              text-[22px]
            "
          >
            {eventName} {eventYear}
          </div>

          <div
            className="
              mt-3
              text-[#a78bfa]
              font-bold
              uppercase
              tracking-[0.3em]
              text-[14px]
            "
          >
            CONGRAGULATION WINNERS
          </div>

        </motion.div>


        {/* ======================================================
            LIVE CONNECTED
            ====================================================== */}

        <div
          className="
            absolute
            right-[55px]
            top-[35px]
            z-50
            flex
            items-center
            gap-3
            px-5
            py-2.5
            rounded-full
            border
            border-white/15
            bg-black/40
            backdrop-blur-xl
          "
        >

          <span
            className="
              w-[10px]
              h-[10px]
              rounded-full
              bg-[#10b981]
              shadow-[0_0_12px_rgba(16,185,129,0.9)]
            "
          />

          <div className="leading-none mt-[2px]">

            <div
              className="
                text-white/60
                text-[9px]
                font-bold
                tracking-[0.2em]
                mb-[3px]
              "
            >
              LIVE
            </div>

            <div
              className="
                text-white
                text-[13px]
                font-bold
                tracking-[0.15em]
              "
            >
              CONNECTED
            </div>

          </div>

        </div>


        {/* ======================================================
            PROGRAM TITLE
            ====================================================== */}

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
            delay: 0.15,
          }}
          className="
            absolute
            top-[40px] md:top-[65px]
            left-[50%]
            -translate-x-1/2
            z-40
            w-[90%] md:w-[650px]
            text-center
          "
        >

          <h1
            className="
              text-white
              font-black
              uppercase
              tracking-tight
              text-[clamp(32px,5vw,72px)]
              leading-none
              truncate w-full block
            "
          >
            {programName}
          </h1>

          <div
            className="
              mt-4
              text-white/50
              font-bold
              uppercase
              tracking-[0.35em]
              text-[10px] md:text-[15px]
            "
          >
            {language || "OTHER"}

            <span className="mx-3 text-purple-400/40">
              •
            </span>

            {category || "GENERAL"}
          </div>

        </motion.div>


        {/* ======================================================
            CONNECTION LINES
            ====================================================== */}

        <svg
          className="
            absolute
            inset-0
            w-full
            h-full
            z-10
            pointer-events-none
          "
          viewBox="0 0 1920 1080"
          preserveAspectRatio="none"
        >

          <defs>

            <filter
              id="softGlow"
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feGaussianBlur
                stdDeviation="5"
                result="blur"
              />

              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>

            </filter>

            <linearGradient
              id="lineGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >

              <stop
                offset="0%"
                stopColor="#c084fc"
                stopOpacity="0.6"
              />

              <stop
                offset="50%"
                stopColor="#e9d5ff"
                stopOpacity="1"
              />

              <stop
                offset="100%"
                stopColor="#c084fc"
                stopOpacity="0.6"
              />

            </linearGradient>

          </defs>


          {/* ====================================================
              1ST LINE
              NODE CENTER = Y 259
              ==================================================== */}

          <motion.path
            d="
              M 495 259
              C 760 259,
                980 540,
                1310 540
            "
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="3"
            filter="url(#softGlow)"
            initial={{
              pathLength: 0,
            }}
            animate={{
              pathLength: 1,
            }}
            transition={{
              duration: 1.2,
              delay: 0.4,
            }}
          />


          {/* ====================================================
              2ND LINE
              NODE CENTER = Y 540
              ==================================================== */}

          <motion.path
            d="
              M 495 540
              C 800 540,
                1050 540,
                1310 540.01
            "
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="3"
            filter="url(#softGlow)"
            initial={{
              pathLength: 0,
            }}
            animate={{
              pathLength: 1,
            }}
            transition={{
              duration: 1.2,
              delay: 0.55,
            }}
          />


          {/* ====================================================
              3RD LINE
              NODE CENTER = Y 821
              ==================================================== */}

          <motion.path
            d="
              M 495 821
              C 760 821,
                980 540,
                1310 540
            "
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="3"
            filter="url(#softGlow)"
            initial={{
              pathLength: 0,
            }}
            animate={{
              pathLength: 1,
            }}
            transition={{
              duration: 1.2,
              delay: 0.7,
            }}
          />


          {/* ====================================================
              CONVERGENCE DOT
              ==================================================== */}

          <motion.circle
            cx="1310"
            cy="540"
            r="4.5"
            fill="#ffffff"
            filter="url(#softGlow)"
            initial={{
              opacity: 0,
              scale: 0,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              duration: 0.5,
              delay: 1.4,
            }}
          />

        </svg>


        {/* ======================================================
            THREE WINNER NODES

            MORE VERTICAL DISTANCE:
            1 = 24%
            2 = 50%
            3 = 76%
            ====================================================== */}

        <WinnerNode
          winner={first}
          topClass="top-[20%] md:top-[24%]"
          leftClass="left-[30%] md:left-[22%]"
          delay={0.3}
        />

        <WinnerNode
          winner={second}
          topClass="top-[50%] md:top-[50%]"
          leftClass="left-[30%] md:left-[22%]"
          delay={0.5}
        />

        <WinnerNode
          winner={third}
          topClass="top-[80%] md:top-[76%]"
          leftClass="left-[30%] md:left-[22%]"
          delay={0.7}
        />


        {/* ======================================================
            RIGHT CONGRATULATIONS CIRCLE
            UNCHANGED
            ====================================================== */}

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
            absolute
            right-[-100px] md:right-[150px]
            top-[50%]
            -translate-y-1/2
            z-30
            w-[300px] md:w-[460px]
            h-[300px] md:h-[460px]
          "
        >

          {/* Outer Rings */}

          <div
            className="
              absolute
              inset-[-70px]
              rounded-full
              border
              border-purple-400/[0.07]
            "
          />

          <div
            className="
              absolute
              inset-[-45px]
              rounded-full
              border
              border-purple-400/[0.10]
            "
          />

          <div
            className="
              absolute
              inset-[-22px]
              rounded-full
              border
              border-purple-400/[0.15]
            "
          />

          {/* Glow */}

          <div
            className="
              absolute
              inset-[-60px]
              rounded-full
              bg-purple-600/15
              blur-[70px]
            "
          />

          {/* Main Circle */}

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
              border-[1.5px]
              border-white/20
              shadow-[0_0_80px_rgba(139,44,255,0.4)]
            "
            style={{
              background:
                "radial-gradient(circle at 35% 25%, #9630ff 0%, #7c20df 42%, #6115bd 75%, #4a0d8f 100%)",
            }}
          >

            <div
              className="
                text-white
                font-bold
                uppercase
                tracking-[0.4em]
                text-[10px] md:text-[14px]
                mb-3
              "
            >
              CONGRATULATIONS
            </div>

            <div
              className="
                text-white
                font-black
                uppercase
                tracking-wider
                text-[clamp(28px,6vw,65px)]
                leading-none
              "
            >
              WINNERS
            </div>

            {/* Ornament */}

            <div
              className="
                flex
                items-center
                justify-center
                gap-3
                mt-4
                opacity-70
              "
            >

              <div
                className="
                  h-[1px]
                  w-[50px]
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
                  h-[1px]
                  w-[50px]
                  bg-gradient-to-l
                  from-transparent
                  to-white
                "
              />

            </div>

          </div>

        </motion.div>


        {/* ======================================================
            BOTTOM LINE
            ====================================================== */}

        <div
          className="
            absolute
            left-[80px]
            right-[80px]
            bottom-[35px]
            h-[1px]
            bg-white/[0.07]
          "
        />

      </div>

    </div>
  );
}