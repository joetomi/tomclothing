import type { Metadata } from "next";
import { Alexandria, Amiri, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { getSiteContent } from "@/lib/content";

const alexandria = Alexandria({
  subsets: ["arabic", "latin"],
  variable: "--font-alexandria",
  display: "swap",
});

const amiri = Amiri({
  weight: ["400", "700"],
  subsets: ["arabic", "latin"],
  variable: "--font-amiri",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://tomfashion.ly'),
    title: content.seo.title || "TOM LIBYA",
    description: content.seo.description || "Women's Fashion Store in Libya.",
    keywords: content.seo.keywords,
    openGraph: {
      title: content.seo.title,
      description: content.seo.description,
      images: [content.seo.ogImage || "/uploads/look-01.jpg"],
      locale: "ar_LY",
      type: "website",
    },
    icons: {
      icon: "/brand/logo-black.png",
      apple: "/brand/logo-black.png",
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const content = await getSiteContent();
  const misurataBranch = content.branches.find((b) => b.id === "misurata");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ClothingStore",
    name: content.brand.name,
    alternateName: content.brand.arabicName,
    description: content.seo.description,
    telephone: content.contact.phone,
    url: "https://tomfashion.ly",
    address: {
      "@type": "PostalAddress",
      streetAddress: misurataBranch?.address || "المقاوبة مقابل نادي السويحلي",
      addressLocality: "Misurata",
      addressCountry: "LY",
    },
    hasMap: misurataBranch?.mapsUrl || "https://maps.app.goo.gl/zRbkT3uEaCon9Li56",
  };

  return (
    <html lang="ar" dir="rtl" className={`${alexandria.variable} ${amiri.variable} ${cormorant.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased selection:bg-tom-black selection:text-white bg-white text-tom-black">
        {children}
      </body>
    </html>
  );
}
