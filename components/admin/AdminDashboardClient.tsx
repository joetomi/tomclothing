'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { SiteConfig, EditorialScene, Branch, MediaItem, SceneType } from '@/types/site';
import FocalPointEditor from './FocalPointEditor';
import MediaManager from './MediaManager';
import AdminLivePreview from './AdminLivePreview';
import PromotionsManager from './PromotionsManager';
import {
  Save,
  Eye,
  LogOut,
  Plus,
  Trash2,
  Layers,
  Image as ImageIcon,
  Store,
  Phone,
  Globe,
  CheckCircle,
  AlertCircle,
  Sparkles,
  GalleryHorizontalEnd,
} from 'lucide-react';

interface AdminDashboardClientProps {
  initialContent: SiteConfig;
  initialSha?: string;
}

export default function AdminDashboardClient({ initialContent, initialSha }: AdminDashboardClientProps) {
  const [config, setConfig] = useState<SiteConfig>(initialContent);
  const [activeTab, setActiveTab] = useState<'hero' | 'stories' | 'scenes' | 'gallery' | 'branches' | 'contact' | 'media'>('hero');
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [contentSha, setContentSha] = useState(initialSha);

  // Staged GitHub Git Blob metadata (path & blobSha) created on upload without commit
  const [stagedBlobs, setStagedBlobs] = useState<Array<{ path: string; blobSha: string }>>([]);
  const [deletedPaths, setDeletedPaths] = useState<string[]>([]);

  const [editingFocalItem, setEditingFocalItem] = useState<{
    src: string;
    focalPoint: { desktop: { x: number; y: number }; mobile: { x: number; y: number } };
    sceneType?: SceneType;
    splitRatio?: string;
    onSave: (fp: { desktop: { x: number; y: number }; mobile: { x: number; y: number } }) => void;
  } | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/admin/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteConfig: config,
          stagedBlobs,
          deletedPaths,
          sha: contentSha,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'فشل حفظ التعديلات');
      }

      setStagedBlobs([]); // Clear staging queue after atomic commit
      setDeletedPaths([]);
      if (data.sha) setContentSha(data.sha);
      setStatusMessage({
        type: 'success',
        text: data.message || 'تم حفظ التعديلات وإنشاء Commit موحد بنجاح على GitHub!',
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/auth', {
      method: 'POST',
      body: JSON.stringify({ action: 'logout' }),
    });
    window.location.href = '/admin/login';
  };

  const allMediaList = [
    { id: 'hero-img', src: config.hero.image, caption: 'صورة الواجهة (Hero)' },
    ...config.promotions.filter((promotion) => promotion.image).map((promotion) => ({ id: promotion.id, src: promotion.image, caption: promotion.titleAr })),
    ...config.editorialScenes.flatMap((s) => s.images.map((img) => ({ id: img.id, src: img.src, caption: img.caption }))),
    ...config.gallery.map((g) => ({ id: g.id, src: g.src, caption: g.caption })),
  ];

  return (
    <div className="min-h-screen bg-tom-sand text-tom-black flex flex-col dir-rtl text-right font-sans">
      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-tom-black text-white px-6 py-4 border-b border-tom-charcoal flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative h-8 w-24">
            <Image src="/brand/logo-white.svg" alt="TOM Logo" fill className="object-contain" />
          </div>
          <span className="text-xs tracking-widest text-tom-muted uppercase border-r border-tom-charcoal pr-4">
            لوحة الإدارة — Serverless GitHub Blob CMS
          </span>
          <span className={`inline-flex items-center gap-1.5 text-[11px] ${contentSha ? 'text-emerald-300' : 'text-rose-300'}`}>
            {contentSha ? <CheckCircle className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
            {contentSha ? 'GitHub متصل' : 'GitHub غير متصل'}
          </span>
          {stagedBlobs.length > 0 && (
            <span className="text-xs font-mono bg-amber-500 text-black px-2.5 py-0.5 font-bold">
              {stagedBlobs.length} GitHub Blobs مؤجلة للحفظ الموحد
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowLivePreview(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-tom-charcoal text-white text-xs hover:bg-white hover:text-tom-black transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>معاينة وتعديل الصفحة</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-white text-tom-black text-xs font-semibold uppercase tracking-wider hover:bg-tom-stone transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'جاري إنشاء Commit موحد...' : 'حفظ التغيرات (Atomic Save)'}</span>
          </button>

          <button
            onClick={handleLogout}
            className="p-2 text-tom-muted hover:text-white transition-colors"
            title="تسجيل الخروج"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {showLivePreview && (
        <AdminLivePreview
          config={config}
          onChange={setConfig}
          onStageBlob={(blob) => setStagedBlobs((current) => [...current.filter((item) => item.path !== blob.path), blob])}
          onDeletePath={(path) => setDeletedPaths((current) => current.includes(path) ? current : [...current, path])}
          onSave={handleSave}
          saving={saving}
          onClose={() => setShowLivePreview(false)}
        />
      )}

      {/* Notification Banner */}
      {statusMessage && (
        <div
          className={`px-6 py-3 text-xs flex items-center justify-between border-b ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950 text-emerald-200 border-emerald-800'
              : 'bg-rose-950 text-rose-200 border-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
            <span className="whitespace-pre-line">{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-xs underline opacity-80 hover:opacity-100">
            إغلاق
          </button>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-10 space-y-8">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-tom-stone pb-4">
          <button
            onClick={() => setActiveTab('hero')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs tracking-wider transition-colors ${
              activeTab === 'hero' ? 'bg-tom-black text-white' : 'bg-white text-tom-black hover:bg-tom-paper'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>الواجهة الرئيسية (Hero)</span>
          </button>

          <button
            onClick={() => setActiveTab('stories')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs tracking-wider transition-colors ${
              activeTab === 'stories' ? 'bg-tom-black text-white' : 'bg-white text-tom-black hover:bg-tom-paper'
            }`}
          >
            <GalleryHorizontalEnd className="w-4 h-4" />
            <span>قصص TOM ({config.promotions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('scenes')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs tracking-wider transition-colors ${
              activeTab === 'scenes' ? 'bg-tom-black text-white' : 'bg-white text-tom-black hover:bg-tom-paper'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>المشاهد التحريرية (Editorial Scenes)</span>
          </button>

          <button
            onClick={() => setActiveTab('gallery')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs tracking-wider transition-colors ${
              activeTab === 'gallery' ? 'bg-tom-black text-white' : 'bg-white text-tom-black hover:bg-tom-paper'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>معرض التشكيلة ({config.gallery.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('branches')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs tracking-wider transition-colors ${
              activeTab === 'branches' ? 'bg-tom-black text-white' : 'bg-white text-tom-black hover:bg-tom-paper'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>الفروع والمحلات ({config.branches.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('contact')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs tracking-wider transition-colors ${
              activeTab === 'contact' ? 'bg-tom-black text-white' : 'bg-white text-tom-black hover:bg-tom-paper'
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>التواصل و SEO</span>
          </button>

          <button
            onClick={() => setActiveTab('media')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs tracking-wider transition-colors ${
              activeTab === 'media' ? 'bg-tom-black text-white' : 'bg-white text-tom-black hover:bg-tom-paper'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>مكتبة الوسائط والرفع</span>
          </button>
        </div>

        {/* Modal Viewport Focal Point Editor */}
        {editingFocalItem && (
          <div className="bg-white border-2 border-tom-black p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-tom-stone pb-3">
              <h4 className="text-sm font-semibold">محرر مركز التركيز البصري (Viewport Accurate Focal Point)</h4>
              <button
                onClick={() => setEditingFocalItem(null)}
                className="text-xs text-rose-600 font-semibold hover:underline"
              >
                إغلاق المحرر ✕
              </button>
            </div>
            <FocalPointEditor
              imageSrc={editingFocalItem.src}
              focalPoints={editingFocalItem.focalPoint}
              sceneType={editingFocalItem.sceneType}
              splitRatio={editingFocalItem.splitRatio}
              onChange={(newFp) => {
                editingFocalItem.onSave(newFp);
                setEditingFocalItem({
                  ...editingFocalItem,
                  focalPoint: newFp,
                });
              }}
            />
          </div>
        )}

        {/* TAB 1: HERO */}
        {activeTab === 'hero' && (
          <div className="bg-white border border-tom-stone p-6 space-y-6">
            <h3 className="text-xl font-serif text-tom-black border-b border-tom-stone pb-3">
              إعدادات الواجهة الرئيسية (Hero Section)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-tom-black block mb-1">
                    عنوان الصورة الرئيسي (Main Title)
                  </label>
                  <input
                    type="text"
                    value={config.hero.title}
                    onChange={(e) => setConfig({ ...config, hero: { ...config.hero, title: e.target.value } })}
                    className="w-full px-3 py-2 border border-tom-stone text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-tom-black block mb-1">
                    العنوان الفرعي (Subtitle)
                  </label>
                  <input
                    type="text"
                    value={config.hero.subtitle}
                    onChange={(e) => setConfig({ ...config, hero: { ...config.hero, subtitle: e.target.value } })}
                    className="w-full px-3 py-2 border border-tom-stone text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-tom-black block mb-1">
                    نص رابط الحركة (Action Text)
                  </label>
                  <input
                    type="text"
                    value={config.hero.actionText}
                    onChange={(e) => setConfig({ ...config, hero: { ...config.hero, actionText: e.target.value } })}
                    className="w-full px-3 py-2 border border-tom-stone text-sm"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-tom-black block mb-1">
                    مسار صورة Hero الرئيسية
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={config.hero.image}
                      onChange={(e) => setConfig({ ...config, hero: { ...config.hero, image: e.target.value } })}
                      className="flex-1 px-3 py-2 border border-tom-stone text-sm font-mono"
                    />
                    <button
                      onClick={() =>
                        setEditingFocalItem({
                          src: config.hero.image,
                          focalPoint: config.hero.focalPoint,
                          sceneType: 'full-screen',
                          onSave: (fp) => setConfig({ ...config, hero: { ...config.hero, focalPoint: fp } }),
                        })
                      }
                      className="px-3 py-2 bg-tom-black text-white text-xs hover:bg-tom-charcoal"
                    >
                      ضبط Focal Point
                    </button>
                  </div>
                </div>

                <div className="relative w-full aspect-[16/9] bg-tom-sand border border-tom-stone overflow-hidden">
                  <Image
                    src={config.hero.image}
                    alt="Hero Preview"
                    fill
                    style={{
                      objectFit: 'cover',
                      objectPosition: `${config.hero.focalPoint.desktop.x}% ${config.hero.focalPoint.desktop.y}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TOM STORIES */}
        {activeTab === 'stories' && (
          <PromotionsManager
            promotions={config.promotions}
            onChange={(promotions) => setConfig({ ...config, promotions })}
            onStageBlob={(blob) => setStagedBlobs((current) => [...current.filter((item) => item.path !== blob.path), blob])}
            onDeletePath={(path) => setDeletedPaths((current) => current.includes(path) ? current : [...current, path])}
          />
        )}

        {/* TAB 2: EDITORIAL SCENES */}
        {activeTab === 'scenes' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 border border-tom-stone">
              <div>
                <h3 className="text-lg font-serif text-tom-black">المشاهد التحريرية (Editorial Scenes)</h3>
                <p className="text-xs text-tom-muted">التحكم في تسلسل السرد البصري وأنواع التكوينات.</p>
              </div>
              <button
                onClick={() => {
                  const newScene: EditorialScene = {
                    id: `scene-${Date.now()}`,
                    type: 'split-screen',
                    splitRatio: '50/50',
                    visible: true,
                    order: config.editorialScenes.length + 1,
                    title: 'مشهد جديد',
                    images: [
                      {
                        id: `img-${Date.now()}-1`,
                        src: '/uploads/look-01.jpg',
                        alt: 'صورة',
                        focalPoint: { desktop: { x: 50, y: 50 }, mobile: { x: 50, y: 50 } },
                      },
                    ],
                  };
                  setConfig({ ...config, editorialScenes: [...config.editorialScenes, newScene] });
                }}
                className="flex items-center gap-2 px-4 py-2 bg-tom-black text-white text-xs"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة مشهد جديد</span>
              </button>
            </div>

            {config.editorialScenes.map((scene, idx) => (
              <div key={scene.id} className="bg-white border border-tom-stone p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-tom-stone pb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono bg-tom-sand px-2 py-1">#{idx + 1}</span>
                    <input
                      type="text"
                      value={scene.title || ''}
                      placeholder="عنوان المشهد..."
                      onChange={(e) => {
                        const updated = [...config.editorialScenes];
                        updated[idx].title = e.target.value;
                        setConfig({ ...config, editorialScenes: updated });
                      }}
                      className="font-serif text-lg border-b border-dashed border-tom-stone focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={scene.type}
                      onChange={(e) => {
                        const updated = [...config.editorialScenes];
                        updated[idx].type = e.target.value as any;
                        setConfig({ ...config, editorialScenes: updated });
                      }}
                      className="px-3 py-1 bg-tom-sand border border-tom-stone text-xs"
                    >
                      <option value="full-width-natural">Full Width Natural (بدون قص)</option>
                      <option value="full-screen-cover">Full Screen Cover (شاشة كاملة)</option>
                      <option value="portrait-natural">Portrait Natural (صورة عمودية كاملة)</option>
                      <option value="split">Split (صورتان)</option>
                      <option value="asymmetric">Asymmetric (تكوين غير متماثل)</option>
                      <option value="inset-editorial">Inset Editorial (هامش مقصود)</option>
                      <option value="brand-overlay">Brand Overlay (شعار فوق الصورة)</option>
                      <option value="sequence">Sequence (تسلسل تنقل)</option>
                    </select>

                    <button
                      onClick={() => {
                        const updated = config.editorialScenes.filter((_, sIdx) => sIdx !== idx);
                        setConfig({ ...config, editorialScenes: updated });
                      }}
                      className="p-1.5 text-rose-600 hover:bg-rose-50"
                      title="حذف المشهد"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                  {scene.images.map((img, imgIdx) => (
                    <div key={img.id} className="border border-tom-stone p-3 space-y-2 bg-tom-sand/30">
                      <div className="relative w-full aspect-[3/4] bg-tom-sand border border-tom-stone overflow-hidden">
                        <Image
                          src={img.src}
                          alt={img.alt || ''}
                          fill
                          style={{
                            objectFit: 'cover',
                            objectPosition: `${img.focalPoint.desktop.x}% ${img.focalPoint.desktop.y}%`,
                          }}
                        />
                      </div>

                      <input
                        type="text"
                        value={img.src}
                        onChange={(e) => {
                          const updated = [...config.editorialScenes];
                          updated[idx].images[imgIdx].src = e.target.value;
                          setConfig({ ...config, editorialScenes: updated });
                        }}
                        className="w-full text-xs font-mono px-2 py-1 border border-tom-stone"
                      />

                      <button
                        onClick={() =>
                          setEditingFocalItem({
                            src: img.src,
                            focalPoint: img.focalPoint,
                            sceneType: scene.type,
                            splitRatio: scene.splitRatio,
                            onSave: (fp) => {
                              const updated = [...config.editorialScenes];
                              updated[idx].images[imgIdx].focalPoint = fp;
                              setConfig({ ...config, editorialScenes: updated });
                            },
                          })
                        }
                        className="w-full py-1 bg-tom-black text-white text-[11px]"
                      >
                        ضبط نقطة التركيز (Scene Viewport)
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: GALLERY */}
        {activeTab === 'gallery' && (
          <div className="bg-white border border-tom-stone p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-tom-stone pb-3">
              <h3 className="text-xl font-serif text-tom-black">معرض التشكيلة (Gallery Items)</h3>
              <button
                onClick={() => {
                  const newItem = {
                    id: `gal-${Date.now()}`,
                    src: '/uploads/look-01.jpg',
                    alt: 'إطلالة جديدة',
                    caption: 'وصف الإطلالة',
                    visible: true,
                    order: config.gallery.length + 1,
                  };
                  setConfig({ ...config, gallery: [...config.gallery, newItem] });
                }}
                className="flex items-center gap-2 px-4 py-2 bg-tom-black text-white text-xs"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة صورة جديدة</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {config.gallery.map((item, idx) => (
                <div key={item.id} className="border border-tom-stone p-4 space-y-3 bg-tom-paper">
                  <div className="relative w-full aspect-[3/4] bg-tom-sand overflow-hidden">
                    <Image src={item.src} alt={item.alt || ''} fill className="object-cover" />
                  </div>

                  <input
                    type="text"
                    value={item.src}
                    onChange={(e) => {
                      const updated = [...config.gallery];
                      updated[idx].src = e.target.value;
                      setConfig({ ...config, gallery: updated });
                    }}
                    className="w-full text-xs font-mono px-2 py-1 border border-tom-stone"
                  />

                  <input
                    type="text"
                    value={item.caption || ''}
                    placeholder="وصف الصورة..."
                    onChange={(e) => {
                      const updated = [...config.gallery];
                      updated[idx].caption = e.target.value;
                      setConfig({ ...config, gallery: updated });
                    }}
                    className="w-full text-xs px-2 py-1 border border-tom-stone"
                  />

                  <div className="flex items-center justify-between pt-2 border-t border-tom-stone">
                    <label className="text-xs flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={item.visible}
                        onChange={(e) => {
                          const updated = [...config.gallery];
                          updated[idx].visible = e.target.checked;
                          setConfig({ ...config, gallery: updated });
                        }}
                      />
                      <span>عرض</span>
                    </label>

                    <button
                      onClick={() => {
                        const targetSrc = item.src;
                        const updated = config.gallery.filter((_, gIdx) => gIdx !== idx);
                        setConfig({ ...config, gallery: updated });
                        if (targetSrc.startsWith('/uploads/')) {
                          setDeletedPaths((prev) => [...prev, targetSrc]);
                        }
                      }}
                      className="text-xs text-rose-600 hover:underline"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: BRANCHES */}
        {activeTab === 'branches' && (
          <div className="bg-white border border-tom-stone p-6 space-y-6">
            <h3 className="text-xl font-serif text-tom-black border-b border-tom-stone pb-3">
              إدارة الفروع والمحلات (Boutique Stores)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {config.branches.map((branch, idx) => (
                <div key={branch.id} className="border border-tom-stone p-6 space-y-4 bg-tom-paper">
                  <div className="flex justify-between items-center border-b border-tom-stone pb-3">
                    <h4 className="text-lg font-serif font-semibold">{branch.name}</h4>
                    <select
                      value={branch.status}
                      onChange={(e) => {
                        const updated = [...config.branches];
                        updated[idx].status = e.target.value as any;
                        setConfig({ ...config, branches: updated });
                      }}
                      className="px-2 py-1 bg-white border border-tom-stone text-xs font-semibold"
                    >
                      <option value="open">مفتوح (Open)</option>
                      <option value="coming-soon">قريباً (Coming Soon)</option>
                      <option value="hidden">مخفي (Hidden)</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-tom-darkMuted block mb-1">المدينة</label>
                      <input
                        type="text"
                        value={branch.city}
                        onChange={(e) => {
                          const updated = [...config.branches];
                          updated[idx].city = e.target.value;
                          setConfig({ ...config, branches: updated });
                        }}
                        className="w-full px-3 py-1.5 border border-tom-stone text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-tom-darkMuted block mb-1">العنوان التفصيلي</label>
                      <input
                        type="text"
                        value={branch.address}
                        onChange={(e) => {
                          const updated = [...config.branches];
                          updated[idx].address = e.target.value;
                          setConfig({ ...config, branches: updated });
                        }}
                        className="w-full px-3 py-1.5 border border-tom-stone text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-tom-darkMuted block mb-1">رقم الهاتف</label>
                      <input
                        type="text"
                        value={branch.phone}
                        onChange={(e) => {
                          const updated = [...config.branches];
                          updated[idx].phone = e.target.value;
                          setConfig({ ...config, branches: updated });
                        }}
                        className="w-full px-3 py-1.5 border border-tom-stone text-sm font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-tom-darkMuted block mb-1">رابط Google Maps</label>
                      <input
                        type="text"
                        value={branch.mapsUrl}
                        onChange={(e) => {
                          const updated = [...config.branches];
                          updated[idx].mapsUrl = e.target.value;
                          setConfig({ ...config, branches: updated });
                        }}
                        className="w-full px-3 py-1.5 border border-tom-stone text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: CONTACT & SEO */}
        {activeTab === 'contact' && (
          <div className="bg-white border border-tom-stone p-6 space-y-6">
            <h3 className="text-xl font-serif text-tom-black border-b border-tom-stone pb-3">
              إعدادات التواصل ومحركات البحث (SEO & Contact)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-tom-black">معلومات التواصل المباشرة</h4>
                <div>
                  <label className="text-xs text-tom-darkMuted block mb-1">رقم الهاتف للمكالمات</label>
                  <input
                    type="text"
                    value={config.contact.phone}
                    onChange={(e) => setConfig({ ...config, contact: { ...config.contact, phone: e.target.value } })}
                    className="w-full px-3 py-2 border border-tom-stone text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs text-tom-darkMuted block mb-1">رقم واتساب العرض</label>
                  <input
                    type="text"
                    value={config.contact.whatsappDisplay}
                    onChange={(e) =>
                      setConfig({ ...config, contact: { ...config.contact, whatsappDisplay: e.target.value } })
                    }
                    className="w-full px-3 py-2 border border-tom-stone text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs text-tom-darkMuted block mb-1">رابط إنستغرام (Instagram)</label>
                  <input
                    type="text"
                    value={config.contact.instagram || ''}
                    onChange={(e) =>
                      setConfig({ ...config, contact: { ...config.contact, instagram: e.target.value } })
                    }
                    className="w-full px-3 py-2 border border-tom-stone text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs text-tom-darkMuted block mb-1">رابط تيك توك (TikTok)</label>
                  <input
                    type="text"
                    value={config.contact.tiktok || ''}
                    onChange={(e) =>
                      setConfig({ ...config, contact: { ...config.contact, tiktok: e.target.value } })
                    }
                    className="w-full px-3 py-2 border border-tom-stone text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs text-tom-darkMuted block mb-1">رابط تلغرام (Telegram)</label>
                  <input
                    type="text"
                    value={config.contact.telegram || ''}
                    onChange={(e) =>
                      setConfig({ ...config, contact: { ...config.contact, telegram: e.target.value } })
                    }
                    className="w-full px-3 py-2 border border-tom-stone text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-tom-black">محركات البحث (SEO Metadata)</h4>
                <div>
                  <label className="text-xs text-tom-darkMuted block mb-1">عنوان الصفحة (Meta Title)</label>
                  <input
                    type="text"
                    value={config.seo.title}
                    onChange={(e) => setConfig({ ...config, seo: { ...config.seo, title: e.target.value } })}
                    className="w-full px-3 py-2 border border-tom-stone text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs text-tom-darkMuted block mb-1">وصف الصفحة (Meta Description)</label>
                  <textarea
                    rows={3}
                    value={config.seo.description}
                    onChange={(e) => setConfig({ ...config, seo: { ...config.seo, description: e.target.value } })}
                    className="w-full px-3 py-2 border border-tom-stone text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: MEDIA MANAGER */}
        {activeTab === 'media' && (
          <MediaManager
            images={allMediaList}
            onUploadSuccess={(newUrl, blobSha, repoPath) => {
              if (blobSha && repoPath) {
                setStagedBlobs((prev) => [...prev, { path: repoPath, blobSha }]);
              }
              const newItem = {
                id: `gal-${Date.now()}`,
                src: newUrl,
                alt: 'صورة مرفوعة',
                caption: '',
                visible: true,
                order: config.gallery.length + 1,
              };
              setConfig({ ...config, gallery: [newItem, ...config.gallery] });
            }}
            onDeleteImage={(targetSrc) => {
              if (targetSrc.startsWith('/uploads/')) {
                setDeletedPaths((prev) => [...prev, targetSrc]);
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
