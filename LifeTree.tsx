import React, { useState, useRef, useEffect } from 'react';
import { ProjectItem } from '../types';
import { 
  Play, Pause, SkipBack, SkipForward, Maximize2, Minimize2, 
  X, ChevronLeft, ChevronRight, ListMusic, Monitor, Gamepad2, Cpu, Volume2 
} from 'lucide-react';

// --- MUSIC PLAYER (Updated with Real Audio Logic) ---
interface MusicPlayerProps {
  item: ProjectItem;
  onClose: () => void;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({ item, onClose }) => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const tracks = item.tracks || [];
  const currentTrack = tracks[currentTrackIndex] || { title: 'No Audio Data', duration: '0:00', url: '' };

  // Handle Play/Pause
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Audio play failed:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  // Handle Track Change
  useEffect(() => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    if (audioRef.current) {
        audioRef.current.load();
        // Auto-play next track if user was already playing? 
        // Let's keep it manual for safety unless requested.
    }
  }, [currentTrackIndex]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const curr = audioRef.current.currentTime;
      const dur = audioRef.current.duration;
      setCurrentTime(curr);
      setDuration(dur || 0);
      setProgress((curr / dur) * 100);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    // Optional: Auto-advance
    if (currentTrackIndex < tracks.length - 1) {
        setCurrentTrackIndex(prev => prev + 1);
        setIsPlaying(true);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current) {
        const bar = e.currentTarget;
        const rect = bar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const seekTime = (clickX / width) * audioRef.current.duration;
        audioRef.current.currentTime = seekTime;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4">
      <div className="w-full max-w-4xl bg-gray-900 border border-pink-500/30 rounded-lg overflow-hidden flex flex-col md:flex-row shadow-[0_0_50px_rgba(236,72,153,0.15)]">
        
        {/* Hidden Audio Element */}
        <audio 
            ref={audioRef} 
            src={currentTrack.url} 
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        />

        {/* Left: Album Art / Video */}
        <div className="w-full md:w-1/2 bg-black relative aspect-square md:aspect-auto border-b md:border-b-0 md:border-r border-gray-800">
          {showVideo && item.videoUrl ? (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-pink-500 font-mono bg-gray-900">
                <p className="mb-2">[VIDEO SIGNAL LINKED]</p>
                <a href={item.videoUrl} target="_blank" rel="noreferrer" className="text-xs border border-pink-500 px-3 py-1 hover:bg-pink-500 hover:text-white transition-colors">
                    OPEN EXTERNAL STREAM
                </a>
             </div>
          ) : (
            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
          )}
          
          <button 
            onClick={onClose}
            className="absolute top-4 left-4 p-2 bg-black/50 hover:bg-pink-600 text-white rounded-full transition-colors backdrop-blur-sm"
          >
            <X size={20} />
          </button>
        </div>

        {/* Right: Controls & Playlist */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col font-mono justify-between">
           <div>
             <h2 className="text-2xl font-bold text-white mb-1 leading-tight">{item.title}</h2>
             <p className="text-pink-400 text-xs uppercase tracking-widest mb-6">{item.description}</p>

             {/* Now Playing Card */}
             <div className="bg-black/40 p-5 rounded border border-pink-900/50 mb-6 relative overflow-hidden group">
                {/* Visualizer BG effect */}
                <div className={`absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-pink-900/20 to-transparent transition-opacity ${isPlaying ? 'opacity-100' : 'opacity-0'}`} />
                
                <div className="flex justify-between items-end mb-3 relative z-10">
                  <span className="text-[10px] text-gray-500 font-bold">AUDIO OUTPUT CHANNEL 1</span>
                  {item.videoUrl && (
                    <button onClick={() => setShowVideo(!showVideo)} className="text-[10px] text-pink-500 hover:underline flex items-center gap-1">
                      <Monitor size={10} /> {showVideo ? 'SHOW ART' : 'VIDEO'}
                    </button>
                  )}
                </div>
                
                <div className="text-lg text-pink-100 font-bold truncate relative z-10 mb-4">
                    {currentTrack.title || "Unknown Track"}
                </div>
                
                {/* Real Progress Bar */}
                <div 
                    className="w-full h-2 bg-gray-800 rounded-full cursor-pointer relative overflow-hidden group-hover:h-3 transition-all"
                    onClick={handleSeek}
                >
                   <div 
                     className="absolute left-0 top-0 h-full bg-pink-500 transition-all duration-100 ease-linear" 
                     style={{ width: `${progress}%` }}
                   />
                </div>
                
                <div className="flex justify-between text-[10px] text-gray-400 mt-2 font-mono">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
             </div>

             {/* Controls */}
             <div className="flex justify-center items-center gap-6 mb-8">
               <button 
                 onClick={() => setCurrentTrackIndex(prev => Math.max(0, prev - 1))}
                 className="text-gray-400 hover:text-white transition-colors p-2"
                 disabled={currentTrackIndex === 0}
               >
                 <SkipBack size={24} />
               </button>
               
               <button 
                 onClick={() => setIsPlaying(!isPlaying)}
                 className="w-14 h-14 rounded-full bg-pink-600 hover:bg-pink-500 flex items-center justify-center text-white shadow-[0_0_20px_rgba(236,72,153,0.4)] transition-all hover:scale-105 active:scale-95"
               >
                 {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
               </button>
               
               <button 
                 onClick={() => setCurrentTrackIndex(prev => Math.min(tracks.length - 1, prev + 1))}
                 className="text-gray-400 hover:text-white transition-colors p-2"
                 disabled={currentTrackIndex === tracks.length - 1}
               >
                 <SkipForward size={24} />
               </button>
             </div>
           </div>

           {/* Playlist */}
           <div className="flex-1 overflow-y-auto max-h-[150px] pr-2 custom-scrollbar">
             <div className="flex items-center gap-2 text-[10px] text-gray-500 mb-3 sticky top-0 bg-gray-900 py-1 border-b border-gray-800">
               <ListMusic size={12} /> TRACKLIST SEQUENCE
             </div>
             {tracks.length > 0 ? tracks.map((track, idx) => (
               <div 
                 key={idx} 
                 onClick={() => setCurrentTrackIndex(idx)}
                 className={`p-3 mb-1 rounded cursor-pointer flex justify-between items-center text-xs transition-all border border-transparent ${
                   idx === currentTrackIndex 
                     ? 'bg-pink-900/20 border-pink-900/50 text-pink-400 shadow-sm' 
                     : 'hover:bg-gray-800 text-gray-400'
                 }`}
               >
                 <div className="flex items-center gap-3">
                    <span className="w-4 text-center opacity-50">{idx + 1}</span>
                    <span className="font-bold">{track.title}</span>
                 </div>
                 <span className="opacity-50 font-mono">{track.duration}</span>
               </div>
             )) : (
                 <div className="text-gray-600 text-xs italic p-2 text-center">No audio tracks uploaded.</div>
             )}
           </div>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; border-radius: 2px; }
      `}</style>
    </div>
  );
};

// --- COMIC READER (Kept largely the same) ---
interface ComicReaderProps {
  item: ProjectItem;
  onClose: () => void;
}

export const ComicReader: React.FC<ComicReaderProps> = ({ item, onClose }) => {
  const [pageIndex, setPageIndex] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  // Mock pages if none exist
  const pages = item.pages || [item.imageUrl];

  return (
    <div className={`fixed inset-0 z-50 bg-black flex flex-col ${isFullScreen ? 'p-0' : 'p-4 md:p-8'}`}>
      
      {/* Toolbar */}
      <div className="h-12 flex items-center justify-between px-4 bg-gray-900 border-b border-yellow-700/30 text-yellow-500 font-mono text-sm">
        <div className="flex items-center gap-4">
           <button onClick={onClose} className="hover:text-white"><X size={18} /></button>
           <span className="font-bold hidden md:inline">{item.title}</span>
        </div>
        <div className="flex items-center gap-4">
           <span>PAGE {pageIndex + 1} / {pages.length}</span>
           <button onClick={() => setIsFullScreen(!isFullScreen)} className="hover:text-white">
             {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
           </button>
        </div>
      </div>

      {/* Viewer */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-[#111]">
         <div className="h-full w-full max-w-3xl flex items-center justify-center p-4">
            <img 
              src={pages[pageIndex]} 
              alt={`Page ${pageIndex + 1}`} 
              className="max-h-full max-w-full object-contain shadow-2xl"
            />
         </div>

         {/* Navigation Areas (Click sides to flip) */}
         <button 
           onClick={() => setPageIndex(p => Math.max(0, p - 1))}
           className="absolute left-0 top-0 bottom-0 w-1/4 hover:bg-white/5 flex items-center justify-start pl-4 text-white/20 hover:text-white transition-all outline-none"
         >
           <ChevronLeft size={40} />
         </button>
         <button 
           onClick={() => setPageIndex(p => Math.min(pages.length - 1, p + 1))}
           className="absolute right-0 top-0 bottom-0 w-1/4 hover:bg-white/5 flex items-center justify-end pr-4 text-white/20 hover:text-white transition-all outline-none"
         >
           <ChevronRight size={40} />
         </button>
      </div>
    </div>
  );
};

// --- APP / GAME MODAL (Kept same) ---
interface AppModalProps {
  item: ProjectItem;
  onClose: () => void;
  type: 'GAME' | 'APP';
}

export const AppModal: React.FC<AppModalProps> = ({ item, onClose, type }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const colorClass = type === 'GAME' ? 'text-purple-500 border-purple-500/30' : 'text-green-500 border-green-500/30';
  const btnClass = type === 'GAME' ? 'bg-purple-600 hover:bg-purple-500' : 'bg-green-600 hover:bg-green-500';

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm ${isFullScreen ? 'p-0' : 'p-4'}`}>
      <div className={`bg-gray-900 border ${colorClass} flex flex-col shadow-2xl transition-all duration-300 ${isFullScreen ? 'w-full h-full' : 'w-full max-w-5xl h-[80vh] rounded-lg'}`}>
        
        {/* Window Bar */}
        <div className={`h-10 border-b ${colorClass} bg-black/50 flex items-center justify-between px-3`}>
          <div className={`flex items-center gap-2 font-mono text-sm ${type === 'GAME' ? 'text-purple-400' : 'text-green-400'}`}>
            <Monitor size={14} />
            {item.title} // EXEC
          </div>
          <div className="flex gap-2">
            <button onClick={() => setIsFullScreen(!isFullScreen)} className="text-gray-500 hover:text-white">
              {isFullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            <button onClick={onClose} className="text-gray-500 hover:text-red-500">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Main Display (Iframe or Placeholder) */}
          <div className="flex-1 bg-black relative border-r border-gray-800">
             {item.link ? (
               <iframe src={item.link} className="w-full h-full border-0" title={item.title} />
             ) : (
               <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600 font-mono p-10 text-center">
                 <div className="mb-4 text-6xl opacity-20">{type === 'GAME' ? <Gamepad2 size={80} /> : <Cpu size={80} />}</div>
                 <p>NO LINKED EXECUTABLE FOUND.</p>
                 <p className="text-xs mt-2">Upload content via Admin Panel to verify.</p>
               </div>
             )}
          </div>

          {/* Info Sidebar */}
          {!isFullScreen && (
            <div className="w-full md:w-80 bg-gray-900 p-6 overflow-y-auto border-l border-gray-800">
               <h3 className={`text-xl font-bold font-display text-white mb-2`}>{item.title}</h3>
               <div className="flex flex-wrap gap-2 mb-4">
                  {item.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 border border-gray-700 rounded text-[10px] text-gray-400">{tag}</span>
                  ))}
               </div>
               
               <div className="font-mono text-sm text-gray-300 space-y-4">
                 <p>{item.description}</p>
                 {item.fullDescription && (
                   <div className="p-3 bg-black/40 border border-gray-800 rounded">
                     <p className="text-xs text-gray-400">{item.fullDescription}</p>
                   </div>
                 )}
               </div>

               <button className={`w-full mt-6 py-2 ${btnClass} text-white font-mono font-bold rounded uppercase tracking-widest text-xs transition-colors shadow-lg`}>
                  {type === 'GAME' ? 'Start Game' : 'Launch App'}
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};