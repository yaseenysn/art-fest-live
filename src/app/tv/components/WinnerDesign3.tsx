"use client";

import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { AllWinnersConfig } from "./AllWinnersRouter";

export default function WinnerDesign3({
  programName,
  language,
  category,
  eventName = "AL MAHSAN",
  eventYear,
  winnersByPosition,
  id = "winner-design-3",
}: AllWinnersConfig) {


  const w1 = winnersByPosition[1] || [];
  const w2 = winnersByPosition[2] || [];
  const w3 = winnersByPosition[3] || [];

  // ---------------------------------------------------------
  // WINNER NAMES
  // ---------------------------------------------------------

  const getNames = (winners: typeof w1) => {
    return winners
      .map((winner) => winner.studentName)
      .filter(Boolean)
      .join(" • ");
  };

  const names1 = getNames(w1);
  const names2 = getNames(w2);
  const names3 = getNames(w3);

  // ---------------------------------------------------------
  // CARD DATA
  // ---------------------------------------------------------

  const cards = [
    {
      position: 2,
      label: "Play 50 Matches",
      names: names2,
      active: false,
      badge: "2",
      type: "silver",
    },
    {
      position: 1,
      label: "Play 10 Matches",
      names: names1,
      active: true,
      badge: "1",
      type: "gold",
    },
    {
      position: 3,
      label: "Play 100 Matches",
      names: names3,
      active: false,
      badge: "3",
      type: "bronze",
    },
  ];

  // ---------------------------------------------------------
  // MEDAL COMPONENT
  // ---------------------------------------------------------

  const Medal = ({ type, numeral, active }: { type: string; numeral: string; active: boolean }) => {
    const isGold = type === "gold";
    const isSilver = type === "silver";

    const c = isGold
      ? {
          primary: "#d4af37",
          light: "#fde08b",
          dark: "#997a00",
          glow: "rgba(212,175,55,0.45)",
          ribbon: "#c69b2d",
          ribbonDark: "#7d5e0a",
        }
      : isSilver
      ? {
          primary: "#cccccc",
          light: "#ffffff",
          dark: "#707070",
          glow: "rgba(200,200,200,0.2)",
          ribbon: "#a0a0a0",
          ribbonDark: "#4a4a4a",
        }
      : {
          primary: "#cd7f32",
          light: "#f0a868",
          dark: "#8b5a2b",
          glow: "rgba(205,127,50,0.2)",
          ribbon: "#b36b22",
          ribbonDark: "#5c330c",
        };

    const medalSize = active ? 180 : 150;
    const innerSize = active ? 150 : 124;

    return (
      <div
        className="relative flex flex-col items-center"
        style={{
          width: 220,
          height: active ? 250 : 210,
        }}
      >
        {/* Glow */}
        <div
          className="absolute rounded-full z-0"
          style={{
            top: 50,
            width: medalSize + 40,
            height: medalSize + 40,
            background: `radial-gradient(circle, ${c.glow} 0%, transparent 60%)`,
            filter: "blur(20px)",
          }}
        />

        {/* Ribbon */}
        <div
          className="absolute top-0 z-0 overflow-hidden flex justify-center"
          style={{ width: "100%", height: 80 }}
        >
          {/* Left ribbon */}
          <div
            style={{
              width: active ? 40 : 35,
              height: 120,
              background: `repeating-linear-gradient(90deg, ${c.ribbonDark} 0%, ${c.ribbon} 30%, ${c.ribbonDark} 60%)`,
              transform: "rotate(25deg) translateY(-20px) translateX(10px)",
              boxShadow: "inset 0 0 15px rgba(0,0,0,0.9)",
              borderRight: "2px solid rgba(0,0,0,0.4)",
            }}
          />
          {/* Right ribbon */}
          <div
            style={{
              width: active ? 40 : 35,
              height: 120,
              background: `repeating-linear-gradient(90deg, ${c.ribbonDark} 0%, ${c.ribbon} 30%, ${c.ribbonDark} 60%)`,
              transform: "rotate(-25deg) translateY(-20px) translateX(-10px)",
              boxShadow: "inset 0 0 15px rgba(0,0,0,0.9)",
              borderLeft: "2px solid rgba(0,0,0,0.4)",
            }}
          />
        </div>

        {/* Medal Coin */}
        <div
          className="absolute z-10 rounded-full flex items-center justify-center"
          style={{
            top: active ? 55 : 45,
            width: medalSize,
            height: medalSize,
            background: `linear-gradient(135deg, ${c.light} 0%, ${c.primary} 50%, ${c.dark} 100%)`,
            border: `1.5px solid ${c.light}`,
            boxShadow: `0 15px 35px rgba(0,0,0,0.7), inset 0 -5px 20px rgba(0,0,0,0.6), inset 0 5px 20px rgba(255,255,255,0.7)`,
          }}
        >
          {/* Inner details */}
          <div
            className="rounded-full flex flex-col items-center justify-center relative"
            style={{
              width: innerSize,
              height: innerSize,
              border: `2px solid rgba(255,255,255,0.25)`,
              background: `radial-gradient(circle at 35% 35%, ${c.light} 0%, ${c.primary} 55%, ${c.dark} 100%)`,
              boxShadow: "inset 0 0 25px rgba(0,0,0,0.6)",
            }}
          >
            {/* Wreath decoration SVG */}
            <svg
              viewBox="0 0 100 100"
              className="absolute inset-0 w-full h-full opacity-60"
              style={{ filter: `drop-shadow(1px 1px 0px ${c.light})` }}
            >
              <path
                d="M 15 60 C 5 30, 45 15, 50 25 C 55 15, 95 30, 85 60 C 75 95, 25 95, 15 60 Z"
                fill="none"
                stroke={c.dark}
                strokeWidth="2"
              />
              <path
                d="M 25 70 C 15 45, 45 35, 50 40 C 55 35, 85 45, 75 70 C 65 95, 35 95, 25 70 Z"
                fill="none"
                stroke={c.dark}
                strokeWidth="1.5"
              />
            </svg>

            {/* Number */}
            <span
              className="z-10"
              style={{
                color: c.light,
                fontSize: active ? 80 : 65,
                lineHeight: 1,
                fontWeight: 900,
                textShadow: `2px 2px 6px rgba(0,0,0,0.6), -1px -1px 0px ${c.dark}`,
                fontFamily: "serif",
              }}
            >
              {numeral}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // ---------------------------------------------------------
  // MAIN
  // ---------------------------------------------------------

  return (
    <div
      id={id}
      className="fixed inset-0 overflow-hidden bg-black select-none"
    >
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        {/* =====================================================
            BACKGROUND
        ===================================================== */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Black background */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 50% 30%, #151005 0%, #0a0a0a 45%, #000000 100%)",
            }}
          />
          {/* Subtle center glow */}
          <div
            className="absolute"
            style={{
              left: "50%",
              top: "40%",
              transform: "translate(-50%, -50%)",
              width: 1000,
              height: 500,
              background:
                "radial-gradient(ellipse, rgba(212,175,55,0.06), transparent 70%)",
              filter: "blur(40px)",
            }}
          />
        </div>

        {/* =====================================================
            TOP LEFT EVENT
        ===================================================== */}
        <motion.div
          className="absolute"
          style={{ left: 80, top: 60 }}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div
            style={{
              color: "#d4af37",
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: "0.35em",
              textTransform: "uppercase",
            }}
          >
            {eventName} {eventYear}
          </div>
          <div
            style={{
              marginTop: 15,
              color: "rgba(255,255,255,0.5)",
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
            }}
          >
            ALL WINNERS
          </div>
        </motion.div>

        {/* =====================================================
            HEADER (IBRAHIM)
        ===================================================== */}
        <div
          className="relative md:absolute pointer-events-none w-full md:top-[90px] pt-24 md:pt-0 flex justify-center z-20"
        >
          <motion.div
            className="text-center pointer-events-auto w-full max-w-[90%] md:w-[900px]"
            initial={{ opacity: 0, y: -25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
          <h1
            className="text-[clamp(40px,7vw,110px)]"
            style={{
              margin: 0,
              lineHeight: 1,
              fontWeight: 900,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              background: "linear-gradient(to bottom, #ffffff 0%, #d4af37 50%, #997a00 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0px 10px 20px rgba(0,0,0,0.8))",
            }}
          >
            {programName}
          </h1>
          <div
            style={{
              marginTop: 20,
              color: "rgba(255,255,255,0.7)",
              fontSize: 18,
              fontWeight: 800,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
            }}
          >
            {language || "ARABIC"}
            <span style={{ margin: "0 15px", color: "#d4af37" }}>•</span>
            {category || "SENIOR"}
          </div>
          </motion.div>
        </div>

        {/* =====================================================
            LEFT ARROW
        ===================================================== */}
        <motion.button
          className="absolute flex items-center justify-center z-50"
          style={{
            left: 70,
            top: "50%",
            transform: "translateY(-50%)",
            width: 70,
            height: 70,
            borderRadius: "50%",
            border: "1.5px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.02)",
            color: "#ffffff",
          }}
          whileHover={{ scale: 1.08, backgroundColor: "rgba(255,255,255,0.06)" }}
        >
          <span style={{ fontSize: 35, fontWeight: 300, lineHeight: 1 }}>‹</span>
        </motion.button>

        {/* =====================================================
            RIGHT ARROW
        ===================================================== */}
        <motion.button
          className="absolute flex items-center justify-center z-50"
          style={{
            right: 70,
            top: "50%",
            transform: "translateY(-50%)",
            width: 70,
            height: 70,
            borderRadius: "50%",
            border: "1.5px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.02)",
            color: "#ffffff",
          }}
          whileHover={{ scale: 1.08, backgroundColor: "rgba(255,255,255,0.06)" }}
        >
          <span style={{ fontSize: 35, fontWeight: 300, lineHeight: 1 }}>›</span>
        </motion.button>

        {/* =====================================================
            CARDS
        ===================================================== */}
        <div
          className="absolute flex items-end justify-center"
          style={{ left: 0, right: 0, top: 310, height: 600, gap: 40 }}
        >
          {cards.map((card, index) => {
            const hasWinner = Boolean(card.names);
            const isGold = card.type === "gold";

            return (
              <motion.div
                key={card.position}
                initial={{ opacity: 0, y: 50, scale: card.active ? 0.95 : 1 }}
                animate={{ opacity: 1, y: 0, scale: card.active ? 1 : 0.95 }}
                transition={{ duration: 0.8, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
                className={`relative flex flex-col items-center ${card.active ? 'w-[90%] md:w-[500px] h-[350px] md:h-[580px]' : 'w-[80%] md:w-[380px] h-[300px] md:h-[450px]'}`}
                style={{
                  zIndex: card.active ? 10 : 5,
                }}
              >
                {/* Golden Glow for 1st Place */}
                {card.active && (
                  <div
                    className="absolute rounded-[30px]"
                    style={{
                      inset: -3,
                      background: "linear-gradient(180deg, #d4af37, #997a00)",
                      boxShadow: "0 0 40px rgba(212,175,55,0.6), inset 0 0 20px rgba(255,255,255,0.2)",
                    }}
                  />
                )}

                {/* Card Container */}
                <div
                  className="absolute inset-0 overflow-hidden rounded-[28px] flex flex-col items-center"
                  style={{
                    background: card.active
                      ? "linear-gradient(180deg, #1f1a0f, #0a0a0a)"
                      : "linear-gradient(180deg, #1a1a1a, #0a0a0a)",
                    border: card.active ? "none" : "1.5px solid rgba(255,255,255,0.08)",
                    boxShadow: card.active
                      ? "0 25px 60px rgba(0,0,0,0.8)"
                      : "0 15px 40px rgba(0,0,0,0.6)",
                  }}
                >
                  {/* Subtle top glare */}
                  <div
                    className="absolute"
                    style={{
                      left: 0,
                      right: 0,
                      top: 0,
                      height: 200,
                      background: isGold
                        ? "radial-gradient(circle at 50% 0%, rgba(212,175,55,0.15), transparent 70%)"
                        : "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.05), transparent 70%)",
                    }}
                  />

                  {/* Winner Names & Place */}
                  {hasWinner && (
                    <div className="flex flex-col items-center justify-center h-full w-full px-6 relative z-10">
                      <div
                        style={{
                          color: isGold ? "#d4af37" : "#ffffff",
                          fontSize: card.active ? 42 : 32,
                          fontWeight: 900,
                          lineHeight: 1.2,
                          textTransform: "uppercase",
                          textShadow: "0 4px 15px rgba(0,0,0,0.8)",
                          textAlign: "center",
                          wordWrap: "break-word",
                        }}
                      >
                        {card.names}
                      </div>

                      <div
                        style={{
                          marginTop: 14,
                          color: isGold ? "#d4af37" : "rgba(255,255,255,0.5)",
                          fontSize: card.active ? 16 : 14,
                          fontWeight: 800,
                          letterSpacing: "0.3em",
                          textTransform: "uppercase",
                        }}
                      >
                        {card.position === 1
                          ? "1ST PLACE"
                          : card.position === 2
                          ? "2ND PLACE"
                          : "3RD PLACE"}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* =====================================================
            BOTTOM CHEVRON
        ===================================================== */}
        <motion.div
          className="absolute flex flex-col items-center"
          style={{ left: "50%", bottom: 40, transform: "translateX(-50%)" }}
          animate={{ y: [0, -10, 0], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              transform: "rotate(45deg)",
              borderLeft: "4px solid #d4af37",
              borderTop: "4px solid #d4af37",
              boxShadow: "-2px -2px 10px rgba(212,175,55,0.5)",
              marginBottom: -15,
            }}
          />
          <div
            style={{
              width: 40,
              height: 40,
              transform: "rotate(45deg)",
              borderLeft: "4px solid #d4af37",
              borderTop: "4px solid #d4af37",
              opacity: 0.5,
              boxShadow: "-2px -2px 10px rgba(212,175,55,0.5)",
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}