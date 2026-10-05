import C from "../../shared/config.js";
import { toast } from "./ui.js";

const SITE = C.brand.siteUrl || location.origin;

/** Phone mein share sheet, computer par link copy */
export async function shareSite() {
  const data = { title: C.brand.name, text: `${C.brand.hook || ""} ${C.brand.tagline} Hospital aur gym tak ${C.delivery.minutes} minute mein.`.trim(), url: SITE };
  try {
    if (navigator.share) return await navigator.share(data);
    await navigator.clipboard.writeText(SITE);
    toast("Link copy ho gaya. Ab kisi ko bhi bhej do");
  } catch (e) { if (e?.name !== "AbortError") toast(SITE, 5000); }
}
export const waLink = (text) => `https://wa.me/${C.contact.whatsapp}?text=${encodeURIComponent(text)}`;
