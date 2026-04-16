import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';

interface AudioRecorderProps {
  onAudioReady: (blob: Blob) => void;
  isProcessing: boolean;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onAudioReady, isProcessing }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onAudioReady(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center p-12 glass border border-white/5 rounded-[3rem] w-full max-w-md mx-auto relative overflow-hidden shadow-2xl">
      
      <div className="mb-8 text-slate-400 font-mono text-[10px] tracking-[0.3em] uppercase font-bold z-10">
        {isRecording ? (
          <span className="flex items-center gap-3 text-red-500 animate-pulse">
            <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_red]" />
            REC_IN_PROGRESS [{formatTime(recordingTime)}]
          </span>
        ) : (
          <span className="opacity-50">[ AGUARDANDO_SINAL_DE_VOZ ]</span>
        )}
      </div>

      <div className="relative group z-10">
        {/* Outer Rings */}
        <div className={`absolute -inset-4 rounded-full border-2 transition-all duration-700 ${isRecording ? 'border-red-500/30 animate-[spin_8s_linear_infinite]' : 'border-white/5'}`}></div>
        <div className={`absolute -inset-8 rounded-full border border-dashed transition-all duration-1000 ${isRecording ? 'border-red-500/20 animate-[spin_12s_linear_infinite]' : 'border-white/5 opacity-20'}`}></div>

        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className={`
            w-32 h-32 rounded-[2.5rem] flex items-center justify-center transition-all duration-500 relative transform hover:scale-105 active:scale-95
            ${isRecording 
              ? 'bg-red-500 text-white shadow-[0_0_50px_rgba(239,68,68,0.5)]' 
              : 'bg-accent text-void shadow-glow'
            }
            ${isProcessing ? 'opacity-50 cursor-not-allowed grayscale' : ''}
          `}
        >
          {isRecording ? <Square size={40} fill="currentColor" /> : <Mic size={40} strokeWidth={2.5} />}
          
          {/* Inner Glow */}
          {isRecording && <div className="absolute inset-0 bg-red-500 rounded-[2.5rem] animate-ping opacity-20"></div>}
        </button>
      </div>
      
      {isProcessing && (
        <div className="mt-10 flex items-center gap-3 text-accent font-display font-black text-[10px] uppercase tracking-[0.2em] animate-in fade-in slide-in-from-bottom-2">
          <Loader2 size={16} className="animate-spin" />
          <span>Processando Fluxo Neural...</span>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;
