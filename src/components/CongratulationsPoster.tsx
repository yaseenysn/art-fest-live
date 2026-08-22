import React from 'react';

export interface CongratulationsPosterProps {
  studentName: string;
  teamName: string;
  teamColor: string;
  position: string;
  programName: string;
  eventName: string;
  eventYear?: string;
  id?: string;
  points?: number;
}

export default function CongratulationsPoster({
  studentName,
  teamName,
  teamColor,
  position,
  programName,
  eventName = 'AL MAHSAN',
  eventYear,
  id = 'poster-node',
  points,
}: CongratulationsPosterProps) {
  
  // Extract number from position string (e.g. "🥇 FIRST PLACE" -> "1")
  let posNum = '1';
  const posUpper = position.toUpperCase();
  if (posUpper.includes('SECOND') || posUpper.includes('2ND') || posUpper === '2') posNum = '2';
  else if (posUpper.includes('THIRD') || posUpper.includes('3RD') || posUpper === '3') posNum = '3';

  // Support multiple winners passed in a single string (e.g. "Winner A, Winner B")
  const winnersList = studentName.split(',').map(name => name.trim()).filter(Boolean);
  if (winnersList.length === 0) winnersList.push('UNKNOWN');

  const tColor = teamColor || '#3b82f6';

  return (
    <div 
      id={id}
      className="h-full w-full flex flex-col justify-between px-20 py-16 relative overflow-hidden bg-[#020617] font-sans select-none"
      style={{ width: '1920px', height: '1080px', fontFamily: 'sans-serif' }}
    >
      
      {/* Cinematic Atmospheric Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Core glows */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[70%] bg-blue-600/40 rounded-full blur-[140px]" />
        <div className="absolute top-[10%] right-[10%] w-[50%] h-[60%] bg-violet-600/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[50%] bg-indigo-500/20 rounded-full blur-[100px]" />
        
        {/* Subtle noise texture */}
        <div 
          className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} 
        />
      </div>

      {/* Top Header / Branding */}
      <div className="flex justify-between items-start z-10 w-full">
        <div className="flex flex-col text-left space-y-2">
          <p className="text-white/70 font-bold tracking-[0.25em] uppercase text-xl drop-shadow-sm">
            {eventName} {eventYear}
          </p>
          <h2 className="text-white font-black tracking-widest text-4xl uppercase drop-shadow-md">
            {programName}
          </h2>
          <p className="text-white/60 font-bold tracking-[0.2em] text-lg uppercase pt-1">
            AL MAHSAN OFFICIAL RESULT
          </p>
        </div>
        <div className="w-24 h-24 rounded-full border border-white/20 flex items-center justify-center bg-white/5 backdrop-blur-md shadow-lg">
          <span className="text-white/40 text-sm tracking-widest font-black uppercase">LOGO</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full flex relative z-10 items-center justify-start mt-8">
        
        {/* Left Side: Title & Results */}
        <div className="w-full max-w-[65%] flex flex-col items-start justify-center pr-10">
          
          <div className="mb-16 flex flex-col">
            <h1 
              className="text-[6rem] text-white/90 drop-shadow-md ml-2" 
              style={{ fontFamily: '"Brush Script MT", "Dancing Script", cursive', fontWeight: 300, letterSpacing: '0.05em' }}
            >
              {posNum}{posNum === '1' ? 'st' : posNum === '2' ? 'nd' : posNum === '3' ? 'rd' : 'th'}
            </h1>
            <h1 className="text-[8rem] leading-[0.85] font-black uppercase text-white tracking-tighter drop-shadow-2xl">
              PLACE
            </h1>
          </div>
          
          {/* Result Capsules */}
          <div className="w-full flex flex-col space-y-8">
            {winnersList.map((winnerName, idx) => (
              <div
                key={idx}
                className="w-full flex items-center px-8 py-6 rounded-full relative overflow-hidden"
                style={{
                  background: 'rgba(50, 80, 255, 0.12)',
                  backdropFilter: 'blur(20px)',
                  border: '1.5px solid rgba(255, 255, 255, 0.15)',
                  boxShadow: `0 15px 35px rgba(0,0,0,0.4), inset 0 2px 10px rgba(255,255,255,0.1), 0 0 30px ${tColor}30`
                }}
              >
                {/* Subtle team color accent inside the capsule */}
                <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: `linear-gradient(90deg, transparent, ${tColor}, transparent)` }} />

                <div className="relative z-10 flex items-center w-full">
                  
                  {/* Rank Badge */}
                  <div className="w-20 h-20 rounded-full flex items-center justify-center bg-[#020617]/60 border border-white/10 shadow-[inset_0_2px_5px_rgba(0,0,0,0.5)] mr-8 shrink-0">
                    <span className="text-4xl font-black text-white drop-shadow-md">
                      {posNum}
                    </span>
                  </div>
                  
                  {/* Winner Name */}
                  <div className="flex-1 pr-6 min-w-0">
                    <h3 className="text-5xl font-bold text-white uppercase truncate drop-shadow-sm tracking-wide">
                      {winnerName}
                    </h3>
                  </div>
                  
                  {/* Team Info */}
                  <div className="flex items-center space-x-4 px-8 shrink-0 border-l border-white/10">
                    <div className="w-5 h-5 rounded-full shadow-[0_0_12px_rgba(255,255,255,0.6)]" style={{ backgroundColor: tColor }} />
                    <span className="text-3xl font-bold text-white/90 uppercase tracking-widest drop-shadow-md">
                      {teamName || 'TEAM'}
                    </span>
                  </div>
                  
                  {/* Points */}
                  {points !== undefined && (
                    <div className="flex items-baseline shrink-0 pl-8 border-l border-white/10">
                      <span className="text-[4rem] leading-none font-black text-white drop-shadow-2xl tabular-nums tracking-tighter">
                        {points}
                      </span>
                    </div>
                  )}

                </div>
              </div>
            ))}
          </div>

        </div>
        
      </div>

      {/* Right Side Vertical Typography */}
      <div className="absolute right-24 top-0 bottom-0 flex items-center justify-center pointer-events-none z-0">
        <span className="text-[16rem] font-light text-white/[0.03] tracking-[0.3em] uppercase rotate-90 origin-center whitespace-nowrap select-none drop-shadow-2xl">
          RESULTS
        </span>
      </div>

      {/* Bottom Footer */}
      <div className="w-full z-10 flex flex-col pt-10">
        <div className="w-full h-[2px] bg-white/10 mb-6" />
        <p className="text-white/40 text-[14px] font-medium tracking-[0.15em] max-w-5xl leading-relaxed uppercase">
          This document represents the official results for the aforementioned program. The decisions rendered are final and certified by the Al Mahsan committee. Congratulations to all participants for their dedication.
        </p>
      </div>

    </div>
  );
}
