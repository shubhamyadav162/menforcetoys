# MCP Database Management Guide for Supabase

## 🎯 Setup Complete!

Your Supabase project has been configured with MCP (Model Context Protocol) for database management.

### 📋 Project Details
- **Project Name**: sextoy
- **Project URL**: https://ctdakdqpmntycertugvz.supabase.co
- **Project ID**: ctdakdqpmntycertugvz
- **Region**: South Asia (Mumbai)

### 🔑 MCP Configuration
Your MCP server has been configured with:
- **Server Name**: `supabase-sextoy`
- **Endpoint**: `https://ctdakdqpmntycertugvz.supabase.co/rest/v1/`
- **Authentication**: Service Role Key (admin access)

## 📊 Database Tables Created

The following tables have been set up in your Supabase database:

### Core Tables
1. **users** - User accounts and profiles
2. **categories** - Product categories
3. **products** - Product catalog
4. **orders_new** - Customer orders
5. **order_items** - Order line items
6. **shopping_cart** - Shopping cart data
7. **shipping_addresses** - Customer shipping addresses
8. **coupons** - Discount coupons

## 🚀 How to Use MCP for Database Management

### 1. **Query Data**
You can now query your database using natural language through MCP:

```
"Show me all users from the users table"
"Get all products in the electronics category"
"Find orders placed in the last 7 days"
```

### 2. **Insert Data**
```
"Add a new user with email test@example.com"
"Create a new product called 'Wireless Headphones' with price 2999"
"Insert a new category for 'Accessories'"
```

### 3. **Update Data**
```
"Update the price of product with ID 123 to 3999"
"Change the status of order 456 to 'shipped'"
"Mark user with email test@example.com as verified"
```

### 4. **Delete Data**
```
"Delete all items from shopping cart for session abc123"
"Remove expired coupons"
"Delete user with ID 789"
```

### 5. **Schema Management**
```
"Show me the schema of the products table"
"What columns are in the orders table?"
"Add a new column 'last_login' to the users table"
```

## 🔧 Advanced Operations

### **Complex Queries**
```
"Find all users who have placed more than 5 orders"
"Show me top 10 best-selling products"
"Calculate total revenue for this month"
"Get customers who haven't ordered in 30 days"
```

### **Analytics & Reporting**
```
"Generate a sales report for the last quarter"
"Show me product inventory levels"
"Calculate average order value"
"List all active coupons and their usage"
```

### **Data Management**
```
"Backup all user data"
"Clean up abandoned shopping carts older than 30 days"
"Update product inventory from CSV file"
"Generate customer email list for newsletter"
```

## 🌐 Direct Database Access

You can also access your database directly:

### **Supabase Dashboard**
- URL: https://app.supabase.com/project/ctdakdqpmntycertugvz
- Use your email: playpataka@gmail.com

### **Connection Strings**
- **PostgreSQL**: `postgresql://postgres.ctdakdqpmntycertugvz:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`
- **REST API**: `https://ctdakdqpmntycertugvz.supabase.co/rest/v1/`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0ZGFrZHFwbW50eWNlcnR1Z3Z6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0OTExNjMsImV4cCI6MjA3ODA2NzE2M30.bjwDrvBaVpcQzXZ3vaYw-3TZbmW5SFhpwci5ieJG-cI`

## 📝 Sample MCP Commands

### **Product Management**
```
"List all products with price greater than 5000"
"Add a new product: 'Smart Watch', price 12000, category 'Electronics'"
"Update product inventory for ID 123 to 50 units"
"Delete products with zero inventory"
```

### **Order Management**
```
"Show all pending orders"
"Update order status from 'pending' to 'processing' for order 456"
"Calculate total sales for today"
"Get orders for user with email customer@example.com"
```

### **Customer Management**
```
"Find all users from Kathmandu"
"Update user profile for ID 789"
"Get customer order history"
"Export user data for email marketing"
```

## 🔒 Security Notes

- Your MCP server is configured with **Service Role Key** - use with caution
- Row Level Security (RLS) is enabled on all tables
- Always validate data before bulk operations
- Regular backups are recommended

## 🛠️ Troubleshooting

### **If MCP commands fail:**
1. Check your internet connection
2. Verify the MCP server is running
3. Ensure Supabase project is active
4. Check API key permissions

### **Common Issues:**
- **Timeout errors**: Break large operations into smaller chunks
- **Permission denied**: Verify RLS policies
- **Connection issues**: Check Supabase status

## 📞 Support

- **Supabase Dashboard**: https://app.supabase.com/project/ctdakdqpmntycertugvz
- **Documentation**: https://supabase.com/docs
- **Status Page**: https://status.supabase.com

---

## 🎉 You're All Set!

Your Supabase database is now fully integrated with MCP. You can manage your entire database using natural language commands. Start by trying some of the sample commands above, or ask MCP to help you with any database operation you need!

**Happy Database Management! 🚀**