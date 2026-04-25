import { supabase } from './supabaseClient'
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  FileText, Search, Sparkles, BookOpen, Lightbulb, CheckCircle2, Tag, Loader2, AlertCircle,
  LogOut, User, LayoutDashboard, History, Info, Download, ChevronRight, BarChart3, Users, Home,
  ShieldCheck, GraduationCap, Building2, Globe, ArrowLeft, MessageSquare, Trophy, Settings, Phone, School, Hash,
  Mail, MapPin, ExternalLink, Send, Plus, Trash2, Github, Book, Calendar, CreditCard, Bell, Zap, ShieldAlert, FilePlus, Database, Camera, Printer, UserPlus,
  Menu, X, BellOff, XCircle, UserCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";

import { analyzeAbstract, chatAboutResearch } from "@/src/lib/gemini";
import { generatePDF } from "@/src/lib/pdf";
import { CompassSDG } from "@/src/components/CompassSDG";
import { cn } from "@/lib/utils";
import { 
  supabase, syncUser, handleSupabaseError, OperationType, UserRole, 
  sendNotification, sendP2PMessage, markP2PMessagesAsRead,
  signInWithGoogle, signOut, onAuthStateChanged, getCurrentUser
} from "@/src/lib/supabase";
import { translations, type UILang } from "@/src/lib/translations";

import { 
  UserProfile, AppNotification, P2PMessage, Conversation,
  AnalysisResult, ChatMessage 
} from "@/src/types";
import { ItemsList } from "@/src/ItemsList";
import { VisionDialog } from "@/src/components/dialogs/VisionDialog";
import { ProfileDialog } from "@/src/components/dialogs/ProfileDialog";
import { CommunityChatDialog } from "@/src/components/dialogs/CommunityChatDialog";
import { UploadThesisDialog } from "@/src/components/dialogs/UploadThesisDialog";
import { AnalysisResultsDialog } from "@/src/components/dialogs/AnalysisResultsDialog";
import { MethodologyDialog } from "@/src/components/dialogs/MethodologyDialog";
import { ProgressTrackingDialog } from "@/src/components/dialogs/ProgressTrackingDialog";
import { SupervisorDashboardDialog } from "@/src/components/dialogs/SupervisorDashboardDialog";
import { NotificationsDialog } from "@/src/components/dialogs/NotificationsDialog";
import { P2PChatDialog } from "@/src/components/dialogs/P2PChatDialog";
import { HiddenAdminDashboard } from "@/src/components/dialogs/HiddenAdminDashboard";
import { SupportDialog } from "@/src/components/dialogs/SupportDialog";

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, errorInfo: string }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, errorInfo: "" };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, errorInfo: error.message };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-red-50 text-red-900" dir="rtl">
          <Card className="max-w-md w-full border-red-200">
            <CardHeader>
              <div className="flex items-center gap-3 text-red-600 mb-2">
                <AlertCircle size={24} />
                <CardTitle>حدث خطأ غير متوقع</CardTitle>
              </div>
              <CardDescription className="text-red-700 font-medium">
                واجه النظام مشكلة في الاتصال أو التحميل. يرجى التحقق من اتصالك بالإنترنت.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xs font-mono bg-white p-4 rounded-xl border border-red-100 overflow-auto max-h-40">
                {this.state.errorInfo}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => window.location.reload()} className="w-full bg-red-600 hover:bg-red-700">تحديث الصفحة</Button>
            </CardFooter>
          </Card>
        </div>
      );
    }
    return this.props.children;
  }
}

