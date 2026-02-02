# 🍽️ MealMuse - AI-Powered Recipe Discovery & Meal Planning Platform

> The ultimate companion for food lovers, home cooks, and culinary explorers. Discover recipes, plan meals, manage shopping lists, and get personalized cooking advice from your AI Chef.

![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb)
![Stripe](https://img.shields.io/badge/Stripe-Live-6772e5)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

### 🆓 Free Tier
- 🔍 Browse recipes from Spoonacular API plus pre-seeded recipes
- ❤️ Save favorite recipes (unlimited)
- 🛒 Smart shopping list with ingredient management
- 📱 Mobile-responsive design
- 🔐 Secure authentication with NextAuth.js

### 🌟 Premium Tier ($9.99/month OR $6.99/month for the next 50 Users! OR $79/year)
- 🤖 **AI Chef Chatbot** - Personalized cooking advice powered by Groq (llama-3.1-8b-instant)
- ✨ **AI Recipe Generator** - Create custom recipes from your ingredients
- 📚 **Ingredient Encyclopedia** - Learn about ingredients with AI insights
- 📅 **Meal Planning** - Advanced meal calendar and planning tools
- 🎯 **Priority Support** - Faster response times

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun
- npm or pnpm
- MongoDB Atlas account
- Stripe account (for payments)
- Groq API key (for AI features)

### Installation

```bash
# Clone the repository
git clone https://github.com/kingkey0101/mealmuse-web.git
cd mealmuse-web

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials
```

### Environment Variables

```env
# NextAuth
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=https://yourdomain.com

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname

# APIs
SPOONACULAR_API_KEY=your_api_key
GROQ_API_KEY=your_groq_api_key

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Payment redirects
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Development

```bash
# Start development server (with Turbopack)
npm run dev

# Run linting
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 📁 Project Structure

```
mealmuse-web/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── stripe/              # Stripe payment handling
│   │   ├── ai/                  # AI features (Chat, Recipe Generation)
│   │   └── recipes/             # Recipe management
│   ├── chat/                    # AI Chef Chat page (Premium)
│   ├── recipes/                 # Recipe discovery & details
│   ├── premium/                 # Pricing & subscription
│   └── account/                 # User account & settings
├── components/                   # Reusable React components
│   ├── ui/                      # Base UI components
│   └── ai/                      # AI-specific components
├── lib/                         # Utility functions
│   ├── auth.ts                  # NextAuth configuration
│   ├── db.ts                    # MongoDB client
│   ├── stripe.ts                # Stripe utilities
│   └── api.ts                   # API client
├── types/                       # TypeScript type definitions
└── public/                      # Static assets
```

## 🔐 Authentication

MealMuse uses **NextAuth.js** with JWT strategy:
- Email/password authentication
- Secure session management
- OAuth-ready architecture

```bash
# Create an account at /auth/register
# Login at /auth/login
```

## 💳 Payment Integration

Built with **Stripe Live API**:
- Secure checkout flow
- Automatic webhook processing
- Subscription management at `/account/subscription`
- Premium feature access gating

### Testing Payments (Local Development)

```bash
# Start Stripe CLI (requires Stripe CLI installed)
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Test card: 4242 4242 4242 4242
# Any future date for expiry
# Any 3-digit CVC
```

## 🤖 AI Features

Powered by **Groq AI** (llama-3.1-8b-instant):
- Real-time AI Chat for cooking advice
- Recipe generation from ingredients
- Ingredient insights & nutrition info
- Recipe rewrites & modifications

Premium users get unlimited AI interactions.

## 🍳 Recipe Management

- **50,000+ recipes** from Spoonacular API
- Full-text search across recipe database
- Detailed nutrition information
- Cooking instructions with images
- User-created recipes (coming soon)

## 🛒 Shopping List

- Add ingredients from recipes with one click
- Bulk ingredient parsing
- Item quantity tracking
- Real-time list updates
- Mobile-optimized interface

## 📊 Database Schema

**Users Collection:**
```json
{
  "_id": ObjectId,
  "email": "user@example.com",
  "name": "User Name",
  "password": "hashed_password",
  "subscription": {
    "tier": "premium|free",
    "status": "active|canceled",
    "stripeCustomerId": "cus_...",
    "stripeSubscriptionId": "sub_...",
    "currentPeriodEnd": Date,
    "cancelAtPeriodEnd": false
  },
  "createdAt": Date,
  "updatedAt": Date
}
```

**Recipes Collection:**
```json
{
  "_id": ObjectId,
  "spoonacularId": 123456,
  "title": "Recipe Name",
  "image": "url",
  "ingredients": [...],
  "instructions": "...",
  "nutrition": {...},
  "createdAt": Date
}
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Recipes
- `GET /api/recipes` - List recipes (with pagination)
- `POST /api/recipes` - Create recipe (admin)
- `PUT /api/recipes/[id]` - Update recipe (admin)

### Favorites
- `GET /api/favorites` - Get user's favorites
- `POST /api/favorites` - Add to favorites
- `DELETE /api/favorites/[id]` - Remove from favorites

### Shopping List
- `GET /api/shopping-list` - Get user's list
- `POST /api/shopping-list` - Add item
- `PUT /api/shopping-list/[id]` - Update item
- `DELETE /api/shopping-list/[id]` - Delete item

### Stripe
- `POST /api/stripe/create-checkout` - Start checkout
- `POST /api/stripe/webhook` - Handle Stripe events
- `GET /api/stripe/subscription-status` - Check subscription
- `POST /api/stripe/portal` - Open billing portal

### AI Features
- `POST /api/ai/chat` - Chat with AI Chef
- `POST /api/ai/generate-recipe` - Generate recipe from ingredients
- `POST /api/ai/ingredients` - Get ingredient info

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- app/api/recipes/route.test.ts
```

## 📝 Documentation

- [Production Launch Checklist](./PRODUCTION_LAUNCH_CHECKLIST.md) - Full deployment guide
- [Quick Launch Guide](./QUICK_LAUNCH_GUIDE.md) - Fast-track setup
- [Progress Notes](./PROGRESS_NOTES.md) - Development timeline & decisions

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Push to GitHub
git push origin main

# Visit vercel.com
# Import repository
# Set environment variables
# Deploy
```

### Environment Variables for Production

```env
# Same as development, but with production URLs and live API keys
NEXTAUTH_URL=https://mymealmuse.com
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
```

## 📊 Performance

- **Build Time:** ~16s with Turbopack
- **TypeScript:** Full type safety
- **Linting:** ESLint configured (17 non-critical warnings)
- **Mobile:** Fully responsive (xs to 2xl)
- **SEO:** Next.js metadata & open graph support

## 🔒 Security

- ✅ Environment variables for all secrets
- ✅ HTTPS-only in production
- ✅ CORS properly configured
- ✅ Input validation on all endpoints
- ✅ Rate limiting on AI endpoints
- ✅ Secure JWT sessions
- ✅ Password hashing with bcrypt
- ✅ Stripe webhook signature verification

## 🐛 Known Issues & Limitations

- AI endpoints rate-limited to prevent API abuse
- Premium check requires active subscription (no trial period)
- Recipe creation currently admin-only

## 🔮 Future Roadmap

- [ ] User-generated recipes
- [ ] Social sharing & recipe reviews
- [ ] Nutritionist-approved meal plans
- [ ] Grocery store price comparison
- [ ] Mobile app (React Native)
- [ ] Advanced meal calendar with notifications
- [ ] Recipe difficulty ratings
- [ ] Dietary restriction filtering
- [ ] Restaurant recommendations
- [ ] Recipe video tutorials

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## 💬 Support

- 📧 Email: kingkey0101@outloo.com
- 💬 Discord: [Coming soon]
- 🐛 Issues: [Report bugs on GitHub](https://github.com/kingkey0101/mealmuse-web/issues)

## 👨‍💻 Author

**Keylan King** - [GitHub](https://github.com/kingkey0101) | [LinkedIn](www.linkedin.com/in/keylan-king-12116835a)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) - The React framework
- [MongoDB](https://mongodb.com) - Database
- [Stripe](https://stripe.com) - Payment processing
- [Groq](https://groq.com) - AI inference
- [Spoonacular](https://spoonacular.com) - Recipe API
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [Vercel](https://vercel.com) - Hosting

---

Made with ❤️ by Keylan King. Empowering home cooks everywhere. 🍽️
