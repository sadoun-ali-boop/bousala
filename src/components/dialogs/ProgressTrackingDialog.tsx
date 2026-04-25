import React from "react";
import { LayoutDashboard, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { type UILang } from "@/src/lib/translations";
import { UserProfile, Conversation } from "@/src/types";
import { cn } from "@/lib/utils";

interface ProgressTrackingDialogProps {
  isOpen: boolean; 
  onOpenChange: (o: boolean) => void; 
  t: any; 
  uiLang: UILang; 
  user: UserProfile | null;
  conversations: Conversation[];
  steps: { title: string; status: string; date: string | null }[];
}

export function ProgressTrackingDialog({ 
  isOpen, 
  onOpenChange, 
  t, 
  uiLang, 
  user,
  steps
}: ProgressTrackingDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl" dir={uiLang === "ar" ? "rtl" : "ltr"}>
        <div className="p-8 bg-[#004d33] text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/10 rounded-3xl backdrop-blur-md">
              <LayoutDashboard size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-black">{t.trackProgress}</h3>
              <p className="text-green-100 text-sm">{user?.displayName || t.guestUser}</p>
            </div>
          </div>
          <Badge className="bg-white/20 text-white border-none py-1 px-4 rounded-full font-bold uppercase text-[10px]">
            {steps.filter(s => s.status === "completed").length}/{steps.length} {uiLang === "ar" ? "مكتمل" : "Completed"}
          </Badge>
        </div>

        <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto">
          <div className="relative">
            <div className={cn(
              "absolute top-0 bottom-0 w-0.5 bg-gray-100",
              uiLang === "ar" ? "right-[23px]" : "left-[23px]"
            )} />
            <div className="space-y-10 relative">
              {steps.map((step, i) => (
                <div key={i} className="flex items-start gap-6 relative">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center z-10 shadow-lg transition-all",
                    step.status === "completed" ? "bg-green-600 text-white" : 
                    step.status === "current" ? "bg-[#004d33] text-white ring-4 ring-green-100 animate-pulse" : 
                    "bg-white text-gray-300 border-2 border-gray-50"
                  )}>
                    {step.status === "completed" ? <CheckCircle2 size={24} /> : <div className="text-lg font-black">{i + 1}</div>}
                  </div>
                  <div className="flex-1 pt-1 text-right">
                    <h4 className={cn(
                      "font-black text-lg",
                      step.status === "completed" ? "text-[#004d33]" : "text-gray-800"
                    )}>
                      {step.title}
                    </h4>
                    <div className="flex items-center gap-3 mt-1 justify-end">
                       <Badge variant="outline" className={cn(
                         "text-[8px] uppercase font-black px-2 py-0.5 rounded-md",
                         step.status === "completed" ? "border-green-100 text-green-600" :
                         step.status === "current" ? "border-green-900 text-[#004d33]" :
                         "border-gray-100 text-gray-300"
                       )}>
                         {step.status === "completed" ? t.completed : 
                          step.status === "current" ? (uiLang === "ar" ? "قيد التنفيذ" : "In Progress") : t.pending}
                       </Badge>
                       {step.date && <span className="text-[10px] font-bold text-gray-400">{step.date}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
