/**
 * JuneStudio Imagine - Enterprise SMM Marketplace
 * Complete Application Logic
 */

// ==================== CONFIGURATION ====================
const CONFIG = {
    JAP_API_KEY: 'fc5f37722f01550a7c956a0d4ecf63bb',
    MTP_API_KEY: '3cb77c7355e039af290c6ba07097d85f',
    JAP_API_URL: 'https://justanotherpanel.com/api/v2',
    MTP_API_URL: 'https://morethanpanel.com/api/v2',
    USD_TO_NGN: 1450,
    PROFIT_MULTIPLIER: 2.5, // 150% markup
    WHATSAPP_NUMBER: '+2348081515375',
    ADMIN_EMAIL: 'junestudioimagineai@gmail.com',
    OPAY_ACCOUNT: '8081515375',
    FIRST_BANK_ACCOUNT: '3084635140',
    ACCOUNT_NAME: 'Sulaiman Sheriff-Akorede'
};

// ==================== STATE MANAGEMENT ====================
let currentUser = null;
let services = [];
let orders = [];
let chatHistory = [];

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Hide loader immediately
    setTimeout(() => {
        const loader = document.getElementById('pageLoader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => loader.remove(), 500);
        }
    }, 800);

    // Load data from localStorage
    loadUserData();
    loadServices();
    loadOrders();
    
    // Setup navigation
    setupNavigation();
    
    // Show current page
    showPage('home');
    
    // Initialize counters
    animateCounters();
    
    // Setup event listeners
    setupEventListeners();
}

// ==================== NAVIGATION ====================
function setupNavigation() {
    const navLinks = document.querySelectorAll('[data-page]');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.getAttribute('data-page');
            showPage(page);
            
            // Close mobile menu if open
            const mobileMenu = document.querySelector('.mobile-menu');
            if (mobileMenu) {
                mobileMenu.classList.remove('active');
            }
        });
    });
    
    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
        });
    }
}

function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page-section').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show target page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // Update active nav state
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === pageId) {
            link.classList.add('active');
        }
    });
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Special handling for certain pages
    if (pageId === 'services') {
        renderServices();
    } else if (pageId === 'pricing') {
        updateCalculator();
    } else if (pageId === 'dashboard' || pageId === 'orders' || pageId === 'add-funds') {
        checkAuth();
    }
}

// ==================== AUTHENTICATION ====================
function loadUserData() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateUserUI();
    }
    
    // Create admin if not exists
    const adminData = localStorage.getItem('admin_' + CONFIG.ADMIN_EMAIL);
    if (!adminData) {
        const adminUser = {
            email: CONFIG.ADMIN_EMAIL,
            name: 'JuneStudio Admin',
            balance: 100000,
            role: 'admin',
            createdAt: new Date().toISOString()
        };
        localStorage.setItem('admin_' + CONFIG.ADMIN_EMAIL, JSON.stringify(adminUser));
    }
}

function checkAuth() {
    if (!currentUser) {
        showPage('home');
        showAlert('Please login to access this page', 'info');
        return false;
    }
    return true;
}

function handleSignup(email, password, name) {
    if (!email || !password) {
        showAlert('Please fill in all fields', 'error');
        return false;
    }
    
    const existingUser = localStorage.getItem('user_' + email);
    if (existingUser) {
        showAlert('Account already exists. Please login.', 'error');
        return false;
    }
    
    const newUser = {
        email,
        password, // In production, this should be hashed
        name: name || email.split('@')[0],
        balance: 0,
        role: 'user',
        createdAt: new Date().toISOString()
    };
    
    localStorage.setItem('user_' + email, JSON.stringify(newUser));
    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updateUserUI();
    
    showAlert('Account created successfully!', 'success');
    showPage('dashboard');
    return true;
}

function handleLogin(email, password) {
    if (!email || !password) {
        showAlert('Please enter email and password', 'error');
        return false;
    }
    
    // Check admin first
    if (email === CONFIG.ADMIN_EMAIL) {
        const adminData = localStorage.getItem('admin_' + email);
        if (adminData) {
            const admin = JSON.parse(adminData);
            // For admin, skip password check in demo (remove in production)
            currentUser = admin;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            updateUserUI();
            showAlert('Welcome back, Admin!', 'success');
            showPage('dashboard');
            return true;
        }
    }
    
    const userData = localStorage.getItem('user_' + email);
    if (!userData) {
        showAlert('Account not found. Please sign up.', 'error');
        return false;
    }
    
    const user = JSON.parse(userData);
    if (user.password !== password) {
        showAlert('Invalid password', 'error');
        return false;
    }
    
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updateUserUI();
    showAlert('Welcome back, ' + user.name + '!', 'success');
    showPage('dashboard');
    return true;
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateUserUI();
    showPage('home');
    showAlert('Logged out successfully', 'success');
}

