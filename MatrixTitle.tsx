
import React from 'react';
import { UserProfile, HistoryItem } from '../types';
import { Trophy, Award, Star, Zap, X } from 'lucide-react';

interface UserProfileViewProps {
  user: UserProfile;
  history: HistoryItem[];
  onClose: () => void;
}

const UserProfileView: React.FC<UserProfileViewProps> = ({ user, history, onClose }) => {
  const totalXP = (history || []).reduce((acc, item) => acc + (item.data.game_data?.xp || 0), 0);
  const level = Math.floor(totalXP / 500) + 1;
  const nextLevelXP = level * 500;
  const progress = (totalXP % 500) / 5;

  const achievements = [
    { id: 1, name: 'Pioneiro', icon: <Star size={16} />, unlocked: history.length > 0 },
    { id: 2, name: 'Alquimista', icon: <Zap size={16} />, unlocked: totalXP > 1000 },
    { id: 3, name: 'Arquivista', icon: <Award size={16} />, unlocked: history.length > 5 },
    { id: 4, name: 'Mestre Xael', icon: <Trophy size={16} />, unlocked: level >= 5 },
  ];

  return (
    <div className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-void border border-slate-800 rounded-3xl overflow-hidden flex flex-col shadow-2xl relative">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors z-20">
          <X size={24} />
        </button>

        <div className="p-8 md:p-12">
          {/* Header Profile */}
          <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-accent p-1">
                <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full rounded-full object-cover" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-accent text-black font-bold font-mono text-xs px-3 py-1 rounded-full shadow-lg">
                LVL {level}
              </div>
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-display font-black text-white uppercase tracking-tighter mb-2">{user.displayName}</h2>
              <p className="text-slate-500 font-mono text-xs uppercase tracking-[0.2em] mb-4">{user.email}</p>
              
              <div className="w-full md:w-64">
                <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-2 uppercase">
                  <span>Progress to LVL {level + 1}</span>
                  <span>{totalXP % 500} / 500 XP</span>
                </div>
                <div className="h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className="h-full bg-accent shadow-[0_0_15px_rgba(217,70,239,0.5)] transition-all duration-1000" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mb-12">
            <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl text-center">
              <span className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Total XP</span>
              <span className="text-xl font-display font-bold text-white">{totalXP}</span>
            </div>
            <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl text-center">
              <span className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Logs</span>
              <span className="text-xl font-display font-bold text-white">{history.length}</span>
            </div>
            <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl text-center">
              <span className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Rank</span>
              <span className="text-xl font-display font-bold text-accent">#1</span>
            </div>
          </div>

          {/* Achievements */}
          <div>
            <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-800 pb-2">Unlocked Achievements</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {achievements.map((ach) => (
                <div 
                  key={ach.id}
                  className={`flex flex-col items-center p-4 border rounded-2xl transition-all ${ach.unlocked ? 'bg-accent/5 border-accent/30 text-accent' : 'bg-black/50 border-slate-800 text-slate-700 opacity-50'}`}
                >
                  <div className="mb-2">{ach.icon}</div>
                  <span className="text-[10px] font-bold font-mono uppercase tracking-widest">{ach.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileView;
