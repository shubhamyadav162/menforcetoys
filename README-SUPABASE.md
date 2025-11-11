# Supabase Integration for NP wellness store

This document explains the Supabase database integration that has been set up for your e-commerce website.

## ✅ What's Been Completed

### 1. Environment Configuration
- ✅ Created `.env` file with Supabase credentials
- ✅ Supabase client configured in `src/lib/supabase.ts`
- ✅ Database connection test in `src/App.tsx`

### 2. Database Schema
- ✅ Orders table schema created with all necessary fields:
  - Product information (ID, name, price, quantity)
  - Customer details (name, phone, address, city, state, pincode)
  - Order status (pending, confirmed, processing, shipped, delivered, cancelled)
  - Payment status (pending, paid, failed)
  - Timestamps and auto-updating fields

### 3. Frontend Integration
- ✅ Checkout page updated to save orders to Supabase
- ✅ Form validation and error handling
- ✅ Bilingual success messages
- ✅ Loading states and user feedback

### 4. Order Management System
- ✅ Created `/orders` page for viewing and managing orders
- ✅ Order status management (confirm, ship, deliver, cancel)
- ✅ Order deletion capability
- ✅ Bilingual support throughout

### 5. Official Supabase MCP Server Setup
- ✅ Created `.mcp.json` for official Supabase MCP integration
- ✅ Configured with project-specific access token
- ✅ Ready for cloud code integration with Claude Code
- ✅ Full database access through official Supabase MCP tools

## 🚀 How to Use

### For Website Users:
1. **Placing Orders**: Users fill out the checkout form and orders are automatically saved to Supabase
2. **Order Management**: Access `/orders` page to view and manage all orders

### For Database Management via MCP:
The official Supabase MCP server provides these capabilities:
- **Database Operations**: Create tables, query data, update records
- **Order Management**: View all orders, filter by status, update order status
- **Schema Management**: Inspect table structures, modify columns
- **SQL Queries**: Execute custom SQL queries with natural language
- **Analytics**: Generate reports and insights from your data
- **Real-time Monitoring**: Track database changes and performance

### Manual Database Setup:
If you need to manually set up the database, run this SQL in your Supabase SQL Editor:

```sql
-- The complete schema is available in src/lib/supabase.ts
-- Copy the ORDERS_TABLE_SCHEMA content and run it in Supabase
```

## 🔧 Configuration Details

### Environment Variables
The `.env` file contains:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Public key for client-side access
- `VITE_SUPABASE_SERVICE_ROLE_KEY` - Admin key for server operations
- `SUPABASE_DB_PASSWORD` - Database password

### Key Files
- `src/lib/supabase.ts` - Supabase client configuration and database types
- `src/pages/Checkout.tsx` - Order submission with Supabase integration
- `src/pages/Orders.tsx` - Order management interface
- `supabase-mcp.js` - MCP server for cloud database management
- `src/utils/initDatabase.ts` - Database initialization utilities

## 🎯 Features

### Order Management Workflow:
1. **Pending** → **Confirmed** → **Shipped** → **Delivered**
2. Orders can be cancelled at any stage
3. Automatic timestamp tracking
4. Bilingual support (English/Hindi)

### Security:
- Row Level Security (RLS) enabled
- Proper data validation
- Error handling for network issues
- Secure API key usage

## 📱 Access Points

- **Checkout**: `/checkout` - Customer order placement
- **Orders Management**: `/orders` - Admin order management
- **Development**: `http://localhost:8080` - Local development server

## 🔄 Next Steps

1. **Test the Integration**: Place a test order through the website
2. **Verify Database**: Check that orders appear in `/orders` page
3. **Set up MCP Server**: Configure the MCP server with your cloud code environment
4. **Customize Schema**: Modify the orders table schema if needed

## 🛠️ MCP Server Usage

To use the MCP server for cloud code management:

1. Install MCP server dependencies:
   ```bash
   npm install @modelcontextprotocol/sdk
   ```

2. Run the MCP server:
   ```bash
   node supabase-mcp.js
   ```

3. Connect to the MCP server from your cloud code environment to:
   - Manage orders programmatically
   - Run database queries
   - Monitor order status
   - Generate reports

The MCP server provides a secure way to manage your Supabase database from cloud code while maintaining proper access controls and data integrity.