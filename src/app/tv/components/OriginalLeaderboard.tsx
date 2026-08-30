"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LeaderboardConfig, EVENT_NAME } from '@/types';

const OriginalLeaderboard = React.memo(function OriginalLeaderboard({ config }: { config?: LeaderboardConfig }) {
  const rows = config?.rows || [];
  const [page, setPage] = useState(0);
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const maxItemsPerPage = 5;
  const totalPages = Math.ceil((rows?.length || 0) / maxItemsPerPage);

  const rowsRef = React.useRef(rows);
  React.useEffect(() => {
    rowsRef.current = rows;
  }, [rows]);

  useEffect(() => {
    const currentRows = rowsRef.current;
    if (currentRows && currentRows.length > 0) {
      if (!activeTeamId || !currentRows.find(r => r.id === activeTeamId)) {
        setActiveTeamId(currentRows[0].id);
      }
    } else {
      setActiveTeamId(null);
    }
  }, [rows.length, activeTeamId]); // Only run if the number of rows changes, or activeTeamId changes (to check validity)

  // Automatic rotation through ALL rankings
  useEffect(() => {
    if (rows.length === 0 || isHovered) return;

    const interval = setInterval(() => {
      setActiveTeamId(currentId => {
        const currentRows = rowsRef.current;
        if (currentRows.length === 0) return null;
        if (!currentId) return currentRows[0].id;
        const currentIndex = currentRows.findIndex(r => r.id === currentId);
        const nextIndex = (currentIndex + 1) % currentRows.length;
        return currentRows[nextIndex].id;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [rows.length, isHovered]);

  // Sync page with activeTeamId so the active row is always visible
  useEffect(() => {
    const currentRows = rowsRef.current;
    if (!activeTeamId || currentRows.length === 0) return;

    const activeIndex = currentRows.findIndex(r => r.id === activeTeamId);

    if (activeIndex !== -1) {
      const expectedPage = Math.floor(activeIndex / maxItemsPerPage);

      if (expectedPage !== page) {
        setPage(expectedPage);
      }
    }
  }, [activeTeamId, page]); // Intentionally omitting `rows` reference to avoid jumping on score updates

  if (!config) return null;

  const handleMouseEnter = (id: string) => {
    setActiveTeamId(id);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const activeRow = rows.find(r => r.id === activeTeamId) || rows[0];
  const activeColor = activeRow?.color || '#3b82f6';

  const visibleRows = rows.slice(
    page * maxItemsPerPage,
    (page + 1) * maxItemsPerPage
  );

  // Math for the wavy line connected to the active team
  const activeIndexInPage = visibleRows.findIndex(
    r => r.id === activeTeamId
  );

  const targetY =
    activeIndexInPage !== -1
      ? 75 + (activeIndexInPage * 90)
      : 150;

  const pathData = `M-100,300 C200,300 350,${targetY} 500,${targetY} C650,${targetY} 800,300 1100,300`;

  return (
    <div
      className="w-screen h-screen flex flex-col items-center justify-center relative z-10 overflow-hidden font-sans bg-[#04060C] p-4 md:p-8"
      onMouseLeave={handleMouseLeave}
    >
      <MemoizedBackgroundTexture />

      {/* Dynamic Ambient Accent Glow */}
      <motion.div
        animate={{ backgroundColor: activeColor }}
        transition={{ duration: 1 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] rounded-full blur-[200px] mix-blend-screen opacity-[0.08] pointer-events-none z-0"
      />

      {/* Main Glass Widget */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full h-full md:w-[calc(100vw-80px)] md:h-[calc(100vh-60px)] flex flex-col relative z-10 bg-[#0a1229]/40 backdrop-blur-[50px] rounded-3xl md:rounded-[48px] border border-[#2a4596]/40 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8),inset_0_-80px_120px_-40px_rgba(59,130,246,0.7),inset_0_80px_120px_-40px_rgba(59,130,246,0.5)] overflow-hidden"
      >

        {/* Inner subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            backgroundPosition: 'center'
          }}
        />

        {/* Dynamic Internal Glow */}
        <motion.div
          animate={{ backgroundColor: activeColor }}
          transition={{ duration: 1 }}
          className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-[100px] mix-blend-screen opacity-20 pointer-events-none z-0"
        />

        {/* Header */}
        <div className="flex justify-between items-center w-full px-10 md:px-14 pt-10 pb-2 relative z-20">
          <span className="text-white/60 font-light tracking-wide text-sm md:text-base">
            {"AL MAHSAN"}
          </span>

        </div>

        {/* Glowing Wavy Line Chart (Fake Glow via thick stroke) */}
        <div
          className="absolute top-[20%] left-0 w-full h-[300px] pointer-events-none z-10"
        >
          <svg
            className="w-full h-full"
            viewBox="0 0 1000 400"
            preserveAspectRatio="none"
          >
            {/* Fake Glow Path */}
            <motion.path
              d={pathData}
              fill="none"
              stroke={activeColor}
              strokeWidth="15"
              strokeDasharray="10 10"
              opacity={0.15}
              animate={{
                d: pathData,
                stroke: activeColor
              }}
              transition={{
                duration: 1,
                type: "spring",
                bounce: 0
              }}
            />
            {/* Main Path */}
            <motion.path
              d={pathData}
              fill="none"
              stroke={activeColor}
              strokeWidth="3"
              strokeDasharray="10 10"
              opacity={0.5}
              animate={{
                d: pathData,
                stroke: activeColor
              }}
              transition={{
                duration: 1,
                type: "spring",
                bounce: 0
              }}
            />
          </svg>
        </div>

        <div className="flex-1 flex flex-col md:flex-row w-full h-full relative z-20">

          {/* Left Hero Data */}
          <div className="flex-1 p-6 md:p-14 flex flex-col justify-center border-b md:border-b-0 md:border-r border-white/5 relative">

            <AnimatePresence mode="popLayout">
              <motion.div
                key={activeRow?.id}
                initial={{
                  opacity: 0,
                  y: 20
                }}
                animate={{
                  opacity: 1,
                  y: 0
                }}
                exit={{
                  opacity: 0,
                  y: -20,
                  position: 'absolute'
                }}
                transition={{ duration: 0.5 }}
                className="flex flex-col h-full justify-center w-full"
              >

                <div className="flex items-center space-x-4 mb-4">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg border border-white/10"
                    style={{
                      backgroundColor: activeColor,
                      boxShadow: `0 10px 30px -10px ${activeColor}`
                    }}
                  >
                    {activeRow?.rank}
                  </div>

                  <span className="text-white/40 tracking-[0.2em] uppercase text-sm font-bold">
                    Current Rank
                  </span>
                </div>

                <h2 className="text-[clamp(32px,6vw,96px)] font-black text-white uppercase tracking-tighter leading-tight mb-6 drop-shadow-lg break-words">
                  {activeRow?.name}
                </h2>

                <div className="mt-auto">
                  <div className="text-white/40 uppercase tracking-[0.2em] text-sm mb-2">
                    Total Score
                  </div>

                  <div className="flex items-baseline space-x-3">
                    <span className="text-7xl md:text-8xl font-black text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                      {activeRow?.points}
                    </span>

                    <span className="text-2xl font-light text-white/50">
                      PTS
                    </span>
                  </div>
                </div>

              </motion.div>
            </AnimatePresence>

          </div>

          {/* Right Ranking List — LARGE BACKGROUND BOX REMOVED */}
          <div className="w-full md:w-[45%] lg:w-[40%] flex flex-col relative">

            <div className="flex-1 overflow-hidden p-6 md:p-10 flex flex-col justify-center">

              <AnimatePresence mode="wait">
                <motion.div
                  key={page}
                  initial={{
                    opacity: 0,
                    x: 20
                  }}
                  animate={{
                    opacity: 1,
                    x: 0
                  }}
                  exit={{
                    opacity: 0,
                    x: -20
                  }}
                  transition={{ duration: 0.4 }}
                  className="space-y-4"
                >

                  {visibleRows.map((row) => {

                    const isActive = activeTeamId === row.id;
                    const rColor = row.color || '#3b82f6';

                    return (
                      <motion.div
                        key={row.id}
                        onMouseEnter={() => handleMouseEnter(row.id as string)}
                        initial={false}
                        animate={{
                          backgroundColor: isActive ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.02)',
                          borderColor: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)',
                          scale: isActive ? 1.05 : 1
                        }}
                        transition={{ duration: 0.5 }}
                        className={`group cursor-pointer relative overflow-hidden flex items-center justify-between p-5 md:p-6 rounded-2xl border`}
                      >

                        {/* GPU-Friendly Shadow (Opacity Fade) */}
                        <motion.div
                          initial={false}
                          animate={{ opacity: isActive ? 1 : 0 }}
                          transition={{ duration: 0.5 }}
                          className="absolute inset-0 pointer-events-none rounded-2xl"
                          style={{
                            boxShadow: `0 20px 40px -10px rgba(0,0,0,0.5), inset 0 0 20px ${rColor}30`
                          }}
                        />

                        {/* Active Indicator Bar */}
                        <motion.div
                          initial={false}
                          animate={{ 
                            opacity: isActive ? 1 : 0,
                            scaleY: isActive ? 1 : 0.8
                          }}
                          transition={{ duration: 0.3 }}
                          className="absolute left-0 top-0 bottom-0 w-1.5 origin-center"
                          style={{ backgroundColor: rColor }}
                        />

                        <div className="flex items-center space-x-5 md:space-x-6 relative z-10">

                          <span
                            className={`text-[clamp(18px,3vw,30px)] md:text-3xl font-black truncate max-w-[150px] md:max-w-[300px] ${isActive
                              ? 'text-white'
                              : 'text-white/40'
                              }`}
                          >
                            {String(row.rank).padStart(2, '0')}
                          </span>

                          <div className="flex flex-col">

                            <span
                              className={`text-xl md:text-2xl font-bold uppercase tracking-wide transition-colors ${isActive
                                ? 'text-white'
                                : 'text-white/70 group-hover:text-white'
                                }`}
                            >
                              {row.name}
                            </span>

                            {config.showColor && (
                              <div className="flex items-center space-x-2 mt-1">

                                <span
                                  className="w-2 h-2 rounded-full"
                                  style={{
                                    backgroundColor: rColor,
                                    boxShadow: `0 0 8px ${rColor}`
                                  }}
                                />

                                <span className="text-[10px] text-white/40 uppercase tracking-widest">
                                  Team Color
                                </span>

                              </div>
                            )}

                          </div>
                        </div>

                        {config.showPoints && (
                          <div className="text-right relative z-10 flex items-baseline space-x-1">

                            <span
                              className={`text-3xl md:text-5xl font-black ${isActive
                                ? 'text-white'
                                : 'text-white/40'
                                }`}
                            >
                              {row.points}
                            </span>

                          </div>
                        )}

                      </motion.div>
                    );
                  })}

                </motion.div>
              </AnimatePresence>

            </div>

            {/* Pagination / Controls */}
            {totalPages > 1 && (
              <div className="h-16 border-t border-white/5 flex items-center justify-between px-8 bg-black/20">

                <span className="text-white/40 text-xs font-bold uppercase tracking-widest">
                  Page {page + 1} of {totalPages}
                </span>

                <div className="flex space-x-2">

                  <button
                    onClick={() => {
                      setPage(p => Math.max(0, p - 1));
                      setIsHovered(true);
                    }}
                    disabled={page === 0}
                    className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-white/5 transition-colors"
                  >
                    ←
                  </button>

                  <button
                    onClick={() => {
                      setPage(p =>
                        Math.min(totalPages - 1, p + 1)
                      );
                      setIsHovered(true);
                    }}
                    disabled={page === totalPages - 1}
                    className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-white/5 transition-colors"
                  >
                    →
                  </button>

                </div>
              </div>
            )}

          </div>

        </div>

      </motion.div>
    </div>
  );
});

export default OriginalLeaderboard;

// Reusable Background Texture
const BackgroundTexture = () => (
  <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay z-0">
    <svg width="100%" height="100%">
      <filter id="noise">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.8"
          numOctaves="4"
          stitchTiles="stitch"
        />
      </filter>

      <rect
        width="100%"
        height="100%"
        filter="url(#noise)"
      />
    </svg>
  </div>
);

const MemoizedBackgroundTexture = React.memo(BackgroundTexture);