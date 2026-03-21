/**
 * Gitpub — GitHub Repository Manager & Website Builder
 * Main application logic
 * Vanilla ES6+, no frameworks
 */

'use strict';

/* ── XOR obfuscation for token storage ───────────────────── */
const XOR_KEY = 42;
const xorStr = (str) =>
  str.split('').map(c => String.fromCharCode(c.charCodeAt(0) ^ XOR_KEY)).join('');

/* ── Language colour map ─────────────────────────────────── */
const LANG_COLORS = {
  JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5',
  HTML:       '#e34c26', CSS:        '#563d7c', Rust:   '#dea584',
  Go:         '#00ADD8', Java:       '#b07219', C:      '#555555',
  'C++':      '#f34b7d', 'C#':       '#178600', PHP:    '#4F5D95',
  Ruby:       '#701516', Swift:      '#F05138', Kotlin: '#A97BFF',
  Dart:       '#00B4AB', Shell:      '#89e051', Vue:    '#41b883',
  Svelte:     '#ff3e00', default:    '#8b949e'
};

/* ── Emoji toolbar rows definition ──────────────────────────
   Each entry: [emoji, id, title]
   ─────────────────────────────────────────────────────────── */
const EMOJI_ROWS = [
  {
    label: 'Page Structure',
    buttons: [
      ['📍','moveUpDown',   'Move Up/Down'],
      ['📎','addPages',     'Add Pages'],
      ['🔧','quickFix',     'Quick Fix'],
      ['🪣','styles',       'Styles'],
      ['🧲','pullMemory',   'Pull Memory'],
      ['🟦','dropContent',  'Drop Content'],
      ['🧰','toolbox',      'Toolbox'],
    ]
  },
  {
    label: 'Data & Signal',
    buttons: [
      ['📡','signal',       'Signal'],
      ['🔬','microscope',   'Microscope'],
      ['🧫','petriDish',    'Petri Dish'],
      ['🥽','underwater',   'Underwater'],
      ['💍','beltPulley',   'Belt & Pulley'],
      ['👑','soulIntent',   'Soul Intent'],
      ['💊','diagnose',     'Diagnose'],
    ]
  },
  {
    label: 'Commerce & Media',
    buttons: [
      ['⚖️','metrics',      'Metrics'],
      ['🛒','shoppingCart', 'Shopping Cart'],
      ['💰','banking',      'Banking'],
      ['📀','addFiles',     'Add Files'],
      ['🖥️','display',      'Display'],
      ['🔌','power',        'Power'],
      ['🎟️','tickets',      'Tickets'],
    ]
  },
  {
    label: 'Content & Media',
    buttons: [
      ['🎛️','modulator',    'Modulator'],
      ['🎙️','voice',        'Voice'],
      ['🥁','advertising',  'Advertising'],
      ['🎹','music',        'Music'],
      ['🕹️','navigation',   'Navigation'],
      ['🧩','puzzle',       'Puzzle'],
    ]
  },
  {
    label: 'AI Tools',
    buttons: [
      ['💲','paypal',       'PayPal/Payments'],
      ['♠️','researchWriter','Research Writer'],
      ['🟥','hamburgerBuilder','Hamburger Builder'],
      ['🟨','extract',      'Extract'],
      ['🎷','mediaHub',     'Media Hub'],
      ['♥️','loveCommunity', 'Love & Community'],
    ]
  },
  {
    label: 'Advanced',
    buttons: [
      ['⭐','updateContent','Update Content'],
      ['🟩','aiEngineer',   'AI Engineer'],
      ['🎵','pianoSignIn',  'Piano Sign-In'],
      ['😎','visualizer',   'Visualizer'],
      ['✨','connectRepos', 'Connect Repos'],
      ['♣️','machinePart',  'Machine Part'],
    ]
  },
  {
    label: 'Creation',
    buttons: [
      ['🎨','artStudio',    'Art Studio'],
      ['🟡','tokenWalker',  'Token Walker'],
      ['♦️','merchant',     'Merchant'],
      ['🧱','encrypt',      'Encrypt'],
      ['🍄','doubleContent','Double Content'],
      ['⚪','cloneRepo',    'Clone Repo'],
    ]
  },
  {
    label: 'System',
    buttons: [
      ['⬜','unifier',      'Unifier'],
      ['💎','facets',       'Facets'],
      ['🔥','editRemove',   'Edit/Remove'],
      ['🛸','triode',       'Triode'],
    ]
  },
];

