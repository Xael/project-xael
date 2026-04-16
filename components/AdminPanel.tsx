
import React, { useState, useRef, useEffect } from 'react';
import { X, Lock, Plus, Palette, Database, Image as ImageIcon, Music, Check, Trash2, Edit3, ChevronRight, FileCode, ShieldCheck } from 'lucide-react';
import { SectorConfig, ProjectItem, AppSettings, DesignStyle, IconType, UserProfile } from '../types';
import { deleteUserProject } from '../services/databaseService';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (sectorId: string, item: ProjectItem) => void;
  onUpdateSettings: (settings: AppSettings) => void;
  settings: AppSettings;
  currentUser: UserProfile;
  initialSectorId?: string;
  initialTab?: 'visual' | 'artifacts';
  initialEditingItemId?: string;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  isOpen, 
  onClose, 
  onAddItem, 
  onUpdateSettings, 
  settings, 
  currentUser,
  initialSectorId,
  initialTab = 'visual',
  initialEditingItemId
}) => {
  const [activeTab, setActiveTab] = useState<'visual' | 'artifacts'>(initialTab);
  
  // Visual Architecture State
  const [sectors, setSectors] = useState<SectorConfig[]>(settings.sectors || []);
  const [themeColor, setThemeColor] = useState(settings.themeColor);
  const [designStyle, setDesignStyle] = useState<DesignStyle>(settings.designStyle);
  const [backgroundUrl, setBackgroundUrl] = useState(settings.backgroundUrl || '');

  // Artifact Archive State
  const [selectedSectorId, setSelectedSectorId] = useState<string>(initialSectorId || sectors[0]?.id || '');
  const [editingItemId, setEditingItemId] = useState<string | null>(initialEditingItemId || null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    year: '2026',
    imageUrl: '',
    audioUrl: '',
    link: '',
    tags: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (initialTab) setActiveTab(initialTab);
      if (initialSectorId) setSelectedSectorId(initialSectorId);
      if (initialEditingItemId) {
        setEditingItemId(initialEditingItemId);
        // Find the item to populate the form
        const allItems = Object.values(currentUser.projects || {}).flat() as ProjectItem[];
        const itemToEdit = allItems.find(i => i.id === initialEditingItemId);
        if (itemToEdit) {
          setForm({
            title: itemToEdit.title,
            description: itemToEdit.description,
            year: itemToEdit.year,
            imageUrl: itemToEdit.imageUrl,
            audioUrl: itemToEdit.tracks?.[0]?.url || '',
            link: itemToEdit.link || '',
            tags: itemToEdit.tags.join(', ')
          });
        }
      }
    }
  }, [isOpen, initialTab, initialSectorId, initialEditingItemId]);
  
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const fileRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLInputElement>(null);

  const addSector = () => {
    if (sectors.length >= 8) return;
    const newSector: SectorConfig = {
      id: 'custom_' + Math.random().toString(36).substr(2, 5),
      label: 'Novo Nodo',
      icon: 'default',
      isActive: true
    };
    setSectors([...sectors, newSector]);
  };

  const updateSector = (id: string, updates: Partial<SectorConfig>) => {
    setSectors(sectors.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'audio') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (type === 'image') setForm(prev => ({ ...prev, imageUrl: base64 }));
      else setForm(prev => ({ ...prev, audioUrl: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleCommitArtifact = () => {
    if (!form.title || !form.description) {
      setUploadStatus('ERRO: DADOS_INCOMPLETOS');
      setTimeout(() => setUploadStatus(''), 2000);
      return;
    }
    
    const item: ProjectItem = {
      id: editingItemId || Math.random().toString(36).substr(2, 9),
      ownerId: currentUser.id,
      sectorId: selectedSectorId,
      title: form.title,
      description: form.description,
      year: form.year,
      link: form.link,
      tags: form.tags.split(',').map(t => t.trim()).filter(t => t),
      imageUrl: form.imageUrl || 'https://picsum.photos/seed/xael/600/400',
      tracks: form.audioUrl ? [{ title: form.title, duration: '...', url: form.audioUrl }] : []
    };
    
    onAddItem(selectedSectorId, item);
    setUploadStatus(editingItemId ? 'DATA_SYNC_COMPLETED' : 'ARTIFACT_SAVED_IN_CORE');
    setForm({ title: '', description: '', year: '2026', imageUrl: '', audioUrl: '', link: '', tags: '' });
    setEditingItemId(null);
    setTimeout(() => setUploadStatus(''), 2000);
  };

  const startEdit = (item: ProjectItem) => {
    setEditingItemId(item.id);
    setForm({
      title: item.title,
      description: item.description,
      year: item.year,
      imageUrl: item.imageUrl,
      audioUrl: item.tracks?.[0]?.url || '',
      link: item.link || '',
      tags: item.tags.join(', ')
    });
  };

  const handlePurge = (itemId: string) => {
    deleteUserProject(currentUser.id, selectedSectorId, itemId);
    setUploadStatus('ARTIFACT_PURGED_FROM_MEMORY');
    setTimeout(() => setUploadStatus(''), 2000);
  };

  const currentSectorItems = currentUser.projects?.[selectedSectorId] || [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] bg-void/90 flex items-center justify-center p-4 backdrop-blur-md">
      <div className="w-full max-w-6xl glass rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[95vh] font-sans">
        
        {/* Top Control Bar */}
        <div className="bg-white/5 p-6 flex justify-between items-center border-b border-white/10">
           <div className="flex items-center gap-3 text-accent tracking-widest text-[10px] font-black uppercase">
             <ShieldCheck size={16} className="animate-pulse" /> 
             SESSION: ROOT_ACCESS // UID: {currentUser.id.substring(0,8)}
           </div>
           <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-2"><X size={24}/></button>
        </div>

        {/* System Tabs */}
        <div className="flex bg-black/20 border-b border-white/5">
           <button onClick={() => setActiveTab('visual')} className={`flex-1 py-5 text-[10px] font-display font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all ${activeTab === 'visual' ? 'text-accent bg-accent/5 border-b-2 border-accent' : 'text-slate-500 hover:text-slate-300'}`}>
             <Palette size={16} /> UI_Architecture
           </button>
           <button onClick={() => setActiveTab('artifacts')} className={`flex-1 py-5 text-[10px] font-display font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all ${activeTab === 'artifacts' ? 'text-accent bg-accent/5 border-b-2 border-accent' : 'text-slate-500 hover:text-slate-300'}`}>
             <Database size={16} /> Artifact_Archive
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          {activeTab === 'visual' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
               <div className="space-y-10">
                  <div>
                     <label className="block text-[10px] text-slate-500 uppercase font-bold mb-6 tracking-[0.3em]">{" >> "}RENDER_ENGINE_STYLE</label>
                     <div className="grid grid-cols-2 gap-4">
                        {Object.values(DesignStyle).map(style => (
                          <button key={style} onClick={() => setDesignStyle(style)} className={`p-6 rounded-2xl border-2 text-[11px] text-left transition-all relative ${designStyle === style ? 'border-accent text-accent bg-accent/5' : 'border-white/5 text-slate-500 bg-white/5 hover:border-white/10'}`}>
                            <div className="font-bold tracking-widest uppercase">{style}</div>
                            {designStyle === style && <div className="absolute top-3 right-3 text-accent"><Check size={14} /></div>}
                          </button>
                        ))}
                     </div>
                  </div>

                  <div>
                     <label className="block text-[10px] text-slate-500 uppercase font-bold mb-6 tracking-[0.3em]">{" >> "}SECTOR_NODES_CONFIG</label>
                     <div className="space-y-4 bg-white/5 p-6 border border-white/5 rounded-2xl">
                        {sectors.map((s) => (
                          <div key={s.id} className="flex gap-3 items-center group">
                            <select 
                              value={s.icon} 
                              onChange={(e) => updateSector(s.id, { icon: e.target.value as IconType })}
                              className="bg-void border border-white/10 text-accent text-[11px] p-3 rounded-xl outline-none"
                            >
                               <option value="games">GAMES</option>
                               <option value="music">MUSIC</option>
                               <option value="comics">COMICS</option>
                               <option value="apps">APPS</option>
                               <option value="default">MISC</option>
                            </select>
                            <input 
                              type="text" 
                              value={s.label}
                              onChange={(e) => updateSector(s.id, { label: e.target.value })}
                              className="flex-1 bg-void border border-white/10 text-white text-[11px] p-3 rounded-xl outline-none focus:border-accent transition-all"
                            />
                            <button onClick={() => setSectors(sectors.filter(sec => sec.id !== s.id))} className="text-slate-700 hover:text-danger p-2 transition-colors"><Trash2 size={18}/></button>
                          </div>
                        ))}
                        {sectors.length < 8 && (
                          <button onClick={addSector} className="w-full py-4 border border-dashed border-white/10 rounded-xl text-slate-500 text-[10px] uppercase font-bold hover:border-accent hover:text-accent transition-all flex items-center justify-center gap-2">
                            <Plus size={16} /> Register New Sector Node
                          </button>
                        )}
                     </div>
                  </div>
               </div>

               <div className="space-y-10">
                  <div>
                     <label className="block text-[10px] text-slate-500 uppercase font-bold mb-6 tracking-[0.3em]">{" >> "}SYSTEM_ACCENT_KEY</label>
                     <div className="flex items-center gap-6 bg-white/5 border border-white/5 p-6 rounded-2xl">
                        <input type="color" value={themeColor} onChange={e => setThemeColor(e.target.value)} className="w-14 h-14 cursor-pointer bg-transparent border-none rounded-2xl overflow-hidden" />
                        <span className="text-white text-[12px] font-mono tracking-widest font-bold">{themeColor.toUpperCase()}</span>
                     </div>
                  </div>
                  <div>
                     <label className="block text-[10px] text-slate-500 uppercase font-bold mb-6 tracking-[0.3em]">{" >> "}NEURAL_BACKGROUND_OVERRIDE</label>
                     <input type="text" placeholder="IMAGE_URL_STRING" className="w-full bg-void border border-white/10 p-4 text-white text-[11px] rounded-xl outline-none focus:border-accent transition-all" value={backgroundUrl} onChange={e => setBackgroundUrl(e.target.value)} />
                  </div>

                  <div className="pt-10 border-t border-white/5 space-y-4">
                      <label className="block text-[10px] text-red-500 uppercase font-bold mb-2 tracking-[0.3em]">{" >> "}DANGER_ZONE</label>
                      
                      <button 
                        onClick={async () => {
                          if (window.confirm("RESETAR SUAS TRANSMUTAÇÕES? Seus dados na conta alexblbn@gmail.com serão purgados.")) {
                            setUploadStatus('PURGING_USER_MEMORY...');
                            const { clearUserFeed } = await import('../services/databaseService');
                            await clearUserFeed(currentUser.id);
                            setUploadStatus('USER_RESET_COMPLETE');
                            setTimeout(() => window.location.reload(), 1500);
                          }
                        }}
                        className="w-full py-4 border border-orange-500/20 bg-orange-500/5 hover:bg-orange-500/10 text-orange-500 text-[10px] uppercase font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                      >
                        <Trash2 size={16} /> Purge My Seedlings
                      </button>

                      <button 
                        onClick={async () => {
                          if (window.confirm("CONFIRMAR RESET TOTAL DO SISTEMA? Toda a memória global será purgada.")) {
                            setUploadStatus('PURGING_GLOBAL_MEMORY...');
                            const { clearGlobalFeed } = await import('../services/databaseService');
                            await clearGlobalFeed();
                            setUploadStatus('SYSTEM_RESET_COMPLETE');
                            setTimeout(() => window.location.reload(), 1500);
                          }
                        }}
                        className="w-full py-4 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-500 text-[10px] uppercase font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                      >
                        <Trash2 size={16} /> Execute Global Purge Protocol
                      </button>
                  </div>
               </div>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-16 h-full">
               {/* Editor Form */}
               <div className="flex-1 space-y-8">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-[10px] text-slate-500 uppercase font-bold tracking-[0.3em]">{" >> "}{editingItemId ? 'DATA_MODIFICATION_STREAM' : 'NEW_ARTIFACT_INTAKE'}</label>
                    {editingItemId && <button onClick={() => { setEditingItemId(null); setForm({title: '', description: '', year: '2026', imageUrl: '', audioUrl: '', link: '', tags: ''}); }} className="text-[10px] text-danger hover:underline font-bold uppercase tracking-widest">Abort Edition</button>}
                  </div>
                  
                  <select 
                    value={selectedSectorId}
                    onChange={e => setSelectedSectorId(e.target.value)}
                    className="w-full bg-void border border-white/10 p-4 text-accent text-[11px] outline-none rounded-xl"
                  >
                     {sectors.map(s => <option key={s.id} value={s.id}>{s.label.toUpperCase()}</option>)}
                  </select>

                  <input type="text" placeholder="TITLE_STRING" className="w-full bg-void border border-white/10 p-4 text-white text-[12px] outline-none rounded-xl focus:border-accent transition-all" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                  
                  <div className="grid grid-cols-2 gap-5">
                     <input type="text" placeholder="CHRONO_YEAR" className="w-full bg-void border border-white/10 p-4 text-white text-[12px] outline-none rounded-xl focus:border-accent transition-all" value={form.year} onChange={e => setForm({...form, year: e.target.value})} />
                     <input type="text" placeholder="METADATA_TAGS" className="w-full bg-void border border-white/10 p-4 text-white text-[12px] outline-none rounded-xl focus:border-accent transition-all" value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} />
                  </div>

                  <input type="text" placeholder="EXTERNAL_LINK_URI" className="w-full bg-void border border-white/10 p-4 text-white text-[12px] outline-none rounded-xl focus:border-accent transition-all" value={form.link} onChange={e => setForm({...form, link: e.target.value})} />
                  
                  <textarea placeholder="NARRATIVE_DATA_DESCRIPTION" className="w-full h-32 bg-void border border-white/10 p-4 text-white text-[12px] outline-none resize-none rounded-xl focus:border-accent transition-all" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />

                  <div className="flex gap-5">
                     <div onClick={() => fileRef.current?.click()} className="flex-1 aspect-video bg-void border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-accent overflow-hidden relative group transition-all">
                        {form.imageUrl ? <img src={form.imageUrl} className="w-full h-full object-cover" /> : <><ImageIcon size={32} className="text-slate-800 mb-3"/><span className="text-[10px] text-slate-700 uppercase font-bold tracking-widest">Visual_Asset</span></>}
                        <input type="file" ref={fileRef} hidden accept="image/*" onChange={e => handleFileUpload(e, 'image')} />
                     </div>
                     <div onClick={() => audioRef.current?.click()} className={`flex-1 aspect-video border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-accent transition-all ${form.audioUrl ? 'bg-accent/5 border-accent' : ''}`}>
                        <Music size={32} className={form.audioUrl ? 'text-accent' : 'text-slate-800'} />
                        <span className="text-[10px] text-slate-700 mt-3 uppercase font-bold tracking-widest">Sonic_Signal</span>
                        <input type="file" ref={audioRef} hidden accept="audio/*" onChange={e => handleFileUpload(e, 'audio')} />
                     </div>
                  </div>
               </div>

               {/* Archive Inventory List */}
               <div className="w-full lg:w-[400px] flex flex-col bg-white/5 p-8 border border-white/5 rounded-3xl h-full">
                  <label className="block text-[10px] text-slate-500 uppercase font-bold mb-6 tracking-[0.3em]">{" >> "}NODE_ARCHIVE_INVENTORY [{currentSectorItems.length}]</label>
                  <div className="flex-1 space-y-5 overflow-y-auto pr-3 custom-scrollbar">
                     {currentSectorItems.length === 0 ? (
                       <div className="text-center py-20 border border-dashed border-white/5 text-slate-800 text-[10px] uppercase font-bold rounded-2xl">
                         Zero signals detected in node.
                       </div>
                     ) : currentSectorItems.map((item) => (
                       <div key={item.id} className="group bg-void border border-white/5 p-5 rounded-2xl flex items-center gap-5 hover:border-accent/30 transition-all">
                          <img src={item.imageUrl} className="w-14 h-14 rounded-xl object-cover border border-white/10" alt="" />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white text-[12px] font-bold truncate uppercase tracking-tight">{item.title}</h4>
                            <p className="text-slate-600 text-[10px] font-mono mt-1">{item.year} // {item.tags.length} TAGS</p>
                          </div>
                          <div className="flex gap-1">
                            <button onClick={() => startEdit(item)} className="p-2 text-slate-700 hover:text-accent transition-all"><Edit3 size={18}/></button>
                            <button onClick={() => handlePurge(item.id)} className="p-2 text-slate-700 hover:text-danger transition-all"><Trash2 size={18}/></button>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          )}
        </div>

        <div className="p-8 bg-white/5 border-t border-white/10 flex justify-end gap-5 items-center">
           {uploadStatus && <div className="flex-1 text-accent text-[10px] font-bold tracking-widest animate-pulse">{" >> "}SYSTEM_MESSAGE: {uploadStatus}</div>}
           <button onClick={onClose} className="px-10 py-4 border border-white/10 rounded-xl text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] hover:text-white transition-all">Abort</button>
           <button 
             onClick={activeTab === 'visual' ? () => { onUpdateSettings({ sectors, themeColor, designStyle, backgroundUrl }); setUploadStatus('VISUAL_ARCH_SYNCED'); setTimeout(()=>setUploadStatus(''), 2000); } : handleCommitArtifact} 
             className="px-12 py-4 bg-accent hover:bg-accent/80 text-void text-[10px] font-black uppercase tracking-[0.3em] shadow-glow transition-all rounded-xl"
           >
             {activeTab === 'visual' ? 'Initialize Interface' : (editingItemId ? 'Sync Modifications' : 'Commit Artifact')}
           </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
