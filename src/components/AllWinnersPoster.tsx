"use client";

import React from "react";

export interface WinnerData {
  studentName: string;
  teamName: string;
  teamColor: string;
  points?: number;
}

export interface AllWinnersPosterProps {
  programName: string;
  language?: string;
  category?: string;
  eventName?: string;
  eventYear?: string;

  winnersByPosition: {
    1: WinnerData[];
    2: WinnerData[];
    3: WinnerData[];
    4?: WinnerData[];
  };

  id?: string;
}

export default function AllWinnersPoster({
  programName,
  language,
  category,
  eventName = "AL MAHSAN",
  eventYear,
  winnersByPosition,
  id = "all-winners-poster-node",
}: AllWinnersPosterProps) {
  const isArabic = (text?: string) => /[\u0600-\u06FF]/.test(text || '');
  const positions = [1, 2, 3] as const;

  const getPositionStyles = (pos: number, tColor: string) => {
    if (pos === 1) {
      return {
        background: "rgba(50, 80, 255, 0.15)",
        backdropFilter: "blur(24px)",
        border: "1.5px solid rgba(255,255,255,0.25)",
        boxShadow: `
          0 18px 30px -12px rgba(0,0,0,0.55),
          inset 0 2px 10px rgba(255,255,255,0.15),
          0 0 32px ${tColor}35
        `,
      };
    }

    if (pos === 2) {
      return {
        background: "rgba(50, 80, 255, 0.10)",
        backdropFilter: "blur(18px)",
        border: "1.5px solid rgba(255,255,255,0.15)",
        boxShadow: `
          0 14px 24px -10px rgba(0,0,0,0.45),
          inset 0 2px 10px rgba(255,255,255,0.10),
          0 0 20px ${tColor}18
        `,
      };
    }

    return {
      background: "rgba(50, 80, 255, 0.06)",
      backdropFilter: "blur(14px)",
      border: "1.5px solid rgba(255,255,255,0.10)",
      boxShadow: `
        0 12px 20px -9px rgba(0,0,0,0.35),
        inset 0 2px 10px rgba(255,255,255,0.05),
        0 0 12px ${tColor}0d
      `,
    };
  };

  const getPositionLabel = (pos: number) => {
    if (pos === 1) return "1st";
    if (pos === 2) return "2nd";
    return "3rd";
  };

  return (
    <div
      id={id}
      className="relative w-screen h-screen overflow-hidden bg-[#020617] font-sans select-none"
      style={{
        width: "100vw",
        height: "100vh",
        minWidth: 0,
        minHeight: 0,
        maxWidth: "100vw",
        maxHeight: "100vh",
      }}
    >
      {/* =========================================================
          BACKGROUND
      ========================================================= */}

      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Blue glow */}
        <div
          className="
            absolute
            -top-[20vh]
            -left-[10vw]
            w-[60vw]
            h-[70vh]
            rounded-full
            bg-blue-600/35
            blur-[clamp(70px,7vw,140px)]
          "
        />

        {/* Violet glow */}
        <div
          className="
            absolute
            top-[10vh]
            right-[8vw]
            w-[50vw]
            h-[60vh]
            rounded-full
            bg-violet-600/25
            blur-[clamp(60px,6vw,120px)]
          "
        />

        {/* Bottom glow */}
        <div
          className="
            absolute
            bottom-[-10vh]
            left-[20vw]
            w-[40vw]
            h-[50vh]
            rounded-full
            bg-indigo-500/15
            blur-[clamp(50px,5vw,100px)]
          "
        />

        {/* Noise */}
        <div
          className="absolute inset-0 opacity-[0.045] mix-blend-overlay"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")',
          }}
        />
      </div>

      {/* =========================================================
          MAIN SAFE AREA
      ========================================================= */}

      <div
        className="
          relative
          z-10
          w-full
          h-full
          flex
          flex-col
          overflow-hidden
        "
        style={{
          padding:
            "clamp(22px, 3.2vh, 42px) clamp(28px, 4.2vw, 82px)",
          boxSizing: "border-box",
        }}
      >
        {/* =======================================================
            HEADER
        ======================================================= */}

        <header
          className="
            relative
            z-20
            w-full
            shrink-0
            flex
            items-start
            justify-between
          "
          style={{
            minHeight: "clamp(105px, 16vh, 170px)",
          }}
        >
          {/* LEFT BRANDING */}

          <div className="flex flex-col min-w-0">
            <p
              className="
                text-white/70
                font-bold
                uppercase
                leading-none
              "
              style={{
                fontSize: "clamp(13px, 0.95vw, 19px)",
                letterSpacing: "clamp(0.12em, 0.25vw, 0.25em)",
              }}
            >
              {eventName} {eventYear}
            </p>

            <h2
              className="
                text-white
                font-black
                uppercase
                leading-none
                truncate
              "
              style={{
                marginTop: "clamp(12px, 1.4vh, 20px)",
                fontSize: "clamp(27px, 2.2vw, 43px)",
                letterSpacing: "clamp(0.08em, 0.16vw, 0.16em)",
                maxWidth: "55vw",
              }}
            >
              {programName}
            </h2>

            <p
              className="
                text-white/60
                font-bold
                uppercase
                leading-none
              "
              style={{
                marginTop: "clamp(9px, 1vh, 14px)",
                fontSize: "clamp(12px, 0.9vw, 18px)",
                letterSpacing: "clamp(0.10em, 0.20vw, 0.20em)",
              }}
            >
              {language || "OTHER"} • {category || "GENERAL"}
            </p>
          </div>

          {/* CENTER TEXT */}

          <div className="absolute left-1/2 -translate-x-1/2 pt-2 pointer-events-none">
            <h1
              className="text-white font-black uppercase text-center"
              style={{
                fontSize: "clamp(24px, 2.5vw, 40px)",
                letterSpacing: "0.2em",
                textShadow: "0 4px 20px rgba(255,255,255,0.3)"
              }}
            >
              CONGRAGULATION WINNERS
            </h1>
          </div>
        </header>

        {/* =======================================================
            DECORATIVE RIGHT TYPOGRAPHY
        ======================================================= */}

        <div className="absolute right-[2vw] top-0 bottom-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
          <span
            className="
              text-white/[0.025]
              font-light
              uppercase
              whitespace-nowrap
              select-none
            "
            style={{
              fontSize: "clamp(100px, 13vw, 250px)",
              letterSpacing: "0.2em",
              transform: "rotate(90deg)",
            }}
          >
            RESULTS
          </span>
        </div>

        {/* =======================================================
            WINNERS AREA
        ======================================================= */}

        <main
          className="
            relative
            z-10
            flex-1
            min-h-0
            w-full
            flex
            flex-col
            justify-center
            overflow-hidden
          "
        >
          <div
            className="
              w-full
              max-w-[1600px]
              mx-auto
              flex
              flex-col
              justify-center
              min-h-0
            "
            style={{
              gap: "clamp(14px, 2.2vh, 30px)",
            }}
          >
            {positions.map((posNum) => {
              const winners =
                winnersByPosition[posNum] || [];

              if (winners.length === 0) return null;

              const tColor =
                winners[0]?.teamColor || "#3b82f6";

              const styles = getPositionStyles(
                posNum,
                tColor
              );

              /*
               * ONE POSITION = ONE CAPSULE
               *
               * Multiple winners are combined inside
               * the same capsule.
               */

              const names = winners
                .map((winner) => winner.studentName)
                .filter(Boolean)
                .join("  •  ");

              const teams = Array.from(
                new Set(
                  winners
                    .map((winner) => winner.teamName)
                    .filter(Boolean)
                )
              );

              const teamStr =
                teams.length > 0
                  ? teams.join("  •  ")
                  : "TEAM";

              const points = winners
                .map((winner) => winner.points)
                .filter(
                  (point): point is number =>
                    point !== undefined
                );

              const pointsStr =
                points.length > 0
                  ? points.join(" • ")
                  : undefined;

              return (
                <section
                  key={posNum}
                  className="w-full flex flex-col min-h-0"
                >
                  {/* =================================================
                      POSITION TITLE
                  ================================================= */}

                  <div
                    className="
                      relative
                      z-20
                      flex
                      flex-col
                      items-start
                      shrink-0
                    "
                  >
                    <h1
                      className="
                        text-white/90
                        leading-none
                      "
                      style={{
                        fontFamily:
                          '"Brush Script MT", "Dancing Script", cursive',
                        fontWeight: 300,
                        fontSize:
                          "clamp(24px, 2.2vw, 44px)",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {getPositionLabel(posNum)}
                    </h1>

                    <h1
                      className="
                        leading-none
                        font-black
                        uppercase
                        text-white
                        tracking-tighter
                      "
                      style={{
                        marginTop:
                          "clamp(3px, 0.5vh, 7px)",
                        fontSize:
                          "clamp(29px, 2.65vw, 52px)",
                      }}
                    >
                      PLACE
                    </h1>
                  </div>

                  {/* =================================================
                      ONE CAPSULE PER POSITION
                  ================================================= */}

                  <div
                    className="relative z-10 w-full"
                    style={{
                      marginTop:
                        "clamp(9px, 1.2vh, 17px)",
                    }}
                  >
                    <div
                      className="
                        w-full
                        relative
                        overflow-hidden
                        flex
                        items-center
                      "
                      style={{
                        ...styles,
                        borderRadius:
                          "clamp(18px, 1.5vw, 30px)",
                        padding:
                          "clamp(12px, 1.25vh, 21px) clamp(14px, 1.8vw, 32px)",
                        minHeight:
                          "clamp(68px, 9vh, 96px)",
                        boxSizing: "border-box",
                      }}
                    >
                      {/* Subtle color accent */}

                      <div
                        className="absolute inset-0 opacity-[0.15] pointer-events-none"
                        style={{
                          background: `linear-gradient(
                            90deg,
                            transparent,
                            ${tColor},
                            transparent
                          )`,
                        }}
                      />

                      <div
                        className="
                          relative
                          z-10
                          flex
                          items-center
                          w-full
                          min-w-0
                        "
                      >
                        {/* =================================================
                            POSITION NUMBER
                        ================================================= */}

                        <div
                          className="
                            rounded-full
                            flex
                            items-center
                            justify-center
                            bg-[#020617]/70
                            border
                            border-white/10
                            shadow-[inset_0_2px_5px_rgba(0,0,0,0.5)]
                            shrink-0
                          "
                          style={{
                            width:
                              "clamp(48px, 4vw, 68px)",
                            height:
                              "clamp(48px, 4vw, 68px)",
                            marginRight:
                              "clamp(12px, 1.2vw, 24px)",
                          }}
                        >
                          <span
                            className="
                              font-black
                              text-white
                              drop-shadow-md
                            "
                            style={{
                              fontSize:
                                "clamp(24px, 2vw, 36px)",
                            }}
                          >
                            {posNum}
                          </span>
                        </div>

                        {/* =================================================
                            WINNERS & TEAM
                        ================================================= */}

                        <div className="flex-1 flex flex-col min-w-0 pr-3 py-2 justify-center">
                          <h3
                            dir={isArabic(names) ? "rtl" : "ltr"}
                            className={`
                              font-bold
                              text-white
                              uppercase
                              drop-shadow-sm
                              break-words
                              max-w-full
                              ${isArabic(names) ? 'font-ge-ss-two' : 'tracking-wide'}
                            `}
                            style={{
                              fontSize:
                                "clamp(26px, 2.5vw, 44px)",
                              lineHeight: 1.1,
                            }}
                          >
                            {names}
                          </h3>

                          <div 
                            dir={isArabic(teamStr) ? "rtl" : "ltr"}
                            className={`flex items-start ${isArabic(teamStr) ? 'flex-row-reverse space-x-reverse' : ''} space-x-3 mt-2 md:mt-3 w-full`}
                          >
                            <div
                              className="rounded-full shrink-0 shadow-[0_0_15px_rgba(255,255,255,0.6)] mt-[6px] md:mt-[8px]"
                              style={{
                                width: "clamp(10px, 0.8vw, 16px)",
                                height: "clamp(10px, 0.8vw, 16px)",
                                backgroundColor: tColor,
                              }}
                            />
                            <span
                              className={`
                                font-bold
                                text-white/90
                                uppercase
                                drop-shadow-md
                                break-words
                                max-w-[95%]
                                leading-[1.2]
                                ${isArabic(teamStr) ? 'font-ge-ss-two' : 'tracking-widest'}
                              `}
                              style={{
                                fontSize:
                                  "clamp(20px, 1.8vw, 34px)",
                              }}
                            >
                              {teamStr}
                            </span>
                          </div>
                        </div>

                        {/* =================================================
                            POINTS
                        ================================================= */}

                        {pointsStr !== undefined && (
                          <div
                            className="
                              flex
                              items-center
                              justify-end
                              shrink-0
                              border-l
                              border-white/10
                            "
                            style={{
                              marginLeft:
                                "clamp(10px, 1vw, 18px)",
                              paddingLeft:
                                "clamp(12px, 1.2vw, 24px)",
                              minWidth:
                                "clamp(70px, 7vw, 130px)",
                            }}
                          >
                            <span
                              className="
                                leading-none
                                font-black
                                text-white
                                drop-shadow-2xl
                                tabular-nums
                                tracking-tighter
                                text-right
                              "
                              style={{
                                fontSize:
                                  "clamp(24px, 2.2vw, 44px)",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {pointsStr}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}