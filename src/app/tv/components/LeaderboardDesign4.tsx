"use client";

import { motion } from 'motion/react';
import { LeaderboardConfig } from '@/types';

export default function LeaderboardDesign4({ config }: { config: LeaderboardConfig }) {
  const isArabic = (text?: string) => /[\u0600-\u06FF]/.test(text || '');
  const rows = config.rows.slice(0, 4);

  // We want a standard 2x2 grid. 
  // 1 2
  // 3 4
  const gridPositions = [
    { rank: 1, order: 0 }, // top-left
    { rank: 2, order: 1 }, // top-right
    { rank: 3, order: 2 }, // bottom-left
    { rank: 4, order: 3 }, // bottom-right
  ];

  // Re-order the rows to match the grid array visually, if we have 4 rows.
  // If we have less than 4, we just map them directly.
  const displayRows = gridPositions.map(pos => rows[pos.rank - 1]).filter(Boolean);

  return (
    <div className="w-screen h-screen flex flex-col items-center relative z-10 overflow-hidden font-sans bg-[#04060C] p-12">

      {/* Dark Premium Background with Soft Glows */}
      <div className="absolute inset-0 z-0 bg-[#04060C]">
        {/* Photograph Layer */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.15] blur-[4px] saturate-[0.8]"
          style={{ backgroundImage: `url('/images/leaderboard_bg.jpg')` }}
        />
        
        {/* Vignette & Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#04060C]/90 via-transparent to-[#04060C]/90" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#04060C_100%)]" />

        {/* Soft Glows */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-900/20 blur-[120px]" />
      </div>

      {/* Header aligned left */}
      <div className="w-full flex flex-col items-start text-left relative z-20 mb-16 mt-8 px-10 md:px-20">
        <span className="text-white/50 font-light tracking-[0.3em] text-sm uppercase mb-2">
          OVERALL TEAM RANKINGS
        </span>
        <motion.h1
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-black text-white uppercase tracking-widest drop-shadow-md"
        >
          AL MAHSAN
        </motion.h1>
      </div>

      {/* 2x2 Grid Container */}
      <div className="relative z-20 w-full max-w-6xl px-6 md:px-12 flex-1 flex flex-col items-center justify-center">

        {/* Background Dotted Line Connections (visible only if enough items) */}
        {rows.length > 1 && (
          <div className="absolute inset-0 pointer-events-none z-0 hidden md:block">
            <svg className="w-full h-full" preserveAspectRatio="xMidYMid meet">
              <path
                d="M 25% 25% L 75% 25% M 25% 75% L 75% 75%"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="3"
                strokeDasharray="10 15"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}

        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-x-8 md:gap-x-32 gap-y-12 md:gap-y-24 relative z-10">
          {displayRows.map((row, idx) => {
            const tColor = row.color || '#3b82f6';

            return (
              <motion.div
                key={row.id}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + (idx * 0.15) }}
                className="flex items-start relative w-full h-48"
              >
                {/* The Floating Rank Badge (01, 02...) */}
                <div
                  className="absolute -top-6 -left-6 w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl z-20"
                  style={{
                    background: `linear-gradient(135deg, ${tColor}, ${tColor}80)`,
                    boxShadow: `0 10px 30px -10px ${tColor}`
                  }}
                >
                  <span className="text-3xl font-black text-white drop-shadow-md">
                    {String(row.rank).padStart(2, '0')}
                  </span>
                </div>

                {/* The Glass Card */}
                <div
                  className="w-full h-full ml-6 bg-white/[0.03] backdrop-blur-2xl rounded-3xl border border-white/10 p-8 pl-16 flex flex-col justify-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
                >
                  {/* Frosted Inner corner glow */}
                  <div
                    className="absolute -top-20 -left-20 w-40 h-40 rounded-full blur-[40px] opacity-20 pointer-events-none"
                    style={{ backgroundColor: tColor }}
                  />

                  <h2 className={`text-2xl lg:text-4xl font-black text-white uppercase tracking-wider mb-2 truncate ${isArabic(row.name) ? 'font-ge-ss-two' : ''}`}>
                    {row.name}
                  </h2>
                  <div className="flex items-end space-x-2">
                    <span className="text-5xl lg:text-6xl font-black text-white drop-shadow-sm">
                      {row.points}
                    </span>
                    <span className="text-lg font-bold text-white/40 uppercase mb-2">PTS</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>



    </div>
  );
}
