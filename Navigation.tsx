import React, { useState, useMemo } from 'react';
import { HistoryItem, UserProfile } from '../types';
import { Lock, Trophy, Sparkles, Map as MapIcon, Award, X, History, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  perk?: string;
  condition: (xp: number, history: HistoryItem[]) => boolean;
}

interface LifeTreeProps {
  history: HistoryItem[];
  userProfile?: UserProfile;
  isCozyMode?: boolean;
  isGuelasUnlocked?: boolean;
  onGuelasClick?: () => void;
}

const ACHIEVEMENTS_DB: Achievement[] = [
  {
    id: 'first_breath',
    name: 'Primeiro Suspiro',
    description: 'Realize sua primeira transmutação.',
    icon: <Sparkles size={20} />,
    perk: 'Acesso à Rede Global',
    condition: (xp, history) => history.length >= 1
  },
  {
    id: 'novice_alchemist',
    name: 'Alquimista Iniciante',
    description: 'Acumule 500 XP total.',
    icon: <Award size={20} />,
    condition: (xp, history) => xp >= 500
  },
  {
    id: 'veteran_soul',
    name: 'Alma Veterana',
    description: 'Complete 20 transmutações.',
    icon: <History size={20} />,
    condition: (xp, history) => history.length >= 20
  },
  {
    id: 'grand_architect',
    name: 'Grande Arquiteto',
    description: 'Acumule 5000 XP.',
    icon: <Trophy size={20} />,
    perk: 'Status Lendário',
    condition: (xp, history) => xp >= 5000
  }
];