function updateUserUI() {
    const loggedInViews = document.querySelectorAll('.logged-in-view');
    const loggedOutViews = document.querySelectorAll('.logged-out-view');
    
    if (currentUser) {
        loggedInViews.forEach(el => el.style.display = '');
        loggedOutViews.forEach(el => el.style.display = 'none');
        
        // Update user info displays
        document.querySelectorAll('.user-name-display').forEach(el => {
            el.textContent = currentUser.name;
        });
        document.querySelectorAll('.user-balance-display').forEach(el => {
            el.textContent = formatCurrency(currentUser.balance);
        });
        document.querySelectorAll('.user-email-display').forEach(el => {
            el.textContent = currentUser.email;
        });
    } else {
        loggedInViews.forEach(el => el.style.display = 'none');
        loggedOutViews.forEach(el => el.style.display = '');
    }
}

// ==================== SERVICES ====================
function loadServices() {
    // Sample services from both providers
    services = [
        // JuneStudio Basic (JAP)
        { id: 1, provider: 'basic', category: 'instagram', name: 'Instagram Followers [Instant]', min: 100, max: 10000, priceUSD: 0.80 },
        { id: 2, provider: 'basic', category: 'instagram', name: 'Instagram Likes [Fast]', min: 50, max: 5000, priceUSD: 0.15 },
        { id: 3, provider: 'basic', category: 'tiktok', name: 'TikTok Views [Instant]', min: 1000, max: 100000, priceUSD: 0.05 },
        { id: 4, provider: 'basic', category: 'tiktok', name: 'TikTok Followers', min: 100, max: 10000, priceUSD: 1.20 },
        { id: 5, provider: 'basic', category: 'facebook', name: 'Facebook Page Likes', min: 100, max: 5000, priceUSD: 2.50 },
        { id: 6, provider: 'basic', category: 'youtube', name: 'YouTube Subscribers', min: 50, max: 2000, priceUSD: 3.00 },
        { id: 7, provider: 'basic', category: 'twitter', name: 'Twitter Followers', min: 100, max: 5000, priceUSD: 1.50 },
        { id: 8, provider: 'basic', category: 'telegram', name: 'Telegram Members', min: 100, max: 10000, priceUSD: 0.90 },
        
        // JuneStudio Max (MTP)
        { id: 9, provider: 'max', category: 'instagram', name: 'Instagram Followers [Premium HQ]', min: 100, max: 50000, priceUSD: 1.20 },
        { id: 10, provider: 'max', category: 'instagram', name: 'Instagram Likes [Real Users]', min: 50, max: 10000, priceUSD: 0.25 },
        { id: 11, provider: 'max', category: 'tiktok', name: 'TikTok Followers [HQ]', min: 100, max: 20000, priceUSD: 1.80 },
        { id: 12, provider: 'max', category: 'youtube', name: 'YouTube Views [Monetizable]', min: 1000, max: 100000, priceUSD: 2.00 },
        { id: 13, provider: 'max', category: 'snapchat', name: 'Snapchat Followers', min: 100, max: 5000, priceUSD: 1.50 },
        { id: 14, provider: 'max', category: 'pinterest', name: 'Pinterest Followers', min: 100, max: 5000, priceUSD: 1.80 },
        { id: 15, provider: 'max', category: 'linkedin', name: 'LinkedIn Connections', min: 50, max: 2000, priceUSD: 4.00 },
        { id: 16, provider: 'max', category: 'whatsapp', name: 'WhatsApp Channel Members', min: 100, max: 5000, priceUSD: 2.20 }
    ];
}

