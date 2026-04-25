import React, { useState, useEffect } from "react";
import { supabase } from "@/src/lib/supabase";
import { Loader2, AlertCircle, ListChecks } from "lucide-react";
import { Card } from "@/components/ui/card";

interface Item {
  id: number;
  created_at: string;
  title: string;
  content: string;
  image_url?: string;
}

export function ItemsList() {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true);
      try {
        // جلب البيانات من جدول 'items'
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

    fetchItems();
  }, []); // المصفوفة الفارغة تعني أن الدالة ستنفذ مرة واحدة عند تحميل المكون

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
      <h3 className="text-xl font-black text-[#004d33] flex items-center gap-2 mb-6">
        <ListChecks /> قائمة العناصر
      </h3>
      <div className="grid grid-cols-1 gap-3">
        {items.map((item) => (
          <Card key={item.id} className="p-4 hover:shadow-md transition-shadow rounded-2xl border-gray-100">
            <div className="font-bold text-gray-800">{item.title}</div>
            {item.image_url && <img src={item.image_url} alt={item.title} className="w-full h-48 object-cover rounded-xl my-2" />}
            <p className="text-gray-600 text-sm mt-2 line-clamp-2">{item.content}</p>
            <div className="text-[10px] text-gray-400 mt-1">تاريخ الإضافة: {new Date(item.created_at).toLocaleDateString('ar-DZ')}</div>
          </Card>
        ))}
        {items.length === 0 && <p className="text-center text-gray-400 py-10">لا توجد عناصر حالياً.</p>}
      </div>
    </div>
  );
}