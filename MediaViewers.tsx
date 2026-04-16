import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  PlusCircle, 
  History, 
  ShieldAlert, 
  Zap, 
  Sparkles, 
  X, 
  Send, 
  Mic,
  Loader2
} from 'lucide-react';
import { addStrike, banUser } from '../services/databaseService';
import { transmuteContent } from '../services/geminiService';
import { HistoryItem, UserProfile, LeaxResponse } from '../types';
import Navigation from './Navigation';
import ResultCard from './ResultCard';
import LifeTree from './LifeTree';
import AudioRecorder from './AudioRecorder';
import TheForest from './TheForest';

interface SecretPortalProps {
  currentUser: UserProfile;
  userHistory: HistoryItem[];
  globalFeed: HistoryItem[];
  onLogout: () => void;
  onViewProfile: (userId: string) => void;
}

const SecretPortal: React.FC<SecretPortalProps> = ({ 
  currentUser, 
  userHistory, 
  globalFeed,
  onLogout,
  onViewProfile
}) => {
  const [view, setView] = useState<'feed' | 'transmute' | 'tree'>('feed');
  const [textInput, setTextInput] = useState('');
  const [isTransmuting, setIsTransmuting] = useState(false);
  const [result, setResult] = useState<LeaxResponse | null>(null);
  const [userStrikes, setUserStrikes] = useState(currentUser.strikes);

  const handleTransmute = async (input: string, type: 'text' | 'audio' = 'text') => {
    if (!input.trim() || isTransmuting) return;
    
    setIsTransmuting(true);
    try {
      const response = await transmuteContent(input, 'text', currentUser.id);
      setResult(response);
      
      if (response.status === 'blocked') {
        const newStrikes = await addStrike(currentUser.id);
        setUserStrikes(newStrikes);
      } else if (response.status === 'error') {
        console.warn("Technical error during transmutation");
      }
    } catch (error) {
      console.error("Transmutation failed:", error);
    } finally {
      setIsTransmuting(false);
    }
  };

  return (
    <div className="min-h-screen bg-void text-slate-300 font-sans selection:bg-cyber/30 selection:text-white overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto custom-scrollbar pb-32">
          <div className="max-w-4xl mx-auto px-6 pt-12">
            
            {view === 'feed' && (
              <TheForest 
                feed={globalFeed} 
                currentUser={currentUser} 
                onViewProfile={onViewProfile} 
              />
            )}

            {view === 'transmute' && (
              <div className="max-w-xl mx-auto animate-in fade-in zoom-in duration-700">
                {!result ? (
                  <div className="space-y-12 text-center">
                    <div className="space-y-4">
                        <h2 className="text-5xl font-display font-black text-white uppercase tracking-tighter">Alquimia</h2>
                        <p className="text-slate-500 font-mono text-xs uppercase tracking-[0.2em]">Transmute pensamentos em essência digital</p>
                    </div>

                    <div className="glass border border-white/10 p-2 rounded-[3rem] shadow-2xl focus-within:border-accent/50 transition-all">
                        <textarea 
                          value={textInput}
                          onChange={(e) => setTextInput(e.target.value)}
                          placeholder="O que sua alma sussurra hoje?"
                          className="w-full bg-transparent border-none focus:ring-0 p-8 text-xl font-display font-medium text-white placeholder:text-slate-700 resize-none h-48 custom-scrollbar"
                        />
                        <div className="flex justify-between items-center p-4 bg-white/5 rounded-[2.5rem]">
                            <div className="flex gap-2">
                                <button className="p-4 rounded-2xl bg-white/5 text-slate-400 hover:bg-white/10 transition-all"><Mic size={20} /></button>
                            </div>
                            <button 
                              onClick={() => handleTransmute(textInput)}
                              disabled={isTransmuting || !textInput.trim()}
                              className="px-10 py-4 bg-cyber hover:bg-cyber/80 text-void font-display font-black uppercase tracking-widest rounded-2xl transition-all shadow-[0_0_20px_rgba(217,70,239,0.4)] flex items-center gap-3 disabled:opacity-50 disabled:grayscale"
                            >
                              {isTransmuting ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                              <span>Transmutar</span>
                            </button>
                        </div>
                    </div>
                  </div>
                ) : (
                  <ResultCard data={result} onClose={() => { setResult(null); setTextInput(''); }} currentStrikes={userStrikes} />
                )}
              </div>
            )}

            {view === 'tree' && <LifeTree history={userHistory} userProfile={currentUser} />}
          </div>
        </div>

        <Navigation currentView={view} setView={setView} />
        <style>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }`}</style>
    </div>
  );
};

export default SecretPortal;
