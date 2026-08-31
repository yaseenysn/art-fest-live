import { useState, useEffect } from 'react';
import { ITeam } from '@/types';
import clsx from 'clsx';
import { Users, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface TeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  team?: ITeam | null;
}

export default function TeamModal({ isOpen, onClose, onSuccess, team }: TeamModalProps) {
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [color, setColor] = useState('#000000');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (team) {
          setName(team.name || '');
          setShortName(team.shortName || '');
          setColor(team.color || '#000000');
        } else {
          setName('');
          setShortName('');
          setColor('#000000');
        }
        setError('');
      }, 0);
    }
  }, [isOpen, team]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!name.trim() || name.trim().length < 2) {
      setError('Team name must be at least 2 characters long.');
      return;
    }

    setLoading(true);
    setError('');

    const payload = {
      name: name.trim(),
      shortName: shortName.trim(),
      color
    };

    try {
      const url = team ? `/api/teams/${team._id}` : '/api/teams';
      const method = team ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Failed to ${team ? 'update' : 'create'} team`);
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-app/90 backdrop-blur-sm flex items-center justify-center p-4 z-[200] overflow-y-auto">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-border-card">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-card flex items-center justify-between bg-card-secondary">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-primary-purple/10 flex items-center justify-center text-primary-purple">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-text-primary tracking-tight">
              {team ? 'Edit Team' : 'Create Team'}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="text-text-muted hover:text-white transition-colors p-2 rounded-lg hover:bg-row"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-500/10 text-red-400 text-sm font-semibold p-3 rounded-xl border border-red-500/20">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-text-muted uppercase tracking-wide mb-1.5 ml-1">
              Team Name <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Orange"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-text-muted uppercase tracking-wide mb-1.5 ml-1">
              Short Name
            </label>
            <Input
              type="text"
              value={shortName}
              onChange={(e) => setShortName(e.target.value)}
              placeholder="Optional (e.g. ORG)"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-text-muted uppercase tracking-wide mb-1.5 ml-1">
              Team Color <span className="text-red-500">*</span>
            </label>
            <div className="flex space-x-3 items-center">
              <div className="relative">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                  disabled={loading}
                  required
                />
                <div 
                  className="w-12 h-12 rounded-xl shadow-inner border border-border-card" 
                  style={{ backgroundColor: color }}
                />
              </div>
              <Input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#000000"
                pattern="^#[0-9A-Fa-f]{6}$"
                className="uppercase uppercase"
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="pt-4 flex space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
              className="flex-1 uppercase tracking-wider"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="flex-1 uppercase tracking-wider"
            >
              {loading ? 'Saving...' : team ? 'Save Changes' : 'Create Team'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
