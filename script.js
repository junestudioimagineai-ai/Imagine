/* ===================================
   IMAGINE - Enterprise SMM Marketplace
   Complete Application Logic
   =================================== */

// Configuration
const CONFIG = {
    JAP_API_KEY: 'fc5f37722f01550a7c956a0d4ecf63bb',
    MTP_API_KEY: '3cb77c7355e039af290c6ba07097d85f',
    JAP_URL: 'https://justanotherpanel.com/api/v2',
    MTP_URL: 'https://morethanpanel.com/api/v2',
    FX_RATE: 1450, // Naira per Dollar (hidden)
    MARKUP: 2.5, // 150% profit markup
    ADMIN_EMAIL: 'junestudioimagineai@gmail.com',
    WHATSAPP: '+2348081515375',
    GOOGLE_CLIENT_ID: '1031396840174-7kq44t5hn9nji3ssvcb0q2a5mbjie0ag.apps.googleusercontent.com'
};

// State Management
let state = {
    currentUser: null,
    currentTier: 'basic', // 'basic' or 'max'
    currentCategory: 'all',
    services: [],
    bundle: [],
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
    renderServices();
    setupEventListeners();
    loadChatHistory();
}

// User Authentication
function loadUserFromStorage() {
    const user = localStorage.getItem('imagine_user');
    if (user) {
        state.currentUser = JSON.parse(user);
        updateUserUI();
    }
}

function updateUserUI() {
    const authButtons = document.getElementById('authButtons');
    const userMenu = document.getElementById('userMenu');
    
    if (state.currentUser) {
        authButtons.style.display = 'none';
        userMenu.style.display = 'flex';
        document.getElementById('userNameDisplay').textContent = state.currentUser.name.split(' ')[0];
        document.getElementById('userBalanceDisplay').textContent = formatCurrency(state.currentUser.balance || 0);
    } else {
        authButtons.style.display = 'flex';
        userMenu.style.display = 'none';
    }
}

function showLogin() {
    document.getElementById('loginModal').classList.add('show');
}

function showSignup() {
    document.getElementById('signupModal').classList.add('show');
}

function switchAuth(type) {
    closeModal('loginModal');
    closeModal('signupModal');
    if (type === 'login') {
        showLogin();
    } else {
        showSignup();
    }
}

function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Simulate login (in production, this would call your backend)
    const users = JSON.parse(localStorage.getItem('imagine_users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        state.currentUser = user;
        localStorage.setItem('imagine_user', JSON.stringify(user));
        updateUserUI();
        closeModal('loginModal');
        showNotification('Welcome back, ' + user.name + '!', 'success');
    } else {
        showNotification('Invalid credentials', 'error');
    }
}

function handleSignup(event) {
    event.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    
    const users = JSON.parse(localStorage.getItem('imagine_users') || '[]');
    
    if (users.find(u => u.email === email)) {
        showNotification('Email already registered', 'error');
        return;
    }
    
    const newUser = {
        id: Date.now(),
        name,
        email,
        password,
        balance: 0,
        orders: [],
        isAdmin: email === CONFIG.ADMIN_EMAIL,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('imagine_users', JSON.stringify(users));
    
    state.currentUser = newUser;
    localStorage.setItem('imagine_user', JSON.stringify(newUser));
    updateUserUI();
    closeModal('signupModal');
    showNotification('Account created successfully!', 'success');
}

function googleSignIn() {
    // Google OAuth implementation
    const clientId = CONFIG.GOOGLE_CLIENT_ID;
    const redirectUri = window.location.href.split('#')[0];
    const scope = 'email profile';
    
    const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(scope)}`;
    
    // Check for hash token in URL
    const hash = window.location.hash;
    if (hash && hash.includes('access_token')) {
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        
        // Fetch user info from Google
        fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`)
            .then(res => res.json())
            .then(data => {
                const users = JSON.parse(localStorage.getItem('imagine_users') || '[]');
                let user = users.find(u => u.email === data.email);
                
                if (!user) {
                    user = {
                        id: Date.now(),
                        name: data.name,
                        email: data.email,
                        password: '',
                        balance: 0,
                        orders: [],
                        isAdmin: data.email === CONFIG.ADMIN_EMAIL,
                        createdAt: new Date().toISOString()
                    };
                    users.push(user);
                    localStorage.setItem('imagine_users', JSON.stringify(users));
                }
                
                state.currentUser = user;
                localStorage.setItem('imagine_user', JSON.stringify(user));
                updateUserUI();
                window.location.hash = '';
                showNotification('Welcome, ' + user.name + '!', 'success');
            })
            .catch(err => {
                showNotification('Google sign-in failed', 'error');
            });
    } else {
        window.location.href = authUrl;
    }
}