/* ── Modal content definitions ───────────────────────────── */
const MODAL_CONTENT = {
  moveUpDown: {
    title: 'Move Up/Down',
    emoji: '📍',
    desc: 'Reorder sections on your GitHub Pages site. Select a section and move it up or down the page hierarchy.',
    form: `
      <p class="modal-section-title">Select Section</p>
      <select class="select-input mb-2">
        <option>Hero / Banner</option>
        <option>Features Grid</option>
        <option>About Section</option>
        <option>Portfolio / Projects</option>
        <option>Contact Form</option>
        <option>Footer</option>
      </select>
      <p class="modal-section-title">Move Direction</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="dir" checked> ⬆️ Move Up</label>
        <label class="radio-chip"><input type="radio" name="dir"> ⬇️ Move Down</label>
        <label class="radio-chip"><input type="radio" name="dir"> ⬆️⬆️ Move to Top</label>
        <label class="radio-chip"><input type="radio" name="dir"> ⬇️⬇️ Move to Bottom</label>
      </div>`,
    preview: '// Section order will be updated in index.html\n// "About Section" → moved above "Features Grid"\n// Changes: 2 divs re-ordered, no content modified'
  },
  addPages: {
    title: 'Add Pages',
    emoji: '📎',
    desc: 'Create new HTML pages for your GitHub Pages site. Separate content into dedicated pages with navigation links.',
    form: `
      <p class="modal-section-title">Page Name</p>
      <input class="form-input mb-2" placeholder="e.g. about, contact, portfolio" />
      <p class="modal-section-title">Page Template</p>
      <select class="select-input mb-2">
        <option>Blank Page</option>
        <option>Blog Post</option>
        <option>Portfolio Gallery</option>
        <option>Contact Form</option>
        <option>Pricing Table</option>
        <option>Documentation</option>
      </select>
      <p class="modal-section-title">Options</p>
      <div class="checkbox-group">
        <label class="checkbox-item"><input type="checkbox" checked> Add to navigation menu</label>
        <label class="checkbox-item"><input type="checkbox" checked> Copy header/footer from index</label>
        <label class="checkbox-item"><input type="checkbox"> Add breadcrumb navigation</label>
      </div>`,
    preview: '// New file: about.html\n// Template: Portfolio Gallery\n// Navigation updated in index.html\n// Estimated: 3 files modified'
  },
  quickFix: {
    title: 'Quick Fix',
    emoji: '🔧',
    desc: 'Automatically scan and fix common issues — broken index alignment, missing meta tags, mobile viewport problems, and responsive layout bugs.',
    form: `
      <p class="modal-section-title">Scan For</p>
      <div class="checkbox-group">
        <label class="checkbox-item"><input type="checkbox" checked> Missing viewport meta tag</label>
        <label class="checkbox-item"><input type="checkbox" checked> Broken image paths</label>
        <label class="checkbox-item"><input type="checkbox" checked> Mobile overflow issues</label>
        <label class="checkbox-item"><input type="checkbox" checked> Missing alt attributes</label>
        <label class="checkbox-item"><input type="checkbox"> Fix CSS specificity conflicts</label>
        <label class="checkbox-item"><input type="checkbox"> Compress inline styles</label>
      </div>`,
    preview: '// Scan results (simulated):\n⚠️  Missing: <meta name="viewport">\n⚠️  2 images without alt text\n✅  No overflow issues detected\n// Auto-fix will patch index.html (3 lines)'
  },
  styles: {
    title: 'Styles',
    emoji: '🪣',
    desc: 'Change the color palette, design theme, and visual style of your GitHub Pages site.',
    form: `
      <p class="modal-section-title">Color Scheme</p>
      <div class="color-swatches">
        <div class="color-swatch active" style="background:#6366f1" title="Indigo"></div>
        <div class="color-swatch" style="background:#8b5cf6" title="Purple"></div>
        <div class="color-swatch" style="background:#ec4899" title="Pink"></div>
        <div class="color-swatch" style="background:#06b6d4" title="Cyan"></div>
        <div class="color-swatch" style="background:#22c55e" title="Green"></div>
        <div class="color-swatch" style="background:#f59e0b" title="Amber"></div>
        <div class="color-swatch" style="background:#ef4444" title="Red"></div>
        <div class="color-swatch" style="background:#64748b" title="Slate"></div>
      </div>
      <p class="modal-section-title">Theme</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="theme" checked> 🌑 Dark</label>
        <label class="radio-chip"><input type="radio" name="theme"> ☀️ Light</label>
        <label class="radio-chip"><input type="radio" name="theme"> 🌊 Ocean</label>
        <label class="radio-chip"><input type="radio" name="theme"> 🌲 Forest</label>
      </div>
      <p class="modal-section-title">Font</p>
      <select class="select-input">
        <option>Inter (Modern)</option>
        <option>Geist (Minimal)</option>
        <option>Merriweather (Serif)</option>
        <option>JetBrains Mono (Code)</option>
        <option>Playfair Display (Editorial)</option>
      </select>`,
    preview: '/* CSS variables updated in styles.css */\n--accent: #6366f1;\n--bg-primary: #0d1117;\n--font: "Inter", sans-serif;\n// 1 file changed: css/styles.css'
  },
  pullMemory: {
    title: 'Pull Memory',
    emoji: '🧲',
    desc: 'Import content, code snippets, or design elements from another one of your repositories into the current repo\'s clipboard.',
    form: `
      <p class="modal-section-title">Source Repository</p>
      <select class="select-input mb-2" id="pullMemoryRepo">
        <option value="">— Loading repos... —</option>
      </select>
      <p class="modal-section-title">Import Type</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="importType" checked> 📄 index.html</label>
        <label class="radio-chip"><input type="radio" name="importType"> 🎨 CSS styles</label>
        <label class="radio-chip"><input type="radio" name="importType"> ⚙️ JS logic</label>
        <label class="radio-chip"><input type="radio" name="importType"> 📦 All assets</label>
      </div>
      <p class="modal-section-title">Options</p>
      <div class="checkbox-group">
        <label class="checkbox-item"><input type="checkbox" checked> Store in clipboard (Drop Content later)</label>
        <label class="checkbox-item"><input type="checkbox"> Merge with existing content</label>
      </div>`,
    preview: '// Content pulled from: [selected-repo]\n// Stored in: localStorage["gitpub_memory"]\n// Ready to use with 🟦 Drop Content'
  },
  dropContent: {
    title: 'Drop Content',
    emoji: '🟦',
    desc: 'Drop previously pulled memory/content into the current page. Paste pulled code or design elements from your clipboard.',
    form: `
      <p class="modal-section-title">Memory Slot</p>
      <select class="select-input mb-2">
        <option>Slot 1 — index.html from repo-xyz (2 hrs ago)</option>
        <option>Slot 2 — styles.css from portfolio (1 day ago)</option>
        <option>Slot 3 — Empty</option>
      </select>
      <p class="modal-section-title">Drop Location</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="dropLoc" checked> 🔝 Top of page</label>
        <label class="radio-chip"><input type="radio" name="dropLoc"> 🔚 Bottom of page</label>
        <label class="radio-chip"><input type="radio" name="dropLoc"> ➕ New section</label>
        <label class="radio-chip"><input type="radio" name="dropLoc"> 🔄 Replace page</label>
      </div>`,
    preview: '// Dropping: index.html from repo-xyz\n// Location: Bottom of current index.html\n// Wrapping content in <section> block\n// 1 file modified'
  },
  toolbox: {
    title: 'Toolbox',
    emoji: '🧰',
    desc: 'Access a collection of web and app tools — analytics, SEO helpers, performance checkers, accessibility audits, and deployment helpers.',
    form: `
      <p class="modal-section-title">Select Tool</p>
      <div class="checkbox-group">
        <label class="checkbox-item"><input type="checkbox"> 📊 Add Google Analytics snippet</label>
        <label class="checkbox-item"><input type="checkbox"> 🔍 Generate sitemap.xml</label>
        <label class="checkbox-item"><input type="checkbox"> 🤖 Add robots.txt</label>
        <label class="checkbox-item"><input type="checkbox"> 📱 Generate PWA manifest</label>
        <label class="checkbox-item"><input type="checkbox"> ⚡ Add Cloudflare CDN headers</label>
        <label class="checkbox-item"><input type="checkbox"> 🛡️ Add security headers (.htaccess)</label>
        <label class="checkbox-item"><input type="checkbox"> 🗺️ Add Open Graph meta tags</label>
      </div>`,
    preview: '// Selected tools will generate:\n// → sitemap.xml (auto-crawl pages)\n// → robots.txt\n// → meta tags added to index.html'
  },
  signal: {
    title: 'Signal',
    emoji: '📡',
    desc: 'Emit and retrieve signals between repositories. Add watchers for events like stars, forks, and deployments.',
    form: `
      <p class="modal-section-title">Signal Type</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="sig" checked> 📤 Emit Signal</label>
        <label class="radio-chip"><input type="radio" name="sig"> 📥 Add Watcher</label>
        <label class="radio-chip"><input type="radio" name="sig"> 📶 Ping Repos</label>
      </div>
      <p class="modal-section-title">Watch Event</p>
      <select class="select-input">
        <option>⭐ New Star</option>
        <option>🍴 New Fork</option>
        <option>🚀 Deployment</option>
        <option>💬 New Issue</option>
        <option>🔀 Pull Request</option>
      </select>`,
    preview: '// Signal: Watcher added\n// Event: New Star on this repo\n// Webhook URL: Will store in .github/signals.json\n// Linked repos: None yet'
  },
  diagnose: {
    title: 'Diagnose',
    emoji: '💊',
    desc: 'Run a full bug diagnosis on your GitHub Pages site. AI scans your code, identifies issues, and prescribes fixes.',
    form: `
      <p class="modal-section-title">Scan Depth</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="scan" checked> 🏃 Quick (HTML only)</label>
        <label class="radio-chip"><input type="radio" name="scan"> 🔍 Standard (HTML + CSS)</label>
        <label class="radio-chip"><input type="radio" name="scan"> 🧬 Deep (All files)</label>
      </div>
      <p class="modal-section-title">Issue Types</p>
      <div class="checkbox-group">
        <label class="checkbox-item"><input type="checkbox" checked> 🔴 Critical errors</label>
        <label class="checkbox-item"><input type="checkbox" checked> 🟡 Warnings</label>
        <label class="checkbox-item"><input type="checkbox"> 🔵 Performance hints</label>
        <label class="checkbox-item"><input type="checkbox"> 🟢 Accessibility issues</label>
      </div>`,
    preview: '// Diagnosis Report (simulated):\n🔴 1 Critical: Missing DOCTYPE\n🟡 3 Warnings: Deprecated HTML tags\n🟢 2 A11y: Missing ARIA labels\n// Prescriptions ready to apply'
  },
  soulIntent: {
    title: 'Soul Intent',
    emoji: '👑',
    desc: 'Crown the main purpose and identity of this repository. Feed its intent to the site\'s SEO, meta tags, and AI-generated content.',
    form: `
      <p class="modal-section-title">Primary Purpose</p>
      <select class="select-input mb-2">
        <option>🚀 Personal Portfolio</option>
        <option>💼 Business / SaaS</option>
        <option>📝 Blog / Publication</option>
        <option>🛒 E-commerce</option>
        <option>📖 Documentation</option>
        <option>🎮 Game / Interactive</option>
        <option>🌐 Community / Organization</option>
      </select>
      <p class="modal-section-title">Soul Statement (One sentence)</p>
      <textarea class="textarea-input" placeholder="e.g. A developer toolkit for building fast, beautiful GitHub Pages sites with AI assistance."></textarea>
      <p class="modal-section-title">Keywords (comma-separated)</p>
      <input class="form-input" placeholder="github, developer tools, AI, PWA, website builder" />`,
    preview: '// Soul Intent applied to:\n// <title>: Updated\n// <meta name="description">: Updated\n// <meta name="keywords">: Updated\n// Open Graph tags: Updated\n// 1 file changed: index.html'
  },
  metrics: {
    title: 'Metrics',
    emoji: '⚖️',
    desc: 'Measure, weigh, and get an AI-estimated site value. See engagement metrics, performance scores, and monetisation potential.',
    form: `
      <p class="modal-section-title">Metric Type</p>
      <div class="checkbox-group">
        <label class="checkbox-item"><input type="checkbox" checked> 📈 GitHub engagement (stars, forks, watches)</label>
        <label class="checkbox-item"><input type="checkbox" checked> ⚡ Performance score (simulated Lighthouse)</label>
        <label class="checkbox-item"><input type="checkbox"> 💵 Estimated site value</label>
        <label class="checkbox-item"><input type="checkbox"> 🔍 SEO score</label>
        <label class="checkbox-item"><input type="checkbox"> ♿ Accessibility score</label>
      </div>`,
    preview: '// Metrics Report:\n⭐ Stars: fetching...\n🍴 Forks: fetching...\n⚡ Performance: ~85/100\n🔍 SEO: ~72/100\n💵 Est. Value: $120–$480'
  },
  cloneRepo: {
    title: 'Clone Repo',
    emoji: '⚪',
    desc: 'Create a new GitHub repository cloned from this one. Choose what to copy and set the new repo\'s visibility.',
    form: `
      <p class="modal-section-title">New Repository Name</p>
      <input class="form-input mb-2" placeholder="my-new-repo-name" />
      <p class="modal-section-title">Visibility</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="vis" checked> 🔓 Public</label>
        <label class="radio-chip"><input type="radio" name="vis"> 🔒 Private</label>
      </div>
      <p class="modal-section-title">What to Clone</p>
      <div class="checkbox-group">
        <label class="checkbox-item"><input type="checkbox" checked> All files & folders</label>
        <label class="checkbox-item"><input type="checkbox"> Commit history</label>
        <label class="checkbox-item"><input type="checkbox" checked> GitHub Pages configuration</label>
        <label class="checkbox-item"><input type="checkbox"> Issues & wiki</label>
      </div>`,
    preview: '// API call preview:\n// POST /user/repos\n// { "name": "my-new-repo-name",\n//   "private": false,\n//   "auto_init": false }\n// Then: clone + push files'
  },
  connectRepos: {
    title: 'Connect Repos',
    emoji: '✨',
    desc: 'Unify and link multiple repositories together. Create a network of interconnected sites that share navigation, styles, and content.',
    form: `
      <p class="modal-section-title">Select Repos to Connect</p>
      <div class="checkbox-group" id="connectReposList">
        <label class="checkbox-item"><input type="checkbox"> (loading repos...)</label>
      </div>
      <p class="modal-section-title">Connection Type</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="conn" checked> 🌐 Shared Navigation</label>
        <label class="radio-chip"><input type="radio" name="conn"> 🎨 Shared Styles</label>
        <label class="radio-chip"><input type="radio" name="conn"> 📡 Signal Network</label>
        <label class="radio-chip"><input type="radio" name="conn"> 🔗 Ring Link</label>
      </div>`,
    preview: '// Connection manifest saved to:\n// .github/gitpub-network.json\n// Shared nav injected into all connected repos'
  },
  aiEngineer: {
    title: 'AI Engineer',
    emoji: '🟩',
    desc: 'Let AI suggest relevant images, expand research content, generate schematics and diagrams, and build full page sections.',
    form: `
      <p class="modal-section-title">AI Task</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="ai" checked> 🖼️ Suggest Images</label>
        <label class="radio-chip"><input type="radio" name="ai"> 📝 Expand Content</label>
        <label class="radio-chip"><input type="radio" name="ai"> 📐 Generate Schematic</label>
        <label class="radio-chip"><input type="radio" name="ai"> 🏗️ Build Full Section</label>
      </div>
      <p class="modal-section-title">Context / Prompt</p>
      <textarea class="textarea-input" placeholder="Describe what you want the AI to generate or improve on this page..."></textarea>`,
    preview: '// AI Engineer (simulated):\n// Task: Expand content\n// Tokens: ~1,200 est.\n// Output: New <section> block with\n//   3 feature cards, expanded copy\n// Ready to commit to index.html'
  },
  artStudio: {
    title: 'Art Studio',
    emoji: '🎨',
    desc: 'Open the drawing pad with full colour, 3D, and design tools. Create illustrations, logos, or token artwork and export to your repo.',
    form: `
      <p class="modal-section-title">Canvas Size</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="canvas" checked> 512×512 (Icon)</label>
        <label class="radio-chip"><input type="radio" name="canvas"> 1200×630 (OG Image)</label>
        <label class="radio-chip"><input type="radio" name="canvas"> 1920×1080 (Banner)</label>
        <label class="radio-chip"><input type="radio" name="canvas"> Custom</label>
      </div>
      <p class="modal-section-title">Output Format</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="fmt" checked> SVG (Vector)</label>
        <label class="radio-chip"><input type="radio" name="fmt"> PNG</label>
        <label class="radio-chip"><input type="radio" name="fmt"> WebP</label>
      </div>
      <p class="modal-section-title">Export To</p>
      <select class="select-input">
        <option>images/ folder</option>
        <option>assets/</option>
        <option>icons/</option>
      </select>`,
    preview: '// Art Studio output:\n// File: images/hero-banner.svg\n// Size: 1200×630\n// Will commit to repo via API'
  },
  triode: {
    title: 'Triode',
    emoji: '🛸',
    desc: 'Set 3 repositories as a metallic triode system: Weak (input), Control (grid), and Strong (amplified output). Wire repo networks like electronic components.',
    form: `
      <p class="modal-section-title">Weak (Input) Repo</p>
      <select class="select-input mb-2"><option>Select repo...</option></select>
      <p class="modal-section-title">Control (Grid) Repo</p>
      <select class="select-input mb-2"><option>Select repo...</option></select>
      <p class="modal-section-title">Strong (Output) Repo</p>
      <select class="select-input mb-2"><option>Select repo...</option></select>
      <p class="modal-section-title">Signal Flow</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="flow" checked> 🔁 Continuous</label>
        <label class="radio-chip"><input type="radio" name="flow"> ⚡ On Push</label>
        <label class="radio-chip"><input type="radio" name="flow"> 🕐 Scheduled</label>
      </div>`,
    preview: '// Triode Configuration:\n// Weak  → [input-repo]\n// Control → [grid-repo]\n// Strong → [output-repo]\n// Saved to: .github/triode.json'
  },
};

