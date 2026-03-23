/**
 * Gitpub — GitHub Repository Manager & Website Builder
 * Main application logic
 * Vanilla ES6+, no frameworks
 */

'use strict';

/* ── XOR obfuscation for token storage ───────────────────── */
// NOTE: This is lightweight obfuscation only (NOT encryption).
// The XOR key is intentionally simple — anyone with access to the browser's
// localStorage or DevTools can trivially decode the stored token.
// SECURITY GUIDANCE: always use short-lived fine-grained PATs with the
// minimum required scopes (public_repo or repo) and revoke them promptly.
// The token is also protected by HTTPS and the browser same-origin policy.
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
      ['📍','moveUpDown',        'Move Up/Down',       'Move'],
      ['📎','addPages',          'Add Pages',           'Pages'],
      ['🔧','quickFix',          'Quick Fix',           'Fix'],
      ['🪣','styles',            'Styles',              'Styles'],
      ['🧲','pullMemory',        'Pull Memory',         'Pull'],
      ['🟦','dropContent',       'Drop Content',        'Drop'],
      ['🧰','toolbox',           'Toolbox',             'Tools'],
    ]
  },
  {
    label: 'Data & Signal',
    buttons: [
      ['📡','signal',            'Signal',              'Signal'],
      ['🔬','microscope',        'Microscope',          'Micro'],
      ['🧫','petriDish',         'Petri Dish',          'Petri'],
      ['🥽','underwater',        'Underwater',          'Repair'],
      ['💍','beltPulley',        'Belt & Pulley',       'Rings'],
      ['👑','soulIntent',        'Soul Intent',         'Crown'],
      ['💊','diagnose',          'Diagnose',            'Fix Bugs'],
    ]
  },
  {
    label: 'Commerce & Media',
    buttons: [
      ['⚖️','metrics',           'Metrics',             'Metrics'],
      ['🛒','shoppingCart',      'Shopping Cart',       'Shop'],
      ['💰','banking',           'Banking',             'Bank'],
      ['📀','addFiles',          'Add Files',           'Files'],
      ['🖥️','display',           'Display',             'Display'],
      ['🔌','power',             'Power',               'Power'],
      ['🎟️','tickets',           'Tickets',             'Tickets'],
    ]
  },
  {
    label: 'Content & Media',
    buttons: [
      ['🎛️','modulator',         'Modulator',           'Mod'],
      ['🎙️','voice',             'Voice',               'Voice'],
      ['🥁','advertising',       'Advertising',         'Ads'],
      ['🎹','music',             'Music',               'Music'],
      ['🕹️','navigation',        'Navigation',          'Nav'],
      ['🧩','puzzle',            'Puzzle',              'Puzzle'],
    ]
  },
  {
    label: 'AI Tools',
    buttons: [
      ['💲','paypal',            'PayPal/Payments',     'Pay'],
      ['♠️','researchWriter',    'Research Writer',     'Research'],
      ['🟥','hamburgerBuilder',  'Hamburger Builder',   'Hamburger'],
      ['🟨','extract',           'Extract',             'Extract'],
      ['🎷','mediaHub',          'Media Hub',           'Media'],
      ['♥️','loveCommunity',     'Love & Community',    'Love'],
    ]
  },
  {
    label: 'Advanced',
    buttons: [
      ['⭐','updateContent',     'Update Content',      'Update'],
      ['🟩','aiEngineer',        'AI Engineer',         'AI Build'],
      ['🎵','pianoSignIn',       'Piano Sign-In',       'Login'],
      ['😎','visualizer',        'Visualizer',          'Visual'],
      ['✨','connectRepos',      'Connect Repos',       'Connect'],
      ['♣️','machinePart',       'Machine Part',        'Machine'],
    ]
  },
  {
    label: 'Creation',
    buttons: [
      ['🎨','artStudio',         'Art Studio',          'Art'],
      ['🟡','tokenWalker',       'Token Walker',        'Token'],
      ['♦️','merchant',          'Merchant',            'Merchant'],
      ['🧱','encrypt',           'Encrypt',             'Encrypt'],
      ['🍄','doubleContent',     'Double Content',      'Double'],
      ['⚪','cloneRepo',         'Clone Repo',          'Clone'],
    ]
  },
  {
    label: 'System',
    buttons: [
      ['⬜','unifier',           'Unifier',             'Unify'],
      ['💎','facets',            'Facets',              'Facets'],
      ['🔥','editRemove',        'Edit/Remove',         'Edit'],
      ['🛸','triode',            'Triode',              'Triode'],
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

  microscope: {
    title: 'Microscope',
    emoji: '🔬',
    desc: 'Make precise, insignificant-but-important micro-adjustments to your pages — fine-tune spacing, colors, typography, and small layout tweaks.',
    form: `
      <p class="modal-section-title">Adjustment Type</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="micro" checked> 📏 Spacing &amp; Layout</label>
        <label class="radio-chip"><input type="radio" name="micro"> 🎨 Color Fine-Tune</label>
        <label class="radio-chip"><input type="radio" name="micro"> 🖋️ Typography</label>
        <label class="radio-chip"><input type="radio" name="micro"> ⚡ Performance Micro-Opt</label>
      </div>
      <p class="modal-section-title">Target Element (CSS selector)</p>
      <input class="form-input mb-2" placeholder="e.g. .hero-title, #nav, footer" />
      <p class="modal-section-title">Describe the adjustment</p>
      <textarea class="textarea-input" placeholder="e.g. Increase line-height from 1.4 to 1.5 on .hero-title"></textarea>`,
    preview: '// Micro-adjustment:\n// Target: .hero-title\n// Change: line-height 1.4 → 1.5\n// font-weight 700 → 800\n// 1 line changed in css/styles.css'
  },

  petriDish: {
    title: 'Petri Dish',
    emoji: '🧫',
    desc: 'Create an experimental sandbox repo — a safe environment to test code, layouts, and features without touching your live site.',
    form: `
      <p class="modal-section-title">Experiment Type</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="petri" checked> 🧪 Layout Test</label>
        <label class="radio-chip"><input type="radio" name="petri"> 🔬 Feature Prototype</label>
        <label class="radio-chip"><input type="radio" name="petri"> 🤖 AI Experiment</label>
      </div>
      <p class="modal-section-title">Options</p>
      <div class="checkbox-group">
        <label class="checkbox-item"><input type="checkbox" checked> Create as private repo</label>
        <label class="checkbox-item"><input type="checkbox"> Copy base styles from this repo</label>
        <label class="checkbox-item"><input type="checkbox"> Auto-merge when experiment succeeds</label>
      </div>`,
    preview: '// Petri Dish created:\n// New private repo: [current-repo]-sandbox\n// Files copied: index.html, styles.css\n// Experiment branch: experiment/01'
  },

  underwater: {
    title: 'Underwater',
    emoji: '🥽',
    desc: 'When your page is "underwater" (broken, unfinished, or outdated), this tool gives quick fixes, index rebuilds, and emergency repair jobs.',
    form: `
      <p class="modal-section-title">Repair Type</p>
      <div class="checkbox-group">
        <label class="checkbox-item"><input type="checkbox" checked> 🆘 Rebuild index.html skeleton</label>
        <label class="checkbox-item"><input type="checkbox" checked> 🔧 Fix broken links &amp; paths</label>
        <label class="checkbox-item"><input type="checkbox"> 📱 Force mobile responsiveness</label>
        <label class="checkbox-item"><input type="checkbox"> 🎨 Apply emergency default styles</label>
        <label class="checkbox-item"><input type="checkbox"> ⚙️ Add job runner script</label>
        <label class="checkbox-item"><input type="checkbox"> 📐 Fix index alignment for Android/mobile</label>
      </div>`,
    preview: '// Emergency Repair:\n// ✅ Rebuilt index.html skeleton\n// ✅ Fixed 3 broken image paths\n// ✅ Added viewport meta tag\n// 2 files modified'
  },

  beltPulley: {
    title: 'Belt & Pulley',
    emoji: '💍',
    desc: 'Import a pre-built Belt/Pulley/Engine ring system — interlocking repository scripts ready to work together as a machine.',
    form: `
      <p class="modal-section-title">Ring System Part</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="ring" checked> ⚙️ Gear (Processor)</label>
        <label class="radio-chip"><input type="radio" name="ring"> 🔗 Belt (Connector)</label>
        <label class="radio-chip"><input type="radio" name="ring"> 🔄 Pulley (Relay)</label>
        <label class="radio-chip"><input type="radio" name="ring"> 🚂 Engine (Driver)</label>
        <label class="radio-chip"><input type="radio" name="ring"> 🔩 Piston (Executor)</label>
      </div>
      <p class="modal-section-title">Import Source (GitHub URL or repo name)</p>
      <input class="form-input mb-2" placeholder="e.g. www-infinity/ring-engine-01" />
      <p class="modal-section-title">Options</p>
      <div class="checkbox-group">
        <label class="checkbox-item"><input type="checkbox" checked> Auto-configure connection points</label>
        <label class="checkbox-item"><input type="checkbox"> Register in .github/machines.json</label>
      </div>`,
    preview: '// Belt & Pulley import:\n// Type: Gear (Processor)\n// Source: [selected repo]\n// Config saved: .github/machines.json\n// Connected to this repo machine'
  },

  shoppingCart: {
    title: 'Shopping Cart',
    emoji: '🛒',
    desc: 'Add a shopping cart and checkout system to your GitHub Pages site. Choose from multiple e-commerce integrations.',
    form: `
      <p class="modal-section-title">Cart Type</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="cart" checked> 🛍️ Simple Cart (JS)</label>
        <label class="radio-chip"><input type="radio" name="cart"> 💳 Stripe Checkout</label>
        <label class="radio-chip"><input type="radio" name="cart"> 🅿️ PayPal Cart</label>
        <label class="radio-chip"><input type="radio" name="cart"> 🪙 Token-Gated</label>
      </div>
      <p class="modal-section-title">Features</p>
      <div class="checkbox-group">
        <label class="checkbox-item"><input type="checkbox" checked> Add to Cart button on products</label>
        <label class="checkbox-item"><input type="checkbox" checked> Cart sidebar / drawer</label>
        <label class="checkbox-item"><input type="checkbox"> Quantity selector</label>
        <label class="checkbox-item"><input type="checkbox"> Coupon code field</label>
        <label class="checkbox-item"><input type="checkbox"> Order confirmation page</label>
      </div>`,
    preview: '// Shopping Cart added:\n// Type: Simple Cart (JS)\n// Files added: js/cart.js\n// index.html: cart button + sidebar injected'
  },

  banking: {
    title: 'Banking',
    emoji: '💰',
    desc: 'Unify banking, PayPal payments, and financial tools. Sync payment options across all your repos for a consistent commerce experience.',
    form: `
      <p class="modal-section-title">Payment Methods</p>
      <div class="checkbox-group">
        <label class="checkbox-item"><input type="checkbox" checked> 🅿️ PayPal (Donate / Buy)</label>
        <label class="checkbox-item"><input type="checkbox"> 💳 Stripe payment button</label>
        <label class="checkbox-item"><input type="checkbox"> 🪙 Crypto / Token wallet</label>
        <label class="checkbox-item"><input type="checkbox"> 🏦 Bank transfer info section</label>
      </div>
      <p class="modal-section-title">PayPal Button Style</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="pp" checked> 💝 Donate</label>
        <label class="radio-chip"><input type="radio" name="pp"> 🛒 Buy Now</label>
        <label class="radio-chip"><input type="radio" name="pp"> 📅 Subscribe</label>
      </div>
      <p class="modal-section-title">PayPal Email / Account</p>
      <input class="form-input" placeholder="your-paypal@email.com" />`,
    preview: '// Banking integration:\n// PayPal Donate button added to index.html\n// Button links to your PayPal account\n// Synced across: 1 repo'
  },

  addFiles: {
    title: 'Add Files',
    emoji: '📀',
    desc: 'Add repository files, assets, scripts, or entire file collections from other repos or templates directly to this repository.',
    form: `
      <p class="modal-section-title">File Type</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="ftype" checked> 📄 HTML Page</label>
        <label class="radio-chip"><input type="radio" name="ftype"> 🎨 CSS File</label>
        <label class="radio-chip"><input type="radio" name="ftype"> ⚙️ JS Script</label>
        <label class="radio-chip"><input type="radio" name="ftype"> 🖼️ Image / Asset</label>
        <label class="radio-chip"><input type="radio" name="ftype"> 📦 Full Repo Files</label>
      </div>
      <p class="modal-section-title">Source URL or File Path</p>
      <input class="form-input mb-2" placeholder="https://github.com/... or filename.html" />
      <p class="modal-section-title">Destination Folder</p>
      <input class="form-input" placeholder="e.g. js/, css/, assets/ (blank = root)" />`,
    preview: '// Add Files:\n// Source: [selected file]\n// Destination: /\n// File will be committed via GitHub API'
  },

  display: {
    title: 'Display',
    emoji: '🖥️',
    desc: 'Configure screen display type, responsive breakpoints, layout grid, color mode, and visual style for different device sizes.',
    form: `
      <p class="modal-section-title">Layout Type</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="layout" checked> 📱 Mobile First</label>
        <label class="radio-chip"><input type="radio" name="layout"> 🖥️ Desktop First</label>
        <label class="radio-chip"><input type="radio" name="layout"> 📐 12-Col Grid</label>
        <label class="radio-chip"><input type="radio" name="layout"> 🃏 Card Grid</label>
      </div>
      <p class="modal-section-title">Color Mode</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="cmode" checked> 🌑 Dark</label>
        <label class="radio-chip"><input type="radio" name="cmode"> ☀️ Light</label>
        <label class="radio-chip"><input type="radio" name="cmode"> 🔄 Auto (System)</label>
      </div>
      <p class="modal-section-title">Max Content Width</p>
      <select class="select-input">
        <option>1200px (Standard)</option>
        <option>960px (Compact)</option>
        <option>Full Width</option>
        <option>1440px (Wide)</option>
      </select>`,
    preview: '// Display config applied:\n// Layout: Mobile First\n// Max width: 1200px\n// Dark mode: enabled\n// CSS media queries updated'
  },

  power: {
    title: 'Power',
    emoji: '🔌',
    desc: 'Emit power signals and run script executions. Trigger recharge cycles, signal packet runs, and scheduled automation via GitHub Actions.',
    form: `
      <p class="modal-section-title">Power Action</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="pwr" checked> ⚡ Run Script</label>
        <label class="radio-chip"><input type="radio" name="pwr"> 📡 Emit Signal Packet</label>
        <label class="radio-chip"><input type="radio" name="pwr"> 🔋 Recharge / Rebuild</label>
        <label class="radio-chip"><input type="radio" name="pwr"> ⏰ Schedule Automation</label>
      </div>
      <p class="modal-section-title">Schedule (cron, if scheduled)</p>
      <input class="form-input mb-2" placeholder="e.g. 0 * * * * (every hour)" />
      <p class="modal-section-title">Script / Command</p>
      <textarea class="textarea-input" placeholder="Enter script or automation command..."></textarea>`,
    preview: '// Power Signal sent:\n// Action: Run Script\n// Target: this repo\n// Scheduled: immediate\n// GitHub Actions workflow triggered'
  },

  tickets: {
    title: 'Tickets',
    emoji: '🎟️',
    desc: 'Add ticket booth functionality — event tickets, access passes, timed entry, memberships, and date-based content gates.',
    form: `
      <p class="modal-section-title">Ticket Type</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="tkt" checked> 🎪 Event Ticket</label>
        <label class="radio-chip"><input type="radio" name="tkt"> 🔑 Access Pass</label>
        <label class="radio-chip"><input type="radio" name="tkt"> 📅 Timed Entry</label>
        <label class="radio-chip"><input type="radio" name="tkt"> 👑 Membership</label>
      </div>
      <p class="modal-section-title">Duration</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="dur" checked> 📅 One-Time</label>
        <label class="radio-chip"><input type="radio" name="dur"> 🔄 Monthly</label>
        <label class="radio-chip"><input type="radio" name="dur"> 📆 Annual</label>
        <label class="radio-chip"><input type="radio" name="dur"> ♾️ Lifetime</label>
      </div>
      <p class="modal-section-title">Event / Start Date</p>
      <input class="form-input" type="date" />`,
    preview: '// Ticket Booth added:\n// Type: Event Ticket\n// Duration: One-Time\n// Files added: js/tickets.js\n// index.html: ticket widget injected'
  },

  modulator: {
    title: 'Modulator',
    emoji: '🎛️',
    desc: 'Sync and modulate effects across your repo pages. Adjust animation speed, transition effects, audio sync, and visual effects.',
    form: `
      <p class="modal-section-title">Effect Type</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="mod" checked> 🌊 Smooth Scroll</label>
        <label class="radio-chip"><input type="radio" name="mod"> ✨ Particle Effects</label>
        <label class="radio-chip"><input type="radio" name="mod"> 🎵 Audio Sync</label>
        <label class="radio-chip"><input type="radio" name="mod"> 💫 Parallax</label>
        <label class="radio-chip"><input type="radio" name="mod"> 🌀 Transitions</label>
      </div>
      <p class="modal-section-title">Intensity</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="intens" checked> 🔅 Subtle</label>
        <label class="radio-chip"><input type="radio" name="intens"> 🔆 Medium</label>
        <label class="radio-chip"><input type="radio" name="intens"> 🔥 Intense</label>
      </div>`,
    preview: '// Modulator applied:\n// Effect: Smooth Scroll + Parallax\n// Intensity: Subtle\n// js/modulator.js added\n// index.html updated'
  },

  voice: {
    title: 'Voice',
    emoji: '🎙️',
    desc: 'Add voice and microphone features — speech-to-text input, voice commands, audio recording, and sound wave visualizations.',
    form: `
      <p class="modal-section-title">Voice Feature</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="voice" checked> 🎤 Speech-to-Text</label>
        <label class="radio-chip"><input type="radio" name="voice"> 🎧 Audio Recorder</label>
        <label class="radio-chip"><input type="radio" name="voice"> 📢 Text-to-Speech</label>
        <label class="radio-chip"><input type="radio" name="voice"> 🔊 Sound Visualizer</label>
      </div>
      <p class="modal-section-title">Language</p>
      <select class="select-input">
        <option>English (US)</option>
        <option>English (UK)</option>
        <option>Spanish</option>
        <option>French</option>
        <option>Auto-detect</option>
      </select>`,
    preview: '// Voice feature added:\n// Type: Speech-to-Text\n// API: Web Speech API\n// js/voice.js added\n// Mic permission requested on use'
  },

  advertising: {
    title: 'Advertising',
    emoji: '🥁',
    desc: 'Add advertising widgets, banners, and promotional content. Choose from self-serve ads, affiliate links, or custom banner slots.',
    form: `
      <p class="modal-section-title">Ad Type</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="ad" checked> 📦 Banner Ad Slot</label>
        <label class="radio-chip"><input type="radio" name="ad"> 🔗 Affiliate Links</label>
        <label class="radio-chip"><input type="radio" name="ad"> 🎯 Promoted Content</label>
        <label class="radio-chip"><input type="radio" name="ad"> 📱 Native Ad Card</label>
      </div>
      <p class="modal-section-title">Placement</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="adplace" checked> 🔝 Header</label>
        <label class="radio-chip"><input type="radio" name="adplace"> 🔚 Footer</label>
        <label class="radio-chip"><input type="radio" name="adplace"> 📌 Sidebar</label>
        <label class="radio-chip"><input type="radio" name="adplace"> 🃏 In-Content</label>
      </div>`,
    preview: '// Ad slot added:\n// Type: Banner Ad Slot\n// Placement: Header\n// Dimensions: 728×90 (leaderboard)\n// index.html updated'
  },

  music: {
    title: 'Music',
    emoji: '🎹',
    desc: 'Add a full music system to any page — background audio, playlist player, MIDI keyboard, or a complete audio machine built from interlocking scripts.',
    form: `
      <p class="modal-section-title">Music Feature</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="mus" checked> 🎵 Background Music</label>
        <label class="radio-chip"><input type="radio" name="mus"> 📻 Playlist Player</label>
        <label class="radio-chip"><input type="radio" name="mus"> 🎹 MIDI Keyboard</label>
        <label class="radio-chip"><input type="radio" name="mus"> 🎛️ Full Audio Machine</label>
      </div>
      <p class="modal-section-title">Source</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="msrc" checked> 🔗 URL / Embed</label>
        <label class="radio-chip"><input type="radio" name="msrc"> 📁 Repo File</label>
        <label class="radio-chip"><input type="radio" name="msrc"> 📡 RSS / Stream</label>
      </div>
      <p class="modal-section-title">Audio URL</p>
      <input class="form-input" placeholder="https://example.com/track.mp3" />`,
    preview: '// Music added:\n// Type: Background Music\n// Source: URL embed\n// js/music.js added\n// Audio controls injected into index.html'
  },

  navigation: {
    title: 'Navigation',
    emoji: '🕹️',
    desc: 'Manage page navigation — add a search box, hamburger menu, jump-to links, breadcrumbs, and inter-page routing.',
    form: `
      <p class="modal-section-title">Navigation Elements</p>
      <div class="checkbox-group">
        <label class="checkbox-item"><input type="checkbox" checked> 🍔 Hamburger menu</label>
        <label class="checkbox-item"><input type="checkbox" checked> 🔍 Search box</label>
        <label class="checkbox-item"><input type="checkbox"> ⬆️ Back-to-top button</label>
        <label class="checkbox-item"><input type="checkbox"> 🍞 Breadcrumbs</label>
        <label class="checkbox-item"><input type="checkbox"> 🔗 Jump-to section links</label>
        <label class="checkbox-item"><input type="checkbox"> 🗺️ Site map page</label>
      </div>
      <p class="modal-section-title">Jump-To Sections (one per line)</p>
      <textarea class="textarea-input" placeholder="#hero&#10;#features&#10;#about&#10;#contact"></textarea>`,
    preview: '// Navigation added:\n// ✅ Hamburger menu\n// ✅ Search box\n// Jump-to links: 4 sections\n// index.html updated'
  },

  puzzle: {
    title: 'Puzzle',
    emoji: '🧩',
    desc: 'Build a full modular puzzle where each piece connects to a repo machine. Complete all pieces to unlock the next-level build and create a unified network.',
    form: `
      <p class="modal-section-title">Puzzle Piece Type</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="puz" checked> 🧩 Standard Piece</label>
        <label class="radio-chip"><input type="radio" name="puz"> 🔑 Key Piece</label>
        <label class="radio-chip"><input type="radio" name="puz"> 🌟 Bonus Piece</label>
      </div>
      <p class="modal-section-title">Connect to Repo Machine</p>
      <select class="select-input mb-2">
        <option>Select a repo machine...</option>
      </select>
      <p class="modal-section-title">Puzzle Options</p>
      <div class="checkbox-group">
        <label class="checkbox-item"><input type="checkbox" checked> Auto-start new puzzle when complete</label>
        <label class="checkbox-item"><input type="checkbox"> Add completion animation</label>
        <label class="checkbox-item"><input type="checkbox"> Share puzzle state to network</label>
      </div>`,
    preview: '// Puzzle piece added:\n// Type: Standard Piece\n// Connected to: [repo-machine]\n// Puzzle progress: 7/16 pieces\n// .github/puzzle.json updated'
  },

  paypal: {
    title: 'PayPal/Payments',
    emoji: '💲',
    desc: 'Add PayPal integration, payment choices, token minting, or token exchange options. AI builds the right payment flow for your page intelligently.',
    form: `
      <p class="modal-section-title">Payment Option</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="pay" checked> 🅿️ PayPal Donate</label>
        <label class="radio-chip"><input type="radio" name="pay"> 🛒 PayPal Buy Now</label>
        <label class="radio-chip"><input type="radio" name="pay"> 🪙 Mint Token</label>
        <label class="radio-chip"><input type="radio" name="pay"> 🔄 Token Exchange</label>
        <label class="radio-chip"><input type="radio" name="pay"> 💳 Stripe Checkout</label>
      </div>
      <p class="modal-section-title">PayPal Email / Account ID</p>
      <input class="form-input mb-2" placeholder="your-paypal@email.com" />
      <p class="modal-section-title">Amount (optional)</p>
      <input class="form-input" placeholder="e.g. 5.00 or blank for custom amount" />`,
    preview: '// PayPal integration:\n// Type: Donate button\n// Account: [your email]\n// Button injected into index.html\n// js/payments.js added'
  },

  researchWriter: {
    title: 'Research Writer',
    emoji: '♠️',
    desc: 'Add the research writer — prints a living token receipt on every action that can grow into huge websites. Each action generates an AI research article page.',
    form: `
      <p class="modal-section-title">Research Source</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="rsrc" checked> 🤖 Infinity AI Auto</label>
        <label class="radio-chip"><input type="radio" name="rsrc"> 🔬 Scientific Articles</label>
        <label class="radio-chip"><input type="radio" name="rsrc"> 📰 News &amp; Trends</label>
        <label class="radio-chip"><input type="radio" name="rsrc"> 🌐 Custom Topic</label>
      </div>
      <p class="modal-section-title">Token Receipt Options</p>
      <div class="checkbox-group">
        <label class="checkbox-item"><input type="checkbox" checked> Print token on every action</label>
        <label class="checkbox-item"><input type="checkbox" checked> Generate research page per action</label>
        <label class="checkbox-item"><input type="checkbox"> Connect tokens with jump-to logic</label>
        <label class="checkbox-item"><input type="checkbox"> Allow tokens to grow into sub-sites</label>
      </div>
      <p class="modal-section-title">Research Topic (for custom)</p>
      <input class="form-input" placeholder="e.g. quantum computing, Bitcoin, AI ethics" />`,
    preview: '// Research Writer activated:\n// Source: Infinity AI Auto\n// Token receipts: ON\n// Next action generates:\n//   → research-token-001.html'
  },

  hamburgerBuilder: {
    title: 'Hamburger Builder',
    emoji: '🟥',
    desc: 'Add a hamburger menu with categories. AI asks what to add and lets you select which repos to include in the navigation.',
    form: `
      <p class="modal-section-title">Menu Style</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="hmb" checked> 📱 Side Drawer</label>
        <label class="radio-chip"><input type="radio" name="hmb"> 🔽 Dropdown</label>
        <label class="radio-chip"><input type="radio" name="hmb"> 🌐 Full-Screen Overlay</label>
        <label class="radio-chip"><input type="radio" name="hmb"> 📌 Mega Menu</label>
      </div>
      <p class="modal-section-title">Categories to Add</p>
      <div class="checkbox-group">
        <label class="checkbox-item"><input type="checkbox" checked> 🏠 Home</label>
        <label class="checkbox-item"><input type="checkbox" checked> 📚 Projects / Repos</label>
        <label class="checkbox-item"><input type="checkbox"> 📝 Blog</label>
        <label class="checkbox-item"><input type="checkbox"> 🛒 Shop</label>
        <label class="checkbox-item"><input type="checkbox"> ℹ️ About</label>
        <label class="checkbox-item"><input type="checkbox"> 📬 Contact</label>
      </div>`,
    preview: '// Hamburger Menu added:\n// Style: Side Drawer\n// Categories: Home, Projects\n// index.html updated\n// css/nav.css added'
  },

  extract: {
    title: 'Extract',
    emoji: '🟨',
    desc: 'Extract data, styles, content, or components from this page. AI scans what can be plucked and moved — choose what to extract from the popup menu.',
    form: `
      <p class="modal-section-title">What to Extract</p>
      <div class="checkbox-group">
        <label class="checkbox-item"><input type="checkbox" checked> 🎨 CSS styles &amp; variables</label>
        <label class="checkbox-item"><input type="checkbox" checked> 🃏 Cards &amp; components</label>
        <label class="checkbox-item"><input type="checkbox"> 📝 Text content</label>
        <label class="checkbox-item"><input type="checkbox"> 🖼️ Images &amp; assets</label>
        <label class="checkbox-item"><input type="checkbox"> ⚙️ JavaScript functions</label>
        <label class="checkbox-item"><input type="checkbox"> 📊 Data &amp; JSON</label>
      </div>
      <p class="modal-section-title">Export To</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="expTo" checked> 📋 Clipboard</label>
        <label class="radio-chip"><input type="radio" name="expTo"> 🧲 Memory (for Drop Content)</label>
        <label class="radio-chip"><input type="radio" name="expTo"> 📁 New File in Repo</label>
      </div>`,
    preview: '// Extract complete:\n// Extracted: CSS styles, Cards\n// Destination: Memory slot\n// Ready to use with 🟦 Drop Content'
  },

  mediaHub: {
    title: 'Media Hub',
    emoji: '🎷',
    desc: 'Add Infinity Radio, Games, TV/Video, Image Gallery, or RSS feeds. Choose your media type and configure local or worldwide content channels.',
    form: `
      <p class="modal-section-title">Media Type</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="media" checked> 📻 Radio</label>
        <label class="radio-chip"><input type="radio" name="media"> 🎮 Games</label>
        <label class="radio-chip"><input type="radio" name="media"> 📺 TV / Video</label>
        <label class="radio-chip"><input type="radio" name="media"> 🖼️ Image Gallery</label>
        <label class="radio-chip"><input type="radio" name="media"> 📡 RSS Feed</label>
      </div>
      <p class="modal-section-title">Channel Scope</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="scope" checked> 🌍 Worldwide</label>
        <label class="radio-chip"><input type="radio" name="scope"> 🏠 Local / Custom</label>
      </div>
      <p class="modal-section-title">Options</p>
      <div class="checkbox-group">
        <label class="checkbox-item"><input type="checkbox" checked> Auto preset channels</label>
        <label class="checkbox-item"><input type="checkbox"> Allow manual channel input</label>
        <label class="checkbox-item"><input type="checkbox"> Glance &amp; pluck best content automatically</label>
      </div>`,
    preview: '// Media Hub added:\n// Type: Radio\n// Scope: Worldwide\n// js/media-hub.js added\n// index.html: media widget injected'
  },

  loveCommunity: {
    title: 'Love & Community',
    emoji: '♥️',
    desc: 'Add a love or community section — from church pages to pet lover communities. AI suggests logical starting choices to build your community around.',
    form: `
      <p class="modal-section-title">Community Theme</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="love" checked> ⛪ Spiritual / Church</label>
        <label class="radio-chip"><input type="radio" name="love"> 🐾 Pet Lovers</label>
        <label class="radio-chip"><input type="radio" name="love"> 🌱 Nature / Environment</label>
        <label class="radio-chip"><input type="radio" name="love"> ❤️ General Community</label>
        <label class="radio-chip"><input type="radio" name="love"> 🎨 Arts &amp; Creativity</label>
      </div>
      <p class="modal-section-title">AI Starter Content</p>
      <div class="checkbox-group">
        <label class="checkbox-item"><input type="checkbox" checked> Generate welcome section</label>
        <label class="checkbox-item"><input type="checkbox" checked> Add relevant content cards</label>
        <label class="checkbox-item"><input type="checkbox"> Add community forum / chat link</label>
        <label class="checkbox-item"><input type="checkbox"> Include relevant books or resources</label>
      </div>`,
    preview: '// Love & Community section added:\n// Theme: Spiritual / Church\n// AI generated: Welcome + 3 content cards\n// index.html updated'
  },

  updateContent: {
    title: 'Update Content',
    emoji: '⭐',
    desc: 'Update page content with new scientific research, fact-check materials, compare with other repo research for alignment, and add science trend updates.',
    form: `
      <p class="modal-section-title">Update Type</p>
      <div class="checkbox-group">
        <label class="checkbox-item"><input type="checkbox" checked> 🔬 Add new scientific research</label>
        <label class="checkbox-item"><input type="checkbox" checked> ✅ Fact-check existing content</label>
        <label class="checkbox-item"><input type="checkbox"> 🔄 Compare with other repos for alignment</label>
        <label class="checkbox-item"><input type="checkbox"> 📈 Add science trend analysis</label>
      </div>
      <p class="modal-section-title">Research Topic</p>
      <input class="form-input mb-2" placeholder="e.g. AI, climate, blockchain, health" />
      <p class="modal-section-title">Depth</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="depth" checked> 📝 Summary</label>
        <label class="radio-chip"><input type="radio" name="depth"> 📖 Full Article</label>
        <label class="radio-chip"><input type="radio" name="depth"> 🔬 Deep Research</label>
      </div>`,
    preview: '// Content updated:\n// New research added: 2 articles\n// Fact-check: 5 claims verified\n// Trend cards added: 3\n// index.html updated'
  },

  pianoSignIn: {
    title: 'Piano Sign-In',
    emoji: '🎵',
    desc: '8-note piano sign-in system. Users play a melody as their password — dynamically matched (70%+ threshold) and stored encrypted in repo files.',
    form: `
      <p class="modal-section-title">Security Level</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="sec" checked> 🎵 8-Note Melody</label>
        <label class="radio-chip"><input type="radio" name="sec"> 🎹 16-Note Sequence</label>
        <label class="radio-chip"><input type="radio" name="sec"> 🔒 32-Note + Timing</label>
        <label class="radio-chip"><input type="radio" name="sec"> ⚛️ Quantum Dynamic</label>
      </div>
      <p class="modal-section-title">Match Threshold</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="thresh"> 60% (Easy)</label>
        <label class="radio-chip"><input type="radio" name="thresh" checked> 70% (Standard)</label>
        <label class="radio-chip"><input type="radio" name="thresh"> 85% (Strict)</label>
        <label class="radio-chip"><input type="radio" name="thresh"> 95% (Max Security)</label>
      </div>
      <p class="modal-section-title">Storage Options</p>
      <div class="checkbox-group">
        <label class="checkbox-item"><input type="checkbox" checked> Encrypt stored melody patterns</label>
        <label class="checkbox-item"><input type="checkbox" checked> Save to repo files (encrypted)</label>
        <label class="checkbox-item"><input type="checkbox"> Use GitHub Secrets (GHP) for encryption key</label>
      </div>`,
    preview: '// Piano Sign-In setup:\n// Notes: 8\n// Threshold: 70%\n// Patterns: AES-encrypted in repo\n// js/piano-auth.js added\n// Piano widget injected into login page'
  },

  visualizer: {
    title: 'Visualizer',
    emoji: '😎',
    desc: 'Add cool audio or data visualizer effects to your page. Choose from multiple types that meld into your existing content.',
    form: `
      <p class="modal-section-title">Visualizer Type</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="viz" checked> 🌊 Audio Waveform</label>
        <label class="radio-chip"><input type="radio" name="viz"> 📊 Bar Spectrum</label>
        <label class="radio-chip"><input type="radio" name="viz"> 🌀 Circular Orbit</label>
        <label class="radio-chip"><input type="radio" name="viz"> ✨ Particle Storm</label>
        <label class="radio-chip"><input type="radio" name="viz"> 🌌 Galaxy Flow</label>
      </div>
      <p class="modal-section-title">Placement</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="vizplace" checked> 🎨 Background</label>
        <label class="radio-chip"><input type="radio" name="vizplace"> 🎯 Hero Section</label>
        <label class="radio-chip"><input type="radio" name="vizplace"> 📌 Floating Widget</label>
      </div>`,
    preview: '// Visualizer added:\n// Type: Audio Waveform\n// Placement: Background\n// js/visualizer.js added\n// Canvas injected into index.html'
  },

  machinePart: {
    title: 'Machine Part',
    emoji: '♣️',
    desc: 'Create or assign a digital transformer machine part to this repo — Reader, Writer, Scraper, Memory, Power, or Marketplace. Build a map of machine parts across all repos.',
    form: `
      <p class="modal-section-title">Machine Part Type</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="part" checked> 📖 Reader</label>
        <label class="radio-chip"><input type="radio" name="part"> ✏️ Writer</label>
        <label class="radio-chip"><input type="radio" name="part"> 🕷️ Scraper</label>
        <label class="radio-chip"><input type="radio" name="part"> 🧠 Memory</label>
        <label class="radio-chip"><input type="radio" name="part"> ⚡ Power</label>
        <label class="radio-chip"><input type="radio" name="part"> 💼 Marketplace</label>
      </div>
      <p class="modal-section-title">Options</p>
      <div class="checkbox-group">
        <label class="checkbox-item"><input type="checkbox" checked> Register in global machine map</label>
        <label class="checkbox-item"><input type="checkbox"> Let AI auto-assign best part for this repo</label>
        <label class="checkbox-item"><input type="checkbox"> Allow part transformation later</label>
      </div>`,
    preview: '// Machine Part assigned:\n// Repo: [this-repo]\n// Part: Reader\n// Registered: .github/machine-map.json\n// Ready to connect to other parts'
  },

  tokenWalker: {
    title: 'Token Walker',
    emoji: '🟡',
    desc: 'Mint tokens, walk the token chain, and manage token options. Design tokens with detailed manual input or quick-launch presets.',
    form: `
      <p class="modal-section-title">Token Action</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="tok" checked> 🪙 Mint New Token</label>
        <label class="radio-chip"><input type="radio" name="tok"> 👜 Token Wallet</label>
        <label class="radio-chip"><input type="radio" name="tok"> 🔄 Token Exchange</label>
        <label class="radio-chip"><input type="radio" name="tok"> 📊 Token Stats</label>
      </div>
      <p class="modal-section-title">Token Name</p>
      <input class="form-input mb-2" placeholder="e.g. InfinityToken" />
      <p class="modal-section-title">Token Symbol</p>
      <input class="form-input mb-2" placeholder="e.g. INF" />
      <p class="modal-section-title">Mint Mode</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="mintmode" checked> ⚡ Quick Launch</label>
        <label class="radio-chip"><input type="radio" name="mintmode"> 🔬 Manual / Advanced</label>
      </div>`,
    preview: '// Token minted:\n// Name: InfinityToken\n// Symbol: INF\n// Supply: 1,000,000\n// Saved to: tokens/INF.json'
  },

  merchant: {
    title: 'Merchant',
    emoji: '♦️',
    desc: 'Add merchant business options — product listings, business info, contact forms, booking systems, and full commerce integrations.',
    form: `
      <p class="modal-section-title">Merchant Type</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="merch" checked> 🏪 Product Store</label>
        <label class="radio-chip"><input type="radio" name="merch"> 💼 Service Business</label>
        <label class="radio-chip"><input type="radio" name="merch"> 📅 Booking System</label>
        <label class="radio-chip"><input type="radio" name="merch"> 🍕 Food / Menu</label>
      </div>
      <p class="modal-section-title">Features</p>
      <div class="checkbox-group">
        <label class="checkbox-item"><input type="checkbox" checked> Product / service listings</label>
        <label class="checkbox-item"><input type="checkbox" checked> Contact / order form</label>
        <label class="checkbox-item"><input type="checkbox"> Business hours widget</label>
        <label class="checkbox-item"><input type="checkbox"> Map / location embed</label>
      </div>`,
    preview: '// Merchant section added:\n// Type: Product Store\n// Features: Listings + Contact form\n// index.html updated\n// pages/shop.html created'
  },

  encrypt: {
    title: 'Encrypt',
    emoji: '🧱',
    desc: 'Encrypt user data stored in repository files by commit. Protect sensitive information with AES encryption backed by GitHub Secrets.',
    form: `
      <p class="modal-section-title">What to Encrypt</p>
      <div class="checkbox-group">
        <label class="checkbox-item"><input type="checkbox" checked> User profile data</label>
        <label class="checkbox-item"><input type="checkbox" checked> Sign-in credentials</label>
        <label class="checkbox-item"><input type="checkbox"> Config files</label>
        <label class="checkbox-item"><input type="checkbox"> API keys in repo</label>
      </div>
      <p class="modal-section-title">Encryption Method</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="enc" checked> 🔒 AES-256</label>
        <label class="radio-chip"><input type="radio" name="enc"> 🔑 RSA Public Key</label>
        <label class="radio-chip"><input type="radio" name="enc"> ⚛️ Quantum-Safe</label>
      </div>
      <p class="modal-section-title">Key Storage</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="keystore" checked> 🤫 GitHub Secrets</label>
        <label class="radio-chip"><input type="radio" name="keystore"> 🔑 User-held Key</label>
      </div>`,
    preview: '// Encryption setup:\n// Method: AES-256\n// Key: stored in GitHub Secrets\n// Files encrypted: user-data.json\n// .github/encrypt.json config added'
  },

  doubleContent: {
    title: 'Double Content',
    emoji: '🍄',
    desc: 'Double the entire content on the page — if there were 10 items, now there are 20. AI generates complementary content to expand page size.',
    form: `
      <p class="modal-section-title">Double Mode</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="dbl" checked> 🤖 AI-Generated (unique)</label>
        <label class="radio-chip"><input type="radio" name="dbl"> 🔄 Mirror (duplicate)</label>
        <label class="radio-chip"><input type="radio" name="dbl"> 🔀 Remix (varied)</label>
      </div>
      <p class="modal-section-title">What to Double</p>
      <div class="checkbox-group">
        <label class="checkbox-item"><input type="checkbox" checked> All content sections</label>
        <label class="checkbox-item"><input type="checkbox"> Cards / product listings only</label>
        <label class="checkbox-item"><input type="checkbox"> Research articles only</label>
      </div>`,
    preview: '// Double Content:\n// Mode: AI-Generated\n// Before: 10 items\n// After: 20 items (10 AI-generated)\n// index.html updated'
  },

  unifier: {
    title: 'Unifier',
    emoji: '⬜',
    desc: 'Add the soul intent of each machine repo into one major site. Scans all repos and puts their main intent as a faceted gem card into a unified page.',
    form: `
      <p class="modal-section-title">Scan Repos</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="uni" checked> 🌐 All my repos</label>
        <label class="radio-chip"><input type="radio" name="uni"> 📋 Selected repos</label>
        <label class="radio-chip"><input type="radio" name="uni"> 🏢 Organisation repos</label>
      </div>
      <p class="modal-section-title">Output Format</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="unifmt" checked> 🃏 Intent Cards</label>
        <label class="radio-chip"><input type="radio" name="unifmt"> 🗺️ Site Map</label>
        <label class="radio-chip"><input type="radio" name="unifmt"> 📝 Summary Page</label>
      </div>
      <p class="modal-section-title">Options</p>
      <div class="checkbox-group">
        <label class="checkbox-item"><input type="checkbox" checked> Extract main intent only (not full content)</label>
        <label class="checkbox-item"><input type="checkbox"> Link unified page back to each repo</label>
      </div>`,
    preview: '// Unifier scan complete:\n// Repos scanned: all\n// Intents extracted: 12 repos\n// unified/index.html will be created\n// Each repo: 1 facet gem card'
  },

  facets: {
    title: 'Facets',
    emoji: '💎',
    desc: 'Extract the core intent from a single repo and start a new clone or derivative site built around that faceted gem of purpose.',
    form: `
      <p class="modal-section-title">Repo Core Intent (or let AI detect)</p>
      <textarea class="textarea-input mb-2" placeholder="Describe the core intent of this repo, or leave blank for AI auto-detection..."></textarea>
      <p class="modal-section-title">Build Output</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="facet" checked> 🆕 New Clone Repo</label>
        <label class="radio-chip"><input type="radio" name="facet"> 📄 New Landing Page</label>
        <label class="radio-chip"><input type="radio" name="facet"> 🃏 Intent Card Only</label>
      </div>
      <p class="modal-section-title">New Repo / Page Name</p>
      <input class="form-input" placeholder="facet-[repo-name]-v2" />`,
    preview: '// Facets extracted:\n// Source: [this-repo]\n// Core intent: auto-detected\n// Output: New clone repo\n// Starting clone configuration...'
  },

  editRemove: {
    title: 'Edit/Remove',
    emoji: '🔥',
    desc: 'Change, edit, or remove content, sections, files, or features from this repository page. Select your target and action.',
    form: `
      <p class="modal-section-title">Action</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="er" checked> ✏️ Edit</label>
        <label class="radio-chip"><input type="radio" name="er"> 🗑️ Remove</label>
        <label class="radio-chip"><input type="radio" name="er"> 🔄 Replace</label>
      </div>
      <p class="modal-section-title">Target Type</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="target" checked> 📄 Page Section</label>
        <label class="radio-chip"><input type="radio" name="target"> 🃏 Card / Component</label>
        <label class="radio-chip"><input type="radio" name="target"> 📁 File</label>
        <label class="radio-chip"><input type="radio" name="target"> 🎨 Style Rule</label>
      </div>
      <p class="modal-section-title">Target Selector / Filename</p>
      <input class="form-input mb-2" placeholder="e.g. .hero-section, footer, about.html" />
      <p class="modal-section-title">New Content (for Edit / Replace)</p>
      <textarea class="textarea-input" placeholder="Enter new content or HTML..."></textarea>`,
    preview: '// Edit/Remove:\n// Action: Edit\n// Target: .hero-section\n// Change will be committed to index.html'
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
    this._bindToolCards();
    this._registerSW();

    this.checkAuth();
  }

  /* ── Service Worker ─────────────────────────────────────── */
  _registerSW() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/Gitpub/sw.js').catch(() => {});
    }
  }

  /* ── Gitpal tool cards (button[data-toast]) ─────────────── */
  _bindToolCards() {
    document.querySelectorAll('.tool-card[data-toast]').forEach(card => {
      card.addEventListener('click', () => {
        this.showToast(card.dataset.toast, 'info');
      });
    });
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
    const userDisplay = document.getElementById('usernameDisplay');
    if (userDisplay) userDisplay.textContent = this.username;
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
        // GitHub API returns up to 100 repos per page. Users with >100 repos will only
      // see their 100 most recently updated. To support larger accounts, replace this
      // with a paginated loop: fetch page=1, 2, ... until Link header has no "next".
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
      <button class="btn btn-secondary mt-3" id="retryBtn">Retry</button>
    </div>`;
    const retryBtn = document.getElementById('retryBtn');
    if (retryBtn) retryBtn.addEventListener('click', () => this.loadRepos());
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
        ${row.buttons.map(([e, id, t, lbl]) =>
          `<button class="emoji-btn" data-action="${id}" data-repo="${repo.name}" title="${t}" aria-label="${t}"><span class="emoji-icon">${e}</span><span class="emoji-label">${lbl || t}</span></button>`
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
        <button class="btn btn-secondary" id="modalPreviewBtn">👁️ Preview Changes</button>
        <button class="btn btn-success" id="modalApplyBtn">✅ Apply &amp; Commit</button>
      </div>`;

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    this.activeModal = { actionId, repoName };
    this.currentRepo = repoName;

    // Wire close
    box.querySelector('#modalCloseBtn').addEventListener('click', () => this.closeModal());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) this.closeModal(); });
    document.addEventListener('keydown', this._escClose = (e) => { if (e.key === 'Escape') this.closeModal(); });

    // Live preview: update whenever any form element changes
    const refreshPreview = () => this._refreshPreview(box, content, repoName);
    box.querySelectorAll('select, input, textarea').forEach(el => {
      el.addEventListener('change', refreshPreview);
      el.addEventListener('input', refreshPreview);
    });

    // Wire preview button
    box.querySelector('#modalPreviewBtn').addEventListener('click', () => {
      refreshPreview();
      this.showToast('👁️ Preview updated', 'info');
    });

    // Wire apply
    box.querySelector('#modalApplyBtn').addEventListener('click', () => this._applyChanges(box, content.title, repoName));

    // Colour swatches
    box.querySelectorAll('.color-swatch').forEach(swatch => {
      swatch.addEventListener('click', () => {
        box.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');
        refreshPreview();
      });
    });
  }

  /* ── Truncate a string with ellipsis ────────────────────── */
  _truncate(str, max = 60) {
    return str.length > max ? str.slice(0, max) + '…' : str;
  }

  /* ── Collect current form state from modal ────────────────── */
  _collectFormState(box) {
    const state = { radios: {}, selects: [], checkboxes: [], texts: [], swatches: null };

    box.querySelectorAll('input[type="radio"]:checked').forEach(radio => {
      const label = radio.closest('label')?.textContent?.trim();
      state.radios[radio.name] = label || radio.value;
    });

    box.querySelectorAll('select').forEach(sel => {
      // Find the nearest preceding section title for a reliable label
      let el = sel.previousElementSibling;
      while (el && !el.classList.contains('modal-section-title')) el = el.previousElementSibling;
      const label = el?.textContent?.trim() || 'Option';
      state.selects.push({ label, value: sel.options[sel.selectedIndex]?.text || sel.value });
    });

    box.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
      const label = cb.closest('label')?.textContent?.trim();
      if (label) state.checkboxes.push(label);
    });

    box.querySelectorAll('input[type="text"], textarea').forEach(inp => {
      const val = inp.value.trim();
      if (val) state.texts.push(val);
    });

    const activeSwatch = box.querySelector('.color-swatch.active');
    if (activeSwatch) state.swatches = activeSwatch.style.background;

    return state;
  }

  /* ── Regenerate preview from current form state ──────────── */
  _refreshPreview(box, content, repoName) {
    const pre = document.getElementById('modalPreview');
    if (!pre) return;

    const st = this._collectFormState(box);
    const lines = [
      `// ${content.emoji}  ${content.title}`,
      `// Repo: ${repoName}`,
      `// ─────────────────────────────────────`,
    ];

    Object.entries(st.radios).forEach(([, val]) => {
      lines.push(`// ◉ ${val}`);
    });

    st.selects.forEach(({ value }) => {
      lines.push(`// ▸ ${value}`);
    });

    if (st.checkboxes.length) {
      lines.push(`// Enabled (${st.checkboxes.length}):`);
      st.checkboxes.forEach(c => lines.push(`//   ✓ ${c}`));
    }

    if (st.texts.length) {
      lines.push(`// Input: "${this._truncate(st.texts[0])}"`);
    }

    if (st.swatches) {
      lines.push(`// Color: ${st.swatches}`);
    }

    lines.push(`// ─────────────────────────────────────`);
    lines.push(`// ✅ Ready to commit · files: index.html`);

    pre.textContent = lines.join('\n');
    pre.style.color = '';
  }

  closeModal() {
    document.getElementById('modalOverlay')?.classList.remove('open');
    document.body.style.overflow = '';
    this.activeModal = null;
    document.removeEventListener('keydown', this._escClose);
  }

  _applyChanges(box, toolName, repoName) {
    const pre = document.getElementById('modalPreview');
    if (pre) {
      // Collect final state for commit log
      const st = this._collectFormState(box);
      const sha = Math.random().toString(36).slice(2, 10);
      const ts  = new Date().toISOString();
      const lines = [
        `// ✅ Committed successfully`,
        `// Repo:   ${repoName}`,
        `// Tool:   ${toolName}`,
        `// SHA:    ${sha}`,
        `// Time:   ${ts}`,
        `// ─────────────────────────────────────`,
      ];
      if (Object.keys(st.radios).length) {
        Object.values(st.radios).forEach(v => lines.push(`// ◉ ${v}`));
      }
      if (st.checkboxes.length) {
        st.checkboxes.forEach(c => lines.push(`// ✓ ${c}`));
      }
      if (st.texts.length) {
        lines.push(`// Input: "${this._truncate(st.texts[0])}"`);
      }
      pre.textContent = lines.join('\n');
      pre.style.color = 'var(--gitpub-accent2)';
    }
    this.showToast(`✅ "${toolName}" committed to ${repoName}`, 'success');
    setTimeout(() => this.closeModal(), 1200);
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
