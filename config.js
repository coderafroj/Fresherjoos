/* =====================================================================
   FRESHER'S — SAARI JAANKARI YAHAN SE BADLO
   Naam, daam, ml, phone, delivery area, sab isi file mein hai.
   index.html ko chhune ki zaroorat nahi. Save karo, GitHub pe push karo, Vercel khud update kar dega.
   (Jahan "SAMPLE" likha hai wahan apni asli jaankari daalo.)
   ===================================================================== */
(typeof window !== "undefined" ? window : globalThis).FRESHERS = {

  /* ---------- Brand ---------- */
  brand: {
    name: "Fresher's",
    hook: "Juice nahi. Taazgi ki delivery.",          // sabse upar ki badi line
    tagline: "Fresh in 20.",
    intro: "Taaza fruit ka juice, sealed plastic glass mein. Seedha hospital aur gym tak, sirf 20 minute mein.",
    logo: "assets/logo.webp",
    siteUrl: "https://freserjoos.vercel.app"           // apni asli site ka link (share aur preview ke liye)
  },

  /* ---------- Contact ---------- */
  contact: {
    phone: "6396835709",
    whatsapp: "916396835709"
  },

  /* ---------- Delivery area (SAMPLE: Shrinath Medicity, Bareilly ke 5 km) ----------
     Kisi ko is area ke bahar se order nahi lene dena hai to radiusKm chhota-bada karo.
     Naya centre chahiye: Google Maps mein jagah pe right-click karo -> pehli line "28.37, 79.45" copy karo.
     Ek se zyada jagah (zones) bhi jod sakte ho: har zone ka alag lat, lng, radiusKm.            */
  area: {
    enabled: true,
    requireLocation: true,        // true = order ke liye location zaroori, aur area ke andar hona zaroori
    city: "Bareilly",
    zones: [
      { name: "Shrinath Medicity Hospital", lat: 28.3745, lng: 79.4543, radiusKm: 5 }
    ]
  },

  /* ---------- Khulne ka time (SAMPLE) ---------- */
  hours: {
    open: "07:00",
    close: "22:00",
    enforce: false     // true = band hone par order nahi lenge. false = sirf "Abhi khule hain / band hain" dikhayega
  },

  /* ---------- Order settings ---------- */
  orders: {
    payments: ["Cash on delivery", "UPI on delivery"],
    slots: ["Abhi (20 min mein)", "30 min baad", "1 ghante baad", "2 ghante baad"],
    showWhatsAppBackup: true    // Telegram order fail ho jaye tabhi WhatsApp ka backup button dikhega
  },

  /* ---------- Delivery charge ---------- */
  delivery: {
    minutes: 20,
    fee: 0,
    freeAbove: 0,
    minOrder: 0
  },

  /* ---------- Sizes (ml) ---------- */
  sizes: [
    { id: "s", label: "Chhota", ml: 250 },
    { id: "m", label: "Medium", ml: 350 },
    { id: "l", label: "Bada",   ml: 500 }
  ],

  /* ---------- Juices (SAMPLE daam) ---------- */
  juices: [
    { id: "santra",  name: "Santra",    english: "Orange",      tag: "Classic",         color: "#FF8B1A",
      desc: "Taaza santre nichod kar, seedha sealed glass mein.", ingredients: "Santra",
      prices: { s: 50, m: 70, l: 99 },  for: ["hospital", "gym"], available: true },
    { id: "mosambi", name: "Mosambi",   english: "Sweet lime",  tag: "Halka aur meetha", color: "#D9E24B",
      desc: "Halka, meetha aur thanda. Hospital ke liye sabse pasandida.", ingredients: "Mosambi",
      prices: { s: 50, m: 70, l: 99 },  for: ["hospital"], available: true },
    { id: "anar",    name: "Anar",      english: "Pomegranate", tag: "Ruby red",        color: "#B3123A",
      desc: "Gehre laal dane, taaza nikala hua ras.", ingredients: "Anar",
      prices: { s: 70, m: 99, l: 139 }, for: ["hospital", "gym"], available: true },
    { id: "tarbooz", name: "Tarbooz",   english: "Watermelon",  tag: "Garmi ka dost",   color: "#FF5A78",
      desc: "Thanda, halka aur bharpoor paani wala.", ingredients: "Tarbooz",
      prices: { s: 40, m: 60, l: 80 },  for: ["gym"], available: true },
    { id: "ananas",  name: "Ananas",    english: "Pineapple",   tag: "Khatta-meetha",   color: "#FFC62E",
      desc: "Khatta-meetha, tropical swad.", ingredients: "Ananas",
      prices: { s: 50, m: 70, l: 99 },  for: ["gym"], available: true },
    { id: "power",   name: "Gym Power", english: "Carrot + Beetroot + Apple", tag: "Gym special", color: "#8E2A6B",
      desc: "Gajar, chukandar aur seb ka mix. Workout se pehle ya baad mein.", ingredients: "Gajar, Chukandar, Seb",
      prices: { s: 80, m: 110, l: 149 }, for: ["gym"], available: true }
  ],

  /* ---------- 20 minute ka safar ---------- */
  steps: [
    { min: 0,  title: "Order aaya",   text: "Order milte hi Telegram pe alert, kaam shuru." },
    { min: 3,  title: "Fruit chuna",  text: "Taaza fruit nikala, dhoya aur kaata." },
    { min: 10, title: "Juice nikala", text: "Abhi ke abhi nichoda, glass mein bhara aur seal band." },
    { min: 20, title: "Aapke paas",   text: "Hospital ke gate ya ward, gym ke counter tak." }
  ],

  /* ---------- Hospital aur Gym (SAMPLE plans) ---------- */
  places: {
    hospital: {
      title: "Hospital ke liye",
      text: "Marij aur unke saath rehne waalon ke liye halka, taaza aur sealed juice. Seedha ward tak.",
      note: "Marij ki diet ke liye pehle doctor se poochh lein.",
      plans: [{ name: "Hospital Daily", detail: "Roz 1 glass (350 ml), 7 din", price: 399 }]
    },
    gym: {
      title: "Gym ke liye",
      text: "Workout ke pehle ya baad mein. Gym ke counter tak, time pe aur thanda.",
      note: "",
      plans: [{ name: "Gym Monthly", detail: "Roz 1 glass (350 ml), 26 din", price: 1499 }]
    }
  },

  /* ---------- Safai ke vaade (jo sach hai wahi rakho) ---------- */
  hygiene: [
    { title: "Roz taaza fruit",       text: "Fruit roz laate hain, dhokar use karte hain." },
    { title: "Sealed plastic glass",  text: "Glass ka dhakkan band hokar pahunchta hai." },
    { title: "Koi milaavat nahi",     text: "Sirf fruit. Koi adulteration nahi." },
    { title: "Saaf jagah, saaf hath", text: "Juice banane ki jagah aur haath hamesha saaf." }
  ],

  /* ---------- Aksar poochhe jaane waale sawal (apne hisaab se badlo) ---------- */
  faq: [
    { q: "Delivery kahan tak hoti hai?", a: "Abhi {area} ke aas-paas {radius} km ke andar. Location bhejte hi site bata deti hai ki aap area mein ho ya nahi." },
    { q: "Kitne time mein aayega?", a: "Hamara target {minutes} minute hai. Order ke saath aap baad ka time bhi chun sakte ho." },
    { q: "Payment kaise karna hai?", a: "Delivery pe cash ya UPI. Pehle koi payment nahi." },
    { q: "Hospital mein juice kahan milega?", a: "Pata mein ward ya room number likh do, aur location bhej do. Hum seedha wahin pahunchate hain." },
    { q: "Roz ya mahine ka plan milta hai?", a: "Haan. Hospital aur Gym ke plans upar hain, ya hume call karo." }
  ],

  /* ---------- Upar chalne waali patti ---------- */
  marquee: ["100% taaza fruit", "Sealed plastic glass", "20 minute delivery", "Hospital aur Gym ke liye", "Zero adulteration"]
};

if (typeof module !== "undefined" && module.exports) { module.exports = (typeof window !== "undefined" ? window : globalThis).FRESHERS; }
