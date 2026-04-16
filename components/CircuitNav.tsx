
import React, { useEffect, useState, useRef } from 'react';
import { UserProfile, IconType } from '../types';
import { Gamepad2, Headphones, BookOpen, Cpu, Box } from 'lucide-react';

interface CircuitNavProps {
  onNavigate: (sectorId: string) => void;
  onSecretClick: () => void;
  onUpdatePosition: (sectorId: string, x: number, y: number) => void;
  viewedUser: UserProfile;
  themeColor: string;
}

const IconMap: Record<IconType, React.ReactNode> = {
  games: <Gamepad2 className="w-8 h-8 md:w-10 md:h-10" />,
  music: <Headphones className="w-8 h-8 md:w-10 md:h-10" />,
  comics: <BookOpen className="w-8 h-8 md:w-10 md:h-10" />,
  apps: <Cpu className="w-8 h-8 md:w-10 md:h-10" />,
  default: <Box className="w-8 h-8 md:w-10 md:h-10" />
};

const NEON_GREEN = '#22c55e';

const MatrixTitle = ({ name, themeColor }: { name: string; themeColor: string }) => {
  return (
    <div className="relative z-20 text-center pointer-events-none select-none p-12 bg-black/80 backdrop-blur-2xl rounded-full border border-white/5 shadow-[0_0_80px_rgba(0,0,0,0.9)]">
      <div className="font-mono text-[9px] text-green-500/50 mb-2 tracking-[0.5em] animate-pulse">
        SYSTEM_CORE_V7
      </div>
      <h1 className="text-4xl md:text-6xl font-display font-black text-white tracking-tighter">
        PROJECT_<span style={{ color: themeColor }}>{name.toUpperCase()}</span>
      </h1>
      <div className="font-sans text-[9px] text-white/90 font-bold mt-4 tracking-[0.6em] uppercase">
        <span className="text-[#d946ef] drop-shadow-[0_0_8px_#d946ef]">L</span>ife_
        <span className="text-[#d946ef] drop-shadow-[0_0_8px_#d946ef]">E</span>vents_ 
        <span className="text-[#d946ef] drop-shadow-[0_0_8px_#d946ef]">A</span>nd_
        <span className="text-[#d946ef] drop-shadow-[0_0_8px_#d946ef]">X</span>periences
      </div>
    </div>
  );
};