function logout() {
    state.currentUser = null;
    localStorage.removeItem('imagine_user');
    updateUserUI();
    showNotification('Logged out successfully', 'success');
}

function toggleUserDropdown() {
    document.getElementById('userDropdown').classList.toggle('show');
}

// Service Management
async function loadServices() {
    try {
        // Load from both APIs
        const [japServices, mtpServices] = await Promise.all([
            fetchServicesFromAPI('JAP'),
            fetchServicesFromAPI('MTP')
        ]);
        
        state.services = [
            ...japServices.map(s => ({...s, tier: 'basic'})),
            ...mtpServices.map(s => ({...s, tier: 'max'}))
        ];
        
        renderServices();
    } catch (error) {
        console.error('Error loading services:', error);
        // Fallback to demo services if APIs fail
        loadDemoServices();
    }
}

async function fetchServicesFromAPI(provider) {
    const apiKey = provider === 'JAP' ? CONFIG.JAP_API_KEY : CONFIG.MTP_API_KEY;
    const apiUrl = provider === 'JAP' ? CONFIG.JAP_URL : CONFIG.MTP_URL;
    
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                key: apiKey,
                action: 'services'
            })
        });
        
        const data = await response.json();
        
        if (data && Array.isArray(data)) {
            return data.map(service => ({
                id: service.service,
                name: service.name,
                category: categorizeService(service.name),
                price: service.rate,
                min: service.min,
                max: service.max,
                description: getServiceDescription(service.name),
                provider: provider
            }));
        }
        
        return [];
    } catch (error) {
        console.error(`Error fetching from ${provider}:`, error);
        return [];
    }
}

function categorizeService(name) {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('instagram')) return 'instagram';
    if (lowerName.includes('tiktok')) return 'tiktok';
    if (lowerName.includes('facebook')) return 'facebook';
    if (lowerName.includes('twitter') || lowerName.includes('x')) return 'twitter';
    if (lowerName.includes('youtube')) return 'youtube';
    if (lowerName.includes('telegram')) return 'telegram';
    if (lowerName.includes('whatsapp')) return 'whatsapp';
    if (lowerName.includes('snapchat')) return 'other';
    if (lowerName.includes('pinterest')) return 'other';
    if (lowerName.includes('reddit')) return 'other';
    if (lowerName.includes('linkedin')) return 'other';
    return 'other';
}

function getServiceDescription(name) {
    if (name.toLowerCase().includes('follower')) return 'High-quality followers';
    if (name.toLowerCase().includes('like')) return 'Engaged likes';
    if (name.toLowerCase().includes('view')) return 'Instant views';
    if (name.toLowerCase().includes('comment')) return 'Custom comments';
    if (name.toLowerCase().includes('share')) return 'Viral shares';
    return 'Premium service';
}

