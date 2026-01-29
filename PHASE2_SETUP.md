# Phase 2: Stripe Integration Setup Guide

## Overview
Phase 2 integrates Stripe payment processing for Premium subscriptions. This enables users to upgrade from the free tier to Premium ($9.99/month or $99/year).

## Files Created

### Core Stripe Configuration
- `lib/stripe.ts` - Stripe client and pricing configuration
- `app/api/stripe/create-checkout/route.ts` - Checkout session creation
- `app/api/stripe/webhook/route.ts` - Webhook event handler
- `app/api/stripe/portal/route.ts` - Customer billing portal
- `app/api/stripe/subscription-status/route.ts` - Subscription status endpoint

### UI Pages
- `app/premium/success/page.tsx` - Post-purchase success page
- `app/premium/canceled/page.tsx` - Checkout canceled page
- `app/account/subscription/page.tsx` - Subscription management
- `app/premium/PremiumPageClient.tsx` - Updated pricing page with checkout

## Setup Instructions

### 1. Create Stripe Account
1. Go to [stripe.com](https://stripe.com) and sign up
2. Switch to **Test Mode** (toggle in top right)
3. Keep your dashboard open for the next steps

### 2. Create Products and Prices

#### Premium Monthly Subscription
1. Go to **Products** in Stripe Dashboard
2. Click **Add Product**
3. Fill in:
   - Name: `MealMuse Premium Monthly`
   - Description: `Monthly subscription to MealMuse Premium`
   - Pricing Model: **Recurring**
   - Price: `$9.99`
   - Billing Period: **Monthly**
4. Click **Save Product**
5. **Copy the Price ID** (starts with `price_...`)

#### Premium Annual Subscription
1. In the same product, click **Add another price**
2. Fill in:
   - Price: `$99`
   - Billing Period: **Yearly**
3. Click **Add price**
4. **Copy the Price ID** (starts with `price_...`)

### 3. Get API Keys
1. Go to **Developers** > **API Keys**
2. Copy your **Secret Key** (starts with `sk_test_`)
3. Copy your **Publishable Key** (starts with `pk_test_`)

### 4. Set Up Webhook

#### Local Development (Stripe CLI)
1. Install Stripe CLI:
   ```powershell
   # Windows (with Scoop)
   scoop install stripe
   
   # Or download from https://stripe.com/docs/stripe-cli
   ```

2. Login to Stripe:
   ```powershell
   stripe login
   ```

3. Forward webhooks to local server:
   ```powershell
   stripe listen --forward-to http://localhost:3000/api/stripe/webhook
   ```

4. Copy the webhook signing secret (starts with `whsec_`)

#### Production Deployment
1. Go to **Developers** > **Webhooks**
2. Click **Add Endpoint**
3. Enter your URL: `https://yourdomain.com/api/stripe/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **Add endpoint**
6. Copy the **Signing Secret** (starts with `whsec_`)

### 5. Configure Environment Variables

Create or update `.env.local` with:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
STRIPE_PRICE_ID_MONTHLY=price_your_monthly_price_id
STRIPE_PRICE_ID_ANNUAL=price_your_annual_price_id

# Application URL
NEXTAUTH_URL=http://localhost:3000

# Existing variables
MONGODB_URI=your_mongodb_uri
NEXTAUTH_SECRET=your_nextauth_secret
```

### 6. Test the Integration

#### Start Development Server
```powershell
npm run dev
```

#### In Another Terminal (for webhooks)
```powershell
stripe listen --forward-to http://localhost:3000/api/stripe/webhook
```

#### Test Checkout Flow
1. Navigate to `http://localhost:3000/premium`
2. Click **Upgrade to Premium** (monthly or annual)
3. Use Stripe test card: `4242 4242 4242 4242`
4. Use any future expiry date (e.g., 12/34)
5. Use any CVC (e.g., 123)
6. Complete checkout
7. Verify you're redirected to success page
8. Check MongoDB that subscription is created
9. Verify session now shows `tier: "premium"`

#### Test Webhook Events
Monitor the Stripe CLI output to see webhook events being received and processed.

#### Test Billing Portal
1. Go to `http://localhost:3000/account/subscription`
2. Click **Open Billing Portal**
3. Test subscription management (cancel, update payment method, etc.)

### 7. Test Scenarios

✅ **Successful Subscription**
- Complete checkout
- Verify premium features unlock
- Check database subscription record

✅ **Subscription Cancellation**
- Go to billing portal
- Cancel subscription
- Verify access continues until period end
- Verify downgrade happens after period ends

✅ **Failed Payment**
- Use declining test card: `4000 0000 0000 0341`
- Verify subscription status changes to `past_due`

✅ **Subscription Renewal**
- Fast-forward subscription in Stripe Dashboard
- Trigger renewal
- Verify webhook updates subscription period

### 8. Production Deployment Checklist

Before going live:

- [ ] Switch Stripe to **Live Mode**
- [ ] Create products/prices in live mode
- [ ] Get live API keys (start with `sk_live_` and `pk_live_`)
- [ ] Set up production webhook endpoint
- [ ] Update environment variables with live keys
- [ ] Test entire flow in production
- [ ] Set up Stripe email notifications
- [ ] Configure Stripe customer portal settings
- [ ] Set up invoice branding in Stripe

## Stripe Dashboard Configuration

### Customer Portal Settings
1. Go to **Settings** > **Customer Portal**
2. Enable:
   - **Subscription management** (cancel, pause)
   - **Update payment method**
   - **Invoice history**
3. Set cancellation behavior: **At period end** (recommended)

### Email Settings
1. Go to **Settings** > **Emails**
2. Enable:
   - Successful payments
   - Failed payments
   - Upcoming renewals
   - Subscription canceled

### Branding
1. Go to **Settings** > **Branding**
2. Upload logo
3. Set brand colors:
   - Primary: `#0D5F3A` (teal)
   - Accent: `#E8A628` (mustard)

## Troubleshooting

### Webhook not receiving events
- Ensure Stripe CLI is running (`stripe listen`)
- Check webhook endpoint is accessible
- Verify signing secret matches in .env.local

### Checkout not redirecting
- Check NEXTAUTH_URL is set correctly
- Verify price IDs are correct in .env.local
- Check Stripe API keys are valid

### Subscription not updating in database
- Check webhook handler logs for errors
- Verify MongoDB connection
- Ensure userId is in webhook metadata

### Testing Cards
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
Insufficient funds: 4000 0000 0000 9995
Expired: 4000 0000 0000 0069
```

## Database Schema

Users collection will have subscription object:
```javascript
{
  _id: "user_id",
  email: "user@example.com",
  subscription: {
    tier: "free" | "premium",
    status: "active" | "canceled" | "past_due" | "trialing",
    stripeCustomerId: "cus_...",
    stripeSubscriptionId: "sub_...",
    currentPeriodEnd: Date,
    cancelAtPeriodEnd: boolean
  }
}
```

## Next Steps (Phase 3)
After Stripe is working:
- Hugging Face API integration for AI features
- AI Chef Chatbot implementation
- AI Recipe Generator
- Premium feature implementation

## Support
For Stripe-related issues:
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com)
