/* SIRF SERVER KE LIYE. Ye file browser ko kabhi nahi bheji jaati, isliye yahan ke coupon koi nahi dekh sakta.
   (api folder mein "_" se shuru hone wali file Vercel pe public link nahi banti.)
   percent: kitne % off | flat: seedha Rs off | minOrder: kam se kam order | maxOff: zyada se zyada chhoot */
module.exports = {
  coupons: [
    { code: "FRESH10", percent: 10, minOrder: 100, maxOff: 50 }
  ]
};
