/**
 * Global Memory App State tracking tracking, counters, and metrics logs
 */
const AppState = {
    cartItems: [],
    totalPrice: 0.00,
    totalMpesaSpent: 0.00,
    ordersPlacedCount: 0,
    dispatchedPackages: [] // Keeps track of paid items for delivery status matching
};

/**
 * Orchestrates page switching across core sections (Auth vs. Main Store Wrapper)
 */
function navigateToPage(pageId) {
    document.querySelectorAll('.page-view').forEach(page => {
        page.classList.remove('active-page');
    });
    
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active-page');
        window.scrollTo(0, 0);
    }
}

/**
 * Handles subview swaps within the core Authentication component
 */
function switchAuthView(viewName) {
    document.querySelectorAll('#auth-page .auth-view').forEach(view => {
        view.classList.remove('active-view');
    });

    const retroPopups = document.getElementById('retro-popups');
    const brandSubtitle = document.getElementById('brand-subtitle-text');
    
    retroPopups.classList.remove('active-graphics');
    brandSubtitle.style.display = "block";

    if (viewName === 'signup') {
        document.getElementById('signup-view').classList.add('active-view');
    } else if (viewName === 'login') {
        document.getElementById('login-view').classList.add('active-view');
        brandSubtitle.innerText = "Ng’ara In Style";
    } else if (viewName === 'forgot') {
        document.getElementById('forgot-view').classList.add('active-view');
        retroPopups.classList.add('active-graphics');
        brandSubtitle.style.display = "none";
    }
}

/**
 * Controls routing within the Main Storefront navigation ecosystem tabs
 */
function switchStoreView(viewId, navLinkId) {
    document.querySelectorAll('.store-view').forEach(view => {
        view.classList.remove('active-view');
    });

    document.querySelectorAll('.nav-item').forEach(link => {
        link.classList.remove('active');
    });

    document.getElementById(viewId).classList.add('active-view');
    document.getElementById(navLinkId).classList.add('active');

    if (viewId === 'cart-page') {
        renderCartUI();
    } else if (viewId === 'track-page') {
        renderTrackingUI();
    }
}

/**
 * Form Interceptor to sync credentials across profiles and route forward
 */
function handleAuthSubmit(event) {
    event.preventDefault();
    let nameVal = "Abdi Majit";
    let emailVal = "abdi@gmail.com";
    
    const activeFormId = event.target.id;
    if (activeFormId === 'signup-view') {
        nameVal = document.getElementById('signup-name').value;
        emailVal = document.getElementById('signup-email').value;
    } else if (activeFormId === 'login-view') {
        emailVal = document.getElementById('login-email').value;
    }

    // Dynamic state synchronization hooks
    document.getElementById('profile-display-name').innerText = nameVal;
    document.getElementById('profile-display-email').innerText = emailVal;
    document.getElementById('dashboard-user-title').innerText = nameVal;
    document.getElementById('mpesa-client-name').value = nameVal; // Pre-populate payment field

    navigateToPage('store-wrapper-page');
    switchStoreView('products-page', 'nav-products');
}

/**
 * Dynamically appends any unique product payload into basket memory array matrix
 */
function addToCartClick(name, price) {
    AppState.cartItems.push({ name: name, price: price });
    AppState.totalPrice += price;
    
    // Sync both counters (Navigation item and Dashboard metrics header)
    document.getElementById('cart-counter').innerText = AppState.cartItems.length;
    document.getElementById('stat-basket-count').innerText = AppState.cartItems.length;

    alert(`"${name}" successfully added to your Basket pipeline!`);
}

/**
 * Generates runtime innerHTML layout lists representing state memory logs values
 */
function renderCartUI() {
    const container = document.getElementById('cart-items-container');
    const totalDisplay = document.getElementById('cart-total-price');
    
    container.innerHTML = "";

    if (AppState.cartItems.length === 0) {
        container.innerHTML = `<p id="empty-cart-text">No selected vintage items in your basket yet.</p>`;
        totalDisplay.innerText = "KES 0.00";
        return;
    }

    AppState.cartItems.forEach(item => {
        const row = document.createElement('div');
        row.className = "cart-item-row";
        row.innerHTML = `
            <span>${item.name}</span>
            <span class="price-pink">KES ${item.price.toFixed(2)}</span>
        `;
        container.appendChild(row);
    });

    totalDisplay.innerText = `KES ${AppState.totalPrice.toFixed(2)}`;
}

/* ==========================================================================
   INTEGRATED MPESA PAYMENTS & PRELOADER CONTROL PIPELINES
   ========================================================================== */

function openMpesaModal() {
    if (AppState.cartItems.length === 0) {
        alert("Your basket container is empty! Choose products before triggering checkout channels.");
        return;
    }
    document.getElementById('mpesa-modal-amount').innerText = `KES ${AppState.totalPrice.toFixed(2)}`;
    document.getElementById('mpesa-modal-overlay').classList.add('active-modal');
}

