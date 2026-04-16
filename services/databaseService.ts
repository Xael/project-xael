
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  deleteDoc
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { UserProfile, HistoryItem, ProjectItem, AppSettings, DesignStyle } from '../types';

const FEED_COL = 'feed';
const USERS_COL = 'users';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const getOrCreateUserProfile = async (firebaseUser: any): Promise<UserProfile> => {
  const userDocRef = doc(db, USERS_COL, firebaseUser.uid);
  try {
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) return userDoc.data() as UserProfile;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, USERS_COL);
  }

  const newUser: UserProfile = {
    id: firebaseUser.uid,
    displayName: firebaseUser.displayName || 'Guest',
    firstName: (firebaseUser.displayName || 'Guest').split(' ')[0],
    email: firebaseUser.email || '',
    avatarUrl: firebaseUser.photoURL || '',
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
      themeColor: '#22c55e',
      designStyle: DesignStyle.MODERN,
      backgroundUrl: ''
    },
    projects: {}
  };

  try {
    await setDoc(userDocRef, newUser);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, USERS_COL);
  }
  return newUser;
};

export const saveUserSettings = async (userId: string, settings: AppSettings) => {
  const userDocRef = doc(db, USERS_COL, userId);
  try {
    await updateDoc(userDocRef, { settings });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, USERS_COL);
  }
};

export const saveUserProject = async (userId: string, sectorId: string, item: ProjectItem) => {
  const projectDocRef = doc(db, USERS_COL, userId, 'projects', item.id);
  try {
    await setDoc(projectDocRef, { ...item, sectorId });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${USERS_COL}/${userId}/projects`);
  }
};

export const deleteUserProject = async (userId: string, sectorId: string, itemId: string) => {
  const projectDocRef = doc(db, USERS_COL, userId, 'projects', itemId);
  try {
    await deleteDoc(projectDocRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${USERS_COL}/${userId}/projects`);
  }
};

export const addToGlobalFeed = async (item: HistoryItem) => {
  const feedDocRef = doc(db, FEED_COL, item.id);
  
  // Populate geometry layer for optimized macro-view
  const geometry = {
    x: item.data.layout?.coordenadas.x || Math.random() * 200 - 100,
    y: item.data.layout?.coordenadas.y || Math.random() * 200 - 100,
    branchId: item.data.layout?.galho_pai || 'Geral',
    color: item.data.layout?.cor || item.data.alquimia?.cor_mood || '#ffffff'
  };

  try {
    await setDoc(feedDocRef, { ...item, geometry, votes: 0 });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, FEED_COL);
  }
};

export const addStrike = async (userId: string): Promise<number> => {
  const userRef = doc(db, USERS_COL, userId);
  try {
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const currentStrikes = userSnap.data().strikes || 0;
      const newStrikes = currentStrikes + 1;
      await updateDoc(userRef, { strikes: newStrikes });
      if (newStrikes >= 3) {
        await updateDoc(userRef, { isBanned: true });
      }
      return newStrikes;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, USERS_COL);
  }
  return 0;
};

export const banUser = async (userId: string): Promise<void> => {
  const userRef = doc(db, USERS_COL, userId);
  try {
    await updateDoc(userRef, { isBanned: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, USERS_COL);
  }
};

export const voteOnHistoryItem = async (itemId: string, delta: number) => {
  const feedDocRef = doc(db, FEED_COL, itemId);
  try {
    const docSnap = await getDoc(feedDocRef);
    if (docSnap.exists()) {
      const currentVotes = docSnap.data().votes || 0;
      await updateDoc(feedDocRef, { votes: currentVotes + delta });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, FEED_COL);
  }
};

export const clearUserFeed = async (userId: string) => {
  try {
    const q = query(collection(db, FEED_COL), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, FEED_COL);
  }
};

export const clearGlobalFeed = async () => {
  try {
    const q = query(collection(db, FEED_COL));
    const snapshot = await getDocs(q);
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, FEED_COL);
  }
};

export const subscribeToGlobalFeed = (callback: (items: HistoryItem[]) => void) => {
  const q = query(collection(db, FEED_COL), orderBy('timestamp', 'desc'), limit(50));
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(doc => doc.data() as HistoryItem);
    callback(items);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, FEED_COL);
  });
};

export const subscribeToUserProjects = (userId: string, callback: (projects: Record<string, ProjectItem[]>) => void) => {
  const q = collection(db, USERS_COL, userId, 'projects');
  return onSnapshot(q, (snapshot) => {
    const projects: Record<string, ProjectItem[]> = {};
    snapshot.docs.forEach(doc => {
      const item = doc.data() as ProjectItem;
      if (!projects[item.sectorId]) projects[item.sectorId] = [];
      projects[item.sectorId].push(item);
    });
    callback(projects);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, `${USERS_COL}/${userId}/projects`);
  });
};
