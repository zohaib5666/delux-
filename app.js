// ============================================
// DELUXTRADER — Main App Logic
// ============================================

// ---- STATE ----
let cart = [];
let currentPage = 'home';
let activeCategory = 'All';
let priceMax = 5000;

// ---- DOM READY ----
document.addEventListener('DOMContentLoaded', function () {
  renderHome();
  renderCategorySidebar();
  renderFilterTags();
  updateCartUI();

  // Price range slider
  const slider = document.getElementById('priceSlider');
  if (slider) {
    slider.addEventListener('input', function () {
      priceMax = parseInt(this.value);
      document.getElementById('priceMaxLabel').textContent = 'PKR ' + priceMax.toLocaleString();
      renderShopGrid();
    });
  }

  // Hamburger
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => mobileMenu.classList.toggle('open'));
  }
});

// ============================================
// PAGE NAVIGATION
// ============================================
function navigateTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + page);
  if (target) target.classList.add('active');
  currentPage = page;

  // Update nav active state
  document.querySelectorAll('.main-nav a, .mobile-menu a').forEach(a => {
    a.classList.toggle('active', a.dataset.page === page);
  });

  // Close mobile menu
  const mobileMenu = document.getElementById('mobileMenu');
  if (mobileMenu) mobileMenu.classList.remove('open');

  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (page === 'shop') renderShopGrid();
  if (page === 'checkout') renderCheckoutSummary();
}

function goToShopWithCategory(cat) {
  activeCategory = cat;
  navigateTo('shop');
  // Update sidebar & filter tags
  document.querySelectorAll('.sidebar-cat, .filter-tag').forEach(el => {
    el.classList.toggle('active', el.dataset.cat === cat);
  });
  renderShopGrid();
}

// ============================================
// HOME PAGE
// ============================================
function renderHome() {
  const featuredEl = document.getElementById('featuredGrid');
  if (!featuredEl) return;
  // Show top-rated products (4-5 stars, mix of categories)
  const featured = PRODUCTS.filter(p => p.rating >= 4).slice(0, 8);
  featuredEl.innerHTML = featured.map(renderProductCard).join('');
}

// ============================================
// SHOP PAGE
// ============================================
function renderShopGrid() {
  const grid = document.getElementById('shopGrid');
  const count = document.getElementById('resultsCount');
  if (!grid) return;

  let filtered = PRODUCTS;

  if (activeCategory !== 'All') {
    filtered = filtered.filter(p => p.cat === activeCategory);
  }
  filtered = filtered.filter(p => p.price <= priceMax);

  if (count) count.textContent = filtered.length + ' products';

  grid.innerHTML = filtered.length
    ? filtered.map(renderProductCard).join('')
    : '<div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--text-dim);font-family:Arial,sans-serif;font-size:13px;">No products found for selected filters.</div>';
}

function renderCategorySidebar() {
  const sidebar = document.getElementById('categorySidebar');
  if (!sidebar) return;
  const cats = ['All', 'Beauty', 'Health & Household', 'Personal Care', 'Toys', 'Office'];
  sidebar.innerHTML = cats.map(cat => {
    const count = cat === 'All' ? PRODUCTS.length : PRODUCTS.filter(p => p.cat === cat).length;
    return `<div class="sidebar-cat${cat === activeCategory ? ' active' : ''}" data-cat="${cat}" onclick="filterByCategory('${cat}')">
      ${cat}
      <span class="sidebar-cat-count">${count}</span>
    </div>`;
  }).join('');
}

function renderFilterTags() {
  const bar = document.getElementById('filterTagsBar');
  if (!bar) return;
  const cats = ['All', 'Beauty', 'Health & Household', 'Personal Care', 'Toys', 'Office'];
  bar.innerHTML = cats.map(cat =>
    `<button class="filter-tag${cat === activeCategory ? ' active' : ''}" data-cat="${cat}" onclick="filterByCategory('${cat}')">${cat}</button>`
  ).join('');
}

function filterByCategory(cat) {
  activeCategory = cat;
  renderShopGrid();
  // Update UI
  document.querySelectorAll('.sidebar-cat, .filter-tag').forEach(el => {
    el.classList.toggle('active', el.dataset.cat === cat);
  });
}

