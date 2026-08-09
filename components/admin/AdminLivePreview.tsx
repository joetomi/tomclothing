'use client';

import { useRef, useState } from 'react';
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Save, Trash2, X } from 'lucide-react';
import type { SiteConfig } from '@/types/site';
import Hero from '@/components/public/Hero';
import EditorialScene from '@/components/public/EditorialScene';
import AboutSection from '@/components/public/AboutSection';
import StoresSection from '@/components/public/StoresSection';
import ContactSection from '@/components/public/ContactSection';
import Footer from '@/components/public/Footer';

type Target = { kind: 'hero' } | { kind: 'scene'; sceneIndex: number; imageIndex: number };

interface Props {
  config: SiteConfig;
  onChange: (config: SiteConfig) => void;
  onStageBlob: (blob: { path: string; blobSha: string }) => void;
  onDeletePath: (path: string) => void;
  onSave: () => void;
  saving: boolean;
  onClose: () => void;
}

export default function AdminLivePreview({ config, onChange, onStageBlob, onDeletePath, onSave, saving, onClose }: Props) {
  const [selected, setSelected] = useState<Target | null>(null);
  const [replaceTarget, setReplaceTarget] = useState<Target | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const sameTarget = (a: Target | null, b: Target) => {
    if (!a || a.kind !== b.kind) return false;
    return a.kind === 'hero' || (b.kind === 'scene' && a.sceneIndex === b.sceneIndex && a.imageIndex === b.imageIndex);
  };

  const requestReplace = (target: Target) => {
    setReplaceTarget(target);
    inputRef.current?.click();
  };

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !replaceTarget) return;
    setUploading(true);
    setError('');
    try {
      const form = new FormData();
      form.append('file', file);
      const response = await fetch('/api/admin/upload', { method: 'POST', body: form });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'فشل رفع الصورة');
      if (data.blobSha && data.path) onStageBlob({ path: data.path, blobSha: data.blobSha });

      if (replaceTarget.kind === 'hero') {
        onChange({ ...config, hero: { ...config.hero, image: data.url, mobileImage: data.url, visible: true } });
      } else {
        const scenes = config.editorialScenes.map((scene, sceneIndex) => sceneIndex !== replaceTarget.sceneIndex ? scene : {
          ...scene,
          images: scene.images.map((image, imageIndex) => imageIndex !== replaceTarget.imageIndex ? image : {
            ...image,
            src: data.url,
            width: data.width,
            height: data.height,
          }),
        });
        onChange({ ...config, editorialScenes: scenes });
      }
    } catch (uploadError: any) {
      setError(uploadError.message);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const deleteTarget = (target: Target) => {
    if (target.kind === 'hero') {
      const source = config.hero.image;
      const fallbackOg = config.editorialScenes.flatMap((scene) => scene.images)[0]?.src || '';
      onChange({
        ...config,
        hero: { ...config.hero, image: '', mobileImage: undefined, visible: false },
        gallery: config.gallery.filter((item) => item.src !== source && item.mobileImage !== source),
        seo: { ...config.seo, ogImage: config.seo.ogImage === source ? fallbackOg : config.seo.ogImage },
      });
      if (source.startsWith('/uploads/')) onDeletePath(source);
    } else {
      const source = config.editorialScenes[target.sceneIndex]?.images[target.imageIndex]?.src || '';
      const scenes = config.editorialScenes.flatMap((scene, sceneIndex) => {
        if (sceneIndex !== target.sceneIndex) return [scene];
        const images = scene.images.filter((_, imageIndex) => imageIndex !== target.imageIndex);
        return images.length ? [{ ...scene, images }] : [];
      }).map((scene, order) => ({ ...scene, order: order + 1 }));
      onChange({
        ...config,
        editorialScenes: scenes,
        gallery: config.gallery.filter((item) => item.src !== source && item.mobileImage !== source),
      });
      if (source.startsWith('/uploads/')) onDeletePath(source);
    }
    setSelected(null);
  };

  const moveScene = (sceneIndex: number, direction: -1 | 1) => {
    const currentScene = config.editorialScenes[sceneIndex];
    if (!currentScene) return;
    const visibleScenes = config.editorialScenes.filter((scene) => scene.visible).sort((a, b) => a.order - b.order);
    const visibleIndex = visibleScenes.findIndex((scene) => scene.id === currentScene.id);
    const destination = visibleIndex + direction;
    if (destination < 0 || destination >= visibleScenes.length) return;
    const destinationScene = visibleScenes[destination];
    const scenes = config.editorialScenes.map((scene) => {
      if (scene.id === currentScene.id) return { ...scene, order: destinationScene.order };
      if (scene.id === destinationScene.id) return { ...scene, order: currentScene.order };
      return scene;
    });
    onChange({ ...config, editorialScenes: scenes });
    setSelected({ kind: 'scene', sceneIndex, imageIndex: 0 });
  };

  const controls = (target: Target, canMove = true) => {
    const active = sameTarget(selected, target);
    return <div role="button" tabIndex={0} aria-label="تعديل الصورة" onClick={() => setSelected(active ? null : target)} onKeyDown={(event) => { if (event.key === 'Enter') setSelected(active ? null : target); }} className={`absolute inset-0 z-20 cursor-pointer border-0 transition-colors ${active ? 'bg-black/45 ring-2 ring-inset ring-white' : 'bg-transparent hover:bg-black/15'}`}>
      <span className="absolute left-3 top-3 bg-black px-3 py-1.5 text-[11px] font-semibold tracking-wide text-white">اضغط للتعديل</span>
      {active && <span className="absolute inset-x-3 bottom-3 flex flex-wrap justify-center gap-2" onClick={(event) => event.stopPropagation()}>
        <button type="button" onClick={() => requestReplace(target)} className="inline-flex items-center gap-1.5 bg-white px-3 py-2 text-xs font-semibold text-black"><ImagePlus className="h-4 w-4" />تبديل</button>
        {canMove && target.kind === 'scene' && <>
          <button type="button" onClick={() => moveScene(target.sceneIndex, -1)} className="bg-white p-2 text-black" aria-label="نقل لأعلى"><ArrowUp className="h-4 w-4" /></button>
          <button type="button" onClick={() => moveScene(target.sceneIndex, 1)} className="bg-white p-2 text-black" aria-label="نقل لأسفل"><ArrowDown className="h-4 w-4" /></button>
        </>}
        <button type="button" onClick={() => deleteTarget(target)} className="inline-flex items-center gap-1.5 bg-rose-700 px-3 py-2 text-xs font-semibold text-white"><Trash2 className="h-4 w-4" />حذف</button>
      </span>}
    </div>;
  };

  const activeScenes = config.editorialScenes.filter((scene) => scene.visible).sort((a, b) => a.order - b.order);

  return <div className="fixed inset-0 z-[100] overflow-hidden bg-[#171717] text-right" dir="rtl">
    <div className="flex h-16 items-center justify-between border-b border-white/15 bg-black px-5 text-white">
      <div><p className="text-sm font-semibold">معاينة الصفحة والتحرير المباشر</p><p className="text-[11px] text-white/55">اضغط على أي صورة لتبديلها أو حذفها أو تحريك مشهدها</p></div>
      <div className="flex items-center gap-2">
        {error && <span className="max-w-sm text-xs text-rose-300">{error}</span>}
        {uploading && <span className="inline-flex items-center gap-2 text-xs"><Loader2 className="h-4 w-4 animate-spin" />جاري رفع الصورة</span>}
        <button type="button" onClick={onSave} disabled={saving || uploading} className="inline-flex items-center gap-2 bg-white px-4 py-2 text-xs font-semibold text-black disabled:opacity-50"><Save className="h-4 w-4" />{saving ? 'جاري الحفظ' : 'حفظ التعديلات'}</button>
        <button type="button" onClick={onClose} className="p-2 text-white" aria-label="إغلاق المعاينة"><X className="h-5 w-5" /></button>
      </div>
    </div>
    <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} />
    <div className="h-[calc(100vh-4rem)] overflow-y-auto py-8">
      <div className="admin-preview mx-auto w-[390px] max-w-[calc(100vw-2rem)] overflow-hidden bg-black shadow-2xl">
        {config.hero.visible && <Hero hero={config.hero} brand={config.brand} previewMode editorControls={controls({ kind: 'hero' }, false)} />}
        {activeScenes.map((scene, sceneIndex) => <EditorialScene key={scene.id} scene={scene} index={sceneIndex} renderControls={(_, imageIndex) => controls({ kind: 'scene', sceneIndex: config.editorialScenes.findIndex((item) => item.id === scene.id), imageIndex })} />)}
        <AboutSection about={config.about} />
        <StoresSection branches={config.branches} />
        <ContactSection contact={config.contact} />
        <Footer brand={config.brand} navigation={config.navigation} />
      </div>
    </div>
  </div>;
}
