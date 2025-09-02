# 🎯 DROPS-CLIENT

**Modern Next.js frontend** for the DROPS betting odds scanner application with real-time data visualization and wallet integration.

## 🚀 **Features**

- ✅ **Next.js 14** - Latest React framework with App Router
- ✅ **Real-time Data** - Live betting odds and market updates
- ✅ **Wallet Integration** - Web3 wallet connection via AppKit
- ✅ **Responsive Design** - Mobile-first, works on all devices
- ✅ **Dark Theme** - Modern, professional UI design
- ✅ **Advanced Filters** - Search, sort, and filter markets
- ✅ **Real-time Updates** - Live data refresh with WebSocket support

## 🔧 **Tech Stack**

- **Framework**: Next.js 14 + React 18
- **Styling**: CSS-in-JS with styled-jsx
- **State Management**: React hooks + local storage
- **Wallet Integration**: AppKit + Wagmi
- **Build Tool**: Next.js built-in bundler
- **Deployment**: Vercel (recommended)

## 🏃‍♂️ **Quick Start**

### Prerequisites

- Node.js 18+
- npm or yarn
- Web3 wallet (MetaMask, WalletConnect, etc.)

### Local Development

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/DROPS-CLIENT.git
cd DROPS-CLIENT

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev

# Open http://localhost:3000
```

### Build for Production

```bash
# Build the application
npm run build

# Start production server
npm start

# Or export static files
npm run export
```

## 🌐 **Environment Variables**

Create `.env.local`:

```bash
# API Configuration
NEXT_PUBLIC_API_BASE=https://your-api-server.com

# Wallet Configuration
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_WALLET_CONNECT_CHAIN_ID=42161
```

## 📁 **Project Structure**

```
web/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.js          # Root layout
│   ├── page.js            # Home page
│   └── not-found.js       # 404 page
├── components/             # React components
│   ├── WalletConnect.js   # Wallet connection
│   ├── WalletButton.js    # Wallet button
│   └── Providers.js       # Context providers
├── lib/                    # Utility libraries
│   └── wallet-config.js   # Wallet configuration
├── public/                 # Static assets
│   └── drops_logo.png     # App logo
└── package.json            # Dependencies
```

## 🎨 **UI Components**

### WalletConnect

- Web3 wallet integration
- Connection status display
- Disconnect functionality

### Market Display

- Real-time odds visualization
- Responsive table layout
- Advanced filtering options

### Responsive Design

- Mobile-first approach
- Dark theme support
- Professional betting interface

## 🚀 **Deployment**

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Or connect to GitHub for auto-deploy
```

### Docker

```bash
# Build image
docker build -t drops-client .

# Run container
docker run -p 3000:3000 drops-client
```

## 🔧 **Development Scripts**

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run export       # Export static files
```

## 📱 **Browser Support**

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 **Contributing**

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 **License**

MIT License - see [LICENSE](../LICENSE) for details.

## 🔗 **Related Repositories**

- [DROPS-SERVER](../DROPS-SERVER) - Backend API server
- [DROPS-MAIN](../DROPS-MAIN) - Main project repository

## 📞 **Support**

- Create an issue for bugs or feature requests
- Join our Discord for community support
- Check documentation for common questions
