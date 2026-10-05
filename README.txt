FRESHER'S — REACT APP (Vite + React 19)  |  SETUP (Hinglish)
============================================================

FOLDER
  shared/config.js      naam, daam, ml, phone, delivery AREA (5 km), khulne ka time, FAQ — SAB KUCH YAHIN BADLO (public file)
  api/_private.js       COUPONS yahan (server-only, koi nahi dekh sakta)
  api/order.js          order aate hi Telegram pe bhejta hai
  api/geocode.js        location se area + PINCODE nikalta hai, aur GPS na mile to internet (IP) se shehar
  api/coupon.js         coupon check (list browser ko kabhi nahi jaati)
  api/telegram.js       Telegram ke Accept / Delivered buttons (optional)
  src/                  React app (components, hooks, location engine, cart store)
  public/               logo, app icons, link-preview image, service worker, manifest

1) GITHUB + VERCEL
  - Is folder ki files apni repo mein daalo (purani files hata ke), phir push.
  - Agar "rejected / fetch first" aaye aur online ka purana sab hatana ho:
        git add -A && git commit -m "react v3"
        git fetch origin && git push --force-with-lease origin main
  - Vercel apne aap pehchan leta hai ki ye Vite project hai (Build: npm run build, Output: dist). Kuch badalna nahi.

2) TELEGRAM TOKEN KAHAN RAKHNA HAI  (sabse zaroori)
  Token ko kabhi code / GitHub / chat mein mat likhna. Sirf yahan:
    Vercel.com -> apna Project -> Settings -> Environment Variables -> "Add New"
        Name:  TELEGRAM_BOT_TOKEN      Value: (BotFather ne jo token diya)
        Name:  TELEGRAM_CHAT_ID        Value: (aapki chat id)
    (Environments: Production, Preview, Development teeno tick rakho)
    Phir  Deployments -> sabse upar wale deploy ke "..." -> Redeploy.   (env badalne ke baad Redeploy zaroori hai)
  Chat ID kaise nikaalein:
    a) Apne bot ko Telegram mein ek baar /start bhejo.
    b) Browser mein kholo:  https://api.telegram.org/bot<TOKEN>/getUpdates   (<TOKEN> ki jagah apna token)
    c) Jawab mein  "chat":{"id": 123456789 ...}  — wahi number CHAT ID hai. (Group ho to number minus (-) se shuru hota hai; bot ko group mein jodo.)
  Token galti se kahin public ho gaya? BotFather -> /revoke se naya bana lo.

3) TELEGRAM BUTTONS (optional): Accept / Delivery pe nikla / Deliver ho gaya
    a) Vercel env mein jodo:  TELEGRAM_WEBHOOK_SECRET = koi lamba random text (a1b2c3d4e5f6g7h8)  ->  Redeploy
    b) Browser mein ek baar kholo (TOKEN, SITE, SECRET apne):
       https://api.telegram.org/botTOKEN/setWebhook?url=https://SITE/api/telegram&secret_token=SECRET

4) LOCATION KAISE KAAM KARTI HAI (sab background mein)
    1. Site khulte hi: GPS ka jaldi wala andaaza (2-7 sec) -> header mein turant "Shakti Nagar, Bareilly · 243006 · 749 m" dikhta hai.
    2. Piche GPS high-accuracy chalta rehta hai aur location ko aur sahi karta hai (aam taur pe 5-15 m).
    3. GPS band / allow nahi / signal nahi? Tab bhi internet (IP) se shehar ka andaaza header mein dikhta hai ("Bareilly (approx)").
    4. Order form mein Area aur Pincode apne aap bhar jaate hain (customer badal bhi sakta hai). Telegram message mein area + pincode + map pin aata hai.
    5. Dusre shehar/area ka customer ho to uska area header mein dikhta hai, par order sirf delivery area ke andar se hota hai.
  "Location nahi mili" kyun aata tha? High-accuracy GPS kai phones/computers par andar ya kamzor signal mein time-out ho jata tha. Ab pehle jaldi wala GPS, phir sahi wala, phir IP wala.
  Phir bhi nahi mile to: phone ki Location (GPS) on karo, browser settings mein site ko Location -> Allow do, site HTTPS (Vercel pe apne aap).

5) PINCODE / AREA KA SOURCE
  Area aur pincode OpenStreetMap (Nominatim) se aate hain (credit site ke neeche likha hai). Free hai par "thoda use" ke liye (1 request/second ka niyam,
  server isko sambhalta hai aur cache karta hai). Bahut zyada orders aane lagein to Vercel env mein LOCATIONIQ_KEY (locationiq.com ka free/paid key) jod do,
  code apne aap use utha lega. Optional: GEOCODE_UA = "FreshersJuice/3.0 (aapka email)"  (Nominatim chahta hai ki pehchaan likhi ho).
  OpenStreetMap kabhi kabhi pincode nahi deta — tab customer khud likh deta hai (ya khaali chhod sakta hai).

6) DELIVERY AREA (5 km)
  shared/config.js -> area.zones. Abhi Shrinath Medicity Hospital, Bareilly (28.3745, 79.4543) ke 5 km.
  radiusKm badlo, ya Google Maps pe right-click karke nayi lat,lng daalo, ya zones mein aur jagah jodo.
  area.enabled:false = area check band. area.requireLocation:false = bina location order allow.
  Server bhi har order mein dobara check karta hai.

7) LOCAL MEIN CHALANA
    npm install
    npm run dev          (sirf design; /api ke liye:  npx vercel dev)
    npm run build        (dist folder banata hai)

8) SECURITY (console / window / View Source)
  Browser ko jo bhi jaata hai (JS, config) use koi bhi dekh sakta hai — har website ke saath aisa hota hai. Isliye browser wali files mein koi secret nahi:
    Telegram token/chat id -> sirf Vercel env; Coupon -> api/_private.js (server-only); Daam/area/phone -> public (customer ko dikhane ke hi hain).
  App ab React modules mein hai, "window.FRESHERS" jaisa kuch global nahi. Console mein "Ruko!" chetavni dikhti hai.
  Server har order dobara check karta hai (daam, coupon, area, naam, phone). Dusri site se order bhejna block hai. CSP headers laga hai (vercel.json).
  Limit: koi chahe to apne phone ki fake location bhej sakta hai — Telegram message mein doori + accuracy dikhti hai, delivery pe pata/phone dekh lena.

9) TEST
  Site kholo -> location allow -> header mein area dikhe -> ek order do -> Telegram pe message + map pin aaye.
  Nahi aaya? Vercel -> Project -> Logs dekho; token/chat id dobara check karo (aur Redeploy).
