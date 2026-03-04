// script.js

// Configuration - All YouTube IDs locked in
const CONFIG = {
    whatsapp: {
        ceo: '2348081515375',
        agent: '2348101365054'
    },
    youtube: {
        // Hero Background Short (Soundless, Looping)
        heroVideoId: 'vGJOWqcgbmI',
        // 5 SaaSul Project Videos (Embedded)
        projectVideos: [
            'YHCvequl3X8',
            'AdWD68lYpCo',
            'XplrR8k17LA',
            'XXRJqpJtTs8',
            '1LMeYm5yTUw'
        ]
    },
    images: {
        logo: 'https://raw.githubusercontent.com/junestudios/assets/main/logo.png',
        founder: 'https://raw.githubusercontent.com/junestudios/assets/main/founder-sulaiman.jpg',
        showcases: [
            'https://raw.githubusercontent.com/junestudios/assets/main/saasul-showcase-1.jpg',
            'https://raw.githubusercontent.com/junestudios/assets/main/saasul-showcase-2.jpg',
            'https://raw.githubusercontent.com/junestudios/assets/main/saasul-showcase-3.jpg',
            'https://raw.githubusercontent.com/junestudios/assets/main/saasul-showcase-4.jpg',
            'https://raw.githubusercontent.com/junestudios/assets/main/saasul-showcase-5.jpg'
        ]
    }
};

// YouTube Player API for Hero Background
let heroPlayer;

function loadYouTubeAPI() {
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

function onYouTubeIframeAPIReady() {
    heroPlayer = new YT.Player('hero-youtube-player', {
        videoId: CONFIG.youtube.heroVideoId,
        playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            iv_load_policy: 3,
            loop: 1,
            modestbranding: 1,
            mute: 1,
            playsinline: 1,
            rel: 0,
            showinfo: 0,
            start: 0,
            playlist: CONFIG.youtube.heroVideoId // Required for looping
        },
        events: {
            onReady: onHeroPlayerReady,
            onStateChange: onHeroPlayerStateChange
        }
    });
}

function onHeroPlayerReady(event) {
    event.target.playVideo();
    event.target.mute();
}

function onHeroPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        heroPlayer.playVideo();
    }
}

// Initialize GSAP
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    gsap.from(".hero-content > *", {
        y: 30,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.2
    });

    gsap.utils.toArray('.animate-up').forEach((element, i) => {
        gsap.from(element, {
            scrollTrigger: {
                trigger: element,
                start: "top 85%",
                toggleActions: "play none none reverse",
                once: true
            },
            y: 50,
            opacity: 0,
            duration: 0.8,
            ease: "power2.out",
            delay: i * 0.05
        });
    });

    ScrollTrigger.create({
        start: "top -100",
        end: 99999,
        toggleClass: { className: "scrolled", targets: "#navbar" }
    });
} else {
    document.querySelectorAll('.animate-up').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
    });
}

// Mobile Menu
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
        mobileMenu.classList.toggle('active');
    });
}

// Legal Modal Functions
window.openLegalModal = function() {
    const modal = document.createElement('div');
    modal.id = 'legal-modal';
    modal.className = 'fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4';
    modal.innerHTML = `
        <div class="glass-panel max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-2xl p-8 relative">
            <button onclick="closeLegalModal()" class="absolute top-4 right-4 text-slate-400 hover:text-white">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
            <h3 class="text-2xl font-bold mb-4 text-indigo-400">Legal Tech Deed Notice</h3>
            <div class="prose prose-invert text-sm text-slate-300 space-y-4">
                <p><strong>Data Protection Compliance:</strong> Junestudios operates under the Nigeria Data Protection Act (NDPA) 2023 and General Application and Implementation Directive (GAID) 2025. All client data is processed lawfully, fairly, and transparently.</p>
                <p><strong>Your Rights:</strong> You have the right to access, rectify, erase, and port your data. Contact our Data Protection Officer at dpo@junestudios.co.</p>
                <p><strong>Cross-Border Transfers:</strong> Data transfers outside Nigeria comply with NDPA Section 41 and GAID 2025 adequacy requirements.</p>
                <p><strong>Service Nature:</strong> Our infrastructure solutions involve automated data processing for tax routing and compliance. By engaging our services, you consent to necessary data processing as outlined in our Privacy Policy.</p>
            </div>
            <button onclick="closeLegalModal()" class="mt-6 w-full bg-indigo-500 text-white py-3 rounded-lg font-semibold hover:bg-indigo-600 transition-all">I Understand & Accept</button>
        </div>
    `;
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
};

