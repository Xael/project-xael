
import React from 'react';
import { Sprout, PlusCircle, History, Globe } from 'lucide-react';

interface NavigationProps {
  currentView: 'forest' | 'create' | 'tree';
  setView: (view: 'forest' | 'create' | 'tree') => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, setView }) => {
  return (
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-6">
      <div className="flex items-center justify-between bg-black/40 backdrop-blur-3xl border border-white/10 p-2 rounded-[2.5rem] shadow-2xl glass">
        <button 
          onClick={() => setView('forest')} 
          className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-3xl transition-all ${currentView === 'forest' ? 'bg-cyber/10 text-cyber shadow-[inset_0_0_20px_rgba(217,70,239,0.1)]' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <Globe size={20} className={currentView === 'forest' ? 'animate-pulse' : ''} />
          <span className="text-[9px] font-display font-black tracking-[0.2em] uppercase">Network</span>
        </button>

        <button 
          onClick={() => setView('create')} 
          className="relative px-4 group"
        >
          <div className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all duration-500 shadow-[0_0_30px_rgba(217,70,239,0.4)] transform group-hover:scale-110 group-active:scale-95 ${currentView === 'create' ? 'bg-cyber text-void' : 'bg-white/5 text-slate-400 border border-white/10'}`}>
            <PlusCircle size={32} strokeWidth={2.5} />
          </div>
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] font-mono font-black uppercase tracking-[0.3em] text-cyber opacity-0 group-hover:opacity-100 transition-opacity">Transmute</div>
        </button>

        <button 
          onClick={() => setView('tree')} 
          className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-3xl transition-all ${currentView === 'tree' ? 'bg-cyber/10 text-cyber shadow-[inset_0_0_20px_rgba(217,70,239,0.1)]' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <History size={20} className={currentView === 'tree' ? 'animate-pulse' : ''} />
          <span className="text-[9px] font-display font-black tracking-[0.2em] uppercase">History</span>
        </button>
      </div>
    </div>
  );
};

export default Navigation;
