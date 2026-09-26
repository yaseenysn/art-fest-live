import mongoose from 'mongoose';
import { Result } from '../models/Result';
import { Team } from '../models/Team';
import { ManualTeamScoreOverride } from '../models/ManualTeamScoreOverride';
import { TeamRanking, LeaderboardConfig, LeaderboardRow } from '../types';
import { TVState } from '../models/TVState';
import { getIO, SOCKET_EVENTS } from './socket';

export async function getTeamRankings(): Promise<TeamRanking[]> {
  // Aggregate total points from Results (UNTOUCHED automatic calculation)
  const teamScores = await Result.aggregate([
    {
      $match: { revealed: true }
    },
    {
      $group: {
        _id: '$teamId',
        totalPoints: { $sum: '$points' }
      }
    }
  ]);

  // Fetch all teams
  const teams = await Team.find({}).lean();

  // Create a map of calculated team scores
  const scoreMap = new Map<string, number>();
  teamScores.forEach((ts) => {
    scoreMap.set(ts._id.toString(), ts.totalPoints);
  });

  // Fetch manual team score overrides
  const overrides = await ManualTeamScoreOverride.find({}).lean();
  const overrideMap = new Map<string, number>();
  overrides.forEach((ov: any) => {
    overrideMap.set(ov.teamId.toString(), ov.manualScore);
  });

  // Map teams to their effective scores (override priority: manual override ?? calculated)
  const rankings: TeamRanking[] = teams.map((team: any) => {
    const teamIdStr = team._id.toString();
    const calculatedPoints = scoreMap.get(teamIdStr) || 0;
    const hasOverride = overrideMap.has(teamIdStr);
    const manualScore = hasOverride ? overrideMap.get(teamIdStr)! : null;
    const totalPoints = hasOverride ? manualScore! : calculatedPoints;

    return {
      team: {
        _id: teamIdStr,
        name: team.name,
        shortName: team.shortName,
        slug: team.slug,
        color: team.color,
      },
      totalPoints,
      calculatedPoints,
      manualScore,
      rank: 0 // Will be calculated next
    };
  });

  // Sort by effective points descending
  rankings.sort((a, b) => b.totalPoints - a.totalPoints);

  // Assign ranks (handling ties - e.g. 1st, 1st, 3rd, 4th)
  let currentRank = 1;
  let previousScore = -1;
  let skippedRanks = 0;

  for (let i = 0; i < rankings.length; i++) {
    if (rankings[i].totalPoints !== previousScore) {
      currentRank += skippedRanks;
      skippedRanks = 1;
      previousScore = rankings[i].totalPoints;
    } else {
      skippedRanks++;
    }
    rankings[i].rank = currentRank;
  }

  // Fallback if everyone has 0 points, assign rank 1 to all (or keep as is since the logic does this naturally)
  return rankings;
}

export async function generateLeaderboardConfig(type: string, options?: { startDate?: Date, endDate?: Date }): Promise<LeaderboardConfig> {
  const teams = await Team.find({}).lean();
  
  const title = "OVERALL TEAM RANKINGS";
  const subtitle = "AL MAHSAN";
  
  const matchQuery: any = { revealed: true };
  
  // Aggregate ALL points by team for the unified overall ranking (UNTOUCHED automatic calculation)
  const teamScores = await Result.aggregate([
    { $match: matchQuery },
    { $group: { _id: '$teamId', totalPoints: { $sum: '$points' } } }
  ]);
  
  const scoreMap = new Map<string, number>();
  teamScores.forEach((ts) => scoreMap.set(ts._id.toString(), ts.totalPoints));
  
  // Fetch manual team score overrides
  const overrides = await ManualTeamScoreOverride.find({}).lean();
  const overrideMap = new Map<string, number>();
  overrides.forEach((ov: any) => {
    overrideMap.set(ov.teamId.toString(), ov.manualScore);
  });

  const rows: LeaderboardRow[] = teams.map((team: any) => {
    const teamIdStr = team._id.toString();
    const calculatedPoints = scoreMap.get(teamIdStr) || 0;
    const hasOverride = overrideMap.has(teamIdStr);
    const points = hasOverride ? overrideMap.get(teamIdStr)! : calculatedPoints;

    return {
      id: teamIdStr,
      rank: 0,
      name: team.name,
      points,
      color: team.color,
    };
  });

  // Sort and Assign Ranks based on effective points
  rows.sort((a, b) => (b.points as number) - (a.points as number));

  let currentRank = 1;
  let previousScore = -1;
  let skippedRanks = 0;

  for (let i = 0; i < rows.length; i++) {
    if (rows[i].points !== previousScore) {
      currentRank += skippedRanks;
      skippedRanks = 1;
      previousScore = rows[i].points as number;
    } else {
      skippedRanks++;
    }
    rows[i].rank = currentRank;
  }
  
  let presentation: 'design1' | 'design2' | 'design3' | 'design4' = 'design1';
  if (type?.includes('Design 2')) presentation = 'design2';
  else if (type?.includes('Design 3')) presentation = 'design3';
  else if (type?.includes('Design 4')) presentation = 'design4';

  return {
    title,
    subtitle,
    showPoints: true,
    showColor: true,
    presentation,
    type: 'overall',
    rows
  };
}

export async function syncTVLeaderboardState() {
  const tvState = await TVState.findOne();
  if (!tvState) return;
  
  // Re-generate config using the current design selected
  const newConfig = await generateLeaderboardConfig(tvState.leaderboardDesign || tvState.type || 'design1');
  
  tvState.config = newConfig;
  await tvState.save();
  
  // Broadcast the updated TVState so the TV refreshes its config immediately
  const io = getIO();
  if (io) {
    io.emit(SOCKET_EVENTS.LEADERBOARD_STATE_UPDATED, tvState);
  }
}