window.closeLegalModal = function() {
    const modal = document.getElementById('legal-modal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
    }
};

// Image Error Handling with Fallbacks
function handleImageError(img, type) {
    img.style.display = 'none';
    const container = img.parentElement;
    
    if (type === 'founder') {
        container.innerHTML = `
            <div class="w-full h-full bg-slate-800 flex flex-col items-center justify-center text-slate-600">
                <span class="text-6xl mb-4">👤</span>
                <span class="font-mono text-sm">Sulaiman Sheriff-Akorede</span>
            </div>
        `;
    } else if (type === 'showcase') {
        const fallback = container.querySelector('.showcase-fallback');
        if (fallback) {
            fallback.classList.remove('hidden');
            fallback.classList.add('flex');
        }
    } else if (type === 'logo') {
        const logoContainer = img.closest('.logo-container');
        if (logoContainer) {
            logoContainer.innerHTML = 'J';
            logoContainer.classList.add('bg-gradient-to-br', 'from-indigo-500', 'to-cyan-400');
        }
    }
}

// Setup image error handlers
document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', function() {
        const isLogo = this.alt === 'Junestudios';
        const isFounder = this.id === 'founder-image';
        const isShowcase = this.closest('.showcase-image');
        
        if (isLogo) handleImageError(this, 'logo');
        else if (isFounder) handleImageError(this, 'founder');
        else if (isShowcase) handleImageError(this, 'showcase');
    });
    
    img.addEventListener('load', function() {
        this.classList.add('loaded');
    });
});

// Showcase Image Click Handler
document.querySelectorAll('.showcase-image').forEach((img, index) => {
    img.addEventListener('click', function() {
        const showcaseId = this.dataset.showcase;
        const titles = [
            'AI Marketing Infrastructure',
            'Fashion AI Synthetic Modeling',
            'Auto-Compliance Systems',
            'Data Isolation Protocols',
            'Tax Routing Matrix'
        ];
        
        const notification = document.createElement('div');
        notification.className = 'fixed bottom-8 right-8 glass-panel px-6 py-4 rounded-xl border-indigo-500/30 z-50 animate-up max-w-sm';
        notification.innerHTML = `
            <div class="flex items-start gap-3">
                <div class="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <span class="text-indigo-400 text-xs font-mono">0${showcaseId}</span>
                </div>
                <div>
                    <h4 class="font-bold text-white text-sm mb-1">${titles[index]}</h4>
                    <p class="text-xs text-slate-400">SaaSul Project Showcase</p>
                    <a href="https://wa.me/2348081515375?text=Inquiry%20about%20SaaSul%20Project%200${showcaseId}:%20${titles[index]}" target="_blank" class="inline-block mt-3 text-xs text-indigo-400 hover:text-indigo-300 font-semibold">Inquire via WhatsApp →</a>
                </div>
            </div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
    });
});

// Smooth Scroll with Offset
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offset = 100;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            mobileMenu?.classList.add('hidden');
            mobileMenu?.classList.remove('active');
        }
    });
});

// Load YouTube API
loadYouTubeAPI();

// Console branding
console.log('%cJUNESTUDIOS', 'color: #6366f1; font-size: 24px; font-weight: bold;');
console.log('%cThe Emerging Market OS | Founded by Sulaiman Sheriff-Akorede', 'color: #22d3ee; font-size: 12px;');

