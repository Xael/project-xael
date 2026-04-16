
import React from 'react';
import { LeaxResponse } from '../types';
import { ShieldAlert, Sparkles, Award, Zap, History, X } from 'lucide-react';

interface ResultCardProps {
  data: LeaxResponse;
  onClose: () => void;
  currentStrikes?: number;
}

const ResultCard: React.FC<ResultCardProps> = ({ data, onClose, currentStrikes = 0 }) => {
  if (data.status === 'error') {
    return (
      <div className="glass border border-yellow-500/50 p-10 text-center animate-in fade-in zoom-in duration-500 font-sans relative overflow-hidden group rounded-[3rem]">
        <div className="absolute inset-0 bg-yellow-500/5 pointer-events-none" />
        <div className="relative z-10">
          <div className="w-20 h-20 rounded-3xl bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(234,179,8,0.3)]">
            <ShieldAlert size={40} className="text-yellow-500" />
          </div>
          <h3 className="text-3xl font-display font-black text-white mb-4 uppercase tracking-tighter">Falha na Conexão</h3>
          <p className="text-yellow-300 text-sm mb-8 leading-relaxed">{data.moderation_report || "Não foi possível estabelecer contato com o Guardião. Verifique sua conexão ou tente novamente em instantes."}</p>
          
          <button onClick={onClose} className="w-full py-5 bg-yellow-500 hover:bg-yellow-400 text-void font-black font-display uppercase tracking-[0.2em] rounded-2xl transition-all shadow-[0_0_20px_rgba(234,179,8,0.3)]">
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (data.status === 'blocked') {
    return (
      <div className="glass border border-red-500/50 p-10 text-center animate-in fade-in zoom-in duration-500 font-sans relative overflow-hidden group rounded-[3rem]">
        <div className="absolute inset-0 bg-red-500/5 pointer-events-none" />
        <div className="relative z-10">
          <div className="w-20 h-20 rounded-3xl bg-red-500/20 border border-red-500/40 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
            <ShieldAlert size={40} className="text-red-500" />
          </div>
          <h3 className="text-3xl font-display font-black text-white mb-4 uppercase tracking-tighter">Acesso Negado</h3>
          <p className="text-red-300 text-sm mb-8 leading-relaxed">{data.moderation_report || "Protocolo de segurança ativado. Conteúdo bloqueado por violar as diretrizes da rede neural."}</p>
          
          <div className="bg-black/40 border border-red-500/20 p-6 mb-8 rounded-2xl">
              <p className="text-red-500 font-display font-black text-[10px] uppercase tracking-[0.3em] mb-4">Registro de Violação</p>
              <div className="flex justify-center gap-4 mb-4">
                  {[1, 2, 3].map(i => (
                      <div key={i} className={`w-4 h-4 rounded-full border-2 transition-all duration-500 ${i <= currentStrikes ? 'bg-red-500 border-white shadow-[0_0_15px_red]' : 'bg-transparent border-red-900'}`}></div>
                  ))}
              </div>
              <p className="text-[10px] font-mono text-red-400 uppercase tracking-widest font-bold">Strike {currentStrikes} de 3</p>
          </div>

          <button onClick={onClose} className="w-full py-5 bg-red-500 hover:bg-red-400 text-white font-black font-display uppercase tracking-[0.2em] rounded-2xl transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)]">
            Reconhecer Aviso
          </button>
        </div>
      </div>
    );
  }

  const { alquimia, game_data, sincronicidade } = data;
  if (!alquimia || !game_data) {
    return (
      <div className="glass border border-white/10 p-10 text-center rounded-[3rem]">
        <p className="text-slate-500 font-mono text-xs uppercase">Processando dados incompletos...</p>
        <button onClick={onClose} className="mt-4 px-6 py-2 bg-white/5 rounded-xl text-[10px] uppercase font-bold">Fechar</button>
      </div>
    );
  }

  return (
    <div className="glass border border-cyber/30 p-10 shadow-[0_0_30px_rgba(217,70,239,0.2)] animate-in fade-in slide-in-from-bottom-10 duration-700 group max-w-xl w-full mx-auto rounded-[3rem] relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
        <Sparkles size={64} className="text-cyber" />
      </div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-10">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyber font-bold mb-2">Essência Extraída</span>
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-display font-black text-white tracking-tighter">+{game_data.xp}</span>
              <span className="text-cyber font-display font-bold text-xl uppercase">XP</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="bg-cyber/10 px-4 py-2 border border-cyber/20 rounded-xl mb-3 shadow-[inset_0_0_10px_rgba(217,70,239,0.1)]">
              <span className="text-[10px] font-display font-black text-cyber uppercase tracking-widest">{alquimia.folha_status}</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">{game_data.categoria}</span>
          </div>
        </div>

        <div className="relative mb-10 py-10 px-8">
           <div className="absolute inset-0 bg-cyber/10 rounded-[2.5rem] border border-cyber/20" />
           <div className="relative space-y-8">
             <p className="text-3xl font-display font-black text-white leading-tight tracking-tight italic text-center drop-shadow-glow">
              "{alquimia.verso}"
            </p>
            {data.conteudo && (
              <div className="space-y-6">
                {data.conteudo.original && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 justify-center">
                      <div className="h-px bg-slate-800 flex-1" />
                      <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest px-2 whitespace-nowrap italic">Entrada Bruta</p>
                      <div className="h-px bg-slate-800 flex-1" />
                    </div>
                    <p className="text-xs font-mono text-slate-500 text-center leading-relaxed italic px-4">
                      {data.conteudo.original}
                    </p>
                  </div>
                )}
                <div className="flex justify-center">
                   <Zap size={16} className="text-cyber animate-pulse" />
                </div>
                {data.conteudo.transmutacao && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 justify-center">
                      <div className="h-px bg-cyber/20 flex-1" />
                      <p className="text-[10px] font-mono text-cyber uppercase tracking-widest px-2 whitespace-nowrap font-bold">Transmuta Neural</p>
                      <div className="h-px bg-cyber/20 flex-1" />
                    </div>
                    <div className="bg-cyber/5 p-4 rounded-2xl border border-cyber/10">
                      <p className="text-sm font-mono text-slate-200 text-center leading-relaxed">
                        {data.conteudo.transmutacao}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
           </div>
        </div>

        <div className="space-y-6 mb-10">
          <div className="glass border border-white/5 p-6 rounded-2xl flex items-center gap-5 hover:border-cyber/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-cyber/20 flex items-center justify-center text-cyber shadow-[0_0_15px_rgba(217,70,239,0.4)]">
              <Award size={24} />
            </div>
            <div className="flex-1">
              <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold">Nova Conquista</p>
              <p className="text-lg font-display font-black text-white tracking-tight uppercase">{game_data.conquista}</p>
            </div>
            {data.layout && (
              <div className="text-right">
                <p className="text-[8px] font-mono text-slate-600 uppercase tracking-widest">Posição</p>
                <p className="text-[10px] font-mono text-cyber uppercase font-bold">{data.layout.galho_pai}</p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            {sincronicidade?.map((tag, idx) => (
              <span key={idx} className="text-[10px] font-mono text-slate-400 bg-white/5 px-4 py-2 border border-white/10 rounded-full uppercase font-bold tracking-widest">#{tag}</span>
            ))}
          </div>
        </div>

        <button onClick={onClose} className="w-full py-6 bg-cyber hover:bg-cyber/80 text-void font-black font-display uppercase tracking-[0.2em] rounded-2xl transition-all shadow-[0_0_20px_rgba(217,70,239,0.4)] flex items-center justify-center gap-3">
          <History size={20} />
          <span>Nova Transmutação</span>
        </button>
      </div>
    </div>
  );
};

export default ResultCard;
