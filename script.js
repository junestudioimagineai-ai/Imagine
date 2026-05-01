// Imagine SMM Marketplace - Full Application Logic

// Configuration
const CONFIG = {
    JAP_API_KEY: 'fc5f37722f01550a7c956a0d4ecf63bb',
    JAP_API_URL: 'https://justanotherpanel.com/api/v2',
    WHATSAPP_NUMBER: '+2348081515375',
    ADMIN_EMAIL: 'junestudioimagineai@gmail.com',
    OPAY_ACCOUNT: '8081515375',
    PALMPAY_ACCOUNT: '8081515375',
    BANK_ACCOUNT: '3084635140',
    BANK_NAME: 'Firstbank',
    ACCOUNT_NAME: 'Sulaiman Sheriff-Akorede',
    PROFIT_MARGIN: 1.5 // 150% markup
};

// State Management
let currentUser = null;
let selectedServices = [];
let chatHistory = [];

// Sample Services Database (with 150% markup applied)
const services = [
    { id: 1, name: 'Instagram Followers', category: 'instagram', basePrice: 500, price: 750, per: 1000 },
    { id: 2, name: 'Instagram Likes', category: 'instagram', basePrice: 300, price: 450, per: 1000 },
    { id: 3, name: 'Instagram Views', category: 'instagram', basePrice: 100, price: 150, per: 1000 },
    { id: 4, name: 'Facebook Likes', category: 'facebook', basePrice: 400, price: 600, per: 1000 },
    { id: 5, name: 'Facebook Followers', category: 'facebook', basePrice: 600, price: 900, per: 1000 },
    { id: 6, name: 'Twitter Followers', category: 'twitter', basePrice: 700, price: 1050, per: 1000 },
    { id: 7, name: 'Twitter Retweets', category: 'twitter', basePrice: 500, price: 750, per: 1000 },
    { id: 8, name: 'TikTok Views', category: 'tiktok', basePrice: 200, price: 300, per: 1000 },
    { id: 9, name: 'TikTok Followers', category: 'tiktok', basePrice: 800, price: 1200, per: 1000 },
    { id: 10, name: 'YouTube Subscribers', category: 'youtube', basePrice: 1500, price: 2250, per: 1000 },
    { id: 11, name: 'YouTube Views', category: 'youtube', basePrice: 1000, price: 1500, per: 1000 },
    { id: 12, name: 'LinkedIn Connections', category: 'linkedin', basePrice: 2000, price: 3000, per: 1000 }
];

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    renderServices('all');
    renderBundleBuilder();
});

// Authentication Functions
function checkAuth() {
    const user = localStorage.getItem('imagine_user');
    if (user) {
        currentUser = JSON.parse(user);
        updateUIForLoggedInUser();
    }
}

function handleEmailLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Check if admin
    if (email === CONFIG.ADMIN_EMAIL) {
        currentUser = { email, name: 'Admin', isAdmin: true, balance: 0 };
        localStorage.setItem('imagine_user', JSON.stringify(currentUser));
        window.location.href = 'admin.html';
        return;
    }
    
    // Regular user login (simplified - in production use backend)
    const users = JSON.parse(localStorage.getItem('imagine_users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('imagine_user', JSON.stringify(user));
        updateUIForLoggedInUser();
        closeLoginModal();
        showNotification('Welcome back!', 'success');
    } else {
        showNotification('Invalid credentials', 'error');
    }
}

function handleEmailSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    
    const users = JSON.parse(localStorage.getItem('imagine_users') || '[]');
    
    if (users.find(u => u.email === email)) {
        showNotification('Email already registered', 'error');
        return;
    }
    
    const newUser = {
        name,
        email,
        password,
        balance: 0,
        isAdmin: false,
        joinedAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('imagine_users', JSON.stringify(users));
    
    currentUser = newUser;
    localStorage.setItem('imagine_user', JSON.stringify(newUser));
    updateUIForLoggedInUser();
    closeSignupModal();
    showNotification('Account created successfully!', 'success');
}

