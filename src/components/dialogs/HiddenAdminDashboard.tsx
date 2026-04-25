import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, User, Hash, LogOut, LayoutDashboard, Users, FileText, BarChart3, 
  CreditCard, Settings, Bell, Zap, Plus, Trash2, CheckCircle2, ShieldAlert, 
  MessageSquare, Download, Database, Trophy, FilePlus
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { type UILang } from "@/src/lib/translations";

export function HiddenAdminDashboard({ 
  isOpen, 
  onOpenChange, 
  uiLang 
}: { 
  isOpen: boolean; 
  onOpenChange: (o: boolean) => void; 
  uiLang: UILang;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // Mock User Data for management demo
  const [adminUsers, setAdminUsers] = useState([
    { id: "1", name: "Ahmed", email: "ahmed@univ-eloued.dz", role: "Student", status: "Active" },
    { id: "2", name: "Sara", email: "sara@univ-eloued.dz", role: "Supervisor", status: "Active" },
    { id: "3", name: "Admin Ali", email: "sadoun-ali@univ-eloued.dz", role: "Super Admin", status: "Active" },
  ]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "Admin" && password === "Ali@1987.08.16/39") {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError(uiLang === "ar" ? "بيانات الدخول غير صحيحة" : "Invalid credentials");
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setIsAuthenticated(false);
      setUsername("");
      setPassword("");
      setError("");
    }
  }, [isOpen]);

  const handleBanUser = (id: string) => {
    setAdminUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === "Banned" ? "Active" : "Banned" } : u));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] lg:max-w-7xl h-[90vh] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl bg-slate-950 text-slate-100 flex flex-col" dir={uiLang === "ar" ? "rtl" : "ltr"}>
        {!isAuthenticated ? (
          <div className="flex-1 p-8 space-y-8 flex flex-col justify-center">
            <div className="text-center space-y-2">
              <div className="inline-flex p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-400 mb-4">
                <ShieldCheck size={40} />
              </div>
              <h3 className="text-2xl font-black tracking-tighter uppercase italic">
                {uiLang === "ar" ? "تسجيل دخول المسؤول" : "Admin Secure Access"}
              </h3>
              <p className="text-slate-500 text-xs font-mono uppercase tracking-widest">
                {uiLang === "ar" ? "نطاق محمي - يرجى التعريف بنفسك" : "Restricted Zone - Identity Required"}
              </p>
            </div>

            <form onSubmit={handleAdminLogin} className="max-w-xs mx-auto w-full space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[10px] font-bold text-center uppercase tracking-wider">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest px-1">
                  {uiLang === "ar" ? "اسم المستخدم" : "Access Node ID"}
                </label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                  <input 
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-900 border-slate-800 rounded-xl py-3 pr-10 pl-4 text-sm font-mono focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                    placeholder={uiLang === "ar" ? "أدخل المعرف" : "Enter SID"}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest px-1">
                  {uiLang === "ar" ? "كلمة المرور" : "Cipher Key"}
                </label>
                <div className="relative">
                  <Hash className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                  <input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-900 border-slate-800 rounded-xl py-3 pr-10 pl-4 text-sm font-mono focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full py-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase tracking-widest">
                {uiLang === "ar" ? "تمكين الوصول" : "Engage Protocol"}
              </Button>
            </form>
          </div>
        ) : (
          <>
            <div className="p-6 bg-slate-900/50 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black tracking-tighter uppercase italic">{uiLang === "ar" ? "مركز التحكم الإداري" : "Bousla Control Core"}</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <p className="text-slate-500 text-[10px] font-mono uppercase tracking-widest">Mode: Master Admin Account UI</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                 <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="text-slate-400 hover:text-white rounded-xl">
                   <LogOut size={16} className={uiLang === "ar" ? "ml-2" : "mr-2"} /> {uiLang === "ar" ? "خروج" : "Kill Session"}
                 </Button>
              </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
              <div className="w-20 md:w-64 flex-shrink-0 border-slate-800 p-2 md:p-4 space-y-2 bg-black/20 overflow-y-auto" style={{ borderInlineEndWidth: '1px' }}>
                {[
                  { id: "overview", label: uiLang === "ar" ? "نظرة عامة" : "Overview", icon: LayoutDashboard },
                  { id: "users", label: uiLang === "ar" ? "المستخدمون" : "Users", icon: Users },
                  { id: "content", label: uiLang === "ar" ? "المحتوى" : "Content", icon: FileText },
                  { id: "analytics", label: uiLang === "ar" ? "التحليلات" : "Analytics", icon: BarChart3 },
                  { id: "finance", label: uiLang === "ar" ? "الإمالية" : "Financials", icon: CreditCard },
                  { id: "settings", label: uiLang === "ar" ? "الإعدادات" : "Settings", icon: Settings },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "w-full flex items-center justify-center md:justify-start gap-3 p-3 rounded-xl transition-all text-sm font-bold",
                      activeTab === tab.id ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40" : "text-slate-500 hover:bg-slate-900 hover:text-slate-300"
                    )}
                    title={tab.label}
                  >
                    <tab.icon size={20} className="flex-shrink-0" />
                    <span className="hidden md:block truncate">{tab.label}</span>
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-950/50">
                {activeTab === "overview" && (
                  <div className="space-y-10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      <Card className="bg-slate-900/50 border-slate-800 p-8 rounded-[2rem] hover:bg-slate-900 transition-colors">
                        <p className="text-[10px] text-slate-500 font-bold uppercase mb-2 tracking-widest italic font-mono">Active Nodes</p>
                        <p className="text-4xl font-mono text-blue-400">1,204</p>
                      </Card>
                      <Card className="bg-slate-900/50 border-slate-800 p-8 rounded-[2rem] hover:bg-slate-900 transition-colors">
                        <p className="text-[10px] text-slate-500 font-bold uppercase mb-2 tracking-widest italic font-mono">SDG Scans</p>
                        <p className="text-4xl font-mono text-green-400">8,542</p>
                      </Card>
                      <Card className="bg-slate-900/50 border-slate-800 p-8 rounded-[2rem] hover:bg-slate-900 transition-colors">
                        <p className="text-[10px] text-slate-500 font-bold uppercase mb-2 tracking-widest italic font-mono">Alerts</p>
                        <p className="text-4xl font-mono text-yellow-400">03</p>
                      </Card>
                      <Card className="bg-slate-900/50 border-slate-800 p-8 rounded-[2rem] hover:bg-slate-900 transition-colors">
                        <p className="text-[10px] text-slate-500 font-bold uppercase mb-2 tracking-widest italic font-mono">Server Load</p>
                        <p className="text-4xl font-mono text-purple-400">18%</p>
                      </Card>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                       <Card className="bg-slate-900/30 border-slate-800 border-dashed p-6 rounded-3xl">
                          <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-4"><Bell size={14} /> System Notices</h4>
                          <div className="space-y-3">
                             <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/10 text-[11px] text-red-400">
                               Critical: Database shard 04 sync latency detected.
                             </div>
                             <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/10 text-[11px] text-blue-400">
                               Success: V2.1 UI Assets pushed to edge nodes.
                             </div>
                          </div>
                       </Card>
                       <Card className="bg-slate-900/30 border-slate-800 border-dashed p-6 rounded-3xl">
                          <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-4"><Zap size={14} /> Rapid Actions</h4>
                          <div className="flex flex-wrap gap-2">
                             <Button size="sm" className="bg-slate-800 hover:bg-slate-700 rounded-lg text-[10px]">Flush Cache</Button>
                             <Button size="sm" className="bg-slate-800 hover:bg-slate-700 rounded-lg text-[10px]">Broadcast Msg</Button>
                             <Button size="sm" className="bg-slate-800 hover:bg-slate-700 rounded-lg text-[10px]">Verify Backups</Button>
                          </div>
                       </Card>
                    </div>
                  </div>
                )}

                {activeTab === "users" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                       <h3 className="text-2xl font-black">{uiLang === "ar" ? "إدارة المستخدمين" : "User Management"}</h3>
                       <Button className="bg-blue-600 rounded-xl gap-2 font-bold"><Plus size={18} /> {uiLang === "ar" ? "إضافة مستخدم" : "Create Node"}</Button>
                    </div>
                    <Card className="bg-slate-950 border-slate-800 rounded-3xl overflow-hidden">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader className="bg-slate-900/50">
                          <TableRow className="border-slate-800 hover:bg-transparent">
                            <TableHead className="text-slate-500 font-black uppercase text-[10px]">{uiLang === "ar" ? "الاسم" : "Entity Name"}</TableHead>
                            <TableHead className="text-slate-500 font-black uppercase text-[10px]">{uiLang === "ar" ? "البريد" : "Node Signal"}</TableHead>
                            <TableHead className="text-slate-500 font-black uppercase text-[10px]">{uiLang === "ar" ? "الدور" : "Permission"}</TableHead>
                            <TableHead className="text-slate-500 font-black uppercase text-[10px]">{uiLang === "ar" ? "الحالة" : "Link Status"}</TableHead>
                            <TableHead className="text-slate-500 font-black uppercase text-[10px] text-left">{uiLang === "ar" ? "إجراء" : "Actions"}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {adminUsers.map(u => (
                            <TableRow key={u.id} className="border-slate-900 hover:bg-slate-900/30">
                              <TableCell className="font-bold text-sm">{u.name}</TableCell>
                              <TableCell className="text-slate-500 font-mono text-xs">{u.email}</TableCell>
                              <TableCell>
                                <Badge className={cn(
                                  "border-none uppercase text-[9px] font-black",
                                  u.role === "Super Admin" ? "bg-purple-500/10 text-purple-400" : "bg-blue-500/10 text-blue-400"
                                )}>
                                  {u.role}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className={cn("w-1.5 h-1.5 rounded-full", u.status === "Active" ? "bg-green-500" : "bg-red-500")} />
                                  <span className="text-[10px] font-bold text-slate-500">{u.status}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-left">
                                <div className="flex gap-2">
                                   <Button variant="ghost" size="icon" onClick={() => handleBanUser(u.id)} className={cn("rounded-lg", u.status === "Banned" ? "text-green-400" : "text-red-400")}>
                                     {u.status === "Banned" ? <CheckCircle2 size={16} /> : <ShieldAlert size={16} />}
                                   </Button>
                                   <Button variant="ghost" size="icon" className="rounded-lg text-slate-400"><Trash2 size={16} /></Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </Card>
                  </div>
                )}

                {activeTab === "content" && (
                   <div className="space-y-8">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                         <h3 className="text-2xl font-black">{uiLang === "ar" ? "إدارة المحتوى" : "Content Engine"}</h3>
                         <Button className="bg-green-600 rounded-xl gap-2 font-bold w-full sm:w-auto"><FilePlus size={18} /> {uiLang === "ar" ? "نشر جديد" : "Deploy Asset"}</Button>
                      </div>
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                         <Card className="bg-slate-900/50 border-slate-800 p-6 rounded-3xl space-y-4">
                            <h5 className="font-bold flex items-center gap-2 text-slate-300"><MessageSquare size={16} /> {uiLang === "ar" ? "مراجعة التعليقات" : "Comment Moderation"}</h5>
                            <div className="space-y-4">
                               {[1, 2].map(i => (
                                 <div key={i} className="p-4 bg-slate-950 rounded-2xl border border-slate-800/50 space-y-2">
                                    <div className="flex justify-between items-center">
                                       <span className="text-[10px] font-black text-blue-400">@User_{i}432</span>
                                       <span className="text-[10px] text-slate-600 font-mono">12:0{i} PM</span>
                                    </div>
                                    <p className="text-xs text-slate-400 leading-relaxed italic">"Great insights on SDG Goal 4 for our university!"</p>
                                    <div className="flex gap-2 pt-2">
                                       <Button size="sm" variant="ghost" className="h-7 text-[9px] text-green-400 hover:bg-green-500/10">APPROVE</Button>
                                       <Button size="sm" variant="ghost" className="h-7 text-[9px] text-red-400 hover:bg-red-500/10">REJECT</Button>
                                    </div>
                                 </div>
                               ))}
                            </div>
                         </Card>
                         <Card className="bg-slate-900/50 border-slate-800 p-6 rounded-3xl space-y-4">
                            <h5 className="font-bold flex items-center gap-2 text-slate-300"><Bell size={16} /> {uiLang === "ar" ? "إرسال إشعار عام" : "Global Broadcast"}</h5>
                            <div className="space-y-4">
                               <Textarea 
                                 placeholder={uiLang === "ar" ? "أكتب نص الإشعار هنا..." : "Construct signal broadcast message..."}
                                 className="bg-slate-950 border-slate-800 rounded-xl text-xs h-24"
                               />
                               <div className="flex gap-2">
                                  <Badge className="bg-slate-800 text-slate-400 h-6">All Nodes</Badge>
                                  <Badge className="bg-slate-800 text-slate-400 h-6 cursor-pointer hover:bg-blue-600 hover:text-white transition-colors">Supervisors</Badge>
                               </div>
                               <Button className="w-full bg-blue-600 rounded-xl font-bold uppercase tracking-widest text-[10px] h-12">Launch Signal</Button>
                            </div>
                         </Card>
                      </div>
                   </div>
                )}

                {activeTab === "analytics" && (
                   <div className="space-y-8">
                      <div className="flex items-center justify-between">
                         <h3 className="text-2xl font-black">{uiLang === "ar" ? "تحليل البيانات" : "Deep Analytics"}</h3>
                         <Button variant="outline" className="border-slate-800 text-slate-400 rounded-xl gap-2 font-bold"><Download size={18} /> {uiLang === "ar" ? "تصدير التقرير (Excel)" : "Extract CSV Bundle"}</Button>
                      </div>
                      <div className="p-8 bg-slate-900/50 rounded-[2.5rem] border border-slate-800 space-y-6">
                         <div className="flex items-center justify-between">
                            <div>
                               <h5 className="font-bold text-slate-300">Signal Traffic Volume</h5>
                               <p className="text-xs text-slate-500 font-mono">Real-time processing across Algerian university nodes</p>
                            </div>
                            <Badge className="bg-green-500/10 text-green-400 border-none font-bold">+12% vs LY</Badge>
                         </div>
                         <div className="h-48 w-full flex items-end gap-1 px-4">
                            {[40, 60, 45, 90, 65, 30, 85, 40, 50, 70, 95, 20, 55, 60, 40, 80].map((h, i) => (
                              <div key={i} className="flex-1 bg-blue-600/20 hover:bg-blue-600 transition-all rounded-t-lg group cursor-pointer relative" style={{ height: `${h}%` }}>
                                 <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all bg-slate-800 text-[8px] p-1 rounded font-mono">
                                    {h}K
                                 </div>
                              </div>
                            ))}
                         </div>
                         <div className="flex justify-between text-[8px] font-mono text-slate-600 uppercase px-4">
                            <span>01:00</span>
                            <span>06:00</span>
                            <span>12:00</span>
                            <span>18:00</span>
                            <span>23:59</span>
                         </div>
                      </div>
                   </div>
                )}
                
                {activeTab === "finance" && (
                   <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
                      <div className="p-6 bg-slate-900 border border-slate-800 rounded-full text-slate-600">
                         <CreditCard size={48} />
                      </div>
                      <h4 className="text-xl font-bold text-slate-400 italic">Financial Core Locked</h4>
                      <p className="max-w-xs text-xs text-slate-600 leading-relaxed uppercase tracking-widest font-mono">
                         This app is currently functioning as an academic research entity. Monetary transaction layers are disabled unless upgraded to Commercial V3.
                      </p>
                      <Button className="bg-slate-900 text-slate-500 border border-slate-800 rounded-xl" disabled>Activate Stripe Link</Button>
                   </div>
                )}

                {activeTab === "settings" && (
                   <div className="space-y-8">
                      <h3 className="text-2xl font-black">{uiLang === "ar" ? "الإعدادات التقنية" : "Core Overrides"}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="space-y-6">
                            <div className="space-y-3">
                               <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Interface Skin</label>
                               <div className="grid grid-cols-4 gap-4">
                                  {["#004d33", "#000000", "#1E40AF", "#B91C1C"].map(c => (
                                    <div key={c} className="h-10 rounded-xl border-2 border-slate-800 cursor-pointer hover:border-blue-500 transition-all" style={{ backgroundColor: c }} />
                                  ))}
                               </div>
                            </div>
                            <div className="space-y-3">
                               <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">University API Key</label>
                               <div className="relative">
                                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                                  <input type="password" value="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXX" className="w-full bg-slate-900 border-slate-800 rounded-xl py-3 pl-10 pr-4 text-[10px] font-mono outline-none" disabled />
                               </div>
                            </div>
                         </div>
                         <div className="bg-slate-900/30 border border-slate-800 rounded-[2rem] p-6 space-y-4">
                            <h5 className="font-bold text-sm flex items-center gap-2"><Trophy size={16} className="text-yellow-400" /> License Info</h5>
                            <div className="space-y-2">
                               <div className="flex justify-between text-xs">
                                  <span className="text-slate-500">Tier:</span>
                                  <span className="font-bold text-blue-400">Enterprise Research</span>
                               </div>
                               <div className="flex justify-between text-xs">
                                  <span className="text-slate-500">Expires:</span>
                                  <span className="font-bold">2027-12-31</span>
                               </div>
                               <div className="flex justify-between text-xs">
                                  <span className="text-slate-500">Cloud Host:</span>
                                  <span className="font-bold text-green-400">Active - EU North</span>
                               </div>
                            </div>
                            <Button className="w-full mt-4 bg-slate-800 hover:bg-slate-700 rounded-xl text-[10px] font-black">RENEW CERTIFICATE</Button>
                         </div>
                      </div>
                   </div>
                )}
              </div>
            </div>

            <div className="h-10 bg-black border-t border-slate-900 flex items-center justify-between px-6">
               <div className="flex items-center gap-4">
                  <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest flex items-center gap-2">
                    <Database size={10} /> DB_STATUS: OPTIMIZED
                  </span>
                  <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck size={10} /> FIREWALL: SECURE
                  </span>
               </div>
               <div className="text-[9px] font-mono text-slate-500">
                  BUILD: 2026.04.17-FINAL_SECURE
               </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
