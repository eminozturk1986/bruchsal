# 🚀 Deployment Guide for Bruchsal Quest

## 📁 Files to Upload to GitHub

Upload ALL these files to your `bruchsal` repository:

```
├── index.html              (Main game file)
├── style.css               (Baroque 8-bit styling)
├── script.js               (Game logic + GPS map)
├── manifest.json           (PWA configuration)
├── sw.js                   (Service worker for offline)
├── bruchsal_trivia_questions.csv  (Your questions)
├── README.md               (Project description)
├── sounds/
│   └── README.md           (Audio instructions)
├── icon-192.png            (App icon - create manually)
└── icon-512.png            (App icon - create manually)
```

## 🎨 Create App Icons (Required)

1. Open `create_icons.html` in browser
2. Download both icons (192x192 and 512x512)
3. Rename them to `icon-192.png` and `icon-512.png`
4. Upload to repository root

## 📤 Upload to GitHub

### Option A: GitHub Web Interface
1. Go to https://github.com/eminozturk1986/bruchsal
2. Click "uploading an existing file"
3. Drag ALL files from your game folder
4. Commit with message: "Add Bruchsal Quest PWA game"

### Option B: Git Commands (if you have Git)
```bash
cd "/mnt/c/Users/delye/Desktop/Claude Code/Sule_oyun"
git init
git add .
git commit -m "Add Bruchsal Quest PWA game"
git remote add origin https://github.com/eminozturk1986/bruchsal.git
git push -u origin main
```

## 🌐 Enable GitHub Pages

1. Go to repository **Settings** tab
2. Scroll to **Pages** section  
3. Source: **"Deploy from a branch"**
4. Branch: **"main"** (or "master")
5. Folder: **"/ (root)"**
6. Click **Save**

Your game will be live at:
`https://eminozturk1986.github.io/bruchsal/`

## 📱 Android Installation

### For Users:
1. Visit the GitHub Pages URL on Android
2. Open in **Chrome** or **Edge** browser
3. Tap browser menu → **"Add to Home screen"**
4. App installs like a native app!

### Features on Android:
- ✅ Works offline after first load
- ✅ Full-screen app experience  
- ✅ App icon on home screen
- ✅ GPS location tracking
- ✅ All sounds and animations
- ✅ Responsive mobile design

## 🔧 Troubleshooting

**If icons don't work:**
- Use any 192x192 and 512x512 PNG images
- Name them exactly `icon-192.png` and `icon-512.png`

**If PWA install doesn't appear:**
- Make sure manifest.json is uploaded
- Check all files are in repository root
- Try different browser (Chrome recommended)

**If GPS doesn't work:**
- Allow location permissions in browser
- Must use HTTPS (GitHub Pages provides this)
- Use "Skip GPS" button for testing

## ✅ Final Checklist

- [ ] All files uploaded to GitHub
- [ ] Icons created and uploaded  
- [ ] GitHub Pages enabled
- [ ] Game loads at GitHub Pages URL
- [ ] PWA install prompt appears on mobile
- [ ] CSV file with your Bruchsal questions included

**Ready to share!** 🎉