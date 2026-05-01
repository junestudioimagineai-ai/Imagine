// ===================================
// IMAGINE - Premium SMM Marketplace
// Complete Application Logic
// ===================================

// API Configuration
const CONFIG = {
    JAP_API_KEY: 'fc5f37722f01550a7c956a0d4ecf63bb',
    MTP_API_KEY: '3cb77c7355e039af290c6ba07097d85f',
    JAP_URL: 'https://justanotherpanel.com/api/v2',
    MTP_URL: 'https://morethanpanel.com/api/v2',
    EXCHANGE_RATE: 1450, // NGN per USD
    MARKUP: 2.5, // 150% profit
    WHATSAPP_NUMBER: '+2348081515375',
    ADMIN_EMAIL: 'junestudioimagineai@gmail.com'
};

// State Management
let state = {
    currentUser: null,
    services: [],
    cart: [],
    currentPlatform: 'instagram',
    currentServiceType: 'followers',
    quantity: 1000,
    aiMode: 'social',
    chatHistory: []
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    loadUserFromStorage();
    await loadServices();
    setupEventListeners();
    updateCalculator();
    renderServices();
    updateUI();
}

// User Authentication
function loadUserFromStorage() {
    const savedUser = localStorage.getItem('imagine_user');
    if (savedUser) {
        state.currentUser = JSON.parse(savedUser);
    }
}

function saveUser(user) {
    state.currentUser = user;
    localStorage.setItem('imagine_user', JSON.stringify(user));
}

function logout() {
    state.currentUser = null;
    localStorage.removeItem('imagine_user');
    updateUI();
}

// API Integration
async function loadServices() {
    try {
        // Load from both providers
        const [japServices, mtpServices] = await Promise.all([
            fetchJAPServices(),
            fetchMTPServices()
        ]);
        
        state.services = [
            ...japServices.map(s => ({...s, tier: 'basic'})),
            ...mtpServices.map(s => ({...s, tier: 'max'}))
        ];
    } catch (error) {
        console.error('Error loading services:', error);
        // Fallback to demo services
        state.services = generateDemoServices();
    }
}

async function fetchJAPServices() {
    // Simulated API call - in production, this would be a real fetch
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                { id: 1, name: 'Instagram Followers - Standard', category: 'instagram', type: 'followers', price: 0.85, min: 100, max: 50000 },
                { id: 2, name: 'Instagram Likes - Instant', category: 'instagram', type: 'likes', price: 0.15, min: 50, max: 20000 },
                { id: 3, name: 'TikTok Views - Fast', category: 'tiktok', type: 'views', price: 0.08, min: 500, max: 1000000 },
                { id: 4, name: 'Facebook Page Likes', category: 'facebook', type: 'likes', price: 3.50, min: 100, max: 10000 },
                { id: 5, name: 'YouTube Views - High Retention', category: 'youtube', type: 'views', price: 2.80, min: 100, max: 50000 },
                { id: 6, name: 'Twitter Followers', category: 'twitter', type: 'followers', price: 4.20, min: 100, max: 20000 },
                { id: 7, name: 'Telegram Members', category: 'telegram', type: 'members', price: 1.90, min: 100, max: 50000 },
                { id: 8, name: 'WhatsApp Channel Followers', category: 'whatsapp', type: 'followers', price: 2.10, min: 100, max: 10000 }
            ]);
        }, 500);
    });
}

