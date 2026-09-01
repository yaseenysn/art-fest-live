"use client";

import { motion } from 'motion/react';
import { IResult } from '@/types';

const getMedalTheme = (position: number) => {
  switch (position) {
    case 1:
      return {
        name: 'GOLD',
        bodyGrad: 'from-[#FFD700] via-[#FDB931] to-[#9F7928]',
        ringGrad: 'border-[#FFD700]',
        ribbonGrad: 'from-[#D4AF37] via-[#FDF5E6] to-[#AA8A27]',
        textGrad: 'text-amber-300',
        glow: 'rgba(255,215,0,0.4)',
        shadow: 'shadow-[0_25px_50px_rgba(255,215,0,0.3)]',
      };
    case 2:
      return {
        name: 'SILVER',
        bodyGrad: 'from-[#F8F9FA] via-[#E2E8F0] to-[#94A3B8]',
        ringGrad: 'border-[#E2E8F0]',
        ribbonGrad: 'from-[#94A3B8] via-[#F8F9FA] to-[#64748B]',
        textGrad: 'text-slate-200',
        glow: 'rgba(226,232,240,0.4)',
        shadow: 'shadow-[0_25px_50px_rgba(226,232,240,0.2)]',
      };
    case 3:
      return {
        name: 'BRONZE',
        bodyGrad: 'from-[#FDBA74] via-[#D97706] to-[#78350F]',
        ringGrad: 'border-[#D97706]',
        ribbonGrad: 'from-[#B45309] via-[#FDE68A] to-[#78350F]',
        textGrad: 'text-orange-300',
        glow: 'rgba(217,119,6,0.4)',
        shadow: 'shadow-[0_25px_50px_rgba(217,119,6,0.3)]',
      };
    default:
      return {
        name: 'AWARD',
        bodyGrad: 'from-blue-300 via-blue-500 to-indigo-700',
        ringGrad: 'border-blue-400',
        ribbonGrad: 'from-blue-700 via-white to-blue-800',
        textGrad: 'text-blue-400',
        glow: 'rgba(59,130,246,0.3)',
        shadow: 'shadow-[0_25px_50px_rgba(59,130,246,0.3)]',
      };
  }
};

const getPositionText = (pos: number) => {
  if (pos === 1) return '1ST PLACE';
  if (pos === 2) return '2ND PLACE';
  if (pos === 3) return '3RD PLACE';
  return `${pos}TH PLACE`;
};

interface Theme {
  name: string;
  bodyGrad: string;
  ringGrad: string;
  ribbonGrad: string;
  textGrad: string;
  glow: string;
  shadow: string;
}

