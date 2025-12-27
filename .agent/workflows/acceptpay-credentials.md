---
description: AcceptPay API Credentials and Integration Reference
---

# AcceptPay API Credentials

## Merchant Account Details
| Field | Value |
|-------|-------|
| Merchant Name | NP Wellness |
| Dashboard Email | admin@npwellness.com |
| Password | wellness@123 |
| Merchant ID | 6933e42c8e301e47df09a366 |
| API Key | ak_a4b3e4b9369cfc5a3aa69a141bb441611869f309db15d60f |
| API Secret | ⚠️ Get from Settings → API Secret (keep confidential!) |

## API Configuration
| Field | Value |
|-------|-------|
| API Base URL | https://acceptpay.publicvm.com |
| Dashboard URL | https://acceptpayfrontend.vercel.app |

---

# ⚠️ IMPORTANT: Authentication Method

AcceptPay uses **API Key + API Secret in the request BODY**, NOT Authorization headers!

❌ **WRONG (Do NOT use):**
```
Authorization: Bearer your-api-key
```

✅ **CORRECT (Use this):**
```json
{ 
  "apiKey": "your-api-key", 
  "apiSecret": "your-api-secret", 
  ...other fields 
}
```

---

# API Endpoints Reference

## 1. Create Transaction
**POST** `https://acceptpay.publicvm.com/api/v1/transaction/initiate-transaction`

### Headers
```
Content-Type: application/json
```

### Request Body
```json
{
  "apiKey": "ak_a4b3e4b9369cfc5a3aa69a141bb441611869f309db15d60f",
  "apiSecret": "YOUR_API_SECRET_HERE",
  "amount": 500,
  "billId": "ORDER_12345",
  "customerName": "John Doe",
  "mobileNumber": "9876543210",
  "email": "customer@example.com",
  "description": "Payment for Order #12345",
  "gateway": "razorpay"
}
```

### Response (200 OK)
```json
{
  "status": "success",
  "code": 200,
  "message": "Transaction initiated",
  "data": {
    "_id": "694xxx...",
    "amount": 500,
    "status": "initiated",
    "billId": "ORDER_12345"
  },
  "paymentLink": "https://acceptpayfrontend.vercel.app/pay?txn=694xxx..."
}
```

## 2. Generate QR Code (Optional)
**POST** `https://acceptpay.publicvm.com/api/v1/transaction/request-transaction`

### Request Body
```json
{
  "transactionId": "694xxx...",
  "method": "qr",
  "app": "gpay"
}
```

### Response (200 OK)
```json
{
  "status": "success",
  "result": {
    "upiString": "upi://pay?pa=pitarafun877265.rzp@rxaxis&pn=Pitara%20Fun&am=500...",
    "razorpayQrId": "qr_Ruxxx..."
  }
}
```

💡 **Tip:** Use the upiString to generate QR code image:
`https://api.qrserver.com/v1/create-qr-code/?data=YOUR_UPI_STRING`

## 3. Check Payment Status
**GET** `https://acceptpay.publicvm.com/api/v1/transaction/status-of-transaction/:transactionId`

### Response (200 OK)
```json
{
  "status": "success",
  "result": {
    "_id": "694xxx...",
    "status": "COMPLETED",
    "amount": 500,
    "vpaId": "customer@upi",
    "paidAt": "2024-12-25T10:30:00.000Z"
  }
}
```

### Transaction Status Values
| Status | Description |
|--------|-------------|
| initiated | Transaction created, waiting for payment |
| COMPLETED | Payment successful |
| FAILED | Payment failed |
| TIMEOUT | Transaction expired |

---

# Webhook Configuration

## Webhook Payload (payment.completed)
```json
{
  "event": "payment.completed",
  "timestamp": "2024-12-25T10:30:00.000Z",
  "data": {
    "transactionId": "694xxx...",
    "status": "COMPLETED",
    "amount": 500,
    "currency": "INR",
    "paymentMethod": "upi",
    "customerEmail": "customer@example.com",
    "customerPhone": "9876543210",
    "billId": "ORDER_12345",
    "completedAt": "2024-12-25T10:30:00.000Z"
  }
}
```

---

# Quick Reference
| Action | Method | Endpoint |
|--------|--------|----------|
| Create Transaction | POST | /api/v1/transaction/initiate-transaction |
| Generate QR | POST | /api/v1/transaction/request-transaction |
| Check Status | GET | /api/v1/transaction/status-of-transaction/:id |

---

# Error Codes
| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Transaction created successfully |
| 400 | Bad Request | Invalid or missing parameters |
| 401 | Unauthorized | Invalid or missing API key/secret |
| 404 | Not Found | Transaction not found |
| 500 | Server Error | Internal server error |

---

# Troubleshooting

If you're getting "Invalid credentials" error, make sure:
1. You're using `initiate-transaction` NOT `initiate`
2. You're sending `apiKey` and `apiSecret` in the **request body**
3. You're NOT using `Authorization` header
4. Your API Secret is correct (get it from Settings)
