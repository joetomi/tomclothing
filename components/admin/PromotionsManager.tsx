'use client';

import Image from 'next/image';
import { ArrowDown, ArrowUp, Eye, EyeOff, ImagePlus, Loader2, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { Promotion } from '@/types/site';

interface PromotionsManagerProps {
  promotions: Promotion[];
  onChange: (promotions: Promotion[]) => void;
  onStageBlob: (blob: { path: string; blobSha: string }) => void;
  onDeletePath: (path: string) => void;
}

export default function PromotionsManager({ promotions, onChange, onStageBlob, onDeletePath }: PromotionsManagerProps) {
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'error' | 'warning'; text: string } | null>(null);

  const updatePromotion = (index: number, changes: Partial<Promotion>) => {
    onChange(promotions.map((promotion, promotionIndex) =>
      promotionIndex === index ? { ...promotion, ...changes } : promotion
    ));
  };

  const movePromotion = (index: number, direction: -1 | 1) => {
    const destination = index + direction;
    if (destination < 0 || destination >= promotions.length) return;
    const reordered = [...promotions];
    [reordered[index], reordered[destination]] = [reordered[destination], reordered[index]];
    onChange(reordered);
  };

  const addPromotion = () => {
    onChange([
      ...promotions,
      {
        id: `tom-story-${Date.now()}`,
        image: '',
        titleAr: 'منشور جديد',
        titleEn: 'NEW STORY',
        captionAr: '',
        captionEn: '',
        postUrl: '',
        enabled: false,
      },
    ]);
  };

  const deletePromotion = (index: number) => {
    const promotion = promotions[index];
    if (!window.confirm(`هل تريد حذف منشور «${promotion.titleAr || promotion.titleEn || index + 1}»؟`)) return;
    onChange(promotions.filter((_, promotionIndex) => promotionIndex !== index));
    if (promotion.image.startsWith('/promotions/')) onDeletePath(promotion.image);
  };

  const uploadImage = async (promotionId: string, file?: File) => {
    if (!file) return;
    setUploadingId(promotionId);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('kind', 'promotion');
      const response = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'فشل رفع صورة المنشور');
      if (data.blobSha && data.path) onStageBlob({ path: data.path, blobSha: data.blobSha });
      const currentIndex = promotions.findIndex((promotion) => promotion.id === promotionId);
      if (currentIndex !== -1) updatePromotion(currentIndex, { image: data.url });
      if (data.warning) setMessage({ type: 'warning', text: data.warning });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border border-tom-stone bg-white p-5">
        <div>
          <h3 className="font-serif text-xl text-tom-black">إدارة قصص TOM</h3>
          <p className="mt-1 text-xs leading-6 text-tom-darkMuted">
            ترتيب البطاقات هنا هو ترتيب ظهورها في البانر. المنشور المعطّل يبقى محفوظًا ولا يظهر للزوار.
          </p>
        </div>
        <button type="button" onClick={addPromotion} className="inline-flex items-center gap-2 bg-tom-black px-4 py-2.5 text-xs font-semibold text-white">
          <Plus className="h-4 w-4" />
          إضافة منشور
        </button>
      </div>

      {message && (
        <div className={`border px-4 py-3 text-xs ${message.type === 'error' ? 'border-rose-300 bg-rose-50 text-rose-800' : 'border-amber-300 bg-amber-50 text-amber-800'}`}>
          {message.text}
        </div>
      )}

      {promotions.length === 0 && (
        <div className="border border-dashed border-tom-border bg-white px-6 py-12 text-center text-sm text-tom-darkMuted">
          لا توجد منشورات. لن يظهر قسم القصص في الموقع حتى تضيف منشورًا وتفعّله.
        </div>
      )}

      {promotions.map((promotion, index) => (
        <article key={promotion.id} className="grid gap-6 border border-tom-stone bg-white p-5 lg:grid-cols-[260px_1fr]">
          <div className="space-y-3">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-tom-sand">
              {promotion.image ? (
                <Image src={promotion.image} alt={promotion.titleAr || promotion.titleEn} fill sizes="260px" className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center px-6 text-center text-xs leading-6 text-tom-darkMuted">
                  ارفع صورة المنشور قبل تفعيله
                </div>
              )}
              <span className="absolute right-3 top-3 rounded-full bg-black/70 px-3 py-1 text-[10px] text-white backdrop-blur-sm">#{index + 1}</span>
            </div>
            <label className="flex cursor-pointer items-center justify-center gap-2 bg-tom-black px-4 py-2.5 text-xs font-semibold text-white">
              {uploadingId === promotion.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
              {uploadingId === promotion.id ? 'جاري تجهيز الصورة...' : promotion.image ? 'تبديل الصورة' : 'رفع الصورة'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={uploadingId !== null}
                className="hidden"
                onChange={(event) => {
                  void uploadImage(promotion.id, event.target.files?.[0]);
                  event.target.value = '';
                }}
              />
            </label>
            <p className="break-all text-[10px] text-tom-muted">{promotion.image || 'لا توجد صورة'}</p>
          </div>

          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-tom-stone pb-4">
              <button
                type="button"
                onClick={() => updatePromotion(index, { enabled: !promotion.enabled })}
                disabled={!promotion.image && !promotion.enabled}
                className={`inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-40 ${promotion.enabled ? 'bg-emerald-950 text-emerald-100' : 'bg-tom-sand text-tom-darkMuted'}`}
              >
                {promotion.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                {promotion.enabled ? 'ظاهر في الموقع' : 'مخفي'}
              </button>

              <div className="flex items-center gap-2">
                <button type="button" onClick={() => movePromotion(index, -1)} disabled={index === 0} className="border border-tom-stone p-2 disabled:opacity-25" aria-label="نقل المنشور إلى الأعلى"><ArrowUp className="h-4 w-4" /></button>
                <button type="button" onClick={() => movePromotion(index, 1)} disabled={index === promotions.length - 1} className="border border-tom-stone p-2 disabled:opacity-25" aria-label="نقل المنشور إلى الأسفل"><ArrowDown className="h-4 w-4" /></button>
                <button type="button" onClick={() => deletePromotion(index)} className="inline-flex items-center gap-2 bg-rose-700 px-3 py-2 text-xs font-semibold text-white"><Trash2 className="h-4 w-4" />حذف</button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1.5 text-xs font-semibold text-tom-black">
                <span>العنوان العربي</span>
                <input value={promotion.titleAr} onChange={(event) => updatePromotion(index, { titleAr: event.target.value })} className="w-full border border-tom-stone px-3 py-2.5 text-sm font-normal" dir="rtl" />
              </label>
              <label className="space-y-1.5 text-xs font-semibold text-tom-black">
                <span>العنوان الإنجليزي</span>
                <input value={promotion.titleEn} onChange={(event) => updatePromotion(index, { titleEn: event.target.value })} className="w-full border border-tom-stone px-3 py-2.5 text-sm font-normal" dir="ltr" />
              </label>
              <label className="space-y-1.5 text-xs font-semibold text-tom-black">
                <span>الوصف العربي</span>
                <textarea rows={3} value={promotion.captionAr} onChange={(event) => updatePromotion(index, { captionAr: event.target.value })} className="w-full resize-none border border-tom-stone px-3 py-2.5 text-sm font-normal leading-6" dir="rtl" />
              </label>
              <label className="space-y-1.5 text-xs font-semibold text-tom-black">
                <span>الوصف الإنجليزي</span>
                <textarea rows={3} value={promotion.captionEn} onChange={(event) => updatePromotion(index, { captionEn: event.target.value })} className="w-full resize-none border border-tom-stone px-3 py-2.5 text-sm font-normal leading-6" dir="ltr" />
              </label>
            </div>

            <label className="block space-y-1.5 text-xs font-semibold text-tom-black">
              <span>رابط المنشور أو الحملة</span>
              <input type="url" value={promotion.postUrl} onChange={(event) => updatePromotion(index, { postUrl: event.target.value })} placeholder="https://www.instagram.com/p/..." className="w-full border border-tom-stone px-3 py-2.5 text-sm font-normal" dir="ltr" />
            </label>
          </div>
        </article>
      ))}
    </div>
  );
}
