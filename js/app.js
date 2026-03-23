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
   Each entry: [emoji, id, title, shortLabel]
   ─────────────────────────────────────────────────────────── */
const EMOJI_ROWS = [
  {
    label: 'Page Tools',
    buttons: [
      ['📍','moveUpDown',   'Move Up/Down',    'Move'],
      ['📎','addPages',     'Add Pages',        'Pages'],
      ['🔧','quickFix',     'Quick Fix',        'Fix'],
      ['🪣','styles',       'Styles',           'Styles'],
      ['🧲','pullMemory',   'Pull Memory',      'Pull'],
      ['🟦','dropContent',  'Drop Content',     'Drop'],
      ['🧰','toolbox',      'Toolbox',          'Tools'],
      ['🔬','microscope',   'Fine Adjustments', 'Detail'],
      ['🥽','deepFix',      'Deep Fix',         'DeepFix'],
      ['🔥','editRemove',   'Edit / Remove',    'Edit'],
    ]
  },
  {
    label: 'Build & Expand',
    buttons: [
      ['🍄','doubleContent', 'Double Content',     'Double'],
      ['⭐','updateContent', 'Update Content',     'Update'],
      ['🟩','aiEngineer',    'AI Engineering',     'AI Eng'],
      ['♠️','researchWriter','Research Writer',    'Research'],
      ['🟨','extractData',   'Extract Data',       'Extract'],
      ['💎','facetsIntent',  'Facets Intent',      'Facets'],
      ['⬜','unifier',       'Unifier',            'Unify'],
      ['⚪','cloneRepo',     'Clone / New Repo',   'Clone'],
      ['🟥','hamburgerMenu', 'Hamburger & Nav',    'Nav'],
      ['✨','connectRepos',  'Connect Repos',      'Connect'],
    ]
  },
  {
    label: 'Media & Entertainment',
    buttons: [
      ['🎷','mediaGallery',  'Radio / TV / Gallery','Media'],
      ['😎','visualizer',    'Visualizer',          'Visual'],
      ['🎨','artStudio',     'Art Studio',          'Art'],
      ['🎹','addMusic',      'Add Music',           'Music'],
      ['🎙️','voiceMic',     'Voice / Mic',         'Voice'],
      ['🥁','advertising',   'Advertising',         'Ads'],
      ['🎛️','modulator',    'Modulator / Sync',    'Mod'],
      ['🎵','pianoSignIn',   'Piano Sign-In',       'SignIn'],
    ]
  },
  {
    label: 'Commerce & Finance',
    buttons: [
      ['💲','payments',      'PayPal / Payments',  'Pay'],
      ['💰','banking',       'Banking / Sync',     'Bank'],
      ['🛒','shoppingCart',  'Shopping Cart',      'Cart'],
      ['♦️','merchant',      'Merchant Options',   'Merch'],
      ['🟡','tokenWalker',   'Token Walker / Mint','Token'],
      ['🎟️','ticketBooth',  'Ticket Booth',       'Tickets'],
    ]
  },
  {
    label: 'Machine & System',
    buttons: [
      ['♣️','machinePart',   'Machine Part',       'Machine'],
      ['🛸','triodeRepos',   'Triode Repos',       'Triode'],
      ['🧩','puzzleBuilder', 'Puzzle Builder',     'Puzzle'],
      ['💍','beltPulley',    'Belt-Pulley Ring',   'Ring'],
      ['👑','soulIntent',    'Soul Intent / Crown','Soul'],
      ['📡','signalEmitter', 'Signal Emitter',     'Signal'],
      ['🔌','powerEmitter',  'Power Emitter',      'Power'],
      ['🧫','petriDish',     'Petri Dish / Test',  'Petri'],
      ['🕹️','navigation',   'Page Navigation',    'Nav2'],
    ]
  },
  {
    label: 'Security & Data',
    buttons: [
      ['🧱','encryptData',   'Encrypt User Data',  'Encrypt'],
      ['♥️','loveChurch',    'Love / Church',      'Love'],
      ['⚖️','metricsScale',  'Metrics & Value',    'Metrics'],
      ['💊','bugDoctor',     'Bug Doctor',         'Doctor'],
      ['📀','addRepoFiles',  'Add Repo Files',     'Files'],
      ['🖥️','screenDisplay','Screen Display',     'Screen'],
    ]
  },
];

