import React from 'react';
import { HistoryItem } from '../types';
import { Volume2, MessageSquare, Sparkles, Zap, Lock, Trophy, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

interface GuelasFeedProps {
  feed: HistoryItem[];
  isCozyMode?: boolean;
  isUnlocked: boolean;
  eloquenciaXP: number;
  unlockThreshold: number;
  onVote: (itemId: string, delta: number) => void;
}

const GuelasFeed: React.FC<GuelasFeedProps> = ({ 
  feed, 
  isCozyMode, 
  isUnlocked, 
  eloquenciaXP, 
  unlockThreshold,
  onVote 
}) => {
  const guelasItems = feed
    .filter(item => item.data.game_data?.categoria === 'Eloquência')
    .sort((a, b) => (b.votes || 0) - (a.votes || 0));

  if (!isUnlocked) {
    return (
      <div className="max-w-2xl mx-auto py-24 px-6 text-center">
        <div className={`w-24 h-24 rounded-[3rem] flex items-center justify-center mx-auto mb-8 shadow-2xl ${isCozyMode ? 'bg-pink-100 text-pink-500' : 'bg-white/5 text-slate-700 border border-white/10'}`}>
          <Lock size={48} />
        </div>
        <h2 className={`text-4xl font-display font-black uppercase tracking-tighter mb-4 ${isCozyMode ? 'text-pink-700' : 'text-white'}`}>ACESSO NEGADO</h2>
        <p className="text-slate-500 font-mono text-xs uppercase tracking-widest mb-8">
          O Torneio de Guelas é reservado para mestres da Eloquência.
        </p>
        
        <div className={`p-8 rounded-[2.5rem] border ${isCozyMode ? 'bg-white border-pink-100' : 'bg-white/5 border-white/10'}`}>
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500">Progresso de Eloquência</span>
            <span className={`text-sm font-display font-black ${isCozyMode ? 'text-pink-600' : 'text-cyber'}`}>{eloquenciaXP} / {unlockThreshold} XP</span>
          </div>
          <div className={`w-full h-3 rounded-full overflow-hidden ${isCozyMode ? 'bg-pink-50' : 'bg-white/5'}`}>
            <div 
              className={`h-full transition-all duration-1000 ${isCozyMode ? 'bg-pink-500' : 'bg-cyber shadow-glow'}`}
              style={{ width: `${Math.min(100, (eloquenciaXP / unlockThreshold) * 100)}%` }}
            />
          </div>
          <p className="mt-6 text-[10px] font-mono text-slate-600 leading-relaxed">
            Transmute pensamentos absurdos, nonsense e insensatez para ganhar XP de Eloquência e desbloquear o Nexus Secreto.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-[2rem] flex items-center justify-center shadow-lg ${isCozyMode ? 'bg-pink-500 text-white' : 'bg-cyber text-void shadow-glow'}`}>
            <Trophy size={32} />
          </div>
          <div>
            <h2 className={`text-4xl font-display font-black uppercase tracking-tighter ${isCozyMode ? 'text-pink-700' : 'text-white'}`}>TORNEIO DE GUELAS</h2>
            <p className="text-slate-500 font-mono text-[10px] uppercase tracking-[0.3em] font-bold">O Ranking da Insensatez Suprema</p>
          </div>
        </div>
        
        <div className={`px-6 py-3 rounded-2xl border flex items-center gap-4 ${isCozyMode ? 'bg-pink-50 border-pink-100' : 'bg-white/5 border-white/10'}`}>
          <TrendingUp size={16} className={isCozyMode ? 'text-pink-500' : 'text-cyber'} />
          <div className="flex flex-col">
            <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Sua Eloquência</span>
            <span className={`text-sm font-display font-black ${isCozyMode ? 'text-pink-700' : 'text-white'}`}>{eloquenciaXP} XP</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {guelasItems.length === 0 ? (
          <div className="py-32 text-center border border-dashed border-white/5 rounded-[3rem] bg-white/5 flex flex-col items-center gap-4">
            <Zap size={32} className="text-slate-700 animate-pulse" />
            <p className="font-mono text-xs text-slate-600 uppercase tracking-widest">Nenhuma Guela Suprema detectada ainda...</p>
          </div>
        ) : (
          guelasItems.map((item, index) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`group relative p-8 rounded-[2.5rem] border transition-all duration-500 ${isCozyMode ? 'bg-white border-pink-100 shadow-md hover:shadow-xl' : 'bg-white/5 border-white/10 hover:border-cyber/40 shadow-2xl'}`}
            >
              {index === 0 && (
                <div className="absolute -top-3 -left-3 bg-yellow-500 text-white p-2 rounded-xl shadow-lg z-10 animate-bounce">
                  <Trophy size={16} />
                </div>
              )}

              <div className="flex items-start gap-6">
                <div className="flex flex-col items-center gap-2">
                  <button 
                    onClick={() => onVote(item.id, 1)}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isCozyMode ? 'bg-pink-50 text-pink-500 hover:bg-pink-500 hover:text-white' : 'bg-white/5 text-slate-500 hover:bg-cyber hover:text-void'}`}
                    title="Guela Suprema"
                  >
                    <span className="text-xl">🔥</span>
                  </button>
                  <span className={`font-display font-black text-lg ${isCozyMode ? 'text-pink-700' : 'text-white'}`}>
                    {item.votes || 0}
                  </span>
                  <button 
                    onClick={() => onVote(item.id, -1)}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isCozyMode ? 'bg-slate-100 text-slate-400 hover:bg-slate-200' : 'bg-white/5 text-slate-600 hover:bg-white/10'}`}
                    title="Guela Seca"
                  >
                    <span className="text-xl grayscale group-hover:grayscale-0 transition-all">💩</span>
                  </button>
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <img src={item.userAvatar} className="w-10 h-10 rounded-xl border border-white/10 object-cover" alt="" />
                      <div className="flex flex-col">
                        <span className={`text-sm font-display font-black uppercase tracking-tight ${isCozyMode ? 'text-pink-600' : 'text-white'}`}>{item.userName}</span>
                        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">{new Date(item.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] font-mono font-bold uppercase ${isCozyMode ? 'bg-pink-50 border-pink-100 text-pink-500' : 'bg-cyber/10 border-cyber/20 text-cyber'}`}>
                      <Sparkles size={10} /> {item.data.game_data?.conquista || 'Eloquência'}
                    </div>
                  </div>
                  
                  <div className="relative mb-6 p-6 rounded-2xl bg-black/20 border border-white/5">
                    <div className="absolute -left-2 top-4 bottom-4 w-1 bg-cyber/40 rounded-full" />
                    <p className={`text-xl font-display font-black italic leading-tight ${isCozyMode ? 'text-slate-800' : 'text-white'}`}>
                      "{item.data.alquimia?.verso || item.data.conteudo?.transmutacao}"
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    {item.data.sincronicidade?.map((s, idx) => (
                      <span key={`${s}-${idx}`} className="text-[9px] font-mono text-slate-500 bg-white/5 px-3 py-1 rounded-full border border-white/5 uppercase">#{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default GuelasFeed;
