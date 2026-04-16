import React from 'react';
import { Terminal, Database, ChevronRight, Activity, Cpu, LogOut } from 'lucide-react';
import { UserProfile } from '../types';

interface XaelStatusBarProps {
  user: UserProfile | null;
  viewedUser: UserProfile;
  xp: number;
  level: number;
  isCozyMode?: boolean;
  onLogout?: () => void;
}

export const XaelStatusBar: React.FC<XaelStatusBarProps> = ({ user, viewedUser, xp, level, isCozyMode, onLogout }) => {
  return (
    <div className={`fixed top-0 left-0 right-0 z-[100] backdrop-blur-md border-b font-mono text-[9px] uppercase tracking-widest transition-all duration-1000 ${isCozyMode ? 'bg-white/40 border-pink-200 text-pink-600' : 'bg-void/40 border-white/5 text-slate-500'}`}>
      <div className="flex items-center justify-between px-6 py-2">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Activity size={10} className={`${isCozyMode ? 'text-pink-500' : 'text-cyber'} animate-pulse`} />
            <span className={`${isCozyMode ? 'text-pink-600' : 'text-cyber'} font-bold`}>LEAX_SYS: ACTIVE</span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Cpu size={10} />
            <span>NODE: {viewedUser?.id?.substring(0, 8) || 'SYSTEM'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Database size={10} />
            <span>XP: {xp}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className={`${isCozyMode ? 'text-pink-700' : 'text-white'} font-bold`}>LVL {level}</span>
            <div className={`w-20 h-1 rounded-full overflow-hidden ${isCozyMode ? 'bg-pink-100' : 'bg-white/10'}`}>
              <div 
                className={`h-full ${isCozyMode ? 'bg-pink-500' : 'bg-cyber shadow-glow'} `} 
                style={{ width: `${(xp % 500) / 5}%` }}
              />
            </div>
          </div>
          {user && (
            <div className={`flex items-center gap-4 pl-4 border-l ${isCozyMode ? 'border-pink-200' : 'border-white/10'}`}>
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${isCozyMode ? 'bg-pink-100 border-pink-300' : 'bg-cyber/20 border-cyber/40'} border`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${isCozyMode ? 'bg-pink-500' : 'bg-cyber'} animate-pulse`} />
                </div>
                <span className={`${isCozyMode ? 'text-pink-800' : 'text-white'} font-bold`}>{user.displayName}</span>
              </div>
              <button 
                onClick={onLogout}
                className={`p-1.5 rounded-lg transition-all ${isCozyMode ? 'hover:bg-pink-100 text-pink-600' : 'hover:bg-white/5 text-slate-500 hover:text-white'}`}
                title="Logout"
              >
                <LogOut size={12} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
