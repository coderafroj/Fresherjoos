/* =====================================================================
   FRESHER'S — SAARI JAANKARI YAHAN SE BADLO
   Bas is file mein naam, daam, ml, phone, text badlo. index.html ko
   chhune ki zaroorat nahi. Save karke Vercel pe dobara deploy kar do.
   (Neeche ke daam aur plans SAMPLE hain — apne asli daam daalo.)
   ===================================================================== */
(typeof window !== "undefined" ? window : globalThis).FRESHERS = {

  /* ---------- Brand ---------- */
  brand: {
    name: "Fresher's",
    tagline: "Fresh in 20.",
    intro: "Taaza fruit ka juice, sealed plastic glass mein. Seedha hospital aur gym tak, sirf 20 minute mein.",
    logo: "logo.jpg"            // apna logo lagana ho to file "assets/logo.png" folder mein rakho aur yahan likho: "assets/logo.png"
  },

  /* ---------- Contact ---------- */
  contact: {
    phone: "6396835709",        // call ke liye (bina +91 ke)
    whatsapp: "916396835709"    // WhatsApp ke liye (91 ke saath)
  },

  /* ---------- Order settings ----------
     Order aane par aapke WhatsApp pe ek sundar message aayega (naam, phone, pata, location, items, total).
     Poora automatic setup ke liye README.txt dekho (CallMeBot / Telegram, dono free).
     Agar automatic setup nahi kiya, to customer ke phone mein WhatsApp khulega aur wo "Send" dabayega. */
  orders: {
    payments: ["Cash on delivery", "UPI on delivery"],   // customer ko ye options dikhenge
    alsoOpenWhatsApp: false                              // true = automatic order ke baad bhi customer ko WhatsApp button dikhao
  },

  /* ---------- Delivery ---------- */
  delivery: {
    minutes: 20,
    fee: 0,            // delivery charge (₹). 0 = free
    freeAbove: 0,      // is amount se upar free delivery (0 = use nahi karna)
    minOrder: 0        // kam se kam order (₹). 0 = koi limit nahi
  },

  /* ---------- Sizes (ml) ----------
     id ko mat badlo, label aur ml badal sakte ho.
     Har juice ke prices mein yahi id use hoti hai (s, m, l). */
  sizes: [
    { id: "s", label: "Chhota", ml: 250 },
    { id: "m", label: "Medium", ml: 350 },
    { id: "l", label: "Bada",   ml: 500 }
  ],

  /* ---------- Juices ----------
     color     : juice ka rang (glass aur page isi rang mein badlega)
     prices    : har size ka daam ₹ mein. Kisi size ko hatana ho to us line ko delete kar do.
     for       : "hospital" aur/ya "gym" — kis jagah ke liye suggest karna hai
     available : false kar do to "Abhi khatam" dikhega                      */
  juices: [
    {
      id: "santra", name: "Santra", english: "Orange", tag: "Classic",
      color: "#FF8B1A",
      desc: "Taaza santre nichod kar, seedha sealed glass mein.",
      ingredients: "Santra",
      prices: { s: 50, m: 70, l: 99 },
      for: ["hospital", "gym"], available: true
    },
    {
      id: "mosambi", name: "Mosambi", english: "Sweet lime", tag: "Halka aur meetha",
      color: "#D9E24B",
      desc: "Halka, meetha aur thanda. Hospital ke liye sabse pasandida.",
      ingredients: "Mosambi",
      prices: { s: 50, m: 70, l: 99 },
      for: ["hospital"], available: true
    },
    {
      id: "anar", name: "Anar", english: "Pomegranate", tag: "Ruby red",
      color: "#B3123A",
      desc: "Gehre laal dane, taaza nikala hua ras.",
      ingredients: "Anar",
      prices: { s: 70, m: 99, l: 139 },
      for: ["hospital", "gym"], available: true
    },
    {
      id: "tarbooz", name: "Tarbooz", english: "Watermelon", tag: "Garmi ka dost",
      color: "#FF5A78",
      desc: "Thanda, halka aur bharpoor paani wala.",
      ingredients: "Tarbooz",
      prices: { s: 40, m: 60, l: 80 },
      for: ["gym"], available: true
    },
    {
      id: "ananas", name: "Ananas", english: "Pineapple", tag: "Khatta-meetha",
      color: "#FFC62E",
      desc: "Khatta-meetha, tropical swad.",
      ingredients: "Ananas",
      prices: { s: 50, m: 70, l: 99 },
      for: ["gym"], available: true
    },
    {
      id: "power", name: "Gym Power", english: "Carrot + Beetroot + Apple", tag: "Gym special",
      color: "#8E2A6B",
      desc: "Gajar, chukandar aur seb ka mix. Workout se pehle ya baad mein.",
      ingredients: "Gajar, Chukandar, Seb",
      prices: { s: 80, m: 110, l: 149 },
      for: ["gym"], available: true
    }
  ],

  /* ---------- 20 minute ka safar (minute ek ke baad ek badhne chahiye) ---------- */
  steps: [
    { min: 0,  title: "Order aaya",       text: "WhatsApp ya call pe order milte hi kaam shuru." },
    { min: 3,  title: "Fruit chuna",      text: "Taaza fruit nikala, dhoya aur kaata." },
    { min: 10, title: "Juice nikala",     text: "Abhi ke abhi nichoda, glass mein bhara aur seal band." },
    { min: 20, title: "Aapke paas",       text: "Hospital ke gate ya ward, gym ke counter tak." }
  ],

  /* ---------- Hospital aur Gym ke plans (SAMPLE daam) ---------- */
  places: {
    hospital: {
      title: "Hospital ke liye",
      text: "Patient aur unke saath rehne waalon ke liye halka, taaza aur sealed juice. Seedha ward tak.",
      note: "Patient ki diet ke liye pehle doctor se poochh lein.",
      plans: [
        { name: "Hospital Daily", detail: "Roz 1 glass (350 ml), 7 din", price: 399 }
      ]
    },
    gym: {
      title: "Gym ke liye",
      text: "Workout ke pehle ya baad mein. Gym ke counter tak, time pe aur thanda.",
      note: "",
      plans: [
        { name: "Gym Monthly", detail: "Roz 1 glass (350 ml), 26 din", price: 1499 }
      ]
    }
  },

  /* ---------- Safai ke vaade (jo sach hai wahi rakho) ---------- */
  hygiene: [
    { title: "Roz taaza fruit",      text: "Fruit roz laate hain, dhokar use karte hain." },
    { title: "Sealed plastic glass", text: "Glass ka dhakkan band hokar pahunchta hai." },
    { title: "Koi milaavat nahi",    text: "Sirf fruit. Koi adulteration nahi." },
    { title: "Saaf jagah, saaf hath", text: "Juice banane ki jagah aur haath hamesha saaf." }
  ],

  /* ---------- Upar chalne waali patti ---------- */
  marquee: [
    "100% taaza fruit",
    "Sealed plastic glass",
    "20 minute delivery",
    "Hospital aur Gym ke liye",
    "Zero adulteration"
  ]
};

if (typeof module !== "undefined" && module.exports) { module.exports = (typeof window !== "undefined" ? window : globalThis).FRESHERS; }
