import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, CheckCircle } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CompassSDG } from "@/src/components/CompassSDG";
import { cn } from "@/lib/utils";
import { type UILang } from "@/src/lib/translations";

const SDG_COLORS: Record<number, string> = {
  1: "#E5243B", 2: "#DDA63A", 3: "#4C9F38", 4: "#C5192D",
  5: "#FF3A21", 6: "#26BDE2", 7: "#FCC30B", 8: "#A21942",
  9: "#FD6925", 10: "#DD1367", 11: "#FD9D24", 12: "#BF8B2E",
  13: "#3F7E44", 14: "#0A97D9", 15: "#56C02B", 16: "#00689D",
  17: "#19486A"
};

const getSDGColor = (goal: number) => SDG_COLORS[goal] || "#000";

interface VisionDialogProps {
  isOpen: boolean;
  onOpenChange: (o: boolean) => void;
  t: any;
  uiLang: UILang;
}

export function VisionDialog({ isOpen, onOpenChange, t, uiLang }: VisionDialogProps) {
  const [selectedGoal, setSelectedGoal] = useState<number | null>(null);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0 rounded-[2.5rem] border-none shadow-2xl" dir={uiLang === "ar" ? "rtl" : "ltr"}>
        <div className="relative h-48 bg-[#004d33] flex flex-col items-center justify-center text-white overflow-hidden flex-shrink-0">
          <CompassSDG className="absolute -bottom-10 -right-10 w-64 h-64 opacity-10 invert grayscale" />
          <div className="z-10 text-center px-8">
            <h2 className="text-4xl font-black mb-2">{t.vision2030Title}</h2>
            <p className="text-green-100 text-sm font-medium max-w-md mx-auto">{t.vision2030Desc}</p>
          </div>
          <Badge className="absolute top-6 right-6 bg-yellow-400 text-green-900 border-none font-bold uppercase tracking-widest text-[10px] scale-125">United Nations</Badge>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-gray-50/50">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 17 }, (_, i) => i + 1).map(goal => (
              <motion.button
                key={goal}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedGoal(selectedGoal === goal ? null : goal)}
                className={cn(
                  "aspect-square rounded-2xl flex flex-col items-center justify-center text-white p-3 shadow-lg transition-all relative group overflow-hidden",
                  selectedGoal === goal ? "ring-4 ring-white ring-offset-2 ring-offset-gray-100 scale-105 z-10" : ""
                )}
                style={{ backgroundColor: getSDGColor(goal) }}
              >
                <span className="text-2xl font-black mb-1">{goal}</span>
                <span className="text-[8px] font-bold uppercase text-center leading-tight opacity-90">{t.sdgTargets?.[goal]?.substring(0, 30) || ""}...</span>
                
                {selectedGoal === goal && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-black/20 flex items-center justify-center"
                  >
                    <CheckCircle2 size={32} className="text-white" />
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {selectedGoal && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-8 p-8 bg-white rounded-[2.5rem] shadow-xl border border-gray-100 relative overflow-hidden"
              >
                <div 
                  className="absolute top-0 right-0 w-32 h-32 opacity-5"
                  style={{ backgroundColor: getSDGColor(selectedGoal), maskImage: 'radial-gradient(circle at top right, black, transparent)' }}
                />
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-lg" style={{ backgroundColor: getSDGColor(selectedGoal) }}>
                      {selectedGoal}
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-gray-800">{t.sdgGoals?.[selectedGoal] || ""}</h4>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">SDG Target {selectedGoal}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="rounded-full border-green-100 text-green-600 font-bold px-4 py-1">2030 Agenda</Badge>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed font-medium">
                  {t.sdgTargets?.[selectedGoal] || ""}
                </p>
                <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex -space-x-2 rtl:space-x-reverse">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-green-50 flex items-center justify-center text-[10px] font-bold text-green-600">
                        {i}
                      </div>
                    ))}
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[8px] font-bold text-gray-400">
                      +100
                    </div>
                  </div>
                  <button className="text-xs font-black text-[#004d33] hover:underline flex items-center gap-1">
                    {uiLang === "ar" ? "استكشف المزيد من الحلول" : "Explore more solutions"}
                    <CompassSDG className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