// ============================================
// PRODUCT CARD RENDERER
// ============================================
function renderProductCard(p) {
  const stars = '★'.repeat(p.rating) + '☆'.repeat(5 - p.rating);
  const savePct = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  return `
    <div class="product-card">
      ${p.sale ? '<div class="sale-badge">Sale</div>' : ''}
      ${p.isNew ? '<div class="new-badge">New</div>' : ''}
      <div class="product-img">${p.icon}</div>
      <div class="product-info">
        <div class="product-cat">${p.cat}</div>
        <div class="product-stars">${stars} <span style="font-size:10px;color:var(--text-dim);font-family:Arial,sans-serif;">(${p.reviews})</span></div>
        <div class="product-name">${p.name}</div>
        <div class="product-desc">${p.desc}</div>
        <div class="product-price">
          <span class="price-current">PKR ${p.price.toLocaleString()}</span>
          ${p.oldPrice ? `<span class="price-old">PKR ${p.oldPrice.toLocaleString()}</span>` : ''}
          ${p.sale && p.oldPrice ? `<span class="price-save">${savePct}% OFF</span>` : ''}
        </div>
        <button class="add-to-cart" onclick="addToCart(${p.id})">Add to Cart</button>
      </div>
    </div>`;
}

// ============================================
// CART SYSTEM
// ============================================
function addToCart(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  updateCartUI();
  showToast(product.name + ' added to cart!');
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  updateCartUI();
  renderCartItems();
}

function updateQty(productId, delta) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(productId);
    return;
  }
  updateCartUI();
  renderCartItems();
}

function updateCartUI() {
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const count = cart.reduce((sum, item) => sum + item.qty, 0);

  // Update count badge
  document.querySelectorAll('.cart-count').forEach(el => el.textContent = count);

  // Update cart items in drawer
  renderCartItems();
}

function renderCartItems() {
  const container = document.getElementById('cartItems');
  const footer = document.getElementById('cartFooter');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">🛒</div>
        <p>Your cart is empty</p>
        <p style="margin-top:8px;font-size:11px;color:#444;">Add some products to get started</p>
      </div>`;
    if (footer) footer.style.display = 'none';
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-img">${item.icon}</div>
      <div class="cart-item-details">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">PKR ${(item.price * item.qty).toLocaleString()}</div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="updateQty(${item.id}, -1)">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="updateQty(${item.id}, 1)">+</button>
        </div>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart(${item.id})" title="Remove">✕</button>
    </div>`).join('');

  if (footer) {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const shipping = subtotal >= 3000 ? 0 : 199;
    const total = subtotal + shipping;

    footer.style.display = 'block';
    document.getElementById('cartSubtotal').textContent = 'PKR ' + subtotal.toLocaleString();
    document.getElementById('cartShipping').textContent = shipping === 0 ? 'FREE' : 'PKR ' + shipping;
    document.getElementById('cartTotal').textContent = 'PKR ' + total.toLocaleString();
  }
}

function toggleCart() {
  document.getElementById('cartDrawer').classList.toggle('open');
  document.getElementById('cartOverlay').classList.toggle('open');
}

function closeCart() {
  document.getElementById('cartDrawer').classList.remove('open');
  document.getElementById('cartOverlay').classList.remove('open');
}

// ============================================
// CHECKOUT PAGE
// ============================================
function renderCheckoutSummary() {
  const itemsEl = document.getElementById('checkoutItems');
  if (!itemsEl) return;

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = subtotal >= 3000 ? 0 : 199;
  const total = subtotal + shipping;

  itemsEl.innerHTML = cart.map(item => `
    <div class="summary-item">
      <div class="summary-item-img">${item.icon}</div>
      <div class="summary-item-name">${item.name} <span style="color:var(--text-dim);">x${item.qty}</span></div>
      <div class="summary-item-price">PKR ${(item.price * item.qty).toLocaleString()}</div>
    </div>`).join('') || '<div style="color:var(--text-dim);font-size:13px;font-family:Arial,sans-serif;padding:16px 0;">No items in cart.</div>';

  document.getElementById('summarySubtotal').textContent = 'PKR ' + subtotal.toLocaleString();
  document.getElementById('summaryShipping').textContent = shipping === 0 ? 'FREE' : 'PKR 199';
  document.getElementById('summaryTotal').textContent = 'PKR ' + total.toLocaleString();
}

