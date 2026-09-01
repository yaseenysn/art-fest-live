"use client";

import React from "react";
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
  names: string[];
  teamName?: string;
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

  const isArabic = (text?: string) => /[\u0600-\u06FF]/.test(text || '');

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

      {/* WINNER NAME */}
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
        {winner.names.length > 0 ? (
          winner.names.map((name, index) => (
            <h2
              key={index}
              className={`
                font-black
                uppercase
                leading-[1.05]
                break-words
                whitespace-normal
                text-center
                ${winner.names.length >= 2 
                  ? (isFirst ? "text-[clamp(22px,2.2vw,34px)]" : isSecond ? "text-[clamp(18px,1.8vw,26px)]" : "text-[clamp(16px,1.6vw,22px)]")
                  : (isFirst ? "text-[clamp(30px,3vw,48px)]" : isSecond ? "text-[clamp(24px,2.2vw,36px)]" : "text-[clamp(22px,2vw,32px)]")
                }
                ${isFirst ? "text-[#d9ad28]" : isSecond ? "text-white" : "text-white/95"}
              `}
            >
              {name}
            </h2>
          ))
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
            {winner.teamName || "—"}
          </h2>
        )}
      </div>

      {/* TEAM NAME */}
      {winner.teamName && (
        <div
          dir={isArabic(winner.teamName) ? "rtl" : "ltr"}
          className={`
            relative z-10
            uppercase
            font-bold
            break-words
            max-w-[95%]
            text-center
            leading-[1.1]
            mt-3
            ${isArabic(winner.teamName) ? 'font-ge-ss-two' : 'tracking-wide'}
            ${isFirst
              ? "text-[clamp(20px,2vw,36px)] text-[#d4af37]"
              : isSecond
                ? "text-[clamp(16px,1.6vw,28px)] text-white/70"
                : "text-[clamp(14px,1.4vw,24px)] text-white/60"
            }
          `}
        >
          {winner.teamName}
        </div>
      )}

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

    const names = winners
      .map(
        (winner) =>
          winner.studentName ||
          winner.name ||
          ""
      )
      .filter(Boolean);

    return {
      position,
      names,
      teamName:
        winners[0]?.teamName ||
        winners[0]?.team,
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
          flex flex-col items-center
          pt-[35px] md:pt-[48px]
          px-6
        "
      >
        {/* EVENT HEADER */}
        <div
          className="
            absolute
            top-[35px] md:top-[55px]
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

          <div
            className="
              mt-2
              uppercase
              font-bold
              tracking-[0.3em]
              text-white/45
              text-[10px] md:text-[14px]
            "
          >
            ALL WINNERS
          </div>
        </div>

        {/* PROGRAM NAME */}
        <motion.h1
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="
            mt-[40px]
            max-w-[85vw]
            text-center
            uppercase
            font-black
            tracking-tight
            leading-none
            text-[clamp(30px,5vw,76px)]
            text-[#d7ae31]
            break-words
          "
        >
          {programName}
        </motion.h1>

        {/* CATEGORY */}
        <div
          className="
            mt-5
            uppercase
            font-bold
            tracking-[0.38em]
            text-white/65
            text-[10px] md:text-[15px]
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