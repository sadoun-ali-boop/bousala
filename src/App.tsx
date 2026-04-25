import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, Search, Sparkles, BookOpen, Lightbulb, CheckCircle2, Tag, Loader2, AlertCircle,
  LogOut, User, LayoutDashboard, History, Info, Download, ChevronRight, BarChart3, Users, Home,
  ShieldCheck, GraduationCap, Building2, Globe, ArrowLeft, MessageSquare, Trophy, Settings, Phone, School, Hash,
  Mail, MapPin, ExternalLink, Send, Plus, Trash2, Github, Book, Calendar, CreditCard, Bell, Zap, ShieldAlert, FilePlus, Database, Camera, Printer, UserPlus,
  Menu, X, BellOff, XCircle, UserCircle
} from "lucide-react";

// UI Components
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

// Libs & Types
import { analyzeAbstract, chatAboutResearch } from "@/src/lib/gemini";
import { generatePDF } from "@/src/lib/pdf";
import { CompassSDG } from "@/src/components/CompassSDG";
import { cn } from "@/lib/utils";
import { 
  supabase, syncUser, handleSupabaseError, OperationType, UserRole, 
  sendNotification, sendP2PMessage, markP2PMessagesAsRead,
  signInWithGoogle, signOut, getCurrentUser
} from "@/src/lib/supabase";
import { translations, type UILang } from "@/src/lib/translations";

import { 
  UserProfile, AppNotification, Conversation,
  AnalysisResult, ChatMessage 
} from "@/src/types";

// Dialogs & Custom Components
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
                يرجى التحقق من مفاتيح Supabase أو اتصال الإنترنت.
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

export default function App() {
  // States
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [items, setItems] = useState<any[]>([]); // لجلب مذكرات التخرج
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [uiLang, setUiLang] = useState<UILang>("ar");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Dialog States
  const [showProfile, setShowProfile] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showSupervisorDashboard, setShowSupervisorDashboard] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const t = translations[uiLang];

  // 1. Auth Listener & Initial Sync
  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          const profile = await syncUser(currentUser);
          setUser(profile);
          fetchItems(); // جلب البيانات عند نجاح الدخول
        }
      } catch (e) {
        console.error("Auth error", e);
      } finally {
        setAuthLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await syncUser(session.user);
        setUser(profile);
      } else {
        setUser(null);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  // 2. Fetch Items from Supabase
  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setItems(data || []);
    } catch (e) {
      console.error("Error fetching items", e);
    }
  };

  // 3. Login/Logout Actions
  const handleLogin = async () => {
    setLoginError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
      });
      if (error) throw error;
    } catch (err: any) {
      setLoginError("فشل الاتصال بجوجل. تأكد من إعدادات الـ Client ID");
    }
  };

  const handleLogout = async () => {
    await signOut();
    window.location.reload();
  };

  // 4. Render Logic
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
          <CompassSDG className="w-16 h-16 opacity-20" />
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center" dir="rtl">
        <CompassSDG className="w-24 h-24 mb-6" />
        <h1 className="text-4xl font-black text-[#004d33] mb-2">{t.appName}</h1>
        <p className="text-gray-500 mb-8 max-w-sm">{t.appSubtitle}</p>
        
        {loginError && <Badge variant="destructive" className="mb-4 py-2 px-4">{loginError}</Badge>}
        
        <Button onClick={handleLogin} size="lg" className="bg-[#004d33] hover:bg-[#003d29] text-white px-8 rounded-2xl h-14 text-lg gap-3">
          <Github size={20} />
          تسجيل الدخول عبر Google
        </Button>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-[#f8fafc]" dir={uiLang === "ar" ? "rtl" : "ltr"}>
        {/* Sidebar */}
        <aside className="w-80 bg-white border-l border-gray-100 flex flex-col hidden md:flex">
          <div className="p-6 border-b flex items-center gap-3">
            <CompassSDG className="w-8 h-8" />
            <h2 className="text-xl font-bold text-[#004d33]">{t.appName}</h2>
          </div>
          <ScrollArea className="flex-1 p-4">
             {/* قائمة المحادثات السابقة هنا */}
             <ItemsList items={items} uiLang={uiLang} />
          </ScrollArea>
          <div className="p-4 border-t bg-gray-50">
            <div className="flex items-center gap-3 mb-4">
              <Avatar><AvatarImage src={user.photoURL} /></Avatar>
              <div className="text-sm font-bold truncate">{user.displayName}</div>
            </div>
            <Button onClick={handleLogout} variant="ghost" className="w-full justify-start text-red-600 gap-2">
              <LogOut size={16} /> {t.logout}
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col relative overflow-hidden">
          <header className="h-16 border-b bg-white/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <Button onClick={() => setShowUpload(true)} className="bg-green-600 hover:bg-green-700 rounded-xl gap-2">
                <Plus size={18} /> {t.uploadThesis}
              </Button>
            </div>
            <div className="flex items-center gap-2">
               <Badge variant="outline" className="bg-green-50 text-green-700 border-green-100 px-3 py-1">
                 جامعة الشهيد حمه لخضر - الوادي
               </Badge>
            </div>
          </header>

          <ScrollArea className="flex-1 p-8">
            <div className="max-w-5xl mx-auto space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-sm bg-gradient-to-br from-green-50 to-white">
                  <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Sparkles className="text-green-600" size={16}/> {t.aiInsights}</CardTitle></CardHeader>
                  <CardContent className="text-2xl font-black text-green-700">89%</CardContent>
                </Card>
                {/* يمكنك إضافة المزيد من الإحصائيات هنا */}
              </div>

              {/* منطقة المذكرات الجاري تحليلها */}
              <div className="grid gap-6">
                <h3 className="text-lg font-bold flex items-center gap-2"><History size={18}/> المذكرات المرفوعة مؤخراً</h3>
                {items.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                    <FilePlus className="mx-auto text-gray-300 mb-4" size={48} />
                    <p className="text-gray-400">لا توجد مذكرات حالياً، ابدأ برفع أول مذكرة</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {items.map(item => (
                      <Card key={item.id} className="hover:ring-2 ring-green-500 transition-all cursor-pointer">
                        <CardHeader>
                          <CardTitle className="text-md truncate">{item.title}</CardTitle>
                          <CardDescription>{item.content?.substring(0, 100)}...</CardDescription>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </main>

        {/* Dialogs */}
        <UploadThesisDialog isOpen={showUpload} onOpenChange={setShowUpload} uiLang={uiLang} onUploadSuccess={fetchItems} />
        <ProfileDialog isOpen={showProfile} onOpenChange={setShowProfile} user={user} uiLang={uiLang} />
        {/* ... بقية الـ Dialogs تضاف هنا بنفس الطريقة ... */}
      </div>
    </ErrorBoundary>
  );
}