// app.js - Complete MITUMBA.ke frontend JavaScript

// ============================================
// CONFIGURATION & STATE
// ============================================

const API_BASE_URL = 'api/';
let currentAuthView = 'login';
let cartItems = [];
let currentUser = null;

// ============================================
// AUTHENTICATION FUNCTIONS
// ============================================

/**
 * Register a new user
 */
async function registerUser(event) {
    event.preventDefault();
    
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    
    if (!name || !email || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}register.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentUser = data.user;
            showNotification('Registration successful!', 'success');
            navigateToPage('products-page');
            updateUI();
        } else {
            showNotification(data.error || 'Registration failed', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showNotification('Network error. Please try again.', 'error');
    }
}

/**
 * Login user
 */
async function loginUser(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    
    if (!email || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}login.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentUser = data.user;
            showNotification('Login successful!', 'success');
            navigateToPage('products-page');
            updateUI();
        } else {
            showNotification(data.error || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Network error. Please try again.', 'error');
    }
}

/**
 * Logout user
 */
async function logoutUser() {
    try {
        const response = await fetch(`${API_BASE_URL}logout.php`, {
            method: 'POST'
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentUser = null;
            cartItems = [];
            showNotification('Logged out successfully', 'success');
            navigateToPage('auth-page');
            updateUI();
        }
    } catch (error) {
        console.error('Logout error:', error);
        showNotification('Error logging out', 'error');
    }
}

/**
 * Handle logout click
 */
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        logoutUser();
    }
}

/**
 * Handle auth form submission
 */
function handleAuthSubmit(event) {
    event.preventDefault();
    const activeView = document.querySelector('.auth-view.active-view');
    
    if (activeView.id === 'signup-view') {
        registerUser(event);
    } else if (activeView.id === 'login-view') {
        loginUser(event);
    }
}

/**
 * Switch between auth views (login/signup/forgot)
 */
function switchAuthView(view) {
    document.querySelectorAll('.auth-view').forEach(el => {
        el.classList.remove('active-view');
    });
    
    document.getElementById(`${view}-view`).classList.add('active-view');
    currentAuthView = view;
}

/**
 * Trigger password reset alert
 */
function triggerPasswordAlert() {
    showNotification('Password reset link sent to your email!', 'success');
}

// ============================================
// PRODUCT FUNCTIONS
// ============================================

/**
 * Load and display products
 */
async function loadProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}get_products.php`);
        const data = await response.json();
        
        if (data.success) {
            renderProducts(data.products);
        } else {
            showNotification('Failed to load products', 'error');
        }
    } catch (error) {
        console.error('Load products error:', error);
        showNotification('Network error loading products', 'error');
    }
}

/**
 * Render products to the grid
 */
function renderProducts(products) {
    const productsGrid = document.querySelector('.products-grid');
    if (!productsGrid) return;
    
    productsGrid.innerHTML = '';
    
    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${product.image || 'https://via.placeholder.com/500x240'}" 
                 alt="${product.name}" 
                 class="card-img-top">
            <div class="product-info">
                <span class="price-pink">KES ${product.price.toFixed(2)}</span>
                <span class="product-name">${product.name}</span>
            </div>
            <button class="add-to-basket-btn" onclick="addToCart(${product.id})">
                Add to Basket
            </button>
        `;
        productsGrid.appendChild(card);
    });
}

// ============================================
// CART FUNCTIONS
// ============================================

/**
 * Add product to cart
 */
async function addToCart(productId) {
    if (!currentUser) {
        showNotification('Please login to add items to cart', 'error');
        switchAuthView('login');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}add_to_cart.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                product_id: productId, 
                quantity: 1 
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Item added to cart!', 'success');
            loadCart();
            updateStats();
        } else {
            showNotification(data.error || 'Failed to add to cart', 'error');
        }
    } catch (error) {
        console.error('Add to cart error:', error);
        showNotification('Network error', 'error');
    }
}

/**
 * Load user's cart
 */
