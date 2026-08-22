import mongoose from 'mongoose';
import { Result } from '../models/Result';
import { Team } from '../models/Team';
import { TeamRanking, LeaderboardConfig, LeaderboardRow } from '../types';

export async function getTeamRankings(): Promise<TeamRanking[]> {
  // Aggregate total points from Results
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

  // Create a map of team scores
  const scoreMap = new Map<string, number>();
  teamScores.forEach((ts) => {
    scoreMap.set(ts._id.toString(), ts.totalPoints);
  });

  // Map teams to their scores, default to 0 if no results
  const rankings: TeamRanking[] = teams.map((team: { _id: string, name: string, slug: string, color: string }) => ({
    team: {
      _id: team._id.toString(),
      name: team.name,
      slug: team.slug,
      color: team.color,
    },
    totalPoints: scoreMap.get(team._id.toString()) || 0,
    rank: 0 // Will be calculated next
  }));

  // Sort by points descending
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
  
  // Aggregate ALL points by team for the unified overall ranking
  const teamScores = await Result.aggregate([
    { $match: matchQuery },
    { $group: { _id: '$teamId', totalPoints: { $sum: '$points' } } }
  ]);
  
  const scoreMap = new Map<string, number>();
  teamScores.forEach((ts) => scoreMap.set(ts._id.toString(), ts.totalPoints));
  
  const rows: LeaderboardRow[] = teams.map((team: any) => ({
    id: team._id.toString(),
    rank: 0,
    name: team.name,
    points: scoreMap.get(team._id.toString()) || 0,
    color: team.color,
  }));

  // Sort and Assign Ranks
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
  if (type === 'Design 2') presentation = 'design2';
  if (type === 'Design 3') presentation = 'design3';
  if (type === 'Design 4') presentation = 'design4';

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