/* ── Fallback content for modals not defined above ───────── */
const MODAL_FALLBACK = (id, emoji, title) => ({
  title,
  emoji,
  desc: `The ${title} tool lets you configure and apply advanced operations to your GitHub Pages repository. Use the options below to customise the behaviour.`,
  form: `
    <p class="modal-section-title">Mode</p>
    <div class="radio-group">
      <label class="radio-chip"><input type="radio" name="mode_${id}" checked> ⚡ Quick</label>
      <label class="radio-chip"><input type="radio" name="mode_${id}"> 🔍 Advanced</label>
      <label class="radio-chip"><input type="radio" name="mode_${id}"> 🤖 AI-Assisted</label>
    </div>
    <p class="modal-section-title">Options</p>
    <div class="checkbox-group">
      <label class="checkbox-item"><input type="checkbox" checked> Enable for this repo</label>
      <label class="checkbox-item"><input type="checkbox"> Preview before applying</label>
      <label class="checkbox-item"><input type="checkbox"> Notify on completion</label>
    </div>
    <p class="modal-section-title">Notes / Custom Input</p>
    <textarea class="textarea-input" placeholder="Optional: describe what you want to achieve..."></textarea>`,
  preview: `// ${title} (${emoji})\n// Mode: Quick\n// Target: index.html\n// Ready to apply changes`
});