// Types moved to src/types.ts

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showMethodology, setShowMethodology] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("auto");
  const [uiLang, setUiLang] = useState<UILang>("ar");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showVision, setShowVision] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [showSupervisorChat, setShowSupervisorChat] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [showSupervisorDashboard, setShowSupervisorDashboard] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatPartner, setChatPartner] = useState<UserProfile | null>(null);
  const [showSecretDashboard, setShowSecretDashboard] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [chatFilter, setChatFilter] = useState<"active" | "archived">("active");
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);
  const [authLoading, setAuthLoading] = useState(true);
  const [selectedImages, setSelectedImages] = useState<{data: string, mimeType: string}[]>([]);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [tempAnalysis, setTempAnalysis] = useState<AnalysisResult | null>(null);
  const [analysisInputText, setAnalysisInputText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const t = translations[uiLang];

  const handlePrint = () => {
    window.print();
  };

  const handleMarkNotificationsRead = async () => {
    if (!user) return;
    const unread = notifications.filter(n => !n.read);
    for (const n of unread) {
      if (n.id) {
        await supabase
          .from('notifications')
          .update({ read: true })
          .eq('id', n.id);
      }
    }
  };

  const handleApproveStudent = async (studentUid: string, studentName: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('users')
        .update({ supervisorStatus: 'approved' })
        .eq('id', studentUid);
      
      if (error) throw error;
      
      await sendNotification({
        userId: studentUid,
        fromUid: user.id,
        fromName: user.displayName,
        title: t.approvedTitle,
        message: t.approvedMsg.replace("{name}", user.displayName),
        type: 'supervisor_approved'
      });
      
      setToast({ message: t.supervisorAssigned, type: "success" });
    } catch (e) {
      console.error(e);
    }
  };

  const handleRejectStudent = async (studentUid: string, studentName: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('users')
        .update({
          supervisorUid: "",
          supervisorName: "",
          supervisorStatus: 'rejected'
        })
        .eq('id', studentUid);

      if (error) throw error;

      await sendNotification({
        userId: studentUid,
        fromUid: user.id,
        fromName: user.displayName,
        title: t.rejectedTitle,
        message: t.rejectedMsg.replace("{name}", user.displayName),
        type: 'supervisor_rejected'
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenSupervisorChat = async () => {
    if (!user?.supervisorUid) return;
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.supervisorUid)
        .single();
      
      if (error) throw error;
      if (data) {
        setChatPartner(data as UserProfile);
        setShowChat(true);
      }
    } catch (e) {
      console.error("Error fetching supervisor", e);
    }
  };

  const activeConversation = conversations.find(c => c.id === activeId);
  const currentAnalysis = tempAnalysis || activeConversation?.analysis;

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Auth Listener
  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        if (user && isMounted) {
          const profile = await syncUser(user);
          setUser(profile);
        } else if (isMounted) {
          setUser(null);
          setConversations([]);
          setActiveId(null);
        }
      } catch (e) {
        console.error("Auth sync error", e);
      } finally {
        if (isMounted) setAuthLoading(false);
      }
    };

    checkAuth();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user && isMounted) {
          const profile = await syncUser(session.user);
          setUser(profile);
        } else if (!session && isMounted) {
          setUser(null);
          setConversations([]);
          setActiveId(null);
        }
      }
    );

    const timer = setTimeout(() => {
      if (isMounted) setAuthLoading(false);
    }, 5000);

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  // Real-time Supabase Sync
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .from('conversations')
      .on('*', payload => {
        if (payload.new.userId === user.id) {
          supabase
            .from('conversations')
            .select('*')
            .eq('userId', user.id)
            .order('updatedAt', { ascending: false })
            .then(({ data, error }) => {
              if (error) throw error;
              setConversations((data as Conversation[]) || []);
              if ((data as Conversation[]).length > 0 && !activeId) {
                setActiveId((data as Conversation[])[0].id);
              }
            });
        }
      })
      .subscribe();

    // Initial load
    supabase
      .from('conversations')
      .select('*')
      .eq('userId', user.id)
      .order('updatedAt', { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error('Error loading conversations:', error);
        if (data) {
          setConversations((data as Conversation[]) || []);
          if ((data as Conversation[]).length > 0 && !activeId) {
            setActiveId((data as Conversation[])[0].id);
          }
        }
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  // Notifications Sync
  useEffect(() => {
    if (!user) return;
    
    supabase
      .from('notifications')
      .select('*')
      .eq('userId', user.id)
      .order('createdAt', { ascending: false })
      .limit(20)
      .then(({ data, error }) => {
        if (error) console.error('Error loading notifications:', error);
        if (data) setNotifications((data as AppNotification[]) || []);
      });

    const subscription = supabase
      .from('notifications')
      .on('INSERT', payload => {
        if (payload.new.userId === user.id) {
          setNotifications(prev => [payload.new as AppNotification, ...prev]);
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  // Unread Chat Messages Sync
  useEffect(() => {
    if (!user) return;
    
    supabase
      .from('p2p_messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiverId', user.id)
      .eq('read', false)
      .then(({ count, error }) => {
        if (error) console.error('Error counting unread messages:', error);
        if (count !== null) setUnreadChatCount(count);
      });

    const subscription = supabase
      .from('p2p_messages')
      .on('INSERT', payload => {
        if (payload.new.receiverId === user.id && !payload.new.read) {
          setUnreadChatCount(prev => prev + 1);
        }
      })
      .on('UPDATE', payload => {
        if (payload.new.receiverId === user.id && payload.old.read === false && payload.new.read === true) {
          setUnreadChatCount(prev => Math.max(0, prev - 1));
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  // Mark messages as read when chat partner is set and chat is shown
  useEffect(() => {
    if (showChat && chatPartner && user) {
      const chatId = [user.id, chatPartner.id].sort().join('_');
      markP2PMessagesAsRead(chatId, user.id).then(() => {
        // Optimistically clear local count if it matches the current partner
      });
    }
  }, [showChat, chatPartner, user]);

  const handleLogin = async () => {
    setLoginError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error("Login Error:", err);
      setLoginError(uiLang === "ar" 
        ? `فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.` 
        : `Login failed. Please try again.`);
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  const handleAddAccount = async () => {
    await signOut();
    handleLogin();
  };

  const handleSwitchRole = async () => {
    if (!user) return;
    const path = `users/${user.id}`;
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: UserRole.UNDETERMINED })
        .eq('id', user.id);
      
      if (error) throw error;
      
      const updatedUser = { ...user, role: UserRole.UNDETERMINED };
      setUser(updatedUser);
      setToast({ message: uiLang === "ar" ? "يرجى اختيار الدور الجديد" : "Please select your new role", type: "success" });
    } catch (error) {
      handleSupabaseError(error, OperationType.UPDATE, path);
    }
  };

  const createNewConversation = async () => {
    if (!user) return;
    setIsLoading(true);
    const path = "conversations";
    try {
      const newConv = {
        userId: user.id,
        title: t.newSearch,
        messages: [],
        updatedAt: new Date().toISOString()
      };
      const { data, error } = await supabase
        .from('conversations')
        .insert([newConv])
        .select('id')
        .single();
      
      if (error) throw error;
      if (data) setActiveId(data.id);
      setToast({ message: t.newAnalysisStarted, type: "success" });
    } catch (error) {
      handleSupabaseError(error, OperationType.CREATE, path);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRenameConversation = async (id: string, newTitle: string) => {
    if (!user || !newTitle.trim()) return;
    const path = `conversations/${id}`;
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ title: newTitle.trim(), updatedAt: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
      setToast({ message: uiLang === "ar" ? "تم إعادة التسمية بنجاح" : "Renamed successfully", type: "success" });
    } catch (error) {
      handleSupabaseError(error, OperationType.UPDATE, path);
    }
  };

  const handleArchiveConversation = async (id: string) => {
    if (!user) return;
    const path = `conversations/${id}`;
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ archived: true, updatedAt: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
      if (activeId === id) setActiveId(null);
      setToast({ message: uiLang === "ar" ? "تمت الأرشفة" : "Conversation archived", type: "success" });
    } catch (error) {
      handleSupabaseError(error, OperationType.UPDATE, path);
    }
  };

  const handleUnarchiveConversation = async (id: string) => {
    if (!user) return;
    const path = `conversations/${id}`;
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ archived: false, updatedAt: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
      setToast({ message: uiLang === "ar" ? "تم إلغاء الأرشفة" : "Conversation unarchived", type: "success" });
    } catch (error) {
      handleSupabaseError(error, OperationType.UPDATE, path);
    }
  };

  const deleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(uiLang === "ar" ? t.deleteConfirm : t.deleteConfirm)) return;
    const path = `conversations/${id}`;
    try {
      await deleteDoc(doc(db, "conversations", id));
      if (activeId === id) setActiveId(null);
      setToast({ message: uiLang === "ar" ? "تم الحذف نهائياً" : "Deleted permanently", type: "success" });
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const handleSmartRecs = () => {
    if (isLoading) return;
    if (!activeId) {
      setToast({ 
        message: uiLang === "ar" ? "يرجى رفع ملخص البحث أولاً للحصول على توصيات دقيقة" : "Please upload your research abstract first for accurate recommendations", 
        type: "error" 
      });
      setShowUpload(true);
      return;
    }
    const prompt = uiLang === "ar" ? "أعطني توصيات ذكية لتحسين بحثي لخدمة المجتمع بناءً على ملخصي وأهداف التنمية المستدامة." : "Give me smart recommendations to improve my research to serve the community and SDGs based on my abstract.";
    handleSendMessage(prompt);
  };

  const handleDownloadTemplate = (lang: string) => {
    const templateText = translations[lang as UILang]?.templateContent || t.templateContent;
    const blob = new Blob([templateText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `thesis_template_${lang}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setToast({ message: t.downloadTemplate + " (" + lang.toUpperCase() + ")", type: "success" });
  };

  const handleSendMessage = async (overrideInput?: string) => {
    const messageText = overrideInput || input;
    if (!messageText.trim() || !activeId || isLoading || !user) return;

    const currentInput = messageText;
    if (!overrideInput) setInput("");
    setIsLoading(true);

    const updatedMessages: ChatMessage[] = [
      ...(activeConversation?.messages || []),
      { role: "user", parts: [{ text: currentInput }] }
    ];

    const path = `conversations/${activeId}`;
    try {
      // Optimistic title update
      const newTitle = activeConversation?.messages.length === 0 ? currentInput.substring(0, 30) + "..." : activeConversation?.title;
      
      const { error: updateError1 } = await supabase
        .from('conversations')
        .update({
          messages: updatedMessages,
          title: newTitle,
          updatedAt: new Date().toISOString()
        })
        .eq('id', activeId);

      if (updateError1) throw updateError1;

      const responseText = await chatAboutResearch(
        currentInput, 
        activeConversation?.messages || [],
        activeConversation?.thesisContext,
        selectedLanguage
      );

      const finalMessages: ChatMessage[] = [
        ...updatedMessages,
        { role: "model", parts: [{ text: responseText }] }
      ];

      const { error: updateError2 } = await supabase
        .from('conversations')
        .update({
          messages: finalMessages,
          updatedAt: new Date().toISOString()
        })
        .eq('id', activeId);

      if (updateError2) throw updateError2;

    } catch (err) {
      handleSupabaseError(err, OperationType.UPDATE, path);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeepAnalysis = async () => {
    if (!activeConversation || isLoading) return;
    setAnalysisInputText("");
    setShowUpload(true);
  };

  const handleTextAnalysis = async () => {
    if (!analysisInputText.trim() || isLoading) return;
    await startAnalysis(analysisInputText);
  };

  const startAnalysis = async (customText?: string) => {
    if (isLoading || !user) return;
    
    const latestUserMsg = activeConversation?.messages ? [...activeConversation.messages].reverse().find(m => m.role === "user") : null;
    const textToAnalyze = customText || latestUserMsg?.parts[0].text;
    
    if (!textToAnalyze && selectedImages.length === 0) {
      setToast({ message: uiLang === "ar" ? "يرجى إضافة نص أو صور للتحليل" : "Please add text or images to analyze", type: "error" });
      return;
    }

    setIsLoading(true);
    try {
      let currentActiveId = activeId;
      
      if (!currentActiveId) {
        const newConv = {
          userId: user.uid,
          title: uiLang === "ar" ? "تحليل جديد" : "New Analysis",
          messages: [],
          updatedAt: Date.now()
        };
        const docRef = await addDoc(collection(db, "conversations"), newConv);
        currentActiveId = docRef.id;
        setActiveId(currentActiveId);
      }

      const path = `conversations/${currentActiveId}`;
      const promptText = textToAnalyze || (uiLang === "ar" ? "قم بتحليل هذه الصور لمذكرتي بناءً على مصفوفة ASAM وأهداف التنمية المستدامة." : "Analyze these thesis images based on the ASAM matrix and SDGs.");
      
      const result = await analyzeAbstract(
        promptText, 
        selectedLanguage,
        selectedImages.length > 0 ? selectedImages : undefined
      );
      
      await setDoc(doc(db, "conversations", currentActiveId), {
        analysis: result,
        updatedAt: Date.now()
      }, { merge: true });
      
      setTempAnalysis(result);
      setShowAnalysis(true);
      setShowUpload(false);
      setSelectedImages([]);
      setAnalysisInputText("");
    } catch (err) {
      console.error("Analysis Error:", err);
      if (err instanceof Error && err.message.includes("quota")) {
        setToast({ message: uiLang === "ar" ? "تجاوز الحصة المجانية، يرجى المحاولة لاحقاً" : "Quota exceeded, please try again later", type: "error" });
      } else {
        setToast({ message: uiLang === "ar" ? "فشل التحليل، يرجى التحقق من جودة الصور" : "Analysis failed, please check image quality", type: "error" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const adminDashboard = (
    <HiddenAdminDashboard 
      isOpen={showSecretDashboard} 
      onOpenChange={setShowSecretDashboard} 
      uiLang={uiLang} 
    />
  );

  const getSteps = () => {
    const latestAnalysis = conversations.find(c => c.analysis)?.analysis;
    const isProfileComplete = !!(user?.faculty && user?.department && (user?.studentId || user?.officeNumber));
    
    return [
      { title: t.stepUpload, status: isProfileComplete ? "completed" : "current", date: "2024-04-15" },
      { title: t.stepInitial, status: latestAnalysis ? "completed" : (isProfileComplete ? "current" : "pending"), date: latestAnalysis ? "2024-04-16" : null },
      { title: t.stepSdg, status: latestAnalysis ? "completed" : "pending", date: latestAnalysis ? "2024-04-16" : null },
      { title: t.stepSupervisor, status: "pending", date: null },
      { title: t.stepFinal, status: "pending", date: null }
    ];
  };

  const SidebarContent = ({ closeMenu }: { closeMenu?: () => void }) => {
    if (!user) return null;
    return (
      <>
        <div className="p-6 border-b flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setActiveId(null); closeMenu?.(); }}>
            <div>
              <CompassSDG className="w-10 h-10" />
            </div>
            <h1 className="text-xl font-black text-[#004d33]">{t.appName}</h1>
          </div>
          <div className="flex items-center gap-1">
             <Button variant="ghost" size="icon" onClick={() => { createNewConversation(); closeMenu?.(); }} className="rounded-xl border hover:bg-green-50">
               <Plus size={20} />
             </Button>
             {closeMenu && (
               <Button variant="ghost" size="icon" onClick={closeMenu} className="md:hidden rounded-xl">
                 <X size={20} />
               </Button>
             )}
          </div>
        </div>
        
        <div className="px-4 py-2 border-b">
           <div className="flex bg-gray-50 p-1 rounded-xl gap-1">
              <button 
                onClick={() => setChatFilter("active")}
                className={cn(
                  "flex-1 py-1.5 text-[10px] font-black rounded-lg transition-all",
                  chatFilter === "active" ? "bg-white text-[#004d33] shadow-sm shadow-gray-200" : "text-gray-400"
                )}
              >
                {t.activeChats}
              </button>
              <button 
                onClick={() => setChatFilter("archived")}
                className={cn(
                  "flex-1 py-1.5 text-[10px] font-black rounded-lg transition-all",
                  chatFilter === "archived" ? "bg-white text-[#004d33] shadow-sm shadow-gray-200" : "text-gray-400"
                )}
              >
                {t.archivedChats}
              </button>
           </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-2">
            {conversations.filter(c => chatFilter === "active" ? !c.archived : c.archived).map(conv => (
              <div key={conv.id} className="group relative">
                <button
                  onClick={() => { setActiveId(conv.id); closeMenu?.(); }}
                  className={cn(
                    "w-full text-right p-4 rounded-2xl flex items-center justify-between transition-all",
                    activeId === conv.id ? "bg-green-50 text-[#004d33] ring-1 ring-green-100" : "hover:bg-gray-50"
                  )}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <MessageSquare size={16} className={activeId === conv.id ? "text-[#004d33]" : "text-gray-400"} />
                    <span className="truncate text-sm font-medium pr-1">{conv.title}</span>
                  </div>
                </button>
                
                <div className={cn(
                  "absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-2",
                   uiLang === "ar" ? "flex-row-reverse" : "flex-row"
                )}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-lg hover:bg-white hover:text-blue-600 shadow-sm border border-gray-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      const nTitle = prompt(t.renameTitle, conv.title);
                      if (nTitle) handleRenameConversation(conv.id, nTitle);
                    }}
                  >
                    <Book size={12} />
                  </Button>
                  {chatFilter === "active" ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-lg hover:bg-white hover:text-orange-600 shadow-sm border border-gray-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleArchiveConversation(conv.id);
                      }}
                    >
                      <History size={12} />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-lg hover:bg-white hover:text-green-600 shadow-sm border border-gray-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnarchiveConversation(conv.id);
                      }}
                    >
                      <Zap size={12} />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-lg hover:bg-white hover:text-red-600 shadow-sm border border-gray-100"
                    onClick={(e) => deleteConversation(conv.id, e)}
                  >
                    <Trash2 size={12} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50/50">
          <div className="flex items-center gap-3 mb-4 cursor-pointer hover:bg-white/50 p-2 rounded-2xl transition-all" onClick={() => { setShowProfile(true); closeMenu?.(); }}>
            <Avatar className="w-10 h-10 ring-2 ring-white">
              <AvatarImage src={user.photoURL} />
              <AvatarFallback className="bg-green-100 text-[#004d33] font-bold">ب</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-bold">{user.displayName}</span>
              <span className="text-[10px] text-gray-400 capitalize flex items-center gap-1">
                {user.role}
                <Settings size={10} />
              </span>
            </div>
          </div>
          <div className="text-[10px] text-gray-400 leading-relaxed mb-4">
            {t.appSubtitle}.
          </div>
          
          <div className="grid grid-cols-2 gap-2 mb-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => { handleAddAccount(); closeMenu?.(); }}
              className="rounded-xl border-gray-100 text-gray-500 hover:text-[#004d33] hover:bg-green-50 flex gap-2 h-10 px-3"
            >
              <UserPlus size={14} />
              <span className="text-[10px] truncate">{t.addAccount}</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => { handleSwitchRole(); closeMenu?.(); }}
              className="rounded-xl border-gray-100 text-gray-500 hover:text-[#004d33] hover:bg-green-50 flex gap-2 h-10 px-3"
            >
              <Users size={14} />
              <span className="text-[10px] truncate">{t.switchRole}</span>
            </Button>
          </div>


          {(user.role === UserRole.SUPERVISOR || user.role === UserRole.ADMIN) && (
            <Button 
              variant="outline" 
              onClick={() => { setShowSupervisorDashboard(true); closeMenu?.(); }}
              className="w-full mb-3 rounded-xl border-blue-100 text-blue-700 font-bold py-5 flex gap-2 hover:bg-blue-50 shadow-sm"
            >
              <Users size={18} />
              {t.supervisedStudents}
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={() => { setShowSupervisorChat(true); closeMenu?.(); }}
            className="w-full mb-3 rounded-xl border-indigo-100 text-indigo-700 font-bold py-5 flex gap-2 hover:bg-indigo-50 shadow-sm"
          >
            <MessageSquare size={18} />
            {t.chatWithSupervisor}
          </Button>

          <Button 
            variant="ghost" 
            className="w-full justify-start text-gray-500 hover:bg-green-50 hover:text-[#004d33] mb-1 font-bold" 
            onClick={() => { setActiveId(null); closeMenu?.(); }}
          >
             <Home size={16} className={uiLang === "ar" ? "ml-2" : "mr-2"} />
             {t.home}
          </Button>

          <Button variant="ghost" className="w-full justify-start text-red-500 hover:bg-red-50 hover:text-red-600" onClick={handleLogout}>
             <LogOut size={16} className={uiLang === "ar" ? "ml-2" : "mr-2"} />
             {t.logout}
          </Button>
        </div>
      </>
    );
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white space-y-4" dir={uiLang === "ar" ? "rtl" : "ltr"}>
        <CompassSDG className="w-16 h-16 text-[#004d33] animate-pulse" />
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 text-[#004d33] animate-spin" />
          <p className="text-sm font-bold text-[#004d33]">{t.initializing}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 relative overflow-y-auto" dir={uiLang === "ar" ? "rtl" : "ltr"}>
        <div className="absolute top-6 left-6 flex gap-2">
           <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setUiLang(uiLang === "ar" ? "en" : "ar")}
            className="rounded-xl font-bold bg-white/50 backdrop-blur"
           >
            {uiLang === "ar" ? "English" : "العربية"}
           </Button>
        </div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center space-y-8"
        >
          <div className="flex justify-center">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-4 bg-green-50 rounded-[2rem]" 
            >
              <CompassSDG className="w-40 h-40" />
            </motion.div>
          </div>
          <div className="space-y-2">
            <h1 className="text-5xl font-black text-[#004d33] tracking-tight">{t.appName}</h1>
            <p className="text-lg text-gray-500 font-medium">{t.appSubtitle}</p>
          </div>
          
          <Card className="border-none shadow-2xl shadow-green-900/10 bg-white p-2 rounded-[2.5rem]">
            <CardHeader>
              <CardTitle className="text-2xl">{t.loginTitle}</CardTitle>
              <CardDescription className="font-medium">{t.loginDesc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loginError && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold"
                >
                  <AlertCircle size={18} />
                  {loginError}
                </motion.div>
              )}
              <Button 
                onClick={handleLogin}
                className="w-full py-8 text-xl rounded-3xl bg-white text-gray-700 border-2 border-gray-100 hover:bg-gray-50 hover:border-[#004d33]/20 transition-all flex items-center justify-center gap-4 shadow-sm font-black"
              >
                <img src="https://www.google.com/favicon.ico" className="w-6 h-6" alt="Google" />
                {t.loginGoogle}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
        {adminDashboard}
      </div>
    );
  }

  if (user && (!user.role || user.role === UserRole.UNDETERMINED)) {
    return (
      <div className="flex flex-col h-screen">
        <RoleSelectionScreen 
          user={user} 
          setUser={setUser} 
          t={t} 
          uiLang={uiLang} 
          setUiLang={setUiLang}
        />
        {adminDashboard}
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-report, #printable-report * {
            visibility: visible !important;
          }
          #printable-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            margin: 0 !important;
            padding: 20px !important;
            visibility: visible !important;
          }
          .no-print {
            display: none !important;
          }
          .fixed, .absolute {
             position: relative !important;
             overflow: visible !important;
          }
        }
      `}</style>
      <div className="flex h-screen bg-[#FDFCFB] text-[#1A1A1A] font-sans selection:bg-green-100" dir={uiLang === "ar" ? "rtl" : "ltr"}>
      {/* Sidebar - History */}
      <aside className={cn(
        "w-80 bg-white flex flex-col hidden md:flex",
        uiLang === "ar" ? "border-l" : "border-r"
      )}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {showMobileMenu && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileMenu(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] md:hidden"
            />
            <motion.div
              initial={{ x: uiLang === "ar" ? "100%" : "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: uiLang === "ar" ? "100%" : "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={cn(
                "fixed inset-y-0 w-80 bg-white z-[70] md:hidden shadow-2xl flex flex-col",
                uiLang === "ar" ? "right-0" : "left-0"
              )}
            >
              <SidebarContent closeMenu={() => setShowMobileMenu(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative bg-white/50">
        {/* Header */}
        <header className="h-16 border-b bg-white/80 backdrop-blur-md flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-4">
            <Button 
               variant="ghost" 
               size="icon" 
               className="md:hidden rounded-xl text-[#004d33]" 
               onClick={() => setShowMobileMenu(true)}
            >
               <Menu size={22} />
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-xl text-[#004d33]"
                onClick={() => {
                  setShowNotifications(true);
                  handleMarkNotificationsRead();
                }}
              >
                <Bell size={22} />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-xl text-[#004d33]"
                onClick={() => {
                  if (user?.role === UserRole.STUDENT && user?.supervisorUid && user?.supervisorStatus === 'approved') {
                    handleOpenSupervisorChat();
                  } else {
                    setShowSupervisorChat(true);
                  }
                }}
              >
                <MessageSquare size={22} />
                {unreadChatCount > 0 && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full" />
                )}
              </Button>
              {(user?.role === UserRole.SUPERVISOR || user?.role === UserRole.ADMIN) && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-xl text-blue-600"
                  onClick={() => setShowSupervisorDashboard(true)}
                >
                  <Users size={22} />
                </Button>
              )}
              <div className="hidden sm:flex cursor-pointer" onClick={() => setActiveId(null)}>
                <CompassSDG className="w-8 h-8" />
              </div>
            </div>
            <div className="flex flex-col">
               <h2 className="text-sm font-bold">{activeConversation?.title || t.newSearch}</h2>
               {activeConversation?.analysis && (
                 <div className="flex items-center gap-1 text-[10px] text-green-600 font-bold">
                   <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                   {t.sdgAnalysisAvailable}
                 </div>
               )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setUiLang(uiLang === "ar" ? "en" : "ar")}
              className="rounded-xl gap-2 font-bold px-4"
            >
              <Globe size={16} />
              {uiLang === "ar" ? "English" : "العربية"}
            </Button>
            {activeConversation?.analysis && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowAnalysis(true)} 
                className="rounded-xl gap-2 border-green-200 text-green-700 bg-green-50 hover:bg-green-100"
              >
                <BarChart3 size={16} />
                {t.showResults}
              </Button>
            )}
            <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => setShowProfile(true)}>
              <Settings size={18} className="text-gray-400" />
            </Button>
          </div>
        </header>

        {/* Action Modals */}
        <SupportDialog isOpen={showSupport} onOpenChange={setShowSupport} t={t} uiLang={uiLang} />
        <VisionDialog isOpen={showVision} onOpenChange={setShowVision} t={t} uiLang={uiLang} />
        <CommunityChatDialog 
          isOpen={showSupervisorChat} 
          onOpenChange={setShowSupervisorChat} 
          t={t} 
          user={user} 
          uiLang={uiLang} 
          onChat={(u) => {
            setChatPartner(u);
            setShowChat(true);
            setShowSupervisorChat(false);
          }}
        />
        <UploadThesisDialog 
          isOpen={showUpload} 
          onOpenChange={setShowUpload} 
          t={t} 
          uiLang={uiLang} 
          onUpload={() => startAnalysis()}
          selectedImages={selectedImages}
          setSelectedImages={setSelectedImages}
          isLoading={isLoading}
          inputText={analysisInputText}
          setInputText={setAnalysisInputText}
          onTextAnalysis={handleTextAnalysis}
        />


        <SupervisorDashboardDialog 
          isOpen={showSupervisorDashboard} 
          onOpenChange={setShowSupervisorDashboard} 
          t={t} 
          uiLang={uiLang} 
          user={user}
          onApprove={handleApproveStudent}
          onReject={handleRejectStudent}
          onChat={(student) => {
            setChatPartner(student);
            setShowChat(true);
          }}
          setToast={setToast}
        />

        <NotificationsDialog
          isOpen={showNotifications}
          onOpenChange={setShowNotifications}
          t={t}
          uiLang={uiLang}
          notifications={notifications}
        />

        <P2PChatDialog
          isOpen={showChat}
          onOpenChange={setShowChat}
          uiLang={uiLang}
          currentUser={user}
          partner={chatPartner}
          setToast={setToast}
        />

        <MethodologyDialog
          isOpen={showMethodology}
          onOpenChange={setShowMethodology}
          t={t}
          uiLang={uiLang}
          analysis={activeConversation?.analysis}
        />

        {/* Toast Notifier */}
        <AnimatePresence>
          {toast && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={cn(
                "fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-bold text-white",
                toast.type === "success" ? "bg-green-600" : "bg-red-600"
              )}
            >
              <div className="bg-white/20 p-1 rounded-full">
                {toast.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              </div>
              {toast.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Profile Dialog */}
        <ProfileDialog 
          isOpen={showProfile} 
          onOpenChange={setShowProfile} 
          user={user} 
          onUpdate={setUser} 
          t={t} 
          uiLang={uiLang} 
          setToast={setToast}
        />

        <AnalysisResultsDialog
          isOpen={showAnalysis}
          onOpenChange={(open) => {
            setShowAnalysis(open);
            if (!open) setTempAnalysis(null);
          }}
          t={t}
          uiLang={uiLang}
          user={user}
          currentAnalysis={currentAnalysis}
          handlePrint={handlePrint}
          generatePDF={generatePDF}
          setShowMethodology={setShowMethodology}
        />

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth" ref={scrollRef}>
          <div className="max-w-3xl mx-auto space-y-6 pb-12">
            {!activeConversation?.messages.length && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-12 text-center space-y-8"
              >
                <div className="flex justify-center">
                  <div className="relative">
                    <CompassSDG className="w-32 h-32" />
                    <motion.div 
                      animate={{ scale: [1, 1.1, 1] }} 
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -top-2 -right-2 bg-green-500 text-white p-2 rounded-full shadow-lg"
                    >
                      <Sparkles size={16} />
                    </motion.div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-black text-[#004d33]">{t.welcomeTitle}</h3>
                  <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
                    {t.welcomeDesc}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
                  <SuggestionCard 
                    title={t.analyzeAbstract} 
                    desc={t.analyzeAbstractDesc} 
                    icon={<FileText className="text-blue-500" />}
                    onClick={() => setShowUpload(true)}
                    featured={true}
                    featuredLabel={t.featured}
                  />
                  <SuggestionCard 
                    title={t.smartRecs} 
                    desc={t.smartRecsDesc} 
                    icon={<Lightbulb className="text-yellow-500" />}
                    onClick={handleSmartRecs}
                  />
                  <SuggestionCard 
                    title={t.chatWithSupervisor} 
                    desc={t.roleSupervisorDesc} 
                    icon={<Users className="text-purple-500" />}
                    onClick={() => setShowSupervisorChat(true)}
                  />
                  <SuggestionCard 
                    title={t.academicSupportLink} 
                    desc={t.academicSupportContent} 
                    icon={<GraduationCap className="text-green-500" />}
                    onClick={() => setShowSupport(true)}
                  />
                </div>
              </motion.div>
            )}

            <AnimatePresence>
              {activeConversation?.messages.map((msg, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-4 p-4 rounded-3xl",
                    msg.role === "user" ? "bg-white border self-end" : "bg-green-50/50"
                  )}
                >
                  <div className="mt-1">
                    {msg.role === "user" ? (
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                        <User size={16} />
                      </div>
                    ) : (
                      <CompassSDG className="w-8 h-8" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="text-xs font-bold text-gray-400 capitalize">
                      {msg.role === "user" ? t.you : t.bousla}
                    </div>
                    <div className="prose prose-sm font-medium leading-relaxed whitespace-pre-wrap">
                      {msg.parts[0].text}
                    </div>
                    {msg.role === "model" && msg.parts[0].text.length > 50 && (
                      <div className="pt-2 flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={cn(
                            "h-8 rounded-xl gap-2 text-gray-500 hover:text-[#004d33] hover:bg-white",
                            uiLang === "ar" ? "flex-row" : "flex-row-reverse"
                          )}
                          onClick={() => setInput(`${uiLang === "ar" ? "اشرح لي أكثر عن" : "Explain more about"}: "${msg.parts[0].text.substring(0, 30)}..."`)}
                        >
                          <BookOpen size={14} />
                          {t.explainMore}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={cn(
                            "h-8 rounded-xl gap-2 text-gray-500 hover:text-blue-600 hover:bg-white",
                            uiLang === "ar" ? "flex-row" : "flex-row-reverse"
                          )}
                        >
                          <Search size={14} />
                          {t.academicSearch}
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 p-4">
                <CompassSDG className="w-8 h-8 animate-spin opacity-50" />
                <div className="text-sm font-medium text-gray-400 animate-pulse">{t.processing}</div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="p-4 border-t bg-white/80 backdrop-blur-md">
          <div className="max-w-3xl mx-auto space-y-4">
            <AnimatePresence>
              {!activeConversation?.analysis && activeConversation && activeConversation.messages.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-gradient-to-r from-emerald-600 to-[#004d33] p-4 rounded-3xl text-white flex items-center justify-between shadow-lg shadow-green-900/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-2xl">
                      <Sparkles size={20} className="text-yellow-300" />
                    </div>
                    <div>
                      <div className="text-sm font-bold">{t.analysisPrompt}</div>
                      <div className="text-[10px] text-green-100">{t.analysisPromptSub}</div>
                    </div>
                  </div>
                  <Button 
                    onClick={handleDeepAnalysis} 
                    disabled={isLoading}
                    className="bg-white text-[#004d33] hover:bg-green-50 rounded-2xl font-bold px-6 shadow-xl"
                  >
                    {t.startFullAnalysis}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative group">
              <div className="absolute right-4 -top-8 flex gap-2">
                {[
                  { id: "auto", label: t.auto, icon: <Search size={10} /> },
                  { id: "ar", label: t.arabic, icon: "AR" },
                  { id: "en", label: t.english, icon: "EN" },
                  { id: "fr", label: t.french, icon: "FR" }
                ].map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => setSelectedLanguage(lang.id)}
                    className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold transition-all flex items-center gap-1.5",
                      selectedLanguage === lang.id 
                        ? "bg-[#004d33] text-white shadow-md shadow-green-900/20" 
                        : "bg-white text-gray-400 hover:bg-gray-100 border text-gray-500"
                    )}
                  >
                    {typeof lang.icon === "string" ? <span className="text-[8px]">{lang.icon}</span> : lang.icon}
                    {lang.label}
                  </button>
                ))}
              </div>
              <Textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={t.chatPlaceholder}
                className={cn(
                  "min-h-[60px] max-h-[200px] w-full bg-gray-50 border-none rounded-[2rem] p-4 resize-none focus-visible:ring-2 focus-visible:ring-green-100 transition-all font-medium",
                  uiLang === "ar" ? "pr-14" : "pl-14"
                )}
              />
              <Button 
                onClick={() => handleSendMessage()}
                disabled={!input.trim() || isLoading}
                className={cn(
                  "absolute bottom-3 w-10 h-10 rounded-full bg-[#004d33] hover:bg-green-700 shadow-md transition-all flex items-center justify-center p-0",
                  uiLang === "ar" ? "left-3" : "right-3"
                )}
              >
                <Send size={18} className={uiLang === "ar" ? "translate-x-0.5" : "-translate-x-0.5"} />
              </Button>
            </div>
            <div className="flex justify-center flex-wrap gap-4 mt-2">
              <button 
                onClick={() => setShowSupport(true)}
                className="flex items-center gap-1.5 text-[10px] text-gray-400 hover:text-green-600 transition-colors font-bold uppercase tracking-wider"
              >
                <GraduationCap size={12} className="text-green-600" />
                {t.academicSupport}
              </button>
              <button 
                onClick={() => setShowVision(true)}
                className="flex items-center gap-1.5 text-[10px] text-gray-400 hover:text-blue-500 transition-colors font-bold uppercase tracking-wider"
              >
                <Globe size={12} className="text-blue-500" />
                {t.globalVision}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  </ErrorBoundary>
  );
}

function SuggestionCard({ title, desc, icon, onClick, featured, featuredLabel }: { title: string; desc: string; icon: any; onClick: () => void; featured?: boolean; featuredLabel?: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "p-6 border rounded-[2rem] text-right space-y-3 transition-all group relative overflow-hidden",
        featured 
          ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-xl shadow-green-900/5 hover:border-green-400 hover:scale-[1.02]" 
          : "bg-white border-gray-100 hover:border-[#004d33]/20 hover:shadow-xl hover:shadow-green-900/5"
      )}
    >
      {featured && featuredLabel && (
        <div className="absolute top-0 left-0">
          <div className="bg-[#004d33] text-white text-[8px] font-black px-3 py-1 rounded-br-2xl shadow-lg uppercase tracking-widest animate-pulse">
            {featuredLabel}
          </div>
        </div>
      )}
      <div className={cn(
        "p-3 rounded-2xl w-fit group-hover:rotate-12 transition-transform duration-500",
        featured ? "bg-white shadow-md ring-4 ring-green-100" : "bg-gray-50"
      )}>{icon}</div>
      <h4 className={cn("font-bold text-sm", featured ? "text-green-900" : "text-gray-900")}>{title}</h4>
      <p className={cn("text-xs font-medium leading-relaxed", featured ? "text-green-700/80" : "text-gray-400")}>{desc}</p>
    </button>
  );
}

function NavBtn({ icon, label, active, onClick }: { icon: any; label: string; active: boolean; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col md:flex-row items-center gap-1 md:gap-2 px-3 py-2 rounded-xl transition-all",
        active ? "text-[#004d33] bg-green-50 font-bold" : "text-gray-400 hover:bg-gray-50"
      )}
    >
      {icon}
      <span className="text-[10px] md:text-xs font-bold">{label}</span>
    </button>
  );
}

function getSDGColor(goal: number): string {
  const colors: Record<number, string> = {
    1: '#E5243B', 2: '#DDA63A', 3: '#4C9F38', 4: '#C5192D', 5: '#FF3A21',
    6: '#26BDE2', 7: '#FCC30B', 8: '#A21942', 9: '#FD6925', 10: '#DD1367',
    11: '#FD9D24', 12: '#BF8B2E', 13: '#3F7E44', 14: '#0A97D9', 15: '#56C02B',
    16: '#00689D', 17: '#19486A'
  };
  return colors[goal] || '#CBD5E1';
}

function RoleSelectionScreen({ user, setUser, t, uiLang, setUiLang }: { 
  user: UserProfile; 
  setUser: (u: UserProfile) => void;
  t: any;
  uiLang: UILang;
  setUiLang: (l: UILang) => void;
}) {
  const [selected, setSelected] = useState<UserRole | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Pre-select student role if email ends with university domain
    if (user.email?.toLowerCase().endsWith("univ-eloued.dz") || user.email?.toLowerCase().includes(".univ-eloued.dz")) {
      setSelected(UserRole.STUDENT);
    }
  }, [user.email]);

  const handleConfirm = async () => {
    if (!selected) return;
    setIsSubmitting(true);
    const path = `users/${user.uid}`;
    try {
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        role: selected,
        updatedAt: serverTimestamp()
      }, { merge: true });
      setUser({ ...user, role: selected });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col items-center justify-center p-6 relative overflow-y-auto" dir={uiLang === "ar" ? "rtl" : "ltr"}>
      <div className="absolute top-6 left-6">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setUiLang(uiLang === "ar" ? "en" : "ar")}
          className="rounded-xl font-bold"
        >
          {uiLang === "ar" ? "English" : "العربية"}
        </Button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full space-y-8 text-center"
      >
        <div className="flex justify-center mb-4">
          <CompassSDG className="w-20 h-20" />
        </div>
        
        <div className="space-y-2">
          <div className="inline-block px-4 py-1.5 bg-green-100 text-[#004d33] rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
            {uiLang === "ar" ? "خطوة الأمان الأخيرة" : "Final Security Step"}
          </div>
          <h1 className="text-3xl font-black text-[#004d33]">
            {uiLang === "ar" ? `مرحباً بك، ${user.displayName.split(' ')[0]}` : `Welcome, ${user.displayName.split(' ')[0]}`}
          </h1>
          <h2 className="text-xl font-bold text-gray-700">{t.selectRoleTitle}</h2>
          <p className="text-gray-500 font-medium max-w-sm mx-auto">{t.selectRoleDesc}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          <button
            onClick={() => setSelected(UserRole.STUDENT)}
            className={cn(
              "p-8 rounded-[2.5rem] border-2 transition-all text-right flex flex-col gap-3 group relative overflow-hidden",
              selected === UserRole.STUDENT 
                ? "border-[#004d33] bg-green-50/50 shadow-xl shadow-green-900/5" 
                : "border-gray-100 bg-white hover:border-green-200"
            )}
          >
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
              selected === UserRole.STUDENT ? "bg-[#004d33] text-white" : "bg-gray-50 text-gray-400 group-hover:bg-green-100 group-hover:text-[#004d33]"
            )}>
              <GraduationCap size={24} />
            </div>
            <div>
              <h3 className="font-black text-lg">{t.roleStudent}</h3>
              <p className="text-xs text-gray-400 font-medium leading-relaxed">{t.roleStudentDesc}</p>
            </div>
            {selected === UserRole.STUDENT && (
              <motion.div layoutId="check" className="absolute top-4 left-4 text-[#004d33]">
                <CheckCircle2 size={24} />
              </motion.div>
            )}
          </button>

          <button
            onClick={() => setSelected(UserRole.SUPERVISOR)}
            className={cn(
              "p-8 rounded-[2.5rem] border-2 transition-all text-right flex flex-col gap-3 group relative overflow-hidden",
              selected === UserRole.SUPERVISOR 
                ? "border-blue-600 bg-blue-50/50 shadow-xl shadow-blue-900/5" 
                : "border-gray-100 bg-white hover:border-blue-200"
            )}
          >
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
              selected === UserRole.SUPERVISOR ? "bg-blue-600 text-white" : "bg-gray-50 text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-600"
            )}>
              <Users size={24} />
            </div>
            <div>
              <h3 className="font-black text-lg">{t.roleSupervisor}</h3>
              <p className="text-xs text-gray-400 font-medium leading-relaxed">{t.roleSupervisorDesc}</p>
            </div>
            {selected === UserRole.SUPERVISOR && (
              <motion.div layoutId="check" className="absolute top-4 left-4 text-blue-600">
                <CheckCircle2 size={24} />
              </motion.div>
            )}
          </button>
        </div>

        <Button
          onClick={handleConfirm}
          disabled={!selected || isSubmitting}
          className={cn(
            "w-full py-7 text-lg rounded-[2rem] font-bold shadow-xl transition-all",
            selected === UserRole.SUPERVISOR ? "bg-blue-600 hover:bg-blue-700" : "bg-[#004d33] hover:bg-green-700"
          )}
        >
          {isSubmitting ? <Loader2 className="animate-spin" /> : t.confirmRole}
        </Button>
      </motion.div>
    </div>
  );
}







