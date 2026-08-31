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
      <div className="absolute inset-0 z-[100] flex h-full w-full flex-col overflow-hidden bg-[#FAFAFA] select-none font-sans text-neutral-900">

        {/* OVERSIZED ARABIC WATERMARK */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.025] overflow-hidden mix-blend-multiply">
          <div
            dir="rtl"
            className="font-extrabold whitespace-nowrap -rotate-[12deg] scale-125 select-none"
            style={{
              fontSize: "clamp(200px, 35vw, 500px)",
              fontFamily: "'Amiri', 'Noto Naskh Arabic', 'Traditional Arabic', serif",
            }}
          >
            جَزَاكُمُ اللهُ خَيْرًا
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="relative z-10 flex flex-1 w-full flex-col items-center justify-center pt-[8vh]">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 1,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="flex w-full flex-col items-center"
          >
            {/* ARABIC CALLIGRAPHY */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.2,
                duration: 1,
              }}
              className="mb-[6vh] w-full text-center px-[4vw]"
            >
              <h1
                dir="rtl"
                className="text-[#1a1a1a] tracking-normal leading-tight font-bold"
                style={{
                  fontSize: "clamp(70px, 13vw, 220px)",
                  fontFamily: "'Amiri', 'Noto Naskh Arabic', 'Traditional Arabic', 'Dubai', serif",
                }}
              >
                جَزَاكُمُ اللهُ خَيْرًا
              </h1>
            </motion.div>

            {/* JUDGES LIST */}
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
                  gap-x-[4vw]
                  gap-y-[5vh]
                  px-[4vw]
                `}
              >
                {judges.map((judge, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center justify-center text-center"
                  >
                    <h3
                      className="max-w-full overflow-visible font-medium tracking-wide text-neutral-800"
                      style={{
                        fontSize: "clamp(80px, 5vw, 180px)",
                      }}

                    >
                      {judge.name}
                    </h3>
                    <div className="mt-[1.5vh] h-[2px] w-[3vw] min-w-[30px] max-w-[60px] bg-neutral-300 rounded-full" />
                  </div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* SUBTLE FOOTER */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            delay: 0.6,
            duration: 1,
          }}
          className="relative z-10 w-full flex items-end justify-center pb-[4vh] opacity-40"
        >

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

function getGridDimensions(total: number) {
  if (total === 0) return { cols: 1, rows: 1 };
  if (total <= 4) return { cols: 1, rows: total };
  if (total <= 8) return { cols: 2, rows: Math.ceil(total / 2) };
  if (total <= 10) return { cols: 2, rows: Math.ceil(total / 2) };
  if (total <= 12) return { cols: 3, rows: Math.ceil(total / 3) };
  if (total <= 15) return { cols: 3, rows: Math.ceil(total / 3) };
  if (total <= 16) return { cols: 4, rows: Math.ceil(total / 4) };
  if (total <= 20) return { cols: 4, rows: Math.ceil(total / 4) };
  
  const cols = Math.ceil(total / 5);
  return { cols, rows: Math.ceil(total / cols) };
}

function ChessNumberGrid({
  chessNumber,
}: {
  chessNumber: string;
}) {
  const numbers = chessNumber
    .split(/[\s,;|]+/)
    .map((item) => item.trim())
    .filter(Boolean);

  const total = numbers.length;
  const { cols, rows } = getGridDimensions(total);

  const columnsData = Array.from({ length: cols }, (_, colIndex) => {
    return numbers.slice(colIndex * rows, (colIndex + 1) * rows);
  });

  const maxVal = Math.max(cols, rows);
  let minSize = 20, vwSize = 2, maxSize = 40;

  if (maxVal <= 2) {
    minSize = 60; vwSize = 8; maxSize = 130;
  } else if (maxVal <= 3) {
    minSize = 50; vwSize = 6; maxSize = 100;
  } else if (maxVal <= 4) {
    minSize = 40; vwSize = 4.5; maxSize = 80;
  } else if (maxVal <= 5) {
    minSize = 30; vwSize = 3.5; maxSize = 60;
  } else {
    minSize = 20; vwSize = 2.5; maxSize = 45;
  }

  const fontSizeClamp = `clamp(${minSize}px, ${vwSize}vw, ${maxSize}px)`;

  return (
    <div
      className="
        grid
        min-h-0
        flex-1
        w-full
        gap-x-[5vw]
      "
      style={{
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`
      }}
    >
      {columnsData.map((colNumbers, colIdx) => (
        <div key={`col-${colIdx}`} className="flex min-h-0 flex-col">
          {colNumbers.map((number, idx) => (
            <ChessNumberRow
              key={`row-${colIdx}-${idx}`}
              number={number}
              fontSizeClamp={fontSizeClamp}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   SINGLE CHESS NUMBER ROW
============================================================ */

function ChessNumberRow({
  number,
  fontSizeClamp,
}: {
  number: string;
  fontSizeClamp: string;
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
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
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
          fontSize: fontSizeClamp,
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