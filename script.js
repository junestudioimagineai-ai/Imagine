// Imagine SMM Marketplace - Complete Setup
// Dual API Integration: JustAnotherPanel & MoreThanPanel
// JuneStudio Basic (JAP) and JuneStudio Max (MTP) tiers

const CONFIG = {
    JAP_API_KEY: 'fc5f37722f01550a7c956a0d4ecf63bb',
    MTP_API_KEY: '3cb77c7355e039af290c6ba07097d85f',
    WHATSAPP: '+2348081515375',
    ADMIN_EMAIL: 'junestudioimagineai@gmail.com',
    MARKUP: 1.5, // 150% profit margin
    GOOGLE_CLIENT_ID: '1031396840174-7kq44t5hn9nji3ssvcb0q2a5mbjie0ag.apps.googleusercontent.com'
};

// State
let currentUser = null;
let services = [];
let bundle = [];
let currentMode = 'social';
let currentView = 'smm'; // 'smm' or 'digital'

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initAuth();
    loadServices();
    checkAuth();
    setupEventListeners();
});

// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    
    document.getElementById('theme-toggle')?.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        updateThemeIcon(next);
    });
}

function updateThemeIcon(theme) {
    const icon = document.querySelector('#theme-toggle i');
    if (icon) {
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// View Toggle (SMM vs Digital Services)
function toggleView() {
    currentView = currentView === 'smm' ? 'digital' : 'smm';
    const btn = document.getElementById('view-toggle');
    if (btn) {
        btn.textContent = currentView === 'smm' 
            ? 'Switch to Non-SMM Services' 
            : 'Back to SMM Services';
    }
    renderServices(services);
}

// Service Generation with Dual API Sources
function generateServices() {
    const allServices = [];
    let id = 1;
    
    // JuneStudio Basic (JustAnotherPanel) Services
    const japCategories = [
        { id: 'instagram', name: 'Instagram', provider: 'basic' },
        { id: 'tiktok', name: 'TikTok', provider: 'basic' },
        { id: 'facebook', name: 'Facebook', provider: 'basic' },
        { id: 'twitter', name: 'Twitter', provider: 'basic' },
        { id: 'youtube', name: 'YouTube', provider: 'basic' },
        { id: 'telegram', name: 'Telegram', provider: 'basic' },
        { id: 'whatsapp', name: 'WhatsApp', provider: 'basic' },
        { id: 'linkedin', name: 'LinkedIn', provider: 'basic' }
    ];
    
    const japServices = [
        { name: 'Followers', basePrice: 0.005 },
        { name: 'Likes', basePrice: 0.001 },
        { name: 'Views', basePrice: 0.0005 },
        { name: 'Comments', basePrice: 0.01 },
        { name: 'Shares', basePrice: 0.02 }
    ];
    
    japCategories.forEach(cat => {
        japServices.forEach(service => {
            [100, 500, 1000, 5000, 10000].forEach(qty => {
                const price = service.basePrice * qty * CONFIG.MARKUP;
                allServices.push({
                    id: id++,
                    service_id: `JAP-${cat.id}-${service.name}-${qty}`,
                    name: `${cat.name} ${service.name} (${qty.toLocaleString()})`,
                    category: cat.id,
                    description: `High quality ${cat.name.toLowerCase()} ${service.name.toLowerCase()} - Fast delivery from JuneStudio Basic`,
                    price: parseFloat(price.toFixed(2)),
                    min_quantity: qty,
                    max_quantity: qty * 10,
                    provider: 'basic',
                    providerName: 'JuneStudio Basic'
                });
            });
        });
    });
    
    // JuneStudio Max (MoreThanPanel) Services - Premium Tier
    const mtpCategories = [
        { id: 'instagram', name: 'Instagram', provider: 'max' },
        { id: 'tiktok', name: 'TikTok', provider: 'max' },
        { id: 'facebook', name: 'Facebook', provider: 'max' },
        { id: 'twitter', name: 'Twitter', provider: 'max' },
        { id: 'youtube', name: 'YouTube', provider: 'max' },
        { id: 'telegram', name: 'Telegram', provider: 'max' },
        { id: 'snapchat', name: 'Snapchat', provider: 'max' },
        { id: 'pinterest', name: 'Pinterest', provider: 'max' },
        { id: 'reddit', name: 'Reddit', provider: 'max' }
    ];
    
    const mtpServices = [
        { name: 'Followers Premium', basePrice: 0.008 },
        { name: 'Likes Premium', basePrice: 0.002 },
        { name: 'Views Premium', basePrice: 0.001 },
        { name: 'Engagement Package', basePrice: 0.015 },
        { name: 'Growth Boost', basePrice: 0.025 }
    ];
    
    mtpCategories.forEach(cat => {
        mtpServices.forEach(service => {
            [100, 500, 1000, 5000, 10000, 50000].forEach(qty => {
                const price = service.basePrice * qty * CONFIG.MARKUP;
                allServices.push({
                    id: id++,
                    service_id: `MTP-${cat.id}-${service.name}-${qty}`,
                    name: `${cat.name} ${service.name} (${qty.toLocaleString()})`,
                    category: cat.id,
                    description: `Premium ${cat.name.toLowerCase()} ${service.name.toLowerCase()} - Priority delivery from JuneStudio Max`,
                    price: parseFloat(price.toFixed(2)),
                    min_quantity: qty,
                    max_quantity: qty * 10,
                    provider: 'max',
                    providerName: 'JuneStudio Max'
                });
            });
        });
    });
    
    // Digital Services (Non-SMM)
    if (currentView === 'digital') {
        const digitalServices = [
            { id: 'logo-design', name: 'Logo Design Basic', price: 150, category: 'branding' },
            { id: 'logo-premium', name: 'Logo Design Premium', price: 300, category: 'branding' },
            { id: 'brand-identity', name: 'Complete Brand Identity', price: 750, category: 'branding' },
            { id: 'landing-page', name: 'Landing Page Design', price: 225, category: 'web' },
            { id: 'business-site', name: 'Business Website', price: 450, category: 'web' },
            { id: 'ecommerce', name: 'E-commerce Store', price: 750, category: 'web' },
            { id: 'seo-audit', name: 'SEO Audit', price: 150, category: 'seo' },
            { id: 'seo-monthly', name: 'Monthly SEO Package', price: 300, category: 'seo' },
            { id: 'content-strategy', name: 'Content Strategy', price: 200, category: 'marketing' },
            { id: 'social-management', name: 'Social Media Management', price: 350, category: 'marketing' },
            { id: 'video-edit-basic', name: 'Video Editing Basic', price: 100, category: 'content' },
            { id: 'video-edit-pro', name: 'Video Editing Pro', price: 250, category: 'content' }
        ];
        
        digitalServices.forEach(ds => {
            allServices.push({
                id: id++,
                service_id: `DIGITAL-${ds.id}`,
                name: ds.name,
                category: ds.category,
                description: `Professional ${ds.name.toLowerCase()} by JuneStudio experts`,
                price: ds.price * CONFIG.MARKUP,
                min_quantity: 1,
                max_quantity: 10,
                provider: 'digital',
                providerName: 'JuneStudio Digital'
            });
        });
    }
    
    return allServices;
}

function loadServices() {
    services = generateServices();
    renderServices(services);
    updatePlatformFilter();
}

function renderServices(list) {
    const grid = document.getElementById('services-grid');
    if (!grid) return;
    
    // Filter by view type
    let filtered = list;
    if (currentView === 'smm') {
        filtered = list.filter(s => s.provider !== 'digital');
    } else {
        filtered = list.filter(s => s.provider === 'digital');
    }
    
    if (filtered.length === 0) {
        grid.innerHTML = '<p style="text-align:center;grid-column:1/-1;color:var(--text-secondary);">No services found in this category</p>';
        return;
    }
    
    grid.innerHTML = filtered.map(s => `
        <div class="service-card" data-category="${s.category}" data-provider="${s.provider}">
            <span class="provider-badge provider-${s.provider}">${s.providerName}</span>
            <span class="category">${s.category.toUpperCase()}</span>
            <h3>${s.name}</h3>
            <p class="description">${s.description}</p>
            <div class="price">₦${s.price.toFixed(2)}</div>
            <button class="btn btn-primary btn-block" onclick="openOrderModal(${s.id})" ${!currentUser ? 'disabled style="opacity:0.5"' : ''}>
                ${currentUser ? 'Order Now' : 'Login to Order'}
            </button>
        </div>
    `).join('');
}

function updatePlatformFilter() {
    const filter = document.getElementById('platform-filter');
    if (!filter) return;
    
    const providers = [...new Set(services.map(s => s.provider))];
    filter.innerHTML = '<option value="all">All Providers</option>' +
        providers.map(p => {
            const name = p === 'basic' ? 'JuneStudio Basic' : p === 'max' ? 'JuneStudio Max' : 'JuneStudio Digital';
            return `<option value="${p}">${name}</option>`;
        }).join('');
}

function filterServices() {
    const search = document.getElementById('service-search')?.value.toLowerCase() || '';
    const category = document.getElementById('category-filter')?.value || 'all';
    const platform = document.getElementById('platform-filter')?.value || 'all';
    
    let filtered = services;
    
    // Apply view filter first
    if (currentView === 'smm') {
        filtered = filtered.filter(s => s.provider !== 'digital');
    } else {
        filtered = filtered.filter(s => s.provider === 'digital');
    }
    
    if (category !== 'all') filtered = filtered.filter(s => s.category === category);
    if (platform !== 'all') filtered = filtered.filter(s => s.provider === platform);
    if (search) filtered = filtered.filter(s => s.name.toLowerCase().includes(search));
    
    renderServices(filtered);
}

// Auth Functions
function initAuth() {
    // Check for existing session
    const saved = localStorage.getItem('currentUser');
    if (saved) {
        currentUser = JSON.parse(saved);
        updateUI();
    }
}

function checkAuth() {
    const saved = localStorage.getItem('currentUser');
    if (saved) {
        currentUser = JSON.parse(saved);
        updateUI();
    }
}

function showModal(type) {
    const modal = document.getElementById('auth-modal');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    
    if (type === 'login') {
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
    } else {
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
    }
    
    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('auth-modal').style.display = 'none';
}

function showSignup() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('signup-form').style.display = 'block';
}

function showLogin() {
    document.getElementById('signup-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        updateUI();
        closeModal();
        alert('Welcome back, ' + (user.businessName || user.email) + '!');
    } else {
        alert('Invalid credentials. Please try again.');
    }
}

function handleSignup(e) {
    e.preventDefault();
    const businessName = document.getElementById('signup-business').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    if (users.find(u => u.email === email)) {
        alert('Email already registered. Please login instead.');
        return;
    }
    
    const newUser = {
        id: Date.now(),
        businessName: businessName,
        email: email,
        password: password,
        balance: 0,
        role: email === CONFIG.ADMIN_EMAIL ? 'admin' : 'user',
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    updateUI();
    closeModal();
    alert('Account created successfully! Welcome to Imagine.');
}

function handleGoogleLogin(response) {
    const userInfo = {
        email: response.email,
        name: response.name,
        picture: response.picture
    };
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    let user = users.find(u => u.email === userInfo.email);
    
    if (!user) {
        user = {
            id: Date.now(),
            businessName: userInfo.name,
            email: userInfo.email,
            password: '',
            balance: 0,
            role: userInfo.email === CONFIG.ADMIN_EMAIL ? 'admin' : 'user',
            createdAt: new Date().toISOString()
        };
        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    updateUI();
    alert('Welcome, ' + userInfo.name + '!');
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateUI();
    alert('Logged out successfully');
}

function updateUI() {
    const authSection = document.getElementById('auth-section');
    const userSection = document.getElementById('user-section');
    const usernameDisplay = document.getElementById('nav-username');
    const balanceDisplay = document.getElementById('nav-balance');
    const adminLink = document.getElementById('admin-link');
    
    if (currentUser) {
        authSection.style.display = 'none';
        userSection.style.display = 'flex';
        userSection.style.alignItems = 'center';
        userSection.style.gap = '1rem';
        
        usernameDisplay.textContent = currentUser.businessName || currentUser.email;
        balanceDisplay.textContent = (currentUser.balance || 0).toFixed(2);
        
        if (adminLink) {
            adminLink.style.display = currentUser.role === 'admin' ? 'block' : 'none';
        }
    } else {
        authSection.style.display = 'flex';
        userSection.style.display = 'none';
        if (adminLink) adminLink.style.display = 'none';
    }
    
    // Re-render services to update button states
    filterServices();
}

// Order Functions
let currentService = null;

function closeOrderModal() {
    document.getElementById('order-modal').style.display = 'none';
}

function openOrderModal(serviceId) {
    if (!currentUser) {
        showModal('login');
        return;
    }
    
    currentService = services.find(s => s.id === serviceId);
    if (!currentService) return;
    
    const modal = document.getElementById('order-modal');
    const details = document.getElementById('order-details');
    
    details.innerHTML = `
        <h3>${currentService.name}</h3>
        <p>Category: ${currentService.category.toUpperCase()}</p>
        <p>Provider: ${currentService.providerName}</p>
    `;
    
    document.getElementById('unit-price').textContent = currentService.price.toFixed(2);
    document.getElementById('order-quantity').min = currentService.min_quantity;
    document.getElementById('order-quantity').max = currentService.max_quantity;
    document.getElementById('order-quantity').value = currentService.min_quantity;
    document.getElementById('min-qty').textContent = currentService.min_quantity;
    document.getElementById('user-balance-display').textContent = (currentUser.balance || 0).toFixed(2);
    
    updateOrderTotal();
    modal.style.display = 'block';
}

function updateOrderTotal() {
    const quantity = parseInt(document.getElementById('order-quantity').value) || 0;
    const total = quantity * currentService.price;
    document.getElementById('order-total').textContent = total.toFixed(2);
}

function submitOrder(e) {
    e.preventDefault();
    
    const quantity = parseInt(document.getElementById('order-quantity').value);
    const link = document.getElementById('order-link').value;
    const total = quantity * currentService.price;
    
    if (total > (currentUser.balance || 0)) {
        alert(`Insufficient balance. Your current balance is ₦${(currentUser.balance || 0).toFixed(2)}. Please add funds via bank transfer or OPay/PalmPay and send receipt to WhatsApp: ${CONFIG.WHATSAPP}`);
        return;
    }
    
    // Deduct balance
    currentUser.balance -= total;
    
    // Save order
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push({
        id: Date.now(),
        userId: currentUser.id,
        service: currentService,
        quantity: quantity,
        link: link,
        total: total,
        status: 'pending',
        createdAt: new Date().toISOString()
    });
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Update user balance in storage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex].balance = currentUser.balance;
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    // Update current user
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    closeOrderModal();
    updateUI();
    alert('Order placed successfully! Your order will be processed shortly. You can track it in your dashboard.');
}

// Bundle Functions
function addToBundle() {
    if (!currentUser) {
        showModal('login');
        return;
    }
    
    const selected = prompt('Enter the service ID or name to add to your bundle:');
    if (!selected) return;
    
    const service = services.find(s => 
        s.id.toString() === selected || 
        s.name.toLowerCase().includes(selected.toLowerCase())
    );
    
    if (service) {
        bundle.push(service);
        updateBundleDisplay();
        alert(`${service.name} added to bundle!`);
    } else {
        alert('Service not found. Please check the ID or name and try again.');
    }
}

function updateBundleDisplay() {
    const itemsContainer = document.getElementById('bundle-items');
    const countDisplay = document.getElementById('bundle-count');
    const discountDisplay = document.getElementById('bundle-discount');
    const finalPriceDisplay = document.getElementById('bundle-final-price');
    const buyButton = document.getElementById('buy-bundle-btn');
    
    if (!itemsContainer) return;
    
    if (bundle.length === 0) {
        itemsContainer.innerHTML = '<p style="color:var(--text-muted);">No items in bundle yet. Click "Add Service to Bundle" to start building!</p>';
        countDisplay.textContent = '0';
        discountDisplay.textContent = '0%';
        finalPriceDisplay.textContent = '0.00';
        if (buyButton) buyButton.disabled = true;
        return;
    }
    
    itemsContainer.innerHTML = bundle.map((s, index) => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:0.75rem;border-bottom:1px solid var(--border-color);">
            <span>${s.name}</span>
            <span>₦${s.price.toFixed(2)} 
                <button onclick="removeFromBundle(${index})" style="background:none;border:none;color:var(--danger-color);cursor:pointer;font-size:1.2rem;">×</button>
            </span>
        </div>
    `).join('');
    
    // Calculate discount
    const subtotal = bundle.reduce((sum, s) => sum + s.price, 0);
    let discount = 0;
    
    if (bundle.length >= 7) discount = 0.5; // 50% off
    else if (bundle.length >= 5) discount = 0.35; // 35% off
    else if (bundle.length >= 3) discount = 0.2; // 20% off
    
    const finalPrice = subtotal * (1 - discount);
    
    countDisplay.textContent = bundle.length;
    discountDisplay.textContent = (discount * 100) + '%';
    finalPriceDisplay.textContent = finalPrice.toFixed(2);
    
    if (buyButton) buyButton.disabled = false;
}

function removeFromBundle(index) {
    bundle.splice(index, 1);
    updateBundleDisplay();
}

function purchaseBundle() {
    if (bundle.length === 0) return;
    
    const subtotal = bundle.reduce((sum, s) => sum + s.price, 0);
    let discount = 0;
    
    if (bundle.length >= 7) discount = 0.5;
    else if (bundle.length >= 5) discount = 0.35;
    else if (bundle.length >= 3) discount = 0.2;
    
    const finalPrice = subtotal * (1 - discount);
    
    if (finalPrice > (currentUser.balance || 0)) {
        alert(`Insufficient balance. You need ₦${finalPrice.toFixed(2)} but have ₦${(currentUser.balance || 0).toFixed(2)}. Please add funds first.`);
        return;
    }
    
    if (!confirm(`Purchase ${bundle.length} services for ₦${finalPrice.toFixed(2)}? (Original price: ₦${subtotal.toFixed(2)}, You save: ₦${(subtotal - finalPrice).toFixed(2)})`)) {
        return;
    }
    
    currentUser.balance -= finalPrice;
    
    // Create orders for each service
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    bundle.forEach(s => {
        orders.push({
            id: Date.now() + Math.random(),
            userId: currentUser.id,
            service: s,
            quantity: 1,
            link: 'Bundle order',
            total: s.price * (1 - discount),
            status: 'pending',
            createdAt: new Date().toISOString()
        });
    });
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Update user balance
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex].balance = currentUser.balance;
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    bundle = [];
    updateBundleDisplay();
    updateUI();
    alert(`Bundle purchased successfully! Total: ₦${finalPrice.toFixed(2)}. You saved ₦${(subtotal - finalPrice).toFixed(2)}!`);
}

// Pre-made Packages
function orderPreMade(packageType) {
    if (!currentUser) {
        showModal('login');
        return;
    }
    
    const packages = {
        starter: { name: 'Starter Pack', price: 44.99, services: ['1000 Instagram Followers', '500 TikTok Followers', '500 Facebook Likes'] },
        growth: { name: 'Growth Pack', price: 119.99, services: ['5000 Instagram Followers', '2000 TikTok Followers', '2000 Facebook Likes', '1000 Twitter Followers'] },
        enterprise: { name: 'Enterprise Pack', price: 299.99, services: ['10000 Instagram Followers', '5000 TikTok Followers', '5000 Facebook Likes', '3000 Twitter Followers', '1000 YouTube Subscribers'] }
    };
    
    const pkg = packages[packageType];
    if (!pkg) return;
    
    if ((currentUser.balance || 0) < pkg.price) {
        alert(`Insufficient balance. This package costs ₦${pkg.price}. Please add funds via bank transfer or OPay/PalmPay.`);
        return;
    }
    
    if (!confirm(`Purchase ${pkg.name} for ₦${pkg.price}?`)) return;
    
    currentUser.balance -= pkg.price;
    
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push({
        id: Date.now(),
        userId: currentUser.id,
        service: { name: pkg.name, category: 'bundle' },
        quantity: 1,
        link: 'Premade package',
        total: pkg.price,
        status: 'pending',
        createdAt: new Date().toISOString()
    });
    localStorage.setItem('orders', JSON.stringify(orders));
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex].balance = currentUser.balance;
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updateUI();
    alert(`${pkg.name} purchased successfully! Your order will be processed shortly.`);
}

// AI Assistant Functions
function switchMode(mode) {
    currentMode = mode;
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });
}

function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    const messagesContainer = document.getElementById('chat-messages');
    
    // Add user message
    messagesContainer.innerHTML += `
        <div class="message user">
            <p>${escapeHtml(message)}</p>
        </div>
    `;
    
    input.value = '';
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Simulate AI response
    setTimeout(() => {
        const response = generateAIResponse(message, currentMode);
        messagesContainer.innerHTML += `
            <div class="message bot">
                <p>${response}</p>
            </div>
        `;
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Save to history if logged in
        if (currentUser) {
            saveChatHistory(message, response);
        }
    }, 600);
}

function generateAIResponse(message, mode) {
    const responses = {
        social: [
            "For optimal social media growth, I recommend posting consistently during peak engagement hours (9-11 AM and 7-9 PM).",
            "Engagement is crucial! Try responding to comments within the first hour of posting to boost algorithm visibility.",
            "Have you considered using a mix of trending and niche-specific hashtags? This strategy can increase reach by up to 30%.",
            "Cross-promotion across platforms is key. Share your Instagram content on Stories, TikTok, and Twitter for maximum exposure."
        ],
        content: [
            "Great content tells a compelling story. What's your brand's unique narrative that sets you apart?",
            "Visual consistency builds brand recognition. Stick to a cohesive color palette and style across all posts.",
            "Video content generates 12x more shares than text and images combined. Consider incorporating more Reels and TikToks!",
            "User-generated content builds trust and community. Encourage your followers to create content featuring your brand."
        ],
        marketing: [
            "Your target audience defines everything. Who exactly are you trying to reach, and what problems do you solve for them?",
            "A/B testing is essential for optimization. Test different headlines, images, and CTAs to find what resonates.",
            "ROI tracking separates successful campaigns from failures. Always set clear KPIs before launching any campaign.",
            "Email marketing still delivers the highest ROI of any digital channel - an average of ₦42 for every ₦1 spent!"
        ],
        nigerian: [
            "Naija audience dey love authentic and relatable content! Make sure your posts reflect local culture and humor.",
            "For Nigerian market, WhatsApp marketing very effective o! Create broadcast lists and engage customers directly.",
            "Influencer marketing for Nigeria - micro-influencers fit better and give more value for money than big celebs.",
            "Payment integration for Nigeria - make sure you get Paystack or Flutterwave. Customers want seamless checkout experience.",
            "Nigerians love video content especially short-form. TikTok and Instagram Reels go viral quick for Naija brands!"
        ]
    };
    
    const modeResponses = responses[mode] || responses.social;
    return modeResponses[Math.floor(Math.random() * modeResponses.length)];
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function saveChatHistory(userMessage, botMessage) {
    const history = JSON.parse(localStorage.getItem('chatHistory') || '{}');
    
    if (!history[currentUser.email]) {
        history[currentUser.email] = [];
    }
    
    history[currentUser.email].push({
        user: userMessage,
        bot: botMessage,
        mode: currentMode,
        timestamp: new Date().toISOString()
    });
    
    // Keep only last 50 messages
    if (history[currentUser.email].length > 50) {
        history[currentUser.email] = history[currentUser.email].slice(-50);
    }
    
    localStorage.setItem('chatHistory', JSON.stringify(history));
    loadChatHistory();
}

function loadChatHistory() {
    if (!currentUser) return;
    
    const history = JSON.parse(localStorage.getItem('chatHistory') || '{}');
    const userHistory = history[currentUser.email] || [];
    const historyList = document.getElementById('history-list');
    
    if (!historyList) return;
    
    if (userHistory.length === 0) {
        historyList.innerHTML = '<p style="color:var(--text-muted);padding:1rem;">No chat history yet. Start chatting to see your history here!</p>';
        return;
    }
    
    historyList.innerHTML = userHistory.slice(-10).reverse().map((chat, index) => `
        <div style="padding:0.75rem;border-bottom:1px solid var(--border-color);cursor:pointer:hover;background:var(--bg-tertiary);" onclick="loadChat(${userHistory.length - 1 - index})">
            <small style="color:var(--text-muted);">${new Date(chat.timestamp).toLocaleDateString()} - ${chat.mode.toUpperCase()}</small>
            <p style="margin:0.25rem 0;font-size:0.9rem;">${escapeHtml(chat.user.substring(0, 60))}${chat.user.length > 60 ? '...' : ''}</p>
        </div>
    `).join('');
}

function loadChat(index) {
    if (!currentUser) return;
    
    const history = JSON.parse(localStorage.getItem('chatHistory') || '{}');
    const userHistory = history[currentUser.email] || [];
    const chat = userHistory[index];
    
    if (!chat) return;
    
    const messagesContainer = document.getElementById('chat-messages');
    messagesContainer.innerHTML = `
        <div class="message user">
            <p>${escapeHtml(chat.user)}</p>
        </div>
        <div class="message bot">
            <p>${escapeHtml(chat.bot)}</p>
        </div>
    `;
    
    currentMode = chat.mode;
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === currentMode);
    });
}

// Payment & Support
function contactSupport() {
    const message = encodeURIComponent('Hello, I need help with my account or order. Please assist me.');
    window.open(`https://wa.me/${CONFIG.WHATSAPP.replace('+', '')}?text=${message}`, '_blank');
}

// Event Listeners
function setupEventListeners() {
    // Search and filter
    document.getElementById('service-search')?.addEventListener('input', filterServices);
    document.getElementById('category-filter')?.addEventListener('change', filterServices);
    document.getElementById('platform-filter')?.addEventListener('change', filterServices);
    
    // AI Assistant modes
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => switchMode(btn.dataset.mode));
    });
    
    // Chat input
    document.getElementById('chat-input')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
    
    // Modal close on outside click
    window.onclick = (event) => {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    };
    
    // View toggle
    document.getElementById('view-toggle')?.addEventListener('click', toggleView);
}

// Initialize app
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        loadServices();
        checkAuth();
    });
} else {
    loadServices();
    checkAuth();
}
