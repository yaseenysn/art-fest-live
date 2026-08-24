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
  names: string;
  teamName?: string;
  programName?: string;
  exists: boolean;
};

const WinnerNode = ({
  winner,
  isFirst = false,
  delay,
}: {
  winner: PositionWinner;
  isFirst?: boolean;
  delay: number;
}) => {
  if (!winner.exists) return null;

  return (
    <motion.div
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.7, delay, ease: "easeOut" }}
      className={`flex items-center gap-4 md:gap-8 w-full ${isFirst ? 'scale-100 md:scale-110 md:origin-left' : 'scale-100'} z-30`}
    >
      {/* Circle */}
      <div className={`flex-shrink-0 ${isFirst ? 'w-[90px] h-[90px] md:w-[160px] md:h-[160px]' : 'w-[75px] h-[75px] md:w-[130px] md:h-[130px]'} rounded-full border-[4px] md:border-[6px] border-[#eb5b36] shadow-[0_0_30px_rgba(235,91,54,0.3)] bg-gradient-to-br from-white to-[#fff8f5] flex items-center justify-center relative`}>
        <span className={`text-[#eb5b36] font-black ${isFirst ? 'text-[45px] md:text-[80px]' : 'text-[35px] md:text-[65px]'} leading-none`}>
          {winner.position}
        </span>
      </div>

      {/* Details */}
      <div className="flex flex-col justify-center max-w-[65%] md:max-w-none flex-grow md:flex-grow-0">
        {/* Winners Names */}
        <h2 className={`font-black uppercase text-white drop-shadow-sm ${isFirst ? 'text-[clamp(18px,3vw,45px)]' : 'text-[clamp(16px,2vw,32px)]'} leading-tight break-words whitespace-normal`}>
          {winner.names !== "—" ? winner.names : winner.teamName}
        </h2>
        
        {/* Team & Program */}
        <p className={`font-bold uppercase mt-1 ${isFirst ? 'text-[clamp(12px,1.5vw,20px)]' : 'text-[clamp(11px,1.2vw,16px)]'} truncate text-purple-200`}>
          <span className="text-[#eb5b36]">{winner.teamName}</span>
          <span className="text-white/30 px-2">•</span> 
          <span>{winner.programName}</span>
        </p>
      </div>
      
      {/* Connection Line (Desktop Only) */}
      <div className="hidden md:block flex-grow h-[2px] bg-gradient-to-r from-[#eb5b36]/40 via-purple-400/20 to-transparent ml-6"></div>
    </motion.div>
  );
};