function loadDemoServices() {
    // Demo services as fallback
    const demoServices = [
        { id: 1, name: 'Instagram Followers', category: 'instagram', price: 0.50, min: 100, max: 10000, description: 'High-quality followers', tier: 'basic' },
        { id: 2, name: 'Instagram Likes', category: 'instagram', price: 0.15, min: 50, max: 5000, description: 'Engaged likes', tier: 'basic' },
        { id: 3, name: 'TikTok Views', category: 'tiktok', price: 0.05, min: 1000, max: 100000, description: 'Instant views', tier: 'basic' },
        { id: 4, name: 'Facebook Likes', category: 'facebook', price: 0.20, min: 50, max: 5000, description: 'Page likes', tier: 'basic' },
        { id: 5, name: 'Twitter Followers', category: 'twitter', price: 0.40, min: 100, max: 10000, description: 'Real followers', tier: 'basic' },
        { id: 6, name: 'YouTube Subscribers', category: 'youtube', price: 1.50, min: 50, max: 5000, description: 'Active subscribers', tier: 'basic' },
        { id: 7, name: 'Telegram Members', category: 'telegram', price: 0.30, min: 100, max: 10000, description: 'Channel members', tier: 'basic' },
        { id: 8, name: 'WhatsApp Channel Followers', category: 'whatsapp', price: 0.35, min: 100, max: 5000, description: 'Channel followers', tier: 'basic' },
        
        { id: 9, name: 'Instagram Followers Premium', category: 'instagram', price: 0.60, min: 100, max: 20000, description: 'Premium followers with warranty', tier: 'max' },
        { id: 10, name: 'TikTok Followers Max', category: 'tiktok', price: 0.45, min: 100, max: 10000, description: 'Priority delivery', tier: 'max' },
        { id: 11, name: 'Snapchat Followers', category: 'other', price: 0.55, min: 100, max: 5000, description: 'Story viewers included', tier: 'max' },
        { id: 12, name: 'Pinterest Followers', category: 'other', price: 0.50, min: 100, max: 5000, description: 'Pin savers', tier: 'max' },
        { id: 13, name: 'Reddit Upvotes', category: 'other', price: 0.25, min: 50, max: 5000, description: 'Post upvotes', tier: 'max' },
        { id: 14, name: 'LinkedIn Connections', category: 'other', price: 0.80, min: 50, max: 2000, description: 'Professional network', tier: 'max' }
    ];
    
    state.services = demoServices;
    renderServices();
}

function renderServices() {
    const grid = document.getElementById('servicesGrid');
    const filtered = state.services.filter(service => {
        const tierMatch = service.tier === state.currentTier;
        const categoryMatch = state.currentCategory === 'all' || service.category === state.currentCategory;
        return tierMatch && categoryMatch;
    });
    
    if (filtered.length === 0) {
        grid.innerHTML = '<div class="empty-state" style="grid-column: 1/-1; padding: 3rem;">No services found in this category</div>';
        return;
    }
    
    grid.innerHTML = filtered.map(service => {
        const nairaPrice = convertToNaira(service.price);
        return `
            <div class="service-card">
                <div class="service-header">
                    <div class="service-icon">
                        <i class="fab fa-${getServiceIcon(service.category)}"></i>
                    </div>
                    <div class="service-info">
                        <h4>${service.name}</h4>
                        <span class="service-category">${service.category}</span>
                    </div>
                </div>
                <div class="service-details">
                    <div class="service-detail-row">
                        <span>Min Order:</span>
                        <span>${service.min}</span>
                    </div>
                    <div class="service-detail-row">
                        <span>Max Order:</span>
                        <span>${service.max.toLocaleString()}</span>
                    </div>
                    <div class="service-detail-row">
                        <span>Description:</span>
                        <span>${service.description}</span>
                    </div>
                </div>
                <div class="service-price">${formatCurrency(nairaPrice)}</div>
                <button class="btn btn-primary btn-block" onclick="addToBundle(${service.id})">
                    <i class="fas fa-cart-plus"></i> Add to Bundle
                </button>
                <button class="btn btn-outline btn-block mt-2" onclick="quickOrder(${service.id})">
                    <i class="fas fa-bolt"></i> Quick Order
                </button>
            </div>
        `;
    }).join('');
}

function getServiceIcon(category) {
    const icons = {
        instagram: 'instagram',
        tiktok: 'tiktok',
        facebook: 'facebook',
        twitter: 'twitter',
        youtube: 'youtube',
        telegram: 'telegram',
        whatsapp: 'whatsapp',
        other: 'star'
    };
    return icons[category] || 'star';
}