async function loadCart() {
    if (!currentUser) {
        cartItems = [];
        updateCartUI();
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}get_cart.php`);
        const data = await response.json();
        
        if (data.success) {
            cartItems = data.items;
            updateCartUI();
            updateStats();
        }
    } catch (error) {
        console.error('Load cart error:', error);
    }
}

/**
 * Remove item from cart
 */
async function removeCartItem(cartItemId) {
    if (!confirm('Remove this item from cart?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}remove_cart_item.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cart_item_id: cartItemId })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Item removed from cart', 'success');
            loadCart();
            updateStats();
        } else {
            showNotification(data.error || 'Failed to remove item', 'error');
        }
    } catch (error) {
        console.error('Remove cart item error:', error);
        showNotification('Network error', 'error');
    }
}

/**
 * Update cart UI
 */
function updateCartUI() {
    // Update cart counter in nav
    const counter = document.getElementById('cart-counter');
    if (counter) {
        counter.textContent = cartItems.length;
    }
    
    // Update cart page
    const container = document.getElementById('cart-items-container');
    if (!container) return;
    
    if (cartItems.length === 0) {
        container.innerHTML = `
            <p style="opacity: 0.6; text-align: center; padding: 20px 0;">
                Your basket is empty. Start shopping!
            </p>
        `;
        document.getElementById('cart-total-price').textContent = 'KES 0.00';
        return;
    }
    
    let total = 0;
    container.innerHTML = cartItems.map(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        return `
            <div class="cart-item-row">
                <div>
                    <strong>${item.name}</strong>
                    <span style="opacity: 0.7; margin-left: 10px;">×${item.quantity}</span>
                </div>
                <div>
                    <span>KES ${subtotal.toFixed(2)}</span>
                    <button onclick="removeCartItem(${item.id})" 
                            style="margin-left: 15px; background: none; border: none; color: #ff6b6b; cursor: pointer;">
                        ✕
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    document.getElementById('cart-total-price').textContent = `KES ${total.toFixed(2)}`;
}

/**
 * Update dashboard statistics
 */
function updateStats() {
    const basketCount = document.getElementById('stat-basket-count');
    if (basketCount) {
        basketCount.textContent = cartItems.length;
    }
}

// ============================================
// CHECKOUT FUNCTIONS
// ============================================

/**
 * Open M-Pesa modal
 */
function openMpesaModal() {
    if (cartItems.length === 0) {
        showNotification('Your cart is empty!', 'error');
        return;
    }
    
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('mpesa-modal-amount').textContent = `KES ${total.toFixed(2)}`;
    document.getElementById('mpesa-modal-overlay').classList.add('active-modal');
}

/**
 * Close M-Pesa modal
 */
function closeMpesaModal() {
    document.getElementById('mpesa-modal-overlay').classList.remove('active-modal');
}

/**
 * Handle M-Pesa payment
 */
async function handleMpesaPayment(event) {
    event.preventDefault();
    
    const name = document.getElementById('mpesa-client-name').value.trim();
    const phone = document.getElementById('mpesa-client-phone').value.trim();
    
    if (!name || !phone) {
        showNotification('Please fill in all payment details', 'error');
        return;
    }
    
    // Show preloader
    document.getElementById('preloader-overlay').classList.add('active-modal');
    document.getElementById('preloader-title').textContent = 'Processing Payment...';
    document.getElementById('preloader-desc').textContent = 'Initiating M-Pesa STK push. Please check your phone.';
    
    // Simulate STK push delay
    let progress = 0;
    const bar = document.getElementById('preloader-bar-fill');
    const interval = setInterval(() => {
        progress += 5;
        bar.style.transform = `translateX(${100 - progress}%)`;
        
        if (progress >= 100) {
            clearInterval(interval);
            // Complete order
            completeOrder(phone);
        }
    }, 200);
}

/**
 * Complete order after payment
 */
