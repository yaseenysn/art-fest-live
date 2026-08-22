"use client";

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ITeam } from '@/types';
import TeamModal from '@/components/admin/TeamModal';
import { getSocket } from '@/lib/socket-client';
import { SOCKET_EVENTS } from '@/lib/socket';
import { Users, Edit2, Trash2, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

export default function TeamsPage() {
  const queryClient = useQueryClient();

  const { data: teams = [], isLoading: loading } = useQuery<ITeam[]>({
    queryKey: ['teams'],
    queryFn: async () => {
      const res = await fetch('/api/teams');
      if (!res.ok) throw new Error('Failed to fetch teams');
      return res.json();
    },
    staleTime: 30000,
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<ITeam | null>(null);

  const [deleteStatus, setDeleteStatus] = useState<{type: 'error' | 'success', message: string} | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<ITeam | null>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const onTeamChange = () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['rankings'] });
    };

    const socket = getSocket();

    const onEventReset = () => {
      setDeleteStatus(null);
      setIsDeleteModalOpen(false);
      setTeamToDelete(null);
      setIsModalOpen(false);
      
      queryClient.removeQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    };

    socket.on(SOCKET_EVENTS.TEAM_CREATED, onTeamChange);
    socket.on(SOCKET_EVENTS.TEAM_UPDATED, onTeamChange);
    socket.on(SOCKET_EVENTS.TEAM_DELETED, onTeamChange);
    socket.on(SOCKET_EVENTS.EVENT_RESET, onEventReset);

    return () => {
      socket.off(SOCKET_EVENTS.TEAM_CREATED, onTeamChange);
      socket.off(SOCKET_EVENTS.TEAM_UPDATED, onTeamChange);
      socket.off(SOCKET_EVENTS.TEAM_DELETED, onTeamChange);
      socket.off(SOCKET_EVENTS.EVENT_RESET, onEventReset);
    };
  }, [queryClient]);

  const openCreateModal = () => {
    setSelectedTeam(null);
    setIsModalOpen(true);
  };

  const openEditModal = (team: ITeam) => {
    setSelectedTeam(team);
    setIsModalOpen(true);
  };

  const confirmDelete = (team: ITeam) => {
    setTeamToDelete(team);
    setDeleteConfirmationText('');
    setDeleteStatus(null);
    setIsDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!teamToDelete) return;
    setIsDeleting(true);
    setDeleteStatus(null);
    
    try {
      const res = await fetch(`/api/teams/${teamToDelete._id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete team.');
      }
      
      setDeleteStatus({ type: 'success', message: `Team deleted successfully. Removed ${data.deletedResults} results.` });
      setIsDeleteModalOpen(false);
      setTeamToDelete(null);
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    } catch (err: unknown) {
      setDeleteStatus({ type: 'error', message: (err as Error).message });
      setIsDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Teams</h1>
          <p className="text-slate-500 mt-1">Manage competition teams and colors.</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="mt-4 md:mt-0 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold tracking-widest uppercase hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20 flex items-center space-x-2"
        >
          <Users className="w-5 h-5" />
          <span>Add Team</span>
        </button>
      </div>

      {deleteStatus && (
        <div className={clsx(
          "p-4 rounded-xl flex items-start space-x-3 shadow-sm border",
          deleteStatus.type === 'error' ? "bg-red-50 border-red-200 text-red-700" : "bg-emerald-50 border-emerald-200 text-emerald-700"
        )}>
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="font-medium">{deleteStatus.message}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {teams.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Users className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p className="text-lg">No teams found.</p>
            <p className="text-sm mt-1">Create a team to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-6 py-4">Color</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Short Name</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teams.map(team => (
                  <tr key={String(team._id)} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="w-8 h-8 rounded-full shadow-inner border border-slate-200 flex items-center justify-center text-[10px] font-bold text-white mix-blend-difference" style={{ backgroundColor: team.color }}>
                        {team.color}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">{team.name}</td>
                    <td className="px-6 py-4 font-medium text-slate-500 uppercase">{team.shortName || '-'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end space-x-3">
                        <button 
                          onClick={() => openEditModal(team)}
                          className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => confirmDelete(team)}
                          className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <TeamModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['teams'] })}
        team={selectedTeam}
      />

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && teamToDelete && (
        <div className="fixed inset-0 bg-slate-900/80 flex items-center justify-center p-4 z-[200] overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4 text-red-600">
                <AlertCircle className="w-8 h-8" />
                <h2 className="text-2xl font-black uppercase tracking-widest">DELETE TEAM?</h2>
              </div>
              
              <div className="mb-6 p-4 bg-red-50 text-red-800 rounded-xl border border-red-200">
                <p className="font-bold mb-2">Team: {teamToDelete.name}</p>
                <p className="text-sm font-medium">
                  WARNING: This will permanently delete this team and all competition data associated with it, including its results. This action cannot be undone.
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                  Type <span className="font-black text-slate-900 select-all">{teamToDelete.name}</span> to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                  placeholder={teamToDelete.name}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all font-medium text-slate-900"
                  disabled={isDeleting}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={isDeleting}
                  className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 rounded-xl font-bold uppercase tracking-wider hover:bg-slate-200 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={executeDelete}
                  disabled={isDeleting || deleteConfirmationText !== teamToDelete.name}
                  className={clsx(
                    "flex-1 py-3 px-4 rounded-xl font-bold uppercase tracking-wider transition-all shadow-lg",
                    (isDeleting || deleteConfirmationText !== teamToDelete.name)
                      ? "bg-red-300 text-white cursor-not-allowed shadow-none"
                      : "bg-red-600 text-white hover:bg-red-700 shadow-red-600/20 active:scale-[0.98]"
                  )}
                >
                  {isDeleting ? 'Deleting...' : 'DELETE EVERYTHING'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
