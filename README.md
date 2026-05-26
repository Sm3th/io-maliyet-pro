<div align="center">

<img src="assets/logo.svg" width="96" height="96" alt="IO Software Logo"/>

# IO Maliyet Pro

**Professional cost calculation and project management desktop app**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-2.0.0-brightgreen.svg)](CHANGELOG.md)
[![Electron](https://img.shields.io/badge/Electron-28-47848F?logo=electron)](https://www.electronjs.org/)
[![Platform](https://img.shields.io/badge/platform-Windows-0078D4?logo=windows)](https://github.com)

*Built with ❤️ by [İsmet Organ](https://github.com/sm3th) · IO Software*

---

[📥 Download](#-download) · [✨ Features](#-features) · [🚀 Getting Started](#-getting-started) · [⌨️ Shortcuts](#️-keyboard-shortcuts) · [🗂️ Project Structure](#️-project-structure)

</div>

---

## 📥 Download

Head to [**Releases**](../../releases/latest) and grab the latest version:

| File | Description |
|------|-------------|
| `IO-Maliyet-Pro-Setup-x.x.x.exe` | Windows installer (recommended) |
| `IO-Maliyet-Pro-x.x.x-portable.exe` | Portable — no install needed |

> **No Node.js required** to run the built `.exe`. Everything is bundled.

---

## ✨ Features

### 📁 Project Management
- Create and manage unlimited projects
- Per-project start/end date with automatic day calculation
- Configurable commission percentage (0%–25%)
- KDV / VAT calculation (0%, 1%, 8%, 10%, 18%, 20%)

### 💰 Cost Tracking
- Add, edit, reorder cost items with category badges
- Categories: Malzeme, İşçilik, Nakliye, Hırdavat, Hizmet, Diğer
- Automatic cost ↔ expense difference calculation
- Column sorting and category filtering
- Bulk selection

### 💳 Payment Tracking
- Log payments with date, amount, and description
- Auto-calculated remaining balance and overpayment

### 📊 Dashboard & Analysis
- Live summary statistics across all projects
- Category breakdown donut chart
- Project comparison bar chart
- Top-5 most expensive cost items

### 🌍 Internationalization
- **3 languages:** Turkish 🇹🇷 · English 🇬🇧 · Polish 🇵🇱
- **4 currencies:** ₺ TL · $ USD · € EUR · zł PLN

### 🎨 UI & UX
- Dark and light theme with one-click toggle
- DM Sans + DM Mono typography
- Smooth animations and hover states
- Sidebar with recent projects quick-access

### 💾 Data
- Auto-save to `localStorage`
- JSON backup export / import
- CSV export per project
- Print / PDF-ready report with company branding

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18+ (LTS recommended)
- npm (included with Node.js)

### Install & Run

```bash
# 1. Clone the repo
git clone https://github.com/sm3th/io-maliyet-pro.git
cd io-maliyet-pro

# 2. Install dependencies
npm install

# 3. Start in development mode
npm start
```

### Build .exe

> **Important:** Run PowerShell as Administrator for the build step.

```bash
# Full build — NSIS installer + portable .exe
npm run build

# Portable only (faster, no admin needed in most cases)
npm run build:portable
```

Output goes to `dist/`.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + N` | New project |
| `Ctrl + S` | Save |
| `Ctrl + F` | Focus search |
| `Ctrl + D` | Go to Dashboard |
| `Ctrl + P` | Go to Projects |
| `Ctrl + T` | Toggle theme |
| `Insert` | Add cost item (in detail view) |
| `Esc` | Close modal |

---

## 🗂️ Project Structure

```
io-maliyet-pro/
│
├── assets/
│   ├── logo.svg          # Vector logo (IO monogram)
│   ├── icon.ico          # Windows app icon
│   ├── icon_256.png      # High-res icon
│   └── icon_64.png       # Small icon
│
├── index.html            # Main UI — all views (Dashboard, Projects, Detail, Analysis, Settings)
├── style.css             # Design system — dark/light themes, component styles
├── app.js                # Application logic — state, CRUD, charts, export
├── i18n.js               # Translations — TR / EN / PL
├── main.js               # Electron entry point + native menu
│
├── package.json          # Dependencies + electron-builder config
├── CHANGELOG.md          # Version history
├── LICENSE               # MIT License
└── README.md             # This file
```

---

## 🖼️ Screenshots

> Add screenshots to a `screenshots/` folder and uncomment below after taking them.

<!--
| Dashboard | Project Detail | Analysis |
|-----------|---------------|----------|
| ![Dashboard](screenshots/dashboard.png) | ![Detail](screenshots/detail.png) | ![Analysis](screenshots/analysis.png) |
-->

*Screenshots coming soon.*

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | [Electron 28](https://www.electronjs.org/) |
| UI | HTML5 + CSS3 + Vanilla JS |
| Typography | [DM Sans](https://fonts.google.com/specimen/DM+Sans) + [DM Mono](https://fonts.google.com/specimen/DM+Mono) |
| Packaging | [electron-builder 24](https://www.electron.build/) |
| Storage | `localStorage` (no external DB) |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

MIT © 2026 [İsmet Organ](https://github.com/sm3th)

See [LICENSE](LICENSE) for full text.

---

<div align="center">
  <sub>Made with ☕ in Warsaw · IO Software</sub>
</div>
