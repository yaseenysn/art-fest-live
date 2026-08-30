"use client";

import { useEffect, useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSocket } from "@/lib/socket-client";
import { SOCKET_EVENTS } from "@/lib/socket";
import { IProgram } from "@/types";

export default function CurrentProgramStatus({ presentation }: { presentation?: string }) {
  const queryClient = useQueryClient();

  // Determine position based on design presentation
  let positionClasses = "top-[clamp(80px,10vh,120px)] right-[clamp(30px,5vw,60px)] items-end text-right"; // Default to Top-Right for Design 1, 2, 4

  if (presentation === "design3") {
    positionClasses = "top-[clamp(80px,10vh,120px)] left-[clamp(30px,5vw,60px)] items-start text-left";
  }

  const containerClasses = `absolute ${positionClasses} z-50 flex flex-col pointer-events-none px-4 w-full max-w-[90vw] md:max-w-md`;

  const { data: programs, isLoading } = useQuery<IProgram[]>({
    queryKey: ["programs"],
    queryFn: async () => {
      const res = await fetch("/api/programs");
      if (!res.ok) throw new Error("Failed to fetch programs");
      return res.json();
    },
    staleTime: 60000,
  });

  useEffect(() => {
    const socket = getSocket();

    const invalidatePrograms = () => {
      queryClient.invalidateQueries({ queryKey: ["programs"] });
    };

    socket.on(SOCKET_EVENTS.PROGRAM_CREATED, invalidatePrograms);
    socket.on(SOCKET_EVENTS.PROGRAM_UPDATED, invalidatePrograms);
    socket.on(SOCKET_EVENTS.PROGRAM_DELETED, invalidatePrograms);
    socket.on(SOCKET_EVENTS.EVENT_RESET, invalidatePrograms);

    return () => {
      socket.off(SOCKET_EVENTS.PROGRAM_CREATED, invalidatePrograms);
      socket.off(SOCKET_EVENTS.PROGRAM_UPDATED, invalidatePrograms);
      socket.off(SOCKET_EVENTS.PROGRAM_DELETED, invalidatePrograms);
      socket.off(SOCKET_EVENTS.EVENT_RESET, invalidatePrograms);
    };
  }, [queryClient]);

  if (isLoading) {
    return (
      <div className={containerClasses}>
        <div className="text-[12px] md:text-[14px] font-bold text-blue-200/60 tracking-[0.25em] uppercase mb-2 drop-shadow-md">CURRENT PROGRAM</div>
        <div className="h-8 md:h-10 w-[clamp(150px,20vw,256px)] bg-white/20 rounded animate-pulse mb-2" />
        <div className="h-4 w-[clamp(60px,10vw,96px)] bg-white/10 rounded animate-pulse" />
      </div>
    );
  }

  const allPrograms = useMemo(() => programs || [], [programs]);
  const totalPrograms = allPrograms.length;

  const currentProgram = useMemo(() => allPrograms.find(p => p.status === "live"), [allPrograms]);

  const upcomingPrograms = useMemo(() => allPrograms
    .filter(p => p.status === "upcoming")
    .sort((a, b) => {
      const orderA = a.programOrder ?? 999999;
      const orderB = b.programOrder ?? 999999;
      if (orderA !== orderB) return orderA - orderB;
      return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
    }), [allPrograms]);
    
  const nextProgram = upcomingPrograms[0];
  const displayProgram = currentProgram || nextProgram;
  const isLive = !!currentProgram;

  if (totalPrograms === 0) {
    return (
      <div className={containerClasses}>
        <div className="text-[12px] md:text-[14px] font-bold text-blue-200/60 tracking-[0.25em] uppercase mb-1 drop-shadow-md">CURRENT PROGRAM</div>
        <div className="text-[clamp(16px,2.5vw,24px)] font-bold text-white/80 uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">NO PROGRAMS</div>
      </div>
    );
  }

  return (
    <div className={containerClasses}>

      <div className="text-[12px] md:text-[14px] font-bold text-blue-200/70 tracking-[0.25em] uppercase mb-1 md:mb-1.5 drop-shadow-md">
        CURRENT PROGRAM
      </div>

      {displayProgram ? (
        <>
          <h2 className={`text-[clamp(16px,2vw,24px)] font-black text-white ${presentation === 'design3' ? 'text-left' : 'text-right'} leading-tight md:leading-none mb-1 md:mb-1.5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] uppercase tracking-wide truncate max-w-full`}>
            {displayProgram.name}
          </h2>

          <div className="flex items-center space-x-2">
            {isLive ? (
              <>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,1)] animate-pulse" />
                <span className="text-[10px] md:text-[12px] font-bold text-emerald-400 uppercase tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  IN PROGRESS
                </span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 rounded-full bg-blue-400/80 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
                <span className="text-[10px] md:text-[12px] font-bold text-blue-300 uppercase tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  UPCOMING
                </span>
              </>
            )}
          </div>
        </>
      ) : (
        <h2 className={`text-[clamp(14px,1.5vw,20px)] font-bold text-white/90 ${presentation === 'design3' ? 'text-left' : 'text-right'} leading-tight md:leading-none drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] uppercase tracking-wide mt-1`}>
          NO ACTIVE PROGRAM
        </h2>
      )}
    </div>
  );
}
