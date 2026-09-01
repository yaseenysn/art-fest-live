"use client";

import { motion } from "motion/react";
import { LeaderboardConfig } from "@/types";

const BackgroundTexture = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">

    {/* Subtle dotted texture */}
    <div
      className="absolute inset-0 opacity-[0.035]"
      style={{
        backgroundImage: `
          radial-gradient(circle at 20% 20%, white 0.7px, transparent 0.8px),
          radial-gradient(circle at 80% 70%, white 0.6px, transparent 0.8px)
        `,
        backgroundSize: "7px 7px, 11px 11px",
      }}
    />

    {/* Purple ambient glow */}
    <div
      className="
        absolute
        -top-[25%]
        left-[10%]
        w-[55vw]
        h-[55vh]
        rounded-full
        blur-[160px]
        opacity-[0.08]
      "
      style={{
        background: "#7024A8",
      }}
    />

    {/* Blue ambient glow */}
    <div
      className="
        absolute
        top-[35%]
        right-[-15%]
        w-[40vw]
        h-[70vh]
        rounded-full
        blur-[180px]
        opacity-[0.06]
      "
      style={{
        background: "#315EFF",
      }}
    />

  </div>
);

export default function LeaderboardDesign2({
  config,
}: {
  config: LeaderboardConfig;
}) {
  const isArabic = (text?: string) => /[\u0600-\u06FF]/.test(text || '');

  /*
   * IMPORTANT
   * ------------------------------------------
   * Only OVERALL TEAM POINTS are used.
   * No day-wise points.
   * No program-wise points.
   * No student-wise points.
   *
   * This component changes PRESENTATION only.
   */

  const rows = [...config.rows]
    .sort(
      (a, b) =>
        Number(b.points || 0) - Number(a.points || 0)
    )
    .slice(0, 4);

  if (!rows.length) {
    return (
      <div className="w-screen h-screen bg-[#08090c] flex items-center justify-center">
        <span className="text-white/40 text-xl">
          WAITING FOR RESULTS
        </span>
      </div>
    );
  }

  /*
   * Find highest overall team points.
   *
   * The colored line length is calculated
   * from this value.
   *
   * Example:
   *
   * BLUE   158 → 100%
   * GREEN  152 → 96%
   * RED     52 → 33%
   * YELLOW  38 → 24%
   */

  const maxPoints = Math.max(
    ...rows.map((row) => Number(row.points || 0)),
    1
  );

  return (
    <div
      className="
        w-screen
        h-screen
        relative
        overflow-hidden
        bg-[#0b0c0f]
        text-white
        font-sans
      "
    >

      <BackgroundTexture />

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div
        className="
          absolute
          inset-4
          md:inset-8
          lg:left-[52px]
          lg:right-[52px]
          lg:top-[35px]
          lg:bottom-[28px]

          flex
          flex-col

          z-10
        "
      >

        {/* ===================================================
            MAIN TITLE
            ONLY AL MAHSAN
        =================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 25,
            filter: "blur(8px)",
          }}
          animate={{
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
          }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
          }}
          className="
            shrink-0
            flex
            w-full
            justify-center
            items-center
            mt-[15px]
          "
        >

          <div className="flex items-center space-x-6">
            <img 
              src="/logo-al-mahsan.png" 
              alt="Al Mahsan" 
              className="h-20 md:h-28 lg:h-36 w-auto object-contain drop-shadow-lg"
            />
          </div>

        </motion.div>


        {/* ===================================================
            SIMPLE DIVIDER
        =================================================== */}

        <div
          className="
            mt-[24px]
            w-full
            h-[1px]
            bg-white/[0.18]
            shrink-0
          "
        />


        {/* ===================================================
            LEADERBOARD
        =================================================== */}

        <div
          className="
            flex-1
            mt-[4px]

            flex
            flex-col
            justify-center

            w-full

            min-h-0
          "
        >

          {rows.map((row, index) => {

            const points = Number(row.points || 0);

            const color =
              row.color || "#315EFF";


            /*
             * ==================================================
             * POINT BASED LINE WIDTH
             * ==================================================
             *
             * Highest score = 100%
             *
             * Other teams:
             *
             * width = points / maxPoints
             *
             * So line represents actual score proportion.
             */

            const pointRatio =
              Math.max(
                0,
                Math.min(
                  points / maxPoints,
                  1
                )
              );


            /*
             * Base line width.
             *
             * 158 points → ~190px
             * 152 points → ~183px
             * 52 points  → ~63px
             * 38 points  → ~46px
             *
             * Minimum keeps very low scores visible.
             */

            const lineWidth =
              Math.max(
                48,
                Math.round(190 * pointRatio)
              );


            return (
              <motion.div
                key={row.id}

                initial={{
                  opacity: 0,
                  x: -50,
                }}

                animate={{
                  opacity: 1,
                  x: 0,
                }}

                transition={{
                  duration: 0.7,
                  delay: 0.15 + index * 0.12,
                  ease: "easeOut",
                }}

                className="
                  relative

                  py-[13px]
                  md:py-[16px]
                  lg:py-[18px]

                  border-t
                  border-white/[0.18]

                  last:border-b

                  shrink-0
                "
              >

                {/* =================================================
                    ROW CONTENT
                ================================================= */}

                <div
                  className="
                    flex
                    items-center
                    justify-between
                    w-full
                  "
                >

                  {/* =================================================
                      LEFT SIDE
                  ================================================= */}

                  <div
                    className="
                      flex
                      items-center
                      min-w-0
                    "
                  >

                    {/* RANK */}
                    <div
                      className="
                        w-[48px]
                        md:w-[62px]
                        lg:w-[76px]

                        shrink-0
                      "
                    >

                      <span
                        className="
                          text-white/30

                          text-[14px]
                          md:text-[17px]
                          lg:text-[20px]

                          font-bold

                          tracking-widest
                        "
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>

                    </div>


                    {/* TEAM INFORMATION */}
                    <div className="min-w-0">

                      {/* TEAM NAME */}

                      <motion.h2
                        initial={{
                          opacity: 0,
                          x: -15,
                        }}

                        animate={{
                          opacity: 1,
                          x: 0,
                        }}

                        transition={{
                          duration: 0.5,
                          delay: 0.35 + index * 0.12,
                        }}

                        className={`
                          font-black
                          uppercase
                          leading-none
                          tracking-[-0.035em]
                          text-white
                          truncate
                          text-[clamp(24px,4vw,52px)]
                          ${isArabic(row.name) ? 'font-ge-ss-two' : ''}
                        `}
                      >
                        {row.name}
                      </motion.h2>


                      {/* TEAM COLOR */}

                      <motion.div
                        initial={{
                          opacity: 0,
                        }}

                        animate={{
                          opacity: 1,
                        }}

                        transition={{
                          duration: 0.5,
                          delay: 0.55 + index * 0.12,
                        }}

                        className="
                          flex
                          items-center
                          gap-2
                          mt-[5px]
                        "
                      >

                        <span
                          className="
                            w-2.5
                            h-2.5
                            rounded-full
                            shrink-0
                          "
                          style={{
                            backgroundColor: color,

                            boxShadow: `
                              0 0 12px ${color},
                              0 0 22px ${color}70
                            `,
                          }}
                        />

                        <span
                          className="
                            text-white/35

                            text-[8px]
                            md:text-[10px]
                            lg:text-[11px]

                            font-semibold

                            uppercase

                            tracking-[0.16em]
                          "
                        >
                          TEAM
                        </span>

                      </motion.div>

                    </div>

                  </div>


                  {/* =================================================
                      POINTS
                  ================================================= */}

                  <div
                    className="
                      flex
                      items-baseline

                      shrink-0

                      ml-4
                    "
                  >

                    <motion.span
                      initial={{
                        opacity: 0,
                        y: 15,
                      }}

                      animate={{
                        opacity: 1,
                        y: 0,
                      }}

                      transition={{
                        duration: 0.5,
                        delay: 0.4 + index * 0.12,
                      }}

                      className="
                        font-black

                        tracking-[-0.05em]

                        text-white

                        text-[38px]
                        md:text-[50px]
                        lg:text-[62px]

                        leading-none
                      "
                    >
                      {points}
                    </motion.span>


                    <span
                      className="
                        ml-2
                        md:ml-3

                        text-white/35

                        text-[8px]
                        md:text-[10px]
                        lg:text-[12px]

                        font-bold

                        uppercase

                        tracking-wider
                      "
                    >
                      PTS
                    </span>

                  </div>

                </div>


                {/* =================================================
                    POINT-BASED COLORED LINE
                =================================================
                
                IMPORTANT:

                The line DOES NOT depend on rank.

                It depends ONLY on points.

                Highest points → longest line.
                Lower points → shorter line.
                ================================================= */}

                <motion.div
                  initial={{
                    width: 0,
                    opacity: 0,
                  }}

                  animate={{
                    width: `${lineWidth}px`,
                    opacity: 0.9,
                  }}

                  transition={{
                    duration: 1,
                    delay: 0.65 + index * 0.12,
                    ease: "easeOut",
                  }}

                  className="
                    absolute

                    bottom-0
                    left-0

                    h-[2px]
                    md:h-[3px]

                    rounded-full

                    origin-left
                  "

                  style={{
                    backgroundColor: color,

                    boxShadow: `
                      0 0 8px ${color},
                      0 0 18px ${color}80,
                      0 0 30px ${color}40
                    `,
                  }}
                />

              </motion.div>
            );
          })}

        </div>

      </div>


      {/* =====================================================
          EDGE VIGNETTE
      ===================================================== */}

      <div
        className="
          absolute
          inset-0

          pointer-events-none

          z-20

          shadow-[inset_0_0_180px_rgba(0,0,0,0.65)]
        "
      />

    </div>
  );
}