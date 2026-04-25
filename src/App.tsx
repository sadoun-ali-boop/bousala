import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LogOut, Plus, History, Bell, MessageSquare, FilePlus, Sparkles, User, ShieldCheck, Settings 
} from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

// Libs & Components
import { CompassSDG } from "@/src/components/CompassSDG";
import { supabase, syncUser, signOut, getCurrentUser } from "@/src/lib/supabase";
import { translations } from "@/src/lib/translations";
import { ItemsList } from "@/src/ItemsList";

// Dialogs (قائمة المكونات الظاهرة في مشروعك)
import { UploadThesisDialog } from "@/src/components/dialogs/UploadThesisDialog";
import { ProfileDialog } from "@/src/components/dialogs/ProfileDialog";
import { NotificationsDialog } from "@/src/components/dialogs/NotificationsDialog";
import { CommunityChatDialog } from "@/src/components/dialogs/CommunityChatDialog";
import { SupportDialog } from "@/src/components/dialogs/SupportDialog";
import { AnalysisResultsDialog } from "@/src/components/dialogs/AnalysisResultsDialog";
import { SupervisorDashboardDialog } from "@/src/components/dialogs/SupervisorDashboardDialog";
import { MethodologyDialog } from "@/src/components/dialogs/MethodologyDialog";
import { VisionDialog } from "@/src/components/dialogs/VisionDialog";

export default function App() {
  const [items, setItems] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [uiLang] = useState<"ar" | "en">("ar");
  const t = translations[uiLang];

  // التحكم في النوافذ المنبثقة
  const [showUpload, setShowUpload] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCommunity, setShowCommunity] = useState(false);
  const [showSupervisor, setShowSupervisor] = useState(false);
  const [showSupport, setShowSupport] = useState(false);

  useEffect(() => {
    const initApp = async () => {
      try {
        const sessionUser = await getCurrentUser();
        if (sessionUser) {
          const profile = await syncUser(sessionUser);
          setUser(profile);
          await fetchItems();
        }
      } catch (error) {
        console.error("Auth error:", error);
      } finally {
        setAuthLoading(false);
      }
    };
    initApp();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await syncUser(session.user);
        setUser(profile);
        fetchItems();
      } else {
        setUser(null);
      }
    });
    return () => subscription?.unsubscribe();
  }, []);

  const fetchItems = async () => {
    const { data, error } = await supabase.from('items').select('*').order('created_at', { ascending: false });
    if (!error) setItems(data || []);
  };

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
  };

  if (authLoading) return <div className="h-screen flex items-center justify-center bg-slate-50"><CompassSDG className="w-16 h-16 animate-spin opacity-20" /></div>;

  if (!user) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center" dir="rtl">
      <CompassSDG className="w-24 h-24 mb-6" />
      <h1 className="text-4xl font-black text-[#004d33] mb-2">{t.appName}</h1>
      <p className="text-gray-500 mb-8 max-w-sm">{t.appSubtitle}</p>
      <Button onClick={handleLogin} size="lg" className="bg-[#004d33] hover:bg-[#003d29] text-white px-10 rounded-2xl h-14 text-lg gap-3 shadow-lg transition-all">
        <Sparkles size={20} /> دخول بواسطة Google
      </Button>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden" dir="rtl">
      <aside className="w-80 bg-white border-l border-gray-100 flex flex-col hidden lg:flex shadow-sm">
        <div className="p-6 border-b flex items-center gap-3">
          <CompassSDG className="w-8 h-8" />
          <h2 className="text-xl font-bold text-[#004d33]">{t.appName}</h2>
        </div>
        <ScrollArea className="flex-1 p-4">
          <ItemsList items={items} uiLang={uiLang} />
        </ScrollArea>
        <div className="p-4 border-t bg-gray-50/50">
          <Button onClick={() => signOut()} variant="ghost" className="w-full justify-start text-red-500 hover:bg-red-50 gap-2 rounded-xl">
            <LogOut size={16} /> {t.logout}
          </Button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-20 border-b bg-white/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-20">
          <Button onClick={() => setShowUpload(true)} className="bg-green-600 hover:bg-green-700 text-white rounded-2xl px-6 py-6 shadow-md gap-2 font-bold transition-all">
            <Plus size={20} /> {t.uploadThesis}
          </Button>
          <div className="flex items-center gap-3">
            {user?.role === 'supervisor' && (
              <Button variant="outline" size="icon" onClick={() => setShowSupervisor(true)} className="rounded-full border-blue-200 text-blue-600 shadow-sm"><ShieldCheck size={20} /></Button>
            )}
            <Button variant="outline" size="icon" onClick={() => setShowNotifications(true)} className="rounded-full border-gray-200 shadow-sm"><Bell size={20} className="text-gray-600" /></Button>
            <Button variant="outline" size="icon" onClick={() => setShowCommunity(true)} className="rounded-full border-gray-200 shadow-sm"><MessageSquare size={20} className="text-gray-600" /></Button>
            <Separator orientation="vertical" className="h-8 mx-2" />
            <Avatar className="h-10 w-10 cursor-pointer border-2 border-green-100 hover:ring-4 ring-green-50 transition-all" onClick={() => setShowProfile(true)}>
              <AvatarImage src={user.photoURL} /><AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <ScrollArea className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-black text-gray-900 mb-8 leading-tight">أهلاً بك، {user.displayName} 👋</h2>
            {items.length === 0 ? (
              <Card className="border-2 border-dashed p-20 text-center rounded-[2.5rem] bg-white/50 border-gray-200 shadow-none">
                <FilePlus className="mx-auto text-gray-300 mb-6" size={64} />
                <CardTitle className="text-xl mb-4 italic text-gray-400 font-medium">لا توجد مذكرات مرفوعة حالياً</CardTitle>
                <Button onClick={() => setShowUpload(true)} className="bg-green-600 hover:bg-green-700 px-8 py-6 rounded-2xl font-bold">ارفع مذكرتك الأولى</Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map(item => (
                  <motion.div key={item.id} whileHover={{ y: -5 }}>
                    <Card className="hover:shadow-2xl hover:shadow-green-900/5 transition-all rounded-[2rem] border-gray-100 cursor-pointer group">
                      <CardHeader>
                        <CardTitle className="text-md leading-relaxed group-hover:text-green-700 transition-colors line-clamp-2">{item.title}</CardTitle>
                        <CardDescription className="line-clamp-3 text-gray-400 mt-2">{item.content}</CardDescription>
                      </CardHeader>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </main>

      <UploadThesisDialog isOpen={showUpload} onOpenChange={setShowUpload} onUploadSuccess={fetchItems} />
      <ProfileDialog isOpen={showProfile} onOpenChange={setShowProfile} user={user} />
      <NotificationsDialog isOpen={showNotifications} onOpenChange={setShowNotifications} />
      <CommunityChatDialog isOpen={showCommunity} onOpenChange={setShowCommunity} user={user} />
      <SupervisorDashboardDialog isOpen={showSupervisor} onOpenChange={setShowSupervisor} />
      <SupportDialog isOpen={showSupport} onOpenChange={setShowSupport} />
    </div>
  );
}