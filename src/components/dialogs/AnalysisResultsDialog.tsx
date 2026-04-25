import React from "react";
import { motion } from "motion/react";
import { Printer, Download, Sparkles, Database, Zap, Users, BarChart3, ExternalLink, Lightbulb, CheckCircle2, FileSpreadsheet } from "lucide-react";
import { CompassSDG } from "@/src/components/CompassSDG";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { type UILang } from "@/src/lib/translations";
import { UserProfile, AnalysisRecord } from "@/src/types";
import { AnalysisResult } from "@/src/lib/gemini";
import { cn } from "@/lib/utils";

const SDG_COLORS: Record<number, string> = {
  1: "#E5243B", 2: "#DDA63A", 3: "#4C9F38", 4: "#C5192D",
  5: "#FF3A21", 6: "#26BDE2", 7: "#FCC30B", 8: "#A21942",
  9: "#FD6925", 10: "#DD1367", 11: "#FD9D24", 12: "#BF8B2E",
  13: "#3F7E44", 14: "#0A97D9", 15: "#56C02B", 16: "#00689D",
  17: "#19486A"
};

const getSDGColor = (goal: number) => SDG_COLORS[goal] || "#000";

interface AnalysisResultsDialogProps {
  isOpen: boolean;
  onOpenChange: (o: boolean) => void;
  t: any;
  uiLang: UILang;
  user: UserProfile | null;
  currentAnalysis: AnalysisResult | null | undefined;
  handlePrint: () => void;
  generatePDF: (analysis: AnalysisResult, user: UserProfile) => void;
  setShowMethodology: (o: boolean) => void;
}

