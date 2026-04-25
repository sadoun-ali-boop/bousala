import React from "react";
import { Database, ShieldCheck, Globe, Building2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { type UILang } from "@/src/lib/translations";

interface MethodologyDialogProps {
  isOpen: boolean; 
  onOpenChange: (o: boolean) => void; 
  t: any; 
  uiLang: UILang;
  analysis: any;
}

export function MethodologyDialog({ 
  isOpen, 
  onOpenChange, 
  t, 
  uiLang,
  analysis
}: MethodologyDialogProps) {
  const isHighAlignment = (analysis?.asamMatrix?.totalAlignment || 0) >= 70;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl" dir={uiLang === "ar" ? "rtl" : "ltr"}>
        <div className="p-8 bg-gradient-to-br from-blue-900 to-indigo-900 text-white flex items-center gap-6">
          <div className="p-5 bg-white/10 rounded-[2rem] backdrop-blur-md text-blue-300 flex items-center justify-center">
            <Database size={40} />
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-black">{t.methodologyTitle}</h3>
            <p className="text-xs font-bold opacity-70 uppercase tracking-widest">{t.asamMechanism}</p>
          </div>
        </div>

        <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto">
          <div className="space-y-4">
            <h4 className="font-black text-[#004d33] flex items-center gap-2">
              <ShieldCheck className="text-green-500" size={20} />
              {t.asamConditionsTitle}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {t.asamConditions.map((condition: string, i: number) => (
                <div key={i} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex gap-3 group hover:border-green-200 transition-colors">
                  <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-[10px] font-black shrink-0">
                    {i + 1}
                  </div>
                  <p className="text-[11px] font-bold text-gray-700 leading-relaxed text-right">{condition}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-[2.5rem] border border-green-100 space-y-4 text-right">
              <h4 className="font-black text-green-800 flex items-center gap-2 justify-end">
                <Globe className="animate-pulse" size={20} />
                {t.sustainabilityAdviceTitle}
              </h4>
              <p className="text-sm font-bold text-green-700/80 leading-relaxed">
                {isHighAlignment ? t.highScoreAdvice : t.lowScoreAdvice}
              </p>
            </div>

            <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[2.5rem] border border-blue-100 space-y-4 text-right">
              <h4 className="font-black text-blue-800 flex items-center gap-2 justify-end">
                <Building2 size={20} />
                {t.incubatorAdviceTitle}
              </h4>
              <div className="flex items-center gap-4 justify-end">
                 <div className="p-4 bg-white rounded-2xl shadow-sm text-blue-600 font-black text-xl">
                    {analysis?.asamMatrix?.totalAlignment || 0}%
                 </div>
                 <p className="text-xs font-bold text-blue-700/70 leading-relaxed max-w-[300px]">
                    {(analysis?.asamMatrix?.totalAlignment || 0) >= 60 
                      ? (uiLang === "ar" ? "تتجاوز عتبة القبول الأولي (60%) المطلوبة في حاضنات الأعمال الجامعية." : "Exceeds the initial 60% acceptance threshold required for university business incubators.")
                      : (uiLang === "ar" ? "تحتاج المذكرة إلى تطوير أكبر في جانب الجدوى الاقتصادية (Viability) للوصول لعتبة الاحتضان." : "The thesis needs more development in the Economic Viability aspect to reach the incubation threshold.")
                    }
                 </p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 pb-8">
           <Button onClick={() => onOpenChange(false)} className="w-full h-14 rounded-2xl bg-gray-900 hover:bg-black font-black text-white shadow-xl">
             {t.close}
           </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
