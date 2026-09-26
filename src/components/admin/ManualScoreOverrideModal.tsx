"use client";

import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { TeamRanking } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { X, Edit3, RotateCcw, Check, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

interface ManualScoreOverrideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialTeamId?: string;
}

export default function ManualScoreOverrideModal({
  isOpen,
  onClose,
  onSuccess,
  initialTeamId
}: ManualScoreOverrideModalProps) {
  const queryClient = useQueryClient();

  const { data: rankings = [], isLoading } = useQuery<TeamRanking[]>({
    queryKey: ['rankings'],
    queryFn: async () => {
      const res = await fetch('/api/teams/rankings');
      if (!res.ok) throw new Error('Failed to fetch rankings');
      return res.json();
    },
    enabled: isOpen,
    staleTime: 5000,
  });

  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [manualScoreInput, setManualScoreInput] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Update selected team and input when rankings or initialTeamId changes
  useEffect(() => {
    if (isOpen && rankings.length > 0) {
      const defaultTeamId = (initialTeamId && rankings.some(r => r.team._id === initialTeamId))
        ? initialTeamId
        : rankings[0].team._id;
      
      setSelectedTeamId(defaultTeamId);
      setError('');
      setSuccessMsg('');
    }
  }, [isOpen, rankings, initialTeamId]);

  // Find currently selected team details
  const selectedRanking = rankings.find(r => r.team._id === selectedTeamId);
  const hasOverride = selectedRanking?.manualScore !== undefined && selectedRanking?.manualScore !== null;
  const calculatedScore = selectedRanking?.calculatedPoints ?? selectedRanking?.totalPoints ?? 0;
  const currentDisplayScore = selectedRanking?.totalPoints ?? 0;

  // Sync input value when selected team changes
  useEffect(() => {
    if (selectedRanking) {
      if (hasOverride) {
        setManualScoreInput(String(selectedRanking.manualScore));
      } else {
        setManualScoreInput(String(calculatedScore));
      }
      setError('');
      setSuccessMsg('');
    }
  }, [selectedTeamId, selectedRanking, hasOverride, calculatedScore]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeamId || loading || resetting) return;

    const numScore = Number(manualScoreInput);
    if (isNaN(numScore) || numScore < 0) {
      setError('Please enter a valid non-negative score.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/teams/manual-overrides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId: selectedTeamId,
          manualScore: numScore,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save manual score override.');
      }

      setSuccessMsg(`Manual score for ${selectedRanking?.team.name} updated to ${numScore}.`);
      queryClient.invalidateQueries({ queryKey: ['rankings'] });
      queryClient.invalidateQueries({ queryKey: ['tvStateAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['tvState'] });
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!selectedTeamId || loading || resetting) return;

    setResetting(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/teams/manual-overrides', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId: selectedTeamId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset manual score override.');
      }

      setSuccessMsg(`Manual score override for ${selectedRanking?.team.name} reset to automatic calculation (${calculatedScore} PTS).`);
      queryClient.invalidateQueries({ queryKey: ['rankings'] });
      queryClient.invalidateQueries({ queryKey: ['tvStateAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['tvState'] });
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-app/90 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-[200] overflow-y-auto">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-[calc(100vw-24px)] md:max-w-lg max-h-[calc(100vh-32px)] flex flex-col overflow-hidden border border-border-card">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-border-card flex items-center justify-between bg-card-secondary">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-text-primary tracking-tight uppercase">
                MANUAL SCORE OVERRIDE
              </h2>
              <p className="text-xs text-text-muted font-medium">Manually adjust team scores on leaderboard</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-white transition-colors p-2 rounded-lg hover:bg-row"
            disabled={loading || resetting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {error && (
            <div className="p-4 rounded-xl flex items-start space-x-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-xl flex items-start space-x-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold">
              <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-8 text-text-muted">Loading teams...</div>
          ) : rankings.length === 0 ? (
            <div className="text-center py-8 text-text-muted">No teams found. Please add teams first.</div>
          ) : (
            <form onSubmit={handleSave} className="space-y-6">
              {/* Select Team */}
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">
                  Select Team
                </label>
                <select
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  className="w-full bg-card-secondary border border-border-card text-text-primary font-bold rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-purple transition-all"
                  disabled={loading || resetting}
                >
                  {rankings.map((r) => (
                    <option key={r.team._id} value={r.team._id}>
                      {r.team.name} {r.manualScore !== undefined && r.manualScore !== null ? `(Override: ${r.manualScore} PTS)` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Current Score Display */}
              {selectedRanking && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-card-secondary border border-border-card">
                    <span className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">
                      Current Calculated Score
                    </span>
                    <div className="text-2xl font-black text-text-primary tabular-nums">
                      {calculatedScore} <span className="text-xs font-bold text-text-muted uppercase">PTS</span>
                    </div>
                    <span className="text-[10px] text-text-muted block mt-1">From results system</span>
                  </div>

                  <div className={clsx(
                    "p-4 rounded-xl border transition-all",
                    hasOverride
                      ? "bg-amber-500/10 border-amber-500/30"
                      : "bg-card-secondary border-border-card"
                  )}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-text-muted">
                        Current Display Score
                      </span>
                      {hasOverride && (
                        <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          OVERRIDDEN
                        </span>
                      )}
                    </div>
                    <div className={clsx(
                      "text-2xl font-black tabular-nums",
                      hasOverride ? "text-amber-400" : "text-text-primary"
                    )}>
                      {currentDisplayScore} <span className="text-xs font-bold uppercase text-text-muted">PTS</span>
                    </div>
                    <span className="text-[10px] text-text-muted block mt-1">Shown on Leaderboard</span>
                  </div>
                </div>
              )}

              {/* Manual Score Input */}
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">
                  Manual Score
                </label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={manualScoreInput}
                  onChange={(e) => setManualScoreInput(e.target.value)}
                  placeholder="Enter manual score override"
                  disabled={loading || resetting}
                  required
                  className="text-lg font-bold font-mono"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading || resetting}
                  className="flex-1 uppercase tracking-wider py-3 shadow-lg"
                >
                  {loading ? 'Saving...' : 'SAVE OVERRIDE'}
                </Button>

                <Button
                  type="button"
                  variant="danger"
                  onClick={handleReset}
                  disabled={loading || resetting || !hasOverride}
                  className="uppercase tracking-wider py-3 disabled:opacity-30"
                  title={!hasOverride ? 'No active manual override for this team' : 'Reset to automatic calculation'}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {resetting ? 'Resetting...' : 'RESET TO AUTOMATIC'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
