import React, { useState, useEffect } from "react";
import { supabase } from "@/src/lib/supabase";
import { Loader2, AlertCircle, ListChecks, Search, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";

interface Item {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export function ItemsList() {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchItems();
  }, []); // المصفوفة الفارغة تعني أن الدالة ستنفذ مرة واحدة عند تحميل المكون

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const { data, error: supabaseError } = await supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false });

      if (supabaseError) throw supabaseError;
      setItems(data || []);
    } catch (err: any) {
      console.error("Error fetching items:", err);
      setError(err.message || "حدث خطأ أثناء جلب البيانات");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا العنصر؟")) return;
    
    try {
      const { error: deleteError } = await supabase
        .from('items')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (err: any) {
      alert(err.message || "فشل حذف العنصر");
    }
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 gap-4">
        <Loader2 className="animate-spin text-green-600" size={40} />
        <p className="text-gray-500 font-bold">جاري تحميل البيانات...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-600 flex items-center gap-3">
        <AlertCircle size={20} />
        <p className="font-bold">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h3 className="text-xl font-black text-[#004d33] flex items-center gap-2">
          <ListChecks /> قائمة العناصر
        </h3>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="بحث..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 pr-10 pl-4 text-sm focus:ring-2 focus:ring-green-100 outline-none transition-all text-right"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {filteredItems.map((item) => (
          <Card key={item.id} className="p-4 hover:shadow-md transition-all rounded-2xl border-gray-100 flex justify-between items-start group">
            <div className="flex-1">
              <div className="font-bold text-gray-800">{item.name}</div>
              {item.description && <div className="text-sm text-gray-500 mt-1">{item.description}</div>}
              <div className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                تمت المزامنة مع Supabase • {new Date(item.created_at).toLocaleDateString('ar-DZ')}
              </div>
            </div>
            <button 
              onClick={() => handleDelete(item.id)}
              className="text-gray-300 hover:text-red-500 p-2 transition-colors md:opacity-0 md:group-hover:opacity-100"
            >
              <Trash2 size={18} />
            </button>
          </Card>
        ))}
        {filteredItems.length === 0 && (
          <p className="text-center text-gray-400 py-10">
            {searchTerm ? "لا توجد نتائج مطابقة لبحثك." : "لا توجد عناصر حالياً."}
          </p>
        )}
      </div>
    </div>
  );
}