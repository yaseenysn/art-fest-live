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
  Image as ImageIcon
} from 'lucide-react';
import TeamModal from '@/components/admin/TeamModal';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

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

  const { isLoading: loadingTvState } = useQuery({
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
  const totalPrograms = programs.length;
  const completedPrograms = programs.filter(p => p.status === 'completed').length;
  const livePrograms = programs.filter(p => p.status === 'live');
  const liveProgramsCount = livePrograms.length;
  const upcomingPrograms = programs.filter(p => p.status === 'upcoming').length;

  const progressPercentage = totalPrograms === 0 ? 0 : Math.round((completedPrograms / totalPrograms) * 100);

  const currentLeader = rankings.length > 0 ? rankings[0] : null;
  const runnerUp = rankings.length > 1 ? rankings[1] : null;
  const pointLead = (currentLeader && runnerUp) ? (currentLeader.totalPoints - runnerUp.totalPoints) : 0;

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <Activity className="w-12 h-12 text-primary-purple mb-4" />
          <div className="text-text-muted font-medium">Loading Dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 1. EVENT HEADER */}
      <Card>
        <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <div className="flex items-baseline space-x-2">
              <h3 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary-purple to-primary-pink tracking-tight">
                {EVENT_NAME} {new Date().getFullYear()}
              </h3>
              <span className="text-sm font-semibold text-text-muted uppercase tracking-wider">{programs.length} Programs</span>
            </div>
            {liveProgramsCount > 0 && (
              <div className="flex items-center text-xs font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded-full border border-red-500/20 w-fit mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse mr-1.5"></span>
                <span>{liveProgramsCount} Live</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <Link href="/admin/results">
              <Button variant="secondary" className="space-x-2">
                <Award className="w-4 h-4" />
                <span>Enter Result</span>
              </Button>
            </Link>
            <Link href="/tv" target="_blank">
              <Button variant="primary" className="space-x-2 shadow-primary-indigo/20 shadow-lg">
                <MonitorPlay className="w-4 h-4" />
                <span>Open TV</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* 2. TEAM SCORE CARDS (ROW 1) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {rankings.length === 0 ? (
          <div className="col-span-4 text-center py-8 text-text-muted bg-card rounded-2xl border border-border-card">
            No team data available
          </div>
        ) : rankings.map((ranking) => (
          <Card
            key={ranking.team._id as string}
            className="relative overflow-hidden group hover:border-primary-purple/30 hover:shadow-primary-purple/10 transition-all"
          >
            {/* Color Bar Accent */}
            <div
              className="absolute top-0 left-0 w-full h-1.5"
              style={{ backgroundColor: ranking.team.color }}
            />
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl drop-shadow-md">
                  {ranking.rank === 1 ? '🥇' : ranking.rank === 2 ? '🥈' : ranking.rank === 3 ? '🥉' : <span className="text-xl font-bold text-text-muted">{ranking.rank}th</span>}
                </div>
                <div
                  className="text-sm font-bold px-3 py-1 rounded-full uppercase tracking-wider"
                  style={{ backgroundColor: `${ranking.team.color}15`, color: ranking.team.color, border: `1px solid ${ranking.team.color}30` }}
                >
                  {ranking.team.name}
                </div>
              </div>
              <div>
                <div className="text-4xl font-black text-text-primary tabular-nums tracking-tight">
                  {ranking.totalPoints} <span className="text-sm font-semibold text-text-muted uppercase">Pts</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ROW 2: CURRENT PROGRAM & CURRENT LEADER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Program */}
        <Card className="lg:col-span-2 flex flex-col justify-between">
          <CardContent className="p-6">
            <h2 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4">Current Program</h2>
            {livePrograms.length > 0 ? (
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
                {livePrograms.map(liveProg => (
                  <div key={String(liveProg._id)} className="min-w-[300px] flex-1 bg-gradient-to-br from-primary-purple/20 to-primary-indigo/20 backdrop-blur-sm text-white rounded-2xl p-6 relative overflow-hidden border border-primary-purple/30 snap-center">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-indigo opacity-20 rounded-full blur-2xl -mr-10 -mt-10"></div>
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="flex items-center text-red-400 bg-red-500/10 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border border-red-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5 animate-pulse"></span>
                        LIVE NOW
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-1 truncate text-white">{liveProg.name}</h3>
                    <p className="text-primary-indigo/80 text-sm mb-4 truncate font-medium">{liveProg.language || 'Other'} • {liveProg.category}</p>
                    <Link
                      href="/admin/results"
                      className="inline-flex items-center space-x-2 bg-white/10 hover:bg-white/20 transition-colors px-4 py-2 rounded-lg text-sm font-semibold border border-white/10"
                    >
                      <Award className="w-4 h-4" />
                      <span>Manage Result</span>
                      <ChevronRight className="w-4 h-4 ml-1 opacity-50" />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-card-secondary border-2 border-dashed border-border-card rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-card rounded-xl border border-border-card flex items-center justify-center mb-4">
                  <MonitorPlay className="w-6 h-6 text-text-muted" />
                </div>
                <h3 className="font-bold text-text-primary mb-1">No Active Programs</h3>
                <p className="text-sm text-text-muted mb-4">No program is currently live</p>
                <Link href="/admin/programs">
                  <Button variant="secondary" size="sm">
                    <span>Go to Programs</span>
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Current Leader */}
        <div className="bg-gradient-to-br from-[#1E1B2E] to-[#0D0F1E] rounded-xl shadow-xl border border-border-card p-6 text-white relative overflow-hidden flex flex-col justify-between">
          {currentLeader && (
            <div
              className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-20"
              style={{ backgroundColor: currentLeader.team.color }}
            />
          )}

          <div>
            <div className="flex items-center space-x-2 mb-6">
              <Trophy className="w-5 h-5 text-amber-400 drop-shadow-md" />
              <h2 className="text-xs font-bold text-text-muted uppercase tracking-widest">Current Leader</h2>
            </div>

            {rankings.length === 0 ? (
              <div className="text-text-muted font-medium">No rankings available</div>
            ) : currentLeader ? (
              <div>
                <h3 className="text-3xl font-black mb-1 text-white">{currentLeader.team.name}</h3>
                <div className="text-4xl font-black text-amber-400 tabular-nums drop-shadow-sm">
                  {currentLeader.totalPoints} <span className="text-sm font-medium text-text-muted">PTS</span>
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-8 pt-6 border-t border-border-subtle">
            {rankings.length === 0 ? (
              <div className="text-text-muted text-sm">Waiting for results</div>
            ) : pointLead > 0 ? (
              <div className="text-emerald-400 font-bold flex items-center">
                <Activity className="w-4 h-4 mr-2" />
                +{pointLead} POINT LEAD
              </div>
            ) : runnerUp && currentLeader && runnerUp.totalPoints === currentLeader.totalPoints ? (
              <div className="text-text-muted font-bold">
                TIED FOR 1ST
              </div>
            ) : (
              <div className="text-text-muted text-sm">No lead established</div>
            )}
          </div>
        </div>
      </div>

      {/* ROW 3: COMPETITION PROGRESS */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-6">Competition Progress</h2>

          {totalPrograms === 0 ? (
            <div className="py-8 text-center text-text-muted font-medium bg-card-secondary rounded-xl border border-border-card">
              No programs created yet.
            </div>
          ) : (
            <>
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0">
                <div className="flex space-x-8">
                  <div>
                    <div className="text-3xl font-black text-text-primary">{completedPrograms}</div>
                    <div className="text-sm font-semibold text-text-muted uppercase tracking-wider">Completed</div>
                  </div>
                  <div className="bg-card-secondary border border-border-card rounded-xl p-4 flex items-center justify-between">
                    <div className="text-3xl font-black text-red-400">{liveProgramsCount}</div>
                    <div className="text-sm font-semibold text-text-muted uppercase tracking-wider">Live</div>
                  </div>
                  <div>
                    <div className="text-3xl font-black text-amber-500">{upcomingPrograms}</div>
                    <div className="text-sm font-semibold text-text-muted uppercase tracking-wider">Upcoming</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-4xl font-black text-primary-purple">{progressPercentage}%</div>
                  <div className="text-sm font-semibold text-text-muted uppercase tracking-wider">Overall Completion</div>
                </div>
              </div>

              <div className="h-3 w-full bg-input rounded-full overflow-hidden border border-border-subtle">
                <div
                  className="h-full bg-gradient-to-r from-primary-purple to-primary-indigo rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* ROW 4: RECENT RESULTS */}
      <Card>
        <div className="px-6 py-5 border-b border-border-card flex items-center justify-between bg-card-secondary">
          <h2 className="text-xs font-bold text-text-muted uppercase tracking-widest">Recent Results</h2>
          <Link href="/admin/results" className="text-sm font-bold text-primary-indigo hover:text-white transition-colors">
            View All
          </Link>
        </div>

        {recentResults.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-row text-text-muted text-xs uppercase tracking-wider font-semibold border-b border-border-card">
                  <th className="px-6 py-4">Program</th>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Team</th>
                  <th className="px-6 py-4">Position</th>
                  <th className="px-6 py-4 text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-card bg-card">
                {recentResults.slice(0, 5).map((result) => {
                  const program = result.programId as { name: string };
                  const studentName = result.studentName;
                  const team = result.teamId as { name: string, color: string };

                  return (
                    <tr key={result._id as string} className="hover:bg-row transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-text-primary">{program?.name || 'Unknown'}</div>
                        <div className="text-xs text-text-muted mt-0.5 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(result.createdAt as Date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-white">{studentName || 'Unknown'}</div>
                        <div className="text-xs text-text-muted mt-0.5 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(result.createdAt as Date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {team ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.2)]" style={{ backgroundColor: team.color }}></div>
                            <span className="font-semibold text-text-secondary">{team.name}</span>
                          </div>
                        ) : 'Unknown'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xl drop-shadow-md">
                          {result.position === 1 ? '🥇' : result.position === 2 ? '🥈' : '🥉'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-md">
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
          <div className="p-8 text-center text-text-muted font-medium bg-card">
            No competition results yet.
          </div>
        )}
      </Card>

      {/* BOTTOM: QUICK ACTIONS */}
      <div>
        <h2 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4 px-2">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <button
            onClick={() => setIsTeamModalOpen(true)}
            className="flex flex-col items-center justify-center p-6 bg-card rounded-2xl border border-border-card hover:border-primary-purple/50 hover:bg-row transition-all group"
          >
            <div className="w-12 h-12 bg-card-secondary border border-border-card rounded-full flex items-center justify-center mb-3 group-hover:bg-primary-purple/20 group-hover:border-primary-purple/30 transition-colors">
              <Users className="w-6 h-6 text-text-secondary group-hover:text-primary-purple" />
            </div>
            <span className="font-semibold text-text-primary">Add Team</span>
          </button>

          <Link href="/admin/results" className="flex flex-col items-center justify-center p-6 bg-card rounded-2xl border border-border-card hover:border-primary-purple/50 hover:bg-row transition-all group">
            <div className="w-12 h-12 bg-card-secondary border border-border-card rounded-full flex items-center justify-center mb-3 group-hover:bg-amber-500/20 group-hover:border-amber-500/30 transition-colors">
              <Award className="w-6 h-6 text-text-secondary group-hover:text-amber-400" />
            </div>
            <span className="font-semibold text-text-primary">Enter Result</span>
          </Link>

          <Link href="/admin/display" className="flex flex-col items-center justify-center p-6 bg-card rounded-2xl border border-border-card hover:border-primary-purple/50 hover:bg-row transition-all group">
            <div className="w-12 h-12 bg-card-secondary border border-border-card rounded-full flex items-center justify-center mb-3 group-hover:bg-primary-indigo/20 group-hover:border-primary-indigo/30 transition-colors">
              <Megaphone className="w-6 h-6 text-text-secondary group-hover:text-primary-indigo" />
            </div>
            <span className="font-semibold text-text-primary">Announcement</span>
          </Link>

          <Link href="/admin/media" className="flex flex-col items-center justify-center p-6 bg-card rounded-2xl border border-border-card hover:border-primary-purple/50 hover:bg-row transition-all group">
            <div className="w-12 h-12 bg-card-secondary border border-border-card rounded-full flex items-center justify-center mb-3 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/30 transition-colors">
              <ImageIcon className="w-6 h-6 text-text-secondary group-hover:text-emerald-400" />
            </div>
            <span className="font-semibold text-text-primary">Media Control</span>
          </Link>

          <Link href="/tv" target="_blank" className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-primary-purple to-primary-indigo rounded-2xl border border-border-card hover:shadow-lg hover:shadow-primary-purple/20 transition-all group">
            <div className="w-12 h-12 bg-black/20 rounded-full flex items-center justify-center mb-3 group-hover:bg-black/30 transition-colors">
              <MonitorPlay className="w-6 h-6 text-white" />
            </div>
            <span className="font-semibold text-white drop-shadow-sm">Open TV</span>
          </Link>
        </div>
      </div>

      {/* CONNECTION STATUS */}
      <div className="mt-8 flex items-center justify-center pt-8">
        {connected ? (
          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Live Server Connected</span>
            <Wifi className="w-3.5 h-3.5 ml-1 opacity-50" />
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-xs font-bold text-red-400 uppercase tracking-widest bg-red-500/10 px-4 py-2 rounded-full border border-red-500/20">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span>Live Connection Disconnected</span>
            <WifiOff className="w-3.5 h-3.5 ml-1" />
          </div>
        )}
      </div>

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