function renderServices(filter = 'all') {
    const container = document.getElementById('servicesGrid');
    if (!container) return;
    
    let filteredServices = services;
    if (filter !== 'all') {
        filteredServices = services.filter(s => s.provider === filter);
    }
    
    container.innerHTML = filteredServices.map(service => {
        const nairaPrice = Math.round(service.priceUSD * CONFIG.USD_TO_NGN * CONFIG.PROFIT_MULTIPLIER);
        const tierClass = service.provider === 'max' ? 'tier-max' : 'tier-basic';
        const tierLabel = service.provider === 'max' ? 'JuneStudio Max' : 'JuneStudio Basic';
        
        return `
            <div class="service-card ${tierClass}">
                <div class="service-tier-badge">${tierLabel}</div>
                <h3>${service.name}</h3>
                <div class="service-meta">
                    <span>Min: ${service.min}</span>
                    <span>Max: ${service.max.toLocaleString()}</span>
                </div>
                <div class="service-price">${formatCurrency(nairaPrice)}<small>/1000</small></div>
                <button class="btn btn-primary" onclick="quickOrder(${service.id})">Order Now</button>
            </div>
        `;
    }).join('');
}

function quickOrder(serviceId) {
    if (!checkAuth()) {
        showPage('home');
        return;
    }
    
    const service = services.find(s => s.id === serviceId);
    if (!service) return;
    
    // Pre-fill order form
    document.getElementById('orderServiceName').textContent = service.name;
    document.getElementById('orderLink').value = '';
    document.getElementById('orderQuantity').value = service.min;
    document.getElementById('orderServiceId').value = serviceId;
    
    updateOrderTotal();
    showPage('dashboard');
}

// ==================== PRICING CALCULATOR ====================
function updateCalculator() {
    const quantitySlider = document.getElementById('quantitySlider');
    const platformTabs = document.querySelectorAll('.platform-tab');
    
    if (!quantitySlider) return;
    
    const quantity = parseInt(quantitySlider.value);
    const basePrice = 0.50; // Base price per 1000 in USD
    const unitPrice = basePrice / 1000;
    
    // Apply bulk discount
    let discount = 0;
    if (quantity >= 10000) discount = 0.30;
    else if (quantity >= 5000) discount = 0.20;
    else if (quantity >= 1000) discount = 0.10;
    
    const totalUSD = (quantity * unitPrice) * (1 - discount);
    const totalNGN = Math.round(totalUSD * CONFIG.USD_TO_NGN * CONFIG.PROFIT_MULTIPLIER);
    const costPerUnit = totalNGN / quantity;
    
    document.getElementById('calcQuantity').textContent = quantity.toLocaleString();
    document.getElementById('calcTotal').textContent = formatCurrency(totalNGN);
    document.getElementById('calcPerUnit').textContent = formatCurrency(costPerUnit);
    document.getElementById('calcDiscount').textContent = discount > 0 ? `${discount * 100}% OFF` : 'No discount';
}

// ==================== ORDERS ====================
function loadOrders() {
    const savedOrders = localStorage.getItem('userOrders_' + (currentUser?.email || 'guest'));
    if (savedOrders) {
        orders = JSON.parse(savedOrders);
    }
}

function saveOrders() {
    if (currentUser) {
        localStorage.setItem('userOrders_' + currentUser.email, JSON.stringify(orders));
    }
}

