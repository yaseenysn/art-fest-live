import { Server as SocketIOServer } from 'socket.io';

// This is meant for server-side use only.
// It retrieves the Socket.IO instance attached to the global object
// by the custom server (server.mjs).

export const getIO = (): SocketIOServer | undefined => {
  const io = (global as typeof globalThis & { io: SocketIOServer }).io;
  return io;
};

// Event Constants
export const SOCKET_EVENTS = {
  SCORE_UPDATED: 'scoreUpdated',
  RESULT_SAVED: 'resultSaved',
  RESULT_REVEALED: 'resultRevealed',
  RESULT_DELETED: 'resultDeleted',
  ANNOUNCEMENT_SHOWN: 'announcementShown',
  POSTER_SHOWN: 'posterShown',
  TEAM_CREATED: 'teamCreated',
  TEAM_UPDATED: 'teamUpdated',
  TEAM_DELETED: 'teamDeleted',
  PROGRAM_CREATED: 'programCreated',
  PROGRAM_UPDATED: 'programUpdated',
  PROGRAM_DELETED: 'programDeleted',
  EVENT_RESET: 'eventReset',
  POSITION_RESULT_REVEALED: 'positionResultRevealed',
  POSITION_REVEAL_ENDED: 'positionRevealEnded',
  LEADERBOARD_STATE_UPDATED: 'leaderboardStateUpdated',
  TV_DISPLAY_STATE_CHANGED: 'tvDisplayStateChanged',
  FINAL_REVEAL_UPDATED: 'finalRevealUpdated',
  PRESENTATION_STATE_UPDATED: 'presentationStateUpdated'
} as const;