/* ══════════════════════════════════════════════════════════
   GitpubApp class
   ══════════════════════════════════════════════════════════ */
class GitpubApp {
  constructor() {
    this.repos       = [];
    this.filteredRepos = [];
    this.token       = null;
    this.username    = null;
    this.deferredInstallPrompt = null;
    this.activeModal = null;
    this.currentRepo = null;
    this.isGitpal    = document.documentElement.dataset.page === 'gitpal';
  }

  /* ── Initialise ─────────────────────────────────────────── */
  init() {
    this._loadTheme();
    this._bindNav();
    this._bindInstallBanner();
    this._bindThemeToggle();
    this._registerSW();

    this.checkAuth();
  }

  /* ── Service Worker ─────────────────────────────────────── */
  _registerSW() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/Gitpub/sw.js').catch(() => {});
    }
  }

  /* ── Theme ──────────────────────────────────────────────── */
  _loadTheme() {
    const saved = localStorage.getItem('gitpub_theme') || 'dark';
    document.documentElement.dataset.theme = saved;
    const icon = document.getElementById('themeIcon');
    if (icon) icon.textContent = saved === 'dark' ? '☀️' : '🌙';
  }

  _bindThemeToggle() {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    btn.addEventListener('click', () => this.handleThemeToggle());
  }

  handleThemeToggle() {
    const cur   = document.documentElement.dataset.theme || 'dark';
    const next  = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('gitpub_theme', next);
    const icon = document.getElementById('themeIcon');
    if (icon) icon.textContent = next === 'dark' ? '☀️' : '🌙';
    this.showToast(`Switched to ${next} mode`, 'info');
  }

  /* ── Navigation drawer ──────────────────────────────────── */
  _bindNav() {
    const hamburger = document.getElementById('hamburgerBtn');
    const overlay   = document.getElementById('navOverlay');
    const drawer    = document.getElementById('navDrawer');
    const closeBtn  = document.getElementById('navClose');

    const open  = () => { overlay.classList.add('open'); drawer.classList.add('open'); };
    const close = () => { overlay.classList.remove('open'); drawer.classList.remove('open'); };

    hamburger?.addEventListener('click', open);
    closeBtn?.addEventListener('click', close);
    overlay?.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  }

  /* ── PWA install banner ─────────────────────────────────── */
  _bindInstallBanner() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredInstallPrompt = e;
      const banner = document.getElementById('installBanner');
      if (banner) banner.classList.add('show');
    });

    document.getElementById('installBtn')?.addEventListener('click', async () => {
      if (!this.deferredInstallPrompt) return;
      this.deferredInstallPrompt.prompt();
      const { outcome } = await this.deferredInstallPrompt.userChoice;
      if (outcome === 'accepted') this.showToast('Gitpub installed! 🎉', 'success');
      this.deferredInstallPrompt = null;
      document.getElementById('installBanner')?.classList.remove('show');
    });

    document.getElementById('dismissBanner')?.addEventListener('click', () => {
      document.getElementById('installBanner')?.classList.remove('show');
    });
  }

  /* ── Auth ───────────────────────────────────────────────── */
  checkAuth() {
    const rawToken = localStorage.getItem('gitpub_token');
    const rawUser  = localStorage.getItem('gitpub_user');
    if (rawToken && rawUser) {
      this.token    = xorStr(atob(rawToken));
      this.username = rawUser;
      this._showApp();
    } else {
      this._showAuth();
    }
  }

  _showAuth() {
    document.getElementById('authSection')?.classList.remove('hidden');
    document.getElementById('appSection')?.classList.add('hidden');

    document.getElementById('authForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const tokenInput = document.getElementById('tokenInput')?.value.trim();
      const userInput  = document.getElementById('usernameInput')?.value.trim();
      if (!tokenInput || !userInput) {
        this.showToast('Please fill in both fields', 'error');
        return;
      }
      // Obfuscate and store
      localStorage.setItem('gitpub_token', btoa(xorStr(tokenInput)));
      localStorage.setItem('gitpub_user',  userInput);
      this.token    = tokenInput;
      this.username = userInput;
      this._showApp();
    });
  }

  _showApp() {
    document.getElementById('authSection')?.classList.add('hidden');
    document.getElementById('appSection')?.classList.remove('hidden');
    document.getElementById('usernameDisplay')?.textContent && 
      (document.getElementById('usernameDisplay').textContent = this.username);
    this.loadRepos();

    // Settings: sign-out
    document.getElementById('signOutBtn')?.addEventListener('click', () => {
      localStorage.removeItem('gitpub_token');
      localStorage.removeItem('gitpub_user');
      location.reload();
    });

    // Search
    document.getElementById('searchRepos')?.addEventListener('input', (e) => {
      this._filterRepos(e.target.value);
    });

    // Gitpal: populate chat repo dropdown
    if (this.isGitpal) this._initChat();
  }

  /* ── Fetch Repos ────────────────────────────────────────── */
  async loadRepos() {
    this._showLoading(true);
    try {
      const res = await fetch(
        `https://api.github.com/users/${this.username}/repos?per_page=100&sort=updated`,
        { headers: { 'Authorization': `token ${this.token}`, 'Accept': 'application/vnd.github.v3+json' } }
      );

      if (res.status === 401) {
        this.showToast('Invalid token — please sign in again', 'error');
        localStorage.removeItem('gitpub_token');
        setTimeout(() => location.reload(), 1500);
        return;
      }
      if (!res.ok) throw new Error(`GitHub API error ${res.status}`);

      this.repos = await res.json();
      this.filteredRepos = [...this.repos];
      this._updateStats();
      this.renderCards();
    } catch (err) {
      this._showError(err.message);
    } finally {
      this._showLoading(false);
    }
  }

  _showLoading(show) {
    const el = document.getElementById('loadingSpinner');
    if (el) el.classList.toggle('hidden', !show);
  }

  _showError(msg) {
    const grid = document.getElementById('repoGrid');
    if (!grid) return;
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <div class="empty-icon">😬</div>
      <h3>Something went wrong</h3>
      <p>${msg}</p>
      <button class="btn btn-secondary mt-3" onclick="app.loadRepos()">Retry</button>
    </div>`;
  }

  _updateStats() {
    const total    = this.repos.length;
    const stars    = this.repos.reduce((s, r) => s + r.stargazers_count, 0);
    const pages    = this.repos.filter(r => r.has_pages).length;
    const langs    = new Set(this.repos.map(r => r.language).filter(Boolean)).size;

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('statTotal', total);
    set('statStars', stars);
    set('statPages', pages);
    set('statLangs', langs);
  }

  /* ── Filter Repos ───────────────────────────────────────── */
  _filterRepos(query) {
    const q = query.toLowerCase();
    this.filteredRepos = q
      ? this.repos.filter(r =>
          r.name.toLowerCase().includes(q) ||
          (r.description || '').toLowerCase().includes(q) ||
          (r.language || '').toLowerCase().includes(q))
      : [...this.repos];
    this.renderCards();
  }

  /* ── Render Cards ───────────────────────────────────────── */
  renderCards() {
    const grid = document.getElementById('repoGrid');
    if (!grid) return;

    if (!this.filteredRepos.length) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
        <div class="empty-icon">🔍</div>
        <h3>No repos found</h3>
        <p>Try a different search term or check your GitHub username.</p>
      </div>`;
      return;
    }

    grid.innerHTML = this.filteredRepos.map(r => this._cardHTML(r)).join('');

    // Bind emoji buttons
    grid.querySelectorAll('.emoji-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const { action, repo } = btn.dataset;
        this.openModal(action, repo);
      });
    });

    // Colour swatches in cards are handled by modal
  }

  _cardHTML(repo) {
    const lang      = repo.language || 'Unknown';
    const langColor = LANG_COLORS[lang] || LANG_COLORS.default;
    const updated   = new Date(repo.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const pagesUrl  = `https://${this.username}.github.io/${repo.name}/`;
    const desc      = repo.description || '<span class="text-muted">No description</span>';

    const toolbarHTML = EMOJI_ROWS.map(row => `
      <div class="emoji-row-label">${row.label}</div>
      <div class="emoji-row">
        ${row.buttons.map(([e, id, t]) =>
          `<button class="emoji-btn" data-action="${id}" data-repo="${repo.name}" title="${t}" aria-label="${t}">${e}</button>`
        ).join('')}
      </div>`).join('');

    return `
    <article class="repo-card" data-repo="${repo.name}">
      <div class="card-header">
        <div>
          <div class="card-title">
            <a href="${repo.html_url}" target="_blank" rel="noopener">${repo.name}</a>
          </div>
          ${repo.fork ? '<span class="text-muted text-sm mt-1">🍴 Fork</span>' : ''}
        </div>
        ${repo.private ? '<span class="card-private-badge">Private</span>' : ''}
      </div>
      <p class="card-desc">${desc}</p>
      <div class="card-meta">
        <span class="lang-badge">
          <span class="lang-dot" style="background:${langColor}"></span>${lang}
        </span>
        <span class="meta-item">⭐ ${repo.stargazers_count}</span>
        <span class="meta-item">🍴 ${repo.forks_count}</span>
        <span class="meta-item" title="Last updated">🕐 ${updated}</span>
      </div>
      <div class="card-actions">
        <a href="${pagesUrl}" target="_blank" rel="noopener" class="btn-open">🌐 Open Site</a>
        <a href="${repo.html_url}" target="_blank" rel="noopener" class="btn btn-secondary btn-sm">GitHub ↗</a>
      </div>
      <div class="emoji-toolbar">${toolbarHTML}</div>
    </article>`;
  }

  /* ── Modal ──────────────────────────────────────────────── */
  openModal(actionId, repoName) {
    // Find emoji and title from EMOJI_ROWS
    let emoji = '⚙️', title = actionId;
    for (const row of EMOJI_ROWS) {
      const found = row.buttons.find(b => b[1] === actionId);
      if (found) { emoji = found[0]; title = found[2]; break; }
    }

    const content = MODAL_CONTENT[actionId] || MODAL_FALLBACK(actionId, emoji, title);

    const overlay = document.getElementById('modalOverlay');
    const box     = document.getElementById('modalBox');
    if (!overlay || !box) return;

    box.innerHTML = `
      <div class="modal-header">
        <div>
          <div class="modal-title">
            <span class="modal-emoji">${content.emoji}</span>
            <span>${content.title}</span>
          </div>
          <span class="modal-repo-tag">📁 ${repoName}</span>
        </div>
        <button class="modal-close" id="modalCloseBtn" aria-label="Close">✕</button>
      </div>
      <div class="modal-body">
        <div class="modal-desc">${content.desc}</div>
        ${content.form}
        <p class="modal-section-title">Preview</p>
        <pre class="modal-preview" id="modalPreview">${content.preview}</pre>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" id="modalPreviewBtn">👁️ Preview</button>
        <button class="btn btn-success" id="modalApplyBtn">✅ Apply Changes</button>
      </div>`;

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    this.activeModal = { actionId, repoName };
    this.currentRepo = repoName;

    // Wire close
    box.querySelector('#modalCloseBtn').addEventListener('click', () => this.closeModal());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) this.closeModal(); });
    document.addEventListener('keydown', this._escClose = (e) => { if (e.key === 'Escape') this.closeModal(); });

    // Wire apply
    box.querySelector('#modalApplyBtn').addEventListener('click', () => this._applyChanges(content.title, repoName));

    // Wire preview
    box.querySelector('#modalPreviewBtn').addEventListener('click', () => {
      const pre = document.getElementById('modalPreview');
      if (pre) {
        pre.style.color = 'var(--gitpub-accent2)';
        this.showToast('Preview generated', 'info');
      }
    });

    // Colour swatches
    box.querySelectorAll('.color-swatch').forEach(swatch => {
      swatch.addEventListener('click', () => {
        box.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');
        const pre = document.getElementById('modalPreview');
        if (pre) pre.textContent = `/* Theme colour updated */\n--accent: ${swatch.style.background};\n// Will patch css/styles.css`;
      });
    });
  }

  closeModal() {
    document.getElementById('modalOverlay')?.classList.remove('open');
    document.body.style.overflow = '';
    this.activeModal = null;
    document.removeEventListener('keydown', this._escClose);
  }

  _applyChanges(toolName, repoName) {
    this.showToast(`✅ "${toolName}" applied to ${repoName}`, 'success');
    setTimeout(() => this.closeModal(), 600);
    // Simulate commit API activity (real integration would call GitHub API here)
    const pre = document.getElementById('modalPreview');
    if (pre) {
      pre.textContent = `// ✅ Changes committed successfully\n// Repo: ${repoName}\n// Tool: ${toolName}\n// Commit SHA: ${Math.random().toString(36).slice(2, 10)}\n// Time: ${new Date().toISOString()}`;
    }
  }

  /* ── Toast ──────────────────────────────────────────────── */
  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
    const toast  = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('exit');
      toast.addEventListener('animationend', () => toast.remove());
    }, 3500);
  }

  /* ── Gitpal Chat ────────────────────────────────────────── */
  _initChat() {
    const responses = [
      "Great question! GitHub Pages works best when your repo has an `index.html` at the root or a `docs/` folder. Make sure Pages is enabled in Settings → Pages.",
      "To boost SEO on your GitHub Pages site, add `<meta name=\"description\">`, Open Graph tags, and a `sitemap.xml`. The 🔧 Quick Fix and 🧰 Toolbox tools can help automate this!",
      "For a PWA, you need a `manifest.json`, a service worker (`sw.js`), and HTTPS — which GitHub Pages provides by default. Use the 🧰 Toolbox to generate these files.",
      "Stars and forks signal popularity to search engines and other developers. Use ⭐ Update Content to keep your repo's content fresh and attract more attention.",
      "The 🧲 Pull Memory → 🟦 Drop Content workflow lets you reuse content across repos without copy-pasting. Great for maintaining consistent headers and footers!",
      "Want to monetise? The 💰 Banking tool helps integrate PayPal buttons. For token-based systems, check out 💲 PayPal/Payments and 🟡 Token Walker.",
      "I recommend using semantic HTML5 elements (`<header>`, `<main>`, `<section>`, `<article>`) in your GitHub Pages sites — it improves SEO and accessibility scores significantly.",
      "To connect your repos into a network, use ✨ Connect Repos. You can share navigation, styles, and signals across multiple GitHub Pages sites.",
    ];
    let msgCount = 0;

    const messagesEl  = document.getElementById('chatMessages');
    const inputEl     = document.getElementById('chatInput');
    const sendBtn     = document.getElementById('chatSendBtn');

    const addMsg = (text, isUser = false) => {
      if (!messagesEl) return;
      const div = document.createElement('div');
      div.className = `chat-msg ${isUser ? 'user' : 'bot'}`;
      div.innerHTML = isUser
        ? `<div class="chat-bubble">${text}</div>`
        : `<div class="chat-bot-avatar">🤖</div><div class="chat-bubble">${text}</div>`;
      messagesEl.appendChild(div);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    };

    const send = () => {
      const text = inputEl?.value.trim();
      if (!text) return;
      addMsg(text, true);
      inputEl.value = '';
      setTimeout(() => {
        addMsg(responses[msgCount % responses.length]);
        msgCount++;
      }, 700);
    };

    sendBtn?.addEventListener('click', send);
    inputEl?.addEventListener('keydown', (e) => { if (e.key === 'Enter') send(); });

    document.querySelectorAll('.suggestion-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        if (inputEl) inputEl.value = chip.textContent;
        send();
      });
    });
  }
}

/* ── Bootstrap ───────────────────────────────────────────── */
const app = new GitpubApp();
document.addEventListener('DOMContentLoaded', () => app.init());
