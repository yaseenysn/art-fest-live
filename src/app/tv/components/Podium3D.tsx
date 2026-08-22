"use client";

import { motion } from 'motion/react';
import { LeaderboardConfig } from '@/types';

// The background texture is a simple SVG grid pattern
const BackgroundTexture = () => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.03] z-0" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#gridPattern)" />
  </svg>
);

export default function Podium3D({ config }: { config: LeaderboardConfig }) {
  const top3 = config.rows.slice(0, 3);
  
  // Heights and offsets for the 3 podium blocks
  // 1st: center (tallest)
  // 2nd: left (medium)
  // 3rd: right (shortest)
  
  const podiumLayout = [
    { position: 2, height: '35vh', width: '20vw', rankText: '2ND PLACE' }, // index 1 -> 2nd
    { position: 1, height: '45vh', width: '22vw', rankText: '1ST PLACE' }, // index 0 -> 1st
    { position: 3, height: '25vh', width: '20vw', rankText: '3RD PLACE' }  // index 2 -> 3rd
  ];

  const getRowData = (position: number) => {
    return top3[position - 1];
  };

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center relative z-10 overflow-hidden font-sans bg-[#04060C] p-8">
      <BackgroundTexture />
      
      {/* Dynamic Ambient Accent Glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] rounded-full blur-[200px] mix-blend-screen opacity-[0.08] pointer-events-none z-0"
        style={{ backgroundColor: '#3b82f6' }}
      />

      {/* Main Glass Widget */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-[calc(100vw-80px)] h-[calc(100vh-60px)] flex flex-col relative z-10 bg-[#0a1229]/40 backdrop-blur-[50px] rounded-[48px] border border-[#2a4596]/40 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8),inset_0_-80px_120px_-40px_rgba(59,130,246,0.7),inset_0_80px_120px_-40px_rgba(59,130,246,0.5)] overflow-hidden"
      >
        {/* Inner grid */}
        <div 
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '60px 60px', backgroundPosition: 'center' }} 
        />

        {/* Header */}
        <div className="flex justify-between items-center w-full px-10 md:px-14 pt-10 pb-2 relative z-20">
          <span className="text-white/60 font-light tracking-wide text-sm md:text-base uppercase">{config.subtitle || "Data updated live"}</span>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3 bg-red-500/10 border border-red-500/30 px-4 py-2 rounded-full">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <span className="text-red-400 text-xs md:text-sm font-bold tracking-widest uppercase">Live Connected</span>
            </div>
            <div className="px-5 py-2 rounded-full bg-white/[0.04] border border-white/10 text-white/70 text-xs md:text-sm font-light uppercase">
              {config.title}
            </div>
          </div>
        </div>

        {/* Highlighted Program Title for Podium */}
        <div className="w-full flex justify-center items-center mt-4 relative z-20">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl md:text-6xl font-black text-white uppercase tracking-widest drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]"
          >
            {config.title === 'DAY 2 LEADERBOARD' ? 'DAY 2 HIGHLIGHTS' : config.title}
          </motion.h1>
        </div>

        {/* Podium Container */}
        <div className="flex-1 w-full flex items-end justify-center relative z-20 pb-20 px-10 gap-4 md:gap-8">
          
          {podiumLayout.map((block, idx) => {
            const rowData = getRowData(block.position);
            
            if (!rowData) {
              return (
                <div key={idx} style={{ width: block.width, height: block.height }} className="opacity-0" />
              );
            }

            const tColor = rowData.color || '#3b82f6';

            return (
              <motion.div 
                key={block.position}
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 + (block.position * 0.1), type: "spring" }}
                className="flex flex-col items-center justify-end relative"
                style={{ width: block.width }}
              >
                {/* Information above the block */}
                <div className="flex flex-col items-center justify-end w-full mb-6 relative">
                  {/* Name */}
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight text-center break-words max-w-full drop-shadow-lg mb-3">
                    {rowData.name}
                  </h2>
                  
                  {/* Team/Points Card */}
                  <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl px-6 py-3 flex flex-col items-center shadow-2xl">
                    <div className="flex items-center space-x-3 mb-1">
                      <div className="w-4 h-4 rounded-full shadow-lg" style={{ backgroundColor: tColor, boxShadow: `0 0 10px ${tColor}` }} />
                      {config.showColor && (
                        <span className="font-bold text-slate-300 tracking-widest text-sm uppercase">TEAM</span>
                      )}
                    </div>
                    {config.showPoints && (
                      <div className="text-4xl md:text-5xl font-black text-white drop-shadow-md">
                        {rowData.points} <span className="text-sm font-bold text-slate-400">PTS</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* The 3D Block */}
                <div 
                  className="w-full relative flex flex-col items-center"
                  style={{ height: block.height }}
                >
                  {/* Top Face of Block */}
                  <div 
                    className="absolute top-0 w-full h-8 -mt-4 bg-white/20 border border-white/30 skew-x-[-45deg] origin-bottom shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                    style={{ background: `linear-gradient(to right, rgba(255,255,255,0.1), rgba(255,255,255,0.3))` }}
                  />
                  
                  {/* Front Face of Block */}
                  <div 
                    className="w-full h-full flex flex-col items-center justify-start pt-8 border-t border-l border-white/20 rounded-t-sm"
                    style={{ 
                      background: `linear-gradient(135deg, ${tColor}40 0%, ${tColor}10 100%)`,
                      backdropFilter: 'blur(10px)',
                      boxShadow: `inset 0 20px 40px ${tColor}20, inset 0 1px 0 rgba(255,255,255,0.3), 0 20px 40px rgba(0,0,0,0.5)`
                    }}
                  >
                    <span className="text-6xl md:text-7xl lg:text-8xl font-black text-white/90 drop-shadow-xl" style={{ textShadow: `0 4px 20px ${tColor}` }}>
                      {block.position}
                    </span>
                    <span className="text-sm md:text-base font-black text-white/50 tracking-[0.2em] uppercase mt-2">
                      PLACE
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

      </motion.div>
    </div>
  );
}
