"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MonitorPlay, EyeOff, RotateCcw, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import FinalTeamReveal from '../../tv/components/FinalTeamReveal';
import clsx from 'clsx';
import { Select } from '@/components/ui/Select';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function FinalRevealAdminPage() {
  const [positions, setPositions] = useState<Record<string, number | ''>>({});
  const [nextToReveal, setNextToReveal] = useState<number>(1);
  const [isStarting, setIsStarting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  
  const queryClient = useQueryClient();

  // Fetch TV State
  const { data: tvState, refetch: refetchTvState } = useQuery<any>({
    queryKey: ['tvState'],
    queryFn: async () => {
      const res = await fetch('/api/tv-state');
      if (!res.ok) throw new Error('Failed to fetch TV state');
      return res.json();
    }
  });

  // Fetch Existing Teams
  const { data: dbTeams = [], isLoading: isLoadingTeams } = useQuery<any[]>({
    queryKey: ['teams'],
    queryFn: async () => {
      const res = await fetch('/api/teams');
      if (!res.ok) throw new Error('Failed to fetch teams');
      return res.json();
    }
  });

  const isActiveOnTv = tvState?.presentationType === 'FINAL_TEAM_REVEAL' && tvState?.finalRevealActive === true;

  const handleUpdatePosition = (teamId: string, position: number | '') => {
    setPositions(prev => ({ ...prev, [teamId]: position }));
  };

  // Build a list of selected positions to disable them in other dropdowns
  const selectedPositions = Object.values(positions).filter(p => typeof p === 'number') as number[];

  // Form is valid if exactly 4 unique positions (1,2,3,4) are assigned
  const isFormValid = dbTeams.length > 0 && [1, 2, 3, 4].every(pos => selectedPositions.includes(pos));

  // Find the team assigned to nextToReveal
  const teamForNextRevealId = Object.keys(positions).find(id => positions[id] === nextToReveal);
  const teamForNextReveal = dbTeams.find(t => t._id === teamForNextRevealId);
  const isFinished = nextToReveal > 4;

  const handleStartNextReveal = async () => {
    if (!teamForNextReveal) return;
    setIsStarting(true);
    try {
      const duration = 24 * 60 * 60; // 24 hours (manual control override)
      const startedAt = new Date();
      const expiresAt = new Date(startedAt.getTime() + duration * 1000);
      await fetch('/api/tv-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          finalRevealActive: true,
          finalRevealTeamName: teamForNextReveal.name,
          finalRevealPosition: nextToReveal,
          presentationId: crypto.randomUUID(),
          presentationType: 'FINAL_TEAM_REVEAL',
          presentationStartedAt: startedAt.toISOString(),
          presentationExpiresAt: expiresAt.toISOString(),
          presentationDuration: duration,
          isActive: true
        })
      });
      await refetchTvState();
    } catch (err) {
      console.error(err);
      alert('Failed to activate reveal.');
    } finally {
      setIsStarting(false);
    }
  };

  const handleEndReveal = async () => {
    setIsResetting(true);
    try {
      await fetch('/api/tv-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          finalRevealActive: false,
          presentationType: null,
          presentationId: null,
          presentationExpiresAt: null,
          presentationStartedAt: null,
          presentationDuration: null,
          isActive: false // Force the leaderboard to be hidden
        })
      });
      await refetchTvState();
      
      // Advance to next position ONLY when the current reveal ends
      setNextToReveal(prev => prev + 1);
    } catch (err) {
      console.error(err);
      alert('Failed to end reveal.');
    } finally {
      setIsResetting(false);
    }
  };

  const handleResetFlow = () => {
    setNextToReveal(1);
  };

  const getOrdinal = (n: number) => {
    if (n === 1) return '1ST';
    if (n === 2) return '2ND';
    if (n === 3) return '3RD';
    return '4TH';
  };

  return (
    <div className="min-h-screen bg-card-secondary p-8 pb-32">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between bg-card p-6 rounded-2xl shadow-sm border border-border-card">
          <div className="flex items-center space-x-4">
            <div className="bg-primary-purple/20 p-3 rounded-xl">
              <MonitorPlay className="w-8 h-8 text-primary-indigo" />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight text-white">
                Final Team Reveal
              </h1>
              <p className="text-text-muted font-medium mt-1">Standalone one-by-one cinematic reveal control</p>
            </div>
          </div>
          <Link 
            href="/admin/display" 
            className="flex items-center space-x-2 text-text-secondary bg-row hover:bg-slate-200 px-6 py-3 rounded-xl font-bold transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>BACK TO DISPLAY CONTROL</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Controls Panel */}
          <div className="lg:col-span-8 space-y-6">
            
            <div className="bg-card rounded-2xl shadow-sm border border-border-card p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-text-primary uppercase tracking-wide">
                  Configuration
                </h2>
                <button 
                  onClick={handleResetFlow}
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 underline"
                >
                  Reset Flow to 1st Place
                </button>
              </div>

              {isLoadingTeams ? (
                <div className="flex flex-col items-center justify-center py-12 text-text-muted">
                  <Loader2 className="w-8 h-8 animate-spin mb-4" />
                  <p className="font-bold uppercase tracking-widest text-sm">Loading Teams...</p>
                </div>
              ) : dbTeams.length === 0 ? (
                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-800 p-6 rounded-xl font-medium text-center">
                  No teams found in the database. Please add teams in Team Management first.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {dbTeams.map((team, idx) => {
                    const currentPos = positions[team._id] || '';
                    return (
                      <div key={team._id} className="bg-card-secondary p-4 rounded-xl border border-border-card flex flex-col justify-between">
                        <div>
                          <div className="text-xs font-black text-text-muted mb-2 uppercase tracking-widest">
                            Card {idx + 1}
                          </div>
                          <div className="text-2xl font-bold text-white mb-4" style={{ color: team.color || 'white' }}>
                            {team.name}
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-bold text-text-primary mb-1 uppercase tracking-wide">
                            Assign Position
                          </label>
                          <Select
                            value={currentPos}
                            onChange={(e: any) => handleUpdatePosition(team._id, e.target.value === '' ? '' : Number(e.target.value))}
                            wrapperClassName="font-bold uppercase text-sm"
                          >
                            <option value="">-- SELECT --</option>
                            {[1, 2, 3, 4].map(num => {
                              const isUsed = selectedPositions.includes(num) && currentPos !== num;
                              return (
                                <option key={num} value={num} disabled={isUsed}>
                                  {getOrdinal(num)} PLACE
                                </option>
                              );
                            })}
                          </Select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {!isLoadingTeams && !isFormValid && dbTeams.length > 0 && (
                <div className="mt-6 bg-amber-500/10 border border-amber-500/20 text-amber-800 p-4 rounded-xl text-sm font-medium flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p>Assign exactly 1st, 2nd, 3rd, and 4th positions to the teams before the reveal can start.</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="bg-card rounded-2xl shadow-sm border border-border-card p-8">
              <h2 className="text-xl font-bold text-text-primary uppercase tracking-wide mb-6 flex items-center justify-between">
                <span>Reveal Flow</span>
                {isActiveOnTv && (
                  <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                    <span className="animate-pulse h-2 w-2 bg-emerald-500 rounded-full"></span>
                    <span>ACTIVE ON TV</span>
                  </div>
                )}
              </h2>

              <div className="space-y-4">
                {isFinished ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 p-6 rounded-xl flex flex-col items-center justify-center text-center">
                    <CheckCircle2 className="w-12 h-12 mb-3" />
                    <h3 className="text-lg font-black uppercase tracking-widest">Reveal Finished</h3>
                    <p className="text-sm font-medium mt-1 opacity-80">All 4 teams have been revealed.</p>
                  </div>
                ) : (
                  <>
                    {!isActiveOnTv ? (
                      <button
                        onClick={handleStartNextReveal}
                        disabled={isStarting || !isFormValid || !teamForNextReveal}
                        className="w-full flex items-center justify-center space-x-3 bg-emerald-600 text-white rounded-xl py-5 font-black uppercase tracking-widest text-lg hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-600/30 disabled:opacity-50 border border-emerald-500/20"
                      >
                        <MonitorPlay className="w-6 h-6" />
                        <span>
                          {nextToReveal === 1 
                            ? 'START REVEAL (1ST PLACE)' 
                            : `REVEAL NEXT (${getOrdinal(nextToReveal)} PLACE)`}
                        </span>
                      </button>
                    ) : (
                      <button
                        onClick={handleEndReveal}
                        disabled={isResetting}
                        className="w-full flex items-center justify-center space-x-3 bg-red-600 text-white rounded-xl py-5 font-black uppercase tracking-widest text-lg hover:bg-red-500 transition-colors shadow-lg disabled:opacity-50 border border-red-500/20"
                      >
                        <RotateCcw className="w-6 h-6" />
                        <span>
                          END {getOrdinal(tvState?.finalRevealPosition || nextToReveal)} PLACE
                        </span>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
            
          </div>

          {/* Right Panel - Information / Preview Note */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-card-secondary rounded-2xl shadow-xl overflow-hidden border border-border-card p-6">
               <h3 className="font-black text-white uppercase tracking-widest mb-4 flex items-center">
                 <EyeOff className="w-5 h-5 mr-2 text-indigo-400" />
                 How this works
               </h3>
               <div className="space-y-4 text-sm text-text-muted font-medium">
                 <p>
                   This panel controls a <strong>manual one-by-one reveal</strong>.
                 </p>
                 <ul className="list-disc pl-5 space-y-2 text-white/80">
                   <li>Assign exactly 1st, 2nd, 3rd, and 4th place to your existing teams.</li>
                   <li>Clicking <span className="text-emerald-400 font-bold">START / REVEAL</span> will push exactly ONE team to the TV based on the active position (1st, then 2nd, etc).</li>
                   <li>Clicking <span className="text-red-400 font-bold">END</span> immediately returns the TV to the <span className="italic">"Hide Leaderboard"</span> waiting state.</li>
                   <li>The TV will never advance automatically. You decide exactly when to move to the next position.</li>
                 </ul>
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
