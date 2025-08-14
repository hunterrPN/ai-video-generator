# ai-video-generator

🚀 Overview
A modern, full-stack web application that converts text prompts into high-quality 5-10 second videos using state-of-the-art AI APIs. Features real-time generation tracking, responsive design, and multiple AI provider integrations with smart fallback systems.
🎯 Key Features

🤖 AI-Powered Video Generation - Convert text descriptions to realistic videos
⚡ Real-Time Progress Tracking - Live status updates with WebSocket-style polling
🎨 Modern, Responsive UI - Beautiful glassmorphism design that works on all devices
🔄 Multi-Provider Fallback - Intelligent switching between multiple AI APIs
💰 Cost-Effective - Uses free API tiers (Luma Dream Machine, Replicate, Hugging Face)
📱 Progressive Web App - Installable with offline capabilities
🔒 Secure by Design - Proper API key management and input validation
☁️ Cloud-Ready - One-click deployment to Railway, Render, or Vercel


🔄 API Flow

User Input → Frontend validates and sanitizes prompt
API Request → FastAPI creates generation job with unique ID
Background Processing → Async task tries multiple AI providers
Status Polling → Frontend polls status endpoint every 2 seconds
Video Delivery → Completed video URL returned and displayed

ai-video-generator/
├── 📄 main.py                 # FastAPI application server
├── 🌐 static/                 # Frontend assets
│   ├── 📝 index.html          # Main UI interface
│   ├── 🎨 style.css           # Modern styling & animations
│   └── ⚡ script.js           # Interactive JavaScript
├── 📦 requirements.txt        # Python dependencies
├── 🔧 .env.example           # Environment template
├── 🐳 Dockerfile             # Container configuration
├── 🚂 railway.toml           # Railway deployment config
├── 📊 .gitignore             # Version control exclusions
└── 📚 README.md              # This documentation