function handleGoogleSignIn(response) {
    // Decode JWT and create user
    const userInfo = jwt_decode(response.credential);
    
    const users = JSON.parse(localStorage.getItem('imagine_users') || '[]');
    let user = users.find(u => u.email === userInfo.email);
    
    if (!user) {
        user = {
            name: userInfo.name,
            email: userInfo.email,
            picture: userInfo.picture,
            balance: 0,
            isAdmin: userInfo.email === CONFIG.ADMIN_EMAIL,
            googleId: userInfo.sub
        };
        users.push(user);
        localStorage.setItem('imagine_users', JSON.stringify(users));
    }
    
    currentUser = user;
    localStorage.setItem('imagine_user', JSON.stringify(user));
    
    if (user.isAdmin) {
        window.location.href = 'admin.html';
    } else {
        updateUIForLoggedInUser();
        closeLoginModal();
        closeSignupModal();
        showNotification(`Welcome, ${user.name}!`, 'success');
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('imagine_user');
    location.reload();
}

function updateUIForLoggedInUser() {
    document.getElementById('navLoginBtn').classList.add('hidden');
    document.getElementById('navSignupBtn').classList.add('hidden');
    document.getElementById('navLogoutBtn').classList.remove('hidden');
    document.getElementById('mobileLoginBtn').classList.add('hidden');
    document.getElementById('mobileSignupBtn').classList.add('hidden');
    document.getElementById('mobileLogoutBtn').classList.remove('hidden');
    document.getElementById('navUserBalance').classList.remove('hidden');
    document.getElementById('navUserBalance').textContent = `₦${(currentUser.balance || 0).toLocaleString()}`;
    
    // Show chat history tab
    document.getElementById('chatHistoryTab').classList.remove('hidden');
    loadChatHistory();
}

// Services Functions
function renderServices(category) {
    const grid = document.getElementById('servicesGrid');
    let filtered = category === 'all' ? services : services.filter(s => s.category === category);
    
    // Sort by price (cheapest first)
    filtered.sort((a, b) => a.price - b.price);
    
    grid.innerHTML = filtered.map(service => `
        <div class="glass-card service-card rounded-2xl p-6 border border-white/10 hover:border-indigo-500/50 transition-all cursor-pointer" onclick="handleServiceClick(${service.id})">
            <div class="flex justify-between items-start mb-4">
                <div class="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                    </svg>
                </div>
                <span class="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full">Available</span>
            </div>
            <h3 class="font-semibold text-lg mb-2">${service.name}</h3>
            <p class="text-slate-400 text-sm mb-4">Per ${service.per.toLocaleString()} units</p>
            <div class="flex justify-between items-center">
                <div>
                    <span class="text-2xl font-bold text-indigo-400">₦${service.price.toLocaleString()}</span>
                </div>
                <button class="bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 rounded-full text-sm font-semibold hover:shadow-lg hover:shadow-indigo-500/30 transition-all">
                    Order Now
                </button>
            </div>
        </div>
    `).join('');
}

function filterServices(category) {
    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    renderServices(category);
}

function handleServiceClick(serviceId) {
    if (!currentUser) {
        document.getElementById('loginPrompt').classList.remove('hidden');
        return;
    }
    
    const service = services.find(s => s.id === serviceId);
    // Open order modal (simplified)
    showNotification(`Ordering ${service.name}. Contact WhatsApp for payment.`, 'info');
    window.open(`https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=I want to order: ${service.name}`, '_blank');
}

function closeLoginPrompt() {
    document.getElementById('loginPrompt').classList.add('hidden');
}

// Bundle Functions
function addToBundle(type) {
    const bundles = {
        starter: [1, 4, 6],
        growth: [1, 1, 1, 1, 10],
        enterprise: [1, 4, 6, 8, 10, 12, 12]
    };
    
    selectedServices = [...new Set([...selectedServices, ...bundles[type]])];
    updateBundleUI();
    showNotification('Bundle added to cart!', 'success');
}

function renderBundleBuilder() {
    const container = document.getElementById('bundleBuilder');
    container.innerHTML = services.slice(0, 8).map(service => `
        <div class="glass-card p-4 rounded-xl border border-white/10 hover:border-indigo-500/50 transition-all cursor-pointer" onclick="toggleBundleService(${service.id})">
            <div class="flex justify-between items-center">
                <div>
                    <h4 class="font-semibold text-sm">${service.name}</h4>
                    <p class="text-xs text-slate-400">₦${service.price.toLocaleString()}</p>
                </div>
                <input type="checkbox" class="w-5 h-5 rounded" data-service-id="${service.id}">
            </div>
        </div>
    `).join('');
}

function toggleBundleService(serviceId) {
    const index = selectedServices.indexOf(serviceId);
    if (index > -1) {
        selectedServices.splice(index, 1);
    } else {
        selectedServices.push(serviceId);
    }
    updateBundleUI();
}

function updateBundleUI() {
    document.getElementById('selectedCount').textContent = selectedServices.length;
    
    let discount = 0;
    if (selectedServices.length >= 7) discount = 50;
    else if (selectedServices.length >= 5) discount = 35;
    else if (selectedServices.length >= 3) discount = 20;
    
    document.getElementById('bundleDiscount').textContent = `${discount}%`;
    
    // Update checkboxes
    document.querySelectorAll('#bundleBuilder input[type="checkbox"]').forEach(cb => {
        cb.checked = selectedServices.includes(parseInt(cb.dataset.serviceId));
    });
}

function checkoutBundle() {
    if (selectedServices.length === 0) {
        showNotification('Select at least one service', 'error');
        return;
    }
    
    if (!currentUser) {
        openLoginModal();
        return;
    }
    
    let total = selectedServices.reduce((sum, id) => {
        const service = services.find(s => s.id === id);
        return sum + service.price;
    }, 0);
    
    let discount = 0;
    if (selectedServices.length >= 7) discount = 50;
    else if (selectedServices.length >= 5) discount = 35;
    else if (selectedServices.length >= 3) discount = 20;
    
    const finalPrice = total * (1 - discount / 100);
    
    showNotification(`Bundle Total: ₦${finalPrice.toLocaleString()} (${discount}% off). Contact WhatsApp to complete order.`, 'success');
    window.open(`https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=I want to order a custom bundle with ${selectedServices.length} services. Total: ₦${finalPrice.toLocaleString()}`, '_blank');
}

// AI Assistant Functions
function changeAIMode() {
    const mode = document.getElementById('aiMode').value;
    const messages = {
        social: "I'm your Social Media Expert! Ask me about engagement strategies, posting schedules, or platform-specific tips.",
        content: "I'm your Content Design Pro! Need help with visuals, captions, or content planning?",
        marketing: "I'm your Marketing Strategy advisor! Let's discuss campaigns, ROI, or growth hacking.",
        nigerian: "I'm your Nigerian Content Expert! Ask me about local trends, Pidgin English captions, or cultural insights."
    };
    
    addChatMessage('AI', messages[mode]);
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    addChatMessage('You', message);
    input.value = '';
    
    // Simulate AI response
    setTimeout(() => {
        const mode = document.getElementById('aiMode').value;
        const responses = {
            social: "Great question! For better engagement, post when your audience is most active. In Nigeria, that's typically 7-9 AM and 7-10 PM. Use trending hashtags and engage with comments within the first hour.",
            content: "For compelling content, follow the 80/20 rule: 80% value-driven posts, 20% promotional. Use high-quality visuals and write captions that tell a story.",
            marketing: "A solid marketing strategy starts with knowing your audience. Define your USP, set clear KPIs, and always A/B test your campaigns.",
            nigerian: "Na wa o! For Nigerian audience, use relatable content, mix English with Pidgin sometimes, and leverage trending topics like #BBNaija or local events."
        };
        
        addChatMessage('AI', responses[mode]);
        
        // Save to history if logged in
        if (currentUser) {
            saveChatToHistory(message, responses[mode]);
        }
    }, 1000);
}

function addChatMessage(sender, message) {
    const history = document.getElementById('chatHistory');
    const isAI = sender === 'AI';
    
    history.innerHTML += `
        <div class="flex gap-3 chat-message ${isAI ? '' : 'flex-row-reverse'}">
            <div class="w-8 h-8 ${isAI ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-gradient-to-br from-green-500 to-emerald-600'} rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold">${isAI ? 'AI' : 'U'}</div>
            <div class="glass-card px-4 py-3 rounded-2xl ${isAI ? 'rounded-tl-none' : 'rounded-tr-none'} max-w-[80%]">
                <p class="text-sm">${message}</p>
            </div>
        </div>
    `;
    
    history.scrollTop = history.scrollHeight;
}

function saveChatToHistory(userMsg, aiMsg) {
    const history = JSON.parse(localStorage.getItem('imagine_chat_history') || '[]');
    history.push({
        userId: currentUser.email,
        timestamp: new Date().toISOString(),
        userMessage: userMsg,
        aiResponse: aiMsg,
        mode: document.getElementById('aiMode').value
    });
    localStorage.setItem('imagine_chat_history', JSON.stringify(history));
    loadChatHistory();
}

function loadChatHistory() {
    const history = JSON.parse(localStorage.getItem('imagine_chat_history') || '[]');
    const userHistory = history.filter(h => h.userId === currentUser.email).slice(-5);
    
    const container = document.getElementById('userChatHistory');
    container.innerHTML = userHistory.map(h => `
        <div class="glass-card p-3 rounded-lg text-sm">
            <p class="text-slate-300 truncate">${h.userMessage}</p>
            <p class="text-xs text-slate-500 mt-1">${new Date(h.timestamp).toLocaleDateString()}</p>
        </div>
    `).join('') || '<p class="text-sm text-slate-400">No chat history yet</p>';
}

// UI Helper Functions
function openLoginModal() {
    document.getElementById('loginModal').classList.remove('hidden');
}

function closeLoginModal() {
    document.getElementById('loginModal').classList.add('hidden');
}

function openSignupModal() {
    document.getElementById('signupModal').classList.remove('hidden');
}

function closeSignupModal() {
    document.getElementById('signupModal').classList.add('hidden');
}

function switchToSignup() {
    closeLoginModal();
    openSignupModal();
}

function switchToLogin() {
    closeSignupModal();
    openLoginModal();
}

function toggleMobileMenu() {
    document.getElementById('mobileMenu').classList.toggle('hidden');
}

function scrollToSection(id) {
    document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
}

function showNotification(message, type = 'info') {
    // Simple notification (in production use a proper toast library)
    alert(`${type.toUpperCase()}: ${message}`);
}

// JWT Decode helper (for Google Sign-In)
function jwt_decode(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    return JSON.parse(jsonPayload);
}
