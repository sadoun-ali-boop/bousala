import React, { useState, useEffect } from "react";
import { Search, Loader2, Phone, MessageSquare, Users, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase, UserRole } from "@/src/lib/supabase";
import { type UILang } from "@/src/lib/translations";
import { UserProfile } from "@/src/types";

interface CommunityChatDialogProps {
  isOpen: boolean;
  onOpenChange: (o: boolean) => void;
  t: any;
  user: UserProfile | null;
  uiLang: UILang;
  onChat: (u: UserProfile) => void;
}

export function CommunityChatDialog({ 
  isOpen, 
  onOpenChange, 
  t, 
  user, 
  uiLang,
  onChat
}: CommunityChatDialogProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      supabase
        .from('users')
        .select('*')
        .order('displayName', { ascending: true })
        .limit(50)
        .then(({ data, error }) => {
          if (error) throw error;
          setUsers((data as UserProfile[]).filter(u => u.id !== user?.id));
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching users list", err);
          setLoading(false);
        });
    }
  }, [isOpen, user?.id]);

  const handleWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/[^\d+]/g, "");
    const digitsOnly = cleanPhone.startsWith('+') ? cleanPhone.substring(1) : cleanPhone;
    window.open(`https://wa.me/${digitsOnly}`, "_blank");
  };

  const filteredUsers = users.filter(u => 
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl flex flex-col h-[80vh]" dir={uiLang === "ar" ? "rtl" : "ltr"}>
        <div className="p-8 bg-gradient-to-br from-[#004d33] to-emerald-800 text-white flex items-center gap-6 shrink-0 relative">
          <div className="p-4 bg-white/10 rounded-3xl backdrop-blur-md">
            <Users size={32} />
          </div>
          <div>
            <h3 className="text-xl font-black">{t.chatWithSupervisor}</h3>
            <p className="text-emerald-100 text-[10px] font-bold uppercase tracking-widest">{t.allSupervisors}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="absolute top-4 left-4 text-white hover:bg-white/10 rounded-xl">
             <X size={20} />
          </Button>
        </div>

        <div className="px-8 py-4 border-b bg-gray-50/50 shrink-0">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text"
              placeholder={uiLang === "ar" ? "بحث عن الزملاء أو الأساتذة..." : "Search for colleagues or faculty..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-gray-100 rounded-2xl py-3 pr-10 pl-4 text-sm focus:ring-2 focus:ring-green-100 outline-none transition-all text-right"
            />
          </div>
        </div>

        <div className="flex-1 p-8 space-y-4 overflow-y-auto">
          {loading ? (
             <div className="py-12 flex flex-col items-center gap-4">
                <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
                <p className="text-sm font-bold text-gray-400">{t.processing}</p>
             </div>
          ) : filteredUsers.length > 0 ? (
            <div className="space-y-3">
              {filteredUsers.map(u => (
                <div 
                  key={u.uid}
                  className="w-full p-4 bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12 border-2 border-gray-50">
                      <AvatarImage src={u.photoURL} />
                      <AvatarFallback className="bg-green-50 text-green-600 font-bold">{u.displayName?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="text-right">
                      <p className="text-sm font-black text-gray-800">{u.displayName}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[8px] px-1.5 py-0 font-bold uppercase tracking-tighter text-gray-400 border-gray-100">
                          {u.role === UserRole.SUPERVISOR ? (uiLang === "ar" ? "أستاذ" : "Faculty") : (uiLang === "ar" ? "طالب" : "Student")}
                        </Badge>
                        <span className="text-[10px] text-gray-400 font-medium">{u.faculty || (uiLang === "ar" ? "جامعة الوادي" : "El Oued University")}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {u.phoneNumber && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleWhatsApp(u.phoneNumber!)}
                        className="rounded-2xl text-[#25D366] hover:bg-green-50 p-2 h-10 w-10 shrink-0"
                      >
                        <Phone size={18} />
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      onClick={() => onChat(u)}
                      className="rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all px-4 h-10 font-bold gap-2"
                    >
                      <MessageSquare size={16} />
                      <span className="text-[10px]">{uiLang === "ar" ? "مراسلة" : "Chat"}</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center space-y-4">
              <div className="inline-flex p-4 bg-gray-50 rounded-full text-gray-300">
                <Users size={32} />
              </div>
              <p className="text-sm font-bold text-gray-400">
                {uiLang === "ar" ? "لم يتم العثور على أي مستخدم بهذا الاسم" : "No users found with this name"}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
