"use client";

import React from "react";
import { motion } from "motion/react";

interface Judge {
  name: string;
}

interface CustomAnnouncementData {
  template: "NEXT_PROGRAM" | "JUDGES_THANK_YOU";
  programName?: string;
  chessNumber?: string;
  judges?: Judge[];
}

interface Props {
  data: CustomAnnouncementData;
}

export default function CustomAnnouncementOverlay({ data }: Props) {
  /* =========================================================
     NEXT PROGRAM
  ========================================================= */
  if (data.template === "NEXT_PROGRAM") {
    return (
      <div className="absolute inset-0 z-[100] flex h-full w-full flex-col items-center justify-center overflow-hidden bg-[#050505] select-none font-sans">

        {/* TOP ATMOSPHERIC GLOW */}
        <div
          className="pointer-events-none absolute left-[15%] top-[-15%] h-[45%] w-[70%] opacity-70"
          style={{
            background:
              "radial-gradient(ellipse at top, rgba(99,102,241,0.45) 0%, rgba(139,92,246,0.22) 42%, transparent 72%)",
          }}
        />

        {/* SUBTLE NOISE */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.025] mix-blend-screen"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="relative z-10 flex h-full w-full flex-col items-center px-[4vw]"
        >

          {/* =====================================================
              NEXT PROGRAM HEADER
          ===================================================== */}
          <div className="mt-[3vh] flex w-full items-center justify-center">

            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/30 to-white/10" />

            <h2
              className="
                shrink-0
                px-[2.5vw]
                text-center
                text-[clamp(24px,3vw,52px)]
                font-black
                italic
                uppercase
                tracking-[0.18em]
                leading-none
                text-white
              "
            >
              NEXT PROGRAM
            </h2>

            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-white/30 to-white/10" />

          </div>


          {/* =====================================================
              PROGRAM NAME
          ===================================================== */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: 0.2,
              duration: 0.8,
            }}
            className="
              mt-[5vh]
              flex
              w-full
              max-w-[94vw]
              items-center
              justify-center
              overflow-visible
              px-[2vw]
            "
          >
            <h1
              className="
                w-full
                max-w-[94vw]
                overflow-visible
                text-center
                font-black
                italic
                uppercase
                leading-[0.95]
                tracking-[-0.045em]
                text-white
                whitespace-normal
                break-words
              "
              style={{
                fontSize: "clamp(42px, 6.2vw, 100px)",
                overflowWrap: "break-word",
                wordBreak: "normal",
                textRendering: "geometricPrecision",
              }}
            >
              {data.programName || "NEXT PROGRAM"}
            </h1>
          </motion.div>


          {/* =====================================================
              DIVIDER
          ===================================================== */}
          <div className="mt-[4vh] flex w-full items-center">

            <div className="h-px flex-1 bg-white/15" />

            <div className="w-[3vw]" />

            <div className="h-px flex-1 bg-white/15" />

          </div>


          {/* =====================================================
              CHESS NUMBERS HEADING + GRID
          ===================================================== */}
          <div className="mt-[2vh] flex w-full min-h-0 flex-1 flex-col">

            {/* CHESS NUMBERS HEADING */}
            <div className="flex w-full items-center gap-4">

              <div className="h-px flex-1 bg-white/15" />

              <h3
                className="
                  shrink-0
                  px-4
                  text-center
                  text-[clamp(14px,1.3vw,22px)]
                  font-bold
                  uppercase
                  tracking-[0.25em]
                  leading-none
                  text-white/60
                "
              >
                CHESS NUMBERS
              </h3>

              <div className="h-px flex-1 bg-white/15" />

            </div>


            {/* CHESS NUMBER GRID */}
            <ChessNumberGrid
              chessNumber={data.chessNumber || ""}
            />

          </div>


          {/* =====================================================
              BOTTOM LINE
          ===================================================== */}
          <div className="mb-[3vh] mt-[2vh] w-full">

            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          </div>

        </motion.div>
      </div>
    );
  }


  /* =========================================================
     JUDGES THANK YOU
  ========================================================= */
  if (data.template === "JUDGES_THANK_YOU") {
    const judges = data.judges || [];

    let gridCols = "grid-cols-1";

    if (judges.length === 2 || judges.length === 4) {
      gridCols = "grid-cols-2";
    } else if (judges.length === 3 || judges.length >= 5) {
      gridCols = "grid-cols-3";
    }

    return (
      <div className="absolute inset-0 z-[100] flex h-full w-full flex-col items-center justify-center overflow-hidden bg-[#f8f9fa] select-none font-sans">

        {/* SUBTLE BACKGROUND PATTERN */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l15 15-15 15L15 15 30 0zm0 60l15-15-15-15-15 15 30 15z' fill='%23000000' fill-rule='evenodd'/%3E%3C/svg%3E\")",
            backgroundSize: "120px 120px",
          }}
        />


        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.8,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="relative z-10 flex w-full max-w-[92vw] flex-col items-center"
        >

          {/* ARABIC */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.2,
              duration: 1,
            }}
            className="mb-[7vh] w-full text-center"
          >
            <h1
              dir="rtl"
              className="
                w-full
                overflow-visible
                text-center
                font-extrabold
                leading-tight
                tracking-tight
                text-slate-900
              "
              style={{
                fontSize: "clamp(60px, 11vw, 180px)",
              }}
            >
              جَزَاكُمُ اللهُ خَيْرًا
            </h1>
          </motion.div>


          {/* JUDGES */}
          {judges.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.4,
                duration: 0.8,
              }}
              className={`
                grid
                ${gridCols}
                w-full
                max-w-[1400px]
                mx-auto
                gap-x-[6vw]
                gap-y-[6vh]
                px-[2vw]
              `}
            >
              {judges.map((judge, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center justify-center text-center"
                >

                  <div className="mb-5 h-[2px] w-12 bg-slate-300" />

                  <h3
                    className="
                      max-w-full
                      overflow-visible
                      font-bold
                      leading-none
                      tracking-tight
                      text-slate-800
                    "
                    style={{
                      fontSize: "clamp(24px, 3.5vw, 56px)",
                    }}
                  >
                    {judge.name}
                  </h3>

                </div>
              ))}
            </motion.div>
          )}

        </motion.div>
      </div>
    );
  }


  /* =========================================================
     FALLBACK
  ========================================================= */
  return (
    <div className="absolute inset-0 z-[100] bg-black" />
  );
}


