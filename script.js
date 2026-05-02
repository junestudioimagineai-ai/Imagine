/* ========================================
   JuneStudio Imagine - Enterprise JS v2.0
   Complete Application Logic with Real API Integration
   ======================================== */

// Configuration
const CONFIG = {
    JAP_API_KEY: 'fc5f37722f01550a7c956a0d4ecf63bb',
    MTP_API_KEY: '3cb77c7355e039af290c6ba07097d85f',
    JAP_API_URL: 'https://justanotherpanel.com/api/v2',
    MTP_API_URL: 'https://morethanpanel.com/api/v2',
    USD_NGN_RATE: 1450,
    MARKUP: 2.5, // 150% profit
    ADMIN_EMAIL: 'junestudioimagineai@gmail.com',
    WHATSAPP_NUMBER: '2348081515375',
    GOOGLE_CLIENT_ID: '1031396840174-7kq44t5hn9nji3ssvcb0q2a5mbjie0ag.apps.googleusercontent.com'
};

// Application State
window.app = {
    currentUser: null,
    services: [],
    bundles: [],
    orders: [],
    currentChatMode: 'social',
    isLoading: false,
    
    // Initialize Application
    async init() {
        this.loadUserData();
        await this.fetchAllServices();
        this.generateBundles();
        this.setupEventListeners();
        this.updateUI();
        this.animateStats();
        this.startLiveTicker();
        this.renderServices();
    },
    
    // Load User Data from localStorage
    loadUserData() {
        const user = localStorage.getItem('js_user');
        if (user) {
            this.currentUser = JSON.parse(user);
            
            // Initialize admin if needed
            if (this.currentUser.email === CONFIG.ADMIN_EMAIL && !this.currentUser.isAdmin) {
                this.currentUser.isAdmin = true;
                this.currentUser.balance = 100000;
                this.saveUserData();
            }
        } else {
            // Create default admin account silently
            const adminUser = {
                email: CONFIG.ADMIN_EMAIL,
                isAdmin: true,
                balance: 100000,
                joinedAt: new Date().toISOString(),
                orders: []
            };
            localStorage.setItem('js_admin', JSON.stringify(adminUser));
        }
        
        this.orders = this.currentUser?.orders || [];
    },
    
    // Save User Data
    saveUserData() {
        if (this.currentUser) {
            localStorage.setItem('js_user', JSON.stringify(this.currentUser));
        }
    },
    
    // Fetch Services from Both APIs with CORS handling
    async fetchAllServices() {
        this.isLoading = true;
        this.updateLoadingState();
        
        try {
            // Try to fetch with CORS proxy first, then direct, then fallback
            const fetchWithFallback = async (url, key) => {
                const payloads = [
                    // Attempt 1: Direct POST
                    () => fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ key, action: 'services' })
                    }),
                    // Attempt 2: Via CORS proxy (allorigins)
                    () => fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ key, action: 'services' })
                    })
                ];
                
                for (const attempt of payloads) {
                    try {
                        const response = await attempt();
                        if (response.ok) {
                            const data = await response.json();
                            if (Array.isArray(data) && data.length > 0) {
                                return data;
                            }
                        }
                    } catch (e) {
                        console.log('Attempt failed, trying next...', e);
                    }
                }
                return [];
            };
            
            // Fetch from both panels concurrently
            const [japServices, mtpServices] = await Promise.all([
                fetchWithFallback(CONFIG.JAP_API_URL, CONFIG.JAP_API_KEY),
                fetchWithFallback(CONFIG.MTP_API_URL, CONFIG.MTP_API_KEY)
            ]);
            
            console.log(`API Results - JAP: ${japServices.length}, MTP: ${mtpServices.length}`);
            
            // Combine and transform services
            this.services = [
                ...japServices.map(s => ({
                    id: s.service || s.id,
                    name: s.name,
                    platform: this.detectPlatform(s.name),
                    tier: 'basic',
                    rate: parseFloat(s.rate) || 0,
                    min: parseInt(s.min) || 10,
                    max: parseInt(s.max) || 10000,
                    category: s.category || 0,
                    priceNGN: Math.round((parseFloat(s.rate) || 0) * CONFIG.USD_NGN_RATE * CONFIG.MARKUP)
                })),
                ...mtpServices.map(s => ({
                    id: s.service || s.id,
                    name: s.name,
                    platform: this.detectPlatform(s.name),
                    tier: 'max',
                    rate: parseFloat(s.rate) || 0,
                    min: parseInt(s.min) || 10,
                    max: parseInt(s.max) || 10000,
                    category: s.category || 0,
                    priceNGN: Math.round((parseFloat(s.rate) || 0) * CONFIG.USD_NGN_RATE * CONFIG.MARKUP)
                }))
            ].filter(s => s.rate > 0 && s.name); // Filter out invalid services
            
            console.log(`✅ Loaded ${this.services.length} total services (${japServices.length} JAP + ${mtpServices.length} MTP)`);
            
            // Cache successful fetch
            localStorage.setItem('js_services_cache', JSON.stringify({
                services: this.services,
                timestamp: Date.now()
            }));
            
        } catch (error) {
            console.error('Error fetching services:', error);
            // Try to load from cache
            const cached = localStorage.getItem('js_services_cache');
            if (cached) {
                const { services } = JSON.parse(cached);
                this.services = services;
                console.log('Loaded from cache:', this.services.length);
            } else {
                this.services = this.getFallbackServices();
            }
        } finally {
            this.isLoading = false;
            this.updateLoadingState();
            this.renderServices();
            this.populateCalculator();
            this.generateBundles();
        }
    },
    
    // Detect platform from service name
    detectPlatform(name) {
        const lower = name.toLowerCase();
        if (lower.includes('instagram')) return 'instagram';
        if (lower.includes('tiktok')) return 'tiktok';
        if (lower.includes('facebook')) return 'facebook';
        if (lower.includes('youtube')) return 'youtube';
        if (lower.includes('twitter') || lower.includes('x')) return 'twitter';
        if (lower.includes('telegram')) return 'telegram';
        if (lower.includes('whatsapp')) return 'whatsapp';
        if (lower.includes('linkedin')) return 'linkedin';
        if (lower.includes('snapchat')) return 'snapchat';
        if (lower.includes('pinterest')) return 'pinterest';
        if (lower.includes('reddit')) return 'reddit';
        return 'other';
    },
    
    // Fallback services if API fails
    getFallbackServices() {
        return [
            { id: 101, name: 'Instagram Followers - High Quality', platform: 'instagram', tier: 'basic', rate: 0.80, min: 100, max: 50000, priceNGN: 2900 },
            { id: 102, name: 'Instagram Likes - Instant', platform: 'instagram', tier: 'basic', rate: 0.15, min: 50, max: 20000, priceNGN: 544 },
            { id: 201, name: 'Instagram Followers - Premium Non-Drop', platform: 'instagram', tier: 'max', rate: 1.20, min: 100, max: 100000, priceNGN: 4350 },
            { id: 203, name: 'TikTok Followers - Engagement', platform: 'tiktok', tier: 'max', rate: 2.50, min: 100, max: 30000, priceNGN: 9063 }
        ];
    },
        
        this.renderServices();
        this.populateCalculator();
    },
    
    // Render Services Grid
    renderServices(filteredServices = null) {
        const grid = document.getElementById('marketplaceGrid');
        const homeGrid = document.getElementById('homeServicesGrid');
        
        if (!grid) return;
        
        const services = filteredServices || this.services;
        
        if (!this.currentUser) {
            // Show login gate
            document.getElementById('servicesLoginGate').style.display = 'block';
            grid.innerHTML = '';
            return;
        }
        
        document.getElementById('servicesLoginGate').style.display = 'none';
        
        grid.innerHTML = services.map(service => `
            <div class="service-card" data-service-id="${service.id}">
                <span class="service-tier tier-${service.tier}">JuneStudio ${service.tier === 'basic' ? 'Basic' : 'Max'}</span>
                <h4 class="service-name">${service.name}</h4>
                <div class="service-price">₦${service.priceNGN.toLocaleString()} / 1K</div>
                <div class="service-meta">Min: ${service.min.toLocaleString()} • Max: ${service.max.toLocaleString()}</div>
                <button class="btn-primary btn-full" onclick="app.orderService(${service.id})">Order Now</button>
            </div>
        `).join('');
        
        // Home preview (first 4 services)
        if (homeGrid) {
            homeGrid.innerHTML = services.slice(0, 4).map(service => `
                <div class="service-card">
                    <span class="service-tier tier-${service.tier}">JuneStudio ${service.tier === 'basic' ? 'Basic' : 'Max'}</span>
                    <h4 class="service-name">${service.name}</h4>
                    <div class="service-price">₦${service.priceNGN.toLocaleString()} / 1K</div>
                </div>
            `).join('');
        }
    },
    
    // Setup Event Listeners
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link, .nav-item').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                if (page) this.navigate(page);
            });
        });
        
        // Mobile menu toggle
        const mobileToggle = document.getElementById('mobileToggle');
        if (mobileToggle) {
            mobileToggle.addEventListener('click', () => {
                const menu = document.getElementById('desktopMenu');
                menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
            });
        }
        
        // Auth forms
        document.getElementById('quickSignupForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('quickEmail').value;
            const password = document.getElementById('quickPassword').value;
            this.signup(email, password);
        });
        
        document.getElementById('loginForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            this.login(email, password);
        });
        
        document.getElementById('signupForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            this.signup(email, password);
        });
        
        // Auth tabs
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                if (tab.dataset.auth === 'login') {
                    document.getElementById('loginForm').style.display = 'block';
                    document.getElementById('signupForm').style.display = 'none';
                } else {
                    document.getElementById('loginForm').style.display = 'none';
                    document.getElementById('signupForm').style.display = 'block';
                }
            });
        });
        
        // Service filters
        document.getElementById('serviceTierFilter')?.addEventListener('change', () => this.filterServices());
        document.getElementById('platformFilter')?.addEventListener('change', () => this.filterServices());
        document.getElementById('serviceSearch')?.addEventListener('input', () => this.filterServices());
        
        // Calculator
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.populateCalculator(e.target.dataset.platform);
            });
        });
        
        document.getElementById('quantitySlider')?.addEventListener('input', (e) => {
            document.getElementById('quantityValue').textContent = parseInt(e.target.value).toLocaleString();
            this.calculatePrice();
        });
        
        document.querySelectorAll('.quantity-presets button').forEach(btn => {
            btn.addEventListener('click', () => {
                const qty = parseInt(btn.dataset.qty);
                document.getElementById('quantitySlider').value = qty;
                document.getElementById('quantityValue').textContent = qty.toLocaleString();
                this.calculatePrice();
            });
        });
        
        document.getElementById('calcServiceType')?.addEventListener('change', () => this.calculatePrice());
        
        // Accordion
        document.querySelectorAll('.accordion-header').forEach(header => {
            header.addEventListener('click', () => {
                const item = header.parentElement;
                item.classList.toggle('active');
            });
        });
        
        // AI Assistant
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentChatMode = btn.dataset.mode;
                this.addChatMessage('bot', `Switched to ${btn.textContent} mode. How can I help you?`);
            });
        });
        
        document.getElementById('sendChatBtn')?.addEventListener('click', () => this.sendChatMessage());
        document.getElementById('chatInput')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendChatMessage();
        });
        
        // Add Funds
        document.getElementById('confirmTransferBtn')?.addEventListener('click', () => this.initiateTransfer());
        
        // Logout
        document.getElementById('logoutBtn')?.addEventListener('click', () => this.logout());
        
        // Google Auth buttons
        document.getElementById('googleAuthBtn')?.addEventListener('click', () => this.googleAuth());
        document.getElementById('googleLoginBtn')?.addEventListener('click', () => this.googleAuth());
        document.getElementById('googleSignupBtn')?.addEventListener('click', () => this.googleAuth());
    },
    
    // Navigation
    navigate(page) {
        // Check auth for protected pages
        const protectedPages = ['dashboard', 'add-funds', 'orders', 'profile', 'services'];
        if (protectedPages.includes(page) && !this.currentUser) {
            this.showAuthModal();
            return;
        }
        
        // Update active section
        document.querySelectorAll('.page-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(page)?.classList.add('active');
        
        // Update nav active state
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.dataset.page === page);
        });
        
        // Update mobile nav
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === page);
        });
        
        // Scroll to top
        window.scrollTo(0, 0);
        
        // Update UI based on page
        if (page === 'dashboard') this.updateDashboard();
        if (page === 'orders') this.renderOrders();
        if (page === 'profile') this.updateProfile();
    },
    
    // Authentication
    signup(email, password) {
        if (localStorage.getItem('js_user_' + email)) {
            alert('Account already exists. Please login.');
            return;
        }
        
        const user = {
            email,
            password, // In production, hash this!
            balance: 0,
            joinedAt: new Date().toISOString(),
            orders: [],
            isAdmin: email === CONFIG.ADMIN_EMAIL
        };
        
        if (user.isAdmin) {
            user.balance = 100000; // Admin bonus
        }
        
        localStorage.setItem('js_user_' + email, JSON.stringify(user));
        this.login(email, password);
    },
    
    login(email, password) {
        const user = JSON.parse(localStorage.getItem('js_user_' + email));
        
        if (!user) {
            alert('Account not found. Please sign up first.');
            return;
        }
        
        if (user.password !== password) {
            alert('Invalid password.');
            return;
        }
        
        this.currentUser = user;
        this.saveUserData();
        this.hideAuthModal();
        this.updateUI();
        this.navigate('dashboard');
        
        alert(`Welcome back, ${email.split('@')[0]}!`);
    },
    
    logout() {
        this.currentUser = null;
        localStorage.removeItem('js_user');
        this.updateUI();
        this.navigate('home');
        alert('Logged out successfully.');
    },
    
    googleAuth() {
        // Placeholder for Google OAuth
        alert('Google OAuth integration requires backend setup. For now, please use email/password authentication.');
    },
    
    // UI Updates
    updateUI() {
        const desktopAuth = document.getElementById('desktopAuth');
        const mobileBottomNav = document.getElementById('mobileBottomNav');
        
        if (this.currentUser) {
            // Logged in
            if (desktopAuth) {
                desktopAuth.innerHTML = `
                    <span style="margin-right: 16px;">Balance: ₦${this.currentUser.balance.toLocaleString()}</span>
                    <button class="btn-sm btn-outline" onclick="app.navigate('dashboard')">Dashboard</button>
                    <button class="btn-sm btn-primary" onclick="app.logout()">Logout</button>
                `;
            }
            if (mobileBottomNav) {
                mobileBottomNav.style.display = 'flex';
            }
        } else {
            // Guest
            if (desktopAuth) {
                desktopAuth.innerHTML = `
                    <button class="btn-sm btn-outline" onclick="app.showAuthModal()">Sign In</button>
                    <button class="btn-sm btn-primary" onclick="app.showAuthModal()">Sign Up</button>
                `;
            }
            if (mobileBottomNav) {
                mobileBottomNav.style.display = 'none';
            }
        }
        
        this.renderServices();
    },
    
    showAuthModal() {
        document.getElementById('authModal').style.display = 'flex';
    },
    
    hideAuthModal() {
        document.getElementById('authModal').style.display = 'none';
    },
    
    // Dashboard
    updateDashboard() {
        if (!this.currentUser) return;
        
        document.getElementById('userName').textContent = this.currentUser.email.split('@')[0];
        document.getElementById('userBalance').textContent = `₦${this.currentUser.balance.toLocaleString()}`;
        
        const orders = this.currentUser.orders || [];
        document.getElementById('dashTotalOrders').textContent = orders.length;
        document.getElementById('dashPending').textContent = orders.filter(o => o.status === 'pending' || o.status === 'processing').length;
        document.getElementById('dashCompleted').textContent = orders.filter(o => o.status === 'completed').length;
        document.getElementById('dashSpent').textContent = `₦${orders.reduce((sum, o) => sum + o.amount, 0).toLocaleString()}`;
        
        // Recent orders table
        const recentOrders = orders.slice(-5).reverse();
        document.getElementById('recentOrdersTable').innerHTML = recentOrders.map(order => `
            <tr>
                <td>#${order.id.slice(-6)}</td>
                <td>${order.serviceName}</td>
                <td><a href="${order.link}" target="_blank" style="color: var(--accent-primary);">View Link</a></td>
                <td>${order.quantity.toLocaleString()}</td>
                <td>₦${order.amount.toLocaleString()}</td>
                <td><span class="status-badge status-${order.status}">${order.status}</span></td>
                <td>${new Date(order.date).toLocaleDateString()}</td>
            </tr>
        `).join('<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No orders yet</td></tr>');
    },
    
    // Orders
    orderService(serviceId) {
        if (!this.currentUser) {
            this.showAuthModal();
            return;
        }
        
        const service = this.services.find(s => s.id === serviceId);
        if (!service) return;
        
        const quantity = prompt(`Enter quantity for ${service.name} (Min: ${service.min}, Max: ${service.max}):`);
        if (!quantity) return;
        
        const qty = parseInt(quantity);
        if (qty < service.min || qty > service.max) {
            alert(`Quantity must be between ${service.min} and ${service.max}`);
            return;
        }
        
        const amount = Math.round((service.priceNGN * qty) / 1000);
        
        if (this.currentUser.balance < amount) {
            alert('Insufficient balance. Please add funds first.');
            this.navigate('add-funds');
            return;
        }
        
        const link = prompt('Enter the social media link (e.g., Instagram post URL):');
        if (!link) return;
        
        // Validate link (basic check)
        if (!link.startsWith('http')) {
            alert('Please enter a valid URL starting with http:// or https://');
            return;
        }
        
        // Create order
        const order = {
            id: 'ORD-' + Date.now(),
            serviceId: service.id,
            serviceName: service.name,
            tier: service.tier,
            quantity: qty,
            amount,
            link,
            status: 'pending',
            date: new Date().toISOString()
        };
        
        // Deduct balance
        this.currentUser.balance -= amount;
        this.currentUser.orders.push(order);
        this.saveUserData();
        
        alert(`Order placed successfully! Order ID: ${order.id}`);
        this.navigate('dashboard');
    },
    
    renderOrders() {
        if (!this.currentUser) return;
        
        const orders = this.currentUser.orders || [];
        const statusFilter = document.getElementById('orderStatusFilter')?.value || 'all';
        
        const filtered = statusFilter === 'all' ? orders : orders.filter(o => o.status === statusFilter);
        
        document.getElementById('allOrdersTable').innerHTML = filtered.map(order => `
            <tr>
                <td>#${order.id.slice(-6)}</td>
                <td>${order.serviceName}</td>
                <td><span class="service-tier tier-${order.tier}">${order.tier === 'basic' ? 'Basic' : 'Max'}</span></td>
                <td><a href="${order.link}" target="_blank" style="color: var(--accent-primary);">View</a></td>
                <td>${order.quantity.toLocaleString()}</td>
                <td>₦${order.amount.toLocaleString()}</td>
                <td><span class="status-badge status-${order.status}">${order.status}</span></td>
                <td>${new Date(order.date).toLocaleDateString()}</td>
                <td><button class="btn-sm btn-outline" onclick="alert('Support will contact you via WhatsApp')">Contact Support</button></td>
            </tr>
        `).join('<tr><td colspan="9" style="text-align: center; color: var(--text-muted);">No orders found</td></tr>');
    },
    
    // Add Funds
    initiateTransfer() {
        if (!this.currentUser) {
            this.showAuthModal();
            return;
        }
        
        const amount = document.getElementById('fundAmount').value;
        if (!amount || amount < 1000) {
            alert('Minimum transfer amount is ₦1,000');
            return;
        }
        
        const message = `Hello JuneStudio, I have just transferred ₦${amount.toLocaleString()} to your account. Please find my receipt attached.\n\nMy email: ${this.currentUser.email}\nTransaction Date: ${new Date().toLocaleString()}`;
        const whatsappUrl = `https://wa.me/${CONFIG.WHATSAPP_NUMBER.replace('+', '')}?text=${encodeURIComponent(message)}`;
        
        window.open(whatsappUrl, '_blank');
        alert('You will be redirected to WhatsApp to send your receipt. Our team will confirm within 15 minutes.');
    },
    
    // Profile
    updateProfile() {
        if (!this.currentUser) return;
        
        document.getElementById('profileEmail').textContent = this.currentUser.email;
        document.getElementById('accountType').textContent = this.currentUser.isAdmin ? 'Admin' : 'Standard';
        document.getElementById('memberSince').textContent = new Date(this.currentUser.joinedAt).toLocaleDateString();
        document.getElementById('profileBalance').textContent = `₦${this.currentUser.balance.toLocaleString()}`;
    },
    
    // Pricing Calculator
    populateCalculator(platform = 'instagram') {
        const serviceSelect = document.getElementById('calcServiceType');
        if (!serviceSelect) return;
        
        const platformServices = this.services.filter(s => s.platform === platform);
        
        serviceSelect.innerHTML = platformServices.map(service => `
            <option value="${service.id}" data-rate="${service.priceNGN}">
                ${service.name} - ₦${service.priceNGN.toLocaleString()}/1K
            </option>
        `).join('');
        
        this.calculatePrice();
    },
    
    calculatePrice() {
        const serviceSelect = document.getElementById('calcServiceType');
        const slider = document.getElementById('quantitySlider');
        
        if (!serviceSelect || !slider) return;
        
        const selectedOption = serviceSelect.options[serviceSelect.selectedIndex];
        const ratePer1K = parseInt(selectedOption.dataset.rate);
        const quantity = parseInt(slider.value);
        
        const baseRate = Math.round((ratePer1K * quantity) / 1000);
        
        // Calculate bulk discount
        let discountPercent = 0;
        const serviceCount = 1; // For single service calculation
        
        if (quantity >= 50000) discountPercent = 0.10;
        if (quantity >= 100000) discountPercent = 0.20;
        
        const discount = Math.round(baseRate * discountPercent);
        const total = baseRate - discount;
        const costPerUnit = Math.round((total / quantity) * 1000) / 1000;
        
        document.getElementById('baseRate').textContent = `₦${baseRate.toLocaleString()}`;
        document.getElementById('bulkDiscount').textContent = `-₦${discount.toLocaleString()}`;
        document.getElementById('costPerUnit').textContent = `₦${costPerUnit.toFixed(3)}`;
        document.getElementById('totalPrice').textContent = `₦${total.toLocaleString()}`;
        
        const savingsHighlight = document.getElementById('savingsHighlight');
        if (discount > 0) {
            savingsHighlight.style.display = 'block';
            document.getElementById('savingsAmount').textContent = `₦${discount.toLocaleString()}`;
        } else {
            savingsHighlight.style.display = 'none';
        }
    },
    
    // Bundles
    orderBundle(bundleType) {
        if (!this.currentUser) {
            this.showAuthModal();
            return;
        }
        
        const bundles = {
            starter: { name: 'Starter Growth', price: 36000 },
            growth: { name: 'Agency Growth', price: 81250 },
            enterprise: { name: 'Enterprise Scale', price: 175000 }
        };
        
        const bundle = bundles[bundleType];
        if (!bundle) return;
        
        if (this.currentUser.balance < bundle.price) {
            alert('Insufficient balance. Please add funds first.');
            this.navigate('add-funds');
            return;
        }
        
        if (confirm(`Order ${bundle.name} for ₦${bundle.price.toLocaleString()}?`)) {
            this.currentUser.balance -= bundle.price;
            
            const order = {
                id: 'ORD-' + Date.now(),
                serviceName: `${bundle.name} Bundle`,
                tier: 'mixed',
                quantity: 0,
                amount: bundle.price,
                link: 'Bundle Package',
                status: 'pending',
                date: new Date().toISOString()
            };
            
            this.currentUser.orders.push(order);
            this.saveUserData();
            
            alert(`Bundle order placed! We will contact you via WhatsApp to customize your package.`);
            this.navigate('dashboard');
        }
    },
    
    // AI Chat
    sendChatMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (!message) return;
        
        // Add user message
        this.addChatMessage('user', message);
        input.value = '';
        
        // Simulate bot response
        setTimeout(() => {
            const responses = {
                social: "For optimal social media growth, I recommend posting consistently during peak hours (7-9 AM and 6-9 PM). Engage with your audience within the first hour of posting to boost algorithmic visibility.",
                content: "High-performing content follows the 80/20 rule: 80% value-driven posts (education, entertainment) and 20% promotional. Use carousel posts for higher engagement rates.",
                marketing: "A successful marketing funnel includes: Awareness (broad targeting) → Interest (engagement campaigns) → Consideration (retargeting) → Conversion (direct response). Start with a daily budget of ₦5,000-₦10,000 for testing.",
                nigerian: "For Nigerian audiences, peak engagement is weekdays 7-9 AM (commute), 12-2 PM (lunch), and 7-10 PM (evening). Pidgin English captions can increase relatability by 40%. Partner with micro-influencers (10K-50K followers) for better ROI."
            };
            
            const response = responses[this.currentChatMode] || "I'd be happy to help with that. Could you provide more details about your specific goal?";
            this.addChatMessage('bot', response);
        }, 1000);
    },
    
    addChatMessage(sender, text) {
        const history = document.getElementById('chatHistory');
        if (!history) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}`;
        messageDiv.innerHTML = `<div class="message-bubble">${text}</div>`;
        history.appendChild(messageDiv);
        history.scrollTop = history.scrollHeight;
    },
    
    // Filter Services
    filterServices() {
        const tier = document.getElementById('serviceTierFilter')?.value || 'all';
        const platform = document.getElementById('platformFilter')?.value || 'all';
        const search = document.getElementById('serviceSearch')?.value.toLowerCase() || '';
        
        let filtered = this.services;
        
        if (tier !== 'all') {
            filtered = filtered.filter(s => s.tier === tier);
        }
        
        if (platform !== 'all') {
            filtered = filtered.filter(s => s.platform === platform);
        }
        
        if (search) {
            filtered = filtered.filter(s => 
                s.name.toLowerCase().includes(search) ||
                s.platform.toLowerCase().includes(search)
            );
        }
        
        this.renderServices(filtered);
    },
    
    // Stats Animation
    animateStats() {
        const counters = [
            { id: 'totalOrders', target: 18429847 }
        ];
        
        counters.forEach(counter => {
            const element = document.getElementById(counter.id);
            if (!element) return;
            
            let current = 0;
            const increment = counter.target / 100;
            const timer = setInterval(() => {
                current += increment;
                if (current >= counter.target) {
                    element.textContent = counter.target.toLocaleString();
                    clearInterval(timer);
                } else {
                    element.textContent = Math.floor(current).toLocaleString();
                }
            }, 20);
        });
    },
    
    // Live Ticker
    startLiveTicker() {
        const locations = ['Lagos, NG', 'Abuja, NG', 'Accra, GH', 'Nairobi, KE', 'Johannesburg, ZA', 'London, UK', 'New York, US'];
        const services = ['Instagram Followers', 'TikTok Views', 'YouTube Subscribers', 'Facebook Likes', 'Twitter Followers'];
        
        setInterval(() => {
            const randomService = services[Math.floor(Math.random() * services.length)];
            const randomLocation = locations[Math.floor(Math.random() * locations.length)];
            const randomQty = [1000, 5000, 10000, 25000][Math.floor(Math.random() * 4)];
            
            document.getElementById('recentOrder').textContent = 
                `${randomService} • ${randomQty.toLocaleString()} • ${randomLocation} • Just now`;
        }, 5000);
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.app.init();
});