export function AnalysisResultsDialog({
  isOpen,
  onOpenChange,
  t,
  uiLang,
  user,
  currentAnalysis,
  handlePrint,
  generatePDF,
  setShowMethodology
}: AnalysisResultsDialogProps) {
  if (!currentAnalysis) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[85vh] overflow-hidden p-0 rounded-[3rem] border-none shadow-2xl">
        <div className="flex flex-col h-full bg-white relative overflow-hidden" dir={uiLang === "ar" ? "rtl" : "ltr"}>
          <header className="p-8 bg-[#004d33] text-white flex items-center justify-between shrink-0 no-print">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 flex items-center justify-center">
                 <Sparkles className="w-12 h-12 text-yellow-300" />
              </div>
              <div>
                <h2 className="text-2xl font-black">{t.reportTitle}</h2>
                <p className="text-green-100 text-sm">{t.reportSubtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => user && generatePDF(currentAnalysis, user)}
                className="bg-white text-[#004d33] hover:bg-green-50 rounded-2xl gap-2 font-bold px-8 py-6 border-none shadow-xl no-print text-lg"
              >
                <Download size={22} />
                {t.printReport} / PDF
              </Button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-8 min-h-0 relative">
            <div id="printable-report" className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="md:col-span-2 border-none bg-gray-50/50 rounded-3xl p-6">
                  <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                    <Sparkles size={20} className="text-yellow-500" />
                    {t.summary}
                  </h3>
                  <p className="text-sm font-medium leading-loose text-gray-600 text-right">
                    {currentAnalysis.summary}
                  </p>
                </Card>
                <Card className="border-none bg-emerald-50 rounded-3xl p-6 flex flex-col items-center justify-center text-center">
                  <div className="relative mb-4">
                     <div className="text-4xl font-black text-[#004d33]">{currentAnalysis.overallSdgAlignment}%</div>
                     <div className="text-[10px] font-bold text-green-700 uppercase">{t.alignmentScore}</div>
                  </div>
                  <Progress value={currentAnalysis.overallSdgAlignment} className="h-2 w-full bg-white/50" />
                </Card>
              </div>

              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className={cn(
                    "text-xl font-black flex items-center gap-3 pr-2",
                    uiLang === "ar" ? "border-r-4 border-emerald-500" : "border-l-4 border-emerald-500"
                  )}>
                    <Database size={24} className="text-emerald-500" />
                    {t.asamMatrix}
                  </h3>
                  <Badge className="bg-emerald-100 text-emerald-700 border-none font-black text-xs px-4 py-1.5 rounded-full">
                    {currentAnalysis.asamMatrix.totalAlignment}% {t.asamDescription.split('(')[1]?.split(')')[0] || ""}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { key: 'strategicAlignment', icon: <CompassSDG className="w-8 h-8" />, color: "emerald", label: t.strategicAlignment },
                    { key: 'ecoDesign', icon: <Zap size={24} />, color: "blue", label: t.ecoDesign },
                    { key: 'humanImpact', icon: <Users size={24} />, color: "purple", label: t.humanImpact },
                    { key: 'viability', icon: <BarChart3 size={24} />, color: "orange", label: t.viability }
                  ].map((quad, i) => {
                    const data = currentAnalysis.asamMatrix[quad.key as keyof typeof currentAnalysis.asamMatrix] as any;
                    return (
                      <motion.div 
                        key={quad.key}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white border-2 border-gray-50 rounded-[2rem] p-6 hover:shadow-xl hover:shadow-gray-200/50 transition-all flex flex-col gap-4 group"
                      >
                        <div className="flex items-center justify-between">
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                            quad.color === "emerald" ? "bg-emerald-50 text-emerald-600" :
                            quad.color === "blue" ? "bg-blue-50 text-blue-600" :
                            quad.color === "purple" ? "bg-purple-50 text-purple-600" :
                            "bg-orange-50 text-orange-600"
                          )}>
                            {quad.icon}
                          </div>
                          <div className="text-right">
                            <span className="text-2xl font-black">{data.score}</span>
                            <span className="text-[10px] text-gray-400 font-bold ml-1">/25</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <h4 className="font-bold text-sm mb-1">{quad.label}</h4>
                          <p className="text-[10px] text-gray-500 font-medium leading-relaxed">{data.details}</p>
                        </div>
                        <div className="mt-auto pt-4 border-t border-dashed border-gray-100 text-right">
                          <div className="text-[8px] font-black text-gray-300 uppercase mb-1">{uiLang === "ar" ? "مؤشر الأداء" : "KPI"}</div>
                          <div className="text-[10px] font-bold text-gray-600 line-clamp-1">{data.kpi}</div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </section>

              <section className="space-y-6">
                <h3 className={cn(
                  "text-xl font-black flex items-center gap-3 pr-2",
                  uiLang === "ar" ? "border-r-4 border-blue-500" : "border-l-4 border-blue-500"
                )}>
                  {t.sdgAlignment}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentAnalysis.sdgScores.map((score, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white border-2 border-gray-50 rounded-3xl p-6 hover:border-green-100 transition-all group relative overflow-hidden text-right"
                    >
                      <div className={cn("absolute top-0 right-0 w-1 h-full")} style={{ backgroundColor: getSDGColor(score.goal) }} />
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-green-50 transition-all font-black text-xl">
                          {score.goal}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge className="bg-green-100 text-green-700 border-none font-bold">
                            {t.alignmentScore.split(' ')[0]} {score.score}%
                          </Badge>
                          <a 
                            href={score.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[9px] font-bold text-blue-500 hover:text-blue-700 flex items-center gap-1 transition-colors"
                          >
                            {t.visitGoal}
                            <ExternalLink size={10} />
                          </a>
                        </div>
                      </div>
                      <h4 className="font-bold text-sm mb-2">{score.title}</h4>
                      <p className="text-[10px] text-gray-400 font-medium leading-relaxed italic">
                        {t.evidence}: "{score.evidence}"
                      </p>
                    </motion.div>
                  ))}
                </div>
              </section>

              <section className="bg-gray-900 text-white rounded-[2.5rem] p-8 space-y-6 text-right">
                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h3 className="text-xl font-black flex items-center gap-3">
                      <Lightbulb size={24} className="text-yellow-400" />
                      {t.suggestions}
                    </h3>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowMethodology(true)}
                      className="rounded-xl border-white/20 hover:bg-white/10 text-xs font-black h-9 flex gap-2"
                    >
                      <Database size={14} />
                      {t.methodologyTitle}
                    </Button>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {currentAnalysis.sdgRecommendations.map((rec, i) => (
                     <div key={i} className="flex gap-4 p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/5">
                       <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-400/20 text-yellow-400 flex items-center justify-center font-bold">
                         {i + 1}
                       </div>
                       <p className="text-sm font-medium leading-relaxed">{rec}</p>
                     </div>
                   ))}
                 </div>

                 <div className="mt-8 pt-8 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="space-y-2">
                       <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">{t.designDeliverables}</h4>
                       <ul className="text-xs font-bold space-y-1.5 text-gray-200">
                          <li className="flex items-center gap-2">
                            <CheckCircle2 size={12} className="text-emerald-400" />
                            {uiLang === "ar" ? "مخطط إنفوجرافيك الترابط" : "SDG Interconnection Infographic"}
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 size={12} className="text-emerald-400" />
                            {t.scorecardTitle}
                          </li>
                       </ul>
                    </div>
                    <div className="sm:col-span-2 space-y-2">
                       <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">{uiLang === "ar" ? "خارطة Roadmap المستقبلية" : "Future Roadmap"}</h4>
                       <p className="text-xs font-medium text-gray-400 leading-relaxed italic">
                         {uiLang === "ar" 
                           ? "يجب تطوير هذا التصميم مستقبلاً لتعزيز أبعاد أكاديمية إضافية وزيادة عمق الخدمة المجتمعية من خلال الشراكات (SDG 17)." 
                           : "This design should evolve to enhance additional academic dimensions and deepen community service through partnerships (SDG 17)."}
                       </p>
                    </div>
                 </div>
               </section>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
