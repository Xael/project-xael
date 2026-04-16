
import { UserProfile, HistoryItem, ProjectItem, AppSettings } from '../types';
import io from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_URL || window.location.origin);
const VITE_API_URL = import.meta.env.VITE_API_URL || '';
// Ensure we don't end up with // if the user provides a path ending in /
const API_BASE = VITE_API_URL.endsWith('/') ? VITE_API_URL.slice(0, -1) : VITE_API_URL;

export const getOrCreateUserProfile = async (): Promise<UserProfile | null> => {
  try {
    const url = `${API_BASE}/api/auth/me`.replace(/\/+/g, '/'); // Safety replace for double slashes
    // If it started with https:/, the replace above broke it, let's be careful
    const finalUrl = API_BASE.startsWith('http') 
      ? `${API_BASE.replace(/\/$/, '')}/api/auth/me`
      : `/api/auth/me`;

    const res = await fetch(finalUrl);
    if (res.status === 401) return null;
    
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      return await res.json();
    } else {
      const text = await res.text();
      console.error("Expected JSON but got:", text.substring(0, 100));
      return null;
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

export const logout = async () => {
  await fetch(`${API_BASE}/api/auth/logout`, { method: 'POST' });
};

export const saveUserSettings = async (userId: string, settings: AppSettings) => {
  const res = await fetch(`${API_BASE}/api/users/${userId}/settings`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings)
  });
  return res.json();
};

export const saveUserProject = async (userId: string, sectorId: string, item: ProjectItem) => {
  const res = await fetch(`${API_BASE}/api/users/${userId}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...item, sectorId })
  });
  return res.json();
};

export const deleteUserProject = async (userId: string, sectorId: string, itemId: string) => {
  // Not implemented in API yet, but you get the idea
};

export const addToGlobalFeed = async (item: HistoryItem) => {
  const res = await fetch(`${API_BASE}/api/feed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item)
  });
  return res.json();
};

export const voteOnHistoryItem = async (itemId: string, delta: number) => {
  const res = await fetch(`${API_BASE}/api/feed/${itemId}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ delta })
  });
  return res.json();
};

export const addStrike = async (userId: string): Promise<number> => {
  const res = await fetch(`${API_BASE}/api/users/${userId}/strikes`, { method: 'POST' });
  const user = await res.json();
  return user.strikes;
};

export const banUser = async (userId: string): Promise<void> => {
  await fetch(`${API_BASE}/api/users/${userId}/ban`, { method: 'POST' });
};

export const clearUserFeed = async (userId: string) => {
  await fetch(`${API_BASE}/api/feed?userId=${userId}`, { method: 'DELETE' });
};

export const clearGlobalFeed = async () => {
  await fetch(`${API_BASE}/api/feed`, { method: 'DELETE' });
};

export const subscribeToGlobalFeed = (callback: (items: HistoryItem[]) => void) => {
  // Initial fetch
  fetch(`${API_BASE}/api/feed`).then(res => res.json()).then(callback);
  
  const refreshFeed = () => {
    fetch(`${API_BASE}/api/feed`).then(res => res.json()).then(callback);
  };

  socket.on('feed:item_added', refreshFeed);
  socket.on('feed:item_updated', refreshFeed);
  socket.on('feed:cleared', refreshFeed);

  return () => {
    socket.off('feed:item_added', refreshFeed);
    socket.off('feed:item_updated', refreshFeed);
    socket.off('feed:cleared', refreshFeed);
  };
};

export const subscribeToUserProjects = (userId: string, callback: (projects: Record<string, ProjectItem[]>) => void) => {
  const fetchProjects = async () => {
    const res = await fetch(`${API_BASE}/api/users/${userId}/projects`);
    const items: ProjectItem[] = await res.json();
    const projects: Record<string, ProjectItem[]> = {};
    items.forEach(item => {
      if (!projects[item.sectorId]) projects[item.sectorId] = [];
      projects[item.sectorId].push(item);
    });
    callback(projects);
  };

  fetchProjects();
  // We could add socket events for projects too
  return () => {};
};
