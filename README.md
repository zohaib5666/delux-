# DeluxTrader — Premium Online Store
## Setup & Payment Gateway Guide

---

### 📁 Project Structure

```
deluxtrader/
├── index.html          ← Main store (Home + Shop + Checkout pages)
├── css/
│   └── style.css       ← All styling (Black & Gold theme)
├── js/
│   ├── products.js     ← All product data (29 products, 5 categories)
│   ├── app.js          ← Cart, navigation, filters
│   └── payment.js      ← Payment gateway integration guide
└── images/             ← Add your product images here
```

---

### 🚀 How to Run

1. Saari files ek folder mein rakhein
2. `index.html` browser mein open karein
3. Done! Store chal jayegi

**OR** kisi web hosting par upload karein (cPanel → File Manager → public_html)

---

### 💳 Payment Gateway Integration

#### Option 1: JazzCash (Recommended for Pakistan)
1. JazzCash merchant account banayein: https://payments.jazzcash.com.pk
2. `js/payment.js` mein `JAZZCASH_CONFIG` fill karein:
   - `merchantId` — aapka Merchant ID
   - `password` — aapka password
   - `integeritySalt` — hash key
3. Backend (PHP ya Node.js) mein hash generate karein
4. Form ko JazzCash endpoint par POST karein

#### Option 2: EasyPaisa
1. EasyPaisa merchant account: https://easypaisa.com.pk/merchants
2. `EASYPAISA_CONFIG` mein Store ID aur Hash Key fill karein
3. REST API calls backend se karein

#### Option 3: Stripe (International Cards)
1. Account banayein: https://stripe.com
2. `index.html` mein Stripe.js add karein:
   `<script src="https://js.stripe.com/v3/"></script>`
3. `payment.js` mein apni Publishable Key daalein

#### Option 4: Cash on Delivery
- Koi gateway nahin chahiye!
- Bas backend mein order save karein

---

### 🛍️ Categories & Products

| Category | Products |
|----------|----------|
| Beauty | 6 products (Serum, Lipstick, Foundation, Mascara, Eyeshadow, Night Cream) |
| Health & Household | 6 products (Vitamins, Air Purifier, Honey, Disinfectant, Omega-3, BP Monitor) |
| Personal Care | 6 products (Face Wash, Hair Oil, Toothbrush, Body Lotion, Deodorant, Beard Kit) |
| Toys | 5 products (Building Blocks, RC Car, Plush Toy, Board Game, Art Kit) |
| Office | 6 products (Wireless Mouse, Notebook, Desk Organizer, Pens, USB Hub, Keyboard) |

---

### ✏️ Products Update Karna

`js/products.js` file mein products array edit karein:

```javascript
{
  id: 30,                          // Unique number
  name: "Aapka Product Name",
  cat: "Beauty",                   // Category name
  price: 1500,                     // PKR mein
  oldPrice: 2000,                  // null agar sale nahin
  sale: true,                      // true/false
  isNew: false,                    // New badge
  icon: "🌟",                      // Emoji as image
  rating: 5,                       // 1-5
  reviews: 100,
  desc: "Product description here",
  tags: ["tag1", "tag2"]
}
```

---

### 🎨 Theme Colors

```css
--gold: #c9a84c        /* Main gold */
--gold-light: #e8c96a  /* Hover gold */
--gold-dark: #a07830   /* Dark gold */
--black: #0a0a0a       /* Background */
--card-bg: #151515     /* Card background */
```

---

### 📞 Support

Payment gateway integration mein help ke liye:
- JazzCash: 051-111-124-124
- EasyPaisa: 0311-1112345
- Stripe: support.stripe.com