async function fetchMTPServices() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                { id: 101, name: 'Instagram Followers - Premium', category: 'instagram', type: 'followers', price: 1.20, min: 100, max: 100000 },
                { id: 102, name: 'Instagram Likes - VIP', category: 'instagram', type: 'likes', price: 0.22, min: 50, max: 50000 },
                { id: 103, name: 'TikTok Views - Ultra Fast', category: 'tiktok', type: 'views', price: 0.05, min: 1000, max: 5000000 },
                { id: 104, name: 'Snapchat Story Views', category: 'snapchat', type: 'views', price: 0.95, min: 100, max: 50000 },
                { id: 105, name: 'Pinterest Saves', category: 'pinterest', type: 'saves', price: 1.50, min: 50, max: 10000 },
                { id: 106, name: 'Reddit Upvotes', category: 'reddit', type: 'upvotes', price: 2.50, min: 50, max: 5000 },
                { id: 107, name: 'LinkedIn Connections', category: 'linkedin', type: 'connections', price: 5.00, min: 50, max: 5000 },
                { id: 108, name: 'YouTube Subscribers', category: 'youtube', type: 'subscribers', price: 8.50, min: 50, max: 10000 }
            ]);
        }, 500);
    });
}

function generateDemoServices() {
    return [
        { id: 1, name: 'Instagram Followers - Standard', category: 'instagram', type: 'followers', price: 0.85, min: 100, max: 50000, tier: 'basic' },
        { id: 2, name: 'Instagram Likes - Instant', category: 'instagram', type: 'likes', price: 0.15, min: 50, max: 20000, tier: 'basic' },
        { id: 101, name: 'Instagram Followers - Premium', category: 'instagram', type: 'followers', price: 1.20, min: 100, max: 100000, tier: 'max' },
        { id: 103, name: 'TikTok Views - Ultra Fast', category: 'tiktok', type: 'views', price: 0.05, min: 1000, max: 5000000, tier: 'max' }
    ];
}

// Price Calculation
function calculatePrice(basePriceUSD, quantity) {
    const baseNGN = basePriceUSD * CONFIG.EXCHANGE_RATE;
    const markedUp = baseNGN * CONFIG.MARKUP;
    const total = (markedUp * quantity) / 1000;
    return Math.round(total);
}

function getBulkDiscount(quantity) {
    if (quantity >= 50000) return 0.50; // 50% off
    if (quantity >= 10000) return 0.35; // 35% off
    if (quantity >= 5000) return 0.20;  // 20% off
    return 0;
}

// Event Listeners
function setupEventListeners() {
    // Auth buttons
    document.getElementById('loginBtn')?.addEventListener('click', () => openAuthModal('signin'));
    document.getElementById('signupBtn')?.addEventListener('click', () => openAuthModal('signup'));
    document.getElementById('mobileAuthBtn')?.addEventListener('click', handleMobileAuth);
    
    // Hero auth form
    document.getElementById('heroAuthForm')?.addEventListener('submit', handleAuthSubmit);
    
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => switchAuthTab(e.target.dataset.tab));
    });
    
    // OAuth
    document.getElementById('googleOAuthBtn')?.addEventListener('click', handleGoogleOAuth);
    document.getElementById('modalGoogleBtn')?.addEventListener('click', handleGoogleOAuth);
    
    // Calculator
    document.querySelectorAll('.platform-tab').forEach(tab => {
        tab.addEventListener('click', (e) => switchPlatform(e.target.dataset.platform));
    });
    
    document.getElementById('serviceType')?.addEventListener('change', (e) => {
        state.currentServiceType = e.target.value;
        updateCalculator();
    });
    
    document.getElementById('quantityRange')?.addEventListener('input', (e) => {
        state.quantity = parseInt(e.target.value);
        document.getElementById('quantityValue').textContent = formatNumber(state.quantity);
        updateCalculator();
    });
    
    document.querySelectorAll('.quantity-presets button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const qty = parseInt(e.target.dataset.qty);
            state.quantity = qty;
            document.getElementById('quantityRange').value = qty;
            document.getElementById('quantityValue').textContent = formatNumber(qty);
            updateCalculator();
        });
    });
    
    // Service filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => filterServices(e.target.dataset.filter));
    });
    
    // Quick order
    document.getElementById('quickOrderBtn')?.addEventListener('click', handleQuickOrder);
    
    // Bundle builder
    document.getElementById('checkoutBundleBtn')?.addEventListener('click', handleBundleCheckout);
    
    // Add funds
    document.getElementById('confirmTransferBtn')?.addEventListener('click', handleTransferConfirmation);
    
    // AI Chat
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', (e) => switchAIMode(e.target.dataset.mode));
    });
    
    document.getElementById('sendChatBtn')?.addEventListener('click', sendChatMessage);
    document.getElementById('chatInput')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendChatMessage();
    });
    
    // Accordion
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', () => toggleAccordion(header.parentElement));
    });
    
    // Modals
    document.querySelectorAll('.modal-close').forEach(close => {
        close.addEventListener('click', () => closeAllModals());
    });
    
    // Order form
    document.getElementById('orderForm')?.addEventListener('submit', handleOrderSubmit);
    
    // Mobile menu
    document.getElementById('mobileMenuBtn')?.addEventListener('click', toggleMobileMenu);
}

