
import React, { useState, useRef, useMemo } from 'react';
import { HistoryItem, UserProfile } from '../types';
import { Sparkles, ZoomIn, ZoomOut, Maximize2, User, MessageSquare, Info } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';

interface ForestProps {
  onViewProfile: (userId: string) => void;
  currentUser: UserProfile;
  feed: HistoryItem[];
  isCozyMode?: boolean;
}

const TheForest: React.FC<ForestProps> = ({ onViewProfile, currentUser, feed, isCozyMode }) => {
  const [zoom, setZoom] = useState(1);
  const [selectedLeaf, setSelectedLeaf] = useState<HistoryItem | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('Tudo');
  const canvasRef = useRef<HTMLDivElement>(null);

  // Get current user's latest tags for "Sincronicidade"
  const latestUserTags = useMemo(() => {
    const userItems = feed.filter(item => item.userId === currentUser.id);
    if (userItems.length === 0) return [];
    // Sort by timestamp and get the latest one
    const latest = [...userItems].sort((a, b) => b.timestamp - a.timestamp)[0];
    return latest.data.sincronicidade || [];
  }, [feed, currentUser.id]);

  // Group feed by user to represent "Trees"
  const trees = useMemo(() => {
    let filteredFeed = feed;
    
    if (activeFilter === 'Sincronicidade') {
      filteredFeed = feed.filter(item => {
        if (item.userId === currentUser.id) return true; // Always show own items
        const itemTags = item.data.sincronicidade || [];
        return itemTags.some(tag => latestUserTags.includes(tag));
      });
    } else if (activeFilter !== 'Tudo') {
      filteredFeed = feed.filter(item => 
        (item.geometry?.branchId || '').toLowerCase() === activeFilter.toLowerCase()
      );
    }

    const groups: Record<string, HistoryItem[]> = {};
    filteredFeed.forEach(item => {
      if (!groups[item.userId]) groups[item.userId] = [];
      groups[item.userId].push(item);
    });
    return Object.entries(groups).map(([userId, items]) => ({
      userId,
      userName: items[0].userName,
      userAvatar: items[0].userAvatar,
      items
    }));
  }, [feed, activeFilter, latestUserTags, currentUser.id]);

  const filters = ['Tudo', 'Sincronicidade', 'Trabalho', 'Pessoal', 'Criatividade', 'Conquistas'];

  const filterCounts = useMemo(() => {
    const counts: Record<string, number> = { Tudo: feed.length };
    
    // Calculate Sincronicidade count
    counts.Sincronicidade = feed.filter(item => {
      if (item.userId === currentUser.id) return true;
      const itemTags = item.data.sincronicidade || [];
      return itemTags.some(tag => latestUserTags.includes(tag));
    }).length;

    // Calculate others
    filters.slice(2).forEach(f => {
      counts[f] = feed.filter(item => 
        (item.geometry?.branchId || '').toLowerCase() === f.toLowerCase()
      ).length;
    });

    return counts;
  }, [feed, latestUserTags, currentUser.id]);

  const handleZoom = (delta: number) => {
    setZoom(prev => Math.min(Math.max(prev + delta, 0.5), 3));
  };

  const isMacro = zoom < 0.8;

  return (
    <div className="relative w-full h-[80vh] overflow-hidden rounded-[3rem] border border-white/5 shadow-2xl transition-colors duration-1000">
      {/* HUD Controls */}
      <div className="absolute top-6 left-6 z-30 flex flex-col gap-2">
        <div className="glass p-1 rounded-2xl flex flex-col gap-1">
          <button onClick={() => handleZoom(0.2)} className="p-3 hover:bg-white/10 rounded-xl text-slate-400 hover:text-cyber transition-all"><ZoomIn size={18} /></button>
          <button onClick={() => handleZoom(-0.2)} className="p-3 hover:bg-white/10 rounded-xl text-slate-400 hover:text-cyber transition-all"><ZoomOut size={18} /></button>
          <button onClick={() => setZoom(1)} className="p-3 hover:bg-white/10 rounded-xl text-slate-400 hover:text-cyber transition-all"><Maximize2 size={18} /></button>
        </div>
      </div>

      {/* Filters HUD */}
      <div className="absolute top-6 right-6 z-30 flex gap-2">
        <div className="glass p-1 rounded-2xl flex gap-1">
          {filters.map(f => (
            <button 
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-2 rounded-xl text-[10px] font-display font-bold uppercase tracking-widest transition-all gap-2 flex items-center ${activeFilter === f ? 'bg-cyber text-void shadow-glow' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {f}
              <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-mono font-black ${activeFilter === f ? 'bg-void/20 text-void' : 'bg-white/5 text-slate-600'}`}>
                {filterCounts[f] || 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Infinite Canvas */}
      <motion.div 
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        drag
        dragConstraints={{ left: -2000, right: 2000, top: -2000, bottom: 2000 }}
        style={{ scale: zoom }}
      >
        {/* Grid Background */}
        <div className="absolute inset-[-2000px] bg-[linear-gradient(rgba(217,70,239,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(217,70,239,0.02)_1px,transparent_1px)] bg-[size:100px_100px]" />
        
        {trees.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center space-y-4">
              <Info className="text-slate-800 mx-auto" size={48} />
              <p className="font-mono text-[10px] text-slate-700 uppercase tracking-[0.3em]">Nenhuma semente encontrada nesta frequência.</p>
            </div>
          </div>
        )}

        {/* Trees (User Clusters) */}
        {trees.map((tree, treeIdx) => {
          if (!tree || !tree.userId) return null;
          
          // Calculate tree position based on user ID hash or index
          const treeX = (treeIdx % 5) * 600 - 1200;
          const treeY = Math.floor(treeIdx / 5) * 600 - 1200;

          return (
            <div key={tree.userId} className="absolute" style={{ left: treeX, top: treeY }}>
              {/* Tree Root/Identity */}
              {!isMacro && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 pointer-events-none"
                >
                  <div className={`w-16 h-16 rounded-full border-2 p-1 backdrop-blur-md ${isCozyMode ? 'border-pink-300 bg-white/80' : 'border-cyber/40 bg-void/80'}`}>
                    <img src={tree.userAvatar} alt={tree.userName} className="w-full h-full rounded-full object-cover opacity-60" />
                  </div>
                  <span className={`text-[10px] font-display font-black uppercase tracking-widest ${isCozyMode ? 'text-pink-600' : 'text-cyber/60'}`}>{tree.userName}</span>
                </motion.div>
              )}

              {/* Branches (Lines connecting leaves to center) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                {tree.items.map((item) => {
                  const x = (item.geometry?.x || 0) * 2;
                  const y = (item.geometry?.y || 0) * 2;
                  const color = item.geometry?.color || '#d946ef';
                  return (
                    <motion.line
                      key={`branch-${item.id}`}
                      x1="0" y1="0"
                      x2={x} y2={y}
                      stroke={color}
                      strokeWidth="0.5"
                      strokeOpacity="0.2"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 2, ease: "easeOut" }}
                    />
                  );
                })}
              </svg>

              {/* Leaves (Posts) */}
              {tree.items.map((item) => {
                if (!item || !item.id) return null;
                const isFiltered = activeFilter !== 'Tudo' && item.geometry?.branchId !== activeFilter;
                const x = (item.geometry?.x || 0) * 2;
                const y = (item.geometry?.y || 0) * 2;
                const color = item.geometry?.color || '#d946ef';

                return (
                  <motion.button
                    key={item.id}
                    onClick={() => setSelectedLeaf(item)}
                    className={`absolute w-6 h-4 transition-all duration-500 ${isFiltered ? 'opacity-10 scale-50' : 'opacity-100 scale-100'}`}
                    style={{ 
                      left: x, 
                      top: y, 
                      transform: `translate(-50%, -50%) rotate(${(item.geometry?.x || 0) % 360}deg)`,
                    }}
                    whileHover={{ scale: 1.5, zIndex: 50 }}
                  >
                    {/* Leaf Shape */}
                    <div 
                      className="w-full h-full rounded-[100%_0%_100%_0%] border border-white/20"
                      style={{ 
                        backgroundColor: color,
                        boxShadow: `0 0 15px ${color}80`
                      }}
                    />
                    
                    {!isMacro && !isFiltered && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap pointer-events-none">
                        <span className="text-[8px] font-mono text-white/40 uppercase tracking-tighter bg-black/40 px-1 rounded">
                          {item.geometry?.branchId}
                        </span>
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          );
        })}
      </motion.div>

      {/* Leaf Detail Overlay */}
      <AnimatePresence>
        {selectedLeaf && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="absolute bottom-8 left-8 right-8 z-40 glass border border-white/10 p-8 rounded-[2.5rem] shadow-2xl"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <img src={selectedLeaf.userAvatar} className="w-12 h-12 rounded-2xl border border-white/10" alt="" />
                <div>
                  <h4 className="text-white font-display font-black text-lg uppercase tracking-tight">{selectedLeaf.userName}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-cyber uppercase font-bold">{selectedLeaf.geometry?.branchId}</span>
                    <span className="text-[8px] text-slate-600 font-mono">• {new Date(selectedLeaf.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => onViewProfile(selectedLeaf.userId)}
                  className="p-3 bg-white/5 hover:bg-cyber hover:text-void rounded-xl transition-all text-slate-400"
                >
                  <User size={18} />
                </button>
                <button 
                  onClick={() => setSelectedLeaf(null)}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-slate-400"
                >
                  <Maximize2 size={18} className="rotate-45" />
                </button>
              </div>
            </div>

            <div className="space-y-6 mb-8">
              {selectedLeaf.data.alquimia?.verso && (
                <div className="relative">
                  <div className="absolute -left-4 top-0 bottom-0 w-1 bg-cyber/40 rounded-full" />
                  <p className="text-2xl font-display font-black text-white italic leading-tight">
                    "{selectedLeaf.data.alquimia.verso}"
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedLeaf.data.conteudo?.original && (
                  <div className="space-y-2">
                    <p className="text-[8px] font-mono text-slate-600 uppercase tracking-widest">Relato Original</p>
                    <p className="text-xs font-mono text-slate-400 leading-relaxed italic bg-white/5 p-4 rounded-2xl border border-white/5">
                      {selectedLeaf.data.conteudo.original}
                    </p>
                  </div>
                )}
                {selectedLeaf.data.conteudo?.transmutacao && (
                  <div className="space-y-2">
                    <p className="text-[8px] font-mono text-cyber uppercase tracking-widest">Transmutação Neural</p>
                    <p className="text-xs font-mono text-slate-300 leading-relaxed bg-cyber/5 p-4 rounded-2xl border border-cyber/10">
                      {selectedLeaf.data.conteudo.transmutacao}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-white/5">
              <div className="flex gap-2">
                {selectedLeaf.data.sincronicidade?.map((s, idx) => (
                  <span key={`${s}-${idx}`} className="text-[9px] font-mono text-slate-500 bg-white/5 px-3 py-1 rounded-full border border-white/5 uppercase">#{s}</span>
                ))}
              </div>
              <div className="flex items-center gap-4">
                <button className="text-slate-600 hover:text-cyber transition-colors flex items-center gap-2 text-[10px] font-mono uppercase font-bold">
                  <MessageSquare size={16} /> Comentar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tutorial Overlay */}
      {zoom === 1 && !selectedLeaf && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-slate-600 font-mono text-[9px] uppercase tracking-[0.3em] pointer-events-none animate-pulse">
          Arraste para explorar • Use scroll para zoom
        </div>
      )}
    </div>
  );
};

export default TheForest;
