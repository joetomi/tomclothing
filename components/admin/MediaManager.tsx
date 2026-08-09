'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Upload, Trash2, AlertTriangle } from 'lucide-react';

interface MediaManagerProps {
  images: Array<{ id: string; src: string; caption?: string }>;
  onSelectImage?: (src: string) => void;
  onUploadSuccess: (newUrl: string, blobSha?: string, repoPath?: string) => void;
  onDeleteImage?: (src: string) => void;
}

export default function MediaManager({
  images,
  onSelectImage,
  onUploadSuccess,
  onDeleteImage,
}: MediaManagerProps) {
  const [uploading, setUploading] = useState(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setWarningMessage(null);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'فشل رفع الصورة');
      }

      if (data.warning) {
        setWarningMessage(data.warning);
      }

      // Pass URL, blobSha, and repoPath to parent for atomic staging
      onUploadSuccess(data.url, data.blobSha, data.path);
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="bg-white border border-tom-stone p-6 space-y-6 text-right">
      <div className="flex items-center justify-between border-b border-tom-stone pb-4">
        <div>
          <h3 className="text-xl font-serif text-tom-black font-semibold">
            مكتبة الوسائط والـ Staged Git Blobs
          </h3>
          <p className="text-xs text-tom-darkMuted">
            عند رفع صورة، يتم إنشاء GitHub Git Blob مؤجل وتجهيزه للحفظ الموحد دون إنشاء Commit أو تشغيل بناء Vercel حتى تضغطي على Save.
          </p>
        </div>

        <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-tom-black text-white text-xs uppercase tracking-wider hover:bg-tom-charcoal transition-colors">
          <Upload className="w-4 h-4 stroke-[1.5]" />
          <span>{uploading ? 'جاري إنشاء Git Blob...' : 'رفع صورة جديدة'}</span>
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {warningMessage && (
        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2 justify-end">
          <span>{warningMessage}</span>
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
        </div>
      )}
      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 justify-end">
          <span>{errorMessage}</span>
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {images.map((img, idx) => (
          <div
            key={img.id || idx}
            className="group relative bg-tom-sand border border-tom-stone overflow-hidden aspect-[3/4] cursor-pointer"
            onClick={() => onSelectImage && onSelectImage(img.src)}
          >
            <Image
              src={img.src}
              alt={img.caption || 'TOM Media asset'}
              fill
              sizes="(max-width: 768px) 50vw, 20vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
              {onSelectImage && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectImage(img.src);
                  }}
                  className="p-1.5 bg-white text-tom-black text-xs px-2 py-1 font-sans"
                >
                  اختيار
                </button>
              )}
              {onDeleteImage && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteImage(img.src);
                  }}
                  className="p-1.5 bg-rose-600 text-white rounded-none hover:bg-rose-700"
                  aria-label="حذف الصورة"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
