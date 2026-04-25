import React from "react";
import { Bell, BellOff, Info, Users, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/src/lib/supabase";
import { type UILang } from "@/src/lib/translations";
import { AppNotification } from "@/src/types";
import { cn } from "@/lib/utils";

interface NotificationsDialogProps {
  isOpen: boolean;
  onOpenChange: (o: boolean) => void;
  t: any;
  uiLang: UILang;
  notifications: AppNotification[];
}

export function NotificationsDialog({
  isOpen,
  onOpenChange,
  t,
  uiLang,
  notifications
}: NotificationsDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl flex flex-col h-[70vh]" dir={uiLang === "ar" ? "rtl" : "ltr"}>
        <div className="p-8 bg-gradient-to-br from-gray-900 to-gray-800 text-white flex items-center gap-6 shrink-0 relative">
          <div className="p-4 bg-white/10 rounded-3xl backdrop-blur-md">
            <Bell size={32} />
          </div>
          <div>
            <h3 className="text-xl font-black">{t.notifications}</h3>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
              {notifications.filter(n => !n.read).length} {uiLang === "ar" ? "غير مقروءة" : "Unread"}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="absolute top-4 left-4 text-white hover:bg-white/10 rounded-xl">
             <X size={20} />
          </Button>
        </div>

        <div className="flex-1 p-6 space-y-4 overflow-y-auto bg-gray-50/50">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-300">
                <BellOff size={32} />
              </div>
              <p className="text-gray-400 font-bold text-sm tracking-tight">{t.noNotifications}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map(notif => (
                <Card key={notif.id} className={cn(
                  "p-5 rounded-3xl border shadow-sm transition-all relative overflow-hidden text-right",
                  notif.read ? "bg-white border-gray-100 opacity-70" : "bg-white border-green-200 ring-2 ring-green-50"
                )}>
                  {!notif.read && <div className={cn("absolute top-4 w-2 h-2 bg-green-500 rounded-full", uiLang === "ar" ? "left-4" : "right-4")} />}
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                      notif.type.includes('approved') ? "bg-green-50 text-green-600" :
                      notif.type.includes('rejected') ? "bg-red-50 text-red-600" :
                      "bg-blue-50 text-blue-600"
                    )}>
                      {notif.type.includes('request') ? <Users size={20} /> : <Info size={20} />}
                    </div>
                    <div className="space-y-1 flex-1">
                      <h4 className="text-sm font-black text-gray-800">{notif.title}</h4>
                      <p className="text-xs font-medium text-gray-500 leading-relaxed">{notif.message}</p>
                      <p className="text-[9px] font-bold text-gray-400 uppercase">{notif.createdAt?.toDate().toLocaleTimeString(uiLang === "ar" ? "ar-DZ" : "en-US", { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