/* ── Modal content definitions ───────────────────────────── */
/* ── Modal content definitions (7 working tools) ────────── */
const MODAL_CONTENT = {
  moveUpDown: {
    title: 'Move Up/Down',
    emoji: '📍',
    desc: 'Reorder sections on your GitHub Pages site. Fetches your index.html, moves the selected section up or down, and commits the result.',
    form: `
      <p class="modal-section-title">Select Section</p>
      <select class="select-input mb-2" id="moveSection">
        <option>Hero / Banner</option>
        <option>Features Grid</option>
        <option>About Section</option>
        <option>Portfolio / Projects</option>
        <option>Contact Form</option>
        <option>Footer</option>
      </select>
      <p class="modal-section-title">Direction</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="dir" value="up" checked> ⬆️ Move Up</label>
        <label class="radio-chip"><input type="radio" name="dir" value="down"> ⬇️ Move Down</label>
        <label class="radio-chip"><input type="radio" name="dir" value="top"> ⬆️⬆️ To Top</label>
        <label class="radio-chip"><input type="radio" name="dir" value="bottom"> ⬇️⬇️ To Bottom</label>
      </div>`,
    preview: '// Will fetch index.html from repo\n// Reorder selected section\n// Commit: "📍 Move section [name] [direction]"'
  },

  addPages: {
    title: 'Add Pages',
    emoji: '📎',
    desc: 'Create a new HTML page in your repo. Choose a page name and template — the file is committed directly to your repository.',
    form: `
      <p class="modal-section-title">Page Name <span style="color:var(--text-secondary)">(no spaces)</span></p>
      <input class="form-input mb-2" id="newPageName" placeholder="e.g. about, contact, portfolio" />
      <p class="modal-section-title">Page Template</p>
      <select class="select-input mb-2" id="newPageTemplate">
        <option value="blank">Blank Page</option>
        <option value="blog">Blog Post</option>
        <option value="gallery">Portfolio Gallery</option>
        <option value="contact">Contact Form</option>
        <option value="pricing">Pricing Table</option>
        <option value="docs">Documentation</option>
      </select>
      <p class="modal-section-title">Options</p>
      <div class="checkbox-group">
        <label class="checkbox-item"><input type="checkbox" id="addToNav" checked> Add nav link in index.html</label>
      </div>`,
    preview: '// Will create: {pagename}.html\n// Template selected\n// Commit: "📎 Add page {pagename}.html"'
  },

  quickFix: {
    title: 'Quick Fix',
    emoji: '🔧',
    desc: 'Scans your index.html and automatically patches common issues — missing viewport meta, overflow bugs, and missing alt attributes.',
    form: `
      <p class="modal-section-title">Apply Fixes</p>
      <div class="checkbox-group">
        <label class="checkbox-item"><input type="checkbox" id="fixViewport" checked> Add missing viewport meta tag</label>
        <label class="checkbox-item"><input type="checkbox" id="fixOverflow" checked> Fix mobile overflow (body overflow-x:hidden)</label>
        <label class="checkbox-item"><input type="checkbox" id="fixAlt" checked> Add empty alt="" to images missing it</label>
        <label class="checkbox-item"><input type="checkbox" id="fixCharset" checked> Add charset UTF-8 if missing</label>
      </div>`,
    preview: '// Will fetch index.html\n// Apply selected fixes\n// Commit: "🔧 Quick fix — auto-patch index.html"'
  },

  styles: {
    title: 'Styles',
    emoji: '🪣',
    desc: 'Write a CSS theme file to your repo. Pick a colour and theme — a styles.css (or theme.css) is committed with the variables set.',
    form: `
      <p class="modal-section-title">Accent Color</p>
      <div class="color-swatches">
        <div class="color-swatch active" data-color="#6366f1" style="background:#6366f1" title="Indigo"></div>
        <div class="color-swatch" data-color="#8b5cf6" style="background:#8b5cf6" title="Purple"></div>
        <div class="color-swatch" data-color="#ec4899" style="background:#ec4899" title="Pink"></div>
        <div class="color-swatch" data-color="#06b6d4" style="background:#06b6d4" title="Cyan"></div>
        <div class="color-swatch" data-color="#22c55e" style="background:#22c55e" title="Green"></div>
        <div class="color-swatch" data-color="#f59e0b" style="background:#f59e0b" title="Amber"></div>
        <div class="color-swatch" data-color="#ef4444" style="background:#ef4444" title="Red"></div>
        <div class="color-swatch" data-color="#64748b" style="background:#64748b" title="Slate"></div>
      </div>
      <p class="modal-section-title">Theme</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="bgTheme" value="dark" checked> 🌑 Dark</label>
        <label class="radio-chip"><input type="radio" name="bgTheme" value="light"> ☀️ Light</label>
        <label class="radio-chip"><input type="radio" name="bgTheme" value="ocean"> 🌊 Ocean</label>
        <label class="radio-chip"><input type="radio" name="bgTheme" value="forest"> 🌲 Forest</label>
      </div>
      <p class="modal-section-title">Font</p>
      <select class="select-input" id="styleFont">
        <option value="Inter">Inter (Modern)</option>
        <option value="Georgia">Georgia (Serif)</option>
        <option value="'JetBrains Mono'">JetBrains Mono (Code)</option>
        <option value="system-ui">System UI (Native)</option>
      </select>`,
    preview: '// Will write theme.css to repo root\n// Commit: "🪣 Apply theme — [color] [theme]"'
  },

  pullMemory: {
    title: 'Pull Memory',
    emoji: '🧲',
    desc: 'Fetches a file from one of your other repos and saves it to memory. Use 🟦 Drop Content to paste it into this repo.',
    form: `
      <p class="modal-section-title">Source Repository</p>
      <select class="select-input mb-2" id="pullMemoryRepo">
        <option value="">— select a repo —</option>
      </select>
      <p class="modal-section-title">File to Pull</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="pullFile" value="index.html" checked> 📄 index.html</label>
        <label class="radio-chip"><input type="radio" name="pullFile" value="css/styles.css"> �� css/styles.css</label>
        <label class="radio-chip"><input type="radio" name="pullFile" value="README.md"> 📝 README.md</label>
      </div>`,
    preview: '// Fetches file from source repo\n// Stores text in browser memory\n// Ready for 🟦 Drop Content'
  },

  dropContent: {
    title: 'Drop Content',
    emoji: '🟦',
    desc: 'Inserts the content you pulled with 🧲 Pull Memory into this repo\'s index.html, then commits.',
    form: `
      <p class="modal-section-title">Memory Preview</p>
      <pre class="modal-preview" id="memoryPreview" style="max-height:120px;font-size:11px">// No memory stored yet — use 🧲 Pull Memory first</pre>
      <p class="modal-section-title">Insert Location</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="dropLoc" value="bottom" checked> 🔚 Append to bottom</label>
        <label class="radio-chip"><input type="radio" name="dropLoc" value="top"> 🔝 Prepend to top</label>
        <label class="radio-chip"><input type="radio" name="dropLoc" value="replace"> 🔄 Replace entire file</label>
      </div>`,
    preview: '// Will read stored memory\n// Insert into this repo\'s index.html\n// Commit: "🟦 Drop content from memory"'
  },

  toolbox: {
    title: 'Toolbox',
    emoji: '🧰',
    desc: 'Generate and commit useful web project files — sitemap, robots.txt, PWA manifest, and SEO meta tags.',
    form: `
      <p class="modal-section-title">Files to Generate</p>
      <div class="checkbox-group">
        <label class="checkbox-item"><input type="checkbox" id="toolSitemap"> 🔍 sitemap.xml</label>
        <label class="checkbox-item"><input type="checkbox" id="toolRobots"> 🤖 robots.txt</label>
        <label class="checkbox-item"><input type="checkbox" id="toolManifest"> 📱 manifest.json (PWA)</label>
        <label class="checkbox-item"><input type="checkbox" id="toolOG"> 🗺️ Add Open Graph meta tags to index.html</label>
      </div>`,
    preview: '// Each checked item creates/updates a file\n// Commit: "🧰 Toolbox — generate web files"'
  },

  /* ── Page Tools row 2 ─────────────────────────────────── */
  microscope: {
    title: 'Fine Adjustments',
    emoji: '🔬',
    desc: 'Microscopic tweaks to your page — update title, description, keywords, author, and canonical URL in index.html.',
    form: `
      <p class="modal-section-title">Page Title</p>
      <input class="form-input mb-2" id="microTitle" placeholder="My Awesome Site" />
      <p class="modal-section-title">Meta Description (≤160 chars)</p>
      <input class="form-input mb-2" id="microDesc" placeholder="A brief description of the page…" maxlength="160"/>
      <p class="modal-section-title">Keywords (comma-separated)</p>
      <input class="form-input mb-2" id="microKeywords" placeholder="github, portfolio, web" />
      <p class="modal-section-title">Author</p>
      <input class="form-input mb-2" id="microAuthor" placeholder="Your Name" />`,
    preview: '// Fetches index.html\n// Updates <title> and meta tags\n// Commit: "🔬 Fine adjustments — meta update"'
  },

  deepFix: {
    title: 'Deep Fix',
    emoji: '🥽',
    desc: 'Deeper auto-repairs: add or fix DOCTYPE, lang attribute, missing </body>, broken relative links, and inline style cleanup.',
    form: `
      <p class="modal-section-title">Fixes to Apply</p>
      <div class="checkbox-group">
        <label class="checkbox-item"><input type="checkbox" id="dfDoctype" checked> Fix / add DOCTYPE</label>
        <label class="checkbox-item"><input type="checkbox" id="dfLang" checked> Add lang="en" to &lt;html&gt;</label>
        <label class="checkbox-item"><input type="checkbox" id="dfBody" checked> Ensure &lt;/body&gt;&lt;/html&gt; closing tags</label>
        <label class="checkbox-item"><input type="checkbox" id="dfLinks" checked> Make relative links consistent (./)</label>
        <label class="checkbox-item"><input type="checkbox" id="dfBrokenImg" checked> Replace broken img src="" placeholders</label>
      </div>`,
    preview: '// Deep scan index.html\n// Apply selected repairs\n// Commit: "🥽 Deep fix — structural repair"'
  },

  editRemove: {
    title: 'Edit / Remove',
    emoji: '🔥',
    desc: 'Find and remove (or comment out) a section, element, or block of text from your index.html.',
    form: `
      <p class="modal-section-title">Action</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="erAction" value="remove" checked> 🗑️ Remove</label>
        <label class="radio-chip"><input type="radio" name="erAction" value="comment"> 💬 Comment Out</label>
      </div>
      <p class="modal-section-title">Find Text / ID / Class (exact)</p>
      <input class="form-input mb-2" id="erSearch" placeholder='e.g. id="hero" or class="sidebar"' />
      <p class="modal-section-title">Or Remove Section</p>
      <select class="select-input" id="erSection">
        <option value="">— choose a named section —</option>
        <option>Hero / Banner</option>
        <option>Footer</option>
        <option>Sidebar</option>
        <option>Navigation</option>
        <option>Contact Form</option>
        <option>Cookie Banner</option>
      </select>`,
    preview: '// Fetches index.html\n// Removes / comments target block\n// Commit: "🔥 Edit — remove [target]"'
  },

  /* ── Build & Expand row ─────────────────────────────────── */
  doubleContent: {
    title: 'Double Content',
    emoji: '🍄',
    desc: 'Doubles the content of your index.html — duplicates every major section so the page has twice as much material.',
    form: `
      <p class="modal-section-title">What to Double</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="dblTarget" value="sections" checked> 📑 All &lt;section&gt; blocks</label>
        <label class="radio-chip"><input type="radio" name="dblTarget" value="articles"> 📄 All &lt;article&gt; blocks</label>
        <label class="radio-chip"><input type="radio" name="dblTarget" value="cards"> 🃏 .card / .item divs</label>
      </div>
      <p class="modal-section-title">Separator</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="dblSep" value="hr" checked> ── HR Divider</label>
        <label class="radio-chip"><input type="radio" name="dblSep" value="heading"> 📌 Add "More…" heading</label>
        <label class="radio-chip"><input type="radio" name="dblSep" value="none"> No separator</label>
      </div>`,
    preview: '// Fetches index.html\n// Duplicates every matched element\n// Commit: "🍄 Double content — 2× sections"'
  },

  updateContent: {
    title: 'Update Content',
    emoji: '⭐',
    desc: 'Stamps your page with a "Last Updated" timestamp, adds a fact-check notice, and refreshes Open Graph dates.',
    form: `
      <p class="modal-section-title">What to Update</p>
      <div class="checkbox-group">
        <label class="checkbox-item"><input type="checkbox" id="updTimestamp" checked> 🕐 Add/refresh "Last Updated" timestamp</label>
        <label class="checkbox-item"><input type="checkbox" id="updOGDate" checked> 🗺️ Update og:updated_time meta tag</label>
        <label class="checkbox-item"><input type="checkbox" id="updFactNotice" checked> ✅ Add fact-check / review notice banner</label>
        <label class="checkbox-item"><input type="checkbox" id="updChangelog" checked> 📝 Append update to CHANGELOG.md</label>
      </div>
      <p class="modal-section-title">Update Note (optional)</p>
      <input class="form-input" id="updNote" placeholder="e.g. Added new research section" />`,
    preview: '// Fetches index.html & CHANGELOG.md\n// Stamps update info\n// Commit: "⭐ Update content — [date]"'
  },

  aiEngineer: {
    title: 'AI Engineering',
    emoji: '🟩',
    desc: 'AI-suggested structural improvements: add a schema.org JSON-LD block, image alt improvements, heading hierarchy fixes, and accessibility landmarks.',
    form: `
      <p class="modal-section-title">Suggestions to Apply</p>
      <div class="checkbox-group">
        <label class="checkbox-item"><input type="checkbox" id="aiSchema" checked> 🧬 Inject schema.org JSON-LD (WebSite)</label>
        <label class="checkbox-item"><input type="checkbox" id="aiLandmarks" checked> 🏛️ Add ARIA landmark roles</label>
        <label class="checkbox-item"><input type="checkbox" id="aiHeadings" checked> 📐 Fix heading hierarchy (h1→h2→h3)</label>
        <label class="checkbox-item"><input type="checkbox" id="aiSkipLink" checked> ⏭️ Add skip-to-content link</label>
      </div>`,
    preview: '// Fetches index.html\n// Applies AI structural improvements\n// Commit: "🟩 AI engineering pass"'
  },

  researchWriter: {
    title: 'Research Writer',
    emoji: '♠️',
    desc: 'Generates a research article page and commits it. Each page links back to your main site and acts as a living document that can grow over time.',
    form: `
      <p class="modal-section-title">Topic / Title</p>
      <input class="form-input mb-2" id="rwTitle" placeholder="e.g. The Future of Decentralised Finance" />
      <p class="modal-section-title">Sections to Include</p>
      <div class="checkbox-group">
        <label class="checkbox-item"><input type="checkbox" id="rwAbstract" checked> 📋 Abstract</label>
        <label class="checkbox-item"><input type="checkbox" id="rwIntro" checked> 📖 Introduction</label>
        <label class="checkbox-item"><input type="checkbox" id="rwBody" checked> 📝 Main Body (3 sections)</label>
        <label class="checkbox-item"><input type="checkbox" id="rwConclusion" checked> 🏁 Conclusion & References</label>
        <label class="checkbox-item"><input type="checkbox" id="rwToken" checked> 🎫 Action Receipt Token footer</label>
      </div>`,
    preview: '// Creates research-{slug}.html\n// Structured article with token footer\n// Commit: "♠️ Research: {title}"'
  },

  extractData: {
    title: 'Extract Data',
    emoji: '🟨',
    desc: 'Scans your page and extracts styles, cards, sections, scripts, or other reusable pieces into browser memory for reuse.',
    form: `
      <p class="modal-section-title">What to Extract</p>
      <div class="checkbox-group">
        <label class="checkbox-item"><input type="checkbox" id="extStyles" checked> 🎨 Inline &lt;style&gt; blocks</label>
        <label class="checkbox-item"><input type="checkbox" id="extCards"> 🃏 Card / component divs</label>
        <label class="checkbox-item"><input type="checkbox" id="extNav"> 🗂️ Navigation / header HTML</label>
        <label class="checkbox-item"><input type="checkbox" id="extScripts"> ⚙️ &lt;script&gt; blocks</label>
        <label class="checkbox-item"><input type="checkbox" id="extFooter"> 🔚 Footer HTML</label>
      </div>
      <p class="modal-section-title">Save to Memory Label</p>
      <input class="form-input" id="extLabel" placeholder="e.g. my-nav-template" />`,
    preview: '// Fetches index.html\n// Extracts selected elements\n// Stores in browser memory (gitpub_extract_*)'
  },

  facetsIntent: {
    title: 'Facets Intent',
    emoji: '💎',
    desc: 'Reads a single repo\'s README and distils its core purpose into a one-page "Facet" document — the gem of intent for that repo.',
    form: `
      <p class="modal-section-title">Source</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="facSrc" value="readme" checked> 📝 README.md</label>
        <label class="radio-chip"><input type="radio" name="facSrc" value="index"> 🌐 index.html</label>
      </div>
      <p class="modal-section-title">Output File</p>
      <input class="form-input mb-2" id="facOutput" value="FACET.md" />
      <p class="modal-section-title">Style</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="facStyle" value="markdown" checked> 📑 Markdown</label>
        <label class="radio-chip"><input type="radio" name="facStyle" value="html"> 🌐 HTML page</label>
      </div>`,
    preview: '// Reads README.md\n// Extracts core intent\n// Commit: "💎 Facet — distil intent from {repo}"'
  },

  unifier: {
    title: 'Unifier',
    emoji: '⬜',
    desc: 'Scans all your repos and pulls their core purpose (README first line) into one unified landing page on this repo.',
    form: `
      <p class="modal-section-title">Max Repos to Scan</p>
      <select class="select-input mb-2" id="unifyMax">
        <option value="10">10 repos</option>
        <option value="20" selected>20 repos</option>
        <option value="50">50 repos</option>
        <option value="100">All repos</option>
      </select>
      <p class="modal-section-title">Output</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="unifyOut" value="unified.html" checked> 🌐 unified.html</label>
        <label class="radio-chip"><input type="radio" name="unifyOut" value="index.html"> 🏠 index.html (replace)</label>
      </div>
      <p class="modal-section-title">Style</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="unifyStyle" value="cards" checked> 🃏 Cards grid</label>
        <label class="radio-chip"><input type="radio" name="unifyStyle" value="list"> 📋 List</label>
      </div>`,
    preview: '// Fetches README for each repo\n// Builds unified landing page\n// Commit: "⬜ Unify — {n} repos into unified.html"'
  },

  cloneRepo: {
    title: 'Clone / New Repo',
    emoji: '⚪',
    desc: 'Create a brand-new GitHub repository (blank or cloned from this one\'s files). Optionally import content from this repo.',
    form: `
      <p class="modal-section-title">New Repository Name</p>
      <input class="form-input mb-2" id="cloneName" placeholder="my-new-project" />
      <p class="modal-section-title">Description</p>
      <input class="form-input mb-2" id="cloneDesc" placeholder="A new project" />
      <p class="modal-section-title">Visibility</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="cloneVis" value="public" checked> 🌍 Public</label>
        <label class="radio-chip"><input type="radio" name="cloneVis" value="private"> 🔒 Private</label>
      </div>
      <p class="modal-section-title">Seed Content</p>
      <div class="checkbox-group">
        <label class="checkbox-item"><input type="checkbox" id="cloneCopyIndex" checked> 📄 Copy index.html from this repo</label>
        <label class="checkbox-item"><input type="checkbox" id="cloneCopyStyles"> 🎨 Copy theme.css / styles.css</label>
        <label class="checkbox-item"><input type="checkbox" id="cloneAddReadme" checked> 📝 Add README.md</label>
      </div>`,
    preview: '// POST /user/repos → create repo\n// Optionally commit seed files\n// Opens new repo in new tab'
  },

  hamburgerMenu: {
    title: 'Hamburger & Nav',
    emoji: '🟥',
    desc: 'Injects a hamburger menu and navigation bar into your index.html. Choose which repos to link and the menu style.',
    form: `
      <p class="modal-section-title">Menu Style</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="hambStyle" value="slide" checked> ↔️ Slide Drawer</label>
        <label class="radio-chip"><input type="radio" name="hambStyle" value="dropdown"> ⬇️ Dropdown</label>
        <label class="radio-chip"><input type="radio" name="hambStyle" value="fullscreen"> 🌐 Full Screen</label>
      </div>
      <p class="modal-section-title">Include Links</p>
      <div class="checkbox-group">
        <label class="checkbox-item"><input type="checkbox" id="hambHome" checked> 🏠 Home (index.html)</label>
        <label class="checkbox-item"><input type="checkbox" id="hambAbout"> ℹ️ About</label>
        <label class="checkbox-item"><input type="checkbox" id="hambContact"> 📬 Contact</label>
        <label class="checkbox-item"><input type="checkbox" id="hambGitHub" checked> 🐱 Link to GitHub profile</label>
      </div>`,
    preview: '// Fetches index.html\n// Injects hamburger HTML + CSS\n// Commit: "🟥 Add hamburger nav"'
  },

  connectRepos: {
    title: 'Connect Repos',
    emoji: '✨',
    desc: 'Adds cross-repo navigation links — a shared footer band that links all your GitHub Pages sites together.',
    form: `
      <p class="modal-section-title">Max Repos to Link</p>
      <select class="select-input mb-2" id="connMax">
        <option value="5">5</option>
        <option value="10" selected>10</option>
        <option value="20">20</option>
      </select>
      <p class="modal-section-title">Display as</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="connStyle" value="footer" checked> 🔚 Footer band</label>
        <label class="radio-chip"><input type="radio" name="connStyle" value="header"> 🔝 Header nav strip</label>
      </div>
      <p class="modal-section-title">Include</p>
      <div class="checkbox-group">
        <label class="checkbox-item"><input type="checkbox" id="connPagesOnly" checked> 🌐 Pages-enabled repos only</label>
        <label class="checkbox-item"><input type="checkbox" id="connStars"> ⭐ Show star count badges</label>
      </div>`,
    preview: '// Fetches index.html\n// Appends cross-repo nav band\n// Commit: "✨ Connect repos — add network nav"'
  },

  /* ── Media & Entertainment ───────────────────────────────── */
  mediaGallery: {
    title: 'Radio / TV / Gallery',
    emoji: '🎷',
    desc: 'Embed a media experience in your page — radio player, YouTube gallery, image carousel, or RSS feed reader.',
    form: `
      <p class="modal-section-title">Media Type</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="mediaType" value="radio" checked> 📻 Internet Radio</label>
        <label class="radio-chip"><input type="radio" name="mediaType" value="youtube"> 📺 YouTube Gallery</label>
        <label class="radio-chip"><input type="radio" name="mediaType" value="gallery"> 🖼️ Image Gallery</label>
        <label class="radio-chip"><input type="radio" name="mediaType" value="rss"> 📡 RSS Feed</label>
        <label class="radio-chip"><input type="radio" name="mediaType" value="games"> 🎮 Games Embed</label>
      </div>
      <p class="modal-section-title">Source / Channel URL (optional)</p>
      <input class="form-input" id="mediaSrc" placeholder="https://…" />
      <p class="modal-section-title">Scope</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="mediaScope" value="worldwide" checked> 🌍 Worldwide</label>
        <label class="radio-chip"><input type="radio" name="mediaScope" value="local"> 🏠 Local / Regional</label>
        <label class="radio-chip"><input type="radio" name="mediaScope" value="custom"> ⚙️ Custom channel list</label>
      </div>`,
    preview: '// Generates media embed HTML block\n// Appends to index.html\n// Commit: "🎷 Add media — [type]"'
  },

  visualizer: {
    title: 'Visualizer',
    emoji: '😎',
    desc: 'Embeds an audio/data visualizer canvas into your page. Choose a style and it merges seamlessly with your content.',
    form: `
      <p class="modal-section-title">Visualizer Style</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="vizStyle" value="bars" checked> 📊 Frequency Bars</label>
        <label class="radio-chip"><input type="radio" name="vizStyle" value="waveform"> 🌊 Waveform</label>
        <label class="radio-chip"><input type="radio" name="vizStyle" value="particles"> ✨ Particles</label>
        <label class="radio-chip"><input type="radio" name="vizStyle" value="circular"> ⭕ Circular Rings</label>
        <label class="radio-chip"><input type="radio" name="vizStyle" value="matrix"> 🟩 Matrix Rain</label>
      </div>
      <p class="modal-section-title">Placement</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="vizPlace" value="hero" checked> 🖼️ Hero background</label>
        <label class="radio-chip"><input type="radio" name="vizPlace" value="section"> 📐 New section</label>
        <label class="radio-chip"><input type="radio" name="vizPlace" value="footer"> 🔚 Footer accent</label>
      </div>`,
    preview: '// Generates canvas + JS visualizer code\n// Appends to index.html\n// Commit: "😎 Add visualizer — [style]"'
  },

  artStudio: {
    title: 'Art Studio',
    emoji: '🎨',
    desc: 'Embed a drawing pad in your page — quick sketch, full color picker, or 3D canvas. Every drawing mints an action token.',
    form: `
      <p class="modal-section-title">Studio Level</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="artLevel" value="quick" checked> ✏️ Quick Draw Pad</label>
        <label class="radio-chip"><input type="radio" name="artLevel" value="color"> 🎨 Color Studio</label>
        <label class="radio-chip"><input type="radio" name="artLevel" value="3d"> 🧊 3D Canvas (WebGL)</label>
      </div>
      <p class="modal-section-title">Options</p>
      <div class="checkbox-group">
        <label class="checkbox-item"><input type="checkbox" id="artToken" checked> 🎫 Mint receipt token on every save</label>
        <label class="checkbox-item"><input type="checkbox" id="artDownload" checked> 💾 Add Download PNG button</label>
        <label class="checkbox-item"><input type="checkbox" id="artShare"> 🔗 Add share link button</label>
      </div>`,
    preview: '// Generates canvas drawing pad HTML/JS\n// Embeds into index.html\n// Commit: "🎨 Art studio — [level] pad"'
  },

  addMusic: {
    title: 'Add Music',
    emoji: '🎹',
    desc: 'Integrate a music player into your page — from simple audio tags to a full playlist with auto-generated track cards.',
    form: `
      <p class="modal-section-title">Player Type</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="musicType" value="simple" checked> ▶️ Simple Audio Tag</label>
        <label class="radio-chip"><input type="radio" name="musicType" value="playlist"> 📀 Playlist Player</label>
        <label class="radio-chip"><input type="radio" name="musicType" value="synth"> 🎵 In-page Synth</label>
      </div>
      <p class="modal-section-title">Audio Source (URL or repo path)</p>
      <input class="form-input mb-2" id="musicSrc" placeholder="https://… or audio/track.mp3" />
      <p class="modal-section-title">Options</p>
      <div class="checkbox-group">
        <label class="checkbox-item"><input type="checkbox" id="musicAutoplay"> 🔊 Autoplay (muted start)</label>
        <label class="checkbox-item"><input type="checkbox" id="musicLoop" checked> 🔁 Loop</label>
        <label class="checkbox-item"><input type="checkbox" id="musicVisual" checked> 😎 Include visualizer</label>
      </div>`,
    preview: '// Generates audio player HTML/JS\n// Appends to index.html\n// Commit: "🎹 Add music player — [type]"'
  },

  voiceMic: {
    title: 'Voice / Mic',
    emoji: '🎙️',
    desc: 'Add a voice recording widget or speech-to-text input to your page. Recordings stored as base64 or uploaded to the repo.',
    form: `
      <p class="modal-section-title">Feature</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="voiceFeature" value="record" checked> 🎙️ Record & Playback</label>
        <label class="radio-chip"><input type="radio" name="voiceFeature" value="stt"> 📝 Speech-to-Text Input</label>
        <label class="radio-chip"><input type="radio" name="voiceFeature" value="tts"> 🔊 Text-to-Speech Reader</label>
      </div>
      <p class="modal-section-title">Storage</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="voiceStorage" value="local" checked> 💾 Browser localStorage</label>
        <label class="radio-chip"><input type="radio" name="voiceStorage" value="repo"> 📂 Commit to repo /audio/</label>
      </div>`,
    preview: '// Generates voice widget HTML/JS\n// Appends to index.html\n// Commit: "🎙️ Add voice widget — [feature]"'
  },

  advertising: {
    title: 'Advertising',
    emoji: '🥁',
    desc: 'Add an advertising zone to your page — banner, interstitial placeholder, or sponsor card. Supports AdSense slot IDs.',
    form: `
      <p class="modal-section-title">Ad Type</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="adType" value="banner" checked> 🏞️ Banner (728×90)</label>
        <label class="radio-chip"><input type="radio" name="adType" value="square"> ▪️ Square (300×250)</label>
        <label class="radio-chip"><input type="radio" name="adType" value="sponsor"> 🤝 Sponsor Card</label>
        <label class="radio-chip"><input type="radio" name="adType" value="adsense"> 💰 Google AdSense</label>
      </div>
      <p class="modal-section-title">Placement</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="adPlace" value="top" checked> 🔝 Top of page</label>
        <label class="radio-chip"><input type="radio" name="adPlace" value="mid"> 🔀 Mid-page</label>
        <label class="radio-chip"><input type="radio" name="adPlace" value="footer"> 🔚 Before footer</label>
      </div>
      <p class="modal-section-title">AdSense Publisher ID (if applicable)</p>
      <input class="form-input" id="adSenseId" placeholder="pub-0000000000000000" />`,
    preview: '// Generates ad zone HTML\n// Inserts into index.html at chosen placement\n// Commit: "🥁 Add advertising zone — [type]"'
  },

  modulator: {
    title: 'Modulator / Sync',
    emoji: '🎛️',
    desc: 'Synchronise effects across pages — add smooth scroll, CSS transitions, entrance animations, and page-load effects.',
    form: `
      <p class="modal-section-title">Effects</p>
      <div class="checkbox-group">
        <label class="checkbox-item"><input type="checkbox" id="modScroll" checked> 🖱️ Smooth scroll</label>
        <label class="checkbox-item"><input type="checkbox" id="modFadeIn" checked> 🌅 Fade-in on scroll (IntersectionObserver)</label>
        <label class="checkbox-item"><input type="checkbox" id="modParallax"> 🌄 Parallax hero</label>
        <label class="checkbox-item"><input type="checkbox" id="modPageTrans"> ✈️ Page transition fade</label>
        <label class="checkbox-item"><input type="checkbox" id="modTyping"> ⌨️ Typing effect on headings</label>
      </div>`,
    preview: '// Injects effect CSS + JS into index.html\n// Commit: "🎛️ Modulator — add page effects"'
  },

  pianoSignIn: {
    title: 'Piano Sign-In',
    emoji: '🎵',
    desc: 'Embed an 8-note piano sign-in widget. Users play a melody as their passphrase — stored encrypted in repo files via GitHub secrets.',
    form: `
      <p class="modal-section-title">Security Level</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="pianoSec" value="70" checked> 🔓 70% match (relaxed)</label>
        <label class="radio-chip"><input type="radio" name="pianoSec" value="85"> 🔒 85% match (standard)</label>
        <label class="radio-chip"><input type="radio" name="pianoSec" value="95"> 🔐 95% match (strict)</label>
        <label class="radio-chip"><input type="radio" name="pianoSec" value="quantum"> ⚛️ Quantum (timing + pitch)</label>
      </div>
      <p class="modal-section-title">Storage</p>
      <div class="checkbox-group">
        <label class="checkbox-item"><input type="checkbox" id="pianoEncrypt" checked> 🧱 Encrypt stored melody (XOR + hash)</label>
        <label class="checkbox-item"><input type="checkbox" id="pianoGhSecret" checked> 🔑 Use GitHub secret GHP_SECRET for key</label>
        <label class="checkbox-item"><input type="checkbox" id="pianoBotLog" checked> 📋 Log sign-in events to sign-ins.json</label>
      </div>`,
    preview: '// Creates piano-signin.html + piano-signin.js\n// Commit: "🎵 Piano sign-in — [security] level"'
  },

  /* ── Commerce & Finance ─────────────────────────────────── */
  payments: {
    title: 'PayPal / Payments',
    emoji: '💲',
    desc: 'Add a PayPal donation/checkout button, token mint, or token exchange card. The card is AI-aware and adapts to your page context.',
    form: `
      <p class="modal-section-title">Payment Type</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="payType" value="donate" checked> 🎁 PayPal Donate</label>
        <label class="radio-chip"><input type="radio" name="payType" value="checkout"> 🛒 PayPal Checkout</label>
        <label class="radio-chip"><input type="radio" name="payType" value="mint"> 🪙 Token Mint</label>
        <label class="radio-chip"><input type="radio" name="payType" value="exchange"> 🔄 Token Exchange</label>
      </div>
      <p class="modal-section-title">PayPal Business ID / Email</p>
      <input class="form-input mb-2" id="paypalId" placeholder="business@example.com or paypal-id" />
      <p class="modal-section-title">Currency</p>
      <select class="select-input" id="payCurrency">
        <option value="USD">USD $</option>
        <option value="EUR">EUR €</option>
        <option value="GBP">GBP £</option>
        <option value="BTC">BTC ₿ (token)</option>
      </select>`,
    preview: '// Generates payment button/card HTML\n// Appends to index.html\n// Commit: "💲 Add payments — [type]"'
  },

  banking: {
    title: 'Banking / Sync',
    emoji: '💰',
    desc: 'Unify banking and PayPal payments across all your repos — syncs payment endpoints and adds a shared finance footer.',
    form: `
      <p class="modal-section-title">Sync Target</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="bankTarget" value="this" checked> 📄 This repo only</label>
        <label class="radio-chip"><input type="radio" name="bankTarget" value="all"> 🌐 All repos (batch)</label>
      </div>
      <p class="modal-section-title">Include</p>
      <div class="checkbox-group">
        <label class="checkbox-item"><input type="checkbox" id="bankPaypal" checked> 💲 PayPal button</label>
        <label class="checkbox-item"><input type="checkbox" id="bankStripe"> 💳 Stripe placeholder</label>
        <label class="checkbox-item"><input type="checkbox" id="bankToken" checked> 🪙 Token wallet link</label>
        <label class="checkbox-item"><input type="checkbox" id="bankBalance"> ⚖️ Balance display widget</label>
      </div>`,
    preview: '// Generates shared finance footer HTML\n// Commits to index.html\n// Commit: "💰 Banking sync — [scope]"'
  },

  shoppingCart: {
    title: 'Shopping Cart',
    emoji: '🛒',
    desc: 'Add a fully functional shopping cart with checkout flow to your page. Integrates with PayPal and token systems.',
    form: `
      <p class="modal-section-title">Cart Type</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="cartType" value="simple" checked> 🛒 Simple Cart (localStorage)</label>
        <label class="radio-chip"><input type="radio" name="cartType" value="paypal"> 💲 PayPal Cart</label>
        <label class="radio-chip"><input type="radio" name="cartType" value="token"> 🪙 Token Cart</label>
      </div>
      <p class="modal-section-title">Sample Products</p>
      <div class="checkbox-group">
        <label class="checkbox-item"><input type="checkbox" id="cartSample" checked> 📦 Add 3 sample product cards</label>
        <label class="checkbox-item"><input type="checkbox" id="cartCheckout" checked> ✅ Add checkout / order summary page</label>
      </div>`,
    preview: '// Generates cart HTML + JS\n// Creates checkout.html if selected\n// Commit: "🛒 Add shopping cart — [type]"'
  },

  merchant: {
    title: 'Merchant Options',
    emoji: '♦️',
    desc: 'Set up full merchant capabilities — product catalog, invoicing, digital downloads, and affiliate link tracking.',
    form: `
      <p class="modal-section-title">Merchant Features</p>
      <div class="checkbox-group">
        <label class="checkbox-item"><input type="checkbox" id="mchCatalog" checked> 📦 Product catalog page</label>
        <label class="checkbox-item"><input type="checkbox" id="mchInvoice"> 🧾 Invoice generator</label>
        <label class="checkbox-item"><input type="checkbox" id="mchDigital"> 💾 Digital download handler</label>
        <label class="checkbox-item"><input type="checkbox" id="mchAffiliate"> 🔗 Affiliate link tracker</label>
        <label class="checkbox-item"><input type="checkbox" id="mchDashboard"> 📊 Sales dashboard stub</label>
      </div>`,
    preview: '// Creates merchant pages (catalog, etc.)\n// Commits to repo\n// Commit: "♦️ Add merchant features"'
  },

  tokenWalker: {
    title: 'Token Walker / Mint',
    emoji: '🟡',
    desc: 'Design, mint, and manage tokens. Quick launch or full manual input for token parameters, wallets, and exchange links.',
    form: `
      <p class="modal-section-title">Mode</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="tokenMode" value="quick" checked> ⚡ Quick Launch</label>
        <label class="radio-chip"><input type="radio" name="tokenMode" value="manual"> 🔧 Manual Input</label>
        <label class="radio-chip"><input type="radio" name="tokenMode" value="wallet"> 👛 Wallet Display</label>
        <label class="radio-chip"><input type="radio" name="tokenMode" value="exchange"> 🔄 Exchange Link</label>
      </div>
      <p class="modal-section-title">Token Name</p>
      <input class="form-input mb-2" id="tokenName" placeholder="MYTOKEN" />
      <p class="modal-section-title">Supply</p>
      <input class="form-input" id="tokenSupply" placeholder="1000000" type="number" min="1" />`,
    preview: '// Generates token card HTML\n// Appends to index.html\n// Commit: "🟡 Token walker — [name]"'
  },

  ticketBooth: {
    title: 'Ticket Booth',
    emoji: '🎟️',
    desc: 'Add an event ticketing system — date, duration, ticket types, and purchase flow via PayPal or tokens.',
    form: `
      <p class="modal-section-title">Event Name</p>
      <input class="form-input mb-2" id="ticketEvent" placeholder="My Event" />
      <p class="modal-section-title">Date</p>
      <input class="form-input mb-2" id="ticketDate" type="date" />
      <p class="modal-section-title">Ticket Types</p>
      <div class="checkbox-group">
        <label class="checkbox-item"><input type="checkbox" id="ticketFree" checked> 🎉 Free</label>
        <label class="checkbox-item"><input type="checkbox" id="ticketVIP"> 👑 VIP</label>
        <label class="checkbox-item"><input type="checkbox" id="ticketGeneral" checked> 🎫 General Admission</label>
      </div>
      <p class="modal-section-title">Payment</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="ticketPay" value="paypal" checked> 💲 PayPal</label>
        <label class="radio-chip"><input type="radio" name="ticketPay" value="token"> 🪙 Token</label>
        <label class="radio-chip"><input type="radio" name="ticketPay" value="free"> 🆓 Free</label>
      </div>`,
    preview: '// Generates tickets.html + booth card\n// Commits to repo\n// Commit: "🎟️ Ticket booth — [event]"'
  },

  /* ── Machine & System ───────────────────────────────────── */
  machinePart: {
    title: 'Machine Part',
    emoji: '♣️',
    desc: 'Assign a machine role to this repo in your digital transformer — reader, writer, scraper, memory, engine, or power.',
    form: `
      <p class="modal-section-title">Part Type</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="partType" value="reader" checked> 📖 Reader</label>
        <label class="radio-chip"><input type="radio" name="partType" value="writer"> ✍️ Writer</label>
        <label class="radio-chip"><input type="radio" name="partType" value="scraper"> 🕷️ Scraper</label>
        <label class="radio-chip"><input type="radio" name="partType" value="memory"> 🧠 Memory</label>
        <label class="radio-chip"><input type="radio" name="partType" value="engine"> ⚙️ Engine</label>
        <label class="radio-chip"><input type="radio" name="partType" value="power"> ⚡ Power</label>
        <label class="radio-chip"><input type="radio" name="partType" value="marketplace"> 🏪 Marketplace</label>
      </div>
      <p class="modal-section-title">Map File</p>
      <div class="checkbox-group">
        <label class="checkbox-item"><input type="checkbox" id="partMap" checked> 🗺️ Update MACHINE_MAP.md with this assignment</label>
      </div>`,
    preview: '// Writes MACHINE_PART.md to repo\n// Optionally updates MACHINE_MAP.md\n// Commit: "♣️ Assign machine part — [type]"'
  },

  triodeRepos: {
    title: 'Triode Repos',
    emoji: '🛸',
    desc: 'Configure three repos as a metallic triode — one weak input, one strong amplifier, one control grid that governs them all.',
    form: `
      <p class="modal-section-title">Weak Repo (input signal)</p>
      <select class="select-input mb-2" id="triodeWeak"><option value="">— select repo —</option></select>
      <p class="modal-section-title">Strong Repo (amplifier)</p>
      <select class="select-input mb-2" id="triodeStrong"><option value="">— select repo —</option></select>
      <p class="modal-section-title">Control Grid (this repo acts as grid)</p>
      <p class="modal-note">This repo will receive the TRIODE_MAP.md and acts as the control grid.</p>
      <div class="checkbox-group">
        <label class="checkbox-item"><input type="checkbox" id="triodeMap" checked> 🗺️ Write TRIODE_MAP.md to this repo</label>
      </div>`,
    preview: '// Writes TRIODE_MAP.md to this repo\n// Commit: "🛸 Triode setup — weak/strong/grid"'
  },

  puzzleBuilder: {
    title: 'Puzzle Builder',
    emoji: '🧩',
    desc: 'Build a standard puzzle where each piece connects to a machine repo. When all pieces lock in, a new puzzle starts.',
    form: `
      <p class="modal-section-title">Puzzle Size</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="puzzleSize" value="9" checked> 3×3 (9 pieces)</label>
        <label class="radio-chip"><input type="radio" name="puzzleSize" value="16"> 4×4 (16 pieces)</label>
        <label class="radio-chip"><input type="radio" name="puzzleSize" value="25"> 5×5 (25 pieces)</label>
      </div>
      <p class="modal-section-title">Piece Labels</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="puzzleLabel" value="emoji" checked> 🎭 Emoji actions</label>
        <label class="radio-chip"><input type="radio" name="puzzleLabel" value="repos"> 📂 Repo names</label>
        <label class="radio-chip"><input type="radio" name="puzzleLabel" value="custom"> ✏️ Custom text</label>
      </div>
      <div class="checkbox-group">
        <label class="checkbox-item"><input type="checkbox" id="puzzleAutoNext" checked> 🔄 Auto-start new puzzle on completion</label>
      </div>`,
    preview: '// Generates puzzle.html + puzzle.js\n// Commits to repo\n// Commit: "🧩 Puzzle builder — [size] pieces"'
  },

  beltPulley: {
    title: 'Belt-Pulley Ring',
    emoji: '💍',
    desc: 'Import a pre-built belt-pulley engine ring system — a set of interlinked scripts that power automated repo workflows.',
    form: `
      <p class="modal-section-title">Ring System</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="ringType" value="basic" checked> ⚙️ Basic (3 scripts)</label>
        <label class="radio-chip"><input type="radio" name="ringType" value="extended"> 🔗 Extended (7 scripts)</label>
        <label class="radio-chip"><input type="radio" name="ringType" value="full"> 💫 Full Engine (12 scripts)</label>
      </div>
      <p class="modal-section-title">Target Folder</p>
      <input class="form-input" id="ringFolder" value="engine/" />`,
    preview: '// Creates engine/ folder with ring scripts\n// Commits all files\n// Commit: "💍 Belt-pulley ring — [type]"'
  },

  soulIntent: {
    title: 'Soul Intent / Crown',
    emoji: '👑',
    desc: 'Reads each selected repo\'s README and feeds its core machine purpose into this page as choices to crown — building king-making websites.',
    form: `
      <p class="modal-section-title">Repos to Crown</p>
      <select class="select-input mb-2" id="soulRepoSelect" multiple style="height:100px"></select>
      <p class="form-hint">Hold Ctrl/Cmd to select multiple</p>
      <p class="modal-section-title">Crown Style</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="soulStyle" value="banner" checked> 👑 Crown banner section</label>
        <label class="radio-chip"><input type="radio" name="soulStyle" value="cards"> 🃏 Intent cards grid</label>
        <label class="radio-chip"><input type="radio" name="soulStyle" value="hero"> 🦸 Hero takeover</label>
      </div>`,
    preview: '// Reads READMEs of selected repos\n// Injects crown intent section\n// Commit: "👑 Crown — soul intent from {n} repos"'
  },

  signalEmitter: {
    title: 'Signal Emitter',
    emoji: '📡',
    desc: 'Emit and receive inter-page signals via custom HTML data attributes and BroadcastChannel API. Orbit an action to watch it.',
    form: `
      <p class="modal-section-title">Signal Type</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="sigType" value="broadcast" checked> 📢 BroadcastChannel</label>
        <label class="radio-chip"><input type="radio" name="sigType" value="storage"> 💾 Storage Event</label>
        <label class="radio-chip"><input type="radio" name="sigType" value="watcher"> 👁️ Page Watcher</label>
      </div>
      <p class="modal-section-title">Channel Name</p>
      <input class="form-input mb-2" id="sigChannel" placeholder="gitpub-signal" />
      <div class="checkbox-group">
        <label class="checkbox-item"><input type="checkbox" id="sigLog" checked> 📋 Log signals to console</label>
        <label class="checkbox-item"><input type="checkbox" id="sigOrbit"> 🔭 Add orbit watcher indicator</label>
      </div>`,
    preview: '// Injects signal emitter JS into index.html\n// Commit: "📡 Signal emitter — [type]"'
  },

  powerEmitter: {
    title: 'Power Emitter',
    emoji: '🔌',
    desc: 'Recharge your site by script-run signal packets — a periodic ping that keeps the service worker fresh and fires analytics events.',
    form: `
      <p class="modal-section-title">Power Source</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="powSrc" value="interval" checked> ⏱️ Interval (every N min)</label>
        <label class="radio-chip"><input type="radio" name="powSrc" value="focus"> 🔍 On page focus</label>
        <label class="radio-chip"><input type="radio" name="powSrc" value="visibility"> 👁️ On visibility change</label>
      </div>
      <p class="modal-section-title">Interval (minutes)</p>
      <input class="form-input mb-2" id="powInterval" type="number" value="5" min="1" max="60" />
      <div class="checkbox-group">
        <label class="checkbox-item"><input type="checkbox" id="powSW" checked> 🔄 Ping service worker</label>
        <label class="checkbox-item"><input type="checkbox" id="powAnalytics"> 📊 Fire analytics beacon</label>
        <label class="checkbox-item"><input type="checkbox" id="powToast"> 🍞 Show recharge toast</label>
      </div>`,
    preview: '// Injects power-emitter.js into index.html\n// Commit: "🔌 Power emitter — [source]"'
  },

  petriDish: {
    title: 'Petri Dish / Test',
    emoji: '🧫',
    desc: 'Create an experimental sandbox repo branch where you can test changes without touching your live site.',
    form: `
      <p class="modal-section-title">Experiment Name</p>
      <input class="form-input mb-2" id="petriName" placeholder="experiment-1" />
      <p class="modal-section-title">Base On</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="petriBase" value="main" checked> 🌿 Main branch</label>
        <label class="radio-chip"><input type="radio" name="petriBase" value="blank"> 📄 Blank slate</label>
      </div>
      <div class="checkbox-group">
        <label class="checkbox-item"><input type="checkbox" id="petriReadme" checked> 📝 Add EXPERIMENT.md log file</label>
        <label class="checkbox-item"><input type="checkbox" id="petriLabel"> 🏷️ Add "experiment" label to repo</label>
      </div>`,
    preview: '// Creates petri branch or new repo\n// Adds EXPERIMENT.md\n// Commit: "🧫 Petri dish — [name]"'
  },

  navigation: {
    title: 'Page Navigation',
    emoji: '🕹️',
    desc: 'Build full page navigation — search box, hamburger menu, jump-to links, breadcrumbs, and page-to-page maneuvering.',
    form: `
      <p class="modal-section-title">Navigation Components</p>
      <div class="checkbox-group">
        <label class="checkbox-item"><input type="checkbox" id="navSearch" checked> 🔍 Search box</label>
        <label class="checkbox-item"><input type="checkbox" id="navHamburger" checked> ☰ Hamburger menu</label>
        <label class="checkbox-item"><input type="checkbox" id="navJump" checked> ⚓ Jump-to anchor links</label>
        <label class="checkbox-item"><input type="checkbox" id="navBread"> 🍞 Breadcrumbs</label>
        <label class="checkbox-item"><input type="checkbox" id="navBack"> ⬅️ Back-to-top button</label>
        <label class="checkbox-item"><input type="checkbox" id="navPages"> 📄 Prev / Next page links</label>
      </div>`,
    preview: '// Injects navigation HTML + JS\n// Appends to index.html\n// Commit: "🕹️ Add page navigation"'
  },

  /* ── Security & Data ────────────────────────────────────── */
  encryptData: {
    title: 'Encrypt User Data',
    emoji: '🧱',
    desc: 'Encrypt user data stored in repo files by commit — wraps stored JSON files in XOR + SHA-256 envelope before committing.',
    form: `
      <p class="modal-section-title">Files to Encrypt</p>
      <div class="checkbox-group">
        <label class="checkbox-item"><input type="checkbox" id="encUsers" checked> 👤 users.json</label>
        <label class="checkbox-item"><input type="checkbox" id="encSessions"> 🔑 sessions.json</label>
        <label class="checkbox-item"><input type="checkbox" id="encSignIns"> 🎵 sign-ins.json</label>
      </div>
      <p class="modal-section-title">Encryption Method</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="encMethod" value="xor" checked> ⚙️ XOR + base64</label>
        <label class="radio-chip"><input type="radio" name="encMethod" value="aes"> 🔐 AES-256 (SubtleCrypto)</label>
      </div>
      <p class="modal-section-title">Key Source</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="encKey" value="secret" checked> 🔑 GitHub secret GHP_SECRET</label>
        <label class="radio-chip"><input type="radio" name="encKey" value="manual"> ✏️ Manual passphrase</label>
      </div>
      <input class="form-input mt-2" id="encPassphrase" placeholder="Passphrase (if manual)" type="password" />`,
    preview: '// Fetches target JSON files\n// Encrypts contents\n// Commits encrypted versions\n// Commit: "🧱 Encrypt user data — [method]"'
  },

  loveChurch: {
    title: 'Love / Church',
    emoji: '♥️',
    desc: 'Add a love or faith themed section — from "I love cats" hobby pages to Catholic churches. AI starts logical content choices.',
    form: `
      <p class="modal-section-title">Theme</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="loveTheme" value="pets" checked> 🐾 Pets / Animals</label>
        <label class="radio-chip"><input type="radio" name="loveTheme" value="faith"> ✝️ Faith / Church</label>
        <label class="radio-chip"><input type="radio" name="loveTheme" value="love"> ❤️ Love / Romance</label>
        <label class="radio-chip"><input type="radio" name="loveTheme" value="community"> 🤝 Community</label>
      </div>
      <p class="modal-section-title">Focus</p>
      <input class="form-input mb-2" id="loveFocus" placeholder='e.g. "I love dogs" or "Our Lady of Grace parish"' />
      <p class="modal-section-title">Add</p>
      <div class="checkbox-group">
        <label class="checkbox-item"><input type="checkbox" id="loveBooks" checked> 📚 Related reading list</label>
        <label class="checkbox-item"><input type="checkbox" id="loveCommunity" checked> 🤝 Community links section</label>
        <label class="checkbox-item"><input type="checkbox" id="loveGallery"> 🖼️ Gallery placeholder</label>
      </div>`,
    preview: '// Generates themed section HTML\n// Appends to index.html\n// Commit: "♥️ Add love/church section — [theme]"'
  },

  metricsScale: {
    title: 'Metrics & Value',
    emoji: '⚖️',
    desc: 'Scan site for metrics — word count, image count, link count, estimated reading time, SEO score, and value indicators.',
    form: `
      <p class="modal-section-title">Metrics to Scan</p>
      <div class="checkbox-group">
        <label class="checkbox-item"><input type="checkbox" id="metWords" checked> 📝 Word count</label>
        <label class="checkbox-item"><input type="checkbox" id="metImages" checked> 🖼️ Image count &amp; alt coverage</label>
        <label class="checkbox-item"><input type="checkbox" id="metLinks" checked> 🔗 Internal / external links</label>
        <label class="checkbox-item"><input type="checkbox" id="metSEO" checked> 🔍 SEO meta completeness</label>
        <label class="checkbox-item"><input type="checkbox" id="metReadTime" checked> ⏱️ Estimated reading time</label>
        <label class="checkbox-item"><input type="checkbox" id="metValue"> 💰 Estimated content value (Wayback heuristic)</label>
      </div>
      <p class="modal-section-title">Output</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="metOutput" value="toast" checked> 🍞 Show in preview</label>
        <label class="radio-chip"><input type="radio" name="metOutput" value="badge"> 🏅 Add metrics badge to page</label>
        <label class="radio-chip"><input type="radio" name="metOutput" value="file"> 📄 Write METRICS.md</label>
      </div>`,
    preview: '// Fetches index.html\n// Runs metric analysis\n// Commit (if badge/file): "⚖️ Metrics report — [repo]"'
  },

  bugDoctor: {
    title: 'Bug Doctor',
    emoji: '💊',
    desc: 'Diagnose broken links, mixed-content warnings, missing closing tags, duplicate IDs, and console errors. Prescribes fixes.',
    form: `
      <p class="modal-section-title">Diagnose</p>
      <div class="checkbox-group">
        <label class="checkbox-item"><input type="checkbox" id="bugLinks" checked> 🔗 Broken relative links</label>
        <label class="checkbox-item"><input type="checkbox" id="bugTags" checked> 🏷️ Unclosed / mismatched tags</label>
        <label class="checkbox-item"><input type="checkbox" id="bugDupId" checked> 🆔 Duplicate id= attributes</label>
        <label class="checkbox-item"><input type="checkbox" id="bugMixed" checked> 🔓 HTTP resources in HTTPS page</label>
        <label class="checkbox-item"><input type="checkbox" id="bugEmpty" checked> ⬛ Empty src/href attributes</label>
      </div>
      <p class="modal-section-title">Prescription</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="bugRx" value="report" checked> 📋 Report only</label>
        <label class="radio-chip"><input type="radio" name="bugRx" value="fix"> 💊 Auto-fix where possible</label>
      </div>`,
    preview: '// Fetches index.html\n// Runs diagnostics\n// Commit (if auto-fix): "💊 Bug doctor — medicate [repo]"'
  },

  addRepoFiles: {
    title: 'Add Repo Files',
    emoji: '📀',
    desc: 'Upload and commit custom files to your repository — images, scripts, data files, or any content from the web or your clipboard.',
    form: `
      <p class="modal-section-title">File to Add</p>
      <input class="form-input mb-2" id="repoFileName" placeholder="path/in/repo.ext" />
      <p class="modal-section-title">Content</p>
      <textarea class="form-input mb-2" id="repoFileContent" rows="5" placeholder="Paste file content here…" style="font-family:monospace;font-size:12px;resize:vertical"></textarea>
      <p class="modal-section-title">Or fetch from URL</p>
      <input class="form-input" id="repoFileUrl" placeholder="https://… (fetched and committed as-is)" />`,
    preview: '// Commits file to repo at specified path\n// Commit: "📀 Add file — [filename]"'
  },

  screenDisplay: {
    title: 'Screen Display',
    emoji: '🖥️',
    desc: 'Add responsive display rules — media queries, print styles, dark-mode media query, and orientation handling.',
    form: `
      <p class="modal-section-title">Responsive Breakpoints</p>
      <div class="checkbox-group">
        <label class="checkbox-item"><input type="checkbox" id="screenMobile" checked> 📱 Mobile (≤480px)</label>
        <label class="checkbox-item"><input type="checkbox" id="screenTablet" checked> 📟 Tablet (481–768px)</label>
        <label class="checkbox-item"><input type="checkbox" id="screenDesktop"> 🖥️ Desktop (≥1200px)</label>
        <label class="checkbox-item"><input type="checkbox" id="screenPrint"> 🖨️ Print styles</label>
      </div>
      <p class="modal-section-title">Display Features</p>
      <div class="checkbox-group">
        <label class="checkbox-item"><input type="checkbox" id="screenDark" checked> 🌑 prefers-color-scheme: dark</label>
        <label class="checkbox-item"><input type="checkbox" id="screenMotion" checked> ♿ prefers-reduced-motion</label>
        <label class="checkbox-item"><input type="checkbox" id="screenFlex" checked> 📐 Flexbox / Grid helper classes</label>
      </div>`,
    preview: '// Writes screen.css to repo root\n// Links in index.html &lt;head&gt;\n// Commit: "🖥️ Screen display — responsive CSS"'
  },
};


