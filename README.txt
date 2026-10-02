FRESHER'S — SETUP (Hinglish)
============================

FILES
  index.html        design (isme kuch badalne ki zaroorat nahi)
  config.js         naam, daam, ml, phone, delivery AREA (5 km), khulne ka time, FAQ — sab yahin (ye file public hai)
  api/_private.js   COUPONS yahan (server-only, koi nahi dekh sakta)
  app.js, glass.js  site ka dimaag aur juice glass
  format.js         order check + Telegram/WhatsApp message (browser aur server dono use karte hain)
  api/order.js      order aate hi Telegram pe bhejta hai
  api/telegram.js   Telegram ke Accept / Delivered buttons ke liye (optional)
  assets/           logo, app icons, link-preview image (og.png)
  manifest.webmanifest, sw.js   site ko phone mein "app" ki tarah install karne ke liye

1) GITHUB PE DAALNA
  Is poore folder ki files apni repo (Fresherjoos) mein copy karo (purani files replace),
  phir:   git add .   git commit -m "v2"   git push
  Vercel apne aap naya deploy kar dega.

2) TELEGRAM (ZAROORI)  — token kabhi code ya GitHub mein mat likhna!
  Vercel -> Project -> Settings -> Environment Variables mein ye 2 jodo:
      TELEGRAM_BOT_TOKEN = (BotFather wala token)
      TELEGRAM_CHAT_ID   = (aapki chat id; group ki ho to usme minus (-) se shuru hoti hai)
  Phir Deployments -> Redeploy.
  Tip: Chat ID aapke apne chat ki ya ek group ki ho sakti hai. Group mein delivery wale ko bhi jod sakte ho.
  Pehle apne bot ko Telegram mein ek baar /start bhejna zaroori hai (group ho to bot ko group mein jodo).

3) ORDER KE MESSAGE KE BUTTONS (OPTIONAL, bahut kaam ke)
  Message mein "Accept / Delivery pe nikla / Deliver ho gaya" buttons chahiye to:
  a) Vercel Environment Variables mein jodo:  TELEGRAM_WEBHOOK_SECRET = koi lamba random text (jaise a1b2c3d4e5f6g7h8)
  b) Redeploy karo.
  c) Browser mein ek baar ye link kholo (TOKEN, SITE aur SECRET apne daalo):
     https://api.telegram.org/botTOKEN/setWebhook?url=https://SITE/api/telegram&secret_token=SECRET
  Bas. Ab Telegram mein buttons dabane se message ka status badalta hai.

4) DELIVERY AREA (5 km)
  config.js mein area.zones. Abhi Shrinath Medicity Hospital, Bareilly (28.3745, 79.4543) ke 5 km.
  - Radius badalna: radiusKm
  - Naya centre: Google Maps pe jagah pe right-click -> pehli line "28.37, 79.45" copy -> lat, lng mein daalo
  - Ek se zyada jagah: zones mein aur { name, lat, lng, radiusKm } jodo
  - Area check band karna ho: enabled: false.   Location zaroori na rakhna ho: requireLocation: false
  Server bhi dobara check karta hai, isliye bahar se koi order nahi kar sakta.

5) LOCATION KI ACCURACY
  Site GPS (high accuracy) use karti hai aur sabse sahi reading tak ruk kar leti hai (aam taur pe 5-15 meter).
  Andar (building ke andar) GPS kamzor hota hai, isliye customer se pata/ward bhi likhwate hain.

6) LINK PREVIEW (WhatsApp / Instagram pe sundar card)
  index.html mein og:image ka link https://freserjoos.vercel.app/assets/og.png hai.
  Agar aapki site ka link alag hai, to index.html mein "freserjoos.vercel.app" apne link se badal do,
  aur config.js mein brand.siteUrl bhi.

7) WHATSAPP
  Customer ke phone mein WhatsApp ab khulta hi nahi. Sirf agar Telegram order fail ho jaye to
  "WhatsApp se bhejo (backup)" ka button dikhta hai (config.js: orders.showWhatsAppBackup).
  Purana CallMeBot WhatsApp alert abhi bhi chalta hai agar CALLMEBOT_PHONE aur CALLMEBOT_APIKEY set karo (optional).

8) TEST
  Site kholo, location allow karo, ek order do. Telegram pe message + map pin aana chahiye.
  Nahi aaya? Vercel -> Project -> Logs dekho; token aur chat id dobara check karo.

9) SECURITY — console / "window" / View Source ka sach
  - Browser mein jo bhi file jaati hai (index.html, config.js, app.js) use koi bhi View Source ya Network tab se padh sakta hai.
    Ye har website ke saath hota hai, ise poori tarah chhupana possible nahi hai (right-click band karna ya code ulta-seedha karna bekaar hai).
  - Isliye rule ye hai: browser wali files mein koi SECRET nahi hota. Hamare yahan:
      * Telegram token, chat id          -> sirf Vercel Environment Variables mein (browser ko kabhi nahi milte)
      * Coupon codes                     -> api/_private.js (server-only), browser sirf server se poochta hai
      * Daam, area, phone number         -> public hain (customer ko dikhane ke liye hain hi)
  - Console mein "window.FRESHERS" ab undefined hai, aur "Ruko!" wali chetavni dikhti hai (logon ko paste karne se rokne ke liye).
  - Server har order dobara check karta hai (daam, coupon, 5 km area, naam, phone). Bahar wali site se order bhejna block hai.
  - vercel.json mein security headers (CSP) hain: dusri site ka script is site pe chal hi nahi sakta.
  - Customer ki location sirf order ke message mein jaati hai, kahin save nahi hoti.
  - Thodi si limit: koi chahe to apne phone ki fake location bhej sakta hai. Isliye Telegram message mein doori + accuracy dikhti hai
    aur delivery pe pata/phone ka match dekh lena.
