# Debugging Notes - Stripe Integration Issues

## Issue 1: Annual Plan Showing "Free" Tier After Purchase

**Date:** January 28, 2026

**Symptom:**
- User completed annual plan checkout successfully
- Stripe webhooks fired and showed HTTP 200 responses
- User navigated to `/account/subscription`
- Page showed "Free" plan instead of "Premium"

**Root Cause:**
Webhook handlers were trying to update MongoDB users by `_id` field using a string userId:
```typescript
await db.collection("users").updateOne(
  { _id: userId },  // ❌ userId is string, _id expects ObjectId
  { $set: { "subscription.tier": "premium" } }
);
```

MongoDB's `_id` field is of type `ObjectId`, not a string. The query silently found no matching documents, so updates never persisted.

**Fix:**
Changed all webhook handlers to update by email instead:
```typescript
const customer = await stripe.customers.retrieve(customerId);
const email = (customer as any).email;
await db.collection("users").updateOne(
  { email },  // ✅ Email is a string field that exists
  { $set: { "subscription.tier": "premium" } }
);
```

**Affected Functions:**
- `handleCheckoutCompleted` 
- `handleSubscriptionUpdated`
- `handleSubscriptionDeleted`
- `handlePaymentSucceeded`
- `handlePaymentFailed`

**Commit:** `2c334b7` - "fix: webhook handlers now correctly update subscription by email instead of _id"

---

## Issue 2: Stripe Redirects Going to Production URL During Local Testing

**Date:** January 28, 2026

**Discovery Method:**
User discovered this by:
1. Attempting another purchase locally
2. Monitoring Stripe CLI terminal output (webhook events)
3. Watching localhost:3000 browser behavior
4. Observing redirect to: `https://mymealmuse.com/premium/success?session_id=cs_test_...`

**Symptom:**
After completing Stripe checkout locally, browser redirected to production domain (mymealmuse.com) instead of localhost:3000, making it impossible to test the success page locally.

**Root Cause:**
Both checkout and portal API routes used `process.env.NEXTAUTH_URL` for all redirect URLs:
```typescript
success_url: `${process.env.NEXTAUTH_URL}/premium/success`,
cancel_url: `${process.env.NEXTAUTH_URL}/premium/canceled`,
```

Since `.env.local` has `NEXTAUTH_URL=http://mymealmuse.com` (configured for production), all Stripe redirects went to production URL even during local development.

**Fix:**
Detect environment and use appropriate base URL:
```typescript
const baseUrl = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3000'
  : process.env.NEXTAUTH_URL || 'http://mymealmuse.com';

success_url: `${baseUrl}/premium/success`,
cancel_url: `${baseUrl}/premium/canceled`,
```

**How It Works:**
- **Development:** `npm run dev` sets `NODE_ENV=development` → uses `localhost:3000`
- **Production:** `npm run build && npm start` sets `NODE_ENV=production` → uses `NEXTAUTH_URL`
- No manual changes required when switching between environments

**Files Changed:**
- `app/api/stripe/create-checkout/route.ts` (success_url, cancel_url)
- `app/api/stripe/portal/route.ts` (return_url)

**Status:** ✅ Fixed - automatic environment detection preserves production behavior

---

## Testing Workflow (Post-Fix)

### Local Testing (Development)
1. Run `npm run dev` (sets NODE_ENV=development automatically)
2. Start Stripe CLI: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
3. Complete checkout with test card `4242 4242 4242 4242`
4. Success page loads at `http://localhost:3000/premium/success`
5. Webhooks process and update database by email
6. Navigate to `/account/subscription` to verify "Premium" tier

### Production Testing
1. Deploy with `npm run build && npm start` (sets NODE_ENV=production)
2. Configure production webhook endpoint in Stripe dashboard
3. Test with real/test card
4. Success page loads at `http://mymealmuse.com/premium/success`
5. All redirects use production URLs automatically

---

## Key Learnings

1. **MongoDB _id Type Safety:** Always use email or other string fields for updates unless you explicitly convert to ObjectId
2. **Environment-Specific URLs:** Never hardcode production URLs in environment variables when testing locally - use NODE_ENV detection
3. **Silent Failures:** MongoDB `updateOne` with no matches returns `{ matchedCount: 0, modifiedCount: 0 }` but doesn't throw errors
4. **Testing Verification:** Always watch both Stripe CLI output AND local browser behavior during testing
5. **URL Redirects:** Stripe checkout redirects happen on their servers, so they need the correct callback URL for your environment

---

## Future Improvements

- [ ] Add logging for `updateOne` operations to catch silent failures
- [ ] Add validation that subscription data was actually persisted after webhook
- [ ] Create integration tests for webhook handlers
- [ ] Add Sentry/error monitoring for production webhook failures
- [ ] Consider adding retry logic for failed webhook updates
