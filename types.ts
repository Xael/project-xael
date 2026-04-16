
export enum DesignStyle {
  RETRO = 'RETRO',
  MODERN = 'MODERN',
  CASUAL = 'CASUAL',
  CLASSIC = 'CLASSIC'
}

export type IconType = 'games' | 'music' | 'comics' | 'apps' | 'default';

export interface SectorConfig {
  id: string;
  label: string;
  icon: IconType;
  isActive: boolean;
  x?: number; // Coordenada X persistida (0-100)
  y?: number; // Coordenada Y persistida (0-100)
}

export interface Track {
  title: string;
  duration: string;
  url?: string;
}

export interface ProjectItem {
  id: string;
  ownerId: string;
  sectorId: string;
  title: string;
  description: string;
  year: string;
  tags: string[];
  imageUrl: string;
  link?: string;
  tracks?: Track[];
  pages?: string[];
  videoUrl?: string;
  fullDescription?: string;
}

export interface AppSettings {
  sectors: SectorConfig[];
  themeColor: string;
  designStyle: DesignStyle;
  backgroundUrl?: string;
  customTitle?: string;
}

export interface UserProfile {
  id: string;
  displayName: string;
  firstName: string;
  email: string;
  avatarUrl: string;
  strikes: number;
  xp: number;
  level: number;
  isBanned: boolean;
  hasAcceptedTerms: boolean;
  settings: AppSettings;
  projects: {
    [key: string]: ProjectItem[];
  };
}

export interface LeaxLayout {
  galho_pai: string;
  coordenadas: { x: number; y: number };
  cor: string;
}

export interface LeaxConteudo {
  original: string;
  transmutacao: string;
}

export interface LeaxResponse {
  status: 'success' | 'blocked' | 'error';
  severity?: 'low' | 'high';
  moderation_report: string | null;
  transcricao?: string;
  layout?: LeaxLayout;
  conteudo?: LeaxConteudo;
  alquimia?: {
    verso: string;
    cor_mood: string;
    folha_status: string;
  };
  game_data?: {
    xp: number;
    categoria: string;
    conquista: string;
    posicao: { x: number; y: number };
  };
  sincronicidade?: string[];
  votes?: number;
  essencia?: string;
}

export interface HistoryItem {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  timestamp: number;
  input_preview: string; 
  original_text: string;
  type: 'text' | 'audio';
  data: LeaxResponse;
  votes: number;
  // New layers for optimized loading
  geometry?: {
    x: number;
    y: number;
    branchId: string;
    color: string;
  };
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}
