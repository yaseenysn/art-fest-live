import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { TVState } from '@/models/TVState';
import { getIO, SOCKET_EVENTS } from '@/lib/socket';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    await connectDB();
    const state = await TVState.findOne().sort({ updatedAt: -1 });
    return NextResponse.json(state || null);
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export const POST = async (req: NextRequest) => {
  try {
    await connectDB();
    const data = await req.json();
    const { type, config, isActive, leaderboardDesign, allWinnersDesign, resultsDesign, finalRevealActive, finalRevealTeamName, finalRevealPosition, displayEnabled, presentationType, presentationStartedAt, presentationExpiresAt, presentationDuration, presentationData } = data;

    console.log("[API] received presentation update:", { type, presentationType });

    // Use findOneAndUpdate with upsert to maintain a singleton TVState
    const updatePayload: any = {};
    if (type !== undefined) updatePayload.type = type;
    if (config !== undefined) updatePayload.config = config;
    if (isActive !== undefined) updatePayload.isActive = isActive;
    if (leaderboardDesign !== undefined) updatePayload.leaderboardDesign = leaderboardDesign;
    if (allWinnersDesign !== undefined) updatePayload.allWinnersDesign = allWinnersDesign;
    if (resultsDesign !== undefined) updatePayload.resultsDesign = resultsDesign;
    if (finalRevealActive !== undefined) updatePayload.finalRevealActive = finalRevealActive;
    if (finalRevealTeamName !== undefined) updatePayload.finalRevealTeamName = finalRevealTeamName;
    if (finalRevealPosition !== undefined) updatePayload.finalRevealPosition = finalRevealPosition;
    if (displayEnabled !== undefined) updatePayload.displayEnabled = displayEnabled;
    if (presentationType !== undefined) updatePayload.presentationType = presentationType;
    if (presentationStartedAt !== undefined) updatePayload.presentationStartedAt = presentationStartedAt;
    if (presentationExpiresAt !== undefined) updatePayload.presentationExpiresAt = presentationExpiresAt;
    if (presentationDuration !== undefined) updatePayload.presentationDuration = presentationDuration;
    if (presentationData !== undefined) updatePayload.presentationData = presentationData;

    const state = await TVState.findOneAndUpdate(
      {},
      { $set: updatePayload },
      { new: true, upsert: true }
    );

    console.log("[TV STATE] saving presentation:", state?.config?.presentation);

    const presentationKeys = ['presentationType', 'presentationStartedAt', 'presentationExpiresAt', 'presentationDuration', 'presentationData'];
    const finalRevealKeys = ['finalRevealActive', 'finalRevealTeamName', 'finalRevealPosition'];
    const displayKeys = ['displayEnabled'];
    
    const hasOtherUpdates = Object.keys(updatePayload).some(k => !displayKeys.includes(k) && !finalRevealKeys.includes(k) && !presentationKeys.includes(k));
    const hasFinalRevealUpdates = Object.keys(updatePayload).some(k => finalRevealKeys.includes(k));
    const hasPresentationUpdates = Object.keys(updatePayload).some(k => presentationKeys.includes(k));

    // Broadcast the update via socket
    const io = getIO();
    if (io) {
      if (hasOtherUpdates) {
        console.log("[SOCKET] broadcasting presentation:", state?.config?.presentation);
        io.emit(SOCKET_EVENTS.LEADERBOARD_STATE_UPDATED, state);
      }

      if (hasFinalRevealUpdates) {
        io.emit(SOCKET_EVENTS.FINAL_REVEAL_UPDATED, {
          finalRevealActive: state.finalRevealActive,
          finalRevealTeamName: state.finalRevealTeamName,
          finalRevealPosition: state.finalRevealPosition
        });
      }
      
      if (displayEnabled !== undefined) {
        io.emit(SOCKET_EVENTS.TV_DISPLAY_STATE_CHANGED, { displayEnabled });
      }

      if (hasPresentationUpdates) {
        io.emit(SOCKET_EVENTS.PRESENTATION_STATE_UPDATED, {
          presentationType: state.presentationType,
          presentationStartedAt: state.presentationStartedAt,
          presentationExpiresAt: state.presentationExpiresAt,
          presentationDuration: state.presentationDuration,
          presentationData: state.presentationData
        });
      }
    }

    return NextResponse.json({ message: 'TV State updated', state });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
};
