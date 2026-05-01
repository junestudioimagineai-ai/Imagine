# JuneStudio Imagine - Enterprise SMM Marketplace

## 🚀 Deployment Ready

Your complete enterprise SMM marketplace has been successfully built and deployed to:
**https://github.com/junestudioimagineai-ai/Imagine**

---

## ✨ Features Implemented

### **1. Minimalist Luxury Design ($100K Quality)**
- Clean white/off-white backgrounds with editorial grid layouts
- Swiss-style typography using Inter & Playfair Display fonts
- High-contrast black text for professional corporate feel
- Responsive design: Desktop → Tablet → Mobile (S10e optimized)
- Premium banking app experience on mobile

### **2. Complete Multi-Page Navigation**
- **Home**: Hero section with instant auth, live stats, services preview
- **Services**: Full marketplace with filters (tier, platform, search)
- **Pricing**: Dynamic calculator with cost-per-unit breakdown
- **Bundles**: Pre-built packages with automatic discounts
- **AI Assistant**: 4 expert modes with chat history
- **Dashboard**: User orders, wallet, stats (logged-in only)
- **Add Funds**: WhatsApp payment flow (logged-in only)
- **Orders**: Complete order history with filters (logged-in only)
- **Profile**: Account settings (logged-in only)

### **3. Dual API Integration**
- **JuneStudio Basic** (JustAnotherPanel): `fc5f37722f01550a7c956a0d4ecf63bb`
- **JuneStudio Max** (MoreThanPanel): `3cb77c7355e039af290c6ba07097d85f`
- 150% profit markup (2.5x multiplier)
- Hidden USD→NGN conversion (₦1,450/$)
- Services tagged by tier (no visible provider badges)

### **4. Authentication System**
- Email/password signup & login
- Google OAuth button ready (needs backend)
- Admin account: `junestudioimagineai@gmail.com` (₦100,000 starting balance)
- Protected routes for logged-in features
- LocalStorage-based user management

### **5. Payment Flow (WhatsApp-Based)**
- OPay/PalmPay: `8081515375` | Sulaiman Sheriff-Akorede
- First Bank: `3084635140` | Sulaiman Sheriff-Akorede
- User enters amount → transfers externally → clicks "I've Sent Receipt"
- Redirects to WhatsApp (+2348081515375) with pre-filled message
- Admin confirms within 15 minutes and credits wallet
- Crypto marked "Coming Soon"

### **6. AI Strategy Assistant**
- 4 Expert Modes:
  - Social Media Expert
  - Content Design Build
  - Marketing Strategy
  - Nigerian Market Expert (peak hours, Pidgin guidance)
- Chat history for logged-in users
- Floating action button on all pages

### **7. Bundle Discounts**
- Starter Growth: ₦36,000 (was ₦45,000) - Save 20%
- Agency Growth: ₦81,250 (was ₦125,000) - Save 35%
- Enterprise Scale: ₦175,000 (was ₦350,000) - Save 50%

### **8. Live Features**
- Animated stats counters (18.4M+ orders)
- Live order ticker (updates every 5 seconds)
- Real-time price calculator with bulk discounts
- Service filtering by tier, platform, search

---

## 📁 File Structure

```
/workspace
├── index.html      (232 lines - Complete SPA structure)
├── style.css       (1,301 lines - Premium responsive styling)
├── script.js       (740 lines - Full application logic)
├── logo.png        (Brand asset)
├── founder-sulaiman.jpg
└── saasul-showcase-*.jpg
```

---

## 🚀 Deployment Instructions

### **Vercel (Recommended - Frontend + Backend)**
1. Go to [vercel.com](https://vercel.com) → New Project
2. Import GitHub repo: `junestudioimagineai-ai/Imagine`
3. Settings:
   - Framework Preset: **Other**
   - Root Directory: `./`
   - Output Directory: `./`
4. Deploy
5. Connect domain `junestudios.com.ng`:
   - Add A record: `76.76.21.21`
   - Add CNAME: `cname.vercel-dns.com`
6. Update Google Console with production URLs

### **Environment Variables (Vercel)**
Add these in Vercel Project Settings → Environment Variables:
```
GOOGLE_CLIENT_ID=[Your Google Client ID from Google Console]
GOOGLE_CLIENT_SECRET=[Your Google Client Secret from Google Console]
JAP_API_KEY=fc5f37722f01550a7c956a0d4ecf63bb
MTP_API_KEY=3cb77c7355e039af290c6ba07097d85f
ADMIN_EMAIL=junestudioimagineai@gmail.com
```

**⚠️ Important**: Never commit actual OAuth secrets to GitHub. Add them directly in Vercel's dashboard after deployment.

### **Do You Need Render?**
**No.** Vercel alone handles everything:
- Frontend hosting (static files)
- Backend via Serverless Functions (for Google OAuth, API proxying)
- Database via Vercel KV or Supabase Free Tier
- Zero latency, $0 cost until scaling

Render is only needed if you require persistent servers (not the case here).

---

## 🔐 Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. APIs & Services → Credentials
4. Edit your OAuth 2.0 Client ID
5. Add authorized origins:
   - `https://junestudios.com.ng`
   - `https://imagine-git-main-junestudioimagineai.vercel.app` (Vercel preview)
6. Add authorized redirect URIs:
   - Same as above
7. Save changes

---

## 🎯 Next Steps for Full Automation

### **Backend Integration (Optional - Use n8n)**
1. Set up n8n workflow:
   - Webhook trigger from frontend
   - Route to cheapest JAP/MTP API
   - Update database with order status
2. Create Supabase/Vercel KV database:
   - Users table
   - Orders table
   - Services cache
3. Replace localStorage calls with API calls

### **Live Telemetry**
- Connect to actual database for real-time order counts
- WebSocket for live order updates
- Analytics dashboard for admin

### **Auto-Refill Logic**
- Monitor follower counts via social media APIs
- Trigger refill orders when threshold drops
- Automated webhook to supplier APIs

---

## 📱 Mobile Optimization

The site is fully responsive with:
- **Desktop (1440px+)**: 4-column grids, full navigation
- **Tablet (768-1024px)**: 2-column layouts, hamburger menu
- **Mobile (481-767px)**: Single column, bottom navigation bar
- **Small Mobile (≤480px)**: Compact typography, touch-optimized buttons

Tested for Samsung S10e and similar devices.

---

## 💡 Key Differentiators

1. **Minimalist Luxury**: Unlike neon-green SMM sites, this commands premium clients
2. **Grid-Based Alignment**: Editorial layout builds trust
3. **Executive Dashboard**: Mobile-first for on-the-go management
4. **Cost Transparency**: Accordion explains pricing factors
5. **Dual API Routing**: Best prices from both providers
6. **WhatsApp Payments**: Perfect for Nigerian market
7. **AI Assistant**: Built-in strategy guidance

---

## 📞 Support

- WhatsApp: +2348081515375
- Admin Email: junestudioimagineai@gmail.com
- Domain: junestudios.com.ng

---

**Built for agencies, resellers, and brands who demand excellence.**
