import React from "react";
import { GraduationCap, ExternalLink } from "lucide-react";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { type UILang } from "@/src/lib/translations";

export function SupportDialog({ isOpen, onOpenChange, t, uiLang }: { isOpen: boolean; onOpenChange: (o: boolean) => void; t: any; uiLang: UILang }) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-[2rem]" dir={uiLang === "ar" ? "rtl" : "ltr"}>
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-green-700 flex items-center gap-2">
            <GraduationCap /> {t.academicSupportLink}
          </DialogTitle>
          <DialogDescription className="font-medium text-xs">
            {t.academicSupportContent}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <button 
            onClick={() => window.open('https://archives.univ-eloued.dz/home', '_blank')}
            className="w-full text-right p-4 bg-green-50 rounded-2xl border border-green-100 hover:bg-green-100 transition-all group"
          >
            <div className="flex justify-between items-start">
              <h4 className="font-bold text-sm mb-1 group-hover:text-green-800">{uiLang === "ar" ? "المكتبة الرقمية" : "Digital Library"}</h4>
              <ExternalLink size={16} className="text-green-300 group-hover:text-green-600 transition-colors" />
            </div>
            <p className="text-xs text-gray-500 group-hover:text-gray-600">{uiLang === "ar" ? "الوصول إلى آلاف المراجع العلمية والكتب بمستودع جامعة الوادي (DSpace)." : "Access to thousands of scientific references and books at El Oued University Repository (DSpace)."}</p>
          </button>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} className="w-full rounded-xl bg-green-600 font-bold">{t.close}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
