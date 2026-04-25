import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs, onSnapshot, addDoc, orderBy, limit, Timestamp, serverTimestamp } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

export { signInWithPopup, signInWithRedirect, getRedirectResult };
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

export enum UserRole {
  STUDENT = 'student',
  SUPERVISOR = 'supervisor',
  ADMIN = 'admin',
  UNDETERMINED = 'undetermined'
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: UserRole;
  createdAt: Timestamp;
  lastLogin: Timestamp;
  // Student specific fields
  studentId?: string;
  faculty?: string;
  department?: string;
  academicLevel?: string;
  phoneNumber?: string;
  specialization?: string;
  officeNumber?: string;
  academicYear?: string;
  supervisorUid?: string;
  supervisorName?: string;
  supervisorStatus?: 'pending' | 'approved' | 'rejected';
}

export interface AppNotification {
  id?: string;
  userId: string; // Target user
  fromName: string;
  fromUid: string;
  title: string;
  message: string;
  type: 'supervisor_request' | 'supervisor_approved' | 'supervisor_rejected' | 'analysis_ready' | 'message';
  read: boolean;
  createdAt: Timestamp;
}

export interface AnalysisRecord {
  id?: string;
  studentUid: string;
  studentName: string;
  abstractText: string;
  results: any; // AnalysisResult from gemini.ts
  sdgScores: { goal: number; score: number }[];
  recommendations: string[];
  createdAt: Timestamp;
  status: 'pending' | 'reviewed';
  supervisorComment?: string;
  supervisorUid?: string;
}

export interface LoginLog {
  uid: string;
  email: string;
  timestamp: Timestamp;
  role: UserRole;
}

export interface P2PMessage {
  id?: string;
  chatID: string;
  senderId: string;
  receiverId: string;
  senderName: string;
  content: string;
  read: boolean;
  timestamp: Timestamp;
}

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

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
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

export async function syncUser(user: User): Promise<UserProfile> {
  const path = `users/${user.uid}`;
  try {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    // Auto-detect admin
    const isAdminEmail = user.email === "sadoun-ali@univ-eloued.dz" && user.emailVerified;
    const defaultRole = isAdminEmail ? UserRole.ADMIN : UserRole.UNDETERMINED;

    if (!userSnap.exists()) {
      const newUser: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        role: defaultRole,
        createdAt: Timestamp.now(),
        lastLogin: Timestamp.now()
      };
      await setDoc(userRef, newUser);
      await logLogin(newUser);
      return newUser;
    } else {
      const data = userSnap.data();
      let role = data.role as UserRole;
      
      // If doc exists but no role, or if it's admin email but not admin role yet
      let shouldUpdate = false;
      if (!role) {
        role = defaultRole;
        shouldUpdate = true;
      } else if (isAdminEmail && role !== UserRole.ADMIN) {
        role = UserRole.ADMIN;
        shouldUpdate = true;
      }

      await setDoc(userRef, {
        uid: user.uid,
        email: user.email || '',
        role: role,
        lastLogin: Timestamp.now()
      }, { merge: true });
      
      const updatedProfile = { 
        ...data, 
        uid: user.uid, // ensure uid matches
        role: role,
        lastLogin: Timestamp.now()
      } as UserProfile;
      
      await logLogin(updatedProfile);
      return updatedProfile;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

async function logLogin(profile: UserProfile) {
  const path = 'login_logs';
  try {
    await addDoc(collection(db, path), {
      uid: profile.uid,
      email: profile.email,
      timestamp: Timestamp.now(),
      role: profile.role
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function sendNotification(notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) {
  try {
    await addDoc(collection(db, 'notifications'), {
      ...notification,
      read: false,
      createdAt: Timestamp.now()
    });
  } catch (error) {
    console.error("Failed to send notification:", error);
  }
}

export async function sendP2PMessage(senderId: string, receiverId: string, content: string) {
  try {
    const chatID = [senderId, receiverId].sort().join("_");
    const senderDoc = await getDoc(doc(db, 'users', senderId));
    const senderName = senderDoc.exists() ? senderDoc.data().displayName : "Unknown";

    await addDoc(collection(db, 'p2p_messages'), {
      chatID,
      senderId,
      receiverId,
      senderName,
      content,
      read: false,
      timestamp: Timestamp.now()
    });
  } catch (error) {
    console.error("Failed to send P2P message:", error);
  }
}

export async function markP2PMessagesAsRead(chatID: string, userId: string) {
  try {
    const q = query(
      collection(db, 'p2p_messages'),
      where('chatID', '==', chatID),
      where('receiverId', '==', userId),
      where('read', '==', false)
    );
    const snap = await getDocs(q);
    const promises = snap.docs.map(d => setDoc(d.ref, { read: true }, { merge: true }));
    await Promise.all(promises);
  } catch (error) {
    console.error("Failed to mark messages as read:", error);
  }
}