const CircuitNav: React.FC<CircuitNavProps> = ({ onNavigate, onSecretClick, onUpdatePosition, viewedUser, themeColor }) => {
  const activeSectors = viewedUser.settings?.sectors?.filter(s => s.isActive) || [];
  const containerRef = useRef<HTMLDivElement>(null);

  const [nodes, setNodes] = useState<{ id: string, x: number, y: number, label: string, icon: IconType, delay: number, duration: number }[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragStartTime = useRef<number>(0);

  useEffect(() => {
    const initialNodes = activeSectors.map((sector) => {
      let x = sector.x;
      let y = sector.y;
      
      if (x === undefined || y === undefined) {
        const margin = 15;
        const safeZone = 25; 
        do {
          x = margin + Math.random() * (100 - 2 * margin);
          y = margin + Math.random() * (100 - 2 * margin);
        } while (x > 50 - safeZone && x < 50 + safeZone && y > 50 - safeZone && y < 50 + safeZone);
      }

      return { 
        id: sector.id, 
        x: x as number, 
        y: y as number, 
        label: sector.label, 
        icon: sector.icon,
        // Frequência muito menor: delay longo e duração longa
        delay: Math.random() * 20, 
        duration: 8 + Math.random() * 12
      };
    });
    setNodes(initialNodes);
  }, [viewedUser.id, activeSectors.length]);

  const handleMouseDown = (id: string) => {
    setDraggingId(id);
    dragStartTime.current = Date.now();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingId || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setNodes(prev => prev.map(node => 
        node.id === draggingId ? { ...node, x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) } : node
      ));
    };

    const handleMouseUp = () => {
      if (draggingId) {
        const node = nodes.find(n => n.id === draggingId);
        if (node) onUpdatePosition(node.id, node.x, node.y);
        setDraggingId(null);
      }
    };

    if (draggingId) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingId, nodes, onUpdatePosition]);

  const handleNodeClick = (id: string) => {
    if (Date.now() - dragStartTime.current < 200) onNavigate(id);
  };

  // Manhattan Path exato: Começa em 50,50 e termina exatamente no x,y do ícone
  const getManhattanPath = (x: number, y: number) => {
    return `M 50 50 L ${x} 50 L ${x} ${y}`;
  };

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[750px] flex items-center justify-center overflow-visible bg-transparent select-none">
      
      {/* Circuitry Layer - SVG 0-100 para alinhamento perfeito com as porcentagens HTML */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <filter id="neon-glow-v7" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {nodes.map((node) => {
          const path = getManhattanPath(node.x, node.y);
          return (
            <g key={`circuit-${node.id}`}>
              {/* Esqueleto (Trilha) */}
              <path 
                d={path}
                fill="none"
                stroke={NEON_GREEN}
                strokeWidth="0.1"
                strokeOpacity="0.1"
                className="transition-all duration-700"
              />
              
              {/* Pulso de Dados em Baixa Frequência (Menor incidência de luz) */}
              <path 
                d={path}
                fill="none"
                stroke={NEON_GREEN}
                strokeWidth="0.3"
                strokeOpacity="0.7"
                filter="url(#neon-glow-v7)"
                // Aumentando o gap do dasharray para diminuir a densidade visual (frequência)
                strokeDasharray="2 150"
                className="pulse-path-slow"
                style={{ 
                  animationDuration: `${node.duration}s`, 
                  animationDelay: `${node.delay}s`,
                  strokeLinecap: 'round'
                }}
              />
            </g>
          );
        })}
      </svg>

      <MatrixTitle name={viewedUser.firstName} themeColor={themeColor} />

      {nodes.map((node) => (
        <div 
          key={node.id} 
          className={`absolute z-30 group cursor-grab active:cursor-grabbing transition-transform ${draggingId === node.id ? 'scale-110 z-40' : ''}`}
          style={{ 
            left: `${node.x}%`, 
            top: `${node.y}%`, 
            transform: 'translate(-50%, -50%)',
            transition: draggingId === node.id ? 'none' : 'left 0.8s cubic-bezier(0.19, 1, 0.22, 1), top 0.8s cubic-bezier(0.19, 1, 0.22, 1)'
          }}
          onMouseDown={() => handleMouseDown(node.id)}
          onClick={() => handleNodeClick(node.id)}
        >
          {/* Seed de Energia - O destino exato do raio */}
          <div 
            className={`w-1.5 h-1.5 rounded-full animate-pulse transition-all duration-500 group-hover:scale-0 group-hover:opacity-0 ${draggingId === node.id ? 'scale-0 opacity-0' : 'opacity-70'}`}
            style={{ backgroundColor: NEON_GREEN, boxShadow: `0 0 15px ${NEON_GREEN}` }}
          />

          {/* Interface Revelada */}
          <div 
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-700 
              ${(draggingId === node.id || draggingId === null) ? 'opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100' : 'opacity-0 scale-50'}
              ${draggingId === node.id ? 'opacity-100 scale-110' : ''}
            `}
          >
            <div 
              className="w-20 h-20 md:w-24 md:h-24 bg-black/90 backdrop-blur-3xl border border-white/5 rounded-3xl flex items-center justify-center shadow-2xl group-hover:rotate-12 transition-transform overflow-hidden relative"
              style={{ 
                borderColor: draggingId === node.id ? NEON_GREEN : 'rgba(255,255,255,0.05)', 
                color: themeColor, 
                boxShadow: draggingId === node.id ? `0 0 40px ${NEON_GREEN}55` : `0 0 30px ${themeColor}11` 
              }}
            >
               <div className="absolute inset-0 bg-gradient-to-tr from-green-500/10 to-transparent pointer-events-none" />
               <div className="relative z-10 transition-transform duration-500 group-hover:scale-110">
                {IconMap[node.icon] || IconMap.default}
               </div>
            </div>
            
            <div className="absolute top-full mt-4 w-48 text-center left-1/2 -translate-x-1/2 pointer-events-none">
               <span className="font-mono text-[8px] tracking-[0.6em] uppercase font-black px-4 py-2 bg-black/95 border border-white/5 rounded-full whitespace-nowrap shadow-2xl" style={{ color: themeColor }}>
                 {node.label}
               </span>
            </div>
          </div>
        </div>
      ))}

      {/* Clique no Core para Portal Secreto */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full cursor-pointer z-0 group hover:bg-green-500/[0.01] transition-colors" 
        onClick={onSecretClick} 
      />

      <style>{`
        @keyframes pulse-flow-slow {
          0% { stroke-dashoffset: 200; }
          100% { stroke-dashoffset: 0; }
        }
        .pulse-path-slow {
          animation: pulse-flow-slow linear infinite;
        }
      `}</style>
    </div>
  );
};

export default CircuitNav;
