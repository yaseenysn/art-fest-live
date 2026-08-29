import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { useQueryClient } from '@tanstack/react-query';

type PlaylistItem = {
  id: string;
  name?: string;
  url: string;
  type: 'image' | 'video';
  mimeType?: string;
  imageDuration: number;
};

function isVideoMedia(media: PlaylistItem | undefined | null) {
  if (!media) return false;
  return (
    media.type === 'video' ||
    media.mimeType?.startsWith('video/')
  );
}

function isImageMedia(media: PlaylistItem | undefined | null) {
  if (!media) return false;
  return (
    media.type === 'image' ||
    media.mimeType?.startsWith('image/')
  );
}

export default function MediaPlayer({
  presentationId,
  playlist,
}: {
  presentationId: string;
  playlist: PlaylistItem[];
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const queryClient = useQueryClient();

  // Handle empty or invalid playlist
  useEffect(() => {
    if (!playlist || playlist.length === 0) {
      console.log('[TV MEDIA] Empty playlist detected. Returning to leaderboard.');
      clearPresentation();
    }
  }, [playlist, presentationId]);

  // Restart when presentationId changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [presentationId]);

  const clearPresentation = async () => {
    try {
      queryClient.setQueryData(['tvState'], (old: any) => {
        if (!old) return old;
        if (old.presentationId !== presentationId) return old; // Race condition protection
        return {
          ...old,
          presentationId: null,
          presentationType: null,
          presentationStartedAt: null,
          presentationExpiresAt: null,
          presentationDuration: null,
          presentationData: null,
        };
      });

      await fetch('/api/tv-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clearPresentationId: presentationId }),
      });
    } catch (err) {
      console.error('[TV MEDIA] Failed to clear media presentation:', err);
    }
  };

  const handleNext = () => {
    if (playlist && currentIndex < playlist.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      clearPresentation();
    }
  };

  const currentMedia = playlist?.[currentIndex];

  useEffect(() => {
    if (!currentMedia) return;

    if (!currentMedia.url) {
      console.error('[TV MEDIA] Missing URL. Skipping.');
      handleNext();
      return;
    }

    if (!isVideoMedia(currentMedia)) {
      const timer = setTimeout(() => {
        handleNext();
      }, (currentMedia.imageDuration || 15) * 1000);

      return () => clearTimeout(timer);
    }
  }, [currentIndex, currentMedia]);

  const handleMediaError = () => {
    console.error('[TV MEDIA] Error loading media:', currentMedia?.url);
    handleNext();
  };

  if (!currentMedia || !currentMedia.url) {
    return <div className="absolute inset-0 bg-black z-[200]" />;
  }

  // Debug log (temporary as requested)
  console.log('[TV MEDIA]', {
    presentationType: 'MEDIA',
    currentIndex,
    currentMedia,
    type: currentMedia.type,
    mimeType: currentMedia.mimeType,
    url: currentMedia.url
  });

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isVideoMedia(currentMedia) && videoRef.current) {
      const video = videoRef.current;
      
      console.log('[TV VIDEO AUDIO]', {
        muted: video.muted,
        volume: video.volume,
        paused: video.paused,
        readyState: video.readyState,
        src: video.src,
      });

      const playPromise = video.play();
      
      if (playPromise !== undefined) {
        playPromise.then(() => {
          console.log('[TV VIDEO AUDIO] Autoplay with audio started successfully.');
        }).catch(error => {
          console.error('[TV VIDEO AUDIO] Autoplay rejected by browser. Waiting for user interaction...', error);
          
          // Retry playing once the user interacts with the document
          const retryPlay = () => {
            console.log('[TV VIDEO AUDIO] User interacted, retrying playback...');
            video.play().catch(e => console.error('[TV VIDEO AUDIO] Retry failed:', e));
            window.removeEventListener('click', retryPlay);
            window.removeEventListener('touchstart', retryPlay);
            window.removeEventListener('keydown', retryPlay);
          };
          
          window.addEventListener('click', retryPlay);
          window.addEventListener('touchstart', retryPlay);
          window.addEventListener('keydown', retryPlay);
        });
      }
    }
  }, [currentIndex, currentMedia]);

  const rotation = (currentMedia as any)?.rotation || 0;
  const isVertical = rotation === 90 || rotation === 270;

  return (
    <motion.div
      key={`media-${presentationId}-${currentIndex}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="absolute inset-0 w-[100vw] h-[100vh] bg-black flex items-center justify-center overflow-hidden z-[200]"
    >
      {isVideoMedia(currentMedia) ? (
        <video
          ref={videoRef}
          key={currentMedia.id || currentMedia.url}
          src={currentMedia.url}
          autoPlay
          playsInline
          preload="auto"
          controls={false}
          className="object-contain bg-black"
          style={{
            transform: `rotate(${rotation}deg)`,
            width: isVertical ? '100vh' : '100vw',
            height: isVertical ? '100vw' : '100vh',
            maxWidth: 'none',
          }}
          onEnded={handleNext}
          onError={handleMediaError}
        />
      ) : (
        <img
          key={currentMedia.id || currentMedia.url}
          src={currentMedia.url}
          alt={currentMedia.name || "Media Presentation"}
          className="object-contain bg-black"
          style={{
            transform: `rotate(${rotation}deg)`,
            width: isVertical ? '100vh' : '100vw',
            height: isVertical ? '100vw' : '100vh',
            maxWidth: 'none',
          }}
          onError={handleMediaError}
        />
      )}
    </motion.div>
  );
}
