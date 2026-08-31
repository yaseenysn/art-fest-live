"use client";

import { useState, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { IProgram, IResult, PROGRAM_LANGUAGES, PROGRAM_CATEGORIES } from '@/types';
import { getSocket } from '@/lib/socket-client';
import { SOCKET_EVENTS } from '@/lib/socket';
import { 
  Plus, 
  Search, 
  Filter, 
  MonitorPlay, 
  Award,
  PlayCircle,
  StopCircle,
  Edit2,
  Trash2,
  Eye,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

// Result Status Utility
type ResultStatus = 'NOT_STARTED' | 'DRAFT' | 'READY' | 'REVEALED';

function getProgramResultStatus(programResults: IResult[]): ResultStatus {
  if (!programResults || programResults.length === 0) return 'NOT_STARTED';
  
  const has1st = programResults.some(r => r.position === 1);
  const has2nd = programResults.some(r => r.position === 2);
  const has3rd = programResults.some(r => r.position === 3);
  
  if (!has1st || !has2nd || !has3rd) return 'DRAFT';
  
  const allRevealed = programResults.every(r => r.revealed);
  
  if (allRevealed) return 'REVEALED';
  return 'READY';
}

export default function ProgramsPage() {
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

  const { data: results = [], isLoading: loadingResults } = useQuery<IResult[]>({
    queryKey: ['results', 'all'],
    queryFn: async () => {
      const res = await fetch('/api/results');
      if (!res.ok) throw new Error('Failed to fetch results');
      return res.json();
    },
    staleTime: 30000,
  });

  const loading = loadingPrograms || loadingResults;
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [languageFilter, setLanguageFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [selectedProgram, setSelectedProgram] = useState<IProgram | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    language: 'Other',
    category: '',
    type: 'Individual',
    maxPoints: 10,
    description: '',
    programOrder: 0
  });
  
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Socket.IO Setup
    const socket = getSocket();
    
    const onResultSaved = () => {
      queryClient.invalidateQueries({ queryKey: ['results', 'all'] });
    };

    const onScoreUpdated = () => {
      queryClient.invalidateQueries({ queryKey: ['results', 'all'] });
    };

    const onProgramEvent = () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
    };

    const onEventReset = () => {
      setSelectedProgram(null);
      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      setIsDetailsModalOpen(false);
      setIsDeleteModalOpen(false);
      
      queryClient.removeQueries({ queryKey: ['programs'] });
      queryClient.removeQueries({ queryKey: ['results'] });
      
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      queryClient.invalidateQueries({ queryKey: ['results', 'all'] });
    };

    socket.on(SOCKET_EVENTS.RESULT_SAVED, onResultSaved);
    socket.on(SOCKET_EVENTS.SCORE_UPDATED, onScoreUpdated);
    socket.on(SOCKET_EVENTS.PROGRAM_CREATED, onProgramEvent);
    socket.on(SOCKET_EVENTS.PROGRAM_UPDATED, onProgramEvent);
    socket.on(SOCKET_EVENTS.PROGRAM_DELETED, onProgramEvent);
    socket.on(SOCKET_EVENTS.EVENT_RESET, onEventReset);

    return () => {
      socket.off(SOCKET_EVENTS.RESULT_SAVED, onResultSaved);
      socket.off(SOCKET_EVENTS.SCORE_UPDATED, onScoreUpdated);
      socket.off(SOCKET_EVENTS.PROGRAM_CREATED, onProgramEvent);
      socket.off(SOCKET_EVENTS.PROGRAM_UPDATED, onProgramEvent);
      socket.off(SOCKET_EVENTS.PROGRAM_DELETED, onProgramEvent);
      socket.off(SOCKET_EVENTS.EVENT_RESET, onEventReset);
    };
  }, [queryClient]);

  // -- Derived Data --
  const existingCategories = useMemo(() => {
    const cats = new Set(programs.map(p => p.category));
    return Array.from(cats);
  }, [programs]);

  const allCategoryOptions = useMemo(() => {
    return Array.from(new Set([...PROGRAM_CATEGORIES, ...existingCategories]));
  }, [existingCategories]);

  const existingLanguages = useMemo(() => {
    const langs = new Set(programs.map(p => p.language || 'Other'));
    return Array.from(langs);
  }, [programs]);

  const allLanguageOptions = useMemo(() => {
    return Array.from(new Set([...PROGRAM_LANGUAGES, ...existingLanguages]));
  }, [existingLanguages]);

  const livePrograms = programs.filter(p => p.status === 'live');
  
  // Next program based on order
  const nextProgram = useMemo(() => {
    const upcoming = programs.filter(p => p.status === 'upcoming');
    if (upcoming.length === 0) return null;
    
    if (livePrograms.length === 0) return upcoming[0];
    
    // Find the next upcoming program that has an order greater than the highest order of all live programs
    const maxLiveOrder = Math.max(...livePrograms.map(p => p.programOrder || 0));
    return upcoming.find(p => (p.programOrder || 0) > maxLiveOrder) || upcoming[0];
  }, [livePrograms, programs]);

  const filteredPrograms = programs.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.language || 'Other').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter.toLowerCase();
    const matchesLanguage = languageFilter === 'All' || (p.language || 'Other') === languageFilter;
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesLanguage && matchesCategory;
  });

  // Action Handlers
  const openAddModal = () => {
    setSelectedProgram(null);
    setFormData({ name: '', language: 'Arabic', category: 'Senior', type: 'Individual', maxPoints: 10, description: '', programOrder: programs.length + 1 });
    setIsAddModalOpen(true);
  };

  const handleSaveProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.language || !formData.category) {
      alert("Name, Language, and Age Group are required");
      return;
    }
    
    if (selectedProgram && formData.maxPoints !== selectedProgram.maxPoints) {
      const programResults = results.filter(r => (r.programId as { _id: string })._id === selectedProgram._id || r.programId === selectedProgram._id);
      if (programResults.length > 0) {
        if (!confirm("This program already has results. Changing the maximum points may affect future result validation. Existing results will not be modified. Continue?")) {
          return;
        }
      }
    }

    try {
      const isEditing = isEditModalOpen && selectedProgram;
      const url = isEditing ? `/api/programs/${selectedProgram._id}` : '/api/programs';
      const method = isEditing ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        if (res.status === 401) throw new Error("Session expired. Please login again.");
        throw new Error(data.error || 'Failed to save program');
      }

      if (method === 'POST') {
        if (!data._id) {
           throw new Error("Created program ID is missing from response. Please contact support.");
        }
      }
      
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      setSelectedProgram(null);
      alert(method === 'POST' ? "Program created successfully!" : "Program updated successfully!");
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const updateProgramStatus = async (program: IProgram, newStatus: string) => {
    try {
      const res = await fetch(`/api/programs/${program._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update program status');
      }
      
      queryClient.invalidateQueries({ queryKey: ['programs'] });
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const confirmDelete = (program: IProgram) => {
    setSelectedProgram(program);
    setDeleteConfirmationText('');
    setIsDeleteModalOpen(true);
    setIsDetailsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedProgram) return;
    
    if (deleteConfirmationText !== selectedProgram.name) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/programs/${selectedProgram._id}`, {
        method: 'DELETE'
      });
      
      if (!res.ok) {
        if (res.status === 401) throw new Error("Authentication error. Please log in as admin.");
        if (res.status === 404) throw new Error("Program not found.");
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete program.');
      }
      
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      setIsDeleteModalOpen(false);
      setIsDetailsModalOpen(false);
      alert("Program deleted successfully.");
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
          <div className="text-text-muted font-medium">Loading Programs...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-12 space-y-8">
      
      {/* HEADER & SUMMARY */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">PROGRAMS</h1>
          <p className="text-text-muted mt-1">Manage all competition programs</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center space-x-2 bg-primary-indigo text-white text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-primary-purple text-white transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>ADD PROGRAM</span>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card p-5 rounded-2xl shadow-sm border border-border-card">
          <div className="text-sm font-semibold text-text-muted uppercase">Total Programs</div>
          <div className="text-3xl font-black text-text-primary mt-1">{programs.length}</div>
        </div>
        <div className="bg-card p-5 rounded-2xl shadow-sm border border-border-card">
          <div className="text-sm font-semibold text-text-muted uppercase">Completed</div>
          <div className="text-3xl font-black text-primary-indigo mt-1">{programs.filter(p => p.status === 'completed').length}</div>
        </div>
        <div className="bg-card p-5 rounded-2xl shadow-sm border border-border-card">
          <div className="text-sm font-semibold text-text-muted uppercase">Live</div>
          <div className="text-3xl font-black text-red-400 mt-1 flex items-center">
            {livePrograms.length > 0 && <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse mr-2" />}
            {livePrograms.length}
          </div>
        </div>
        <div className="bg-card p-5 rounded-2xl shadow-sm border border-border-card">
          <div className="text-sm font-semibold text-text-muted uppercase">Upcoming</div>
          <div className="text-3xl font-black text-amber-400 mt-1">{programs.filter(p => p.status === 'upcoming').length}</div>
        </div>
      </div>

      {/* LIVE NOW HIGHLIGHT */}
      {livePrograms.length > 0 ? (
        <div className="space-y-4">
          {livePrograms.map(liveProgram => (
            <div key={liveProgram._id as string} className="bg-card rounded-2xl shadow-sm border-2 border-red-200 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-red-600" />
              <div className="p-6 md:p-8">
                <div className="flex items-center space-x-2 mb-4">
                  <span className="flex items-center text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-widest border border-red-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 mr-2 animate-pulse"></span>
                    LIVE NOW
                  </span>
                </div>
                
                <div className="flex flex-col md:flex-row justify-between md:items-end gap-6">
                  <div>
                    <h2 className="text-3xl font-black text-white tracking-tight">{liveProgram.name}</h2>
                    <div className="flex items-center space-x-2 text-sm font-medium text-text-muted mt-2">
                      <span>{liveProgram.language || 'Other'} • {liveProgram.category}</span>
                      <span>•</span>
                      <span>{liveProgram.type || 'Individual'}</span>
                      <span>•</span>
                      <span>Maximum {liveProgram.maxPoints || 10} Points</span>
                    </div>
                    
                    <div className="mt-4 inline-flex items-center bg-card-secondary px-3 py-1.5 rounded-lg border border-border-card">
                      <span className="text-sm font-semibold text-text-secondary mr-2">Result:</span>
                      <span className="text-sm font-bold text-text-primary">
                        {getProgramResultStatus(results.filter(r => (r.programId as { _id: string })._id === liveProgram._id || r.programId === liveProgram._id))}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 shrink-0">
                    <Link
                      href="/admin/results"
                      className="flex items-center space-x-2 bg-card-secondary text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-row transition-colors shadow-sm"
                    >
                      <Award className="w-4 h-4" />
                      <span>ENTER RESULT</span>
                    </Link>
                    <Link
                      href="/tv"
                      target="_blank"
                      className="flex items-center space-x-2 bg-card text-primary-indigo border border-indigo-200 px-5 py-2.5 rounded-lg font-semibold hover:bg-primary-purple/10 border border-primary-purple/20 transition-colors shadow-sm"
                    >
                      <MonitorPlay className="w-4 h-4" />
                      <span>VIEW ON TV</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* NEXT PROGRAM BANNER */}
          {nextProgram ? (
            <div className="bg-card-secondary px-8 py-3 border border-border-card rounded-2xl flex items-center justify-between">
              <div className="flex items-center text-sm">
                <span className="font-bold text-text-muted uppercase tracking-widest mr-3 text-xs">NEXT PROGRAM</span>
                <span className="font-semibold text-text-primary">{nextProgram.name}</span>
              </div>
            </div>
          ) : (
            <div className="bg-card-secondary px-8 py-3 border border-border-card rounded-2xl flex items-center justify-between">
              <div className="flex items-center text-sm">
                <span className="font-bold text-text-muted uppercase tracking-widest mr-3 text-xs">NEXT PROGRAM</span>
                <span className="font-semibold text-text-muted italic">Final Program</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-card-secondary border border-border-card border-dashed rounded-2xl p-8 text-center">
          <div className="text-text-muted font-medium">No program is currently live.</div>
        </div>
      )}

      {/* SEARCH AND FILTER */}
      <div className="bg-card p-4 rounded-xl shadow-sm border border-border-card flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search programs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border-card rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-border-card rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-card font-medium text-text-primary"
            >
              <option value="All">All Status</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Live">Live</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div className="relative">
            <select
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
              className="px-4 pr-8 py-2 border border-border-card rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-card font-medium text-text-primary"
            >
              <option value="All">All Languages</option>
              {allLanguageOptions.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 pr-8 py-2 border border-border-card rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-card font-medium text-text-primary"
            >
              <option value="All">All Age Groups</option>
              {allCategoryOptions.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ALL PROGRAMS TABLE */}
      <div className="bg-card rounded-2xl shadow-sm border border-border-card overflow-hidden">
        <div className="px-6 py-5 border-b border-border-subtle flex items-center justify-between bg-card-secondary">
          <h2 className="text-sm font-bold text-text-primary uppercase tracking-widest">ALL PROGRAMS</h2>
        </div>
        
        {filteredPrograms.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-card text-text-muted text-xs uppercase tracking-wider font-semibold border-b border-border-subtle">
                  <th className="px-6 py-4">#</th>
                  <th className="px-6 py-4">PROGRAM</th>
                  <th className="px-6 py-4">LANGUAGE</th>
                  <th className="px-6 py-4">AGE GROUP</th>
                  <th className="px-6 py-4">TYPE</th>
                  <th className="px-6 py-4 text-center">MAX POINTS</th>
                  <th className="px-6 py-4">STATUS</th>
                  <th className="px-6 py-4">RESULT</th>
                  <th className="px-6 py-4">POSTER</th>
                  <th className="px-6 py-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-card">
                {filteredPrograms.map((program) => {
                  const programResults = results.filter(r => (r.programId as { _id: string })._id === program._id || r.programId === program._id);
                  const resultStatus = getProgramResultStatus(programResults);
                  const orderNum = program.programOrder || 0;
                  
                  return (
                    <tr key={program._id as string} className="hover:bg-card-secondary/50 transition-colors group">
                      <td className="px-6 py-4 text-text-muted font-medium">
                        {orderNum.toString().padStart(2, '0')}
                      </td>
                      <td className="px-6 py-4">
                        <div 
                          className="font-bold text-text-primary cursor-pointer hover:text-primary-indigo"
                          onClick={() => { setSelectedProgram(program); setIsDetailsModalOpen(true); }}
                        >
                          {program.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-text-muted">{program.language || 'Other'}</td>
                      <td className="px-6 py-4 font-medium text-text-muted">{program.category}</td>
                      <td className="px-6 py-4 text-text-secondary">{program.type || 'Individual'}</td>
                      <td className="px-6 py-4 text-center font-bold text-text-primary">{program.maxPoints || 10}</td>
                      <td className="px-6 py-4">
                        {program.status === 'live' ? (
                          <span className="text-red-400 font-bold text-xs uppercase flex items-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600 mr-1.5 animate-pulse"></span>
                            LIVE
                          </span>
                        ) : program.status === 'completed' ? (
                          <span className="text-primary-indigo font-bold text-xs uppercase flex items-center">
                            ✓ COMPLETED
                          </span>
                        ) : (
                          <span className="text-text-muted font-bold text-xs uppercase flex items-center">
                            ○ UPCOMING
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-semibold text-xs uppercase px-2 py-1 rounded-md ${
                          resultStatus === 'REVEALED' ? 'bg-primary-purple/10 border border-primary-purple/20 text-indigo-700' :
                          resultStatus === 'READY' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-700' :
                          resultStatus === 'DRAFT' ? 'bg-amber-500/10 border border-amber-500/20 text-amber-700' :
                          'text-text-muted'
                        }`}>
                          {resultStatus === 'NOT_STARTED' ? '—' : resultStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col space-y-1">
                          {program.posterCreated ? (
                            <span className="text-emerald-400 font-bold text-[10px] uppercase bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded inline-block w-max">
                              INDV: {program.posterCount && program.posterCount > 1 ? `${program.posterCount} CREATED` : '✓ CREATED'}
                            </span>
                          ) : (
                            <span className="text-text-muted font-bold text-[10px] uppercase bg-card-secondary px-2 py-1 rounded inline-block w-max">INDV: NOT CREATED</span>
                          )}
                          
                          {program.allWinnersPosterCount ? (
                            <span className="text-orange-600 font-bold text-[10px] uppercase bg-orange-50 px-2 py-1 rounded inline-block w-max">
                              ALL: {program.allWinnersPosterCount > 1 ? `${program.allWinnersPosterCount} CREATED` : '✓ CREATED'}
                            </span>
                          ) : (
                            <span className="text-text-muted font-bold text-[10px] uppercase bg-card-secondary px-2 py-1 rounded inline-block w-max">ALL: NOT CREATED</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end items-center space-x-2">
                          {program.status === 'upcoming' && (
                            <button 
                              onClick={() => updateProgramStatus(program, 'live')}
                              className="text-xs font-bold bg-card-secondary text-white px-3 py-1.5 rounded hover:bg-row transition-colors flex items-center"
                            >
                              <PlayCircle className="w-3.5 h-3.5 mr-1" /> START
                            </button>
                          )}
                          
                          {program.status === 'live' && (
                            <>
                              <Link 
                                href="/admin/results"
                                className="text-xs font-bold bg-card-secondary text-white px-3 py-1.5 rounded hover:bg-row transition-colors flex items-center"
                              >
                                ENTER RESULT
                              </Link>
                              <button 
                                onClick={() => updateProgramStatus(program, 'completed')}
                                className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded hover:bg-red-500/20 transition-colors flex items-center"
                              >
                                <StopCircle className="w-3.5 h-3.5 mr-1" /> END
                              </button>
                            </>
                          )}
                          
                          {program.status === 'completed' && (
                            <Link 
                              href="/admin/results"
                              className="text-xs font-bold text-primary-indigo bg-primary-purple/10 border border-primary-purple/20 px-3 py-1.5 rounded hover:bg-primary-purple/20 transition-colors flex items-center"
                            >
                              <Eye className="w-3.5 h-3.5 mr-1" /> RESULT
                            </Link>
                          )}
                          
                          {/* ALWAYS SHOW EDIT AND DELETE */}
                          <button 
                            onClick={() => { 
                              setSelectedProgram(program); 
                              setFormData({ name: program.name, language: program.language || 'Other', category: program.category, type: program.type || 'Individual', maxPoints: program.maxPoints || 10, description: program.description || '', programOrder: program.programOrder || 0 });
                              setIsEditModalOpen(true);
                            }}
                            className="text-xs font-bold text-text-muted bg-row px-3 py-1.5 rounded hover:bg-slate-200 transition-colors flex items-center"
                          >
                            <Edit2 className="w-3.5 h-3.5 mr-1" /> EDIT
                          </button>
                          
                          <button 
                            onClick={() => confirmDelete(program)}
                            className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded hover:bg-red-500/20 transition-colors flex items-center"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1" /> DELETE
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-text-muted font-medium">
            No competition programs found.
          </div>
        )}
      </div>

      {/* ADD/EDIT MODAL */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 bg-card-secondary/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-5 border-b border-border-subtle flex justify-between items-center">
              <h3 className="text-lg font-bold text-text-primary">
                {isEditModalOpen ? 'EDIT PROGRAM' : 'ADD PROGRAM'}
              </h3>
            </div>
            
            <form onSubmit={handleSaveProgram} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-1">Program Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-border-card rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-1">Language *</label>
                  <select
                    required
                    value={formData.language}
                    onChange={e => setFormData({ ...formData, language: e.target.value })}
                    className="w-full px-3 py-2 border border-border-card rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-card"
                  >
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {isEditModalOpen && formData.language && !PROGRAM_LANGUAGES.includes(formData.language as any) && (
                      <option value={formData.language}>{formData.language} (Legacy)</option>
                    )}
                    {PROGRAM_LANGUAGES.map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-1">Age Group *</label>
                  <select
                    required
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-border-card rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-card"
                  >
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {isEditModalOpen && formData.category && !PROGRAM_CATEGORIES.includes(formData.category as any) && (
                      <option value={formData.category}>{formData.category} (Legacy)</option>
                    )}
                    {PROGRAM_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-1">Competition Type *</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value as 'Individual' | 'Team' })}
                    className="w-full px-3 py-2 border border-border-card rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-card"
                  >
                    <option value="Individual">Individual</option>
                    <option value="Team">Team</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-1">Maximum Points *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.maxPoints}
                    onChange={e => setFormData({ ...formData, maxPoints: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-border-card rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-primary mb-1">Program Order</label>
                <input
                  type="number"
                  min="0"
                  value={formData.programOrder}
                  onChange={e => setFormData({ ...formData, programOrder: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-border-card rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-1">Description (Optional)</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-border-card rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                />
              </div>
              
              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                  className="px-4 py-2 text-sm font-bold text-text-secondary hover:bg-row rounded-lg transition-colors"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-bold bg-primary-indigo text-white text-white hover:bg-primary-purple text-white rounded-lg transition-colors"
                >
                  {isEditModalOpen ? 'SAVE CHANGES' : 'CREATE PROGRAM'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAILS / DELETE MODAL */}
      {isDetailsModalOpen && selectedProgram && (
        <div className="fixed inset-0 bg-card-secondary/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-2xl shadow-xl max-w-lg w-full overflow-hidden">
            
            {isDeleteModalOpen ? (
              <div className="p-6 text-center">
                <div className="flex items-center justify-center space-x-3 mb-4 text-red-400">
                  <AlertCircle className="w-8 h-8" />
                  <h2 className="text-2xl font-black uppercase tracking-widest">DELETE PROGRAM?</h2>
                </div>
                
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl border border-red-200 text-left">
                  <p className="font-bold mb-2">Program: {selectedProgram.name}</p>
                  <p className="text-sm font-medium">
                    WARNING: This will permanently delete this program and ALL competition results associated with it, including 1st, 2nd and 3rd place results. This action cannot be undone.
                  </p>
                  {selectedProgram.status === 'live' && (
                    <p className="text-sm font-bold mt-3 text-red-900 border-t border-red-200 pt-3">
                      This program is currently LIVE. Deleting it will immediately remove its results and return the live system to a safe state.
                    </p>
                  )}
                </div>

                <div className="mb-6 text-left">
                  <label className="block text-sm font-bold text-text-primary mb-2 uppercase tracking-wide">
                    Type <span className="font-black text-white select-all">{selectedProgram.name}</span> to confirm
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmationText}
                    onChange={(e) => setDeleteConfirmationText(e.target.value)}
                    placeholder={selectedProgram.name}
                    className="w-full px-4 py-3 rounded-xl border border-border-card bg-card-secondary focus:bg-card focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all font-medium text-white"
                    disabled={isDeleting}
                  />
                </div>
                
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    disabled={isDeleting}
                    className="flex-1 px-5 py-3 text-sm font-bold text-text-secondary bg-row hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50 uppercase tracking-wider"
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting || deleteConfirmationText !== selectedProgram.name}
                    className={`flex-1 px-5 py-3 text-sm font-bold text-white rounded-xl transition-colors uppercase tracking-wider ${
                      (isDeleting || deleteConfirmationText !== selectedProgram.name) ? "bg-red-300 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    {isDeleting ? 'DELETING...' : 'DELETE EVERYTHING'}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="px-6 py-5 border-b border-border-subtle flex justify-between items-center bg-card-secondary">
                  <h3 className="text-lg font-black text-text-primary tracking-tight">{selectedProgram.name}</h3>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => { setIsDetailsModalOpen(false); setFormData({ name: selectedProgram.name, language: selectedProgram.language || 'Other', category: selectedProgram.category, type: selectedProgram.type || 'Individual', maxPoints: selectedProgram.maxPoints || 10, description: selectedProgram.description || '', programOrder: selectedProgram.programOrder || 0 }); setIsEditModalOpen(true); }}
                      className="text-xs font-bold text-text-secondary bg-row hover:bg-slate-200 px-3 py-1.5 rounded transition-colors flex items-center"
                    >
                      <Edit2 className="w-3.5 h-3.5 mr-1" /> EDIT PROGRAM
                    </button>
                    <button 
                      onClick={() => confirmDelete(selectedProgram)}
                      className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 px-3 py-1.5 rounded transition-colors flex items-center"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" /> DELETE PROGRAM
                    </button>
                    <button 
                      onClick={() => setIsDetailsModalOpen(false)}
                      className="text-text-muted hover:text-text-primary ml-2"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm mb-6">
                    <div>
                      <span className="block text-text-muted font-semibold mb-1">Language • Age Group</span>
                      <span className="font-medium text-text-primary">{selectedProgram.language || 'Other'} • {selectedProgram.category}</span>
                    </div>
                    <div>
                      <span className="block text-text-muted font-semibold mb-1">Type</span>
                      <span className="font-medium text-text-primary">{selectedProgram.type || 'Individual'}</span>
                    </div>
                    <div>
                      <span className="block text-text-muted font-semibold mb-1">Maximum Points</span>
                      <span className="font-medium text-text-primary">{selectedProgram.maxPoints || 10}</span>
                    </div>
                    <div>
                      <span className="block text-text-muted font-semibold mb-1">Program Order</span>
                      <span className="font-medium text-text-primary">{selectedProgram.programOrder || 0}</span>
                    </div>
                    {selectedProgram.description && (
                      <div className="col-span-2">
                        <span className="block text-text-muted font-semibold mb-1">Description</span>
                        <span className="font-medium text-text-primary">{selectedProgram.description}</span>
                      </div>
                    )}
                    <div>
                      <span className="block text-text-muted font-semibold mb-1">Congratulations Poster</span>
                      <span className={selectedProgram.posterCreated ? "font-bold text-emerald-400" : "font-medium text-text-muted"}>
                        {selectedProgram.posterCreated ? 'Created' : 'Not Created'}
                      </span>
                    </div>
                    {selectedProgram.posterCreated && (
                      <>
                        <div>
                          <span className="block text-text-muted font-semibold mb-1">Posters Created</span>
                          <span className="font-medium text-text-primary">{selectedProgram.posterCount || 1}</span>
                        </div>
                        <div>
                          <span className="block text-text-muted font-semibold mb-1">Last Poster Created At</span>
                          <span className="font-medium text-text-primary">
                            {selectedProgram.posterCreatedAt ? new Date(selectedProgram.posterCreatedAt).toLocaleString() : 'N/A'}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="border-t border-border-subtle pt-6">
                    <h4 className="text-sm font-bold text-text-primary uppercase tracking-widest mb-4">Results</h4>
                    
                    {(() => {
                      const progResults = results.filter(r => (r.programId as { _id: string })._id === selectedProgram._id || r.programId === selectedProgram._id);
                      if (progResults.length === 0) {
                        return <div className="text-text-muted italic text-sm">No results recorded yet.</div>;
                      }

                      // Sort results by position
                      const sortedResults = [...progResults].sort((a, b) => a.position - b.position);

                      return (
                        <div className="space-y-3">
                          {sortedResults.map(r => {
                            const studentName = r.studentName;
                            const team = r.teamId as { name: string, color: string };
                            return (
                              <div key={r._id as string} className="flex items-center justify-between p-3 bg-card-secondary rounded-lg border border-border-subtle">
                                <div className="flex items-center space-x-3">
                                  <span className="text-xl">
                                    {r.position === 1 ? '🥇' : r.position === 2 ? '🥈' : '🥉'}
                                  </span>
                                  <div>
                                    <div className="font-bold text-text-primary text-sm">{studentName || 'Unknown'}</div>
                                    <div className="flex items-center space-x-1 mt-0.5">
                                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: team?.color }}></div>
                                      <span className="text-xs font-semibold text-text-muted">{team?.name || 'Unknown'}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="font-bold text-primary-indigo text-sm bg-primary-purple/10 border border-primary-purple/20 px-2 py-1 rounded">
                                  {r.points} pts
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>

                  <div className="mt-8 flex justify-end space-x-3">
                    <Link
                      href="/admin/results"
                      className="px-4 py-2 text-sm font-bold bg-card-secondary text-white hover:bg-row rounded-lg transition-colors"
                    >
                      GO TO RESULTS
                    </Link>
                  </div>
                </div>
              </>
            )}
            
          </div>
        </div>
      )}

    </div>
  );
}