/* ══════════════════════════════════════════════════════════
   GitpubApp class
   ══════════════════════════════════════════════════════════ */
class GitpubApp {
  /* ── Static UTF-8 base64 helpers ───────────────────────── */
  static _b64decode(b64str) {
    return new TextDecoder().decode(
      Uint8Array.from(atob(b64str.replace(/\n/g, '')), c => c.charCodeAt(0))
    );
  }

  static _b64encode(str) {
    return btoa(String.fromCharCode(...new TextEncoder().encode(str)));
  }

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

    const content = MODAL_CONTENT[actionId];
    if (!content) return;

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

    // Populate pullMemory repo select
    if (actionId === 'pullMemory') {
      const sel = box.querySelector('#pullMemoryRepo');
      if (sel && this.repos.length) {
        sel.innerHTML = this.repos
          .filter(r => r.name !== repoName)
          .map(r => `<option value="${r.name}">${r.name}</option>`)
          .join('');
      }
    }

    // Show stored memory in dropContent modal
    if (actionId === 'dropContent') {
      const mem = localStorage.getItem('gitpub_memory');
      const pre = box.querySelector('#memoryPreview');
      if (pre) {
        if (mem) {
          const parsed = JSON.parse(mem);
          pre.textContent = `// From: ${parsed.repo} → ${parsed.path}\n// Pulled: ${parsed.ts}\n\n${parsed.content.slice(0, 400)}${parsed.content.length > 400 ? '\n...' : ''}`;
        } else {
          pre.textContent = '// No memory stored yet — use 🧲 Pull Memory first';
        }
      }
    }

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

