"use client";

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { IProgram, ITeam, IResult, EVENT_NAME, POSITION_DEFAULT_POINTS } from '@/types';
import clsx from 'clsx';
import { AlertCircle, CheckCircle2, Image as ImageIcon, Download, MonitorPlay, Plus, Trash2, Edit2 } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import CongratulationsPoster from '@/components/CongratulationsPoster';
import AllWinnersPoster, { WinnerData } from '@/components/AllWinnersPoster';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import AllWinnersRouter from '../../tv/components/AllWinnersRouter';
import { getSocket } from '@/lib/socket-client';
import { SOCKET_EVENTS } from '@/lib/socket';

const getPositionLabel = (pos: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = pos % 100;
  return pos + (s[(v - 20) % 10] || s[v] || s[0]) + " Place";
};

export default function ResultsEntry() {
  const queryClient = useQueryClient();

  const { data: programs = [], isLoading: loadingPrograms } = useQuery<IProgram[]>({
    queryKey: ['programs'],
    queryFn: async () => {
      const res = await fetch('/api/programs');
      if (!res.ok) throw new Error('Failed to fetch programs');
      return res.json();
    },
    staleTime: 30000,
  });

  const { data: teams = [], isLoading: loadingTeams } = useQuery<ITeam[]>({
    queryKey: ['teams'],
    queryFn: async () => {
      const res = await fetch('/api/teams');
      if (!res.ok) throw new Error('Failed to fetch teams');
      return res.json();
    },
    staleTime: 30000,
  });

  const { data: recentResults = [], isLoading: loadingRecent } = useQuery<IResult[]>({
    queryKey: ['results', 'recent'],
    queryFn: async () => {
      const res = await fetch('/api/results?limit=5');
      if (!res.ok) throw new Error('Failed to fetch results');
      return res.json();
    },
    staleTime: 15000,
  });

  const [selectedProgramId, setSelectedProgramId] = useState<string>('');
  
  const { data: savedResultData = [], isLoading: loadingSavedResults } = useQuery<IResult[]>({
    queryKey: ['results', selectedProgramId],
    queryFn: async () => {
      const res = await fetch(`/api/results?programId=${selectedProgramId}`);
      if (!res.ok) throw new Error('Failed to fetch results');
      return res.json();
    },
    enabled: !!selectedProgramId,
    staleTime: 30000,
  });

  const { data: tvState, refetch: refetchTvState } = useQuery<any>({
    queryKey: ['tvState'],
    queryFn: async () => {
      const res = await fetch('/api/tv-state');
      if (!res.ok) throw new Error('Failed to fetch TV state');
      return res.json();
    }
  });

  const loading = loadingPrograms || loadingTeams || loadingRecent;
  
  // Dynamic rows for ADDING NEW results
  const [newResultRows, setNewResultRows] = useState<Array<{ id: string, studentName: string, teamId: string, position: number, points: number, pointsModified: boolean }>>([
    { id: '1', studentName: '', teamId: '', position: 1, points: POSITION_DEFAULT_POINTS[1], pointsModified: false }
  ]);
  
  const [saveStatus, setSaveStatus] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Inline editing state for saved results
  const [editingResultId, setEditingResultId] = useState<string | null>(null);
  const [editingResultData, setEditingResultData] = useState<{ studentName: string, teamId: string, position: number, points: number } | null>(null);

  // Re-reveal toast state tracking per position
  const [revealToasts, setRevealToasts] = useState<{ [pos: number]: boolean }>({});
  
  // Track active reveal stage for UI disabling
  const [activeRevealState, setActiveRevealState] = useState<{pos: number, stage: 'PLACE'|'WINNER'} | null>(null);

  // Poster State
  const [isPosterModalOpen, setIsPosterModalOpen] = useState(false);
  const [posterResultId, setPosterResultId] = useState<string | null>(null);
  const [generatedPosterUrl, setGeneratedPosterUrl] = useState<string | null>(null);
  const [isGeneratingPoster, setIsGeneratingPoster] = useState(false);

  // All-Winners Poster State
  const [isAllWinnersPosterModalOpen, setIsAllWinnersPosterModalOpen] = useState(false);
  const [generatedAllWinnersPosterUrl, setGeneratedAllWinnersPosterUrl] = useState<string | null>(null);
  const [isGeneratingAllWinnersPoster, setIsGeneratingAllWinnersPoster] = useState(false);

  // TV Display Durations
  const [resultRevealDisplayTime, setResultRevealDisplayTime] = useState<number>(15);
  const [allWinnersDisplayTime, setAllWinnersDisplayTime] = useState<number>(20);

  useEffect(() => {
    if (programs.length > 0 && !selectedProgramId) {
      const livePrograms = programs.filter(p => p.status === 'live');
      if (livePrograms.length > 0) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedProgramId(String(livePrograms[0]._id));
      }
    }
  }, [programs, selectedProgramId]);

  useEffect(() => {
    const socket = getSocket();

    const onTeamChange = (payload?: { _id: string }) => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      if (payload?._id) {
        setNewResultRows(prev => prev.map(row => row.teamId === payload._id ? { ...row, teamId: '' } : row));
      }
    };

    const onProgramDeleted = (payload?: { programId: string }) => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      if (payload?.programId) {
        setSelectedProgramId(current => current === payload.programId ? '' : current);
      }
    };
    
    const onProgramChange = () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
    };

    const onEventReset = () => {
      setSelectedProgramId('');
      setGeneratedPosterUrl(null);
      setIsPosterModalOpen(false);
      setGeneratedAllWinnersPosterUrl(null);
      setIsAllWinnersPosterModalOpen(false);
      
      queryClient.removeQueries({ queryKey: ['programs'] });
      queryClient.removeQueries({ queryKey: ['teams'] });
      queryClient.removeQueries({ queryKey: ['results'] });
      
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    };
    
    const onResultSaved = () => {
      queryClient.invalidateQueries({ queryKey: ['results', selectedProgramId] });
      queryClient.invalidateQueries({ queryKey: ['results', 'recent'] });
    };

    socket.on(SOCKET_EVENTS.TEAM_CREATED, onTeamChange);
    socket.on(SOCKET_EVENTS.TEAM_UPDATED, onTeamChange);
    socket.on(SOCKET_EVENTS.TEAM_DELETED, onTeamChange);
    socket.on(SOCKET_EVENTS.PROGRAM_CREATED, onProgramChange);
    socket.on(SOCKET_EVENTS.PROGRAM_UPDATED, onProgramChange);
    socket.on(SOCKET_EVENTS.PROGRAM_DELETED, onProgramDeleted);
    socket.on(SOCKET_EVENTS.RESULT_SAVED, onResultSaved);
    socket.on(SOCKET_EVENTS.EVENT_RESET, onEventReset);

    return () => {
      socket.off(SOCKET_EVENTS.TEAM_CREATED, onTeamChange);
      socket.off(SOCKET_EVENTS.TEAM_UPDATED, onTeamChange);
      socket.off(SOCKET_EVENTS.TEAM_DELETED, onTeamChange);
      socket.off(SOCKET_EVENTS.PROGRAM_CREATED, onProgramChange);
      socket.off(SOCKET_EVENTS.PROGRAM_UPDATED, onProgramChange);
      socket.off(SOCKET_EVENTS.PROGRAM_DELETED, onProgramDeleted);
      socket.off(SOCKET_EVENTS.RESULT_SAVED, onResultSaved);
      socket.off(SOCKET_EVENTS.EVENT_RESET, onEventReset);
    };
  }, [queryClient, selectedProgramId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSaveStatus(null);
     
    setEditingResultId(null);
  }, [selectedProgramId]);

  const selectedProgram = programs.find(p => String(p._id) === selectedProgramId);

  // --- ADD NEW RESULTS WORKFLOW ---

  const getNextAvailablePosition = () => {
    const usedPositions = new Set(newResultRows.map(r => r.position));
    let pos = 1;
    while (usedPositions.has(pos)) {
      pos++;
    }
    return pos;
  };

  const handleAddRow = () => {
    const nextPos = getNextAvailablePosition();
    const defaultPoints = (POSITION_DEFAULT_POINTS as any)[nextPos] || 0;
    setNewResultRows([...newResultRows, { 
      id: Date.now().toString() + Math.random(), 
      studentName: '', 
      teamId: '', 
      position: nextPos, 
      points: defaultPoints, 
      pointsModified: false 
    }]);
  };

  const handleRemoveRow = (id: string) => {
    setNewResultRows(newResultRows.filter(r => r.id !== id));
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateRow = (id: string, field: string, value: any) => {
    setNewResultRows(newResultRows.map(r => {
      if (r.id !== id) return r;
      if (field === 'position' && !r.pointsModified) {
        const newPos = parseInt(value);
        return { ...r, position: newPos, points: (POSITION_DEFAULT_POINTS as any)[newPos] || r.points };
      }
      if (field === 'points') {
        return { ...r, points: parseInt(value) || 0, pointsModified: true };
      }
      return { ...r, [field]: value };
    }));
  };

  const validateNewRows = () => {
    if (!selectedProgram) return "No program selected.";
    if (newResultRows.length === 0) return "Add at least one result.";
    
    for (let i=0; i<newResultRows.length; i++) {
      const p = newResultRows[i];
      if (!p.studentName || p.studentName.trim().length < 2) return `Row ${i+1}: Student name must be at least 2 characters.`;
      if (!p.teamId) return `Row ${i+1}: Team is required.`;
      if (!p.points || p.points <= 0) return `Row ${i+1}: Points must be greater than zero.`;
      if (selectedProgram.maxPoints && p.points > selectedProgram.maxPoints) {
        return `Row ${i+1}: Points (${p.points}) cannot exceed program max points (${selectedProgram.maxPoints}).`;
      }
    }
    
    const rowSet = new Set(newResultRows.map(r => `${r.position}-${r.teamId}-${r.studentName.trim().toLowerCase()}`));
    if (rowSet.size !== newResultRows.length) {
      return "Duplicate identical rows detected. Please remove accidental duplicates.";
    }
    
    return null;
  };

  const handleSaveNewResults = async () => {
    setSaveStatus(null);
    const errorMsg = validateNewRows();
    if (errorMsg) {
      setSaveStatus({ type: 'error', message: errorMsg });
      return;
    }

    setIsSaving(true);
    const payload = newResultRows.map(r => ({
      programId: selectedProgramId,
      studentName: r.studentName.trim(),
      teamId: r.teamId,
      position: Number(r.position),
      points: Number(r.points)
    }));

    try {
      const res = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save results');
      }

      setSaveStatus({ type: 'success', message: 'Results added successfully!' });
      setNewResultRows([{ id: Date.now().toString(), studentName: '', teamId: '', position: 1, points: POSITION_DEFAULT_POINTS[1], pointsModified: false }]);
      
      queryClient.invalidateQueries({ queryKey: ['results', selectedProgramId] });
      queryClient.invalidateQueries({ queryKey: ['results', 'recent'] });
    } catch (err: unknown) {
      setSaveStatus({ type: 'error', message: (err as Error).message });
    } finally {
      setIsSaving(false);
    }
  };

  // --- EDIT EXISTING RESULT WORKFLOW ---
  
  const startEdit = (result: IResult) => {
    setEditingResultId(String(result._id));
    setEditingResultData({
      studentName: result.studentName,
      teamId: typeof result.teamId === 'object' ? String((result.teamId as ITeam)._id) : String(result.teamId),
      position: result.position,
      points: result.points
    });
  };

  const cancelEdit = () => {
    setEditingResultId(null);
    setEditingResultData(null);
  };

  const saveEdit = async () => {
    if (!editingResultId || !editingResultData) return;
    if (!editingResultData.studentName || editingResultData.studentName.trim().length < 2) return alert("Valid student name required");
    if (!editingResultData.teamId) return alert("Team is required");
    if (!editingResultData.points || editingResultData.points <= 0) return alert("Valid points required");
    
    if (selectedProgram?.maxPoints && editingResultData.points > selectedProgram.maxPoints) {
      return alert(`Points cannot exceed ${selectedProgram.maxPoints}`);
    }

    try {
      const res = await fetch(`/api/results/${editingResultId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingResultData)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update result');
      }

      setEditingResultId(null);
      setEditingResultData(null);
      queryClient.invalidateQueries({ queryKey: ['results', selectedProgramId] });
      queryClient.invalidateQueries({ queryKey: ['results', 'recent'] });
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  // --- DELETE EXISTING RESULT WORKFLOW ---

  const handleDeleteResult = async (id: string) => {
    if (!confirm("Are you sure you want to delete this result? This will affect team points.")) return;
    
    try {
      const res = await fetch(`/api/results/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete result');
      }
      
      queryClient.invalidateQueries({ queryKey: ['results', selectedProgramId] });
      queryClient.invalidateQueries({ queryKey: ['results', 'recent'] });
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  // --- SEQUENTIAL REVEAL WORKFLOW ---
  const handleReveal = async (position: number, isAlreadyRevealed: boolean, stage: 'PLACE' | 'WINNER') => {
    if (!isAlreadyRevealed && stage === 'PLACE') {
      if (!confirm(`Are you sure you want to reveal the ${position === 1 ? '1st' : position === 2 ? '2nd' : '3rd'} Place results on the TV now?`)) return;
    }
    
    try {
      const res = await fetch('/api/results/reveal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ programId: selectedProgramId, position, duration: resultRevealDisplayTime, revealStage: stage })
      });
      if (!res.ok) throw new Error('Failed to reveal');
      
      setActiveRevealState({ pos: position, stage });
      queryClient.invalidateQueries({ queryKey: ['results', selectedProgramId] });
      queryClient.invalidateQueries({ queryKey: ['results', 'recent'] });
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  const handleEndReveal = async (position: number) => {
    try {
      const res = await fetch('/api/results/reveal/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ programId: selectedProgramId, position })
      });
      if (!res.ok) throw new Error('Failed to end reveal');
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  // --- POSTER WORKFLOW ---
  const generatePoster = async () => {
    if (isGeneratingPoster) return; // duplicate click protection
    setIsGeneratingPoster(true);
    try {
      const node = document.getElementById('poster-node');
      if (!node) throw new Error("Could not find poster element");
      const dataUrl = await htmlToImage.toJpeg(node, { quality: 0.9, width: 1920, height: 1080, pixelRatio: 1 });
      
      // POST to tracking API only AFTER successful html-to-image generation
      const res = await fetch(`/api/programs/${selectedProgramId}/poster-track`, {
        method: 'POST'
      });
      
      if (!res.ok) {
        throw new Error('Could not track poster generation on the server.');
      }
      
      setGeneratedPosterUrl(dataUrl);
    } catch {
      alert('Failed to generate poster. Please try again.');
    } finally {
      setIsGeneratingPoster(false);
    }
  };

  const showPosterOnTV = async () => {
    if (!generatedPosterUrl) return;
    try {
      const res = await fetch('/api/posters/tv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ posterUrl: generatedPosterUrl, duration: 15 })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Could not send the poster to the TV.');
      }
      alert('Poster successfully sent to TV!');
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const generateAllWinnersPoster = async () => {
    if (isGeneratingAllWinnersPoster) return;
    setIsGeneratingAllWinnersPoster(true);
    try {
      const node = document.getElementById('all-winners-poster-node');
      if (!node) throw new Error("Could not find all-winners poster element");
      const dataUrl = await htmlToImage.toJpeg(node, { quality: 0.9, width: 1920, height: 1080, pixelRatio: 1 });
      
      const res = await fetch(`/api/programs/${selectedProgramId}/all-winners-poster-track`, {
        method: 'POST'
      });
      
      if (!res.ok) {
        console.warn('Could not track all-winners poster generation on the server.');
      }
      
      setGeneratedAllWinnersPosterUrl(dataUrl);
    } catch {
      alert('Failed to generate all-winners poster. Please try again.');
    } finally {
      setIsGeneratingAllWinnersPoster(false);
    }
  };

  const showAllWinnersPosterOnTV = async () => {
    if (!generatedAllWinnersPosterUrl) return;
    try {
      const res = await fetch('/api/posters/tv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ posterUrl: generatedAllWinnersPosterUrl, duration: 15 })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Could not send the poster to the TV.');
      }
      alert('All-Winners Poster successfully sent to TV!');
    } catch (err) {
      alert((err as Error).message);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter bg-gradient-to-r from-purple-400 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">RESULTS ENTRY</h1>
          <p className="text-text-muted mt-1">Enter competition results and reveal them on the live TV</p>
        </div>
      </div>

      {/* Program Selector */}
      <div className="bg-card rounded-xl shadow-sm border border-border-card p-6">
        <label className="block text-sm font-semibold text-text-primary mb-2">Select Live Program</label>
        <Select
          value={selectedProgramId}
          onChange={(e: any) => setSelectedProgramId(e.target.value)}
          wrapperClassName="w-full lg:w-1/2"
        >
          <option value="">-- Please select a program --</option>
          {programs
            .sort((a, b) => {
              if (a.status === 'live' && b.status !== 'live') return -1;
              if (a.status !== 'live' && b.status === 'live') return 1;
              return (a.programOrder || 0) - (b.programOrder || 0);
            })
            .map(p => (
            <option key={String(p._id)} value={String(p._id)}>
              {p.name} ({p.category}) {p.status === 'live' ? ' 🔴 LIVE' : ''}
            </option>
          ))}
        </Select>
        {selectedProgram && (
          <div className="mt-4 p-4 bg-card-secondary border border-border-card rounded-lg grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><span className="block text-text-muted text-xs uppercase font-bold mb-1">Language • Age Group</span><span className="font-semibold text-text-primary">{selectedProgram.language || 'Other'} • {selectedProgram.category}</span></div>
            <div><span className="block text-text-muted text-xs uppercase font-bold mb-1">Type</span><span className="font-semibold text-text-primary">{selectedProgram.type || 'Standard'}</span></div>
            <div><span className="block text-text-muted text-xs uppercase font-bold mb-1">Max Points</span><span className="font-semibold text-text-primary">{selectedProgram.maxPoints || 10}</span></div>
            <div>
              <span className="block text-text-muted text-xs uppercase font-bold mb-1">Status</span>
              <span className={clsx(
                "font-bold uppercase",
                selectedProgram.status === 'live' ? 'text-red-400' : 
                selectedProgram.status === 'completed' ? 'text-emerald-400' : 'text-text-secondary'
              )}>
                {selectedProgram.status === 'live' && '🔴 '}
                {selectedProgram.status}
              </span>
            </div>
          </div>
        )}
      </div>

      {!selectedProgramId ? (
        <div className="text-center p-12 bg-card rounded-xl border border-dashed border-border-card">
          <h2 className="text-xl font-bold text-text-muted">SELECT A PROGRAM TO ENTER RESULTS</h2>
          <p className="text-text-muted mt-2">Choose a competition program above to begin.</p>
        </div>
      ) : selectedProgram?.status === 'upcoming' ? (
        <div className="text-center p-12 bg-card rounded-xl border border-dashed border-border-card">
          <h2 className="text-xl font-bold text-text-muted">PROGRAM NOT STARTED</h2>
          <p className="text-text-muted mt-2">This program has not started yet. Go to Programs to start it.</p>
        </div>
      ) : (
        <>
          {/* SAVED RESULTS SECTION (REVIEW) */}
          {savedResultData.length > 0 && (
            <div className="bg-card-secondary rounded-2xl shadow-xl overflow-hidden border border-border-card">
              <div className="p-8 text-white">
                <h2 className="text-2xl font-black mb-1 tracking-wider text-slate-100">RESULT REVIEW</h2>
                <h3 className="text-lg text-text-muted mb-8 uppercase tracking-widest">SAVED RESULTS FOR: {selectedProgram?.name}</h3>
                
                <div className="space-y-12 max-w-3xl mx-auto">
                  {[1, 2, 3].map(pos => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const posResults = savedResultData.filter((r: any) => r.position === pos);
                    if (posResults.length === 0) return null;

                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const isPosRevealed = posResults.every((r: any) => r.revealed);
                    
                    // A position is enabled if all previous non-empty positions are revealed
                    // Find all positions before this one that have results
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const prevPositions = [1, 2, 3].filter(p => p < pos && savedResultData.some((r: any) => r.position === p));
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const isEnabled = prevPositions.every(p => savedResultData.filter((r: any) => r.position === p).every((r: any) => r.revealed));

                    const posName = pos === 1 ? '1ST PLACE' : pos === 2 ? '2ND PLACE' : '3RD PLACE';

                    return (
                      <div key={pos} className="border border-border-card rounded-xl overflow-hidden bg-row">
                        <div className="bg-slate-700 px-6 py-4 flex justify-between items-center border-b border-slate-600">
                          <h4 className="text-xl font-bold tracking-widest text-white">{posName}</h4>
                          <div className="text-sm font-bold uppercase tracking-widest">
                            {isPosRevealed ? (
                              <span className="text-emerald-400">✓ REVEALED</span>
                            ) : isEnabled ? (
                              <span className="text-amber-400">● READY</span>
                            ) : (
                              <span className="text-text-muted">🔒 LOCKED</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="p-6 space-y-4">
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {posResults.map((r: any) => {
                            const isRowEditing = editingResultId === String(r._id);
                            const t = r.teamId as ITeam;
                            
                            if (isRowEditing && editingResultData) {
                              return (
                                <div key={String(r._id)} className="bg-card-secondary p-4 rounded-xl border border-indigo-500">
                                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                    <div>
                                      <label className="text-xs text-text-muted block mb-1">Position</label>
                                      <Select value={editingResultData.position} onChange={(e: any)=>setEditingResultData({...editingResultData, position: Number(e.target.value)})}>
                                        <option value={1}>1st</option>
                                        <option value={2}>2nd</option>
                                        <option value={3}>3rd</option>
                                      </Select>
                                    </div>
                                    <div>
                                      <label className="text-xs text-text-muted block mb-1">Student</label>
                                      <input type="text" className="w-full bg-slate-950 text-white border border-border-card rounded p-2" value={editingResultData.studentName} onChange={(e)=>setEditingResultData({...editingResultData, studentName: e.target.value})} />
                                    </div>
                                    <div>
                                      <label className="text-xs text-text-muted block mb-1">Team</label>
                                      <Select value={editingResultData.teamId} onChange={(e: any)=>setEditingResultData({...editingResultData, teamId: e.target.value})}>
                                        {teams.map(team => <option key={String(team._id)} value={String(team._id)}>{team.name}</option>)}
                                      </Select>
                                    </div>
                                    <div>
                                      <label className="text-xs text-text-muted block mb-1">Points</label>
                                      <input type="number" className="w-full bg-slate-950 text-white border border-border-card rounded p-2" value={editingResultData.points} onChange={(e)=>setEditingResultData({...editingResultData, points: Number(e.target.value)})} />
                                    </div>
                                  </div>
                                  <div className="flex justify-end space-x-2 mt-4">
                                    <button onClick={cancelEdit} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm font-bold transition">CANCEL</button>
                                    <button onClick={saveEdit} className="px-4 py-2 bg-primary-indigo text-white hover:bg-primary-purple/10 border border-primary-purple/200 rounded text-sm font-bold transition">SAVE</button>
                                  </div>
                                </div>
                              );
                            }

                            return (
                              <div key={String(r._id)} className="flex flex-col sm:flex-row sm:items-center justify-between bg-card-secondary/80 p-4 rounded-xl border border-border-card">
                                <div className="flex items-center space-x-4">
                                  <div>
                                    <div className="font-bold text-lg text-white">{r.studentName}</div>
                                    <div className="text-text-muted text-sm flex items-center space-x-2 mt-1">
                                      <div className="w-3 h-3 rounded-full shadow-sm" style={{backgroundColor: t.color}}></div>
                                      <span className="uppercase font-semibold tracking-wider">{t.name}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="mt-4 sm:mt-0 flex items-center space-x-6">
                                  <div className="text-xl font-black text-amber-400 bg-slate-950 px-3 py-1 rounded-lg border border-border-card">
                                    {r.points} <span className="text-xs font-medium text-text-muted uppercase">pts</span>
                                  </div>
                                  <div className="flex flex-col space-y-2">
                                    <button onClick={() => startEdit(r)} className="text-text-muted hover:text-indigo-400 transition" title="Edit">
                                      <Edit2 className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => handleDeleteResult(String(r._id))} className="text-text-muted hover:text-red-400 transition" title="Delete">
                                      <Trash2 className="w-5 h-5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div className="bg-row/50 p-4 border-t border-border-card space-y-4">
                          <div className="flex flex-col space-y-2">
                            <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Display Duration</label>
                            <div className="flex flex-wrap gap-2">
                              {[5, 10, 15, 30, 60, 120, 180, 300].map(time => (
                                <button
                                  key={time}
                                  onClick={() => setResultRevealDisplayTime(time)}
                                  className={clsx(
                                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                    resultRevealDisplayTime === time 
                                      ? "bg-indigo-900/50 text-indigo-300 border border-indigo-500/50"
                                      : "bg-card-secondary/50 text-text-muted border border-transparent hover:bg-row"
                                  )}
                                >
                                  {time >= 60 ? `${time / 60} MIN` : `${time} sec`}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleReveal(pos, isPosRevealed, 'PLACE')}
                              disabled={!isEnabled || (activeRevealState?.pos === pos && activeRevealState?.stage === 'PLACE')}
                              className={clsx(
                                "flex-1 py-3 rounded-lg font-bold text-sm tracking-wider transition-all shadow-sm flex items-center justify-center space-x-2 uppercase relative overflow-hidden",
                                activeRevealState?.pos === pos && activeRevealState?.stage === 'PLACE'
                                  ? "bg-indigo-900/40 text-indigo-300 border border-indigo-500/30 cursor-not-allowed"
                                  : isEnabled
                                    ? "bg-primary-indigo text-white hover:bg-primary-purple/10 border border-primary-purple/200 shadow-indigo-500/20"
                                    : "bg-slate-700/50 text-text-muted cursor-not-allowed border border-slate-600/50"
                              )}
                            >
                              {activeRevealState?.pos === pos && activeRevealState?.stage === 'PLACE' ? "PLACE REVEALED" : "REVEAL PLACE"}
                            </button>

                            <button
                              onClick={() => handleReveal(pos, isPosRevealed, 'WINNER')}
                              disabled={!isPosRevealed || (activeRevealState?.pos === pos && activeRevealState?.stage === 'WINNER')}
                              className={clsx(
                                "flex-1 py-3 rounded-lg font-bold text-sm tracking-wider transition-all shadow-sm flex items-center justify-center space-x-2 uppercase relative overflow-hidden",
                                activeRevealState?.pos === pos && activeRevealState?.stage === 'WINNER'
                                  ? "bg-emerald-900/40 text-emerald-300 border border-emerald-500/30 cursor-not-allowed"
                                  : isPosRevealed
                                    ? "bg-emerald-600 text-white hover:bg-emerald-500 border border-emerald-400 shadow-emerald-500/20"
                                    : "bg-slate-700/50 text-text-muted cursor-not-allowed border border-slate-600/50"
                              )}
                            >
                              {activeRevealState?.pos === pos && activeRevealState?.stage === 'WINNER' ? "NAME REVEALED" : "REVEAL NAME"}
                            </button>
                            
                            <button
                              onClick={() => {
                                handleEndReveal(pos);
                                setActiveRevealState(null);
                              }}
                              disabled={!isPosRevealed}
                            className={clsx(
                              "flex-1 py-3 rounded-lg font-bold text-sm tracking-wider transition-all shadow-sm flex items-center justify-center space-x-2 uppercase",
                              isPosRevealed
                                ? "bg-slate-700 hover:bg-slate-600 text-white border border-slate-600"
                                : "bg-row text-text-secondary cursor-not-allowed border border-border-card"
                            )}
                          >
                            END REVEAL
                          </button>
                          </div>
                        </div>
                        
                        {isPosRevealed && (
                          <div className="px-4 pb-4">
                            <button
                              onClick={() => {
                                setPosterResultId(String(posResults[0]._id)); // Pass any result ID from this position
                                setGeneratedPosterUrl(null);
                                setIsPosterModalOpen(true);
                              }}
                              className="w-full py-2 rounded-lg font-bold text-xs tracking-wider transition-all bg-emerald-500/10 border border-emerald-500/200/10 text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/200/20 border border-emerald-500/20 uppercase"
                            >
                              GENERATE CONGRATULATIONS POSTER
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* ALL WINNERS POSTER BUTTON */}
                <div className="mt-8 max-w-3xl mx-auto border-t border-border-card pt-8">
                  <div className="flex flex-col items-center space-y-6">
                    <div className="flex flex-col space-y-2 items-center">
                      <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Display Duration</label>
                      <div className="flex flex-wrap gap-2">
                        {[5, 10, 15, 30, 60, 120, 180, 300].map(time => (
                          <button
                            key={time}
                            onClick={() => setAllWinnersDisplayTime(time)}
                            className={clsx(
                              "px-6 py-3 rounded-xl text-sm font-bold transition-colors",
                              allWinnersDisplayTime === time 
                                ? "bg-indigo-900/50 text-indigo-300 border border-indigo-500/50"
                                : "bg-card-secondary/50 text-text-muted border border-transparent hover:bg-row"
                            )}
                          >
                            {time >= 60 ? `${time / 60} MIN` : `${time} sec`}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setGeneratedAllWinnersPosterUrl(null);
                        setIsAllWinnersPosterModalOpen(true);
                      }}
                      className="px-8 py-4 rounded-xl font-black text-sm tracking-widest transition-all bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-400 hover:to-orange-500 shadow-xl shadow-orange-900/20 uppercase flex items-center space-x-3"
                    >
                      <span className="text-xl">🎉</span>
                      <span>GENERATE ALL WINNERS POSTER</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ADD NEW RESULTS SECTION */}
          <div className="bg-card rounded-xl shadow-sm border border-border-card p-6 space-y-6 mt-8">
            <h3 className="text-xl font-black text-text-primary tracking-wider">ADD NEW RESULTS</h3>
            
            <div className="space-y-4">
              {newResultRows.map((row) => (
                <div key={row.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-card-secondary p-4 rounded-xl border border-border-card items-start">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-text-muted mb-1 uppercase">Position</label>
                    <Select 
                      value={row.position} 
                      onChange={(e: any) => updateRow(row.id, 'position', parseInt(e.target.value))}
                    >
                      {Array.from({ length: Math.max(10, newResultRows.length + 3) }, (_, i) => i + 1).map(pos => {
                        const isUsed = newResultRows.some(r => r.position === pos && r.id !== row.id);
                        return (
                          <option key={pos} value={pos} disabled={isUsed}>
                            {getPositionLabel(pos)}
                          </option>
                        );
                      })}
                    </Select>
                  </div>
                  <div className="md:col-span-4">
                    <label className="block text-xs font-bold text-text-muted mb-1 uppercase">Student Name</label>
                    <input 
                      type="text" 
                      className="w-full border-border-card rounded-md shadow-sm p-3 border font-semibold" 
                      value={row.studentName} 
                      onChange={(e) => updateRow(row.id, 'studentName', e.target.value)} 
                      placeholder="Full Name" 
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-text-muted mb-1 uppercase">Team</label>
                    <Select 
                      value={row.teamId} 
                      onChange={(e: any) => updateRow(row.id, 'teamId', e.target.value)}
                    >
                      <option value="">-- Team --</option>
                      {teams.map(t => <option key={String(t._id)} value={String(t._id)}>{t.name}</option>)}
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-text-muted mb-1 uppercase">Points</label>
                    <input 
                      type="number" 
                      className="w-full border-border-card rounded-md shadow-sm p-3 border font-bold text-lg" 
                      value={row.points} 
                      onChange={(e) => updateRow(row.id, 'points', parseInt(e.target.value) || 0)} 
                    />
                  </div>
                  <div className="md:col-span-1 flex justify-end md:justify-center pt-6">
                    <button 
                      onClick={() => handleRemoveRow(row.id)}
                      className="p-3 text-text-muted hover:text-red-500 hover:bg-red-500/10 border border-red-500/20 rounded-lg transition"
                      title="Remove Row"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleAddRow}
              className="flex items-center space-x-2 text-primary-indigo hover:text-indigo-800 font-bold px-4 py-2 border-2 border-dashed border-indigo-300 hover:border-indigo-500 rounded-xl transition"
            >
              <Plus className="w-5 h-5" />
              <span>ADD RESULT ROW</span>
            </button>

            {saveStatus && (
              <div className={clsx(
                "p-4 rounded-lg flex items-center space-x-2 mt-4",
                saveStatus.type === 'error' ? "bg-red-500/10 border border-red-500/20 text-red-700 border border-red-200" : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 border border-emerald-200"
              )}>
                {saveStatus.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                <span className="font-medium">{saveStatus.message}</span>
              </div>
            )}

            <div className="border-t border-border-card pt-6 mt-6">
              <button
                onClick={handleSaveNewResults}
                disabled={isSaving || newResultRows.length === 0}
                className="w-full px-6 py-4 bg-primary-indigo text-white text-white rounded-xl font-bold text-lg tracking-widest hover:bg-primary-purple text-white disabled:opacity-50 transition-colors shadow-lg"
              >
                {isSaving ? 'SAVING...' : 'SAVE NEW RESULTS'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Recent Results */}
      <div className="pt-8">
        <h3 className="text-lg font-bold text-text-primary mb-4 uppercase tracking-wider">Recent Results</h3>
        <div className="bg-card rounded-xl shadow-sm border border-border-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-card-secondary text-text-muted uppercase font-semibold border-b border-border-card">
                <tr>
                  <th className="px-6 py-4">Program</th>
                  <th className="px-6 py-4">Winner</th>
                  <th className="px-6 py-4">Team</th>
                  <th className="px-6 py-4">Pos</th>
                  <th className="px-6 py-4">Pts</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-card">
                {recentResults.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-text-muted">No results found.</td></tr>
                ) : (
                  recentResults.map(r => (
                    <tr key={String(r._id)} className="hover:bg-card-secondary">
                      <td className="px-6 py-4 font-medium text-text-primary">{((r.programId as unknown) as {name: string})?.name}</td>
                      <td className="px-6 py-4 font-bold text-white">{r.studentName}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center space-x-2">
                          <span className="w-2 h-2 rounded-full" style={{backgroundColor: ((r.teamId as unknown) as {color: string})?.color}}></span>
                          <span className="font-semibold text-text-secondary">{((r.teamId as unknown) as {name: string})?.name}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-lg">{r.position === 1 ? '🥇' : r.position === 2 ? '🥈' : '🥉'}</td>
                      <td className="px-6 py-4 font-bold text-text-secondary">{r.points}</td>
                      <td className="px-6 py-4">
                        <span className={clsx("px-2 py-1 rounded text-xs font-bold uppercase", r.revealed ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
                          {r.revealed ? '✓ Revealed' : 'Ready'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Poster Modal */}
      {isPosterModalOpen && selectedProgramId && (
        <div className="fixed inset-0 bg-card-secondary/80 flex items-center justify-center p-4 z-[100] overflow-y-auto">
          <div className="bg-card rounded-2xl shadow-2xl max-w-5xl w-full flex flex-col md:flex-row overflow-hidden border border-border-card mt-10 md:mt-0">
            
            <div className="w-full md:w-1/2 bg-slate-950 p-6 flex flex-col items-center justify-center min-h-[600px] border-r border-border-card relative">
              {generatedPosterUrl ? (
                <div className="w-full max-w-[400px] flex flex-col items-center relative group">
                  <div className="absolute top-4 right-4 bg-emerald-500/10 border border-emerald-500/200 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg z-10">
                    ✓ POSTER GENERATED
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={generatedPosterUrl} alt="Generated Poster" className="w-full h-auto shadow-2xl rounded-sm" />
                </div>
              ) : (
                <div className="w-full relative flex flex-col items-center group">
                  <div className="absolute top-4 right-4 bg-emerald-500/10 border border-emerald-500/200 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg z-10">
                    PREVIEW (16:9)
                  </div>
                  <div className="w-full overflow-hidden flex items-center justify-center shadow-2xl rounded-sm" style={{ aspectRatio: '16/9' }}>
                    <div className="origin-top-left" style={{ transform: 'scale(calc(min(100%, 400px) / 1920))', width: '1920px', height: '1080px' }}>
                  {(() => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const resultForPoster = savedResultData.find((r: any) => String(r._id) === posterResultId);
                    if (!resultForPoster) return <div className="text-white p-8">Complete result information is required.</div>;
                    
                    const program = programs.find(p => String(p._id) === selectedProgramId);
                    const team = resultForPoster.teamId as { name: string, color: string };
                    const positionText = resultForPoster.position === 1 ? '🥇 FIRST PLACE' : resultForPoster.position === 2 ? '🥈 SECOND PLACE' : '🥉 THIRD PLACE';
                    
                    return (
                      <CongratulationsPoster
                        studentName={resultForPoster.studentName || 'Unknown'}
                        teamName={team?.name || 'Unknown'}
                        teamColor={team?.color || '#f59e0b'}
                        position={positionText}
                        points={resultForPoster.points || 0}
                        programName={program?.name || 'Program'}
                        eventName={EVENT_NAME}
                        eventYear={new Date().getFullYear().toString()}
                      />
                    );
                  })()}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="w-full md:w-1/2 bg-card p-8 flex flex-col">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-2xl font-black text-text-primary tracking-tight">POSTER SETTINGS</h3>
                  <p className="text-text-muted mt-1">Select the winner to create a poster.</p>
                </div>
                <button onClick={() => setIsPosterModalOpen(false)} className="text-text-muted hover:text-text-primary font-bold text-xl px-2">✕</button>
              </div>

              <div className="space-y-3 mb-8 flex-1 overflow-y-auto max-h-[400px] pr-2">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {savedResultData.map((res: any) => {
                  const isActive = posterResultId === String(res._id);
                  const medal = res.position === 1 ? '🥇 1ST PLACE' : res.position === 2 ? '🥈 2ND PLACE' : '🥉 3RD PLACE';
                  const activeClass = res.position === 1 ? 'border-amber-400 bg-amber-500/10 border border-amber-500/20 text-amber-800' : 
                                      res.position === 2 ? 'border-slate-400 bg-row text-text-primary' : 
                                      'border-orange-400 bg-orange-50 text-orange-800';
                  const dotClass = res.position === 1 ? 'bg-amber-400' : res.position === 2 ? 'bg-slate-400' : 'bg-orange-400';
                  const t = res.teamId as ITeam;
                  
                  return (
                    <button
                      key={String(res._id)}
                      onClick={() => { setPosterResultId(String(res._id)); setGeneratedPosterUrl(null); }}
                      className={clsx(
                        "w-full text-left px-5 py-4 rounded-xl border-2 font-bold text-lg transition-colors flex items-center justify-between",
                        isActive ? activeClass : "border-border-subtle bg-card text-text-secondary hover:border-border-card"
                      )}
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">{medal}</span>
                        <span className="text-lg">{res.studentName} <span className="text-sm font-medium text-text-muted">({t.name})</span></span>
                      </div>
                      {isActive && <span className={`w-3 h-3 rounded-full ${dotClass}`} />}
                    </button>
                  )
                })}
              </div>

              <div className="space-y-4 pt-6 border-t border-border-subtle mt-auto">
                {!generatedPosterUrl ? (
                  <button
                    onClick={generatePoster}
                    disabled={isGeneratingPoster || !posterResultId}
                    className="w-full px-6 py-4 bg-card-secondary text-white rounded-xl font-bold text-lg hover:bg-row transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <ImageIcon className="w-5 h-5" />
                    <span>{isGeneratingPoster ? 'GENERATING...' : 'GENERATE POSTER'}</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={showPosterOnTV}
                      className="w-full px-6 py-4 bg-primary-indigo text-white text-white rounded-xl font-bold text-lg hover:bg-primary-purple text-white transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/20"
                    >
                      <MonitorPlay className="w-5 h-5" />
                      <span>SHOW POSTER ON TV (15s)</span>
                    </button>
                    <div className="flex space-x-3">
                      <a
                        href={generatedPosterUrl}
                        download={`poster.jpg`}
                        className="flex-1 px-4 py-3 bg-row text-text-primary rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>DOWNLOAD</span>
                      </a>
                      <button
                        onClick={() => setIsPosterModalOpen(false)}
                        className="flex-1 px-4 py-3 bg-card border border-border-card text-text-secondary rounded-xl font-bold text-sm hover:bg-card-secondary transition-colors"
                      >
                        CLOSE
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
            
          </div>
        </div>
      )}

    {/* All-Winners Poster Modal */}
      {isAllWinnersPosterModalOpen && selectedProgramId && (
        <div className="fixed inset-0 bg-card-secondary/80 flex items-center justify-center p-4 z-[100] overflow-y-auto">
          <div className="bg-card rounded-2xl shadow-2xl max-w-5xl w-full flex flex-col md:flex-row overflow-hidden border border-border-card mt-10 md:mt-0">
            
            <div className="w-full md:w-1/2 bg-slate-950 p-6 flex flex-col items-center justify-center min-h-[600px] border-r border-border-card relative">
              <div className="w-full relative flex flex-col items-center group">
                <div className="absolute top-4 right-4 bg-emerald-500/10 border border-emerald-500/200 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg z-10">
                  PREVIEW (16:9)
                </div>
                <div className="w-full overflow-hidden flex items-center justify-center shadow-2xl rounded-sm" style={{ aspectRatio: '16/9', contain: 'strict' }}>
                  <div className="origin-top-left" style={{ transform: 'scale(calc(min(100%, 400px) / 1920))', width: '1920px', height: '1080px' }}>
                {(() => {
                  const program = programs.find(p => String(p._id) === selectedProgramId);
                  
                  // Group winners by position
                  const winnersByPosition = {
                    1: [] as WinnerData[],
                    2: [] as WinnerData[],
                    3: [] as WinnerData[],
                  };

                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  savedResultData.forEach((res: any) => {
                    if (res.position === 1 || res.position === 2 || res.position === 3) {
                      const pos = res.position as 1 | 2 | 3;
                      const team = res.teamId as { name: string, color: string };
                      winnersByPosition[pos].push({
                        studentName: res.studentName || 'Unknown',
                        teamName: team?.name || 'Unknown',
                        teamColor: team?.color || '#f59e0b',
                        points: res.points || 0,
                      });
                    }
                  });

                  return (
                    <AllWinnersRouter
                      config={{
                        programName: program?.name || 'Program',
                        language: program?.language || 'Other',
                        category: program?.category || '',
                        eventName: EVENT_NAME,
                        eventYear: new Date().getFullYear().toString(),
                        winnersByPosition,
                        presentation: tvState?.allWinnersDesign || 'design1',
                      }}
                    />
                  );
                })()}
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full md:w-1/2 bg-card p-8 flex flex-col justify-center">
              <div className="mb-8">
                <h3 className="text-2xl font-black text-text-primary tracking-tight uppercase">ALL WINNERS POSTER</h3>
                <p className="text-text-muted mt-2">Create a single combined poster featuring all 1st, 2nd, and 3rd place winners for this program.</p>
              </div>

              <div className="space-y-4 pt-6 border-t border-border-subtle">
                <button
                  onClick={async () => {
                    try {
                      const program = programs.find(p => String(p._id) === selectedProgramId);
                      const winnersByPosition = { 1: [] as any[], 2: [] as any[], 3: [] as any[] };
                      
                      savedResultData.forEach((res: any) => {
                        if (res.position === 1 || res.position === 2 || res.position === 3) {
                          const pos = res.position as 1 | 2 | 3;
                          const team = res.teamId as { name: string, color: string };
                          winnersByPosition[pos].push({
                            studentName: res.studentName || 'Unknown',
                            teamName: team?.name || 'Unknown',
                            teamColor: team?.color || '#f59e0b',
                            points: res.points || 0,
                          });
                        }
                      });

                      const config = {
                        programName: program?.name || 'Program',
                        language: program?.language || 'Other',
                        category: program?.category || '',
                        eventName: EVENT_NAME,
                        eventYear: new Date().getFullYear().toString(),
                        winnersByPosition,
                        presentation: tvState?.allWinnersDesign || 'design1',
                      };

                      const startedAt = new Date();
                      const expiresAt = new Date(startedAt.getTime() + allWinnersDisplayTime * 1000);

                      const res = await fetch('/api/tv-state', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                          presentationId: crypto.randomUUID(),
                          presentationType: 'ALL_WINNERS',
                          presentationData: config,
                          presentationStartedAt: startedAt.toISOString(),
                          presentationExpiresAt: expiresAt.toISOString(),
                          presentationDuration: allWinnersDisplayTime
                        })
                      });
                      if (!res.ok) throw new Error("Failed to push All Winners poster");
                      alert('All-Winners Poster successfully sent to TV!');
                      setIsAllWinnersPosterModalOpen(false);
                      refetchTvState();
                    } catch (err: any) {
                      alert(err.message);
                    }
                  }}
                  disabled={savedResultData.length === 0}
                  className="w-full px-6 py-4 bg-primary-indigo text-white text-white rounded-xl font-bold text-lg hover:bg-primary-purple text-white transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                >
                  <MonitorPlay className="w-5 h-5" />
                  <span>SHOW POSTER ON TV</span>
                </button>
              </div>
              <div className="mt-8 pt-6 border-t border-border-subtle text-center">
                <button
                  onClick={() => setIsAllWinnersPosterModalOpen(false)}
                  className="text-text-muted hover:text-text-primary font-bold transition-colors"
                >
                  CANCEL
                </button>
              </div>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