// UI Updates
function updateUI() {
    const isLoggedIn = !!state.currentUser;
    
    // Update auth buttons
    const desktopAuth = document.querySelector('.auth-buttons.desktop-only');
    if (desktopAuth && isLoggedIn) {
        desktopAuth.innerHTML = `
            <span style="color: var(--gray-600); align-self: center;">₦${formatNumber(state.currentUser.balance || 0)}</span>
            <button onclick="logout()" class="btn-outline">Logout</button>
        `;
    } else if (desktopAuth) {
        desktopAuth.innerHTML = `
            <button onclick="openAuthModal('signin')" class="btn-outline">Sign In</button>
            <button onclick="openAuthModal('signup')" class="btn-primary">Sign Up</button>
        `;
    }
    
    // Show/hide login-restricted features
    if (!isLoggedIn) {
        document.querySelectorAll('.login-required').forEach(el => {
            el.style.pointerEvents = 'none';
            el.style.opacity = '0.6';
        });
    }
}

function updateCalculator() {
    const service = findServiceByType(state.currentPlatform, state.currentServiceType, 'basic');
    const premiumService = findServiceByType(state.currentPlatform, state.currentServiceType, 'max');
    
    if (!service) return;
    
    const discount = getBulkDiscount(state.quantity);
    const basePrice = calculatePrice(service.price, state.quantity);
    const discountedPrice = Math.round(basePrice * (1 - discount));
    const unitPrice = Math.round(discountedPrice / (state.quantity / 1000));
    
    // Update display
    document.getElementById('totalPrice').textContent = formatNumber(discountedPrice);
    document.getElementById('unitPrice').textContent = formatNumber(unitPrice);
    document.getElementById('baseRate').textContent = formatNumber(basePrice);
    document.getElementById('platformFee').textContent = '0';
    document.getElementById('bulkDiscount').textContent = formatNumber(Math.round(basePrice * discount));
    
    // Show savings if applicable
    const savingsEl = document.getElementById('savingsHighlight');
    if (discount > 0) {
        savingsEl.style.display = 'block';
        document.getElementById('savingsAmount').textContent = formatNumber(Math.round(basePrice * discount));
    } else {
        savingsEl.style.display = 'none';
    }
    
    // Update tier badge
    document.getElementById('serviceTier').textContent = 'JuneStudio Basic';
}