function filterServices(tier) {
    state.currentTier = tier;
    
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tier === tier);
    });
    
    renderServices();
}

function filterCategory(category) {
    state.currentCategory = category;
    
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.category === category);
    });
    
    renderServices();
}

// Currency Conversion
function convertToNaira(dollarAmount) {
    const markedUp = dollarAmount * CONFIG.MARKUP;
    return Math.round(markedUp * CONFIG.FX_RATE);
}

function formatCurrency(amount) {
    return '₦' + amount.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

// Bundle System
function addToBundle(serviceId) {
    const service = state.services.find(s => s.id === serviceId);
    if (!service) return;
    
    const existing = state.bundle.find(item => item.id === serviceId);
    if (existing) {
        existing.quantity += 1;
    } else {
        state.bundle.push({...service, quantity: 1});
    }
    
    updateBundleUI();
    showNotification('Added to bundle!', 'success');
}

function removeFromBundle(serviceId) {
    state.bundle = state.bundle.filter(item => item.id !== serviceId);
    updateBundleUI();
}

function updateBundleUI() {
    const container = document.getElementById('selectedServices');
    const subtotalEl = document.getElementById('bundleSubtotal');
    const discountEl = document.getElementById('bundleDiscount');
    const totalEl = document.getElementById('bundleTotal');
    const checkoutBtn = document.getElementById('checkoutBundleBtn');
    
    if (state.bundle.length === 0) {
        container.innerHTML = '<p class="empty-state">Click "Add to Bundle" on any service to start building</p>';
        subtotalEl.textContent = '₦0';
        discountEl.textContent = '-₦0';
        totalEl.textContent = '₦0';
        checkoutBtn.disabled = true;
        return;
    }
    
    const subtotal = state.bundle.reduce((sum, item) => {
        return sum + (convertToNaira(item.price) * item.quantity);
    }, 0);
    
    // Calculate discount
    const totalItems = state.bundle.reduce((sum, item) => sum + item.quantity, 0);
    let discountRate = 0;
    if (totalItems >= 7) discountRate = 0.50;
    else if (totalItems >= 5) discountRate = 0.35;
    else if (totalItems >= 3) discountRate = 0.20;
    
    const discount = subtotal * discountRate;
    const total = subtotal - discount;
    
    container.innerHTML = state.bundle.map(item => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: var(--white); border-radius: 8px; margin-bottom: 0.5rem;">
            <div>
                <strong>${item.name}</strong>
                <div style="font-size: 0.875rem; color: var(--gray-500);">Qty: ${item.quantity} × ${formatCurrency(convertToNaira(item.price))}</div>
            </div>
            <button onclick="removeFromBundle(${item.id})" style="background: none; border: none; color: var(--danger); cursor: pointer;">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
    
    subtotalEl.textContent = formatCurrency(subtotal);
    discountEl.textContent = '-' + formatCurrency(discount);
    totalEl.textContent = formatCurrency(total);
    checkoutBtn.disabled = false;
    
    // Update discount tiers UI
    document.querySelectorAll('.discount-tier').forEach((tier, index) => {
        const thresholds = [3, 5, 7];
        tier.classList.toggle('active', totalItems >= thresholds[index]);
    });
}

function checkoutBundle() {
    if (!state.currentUser) {
        showNotification('Please login to checkout', 'error');
        showLogin();
        return;
    }
    
    const total = state.bundle.reduce((sum, item) => sum + (convertToNaira(item.price) * item.quantity), 0);
    const totalItems = state.bundle.reduce((sum, item) => sum + item.quantity, 0);
    
    let discountRate = 0;
    if (totalItems >= 7) discountRate = 0.50;
    else if (totalItems >= 5) discountRate = 0.35;
    else if (totalItems >= 3) discountRate = 0.20;
    
    const finalTotal = total * (1 - discountRate);
    
    if (state.currentUser.balance < finalTotal) {
        showNotification('Insufficient balance. Please add funds.', 'error');
        showAddFunds();
        return;
    }
    
    // Process order
    state.currentUser.balance -= finalTotal;
    state.currentUser.orders = state.currentUser.orders || [];
    state.currentUser.orders.push({
        id: Date.now(),
        items: [...state.bundle],
        total: finalTotal,
        date: new Date().toISOString(),
        status: 'pending'
    });
    
    saveUserState();
    state.bundle = [];
    updateBundleUI();
    updateUserUI();
    
    showNotification('Bundle order placed successfully!', 'success');
}

function loadPackage(type) {
    const packages = {
        starter: [1, 3, 4],
        growth: [1, 3, 4, 5],
        enterprise: [1, 3, 4, 5, 6]
    };
    
    packages[type].forEach(id => addToBundle(id));
    scrollToSection('bundles');
}

// Quick Order
let currentOrderService = null;

function quickOrder(serviceId) {
    if (!state.currentUser) {
        showNotification('Please login to order', 'error');
        showLogin();
        return;
    }
    
    const service = state.services.find(s => s.id === serviceId);
    if (!service) return;
    
    currentOrderService = service;
    const nairaPrice = convertToNaira(service.price);
    
    document.getElementById('orderServiceName').textContent = service.name;
    document.getElementById('orderPricePerUnit').textContent = formatCurrency(nairaPrice);
    document.getElementById('orderCurrentBalance').textContent = formatCurrency(state.currentUser.balance);
    document.getElementById('orderQuantity').value = service.min;
    
    updateOrderTotal();
    document.getElementById('orderModal').classList.add('show');
}

function updateOrderTotal() {
    if (!currentOrderService) return;
    
    const quantity = parseInt(document.getElementById('orderQuantity').value) || 0;
    const nairaPrice = convertToNaira(currentOrderService.price);
    const total = nairaPrice * quantity;
    
    document.getElementById('orderTotalCost').textContent = formatCurrency(total);
}

function submitOrder(event) {
    event.preventDefault();
    
    if (!currentOrderService) return;
    
    const link = document.getElementById('orderLink').value;
    const quantity = parseInt(document.getElementById('orderQuantity').value);
    const nairaPrice = convertToNaira(currentOrderService.price);
    const total = nairaPrice * quantity;
    
    if (state.currentUser.balance < total) {
        showNotification('Insufficient balance', 'error');
        return;
    }
    
    // Deduct balance and create order
    state.currentUser.balance -= total;
    state.currentUser.orders = state.currentUser.orders || [];
    state.currentUser.orders.push({
        id: Date.now(),
        service: currentOrderService.name,
        link,
        quantity,
        total,
        date: new Date().toISOString(),
        status: 'pending'
    });
    
    saveUserState();
    updateUserUI();
    closeModal('orderModal');
    
    showNotification('Order placed successfully!', 'success');
}

document.getElementById('orderQuantity')?.addEventListener('input', updateOrderTotal);

// Add Funds
function showAddFunds() {
    document.getElementById('addFundsModal').classList.add('show');
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Copied to clipboard!', 'success');
    });
}