function placeOrder(link, quantity, serviceId) {
    if (!checkAuth()) return false;
    
    const service = services.find(s => s.id === serviceId);
    if (!service) {
        showAlert('Service not found', 'error');
        return false;
    }
    
    const nairaPrice = Math.round(service.priceUSD * CONFIG.USD_TO_NGN * CONFIG.PROFIT_MULTIPLIER);
    const totalPrice = Math.round((nairaPrice * quantity) / 1000);
    
    if (totalPrice > currentUser.balance) {
        showAlert('Insufficient balance. Please add funds.', 'error');
        showPage('add-funds');
        return false;
    }
    
    // Deduct balance
    currentUser.balance -= totalPrice;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Update stored user data
    localStorage.setItem('user_' + currentUser.email, JSON.stringify(currentUser));
    
    // Create order
    const order = {
        id: 'ORD-' + Date.now(),
        serviceId,
        serviceName: service.name,
        link,
        quantity,
        totalPrice,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    
    orders.unshift(order);
    saveOrders();
    
    updateUserUI();
    renderOrders();
    
    showAlert('Order placed successfully!', 'success');
    return true;
}

function renderOrders() {
    const container = document.getElementById('ordersList');
    if (!container) return;
    
    if (orders.length === 0) {
        container.innerHTML = '<div class="empty-state">No orders yet. Place your first order!</div>';
        return;
    }
    
    container.innerHTML = orders.map(order => `
        <div class="order-item">
            <div class="order-header">
                <span class="order-id">${order.id}</span>
                <span class="order-status status-${order.status}">${order.status.toUpperCase()}</span>
            </div>
            <div class="order-details">
                <strong>${order.serviceName}</strong>
                <p>Link: ${order.link}</p>
                <p>Quantity: ${order.quantity.toLocaleString()}</p>
            </div>
            <div class="order-footer">
                <span class="order-total">${formatCurrency(order.totalPrice)}</span>
                <span class="order-date">${new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
        </div>
    `).join('');
}

// ==================== PAYMENT / ADD FUNDS ====================
function handleAddFundsRequest(amount) {
    if (!amount || amount < 1000) {
        showAlert('Minimum deposit is ₦1,000', 'error');
        return false;
    }
    
    if (!checkAuth()) return false;
    
    // Show payment details
    const paymentDetails = document.getElementById('paymentDetails');
    if (paymentDetails) {
        paymentDetails.style.display = 'block';
        paymentDetails.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Store pending amount
    sessionStorage.setItem('pendingAmount', amount);
    
    return true;
}

function confirmPaymentSent() {
    const amount = sessionStorage.getItem('pendingAmount');
    if (!amount) {
        showAlert('No pending payment', 'error');
        return;
    }
    
    // Open WhatsApp with pre-filled message
    const message = encodeURIComponent(
        `Hello JuneStudio,\n\nI just made a bank transfer.\n\nAmount: ₦${amount}\nAccount Name: ${CONFIG.ACCOUNT_NAME}\n\nPlease confirm my payment and update my balance.\n\nMy email: ${currentUser?.email}`
    );
    
    const whatsappUrl = `https://wa.me/${CONFIG.WHATSAPP_NUMBER.replace('+', '')}?text=${message}`;
    window.open(whatsappUrl, '_blank');
    
    showAlert('Receipt sent! We\'ll confirm within 15 minutes.', 'success');
    sessionStorage.removeItem('pendingAmount');
    
    // Hide payment details
    const paymentDetails = document.getElementById('paymentDetails');
    if (paymentDetails) {
        paymentDetails.style.display = 'none';
    }
}

// ==================== AI ASSISTANT ====================
function sendAIMessage() {
    const input = document.getElementById('aiInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message
    chatHistory.push({ role: 'user', content: message, timestamp: new Date().toISOString() });
    
    // Clear input
    input.value = '';
    
    // Generate AI response (simulated)
    setTimeout(() => {
        const response = generateAIResponse(message);
        chatHistory.push({ role: 'assistant', content: response, timestamp: new Date().toISOString() });
        renderChatHistory();
    }, 1000);
    
    renderChatHistory();
}

function generateAIResponse(message) {
    const lowerMsg = message.toLowerCase();
    
    if (lowerMsg.includes('instagram') || lowerMsg.includes('follower')) {
        return 'For Instagram growth, I recommend our JuneStudio Max packages which use real, active accounts. Start with 1,000 followers (₦4,350) for instant delivery. For best results, combine with engagement pods.';
    }
    
    if (lowerMsg.includes('tiktok') || lowerMsg.includes('viral')) {
        return 'TikTok algorithm favors consistent posting + initial engagement boost. Our TikTok Views package (₦181/1k) gives you the push you need. Post at 7-9 PM WAT for Nigerian audience.';
    }
    
    if (lowerMsg.includes('price') || lowerMsg.includes('cost') || lowerMsg.includes('cheap')) {
        return 'Our prices start from ₦181/1k views. Bundle 3+ services for 20% off, 5+ for 35% off, or 7+ for 50% off! Which platforms are you targeting?';
    }
    
    if (lowerMsg.includes('payment') || lowerMsg.includes('bank') || lowerMsg.includes('transfer')) {
        return `To add funds:\n1. Transfer to OPay: ${CONFIG.OPAY_ACCOUNT} or First Bank: ${CONFIG.FIRST_BANK_ACCOUNT}\n2. Name: ${CONFIG.ACCOUNT_NAME}\n3. Click "I've Sent Receipt" to notify us on WhatsApp\n4. Balance updated within 15 mins!`;
    }
    
    if (lowerMsg.includes('nigeria') || lowerMsg.includes('naija') || lowerMsg.includes('lagos')) {
        return 'Oya boss! For Nigerian market, focus on Instagram & TikTok. Peak hours na 7-10pm. Use Pidgin captions for better engagement. We get special Naija packages wey go make your page blow!';
    }
    
    return 'I\'m your JuneStudio AI assistant! I can help with:\n• Social media strategy\n• Content creation tips\n• Pricing & packages\n• Order support\n• Nigerian market insights\n\nWhat do you need help with today?';
}

function renderChatHistory() {
    const container = document.getElementById('chatMessages');
    if (!container) return;
    
    container.innerHTML = chatHistory.map(msg => `
        <div class="chat-message ${msg.role}">
            <div class="message-content">${msg.content.replace(/\n/g, '<br>')}</div>
            <div class="message-time">${new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
        </div>
    `).join('');
    
    container.scrollTop = container.scrollHeight;
}

// ==================== UTILITIES ====================
function formatCurrency(amount) {
    return '₦' + amount.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function showAlert(message, type = 'info') {
    const alertBox = document.createElement('div');
    alertBox.className = `alert alert-${type}`;
    alertBox.textContent = message;
    alertBox.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 8px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(alertBox);
    
    setTimeout(() => {
        alertBox.style.opacity = '0';
        setTimeout(() => alertBox.remove(), 300);
    }, 3000);
}

function animateCounters() {
    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        
        const updateCounter = () => {
            current += step;
            if (current < target) {
                counter.textContent = Math.floor(current).toLocaleString();
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target.toLocaleString();
            }
        };
        
        updateCounter();
    });
}

function setupEventListeners() {
    // Quantity slider
    const slider = document.getElementById('quantitySlider');
    if (slider) {
        slider.addEventListener('input', updateCalculator);
    }
    
    // Platform tabs
    const platformTabs = document.querySelectorAll('.platform-tab');
    platformTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            platformTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });
    
    // Service filter
    const serviceFilters = document.querySelectorAll('.service-filter');
    serviceFilters.forEach(btn => {
        btn.addEventListener('click', () => {
            serviceFilters.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderServices(btn.dataset.filter);
        });
    });
    
    // Order form
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const link = document.getElementById('orderLink').value;
            const quantity = parseInt(document.getElementById('orderQuantity').value);
            const serviceId = parseInt(document.getElementById('orderServiceId').value);
            
            if (placeOrder(link, quantity, serviceId)) {
                orderForm.reset();
            }
        });
    }
    
    // Order quantity change
    const orderQuantity = document.getElementById('orderQuantity');
    if (orderQuantity) {
        orderQuantity.addEventListener('input', updateOrderTotal);
    }
    
    // Signup form
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            const name = document.getElementById('signupName').value;
            handleSignup(email, password, name);
        });
    }
    
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            handleLogin(email, password);
        });
    }
    
    // Add funds form
    const addFundsForm = document.getElementById('addFundsForm');
    if (addFundsForm) {
        addFundsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const amount = parseFloat(document.getElementById('fundAmount').value);
            handleAddFundsRequest(amount);
        });
    }
    
    // AI input
    const aiInput = document.getElementById('aiInput');
    if (aiInput) {
        aiInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendAIMessage();
            }
        });
    }
}

function updateOrderTotal() {
    const serviceId = parseInt(document.getElementById('orderServiceId')?.value);
    const quantity = parseInt(document.getElementById('orderQuantity')?.value);
    
    if (!serviceId || !quantity) return;
    
    const service = services.find(s => s.id === serviceId);
    if (!service) return;
    
    const nairaPrice = Math.round(service.priceUSD * CONFIG.USD_TO_NGN * CONFIG.PROFIT_MULTIPLIER);
    const totalPrice = Math.round((nairaPrice * quantity) / 1000);
    
    const totalDisplay = document.getElementById('orderTotal');
    if (totalDisplay) {
        totalDisplay.textContent = formatCurrency(totalPrice);
    }
}

// Expose functions globally for inline handlers
window.showPage = showPage;
window.handleSignup = handleSignup;
window.handleLogin = handleLogin;
window.handleLogout = handleLogout;
window.quickOrder = quickOrder;
window.sendAIMessage = sendAIMessage;
window.confirmPaymentSent = confirmPaymentSent;
window.updateCalculator = updateCalculator;
window.renderOrders = renderOrders;
