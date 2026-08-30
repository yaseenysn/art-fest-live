"use client";

import { useState, useEffect } from 'react';
import { Send, CheckCircle2, AlertCircle, MonitorPlay, EyeOff, ArrowRight } from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Leaderboard from '../../tv/components/Leaderboard';
import AllWinnersRouter from '../../tv/components/AllWinnersRouter';
import ResultsRouter from '../../tv/components/ResultsRouter';
import { IProgram } from '@/types';

export default function DisplayControl() {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const [duration, setDuration] = useState(10);
  const [status, setStatus] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [sending, setSending] = useState(false);
  const [isResetConfirmModalOpen, setIsResetConfirmModalOpen] = useState(false); // To avoid conflict if we just renamed
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  // Premium Custom Announcements State
  const [customAnnTemplate, setCustomAnnTemplate] = useState<'NEXT_PROGRAM' | 'JUDGES_THANK_YOU'>('NEXT_PROGRAM');
  const [nextProgName, setNextProgName] = useState('');
  const [nextProgChess, setNextProgChess] = useState('');
  const [judgesList, setJudgesList] = useState<{name: string}[]>([{name: ''}]);
  const [customAnnDuration, setCustomAnnDuration] = useState(15);
  const [customAnnStatus, setCustomAnnStatus] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [pushingCustomAnn, setPushingCustomAnn] = useState(false);

  // Leaderboard States
  const { data: tvState, refetch: refetchTvState } = useQuery<any>({
    queryKey: ['tvState'],
    queryFn: async () => {
      const res = await fetch('/api/tv-state');
      if (!res.ok) throw new Error('Failed to fetch TV state');
      return res.json();
    }
  });

  const leaderboardOptions = [
    'Design 1 — Original',
    'Design 2',
    'Design 3',
    'Design 4'
  ];
  const [selectedLeaderboard, setSelectedLeaderboard] = useState('Design 1 — Original');
  const [previewConfig, setPreviewConfig] = useState<any>(null);
  const [leaderboardStatus, setLeaderboardStatus] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [pushingLeaderboard, setPushingLeaderboard] = useState(false);

  // Programs Query
  const { data: programs = [] } = useQuery<IProgram[]>({
    queryKey: ['programs'],
    queryFn: async () => {
      const res = await fetch('/api/programs');
      if (!res.ok) throw new Error('Failed to fetch programs');
      return res.json();
    }
  });

  // All Winners States
  const winnersOptions = [
    'Design 1 — Original',
    'Design 2',
    'Design 3',
    'Design 4'
  ];
  const [selectedWinnersDesign, setSelectedWinnersDesign] = useState('Design 1 — Original');
  const [selectedProgramId, setSelectedProgramId] = useState('');
  const [winnersPreviewConfig, setWinnersPreviewConfig] = useState<any>(null);
  const [winnersStatus, setWinnersStatus] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [pushingWinners, setPushingWinners] = useState(false);
  const [allWinnersDisplayTime, setAllWinnersDisplayTime] = useState<number>(15);

  // Results Entry States
  const resultsOptions = [
    'Design 1 — Original',
    'Design 2',
    'Design 3',
    'Design 4'
  ];
  const [selectedResultsDesign, setSelectedResultsDesign] = useState('Design 1 — Original');

  // Default select live program if available
  useEffect(() => {
    if (programs.length > 0 && !selectedProgramId) {
      const liveProgram = programs.find(p => p.status === 'live');
      if (liveProgram) {
        setSelectedProgramId(String(liveProgram._id));
      }
    }
  }, [programs, selectedProgramId]);

  // Sync state from persisted tvState preferences
  useEffect(() => {
    if (tvState) {
      const dToL = (d: string) => {
        if (d === 'design2') return 'Design 2';
        if (d === 'design3') return 'Design 3';
        if (d === 'design4') return 'Design 4';
        return 'Design 1 — Original';
      };
      if (tvState.leaderboardDesign) {
        setSelectedLeaderboard(dToL(tvState.leaderboardDesign));
      }
      if (tvState.allWinnersDesign) {
        setSelectedWinnersDesign(dToL(tvState.allWinnersDesign));
      }
      if (tvState.resultsDesign) {
        setSelectedResultsDesign(dToL(tvState.resultsDesign));
      }
    }
  }, [tvState]);

  const handleLeaderboardChange = async (label: string) => {
    setSelectedLeaderboard(label);
    const designMap: Record<string, string> = {
      'Design 1 — Original': 'design1',
      'Design 2': 'design2',
      'Design 3': 'design3',
      'Design 4': 'design4',
    };
    try {
      await fetch('/api/tv-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leaderboardDesign: designMap[label] || 'design1' })
      });
      refetchTvState();
    } catch (err) {
      console.error('Failed to persist leaderboard design', err);
    }
  };

  const handleWinnersDesignChange = async (label: string) => {
    setSelectedWinnersDesign(label);
    const designMap: Record<string, string> = {
      'Design 1 — Original': 'design1',
      'Design 2': 'design2',
      'Design 3': 'design3',
      'Design 4': 'design4',
    };
    try {
      await fetch('/api/tv-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allWinnersDesign: designMap[label] || 'design1' })
      });
      refetchTvState();
    } catch (err) {
      console.error('Failed to persist winners design', err);
    }
  };

  const handleResultsDesignChange = async (label: string) => {
    setSelectedResultsDesign(label);
    const designMap: Record<string, string> = {
      'Design 1 — Original': 'design1',
      'Design 2': 'design2',
      'Design 3': 'design3',
      'Design 4': 'design4',
    };
    try {
      await fetch('/api/tv-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resultsDesign: designMap[label] || 'design1' })
      });
      refetchTvState();
    } catch (err) {
      console.error('Failed to persist results design', err);
    }
  };

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        const res = await fetch('/api/leaderboards/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: selectedLeaderboard })
        });
        if (res.ok) {
          const data = await res.json();
          console.log("[ADMIN] selected presentation:", selectedLeaderboard);
          console.log("[ADMIN] preview generated presentation:", data.presentation);
          setPreviewConfig(data);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchPreview();
  }, [selectedLeaderboard]);

  useEffect(() => {
    const fetchWinnersPreview = async () => {
      if (!selectedProgramId) {
        setWinnersPreviewConfig(null);
        return;
      }
      
      let presentation = 'design1';
      if (selectedWinnersDesign === 'Design 2') presentation = 'design2';
      if (selectedWinnersDesign === 'Design 3') presentation = 'design3';
      if (selectedWinnersDesign === 'Design 4') presentation = 'design4';

      try {
        const res = await fetch('/api/all-winners/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ presentation, programId: selectedProgramId })
        });
        if (res.ok) {
          const data = await res.json();
          setWinnersPreviewConfig(data);
        } else {
          setWinnersPreviewConfig(null);
        }
      } catch (e) {
        console.error(e);
        setWinnersPreviewConfig(null);
      }
    };
    fetchWinnersPreview();
  }, [selectedWinnersDesign, selectedProgramId]);

  const handleShowLeaderboard = async () => {
    if (!previewConfig) return;
    
    console.log("[ADMIN] sending presentation:", previewConfig.presentation);
    
    setPushingLeaderboard(true);
    try {
      const payload = {
        type: selectedLeaderboard,
        config: previewConfig,
        isActive: true
      };
      console.log("[ADMIN] full payload to API:", payload);

      const res = await fetch('/api/tv-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Failed to push leaderboard");
      setLeaderboardStatus({ type: 'success', text: 'Leaderboard is now live on TV.' });
      refetchTvState();
      setTimeout(() => setLeaderboardStatus(null), 3000);
    } catch(err: any) {
      setLeaderboardStatus({ type: 'error', text: err.message });
    } finally {
      setPushingLeaderboard(false);
    }
  }

  const handleHideLeaderboard = async () => {
    if (!tvState) return;
    setPushingLeaderboard(true);
    try {
      const res = await fetch('/api/tv-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: tvState.type,
          config: tvState.config,
          isActive: false
        })
      });
      if (!res.ok) throw new Error("Failed to hide leaderboard");
      setLeaderboardStatus({ type: 'success', text: 'Leaderboard hidden. TV is now idle.' });
      refetchTvState();
      setTimeout(() => setLeaderboardStatus(null), 3000);
    } catch(err: any) {
      setLeaderboardStatus({ type: 'error', text: err.message });
    } finally {
      setPushingLeaderboard(false);
    }
  }

  const handleShowWinners = async () => {
    if (!winnersPreviewConfig) return;
    
    setPushingWinners(true);
    try {
      const payload = {
        type: 'ALL_WINNERS',
        config: winnersPreviewConfig,
        isActive: true
      };

      const res = await fetch('/api/tv-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Failed to push All Winners poster");
      setWinnersStatus({ type: 'success', text: 'All Winners Poster is now live on TV.' });
      refetchTvState();
      setTimeout(() => setWinnersStatus(null), 3000);
    } catch(err: any) {
      setWinnersStatus({ type: 'error', text: err.message });
    } finally {
      setPushingWinners(false);
    }
  }

  const handleHideWinners = async () => {
    if (!tvState) return;
    setPushingWinners(true);
    try {
      const res = await fetch('/api/tv-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clearPresentationId: tvState.presentationId || 'force'
        })
      });
      if (!res.ok) throw new Error("Failed to hide poster");
      setWinnersStatus({ type: 'success', text: 'Poster hidden. TV is now idle.' });
      refetchTvState();
      setTimeout(() => setWinnersStatus(null), 3000);
    } catch(err: any) {
      setWinnersStatus({ type: 'error', text: err.message });
    } finally {
      setPushingWinners(false);
    }
  }

  const handleSend = async () => {
    if (!message.trim()) {
      setStatus({ type: 'error', text: 'Message cannot be empty' });
      return;
    }

    setSending(true);
    setStatus(null);

    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, duration })
      });

      if (!res.ok) throw new Error('Failed to send announcement');

      setStatus({ type: 'success', text: 'Announcement sent to TV!' });
      setMessage('');
    } catch (err: unknown) {
      setStatus({ type: 'error', text: (err as Error).message });
    } finally {
      setSending(false);
    }
  };

  const handleResetEvent = async () => {
    if (resetConfirmText !== 'RESET EVENT') return;
    
    setIsResetting(true);
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setIsResetConfirmModalOpen(false);
        setResetConfirmText('');
        alert("Event reset successfully. All competition data cleared.");
      } else {
        alert(data.error || "Failed to reset event.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to reach reset endpoint.");
    } finally {
      setIsResetting(false);
    }
  };

  const handlePushCustomAnnouncement = async () => {
    setCustomAnnStatus(null);

    if (customAnnTemplate === 'NEXT_PROGRAM') {
      if (!nextProgName.trim() || !nextProgChess.trim()) {
        setCustomAnnStatus({ type: 'error', text: 'Program Name and Chess Number are required.'});
        return;
      }
    } else if (customAnnTemplate === 'JUDGES_THANK_YOU') {
      const validJudges = judgesList.filter(j => j.name.trim() !== '');
      if (validJudges.length === 0) {
        setCustomAnnStatus({ type: 'error', text: 'At least one Judge Name is required.'});
        return;
      }
    }

    setPushingCustomAnn(true);
    try {
      const presentationId = window.crypto && window.crypto.randomUUID ? window.crypto.randomUUID() : Date.now().toString();
      const now = Date.now();
      
      let presentationData: any = { template: customAnnTemplate };
      if (customAnnTemplate === 'NEXT_PROGRAM') {
        presentationData.programName = nextProgName.trim();
        presentationData.chessNumber = nextProgChess.trim();
      } else {
        presentationData.judges = judgesList.filter(j => j.name.trim() !== '');
      }

      const payload = {
        presentationType: "CUSTOM_ANNOUNCEMENT",
        presentationId,
        presentationStartedAt: new Date(now).toISOString(),
        presentationExpiresAt: new Date(now + customAnnDuration * 1000).toISOString(),
        presentationDuration: customAnnDuration,
        presentationData
      };

      const res = await fetch('/api/tv-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to push Custom Announcement");
      setCustomAnnStatus({ type: 'success', text: 'Custom Announcement is now live on TV.' });
      refetchTvState();
      setTimeout(() => setCustomAnnStatus(null), 3000);
    } catch(err: any) {
      setCustomAnnStatus({ type: 'error', text: err.message });
    } finally {
      setPushingCustomAnn(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Display Control</h1>
        <p className="text-slate-500 mt-1">Send custom announcements to the live TV</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <h2 className="text-xl font-semibold mb-6 flex items-center justify-between">
          Leaderboard Control
          {tvState?.isActive && (
            <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-4 py-1 rounded-full text-sm font-bold border border-emerald-200">
              <span className="animate-pulse h-2 w-2 bg-emerald-500 rounded-full"></span>
              <span>CURRENTLY SHOWING ON TV: {tvState.type}</span>
            </div>
          )}
          {!tvState?.isActive && (
            <div className="flex items-center space-x-2 bg-slate-50 text-slate-500 px-4 py-1 rounded-full text-sm font-bold border border-slate-200">
              <span>TV IS IDLE (WAITING SCREEN)</span>
            </div>
          )}
        </h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">LEADERBOARD DESIGN</label>
            <select
              className="w-full border-slate-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-4 border text-lg font-semibold text-slate-800"
              value={selectedLeaderboard}
              onChange={(e) => handleLeaderboardChange(e.target.value)}
            >
              {leaderboardOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* PREVIEW */}
          <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Preview</h3>
            {previewConfig ? (
              <div className="space-y-4">
                <div className="flex flex-col space-y-1">
                  <div className="font-bold text-slate-800">{previewConfig.title} <span className="text-slate-400 font-normal">({previewConfig.subtitle})</span></div>
                  <div className="text-sm text-slate-500 mb-2">{previewConfig.rows?.length || 0} teams mapped</div>
                </div>
                
                {/* Scaled-down real TV renderer */}
                <div 
                  className="relative w-full aspect-video bg-[#04060C] overflow-hidden rounded-xl border-4 border-slate-800 shadow-2xl"
                >
                  {/* 
                    We want to fit a 1920x1080 design inside this container. 
                    We use a trick: absolute positioned 1920x1080 div scaled down using transform origin.
                  */}
                  <div 
                    className="absolute top-0 left-0 w-[1920px] h-[1080px] origin-top-left"
                    ref={(el) => {
                      if (el && el.parentElement) {
                        const scale = el.parentElement.clientWidth / 1920;
                        el.style.transform = `scale(${scale})`;
                      }
                    }}
                  >
                    <Leaderboard config={previewConfig} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-500 animate-pulse">Generating preview...</div>
            )}
          </div>

          {leaderboardStatus && (
            <div className={clsx(
              "p-4 rounded-lg flex items-center space-x-2",
              leaderboardStatus.type === 'error' ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"
            )}>
              {leaderboardStatus.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
              <span>{leaderboardStatus.text}</span>
            </div>
          )}

          <div className="flex space-x-4 pt-2">
            <button
              onClick={handleShowLeaderboard}
              disabled={pushingLeaderboard || !previewConfig}
              className="flex-1 flex items-center justify-center space-x-2 bg-indigo-600 text-white rounded-lg py-4 font-bold text-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-md"
            >
              <MonitorPlay className="w-6 h-6" />
              <span>SHOW ON TV</span>
            </button>
            <button
              onClick={handleHideLeaderboard}
              disabled={pushingLeaderboard || !tvState?.isActive}
              className="flex-1 flex items-center justify-center space-x-2 bg-slate-800 text-white rounded-lg py-4 font-bold text-lg hover:bg-slate-700 transition-colors disabled:opacity-50 shadow-md"
            >
              <EyeOff className="w-6 h-6" />
              <span>HIDE LEADERBOARD</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <h2 className="text-xl font-semibold mb-6 flex items-center justify-between">
          All Winners Control
          {tvState?.isActive && tvState.type === 'ALL_WINNERS' && (
            <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-4 py-1 rounded-full text-sm font-bold border border-emerald-200">
              <span className="animate-pulse h-2 w-2 bg-emerald-500 rounded-full"></span>
              <span>CURRENTLY SHOWING POSTER</span>
            </div>
          )}
        </h2>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">SELECT PROGRAM</label>
              <select
                className="w-full border-slate-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-4 border text-lg font-semibold text-slate-800"
                value={selectedProgramId}
                onChange={(e) => setSelectedProgramId(e.target.value)}
              >
                <option value="">-- Select a Program --</option>
                {programs.map(p => (
                  <option key={String(p._id)} value={String(p._id)}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">POSTER DESIGN</label>
              <select
                className="w-full border-slate-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-4 border text-lg font-semibold text-slate-800"
                value={selectedWinnersDesign}
                onChange={(e) => handleWinnersDesignChange(e.target.value)}
              >
                {winnersOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Display Time (Seconds)</label>
            <div className="flex space-x-2">
              {[10, 15, 20, 30, 45, 60].map(time => (
                <button
                  key={time}
                  onClick={() => setAllWinnersDisplayTime(time)}
                  className={clsx(
                    "px-4 py-2 rounded-lg font-bold transition-colors",
                    allWinnersDisplayTime === time
                      ? "bg-indigo-100 text-indigo-700 border-2 border-indigo-500"
                      : "bg-slate-100 text-slate-600 border-2 border-transparent hover:bg-slate-200"
                  )}
                >
                  {time}s
                </button>
              ))}
            </div>
          </div>

          {/* PREVIEW */}
          <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Preview</h3>
            {winnersPreviewConfig ? (
              <div className="space-y-4">
                <div className="flex flex-col space-y-1">
                  <div className="font-bold text-slate-800">{winnersPreviewConfig.programName} <span className="text-slate-400 font-normal">({winnersPreviewConfig.category})</span></div>
                  <div className="text-sm text-slate-500 mb-2">Presentation: {winnersPreviewConfig.presentation}</div>
                </div>
                
                <div className="relative w-full aspect-video bg-[#04060C] overflow-hidden rounded-xl border-4 border-slate-800 shadow-2xl" style={{ contain: 'strict' }}>
                  <div 
                    className="absolute top-0 left-0 w-[1920px] h-[1080px] origin-top-left"
                    style={{ transform: 'scale(0.1)' }} // Force containing block immediately before ref runs
                    ref={(el) => {
                      if (el && el.parentElement) {
                        const scale = el.parentElement.clientWidth / 1920;
                        el.style.transform = `scale(${scale})`;
                      }
                    }}
                  >
                    <AllWinnersRouter config={winnersPreviewConfig} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-500">Select a program to generate preview...</div>
            )}
          </div>

          {winnersStatus && (
            <div className={clsx(
              "p-4 rounded-lg flex items-center space-x-2",
              winnersStatus.type === 'error' ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"
            )}>
              {winnersStatus.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
              <span>{winnersStatus.text}</span>
            </div>
          )}

          <div className="flex space-x-4 pt-2">
            <button
              onClick={handleShowWinners}
              disabled={pushingWinners || !winnersPreviewConfig}
              className="flex-1 flex items-center justify-center space-x-2 bg-indigo-600 text-white rounded-lg py-4 font-bold text-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-md"
            >
              <MonitorPlay className="w-6 h-6" />
              <span>SHOW POSTER ON TV</span>
            </button>
            <button
              onClick={handleHideWinners}
              disabled={pushingWinners || !tvState?.isActive}
              className="flex-1 flex items-center justify-center space-x-2 bg-slate-800 text-white rounded-lg py-4 font-bold text-lg hover:bg-slate-700 transition-colors disabled:opacity-50 shadow-md"
            >
              <EyeOff className="w-6 h-6" />
              <span>HIDE POSTER</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center space-x-2 uppercase tracking-widest">
          <MonitorPlay className="w-5 h-5 text-indigo-500" />
          <span>Results Entry Control</span>
        </h2>
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">
              RESULTS ENTRY DESIGN
            </label>
            <div className="grid grid-cols-2 gap-4">
              {resultsOptions.map(opt => (
                <button
                  key={opt}
                  onClick={() => handleResultsDesignChange(opt)}
                  className={clsx(
                    "p-4 rounded-xl border-2 font-bold transition-all text-left flex items-center justify-between",
                    selectedResultsDesign === opt 
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700" 
                      : "border-slate-200 hover:border-indigo-300 text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <span>{opt}</span>
                  {selectedResultsDesign === opt && <CheckCircle2 className="w-5 h-5 text-indigo-500" />}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-3 font-medium mb-6">
              This design will be used when you click "START REVEAL" on the Results Entry page.
            </p>

            {/* PREVIEW */}
            <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Preview</h3>
              <div className="space-y-4">
                <div className="flex flex-col space-y-1">
                  <div className="font-bold text-slate-800">Mockup Result <span className="text-slate-400 font-normal">(ARABIC • SENIOR)</span></div>
                  <div className="text-sm text-slate-500 mb-2">Presentation: {selectedResultsDesign}</div>
                </div>
                
                <div className="relative w-full aspect-video bg-[#04060C] overflow-hidden rounded-xl border-4 border-slate-800 shadow-2xl" style={{ contain: 'strict' }}>
                  <div 
                    className="absolute top-0 left-0 w-[1920px] h-[1080px] origin-top-left"
                    style={{ transform: 'scale(0.1)' }} // Force containing block immediately before ref runs
                    ref={(el) => {
                      if (el && el.parentElement) {
                        const scale = el.parentElement.clientWidth / 1920;
                        el.style.transform = `scale(${scale})`;
                      }
                    }}
                  >
                    <ResultsRouter 
                      design={
                        selectedResultsDesign === 'Design 2' ? 'design2' :
                        selectedResultsDesign === 'Design 3' ? 'design3' :
                        selectedResultsDesign === 'Design 4' ? 'design4' :
                        'design1'
                      }
                      results={[
                        {
                          _id: 'mock1',
                          studentName: 'MONU',
                          position: 1,
                          points: 10,
                          programId: { name: 'PROGRAM', language: 'ARABIC', category: 'SENIOR' },
                          teamId: { name: 'MOCK TEAM', color: '#10b981' }
                        } as any
                      ]}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 text-white rounded-xl shadow-lg border border-slate-800 p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[50%] h-full bg-gradient-to-l from-indigo-500/20 to-transparent pointer-events-none" />
        <h2 className="text-2xl font-black mb-2 uppercase tracking-tight flex items-center">
          <MonitorPlay className="mr-3 text-indigo-400" /> FINAL TEAM REVEAL
        </h2>
        <p className="text-slate-400 mb-8 max-w-xl">
          Trigger a premium, standalone cinematic reveal sequence on the TV. This will temporarily override the current display.
        </p>
        
        <Link 
          href="/admin/final-reveal"
          className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)]"
        >
          <span>OPEN FINAL TEAM REVEAL</span>
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>

      <div className="bg-slate-900 text-white rounded-xl shadow-lg border border-slate-800 p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[50%] h-full bg-gradient-to-l from-emerald-500/20 to-transparent pointer-events-none" />
        <h2 className="text-2xl font-black mb-2 uppercase tracking-tight flex items-center">
          <MonitorPlay className="mr-3 text-emerald-400" /> MEDIA CONTROL
        </h2>
        <p className="text-slate-400 mb-8 max-w-xl">
          Upload images and videos from your PC and play them on the TV fullscreen.
        </p>
        
        <Link 
          href="/admin/media"
          className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)]"
        >
          <span>OPEN MEDIA CONTROL</span>
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
        <h2 className="text-xl font-semibold mb-6 flex items-center justify-between">
          Premium Custom Announcements
          {tvState?.isActive && tvState.presentationType === 'CUSTOM_ANNOUNCEMENT' && (
            <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-4 py-1 rounded-full text-sm font-bold border border-emerald-200">
              <span className="animate-pulse h-2 w-2 bg-emerald-500 rounded-full"></span>
              <span>CURRENTLY SHOWING</span>
            </div>
          )}
        </h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">TEMPLATE</label>
            <div className="flex space-x-4">
              <button
                onClick={() => setCustomAnnTemplate('NEXT_PROGRAM')}
                className={clsx(
                  "flex-1 p-4 rounded-xl border-2 font-bold transition-all text-center",
                  customAnnTemplate === 'NEXT_PROGRAM' ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-200 hover:border-indigo-300 text-slate-600"
                )}
              >
                NEXT PROGRAM
              </button>
              <button
                onClick={() => setCustomAnnTemplate('JUDGES_THANK_YOU')}
                className={clsx(
                  "flex-1 p-4 rounded-xl border-2 font-bold transition-all text-center",
                  customAnnTemplate === 'JUDGES_THANK_YOU' ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-200 hover:border-indigo-300 text-slate-600"
                )}
              >
                JUDGES THANK YOU
              </button>
            </div>
          </div>

          {customAnnTemplate === 'NEXT_PROGRAM' && (
            <div className="space-y-4 bg-slate-50 p-6 rounded-xl border border-slate-200">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Program Name</label>
                <input
                  type="text"
                  className="w-full border-slate-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border"
                  placeholder="e.g. Quran Recitation"
                  value={nextProgName}
                  onChange={e => setNextProgName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Chess Number</label>
                <input
                  type="text"
                  className="w-full border-slate-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border text-2xl font-black"
                  placeholder="025"
                  value={nextProgChess}
                  onChange={e => setNextProgChess(e.target.value)}
                />
              </div>
            </div>
          )}

          {customAnnTemplate === 'JUDGES_THANK_YOU' && (
            <div className="space-y-4 bg-slate-50 p-6 rounded-xl border border-slate-200">
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Judges List</label>
              <div className="space-y-3">
                {judgesList.map((judge, idx) => (
                  <div key={idx} className="flex space-x-2">
                    <input
                      type="text"
                      className="flex-1 border-slate-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border"
                      placeholder={`Judge ${idx + 1} Name`}
                      value={judge.name}
                      onChange={e => {
                        const newList = [...judgesList];
                        newList[idx].name = e.target.value;
                        setJudgesList(newList);
                      }}
                    />
                    <button
                      onClick={() => setJudgesList(judgesList.filter((_, i) => i !== idx))}
                      className="px-4 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 font-bold"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setJudgesList([...judgesList, { name: '' }])}
                className="mt-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center"
              >
                + ADD JUDGE
              </button>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">DISPLAY DURATION</label>
            <div className="flex space-x-4">
              {[10, 15, 20, 30].map(d => (
                <button
                  key={d}
                  onClick={() => setCustomAnnDuration(d)}
                  className={clsx(
                    "px-6 py-2 rounded-lg font-bold transition-colors",
                    customAnnDuration === d 
                      ? "bg-indigo-100 text-indigo-700 border-2 border-indigo-500" 
                      : "bg-slate-50 text-slate-600 border-2 border-transparent hover:bg-slate-100"
                  )}
                >
                  {d}s
                </button>
              ))}
            </div>
          </div>

          {customAnnStatus && (
            <div className={clsx(
              "p-4 rounded-lg flex items-center space-x-2",
              customAnnStatus.type === 'error' ? "bg-red-50 text-red-700 border border-red-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
            )}>
              {customAnnStatus.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
              <span className="font-semibold">{customAnnStatus.text}</span>
            </div>
          )}

          <button
            onClick={handlePushCustomAnnouncement}
            disabled={pushingCustomAnn}
            className="w-full flex items-center justify-center space-x-2 bg-indigo-600 text-white rounded-lg py-4 font-black text-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-md tracking-widest"
          >
            <MonitorPlay className="w-6 h-6" />
            <span>SHOW ON TV</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <h2 className="text-xl font-semibold mb-6">Standard Text Announcement</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Message Text</label>
            <textarea
              className="w-full border-slate-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-4 border text-lg"
              rows={3}
              placeholder="e.g. Congratulations Muhammad for winning 1st place in Quran Recitation!"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Display Duration</label>
            <div className="flex space-x-4">
              {[5, 10, 15, 30].map(d => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={clsx(
                    "px-6 py-2 rounded-lg font-medium transition-colors",
                    duration === d 
                      ? "bg-indigo-100 text-indigo-700 border-2 border-indigo-500" 
                      : "bg-slate-50 text-slate-600 border-2 border-transparent hover:bg-slate-100"
                  )}
                >
                  {d} sec
                </button>
              ))}
            </div>
          </div>

          {status && (
            <div className={clsx(
              "p-4 rounded-lg flex items-center space-x-2",
              status.type === 'error' ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"
            )}>
              {status.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
              <span>{status.text}</span>
            </div>
          )}

          <button
            onClick={handleSend}
            disabled={sending}
            className="w-full flex items-center justify-center space-x-2 bg-indigo-600 text-white rounded-lg py-4 font-bold text-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-md"
          >
            <Send className="w-6 h-6" />
            <span>SHOW ON TV</span>
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="mt-16 pt-8 border-t border-slate-200">
        <h2 className="text-red-600 font-bold text-xl mb-4 flex items-center">
          <AlertCircle className="mr-2" /> Danger Zone
        </h2>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-red-900">Reset Event</h3>
            <p className="text-red-700 text-sm mt-1">Deletes ALL programs, teams, results and competition data.</p>
          </div>
          <button 
            onClick={() => { setIsResetConfirmModalOpen(true); setResetConfirmText(''); }}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold transition-colors"
          >
            RESET EVENT
          </button>
        </div>
      </div>

      {isResetConfirmModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 border border-red-200">
            <div className="flex items-center space-x-3 text-red-600 mb-6">
              <AlertCircle className="w-8 h-8" />
              <h2 className="text-2xl font-black tracking-tight uppercase">RESET ENTIRE EVENT?</h2>
            </div>
            
            <div className="bg-red-50 text-red-800 p-4 rounded-xl border border-red-200 mb-6">
              <p className="font-bold text-sm uppercase tracking-wide mb-1">WARNING:</p>
              <p className="font-medium text-sm">
                This will permanently delete ALL programs, teams, results and competition data. This action cannot be undone.
              </p>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                Type <span className="font-black text-slate-900 select-all">RESET EVENT</span> to confirm
              </label>
              <input
                type="text"
                value={resetConfirmText}
                onChange={(e) => setResetConfirmText(e.target.value)}
                placeholder="RESET EVENT"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all font-medium text-slate-900"
                disabled={isResetting}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsResetConfirmModalOpen(false)}
                disabled={isResetting}
                className="px-6 py-3 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50 uppercase tracking-wider"
              >
                CANCEL
              </button>
              <button
                onClick={handleResetEvent}
                disabled={isResetting || resetConfirmText !== 'RESET EVENT'}
                className={clsx(
                  "px-6 py-3 text-sm font-bold text-white rounded-xl transition-colors uppercase tracking-wider",
                  (isResetting || resetConfirmText !== 'RESET EVENT') ? "bg-red-300 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
                )}
              >
                {isResetting ? 'RESETTING EVENT...' : 'RESET EVERYTHING'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