const LifeTree: React.FC<LifeTreeProps> = ({ 
  history, 
  userProfile, 
  isCozyMode,
  isGuelasUnlocked,
  onGuelasClick
}) => {
  const [selectedLeaf, setSelectedLeaf] = useState<HistoryItem | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'achievements'>('map');
  const [activeFilter, setActiveFilter] = useState<string>('Tudo');
  const [isDecrypted, setIsDecrypted] = useState(false);

  const totalXP = (history || []).reduce((acc, item) => acc + (item.data.game_data?.xp || 0), 0);
  const level = Math.floor(totalXP / 500) + 1;
  const userAlias = userProfile?.displayName || 'UNKNOWN_ENTITY';

  const filters = ['Tudo', 'Trabalho', 'Pessoal', 'Criatividade', 'Conquistas'];

  const filterCounts = useMemo(() => {
    const counts: Record<string, number> = { Tudo: (history || []).length };
    filters.slice(1).forEach(f => {
      counts[f] = (history || []).filter(item => 
        (item.geometry?.branchId || '').toLowerCase() === f.toLowerCase()
      ).length;
    });
    return counts;
  }, [history]);

  const getArchetype = () => {
    if (history.length === 0) return "Semente Adormecida";
    const lastItem = history[0];
    return lastItem.data.game_data?.categoria || "Alquimista";
  };

  const archetype = getArchetype();

  // Calculate branch statistics for "Roots" metaphor
  const branchStats = useMemo(() => {
    const stats: Record<string, number> = {};
    history.forEach(item => {
      const branch = item.geometry?.branchId || 'Geral';
      stats[branch] = (stats[branch] || 0) + 1;
    });
    return Object.entries(stats).sort((a, b) => b[1] - a[1]);
  }, [history]);

  const primaryRoot = branchStats[0]?.[0] || 'Nenhuma';

  return (
    <div className={`w-full max-w-3xl mx-auto animate-in fade-in duration-700 font-sans ${isCozyMode ? 'text-slate-800' : 'text-slate-300'}`}>
      
      {/* Profile Header */}
      <div className="flex flex-col gap-8 mb-12">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
                <div className="relative">
                  <img src={userProfile?.avatarUrl} className={`w-20 h-20 rounded-3xl border-2 object-cover ${isCozyMode ? 'border-pink-400 shadow-lg' : 'border-cyber shadow-glow'}`} alt="" />
                  <div className={`absolute -bottom-2 -right-2 font-display font-black px-3 py-1 rounded-xl text-xs ${isCozyMode ? 'bg-pink-500 text-white shadow-lg' : 'bg-cyber text-void shadow-glow'}`}>
                    LVL {level}
                  </div>
                </div>
                <div>
                    <h2 className={`text-3xl font-display font-black uppercase tracking-tighter ${isCozyMode ? 'text-pink-700' : 'text-white'}`}>{userAlias}</h2>
                    <div className="flex items-center gap-3 mt-2">
                        <span className={`font-mono text-[10px] px-3 py-1 border rounded-full uppercase font-bold tracking-widest ${isCozyMode ? 'bg-pink-100 border-pink-200 text-pink-600' : 'bg-cyber/10 border-cyber/20 text-cyber'}`}>
                            {archetype}
                        </span>
                        <span className="text-slate-500 font-mono text-[10px] uppercase tracking-widest font-bold">{totalXP} XP TOTAL</span>
                    </div>
                </div>
            </div>
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">Raiz Dominante</span>
              <span className={`text-sm font-display font-bold uppercase tracking-tight ${isCozyMode ? 'text-pink-600' : 'text-white'}`}>{primaryRoot}</span>
            </div>
        </div>
        
        <div className={`flex p-1 rounded-2xl border w-full transition-all duration-1000 ${isCozyMode ? 'bg-pink-100 border-pink-200' : 'bg-white/5 border-white/10'}`}>
            <button 
                onClick={() => setViewMode('map')}
                className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl text-[11px] font-display font-bold uppercase tracking-widest transition-all ${viewMode === 'map' ? (isCozyMode ? 'bg-pink-500 text-white shadow-lg' : 'bg-cyber text-void shadow-glow') : 'text-slate-500 hover:text-slate-300'}`}
            >
                <MapIcon size={16} /> Neural Map
            </button>
            <button 
                onClick={() => setViewMode('achievements')}
                className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl text-[11px] font-display font-bold uppercase tracking-widest transition-all ${viewMode === 'achievements' ? (isCozyMode ? 'bg-pink-500 text-white shadow-lg' : 'bg-cyber text-void shadow-glow') : 'text-slate-500 hover:text-slate-300'}`}
            >
                <Award size={16} /> Achievements
            </button>
        </div>
      </div>

      {viewMode === 'map' ? (
          <div className="relative w-full aspect-square bg-black/40 border border-white/5 shadow-2xl overflow-hidden mx-auto rounded-[3rem] glass">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(217,70,239,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(217,70,239,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
            
            {/* Filter HUD for Map */}
            <div className="absolute top-6 left-6 right-6 z-20 flex justify-center">
              <div className="glass p-1 rounded-2xl flex gap-1 overflow-x-auto no-scrollbar">
                {filters.map(f => (
                  <button 
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={`px-3 py-1.5 rounded-xl text-[8px] font-display font-bold uppercase tracking-widest transition-all whitespace-nowrap gap-2 flex items-center ${activeFilter === f ? 'bg-cyber text-void shadow-glow' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    {f}
                    <span className={`px-1.5 py-0.5 rounded-md text-[7px] font-mono font-black ${activeFilter === f ? 'bg-void/20 text-void' : 'bg-white/5 text-slate-600'}`}>
                      {filterCounts[f] || 0}
                    </span>
                  </button>
                ))}
                {onGuelasClick && (
                  <>
                    <div className="w-[1px] h-4 bg-white/10 mx-1 self-center" />
                    <button 
                      onClick={() => isGuelasUnlocked && onGuelasClick()}
                      className={`px-3 py-1.5 rounded-xl text-[8px] font-display font-bold uppercase tracking-widest transition-all whitespace-nowrap gap-2 flex items-center relative ${!isGuelasUnlocked ? 'opacity-40 grayscale cursor-not-allowed text-slate-600' : 'text-cyber hover:bg-cyber/10'}`}
                    >
                      <Terminal size={12} /> Guelas
                      {!isGuelasUnlocked && <Lock size={10} className="text-red-500/50" />}
                    </button>
                  </>
                )}
              </div>
            </div>

            {history.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-700 font-mono text-xs animate-pulse gap-4">
                <Sparkles size={32} />
                <span className="tracking-[0.5em] uppercase">[ NO_DATA_POINTS ]</span>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Visual "Roots" and "Branches" lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  {history.map((item) => {
                    const x = 50 + (item.geometry?.x || 0) * 0.4;
                    const y = 50 + (item.geometry?.y || 0) * 0.4;
                    const color = item.geometry?.color || '#d946ef';
                    return (
                      <motion.line 
                        key={`line-${item.id}`}
                        x1="50%" y1="50%" 
                        x2={`${x}%`} 
                        y2={`${y}%`} 
                        stroke={color} 
                        strokeWidth="1" 
                        strokeOpacity="0.15"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.5 }}
                      />
                    );
                  })}
                </svg>

                {history.map((item) => {
                  if (!item || !item.id) return null;
                  const isFiltered = activeFilter !== 'Tudo' && (item.geometry?.branchId || '').toLowerCase() !== activeFilter.toLowerCase();
                  const x = 50 + (item.geometry?.x || 0) * 0.4;
                  const y = 50 + (item.geometry?.y || 0) * 0.4;
                  const color = item.geometry?.color || '#d946ef';
                  
                  return (
                    <motion.button
                      key={item.id}
                      onClick={() => {
                        setSelectedLeaf(item);
                        setIsDecrypted(false);
                      }}
                      initial={{ scale: 0 }}
                      animate={{ scale: isFiltered ? 0.5 : 1, opacity: isFiltered ? 0.1 : 1 }}
                      className={`absolute w-8 h-5 transition-all duration-500 z-10 ${selectedLeaf?.id === item.id ? 'shadow-glow scale-125' : ''}`}
                      style={{
                        left: `${x}%`,
                        top: `${y}%`,
                        transform: `translate(-50%, -50%) rotate(${(item.geometry?.x || 0) % 360}deg)`,
                      }}
                      whileHover={{ scale: 1.5, zIndex: 20 }}
                    >
                      {/* Leaf Shape */}
                      <div 
                        className="w-full h-full rounded-[100%_0%_100%_0%] border border-white/20"
                        style={{ 
                          backgroundColor: color,
                          boxShadow: `0 0 15px ${color}80`
                        }}
                      />
                    </motion.button>
                  );
                })}
              </div>
            )}

            <AnimatePresence>
              {selectedLeaf && (
                  <motion.div 
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="absolute bottom-0 left-0 right-0 glass-dark border-t border-white/10 p-8 z-30"
                  >
                      <div className="flex justify-between items-start mb-6">
                          <div className="flex flex-col">
                            <span className="font-mono text-[9px] uppercase tracking-widest text-cyber font-bold">
                                {selectedLeaf.geometry?.branchId} // {selectedLeaf.id.substring(0, 8)}
                            </span>
                            <span className="text-[8px] text-slate-600 font-mono mt-1">{new Date(selectedLeaf.timestamp).toLocaleString()}</span>
                          </div>
                          <button onClick={() => setSelectedLeaf(null)} className="text-slate-500 hover:text-white transition-colors"><X size={20} /></button>
                      </div>
                      
                      <div className="space-y-6 mb-8">
                        {selectedLeaf.data.alquimia?.verso && (
                          <div className="relative">
                            <div className="absolute -left-4 top-0 bottom-0 w-1 bg-cyber/40 rounded-full" />
                            <p className="font-display font-black text-xl text-white italic leading-tight">
                              "{selectedLeaf.data.alquimia.verso}"
                            </p>
                          </div>
                        )}

                        <div className="grid grid-cols-1 gap-4">
                          {selectedLeaf.data.conteudo?.original && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <p className="text-[8px] font-mono text-slate-600 uppercase tracking-widest">Relato Original</p>
                                <button 
                                  onClick={() => setIsDecrypted(!isDecrypted)}
                                  className={`text-[8px] font-mono uppercase tracking-widest px-2 py-1 rounded border transition-all ${isDecrypted ? 'bg-cyber/20 border-cyber/40 text-cyber' : 'bg-white/5 border-white/10 text-slate-500'}`}
                                >
                                  {isDecrypted ? 'Ocultar' : 'Descriptografar'}
                                </button>
                              </div>
                              <p className={`text-[10px] font-mono leading-relaxed italic bg-white/5 p-3 rounded-xl border border-white/5 transition-all duration-500 ${isDecrypted ? 'text-slate-400 blur-0' : 'text-slate-700 blur-[3px] select-none'}`}>
                                {selectedLeaf.data.conteudo.original}
                              </p>
                            </div>
                          )}
                          {selectedLeaf.data.conteudo?.transmutacao && (
                            <div className="space-y-1">
                              <p className="text-[8px] font-mono text-cyber uppercase tracking-widest">Transmutação Neural</p>
                              <p className="text-[10px] font-mono text-slate-300 leading-relaxed bg-cyber/5 p-3 rounded-xl border border-cyber/10">
                                {selectedLeaf.data.conteudo.transmutacao}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-6 border-t border-white/5">
                          <div className="flex gap-2">
                             {selectedLeaf.data.sincronicidade?.map((s, idx) => (
                               <span key={`${s}-${idx}`} className="text-[10px] font-mono text-cyber bg-cyber/10 px-3 py-1 rounded-full border border-cyber/20">#{s}</span>
                             ))}
                          </div>
                          <div className="font-display font-black text-sm text-cyber">
                              +{selectedLeaf.data.game_data?.xp} XP
                          </div>
                      </div>
                  </motion.div>
              )}
            </AnimatePresence>
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500">
              {ACHIEVEMENTS_DB.map(achievement => {
                  const unlocked = achievement.condition(totalXP, history);
                  return (
                      <div 
                          key={achievement.id}
                          className={`
                              glass border p-8 flex flex-col items-center text-center relative overflow-hidden group transition-all duration-500 rounded-[2.5rem]
                              ${unlocked 
                                  ? 'border-accent/30 bg-accent/5 shadow-glow' 
                                  : 'border-white/5 bg-black/50 opacity-40 grayscale'
                              }
                          `}
                      >
                          <div className={`p-4 rounded-2xl mb-6 ${unlocked ? 'bg-accent text-void shadow-glow' : 'bg-white/5 text-slate-700'}`}>
                              {unlocked ? achievement.icon : <Lock size={24} />}
                          </div>
                          <h4 className={`text-sm font-display font-black uppercase tracking-tight mb-2 ${unlocked ? 'text-white' : 'text-slate-600'}`}>
                              {achievement.name}
                          </h4>
                          <p className="text-xs text-slate-500 font-sans leading-relaxed mb-6">
                              {achievement.description}
                          </p>
                          {achievement.perk && unlocked && (
                              <div className="text-[9px] font-mono font-bold uppercase px-4 py-2 border rounded-full text-accent border-accent/20 bg-accent/5">
                                  PERK: {achievement.perk}
                              </div>
                          )}
                      </div>
                  )
              })}
          </div>
      )}
    </div>
  );
};

export default LifeTree;
