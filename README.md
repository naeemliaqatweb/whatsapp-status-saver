# WhatsApp & WhatsApp Business Status Saver

Production-ready, high-performance React Native CLI application for saving, sharing, and reposting WhatsApp and WhatsApp Business statuses with 100% pixel-perfect Stitch design.

---

## 🌟 Key Features

1. **Dual WhatsApp Switcher**:
   - Seamless switch toggle between standard **WhatsApp** (`com.whatsapp`) and **WhatsApp Business** (`com.whatsapp.w4b`).
   - Separate status lists and persistence for each app.

2. **Full Media Support**:
   - **Images Tab**: 3-column responsive grid with timestamp badges and save indicators.
   - **Videos Tab**: High-definition video thumbnails with play badges and fullscreen video player.
   - **Saved Tab**: Dedicated gallery of all permanently saved statuses.

3. **Actions & Productivity**:
   - **One-Tap Save**: Downloads media directly to phone Gallery (`/Pictures/StatusSaver`).
   - **Direct Repost**: Repost status directly to your own WhatsApp status in one click.
   - **System Share**: Share images and videos across WhatsApp, Instagram, Telegram, etc.
   - **Multi-Selection Mode**: Long press or tap "Select All" to batch download or batch share multiple statuses simultaneously.
   - **Direct Chat**: Send a WhatsApp message to any unsaved phone number with country code.
   - **Interactive Tutorial**: Visual step-by-step guide explaining how status caching works.

4. **100% Stitch Pixel-Perfect UI**:
   - Exact Stitch color palette (`#00453d`, `#075e54`, `#25d366`, `#8cf1e1`, `#fbf9f8`).
   - Custom Material Symbols SVG icon set.
   - 60fps fast, responsive, and lightweight modular components.

---

## 📁 Directory Structure

```text
whatsapp-status-saver/
├── .agents/skills/          # Custom engineering skills
├── android/                 # Android Native Project (Permissions, FileProvider)
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   └── Icon.tsx             # Vector SVG Icons
│   │   ├── BatchActionBar.tsx      # Multi-select action banner
│   │   ├── BottomNavBar.tsx        # Bottom navigation bar
│   │   ├── CategoryTabs.tsx        # Images, Videos, Saved top tabs
│   │   ├── DirectChatModal.tsx     # Direct WhatsApp chat modal
│   │   ├── EmptyState.tsx          # No-status view with Open WhatsApp CTA
│   │   ├── FAB.tsx                 # Floating action download button
│   │   ├── FilterStrip.tsx         # Disappears in 24h & Select All
│   │   ├── Header.tsx              # App bar & WhatsApp switcher toggle
│   │   ├── HowItWorksModal.tsx     # Step-by-step tutorial modal
│   │   ├── MediaCard.tsx           # 3-column media card with badges
│   │   └── MediaViewerModal.tsx    # Full-screen photo/video viewer modal
│   ├── constants/
│   │   └── theme.ts                # Stitch design tokens (PALETTE, TYPOGRAPHY, SPACING)
│   ├── navigation/
│   │   └── AppNavigator.tsx        # Root navigation stack
│   ├── screens/
│   │   └── HomeScreen.tsx          # Master screen controller
│   ├── services/
│   │   └── statusScannerService.ts # Android SAF / .Statuses scanner, saving, sharing
│   ├── storage/
│   │   └── statusStorage.ts        # AsyncStorage persistence layer
│   └── types/
│       └── status.ts               # TypeScript interface definitions
├── App.tsx                         # Root app wrapper
├── app.json
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

---

## 🚀 Running the Project

### Prerequisites
- Node.js >= 20
- Android SDK configured (`ANDROID_HOME`)

### Start Metro Bundler
```bash
npm start
```

### Run on Android
```bash
npm run android
```
