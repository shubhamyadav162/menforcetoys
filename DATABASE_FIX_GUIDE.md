# Database Fix Guide for NP Wellness Store

## Issue
The application is failing because the `orders` table is missing from the Supabase database. The error message "Could not find the table 'public.orders' in the schema cache" indicates this.

## Solution

You need to manually execute the SQL script in your Supabase SQL Editor. Follow these steps:

### Step 1: Access Supabase SQL Editor
1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Select your project: `ctdakdqpmntycertugvz`
3. Click on "SQL Editor" in the left sidebar

### Step 2: Execute the SQL Script
1. Copy the entire content of `fix_orders_table.sql` file
2. Paste it into the SQL Editor
3. Click "Run" to execute the script

### Step 3: Verify the Tables
After running the script, verify that these tables exist:
- `orders`
- `order_items`
- `payment_transactions`

### Step 4: Check Environment Variables
Make sure these environment variables are set in your Supabase Edge Functions:
- `TOYS4PEACE_MERCHANT_ID`
- `TOYS4PEACE_SECRET_KEY`

## Alternative: Use Supabase CLI

If you have the Supabase CLI installed, you can run:
```bash
supabase db push
```

## After Fixing the Database

Once the database is fixed:
1. Restart your development server
2. Try placing an order again
3. The payment gateway should now work properly

## Share Modal Error Fix

The `share-modal.js` error is likely from a built/compiled file. To fix it:
1. Clear your browser cache
2. Restart the development server
3. If the error persists, check for any null element references in your modal components

## Testing

After applying the database fix:
1. Add a product to cart
2. Proceed to checkout
3. Fill in the form
4. Submit the order
5. The payment gateway should open without errors

## Edge Functions Update

If you still have issues with payment gateway, you may need to update the Edge Functions. Here's the complete code for the payment functions:

### create-payment function
```typescript
// (Content from supabase/functions/create-payment/index.ts)
// Make sure it references the correct 'orders' table
```

### check-payment-status function
```typescript
// (Content from supabase/functions/check-payment-status/index.ts)
// Make sure it references the correct 'orders' table
```

### payment-webhook function
```typescript
// (Content from supabase/functions/payment-webhook/index.ts)
// Make sure it references the correct 'orders' table
```

## Support

If you continue to experience issues:
1. Check the browser console for specific error messages
2. Verify the Supabase tables were created correctly
3. Ensure all Edge Functions are deployed with the latest code