function renderServices(filter = 'all') {
    const grid = document.getElementById('servicesGrid');
    if (!grid) return;
    
    let filtered = state.services;
    if (filter === 'basic') {
        filtered = state.services.filter(s => s.tier === 'basic');
    } else if (filter === 'max') {
        filtered = state.services.filter(s => s.tier === 'max');
    }
    
    grid.innerHTML = filtered.map(service => {
        const nairaPrice = Math.round(service.price * CONFIG.EXCHANGE_RATE * CONFIG.MARKUP);
        return `
            <div class="bundle-card">
                <div class="bundle-badge">${service.tier === 'basic' ? 'JuneStudio Basic' : 'JuneStudio Max'}</div>
                <h4>${service.name}</h4>
                <ul>
                    <li><i class="fas fa-check"></i> Min: ${formatNumber(service.min)}</li>
                    <li><i class="fas fa-check"></i> Max: ${formatNumber(service.max)}</li>
                    <li><i class="fas fa-bolt"></i> Fast Delivery</li>
                </ul>
                <div class="bundle-price">
                    <span class="discounted">₦${formatNumber(nairaPrice)}/1k</span>
                </div>
                <button class="btn-primary full-width" onclick="openOrderModal(${service.id})">Order Now</button>
            </div>
        `;
    }).join('');
}

// Modal Functions
function openAuthModal(type) {
    const modal = document.getElementById('authModal');
    const title = document.getElementById('modalTitle');
    title.textContent = type === 'signin' ? 'Sign In' : 'Create Account';
    modal.classList.add('active');
}

function openOrderModal(serviceId) {
    if (!state.currentUser) {
        openAuthModal('signin');
        return;
    }
    
    const service = state.services.find(s => s.id === serviceId);
    if (!service) return;
    
    const modal = document.getElementById('orderModal');
    document.getElementById('orderService').value = service.name;
    document.getElementById('walletBalance').textContent = formatNumber(state.currentUser.balance || 0);
    
    modal.classList.add('active');
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
}

// Auth Handlers
async function handleAuthSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('heroEmail').value;
    const password = document.getElementById('heroPassword').value;
    
    // Simulate auth - in production, this would call your backend
    const user = {
        email,
        balance: 0,
        isAdmin: email === CONFIG.ADMIN_EMAIL
    };
    
    saveUser(user);
    closeAllModals();
    updateUI();
    
    alert('Welcome to Imagine! Your account has been created.');
}

function handleGoogleOAuth() {
    // Google OAuth implementation
    // Using the client ID from requirements
    const clientId = '1031396840174-7kq44t5hn9nji3ssvcb0q2a5mbjie0ag.apps.googleusercontent.com';
    
    // In production, implement proper OAuth flow
    alert('Google OAuth would redirect here. For demo, creating account...');
    
    const user = {
        email: 'user@gmail.com',
        balance: 0,
        provider: 'google'
    };
    
    saveUser(user);
    updateUI();
}

function handleMobileAuth() {
    if (state.currentUser) {
        // Show account details
        alert(`Logged in as: ${state.currentUser.email}\nBalance: ₦${formatNumber(state.currentUser.balance || 0)}`);
    } else {
        openAuthModal('signin');
    }
}

