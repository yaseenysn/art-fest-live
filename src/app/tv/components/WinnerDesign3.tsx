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
  winners: WinnerItem[];
  programName?: string;
  exists: boolean;
};

const POSITION_LABELS = {
  1: "1ST PLACE",
  2: "2ND PLACE",
  3: "3RD PLACE",
};

const WinnerCard = ({
  winner,
  position,
}: {
  winner: PositionWinner;
  position: 1 | 2 | 3;
}) => {
  if (!winner.exists) return null;

  const isFirst = position === 1;
  const isSecond = position === 2;
  const isThird = position === 3;

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 35,
        scale: isFirst ? 0.94 : 0.96,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      transition={{
        duration: 0.7,
        delay: position === 1 ? 0.25 : position === 2 ? 0.4 : 0.55,
        ease: "easeOut",
      }}
      className={`
        relative flex flex-col items-center justify-center
        rounded-[28px]
        overflow-hidden
        text-center
        backdrop-blur-xl
        transition-all duration-500

        ${isFirst
          ? `
              w-[430px] h-[470px]
              border-[2px] border-[#d4af37]
              bg-gradient-to-b from-[#211d11] via-[#15130e] to-[#090909]
              shadow-[0_0_45px_rgba(212,175,55,0.30)]
            `
          : isSecond
            ? `
              w-[340px] h-[375px]
              border border-white/[0.13]
              bg-gradient-to-b from-[#202020] to-[#090909]
              shadow-[0_20px_50px_rgba(0,0,0,0.45)]
            `
            : `
              w-[315px] h-[350px]
              border border-white/[0.10]
              bg-gradient-to-b from-[#1b1b1b] to-[#080808]
              shadow-[0_15px_40px_rgba(0,0,0,0.4)]
            `
        }
      `}
    >
      {/* SUBTLE TOP GLOW */}
      <div
        className={`
          absolute top-0 left-1/2 -translate-x-1/2
          w-[70%] h-[2px]
          blur-[4px]
          ${isFirst
            ? "bg-[#e5c35b]"
            : isSecond
              ? "bg-white/30"
              : "bg-white/15"
          }
        `}
      />

      {/* WINNERS LIST */}
      <div
        className={`
          relative z-10
          w-[90%]
          px-4
          flex flex-col items-center justify-center
          ${isFirst
            ? "min-h-[130px] gap-2"
            : isSecond
              ? "min-h-[100px] gap-1.5"
              : "min-h-[90px] gap-1"
          }
        `}
      >
        {winner.winners.length > 0 ? (
          winner.winners.map((w, index) => {
            const studentName = w.studentName || w.name || "—";
            const teamName = w.teamName || w.team || "";
            return (
              <div key={index} className="flex flex-col items-center justify-center w-full mb-4 last:mb-0">
                {/* WINNER NAME */}
                <h2
                  className={`
                    font-black
                    uppercase
                    leading-[1.05]
                    break-words
                    whitespace-normal
                    text-center
                    ${winner.winners.length >= 2 
                      ? (isFirst ? "text-[clamp(22px,2.2vw,34px)]" : isSecond ? "text-[clamp(18px,1.8vw,26px)]" : "text-[clamp(16px,1.6vw,22px)]")
                      : (isFirst ? "text-[clamp(30px,3vw,48px)]" : isSecond ? "text-[clamp(24px,2.2vw,36px)]" : "text-[clamp(22px,2vw,32px)]")
                    }
                    ${isFirst ? "text-[#d9ad28]" : isSecond ? "text-white" : "text-white/95"}
                  `}
                >
                  {studentName}
                </h2>

                {/* TEAM NAME */}
                {teamName && (
                  <div
                    dir={isArabic(teamName) ? 'rtl' : 'ltr'}
                    className={`
                      relative z-10
                      uppercase
                      mt-2
                      min-w-0
                      max-w-full
                      break-words
                      leading-[1.2]
                      text-center
                      ${isArabic(teamName) ? 'font-ge-ss-two font-bold' : 'font-semibold tracking-[0.12em]'}
                      ${isFirst
                        ? "text-[clamp(18px,2vw,30px)] text-[#d4af37]"
                        : isSecond
                          ? "text-[clamp(16px,1.8vw,26px)] text-white/70"
                          : "text-[clamp(14px,1.6vw,24px)] text-white/60"
                      }
                    `}
                  >
                    {teamName}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <h2
            className={`
              font-black
              uppercase
              leading-[1.05]
              break-words
              whitespace-normal
              text-center
              ${isFirst ? "text-[clamp(30px,3vw,48px)] text-[#d9ad28]" : isSecond ? "text-[clamp(24px,2.2vw,36px)] text-white" : "text-[clamp(22px,2vw,32px)] text-white/95"}
            `}
          >
            —
          </h2>
        )}
      </div>

      {/* SEPARATOR */}
      <div
        className={`
          mt-5
          ${isFirst
            ? "w-[180px]"
            : isSecond
              ? "w-[130px]"
              : "w-[110px]"
          }
          h-px
          ${isFirst
            ? "bg-gradient-to-r from-transparent via-[#d4af37] to-transparent"
            : "bg-gradient-to-r from-transparent via-white/20 to-transparent"
          }
        `}
      />

      {/* POSITION — ALWAYS AT BOTTOM */}
      <div
        className={`
          absolute bottom-8 left-0 right-0
          text-center
          font-bold
          uppercase
          tracking-[0.35em]
          ${isFirst
            ? "text-[17px] text-[#d4af37]"
            : isSecond
              ? "text-[14px] text-white/55"
              : "text-[13px] text-white/40"
          }
        `}
      >
        {POSITION_LABELS[position]}
      </div>

      {/* FIRST PLACE EXTRA GLOW */}
      {isFirst && (
        <>
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_30%,rgba(212,175,55,0.12),transparent_55%)]" />

          <div className="absolute -bottom-[35px] left-1/2 -translate-x-1/2 w-[120px] h-[60px] bg-[#d4af37]/20 blur-[35px]" />
        </>
      )}
    </motion.div>
  );
};

export default function WinnerDesign3({
  programName,
  language,
  category,
  eventName = "AL MAHSAN",
  eventYear,
  winnersByPosition,
  id = "winner-design-3",
}: AllWinnersConfig) {
  const getWinner = (
    position: 1 | 2 | 3
  ): PositionWinner => {
    const winners =
      (winnersByPosition?.[position] || []) as WinnerItem[];

    return {
      position,
      winners,
      programName,
      exists: winners.length > 0,
    };
  };

  const first = getWinner(1);
  const second = getWinner(2);
  const third = getWinner(3);

  return (
    <div
      id={id}
      className="
        fixed inset-0
        w-full h-full
        overflow-hidden
        select-none
        bg-[#050505]
        text-white
      "
    >
      {/* ================= BACKGROUND ================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Center warm glow */}
        <div
          className="
            absolute
            left-1/2 top-[35%]
            -translate-x-1/2 -translate-y-1/2
            w-[650px] h-[500px]
            rounded-full
            bg-[#b58a20]/[0.07]
            blur-[130px]
          "
        />

        {/* Left subtle glow */}
        <div
          className="
            absolute
            left-[-250px] top-[20%]
            w-[650px] h-[650px]
            rounded-full
            bg-[#b58a20]/[0.035]
            blur-[120px]
          "
        />

        {/* Fine texture */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.7) 0.7px, transparent 0.7px)",
            backgroundSize: "7px 7px",
          }}
        />
      </div>

      {/* ================= HEADER ================= */}
      <div
        className="
          relative z-20
          w-full
          flex flex-col items-center justify-center text-center
          pt-[25px] md:pt-[35px]
          px-6
        "
      >
        {/* EVENT HEADER */}
        <div
          className="
            absolute
            top-[25px] md:top-[35px]
            left-[5%]
            text-left
          "
        >
          <div
            className="
              uppercase
              font-bold
              tracking-[0.35em]
              text-white/75
              text-[12px] md:text-[17px]
            "
          >
            {eventName} {eventYear}
          </div>
        </div>

        {/* CONGRATULATIONS WINNERS */}
        <h1
          className="text-white/90 font-black uppercase text-center leading-tight mt-6"
          style={{
            fontSize: "clamp(20px, 1.8vw, 32px)",
            letterSpacing: "0.2em",
            textShadow: "0 4px 20px rgba(255,255,255,0.2)"
          }}
        >
          CONGRATULATIONS<br/>WINNERS
        </h1>

        {/* PROGRAM NAME */}
        <motion.h2
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          dir={isArabic(programName) ? "rtl" : "ltr"}
          className={`
            mt-3
            max-w-[85vw]
            text-center
            uppercase
            font-black
            tracking-tight
            leading-none
            text-[clamp(36px,4.5vw,72px)]
            text-[#d7ae31]
            break-words
            ${isArabic(programName) ? 'font-ge-ss-two' : ''}
          `}
          style={{
            letterSpacing: isArabic(programName) ? "normal" : "clamp(0.08em, 0.15vw, 0.15em)",
            textShadow: "0 4px 30px rgba(215,174,49,0.3)"
          }}
        >
          {programName}
        </motion.h2>

        {/* CATEGORY */}
        <div
          className="
            mt-4
            uppercase
            font-bold
            tracking-[0.38em]
            text-white/80
            text-[clamp(14px,1.2vw,22px)]
          "
        >
          {language || "OTHER"}

          <span className="mx-3 text-[#d4af37]">
            •
          </span>

          {category || "GENERAL"}
        </div>
      </div>

      {/* ================= WINNERS ================= */}
      <div
        className="
          absolute
          left-0 right-0
          top-[32%]
          bottom-[5%]
          z-10
          flex
          items-center
          justify-center
          px-6
        "
      >
        <div
          className="
            flex
            items-center
            justify-center
            gap-[55px]
            md:gap-[75px]
            lg:gap-[90px]
            w-full
            max-w-[1450px]
          "
        >
          {/* 3RD — LEFT */}
          <div
            className="
              flex
              items-center
              justify-center
              flex-1
              min-w-0
              order-1
            "
          >
            <WinnerCard
              winner={third}
              position={3}
            />
          </div>

          {/* 1ST — CENTER */}
          <div
            className="
              flex
              items-center
              justify-center
              flex-1
              min-w-0
              order-2
            "
          >
            <WinnerCard
              winner={first}
              position={1}
            />
          </div>

          {/* 2ND — RIGHT */}
          <div
            className="
              flex
              items-center
              justify-center
              flex-1
              min-w-0
              order-3
            "
          >
            <WinnerCard
              winner={second}
              position={2}
            />
          </div>
        </div>
      </div>

      {/* ================= MOBILE ================= */}
      <div
        className="
          hidden
          max-md:flex
          absolute inset-x-0
          top-[25%]
          bottom-4
          z-20
          flex-col
          items-center
          justify-start
          overflow-y-auto
          gap-5
          px-4
          pb-10
        "
      >
        <WinnerCard
          winner={first}
          position={1}
        />

        <WinnerCard
          winner={second}
          position={2}
        />

        <WinnerCard
          winner={third}
          position={3}
        />
      </div>
    </div>
  );
}