import { createClient } from '@supabase/supabase-js';
import supabaseConfig from '../../supabase-config.json';

// Initialize Supabase client
const supabaseUrl = supabaseConfig.supabaseUrl;
const supabaseKey = supabaseConfig.supabaseKey;

export const supabase = createClient(supabaseUrl, supabaseKey);

export enum UserRole {
  STUDENT = 'student',
  SUPERVISOR = 'supervisor',
  ADMIN = 'admin',
  UNDETERMINED = 'undetermined'
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: UserRole;
  createdAt: string;
  lastLogin: string;
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
  createdAt: string;
}

export interface AnalysisRecord {
  id?: string;
  studentUid: string;
  studentName: string;
  abstractText: string;
  results: any;
  sdgScores: { goal: number; score: number }[];
  recommendations: string[];
  createdAt: string;
  status: 'pending' | 'reviewed';
  supervisorComment?: string;
  supervisorUid?: string;
}

export interface LoginLog {
  id?: string;
  uid: string;
  email: string;
  timestamp: string;
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
  timestamp: string;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface SupabaseErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
  }
}

// Get current user
export async function getCurrentUser() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Sign in with Google
export async function signInWithGoogle() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
}

// Sign out
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

// Listen to auth state changes
export function onAuthStateChanged(callback: (user: any) => void) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (_event, session) => {
      const user = session?.user || null;
      callback(user);
    }
  );
  return subscription;
}

export function handleSupabaseError(error: unknown, operationType: OperationType, path: string | null) {
  const currentUser = supabase.auth.getSession();
  const errInfo: SupabaseErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: undefined,
      email: null
    },
    operationType,
    path
  };
  console.error('Supabase Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function syncUser(user: any): Promise<UserProfile> {
  const path = `public.users`;
  try {
    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    // Auto-detect admin
    const isAdminEmail = user.email === "sadoun-ali@univ-eloued.dz";
    const defaultRole = isAdminEmail ? UserRole.ADMIN : UserRole.UNDETERMINED;

    if (!existingUser) {
      // Create new user
      const newUser: UserProfile = {
        id: user.id,
        email: user.email || '',
        displayName: user.user_metadata?.full_name || '',
        photoURL: user.user_metadata?.avatar_url || '',
        role: defaultRole,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };

      const { error: insertError } = await supabase
        .from('users')
        .insert([newUser]);

      if (insertError) throw insertError;

      await logLogin(newUser);
      return newUser;
    } else {
      // Update existing user
      let role = existingUser.role as UserRole;
      let shouldUpdate = false;

      if (!role) {
        role = defaultRole;
        shouldUpdate = true;
      } else if (isAdminEmail && role !== UserRole.ADMIN) {
        role = UserRole.ADMIN;
        shouldUpdate = true;
      }

      const updatedData = {
        role: role,
        lastLogin: new Date().toISOString()
      };

      const { error: updateError } = await supabase
        .from('users')
        .update(updatedData)
        .eq('id', user.id);

      if (updateError) throw updateError;

      const updatedProfile: UserProfile = {
        ...existingUser,
        ...updatedData
      };

      await logLogin(updatedProfile);
      return updatedProfile;
    }
  } catch (error) {
    handleSupabaseError(error, OperationType.WRITE, path);
    throw error;
  }
}

async function logLogin(profile: UserProfile) {
  const path = 'public.login_logs';
  try {
    await supabase
      .from('login_logs')
      .insert([{
        uid: profile.id,
        email: profile.email,
        timestamp: new Date().toISOString(),
        role: profile.role
      }]);
  } catch (error) {
    handleSupabaseError(error, OperationType.CREATE, path);
  }
}

export async function sendNotification(notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) {
  try {
    await supabase
      .from('notifications')
      .insert([{
        ...notification,
        read: false,
        createdAt: new Date().toISOString()
      }]);
  } catch (error) {
    console.error("Failed to send notification:", error);
  }
}

export async function sendP2PMessage(senderId: string, receiverId: string, content: string) {
  try {
    const chatID = [senderId, receiverId].sort().join("_");
    
    const { data: senderDoc } = await supabase
      .from('users')
      .select('displayName')
      .eq('id', senderId)
      .single();

    const senderName = senderDoc?.displayName || "Unknown";

    await supabase
      .from('p2p_messages')
      .insert([{
        chatID,
        senderId,
        receiverId,
        senderName,
        content,
        read: false,
        timestamp: new Date().toISOString()
      }]);
  } catch (error) {
    console.error("Failed to send P2P message:", error);
  }
}

export async function markP2PMessagesAsRead(chatID: string, userId: string) {
  try {
    await supabase
      .from('p2p_messages')
      .update({ read: true })
      .eq('chatID', chatID)
      .eq('receiverId', userId)
      .eq('read', false);
  } catch (error) {
    console.error("Failed to mark messages as read:", error);
  }
}

// Real-time subscriptions
export function subscribeToNotifications(userId: string, callback: (notification: AppNotification) => void) {
  return supabase
    .from(`notifications:userId=eq.${userId}`)
    .on('*', (payload) => {
      callback(payload.new as AppNotification);
    })
    .subscribe();
}

export function subscribeToP2PMessages(chatID: string, callback: (message: P2PMessage) => void) {
  return supabase
    .from(`p2p_messages:chatID=eq.${chatID}`)
    .on('INSERT', (payload) => {
      callback(payload.new as P2PMessage);
    })
    .subscribe();
}
