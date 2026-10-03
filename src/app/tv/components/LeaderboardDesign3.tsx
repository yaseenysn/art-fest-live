"use client";

import { motion } from "motion/react";
import { LeaderboardConfig } from "@/types";

const getTeamColors = (teamName?: string) => {
  const name = (teamName || "").toUpperCase().trim();

  // MARJAN (مرجان) -> Palette: #DD5327 / #B93040 / #E13E55
  if (name.includes("MARJAN") || name.includes("مرجان")) {
    return {
      gradient: "linear-gradient(180deg, #E13E55 0%, #B93040 50%, #DD5327 100%)",
      border: "1px solid rgba(225, 62, 85, 0.6)",
      topEdgeBg: "#E13E55",
      topEdgeShadow: "0 0 18px rgba(225, 62, 85, 0.7)",
      glowBg: "rgba(221, 83, 39, 0.4)",
      boxShadow: "0 0 25px rgba(225, 62, 85, 0.35), 0 20px 45px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.4)",
    };
  }

  // YAQOOTH (ياقوت) -> Palette: #F15A26 / #C94427 / #F47948
  if (name.includes("YAQOOTH") || name.includes("YAQUT") || name.includes("ياقوت")) {
    return {
      gradient: "linear-gradient(180deg, #F47948 0%, #F15A26 50%, #C94427 100%)",
      border: "1px solid rgba(241, 90, 38, 0.6)",
      topEdgeBg: "#F47948",
      topEdgeShadow: "0 0 18px rgba(241, 90, 38, 0.7)",
      glowBg: "rgba(241, 90, 38, 0.4)",
      boxShadow: "0 0 25px rgba(241, 90, 38, 0.35), 0 20px 45px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.4)",
    };
  }

  // LU’LU (لؤلؤ) -> Palette: #FFF9EA / #E4D6BA / #C5AD86
  if (name.includes("LU") || name.includes("لؤلؤ")) {
    return {
      gradient: "linear-gradient(180deg, #FFF9EA 0%, #E4D6BA 50%, #C5AD86 100%)",
      border: "1px solid rgba(228, 214, 186, 0.7)",
      topEdgeBg: "#FFF9EA",
      topEdgeShadow: "0 0 18px rgba(255, 249, 234, 0.8)",
      glowBg: "rgba(197, 173, 134, 0.45)",
      boxShadow: "0 0 25px rgba(228, 214, 186, 0.4), 0 20px 45px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.6)",
    };
  }

  // JOHAR (جوهر) -> Palette: #1EB299 / #008F79 / #006C5A
  if (name.includes("JOHAR") || name.includes("JAUHAR") || name.includes("جوهر")) {
    return {
      gradient: "linear-gradient(180deg, #1EB299 0%, #008F79 50%, #006C5A 100%)",
      border: "1px solid rgba(30, 178, 153, 0.6)",
      topEdgeBg: "#1EB299",
      topEdgeShadow: "0 0 18px rgba(30, 178, 153, 0.7)",
      glowBg: "rgba(0, 143, 121, 0.4)",
      boxShadow: "0 0 25px rgba(30, 178, 153, 0.35), 0 20px 45px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.4)",
    };
  }

  // Fallback default
  return {
    gradient: "linear-gradient(180deg, rgba(255,255,255,0.48) 0%, rgba(190,190,190,0.28) 30%, rgba(95,95,95,0.18) 70%, rgba(35,35,35,0.35) 100%)",
    border: "1px solid rgba(255,255,255,0.28)",
    topEdgeBg: "rgba(255,255,255,0.4)",
    topEdgeShadow: "0 0 18px rgba(255,255,255,0.20)",
    glowBg: "rgba(255,255,255,0.12)",
    boxShadow: "0 0 25px rgba(255,255,255,0.08), 0 20px 45px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.35)",
  };
};

