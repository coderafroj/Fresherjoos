FRESHER'S — REACT APP (Vite + React 19)  |  "Freshness in 20 min"
===================================================================

KYA HAI IS FOLDER MEIN
  shared/config.js   naam, tagline, daam, ml, phone, delivery AREA (5 km), time, FAQ — SAB KUCH YAHIN BADLO
  api/_private.js    COUPONS (server-only, koi nahi dekh sakta)
  api/order.js       order -> Telegram (message + map pin + buttons)
  api/geocode.js     location -> area + PINCODE, aur GPS na mile to internet se shehar
  api/coupon.js, api/telegram.js, api/health.js
  src/               React app: components, hooks, location engine, geoMath (Kalman filter)
  public/            logo, icons, link-preview image, service worker, manifest
  geo-test.mjs       location ke math ka test:  npm test

1) GITHUB + VERCEL
  Files repo mein daalo, phir:
      git add -A && git commit -m "final"
      git fetch origin && git push --force-with-lease origin main      (agar "rejected / fetch first" aaye aur online ka purana hatana ho)
  Vercel khud pehchan leta hai (Vite). Kuch badalna nahi.

2) TELEGRAM TOKEN KAHAN RAKHNA HAI (sabse zaroori)
  Token ko kabhi code / GitHub / chat mein mat likhna. Sirf yahan:
    vercel.com -> apna Project -> Settings -> Environment Variables -> Add New
        TELEGRAM_BOT_TOKEN = (BotFather ka token)
        TELEGRAM_CHAT_ID   = (aapki chat id; group ki ho to minus (-) se shuru)
    (Production + Preview + Development teeno tick) -> Save -> Deployments -> Redeploy.
  Chat ID: bot ko /start bhejo, phir browser mein  https://api.telegram.org/bot<TOKEN>/getUpdates  kholo, "chat":{"id": ...} wahi hai.
  Token leak ho jaye to BotFather -> /revoke.

3) TELEGRAM BUTTONS (optional): Accept / Delivery pe nikla / Deliver ho gaya
  Env mein TELEGRAM_WEBHOOK_SECRET = koi lamba random text -> Redeploy -> ek baar browser mein:
  https://api.telegram.org/botTOKEN/setWebhook?url=https://SITE/api/telegram&secret_token=SECRET

4) "LOCATION KEY" KYA HAI? (LOCATIONIQ_KEY) — SAMJHO
  Teen alag cheezein hain, mix mat karna:
   (a) GPS permission  = customer ke phone ka "Allow location" — isme koi key nahi, browser deta hai. Isse sirf latitude/longitude milte hain.
   (b) Address / PINCODE nikalna (reverse geocoding) = latitude/longitude ko "Shakti Nagar, Bareilly, 243006" mein badalna. Ye kaam ek
       map-service karti hai. Hum default mein free OpenStreetMap (Nominatim) use karte hain — iske liye KOI KEY NAHI chahiye.
   (c) LOCATIONIQ_KEY = (b) ke liye ek optional "password" (API key) locationiq.com ka. Jab orders/visitors bahut badh jayein tab lagana.
       Free plan: 5,000 requests/din, 2 per second (commercial use theek, credit dena hota hai — site ke neeche "Search by LocationIQ.com" likha hai).
  KEY KAISE LAGAAYEIN (zaroorat padne par):
    1. locationiq.com pe free account banao -> dashboard mein "Access Token / API key" milega.
    2. Vercel -> Settings -> Environment Variables -> Name: LOCATIONIQ_KEY, Value: (wo key) -> Redeploy.
    3. Bas. Code apne aap LocationIQ use karne lagta hai. Key kabhi GitHub/code mein nahi.
  Abhi key ke bina bhi sab chalega.   Optional: GEOCODE_UA = "FreshersJuice/3.0 (aapka email)" (OpenStreetMap chahta hai ki pehchaan likhi ho).

5) LOCATION KA ALGORITHM (poora)  — src/lib/location.js + src/lib/geoMath.js
  Tum site kholte ho -> background mein:
   1. Pehle phone ki saved rounded location (agar 30 min se nayi) turant header mein.
   2. Permission check (Permissions API). Mili hai to chupke se location; nahi mili to ek halka "Allow karo" card; mana kiya to IP wala shehar.
   3. Jaldi wala GPS (network, 7 sec) -> header bhar jata hai.  Saath saath internet (IP) se shehar ka andaaza ("Bareilly (approx)").
   4. Sahi GPS (high accuracy) piche chalta hai. Har reading FixFilter se guzarti hai:
        - NaN / shehar-level (25 km+) reading reject
        - 60 m/s se tez "uchhal" + kamzor accuracy = GPS glitch, reject
        - pehle se pata hui jaankari se bahut kamzor reading = shor, ignore
   5. Bachi hui readings Kalman filter mein: har reading ko uski accuracy ke hisaab se wazan milta hai, nateeja ek pakka point + sahi accuracy.
        (Test: 25 m shor wali 40 readings ->  ~5 m galti, jabki akeli reading ~32 m.  `npm test` se dekho.)
   6. Accuracy <= 25 m aur 3+ readings -> GPS band (battery bachti hai).
   7. Reverse geocode (area, sadak, shehar, PINCODE) sirf tab jab 60 m se zyada hile; server 24 ghante cache karta hai.
   8. Area check: haversine doori; GPS galti ka thoda fayda (<=200 m); seema par flicker rokne ke liye hysteresis (120 m); "seema par ho" flag.
   9. Customer ko dikhta hai: header mein area+pincode+doori, location milte hi sundar card, tap par poori detail
      (pincode, shehar, doori + disha, ~min mein juice, accuracy bar, source, naksha, map/copy). Order form mein area+pincode apne aap bhar jate hain.
  10. Phone mein sirf ~100 m tak ki rounded location saved hoti hai (poori sahi nahi). "Meri saved jaankari hatao" button se sab mit jata hai.
  "Location nahi mili" kyun aata tha: sirf high-accuracy GPS andar/kamzor signal mein time-out ho jata tha. Ab teen darje (network -> GPS -> IP).
  Phir bhi na mile to: phone ki Location(GPS) on karo, browser settings mein site ko Location -> Allow do.

6) CONSOLE / "window" MEIN KYA DIKHTA HAI
  Production mein console khaali hai (sirf "Ruko!" chetavni). window.FRESHERS jaisa kuch nahi (app React modules mein hai), React DevTools band.
  Sach: Network tab / View Source har browser mein hota hai, chhupaya nahi ja sakta. Isliye browser ko koi secret bheji hi nahi jaati:
    Telegram token -> sirf Vercel env | Coupons -> api/_private.js (server) | Daam/area/phone -> public (customer ko dikhane ke hi hain)
  Server har order dobara check karta hai (daam, coupon, area, naam, phone); dusri site se order block; CSP headers laga hai.

7) DELIVERY AREA
  shared/config.js -> area.zones (abhi Shrinath Medicity Hospital, Bareilly 28.3745, 79.4543, 5 km). radiusKm badlo / aur jagah jodo.
  Jis Medicity ka matlab alag ho to Google Maps pe right-click -> lat,lng copy karke daalo.

8) LOCAL MEIN CHALANA
  npm install | npm run dev (sirf design; /api ke liye: npx vercel dev) | npm run build | npm test

9) TEST (deploy ke baad)
  Site kholo -> location allow -> header mein area dikhe -> ek order do -> Telegram pe message + map pin aaye. Nahi aaya? Vercel -> Logs.
