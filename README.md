# TipWise — Smart Tip Calculator

A premium, responsive tip calculator designed for real-world restaurant bill splitting.

## 🚀 Live Demo

👉 **[Open TipWise](https://vishwadevgupta.github.io/TipCalculator/)**

## ✨ Features

- 💵 Multiple currencies — USD, INR, EUR, GBP, AUD, CAD, SGD, AED, JPY
- 🎯 Tip presets and custom tip slider
- 👥 Equal bill splitting
- ⚖️ Unequal split mode
- 🧾 Tax and service-charge calculation
- 🔢 Round-up per-person totals
- 💰 Detailed bill, tip, tax, service and final-total breakdown
- 📋 One-click copy of the bill summary
- 📤 Native share support on compatible devices
- 💾 Saved calculation history
- 🧠 Persistent user preferences
- 🌙 Premium dark/light themes
- 📱 Responsive mobile-first UI
- 📲 Installable as a PWA
- 📴 Offline support through a service worker
- ♿ Accessible controls and keyboard-friendly inputs
- 💱 Locale-aware currency formatting

## 🛠️ Technologies

- HTML5
- CSS3
- JavaScript
- Local Storage API
- Clipboard API
- Web Share API
- Service Worker API
- Web App Manifest
- Intl.NumberFormat

## 📂 Project Structure

```
TipCalculator/
├── index.html
├── index.js
├── manifest.json
├── sw.js
└── README.md
```

## ▶️ Run Locally

No build tools or dependencies are required.

```bash
python3 -m http.server 8000
```

Then open:

```
http://localhost:8000
```

> A local HTTP server is recommended because PWA/service-worker features require a secure context or localhost.

## 🧮 Advanced Calculation

TipWise can calculate:

**Bill + Tip + Tax + Service Charge = Final Bill**

Then it can split the final amount across multiple people, with optional round-up and custom first-person sharing.

## 📱 PWA & Offline

Once the application has been loaded online, supported browsers can cache the core application so TipWise can continue working offline.

## 📄 License

This project is available for personal and educational use.
