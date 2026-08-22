"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { TeamRanking, IProgram, IResult, EVENT_NAME } from '@/types';
import { getSocket } from '@/lib/socket-client';
import { SOCKET_EVENTS } from '@/lib/socket';
import {
  MonitorPlay,
  Award,
  Megaphone,
  Trophy,
  Activity,
  Wifi,
  WifiOff,
  Clock,
  ChevronRight,
  Users,
  Tv,
  Power
} from 'lucide-react';
import TeamModal from '@/components/admin/TeamModal';

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const [connected, setConnected] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);

  const { data: rankings = [], isLoading: loadingRankings } = useQuery<TeamRanking[]>({
    queryKey: ['rankings'],
    queryFn: async () => {
      const res = await fetch('/api/teams/rankings');
      if (!res.ok) throw new Error('Failed to fetch rankings');
      return res.json();
    },
    staleTime: 15000,
  });

  const { data: programs = [], isLoading: loadingPrograms } = useQuery<IProgram[]>({
    queryKey: ['programs'],
    queryFn: async () => {
      const res = await fetch('/api/programs');
      if (!res.ok) throw new Error('Failed to fetch programs');
      return res.json();
    },
    staleTime: 30000,
  });

  const { data: recentResults = [], isLoading: loadingResults } = useQuery<IResult[]>({
    queryKey: ['results', 'recent'],
    queryFn: async () => {
      const res = await fetch('/api/results?limit=5');
      if (!res.ok) throw new Error('Failed to fetch results');
      return res.json();
    },
    staleTime: 15000,
  });

  const { data: tvState, isLoading: loadingTvState } = useQuery({
    queryKey: ['tvStateAdmin'],
    queryFn: async () => {
      const res = await fetch('/api/tv-state');
      if (!res.ok) throw new Error('Failed to fetch tv state');
      return res.json();
    },
    staleTime: 15000,
  });



  // Only show initial load if data is undefined and currently fetching
  const loading = loadingRankings || loadingPrograms || loadingResults || loadingTvState;

  useEffect(() => {

    // Socket.IO Setup
    const socket = getSocket();

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConnected(socket.connected);

    const onScoreUpdated = (newRankings: TeamRanking[]) => {
      if (Array.isArray(newRankings) && newRankings.length > 0) {
        queryClient.setQueryData(['rankings'], newRankings);
      } else {
        queryClient.invalidateQueries({ queryKey: ['rankings'] });
      }
    };

    const onResultSaved = () => {
      queryClient.invalidateQueries({ queryKey: ['results', 'recent'] });
    };

    const onTeamChange = () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['rankings'] });
    };

    const onProgramChange = () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
    };

    const onEventReset = () => {
      queryClient.removeQueries({ queryKey: ['programs'] });
      queryClient.removeQueries({ queryKey: ['teams'] });
      queryClient.removeQueries({ queryKey: ['rankings'] });
      queryClient.removeQueries({ queryKey: ['results'] });
      setIsTeamModalOpen(false);
      
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      queryClient.invalidateQueries({ queryKey: ['rankings'] });
      queryClient.invalidateQueries({ queryKey: ['results', 'recent'] });
    };

    socket.on(SOCKET_EVENTS.SCORE_UPDATED, onScoreUpdated);
    socket.on(SOCKET_EVENTS.RESULT_SAVED, onResultSaved);
    socket.on(SOCKET_EVENTS.TEAM_CREATED, onTeamChange);
    socket.on(SOCKET_EVENTS.TEAM_UPDATED, onTeamChange);
    socket.on(SOCKET_EVENTS.TEAM_DELETED, onTeamChange);
    socket.on(SOCKET_EVENTS.PROGRAM_CREATED, onProgramChange);
    socket.on(SOCKET_EVENTS.PROGRAM_UPDATED, onProgramChange);
    socket.on(SOCKET_EVENTS.PROGRAM_DELETED, onProgramChange);
    socket.on(SOCKET_EVENTS.EVENT_RESET, onEventReset);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off(SOCKET_EVENTS.SCORE_UPDATED, onScoreUpdated);
      socket.off(SOCKET_EVENTS.RESULT_SAVED, onResultSaved);
      socket.off(SOCKET_EVENTS.TEAM_CREATED, onTeamChange);
      socket.off(SOCKET_EVENTS.TEAM_UPDATED, onTeamChange);
      socket.off(SOCKET_EVENTS.TEAM_DELETED, onTeamChange);
      socket.off(SOCKET_EVENTS.PROGRAM_CREATED, onProgramChange);
      socket.off(SOCKET_EVENTS.PROGRAM_UPDATED, onProgramChange);
      socket.off(SOCKET_EVENTS.PROGRAM_DELETED, onProgramChange);
      socket.off(SOCKET_EVENTS.EVENT_RESET, onEventReset);
    };
  }, [queryClient]);

  // -- Derived State Computations --

  // 1. Programs Progress
  const totalPrograms = programs.length;
  const completedPrograms = programs.filter(p => p.status === 'completed').length;
  const livePrograms = programs.filter(p => p.status === 'live');
  const liveProgramsCount = livePrograms.length;
  const upcomingPrograms = programs.filter(p => p.status === 'upcoming').length;

  const progressPercentage = totalPrograms === 0 ? 0 : Math.round((completedPrograms / totalPrograms) * 100);

  // 3. Current Leader
  const currentLeader = rankings.length > 0 ? rankings[0] : null;
  const runnerUp = rankings.length > 1 ? rankings[1] : null;
  const pointLead = (currentLeader && runnerUp) ? (currentLeader.totalPoints - runnerUp.totalPoints) : 0;



  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <Activity className="w-12 h-12 text-slate-300 mb-4" />
          <div className="text-slate-400 font-medium">Loading Dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-12 space-y-8">

      {/* 1. EVENT HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{EVENT_NAME} {new Date().getFullYear()}</h3>
            <span className="text-sm font-semibold text-slate-500 uppercase">{programs.length} Programs</span>
          </div>
          {liveProgramsCount > 0 && (
            <div className="flex items-center text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded w-fit mt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse mr-1.5"></span>
              <span>{liveProgramsCount} Live</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <Link
            href="/admin/results"
            className="flex items-center space-x-2 bg-slate-900 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Award className="w-4 h-4" />
            <span>Enter Result</span>
          </Link>
          <Link
            href="/tv"
            target="_blank"
            className="flex items-center space-x-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-600/20"
          >
            <MonitorPlay className="w-4 h-4" />
            <span>Open TV</span>
          </Link>
        </div>
      </div>



      {/* 2. TEAM SCORE CARDS (ROW 1) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {rankings.length === 0 ? (
          <div className="col-span-4 text-center py-8 text-slate-500 bg-white rounded-2xl border border-slate-200">
            No team data available
          </div>
        ) : rankings.map((ranking) => (
          <div
            key={ranking.team._id as string}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative group hover:shadow-md transition-shadow"
          >
            {/* Color Bar Accent */}
            <div
              className="absolute top-0 left-0 w-full h-1.5"
              style={{ backgroundColor: ranking.team.color }}
            />

            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl">
                  {ranking.rank === 1 ? '🥇' : ranking.rank === 2 ? '🥈' : ranking.rank === 3 ? '🥉' : <span className="text-xl font-bold text-slate-400">{ranking.rank}th</span>}
                </div>
                <div
                  className="text-sm font-bold px-3 py-1 rounded-full uppercase tracking-wider"
                  style={{ backgroundColor: `${ranking.team.color}15`, color: ranking.team.color }}
                >
                  {ranking.team.name}
                </div>
              </div>

              <div>
                <div className="text-4xl font-black text-slate-800 tabular-nums tracking-tight">
                  {ranking.totalPoints} <span className="text-sm font-semibold text-slate-400 uppercase">Pts</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ROW 2: CURRENT PROGRAM & CURRENT LEADER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Current Program */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Current Program</h2>
            {/* MULTIPLE LIVE PROGRAMS */}
            {livePrograms.length > 0 ? (
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
                {livePrograms.map(liveProg => (
                  <div key={String(liveProg._id)} className="min-w-[300px] flex-1 bg-gradient-to-br from-indigo-900 to-indigo-950 text-white rounded-2xl p-6 relative overflow-hidden shadow-lg border border-indigo-800 snap-center">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 opacity-10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="flex items-center text-red-400 bg-red-400/10 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border border-red-400/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5 animate-pulse"></span>
                        LIVE NOW
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-1 truncate">{liveProg.name}</h3>
                    <p className="text-indigo-200 text-sm mb-4 truncate">{liveProg.language || 'Other'} • {liveProg.category}</p>
                    <Link
                      href="/admin/results"
                      className="inline-flex items-center space-x-2 bg-white/10 hover:bg-white/20 transition-colors px-4 py-2 rounded-lg text-sm font-semibold backdrop-blur-sm border border-white/10"
                    >
                      <Award className="w-4 h-4" />
                      <span>Manage Result</span>
                      <ChevronRight className="w-4 h-4 ml-1 opacity-50" />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center mb-4">
                  <MonitorPlay className="w-6 h-6 text-slate-400" />
                </div>
                <h3 className="font-bold text-slate-700 mb-1">No Active Programs</h3>
                <p className="text-sm text-slate-500 mb-4">No program is currently live</p>
                <Link
                  href="/admin/programs"
                  className="inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold hover:border-slate-300 transition-colors"
                >
                  <span>Go to Programs</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Current Leader */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-sm border border-slate-800 p-6 text-white relative overflow-hidden flex flex-col justify-between">
          {/* Decorative glow */}
          {currentLeader && (
            <div
              className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-30"
              style={{ backgroundColor: currentLeader.team.color }}
            />
          )}

          <div>
            <div className="flex items-center space-x-2 mb-6">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Current Leader</h2>
            </div>

            {rankings.length === 0 ? (
              <div className="text-slate-400 font-medium">No rankings available</div>
            ) : currentLeader ? (
              <div>
                <h3 className="text-3xl font-black mb-1">{currentLeader.team.name}</h3>
                <div className="text-4xl font-black text-amber-500 tabular-nums">
                  {currentLeader.totalPoints} <span className="text-sm font-medium text-slate-400">PTS</span>
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-700/50">
            {rankings.length === 0 ? (
              <div className="text-slate-500 text-sm">Waiting for results</div>
            ) : pointLead > 0 ? (
              <div className="text-emerald-400 font-bold flex items-center">
                <Activity className="w-4 h-4 mr-2" />
                +{pointLead} POINT LEAD
              </div>
            ) : runnerUp && currentLeader && runnerUp.totalPoints === currentLeader.totalPoints ? (
              <div className="text-slate-400 font-bold">
                TIED FOR 1ST
              </div>
            ) : (
              <div className="text-slate-500 text-sm">No lead established</div>
            )}
          </div>
        </div>
      </div>

      {/* ROW 3: COMPETITION PROGRESS */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Competition Progress</h2>

        {totalPrograms === 0 ? (
          <div className="py-8 text-center text-slate-500 font-medium bg-slate-50 rounded-xl border border-slate-100">
            No programs created yet.
          </div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0">
              <div className="flex space-x-8">
                <div>
                  <div className="text-3xl font-black text-slate-800">{completedPrograms}</div>
                  <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Completed</div>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between">
                  <div className="text-3xl font-black text-red-600">{liveProgramsCount}</div>
                  <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Live</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-amber-600">{upcomingPrograms}</div>
                  <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Upcoming</div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-4xl font-black text-indigo-600">{progressPercentage}%</div>
                <div className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Overall Completion</div>
              </div>
            </div>

            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </>
        )}
      </div>

      {/* ROW 4: RECENT RESULTS */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recent Results</h2>
          <Link href="/admin/results" className="text-sm font-bold text-indigo-600 hover:text-indigo-700">
            View All
          </Link>
        </div>

        {recentResults.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                  <th className="px-6 py-4">Program</th>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Team</th>
                  <th className="px-6 py-4">Position</th>
                  <th className="px-6 py-4 text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentResults.slice(0, 5).map((result) => {
                  const program = result.programId as { name: string };
                  const studentName = result.studentName;
                  const team = result.teamId as { name: string, color: string };

                  return (
                    <tr key={result._id as string} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">{program?.name || 'Unknown'}</div>
                        <div className="text-xs text-slate-400 mt-0.5 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(result.createdAt as Date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{studentName || 'Unknown'}</div>
                        <div className="text-xs text-slate-400 mt-0.5 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(result.createdAt as Date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {team ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: team.color }}></div>
                            <span className="font-semibold text-slate-600">{team.name}</span>
                          </div>
                        ) : 'Unknown'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xl">
                          {result.position === 1 ? '🥇' : result.position === 2 ? '🥈' : '🥉'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                          +{result.points}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500 font-medium">
            No competition results yet.
          </div>
        )}
      </div>

      {/* BOTTOM: QUICK ACTIONS */}
      <div>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => setIsTeamModalOpen(true)}
            className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all group"
          >
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3 group-hover:bg-slate-100 transition-colors">
              <Users className="w-6 h-6 text-slate-600" />
            </div>
            <span className="font-semibold text-slate-700">Add Team</span>
          </button>

          <Link href="/admin/results" className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all group">
            <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mb-3 group-hover:bg-amber-100 transition-colors">
              <Award className="w-6 h-6 text-amber-600" />
            </div>
            <span className="font-semibold text-slate-700">Enter Result</span>
          </Link>

          <Link href="/admin/display" className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all group">
            <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mb-3 group-hover:bg-indigo-100 transition-colors">
              <Megaphone className="w-6 h-6 text-indigo-600" />
            </div>
            <span className="font-semibold text-slate-700">Announcement</span>
          </Link>

          <Link href="/tv" target="_blank" className="flex flex-col items-center justify-center p-6 bg-slate-900 rounded-2xl border border-slate-800 hover:bg-slate-800 hover:shadow-md transition-all group">
            <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-3 group-hover:bg-slate-700 transition-colors">
              <MonitorPlay className="w-6 h-6 text-indigo-400" />
            </div>
            <span className="font-semibold text-white">Open TV</span>
          </Link>
        </div>
      </div>

      {/* CONNECTION STATUS */}
      <div className="mt-8 flex items-center justify-center pt-8">
        {connected ? (
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 uppercase tracking-widest bg-slate-100 px-4 py-2 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Live Server Connected</span>
            <Wifi className="w-3.5 h-3.5 ml-1 opacity-50" />
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-xs font-bold text-red-600 uppercase tracking-widest bg-red-50 px-4 py-2 rounded-full border border-red-100">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
            <span>Live Connection Disconnected</span>
            <WifiOff className="w-3.5 h-3.5 ml-1" />
          </div>
        )}
      </div>

      {/* Team Modal */}
      <TeamModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['teams'] });
          queryClient.invalidateQueries({ queryKey: ['rankings'] });
        }}
      />
    </div>
  );
}
