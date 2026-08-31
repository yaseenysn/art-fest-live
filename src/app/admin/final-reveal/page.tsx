"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MonitorPlay, EyeOff, RotateCcw } from 'lucide-react';
import FinalTeamReveal from '../../tv/components/FinalTeamReveal';
import clsx from 'clsx';

export default function FinalRevealAdminPage() {
  const [teamName, setTeamName] = useState('AL MAHSAN');
  const [position, setPosition] = useState(1);
  const [previewActive, setPreviewActive] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handlePreview = () => {
    setPreviewActive(false);
    setTimeout(() => {
      setPreviewActive(true);
    }, 100);
  };

  const handleStartReveal = async () => {
    setIsStarting(true);
    try {
      const duration = 20;
      const startedAt = new Date();
      const expiresAt = new Date(startedAt.getTime() + duration * 1000);
      await fetch('/api/tv-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          finalRevealActive: true,
          finalRevealTeamName: teamName,
          finalRevealPosition: position,
          presentationId: crypto.randomUUID(),
          presentationType: 'FINAL_TEAM_REVEAL',
          presentationStartedAt: startedAt.toISOString(),
          presentationExpiresAt: expiresAt.toISOString(),
          presentationDuration: duration
        })
      });
      alert('Final Team Reveal activated on TV.');
    } catch (err) {
      console.error(err);
      alert('Failed to activate reveal.');
    } finally {
      setIsStarting(false);
    }
  };

  const handleResetReveal = async () => {
    setIsResetting(true);
    try {
      await fetch('/api/tv-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          finalRevealActive: false
        })
      });
      alert('Reveal reset. TV returned to normal.');
    } catch (err) {
      console.error(err);
      alert('Failed to reset reveal.');
    } finally {
      setIsResetting(false);
    }
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
              <p className="text-text-muted font-medium mt-1">Standalone cinematic reveal control</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls */}
          <div className="bg-card rounded-2xl shadow-sm border border-border-card p-8 flex flex-col space-y-8">
            <h2 className="text-xl font-bold text-text-primary uppercase tracking-wide border-b pb-4">Configuration</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-text-primary mb-2 uppercase tracking-wide">
                  Team Name
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Enter Team Name"
                  className="w-full px-4 py-3 rounded-xl border border-border-card bg-card-secondary focus:bg-card focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-bold text-white text-lg uppercase"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-text-primary mb-2 uppercase tracking-wide">
                  Position
                </label>
                <select
                  value={position}
                  onChange={(e) => setPosition(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-border-card bg-card-secondary focus:bg-card focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-bold text-white text-lg uppercase"
                >
                  <option value={1}>1ST PLACE</option>
                  <option value={2}>2ND PLACE</option>
                  <option value={3}>3RD PLACE</option>
                </select>
              </div>
            </div>

            <div className="pt-8 border-t border-border-card space-y-4">
              <button
                onClick={handlePreview}
                className="w-full flex items-center justify-center space-x-2 bg-row text-white rounded-xl py-4 font-black uppercase tracking-widest text-sm hover:bg-slate-700 transition-colors shadow-md"
              >
                <MonitorPlay className="w-5 h-5" />
                <span>Preview Locally</span>
              </button>

              <button
                onClick={handleStartReveal}
                disabled={isStarting}
                className="w-full flex items-center justify-center space-x-2 bg-emerald-600 text-white rounded-xl py-4 font-black uppercase tracking-widest text-lg hover:bg-emerald-500/10 border border-emerald-500/200 transition-colors shadow-lg shadow-emerald-600/30 disabled:opacity-50"
              >
                <MonitorPlay className="w-6 h-6" />
                <span>{isStarting ? 'Starting...' : 'START ON TV'}</span>
              </button>

              <button
                onClick={handleResetReveal}
                disabled={isResetting}
                className="w-full flex items-center justify-center space-x-2 bg-red-600 text-white rounded-xl py-4 font-black uppercase tracking-widest text-sm hover:bg-red-500/10 border border-red-500/200 transition-colors shadow-md disabled:opacity-50"
              >
                <RotateCcw className="w-5 h-5" />
                <span>{isResetting ? 'Resetting...' : 'RESET REVEAL (HIDE)'}</span>
              </button>
            </div>
            
            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-800 p-4 rounded-xl border border-amber-200 text-sm font-medium">
              <p><strong>Note:</strong> Starting this reveal overrides the TV. Clicking "Reset Reveal" returns the TV exactly to what it was showing before.</p>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-2 bg-card-secondary rounded-2xl shadow-xl overflow-hidden border border-border-card flex flex-col relative aspect-video">
             <div className="absolute top-4 left-4 z-[9999] bg-black/60 backdrop-blur text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center shadow-lg border border-white/10">
               <EyeOff className="w-4 h-4 mr-2 text-indigo-400" />
               LIVE PREVIEW PANEL
             </div>
             
             <div className="w-full h-full relative overflow-hidden bg-black flex items-center justify-center">
                {previewActive ? (
                  <FinalTeamReveal 
                    teamName={teamName} 
                    position={position} 
                    active={previewActive} 
                  />
                ) : (
                  <div className="text-text-secondary font-bold uppercase tracking-widest flex flex-col items-center">
                    <MonitorPlay className="w-16 h-16 mb-4 opacity-50" />
                    Click "Preview Locally"
                  </div>
                )}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
