import { Types } from 'mongoose';

export interface ITeam {
  _id: Types.ObjectId | string;
  name: string;
  shortName?: string;
  slug: string;
  color: string;
  logoUrl?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface IStudent {
  _id: Types.ObjectId | string;
  name: string;
  teamId: Types.ObjectId | string | ITeam;
  className?: string;
  photoUrl?: string;
  createdAt: Date;
}

export type ProgramStatus = 'upcoming' | 'live' | 'completed';

export const EVENT_NAME = 'AL MAHSAN';
export const PROGRAM_LANGUAGES = ['Malayalam', 'Arabic', 'English', 'Urdu', 'Hindi', 'Other'] as const;
export const PROGRAM_CATEGORIES = ['Senior', 'Junior', 'Sub Junior'] as const;

export interface IProgram {
  _id: Types.ObjectId | string;
  name: string;
  language: string;
  category: string;
  type?: 'Individual' | 'Team';
  description?: string;
  programOrder?: number;
  maxPoints?: number;
  status: ProgramStatus;
  posterCreated?: boolean;
  posterCreatedAt?: Date;
  posterCount?: number;
  allWinnersPosterCount?: number;
  createdAt: Date;
}

export type Position = 1 | 2 | 3;

export const POSITION_DEFAULT_POINTS = {
  1: 10,
  2: 5,
  3: 3,
} as const;

export interface IResult {
  _id: Types.ObjectId | string;
  programId: Types.ObjectId | string | IProgram;
  studentName: string;
  teamId: Types.ObjectId | string | ITeam;
  position: Position;
  points: number;
  revealed: boolean;
  createdAt: Date;
}

export interface IAnnouncement {
  _id: Types.ObjectId | string;
  message: string;
  type?: string;
  duration?: number;
  createdAt: Date;
}

export interface TeamRanking {
  team: {
    _id: string;
    name: string;
    shortName?: string;
    slug: string;
    color: string;
  };
  totalPoints: number;
  rank: number;
}

export interface LeaderboardRow {
  id: string;
  rank: number;
  name: string;
  points: number | string;
  color?: string;
}

export interface LeaderboardConfig {
  title: string;
  subtitle: string;
  showPoints: boolean;
  showColor: boolean;
  presentation?: 'design1' | 'design2' | 'design3' | 'design4';
  type?: string;
  rows: LeaderboardRow[];
}