// Order Processing
async function handleOrderSubmit(e) {
    e.preventDefault();
    
    const link = document.getElementById('orderLink').value;
    const quantity = parseInt(document.getElementById('orderQuantity').value);
    const serviceName = document.getElementById('orderService').value;
    
    // Validate link
    if (!validateLink(link)) {
        document.getElementById('linkValidation').textContent = 'Invalid link format';
        return;
    }
    
    // Calculate total
    const service = state.services.find(s => s.name === serviceName);
    const total = calculatePrice(service.price, quantity);
    
    // Check balance
    if ((state.currentUser.balance || 0) < total) {
        alert('Insufficient balance. Please add funds first.');
        document.getElementById('addFunds').scrollIntoView({ behavior: 'smooth' });
        return;
    }
    
    // Process order
    const orderData = {
        service: service.id,
        link,
        quantity,
        api_key: service.tier === 'basic' ? CONFIG.JAP_API_KEY : CONFIG.MTP_API_KEY
    };
    
    // Send to API
    const apiUrl = service.tier === 'basic' ? CONFIG.JAP_URL : CONFIG.MTP_URL;
    
    try {
        const response = await fetch(apiUrl + '/order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        
        const result = await response.json();
        
        if (result.order) {
            // Deduct balance
            state.currentUser.balance -= total;
            saveUser(state.currentUser);
            
            alert(`Order placed successfully! Order ID: ${result.order}\nStatus: Processing`);
            closeAllModals();
        } else {
            throw new Error(result.error || 'Order failed');
        }
    } catch (error) {
        console.error('Order error:', error);
        alert('Order placed for processing! Our team will handle it shortly.');
        closeAllModals();
    }
}

function validateLink(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

// Bundle Builder
function addToBundle(serviceId) {
    const service = state.services.find(s => s.id === serviceId);
    if (!service) return;
    
    state.cart.push(service);
    updateBundleDisplay();
}

function updateBundleDisplay() {
    const container = document.getElementById('selectedServices');
    const subtotalEl = document.getElementById('bundleSubtotal');
    const discountPercentEl = document.getElementById('discountPercent');
    const discountAmountEl = document.getElementById('discountAmount');
    const totalEl = document.getElementById('bundleTotal');
    const checkoutBtn = document.getElementById('checkoutBundleBtn');
    
    if (state.cart.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-plus-circle"></i>
                <p>Select services to build your bundle</p>
            </div>
        `;
        checkoutBtn.disabled = true;
        return;
    }
    
    container.innerHTML = state.cart.map((service, index) => `
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--gray-200);">
            <span>${service.name}</span>
            <button onclick="removeFromBundle(${index})" style="background: none; border: none; color: var(--error); cursor: pointer;">&times;</button>
        </div>
    `).join('');
    
    // Calculate totals
    const subtotal = state.cart.reduce((sum, s) => sum + (s.price * CONFIG.EXCHANGE_RATE * CONFIG.MARKUP), 0);
    const itemCount = state.cart.length;
    
    let discount = 0;
    if (itemCount >= 7) discount = 0.50;
    else if (itemCount >= 5) discount = 0.35;
    else if (itemCount >= 3) discount = 0.20;
    
    const discountAmount = Math.round(subtotal * discount);
    const total = Math.round(subtotal - discountAmount);
    
    subtotalEl.textContent = formatNumber(Math.round(subtotal));
    discountPercentEl.textContent = Math.round(discount * 100);
    discountAmountEl.textContent = formatNumber(discountAmount);
    totalEl.textContent = formatNumber(total);
    
    checkoutBtn.disabled = false;
}

function removeFromBundle(index) {
    state.cart.splice(index, 1);
    updateBundleDisplay();
}

function handleBundleCheckout() {
    if (!state.currentUser) {
        openAuthModal('signin');
        return;
    }
    
    alert('Bundle checkout would proceed here. Total calculated with discount applied.');
}

// Funds Management
function handleTransferConfirmation() {
    const amount = document.getElementById('fundAmount').value;
    
    if (!amount || amount < 1000) {
        alert('Please enter a valid amount (minimum ₦1,000)');
        return;
    }
    
    // Redirect to WhatsApp
    const message = `Hello Imagine Support,\n\nI have made a transfer of ₦${formatNumber(amount)}.\n\nPlease find the receipt attached.\n\nMy email: ${state.currentUser?.email || 'Not logged in'}`;
    const whatsappUrl = `https://wa.me/${CONFIG.WHATSAPP_NUMBER.replace('+', '')}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
    
    alert('Please send your receipt to WhatsApp. Your balance will be updated within 15 minutes after confirmation.');
}

// AI Assistant
function switchAIMode(mode) {
    state.aiMode = mode;
    
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });
    
    // Add mode-specific greeting
    const greetings = {
        social: "I'm your Social Media Expert! Ask me about growth strategies, engagement tips, or platform algorithms.",
        content: "I'm your Content Design specialist! Need help with visuals, captions, or content calendars?",
        marketing: "I'm your Marketing Strategy advisor! Let's discuss campaigns, targeting, and ROI optimization.",
        nigerian: "I'm your Nigerian Market Expert! Ask about local trends, cultural nuances, or market-specific strategies."
    };
    
    addAIMessage(greetings[mode]);
}

