# README Assets & Banner Creation Guide

This guide helps you create professional visual assets for the repository README, including a banner/header image and social media preview card.

---

## 📐 Banner/Header Image

A professional banner at the top of the README creates an immediate visual impact and brand recognition.

### Recommended Dimensions
- **Width:** 1280px (GitHub optimal width)
- **Height:** 320-480px (avoid too tall)
- **Aspect Ratio:** 16:5 or 16:4
- **Format:** PNG (transparency support) or SVG (scalable)
- **File Size:** Keep under 500KB for fast loading

### Design Elements

**Must Include:**
1. **Project Name:** "Meteo Weather App" in large, readable font
2. **Tagline:** "Self-hostable weather dashboard with AI-powered features"
3. **Key Visual:** Screenshot of dashboard or weather visualization
4. **Technology Badges:** React, Node.js, Docker, Claude AI logos
5. **Call to Action:** "Try Demo" or "Get Started" button graphic

**Color Scheme:**
- **Primary:** `#1e293b` (dark slate) - matches app header
- **Accent:** `#3b82f6` (blue) - links and interactive elements
- **Background:** `#f8fafc` (light) or `#0f172a` (dark)
- **Gradient:** Optional subtle gradient for visual interest

### Tools Recommended

**Free/Open Source:**
- [Canva](https://www.canva.com/) - Web-based, templates available
- [Figma](https://www.figma.com/) - Professional design tool
- [GIMP](https://www.gimp.org/) - Desktop image editor
- [Inkscape](https://inkscape.org/) - Vector graphics editor (for SVG)

**Paid (Professional):**
- Adobe Photoshop
- Adobe Illustrator
- Affinity Designer

### Design Templates

**Option 1: Split Layout**
```
┌─────────────────────────────────────────────────┐
│  ☁️ Meteo Weather App                           │
│  Self-hostable weather dashboard                │
│  with AI-powered features                       │
│                                                  │
│  [React] [Node.js] [Docker] [Claude AI]        │
│  [Try Demo →]                                   │
└─────────────────────────────────────────────────┘
    ↑ Left side: Text                  Right side: Screenshot ↑
```

**Option 2: Centered with Screenshot Background**
```
┌─────────────────────────────────────────────────┐
│           [Screenshot with overlay]             │
│                                                  │
│        ☁️ Meteo Weather App                      │
│   Self-hostable Weather Dashboard               │
│   with AI-Powered Features                      │
│                                                  │
│  [React] [Node.js] [Docker] [Claude AI]        │
└─────────────────────────────────────────────────┘
```

**Option 3: Minimal with Gradient**
```
┌─────────────────────────────────────────────────┐
│  [Gradient background: #1e293b → #3b82f6]      │
│                                                  │
│          ☁️ Meteo Weather App                    │
│     Self-hostable weather dashboard             │
│                                                  │
│  🚀 9.4/10 Security  |  ♿ WCAG AA  |  🧪 476 Tests │
└─────────────────────────────────────────────────┘
```

### Example Banner Code

Once created, add to README.md:

```markdown
<div align="center">

![Meteo Weather App Banner](docs/assets/banner.png)

</div>
```

Or with clickable link:

```markdown
<div align="center">

[![Meteo Weather App Banner](docs/assets/banner.png)](https://meteo-beta.tachyonfuture.com)

</div>
```

---

## 🌐 Social Media Preview Card (Open Graph)

GitHub uses Open Graph meta tags for social sharing. Create a preview card image for Twitter/LinkedIn/Slack.

### Recommended Dimensions
- **Width:** 1200px
- **Height:** 630px (1.91:1 ratio - Open Graph standard)
- **Format:** PNG or JPG
- **File Size:** Under 1MB (social media compression)

### Setup in GitHub

1. Create image at `docs/assets/og-image.png`
2. Go to **GitHub repo Settings → General → Social preview**
3. Upload image
4. Preview how it appears when shared

### Design Considerations
- **Large, readable text** (many platforms show small thumbnails)
- **High contrast** for visibility on different backgrounds
- **No text cutoff** - keep important content centered
- **Mobile preview** - test how it looks on small screens

---

## 🎨 Asset Directory Structure

Organize visual assets in `docs/assets/`:

```
docs/assets/
├── banner.png          # Main README banner (1280x400)
├── banner.svg          # SVG version (scalable)
├── og-image.png        # Social media preview (1200x630)
├── logo.png            # Project logo (512x512)
├── logo.svg            # Vector logo
└── badges/             # Custom badge graphics
    ├── security.svg
    ├── accessibility.svg
    └── performance.svg
```

---

## 🖼️ Quick Banner Creation with Canva

**Step-by-Step:**

1. **Create account** at [canva.com](https://www.canva.com/) (free)
2. **Custom dimensions:** 1280 x 400 px
3. **Choose template:** Search "banner" or "header"
4. **Customize:**
   - Replace text with "Meteo Weather App"
   - Add tagline: "Self-hostable weather dashboard with AI features"
   - Upload a screenshot of your app (from `docs/screenshots/`)
   - Add technology logos (search elements: React, Node.js, Docker)
   - Adjust colors to match app theme (#1e293b, #3b82f6)
5. **Download:** PNG format, 1280x400px
6. **Save to:** `docs/assets/banner.png`

**Pro Tip:** Use Canva's "Brand Kit" to save your colors and fonts for consistency.

---

## 📊 Badge Customization

Enhance existing shields.io badges with custom graphics:

### Custom Badge with Logo

```markdown
![Custom Badge](https://img.shields.io/badge/Meteo-Weather_App-blue?style=for-the-badge&logo=data:image/svg+xml;base64,<BASE64_ENCODED_SVG>)
```

### Badge Collections

Group related badges with HTML:

```html
<div align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/MySQL-00000F?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL">
</div>
```

---

## 🎯 Checklist for Professional README Visuals

Before considering visuals complete:

- [ ] Banner image created (1280x400px minimum)
- [ ] Banner includes project name, tagline, and key visual
- [ ] Colors match app branding (#1e293b, #3b82f6)
- [ ] Technology badges/logos included in banner
- [ ] File size optimized (under 500KB)
- [ ] Social media preview card created (1200x630px)
- [ ] GitHub Social Preview configured
- [ ] Logo created in multiple sizes (PNG + SVG)
- [ ] All assets stored in `docs/assets/`
- [ ] Banner referenced in README.md
- [ ] Tested appearance on light and dark GitHub themes

---

## 🔗 Resources & Inspiration

**Design Inspiration:**
- [GitHub Explore](https://github.com/explore) - Browse trending repos
- [Awesome READMEs](https://github.com/matiassingers/awesome-readme) - Curated list
- [Readme.so](https://readme.so/) - README generator with previews

**Assets & Icons:**
- [Shields.io](https://shields.io/) - Badge generator
- [Simple Icons](https://simpleicons.org/) - Technology logos
- [Font Awesome](https://fontawesome.com/) - Icon library
- [Unsplash](https://unsplash.com/) - Free stock photos
- [Pexels](https://www.pexels.com/) - Free stock images

**Color Palette Tools:**
- [Coolors](https://coolors.co/) - Color scheme generator
- [Adobe Color](https://color.adobe.com/) - Color wheel and harmony
- [Paletton](https://paletton.com/) - Color scheme designer

**Typography:**
- [Google Fonts](https://fonts.google.com/) - Free web fonts
- [Font Squirrel](https://www.fontsquirrel.com/) - Commercial-use fonts

---

## 📝 Example: Complete Header Section

Here's what the README header could look like with all enhancements:

```markdown
<div align="center">

[![Meteo Weather App Banner](docs/assets/banner.png)](https://meteo-beta.tachyonfuture.com)

# Meteo Weather App

**Self-hostable weather dashboard with AI-powered features**

🌐 **[Live Demo](https://meteo-beta.tachyonfuture.com)** | 📚 **[Documentation](docs/README.md)** | 🚀 **[Quick Start](#-quick-start)**

---

<!-- Existing badges here -->

</div>
```

This creates a visually appealing, clickable banner that immediately communicates the project's purpose and quality.

---

**Last Updated:** November 7, 2025
**Maintained by:** Michael Buckingham