async function completeOrder(phone) {
    try {
        const response = await fetch(`${API_BASE_URL}create_order.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone_number: phone })
        });
        
        const data = await response.json();
        
        // Hide preloader
        document.getElementById('preloader-overlay').classList.remove('active-modal');
        closeMpesaModal();
        
        if (data.success) {
            showNotification(`Order ${data.order.order_number} created successfully!`, 'success');
            cartItems = [];
            updateCartUI();
            updateStats();
            
            // Switch to tracking page
            switchStoreView('track-page', 'nav-track');
            loadOrders();
        } else {
            showNotification(data.error || 'Order failed. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Complete order error:', error);
        document.getElementById('preloader-overlay').classList.remove('active-modal');
        showNotification('Payment processing error. Please try again.', 'error');
    }
}

// ============================================
// ORDER TRACKING FUNCTIONS
// ============================================

/**
 * Load user's orders
 */
async function loadOrders() {
    if (!currentUser) {
        showNotification('Please login to view orders', 'error');
        return;
    }
    
    try {
        // For demo, we'll load recent orders from profile
        const response = await fetch(`${API_BASE_URL}profile.php`);
        const data = await response.json();
        
        if (data.success && data.recent_orders) {
            renderOrders(data.recent_orders);
        } else {
            document.getElementById('tracking-logs-container').innerHTML = `
                <p style="opacity: 0.6; text-align: center; padding: 20px 0;">
                    No orders found. Start shopping!
                </p>
            `;
        }
    } catch (error) {
        console.error('Load orders error:', error);
    }
}

/**
 * Render orders in tracking page
 */
function renderOrders(orders) {
    const container = document.getElementById('tracking-logs-container');
    if (!container) return;
    
    if (orders.length === 0) {
        container.innerHTML = `
            <p style="opacity: 0.6; text-align: center; padding: 20px 0;">
                No orders found.
            </p>
        `;
        return;
    }
    
    container.innerHTML = orders.map(order => `
        <div class="tracking-card">
            <div class="tracking-header">
                <span><strong>Order #${order.order_number}</strong></span>
                <span>${formatDate(order.created_at)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span>Total: KES ${order.total_amount.toFixed(2)}</span>
                <span style="color: #4eb848; font-weight: bold;">${order.status.toUpperCase()}</span>
            </div>
            <div class="tracking-timeline">
                ${getOrderTimeline(order.status)}
            </div>
        </div>
    `).join('');
}

/**
 * Get order timeline HTML
 */
function getOrderTimeline(status) {
    const steps = ['pending', 'processing', 'packed', 'shipped', 'delivered'];
    const currentStep = steps.indexOf(status);
    
    return steps.map((step, index) => `
        <div class="tracking-step ${index <= currentStep ? 'done' : ''}">
            ${index <= currentStep ? '✓' : '○'}
            ${step.charAt(0).toUpperCase() + step.slice(1)}
        </div>
    `).join('');
}

/**
 * Track specific order
 */
async function trackOrder(orderNumber) {
    try {
        const response = await fetch(`${API_BASE_URL}track_order.php?order_number=${orderNumber}`);
        const data = await response.json();
        
        if (data.success) {
            showNotification(`Order ${orderNumber}: ${data.order.status}`, 'info');
        } else {
            showNotification(data.error || 'Order not found', 'error');
        }
    } catch (error) {
        console.error('Track order error:', error);
    }
}

// ============================================
// PROFILE FUNCTIONS
// ============================================

/**
 * Load user profile
 */
async function loadProfile() {
    if (!currentUser) {
        showNotification('Please login to view profile', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}profile.php`);
        const data = await response.json();
        
        if (data.success) {
            // Update profile display
            document.getElementById('profile-display-name').textContent = data.user.name;
            document.getElementById('profile-display-email').textContent = data.user.email;
            
            // Update dashboard
            document.getElementById('dashboard-user-title').textContent = data.user.name;
            document.getElementById('stat-orders-placed').textContent = data.statistics.total_orders;
            document.getElementById('stat-total-spent').textContent = `KES ${data.statistics.total_spent.toFixed(2)}`;
        }
    } catch (error) {
        console.error('Load profile error:', error);
    }
}

// ============================================
// NAVIGATION FUNCTIONS
// ============================================

/**
 * Navigate to a specific page
 */
function navigateToPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page-view').forEach(el => {
        el.classList.remove('active-page');
    });
    
    // Show target page
    const target = document.getElementById(pageId);
    if (target) {
        target.classList.add('active-page');
    }
    
    // Load content based on page
    if (pageId === 'products-page') {
        loadProducts();
        loadCart();
        loadProfile();
    } else if (pageId === 'cart-page') {
        loadCart();
    } else if (pageId === 'track-page') {
        loadOrders();
    } else if (pageId === 'profile-page') {
        loadProfile();
    }
}