// AI Assistant
function switchAIMode(mode) {
    state.aiMode = mode;
    
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });
    
    const messages = document.getElementById('chatMessages');
    const modeNames = {
        social: 'Social Media Expert',
        design: 'Content Designer',
        marketing: 'Marketing Strategist',
        nigerian: 'Nigerian Market Expert'
    };
    
    messages.innerHTML += `
        <div class="message ai-message">
            <div class="message-avatar"><i class="fas fa-robot"></i></div>
            <div class="message-content">
                <p>I'm now in ${modeNames[mode]} mode. How can I help you?</p>
            </div>
        </div>
    `;
    
    messages.scrollTop = messages.scrollHeight;
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    const messages = document.getElementById('chatMessages');
    
    // Add user message
    messages.innerHTML += `
        <div class="message user-message">
            <div class="message-avatar"><i class="fas fa-user"></i></div>
            <div class="message-content">
                <p>${message}</p>
            </div>
        </div>
    `;
    
    input.value = '';
    
    // Generate AI response
    setTimeout(() => {
        const response = generateAIResponse(message, state.aiMode);
        
        messages.innerHTML += `
            <div class="message ai-message">
                <div class="message-avatar"><i class="fas fa-robot"></i></div>
                <div class="message-content">
                    <p>${response}</p>
                </div>
            </div>
        `;
        
        messages.scrollTop = messages.scrollHeight;
        
        // Save to history if logged in
        if (state.currentUser) {
            saveChatToHistory(message, response);
        }
    }, 1000);
}

