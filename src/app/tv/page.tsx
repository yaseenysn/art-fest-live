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
     RESULT / ANNOUNCEMENT / POSTER STATE
  ========================================================= */

  const [currentResult, setCurrentResult] =
    useState<IResult[] | null>(null);

  const [currentAnnouncement, setCurrentAnnouncement] =
    useState<IAnnouncement | null>(null);

  const [currentPoster, setCurrentPoster] =
    useState<string | null>(null);

  const [currentProgramId, setCurrentProgramId] =
    useState<string | null>(null);

  const [currentPosition, setCurrentPosition] =
    useState<number | null>(null);

  const [revealKey, setRevealKey] =
    useState<number>(0);

  /* =========================================================
     STATE REF
  ========================================================= */

  const stateRef = useRef({
    programId: currentProgramId,
    position: currentPosition,
    mode,
  });

  useEffect(() => {
    stateRef.current = {
      programId: currentProgramId,
      position: currentPosition,
      mode,
    };
  }, [
    currentProgramId,
    currentPosition,
    mode,
  ]);

  /* =========================================================
     INITIAL TV STATE SYNC
  ========================================================= */

  useEffect(() => {
    if (!tvState) return;

    /* =======================================================
       FINAL TEAM REVEAL INITIAL SYNC
    ======================================================= */

    if (tvState?.finalRevealActive !== undefined) {
      setFinalRevealActive(Boolean(tvState.finalRevealActive));
      setFinalRevealTeamName(tvState.finalRevealTeamName || "");
      setFinalRevealPosition(Number(tvState.finalRevealPosition || 1));
    }

    /* =======================================================
       PRESENTATION INITIAL SYNC
    ======================================================= */
    if (tvState?.presentationExpiresAt && tvState?.presentationType) {
      const expiresAt = new Date(tvState.presentationExpiresAt).getTime();
      const now = Date.now();
      if (now < expiresAt && !tvState.finalRevealActive) {
        setMode(tvState.presentationType as TVMode);
        
        // Restore data based on presentation type
        if (tvState.presentationType === 'RESULT_REVEAL' && tvState.presentationData) {
          setCurrentProgramId(tvState.presentationData.programId);
          setCurrentPosition(tvState.presentationData.position);
          setCurrentResult(tvState.presentationData.results);
        } else if (tvState.presentationType === 'ANNOUNCEMENT' && tvState.presentationData) {
          setCurrentAnnouncement(tvState.presentationData);
        } else if (tvState.presentationType === 'POSTER' && tvState.presentationData) {
          setCurrentPoster(tvState.presentationData.url);
        }
      } else if (!tvState.finalRevealActive) {
        if (tvState.isActive && tvState.type === 'ALL_WINNERS') {
          setMode('ALL_WINNERS');
        } else if (mode !== 'LEADERBOARD') {
          setMode('LEADERBOARD');
        }
      }
    } else if (!tvState?.finalRevealActive) {
      if (tvState?.isActive && tvState.type === 'ALL_WINNERS') {
        setMode('ALL_WINNERS');
      } else if (mode !== 'LEADERBOARD') {
        setMode('LEADERBOARD');
      }
    }
  }, [
    tvState?.finalRevealActive,
    tvState?.finalRevealTeamName,
    tvState?.finalRevealPosition,
    tvState?.presentationExpiresAt,
    tvState?.presentationType,
    tvState?.presentationData,
  ]);

  /* =========================================================
     CENTRAL EXPIRATION TIMER
  ========================================================= */

  useEffect(() => {
    const interval = setInterval(() => {
      const state = queryClient.getQueryData<any>(["tvState"]);
      if (state && state.presentationExpiresAt && state.presentationType) {
        const expiresAt = new Date(state.presentationExpiresAt).getTime();
        const now = Date.now();

        if (now >= expiresAt && !state.finalRevealActive && stateRef.current.mode !== 'LEADERBOARD') {
          console.log("[TV] Presentation expired, returning to LEADERBOARD");
          setMode('LEADERBOARD');
          setCurrentPoster(null);
          setCurrentProgramId(null);
          setCurrentPosition(null);
          setCurrentResult(null);
          setCurrentAnnouncement(null);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [queryClient]);

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

    const onPositionResultRevealed = (
      payload: {
        programId: string;
        position: number;
        results: IResult[];
      }
    ) => {
      console.log(
        "[TV] RESULT REVEAL RECEIVED",
        {
          finalRevealActive,
          mode,
          programId: payload.programId,
          position: payload.position
        }
      );
      setFinalRevealActive(false);

      setCurrentProgramId(
        payload.programId
      );

      setCurrentPosition(
        payload.position
      );

      setCurrentResult(
        payload.results
      );

      setMode(
        "RESULT_REVEAL"
      );

      setRevealKey(
        Date.now()
      );
    };

    /* =======================================================
       RESULT REVEAL ENDED
    ======================================================= */

    const onPositionRevealEnded = (
      payload: {
        programId: string;
        position: number;
      }
    ) => {
      const current =
        stateRef.current;

      if (
        current.mode === "RESULT_REVEAL" &&
        current.programId === payload.programId &&
        current.position === payload.position
      ) {
        setMode("LEADERBOARD");

        setCurrentProgramId(null);
        setCurrentPosition(null);
      }
    };

    /* =======================================================
       ANNOUNCEMENT
    ======================================================= */

    const onAnnouncementShown = (announcement: IAnnouncement) => {
      console.log("[TV] ANNOUNCEMENT RECEIVED");
      setFinalRevealActive(false);
      setCurrentAnnouncement(announcement);
      setMode("ANNOUNCEMENT");
      // Timeout is now handled centrally by PRESENTATION_STATE_UPDATED and the interval
    };

    /* =======================================================
       POSTER
    ======================================================= */

    const onPosterShown = (data: { url: string; duration: number }) => {
      console.log("[TV] POSTER RECEIVED");
      setFinalRevealActive(false);
      setCurrentPoster(data.url);
      setMode("POSTER");
      // Timeout is now handled centrally by PRESENTATION_STATE_UPDATED and the interval
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

      if (payload?._id) {
        setMode("LEADERBOARD");
        setCurrentPoster(null);
      }
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

      if (payload?.programId) {
        setMode(currentMode => {
          if (
            currentMode === "RESULT_REVEAL" ||
            currentMode === "POSTER"
          ) {
            const state = queryClient.getQueryData<any>(["tvState"]);
            return state?.type === 'ALL_WINNERS' ? 'ALL_WINNERS' : 'LEADERBOARD';
          }

          return currentMode;
        });

        setCurrentPoster(null);
      }
    };

    /* =======================================================
       EVENT RESET
    ======================================================= */

    const onEventReset = () => {
      console.log("[TV] EVENT RESET");
      setFinalRevealActive(false);
      queryClient.removeQueries({
        queryKey: ["rankings"],
      });

      queryClient.invalidateQueries({
        queryKey: ["rankings"],
      });

      setMode("LEADERBOARD");

      setCurrentResult(null);
      setCurrentAnnouncement(null);
      setCurrentPoster(null);

      setCurrentProgramId(null);
      setCurrentPosition(null);
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
      SOCKET_EVENTS.POSITION_REVEAL_ENDED,
      onPositionRevealEnded
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
        SOCKET_EVENTS.POSITION_REVEAL_ENDED,
        onPositionRevealEnded
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
     TV ROOT
  ========================================================= */

  return (
    <div
      className="
        w-screen
        h-screen
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
          MAIN CONTENT
      ===================================================== */}

      <div
        className="
          relative
          z-10
          w-full
          h-full
          flex
          items-center
          justify-center
        "
      >
        <AnimatePresence mode="wait">

          {/* =================================================
              FINAL TEAM REVEAL
          ================================================= */}

          {finalRevealActive && (
            <motion.div
              key={`final-reveal-${finalRevealKey}`}
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              transition={{
                duration: 0.5,
              }}
              className="
                absolute
                inset-0
                z-[1000]
                w-full
                h-full
              "
            >
              <FinalTeamReveal
                key={finalRevealKey}
                teamName={
                  finalRevealTeamName ||
                  "TEAM"
                }
                position={
                  finalRevealPosition || 1
                }
                active={true}
                onComplete={() => {
                  setFinalRevealActive(false);
                  fetch('/api/tv-state', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ finalRevealActive: false })
                  }).catch(console.error);
                }}
              />
            </motion.div>
          )}

          {/* =================================================
              LEADERBOARD
          ================================================= */}

          {!finalRevealActive &&
            mode === "LEADERBOARD" && (
              <motion.div
                key="leaderboard"
                initial={{
                  opacity: 0,
                  scale: 0.98,
                  filter: "blur(10px)",
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  filter: "blur(0px)",
                }}
                exit={{
                  opacity: 0,
                  scale: 1.02,
                  filter: "blur(10px)",
                }}
                transition={{
                  duration: 0.6,
                  ease: [
                    0.16,
                    1,
                    0.3,
                    1,
                  ],
                }}
                className="
                  absolute
                  inset-0
                  w-full
                  h-full
                "
              >
                <Leaderboard
                  config={
                    tvState?.isActive &&
                      tvState.type !==
                      "ALL_WINNERS"
                      ? tvState.config
                      : undefined
                  }
                />
              </motion.div>
            )}

          {/* =================================================
              ALL WINNERS
          ================================================= */}

          {!finalRevealActive &&
            mode === "ALL_WINNERS" && (
              <motion.div
                key="all_winners"
                initial={{
                  opacity: 0,
                  scale: 0.98,
                  filter: "blur(10px)",
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  filter: "blur(0px)",
                }}
                exit={{
                  opacity: 0,
                  scale: 1.02,
                  filter: "blur(10px)",
                }}
                transition={{
                  duration: 0.6,
                  ease: [
                    0.16,
                    1,
                    0.3,
                    1,
                  ],
                }}
                className="
                  absolute
                  inset-0
                  w-full
                  h-full
                "
              >
                <AllWinnersRouter
                  config={
                    tvState?.presentationType === "ALL_WINNERS"
                      ? tvState.presentationData
                      : tvState?.type === "ALL_WINNERS"
                      ? tvState.config
                      : undefined
                  }
                />
              </motion.div>
            )}

          {/* =================================================
              RESULT REVEAL
          ================================================= */}

          {!finalRevealActive &&
            mode === "RESULT_REVEAL" &&
            currentResult && (
              <motion.div
                key={`result-${revealKey}`}
                initial={{
                  opacity: 0,
                  y: 40,
                  filter: "blur(10px)",
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  filter: "blur(0px)",
                }}
                exit={{
                  opacity: 0,
                  y: -40,
                  filter: "blur(10px)",
                }}
                transition={{
                  duration: 0.6,
                  ease: [
                    0.16,
                    1,
                    0.3,
                    1,
                  ],
                }}
                className="
                  absolute
                  inset-0
                  w-full
                  h-full
                "
              >
                <ResultsRouter
                  results={
                    currentResult
                  }
                  design={
                    tvState?.resultsDesign ||
                    "design1"
                  }
                />
              </motion.div>
            )}

          {/* =================================================
              ANNOUNCEMENT
          ================================================= */}

          {!finalRevealActive &&
            mode === "ANNOUNCEMENT" &&
            currentAnnouncement && (
              <motion.div
                key="announcement"
                initial={{
                  opacity: 0,
                  scale: 0.95,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  scale: 1.05,
                }}
                transition={{
                  duration: 0.5,
                }}
                className="
                  absolute
                  inset-0
                  w-full
                  h-full
                "
              >
                <AnnouncementOverlay
                  announcement={
                    currentAnnouncement
                  }
                />
              </motion.div>
            )}

          {/* =================================================
              POSTER
          ================================================= */}

          {!finalRevealActive &&
            mode === "POSTER" &&
            currentPoster && (
              <motion.div
                key="poster"
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                exit={{
                  opacity: 0,
                }}
                transition={{
                  duration: 0.8,
                }}
                className="
                  absolute
                  inset-0
                  w-[100vw]
                  h-[100vh]
                  z-[100]
                  bg-[#050B14]
                  flex
                  items-center
                  justify-center
                  overflow-hidden
                "
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentPoster}
                  alt="Congratulations Poster"
                  className="
                    w-[100vw]
                    h-[100vh]
                    object-contain
                    drop-shadow-2xl
                  "
                />
              </motion.div>
            )}

        </AnimatePresence>
      </div>
    </div>
  );
}