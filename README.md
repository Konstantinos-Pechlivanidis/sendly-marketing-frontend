# Sendly Marketing Frontend

Simple frontend application for testing Sendly Marketing Backend authentication and functionality.

## 🚀 Quick Start

### Option 1: Using Python (Recommended)

```bash
# Python 3
python -m http.server 3000

# Then open: http://localhost:3000
```

### Option 2: Using Node.js

```bash
# Install http-server globally
npm install -g http-server

# Run server
http-server -p 3000

# Then open: http://localhost:3000
```

### Option 3: Using Scripts

**Windows:**
```bash
start-server.bat
```

**Linux/Mac:**
```bash
chmod +x start-server.sh
./start-server.sh
```

## 📁 Structure

- `index.html` - Login page
- `callback.html` - OAuth callback handler
- `dashboard.html` - Dashboard with stats
- `billing.html` - Billing & credits management
- `config.js` - Configuration (API URL)
- `api.js` - API client
- `auth.js` - Authentication logic
- `callback.js` - OAuth callback handler
- `dashboard.js` - Dashboard functionality
- `billing.js` - Billing functionality
- `styles.css` - Styling

## ⚙️ Configuration

Edit `config.js` to change the API URL:

```javascript
const CONFIG = {
    API_URL: 'https://sendly-marketing-backend.onrender.com',
    // For local development:
    // API_URL: 'http://localhost:8080',
};
```

## 🔐 Authentication Flow

1. User enters shop domain on login page
2. Redirects to Shopify OAuth
3. User authorizes the app
4. Shopify redirects back with authorization code
5. Backend exchanges code for access token
6. Backend generates JWT token
7. Frontend receives JWT token and stores it
8. User is redirected to dashboard

## 📝 Notes

- This is a simple testing frontend
- For production, consider building a proper React/Next.js app
- All API calls require JWT token in Authorization header
- Token is stored in localStorage

## 🔗 Backend Repository

Backend code: https://github.com/Konstantinos-Pechlivanidis/sendly-marketing-backend

