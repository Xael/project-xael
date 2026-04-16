
import React, { useState, useEffect } from 'react';
import { Shield, AlertCircle, Globe } from 'lucide-react';

interface LoginProps {
  onLogin: (userData: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleGoogleLogin = async () => {
    if (!acceptedTerms) return;
    
    try {
      const res = await fetch('/api/auth/google/url');
      const { url } = await res.json();
      
      const authWindow = window.open(
        url,
        'google_login_popup',
        'width=600,height=700'
      );

      if (!authWindow) {
        alert('Por favor, permita popups para fazer login.');
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'AUTH_SUCCESS') {
        onLogin(event.data.user);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onLogin]);

  return (
    <div className="fixed inset-0 z-[100] bg-void/90 backdrop-blur-md flex items-center justify-center p-6 overflow-y-auto">
      <div className="relative z-10 w-full max-w-xl glass p-8 md:p-12 rounded-3xl shadow-2xl my-10">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-16 h-16 bg-accent/10 border border-accent/30 rounded-2xl flex items-center justify-center mb-6 shadow-glow">
            <Shield className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-3xl font-display font-black text-white mb-2 tracking-tighter uppercase">LEAX_ACCESS</h1>
          <p className="text-slate-500 font-mono text-xs uppercase tracking-[0.3em]">Protocolo de Identidade Alquímica</p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 mb-8 max-h-64 overflow-y-auto custom-scrollbar">
           <h3 className="text-white font-bold text-sm mb-4 uppercase tracking-widest border-b border-slate-700 pb-2 flex items-center gap-2">
             <AlertCircle size={14} className="text-accent" /> Termos de Uso e Consentimento
           </h3>
           <div className="space-y-4 text-xs font-sans text-slate-400 leading-relaxed">
             <p><strong className="text-slate-200">1. Classificação Etária (+18):</strong> A LEAX é exclusiva para maiores de 18 anos. É proibido o cadastro de menores. Você declara ter maturidade para lidar com reflexões profundas.</p>
             <p><strong className="text-slate-200">2. Política de Tolerância Zero:</strong> Proibido upload de conteúdo sexual, nudez, violência extrema (morte, mutilação), discurso de ódio ou assédio.</p>
             <p><strong className="text-slate-200">3. Moderação Ativa:</strong> O sistema utiliza IA para bloquear conteúdos proibidos. Violações graves resultam em banimento imediato e definitivo.</p>
             <p><strong className="text-slate-200">4. Alquimia Digital:</strong> Seus relatos são transformados em artes e versos. Mantemos o anonimato na Floresta Pública.</p>
           </div>
        </div>
        
        <div className="flex items-start gap-4 p-4 bg-accent/5 border border-accent/20 rounded-xl mb-10 group cursor-pointer" onClick={() => setAcceptedTerms(!acceptedTerms)}>
          <input 
            type="checkbox" 
            checked={acceptedTerms}
            onChange={() => {}}
            className="mt-1 w-5 h-5 rounded border-slate-800 bg-black checked:bg-accent accent-accent cursor-pointer" 
          />
          <label className="text-xs text-slate-300 font-medium leading-tight cursor-pointer">
            Declaro que tenho 18 anos ou mais e aceito as regras de não postar conteúdos sensíveis (morte, sexo ou violência).
          </label>
        </div>

        <button 
          onClick={handleGoogleLogin}
          disabled={!acceptedTerms}
          className={`w-full py-4 font-bold font-display text-sm rounded-xl transition-all flex items-center justify-center gap-4 group 
            ${acceptedTerms ? 'bg-white text-black hover:bg-accent hover:text-white shadow-glow' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}
          `}
        >
          <Globe size={20} />
          ENTRAR COM GOOGLE
        </button>

        <p className="mt-8 text-[9px] font-mono text-slate-600 text-center uppercase tracking-widest opacity-50">
          Sua conta Google será vinculada ao seu Project Pessoal.
        </p>
      </div>
    </div>
  );
};

export default Login;
