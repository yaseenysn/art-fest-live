"use client";

import { motion } from "motion/react";
import { IResult } from "@/types";

const isArabic = (text?: string) => /[\u0600-\u06FF]/.test(text || '');

const getPositionTheme = (position: number) => {
  switch (position) {
    case 1:
      return {
        light: "rgba(88, 150, 235, 0.34)",
        beam: "rgba(90, 151, 235, 0.18)",
        text: "#B9D6FF",
      };

    case 2:
      return {
        light: "rgba(75, 130, 215, 0.29)",
        beam: "rgba(75, 130, 215, 0.15)",
        text: "#AFCBEE",
      };

    case 3:
      return {
        light: "rgba(63, 112, 190, 0.25)",
        beam: "rgba(63, 112, 190, 0.13)",
        text: "#A7C2E5",
      };

    default:
      return {
        light: "rgba(88, 150, 235, 0.30)",
        beam: "rgba(88, 150, 235, 0.16)",
        text: "#B9D6FF",
      };
  }
};

const getPositionLabel = (position: number) => {
  if (position === 1) return "1ST PLACE";
  if (position === 2) return "2ND PLACE";
  if (position === 3) return "3RD PLACE";

  return `${position}TH PLACE`;
};

export default function ResultsDesign1({
  results,
  revealStage = 'WINNER'
}: {
  results: IResult[];
  revealStage?: 'PLACE' | 'WINNER';
}) {
  if (!results || results.length === 0) return null;

  const result = results[0];

  const program = result.programId as { name?: string; language?: string; category?: string };
  const programName = program?.name || "PROGRAM";
  const programLanguage = program?.language && program.language.toLowerCase() !== "other" ? program.language : "";
  const category = program?.category || "";

  const position = result.position || 1;
  const studentName = result.studentName || "WINNER";
  const team = result.teamId as any;
  const teamName = team?.name || "";
  const teamColor = team?.color || "#3b82f6";

  const theme = getPositionTheme(position);
  const positionLabel = getPositionLabel(position);

  return (
    <div
      className="relative w-full h-full min-h-0 overflow-hidden bg-black text-white"
      style={{
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* =========================================================
          BACKGROUND
      ========================================================== */}

      <div className="absolute inset-0 pointer-events-none">

        {/* Deep black / navy background */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(
                ellipse 55% 75% at 50% 0%,
                #163762 0%,
                #0C213D 18%,
                #071522 38%,
                #02080F 65%,
                #000000 100%
              )
            `,
          }}
        />

        {/* =====================================================
            LARGE TOP SPOTLIGHT
        ====================================================== */}

        <motion.div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            top: "-42%",
            width: "760px",
            height: "1000px",

            background: `
              radial-gradient(
                ellipse at center,
                rgba(130, 183, 255, 0.42) 0%,
                rgba(95, 153, 230, 0.27) 22%,
                rgba(65, 120, 195, 0.13) 43%,
                transparent 72%
              )
            `,

            filter: "blur(35px)",
          }}
          initial={{
            opacity: 0,
            scale: 0.65,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            duration: 2,
            ease: "easeOut",
          }}
        />

        {/* =====================================================
            VERTICAL LIGHT BEAM
        ====================================================== */}

        <motion.div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            top: "-12%",
            width: "420px",
            height: "125%",

            background: `
              linear-gradient(
                90deg,
                transparent 0%,
                ${theme.beam} 18%,
                rgba(115, 170, 235, 0.15) 38%,
                rgba(160, 205, 255, 0.24) 50%,
                rgba(115, 170, 235, 0.15) 62%,
                ${theme.beam} 82%,
                transparent 100%
              )
            `,

            filter: "blur(38px)",
          }}
          initial={{
            opacity: 0,
            scaleX: 0.35,
          }}
          animate={{
            opacity: 1,
            scaleX: 1,
          }}
          transition={{
            duration: 1.8,
            delay: 0.1,
            ease: "easeOut",
          }}
        />

        {/* =====================================================
            SHARP CENTRAL LIGHT
        ====================================================== */}

        <motion.div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            top: "-8%",
            width: "125px",
            height: "118%",

            background: `
              linear-gradient(
                90deg,
                transparent,
                rgba(175, 215, 255, 0.06),
                rgba(175, 215, 255, 0.16),
                rgba(175, 215, 255, 0.06),
                transparent
              )
            `,

            filter: "blur(15px)",
          }}
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 0.95,
          }}
          transition={{
            duration: 2,
            delay: 0.2,
          }}
        />

        {/* =====================================================
            CENTER FLOOR / STAGE GLOW
        ====================================================== */}

        <motion.div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            top: "61%",
            width: "850px",
            height: "380px",
            borderRadius: "50%",

            background: `
              radial-gradient(
                ellipse,
                ${theme.light} 0%,
                rgba(55, 110, 185, 0.10) 35%,
                transparent 70%
              )
            `,

            filter: "blur(65px)",
          }}
          initial={{
            opacity: 0,
            scale: 0.6,
          }}
          animate={{
            opacity: 0.55,
            scale: 1,
          }}
          transition={{
            duration: 1.8,
            delay: 0.3,
          }}
        />

        {/* =====================================================
            SUBTLE BLUE HAZE
        ====================================================== */}

        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            top: "42%",
            width: "900px",
            height: "450px",

            background:
              "radial-gradient(ellipse, rgba(75,130,215,0.08), transparent 68%)",

            filter: "blur(50px)",
          }}
        />

        {/* =====================================================
            DARK EDGES
        ====================================================== */}

        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(
                ellipse at center,
                transparent 28%,
                rgba(0,0,0,0.12) 50%,
                rgba(0,0,0,0.72) 100%
              )
            `,
          }}
        />

        {/* =====================================================
            BOTTOM BLACK FADE
        ====================================================== */}

        <div
          className="absolute left-0 right-0 bottom-0 h-[32%]"
          style={{
            background:
              "linear-gradient(to bottom, transparent, rgba(0,0,0,0.38) 45%, #000000 100%)",
          }}
        />

        {/* =====================================================
            SUBTLE PARTICLE / GRAIN
        ====================================================== */}

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `
              radial-gradient(
                rgba(255,255,255,0.9) 0.7px,
                transparent 0.7px
              )
            `,
            backgroundSize: "4px 4px",
          }}
        />

        {/* Very subtle vertical texture */}
        <div
          className="absolute inset-0 opacity-[0.018]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, transparent 0px, transparent 4px, rgba(255,255,255,0.25) 5px)",
          }}
        />
      </div>

      {/* =========================================================
          PROGRAM INFO (TOP CENTER)
      ========================================================== */}
      
      <motion.div
        className="absolute top-[8%] left-0 right-0 flex flex-col items-center text-center z-30"
        initial={{ opacity: 0, y: -25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <div
          className="font-black uppercase tracking-[0.35em] text-[2.5rem]"
          style={{
            color: theme.text,
            textShadow: `0 0 25px ${theme.light}`,
          }}
        >
          {programName}
        </div>

        {(programLanguage || category) && (
          <div className="mt-2 text-white/50 font-bold tracking-[0.35em] text-sm uppercase">
            {programLanguage}
            {programLanguage && category ? " • " : ""}
            {category}
          </div>
        )}
      </motion.div>

      {/* =========================================================
          TOP LEFT — AL MAHSAN
      ========================================================== */}

      <motion.div
        className="absolute top-[5%] left-[4%] z-30"
        initial={{
          opacity: 0,
          x: -25,
        }}
        animate={{
          opacity: 1,
          x: 0,
        }}
        transition={{
          duration: 0.8,
        }}
      >
        <div
          className="font-semibold text-white"
          style={{
            fontSize: "clamp(1.25rem, 1.8vw, 2rem)",
            letterSpacing: "0.045em",

            textShadow:
              "0 2px 18px rgba(255,255,255,0.18)",
          }}
        >
          AL MAHSAN
        </div>
      </motion.div>

      {/* =========================================================
          TOP RIGHT — LIVE CONNECTED
      ========================================================== */}

      <motion.div
        className="
          absolute top-[3.5%] right-[4%] z-40
          flex items-center gap-3
          px-5 py-3
          rounded-full
          border border-white/10
          bg-black/35
          backdrop-blur-xl
        "
        initial={{
          opacity: 0,
          x: 25,
        }}
        animate={{
          opacity: 1,
          x: 0,
        }}
        transition={{
          duration: 0.8,
        }}
      >
        <span
          className="w-3 h-3 rounded-full bg-emerald-400"
          style={{
            boxShadow:
              "0 0 15px rgba(52,211,153,0.9)",
          }}
        />

        <div className="flex flex-col leading-none">
          <span
            className="
              text-[11px]
              font-semibold
              tracking-[0.22em]
              text-white/60
            "
          >
            LIVE
          </span>

          <span
            className="
              text-[14px]
              font-black
              tracking-[0.13em]
            "
          >
            CONNECTED
          </span>
        </div>
      </motion.div>

      {/* =========================================================
          MAIN REVEAL
      ========================================================== */}

      <div
        className="
          absolute inset-0 z-20
          flex items-center justify-center
        "
      >
        <motion.div
          className="
            relative
            w-full
            text-center
            px-[5%]
          "
          initial={{
            opacity: 0,
            scale: 0.94,
            y: 30,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}
          transition={{
            duration: 1.2,
            delay: 0.35,
            ease: [0.16, 1, 0.3, 1],
          }}
        >

          {/* =====================================================
              REVEAL LIGHT FLASH
          ====================================================== */}

          <motion.div
            className="
              absolute
              left-1/2
              top-1/2
              -translate-x-1/2
              -translate-y-1/2
              pointer-events-none
            "
            style={{
              width: "70%",
              height: "330px",

              background: `
                radial-gradient(
                  ellipse,
                  rgba(173,211,255,0.24) 0%,
                  rgba(104,164,235,0.12) 28%,
                  transparent 70%
                )
              `,

              filter: "blur(38px)",
            }}
            initial={{
              opacity: 0,
              scale: 0.25,
            }}
            animate={{
              opacity: [0, 1, 0.55],
              scale: [0.25, 1.2, 1],
            }}
            transition={{
              duration: 1.6,
              delay: 0.2,
              ease: "easeOut",
            }}
          />

          {/* =====================================================
              WINNER NAME
          ====================================================== */}

          {revealStage === 'WINNER' && (
            <motion.div
              key="winner-name-3"
              className="
                relative
                font-light
                uppercase
                break-words
              "
              style={{
                fontSize:
                  studentName.length > 24
                    ? "clamp(3rem, 7vw, 7rem)"
                    : studentName.length > 16
                      ? "clamp(3.5rem, 8vw, 8rem)"
                      : "clamp(4.5rem, 10vw, 10rem)",

                lineHeight: 0.92,

                letterSpacing: "-0.045em",

                color: theme.text,

                fontWeight: 300,

                textShadow: `
                  0 0 10px rgba(173,211,255,0.24),
                  0 0 30px rgba(90,145,220,0.22),
                  0 8px 35px rgba(0,0,0,0.80)
                `,
              }}
              initial={{
                opacity: 0,
                y: 45,
                filter: "blur(18px)",
                letterSpacing: "0.08em",
              }}
              animate={{
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                letterSpacing: "-0.045em",
              }}
              transition={{
                duration: 1.4,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {studentName}
            </motion.div>
          )}

          {/* =====================================================
              TEAM NAME
          ====================================================== */}

          {revealStage === 'WINNER' && teamName && (
            <motion.div
              dir={isArabic(teamName) ? 'rtl' : 'ltr'}
              className={`
                mt-6 md:mt-10
                flex
                items-center
                justify-center
                gap-3 md:gap-5
                min-w-0
                max-w-full
                break-words
                leading-[1.2]
              `}
              initial={{
                opacity: 0,
                y: 30,
                filter: "blur(10px)",
              }}
              animate={{
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
              }}
              transition={{
                duration: 1.2,
                delay: 0.3,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <div 
                className="w-4 h-4 md:w-6 md:h-6 rounded-full shrink-0" 
                style={{ 
                  backgroundColor: teamColor, 
                  boxShadow: `0 0 20px ${teamColor}, inset 0 0 10px rgba(255,255,255,0.5)` 
                }} 
              />
              <div
                className={`
                  uppercase
                  text-[clamp(28px,4vw,56px)]
                  text-blue-100
                  ${isArabic(teamName) ? 'font-ge-ss-two font-bold' : 'tracking-[0.25em] font-semibold'}
                `}
                style={{
                  textShadow: `0 0 15px rgba(173,211,255,0.3)`
                }}
              >
                {teamName}
              </div>
            </motion.div>
          )}

          {/* =====================================================
              POSITION
          ====================================================== */}

          <motion.div
            className="relative mt-7 text-center"
            initial={{
              opacity: 0,
              y: 20,
              filter: "blur(10px)",
            }}
            animate={{
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
            }}
            transition={{
              duration: 0.9,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <div
              className="
                font-light
                uppercase
              "
              style={{
                fontSize:
                  "clamp(1.7rem, 3vw, 3.2rem)",

                lineHeight: 1,

                letterSpacing: "0.13em",

                color: theme.text,

                fontWeight: 300,

                textShadow: `
                  0 0 12px rgba(173,211,255,0.20),
                  0 0 28px rgba(90,145,220,0.18)
                `,
              }}
            >
              {positionLabel}
            </div>
          </motion.div>

          {/* =====================================================
              GLOWING LINE UNDER POSITION
          ====================================================== */}

          <motion.div
            className="mx-auto mt-8"
            style={{
              width:
                "clamp(220px, 24vw, 460px)",

              height: "1px",

              background: `
                linear-gradient(
                  90deg,
                  transparent,
                  rgba(147,193,247,0.82),
                  transparent
                )
              `,

              boxShadow:
                "0 0 18px rgba(92,150,230,0.65)",
            }}
            initial={{
              opacity: 0,
              scaleX: 0,
            }}
            animate={{
              opacity: 1,
              scaleX: 1,
            }}
            transition={{
              duration: 1,
              delay: 1.25,
              ease: "easeOut",
            }}
          />

          {/* =====================================================
              SMALL LIGHT POINT
          ====================================================== */}

          <motion.div
            className="
              absolute
              left-1/2
              -translate-x-1/2
              pointer-events-none
            "
            style={{
              bottom: "-35px",
              width: "10px",
              height: "10px",
              borderRadius: "50%",

              background:
                "rgba(190,220,255,0.95)",

              boxShadow: `
                0 0 12px rgba(145,195,255,0.9),
                0 0 30px rgba(80,145,230,0.65)
              `,
            }}
            initial={{
              opacity: 0,
              scale: 0,
            }}
            animate={{
              opacity: [0, 1, 0.7],
              scale: [0, 1.15, 1],
            }}
            transition={{
              duration: 1.2,
              delay: 1.35,
            }}
          />
        </motion.div>
      </div>

      {/* =========================================================
          BOTTOM LEFT — WEBSITE
      ========================================================== */}

      <motion.div
        className="absolute bottom-[4%] left-[4%] z-30"
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          duration: 0.8,
          delay: 1.2,
        }}
      >
        <span
          className="text-white/75 font-light"
          style={{
            fontSize:
              "clamp(0.9rem, 1.2vw, 1.3rem)",
          }}
        >
          al-mahsan.com
        </span>
      </motion.div>
    </div>
  );
}