import React, { useState, useEffect } from "react";
import { User, Building2, School, Hash, Trophy, Users, UserCircle, Tag, MapPin, History, Phone, Loader2, Sparkles } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase, UserRole } from "@/src/lib/supabase";
import { type UILang } from "@/src/lib/translations";
import { UserProfile } from "@/src/types";
import { cn } from "@/lib/utils";

interface ProfileDialogProps {
  isOpen: boolean;
  onOpenChange: (o: boolean) => void;
  t: any;
  uiLang: UILang;
  user: UserProfile | null;
  onUpdate: (updated: UserProfile) => void;
  setToast: (toast: { message: string; type: "success" | "error" } | null) => void;
}

export function ProfileDialog({ isOpen, onOpenChange, t, uiLang, user, onUpdate, setToast }: ProfileDialogProps) {
  const [formData, setFormData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && user) {
      setFormData({ ...user });
      setErrors({});
    }
  }, [isOpen, user]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.displayName?.trim()) {
      newErrors.displayName = uiLang === "ar" ? "الاسم مطلوب" : "Name is required";
    }
    if (!formData.faculty) {
      newErrors.faculty = uiLang === "ar" ? "يرجى اختيار الكلية" : "Faculty is required";
    }
    if (!formData.department) {
      newErrors.department = uiLang === "ar" ? "يرجى اختيار القسم" : "Department is required";
    }
    if (formData.phoneNumber) {
      // Basic Algerian phone format: 0(5|6|7)XXXXXXXX
      const phoneRegex = /^(00213|\+213|0)(5|6|7)[0-9]{8}$/;
      if (!phoneRegex.test(formData.phoneNumber.replace(/\s/g, ""))) {
        newErrors.phoneNumber = uiLang === "ar" ? "رقم هاتف غير صالح" : "Invalid phone number";
      }
    }
    if (user?.role === UserRole.STUDENT && !formData.academicLevel) {
      newErrors.academicLevel = uiLang === "ar" ? "يرجى اختيار المستوى الدراسي" : "Academic level is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!user || !formData) return;
    if (!validateForm()) {
      setToast({ 
        message: uiLang === "ar" ? "يرجى تصحيح الأخطاء في النموذج" : "Please correct form errors", 
        type: "error" 
      });
      return;
    }
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('users')
        .update(formData)
        .eq('id', user.id);
      
      if (error) throw error;
      onUpdate(formData);
      setToast({ 
        message: uiLang === "ar" ? "تم تحديث البيانات بنجاح" : "Profile updated successfully", 
        type: "success" 
      });
      onOpenChange(false);
    } catch (e) {
      console.error(e);
      setToast({ 
        message: uiLang === "ar" ? "فشل تحديث البيانات" : "Failed to update profile", 
        type: "error" 
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!user || !formData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden border-none shadow-2xl rounded-[2.5rem]" dir={uiLang === "ar" ? "rtl" : "ltr"}>
        <div className="flex flex-col h-full overflow-hidden">
          <header className="p-8 bg-[#004d33] text-white flex flex-col items-center shrink-0 relative overflow-hidden">
            <Sparkles className="absolute top-4 right-4 w-12 h-12 opacity-10 animate-pulse" />
            <div className="relative group mb-4">
              <Avatar className="w-24 h-24 ring-4 ring-white/20 group-hover:ring-white/40 transition-all shadow-xl">
                <AvatarImage src={user.photoURL} />
                <AvatarFallback className="bg-green-100 text-[#004d33] text-2xl font-black">{user.displayName?.[0]}</AvatarFallback>
              </Avatar>
            </div>
            <h2 className="text-2xl font-black mb-1">{user.displayName}</h2>
            <Badge className="bg-white/20 text-white border-none px-4 py-1 rounded-full uppercase text-[10px] font-bold tracking-widest">
              {user.role === UserRole.STUDENT ? t.roleStudent : t.roleSupervisor}
            </Badge>
          </header>

          <div className="flex-1 overflow-y-auto p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 px-1">{t.fullName}</label>
                <div className="relative group">
                   <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400 group-focus-within:text-[#004d33] transition-colors">
                     <User size={16} />
                   </div>
                   <input 
                    type="text" 
                    value={formData.displayName} 
                    onChange={(e) => {
                      setFormData({...formData, displayName: e.target.value});
                      if (errors.displayName) setErrors({...errors, displayName: ""});
                    }}
                    className={cn(
                      "w-full bg-gray-50 border-gray-100 rounded-2xl py-3 pr-11 pl-4 focus:ring-2 focus:ring-green-100 focus:border-[#004d33] transition-all font-medium text-sm text-right outline-none",
                      errors.displayName && "ring-2 ring-red-100 border-red-300"
                    )} 
                   />
                </div>
                {errors.displayName && <p className="text-[10px] text-red-500 font-bold px-1">{errors.displayName}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 px-1">{t.faculty}</label>
                <div className="relative group">
                   <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400 group-focus-within:text-[#004d33] transition-colors">
                     <Building2 size={16} />
                   </div>
                   <select 
                    value={formData.faculty} 
                    onChange={(e) => {
                      setFormData({...formData, faculty: e.target.value});
                      if (errors.faculty) setErrors({...errors, faculty: ""});
                    }}
                    className={cn(
                      "w-full bg-gray-50 border-gray-100 rounded-2xl py-3 pr-11 pl-4 focus:ring-2 focus:ring-green-100 focus:border-[#004d33] transition-all font-medium text-sm text-right appearance-none outline-none",
                      errors.faculty && "ring-2 ring-red-100 border-red-300"
                    )}
                   >
                    <option value="">{t.faculty}</option>
                    {t.options.faculties.map((f: string) => <option key={f} value={f}>{f}</option>)}
                   </select>
                </div>
                {errors.faculty && <p className="text-[10px] text-red-500 font-bold px-1">{errors.faculty}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 px-1">{t.department}</label>
                <div className="relative group">
                   <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400 group-focus-within:text-[#004d33] transition-colors">
                     <School size={16} />
                   </div>
                   <select 
                    value={formData.department} 
                    onChange={(e) => {
                      setFormData({...formData, department: e.target.value});
                      if (errors.department) setErrors({...errors, department: ""});
                    }}
                    className={cn(
                      "w-full bg-gray-50 border-gray-100 rounded-2xl py-3 pr-11 pl-4 focus:ring-2 focus:ring-green-100 focus:border-[#004d33] transition-all font-medium text-sm text-right appearance-none outline-none",
                      errors.department && "ring-2 ring-red-100 border-red-300"
                    )}
                   >
                    <option value="">{t.department}</option>
                    {t.options.departments.map((d: string) => <option key={d} value={d}>{d}</option>)}
                   </select>
                </div>
                {errors.department && <p className="text-[10px] text-red-500 font-bold px-1">{errors.department}</p>}
              </div>

              {user.role === UserRole.STUDENT ? (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 px-1">{t.studentId}</label>
                    <div className="relative group">
                       <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400 group-focus-within:text-[#004d33] transition-colors">
                         <Hash size={16} />
                       </div>
                       <input 
                        type="text" 
                        value={formData.studentId} 
                        onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                        className="w-full bg-gray-50 border-gray-100 rounded-2xl py-3 pr-11 pl-4 focus:ring-2 focus:ring-green-100 focus:border-[#004d33] transition-all font-medium text-sm text-right outline-none" 
                       />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 px-1">{t.academicLevel}</label>
                    <div className="relative group">
                       <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400 group-focus-within:text-[#004d33] transition-colors">
                         <Trophy size={16} />
                       </div>
                       <select 
                        value={formData.academicLevel} 
                        onChange={(e) => {
                          setFormData({...formData, academicLevel: e.target.value});
                          if (errors.academicLevel) setErrors({...errors, academicLevel: ""});
                        }}
                        className={cn(
                          "w-full bg-gray-50 border-gray-100 rounded-2xl py-3 pr-11 pl-4 focus:ring-2 focus:ring-green-100 focus:border-[#004d33] transition-all font-medium text-sm text-right appearance-none outline-none",
                          errors.academicLevel && "ring-2 ring-red-100 border-red-300"
                        )}
                       >
                        <option value="">{t.academicLevel}</option>
                        {t.options.levels.map((l: string) => <option key={l} value={l}>{l}</option>)}
                       </select>
                    </div>
                    {errors.academicLevel && <p className="text-[10px] text-red-500 font-bold px-1">{errors.academicLevel}</p>}
                  </div>
                  <div className="space-y-4 pt-4 border-t border-dashed border-gray-100">
                    <div className="flex items-center gap-2 text-[#004d33]">
                      <Users size={16} />
                      <span className="text-xs font-black uppercase tracking-widest">{t.academicSupport}</span>
                    </div>
                    
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-gray-400 px-1">{t.supervisorName}</label>
                       <div className="relative">
                         <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400">
                           <UserCircle size={16} />
                         </div>
                         <input 
                           type="text" 
                           value={formData.supervisorName || ""} 
                           onChange={(e) => setFormData({...formData, supervisorName: e.target.value})}
                           placeholder={t.supervisorNamePlaceholder}
                           className="w-full bg-gray-50 border-gray-100 rounded-2xl py-3 pr-11 pl-4 focus:ring-2 focus:ring-green-100 focus:border-[#004d33] transition-all font-medium text-sm text-right outline-none" 
                         />
                         {formData.supervisorStatus && (
                            <Badge className={cn(
                              "absolute border-none text-[8px] font-black uppercase tracking-tighter",
                              uiLang === "ar" ? "left-4" : "right-4",
                              "top-1/2 -translate-y-1/2",
                              formData.supervisorStatus === 'approved' ? "bg-green-100 text-green-700" :
                              formData.supervisorStatus === 'pending' ? "bg-amber-100 text-amber-700" :
                              "bg-red-100 text-red-700"
                            )}>
                              {formData.supervisorStatus === 'approved' ? t.approved : 
                               formData.supervisorStatus === 'pending' ? t.pending : t.rejected}
                            </Badge>
                         )}
                       </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 px-1">{t.specialization}</label>
                    <div className="relative group">
                       <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400 group-focus-within:text-[#004d33] transition-colors">
                         <Tag size={16} />
                       </div>
                       <input 
                        type="text" 
                        value={formData.specialization} 
                        onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                        className="w-full bg-gray-50 border-gray-100 rounded-2xl py-3 pr-11 pl-4 focus:ring-2 focus:ring-green-100 focus:border-[#004d33] transition-all font-medium text-sm text-right outline-none" 
                       />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 px-1">{t.officeNumber}</label>
                    <div className="relative group">
                       <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400 group-focus-within:text-[#004d33] transition-colors">
                         <MapPin size={16} />
                       </div>
                       <input 
                        type="text" 
                        value={formData.officeNumber} 
                        onChange={(e) => setFormData({...formData, officeNumber: e.target.value})}
                        className="w-full bg-gray-50 border-gray-100 rounded-2xl py-3 pr-11 pl-4 focus:ring-2 focus:ring-green-100 focus:border-[#004d33] transition-all font-medium text-sm text-right outline-none" 
                       />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 px-1">{t.academicYear}</label>
                <div className="relative group">
                   <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400 group-focus-within:text-[#004d33] transition-colors">
                     <History size={16} />
                   </div>
                   <select 
                    value={formData.academicYear} 
                    onChange={(e) => setFormData({...formData, academicYear: e.target.value})}
                    className="w-full bg-gray-50 border-gray-100 rounded-2xl py-3 pr-11 pl-4 focus:ring-2 focus:ring-green-100 focus:border-[#004d33] transition-all font-medium text-sm text-right appearance-none outline-none"
                   >
                    <option value="">{t.academicYear}</option>
                    {t.options.years.map((y: string) => <option key={y} value={y}>{y}</option>)}
                   </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 px-1">{t.phoneNumber}</label>
                <div className="relative group">
                   <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400 group-focus-within:text-[#004d33] transition-colors">
                     <Phone size={16} />
                   </div>
                   <input 
                    type="text" 
                    value={formData.phoneNumber} 
                    onChange={(e) => {
                      setFormData({...formData, phoneNumber: e.target.value});
                      if (errors.phoneNumber) setErrors({...errors, phoneNumber: ""});
                    }}
                    placeholder="06XXXXXXXX"
                    className={cn(
                      "w-full bg-gray-50 border-gray-100 rounded-2xl py-3 pr-11 pl-4 focus:ring-2 focus:ring-green-100 focus:border-[#004d33] transition-all font-medium text-sm text-right outline-none",
                      errors.phoneNumber && "ring-2 ring-red-100 border-red-300"
                    )} 
                   />
                </div>
                {errors.phoneNumber && <p className="text-[10px] text-red-500 font-bold px-1">{errors.phoneNumber}</p>}
              </div>
            </div>
          </div>

          <footer className="p-6 border-t flex items-center justify-end bg-white flex-shrink-0 gap-4">
             <Button 
               variant="ghost" 
               onClick={() => onOpenChange(false)}
               className="rounded-2xl px-6 py-6 font-bold"
             >
               {t.close}
             </Button>
             <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="bg-[#004d33] hover:bg-green-700 rounded-2xl px-8 py-6 font-bold text-white shadow-xl flex gap-2"
             >
               {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
               {t.saveChanges}
             </Button>
          </footer>
        </div>
      </DialogContent>
    </Dialog>
  );
}
function ShieldCheck({ className, size }: { className?: string, size?: number }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>;
}
