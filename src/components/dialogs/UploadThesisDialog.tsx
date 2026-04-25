import React from "react";
import { Camera, FilePlus, Trash2, Info, Loader2, Zap } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type UILang } from "@/src/lib/translations";

interface UploadThesisDialogProps {
  isOpen: boolean; 
  onOpenChange: (o: boolean) => void; 
  t: any; 
  uiLang: UILang; 
  onUpload: () => void;
  selectedImages: {data: string, mimeType: string}[];
  setSelectedImages: React.Dispatch<React.SetStateAction<{data: string, mimeType: string}[]>>;
  isLoading: boolean;
}

export function UploadThesisDialog({ 
  isOpen, 
  onOpenChange, 
  t, 
  uiLang, 
  onUpload,
  selectedImages,
  setSelectedImages,
  isLoading
}: UploadThesisDialogProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const promises = Array.from(files).map(file => {
      return new Promise<{data: string, mimeType: string}>((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const base64 = (ev.target?.result as string).split(',')[1];
          resolve({ data: base64, mimeType: file.type });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises).then(imgs => {
      setSelectedImages(prev => [...prev, ...imgs]);
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl" dir={uiLang === "ar" ? "rtl" : "ltr"}>
        <div className="p-8 bg-gradient-to-br from-green-50 to-white border-b border-green-100 flex items-center gap-6">
          <div className="p-5 bg-white rounded-[2rem] shadow-xl shadow-green-900/5 text-[#004d33] flex items-center justify-center">
            <Camera size={40} />
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-black text-[#004d33]">{t.uploadThesis}</h3>
            <p className="text-xs font-bold text-gray-500 max-w-[300px] leading-relaxed opacity-70">{t.templateInstructions}</p>
          </div>
        </div>
        
        <div className="p-8 space-y-10 max-h-[60vh] overflow-y-auto">
          <div className="space-y-5">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.capturePhotos}</h4>
              {selectedImages.length > 0 && (
                <Badge className="bg-green-600 text-white border-none rounded-full px-3 py-1 text-[10px] font-black">
                  {uiLang === "ar" ? `تم اختيار ${selectedImages.length} صور` : `${selectedImages.length} images selected`}
                </Badge>
              )}
            </div>
            
            <div className="border-3 border-dashed border-gray-100 rounded-[2.5rem] p-12 flex flex-col items-center justify-center gap-6 hover:border-green-200 hover:bg-green-50/20 transition-all cursor-pointer group relative">
              <div className="p-5 bg-white rounded-3xl shadow-lg text-gray-400 group-hover:text-green-600 group-hover:scale-110 transition-all border border-gray-50">
                <FilePlus size={32} />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-black text-gray-600">{uiLang === "ar" ? "اضغط هنا لالتقاط/رفع الصور" : "Tap here to capture/upload photos"}</p>
                <p className="text-[10px] font-bold text-gray-400">{uiLang === "ar" ? "يمكنك اختيار عدة صور لملخص المذكرة" : "You can select multiple images of your thesis summary"}</p>
              </div>
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                capture="environment"
                className="absolute inset-0 opacity-0 cursor-pointer" 
                onChange={handleFileChange} 
                disabled={isLoading}
              />
            </div>

            {selectedImages.length > 0 && (
              <div className="grid grid-cols-4 gap-4 mt-6">
                {selectedImages.map((img, i) => (
                  <div key={i} className="aspect-square rounded-2xl overflow-hidden border-2 border-gray-100 relative group">
                    <img alt="Preview" src={`data:${img.mimeType};base64,${img.data}`} className="w-full h-full object-cover" />
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImages(prev => prev.filter((_, idx) => idx !== i));
                      }}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="pt-4 border-t border-dashed border-gray-100">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <Info size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">{uiLang === "ar" ? "نصائح للتحليل" : "Analysis Tips"}</span>
              </div>
              <p className="text-[10px] font-medium text-gray-400 leading-relaxed">
                {uiLang === "ar" 
                  ? "تأكد من وضوح الخط ووجود إضاءة كافية عند التصوير لضمان دقة استخراج البيانات بواسطة مساعد بوصلة."
                  : "Ensure the text is clear and the lighting is sufficient when taking photos to ensure accurate data extraction by Bousla assistant."}
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 border-t bg-gray-50 flex items-center justify-between">
           <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-2xl font-bold">
             {t.close}
           </Button>
           <Button 
            onClick={onUpload} 
            disabled={isLoading || selectedImages.length === 0}
            className="bg-[#004d33] hover:bg-green-700 rounded-2xl px-10 py-6 font-bold text-white shadow-xl flex gap-3"
           >
             {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap size={18} />}
             {isLoading ? t.processing : (uiLang === "ar" ? "بدء التحليل البصري" : "Start Visual Analysis")}
           </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
