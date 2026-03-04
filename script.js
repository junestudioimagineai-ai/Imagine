// Configuration
const CONFIG = {
    whatsapp: {
        ceo: '2348081515375',
        agent: '2348101365054'
    },
    youtube: {
        heroVideoId: 'vGJOWqcgbmI',
        projectVideos: [
            'YHCvequl3X8',
            'AdWD68lYpCo',
            'XplrR8k17LA',
            'XXRJqpJtTs8',
            '1LMeYm5yTUw'
        ]
    },
    images: {
        logo: 'https://raw.githubusercontent.com/junestudioimagineai-ai/Imagine/main/logo.png',
        founder: 'https://raw.githubusercontent.com/junestudioimagineai-ai/Imagine/main/founder-sulaiman.jpg',
        showcases: [
            'https://raw.githubusercontent.com/junestudioimagineai-ai/Imagine/main/saasul-showcase-1.jpg',
            'https://raw.githubusercontent.com/junestudioimagineai-ai/Imagine/main/saasul-showcase-2.jpg',
            'https://raw.githubusercontent.com/junestudioimagineai-ai/Imagine/main/saasul-showcase-3.jpg',
            'https://raw.githubusercontent.com/junestudioimagineai-ai/Imagine/main/saasul-showcase-4.jpg',
            'https://raw.githubusercontent.com/junestudioimagineai-ai/Imagine/main/saasul-showcase-5.jpg'
        ]
    }
};

// YouTube Player API
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
            playlist: CONFIG.youtube.heroVideoId
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

// Terms & Conditions Toggle
window.toggleTerms = function() {
    const content = document.getElementById('terms-content');
    const chevron = document.getElementById('terms-chevron');
    
    if (content.classList.contains('hidden')) {
        content.classList.remove('hidden');
        chevron.classList.add('rotated');
    } else {
        content.classList.add('hidden');
        chevron.classList.remove('rotated');
    }
};

// Tier Details Toggle Function
window.toggleTierDetails = function(tierId) {
    const details = document.getElementById(tierId);
    const btn = document.querySelector(`button[onclick="toggleTierDetails('${tierId}')"]`);
    
    if (details.classList.contains('expanded')) {
        details.classList.remove('expanded');
        btn.classList.remove('expanded');
        btn.querySelector('span').textContent = 'See tier details & differences';
    } else {
        // Close other open tiers first (optional - for accordion behavior)
        document.querySelectorAll('.tier-details.expanded').forEach(el => {
            el.classList.remove('expanded');
        });
        document.querySelectorAll('.see-more-btn.expanded').forEach(el => {
            el.classList.remove('expanded');
            el.querySelector('span').textContent = 'See tier details & differences';
        });
        
        details.classList.add('expanded');
        btn.classList.add('expanded');
        btn.querySelector('span').textContent = 'Show less';
    }
};

// Image Error Handling - Global function
window.handleImageError = function(img, type) {
    console.log(`Image failed to load: ${img.src}, type: ${type}`);
    img.classList.add('error');
    img.style.display = 'none';
    
    const container = img.parentElement;
    
    if (type === 'founder') {
        // Create fallback for founder image
        const fallback = document.createElement('div');
        fallback.className = 'w-full h-full bg-slate-800 flex flex-col items-center justify-center text-slate-600';
        fallback.innerHTML = `
            <span class="text-6xl mb-4">👤</span>
            <span class="font-mono text-sm">Sulaiman Sheriff-Akorede</span>
        `;
        container.appendChild(fallback);
    } else if (type === 'showcase') {
        const fallback = container.querySelector('.showcase-fallback');
        if (fallback) {
            fallback.classList.remove('hidden');
            fallback.classList.add('flex');
        }
    } else if (type === 'logo') {
        const fallback = container.querySelector('.logo-fallback');
        if (fallback) {
            fallback.style.display = 'flex';
        }
    }
};

// Setup image error handlers
document.addEventListener('DOMContentLoaded', function() {
    const logoImg = document.querySelector('.logo-container img');
    if (logoImg) {
        logoImg.addEventListener('error', function() {
            handleImageError(this, 'logo');
        });
    }
    
    const founderImg = document.getElementById('founder-image');
    if (founderImg) {
        founderImg.addEventListener('error', function() {
            handleImageError(this, 'founder');
        });
    }
    
    document.querySelectorAll('.showcase-image img').forEach((img) => {
        img.addEventListener('error', function() {
            handleImageError(this, 'showcase');
        });
        
        img.addEventListener('load', function() {
            this.classList.add('loaded');
        });
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

// Smooth Scroll
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
            if (mobileMenu) {
                mobileMenu.classList.add('hidden');
                mobileMenu.classList.remove('active');
            }
        }
    });
});

// Load YouTube API
loadYouTubeAPI();

// Console branding
console.log('%cJUNESTUDIOS', 'color: #6366f1; font-size: 24px; font-weight: bold;');
console.log('%cThe Emerging Market OS | Founded by Sulaiman Sheriff-Akorede', 'color: #22d3ee; font-size: 12px;');

// Preload images
function preloadImages() {
    const imagesToPreload = [
        CONFIG.images.logo,
        CONFIG.images.founder,
        ...CONFIG.images.showcases
    ];
    
    imagesToPreload.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

window.addEventListener('load', preloadImages);
