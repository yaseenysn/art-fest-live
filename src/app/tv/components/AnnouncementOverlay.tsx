"use client";

import { motion } from 'motion/react';
import { IAnnouncement } from '@/types';

const QuoteSVG = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.017 18L16.41 11.904C16.634 11.343 16.75 10.75 16.75 10.138V4H21.25V10.138C21.25 12.006 20.697 13.711 19.593 15.252C18.489 16.794 17.065 17.71 15.32 18H14.017ZM4.767 18L7.16 11.904C7.384 11.343 7.5 10.75 7.5 10.138V4H12V10.138C12 12.006 11.447 13.711 10.343 15.252C9.239 16.794 7.815 17.71 6.07 18H4.767Z" />
  </svg>
);

export default function AnnouncementOverlay({ announcement }: { announcement: IAnnouncement }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex justify-center items-center w-full h-full bg-[#751121] overflow-hidden select-none px-8"
      style={{
        backgroundImage: 'repeating-linear-gradient(45deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 3px, transparent 3px, transparent 8px)'
      }}
    >
      {/* The main white announcement board */}
      <motion.div
        initial={{ scale: 0.8, y: 50, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
        className="relative w-full max-w-[1200px] min-h-[50vh] bg-[#fdfbf7] rounded-[30px] md:rounded-[50px] shadow-[15px_20px_40px_rgba(0,0,0,0.6),inset_-5px_-5px_15px_rgba(0,0,0,0.05),inset_5px_5px_15px_rgba(255,255,255,1)] p-4 md:p-6 z-10 mt-[-5%]"
      >
        {/* The 3D tail pointing down */}
        <div className="absolute -bottom-6 left-[35%] w-16 h-16 md:w-20 md:h-20 bg-[#fdfbf7] border-b-[6px] border-r-[6px] border-[#e2d1bb] rotate-45 shadow-[15px_15px_30px_rgba(0,0,0,0.4)] -z-10 rounded-br-xl" />

        {/* Inner border container with gold/beige accent */}
        <div className="border-[4px] md:border-[6px] border-[#e2d1bb] rounded-[20px] md:rounded-[35px] p-10 md:p-20 flex flex-col items-center justify-center relative bg-white/50 h-full w-full">

          {/* Quote top-left */}
          <div className="absolute top-6 left-6 md:top-10 md:left-12 text-[#751121] opacity-90 drop-shadow-sm">
            <QuoteSVG className="w-12 h-12 md:w-20 md:h-20" />
          </div>

          {/* Quote bottom-right */}
          <div className="absolute bottom-6 right-6 md:bottom-10 md:right-12 text-[#751121] opacity-90 drop-shadow-sm rotate-180">
            <QuoteSVG className="w-12 h-12 md:w-20 md:h-20" />
          </div>

          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="w-full text-center relative z-20 flex flex-col h-full justify-center mt-4"
          >
            <h2 className="text-[#2c3e50] font-black uppercase text-[clamp(24px,4vw,36px)] tracking-tight leading-none mb-2">
              IMPORTANT
            </h2>
            <h1 className="text-[#8e1b29] font-black uppercase text-[clamp(36px,6vw,64px)] tracking-tighter leading-none mb-8 md:mb-10 border-b-4 border-[#e0d6c8] pb-6 md:pb-8 w-[95%] md:w-[85%] mx-auto">
              ANNOUNCEMENT
            </h1>

            {/* Announcement Message */}
            <p className="text-[clamp(28px,5vw,50px)] text-[#111827] font-extrabold leading-snug md:leading-[1.4] px-4 md:px-16 whitespace-pre-wrap break-words drop-shadow-sm">
              {announcement.message}
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* 3D Megaphone Graphic at bottom-right */}
      <motion.div
        className="absolute bottom-4 right-4 md:bottom-[5vh] md:right-[5vw] lg:right-[15vw] z-30"
        initial={{ scale: 0.5, rotate: 20, opacity: 0, x: 50, y: 50 }}
        animate={{ scale: 1, rotate: -10, opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 0.6, type: "spring", bounce: 0.5, duration: 1 }}
      >
        <div className="relative">
          {/* Sound waves / Radiating lines */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="absolute -top-12 -left-12 md:-top-16 md:-left-16 flex flex-col gap-4 md:gap-6 rotate-[25deg] z-10"
          >
            <div className="w-12 h-3 md:w-20 md:h-4 bg-white/90 rounded-full rotate-[-45deg] shadow-lg" />
            <div className="w-12 h-3 md:w-20 md:h-4 bg-white/90 rounded-full -mt-4 md:-mt-6 rotate-[-20deg] shadow-lg -translate-x-6 md:-translate-x-8" />
            <div className="w-12 h-3 md:w-20 md:h-4 bg-white/90 rounded-full -mt-1 md:-mt-2 rotate-[5deg] shadow-lg -translate-x-3 md:-translate-x-4" />
          </motion.div>

          {/* Megaphone image - Positioned so the white box doesn't overlap the board's white background */}
          <img
            src="/megaphone.jpg"
            alt="Megaphone"
            className="w-[200px] md:w-[350px] mix-blend-multiply contrast-125 saturate-150 relative z-20"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
