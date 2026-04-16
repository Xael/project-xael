
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Terminal, Lock, ShieldX, Box, Sprout, LogOut, Globe, User, PlusCircle, ExternalLink, Edit3, Settings
} from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './services/firebase';
import { DesignStyle, ProjectItem, UserProfile, AppSettings, HistoryItem } from './types';
import { BootScreen } from './components/BootScreen';
import { CircuitBackground } from './components/CircuitBackground';
import { XaelStatusBar } from './components/XaelStatusBar';
import TerminalChat from './components/TerminalChat';
import TheForest from './components/TheForest';
import LifeTree from './components/LifeTree';
import CircuitNav from './components/CircuitNav';
import { MusicPlayer, ComicReader, AppModal } from './components/MediaViewers';
import AdminPanel from './components/AdminPanel';
import SecretPortal from './components/SecretPortal';
import UserProfileView from './components/UserProfileView';
import Login from './components/Login';
import GuelasFeed from './components/GuelasFeed';
import { 
  getOrCreateUserProfile, 
  saveUserProject, 
  saveUserSettings, 
  subscribeToGlobalFeed,
  subscribeToUserProjects,
  voteOnHistoryItem
} from './services/databaseService';

const GUELAS_UNLOCK_XP = 100;

const SYSTEM_USER: UserProfile = {
  id: 'system',
  displayName: 'Xael Master',
  firstName: 'XAEL',
  email: 'admin@xael.io',
  avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Xael',
  strikes: 0,
  isBanned: false,
  hasAcceptedTerms: true,
  xp: 0,
  level: 1,
  settings: {
    sectors: [
      { id: 'games', label: 'Arcade', icon: 'games', isActive: true },
      { id: 'music', label: 'Sonic', icon: 'music', isActive: true },
      { id: 'comics', label: 'Visual', icon: 'comics', isActive: true },
      { id: 'apps', label: 'Systems', icon: 'apps', isActive: true }
    ],
    themeColor: '#d946ef',
    designStyle: DesignStyle.MODERN,
    backgroundUrl: ''
  },
  projects: {}
};

