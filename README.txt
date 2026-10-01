FRESHER'S WEBSITE — SETUP (Hinglish)
====================================

FILES
  index.html     -> poori site (design)
  config.js      -> naam, daam, ml, phone, plans (sirf yahi badalna hai)
  format.js      -> WhatsApp message ka format (ek jaisa browser aur server dono ke liye)
  api/order.js   -> order aate hi aapke WhatsApp/Telegram pe bhejta hai (Vercel function)
  vercel.json    -> security settings (location allow karne ke liye bhi)

1) VERCEL PE DAALNA
  - Poora folder (api folder ke saath) Vercel pe daalo: GitHub se jodo ya vercel.com -> Add New -> Project.
  - Framework: "Other". Deploy dabao. Bas.
  - Bina kuch aur kiye bhi site chalegi: customer ke phone mein WhatsApp khulega aur wo Send dabayega.

2) AUTOMATIC ORDER APKE WHATSAPP PE (FREE) — CallMeBot
  Ye free "personal use" service hai, sirf aapko (owner ko) message bhejti hai. Ye WhatsApp ka
  official API nahi hai, isliye kabhi band ya slow ho sakti hai. Isliye Telegram bhi laga lo (neeche).
  a) callmebot.com pe "Free API WhatsApp" page kholo, wahan jo bot ka number likha ho use contacts mein save karo.
  b) Us number ko WhatsApp pe ye message bhejo:   I allow callmebot to send me messages
  c) Bot jawab mein aapko APIKEY dega.
  d) Vercel -> Project -> Settings -> Environment Variables mein ye 2 jodo:
        CALLMEBOT_PHONE   = 916396835709        (91 ke saath, + ke bina)
        CALLMEBOT_APIKEY  = (bot ne jo key di)
  e) Redeploy karo (Deployments -> ... -> Redeploy).

3) TELEGRAM BACKUP (FREE, pakka chalta hai)
  a) Telegram mein @BotFather ko /newbot bhejo, naam do, aapko BOT TOKEN milega.
  b) Apne naye bot ko /start bhejo.
  c) Browser mein kholo:  https://api.telegram.org/bot<TOKEN>/getUpdates   -> "chat":{"id": ... } wahi CHAT ID hai.
  d) Vercel Environment Variables:
        TELEGRAM_BOT_TOKEN = (token)
        TELEGRAM_CHAT_ID   = (chat id)
  e) Redeploy.

  Dono laga do to dono jagah order aayega.

4) LOCATION
  Customer "Meri location bhejo" dabata hai, order message mein Google Maps ka link aata hai.
  Location ke liye site HTTPS honi chahiye (Vercel pe apne aap hoti hai).

5) TEST
  Site kholo, ek order do. Env keys laga di hain to aapke WhatsApp/Telegram pe message aana chahiye.
  Nahi aaya? Vercel -> Logs dekho, aur keys dobara check karo.

6) PRIVACY
  Customer ka naam, number aur location sirf order ke message mein jaate hain, kahin store nahi hote.
  Ek chhoti privacy line site pe likhna achha rahega.
