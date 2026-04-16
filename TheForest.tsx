import React, { useState, useRef, useEffect } from 'react';
import { Send, Terminal, Zap, Sparkles, ShieldAlert, Loader2, X, Lock, Mic, MessageSquare } from 'lucide-react';
import { transmuteContent } from '../services/geminiService';
import { addToGlobalFeed, addStrike } from '../services/databaseService';
import { HistoryItem, UserProfile, LeaxResponse } from '../types';
import ResultCard from './ResultCard';
import AudioRecorder from './AudioRecorder';

interface TerminalChatProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdmin?: () => void;
  onUnlockSecret?: () => void;
  currentUser: UserProfile | null;
  globalFeed: HistoryItem[];
}

const TerminalChat: React.FC<TerminalChatProps> = ({ 
  isOpen, 
  onClose, 
  onOpenAdmin, 
  currentUser,
  globalFeed 
}) => {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<LeaxResponse | null>(null);
  const [strikes, setStrikes] = useState(currentUser?.strikes || 0);
  const [inputMode, setInputMode] = useState<'text' | 'audio'>('text');
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleSend = async (audioBlob?: Blob) => {
    if (inputMode === 'text' && !input.trim() && !audioBlob) return;
    if (isProcessing) return;

    const currentInput = input;
    if (inputMode === 'text') setInput('');
    setIsProcessing(true);

    try {
      const response = await transmuteContent(
        audioBlob || currentInput, 
        audioBlob ? 'audio' : 'text', 
        currentUser?.id
      );
      setResult(response);

      if (response.status === 'success' && currentUser) {
        const historyItem: HistoryItem = {
          id: crypto.randomUUID(),
          userId: currentUser.id,
          userName: currentUser.displayName,
          userAvatar: currentUser.avatarUrl,
          timestamp: Date.now(),
          input_preview: response.conteudo?.original?.substring(0, 50) || (typeof currentInput === 'string' ? currentInput.substring(0, 50) : 'Audio Input'),
          original_text: response.conteudo?.original || (typeof currentInput === 'string' ? currentInput : 'Audio Input'),
          type: audioBlob ? 'audio' : 'text',
          data: response,
          votes: 0,
          geometry: {
            x: response.layout?.coordenadas?.x || response.game_data?.posicao?.x || 0,
            y: response.layout?.coordenadas?.y || response.game_data?.posicao?.y || 0,
            branchId: response.layout?.galho_pai || response.game_data?.categoria || 'Geral',
            color: response.layout?.cor || response.alquimia?.cor_mood || '#d946ef'
          }
        };
        await addToGlobalFeed(historyItem);
      } else if (response.status === 'blocked' && currentUser) {
        const newStrikes = await addStrike(currentUser.id);
        setStrikes(newStrikes);
      }
    } catch (error) {
      console.error("Transmutation error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] bg-void/80 backdrop-blur-xl flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-500">
      <div className="w-full max-w-4xl h-[80vh] flex flex-col glass border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl relative">
        <div className="absolute inset-0 bg-void/40 pointer-events-none" />
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between relative z-10 bg-white/5 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyber/20 flex items-center justify-center text-cyber shadow-[0_0_15px_rgba(217,70,239,0.4)]">
              <Terminal size={20} />
            </div>
            <div>
              <h3 className="text-sm font-display font-black text-white uppercase tracking-widest">Neural Terminal</h3>
              <p className="text-[9px] font-mono text-cyber uppercase tracking-widest font-bold">Protocolo Alquimia v4.0</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-2 mr-4">
              <div className="w-2 h-2 rounded-full bg-cyber animate-pulse shadow-[0_0_10px_#d946ef]" />
              <div className="w-2 h-2 rounded-full bg-cyber/20" />
              <div className="w-2 h-2 rounded-full bg-cyber/20" />
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative z-10">
        {!result ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in duration-700">
            {inputMode === 'text' ? (
              <>
                <div className="w-24 h-24 rounded-[2rem] bg-cyber/10 border border-cyber/20 flex items-center justify-center text-cyber shadow-[0_0_30px_rgba(217,70,239,0.2)] relative group">
                    <Sparkles size={40} className="group-hover:scale-110 transition-transform" />
                    <div className="absolute inset-0 bg-cyber/20 rounded-[2rem] animate-ping opacity-20" />
                </div>
                <div className="space-y-3">
                    <h4 className="text-2xl font-display font-black text-white uppercase tracking-tighter">Pronto para Transmutar</h4>
                    <p className="text-slate-500 font-mono text-[10px] uppercase tracking-[0.2em] max-w-xs mx-auto leading-relaxed">
                      Insira qualquer fragmento de pensamento para convertê-lo em essência digital e XP.
                    </p>
                </div>
              </>
            ) : (
              <AudioRecorder onAudioReady={(blob) => handleSend(blob)} isProcessing={isProcessing} />
            )}
          </div>
        ) : (
          <div className="animate-in zoom-in fade-in duration-500">
            <ResultCard data={result} onClose={() => setResult(null)} currentStrikes={strikes} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white/5 backdrop-blur-xl border-t border-white/5 relative z-10">
        <div className="flex gap-4 mb-4 justify-center">
          <button 
            onClick={() => setInputMode('text')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-display font-black text-[10px] uppercase tracking-widest transition-all ${inputMode === 'text' ? 'bg-cyber text-void shadow-glow' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <MessageSquare size={14} /> Texto
          </button>
          <button 
            onClick={() => setInputMode('audio')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-display font-black text-[10px] uppercase tracking-widest transition-all ${inputMode === 'audio' ? 'bg-cyber text-void shadow-glow' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Mic size={14} /> Voz
          </button>
        </div>

        {inputMode === 'text' && (
          <div className="glass border border-white/10 rounded-2xl flex items-center p-2 focus-within:border-cyber/40 transition-all group shadow-inner">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Digite seu comando ou pensamento..."
              className="flex-1 bg-transparent border-none focus:ring-0 px-6 py-4 text-white font-display font-medium placeholder:text-slate-700"
              disabled={isProcessing}
            />
            <button 
              onClick={() => handleSend()}
              disabled={isProcessing || !input.trim()}
              className={`
                p-4 rounded-xl transition-all flex items-center justify-center
                ${isProcessing || !input.trim() 
                  ? 'bg-white/5 text-slate-700' 
                  : 'bg-cyber text-void shadow-[0_0_20px_rgba(217,70,239,0.4)] hover:scale-105 active:scale-95'
                }
              `}
            >
              {isProcessing ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
          </div>
        )}
      </div>
      
      <style>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }`}</style>
    </div>
  </div>
);
};

export default TerminalChat;