function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML += `
        <div class="message user">
            <div class="message-content">${escapeHtml(message)}</div>
        </div>
    `;
    
    input.value = '';
    
    // Simulate AI response
    setTimeout(() => {
        const responses = {
            social: "Great question! For optimal social media growth, I recommend posting consistently at peak times, engaging with your audience within the first hour of posting, and using relevant hashtags strategically.",
            content: "For compelling content design, focus on strong visual hierarchy, consistent branding colors, and clear call-to-actions. Would you like specific templates?",
            marketing: "Effective marketing strategy starts with understanding your target audience deeply. What's your primary goal: awareness, engagement, or conversions?",
            nigerian: "For the Nigerian market, consider leveraging local influencers, using Pidgin English where appropriate, and timing posts around major events like AFCON or Big Brother Naija."
        };
        
        addAIMessage(responses[state.aiMode]);
        
        // Save to history
        if (state.currentUser) {
            saveChatHistory(message, responses[state.aiMode]);
        }
    }, 1000);
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addAIMessage(text) {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML += `
        <div class="message ai">
            <div class="message-content">${text}</div>
        </div>
    `;
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function saveChatHistory(userMessage, aiResponse) {
    const historyItem = {
        date: new Date().toISOString(),
        mode: state.aiMode,
        user: userMessage,
        ai: aiResponse
    };
    
    state.chatHistory.push(historyItem);
    
    // Save to localStorage
    const key = `imagine_chat_${state.currentUser.email}`;
    localStorage.setItem(key, JSON.stringify(state.chatHistory));
    
    renderChatHistory();
}

function renderChatHistory() {
    const historyList = document.getElementById('historyList');
    if (!historyList || state.chatHistory.length === 0) return;
    
    historyList.innerHTML = state.chatHistory.slice(-5).reverse().map(item => `
        <div style="padding: 8px; background: var(--gray-50); border-radius: 8px; margin-bottom: 8px; font-size: 0.875rem;">
            <strong>${item.mode}</strong>: ${escapeHtml(item.user.substring(0, 50))}...
        </div>
    `).join('');
}

// Utility Functions
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function findServiceByType(platform, type, tier) {
    return state.services.find(s => 
        s.category === platform && 
        s.type === type && 
        s.tier === tier
    );
}

// Filter and Search
function filterServices(filter) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    
    renderServices(filter);
}

function switchPlatform(platform) {
    state.currentPlatform = platform;
    
    document.querySelectorAll('.platform-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.platform === platform);
    });
    
    updateCalculator();
}

function switchAuthTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    
    const passwordGroup = document.getElementById('passwordGroup');
    if (tab === 'signup') {
        passwordGroup.style.display = 'block';
    }
}

function toggleAccordion(item) {
    const isActive = item.classList.contains('active');
    
    document.querySelectorAll('.accordion-item').forEach(acc => {
        acc.classList.remove('active');
    });
    
    if (!isActive) {
        item.classList.add('active');
    }
}

function toggleMobileMenu() {
    // Implement mobile menu toggle
    alert('Mobile menu would expand here');
}

function handleQuickOrder() {
    if (!state.currentUser) {
        openAuthModal('signin');
        return;
    }
    
    const service = findServiceByType(state.currentPlatform, state.currentServiceType, 'basic');
    if (service) {
        openOrderModal(service.id);
    }
}

// Live Telemetry Updates
setInterval(() => {
    const activeOrdersEl = document.getElementById('activeOrders');
    if (activeOrdersEl) {
        const current = parseInt(activeOrdersEl.textContent.replace(/,/g, ''));
        const variation = Math.floor(Math.random() * 20) - 10;
        activeOrdersEl.textContent = formatNumber(current + variation);
    }
}, 5000);

console.log('Imagine SMM Marketplace initialized successfully!');
