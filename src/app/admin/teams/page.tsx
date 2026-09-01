"use client";

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ITeam } from '@/types';
import TeamModal from '@/components/admin/TeamModal';
import { getSocket } from '@/lib/socket-client';
import { SOCKET_EVENTS } from '@/lib/socket';
import { Users, Edit2, Trash2, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';

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
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter bg-gradient-to-r from-purple-400 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">TEAMS</h1>
          <p className="text-text-muted mt-1 font-medium">Manage competition teams and colors.</p>
        </div>
        <Button onClick={openCreateModal} className="mt-4 md:mt-0 uppercase tracking-widest">
          <Users className="w-5 h-5 mr-2" />
          Add Team
        </Button>
      </div>

      {deleteStatus && (
        <div className={clsx(
          "p-4 rounded-xl flex items-start space-x-3 shadow-sm border",
          deleteStatus.type === 'error' ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
        )}>
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="font-medium">{deleteStatus.message}</span>
        </div>
      )}

      <Card className="rounded-2xl border border-border-card bg-card shadow-sm overflow-hidden">
        {teams.length === 0 ? (
          <CardContent className="p-16 text-center text-text-muted">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-bold text-text-primary">No teams found.</p>
            <p className="text-sm mt-1">Create a team to get started.</p>
          </CardContent>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-card-secondary border-b border-border-card text-text-muted text-[11px] uppercase tracking-widest font-bold">
                <tr>
                  <th className="px-6 py-4">Color</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Short Name</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-card bg-card">
                {teams.map(team => (
                  <tr key={String(team._id)} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full shadow-inner border border-white/10" style={{ backgroundColor: team.color }} />
                        <span className="text-sm font-medium text-text-muted font-mono">{team.color}</span>
                      </div>
                    </td>
                    <td className={`px-6 py-4 font-bold text-text-primary text-base ${/[\u0600-\u06FF]/.test(team.name) ? 'font-ge-ss-two' : ''}`}>
                      {team.name}
                    </td>
                    <td className="px-6 py-4">
                      {team.shortName ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-white/5 text-text-muted uppercase border border-white/10">
                          {team.shortName}
                        </span>
                      ) : (
                        <span className="text-text-muted/30">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end space-x-2 opacity-100 md:opacity-50 md:group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openEditModal(team)}
                          className="!p-2 text-text-muted hover:text-white hover:bg-white/10 transition-colors rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="danger" 
                          size="sm"
                          onClick={() => confirmDelete(team)}
                          className="!p-2 hover:bg-red-600 transition-colors rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <TeamModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['teams'] })}
        team={selectedTeam}
      />

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && teamToDelete && (
        <div className="fixed inset-0 bg-app/90 backdrop-blur-sm flex items-center justify-center p-4 z-[200] overflow-y-auto">
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-border-card">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4 text-red-400">
                <AlertCircle className="w-8 h-8" />
                <h2 className="text-2xl font-black uppercase tracking-widest text-text-primary">DELETE TEAM?</h2>
              </div>
              
              <div className="mb-6 p-4 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20">
                <p className="font-bold mb-2">Team: {teamToDelete.name}</p>
                <p className="text-sm font-medium">
                  WARNING: This will permanently delete this team and all competition data associated with it, including its results. This action cannot be undone.
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-text-muted mb-2 uppercase tracking-wide">
                  Type <span className="font-black text-text-primary select-all">{teamToDelete.name}</span> to confirm
                </label>
                <Input
                  type="text"
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                  placeholder={teamToDelete.name}
                  disabled={isDeleting}
                />
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="secondary"
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={isDeleting}
                  className="flex-1 uppercase tracking-wider"
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={executeDelete}
                  disabled={isDeleting || deleteConfirmationText !== teamToDelete.name}
                  className="flex-1 uppercase tracking-wider"
                >
                  {isDeleting ? 'Deleting...' : 'DELETE EVERYTHING'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