export default function WinnerDesign2({
  programName,
  language,
  category,
  eventName = "AL MAHSAN",
  eventYear,
  winnersByPosition,
  id = "winner-design-2",
}: AllWinnersConfig) {

  const getPositionWinner = (position: 1 | 2 | 3): PositionWinner => {
    const winners = (winnersByPosition?.[position] || []) as WinnerItem[];
    const names = winners.map((winner) => winner.studentName || winner.name || "").filter(Boolean).join(" • ");
    
    return {
      position,
      names: names || "—",
      teamName: winners[0]?.teamName || winners[0]?.team,
      programName: programName,
      exists: winners.length > 0,
    };
  };

  const first = getPositionWinner(1);
  const second = getPositionWinner(2);
  const third = getPositionWinner(3);

  return (
    <div id={id} className="fixed inset-0 overflow-hidden bg-[#090211] select-none flex flex-col w-full h-full">
      {/* BACKGROUND EFFECTS */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute right-[-250px] top-[80px] w-[850px] h-[850px] rounded-full bg-purple-700/15 blur-[150px]" />
        <div className="absolute left-[-300px] top-[100px] w-[750px] h-[750px] rounded-full bg-purple-900/10 blur-[130px]" />
        
        {/* Background Rings */}
        <div className="absolute left-[-260px] top-[140px] w-[850px] h-[850px] rounded-full border border-white/[0.05]" />
        <div className="absolute left-[-180px] top-[220px] w-[700px] h-[700px] rounded-full border border-white/[0.04]" />

        {/* Dot Texture */}
        <div className="absolute inset-0 opacity-[0.045]" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.6) 0.8px, transparent 0.8px)", backgroundSize: "7px 7px" }} />
      </div>

      {/* HEADER SECTION */}
      <div className="relative z-40 w-full flex flex-col items-center pt-[40px] md:pt-[60px] px-6 md:px-[80px] shrink-0">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="w-full text-center">
          <div className="flex justify-between items-start w-full mb-4">
            <div className="text-left">
               <div className="text-white/75 font-bold uppercase tracking-[0.35em] text-[12px] md:text-[18px]">{eventName} {eventYear}</div>
               <div className="text-[#a78bfa] font-bold uppercase tracking-[0.3em] text-[10px] md:text-[14px] mt-1">ALL WINNERS</div>
            </div>
            
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 bg-black/40 backdrop-blur-xl">
              <span className="w-[8px] h-[8px] rounded-full bg-[#10b981] shadow-[0_0_12px_rgba(16,185,129,0.9)]" />
              <div className="text-white text-[10px] md:text-[12px] font-bold tracking-[0.15em] uppercase">LIVE</div>
            </div>
          </div>
          
          <h1 className="text-white font-black uppercase tracking-tight text-[clamp(28px,5vw,64px)] leading-tight break-words max-w-5xl mx-auto">
            {programName}
          </h1>
          <div className="mt-2 text-white/50 font-bold uppercase tracking-[0.35em] text-[10px] md:text-[14px]">
            {language || "OTHER"} <span className="mx-3 text-purple-400/40">•</span> {category || "GENERAL"}
          </div>
        </motion.div>
      </div>

      {/* MAIN CONTENT SECTION */}
      <div className="relative z-30 w-full flex-grow flex flex-col md:flex-row items-center justify-between px-6 md:px-[100px] pb-[40px] md:pb-[80px] pt-8 md:pt-4 gap-10 md:gap-0 min-h-0">
        
        {/* LEFT: WINNERS LIST */}
        <div className="flex flex-col justify-center gap-8 md:gap-12 w-full md:w-[55%] h-full">
          <WinnerNode winner={first} isFirst={true} delay={0.3} />
          <WinnerNode winner={second} delay={0.5} />
          <WinnerNode winner={third} delay={0.7} />
        </div>

        {/* RIGHT: CONGRATULATIONS CIRCLE */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.85 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 0.9, delay: 0.5 }}
          className="hidden md:flex relative items-center justify-center w-[300px] h-[300px] md:w-[460px] md:h-[460px] shrink-0"
        >
          {/* Outer Rings */}
          <div className="absolute inset-[-70px] rounded-full border border-purple-400/[0.07]" />
          <div className="absolute inset-[-45px] rounded-full border border-purple-400/[0.10]" />
          <div className="absolute inset-[-22px] rounded-full border border-purple-400/[0.15]" />
          <div className="absolute inset-[-60px] rounded-full bg-purple-600/15 blur-[70px]" />
          
          <div className="absolute inset-0 rounded-full flex flex-col items-center justify-center text-center border-[1.5px] border-white/20 shadow-[0_0_80px_rgba(139,44,255,0.4)]" style={{ background: "radial-gradient(circle at 35% 25%, #9630ff 0%, #7c20df 42%, #6115bd 75%, #4a0d8f 100%)" }}>
            <div className="text-white font-bold uppercase tracking-[0.4em] text-[10px] md:text-[14px] mb-3">CONGRATULATIONS</div>
            <div className="text-white font-black uppercase tracking-wider text-[clamp(28px,6vw,65px)] leading-none">WINNERS</div>
            
            <div className="flex items-center justify-center gap-3 mt-4 opacity-70">
              <div className="h-[1px] w-[50px] bg-gradient-to-r from-transparent to-white" />
              <div className="w-[6px] h-[6px] rotate-45 bg-white" />
              <div className="h-[1px] w-[50px] bg-gradient-to-l from-transparent to-white" />
            </div>
          </div>
        </motion.div>
      </div>

    </div>
  );
}