function generateAIResponse(message, mode) {
    const responses = {
        social: [
            "For optimal social media growth, I recommend posting consistently at peak hours (7-9 AM and 6-9 PM). Use trending hashtags and engage with your audience within the first hour of posting.",
            "Based on current trends, short-form video content is performing exceptionally well across all platforms. Consider creating 15-30 second videos with hooks in the first 3 seconds.",
            "To increase engagement, try the 80/20 rule: 80% valuable content, 20% promotional. Ask questions in your captions to encourage comments."
        ],
        design: [
            "For eye-catching social media graphics, use the rule of thirds and maintain consistent brand colors. Tools like Canva or Adobe Express work great for quick designs.",
            "When designing for mobile-first audiences, ensure text is large enough to read without zooming. Use high contrast colors for better readability.",
            "Video thumbnails should have bold text, expressive faces, and vibrant colors. The first frame is crucial for click-through rates."
        ],
        marketing: [
            "For Nigerian markets, WhatsApp marketing has a 98% open rate. Combine it with Instagram for maximum reach. Consider influencer partnerships for authentic promotion.",
            "A successful funnel: Awareness (social ads) → Interest (valuable content) → Decision (testimonials) → Action (limited-time offer). Track each stage.",
            "ROI tip: Retargeting ads convert 70% better than cold ads. Create custom audiences from website visitors and engagers."
        ],
        nigerian: [
            "Nigerian audiences respond well to relatable content using local slang (pidgin), trending sounds, and cultural references. Authenticity wins over polished content.",
            "For e-commerce in Nigeria, trust is key. Use customer testimonials, behind-the-scenes content, and live videos to build credibility before selling.",
            "Payment integration: Offer multiple options (bank transfer, USSD, card). Many Nigerians prefer paying after delivery, so consider escrow services."
        ]
    };
    
    const modeResponses = responses[mode] || responses.social;
    return modeResponses[Math.floor(Math.random() * modeResponses.length)];
}

function handleChatKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

function saveChatToHistory(userMessage, aiResponse) {
    state.chatHistory.push({
        mode: state.aiMode,
        user: userMessage,
        ai: aiResponse,
        timestamp: new Date().toISOString()
    });
    
    // Keep last 20 conversations
    if (state.chatHistory.length > 20) {
        state.chatHistory = state.chatHistory.slice(-20);
    }
    
    localStorage.setItem(`chat_history_${state.currentUser.id}`, JSON.stringify(state.chatHistory));
    loadChatHistory();
}

function loadChatHistory() {
    if (!state.currentUser) return;
    
    const history = JSON.parse(localStorage.getItem(`chat_history_${state.currentUser.id}`) || '[]');
    state.chatHistory = history;
    
    const historyList = document.getElementById('historyList');
    if (history.length === 0) {
        historyList.innerHTML = '<p style="color: var(--gray-400); font-size: 0.875rem;">No recent conversations</p>';
        return;
    }
    
    historyList.innerHTML = history.slice(-5).reverse().map((chat, index) => `
        <div style="padding: 0.75rem; background: rgba(255,255,255,0.05); border-radius: 8px; margin-bottom: 0.5rem; cursor: pointer;" onclick="loadChat(${index})">
            <div style="font-size: 0.75rem; color: var(--gray-400);">${new Date(chat.timestamp).toLocaleDateString()}</div>
            <div style="font-size: 0.875rem; color: var(--white); truncate;">${chat.user}</div>
        </div>
    `).join('');
}

