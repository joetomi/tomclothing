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
import MobileMasthead from '@/components/public/MobileMasthead';

export const revalidate = 0; // Fresh updates from Git CMS

export default async function HomePage() {
  const content = await getSiteContent();

  const activeScenes = (content.editorialScenes || [])
    .filter((scene) => scene.visible)
    .sort((a, b) => a.order - b.order);

  const misurataBranch = content.branches?.find((b) => b.id === 'misurata');

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-white pt-[72px] font-sans text-white selection:bg-white selection:text-black md:bg-black md:pt-0">
      <MobileMasthead />
      {/* Transparent Overlay Header at top:0 */}
      <Header brand={content.brand} navigation={content.navigation} />

      {/* Floating Bottom TOM Logo Mark Overlay on Mobile (Scrolls with user until bottom sections) */}
      <FloatingLogo brandName={content.brand.name} />

      <div className="bg-white px-2 pb-2 md:bg-black md:p-0">
        <Hero hero={content.hero} brand={content.brand} />

        <div id="new" className="mt-2 w-full space-y-2 md:mt-0 md:space-y-0">
          {activeScenes.map((scene, index) => (
            <EditorialScene key={scene.id || index} scene={scene} index={index} />
          ))}
        </div>
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
