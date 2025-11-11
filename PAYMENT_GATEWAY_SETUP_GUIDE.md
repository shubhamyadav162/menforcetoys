# Payment Gateway Integration Setup Guide

## Overview

This guide will help you integrate the Toys4Peace payment gateway into your NP Wellness Store using Supabase Edge Functions and comprehensive database tracking.

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │────│  Supabase Edge   │────│  Payment API    │
│   (React App)   │    │   Functions      │    │  (Toys4Peace)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       ▼                       │
         │              ┌─────────────────┐              │
         │              │  Supabase DB    │              │
         │              │  (PostgreSQL)   │              │
         │              └─────────────────┘              │
         │                       │                       │
         └───────────────────────┴───────────────────────┘
```

## 📋 Prerequisites

1. **Supabase Project**: Already set up (ctdakdqpmntycertugvz)
2. **Payment Gateway Credentials**:
   - Merchant ID from Toys4Peace
   - Secret Key from Toys4Peace
3. **Node.js & npm**: For local development
4. **Supabase CLI**: For edge function deployment

## 🔧 Setup Instructions

### 1. Database Schema Setup

First, execute the payment gateway schema in your Supabase SQL Editor:

```sql
-- File: supabase/migrations/20240110_payment_gateway_schema.sql
```

This creates:
- `payment_providers` - Payment provider configurations
- `payment_transactions` - Transaction tracking
- `payment_webhook_logs` - Webhook event logging
- `merchant_config` - Merchant configuration

### 2. Edge Functions Deployment

Deploy the Supabase Edge Functions:

#### Function 1: Create Payment
```bash
# Function to create new payment transactions
supabase functions deploy create-payment
```

#### Function 2: Payment Webhook
```bash
# Function to handle payment status callbacks
supabase functions deploy payment-webhook
```

#### Function 3: Check Payment Status
```bash
# Function to check payment status
supabase functions deploy check-payment-status
```

#### Function 4: Cancel Payment
```bash
# Function to cancel pending payments
supabase functions deploy cancel-payment
```

### 3. Environment Variables Configuration

Set these environment variables in your Supabase project:

#### Supabase Edge Functions
```bash
# In Supabase Dashboard → Settings → Edge Functions
TOYS4PEACE_MERCHANT_ID=your_merchant_id_here
TOYS4PEACE_SECRET_KEY=your_secret_key_here
```

#### Frontend Application
```bash
# In your .env file
VITE_SUPABASE_URL=https://ctdakdqpmntycertugvz.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 4. Update Merchant Configuration

After running the database schema, update the merchant configuration:

```sql
-- Update with your actual merchant ID
UPDATE merchant_config
SET merchant_id = 'your_actual_merchant_id_here',
    webhook_endpoint = 'https://ctdakdqpmntycertugvz.supabase.co/functions/v1/payment-webhook'
WHERE gateway = 'toys4peace';
```

## 🚀 Usage

### 1. Frontend Integration

The payment flow is automatically integrated into your checkout form. Here's how it works:

```typescript
import PaymentGatewayService from '@/services/paymentGatewayService';

// Create payment (handled automatically by checkout form)
const payment = await PaymentGatewayService.createPayment({
  orderId: 'order_id_here',
  amount: 599.00
});

// Check payment status
const status = await PaymentGatewayService.checkPaymentStatus(paymentId);

// Cancel payment
const cancelled = await PaymentGatewayService.cancelPayment(paymentId);
```

### 2. Payment Flow Process

1. **Customer submits checkout form**
2. **Order is created in database**
3. **Payment transaction is created via API**
4. **UPI payment details are shown to customer**
5. **Customer completes payment via UPI app**
6. **Payment gateway sends webhook callback**
7. **Order status is updated automatically**
8. **Customer receives confirmation**

### 3. Webhook Setup

The webhook endpoint is automatically set up with your Edge Functions:

```
https://your-project.supabase.co/functions/v1/payment-webhook
```

## 🔍 Monitoring & Debugging

### 1. Payment Transaction Logs

Check payment transactions in Supabase:

```sql
SELECT * FROM payment_transactions ORDER BY created_at DESC;
```

### 2. Webhook Logs

View webhook processing logs:

```sql
SELECT * FROM payment_webhook_logs ORDER BY created_at DESC;
```

### 3. Error Tracking

Monitor payment errors:

```sql
SELECT * FROM payment_transactions
WHERE status IN ('failed', 'cancelled')
ORDER BY created_at DESC;
```

### 4. Browser Console

Check browser console for:
- Payment creation status
- Real-time payment updates
- Network request details

## ⚡ Performance Features

### 1. Real-Time Updates
- Automatic payment status updates
- Real-time order status synchronization
- Live payment countdown timers

### 2. Security Features
- Row Level Security (RLS) enabled
- Secure credential storage
- Input validation and sanitization
- Rate limiting on form submissions

### 3. Error Handling
- Comprehensive error logging
- User-friendly error messages
- Automatic retry mechanisms
- Graceful failure handling

