# Official Supabase MCP Server Setup

This guide explains how to set up the official Supabase MCP (Model Context Protocol) server for cloud code integration with your NP wellness store.

## 🚀 Quick Setup

### Step 1: Configure MCP Server

Add the official Supabase MCP server to your Claude Code project:

```bash
claude mcp add --scope project --transport http supabase "https://mcp.supabase.com/mcp"
```

Or manually add this to your `.mcp.json`:
```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp",
      "headers": {
        "Authorization": "Bearer ${SUPABASE_ACCESS_TOKEN}"
      }
    }
  }
}
```

### Step 2: Authenticate with Supabase

Run the MCP authentication command:
```bash
claude /mcp
```

Select the "supabase" server, then "Authenticate" to begin the OAuth flow.

### Step 3: Set Environment Variables

Make sure these environment variables are set in your environment:
```bash
export SUPABASE_ACCESS_TOKEN=sbp_f7cd120c88555bbd0d540c4730d1668db82de2cd
export SUPABASE_PROJECT_REF=ctdakdqpmntycertugvz
```

## 📋 Project Details

- **Project Name**: sextoy
- **Organization**: playpataka@gmail.com's OrgFree
- **Project URL**: https://ctdakdqpmntycertugvz.supabase.co
- **Project ID**: ctdakdqpmntycertugvz
- **Project Ref**: ctdakdqpmntycertugvz
- **Region**: South Asia (Mumbai)

## 🔐 Security Configuration

### Environment Variables (.env)
```env
VITE_SUPABASE_URL=https://ctdakdqpmntycertugvz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0ZGFrZHFwbW50eWNlcnR1Z3Z6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0OTExNjMsImV4cCI6MjA3ODA2NzE2M30.bjwDrvBaVpcQzXZ3vaYw-3TZbmW5SFhpwci5ieJG-cI
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0ZGFrZHFwbW50eWNlcnR1Z3Z6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjQ5MTE2MywiZXhwIjoyMDc4MDY3MTYzfQ.UZhttkueYuqdTVdUgHfU_esS-3YT_nJlh64xVoJ4FFs
SUPABASE_DB_PASSWORD=Sextoy@2025
SUPABASE_PROJECT_ID=ctdakdqpmntycertugvz
SUPABASE_PROJECT_REF=ctdakdqpmntycertugvz
SUPABASE_ACCESS_TOKEN=sbp_f7cd120c88555bbd0d540c4730d1668db82de2cd
```

## 🎯 What You Can Do with Official Supabase MCP

Once connected, you can ask Claude to:

### Database Management
```text
"Show me all orders from the past week"
"Update order status to 'shipped' for order ID xxx"
"Create a report of pending orders"
"Check how many orders are in each status"
```

### Order Analytics
```text
"Generate a sales report for this month"
"Show me the most popular products"
"What's our average order value?"
"List all orders from Mumbai"
```

### Database Schema
```text
"Show me the structure of the orders table"
"Add a new column for tracking delivery date"
"Create an index on the phone number field"
```

## 🔒 Security Best Practices

### ✅ Recommended
- **Project Scoping**: MCP server is scoped to your specific project only
- **Manual Approval**: Keep manual tool call approval enabled
- **Development Environment**: Use with development data first
- **Read-Only Mode**: Set to read-only if working with sensitive data

### ⚠️ Important Notes
- Never connect MCP to production data with sensitive customer information
- Always review tool calls before executing them
- The MCP server operates under your developer permissions
- Do not share MCP access with customers or end users

## 🛠️ Advanced Configuration

### CI/CD Setup
For CI environments, use this configuration:
```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=${SUPABASE_PROJECT_REF}",
      "headers": {
        "Authorization": "Bearer ${SUPABASE_ACCESS_TOKEN}"
      }
    }
  }
}
```

### Feature Groups
You can enable/disable specific feature groups:
- Database operations
- Storage operations
- Auth operations
- Edge functions

## 🚀 Next Steps

1. **Test Connection**: Try asking Claude to query your orders table
2. **Explore Capabilities**: Test various database operations
3. **Set Up Monitoring**: Use MCP for database health checks
4. **Automate Reports**: Generate regular sales and analytics reports

## 📞 Support

For any issues with the Supabase MCP server:
- Check the [Supabase MCP Documentation](https://supabase.com/docs/guides/ai/mcp)
- Review the [Claude Code Documentation](https://docs.claude.com/en/docs/claude_code)
- Use the `/mcp` command in Claude Code for troubleshooting

Your NP wellness store is now ready for advanced database management through the official Supabase MCP server! 🎉