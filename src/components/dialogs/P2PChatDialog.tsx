import React, { useState, useEffect, useRef } from "react";
import { Send, MessageSquare, Loader2, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase, sendP2PMessage, markP2PMessagesAsRead } from "@/src/lib/supabase";
import { type UILang } from "@/src/lib/translations";
import { UserProfile, P2PMessage } from "@/src/types";
import { cn } from "@/lib/utils";

interface P2PChatDialogProps {
  isOpen: boolean;
  onOpenChange: (o: boolean) => void;
  uiLang: UILang;
  currentUser: UserProfile | null;
  partner: UserProfile | null;
  setToast: (toast: { message: string; type: "success" | "error" } | null) => void;
}

export function P2PChatDialog({
  isOpen,
  onOpenChange,
  uiLang,
  currentUser,
  partner,
  setToast
}: P2PChatDialogProps) {
  const [messages, setMessages] = useState<P2PMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && partner && currentUser) {
      const chatID = [currentUser.id, partner.id].sort().join("_");
      
      supabase
        .from('p2p_messages')
        .select('*')
        .eq('chatID', chatID)
        .order('timestamp', { ascending: true })
        .limit(100)
        .then(({ data, error }) => {
          if (error) throw error;
          setMessages((data as P2PMessage[]) || []);
          markP2PMessagesAsRead(chatID, currentUser.id);
        })
        .catch(err => console.error('Error fetching messages:', err));
      
      // Subscribe to real-time updates
      const channel = supabase
        .channel(`p2p:${chatID}`)
        .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'p2p_messages', filter: `chatID=eq.${chatID}` }, 
          (payload) => {
            setMessages(prev => [...prev, payload.new as P2PMessage]);
          })
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isOpen, partner, currentUser]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !currentUser || !partner) return;
    setSending(true);
    try {
      await sendP2PMessage(currentUser.id, partner.id, newMessage.trim());
      setNewMessage("");
    } catch (e) {
      console.error(e);
      setToast({ 
        message: uiLang === "ar" ? "فشل إرسال الرسالة" : "Failed to send message", 
        type: "error" 
      });
    } finally {
      setSending(false);
    }
  };

  if (!partner || !currentUser) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl flex flex-col h-[75vh]" dir={uiLang === "ar" ? "rtl" : "ltr"}>
        <div className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
             <Avatar className="w-12 h-12 border-2 border-white/20">
               <AvatarImage src={partner.photoURL} />
               <AvatarFallback className="bg-white/10 text-white font-bold">{partner.displayName?.[0]}</AvatarFallback>
             </Avatar>
             <div>
               <h3 className="font-black text-lg">{partner.displayName}</h3>
               <p className="text-blue-100 text-[10px] uppercase font-bold tracking-widest">
                 {partner.role === 'supervisor' ? (uiLang === "ar" ? "أستاذ مشرف" : "Supervisor") : (uiLang === "ar" ? "طالب" : "Student")}
               </p>
             </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="text-white hover:bg-white/10 rounded-xl">
             <X size={20} />
          </Button>
        </div>

        <div ref={scrollRef} className="flex-1 p-6 space-y-4 overflow-y-auto bg-gray-50/50">
          {messages.map((msg) => {
            const isMe = msg.senderId === currentUser.id;
            return (
              <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[80%] p-4 rounded-[1.5rem] text-sm font-medium shadow-sm",
                  isMe ? "bg-blue-600 text-white rounded-br-none" : "bg-white text-gray-800 rounded-bl-none"
                )}>
                  <p className="leading-relaxed">{msg.content}</p>
                  <p className={cn(
                    "text-[8px] mt-1 font-bold uppercase opacity-50",
                    isMe ? "text-right" : "text-left"
                  )}>
                    {msg.timestamp && new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-6 bg-white border-t flex gap-3 shrink-0">
          <input 
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={uiLang === "ar" ? "اكتب رسالتك هنا..." : "Type your message..."}
            className="flex-1 bg-gray-50 border-none rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all text-right"
          />
          <Button 
            onClick={handleSend}
            disabled={sending || !newMessage.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl w-12 h-12 p-0 shadow-lg shrink-0"
          >
            {sending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} className={uiLang === "ar" ? "rotate-180" : ""} />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
