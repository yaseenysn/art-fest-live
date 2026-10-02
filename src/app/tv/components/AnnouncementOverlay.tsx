"use client";

import { motion } from "motion/react";
import { IAnnouncement } from "@/types";
import AutoFitText from "@/components/ui/AutoFitText";

const isArabic = (text?: string) => /[\u0600-\u06FF]/.test(text || "");

const QuoteSVG = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.017 18L16.41 11.904C16.634 11.343 16.75 10.75 16.75 10.138V4H21.25V10.138C21.25 12.006 20.697 13.711 19.593 15.252C18.489 16.794 17.065 17.71 15.32 18H14.017ZM4.767 18L7.16 11.904C7.384 11.343 7.5 10.75 7.5 10.138V4H12V10.138C12 12.006 11.447 13.711 10.343 15.252C9.239 16.794 7.815 17.71 6.07 18H4.767Z" />
  </svg>
);

export default function AnnouncementOverlay({ announcement }: { announcement: IAnnouncement }) {
  const message = announcement.message || "";
  const isAr = isArabic(message);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex justify-center items-center w-full h-full bg-[#751121] overflow-hidden select-none p-4 md:p-8"
      style={{
        backgroundImage: 'repeating-linear-gradient(45deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 3px, transparent 3px, transparent 8px)'
      }}
    >
      {/* Main Announcement Board */}
      <motion.div
        initial={{ scale: 0.8, y: 50, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
        className="relative w-full max-w-[1300px] h-[86vh] max-h-[90vh] bg-[#fdfbf7] rounded-[30px] md:rounded-[50px] shadow-[15px_20px_40px_rgba(0,0,0,0.6),inset_-5px_-5px_15px_rgba(0,0,0,0.05),inset_5px_5px_15px_rgba(255,255,255,1)] p-3 md:p-6 z-10 flex flex-col"
      >
        {/* The 3D tail pointing down */}
        <div className="absolute -bottom-6 left-[35%] w-16 h-16 md:w-20 md:h-20 bg-[#fdfbf7] border-b-[6px] border-r-[6px] border-[#e2d1bb] rotate-45 shadow-[15px_15px_30px_rgba(0,0,0,0.4)] -z-10 rounded-br-xl" />

        {/* Inner border container with gold/beige accent */}
        <div className="border-[4px] md:border-[6px] border-[#e2d1bb] rounded-[20px] md:rounded-[35px] p-4 md:p-8 flex flex-col items-center justify-between relative bg-white/50 h-full w-full overflow-hidden">

          {/* Quote top-left */}
          <div className="absolute top-4 left-4 md:top-8 md:left-8 text-[#751121] opacity-90 drop-shadow-sm pointer-events-none z-10">
            <QuoteSVG className="w-10 h-10 md:w-16 md:h-16" />
          </div>

          {/* Quote bottom-right */}
          <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8 text-[#751121] opacity-90 drop-shadow-sm rotate-180 pointer-events-none z-10">
            <QuoteSVG className="w-10 h-10 md:w-16 md:h-16" />
          </div>

          {/* =========================================================
              TOP HEADER AREA (With Megaphone graphic moved to TOP)
          ========================================================= */}
          <div className="w-full flex items-center justify-center relative z-20 shrink-0 border-b-2 border-[#e0d6c8] pb-3 md:pb-4 pt-1">
            <div className="flex flex-col items-center justify-center text-center">
              <h2 className="text-[#2c3e50] font-black uppercase text-[clamp(16px,2.2vw,28px)] tracking-tight leading-none mb-1">
                IMPORTANT
              </h2>
              <h1 className="text-[#8e1b29] font-black uppercase text-[clamp(26px,3.8vw,48px)] tracking-tighter leading-none">
                ANNOUNCEMENT
              </h1>
            </div>

            {/* 3D Megaphone Graphic (Moved to TOP-RIGHT of Header) */}
            <motion.div
              className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-30"
              initial={{ scale: 0.5, rotate: 20, opacity: 0 }}
              animate={{ scale: 1, rotate: -10, opacity: 1 }}
              transition={{ delay: 0.6, type: "spring", bounce: 0.5, duration: 1 }}
            >
              <div className="relative">
                {/* Sound waves / Radiating lines */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2, duration: 0.5 }}
                  className="absolute -top-4 -left-4 md:-top-6 md:-left-6 flex flex-col gap-1 md:gap-2 rotate-[25deg] z-10"
                >
                  <div className="w-5 h-1.5 md:w-8 md:h-2 bg-white/90 rounded-full rotate-[-45deg] shadow-lg" />
                  <div className="w-5 h-1.5 md:w-8 md:h-2 bg-white/90 rounded-full -mt-1 md:-mt-2 rotate-[-20deg] shadow-lg -translate-x-2 md:-translate-x-3" />
                  <div className="w-5 h-1.5 md:w-8 md:h-2 bg-white/90 rounded-full -mt-0.5 rotate-[5deg] shadow-lg -translate-x-1 md:-translate-x-1.5" />
                </motion.div>

                {/* Megaphone image */}
                <img
                  src="/megaphone.jpg"
                  alt="Megaphone"
                  className="w-[70px] md:w-[110px] mix-blend-multiply contrast-125 saturate-150 relative z-20"
                />
              </div>
            </motion.div>
          </div>

          {/* =========================================================
              MAIN ANNOUNCEMENT MESSAGE AREA (DOM MEASURED AUTO-FIT)
          ========================================================= */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="w-full flex-1 min-h-0 min-w-0 flex flex-col items-center justify-center text-center relative z-20 px-8 md:px-20 py-2 overflow-hidden"
          >
            <AutoFitText
              text={message}
              maxFontSizeVh={6.5}
              minFontSizeVh={1.6}
              className={`text-[#111827] font-extrabold text-center leading-snug md:leading-normal whitespace-pre-wrap break-words drop-shadow-sm w-full max-w-full ${
                isAr ? "font-ge-ss-two" : ""
              }`}
            >
              {message}
            </AutoFitText>
          </motion.div>

        </div>
      </motion.div>
    </motion.div>
  );
}