export default function ResultsDesign1({ results, revealStage = 'WINNER' }: { results: IResult[], revealStage?: 'PLACE' | 'WINNER' }) {
  if (!results || results.length === 0) return null;

  const firstResult = results[0];
  const program = firstResult.programId as { name: string, language?: string, category?: string };
  const programName = program?.name || 'Program';
  const position = firstResult.position || 1;
  const points = firstResult.points || 0;

  const theme = getMedalTheme(position);
  const positionText = getPositionText(position);
  const numWinners = results.length;

  const programLanguage = program?.language && program.language.toLowerCase() !== 'other'
    ? program.language
    : (program?.language || 'OTHER');

  const gridClass = numWinners === 1
    ? 'grid-cols-1'
    : numWinners === 2
      ? 'grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl'
      : numWinners === 3
        ? 'grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-[90%]'
        : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-[95%]';

  const tColor = (firstResult.teamId as { color?: string })?.color || theme.glow;

  return (
    <div className="h-full w-full flex flex-col justify-center items-center z-10 px-8 py-10 relative overflow-hidden bg-[#050A18]">

      {/* Background Atmosphere */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <motion.div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[60%] rounded-full blur-[120px]"
          style={{ background: `radial-gradient(circle, ${tColor}, transparent 70%)`, opacity: 0.5 }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.5, scale: 1 }}
          transition={{ duration: 1.5 }}
        />
        <div className="absolute bottom-0 left-0 w-full h-[50%] bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />
      </div>

      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
        {numWinners === 1 ? (
          /* Single Winner Layout: Side by side */
          <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-[95%] md:max-w-[85%] mx-auto space-y-8 md:space-y-0 md:space-x-20">
            {/* Left: Medal */}
            <motion.div
              initial={{ opacity: 0, x: -40, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8, type: "spring", stiffness: 80 }}
              className="flex-1 flex items-center justify-center max-w-md"
            >
              <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-[400px] lg:h-[400px] flex flex-col items-center justify-center">
                {/* Ribbon */}
                <div className={`absolute -top-16 w-16 h-32 bg-gradient-to-b ${theme.ribbonGrad} shadow-2xl transform -rotate-12 -translate-x-8 origin-bottom-right z-0`} />
                <div className={`absolute -top-16 w-16 h-32 bg-gradient-to-b ${theme.ribbonGrad} shadow-2xl transform rotate-12 translate-x-8 origin-bottom-left z-0`} />

                {/* Medal Body */}
                <div
                  className={`relative z-10 w-full h-full rounded-full bg-gradient-to-br ${theme.bodyGrad} border-[12px] md:border-[16px] ${theme.ringGrad} ${theme.shadow} flex flex-col items-center justify-center`}
                  style={{ boxShadow: `0 30px 60px ${theme.glow}, inset 0 0 60px rgba(255,255,255,0.5)` }}
                >
                  <div className="absolute inset-2 rounded-full border-4 md:border-8 border-white/20" />
                  <span className="text-[6rem] md:text-[8rem] lg:text-[10rem] font-black leading-none text-white drop-shadow-xl mt-4">
                    {position}
                  </span>
                  <span className="text-xl md:text-2xl lg:text-3xl font-black uppercase tracking-widest text-white/90 drop-shadow-md -mt-2">
                    PLACE
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Right: Winner Card */}
            <div className="flex-[1.2] w-full min-w-0 flex items-center justify-center">
              {revealStage === 'WINNER' && (
                <motion.div
                  key="single-winner"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, type: "spring", stiffness: 80 }}
                  className="w-full h-full"
                >
                  <WinnerCard
                    result={firstResult}
                    teamColor={(firstResult.teamId as { color?: string })?.color}
                    teamName={(firstResult.teamId as { name?: string })?.name}
                    programName={programName}
                    programLanguage={programLanguage}
                    category={program?.category}
                    points={points}
                    theme={theme}
                    isLarge
                  />
                </motion.div>
              )}
            </div>
          </div>
        ) : (
          /* Multiple Winners Layout: Medal top, Cards below */
          <div className="flex flex-col items-center justify-center w-full h-full space-y-12">
            <motion.div
              initial={{ opacity: 0, y: -40, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
              className="flex items-center justify-center mb-8"
            >
              <div className="relative w-48 h-48 md:w-56 md:h-56 flex flex-col items-center justify-center">
                <div className={`absolute -top-10 w-10 h-20 bg-gradient-to-b ${theme.ribbonGrad} shadow-lg transform -rotate-12 -translate-x-5 origin-bottom-right z-0`} />
                <div className={`absolute -top-10 w-10 h-20 bg-gradient-to-b ${theme.ribbonGrad} shadow-lg transform rotate-12 translate-x-5 origin-bottom-left z-0`} />

                <div
                  className={`relative z-10 w-full h-full rounded-full bg-gradient-to-br ${theme.bodyGrad} border-8 ${theme.ringGrad} ${theme.shadow} flex flex-col items-center justify-center`}
                  style={{ boxShadow: `0 20px 40px ${theme.glow}, inset 0 0 30px rgba(255,255,255,0.4)` }}
                >
                  <div className="absolute inset-2 rounded-full border-4 border-white/20" />
                  <span className="text-[4rem] md:text-[5rem] font-black leading-none text-white drop-shadow-lg mt-2">
                    {position}
                  </span>
                  <span className="text-lg md:text-xl font-black uppercase tracking-widest text-white/90 drop-shadow-md -mt-1">
                    PLACE
                  </span>
                </div>
              </div>
            </motion.div>

            {revealStage === 'WINNER' && (
              <motion.div
                className={`grid ${gridClass} justify-center items-stretch w-full`}
                initial="hidden"
                animate="visible"
                variants={{
                  visible: { transition: { staggerChildren: 0.15 } }
                }}
              >
                {results.map((result, idx) => (
                  <motion.div
                    key={String(result._id || idx)}
                    variants={{
                      hidden: { opacity: 0, y: 30 },
                      visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
                    }}
                    className="w-full flex"
                  >
                    <WinnerCard
                      result={result}
                      teamColor={(result.teamId as { color?: string })?.color}
                      teamName={(result.teamId as { name?: string })?.name}
                      programName={programName}
                      programLanguage={programLanguage}
                      category={program?.category}
                      points={points}
                      theme={theme}
                      isLarge={false}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface WinnerCardProps {
  result: IResult;
  teamColor?: string;
  teamName?: string;
  programName: string;
  programLanguage: string;
  category?: string;
  points: number;
  theme: Theme;
  isLarge: boolean;
}

const isArabic = (text?: string) => /[\u0600-\u06FF]/.test(text || '');

function WinnerCard({ result, teamColor, teamName, programName, programLanguage, category, points, theme, isLarge }: WinnerCardProps) {
  const tColor = teamColor || '#3b82f6';

  return (
    <div
      className="flex flex-col w-full h-full bg-white/[0.04] backdrop-blur-[30px] rounded-[32px] md:rounded-[40px] relative overflow-hidden"
      style={{
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.2), 0 20px 40px rgba(0,0,0,0.5), 0 0 40px rgba(255,255,255,0.02)`,
        padding: isLarge ? '3rem 3rem' : '2rem 2rem',
      }}
    >
      {/* Subtle outer reflection */}
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-gradient-to-bl from-white/[0.05] to-transparent pointer-events-none rounded-bl-full" />

      {/* Winner Name */}
      <h2
        className={`font-black text-white uppercase tracking-tight leading-tight drop-shadow-md break-words max-w-full ${isLarge ? 'text-[clamp(32px,5vw,72px)] mb-6' : 'text-[clamp(24px,4vw,48px)] mb-4'}`}
      >
        {result.studentName}
      </h2>

      {/* Team Info */}
      <div 
        dir={isArabic(teamName) ? 'rtl' : 'ltr'}
        className={`flex items-start ${isArabic(teamName) ? 'flex-row-reverse space-x-reverse' : ''} space-x-3 md:space-x-4 mb-6`}
      >
        <div className={`mt-2 shrink-0 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.2)] ${isLarge ? 'w-5 h-5 md:w-6 md:h-6' : 'w-4 h-4 md:w-5 md:h-5'}`} style={{ backgroundColor: tColor }} />
        <span 
          className={`font-bold uppercase break-words min-w-0 max-w-full leading-[1.2] text-slate-200 ${isArabic(teamName) ? 'font-ge-ss-two' : 'tracking-widest'} ${isLarge ? 'text-[clamp(32px,4vw,60px)]' : 'text-[clamp(24px,3vw,40px)]'}`}
        >
          {teamName || 'TEAM'}
        </span>
      </div>

      {/* Points */}
      <div className="mt-2 mb-6">
        <span className={`font-black tabular-nums drop-shadow-xl ${theme.textGrad} ${isLarge ? 'text-[4rem] md:text-[5rem] leading-none' : 'text-4xl md:text-5xl leading-none'}`}>
          {points}
        </span>
        <span className={`font-semibold text-slate-400 tracking-widest ml-3 ${isLarge ? 'text-2xl' : 'text-xl'}`}>PTS</span>
      </div>

      <div className="flex-grow" />

      {/* Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent my-6 md:my-8" />

      {/* Program Info */}
      <div className="flex flex-col space-y-1 relative px-6 md:px-8 py-2 md:py-3 -mx-4 md:-mx-6 bg-white/[0.02] rounded-2xl border border-white/[0.05]">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-3/4 bg-gradient-to-b from-transparent via-white/50 to-transparent rounded-full shadow-[0_0_10px_rgba(255,255,255,0.3)]" />
        <div className={`font-black uppercase tracking-wider text-white drop-shadow-md ${isLarge ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl'}`}>
          {programName}
        </div>
        <div className={`font-bold uppercase tracking-[0.25em] text-slate-300 ${isLarge ? 'text-sm md:text-base' : 'text-[10px] md:text-sm'}`}>
          {programLanguage} • {category || 'GENERAL'}
        </div>
      </div>
    </div>
  );
}
