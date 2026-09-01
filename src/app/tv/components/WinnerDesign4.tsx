"use client";
import React from 'react';
import { motion } from 'motion/react';
import { AllWinnersConfig } from './AllWinnersRouter';

export default function WinnerDesign4({
  programName,
  language,
  category,
  eventName = 'AL MAHSAN',
  eventYear,
  winnersByPosition,
  id = 'winner-design-4'
}: AllWinnersConfig) {

  const positions = [1, 2, 3] as const;
  const isArabic = (text?: string) => /[\u0600-\u06FF]/.test(text || '');

  return (
    <div
      id={id}
      className="flex flex-col md:flex-row relative overflow-hidden bg-[#0a0a0c] font-sans select-none text-white h-[100dvh] w-full min-h-0"
    >
      {/* Background grain */}
      <div className="absolute inset-0 z-0 opacity-20 mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.95%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />

      {/* Vertical subtle grid lines */}
      <div className="absolute inset-0 flex justify-between px-[100px] pointer-events-none opacity-5">
        <div className="w-[1px] h-full bg-white" />
        <div className="w-[1px] h-full bg-white" />
        <div className="w-[1px] h-full bg-white" />
        <div className="w-[1px] h-full bg-white" />
        <div className="w-[1px] h-full bg-white" />
      </div>

      {/* Left Typography Column */}
      <div className="w-full md:w-[35%] h-auto md:h-full p-4 md:p-20 flex flex-col justify-between relative z-10 border-b md:border-b-0 md:border-r border-white/10 shrink-0">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1 }}>
          <div className="text-white/40 tracking-[0.3em] font-medium text-[12px] md:text-[16px] uppercase mb-4 md:mb-12">
            {eventName} {eventYear}
          </div>
          <h1 className="font-light text-[clamp(24px,5vw,50px)] leading-[0.9] tracking-tighter uppercase break-words">
            CONGRAGULATION<br />
            <span className="font-black">WINNERS</span>
          </h1>
          <div className="w-[30px] md:w-[50px] h-[3px] md:h-[4px] bg-white mt-4 mb-4 md:mt-12 md:mb-12" />
          <h2 className="font-black text-[clamp(28px,5.5vw,64px)] tracking-tight uppercase leading-tight text-[#d4af37] break-words">
            {programName}
          </h2>
          <div className="text-white/50 tracking-[0.2em] font-medium text-[18px] uppercase mt-4">
            {language} • {category}
          </div>
        </motion.div>

        <div className="hidden md:block text-white/20 tracking-[0.5em] font-bold text-[14px] uppercase transform -rotate-90 origin-bottom-left absolute bottom-20 left-20 w-[600px]">
          OFFICIAL RESULTS
        </div>
      </div>

      {/* Right Content Column */}
      <div className="w-full md:w-[65%] h-auto md:h-full p-4 md:p-20 flex flex-col justify-center relative z-10 min-h-0">
        <div className="flex flex-col space-y-0 w-full max-w-[1000px] ml-auto">
          {positions.map((pos, idx) => {
            const winners = winnersByPosition[pos] || [];
            if (winners.length === 0) return null;

            const isFirst = pos === 1;
            const tColor = winners[0]?.teamColor || '#ffffff';
            const names = winners.map(w => w.studentName).filter(Boolean).join("  •  ");
            const teams = Array.from(new Set(winners.map(w => w.teamName).filter(Boolean)));
            const teamStr = teams.length > 0 ? teams.join("  •  ") : "TEAM";
            const pts = winners.map(w => w.points).filter(p => p !== undefined);
            const ptsStr = pts.length > 0 ? pts.join(" • ") : undefined;

            return (
              <motion.div
                key={pos}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 + (idx * 0.1), ease: [0.16, 1, 0.3, 1] }}
                className="w-full flex items-center justify-between py-4 md:py-10 border-b border-white/10 group relative min-h-0 gap-2"
              >
                {/* Hover accent - though for TV it's static, gives a nice visual grounding */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-0 group-hover:h-[60%] transition-all duration-500" style={{ backgroundColor: tColor }} />

                <div className="flex items-center space-x-3 md:space-x-12 min-w-0">
                  <div className={`font-light tabular-nums shrink-0 ${isFirst ? 'text-[32px] md:text-[80px] text-white' : 'text-[24px] md:text-[60px] text-white/40'}`}>
                    0{pos}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <h3 
                      dir={isArabic(names) ? "rtl" : "ltr"}
                      className={`uppercase tracking-wide leading-[1.1] mb-1 md:mb-3 break-words min-w-0 max-w-full ${isArabic(names) ? 'font-ge-ss-two' : ''} ${isFirst ? 'font-black text-[clamp(24px,3.5vw,52px)]' : 'font-bold text-[clamp(20px,3vw,40px)] text-white/90'}`}
                    >
                      {names}
                    </h3>
                    <div 
                      dir={isArabic(teamStr) ? "rtl" : "ltr"}
                      className={`flex items-start ${isArabic(teamStr) ? 'flex-row-reverse space-x-reverse' : ''} space-x-2 md:space-x-4`}
                    >
                      <div className="w-2 h-2 md:w-4 md:h-4 mt-2 md:mt-3 rounded-full shrink-0" style={{ backgroundColor: tColor, boxShadow: `0 0 10px ${tColor}` }} />
                      <span 
                        className={`uppercase font-bold break-words min-w-0 max-w-full leading-[1.2] text-white/80 ${isArabic(teamStr) ? 'font-ge-ss-two' : 'tracking-widest'} ${isFirst ? 'text-[clamp(18px,3vw,46px)]' : 'text-[clamp(16px,2.5vw,36px)]'}`}
                      >
                        {teamStr}
                      </span>
                    </div>
                  </div>
                </div>

                {ptsStr !== undefined && (
                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-white/30 tracking-[0.2em] font-medium text-[10px] md:text-[12px] uppercase mb-1">PTS</span>
                    <span className={`tabular-nums leading-none ${isFirst ? 'font-black text-[40px] md:text-[64px]' : 'font-bold text-[32px] md:text-[48px] text-white/60'}`}>
                      {ptsStr}
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