const SectorCard: React.FC<{ 
  item: ProjectItem; 
  color: string; 
  delay: number;
  onClick: () => void;
  onEdit?: () => void;
  style: DesignStyle;
}> = ({ item, color, delay, onClick, onEdit, style }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const cardStyles = {
    [DesignStyle.RETRO]: "rounded-none border-2 border-green-900/50 bg-black",
    [DesignStyle.MODERN]: "rounded-xl border border-white/10 bg-white/5 backdrop-blur-md",
    [DesignStyle.CASUAL]: "rounded-[2rem] border-none bg-slate-100 text-slate-900",
    [DesignStyle.CLASSIC]: "rounded-sm border border-slate-700 bg-slate-900 shadow-lg"
  };

  const textClass = style === DesignStyle.CASUAL ? "text-slate-600" : "text-gray-400";
  const titleClass = style === DesignStyle.CASUAL ? "text-slate-900" : "text-white";

  return (
    <div 
      className={`relative group overflow-hidden transition-all duration-500 hover:-translate-y-2 cursor-pointer ${cardStyles[style]}`}
      style={{ 
        animation: `fadeIn 0.5s ease-out forwards`, 
        animationDelay: `${delay}ms`, 
        opacity: 0,
        boxShadow: isHovered && style !== DesignStyle.CASUAL ? `0 0 30px ${color}33` : 'none'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div className={`h-48 overflow-hidden relative border-b border-white/10 ${style === DesignStyle.RETRO ? 'grayscale' : ''}`}>
        <img src={item.imageUrl} alt={item.title} className={`w-full h-full object-cover transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`} />
        <div className="absolute top-2 right-2 z-20 bg-black/80 px-2 py-1 text-[10px] font-mono border border-gray-600 text-gray-300">YEAR // {item.year}</div>
      </div>
      <div className="p-5 relative z-20">
        <div className="flex justify-between items-start mb-2">
          <h3 className={`text-xl font-display font-bold uppercase tracking-wide transition-colors duration-300 ${titleClass}`} style={{ color: isHovered ? color : '' }}>{item.title}</h3>
          {onEdit && (
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="p-2 text-slate-500 hover:text-accent transition-colors"
            >
              <Edit3 size={16} />
            </button>
          )}
        </div>
        <p className={`text-sm font-mono mb-4 h-12 overflow-hidden line-clamp-2 ${textClass}`}>{item.description}</p>
        <button className="w-full py-2 font-mono text-[10px] uppercase tracking-widest border transition-all duration-300 flex items-center justify-center gap-2 bg-transparent hover:bg-white/5" style={{ borderColor: color, color: color }}>
          Access Data <ExternalLink size={12} />
        </button>
      </div>
    </div>
  );
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [viewedUser, setViewedUser] = useState<UserProfile>(SYSTEM_USER);
  const [currentSectorId, setCurrentSectorId] = useState<string>('HUB');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminConfig, setAdminConfig] = useState<{ sectorId?: string, tab?: 'visual' | 'artifacts', itemId?: string }>({});
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [bootSequence, setBootSequence] = useState(true);
  const [isSecretPortalOpen, setIsSecretPortalOpen] = useState(false);
  const [hubView, setHubView] = useState<'archive' | 'forest' | 'tree' | 'guelas'>('archive');
  const [selectedItem, setSelectedItem] = useState<ProjectItem | null>(null);
  const [globalFeed, setGlobalFeed] = useState<HistoryItem[]>([]);
  const [userProjects, setUserProjects] = useState<Record<string, ProjectItem[]>>({});

  useEffect(() => {
    const timer = setTimeout(() => setBootSequence(false), 2000);
    
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const profile = await getOrCreateUserProfile(user);
        setCurrentUser(profile);
        setViewedUser(profile);
        setHubView('archive');
      } else {
        setCurrentUser(null);
        setViewedUser(SYSTEM_USER);
        setHubView('archive');
        setUserProjects({});
        setGlobalFeed([]);
      }
    });

    return () => {
      clearTimeout(timer);
      unsubscribeAuth();
    };
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const unsubProjects = subscribeToUserProjects(currentUser.id, (projects) => {
      setUserProjects(projects);
    });

    const unsubFeed = subscribeToGlobalFeed((items) => {
      setGlobalFeed(items);
    });

    return () => {
      unsubProjects();
      unsubFeed();
    };
  }, [currentUser?.id]);

  const handleLogout = () => {
    signOut(auth);
    window.location.reload(); // Force full reload to reset local states
  };

  const handleUpdateSettings = (settings: AppSettings) => {
    if (currentUser) {
      saveUserSettings(currentUser.id, settings);
      setCurrentUser({ ...currentUser, settings });
      if (viewedUser.id === currentUser.id) setViewedUser({ ...viewedUser, settings });
    }
  };

  const handleUpdatePosition = (sectorId: string, x: number, y: number) => {
    if (currentUser && viewedUser.id === currentUser.id) {
      const updatedSectors = currentUser.settings.sectors.map(s => 
        s.id === sectorId ? { ...s, x, y } : s
      );
      handleUpdateSettings({ ...currentUser.settings, sectors: updatedSectors });
    }
  };

  const handleOpenAdmin = (sectorId?: string, tab?: 'visual' | 'artifacts', itemId?: string) => {
    setAdminConfig({ sectorId, tab, itemId });
    setIsAdminOpen(true);
  };

  const handleAddItem = (sectorId: string, item: ProjectItem) => {
    if (currentUser) {
      const updatedItem = { ...item, ownerId: currentUser.id };
      saveUserProject(currentUser.id, sectorId, updatedItem);
    }
  };

  const handleViewProfile = (userId: string) => {
    if (userId === 'system') {
      setViewedUser(SYSTEM_USER);
      setHubView('forest');
    } else if (currentUser && userId === currentUser.id) {
      setViewedUser(currentUser);
      setHubView('tree');
    } else {
      // In a real app, fetch other user's profile
      // For now, just show the tree view for the selected user
      setHubView('tree');
    }
    setCurrentSectorId('HUB');
    setIsSecretPortalOpen(false);
  };

  const themeColor = viewedUser.settings?.themeColor || '#d946ef';
  const designStyle = viewedUser.settings?.designStyle || DesignStyle.MODERN;
  
  const activeSector = viewedUser.settings?.sectors?.find(s => s.id === currentSectorId);
  const sectorData = viewedUser.id === currentUser?.id ? (userProjects[currentSectorId] || []) : (viewedUser.projects?.[currentSectorId] || []);

  const userHistory = globalFeed ? globalFeed.filter(item => item.userId === viewedUser.id) : [];
  const totalXP = userHistory.reduce((acc, item) => acc + (item.data.game_data?.xp || 0), 0);
  const eloquenciaXP = userHistory
    .filter(item => item.data.game_data?.categoria === 'Eloquência')
    .reduce((acc, item) => acc + (item.data.game_data?.xp || 0), 0);
  
  const currentLevel = Math.floor(totalXP / 500) + 1;
  const isGuelasUnlocked = eloquenciaXP >= GUELAS_UNLOCK_XP;

  const handleVote = async (itemId: string, delta: number) => {
    if (!currentUser) return;
    try {
      await voteOnHistoryItem(itemId, delta);
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  if (currentUser?.isBanned) {
    return (
      <div className="h-screen w-screen bg-void flex flex-col items-center justify-center p-10 text-center">
        <ShieldX size={48} className="text-danger mb-6 animate-pulse" />
        <h1 className="text-danger font-display font-black text-3xl mb-6 uppercase tracking-tighter">CONTA_BLOQUEADA</h1>
        <p className="text-slate-500 max-w-md">Seu acesso foi revogado por violação dos protocolos de segurança da LEAX.</p>
      </div>
    );
  }

  if (bootSequence) return <BootScreen />;

  const isCozyMode = hubView === 'forest' || hubView === 'tree';

  return (
    <div className={`min-h-screen relative overflow-hidden font-sans transition-all duration-1000 ${isCozyMode ? 'bg-[#fdf2f8] text-slate-800' : 'bg-void text-slate-300'}`}>
      
      {!isCozyMode && <CircuitBackground />}
      
      <div className="relative z-10 flex flex-col h-screen">
        <XaelStatusBar 
          user={currentUser} 
          viewedUser={viewedUser} 
          xp={currentUser?.xp || 0} 
          level={currentUser?.level || 1} 
          isCozyMode={isCozyMode}
          onLogout={handleLogout}
        />

        <main className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar">
          {currentSectorId === 'HUB' ? (
            <div className="max-w-7xl mx-auto h-full">
              {hubView === 'archive' && (
                <CircuitNav 
                  onNavigate={setCurrentSectorId} 
                  onSecretClick={() => setIsSecretPortalOpen(true)} 
                  onUpdatePosition={handleUpdatePosition}
                  viewedUser={viewedUser} 
                  themeColor={themeColor}
                />
              )}
              {hubView === 'forest' && (
                <TheForest 
                  onViewProfile={handleViewProfile} 
                  currentUser={currentUser || SYSTEM_USER} 
                  feed={globalFeed} 
                  isCozyMode={isCozyMode}
                />
              )}
              {hubView === 'tree' && (
                <LifeTree 
                  history={userHistory} 
                  userProfile={viewedUser} 
                  isCozyMode={isCozyMode}
                  isGuelasUnlocked={isGuelasUnlocked}
                  onGuelasClick={() => setHubView('guelas')}
                />
              )}
              {hubView === 'guelas' && (
                <GuelasFeed 
                  feed={globalFeed} 
                  isCozyMode={isCozyMode}
                  isUnlocked={isGuelasUnlocked}
                  eloquenciaXP={eloquenciaXP}
                  unlockThreshold={GUELAS_UNLOCK_XP}
                  onVote={handleVote}
                />
              )}
            </div>
          ) : (
            <div className="max-w-7xl mx-auto">
              <div className="mb-12 border-b border-white/5 pb-8 flex items-end justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2" style={{ color: themeColor }}>
                    <Box size={20} /> <span className="text-[10px] font-mono uppercase tracking-[0.3em] font-bold">{viewedUser.displayName}'s Archive</span>
                  </div>
                  <h1 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tighter text-white">{activeSector?.label}</h1>
                </div>
                <div className="flex items-center gap-6">
                  {currentUser?.id === viewedUser.id && (
                    <button 
                      onClick={() => setIsAdminOpen(true)} 
                      className="text-accent hover:text-accent/80 text-[10px] font-mono uppercase tracking-widest flex items-center gap-2 transition-colors border border-accent/20 px-4 py-2 rounded-xl bg-accent/5"
                    >
                      <Edit3 size={16} /> Edit Archive
                    </button>
                  )}
                  <button onClick={() => setCurrentSectorId('HUB')} className="text-slate-500 hover:text-white text-[10px] font-mono uppercase tracking-widest flex items-center gap-2 transition-colors">
                    <ArrowLeft size={16} /> Return Hub
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {sectorData.map((item, index) => (
                  <SectorCard 
                    key={item.id} 
                    item={item} 
                    color={themeColor} 
                    delay={index * 100} 
                    onClick={() => setSelectedItem(item)} 
                    onEdit={currentUser?.id === viewedUser.id ? () => handleOpenAdmin(currentSectorId, 'artifacts', item.id) : undefined}
                    style={designStyle} 
                  />
                ))}
                {sectorData.length === 0 && (
                  <div className="col-span-full py-32 text-center border border-dashed border-slate-800 rounded-3xl bg-slate-900/20 flex flex-col items-center gap-6">
                    <p className="font-mono text-xs text-slate-600 uppercase tracking-widest">Nenhum artefato encontrado neste setor.</p>
                    {currentUser?.id === viewedUser.id && (
                      <button 
                        onClick={() => handleOpenAdmin(currentSectorId, 'artifacts')}
                        className="flex items-center gap-2 px-6 py-3 bg-accent/10 border border-accent/30 text-accent rounded-2xl font-display font-bold uppercase text-[10px] tracking-widest hover:bg-accent/20 transition-all"
                      >
                        <PlusCircle size={18} /> Add New Artifact
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
        
        {/* Vertical HUD Navigation on the Right */}
        <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 h-auto">
          <div className={`flex flex-col items-center gap-4 p-3 rounded-[2.5rem] shadow-2xl backdrop-blur-3xl border transition-all duration-1000 ${isCozyMode ? 'bg-white/60 border-pink-200' : 'bg-black/40 border-white/10'}`}>
            <button 
              onClick={() => {
                setHubView('archive');
                setCurrentSectorId('HUB');
              }} 
              className={`w-14 h-14 flex flex-col items-center justify-center gap-1 rounded-2xl transition-all ${hubView === 'archive' ? 'bg-cyber/10 text-cyber' : 'text-slate-500 hover:text-slate-300'}`}
              title="Archive"
            >
              <Box size={20} className={hubView === 'archive' ? 'animate-pulse' : ''} />
              <span className="text-[7px] font-display font-black tracking-[0.1em] uppercase">Archive</span>
            </button>

            <button 
              onClick={() => {
                setHubView('forest');
                setCurrentSectorId('HUB');
              }} 
              className={`w-14 h-14 flex flex-col items-center justify-center gap-1 rounded-2xl transition-all ${hubView === 'forest' ? (isCozyMode ? 'bg-pink-500 text-white' : 'bg-cyber/10 text-cyber') : 'text-slate-500 hover:text-slate-300'}`}
              title="Forest"
            >
              <Globe size={20} className={hubView === 'forest' ? 'animate-pulse' : ''} />
              <span className="text-[7px] font-display font-black tracking-[0.1em] uppercase">Forest</span>
            </button>

            <button 
              onClick={() => setIsChatOpen(true)} 
              className="group"
              title="Transmute"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg transform group-hover:scale-110 group-active:scale-95 ${isCozyMode ? 'bg-pink-400 text-white' : 'bg-cyber text-void'}`}>
                <PlusCircle size={24} strokeWidth={2.5} />
              </div>
            </button>

            <button 
              onClick={() => {
                if (currentUser) {
                  setViewedUser(currentUser);
                  setHubView('tree');
                  setCurrentSectorId('HUB');
                }
              }} 
              className={`w-14 h-14 flex flex-col items-center justify-center gap-1 rounded-2xl transition-all ${hubView === 'tree' ? (isCozyMode ? 'bg-pink-500 text-white' : 'bg-cyber/10 text-cyber') : 'text-slate-500 hover:text-slate-300'}`}
              title="My Tree"
            >
              <User size={20} className={hubView === 'tree' ? 'animate-pulse' : ''} />
              <span className="text-[7px] font-display font-black tracking-[0.1em] uppercase">My Tree</span>
            </button>

            {currentUser && (
              <button 
                onClick={() => setIsAdminOpen(true)} 
                className={`w-14 h-14 flex flex-col items-center justify-center gap-1 rounded-2xl transition-all text-slate-500 hover:text-accent hover:bg-accent/5`}
                title="Admin Panel"
              >
                <Settings size={20} />
                <span className="text-[7px] font-display font-black tracking-[0.1em] uppercase">Admin</span>
              </button>
            )}

            <button 
              onClick={handleLogout} 
              className={`w-14 h-14 flex flex-col items-center justify-center gap-1 rounded-2xl transition-all text-slate-500 hover:text-red-500 hover:bg-red-500/5`}
              title="Logout"
            >
              <LogOut size={20} />
              <span className="text-[7px] font-display font-black tracking-[0.1em] uppercase">Sair</span>
            </button>
          </div>
        </div>
      </div>

      <TerminalChat 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        onOpenAdmin={() => handleOpenAdmin()} 
        onUnlockSecret={() => {}} 
        currentUser={currentUser}
        globalFeed={globalFeed}
      />
      
      {isAdminOpen && currentUser && (
        <AdminPanel 
          isOpen={isAdminOpen} 
          onClose={() => { setIsAdminOpen(false); setAdminConfig({}); }} 
          onAddItem={handleAddItem}
          onUpdateSettings={handleUpdateSettings}
          settings={currentUser.settings}
          currentUser={currentUser}
          initialSectorId={adminConfig.sectorId}
          initialTab={adminConfig.tab}
          initialEditingItemId={adminConfig.itemId}
        />
      )}

      {isProfileOpen && currentUser && (
        <UserProfileView 
          user={currentUser} 
          history={userHistory} 
          onClose={() => setIsProfileOpen(false)} 
        />
      )}

      {isSecretPortalOpen && !currentUser && <Login onLogin={() => setIsSecretPortalOpen(false)} />}
      {isSecretPortalOpen && currentUser && (
        <SecretPortal 
          currentUser={currentUser} 
          userHistory={userHistory} 
          globalFeed={globalFeed}
          onLogout={handleLogout} 
          onViewProfile={handleViewProfile}
        />
      )}

      {selectedItem && activeSector?.icon === 'music' && <MusicPlayer item={selectedItem} onClose={() => setSelectedItem(null)} />}
      {selectedItem && activeSector?.icon === 'comics' && <ComicReader item={selectedItem} onClose={() => setSelectedItem(null)} />}
      {selectedItem && (activeSector?.icon === 'games' || activeSector?.icon === 'apps' || activeSector?.icon === 'default') && <AppModal item={selectedItem} type={activeSector?.icon === 'games' ? 'GAME' : 'APP'} onClose={() => setSelectedItem(null)} />}
    </div>
  );
}