### 4. Payment Expiry
- Automatic payment cancellation after 3 minutes
- Visual countdown timer
- Automatic status updates

## 🧪 Testing

### 1. Test Payment Creation

```javascript
// In browser console
const payment = await PaymentGatewayService.createPayment({
  orderId: 'test-order-123',
  amount: 100.00
});
console.log(payment);
```

### 2. Test Payment Status Check

```javascript
// In browser console
const status = await PaymentGatewayService.checkPaymentStatus('payment-id-here');
console.log(status);
```

### 3. Test Webhook

```bash
# Test webhook endpoint
curl -X POST https://your-project.supabase.co/functions/v1/payment-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "status": "COMPLETED",
    "orderId": "test123",
    "transactionId": "G155677OKDL",
    "amount": 1025,
    "vpaId": "test@okicici",
    "bank_ref": "1234567890"
  }'
```

## 🔧 Configuration Options

### 1. Payment Timeout

Default timeout is 180 seconds (3 minutes). Modify in:

```sql
-- In merchant_config table
UPDATE merchant_config
SET config = '{"expiry_seconds": 180, "retry_attempts": 3}'
WHERE gateway = 'toys4peace';
```

### 2. Retry Attempts

Configure automatic retry behavior:

```sql
UPDATE merchant_config
SET config = '{"expiry_seconds": 180, "retry_attempts": 3}'
WHERE gateway = 'toys4peace';
```

### 3. Currency Settings

The system defaults to INR. To change currency:

```sql
UPDATE payment_providers
SET config = '{"api_base": "https://api.toys4peace.workers.dev", "transaction_expiry": 180, "currency": "INR"}'
WHERE name = 'toys4peace';
```

## 🚨 Troubleshooting

### 1. Payment Creation Fails

**Issue**: `Payment creation failed`
**Solution**:
- Check merchant credentials in environment variables
- Verify network connectivity
- Check Supabase Edge Function logs

### 2. Webhook Not Received

**Issue**: Payment status not updating
**Solution**:
- Verify webhook URL is correct
- Check webhook logs in Supabase
- Ensure payment gateway has correct webhook URL

### 3. Payment Status Stuck

**Issue**: Payment shows as pending forever
**Solution**:
- Check if payment expired (180 second timeout)
- Manually check payment status with Toys4Peace API
- Verify order ID matches

### 4. CORS Errors

**Issue**: Cross-origin request blocked
**Solution**:
- Verify CORS headers in Edge Functions
- Check Supabase project settings
- Ensure correct frontend URL configuration

## 📊 Analytics & Reporting

### 1. Payment Success Rate

```sql
SELECT
  status,
  COUNT(*) as count,
  COUNT(*) * 100.0 / (SELECT COUNT(*) FROM payment_transactions) as percentage
FROM payment_transactions
GROUP BY status;
```

### 2. Daily Payment Volume

```sql
SELECT
  DATE(created_at) as date,
  COUNT(*) as transaction_count,
  SUM(amount) as total_amount
FROM payment_transactions
WHERE status = 'completed'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### 3. Payment Method Analytics

```sql
SELECT
  payment_method->>'type' as method,
  COUNT(*) as count,
  SUM(amount) as total_amount
FROM payment_transactions
WHERE status = 'completed'
GROUP BY payment_method->>'type';
```

## 🔒 Security Considerations

### 1. Credential Storage
- Never expose merchant credentials in frontend code
- Use Supabase secrets for sensitive data
- Rotate keys regularly

### 2. Input Validation
- All inputs are validated before processing
- SQL injection protection via parameterized queries
- XSS prevention via output encoding

### 3. Rate Limiting
- Form submission rate limiting (5 per minute)
- API request rate limiting
- Payment attempt limits

## 📞 Support

### For Payment Gateway Issues:
- Toys4Peace API Documentation
- Merchant dashboard support

### For Integration Issues:
- Supabase Documentation
- GitHub repository issues
- Development team contact

## 🔄 Future Enhancements

### Planned Features:
1. **Multiple Payment Methods**: Support for cards, net banking
2. **Subscription Payments**: Recurring payment support
3. **Advanced Analytics**: Payment performance dashboard
4. **Mobile App Support**: React Native integration
5. **International Payments**: Multi-currency support
6. **Advanced Fraud Detection**: ML-based security
7. **Payment Links**: Shareable payment requests
8. **Batch Processing**: Bulk payment operations

---

## ✅ Setup Complete Checklist

- [ ] Database schema executed
- [ ] Edge Functions deployed
- [ ] Environment variables configured
- [ ] Merchant credentials updated
- [ ] Webhook URL configured
- [ ] Frontend integration tested
- [ ] Payment flow tested end-to-end
- [ ] Error handling verified
- [ ] Monitoring enabled
- [ ] Documentation reviewed

Your NP Wellness Store is now equipped with a comprehensive payment gateway integration with real-time processing, secure credential management, and robust error handling.