'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, UploadCloud, PlayCircle, Trash2, ArrowUp, ArrowDown, X, Image as ImageIcon, Video, MonitorPlay } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';
import { Select } from '@/components/ui/Select';

type MediaItem = {
  _id: string;
  name: string;
  type: 'image' | 'video';
  url: string;
  size: number;
  mimeType?: string;
  duration?: number;
  createdAt: string;
};

type PlaylistItem = {
  id: string; // unique instance id
  media: MediaItem;
  imageDuration: number; // in seconds
  rotation: number; // 0, 90, 180, 270
};

export default function MediaControl() {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
  const [pushing, setPushing] = useState(false);
  const [pushStatus, setPushStatus] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const { data: mediaLibrary = [], isLoading } = useQuery<MediaItem[]>({
    queryKey: ['media'],
    queryFn: async () => {
      const res = await fetch('/api/media');
      if (!res.ok) throw new Error('Failed to fetch media');
      return res.json();
    }
  });

  const { data: tvState, refetch: refetchTvState } = useQuery<any>({
    queryKey: ['tvState'],
    queryFn: async () => {
      const res = await fetch('/api/tv-state');
      if (!res.ok) throw new Error('Failed to fetch TV state');
      return res.json();
    }
  });

  const deleteMedia = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/media?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete media');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
    }
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadError('');

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/media', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Upload failed');
        }
      }
      queryClient.invalidateQueries({ queryKey: ['media'] });
    } catch (err: any) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const addToPlaylist = (media: MediaItem) => {
    setPlaylist(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        media,
        imageDuration: 15, // default 15s for images
        rotation: 0 // default 0 degrees
      }
    ]);
  };

  const removeFromPlaylist = (id: string) => {
    setPlaylist(prev => prev.filter(item => item.id !== id));
  };

  const movePlaylist = (index: number, direction: 'up' | 'down') => {
    const newPlaylist = [...playlist];
    if (direction === 'up' && index > 0) {
      [newPlaylist[index - 1], newPlaylist[index]] = [newPlaylist[index], newPlaylist[index - 1]];
    } else if (direction === 'down' && index < newPlaylist.length - 1) {
      [newPlaylist[index + 1], newPlaylist[index]] = [newPlaylist[index], newPlaylist[index + 1]];
    }
    setPlaylist(newPlaylist);
  };

  const updateImageDuration = (id: string, duration: number) => {
    setPlaylist(prev => prev.map(item => item.id === id ? { ...item, imageDuration: duration } : item));
  };

  const updateRotation = (id: string, rotation: number) => {
    setPlaylist(prev => prev.map(item => item.id === id ? { ...item, rotation } : item));
  };

  const handlePlayOnTV = async () => {
    if (playlist.length === 0) return;
    
    setPushing(true);
    setPushStatus(null);
    
    try {
      const presentationId = crypto.randomUUID();
      const firstItem = playlist[0];
      let expiresAt: string | null = null;

      const isFirstItemVideo = firstItem.media.type === 'video' || firstItem.media.mimeType?.startsWith('video/');
      if (!isFirstItemVideo) {
        expiresAt = new Date(Date.now() + firstItem.imageDuration * 1000).toISOString();
      }

      const res = await fetch('/api/tv-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          presentationId,
          presentationType: 'MEDIA',
          presentationStartedAt: new Date().toISOString(),
          presentationExpiresAt: expiresAt, // null for video
          presentationData: {
            playlist: playlist.map(p => ({
              id: p.id,
              url: p.media.url,
              type: (p.media.type === 'video' || p.media.mimeType?.startsWith('video/')) ? 'video' : 'image',
              mimeType: p.media.mimeType,
              imageDuration: p.imageDuration,
              rotation: p.rotation || 0
            })),
            currentIndex: 0
          }
        })
      });

      if (!res.ok) throw new Error('Failed to play on TV');
      
      setPushStatus({ type: 'success', text: 'Playing on TV!' });
      refetchTvState();
      setTimeout(() => setPushStatus(null), 3000);
    } catch (err: any) {
      setPushStatus({ type: 'error', text: err.message });
    } finally {
      setPushing(false);
    }
  };

  const handleStopOnTV = async () => {
    setPushing(true);
    setPushStatus(null);
    try {
      const res = await fetch('/api/tv-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clearPresentationId: tvState?.presentationId || 'force'
        })
      });

      if (!res.ok) throw new Error('Failed to stop media');
      setPushStatus({ type: 'success', text: 'Media stopped on TV!' });
      refetchTvState();
      setTimeout(() => setPushStatus(null), 3000);
    } catch (err: any) {
      setPushStatus({ type: 'error', text: err.message });
    } finally {
      setPushing(false);
    }
  };

  return (
    <div className="min-h-screen bg-card-secondary p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center space-x-4 mb-8">
          <Link href="/admin/display" className="p-3 bg-card text-text-muted hover:text-primary-indigo rounded-full shadow-sm hover:shadow-md transition-all">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-text-primary tracking-tight">Media Control</h1>
            <p className="text-text-muted font-medium">Manage images and videos to display on the TV</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: Library */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-xl shadow-sm border border-border-card p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center">
                  <ImageIcon className="w-6 h-6 mr-2 text-indigo-500" /> 
                  Media Library
                </h2>
                <div>
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*,video/*" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center space-x-2 bg-primary-purple/10 border border-primary-purple/20 text-indigo-700 hover:bg-primary-purple/20 px-4 py-2 rounded-lg font-bold transition-colors disabled:opacity-50"
                  >
                    <UploadCloud className="w-5 h-5" />
                    <span>{uploading ? 'Uploading...' : 'Upload Media'}</span>
                  </button>
                </div>
              </div>

              {uploadError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-700 p-3 rounded-lg mb-4 text-sm font-bold">
                  {uploadError}
                </div>
              )}

              {isLoading ? (
                <div className="text-text-muted p-8 text-center">Loading media...</div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {mediaLibrary.map(media => (
                    <div key={media._id} className="group relative bg-row rounded-xl overflow-hidden border border-border-card flex flex-col">
                      <div className="aspect-video bg-black relative flex items-center justify-center overflow-hidden">
                        {media.type === 'video' || media.mimeType?.startsWith('video/') ? (
                          <video src={media.url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                        ) : (
                          <img src={media.url} alt={media.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                        )}
                        <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-xs font-bold uppercase backdrop-blur-sm">
                          {media.type}
                        </div>
                      </div>
                      <div className="p-3 flex-1 flex flex-col justify-between bg-card">
                        <p className="text-xs font-bold text-text-primary truncate mb-2" title={media.name}>{media.name}</p>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => addToPlaylist(media)}
                            className="flex-1 bg-primary-indigo text-white text-white py-1.5 rounded text-xs font-bold hover:bg-primary-purple text-white transition-colors"
                          >
                            Add to Playlist
                          </button>
                          <button 
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this media?')) {
                                deleteMedia.mutate(media._id);
                              }
                            }}
                            className="bg-rose-100 text-rose-600 px-2 rounded hover:bg-rose-200 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {mediaLibrary.length === 0 && (
                    <div className="col-span-full py-12 text-center text-text-muted border-2 border-dashed border-border-card rounded-xl">
                      No media uploaded yet.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Playlist */}
          <div className="space-y-6">
            <div className="bg-card-secondary text-white rounded-xl shadow-xl border border-border-card p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <PlayCircle className="w-6 h-6 mr-2 text-emerald-400" /> 
                Playlist
              </h2>

              <div className="space-y-3 mb-6 min-h-[300px]">
                {playlist.length === 0 ? (
                  <div className="text-center text-text-muted py-12 border-2 border-dashed border-border-card rounded-xl">
                    Playlist is empty.
                  </div>
                ) : (
                  playlist.map((item, index) => (
                    <div key={item.id} className="bg-row border border-border-card rounded-lg p-3 flex items-center space-x-3">
                      <div className="w-12 h-12 bg-black rounded overflow-hidden flex-shrink-0">
                        {item.media.type === 'video' || item.media.mimeType?.startsWith('video/') ? (
                          <div className="w-full h-full flex items-center justify-center bg-slate-700" style={{ transform: `rotate(${item.rotation || 0}deg)` }}>
                            <Video className="w-6 h-6 text-text-muted" />
                          </div>
                        ) : (
                          <img src={item.media.url} className="w-full h-full object-cover" style={{ transform: `rotate(${item.rotation || 0}deg)` }} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-200 truncate">{item.media.name}</p>
                        
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          {item.media.type === 'video' || item.media.mimeType?.startsWith('video/') ? (
                            <p className="text-xs text-text-muted uppercase font-semibold">Video (Native duration)</p>
                          ) : (
                            <div className="flex items-center space-x-1">
                              <span className="text-xs text-text-muted">Duration:</span>
                              <Select 
                                value={item.imageDuration}
                                onChange={(e: any) => updateImageDuration(item.id, parseInt(e.target.value))}
                                className="!min-h-0 !py-1 !px-2 text-xs bg-slate-800"
                                wrapperClassName="w-24"
                              >
                                {[5, 10, 15, 20, 30, 45, 60, 120, 180, 300].map(s => (
                                  <option key={s} value={s}>{s >= 60 ? `${s / 60} MIN` : `${s}s`}</option>
                                ))}
                              </Select>
                            </div>
                          )}

                          <div className="flex items-center space-x-1 border-l border-slate-600 pl-2">
                            <span className="text-xs text-text-muted">Rotate:</span>
                            <Select 
                              value={item.rotation || 0}
                              onChange={(e: any) => updateRotation(item.id, parseInt(e.target.value))}
                              className="!min-h-0 !py-1 !px-2 text-xs bg-slate-800"
                              wrapperClassName="w-24"
                            >
                              <option value={0}>0&deg;</option>
                              <option value={90}>90&deg;</option>
                              <option value={180}>180&deg;</option>
                              <option value={270}>270&deg;</option>
                            </Select>
                          </div>
                        </div>

                      </div>
                      <div className="flex flex-col space-y-1">
                        <button onClick={() => movePlaylist(index, 'up')} disabled={index === 0} className="text-text-muted hover:text-white disabled:opacity-30">
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button onClick={() => movePlaylist(index, 'down')} disabled={index === playlist.length - 1} className="text-text-muted hover:text-white disabled:opacity-30">
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      </div>
                      <button onClick={() => removeFromPlaylist(item.id)} className="text-rose-400 hover:text-rose-300 p-1">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-3">
                <button 
                  onClick={handlePlayOnTV}
                  disabled={playlist.length === 0 || pushing}
                  className="w-full flex items-center justify-center space-x-2 bg-emerald-500/10 border border-emerald-500/200 hover:bg-emerald-400 text-white rounded-lg py-4 font-black text-lg transition-colors disabled:opacity-50"
                >
                  <MonitorPlay className="w-6 h-6" />
                  <span>{pushing ? 'SENDING...' : 'PLAY PLAYLIST ON TV'}</span>
                </button>
                <button 
                  onClick={handleStopOnTV}
                  disabled={pushing || !tvState?.presentationType || tvState?.presentationType !== 'MEDIA'}
                  className="w-full flex items-center justify-center space-x-2 bg-rose-500 hover:bg-rose-400 text-white rounded-lg py-4 font-black text-lg transition-colors disabled:opacity-50"
                >
                  <X className="w-6 h-6" />
                  <span>STOP MEDIA ON TV</span>
                </button>
                <button 
                  onClick={() => setPlaylist([])}
                  disabled={playlist.length === 0}
                  className="w-full py-2 text-sm font-bold text-text-muted hover:text-white transition-colors disabled:opacity-50"
                >
                  CLEAR PLAYLIST
                </button>
              </div>

              {pushStatus && (
                <div className={clsx(
                  "mt-4 p-3 rounded-lg text-sm font-bold text-center",
                  pushStatus.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/200/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                )}>
                  {pushStatus.text}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