/**
 * Switch store view
 */
function switchStoreView(viewId, navId) {
    // Update views
    document.querySelectorAll('.store-view').forEach(el => {
        el.classList.remove('active-view');
    });
    document.getElementById(viewId).classList.add('active-view');
    
    // Update nav
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.remove('active');
    });
    if (navId) {
        document.getElementById(navId).classList.add('active');
    }
}

/**
 * Toggle navigation menu alert
 */
function toggleNavMenuAlert() {
    showNotification('Navigation menu opened', 'info');
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existing = document.querySelector('.notification-toast');
    if (existing) existing.remove();
    
    // Create new notification
    const toast = document.createElement('div');
    toast.className = 'notification-toast';
    toast.innerHTML = `
        <div style="padding: 12px 20px; border-radius: 8px; 
                    background: ${type === 'success' ? '#4eb848' : 
                               type === 'error' ? '#ff6b6b' : 
                               type === 'info' ? '#0d52bd' : '#b983ff'};
                    color: white; font-weight: bold; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                    position: fixed; top: 20px; right: 20px; z-index: 10000;
                    max-width: 400px; animation: slideIn 0.3s ease;">
            ${message}
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

/**
 * Format date
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-KE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ============================================
// UI UPDATE FUNCTION
// ============================================

function updateUI() {
    // Show/hide auth based on user
    const authPage = document.getElementById('auth-page');
    const storePage = document.getElementById('store-wrapper-page');
    
    if (currentUser) {
        authPage.classList.remove('active-page');
        storePage.classList.add('active-page');
        
        // Update user name in dashboard
        document.getElementById('dashboard-user-title').textContent = currentUser.name;
        
        // Load all data
        loadProducts();
        loadCart();
        loadProfile();
    } else {
        authPage.classList.add('active-page');
        storePage.classList.remove('active-page');
        
        // Reset cart display
        document.getElementById('cart-counter').textContent = '0';
    }
}

// ============================================
// LEGACY SUPPORT FUNCTIONS (for existing HTML)
// ============================================

/**
 * Add to cart click handler (legacy)
 */
function addToCartClick(productName, price) {
    // This is for demo only - will be replaced by proper ID-based addition
    showNotification(`${productName} added to cart!`, 'success');
    const counter = document.getElementById('cart-counter');
    if (counter) {
        counter.textContent = parseInt(counter.textContent) + 1;
    }
}

/**
 * Handle M-Pesa payment (legacy)
 */
function handleMpesaPaymentOld(event) {
    if (event) event.preventDefault();
    // Remove legacy handler
}

// ============================================
// INITIALIZATION
// ============================================

// Add CSS animation for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    .notification-toast {
        animation: slideIn 0.3s ease;
    }
    
    /* Add loading state for buttons */
    .loading-btn {
        opacity: 0.7;
        pointer-events: none;
    }
`;
document.head.appendChild(style);

// Initialize: Check if user is already logged in via session
// On page load, try to get profile to verify session
document.addEventListener('DOMContentLoaded', async function() {
    try {
        const response = await fetch(`${API_BASE_URL}profile.php`);
        const data = await response.json();
        
        if (data.success) {
            currentUser = data.user;
            updateUI();
        }
    } catch (error) {
        console.log('Not logged in');
    }
});

// Export functions for global use
window.registerUser = registerUser;
window.loginUser = loginUser;
window.logoutUser = logoutUser;
window.handleLogout = handleLogout;
window.handleAuthSubmit = handleAuthSubmit;
window.switchAuthView = switchAuthView;
window.switchStoreView = switchStoreView;
window.navigateToPage = navigateToPage;
window.addToCart = addToCart;
window.loadCart = loadCart;
window.removeCartItem = removeCartItem;
window.openMpesaModal = openMpesaModal;
window.closeMpesaModal = closeMpesaModal;
window.handleMpesaPayment = handleMpesaPayment;
window.triggerPasswordAlert = triggerPasswordAlert;
window.toggleNavMenuAlert = toggleNavMenuAlert;
window.loadProducts = loadProducts;
window.loadOrders = loadOrders;
window.loadProfile = loadProfile;
window.addToCartClick = addToCartClick;