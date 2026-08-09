import { getSiteContent } from '@/lib/content';
import Header from '@/components/public/Header';
import Hero from '@/components/public/Hero';
import EditorialScene from '@/components/public/EditorialScene';
import AboutSection from '@/components/public/AboutSection';
import StoresSection from '@/components/public/StoresSection';
import MapSection from '@/components/public/MapSection';
import ContactSection from '@/components/public/ContactSection';
import Footer from '@/components/public/Footer';
import FloatingLogo from '@/components/public/FloatingLogo';

export const revalidate = 0; // Fresh updates from Git CMS

export default async function HomePage() {
  const content = await getSiteContent();

  const activeScenes = (content.editorialScenes || [])
    .filter((scene) => scene.visible)
    .sort((a, b) => a.order - b.order);

  const misurataBranch = content.branches?.find((b) => b.id === 'misurata');

  return (
    <main className="w-full bg-black text-white min-h-screen font-sans selection:bg-white selection:text-black m-0 p-0 overflow-x-hidden">
      {/* Transparent Overlay Header at top:0 */}
      <Header brand={content.brand} navigation={content.navigation} />

      {/* Floating Bottom TOM Logo Mark Overlay on Mobile (Scrolls with user until bottom sections) */}
      <FloatingLogo brandName={content.brand.name} />

      {/* Opening Full-Bleed Campaign Photograph (Zero Top Gap) */}
      <Hero hero={content.hero} brand={content.brand} />

      {/* Campaign Photography Story (Edge-to-Edge Editorial Spreads) */}
      <div id="new" className="w-full m-0 p-0">
        {activeScenes.map((scene, index) => (
          <EditorialScene key={scene.id || index} scene={scene} index={index} />
        ))}
      </div>

      {/* Brand break and utility region control campaign-logo visibility. */}
      <div id="utility-start">
        <AboutSection about={content.about} />
        <StoresSection branches={content.branches || []} />
        <MapSection branch={misurataBranch} />
        <ContactSection contact={content.contact} />
        <Footer brand={content.brand} navigation={content.navigation} />
      </div>
    </main>
  );
}