function loadChat(index) {
    const chat = state.chatHistory[state.chatHistory.length - 1 - index];
    if (!chat) return;
    
    const messages = document.getElementById('chatMessages');
    messages.innerHTML = `
        <div class="message user-message">
            <div class="message-avatar"><i class="fas fa-user"></i></div>
            <div class="message-content">
                <p>${chat.user}</p>
            </div>
        </div>
        <div class="message ai-message">
            <div class="message-avatar"><i class="fas fa-robot"></i></div>
            <div class="message-content">
                <p>${chat.ai}</p>
            </div>
        </div>
    `;
}

// Utility Functions
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

function scrollToSection(sectionId) {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
}

function toggleMobileMenu() {
    document.getElementById('navLinks').classList.toggle('show');
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    Object.assign(notification.style, {
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        background: type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--danger)' : 'var(--primary)',
        color: 'white',
        padding: '1rem 1.5rem',
        borderRadius: '12px',
        boxShadow: 'var(--shadow-xl)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        zIndex: 3000,
        animation: 'slideUp 0.3s ease-out',
        fontWeight: '500'
    });
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'fadeIn 0.3s ease-out reverse';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function saveUserState() {
    localStorage.setItem('imagine_users', JSON.stringify(
        JSON.parse(localStorage.getItem('imagine_users') || '[]')
            .map(u => u.id === state.currentUser.id ? state.currentUser : u)
    ));
    localStorage.setItem('imagine_user', JSON.stringify(state.currentUser));
}

function showDashboard() {
    showNotification('Dashboard feature coming soon!', 'info');
}

function showOrders() {
    if (!state.currentUser?.orders?.length) {
        showNotification('No orders yet', 'info');
        return;
    }
    
    const orderList = state.currentUser.orders.map(o => 
        `${new Date(o.date).toLocaleDateString()} - ${o.service || 'Bundle'} - ${formatCurrency(o.total)} - ${o.status}`
    ).join('\n');
    
    alert('Your Orders:\n\n' + orderList);
}

function sendContactMessage(event) {
    event.preventDefault();
    showNotification('Message sent! We\'ll respond within 24 hours', 'success');
    event.target.reset();
}

function subscribeNewsletter(event) {
    event.preventDefault();
    showNotification('Thanks for subscribing!', 'success');
    event.target.reset();
}

function orderDigital(service) {
    if (!state.currentUser) {
        showNotification('Please login to order digital services', 'error');
        showLogin();
        return;
    }
    showNotification('Digital service order initiated. Our team will contact you via WhatsApp', 'success');
}

// Close modals when clicking outside
window.addEventListener('click', (event) => {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('show');
    }
});

// Close dropdowns when clicking outside
document.addEventListener('click', (event) => {
    if (!event.target.closest('.dropdown')) {
        document.getElementById('userDropdown')?.classList.remove('show');
    }
});

// Setup event listeners
function setupEventListeners() {
    // Smooth scroll for nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            document.querySelector(targetId)?.scrollIntoView({ behavior: 'smooth' });
            
            // Update active state
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Close mobile menu
            document.getElementById('navLinks').classList.remove('show');
        });
    });
    
    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        const navbar = document.getElementById('navbar');
        if (window.scrollY > 50) {
            navbar.style.boxShadow = 'var(--shadow-lg)';
        } else {
            navbar.style.boxShadow = 'var(--shadow-md)';
        }
    });
}

// Initialize particles for hero
function createParticles() {
    const container = document.getElementById('heroParticles');
    if (!container) return;
    
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 4 + 2}px;
            height: ${Math.random() * 4 + 2}px;
            background: rgba(255, 255, 255, ${Math.random() * 0.5 + 0.3});
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: float ${Math.random() * 10 + 10}s infinite linear;
        `;
        container.appendChild(particle);
    }
}

// Add floating animation
const style = document.createElement('style');
style.textContent = `
    @keyframes float {
        0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
        10% { opacity: 1; }
        90% { opacity: 1; }
        100% { transform: translateY(-100vh) translateX(${Math.random() * 100 - 50}px); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Create particles on load
setTimeout(createParticles, 100);

console.log('Imagine Marketplace initialized successfully! 🚀');