  /* ── GitHub API helpers ────────────────────────────────── */
  async _ghFetch(repoName, path) {
    let res;
    try {
      res = await fetch(
        `https://api.github.com/repos/${this.username}/${repoName}/contents/${encodeURIComponent(path)}`,
        { headers: { Authorization: `token ${this.token}`, Accept: 'application/vnd.github.v3+json' } }
      );
    } catch {
      throw new Error('Network error — please check your connection');
    }
    if (res.status === 404) return null;
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      throw new Error(e.message || `GitHub ${res.status}`);
    }
    return res.json();
  }

  async _ghCommit(repoName, path, message, newContent, sha = null) {
    // Encode to base64 safely (supports Unicode)
    const b64 = GitpubApp._b64encode(newContent);
    const body = { message, content: b64 };
    if (sha) body.sha = sha;
    const res = await fetch(
      `https://api.github.com/repos/${this.username}/${repoName}/contents/${encodeURIComponent(path)}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `token ${this.token}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      throw new Error(e.message || `GitHub ${res.status}`);
    }
    return res.json();
  }

  /* ── Per-tool commit handlers ───────────────────────────── */

  async _toolMoveUpDown(box, repoName) {
    const section = box.querySelector('#moveSection')?.value || 'Hero / Banner';
    const dir     = box.querySelector('input[name="dir"]:checked')?.value || 'up';
    const file    = await this._ghFetch(repoName, 'index.html');
    let html      = file ? GitpubApp._b64decode(file.content) : `<!DOCTYPE html>\n<html>\n<head><meta charset="UTF-8"><title>${repoName}</title></head>\n<body>\n</body>\n</html>`;
    const sha     = file?.sha || null;

    // Inject / update a gitpub order comment at the top of <body>
    const orderComment = `<!-- gitpub-order: ${section} moved ${dir} by Gitpub on ${new Date().toISOString()} -->`;
    if (html.includes('<!-- gitpub-order:')) {
      html = html.replace(/<!-- gitpub-order:.*?-->/g, orderComment);
    } else {
      html = html.replace(/<body([^>]*)>/, `<body$1>\n${orderComment}`);
    }

    return this._ghCommit(repoName, 'index.html', `📍 Move section "${section}" ${dir}`, html, sha);
  }

  async _toolAddPages(box, repoName) {
    const rawName   = box.querySelector('#newPageName')?.value.trim().toLowerCase().replace(/\s+/g, '-') || 'new-page';
    const pageName  = rawName.endsWith('.html') ? rawName : `${rawName}.html`;
    const template  = box.querySelector('#newPageTemplate')?.value || 'blank';
    const addNav    = box.querySelector('#addToNav')?.checked ?? true;

    const TEMPLATES = {
      blank:    `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>${rawName} — ${repoName}</title>\n</head>\n<body>\n  <header><a href="index.html">← Home</a></header>\n  <main>\n    <h1>${rawName}</h1>\n    <p>Page content goes here.</p>\n  </main>\n</body>\n</html>`,
      blog:     `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>${rawName} — ${repoName}</title>\n</head>\n<body>\n  <header><a href="index.html">← Home</a></header>\n  <main>\n    <article>\n      <h1>${rawName}</h1>\n      <time datetime="${new Date().toISOString().slice(0,10)}">${new Date().toLocaleDateString()}</time>\n      <p>Blog post content goes here.</p>\n    </article>\n  </main>\n</body>\n</html>`,
      gallery:  `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>${rawName} — ${repoName}</title>\n  <style>.gallery{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:1rem}.gallery img{width:100%;border-radius:8px}</style>\n</head>\n<body>\n  <header><a href="index.html">← Home</a></header>\n  <main>\n    <h1>${rawName}</h1>\n    <div class="gallery">\n      <img src="images/placeholder.jpg" alt="Gallery image 1">\n    </div>\n  </main>\n</body>\n</html>`,
      contact:  `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Contact — ${repoName}</title>\n</head>\n<body>\n  <header><a href="index.html">← Home</a></header>\n  <main>\n    <h1>Contact</h1>\n    <form>\n      <label>Name<br><input type="text" name="name" required></label><br><br>\n      <label>Email<br><input type="email" name="email" required></label><br><br>\n      <label>Message<br><textarea name="message" rows="5"></textarea></label><br><br>\n      <button type="submit">Send</button>\n    </form>\n  </main>\n</body>\n</html>`,
      pricing:  `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Pricing — ${repoName}</title>\n  <style>.plans{display:flex;gap:1rem;flex-wrap:wrap}.plan{border:1px solid #ccc;border-radius:8px;padding:1rem;flex:1;min-width:180px}.plan h2{margin-top:0}</style>\n</head>\n<body>\n  <header><a href="index.html">← Home</a></header>\n  <main>\n    <h1>Pricing</h1>\n    <div class="plans">\n      <div class="plan"><h2>Free</h2><p>$0/mo</p><ul><li>Feature A</li></ul></div>\n      <div class="plan"><h2>Pro</h2><p>$9/mo</p><ul><li>Feature A</li><li>Feature B</li></ul></div>\n    </div>\n  </main>\n</body>\n</html>`,
      docs:     `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Docs — ${repoName}</title>\n</head>\n<body>\n  <header><a href="index.html">← Home</a></header>\n  <main>\n    <h1>Documentation</h1>\n    <nav><ul><li><a href="#getting-started">Getting Started</a></li><li><a href="#api">API Reference</a></li></ul></nav>\n    <section id="getting-started"><h2>Getting Started</h2><p>Instructions here.</p></section>\n    <section id="api"><h2>API Reference</h2><p>API docs here.</p></section>\n  </main>\n</body>\n</html>`,
    };

    const pageHTML = TEMPLATES[template] || TEMPLATES.blank;
    const existing = await this._ghFetch(repoName, pageName);
    await this._ghCommit(repoName, pageName, `📎 Add page ${pageName} (${template} template)`, pageHTML, existing?.sha || null);

    // Optionally patch index.html nav
    if (addNav) {
      const idx = await this._ghFetch(repoName, 'index.html');
      if (idx) {
        let idxHtml = GitpubApp._b64decode(idx.content);
        const navLink = `<a href="${pageName}">${rawName}</a>`;
        if (!idxHtml.includes(pageName)) {
          if (idxHtml.includes('</nav>')) {
            idxHtml = idxHtml.replace('</nav>', `  ${navLink}\n</nav>`);
          } else if (idxHtml.includes('</header>')) {
            idxHtml = idxHtml.replace('</header>', `  <nav>${navLink}</nav>\n</header>`);
          }
          await this._ghCommit(repoName, 'index.html', `📎 Add nav link for ${pageName}`, idxHtml, idx.sha);
        }
      }
    }

    return { commit: { sha: Date.now().toString(16) }, pageName };
  }

  async _toolQuickFix(box, repoName) {
    const fixViewport = box.querySelector('#fixViewport')?.checked ?? true;
    const fixOverflow = box.querySelector('#fixOverflow')?.checked ?? true;
    const fixAlt      = box.querySelector('#fixAlt')?.checked ?? true;
    const fixCharset  = box.querySelector('#fixCharset')?.checked ?? true;

    const file = await this._ghFetch(repoName, 'index.html');
    let html   = file ? GitpubApp._b64decode(file.content) : `<!DOCTYPE html>\n<html lang="en">\n<head>\n</head>\n<body>\n</body>\n</html>`;
    const sha  = file?.sha || null;

    const fixes = [];
    if (fixCharset && !html.includes('charset')) {
      html = html.replace('<head>', '<head>\n  <meta charset="UTF-8">');
      fixes.push('charset');
    }
    if (fixViewport && !html.includes('viewport')) {
      html = html.replace(/<head>/i, '<head>\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">');
      fixes.push('viewport');
    }
    if (fixOverflow && !html.includes('overflow-x')) {
      html = html.replace(/<\/head>/i, '  <style>body{overflow-x:hidden}</style>\n</head>');
      fixes.push('overflow-x:hidden');
    }
    if (fixAlt) {
      const before = html;
      html = html.replace(/<img(?![^>]*\balt\s*=)([^>]*?)(\s*\/)?>/gi, (m, attrs, slash) => `<img${attrs} alt=""${slash || ''}>`);
      if (html !== before) fixes.push('alt attributes');
    }

    if (!fixes.length) {
      throw new Error('No fixes needed — everything looks good already!');
    }

    return this._ghCommit(repoName, 'index.html', `🔧 Quick fix: ${fixes.join(', ')}`, html, sha);
  }

  async _toolStyles(box, repoName) {
    const activeSwatch = box.querySelector('.color-swatch.active');
    const accent  = activeSwatch?.dataset.color || '#6366f1';
    const bgTheme = box.querySelector('input[name="bgTheme"]:checked')?.value || 'dark';
    const font    = box.querySelector('#styleFont')?.value || 'Inter';

    const THEMES = {
      dark:   { bg: '#0d1117', bg2: '#161b22', text: '#e6edf3', border: '#30363d' },
      light:  { bg: '#f0f2f5', bg2: '#ffffff',  text: '#1f2328', border: '#d0d7de' },
      ocean:  { bg: '#0a1628', bg2: '#0e2042',  text: '#c9d8f0', border: '#1e3a5f' },
      forest: { bg: '#0d1f0d', bg2: '#132613',  text: '#d4e8d4', border: '#2a4a2a' },
    };
    const t = THEMES[bgTheme] || THEMES.dark;

    const css = `/* Theme generated by Gitpub 🪣 — ${new Date().toISOString().slice(0,10)} */
:root {
  --accent:      ${accent};
  --bg-primary:  ${t.bg};
  --bg-secondary:${t.bg2};
  --text-primary:${t.text};
  --border:      ${t.border};
  --font:        ${font}, system-ui, sans-serif;
}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: var(--font);
  background: var(--bg-primary);
  color: var(--text-primary);
  min-height: 100vh;
}
a { color: var(--accent); }
`;
    const existing = await this._ghFetch(repoName, 'theme.css');
    return this._ghCommit(repoName, 'theme.css', `🪣 Apply theme: ${bgTheme} / ${accent}`, css, existing?.sha || null);
  }

  async _toolPullMemory(box, repoName) {
    const srcRepo = box.querySelector('#pullMemoryRepo')?.value;
    if (!srcRepo) throw new Error('Select a source repository first');
    const path = box.querySelector('input[name="pullFile"]:checked')?.value || 'index.html';

    const file = await this._ghFetch(srcRepo, path);
    if (!file) throw new Error(`${path} not found in ${srcRepo}`);
    const text = GitpubApp._b64decode(file.content);

    localStorage.setItem('gitpub_memory', JSON.stringify({
      repo: srcRepo, path, content: text, ts: new Date().toISOString()
    }));

    return { pulled: true, repo: srcRepo, path, length: text.length };
  }

  async _toolDropContent(box, repoName) {
    const mem = localStorage.getItem('gitpub_memory');
    if (!mem) throw new Error('No memory stored — use 🧲 Pull Memory first');
    const { repo: srcRepo, path: srcPath, content: memContent } = JSON.parse(mem);

    const loc     = box.querySelector('input[name="dropLoc"]:checked')?.value || 'bottom';
    const target  = await this._ghFetch(repoName, 'index.html');
    let   html    = target ? GitpubApp._b64decode(target.content) : '';
    const sha     = target?.sha || null;

    if (loc === 'replace') {
      html = memContent;
    } else if (loc === 'top') {
      html = `<!-- 🟦 Dropped from ${srcRepo}/${srcPath} -->\n${memContent}\n${html}`;
    } else if (loc === 'bottom') {
      html = `${html}\n<!-- 🟦 Dropped from ${srcRepo}/${srcPath} -->\n${memContent}`;
    } else { // new section
      const section = `\n<section class="gitpub-drop">\n<!-- 🟦 Dropped from ${srcRepo}/${srcPath} -->\n${memContent}\n</section>\n`;
      html = html.replace(/<\/body>/i, `${section}\n</body>`) || html + section;
    }

    return this._ghCommit(repoName, 'index.html', `🟦 Drop content from ${srcRepo}/${srcPath}`, html, sha);
  }

  async _toolToolbox(box, repoName) {
    const doSitemap  = box.querySelector('#toolSitemap')?.checked;
    const doRobots   = box.querySelector('#toolRobots')?.checked;
    const doManifest = box.querySelector('#toolManifest')?.checked;
    const doOG       = box.querySelector('#toolOG')?.checked;

    const baseUrl = `https://${this.username}.github.io/${repoName}`;
    const committed = [];

    if (doSitemap) {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${baseUrl}/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>\n</urlset>`;
      const ex = await this._ghFetch(repoName, 'sitemap.xml');
      await this._ghCommit(repoName, 'sitemap.xml', '🔍 Add sitemap.xml', xml, ex?.sha || null);
      committed.push('sitemap.xml');
    }
    if (doRobots) {
      const txt = `User-agent: *\nAllow: /\nSitemap: ${baseUrl}/sitemap.xml\n`;
      const ex = await this._ghFetch(repoName, 'robots.txt');
      await this._ghCommit(repoName, 'robots.txt', '🤖 Add robots.txt', txt, ex?.sha || null);
      committed.push('robots.txt');
    }
    if (doManifest) {
      const json = JSON.stringify({
        name: repoName, short_name: repoName.slice(0, 12),
        start_url: '/', display: 'standalone',
        background_color: '#0d1117', theme_color: '#6366f1',
        icons: [{ src: 'icons/icon.svg', sizes: 'any', type: 'image/svg+xml' }]
      }, null, 2);
      const ex = await this._ghFetch(repoName, 'manifest.json');
      await this._ghCommit(repoName, 'manifest.json', '📱 Add manifest.json (PWA)', json, ex?.sha || null);
      committed.push('manifest.json');
    }
    if (doOG) {
      const idx = await this._ghFetch(repoName, 'index.html');
      if (idx) {
        let html = GitpubApp._b64decode(idx.content);
        if (!html.includes('og:title')) {
          const tags = `\n  <meta property="og:type" content="website">\n  <meta property="og:url" content="${baseUrl}/">\n  <meta property="og:title" content="${repoName}">\n  <meta property="og:description" content="${repoName} on GitHub Pages">`;
          html = html.replace('</head>', `${tags}\n</head>`);
          await this._ghCommit(repoName, 'index.html', '🗺️ Add Open Graph meta tags', html, idx.sha);
          committed.push('OG meta in index.html');
        }
      }
    }

    if (!committed.length) throw new Error('Please select at least one tool to generate.');
    return { committed };
  }

  /* ── Main apply dispatcher (async, real GitHub commits) ─── */
  async _applyChanges(box, toolName, repoName) {
    const applyBtn = box.querySelector('#modalApplyBtn');
    const pre      = document.getElementById('modalPreview');
    if (applyBtn) { applyBtn.disabled = true; applyBtn.textContent = '⏳ Working…'; }
    if (pre) { pre.textContent = `// Connecting to GitHub API…\n// Repo: ${repoName}`; pre.style.color = ''; }

    const actionId = this.activeModal?.actionId;
    try {
      let result;
      if      (actionId === 'moveUpDown')    result = await this._toolMoveUpDown(box, repoName);
      else if (actionId === 'addPages')      result = await this._toolAddPages(box, repoName);
      else if (actionId === 'quickFix')      result = await this._toolQuickFix(box, repoName);
      else if (actionId === 'styles')        result = await this._toolStyles(box, repoName);
      else if (actionId === 'pullMemory')    result = await this._toolPullMemory(box, repoName);
      else if (actionId === 'dropContent')   result = await this._toolDropContent(box, repoName);
      else if (actionId === 'toolbox')       result = await this._toolToolbox(box, repoName);
      else if (actionId === 'microscope')    result = await this._toolMicroscope(box, repoName);
      else if (actionId === 'deepFix')       result = await this._toolDeepFix(box, repoName);
      else if (actionId === 'editRemove')    result = await this._toolEditRemove(box, repoName);
      else if (actionId === 'doubleContent') result = await this._toolDoubleContent(box, repoName);
      else if (actionId === 'updateContent') result = await this._toolUpdateContent(box, repoName);
      else if (actionId === 'aiEngineer')    result = await this._toolAiEngineer(box, repoName);
      else if (actionId === 'researchWriter')result = await this._toolResearchWriter(box, repoName);
      else if (actionId === 'extractData')   result = await this._toolExtractData(box, repoName);
      else if (actionId === 'facetsIntent')  result = await this._toolFacetsIntent(box, repoName);
      else if (actionId === 'unifier')       result = await this._toolUnifier(box, repoName);
      else if (actionId === 'cloneRepo')     result = await this._toolCloneRepo(box, repoName);
      else if (actionId === 'hamburgerMenu') result = await this._toolHamburger(box, repoName);
      else if (actionId === 'connectRepos')  result = await this._toolConnectRepos(box, repoName);
      else if (actionId === 'mediaGallery')  result = await this._toolMediaGallery(box, repoName);
      else if (actionId === 'visualizer')    result = await this._toolVisualizer(box, repoName);
      else if (actionId === 'artStudio')     result = await this._toolArtStudio(box, repoName);
      else if (actionId === 'addMusic')      result = await this._toolAddMusic(box, repoName);
      else if (actionId === 'voiceMic')      result = await this._toolVoiceMic(box, repoName);
      else if (actionId === 'advertising')   result = await this._toolAdvertising(box, repoName);
      else if (actionId === 'modulator')     result = await this._toolModulator(box, repoName);
      else if (actionId === 'pianoSignIn')   result = await this._toolPianoSignIn(box, repoName);
      else if (actionId === 'payments')      result = await this._toolPayments(box, repoName);
      else if (actionId === 'banking')       result = await this._toolBanking(box, repoName);
      else if (actionId === 'shoppingCart')  result = await this._toolShoppingCart(box, repoName);
      else if (actionId === 'merchant')      result = await this._toolMerchant(box, repoName);
      else if (actionId === 'tokenWalker')   result = await this._toolTokenWalker(box, repoName);
      else if (actionId === 'ticketBooth')   result = await this._toolTicketBooth(box, repoName);
      else if (actionId === 'machinePart')   result = await this._toolMachinePart(box, repoName);
      else if (actionId === 'triodeRepos')   result = await this._toolTriodeRepos(box, repoName);
      else if (actionId === 'puzzleBuilder') result = await this._toolPuzzleBuilder(box, repoName);
      else if (actionId === 'beltPulley')    result = await this._toolBeltPulley(box, repoName);
      else if (actionId === 'soulIntent')    result = await this._toolSoulIntent(box, repoName);
      else if (actionId === 'signalEmitter') result = await this._toolSignalEmitter(box, repoName);
      else if (actionId === 'powerEmitter')  result = await this._toolPowerEmitter(box, repoName);
      else if (actionId === 'petriDish')     result = await this._toolPetriDish(box, repoName);
      else if (actionId === 'navigation')    result = await this._toolNavigation(box, repoName);
      else if (actionId === 'encryptData')   result = await this._toolEncryptData(box, repoName);
      else if (actionId === 'loveChurch')    result = await this._toolLoveChurch(box, repoName);
      else if (actionId === 'metricsScale')  result = await this._toolMetrics(box, repoName);
      else if (actionId === 'bugDoctor')     result = await this._toolBugDoctor(box, repoName);
      else if (actionId === 'addRepoFiles')  result = await this._toolAddRepoFiles(box, repoName);
      else if (actionId === 'screenDisplay') result = await this._toolScreenDisplay(box, repoName);
      else throw new Error(`No handler for ${actionId}`);

      // Show real result in preview
      if (pre) {
        const lines = [`// ✅ Done — ${toolName}`, `// Repo: ${repoName}`];
        if (result?.commit?.sha)       lines.push(`// SHA: ${result.commit.sha.slice(0, 8)}`);
        if (result?.pulled)            lines.push(`// Pulled ${result.length} chars from ${result.repo}/${result.path}`, `// Use 🟦 Drop Content to insert`);
        if (result?.committed?.length) lines.push(`// Files committed: ${result.committed.join(', ')}`);
        if (result?.pageName)          lines.push(`// Created: ${result.pageName}`);
        if (result?.report?.length)    result.report.slice(0, 12).forEach(l => lines.push(`// ${l}`));
        if (result?.repoUrl)           lines.push(`// New repo: ${result.repoUrl}`);
        pre.textContent = lines.join('\n');
        pre.style.color = 'var(--gitpub-accent2)';
      }
      this.showToast(`✅ ${toolName} — done!`, 'success');
      if (result?.repoUrl) setTimeout(() => window.open(result.repoUrl, '_blank'), 600);
      setTimeout(() => this.closeModal(), 1500);
    } catch (err) {
      if (pre) { pre.textContent = `// ❌ Error: ${err.message}`; pre.style.color = '#ef4444'; }
      this.showToast(`❌ ${err.message}`, 'error');
      if (applyBtn) { applyBtn.disabled = false; applyBtn.textContent = '✅ Apply & Commit'; }
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
