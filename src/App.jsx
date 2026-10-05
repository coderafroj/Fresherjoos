import { lazy, Suspense, useEffect, useState } from "react";
import C from "../shared/config.js";
import Hero from "./components/Hero.jsx";
import Menu from "./components/Menu.jsx";
import Dock from "./components/Dock.jsx";
import Toaster from "./components/Toaster.jsx";
import { Sprites } from "./components/Icons.jsx";
import { FloatLoc, LocBanner } from "./components/LocPill.jsx";
import { Area, Faq, Hygiene, Marquee, OrderCta, Places, Race } from "./components/Sections.jsx";
import { location } from "./lib/location.js";
import { ui } from "./lib/ui.js";
import { useStore } from "./lib/store.js";

// order form bhaari hai: pehle page dikhta hai, form peeche se (khaali samay mein) load hota hai
const loadSheet = () => import("./components/OrderSheet.jsx");
const OrderSheet = lazy(loadSheet);

export default function App() {
  const open = useStore(ui, (s) => s.sheet);
  const [warm, setWarm] = useState(false);

  useEffect(() => {
    location.init();                                               // location + area + pincode, sab background mein
    const idle = window.requestIdleCallback ?? ((f) => setTimeout(f, 1800));
    const id = idle(() => loadSheet().then(() => setWarm(true)));
    try {                                                          // search engines ke liye
      const A = C.area || {}, site = C.brand.siteUrl || location.origin;
      const s = document.createElement("script");
      s.type = "application/ld+json";
      s.textContent = JSON.stringify({ "@context": "https://schema.org", "@type": "FoodEstablishment", name: C.brand.name, description: C.brand.intro, telephone: "+91" + C.contact.phone, url: site, image: site + "/assets/og.png", servesCuisine: "Fresh fruit juice", priceRange: "₹", areaServed: A.city || "" });
      document.head.appendChild(s);
      return () => s.remove();
    } catch { /* */ }
    return () => window.cancelIdleCallback?.(id);
  }, []);

  return (
    <>
      <Sprites />
      <Hero />
      <Marquee />
      <Menu />
      <Race />
      <Places />
      <Area />
      <Hygiene />
      <Faq />
      <OrderCta />
      <Dock />
      <FloatLoc />
      <LocBanner />
      <Toaster />
      {(warm || open) && <Suspense fallback={null}><OrderSheet /></Suspense>}
    </>
  );
}