function closeMpesaModal() {
    document.getElementById('mpesa-modal-overlay').classList.remove('active-modal');
}

/**
 * Intercepts Mpesa execution to fire preloader animations and state transforms
 */
function handleMpesaPayment(event) {
    event.preventDefault();
    
    const clientName = document.getElementById('mpesa-client-name').value;
    const clientPhone = document.getElementById('mpesa-client-phone').value;
    
    // Hide standard popup form prompt
    closeMpesaModal();

    // Fire 3-Second Precision Visual Loader Overlay Environment
    const loader = document.getElementById('preloader-overlay');
    const barFill = document.getElementById('preloader-bar-fill');
    loader.classList.add('active-modal');
    
    // Animate synchronization fill transitions cleanly over exactly 3000ms
    barFill.style.transition = "none";
    barFill.style.transform = "translateX(-100%)";
    
    setTimeout(() => {
        barFill.style.transition = "transform 3s linear";
        barFill.style.transform = "translateX(0%)";
    }, 50);

    // After precisely 3 seconds, execute state updates and dashboard syncs
    setTimeout(() => {
        loader.classList.remove('active-modal');
        
        // Generate dynamic tracking records package block metrics payload entries
        const orderId = "MTB-" + Math.floor(100000 + Math.random() * 900000);
        const purchasedProducts = [...AppState.cartItems];
        
        AppState.dispatchedPackages.push({
            id: orderId,
            items: purchasedProducts,
            totalCost: AppState.totalPrice,
            buyer: clientName,
            phone: clientPhone,
            timestamp: new Date().toLocaleTimeString()
        });

        // 1. Dashboard State Matrix Updates Update Logic
        AppState.totalMpesaSpent += AppState.totalPrice;
        AppState.ordersPlacedCount += 1;

        document.getElementById('stat-total-spent').innerText = `KES ${AppState.totalMpesaSpent.toFixed(2)}`;
        document.getElementById('stat-orders-placed').innerText = AppState.ordersPlacedCount;

        // Reset basket tracking arrays arrays completely 
        AppState.cartItems = [];
        AppState.totalPrice = 0.00;
        document.getElementById('cart-counter').innerText = "0";
        document.getElementById('stat-basket-count').innerText = "0";

        alert(`Payment Confirmed! KES ${AppState.totalMpesaSpent.toFixed(2)} received from ${clientName} (${clientPhone}). Dashboard updated.`);
        
        // Auto route back to the upgraded main metric system overview panel page
        switchStoreView('products-page', 'nav-products');

    }, 3050);
}

/* ==========================================================================
   LIVE LOGISTICS TRACKING GENERATOR INTERFACES
   ========================================================================== */
function renderTrackingUI() {
    const container = document.getElementById('tracking-logs-container');
    container.innerHTML = "";

    if (AppState.dispatchedPackages.length === 0) {
        container.innerHTML = `<p style="opacity: 0.6; text-align: center; padding: 20px 0;">No packages currently dispatched. Secure checkout items via M-Pesa to trigger logistics processing.</p>`;
        return;
    }

    AppState.dispatchedPackages.forEach(pkg => {
        const itemNames = pkg.items.map(i => i.name).join(', ');
        const card = document.createElement('div');
        card.className = "tracking-card";
        card.innerHTML = `
            <div class="tracking-header">
                <strong>Tracking ID: ${pkg.id}</strong>
                <span>Time: ${pkg.timestamp}</span>
            </div>
            <div style="font-size: 1.05rem; margin-bottom: 8px;">
                <strong>Consignment:</strong> ${itemNames}
            </div>
            <div style="font-size: 0.9rem; opacity: 0.8;">
                <strong>Recipient Info:</strong> ${pkg.buyer} (${pkg.phone}) | <strong>Paid:</strong> KES ${pkg.totalCost.toFixed(2)} via M-Pesa
            </div>
            <div class="tracking-timeline">
                <div class="tracking-step done">✓ Paid</div>
                <div class="tracking-step done">● Dispatched</div>
                <div class="tracking-step">In Transit</div>
                <div class="tracking-step">Arrived Thika</div>
            </div>
        `;
        container.appendChild(card);
    });
}

/**
 * Resets variables and redirects backwards to gateway authentication
 */
function handleLogout() {
    AppState.cartItems = [];
    AppState.totalPrice = 0.00;
    AppState.totalMpesaSpent = 0.00;
    AppState.ordersPlacedCount = 0;
    AppState.dispatchedPackages = [];
    
    document.getElementById('cart-counter').innerText = "0";
    document.getElementById('stat-basket-count').innerText = "0";
    document.getElementById('stat-total-spent').innerText = "KES 0.00";
    document.getElementById('stat-orders-placed').innerText = "0";
    
    switchAuthView('login');
    navigateToPage('auth-page');
}

function triggerPasswordAlert() {
    alert('Security access tokens dispatched successfully!');
    switchAuthView('login');
}

function toggleNavMenuAlert() {
    alert('Filters, categories, and settings loading...');
}