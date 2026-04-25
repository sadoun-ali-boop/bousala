import React, { useState, useEffect } from "react";
import { Users, Loader2, Book, Hash, Calendar, MessageSquare, Plus, CheckCircle2, XCircle, ArrowLeft, UserPlus, Search } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase, UserRole } from "@/src/lib/supabase";
import { type UILang } from "@/src/lib/translations";
import { UserProfile } from "@/src/types";
import { cn } from "@/lib/utils";

interface SupervisorDashboardDialogProps {
  isOpen: boolean; 
  onOpenChange: (o: boolean) => void; 
  t: any; 
  uiLang: UILang; 
  user: UserProfile | null;
  onApprove: (studentUid: string, studentName: string) => void;
  onReject: (studentUid: string, studentName: string) => void;
  onChat: (student: UserProfile) => void;
  setToast: (toast: { message: string; type: "success" | "error" } | null) => void;
}

export function SupervisorDashboardDialog({ 
  isOpen, 
  onOpenChange, 
  t, 
  uiLang, 
  user,
  onApprove,
  onReject,
  onChat,
  setToast
}: SupervisorDashboardDialogProps) {
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [allStudents, setAllStudents] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"supervised" | "discovery">("supervised");

  const fetchStudents = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Supervised students
      let query;
      if (user.role === UserRole.ADMIN) {
        query = supabase
          .from('users')
          .select('*')
          .eq('role', UserRole.STUDENT);
      } else {
        query = supabase
          .from('users')
          .select('*')
          .eq('supervisorUid', user.id)
          .eq('role', UserRole.STUDENT);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      setStudents((data as UserProfile[]) || []);

      // Discovery: Students without a supervisor
      if (user.role === UserRole.SUPERVISOR) {
        const { data: discData, error: discError } = await supabase
          .from('users')
          .select('*')
          .eq('role', UserRole.STUDENT)
          .is('supervisorUid', null);
        
        if (discError) throw discError;
        setAllStudents((discData as UserProfile[]) || []);
      }
    } catch (e) {
      console.error("Error fetching students", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && user) {
      fetchStudents();
    }
  }, [isOpen, user]);

  const handleRequestSupervision = async (student: UserProfile) => {
    if (!user) return;
    try {
      const { error: updateError } = await supabase
        .from('users')
        .update({
          supervisorUid: user.id,
          supervisorName: user.displayName,
          supervisorStatus: 'pending'
        })
        .eq('id', student.id);

      if (updateError) throw updateError;

      // Send notification to student
      const { error: notifyError } = await supabase
        .from('notifications')
        .insert([{
          userId: student.id,
          title: uiLang === "ar" ? "طلب إشراف جديد" : "New Supervision Request",
          message: t.supervisionRequestNotify.replace("{name}", user.displayName),
          type: "supervisor_request",
          fromUid: user.id,
          fromName: user.displayName,
          read: false,
          createdAt: new Date().toISOString()
        }]);

      if (notifyError) throw notifyError;

      setToast({ message: t.supervisionRequested, type: "success" });
      fetchStudents(); // Refresh lists
    } catch (e) {
      console.error("Error requesting supervision", e);
      setToast({ message: uiLang === "ar" ? "فشل إرسال الطلب" : "Failed to send request", type: "error" });
    }
  };

  const displayedStudents = viewMode === "supervised" ? students : allStudents;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 rounded-[3rem] border-none shadow-2xl" dir={uiLang === "ar" ? "rtl" : "ltr"}>
        <header className="p-8 bg-blue-700 text-white flex flex-col gap-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/10 rounded-3xl backdrop-blur-md">
                <Users size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-black">{t.supervisedStudents}</h2>
                <p className="text-blue-100 text-sm font-medium">{user?.displayName}</p>
              </div>
            </div>
            <Badge className="bg-white/20 text-white border-none py-1 px-4 rounded-full font-bold uppercase text-[10px]">
              {students.length} {t.roleStudent}
            </Badge>
          </div>

          {user?.role === UserRole.SUPERVISOR && (
            <div className="flex bg-white/10 p-1 rounded-2xl gap-1">
              <Button
                variant="ghost"
                onClick={() => setViewMode("supervised")}
                className={cn(
                  "flex-1 rounded-xl font-bold transition-all text-xs",
                  viewMode === "supervised" ? "bg-white text-blue-700 shadow-xl" : "text-white hover:bg-white/10"
                )}
              >
                <Users size={16} className={uiLang === "ar" ? "ml-2" : "mr-2"} />
                {t.supervisedStudents}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setViewMode("discovery")}
                className={cn(
                  "flex-1 rounded-xl font-bold transition-all text-xs",
                  viewMode === "discovery" ? "bg-white text-blue-700 shadow-xl" : "text-white hover:bg-white/10"
                )}
              >
                <Search size={16} className={uiLang === "ar" ? "ml-2" : "mr-2"} />
                {uiLang === "ar" ? "اكتشاف الطلبة" : "Discover Students"}
              </Button>
            </div>
          )}
        </header>

        <div className="flex-1 overflow-y-auto p-8 bg-gray-50/50">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="animate-spin text-blue-600" size={40} />
              <p className="text-sm font-bold text-gray-400">{t.processing}</p>
            </div>
          ) : displayedStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center text-blue-200">
                <Users size={40} />
              </div>
              <p className="text-gray-400 font-bold max-w-xs">
                {viewMode === "supervised" ? t.noSupervisedStudents : (uiLang === "ar" ? "لا يوجد طلبة متاحين للإشراف حالياً" : "No students available for supervision currently")}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {displayedStudents.map(student => (
                <Card key={student.id} className="bg-white border-none shadow-sm rounded-3xl p-6 hover:shadow-md transition-all group">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-14 h-14 border-2 border-blue-50 group-hover:border-blue-200 transition-colors">
                        <AvatarImage src={student.photoURL} />
                        <AvatarFallback className="bg-blue-50 text-blue-700 font-bold">{student.displayName?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1 text-right">
                        <h4 className="font-black text-lg text-gray-800">{student.displayName}</h4>
                        <div className="flex items-center gap-3 text-xs font-bold text-gray-400 justify-end">
                          <span className="flex items-center gap-1"><Book size={14} className="text-blue-400" /> {student.specialization || t.faculty}</span>
                          <span className="flex items-center gap-1"><Hash size={14} className="text-blue-400" /> {student.studentId}</span>
                        </div>
                        {student.supervisorStatus === 'pending' && student.supervisorUid === user?.uid && (
                          <div className="flex justify-end mt-1">
                            <Badge className="bg-amber-100 text-amber-700 border-none font-bold text-[10px] uppercase">
                              {t.approvalPending}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 md:items-end">
                      {viewMode === "discovery" ? (
                         <Button 
                           onClick={() => handleRequestSupervision(student)}
                           className="rounded-2xl bg-[#004d33] hover:bg-green-700 font-black px-6 py-5 h-auto text-white shadow-lg shadow-green-100 flex gap-2"
                         >
                           <UserPlus size={18} />
                           {t.requestSupervision}
                         </Button>
                      ) : (
                        student.supervisorStatus === 'pending' && student.supervisorUid === user?.uid ? (
                          <div className="flex gap-2">
                             <Button 
                               onClick={() => onReject(student.id, student.displayName)}
                               variant="outline" 
                               className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 font-bold px-4 h-10"
                             >
                               <XCircle size={18} className={uiLang === "ar" ? "ml-2" : "mr-2"} />
                               {t.reject}
                             </Button>
                             <Button 
                               onClick={() => onApprove(student.id, student.displayName)}
                               className="rounded-xl bg-blue-600 hover:bg-blue-700 font-bold px-4 h-10 text-white"
                             >
                               <CheckCircle2 size={18} className={uiLang === "ar" ? "ml-2" : "mr-2"} />
                               {t.approve}
                             </Button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2">
                               <span className="text-[10px] uppercase font-black text-gray-300 tracking-widest">{t.currentStep}:</span>
                               <Badge className="bg-blue-50 text-blue-600 border-none font-bold py-1 px-3">
                                  {t.stepInitial}
                               </Badge>
                            </div>
                            <div className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                              <Calendar size={12} /> {t.lastUpdate}: {student.lastLogin?.toDate().toLocaleDateString(uiLang === "ar" ? "ar-DZ" : "en-US")}
                            </div>
                          </>
                        )
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-dashed border-gray-100 pb-2">
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                      <div className="bg-blue-50/50 p-3 rounded-2xl border border-blue-100/50">
                        <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">{t.studentId}</p>
                        <p className="text-xs font-bold text-gray-700">{student.studentId || "---"}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{t.faculty}</p>
                        <p className="text-xs font-bold text-gray-700 truncate">{student.faculty || "---"}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{t.department}</p>
                        <p className="text-xs font-bold text-gray-700 truncate">{student.department || "---"}</p>
                      </div>
                      <div className="bg-indigo-50/50 p-3 rounded-2xl border border-indigo-100/50">
                        <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">{t.academicLevel}</p>
                        <p className="text-xs font-bold text-gray-700">{student.academicLevel || "---"}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{t.academicYear}</p>
                        <p className="text-sm font-bold text-gray-700">{student.academicYear || "---"}</p>
                      </div>
                      <div className="bg-green-50/50 p-3 rounded-2xl border border-green-100/50">
                        <p className="text-[9px] font-black text-green-400 uppercase tracking-widest mb-1">{t.phoneNumber}</p>
                        <p className="text-xs font-bold text-gray-700">{student.phoneNumber || "---"}</p>
                      </div>
                    </div>
                  </div>

                  {viewMode === "supervised" && (
                    <>
                      <div className="mt-6 pt-6 border-t border-dashed border-gray-100">
                        <div className="space-y-3 text-right">
                           <h5 className="text-[10px] uppercase font-black text-gray-400 tracking-widest flex items-center gap-2 justify-end">
                             {t.feedback} <MessageSquare size={14} className="text-blue-400" />
                           </h5>
                           <div className="p-4 bg-gray-50 rounded-2xl text-xs font-medium text-gray-600 italic leading-relaxed">
                              {uiLang === "ar" ? "لا يوجد ملاحظات مسجلة حالياً." : "No feedback recorded currently."}
                           </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex justify-end gap-2">
                        {student.phoneNumber && (
                          <Button 
                            onClick={() => window.open(`https://wa.me/${student.phoneNumber?.replace(/[^\d+]/g, "")}`, "_blank")}
                            variant="outline"
                            size="sm" 
                            className="text-[#25D366] hover:bg-green-50 border-green-100 rounded-xl font-bold p-2 h-8 w-8"
                          >
                            <Plus size={16} />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50 rounded-xl font-bold gap-2" onClick={() => onChat(student)}>
                           <MessageSquare size={16} /> {uiLang === "ar" ? "دردشة" : "Chat"}
                        </Button>
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50 rounded-xl font-bold gap-2">
                           {t.viewStudentProgress} <ArrowLeft size={16} className={uiLang === "ar" ? "" : "rotate-180"} />
                        </Button>
                      </div>
                    </>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