/* ============================================================
   CHESS NUMBER GRID

   Input examples:

   245 345 456 567 678 789 890 901

   OR

   245,345,456,567,678,789,890,901

   OR each number on a separate line.

   Output:

   LEFT COLUMN          RIGHT COLUMN

   245                  345
   456                  567
   678                  789
   890                  901
============================================================ */

function ChessNumberGrid({
  chessNumber,
}: {
  chessNumber: string;
}) {
  const numbers = chessNumber
    .split(/[\s,;|]+/)
    .map((item) => item.trim())
    .filter(Boolean);

  const visibleNumbers = numbers.slice(0, 8);

  const leftNumbers = visibleNumbers.filter(
    (_, index) => index % 2 === 0
  );

  const rightNumbers = visibleNumbers.filter(
    (_, index) => index % 2 === 1
  );

  return (
    <div
      className="
        grid
        min-h-0
        flex-1
        w-full
        grid-cols-2
        gap-x-[5vw]
      "
    >

      {/* ======================================================
          LEFT COLUMN
      ====================================================== */}
      <div className="flex min-h-0 flex-col">

        {leftNumbers.map((number, index) => (
          <ChessNumberRow
            key={`left-${index}`}
            number={number}
          />
        ))}

      </div>


      {/* ======================================================
          RIGHT COLUMN
      ====================================================== */}
      <div className="flex min-h-0 flex-col">

        {rightNumbers.map((number, index) => (
          <ChessNumberRow
            key={`right-${index}`}
            number={number}
          />
        ))}

      </div>

    </div>
  );
}


/* ============================================================
   SINGLE CHESS NUMBER ROW
============================================================ */

function ChessNumberRow({
  number,
}: {
  number: string;
}) {
  return (
    <div
      className="
        flex
        min-h-0
        flex-1
        items-center
        justify-center
        overflow-visible
        border-b
        border-white/15
      "
    >

      <motion.div
        initial={{
          opacity: 0,
          scale: 0.92,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        transition={{
          duration: 0.5,
        }}
        className="
          overflow-visible
          text-center
          font-black
          italic
          leading-none
          tracking-[-0.06em]
          text-white
        "
        style={{
          fontSize: "clamp(54px, 7vw, 125px)",
          fontVariantNumeric: "tabular-nums",
          whiteSpace: "nowrap",
          textRendering: "geometricPrecision",
        }}
      >
        {number}
      </motion.div>

    </div>
  );
}