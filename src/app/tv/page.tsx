"use client";

import { useEffect, useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import { getSocket } from "@/lib/socket-client";
import { SOCKET_EVENTS } from "@/lib/socket";
import {
  TeamRanking,
  IResult,
  IAnnouncement,
} from "@/types";

import Leaderboard from "./components/Leaderboard";
import ResultsRouter from "./components/ResultsRouter";
import AnnouncementOverlay from "./components/AnnouncementOverlay";
import AllWinnersRouter from "./components/AllWinnersRouter";
import FinalTeamReveal from "./components/FinalTeamReveal";
import MediaPlayer from "./components/MediaPlayer";
import CustomAnnouncementOverlay from "./components/CustomAnnouncementOverlay";

const isPresentationActive = (
  presentationType?: string | null,
  presentationExpiresAt?: string | null
) => {
  if (!presentationType) return false;
  if (presentationType === "MEDIA") return true; // Media controls its own expiration
  if (presentationType === "FINAL_TEAM_REVEAL") return true; // Final Reveal is manually ended
  if (!presentationExpiresAt) return false;
  return Date.now() < new Date(presentationExpiresAt).getTime();
};

type TVMode =
  | "LEADERBOARD"
  | "RESULT_REVEAL"
  | "ANNOUNCEMENT"
  | "POSTER"
  | "ALL_WINNERS";

export default function TVPage() {
  const queryClient = useQueryClient();

  /* =========================================================
     NORMAL TV MODE
  ========================================================= */

  const [mode, setMode] = useState<TVMode>("LEADERBOARD");


  /* =========================================================
     FINAL TEAM REVEAL — COMPLETELY SEPARATE STATE
  ========================================================= */

  const [finalRevealActive, setFinalRevealActive] = useState(false);
  const [finalRevealTeamName, setFinalRevealTeamName] = useState("");
  const [finalRevealPosition, setFinalRevealPosition] = useState(1);
  const [finalRevealKey, setFinalRevealKey] = useState(0);

  /* =========================================================
     INTERACTION STATE (FOR AUTOPLAY) - REMOVED BY USER REQUEST
  ========================================================= */

  /* =========================================================
     TV STATE
  ========================================================= */

  const {
    data: tvState,
    refetch: refetchTvState,
  } = useQuery<any>({
    queryKey: ["tvState"],

    queryFn: async () => {
      const res = await fetch("/api/tv-state", {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch TV state");
      }

      return res.json();
    },

    staleTime: 60000,
  });



  /* =========================================================
     SAFE RETURN TO LEADERBOARD
  ========================================================= */

  const returnToLeaderboard = async (expiredId: string) => {
    if (!expiredId) return;

    // Verify before clearing optimism
    const state = queryClient.getQueryData<any>(["tvState"]);
    if (state && state.presentationId && state.presentationId !== expiredId) {
      console.log("[TV] Optimistic clear aborted. Current ID:", state.presentationId, "Expired ID:", expiredId);
      return;
    }

    console.log("[TV] Returning to Leaderboard. Clearing presentation ID:", expiredId);

    // Optimistic cache update
    queryClient.setQueryData(["tvState"], (old: any) => {
      if (!old) return old;
      return {
        ...old,
        presentationId: null,
        presentationType: null,
        presentationStartedAt: null,
        presentationExpiresAt: null,
        presentationDuration: null,
        presentationData: null,
      };
    });

    try {
      await fetch('/api/tv-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clearPresentationId: expiredId
        })
      });
    } catch (e) {
      console.error("[TV] Failed to clear presentation state on server:", e);
    }
  };



  /* =========================================================
     CENTRAL EXPIRATION TIMER
  ========================================================= */

  /* =========================================================
     CENTRAL EXPIRATION TIMER
  ========================================================= */

  useEffect(() => {
    const state = queryClient.getQueryData<any>(["tvState"]);

    if (state && state.presentationType && state.presentationExpiresAt && state.presentationId) {
      const expiresAt = new Date(state.presentationExpiresAt).getTime();
      const now = Date.now();
      const remaining = expiresAt - now;

      if (remaining <= 0) {
        console.log("[TV] Central Timer: Presentation expired. Initiating return to LEADERBOARD.");
        returnToLeaderboard(state.presentationId);
      } else {
        const timeoutId = setTimeout(() => {
          const currentState = queryClient.getQueryData<any>(["tvState"]);
          // Verify it's still the same presentation before returning
          if (currentState && currentState.presentationId === state.presentationId) {
            console.log("[TV] Central Timer: Scheduled expiration fired. Initiating return to LEADERBOARD.");
            returnToLeaderboard(state.presentationId);
          }
        }, remaining);

        return () => clearTimeout(timeoutId);
      }
    }
  }, [queryClient, tvState?.presentationExpiresAt, tvState?.presentationId, tvState?.presentationType]);

  /* =========================================================
     SOCKET CONNECTION
  ========================================================= */

  const [connected, setConnected] =
    useState(false);

  useEffect(() => {
    const socket = getSocket();

    /* =======================================================
       CONNECTION
    ======================================================= */

    const onConnect = () => {
      console.log("[TV] Socket connected");
      setConnected(true);
    };

    const onDisconnect = () => {
      console.log("[TV] Socket disconnected");
      setConnected(false);
    };

    /* =======================================================
       SCORE UPDATED
    ======================================================= */

    const onScoreUpdated = () => {
      refetchTvState();
    };

    /* =======================================================
       LEADERBOARD STATE
    ======================================================= */

    const onLeaderboardStateUpdated = (
      state: any
    ) => {
      console.log(
        "[TV] LEADERBOARD RECEIVED",
        state?.config?.presentation
      );
      setFinalRevealActive(false);

      /*
       * IMPORTANT:
       * Update React Query cache without destroying
       * any locally maintained state.
       */

      queryClient.setQueryData(
        ["tvState"],
        state
      );

      /*
       * Determine normal TV mode.
       *
       * Final Reveal is NOT controlled from here.
       */

      if (state?.isActive) {
        if (!state.presentationType || new Date(state.presentationExpiresAt).getTime() <= Date.now()) {
          if (state.type === 'ALL_WINNERS') {
            setMode("ALL_WINNERS");
          } else {
            setMode("LEADERBOARD");
          }
        }
      }
    };

    /* =======================================================
       RESULT REVEAL
    ======================================================= */

    const onPositionResultRevealed = (payload: any) => {
      console.log("[TV] RESULT REVEAL RECEIVED via socket... Waiting for PRESENTATION_STATE_UPDATED");
    };

    /* =======================================================
       ANNOUNCEMENT
    ======================================================= */

    const onAnnouncementShown = (announcement: IAnnouncement) => {
      console.log("[TV] ANNOUNCEMENT RECEIVED via socket... Waiting for PRESENTATION_STATE_UPDATED");
    };

    /* =======================================================
       POSTER
    ======================================================= */

    const onPosterShown = (data: { url: string; duration: number }) => {
      console.log("[TV] POSTER RECEIVED via socket... Waiting for PRESENTATION_STATE_UPDATED");
    };

    /* =======================================================
       PRESENTATION_STATE_UPDATED
    ======================================================= */

    const onPresentationStateUpdated = (payload: any) => {
      console.log("[TV] PRESENTATION STATE UPDATED", payload);
      refetchTvState();
    };

    /* =======================================================
       TEAM CHANGE
    ======================================================= */

    const onTeamChange = (
      payload?: {
        _id: string;
      }
    ) => {
      queryClient.invalidateQueries({
        queryKey: ["rankings"],
      });
    };

    /* =======================================================
       PROGRAM DELETED
    ======================================================= */

    const onProgramDeleted = (
      payload?: {
        programId: string;
      }
    ) => {
      queryClient.invalidateQueries({
        queryKey: ["rankings"],
      });
    };

    /* =======================================================
       EVENT RESET
    ======================================================= */

    const onEventReset = () => {
      console.log("[TV] EVENT RESET");
      queryClient.removeQueries({
        queryKey: ["rankings"],
      });

      queryClient.invalidateQueries({
        queryKey: ["rankings"],
      });
    };

    /* =======================================================
       FINAL TEAM REVEAL
       THIS WAS MISSING IN YOUR CURRENT CODE
    ======================================================= */

    const onFinalRevealUpdated = (
      payload: {
        finalRevealActive: boolean;
        finalRevealTeamName?: string;
        finalRevealPosition?: number;
      }
    ) => {
      if (payload.finalRevealActive) {
        console.log("[TV] FINAL REVEAL START", payload);
      } else {
        console.log("[TV] FINAL REVEAL RESET", payload);
      }

      /*
       * Update only Final Reveal state.
       *
       * DO NOT modify mode.
       * DO NOT modify displayEnabled.
       * DO NOT modify tvState.
       */

      setFinalRevealActive(
        Boolean(
          payload.finalRevealActive
        )
      );

      if (
        payload.finalRevealTeamName !==
        undefined
      ) {
        setFinalRevealTeamName(
          payload.finalRevealTeamName
        );
      }

      if (
        payload.finalRevealPosition !==
        undefined
      ) {
        setFinalRevealPosition(
          Number(
            payload.finalRevealPosition
          )
        );
      }

      /*
       * Every START REVEAL gets a new key.
       *
       * This forces the countdown to restart:
       *
       * 3 → 2 → 1 → explosion → team
       */

      if (
        payload.finalRevealActive
      ) {
        setFinalRevealKey(
          Date.now()
        );
      }
    };

    /* =======================================================
       TV DISPLAY ON/OFF
    ======================================================= */

    /* =======================================================
       SOCKET LISTENERS
    ======================================================= */

    socket.on(
      "connect",
      onConnect
    );

    socket.on(
      "disconnect",
      onDisconnect
    );

    socket.on(
      SOCKET_EVENTS.SCORE_UPDATED,
      onScoreUpdated
    );

    socket.on(
      SOCKET_EVENTS.LEADERBOARD_STATE_UPDATED,
      onLeaderboardStateUpdated
    );

    socket.on(
      SOCKET_EVENTS.POSITION_RESULT_REVEALED,
      onPositionResultRevealed
    );

    socket.on(
      SOCKET_EVENTS.ANNOUNCEMENT_SHOWN,
      onAnnouncementShown
    );

    socket.on(
      SOCKET_EVENTS.POSTER_SHOWN,
      onPosterShown
    );

    socket.on(
      SOCKET_EVENTS.TEAM_CREATED,
      onTeamChange
    );

    socket.on(
      SOCKET_EVENTS.TEAM_UPDATED,
      onTeamChange
    );

    socket.on(
      SOCKET_EVENTS.TEAM_DELETED,
      onTeamChange
    );

    socket.on(
      SOCKET_EVENTS.PROGRAM_DELETED,
      onProgramDeleted
    );

    socket.on(
      SOCKET_EVENTS.EVENT_RESET,
      onEventReset
    );

    socket.on(
      SOCKET_EVENTS.PRESENTATION_STATE_UPDATED,
      onPresentationStateUpdated
    );

    /*
     * FINAL REVEAL SOCKET
     */

    socket.on(
      SOCKET_EVENTS.FINAL_REVEAL_UPDATED,
      onFinalRevealUpdated
    );


    /* =======================================================
       CLEANUP
    ======================================================= */

    return () => {
      socket.off(
        "connect",
        onConnect
      );

      socket.off(
        "disconnect",
        onDisconnect
      );

      socket.off(
        SOCKET_EVENTS.SCORE_UPDATED,
        onScoreUpdated
      );

      socket.off(
        SOCKET_EVENTS.LEADERBOARD_STATE_UPDATED,
        onLeaderboardStateUpdated
      );

      socket.off(
        SOCKET_EVENTS.POSITION_RESULT_REVEALED,
        onPositionResultRevealed
      );
      socket.off(
        SOCKET_EVENTS.ANNOUNCEMENT_SHOWN,
        onAnnouncementShown
      );

      socket.off(
        SOCKET_EVENTS.POSTER_SHOWN,
        onPosterShown
      );

      socket.off(
        SOCKET_EVENTS.PRESENTATION_STATE_UPDATED,
        onPresentationStateUpdated
      );

      socket.off(
        SOCKET_EVENTS.TEAM_CREATED,
        onTeamChange
      );

      socket.off(
        SOCKET_EVENTS.TEAM_UPDATED,
        onTeamChange
      );

      socket.off(
        SOCKET_EVENTS.TEAM_DELETED,
        onTeamChange
      );

      socket.off(
        SOCKET_EVENTS.PROGRAM_DELETED,
        onProgramDeleted
      );

      socket.off(
        SOCKET_EVENTS.EVENT_RESET,
        onEventReset
      );

      socket.off(
        SOCKET_EVENTS.FINAL_REVEAL_UPDATED,
        onFinalRevealUpdated
      );


      // No longer need to clear posterTimeout since it's handled globally
    };
  }, [
    queryClient,
    refetchTvState,
  ]);

  /* =========================================================
     COMPUTE ACTIVE RENDER MODE (SOURCE OF TRUTH)
  ========================================================= */

  const isPresentation = isPresentationActive(tvState?.presentationType, tvState?.presentationExpiresAt);

  /* =========================================================
     SCALE LOGIC (RESPONSIVE CANVAS)
  ========================================================= */

  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        // The fixed logical size of the TV canvas
        const logicalWidth = 1920;
        const logicalHeight = 1080;

        // Calculate the scale required to fit inside the viewport
        const scaleX = clientWidth / logicalWidth;
        const scaleY = clientHeight / logicalHeight;

        // Use the smaller scale to ensure it fits completely (letterboxed)
        setScale(Math.min(scaleX, scaleY));
      }
    };

    handleResize(); // Initial measurement

    window.addEventListener("resize", handleResize);
    // Optional: Use ResizeObserver for more robust tracking
    const observer = new ResizeObserver(() => handleResize());
    if (containerRef.current) observer.observe(containerRef.current);

    return () => {
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
    };
  }, []);

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div
      ref={containerRef}
      className="
        w-full
        h-[100dvh]
        bg-[#050B14]
        text-white
        overflow-hidden
        selection:bg-transparent
        relative
        font-sans
      "
    >


      {/* =====================================================
          DEEP SPACE BACKGROUND
      ===================================================== */}

      <div
        className="
          fixed
          inset-0
          pointer-events-none
          z-0
        "
      >
        <div
          className="
            absolute
            inset-0
            bg-[radial-gradient(circle_at_50%_0%,_#0f172a_0%,_transparent_60%)]
            opacity-80
          "
        />

        <div
          className="
            absolute
            top-[-20%]
            left-[-10%]
            w-[50%]
            h-[50%]
            rounded-full
            bg-indigo-900/20
            blur-[120px]
          "
        />

        <div
          className="
            absolute
            bottom-[-20%]
            right-[-10%]
            w-[50%]
            h-[50%]
            rounded-full
            bg-violet-900/10
            blur-[120px]
          "
        />

        {/* Subtle noise */}
        <div
          className="
            absolute
            inset-0
            opacity-[0.015]
            bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPHJlY3Qgd2lkdGg9IjEiIGhlaWdodD0iMSIgZmlsbD0iIzAwMCIgZmlsbC1vcGFjaXR5PSIwLjEiLz4KPC9zdmc+')]
            mix-blend-overlay
          "
        />
      </div>

      {/* =====================================================
          LIVE CONNECTION CAPSULE
      ===================================================== */}

      <div
        className="
          absolute
          top-6
          right-8
          z-[110]
        "
      >
        <div
          className="
            flex
            items-center
            space-x-3
            bg-white/[0.03]
            backdrop-blur-xl
            border
            border-white/[0.05]
            shadow-2xl
            shadow-black/50
            rounded-full
            pl-3
            pr-5
            py-2
          "
        >
          <div
            className="
              relative
              flex
              h-3
              w-3
            "
          >
            {connected ? (
              <>
                <span
                  className="
                    animate-ping
                    absolute
                    inline-flex
                    h-full
                    w-full
                    rounded-full
                    bg-emerald-400
                    opacity-75
                  "
                />

                <span
                  className="
                    relative
                    inline-flex
                    rounded-full
                    h-3
                    w-3
                    bg-emerald-500
                  "
                />
              </>
            ) : (
              <>
                <span
                  className="
                    animate-ping
                    absolute
                    inline-flex
                    h-full
                    w-full
                    rounded-full
                    bg-rose-400
                    opacity-75
                  "
                />

                <span
                  className="
                    relative
                    inline-flex
                    rounded-full
                    h-3
                    w-3
                    bg-rose-500
                  "
                />
              </>
            )}
          </div>

          <div
            className="
              flex
              flex-col
              leading-none
              tracking-widest
              uppercase
            "
          >
            <span
              className="
                text-[10px]
                text-slate-400
                font-bold
              "
            >
              LIVE
            </span>

            <span
              className={`text-xs font-black ${connected
                ? "text-slate-200"
                : "text-rose-400"
                }`}
            >
              {connected
                ? "CONNECTED"
                : "DISCONNECTED"}
            </span>
          </div>
        </div>
      </div>

      {/* =====================================================
          MAIN CONTENT (SCALED CANVAS)
      ===================================================== */}

      <div
        className="relative z-10 w-full h-full flex items-center justify-center pointer-events-none"
      >
        <div
          className="relative flex-shrink-0 pointer-events-auto"
          style={{
            width: 1920,
            height: 1080,
            transform: `scale(${scale})`,
            transformOrigin: "center center",
          }}
        >
          <AnimatePresence mode="wait">
            {!tvState?.displayEnabled ? (
              <motion.div
                key="black_screen"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black z-[2000]"
              />
            ) : isPresentation && tvState?.presentationType === "FINAL_TEAM_REVEAL" ? (
              <motion.div
                key={`final-reveal-${tvState.presentationId}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 z-[1000] w-full h-full"
              >
                <FinalTeamReveal
                  key={tvState.presentationId}
                  teamName={tvState.finalRevealTeamName || "TEAM"}
                  position={tvState.finalRevealPosition || 1}
                  active={true}
                  onComplete={() => { }}
                />
              </motion.div>
            ) : isPresentation && tvState?.presentationType === "ALL_WINNERS" ? (
              <motion.div
                key={`all_winners-${tvState.presentationId}`}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 w-full h-full"
              >
                <AllWinnersRouter config={tvState.presentationData} />
              </motion.div>
            ) : isPresentation && tvState?.presentationType === "RESULT_REVEAL" && tvState.presentationData ? (
              <motion.div
                key={`result-${tvState.presentationId}`}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 w-full h-full"
              >
                <ResultsRouter
                  results={tvState.presentationData.results}
                  design={tvState.presentationData.design || "design1"}
                  revealStage={tvState.presentationData.revealStage || "WINNER"}
                />
              </motion.div>
            ) : isPresentation && tvState?.presentationType === "ANNOUNCEMENT" && tvState.presentationData ? (
              <motion.div
                key={`announcement-${tvState.presentationId}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 w-full h-full"
              >
                <AnnouncementOverlay announcement={tvState.presentationData} />
              </motion.div>
            ) : isPresentation && tvState?.presentationType === "CUSTOM_ANNOUNCEMENT" && tvState.presentationData ? (
              <motion.div
                key={`custom-announcement-${tvState.presentationId}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 w-full h-full"
              >
                <CustomAnnouncementOverlay data={tvState.presentationData} />
              </motion.div>
            ) : isPresentation && tvState?.presentationType === "MEDIA" && tvState.presentationData ? (
              <motion.div
                key={`media-${tvState.presentationId}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 w-full h-full"
              >
                <MediaPlayer
                  presentationId={tvState.presentationId!}
                  playlist={tvState.presentationData.playlist}
                />
              </motion.div>
            ) : isPresentation && tvState?.presentationType === "POSTER" && tvState.presentationData ? (
              <motion.div
                key={`poster-${tvState.presentationId}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 w-[100vw] h-[100vh] z-[100] bg-[#050B14] flex items-center justify-center overflow-hidden"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={tvState.presentationData.url} alt="Congratulations Poster" className="w-[100vw] h-[100vh] object-contain drop-shadow-2xl" />
              </motion.div>
            ) : (
              <motion.div
                key="leaderboard"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 w-full h-full"
              >
                <Leaderboard config={tvState?.isActive && tvState.type !== "ALL_WINNERS" ? tvState.config : undefined} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}