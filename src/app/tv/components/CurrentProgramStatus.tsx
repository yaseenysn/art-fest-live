"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSocket } from "@/lib/socket-client";
import { SOCKET_EVENTS } from "@/lib/socket";
import { IProgram } from "@/types";

export default function CurrentProgramStatus({ presentation }: { presentation?: string }) {
  const queryClient = useQueryClient();

  const containerClasses = "absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center pointer-events-none px-4 text-center w-full max-w-[90vw] md:max-w-2xl";

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
        <div className="h-8 md:h-10 w-64 bg-white/20 rounded animate-pulse mb-2" />
        <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
      </div>
    );
  }

  const allPrograms = programs || [];
  const totalPrograms = allPrograms.length;

  const currentProgram = allPrograms.find(p => p.status === "live");

  if (totalPrograms === 0) {
    return (
      <div className={containerClasses}>
        <div className="text-[12px] md:text-[14px] font-bold text-blue-200/60 tracking-[0.25em] uppercase mb-1 drop-shadow-md">CURRENT PROGRAM</div>
        <div className="text-xl md:text-2xl font-bold text-white/80 uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">NO PROGRAMS</div>
      </div>
    );
  }

  return (
    <div className={containerClasses}>

      <div className="text-[12px] md:text-[14px] font-bold text-blue-200/70 tracking-[0.25em] uppercase mb-1 md:mb-1.5 drop-shadow-md">
        CURRENT PROGRAM
      </div>

      {currentProgram ? (
        <>
          <h2 className="text-2xl md:text-[32px] font-black text-white text-center leading-tight md:leading-none mb-1.5 md:mb-2 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] uppercase tracking-wide truncate w-full">
            {currentProgram.name}
          </h2>

          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,1)] animate-pulse" />
            <span className="text-[12px] md:text-[14px] font-bold text-emerald-400 uppercase tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              IN PROGRESS
            </span>
          </div>
        </>
      ) : (
        <h2 className="text-xl md:text-[28px] font-bold text-white/90 text-center leading-tight md:leading-none drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] uppercase tracking-wide mt-1">
          NO ACTIVE PROGRAM
        </h2>
      )}
    </div>
  );
}
