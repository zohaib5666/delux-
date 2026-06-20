// ============================================
// DELUXTRADER — Payment Gateway Integration
// File: js/payment.js
// ============================================
// 
// HOW TO INTEGRATE PAYMENT GATEWAYS
// Include this file in index.html after app.js
// <script src="js/payment.js"></script>
//
// ============================================

// ============================================
// 1. STRIPE (Credit/Debit Card — International)
// ============================================
// Step 1: Add to <head> in index.html:
//   <script src="https://js.stripe.com/v3/"></script>
//
// Step 2: Replace initStripe() below with your keys
//
// Step 3: Call initStripe() when card method selected

function initStripe() {
  // const stripe = Stripe('pk_live_YOUR_PUBLISHABLE_KEY');
  // const elements = stripe.elements();
  // const cardElement = elements.create('card', {
  //   style: {
  //     base: {
  //       color: '#e8e8e8',
  //       fontFamily: 'Arial, sans-serif',
  //       fontSize: '14px',
  //       '::placeholder': { color: '#555' }
  //     }
  //   }
  // });
  // cardElement.mount('#stripe-card-element');
  console.log('Stripe: Add your publishable key to activate');
}

// ============================================
// 2. JAZZCASH (Pakistan Mobile Wallet)
// ============================================
// JazzCash uses server-side redirect flow.
// You need a backend (PHP/Node.js) to:
//   - Generate HMAC-SHA256 hash
//   - POST to JazzCash endpoint
//
// Sandbox: https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/
// Live:    https://payments.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/
//
// Required fields (fill from merchant dashboard):
const JAZZCASH_CONFIG = {
  merchantId: 'YOUR_MERCHANT_ID',
  password:   'YOUR_PASSWORD',
  integeritySalt: 'YOUR_HASH_KEY',
  currency: 'PKR',
  language: 'EN',
  returnUrl: 'https://yoursite.com/payment-success',
  sandboxMode: true
};

function initiateJazzCashPayment(amount, txnRef) {
  // For production, generate hash on your backend:
  // Hash = HMAC-SHA256(pp_Amount + pp_BillReference + ... , IntegeritySalt)
  // Then POST form to JazzCash endpoint
  console.log('JazzCash: Configure JAZZCASH_CONFIG with your merchant credentials');
  console.log('Amount:', amount, 'TxnRef:', txnRef);
}

// ============================================
// 3. EASYPAISA (Pakistan Mobile Account)
// ============================================
// EasyPaisa REST API — requires backend
//
// API Base: https://easypay.easypaisa.com.pk/tansaction/
//
// Steps:
//   1. Get Store ID & Hash Key from EasyPaisa merchant portal
//   2. Backend: POST /initiate-transaction
//   3. Redirect user to EasyPaisa hosted page OR use iframe

const EASYPAISA_CONFIG = {
  storeId: 'YOUR_STORE_ID',
  hashKey: 'YOUR_HASH_KEY',
  returnUrl: 'https://yoursite.com/payment-success',
  sandboxMode: true
};

function initiateEasyPaisaPayment(amount, orderRefNum) {
  console.log('EasyPaisa: Configure EASYPAISA_CONFIG with your store credentials');
  console.log('Amount:', amount, 'OrderRef:', orderRefNum);
}

// ============================================
// 4. CASH ON DELIVERY (No Gateway Needed)
// ============================================
// Just save order to database on your backend
// No payment processing required

function processCODOrder(orderData) {
  // POST to your backend API:
  // fetch('/api/orders', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ ...orderData, paymentMethod: 'COD' })
  // })
  console.log('COD order:', orderData);
}

// ============================================
// 5. BACKEND API ENDPOINTS NEEDED
// ============================================
//
// POST /api/orders          — Save new order
// GET  /api/orders/:id      — Get order status
// POST /api/payment/verify  — Verify payment callback
// POST /api/payment/stripe  — Create Stripe PaymentIntent
// POST /api/payment/jazz    — Generate JazzCash hash
// POST /api/payment/easy    — Initiate EasyPaisa transaction
//
// Recommended backend: Node.js (Express) or PHP
// Database: MongoDB or MySQL

// ============================================
// UTILITY: Generate Order Reference
// ============================================
function generateOrderRef() {
  return 'DT-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2,4).toUpperCase();
}

// ============================================
// UNIFIED PAYMENT HANDLER
// ============================================
// Called from app.js placeOrder() function

function processPayment(method, amount, customerData) {
  const orderRef = generateOrderRef();
  
  switch(method) {
    case 'card':
      initStripe();
      // stripe.confirmPayment(...) 
      break;
    case 'jazzcash':
      initiateJazzCashPayment(amount, orderRef);
      break;
    case 'easypaisa':
      initiateEasyPaisaPayment(amount, orderRef);
      break;
    case 'cod':
      processCODOrder({ ...customerData, amount, orderRef });
      break;
  }
  
  return orderRef;
}