function selectPaymentMethod(method) {
  document.querySelectorAll('.payment-method-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.method === method);
  });
  // Payment gateway integration point
  loadPaymentGateway(method);
}

// ============================================
// PAYMENT GATEWAY INTEGRATION
// ============================================
// This function is called when user selects a payment method
// Replace the placeholder content with actual gateway SDK
function loadPaymentGateway(method) {
  const container = document.getElementById('paymentGatewayContainer');
  if (!container) return;

  /* ================================================
     PAYMENT GATEWAY INTEGRATION GUIDE
     ================================================
     
     1. STRIPE (International)
        - Include: <script src="https://js.stripe.com/v3/"></script>
        - const stripe = Stripe('YOUR_PUBLISHABLE_KEY');
        - Mount: stripe.elements() → mount to #payment-element
     
     2. JAZZCASH (Pakistan)
        - POST to: https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/
        - Required fields: pp_MerchantID, pp_Password, pp_TxnRefNo, pp_Amount, pp_TxnCurrency, pp_TxnDateTime
        - Generate HMAC hash on backend
     
     3. EASYPAISA (Pakistan)
        - API endpoint: https://easypay.easypaisa.com.pk/
        - Use store ID & hash key from your merchant account
     
     4. PAYFAST (South Africa / Global)
        - Include their hosted payment form
     
     5. 2CHECKOUT / VERIFONE
        - Include: <script src="https://www.2checkout.com/static/checkout/javascript/sellInline.js"></script>
     ================================================ */

  switch(method) {
    case 'card':
      container.innerHTML = `
        <div style="padding:20px 0;">
          <!-- STRIPE CARD ELEMENT MOUNTS HERE -->
          <!-- Replace with: <div id="stripe-card-element"></div> -->
          <div style="border:1px dashed var(--border-gold);padding:24px;text-align:center;color:var(--text-dim);font-family:Arial,sans-serif;">
            <div style="font-size:32px;margin-bottom:12px;">💳</div>
            <p style="font-size:12px;letter-spacing:1px;margin-bottom:4px;">Credit / Debit Card</p>
            <small style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#444;">Stripe / 2Checkout Integration Point</small>
          </div>
        </div>`;
      break;
    case 'jazzcash':
      container.innerHTML = `
        <div style="padding:20px 0;">
          <!-- JAZZCASH FORM FIELDS HERE -->
          <div style="border:1px dashed var(--border-gold);padding:24px;text-align:center;color:var(--text-dim);font-family:Arial,sans-serif;">
            <div style="font-size:32px;margin-bottom:12px;">📱</div>
            <p style="font-size:12px;letter-spacing:1px;margin-bottom:4px;">JazzCash Mobile Payment</p>
            <small style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#444;">JazzCash Merchant API Integration Point</small>
          </div>
        </div>`;
      break;
    case 'easypaisa':
      container.innerHTML = `
        <div style="padding:20px 0;">
          <!-- EASYPAISA WIDGET HERE -->
          <div style="border:1px dashed var(--border-gold);padding:24px;text-align:center;color:var(--text-dim);font-family:Arial,sans-serif;">
            <div style="font-size:32px;margin-bottom:12px;">💚</div>
            <p style="font-size:12px;letter-spacing:1px;margin-bottom:4px;">EasyPaisa Payment</p>
            <small style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#444;">EasyPaisa Store API Integration Point</small>
          </div>
        </div>`;
      break;
    case 'cod':
      container.innerHTML = `
        <div style="padding:24px;background:rgba(201,168,76,0.05);border:1px solid var(--border-gold);">
          <p style="font-size:13px;color:#ccc;font-family:Arial,sans-serif;line-height:1.8;">
            ✅ <strong style="color:var(--gold);">Cash on Delivery</strong> selected.<br>
            Pay when your order arrives at your doorstep. Available across Pakistan.
          </p>
        </div>`;
      break;
  }
}

function placeOrder(event) {
  event.preventDefault();
  const name = document.getElementById('firstName').value;
  if (!name) return;
  // Validate & process
  // For real integration: submit to backend API
  showToast('Order placed successfully! Thank you, ' + name + '!');
  cart = [];
  updateCartUI();
  setTimeout(() => navigateTo('home'), 2000);
}

// ============================================
// TOAST
// ============================================
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}
