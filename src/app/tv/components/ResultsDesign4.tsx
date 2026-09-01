"use client";

import { motion } from 'motion/react';
import { IResult } from '@/types';

export default function ResultsDesign4({ results, revealStage = 'WINNER' }: { results: IResult[], revealStage?: 'PLACE' | 'WINNER' }) {
  if (!results || results.length === 0) return null;
  const program = results[0]?.programId as any;
  const programName = program?.name || 'Program';
  const position = results[0]?.position || 1;
  const posName = position === 1 ? '1ST PLACE' : position === 2 ? '2ND PLACE' : '3RD PLACE';
  const isArabic = (text?: string) => /[\u0600-\u06FF]/.test(text || '');

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] w-full bg-black justify-between items-center select-none text-white p-4 md:p-24 overflow-hidden relative space-y-4 md:space-y-0">
      
      <div className="flex flex-col justify-center w-full max-w-2xl z-10 border-l-4 border-emerald-500 pl-4 md:pl-16 shrink-0 mt-4 md:mt-0">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-emerald-500 font-bold tracking-[0.3em] uppercase text-sm md:text-2xl mb-2 md:mb-8">
            OFFICIAL RESULTS
          </div>
          <h2 className="text-2xl md:text-4xl font-light text-slate-300 uppercase mb-2 md:mb-4 leading-tight">{programName}</h2>
          <h1 className="text-[clamp(40px,7vw,96px)] font-black text-white tracking-tighter uppercase">{posName}</h1>
        </motion.div>
      </div>

      {revealStage === 'WINNER' && (
        <motion.div
          key="winners-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col flex-1 w-full justify-center items-start md:items-end max-w-4xl z-10 pl-0 md:pl-20 space-y-2 md:space-y-8 min-h-0"
        >
          {results.map((res, i) => {
            const teamName = (res.teamId as any)?.name;
            const sName = res.studentName ? res.studentName.replace(/\s*,\s*/g, ', ') : '';
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1, duration: 0.8 }}
                className="w-full bg-white/5 border border-white/10 rounded-[1.2rem] md:rounded-2xl p-4 md:p-8 flex items-center justify-between gap-4 backdrop-blur-md min-h-0"
              >
                <div className="flex flex-col min-w-0">
                  <h3 
                    dir={isArabic(sName) ? "rtl" : "ltr"}
                    className={`text-[clamp(24px,4.5vw,60px)] font-black uppercase text-white mb-2 md:mb-4 leading-[1.1] break-words min-w-0 max-w-full ${isArabic(sName) ? 'font-ge-ss-two' : ''}`}
                  >
                    {sName}
                  </h3>
                  <div 
                    dir={isArabic(teamName) ? "rtl" : "ltr"}
                    className={`flex items-start ${isArabic(teamName) ? 'flex-row-reverse space-x-reverse' : ''} space-x-4 w-full`}
                  >
                    <div className="w-3 h-3 md:w-6 md:h-6 mt-2 md:mt-3 rounded-full bg-emerald-500 shrink-0" />
                    <span 
                      className={`font-bold uppercase break-words min-w-0 max-w-full leading-[1.15] text-emerald-100 ${isArabic(teamName) ? 'font-ge-ss-two text-[clamp(20px,3.5vw,60px)]' : 'tracking-widest text-[clamp(18px,3vw,52px)]'}`}
                    >
                      {teamName || 'TEAM'}
                    </span>
                  </div>
                </div>
                
                <div className="text-right flex flex-col justify-center shrink-0">
                  <span className="text-[clamp(40px,7vw,72px)] font-black text-emerald-400 tabular-nums leading-none">{res.points}</span>
                  <span className="block text-sm md:text-xl text-emerald-700 font-bold uppercase tracking-widest mt-1 md:mt-2">PTS</span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