export default function LeaderboardDesign3({
  config,
}: {
  config: LeaderboardConfig;
}) {
  const isArabic = (text?: string) => /[\u0600-\u06FF]/.test(text || '');
  /*
   * ============================================================
   * DATA
   * ============================================================
   *
   * Overall Team Points only.
   * No day-wise points.
   * No program-wise points.
   * No student-wise points.
   */

  const rows = [...config.rows]
    .sort(
      (a, b) =>
        Number(b.points || 0) -
        Number(a.points || 0)
    )
    .slice(0, 4);

  if (!rows.length) {
    return (
      <div className="w-screen h-screen bg-[#111111] flex items-center justify-center">
        <span className="text-white/40 tracking-[0.2em] uppercase">
          Waiting for results
        </span>
      </div>
    );
  }

  /*
   * Lowest → Highest
   *
   * 4th → 3rd → 2nd → 1st
   */

  const visualRows = [...rows].reverse();

  const maxPoints = Math.max(
    ...rows.map((row) => Number(row.points || 0)),
    1
  );

  const hasPoints = rows.some((row) => Number(row.points || 0) > 0);

  return (
    <div
      className="
        relative
        w-screen
        min-h-screen
        md:h-screen
        overflow-y-auto
        md:overflow-hidden
        bg-[#111111]
        text-white
        font-sans
      "
    >

      {/* ==========================================================
          BACKGROUND
      ========================================================== */}

      <div className="absolute inset-0 bg-[#111111]" />

      {/* Soft center glow */}
      <div
        className="
          absolute
          left-1/2
          top-1/2
          -translate-x-1/2
          -translate-y-1/2
          w-[70vw]
          h-[70vh]
          rounded-full
          blur-[180px]
          opacity-[0.08]
          pointer-events-none
        "
        style={{
          background:
            "radial-gradient(circle, #ffffff 0%, transparent 70%)",
        }}
      />

      {/* Subtle grain */}
      <div
        className="
          absolute
          inset-0
          pointer-events-none
          opacity-[0.035]
        "
        style={{
          backgroundImage:
            "radial-gradient(#ffffff 0.7px, transparent 0.7px)",
          backgroundSize: "6px 6px",
        }}
      />
      {/* ==========================================================
    AL MAHSAN TITLE
========================================================== */}

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7 }}
        className="
    absolute
    left-0
    right-0
    w-full
    flex
    justify-center
    top-[1.5vh]
    md:top-[2.5vh]
    z-30
    pointer-events-none
  "
      >
        <div
          className="
      text-white
      drop-shadow-lg
      text-[46px]
      md:text-[56px]
      lg:text-[68px]
      font-black
      tracking-[0.08em]
      uppercase
      font-ge-ss-two
    "
        >
          <img
            src="/logo-al-mahsan-with-text.png"
            alt="Al Mahsan"
            className="h-14 sm:h-20 md:h-[126px] lg:h-[162px] w-auto object-contain drop-shadow-lg"
          />
        </div>
      </motion.div>

      {/* ==========================================================
          MAIN GRAPH AREA
      ========================================================== */}

      <div
        className="
          absolute
          inset-0
          flex
          items-center
          justify-center
        "
      >

        <div
          className="
            relative
            w-[96vw]
            md:w-[82vw]
            h-[70vh]
            md:h-[78vh]
          "
        >

          {/* ======================================================
              SUBTLE CIRCULAR GUIDE LINES
          ====================================================== */}

          <div
            className="
              absolute
              left-1/2
              top-1/2
              -translate-x-1/2
              -translate-y-1/2
              w-[600px]
              h-[600px]
              max-w-[65vw]
              max-h-[65vh]
              rounded-full
              border
              border-white/[0.055]
              pointer-events-none
            "
          />

          <div
            className="
              absolute
              left-1/2
              top-1/2
              -translate-x-1/2
              -translate-y-1/2
              w-[460px]
              h-[460px]
              max-w-[50vw]
              max-h-[50vh]
              rounded-full
              border
              border-white/[0.045]
              pointer-events-none
            "
          />

          <div
            className="
              absolute
              left-1/2
              top-1/2
              -translate-x-1/2
              -translate-y-1/2
              w-[320px]
              h-[320px]
              max-w-[35vw]
              max-h-[35vh]
              rounded-full
              border
              border-white/[0.035]
              pointer-events-none
            "
          />


          {/* ======================================================
              CURVED GROWTH ARROW
          ====================================================== */}

          {hasPoints && (
            <div
              className="
                absolute
                inset-0
                z-10
                pointer-events-none
              "
            >

              <svg
                className="
                  absolute
                  inset-0
                  w-full
                  h-full
                "
                viewBox="0 0 1000 650"
                preserveAspectRatio="none"
              >

                <defs>

                  {/* Soft arrow glow */}
                  <filter
                    id="finalArrowGlow"
                    x="-50%"
                    y="-50%"
                    width="200%"
                    height="200%"
                  >
                    <feGaussianBlur
                      stdDeviation="4"
                      result="blur"
                    />

                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>

                  </filter>


                  {/* White gradient */}
                  <linearGradient
                    id="finalArrowGradient"
                    x1="0%"
                    y1="100%"
                    x2="100%"
                    y2="0%"
                  >

                    <stop
                      offset="0%"
                      stopColor="#ffffff"
                      stopOpacity="0.28"
                    />

                    <stop
                      offset="55%"
                      stopColor="#ffffff"
                      stopOpacity="0.65"
                    />

                    <stop
                      offset="100%"
                      stopColor="#ffffff"
                      stopOpacity="0.95"
                    />

                  </linearGradient>

                </defs>


                {/* ==================================================
                    SMOOTH RISING CURVE
                ================================================== */}

                <motion.path
                  initial={{
                    pathLength: 0,
                    opacity: 0,
                  }}

                  animate={{
                    pathLength: 1,
                    opacity: 1,
                  }}

                  transition={{
                    duration: 2.4,
                    delay: 0.5,
                    ease: "easeInOut",
                  }}

                  d="
                    M 80 475
                    C 230 455,
                      360 395,
                      475 320
                    C 600 230,
                      720 130,
                      850 45
                  "

                  fill="none"

                  stroke="url(#finalArrowGradient)"

                  strokeWidth="5"

                  strokeLinecap="round"

                  filter="url(#finalArrowGlow)"
                />


                {/* ==================================================
                    CLEAN ARROW HEAD
                ================================================== */}

                <motion.path
                  initial={{
                    opacity: 0,
                    pathLength: 0,
                  }}

                  animate={{
                    opacity: 1,
                    pathLength: 1,
                  }}

                  transition={{
                    duration: 0.45,
                    delay: 2.35,
                    ease: "easeOut",
                  }}

                  d="
                    M 822.2 48.5
                    L 850 45
                    L 835.7 69.0
                  "

                  fill="none"

                  stroke="#ffffff"

                  strokeWidth="5"

                  strokeLinecap="round"

                  strokeLinejoin="round"

                  filter="url(#finalArrowGlow)"
                />

              </svg>

            </div>
          )}


          {/* ======================================================
              BAR CHART
          ====================================================== */}

          <div
            className="
              absolute
              left-[4%]
              right-[4%]
              bottom-[75px]
              top-[100px]

              flex
              items-end
              justify-between

              gap-[10px]
              md:gap-[35px]
              lg:gap-[80px]

              z-20
            "
          >

            {visualRows.map((row, index) => {

              const points =
                Number(row.points || 0);

              const ratio =
                points / maxPoints;

              /*
               * Bar height is based on actual overall points.
               */

              const barHeight =
                80 + ratio * 245;

              const teamColors = getTeamColors(row.name);


              return (
                <motion.div
                  key={row.id}

                  initial={{
                    opacity: 0,
                    scaleY: 0,
                    y: 30,
                  }}

                  animate={{
                    opacity: 1,
                    scaleY: 1,
                    y: 0,
                  }}

                  transition={{
                    duration: 1.15,
                    delay:
                      0.35 + index * 0.18,
                    type: "spring",
                    stiffness: 75,
                    damping: 14,
                  }}

                  className="
                    relative
                    h-full
                    flex
                    items-end
                    justify-center
                    origin-bottom
                  "

                  style={{
                    width:
                      "clamp(70px, 13vw, 185px)",
                  }}
                >

                  {/* =================================================
                      POINTS ABOVE BAR
                  ================================================= */}

                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 15,
                    }}

                    animate={{
                      opacity: 1,
                      y: 0,
                    }}

                    transition={{
                      duration: 0.6,
                      delay:
                        1 + index * 0.18,
                    }}

                    className="
                      absolute
                      z-40
                      flex
                      items-baseline
                      justify-center
                      whitespace-nowrap
                    "

                    style={{
                      bottom:
                        `${barHeight + 18}px`,
                    }}
                  >

                    <span
                      className="
                        text-[32px]
                        md:text-[40px]
                        lg:text-[48px]
                        font-black
                        leading-none
                        tracking-[-0.05em]
                        text-white
                      "
                    >
                      {points}
                    </span>

                    <span
                      className="
                        ml-2
                        text-[10px]
                        md:text-[12px]
                        font-bold
                        text-white/40
                        uppercase
                        tracking-wider
                      "
                    >
                      PTS
                    </span>

                  </motion.div>


                  {/* =================================================
                      BAR
                  ================================================= */}

                  <div
                    className="
                      relative
                      w-full
                      rounded-t-[4px]
                      overflow-visible
                    "

                    style={{
                      height:
                        `${barHeight}px`,

                      background: teamColors.gradient,

                      border: teamColors.border,

                      boxShadow: teamColors.boxShadow,

                      backdropFilter:
                        "blur(8px)",
                    }}
                  >

                    {/* =================================================
                        BAR TOP EDGE
                    ================================================= */}

                    <div
                      className="
                        absolute
                        left-[-1px]
                        right-[-1px]
                        top-[-5px]
                        h-[6px]
                        rounded-t-[4px]
                      "
                      style={{
                        backgroundColor: teamColors.topEdgeBg,
                        boxShadow: teamColors.topEdgeShadow,
                      }}
                    />


                    {/* =================================================
                        MOVING LIGHT
                    ================================================= */}

                    <motion.div
                      initial={{
                        y: "110%",
                        opacity: 0,
                      }}

                      animate={{
                        y: "-110%",
                        opacity: [
                          0,
                          0.15,
                          0,
                        ],
                      }}

                      transition={{
                        duration: 2.8,
                        delay:
                          1.3 + index * 0.2,
                        ease: "easeInOut",
                      }}

                      className="
                        absolute
                        left-[-20%]
                        right-[-20%]
                        h-[35%]

                        bg-gradient-to-b
                        from-transparent
                        via-white/[0.15]
                        to-transparent

                        blur-xl

                        pointer-events-none
                      "
                    />


                    {/* =================================================
                        BAR BOTTOM GLOW
                    ================================================= */}

                    <div
                      className="
                        absolute
                        bottom-[-18px]
                        left-1/2
                        -translate-x-1/2

                        w-[85%]
                        h-[25px]

                        rounded-full

                        blur-[18px]

                        pointer-events-none
                      "
                      style={{
                        backgroundColor: teamColors.glowBg,
                      }}
                    />

                  </div>


                  {/* =================================================
                      TEAM NAME + RANK
                      BELOW BAR
                  ================================================= */}

                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 12,
                    }}

                    animate={{
                      opacity: 1,
                      y: 0,
                    }}

                    transition={{
                      duration: 0.6,
                      delay:
                        1.1 + index * 0.18,
                    }}

                    className="
                      absolute
                      top-full
                      mt-6

                      flex
                      flex-col
                      items-center

                      whitespace-nowrap
                    "
                  >

                    {/* Team name */}

                    <span
                      className={`
                        text-[22px]
                        md:text-[28px]
                        lg:text-[35px]

                        font-extrabold

                        uppercase

                        tracking-[0.02em]

                        text-white
                        drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]
                        ${isArabic(row.name) ? 'font-ge-ss-two' : ''}
                      `}
                    >
                      {row.name}
                    </span>


                    {/* Rank */}

                    <span
                      className="
                        mt-1

                        text-[12px]
                        md:text-[14px]

                        font-bold

                        tracking-[0.18em]

                        uppercase

                        text-white/40
                      "
                    >
                      RANK #{row.rank || index + 1}
                    </span>

                  </motion.div>

                </motion.div>
              );
            })}

          </div>

        </div>

      </div>


      {/* ==========================================================
          BOTTOM SUBTLE LINE
      ========================================================== */}

      <div
        className="
          absolute
          bottom-[28px]
          left-[8%]
          right-[8%]
          h-[1px]
          bg-white/[0.08]
        "
      />

    </div>
  );
}