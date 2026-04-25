import React, { useState, useEffect } from "react";
import { Loader2, AlertCircle, ListChecks } from "lucide-react";
import { Card } from "@/components/ui/card";
import { type UILang } from "@/src/lib/translations";

interface Item {
  id: string;
  created_at: string;
  title: string;
  content: string;
  image_url?: string;
}

export function ItemsList({ items, uiLang }: { items: Item[], uiLang: UILang }) {
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
            <div className="text-[10px] text-gray-400 mt-1">{uiLang === 'ar' ? 'تاريخ الإضافة' : 'Added on'}: {new Date(item.created_at).toLocaleDateString(uiLang === 'ar' ? 'ar-DZ' : 'en-US')}</div>
          </Card>
        ))}
        {items.length === 0 && <p className="text-center text-gray-400 py-10">لا توجد عناصر حالياً.</p>}
      </div>
    </div>
  );
}