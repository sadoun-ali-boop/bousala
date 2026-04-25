import { Timestamp } from 'firebase/firestore';
import { AnalysisResult, ChatMessage } from './lib/gemini';
export type { AnalysisResult, ChatMessage };
import { UserRole } from './lib/firebase';
import { UILang } from './lib/translations';

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
  userId: string;
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
  results: AnalysisResult;
  sdgScores: { goal: number; score: number }[];
  recommendations: string[];
  createdAt: Timestamp;
  status: 'pending' | 'reviewed';
  supervisorComment?: string;
  supervisorUid?: string;
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

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  thesisContext?: string;
  messages: ChatMessage[];
  analysis?: AnalysisResult;
  updatedAt: number;
  archived?: boolean;
}
