# Analytics, SEO, Ingredient Improvements, and Password Reset

This document outlines the recent enhancements made to MealMuse for analytics, SEO, ingredient display, and authentication.

## 1. Google Analytics Integration

### Setup

1. **Create a Google Analytics 4 (GA4) Property**:
   - Go to [Google Analytics](https://analytics.google.com)
   - Create a new property for your website
   - Get your Measurement ID (format: `G-XXXXXXXXXX`)

2. **Add to Environment Variables**:

   ```bash
   NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G_your_ga4_id
   ```

3. **How It Works**:
   - The analytics script is automatically loaded via Next.js Script component
   - Tracks page views automatically
   - Works in both development and production

### Tracking

- Page views are tracked automatically
- Custom events can be added using:
  ```javascript
  gtag("event", "event_name", {
    property_name: "value",
  });
  ```

---

## 2. SEO Improvements

### Schema.org Structured Data

Recipe pages now include JSON-LD structured data for better search engine optimization:

- **Recipe Name**: Page title and structured data include recipe name
- **Ingredients**: All ingredients are included in the structured data
- **Instructions**: Step-by-step instructions are provided
- **Cooking Time**: Preparation and cooking times are included
- **Recipe Category**: Cuisine type is included

This helps search engines understand:

- What the recipe is about
- What ingredients are needed
- How long it takes to cook
- Dietary categories

### Meta Tags

All recipe pages include:

- **OpenGraph Tags**: For social media sharing (Facebook, LinkedIn, etc.)
- **Twitter Card Tags**: For Twitter/X sharing
- **Description**: Concise description of the recipe
- **Keywords**: Based on dietary restrictions

---

## 3. Decimal to Fraction Conversion

### Overview

Ingredient amounts are now automatically converted from decimals to common cooking fractions:

- `0.33333` → `1/3`
- `0.5` → `1/2`
- `0.66667` → `2/3`
- `0.25` → `1/4`
- `1.5` → `1 1/2`
- `2.33` → `2 1/3`

### Supported Fractions

The converter supports common cooking measurements:

- 1/16, 1/8, 3/16, 1/4, 5/16, 1/3, 3/8, 7/16, 1/2
- 9/16, 7/12, 5/8, 2/3, 11/16, 3/4, 13/16, 5/6, 7/8, 15/16

### Implementation

The conversion utility is located in: `lib/fractionConverter.ts`

**Main Functions**:

```typescript
// Convert a single decimal to fraction string
decimalToFraction(0.33333); // Returns "1/3"

// Format ingredient amount with unit
formatIngredientAmount(0.5, "cup");
// Returns { amount: "1/2", unit: "cup" }

// Format a complete ingredient object
formatIngredient({
  name: "cilantro",
  amount: 0.33333,
  unit: "cup",
});
// Returns { name: "cilantro", amount: "1/3", unit: "cup", display: "1/3 cup cilantro" }

// Batch format multiple ingredients
formatIngredients(ingredientArray);
// Returns array of formatted ingredients
```

### Where It's Used

1. **Recipe Detail Page** (`app/recipes/[recipeId]/page.tsx`):
   - Displays ingredient amounts in the ingredients list

2. **Shopping List** (`app/recipes/[recipeId]/AddToShoppingList.tsx`):
   - Shows fraction amounts when adding items to the shopping list

3. **Recipe Display** (everywhere ingredients are shown):
   - Automatic conversion for better readability

---

## 4. Seeded Recipes with Ingredient Amounts

### Overview

The first 15 recipes in the database are now seeded with:

- Complete ingredient lists with amounts
- Proper measurements (cups, tablespoons, teaspoons, etc.)
- Step-by-step instructions
- Equipment needed
- Dietary categories

### Seeded Recipes Include

1. Classic Spaghetti Carbonara (Italian)
2. Cilantro Lime Rice (Mexican)
3. Thai Green Curry (Thai)
4. Margherita Pizza (Italian)
5. Chicken Stir-Fry (Chinese)
6. Greek Salad (Mediterranean)
7. Beef Tacos (Mexican)
8. Pad Thai (Thai)
9. Falafel Wrap (Mediterranean)
10. Chicken Curry (Indian)
11. Caesar Salad (American)
12. Salmon Fillet (American)
13. Shakshuka (Middle Eastern)
14. Vegetable Stir-Fry (Chinese)
15. Omelette (French)
16. Risotto Milanese (Italian) - Bonus 16th recipe

### How to Seed

The seeding is controlled via an API endpoint:

```bash
# Requires ADMIN_API_KEY header
curl -X POST http://localhost:3000/api/admin/seed-recipes \
  -H "x-api-key: your-admin-api-key"
```

This will:

1. Delete any existing seeded recipes
2. Insert all 15+ seed recipes with proper amounts

### Recipe Format

Each seeded recipe includes:

```typescript
{
  title: "Recipe Name",
  cuisine: "Cuisine Type",
  skill: "beginner" | "intermediate" | "advanced",
  dietary: ["vegan", "gluten-free", ...],
  cookingTime: 30, // in minutes
  ingredients: [
    { name: "ingredient", amount: 2, unit: "cups" },
    ...
  ],
  steps: ["Step 1", "Step 2", ...],
  equipment: ["pot", "knife", ...],
  source: "seeded",
  status: "approved"
}
```

---

## Environment Variables Setup

Add these to your `.env.local`:

```bash
# Google Analytics (optional, but recommended)
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G_your_ga4_id

# Admin API Key (for seeding)
ADMIN_API_KEY=your_admin_api_key
```

---

## Testing

### Analytics

1. Visit a recipe page
2. Check Google Analytics Real-Time view
3. Verify page view is recorded

### SEO

1. Visit a recipe page
2. Right-click → View Page Source
3. Look for `<script type="application/ld+json">` with recipe data

### Decimal to Fraction

1. Seed the recipes: `POST /api/admin/seed-recipes`
2. View a recipe page
3. Verify ingredient amounts show as fractions (e.g., "1/3 cup cilantro")

### Seeded Recipes

1. Call seed endpoint
2. Navigate to `/recipes`
3. See 15 approved recipes with all amounts

---

## 5. Password Reset Feature

### Overview

Complete password reset functionality has been added to improve user experience and security.

### Pages Added

1. **Forgot Password** (`/auth/forgot-password`):
   - Users can request a password reset link
   - Enter email address
   - Receive reset token (displayed for testing, will be emailed in production)

2. **Reset Password** (`/auth/reset-password`):
   - Users can set a new password using the reset token
   - Token validation
   - Password confirmation
   - Auto-redirect to login after success

3. **Updated Login Page**:
   - Added "Forgot password?" link below password field

### API Endpoints

1. **POST `/api/auth/forgot-password`**:
   - Accepts: `{ email: string }`
   - Generates a secure reset token
   - Stores token with 1-hour expiry in database
   - Returns reset link (for testing; send via email in production)

2. **POST `/api/auth/reset-password`**:
   - Accepts: `{ token: string, password: string }`
   - Validates token and expiry
   - Hashes new password with bcrypt
   - Updates user password
   - Clears reset token from database

### Security Features

- ✅ Reset tokens expire after 1 hour
- ✅ Tokens are cryptographically secure (32 bytes)
- ✅ Passwords hashed with bcrypt (10 rounds)
- ✅ Tokens stored securely in MongoDB
- ✅ Tokens are single-use (cleared after reset)
- ✅ Doesn't reveal if email exists (prevents user enumeration)
- ✅ Password must be at least 6 characters

### Database Schema Updates

Added to users collection:
```typescript
{
  resetToken?: string;       // Secure random token
  resetTokenExpiry?: Date;   // Expiry timestamp (1 hour)
}
```

### Testing Locally

1. Go to `/auth/login`
2. Click "Forgot password?"
3. Enter your email
4. Copy the reset link shown on screen
5. Paste in browser to go to reset page
6. Enter new password (min 6 characters)
7. Confirm password
8. Submit and you'll be redirected to login

### Production Setup

**TODO**: Integrate email service for sending reset links:

```typescript
// In /api/auth/forgot-password/route.ts
// Replace the return with actual email sending

import { sendEmail } from "@/lib/email"; // Your email service

await sendEmail({
  to: email,
  subject: "Reset Your MealMuse Password",
  html: `
    <p>Click the link below to reset your password:</p>
    <a href="${resetLink}">${resetLink}</a>
    <p>This link expires in 1 hour.</p>
  `
});
```

**Recommended Email Services**:
- [Resend](https://resend.com) - Modern, developer-friendly
- [SendGrid](https://sendgrid.com) - Enterprise-grade
- [AWS SES](https://aws.amazon.com/ses/) - Cost-effective
- [Nodemailer](https://nodemailer.com) - Self-hosted SMTP

---

## 6. Dietary Filter Bug Fix

### Issue
Dietary filters were not working because the filter expected capitalized values (`"Vegan"`, `"Vegetarian"`) but seeded recipes had lowercase values (`"vegan"`, `"vegetarian"`).

### Solution
Updated the dietary filter to be **case-insensitive**:

```typescript
// Before
if (!dietary.includes(dietaryFilter)) {
  return false;
}

// After
const hasMatch = dietary.some((pref: string) => 
  pref.toLowerCase() === dietaryFilter.toLowerCase()
);
if (!hasMatch) {
  return false;
}
```

### Files Updated
- `app/recipes/RecipesClient.tsx` - Made dietary filter case-insensitive

---

## Future Enhancements

- [ ] Add custom event tracking (e.g., recipe viewed, favorited, etc.)
- [ ] Add recipe rating tracking to Google Analytics
- [ ] Implement structured data for chef/author information
- [ ] Add breadcrumb schema for navigation
- [ ] Create recipe cards with more metadata (servings, calories, etc.)
- [ ] Add image optimization for social sharing
- [ ] Integrate email service for password reset links
- [ ] Add 2FA/MFA authentication
- [ ] Add social login (Google, Facebook)

---

## Support

For issues or questions:

1. Check the implementation in `lib/fractionConverter.ts`
2. Review recipe page code in `app/recipes/[recipeId]/page.tsx`
3. Check API endpoint in `app/api/admin/seed-recipes/route.ts`
4. Review password reset in `app/api/auth/forgot-password/route.ts` and `app/api/auth/reset-password/route.ts`
