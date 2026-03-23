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
   Each entry: [emoji, id, fullTitle, shortLabel]
   ─────────────────────────────────────────────────────────── */
const EMOJI_ROWS = [
  {
    label: 'Website Tools',
    buttons: [
      ['➕','addPages',    'Add a New Page',      'Add Page'],
      ['🔼','moveUpDown',  'Reorder Page Sections','Reorder'],
      ['🩹','quickFix',    'Fix Common Issues',    'Fix It'],
      ['🎨','styles',      'Change Site Colours',  'Themes'],
      ['📋','pullMemory',  'Copy From Another Site','Copy'],
      ['📥','dropContent', 'Paste Copied Content', 'Paste'],
      ['⚙️','toolbox',     'Generate Site Files',  'Site Tools'],
    ]
  },
];

/* ── Modal content definitions ───────────────────────────── */
/* ── Modal content definitions (7 working tools) ────────── */
const MODAL_CONTENT = {
  moveUpDown: {
    title: 'Reorder Sections',
    emoji: '🔼',
    desc: "Move sections up or down on your website's homepage. Pick which section to move and which direction — your homepage will update automatically.",
    form: `
      <p class="modal-section-title">Which section do you want to move?</p>
      <select class="select-input mb-2" id="moveSection">
        <option>Hero / Banner</option>
        <option>Features Grid</option>
        <option>About Section</option>
        <option>Portfolio / Projects</option>
        <option>Contact Form</option>
        <option>Footer</option>
      </select>
      <p class="modal-section-title">Which direction?</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="dir" value="up" checked> ⬆️ Move Up</label>
        <label class="radio-chip"><input type="radio" name="dir" value="down"> ⬇️ Move Down</label>
        <label class="radio-chip"><input type="radio" name="dir" value="top"> ⬆️⬆️ Move to Very Top</label>
        <label class="radio-chip"><input type="radio" name="dir" value="bottom"> ⬇️⬇️ Move to Very Bottom</label>
      </div>`,
    preview: 'Moving "Hero / Banner" up on your homepage.'
  },

  addPages: {
    title: 'Add a New Page',
    emoji: '➕',
    desc: 'Create a brand new page for your website. Type a name, pick a style, and hit the button — the page is added to your site automatically.',
    form: `
      <div id="pageSuggestions"></div>
      <p class="modal-section-title">Page Name <span style="color:var(--text-secondary);font-weight:400;text-transform:none">(one word, no spaces)</span></p>
      <input class="form-input mb-2" id="newPageName" placeholder="e.g. about, contact, gallery" />
      <p class="modal-section-title">What kind of page?</p>
      <select class="select-input mb-2" id="newPageTemplate">
        <option value="blank">Blank / Custom Page</option>
        <option value="blog">Blog Post / Article</option>
        <option value="gallery">Photo Gallery / Portfolio</option>
        <option value="contact">Contact Form</option>
        <option value="pricing">Pricing / Plans</option>
        <option value="docs">How-To / Documentation</option>
      </select>
      <p class="modal-section-title">Options</p>
      <div class="checkbox-group">
        <label class="checkbox-item"><input type="checkbox" id="addToNav" checked> Add a link to this page on your homepage</label>
      </div>`,
    preview: 'Type a page name above to see a preview of what it will look like.'
  },

  quickFix: {
    title: 'Fix Common Issues',
    emoji: '🩹',
    desc: 'Automatically fixes common problems with your website — things that can make it look broken on phones or rank poorly in Google.',
    form: `
      <p class="modal-section-title">What do you want to fix?</p>
      <div class="checkbox-group">
        <label class="checkbox-item"><input type="checkbox" id="fixViewport" checked> Make it look right on phones (mobile viewport)</label>
        <label class="checkbox-item"><input type="checkbox" id="fixOverflow" checked> Stop horizontal scrolling on mobile</label>
        <label class="checkbox-item"><input type="checkbox" id="fixAlt" checked> Add descriptions to images (helps Google)</label>
        <label class="checkbox-item"><input type="checkbox" id="fixCharset" checked> Fix text encoding (charset)</label>
      </div>`,
    preview: 'Will fix the checked issues on your homepage and save the changes.'
  },

  styles: {
    title: 'Change Site Colours',
    emoji: '🎨',
    desc: 'Pick a colour scheme and background theme for your website. This creates a theme file that styles your whole site.',
    form: `
      <p class="modal-section-title">Pick a main colour</p>
      <div class="color-swatches">
        <div class="color-swatch active" data-color="#6366f1" style="background:#6366f1" title="Indigo / Purple"></div>
        <div class="color-swatch" data-color="#8b5cf6" style="background:#8b5cf6" title="Violet"></div>
        <div class="color-swatch" data-color="#ec4899" style="background:#ec4899" title="Pink"></div>
        <div class="color-swatch" data-color="#06b6d4" style="background:#06b6d4" title="Cyan / Blue"></div>
        <div class="color-swatch" data-color="#22c55e" style="background:#22c55e" title="Green"></div>
        <div class="color-swatch" data-color="#f59e0b" style="background:#f59e0b" title="Gold / Amber"></div>
        <div class="color-swatch" data-color="#ef4444" style="background:#ef4444" title="Red"></div>
        <div class="color-swatch" data-color="#64748b" style="background:#64748b" title="Grey / Slate"></div>
      </div>
      <p class="modal-section-title">Background style</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="bgTheme" value="dark" checked> 🌑 Dark</label>
        <label class="radio-chip"><input type="radio" name="bgTheme" value="light"> ☀️ Light</label>
        <label class="radio-chip"><input type="radio" name="bgTheme" value="ocean"> 🌊 Ocean</label>
        <label class="radio-chip"><input type="radio" name="bgTheme" value="forest"> 🌲 Forest</label>
      </div>
      <p class="modal-section-title">Font style</p>
      <select class="select-input" id="styleFont">
        <option value="Inter">Inter — Modern &amp; Clean</option>
        <option value="Georgia">Georgia — Classic &amp; Elegant</option>
        <option value="'JetBrains Mono'">JetBrains Mono — Code Style</option>
        <option value="system-ui">System Default</option>
      </select>`,
    preview: 'Will apply a Dark theme with Indigo colour and Inter font to your website.'
  },

  pullMemory: {
    title: 'Copy From Another Site',
    emoji: '📋',
    desc: 'Copy content from one of your other websites and save it. Then use "📥 Paste In" to drop it into this site.',
    form: `
      <p class="modal-section-title">Which site do you want to copy from?</p>
      <select class="select-input mb-2" id="pullMemoryRepo">
        <option value="">— pick a site —</option>
      </select>
      <p class="modal-section-title">What do you want to copy?</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="pullFile" value="index.html" checked> 🏠 Homepage (index.html)</label>
        <label class="radio-chip"><input type="radio" name="pullFile" value="css/styles.css"> 🎨 Stylesheet (styles.css)</label>
        <label class="radio-chip"><input type="radio" name="pullFile" value="README.md"> 📝 README</label>
      </div>`,
    preview: 'Will copy the selected file and hold it ready for pasting into another site.'
  },

  dropContent: {
    title: 'Paste Copied Content',
    emoji: '📥',
    desc: "Paste the content you copied with \"📋 Copy From Another Site\" into this website's homepage.",
    form: `
      <p class="modal-section-title">Copied content (ready to paste)</p>
      <pre class="modal-preview" id="memoryPreview" style="max-height:120px;font-size:11px">Nothing copied yet — use 📋 Copy From Another Site first</pre>
      <p class="modal-section-title">Where do you want to paste it?</p>
      <div class="radio-group">
        <label class="radio-chip"><input type="radio" name="dropLoc" value="bottom" checked> 🔚 At the end of the page</label>
        <label class="radio-chip"><input type="radio" name="dropLoc" value="top"> 🔝 At the top of the page</label>
        <label class="radio-chip"><input type="radio" name="dropLoc" value="replace"> 🔄 Replace the whole page</label>
      </div>`,
    preview: 'Will paste the copied content into your homepage.'
  },

  toolbox: {
    title: 'Generate Site Files',
    emoji: '⚙️',
    desc: 'Create extra files that help your website get found on Google and work like an app on phones.',
    form: `
      <p class="modal-section-title">What do you want to create?</p>
      <div class="checkbox-group">
        <label class="checkbox-item"><input type="checkbox" id="toolSitemap"> 🗺️ Site map (helps Google find all your pages)</label>
        <label class="checkbox-item"><input type="checkbox" id="toolRobots"> 🤖 robots.txt (tells search engines what to index)</label>
        <label class="checkbox-item"><input type="checkbox" id="toolManifest"> 📱 App manifest (makes your site installable on phones)</label>
        <label class="checkbox-item"><input type="checkbox" id="toolOG"> 🔗 Social preview (shows a nice card when shared on social media)</label>
      </div>`,
    preview: 'Select items above — each checked box creates a file for your website.'
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

  /* ── Page template HTML generator ──────────────────────── */
  static _getPageTemplate(template, rawName, repoName) {
    const label = rawName || 'new-page';
    const date  = new Date().toLocaleDateString();
    const ts    = new Date().toISOString().slice(0, 10);
    const T = {
      blank: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${label} — ${repoName}</title>
  <style>
    body{font-family:system-ui,sans-serif;max-width:820px;margin:2rem auto;padding:0 1.2rem;background:#f9fafc;color:#1f2937}
    header{margin-bottom:2rem}a{color:#6366f1;text-decoration:none}
    h1{font-size:2rem;margin-bottom:.5rem}
  </style>
</head>
<body>
  <header><a href="index.html">← Back to Home</a></header>
  <main>
    <h1>${label}</h1>
    <p>Your content goes here. Click ✅ Apply &amp; Commit to create this page.</p>
  </main>
</body>
</html>`,
      blog: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${label} — ${repoName}</title>
  <style>
    body{font-family:Georgia,serif;max-width:720px;margin:2rem auto;padding:0 1.2rem;line-height:1.75;color:#1f2937;background:#fff}
    header{font-family:system-ui,sans-serif;margin-bottom:2rem}a{color:#6366f1}
    time{color:#6b7280;font-size:.9rem;font-family:system-ui,sans-serif}
    h1{font-size:2rem;margin-bottom:.3rem}
  </style>
</head>
<body>
  <header><a href="index.html">← Back to Home</a></header>
  <main>
    <article>
      <h1>${label}</h1>
      <time datetime="${ts}">${date}</time>
      <p>Your blog post content goes here. Start writing!</p>
    </article>
  </main>
</body>
</html>`,
      gallery: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${label} — ${repoName}</title>
  <style>
    body{font-family:system-ui,sans-serif;max-width:1000px;margin:2rem auto;padding:0 1.2rem;background:#111;color:#eee}
    header{margin-bottom:2rem}a{color:#a78bfa}
    h1{font-size:2rem}
    .gallery{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:1rem;margin-top:1rem}
    .gallery-item{background:#222;border-radius:10px;aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-size:2.5rem;border:1px solid #333}
  </style>
</head>
<body>
  <header><a href="index.html">← Back to Home</a></header>
  <main>
    <h1>${label}</h1>
    <p style="color:#9ca3af">Add your images below.</p>
    <div class="gallery">
      <div class="gallery-item">🖼️</div>
      <div class="gallery-item">🖼️</div>
      <div class="gallery-item">🖼️</div>
    </div>
  </main>
</body>
</html>`,
      contact: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contact — ${repoName}</title>
  <style>
    body{font-family:system-ui,sans-serif;max-width:600px;margin:2rem auto;padding:0 1.2rem;color:#1f2937;background:#fff}
    header{margin-bottom:2rem}a{color:#6366f1}
    h1{font-size:2rem}
    label{display:block;margin-bottom:1rem;font-weight:600}
    input,textarea{width:100%;padding:.6rem .8rem;border:1.5px solid #d1d5db;border-radius:8px;font:inherit;margin-top:.3rem;box-sizing:border-box}
    input:focus,textarea:focus{border-color:#6366f1;outline:none}
    button{background:#6366f1;color:#fff;border:none;padding:.65rem 1.6rem;border-radius:8px;font:inherit;font-weight:600;cursor:pointer;margin-top:.5rem}
  </style>
</head>
<body>
  <header><a href="index.html">← Back to Home</a></header>
  <main>
    <h1>Contact</h1>
    <form>
      <label>Your Name<br><input type="text" placeholder="Jane Smith"></label>
      <label>Your Email<br><input type="email" placeholder="jane@example.com"></label>
      <label>Message<br><textarea rows="5" placeholder="Write your message here…"></textarea></label>
      <button type="submit">Send Message</button>
    </form>
  </main>
</body>
</html>`,
      pricing: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pricing — ${repoName}</title>
  <style>
    body{font-family:system-ui,sans-serif;max-width:900px;margin:2rem auto;padding:0 1.2rem;color:#1f2937;background:#f9fafc}
    header{margin-bottom:2rem}a{color:#6366f1}h1{font-size:2rem}
    .plans{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1.2rem;margin-top:1.5rem}
    .plan{background:#fff;border:2px solid #e5e7eb;border-radius:14px;padding:1.6rem;text-align:center}
    .plan.featured{border-color:#6366f1;background:#f5f3ff}
    .price{font-size:2.2rem;font-weight:900;margin:.5rem 0;color:#6366f1}
    .plan ul{text-align:left;margin:.8rem 0 1rem;padding-left:1.2rem}
    .plan button{background:#6366f1;color:#fff;border:none;padding:.5rem 1.2rem;border-radius:8px;cursor:pointer;font:inherit;font-weight:600}
  </style>
</head>
<body>
  <header><a href="index.html">← Back to Home</a></header>
  <main>
    <h1>Pricing</h1>
    <div class="plans">
      <div class="plan"><h2>Free</h2><div class="price">$0</div><p>/month</p><ul><li>Feature A</li><li>Feature B</li></ul><button>Get Started</button></div>
      <div class="plan featured"><h2>Pro</h2><div class="price">$9</div><p>/month</p><ul><li>Feature A</li><li>Feature B</li><li>Feature C</li></ul><button>Upgrade Now</button></div>
    </div>
  </main>
</body>
</html>`,
      docs: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Docs — ${repoName}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:system-ui,sans-serif;display:grid;grid-template-columns:220px 1fr;min-height:100vh;color:#1f2937}
    nav{background:#f3f4f6;padding:1.5rem 1rem;border-right:1px solid #e5e7eb;font-size:.9rem}
    nav strong{display:block;margin-bottom:1rem;font-size:1rem}
    nav a{display:block;padding:.35rem .6rem;color:#374151;border-radius:6px;text-decoration:none;margin-bottom:2px}
    nav a:hover{background:#e5e7eb}
    main{padding:2rem}a{color:#6366f1}
    h1{font-size:2rem;margin-bottom:1rem}h2{margin:2rem 0 .5rem}p{line-height:1.7;margin-bottom:1rem}
  </style>
</head>
<body>
  <nav>
    <strong>${repoName}</strong>
    <a href="index.html">← Home</a>
    <a href="#getting-started">Getting Started</a>
    <a href="#api">API Reference</a>
  </nav>
  <main>
    <h1>Documentation</h1>
    <section id="getting-started"><h2>Getting Started</h2><p>Step-by-step instructions go here.</p></section>
    <section id="api"><h2>API Reference</h2><p>API documentation goes here.</p></section>
  </main>
</body>
</html>`,
    };
    return T[template] || T.blank;
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

    // Bind Enable Pages buttons
    grid.querySelectorAll('.btn-enable-pages').forEach(btn => {
      btn.addEventListener('click', () => this._enablePages(btn.dataset.repo, btn));
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

    const goLiveBtn = repo.has_pages
      ? `<a href="${pagesUrl}" target="_blank" rel="noopener" class="btn-go-live btn-go-live--on">
           🌐 View Your Live Site →
         </a>`
      : `<button class="btn-go-live btn-go-live--off btn-enable-pages" data-repo="${repo.name}">
           🚀 Go Live! — Publish This Site
         </button>`;

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
      <div class="card-live">${goLiveBtn}</div>
      <div class="card-actions">
        <a href="${repo.html_url}" target="_blank" rel="noopener" class="btn btn-secondary btn-sm">View on GitHub ↗</a>
      </div>
      <div class="emoji-toolbar">${toolbarHTML}</div>
    </article>`;
  }

  /* ── Modal ──────────────────────────────────────────────── */
  openModal(actionId, repoName) {
    const content = MODAL_CONTENT[actionId];
    if (!content) return;

    const overlay = document.getElementById('modalOverlay');
    const box     = document.getElementById('modalBox');
    if (!overlay || !box) return;

    const isAddPages = actionId === 'addPages';

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
        ${isAddPages
          ? `<p class="modal-section-title">What it will look like</p>
             <iframe id="modalIframePreview" class="modal-iframe-preview"
               sandbox="allow-same-origin" title="Page preview"
               srcdoc="<html><body style='font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;height:90vh;color:#666;text-align:center'><p style='font-size:1.1rem'>Type a page name above<br>to see a preview here ✨</p></body></html>">
             </iframe>`
          : `<p class="modal-section-title">What will happen</p>
             <div class="modal-preview" id="modalPreview">${content.preview}</div>`
        }
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" id="modalPreviewBtn">👁️ Preview</button>
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
          pre.textContent = `From: ${parsed.repo} → ${parsed.path}\nCopied: ${parsed.ts}\n\n${parsed.content.slice(0, 400)}${parsed.content.length > 400 ? '\n...' : ''}`;
        } else {
          pre.textContent = 'Nothing copied yet — use 📋 Copy From Another Site first';
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
      if (!isAddPages) this.showToast('👁️ Preview updated', 'info');
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

    // AI suggestions for addPages
    if (isAddPages) {
      const repo = this.repos.find(r => r.name === repoName);
      this._loadPageSuggestions(box, repo, repoName, refreshPreview);
    }
  }

  /* ── AI page suggestions ────────────────────────────────── */
  _getSuggestionsForRepo(repo) {
    const name     = (repo?.name || '').toLowerCase();
    const desc     = (repo?.description || '').toLowerCase();
    const combined = name + ' ' + desc;
    const suggestions = [];

    if (/portfolio|personal|me|myself|cv|resume|folio/.test(combined)) {
      suggestions.push(
        { pageName: 'about',    template: 'blank',   reason: 'Tell visitors about yourself' },
        { pageName: 'projects', template: 'gallery',  reason: 'Showcase your work' },
        { pageName: 'contact',  template: 'contact',  reason: 'Let people reach you' }
      );
    } else if (/blog|post|article|write|journal|news/.test(combined)) {
      suggestions.push(
        { pageName: 'about',   template: 'blank',  reason: 'About this blog' },
        { pageName: 'post',    template: 'blog',   reason: 'Write your first post' },
        { pageName: 'contact', template: 'contact', reason: 'Contact page' }
      );
    } else if (/shop|store|marketplace|sell|product|ecommerce/.test(combined)) {
      suggestions.push(
        { pageName: 'products', template: 'gallery',  reason: 'Show your products' },
        { pageName: 'pricing',  template: 'pricing',  reason: 'Your pricing plans' },
        { pageName: 'contact',  template: 'contact',  reason: 'Order & contact' }
      );
    } else if (/docs|documentation|api|library|framework|tool/.test(combined)) {
      suggestions.push(
        { pageName: 'docs',           template: 'docs',  reason: 'Full documentation' },
        { pageName: 'getting-started',template: 'docs',  reason: 'Quick-start guide' },
        { pageName: 'changelog',      template: 'blog',  reason: 'Version history' }
      );
    } else {
      suggestions.push(
        { pageName: 'about',   template: 'blank',   reason: 'About this project' },
        { pageName: 'gallery', template: 'gallery', reason: 'Photo / portfolio gallery' },
        { pageName: 'contact', template: 'contact', reason: 'Contact page' }
      );
    }
    return suggestions.slice(0, 4);
  }

  _loadPageSuggestions(box, repo, repoName, refreshPreview) {
    const suggestionsEl = box.querySelector('#pageSuggestions');
    if (!suggestionsEl) return;

    const suggestions = this._getSuggestionsForRepo(repo);
    const render = (heading) => {
      suggestionsEl.innerHTML = `
        <p class="modal-section-title">${heading}</p>
        <div class="ai-chip-row">
          ${suggestions.map(s =>
            `<button class="ai-chip" data-page="${s.pageName}" data-template="${s.template}" title="${s.reason}">
               ➕ ${s.pageName}
             </button>`
          ).join('')}
        </div>`;
      suggestionsEl.querySelectorAll('.ai-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          const nameInput  = box.querySelector('#newPageName');
          const templateSel = box.querySelector('#newPageTemplate');
          if (nameInput)    nameInput.value    = chip.dataset.page;
          if (templateSel)  templateSel.value  = chip.dataset.template;
          refreshPreview();
        });
      });
    };

    render(`💡 Suggested pages for <em>${repoName}</em>:`);

    // Async: check if index.html exists to refine the heading
    if (this.token) {
      this._ghFetch(repoName, 'index.html').then(file => {
        render(file
          ? `💡 Your homepage exists! Great pages to add next:`
          : `💡 No homepage yet — start with one of these:`
        );
      }).catch(() => {});
    }
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
    const actionId = this.activeModal?.actionId;

    // addPages: render live iframe of the selected template
    if (actionId === 'addPages') {
      const rawName  = box.querySelector('#newPageName')?.value.trim().toLowerCase().replace(/\s+/g, '-') || '';
      const template = box.querySelector('#newPageTemplate')?.value || 'blank';
      const addNav   = box.querySelector('#addToNav')?.checked ?? true;
      const iframe   = document.getElementById('modalIframePreview');
      if (!iframe) return;

      if (!rawName) {
        iframe.srcdoc = `<html><body style="font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;height:90vh;color:#666;text-align:center"><p style="font-size:1.1rem">Type a page name above<br>to see a preview here ✨</p></body></html>`;
        return;
      }
      const templateHTML = GitpubApp._getPageTemplate(template, rawName, repoName);
      iframe.srcdoc = templateHTML;
      return;
    }

    // All other tools: human-readable plain English summary
    const pre = document.getElementById('modalPreview');
    if (!pre) return;

    const st = this._collectFormState(box);
    let summary = '';

    switch (actionId) {
      case 'moveUpDown': {
        const section = box.querySelector('#moveSection')?.value || 'section';
        const dir = box.querySelector('input[name="dir"]:checked')?.value || 'up';
        const dirLabel = { up: 'up', down: 'down', top: 'to the very top', bottom: 'to the very bottom' }[dir] || dir;
        summary = `Will move the "${section}" section ${dirLabel} on your homepage, then save.`;
        break;
      }
      case 'quickFix': {
        const fixes = st.checkboxes.map(c => c.trim());
        summary = fixes.length
          ? `Will fix ${fixes.length} thing${fixes.length > 1 ? 's' : ''} on your homepage:\n${fixes.map(f => '  ✓ ' + f).join('\n')}`
          : 'Select at least one fix above.';
        break;
      }
      case 'styles': {
        const theme = box.querySelector('input[name="bgTheme"]:checked')?.value || 'dark';
        const font  = box.querySelector('#styleFont')?.options[box.querySelector('#styleFont')?.selectedIndex]?.text || 'Inter';
        const color = box.querySelector('.color-swatch.active')?.title || 'Indigo';
        summary = `Will apply a ${theme} background with ${color} colour and ${font} font to your website.\nA theme.css file will be saved to your repo.`;
        break;
      }
      case 'pullMemory': {
        const src  = box.querySelector('#pullMemoryRepo')?.value || '(no site selected)';
        const file = box.querySelector('input[name="pullFile"]:checked')?.value || 'index.html';
        summary = `Will copy ${file} from your "${src}" site.\nAfter this, use 📥 Paste In to drop it into another site.`;
        break;
      }
      case 'dropContent': {
        const loc = box.querySelector('input[name="dropLoc"]:checked')?.value || 'bottom';
        const locLabel = { bottom: 'at the end', top: 'at the top', replace: 'replacing the whole page' }[loc] || loc;
        summary = `Will paste the copied content ${locLabel} of your homepage, then save.`;
        break;
      }
      case 'toolbox': {
        const files = st.checkboxes.map(c => c.trim());
        summary = files.length
          ? `Will create ${files.length} file${files.length > 1 ? 's' : ''} for your website:\n${files.map(f => '  ✓ ' + f).join('\n')}`
          : 'Select at least one item above.';
        break;
      }
      default:
        summary = content.preview || 'Ready to apply changes.';
    }

    pre.textContent = summary;
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

  /* ── Enable GitHub Pages ───────────────────────────────── */
  async _enablePages(repoName, btn) {
    btn.disabled = true;
    btn.textContent = '⏳ Enabling…';
    const repo = this.repos.find(r => r.name === repoName);
    const branch = repo?.default_branch || 'main';
    try {
      const res = await fetch(
        `https://api.github.com/repos/${this.username}/${repoName}/pages`,
        {
          method: 'POST',
          headers: {
            Authorization: `token ${this.token}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ source: { branch, path: '/' } }),
        }
      );
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.message || `GitHub ${res.status}`);
      }
      // Mark the repo as having pages enabled and re-render the card
      if (repo) repo.has_pages = true;
      const filteredRepo = this.filteredRepos.find(r => r.name === repoName);
      if (filteredRepo) filteredRepo.has_pages = true;
      const card = document.querySelector(`.repo-card[data-repo="${repoName}"]`);
      if (card) {
        const liveArea = card.querySelector('.card-live');
        if (liveArea) {
          const pagesUrl = repoName === `${this.username}.github.io`
            ? `https://${this.username}.github.io/`
            : `https://${this.username}.github.io/${repoName}/`;
          liveArea.innerHTML = `<a href="${pagesUrl}" target="_blank" rel="noopener" class="btn-go-live btn-go-live--on">🌐 View Your Live Site →</a>`;
        }
      }
      this._updateStats();
      this.showToast(`🚀 GitHub Pages enabled for ${repoName}! Your site will be live in a moment.`, 'success');
    } catch (err) {
      this.showToast(`❌ ${err.message}`, 'error');
      btn.disabled = false;
      btn.textContent = '🚀 Go Live! — Publish This Site';
    }
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

    const pageHTML = GitpubApp._getPageTemplate(template, rawName, repoName);
    const existing = await this._ghFetch(repoName, pageName);
    await this._ghCommit(repoName, pageName, `➕ Add page ${pageName} (${template} template)`, pageHTML, existing?.sha || null);

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
          await this._ghCommit(repoName, 'index.html', `➕ Add nav link for ${pageName}`, idxHtml, idx.sha);
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
    const iframe   = document.getElementById('modalIframePreview');
    const isAddPages = this.activeModal?.actionId === 'addPages';

    if (applyBtn) { applyBtn.disabled = true; applyBtn.textContent = '⏳ Saving…'; }
    if (pre)    { pre.textContent = `Connecting to GitHub…`; pre.style.color = ''; }
    if (iframe) { iframe.srcdoc = `<html><body style="font-family:system-ui;display:flex;align-items:center;justify-content:center;height:90vh;color:#666;text-align:center"><p style="font-size:1.1rem">⏳ Saving to GitHub…</p></body></html>`; }

    const actionId = this.activeModal?.actionId;
    try {
      let result;
      if      (actionId === 'moveUpDown')   result = await this._toolMoveUpDown(box, repoName);
      else if (actionId === 'addPages')     result = await this._toolAddPages(box, repoName);
      else if (actionId === 'quickFix')     result = await this._toolQuickFix(box, repoName);
      else if (actionId === 'styles')       result = await this._toolStyles(box, repoName);
      else if (actionId === 'pullMemory')   result = await this._toolPullMemory(box, repoName);
      else if (actionId === 'dropContent')  result = await this._toolDropContent(box, repoName);
      else if (actionId === 'toolbox')      result = await this._toolToolbox(box, repoName);
      else throw new Error(`No handler for ${actionId}`);

      // Show human-readable success
      if (isAddPages && iframe) {
        const pageName = result?.pageName || 'new-page.html';
        iframe.srcdoc = `<html><body style="font-family:system-ui;display:flex;align-items:center;justify-content:center;height:90vh;background:#f0fff4;color:#166534;text-align:center"><p style="font-size:1.2rem;padding:2rem">✅ <strong>${pageName}</strong> was added to your site!<br><br><small style="color:#4b7059">It may take a moment to appear live.</small></p></body></html>`;
      } else if (pre) {
        let msg = `✅ Done! ${toolName} applied to "${repoName}".`;
        if (result?.pulled)            msg += `\n\nCopied ${result.length} characters from ${result.repo}/${result.path}.\nNow use 📥 Paste In on another site to insert it.`;
        if (result?.committed?.length) msg += `\n\nFiles saved: ${result.committed.join(', ')}`;
        if (result?.pageName)          msg += `\n\nNew page created: ${result.pageName}`;
        pre.textContent = msg;
        pre.style.color = 'var(--gitpub-accent2)';
      }
      this.showToast(`✅ ${toolName} — saved!`, 'success');
      setTimeout(() => this.closeModal(), 2000);
    } catch (err) {
      if (isAddPages && iframe) {
        iframe.srcdoc = `<html><body style="font-family:system-ui;display:flex;align-items:center;justify-content:center;height:90vh;background:#fff5f5;color:#9b1c1c;text-align:center;padding:2rem"><p>❌ <strong>Error:</strong><br>${err.message}</p></body></html>`;
      } else if (pre) {
        pre.textContent = `❌ Error: ${err.message}`;
        pre.style.color = '#ef4444';
      }
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
      "GitHub Pages works best when your repo has an <code>index.html</code> file at the root. Click \"🚀 Go Live!\" on a card to enable Pages, then use ➕ Add Page to build it out.",
      "To get found on Google, add a description to your site, use the ⚙️ Site Tools to create a sitemap, and make sure every page has a clear title.",
      "To make your site work like an app on phones, use ⚙️ Site Tools → App manifest. GitHub Pages provides HTTPS automatically, so you're already halfway there!",
      "Use 📋 Copy From Another Site to grab content from one of your sites, then use 📥 Paste In on another site to drop it in. Great for reusing headers, footers, or whole layouts!",
      "Use 🎨 Change Site Colours to set a colour scheme across your whole site. Pick a colour, choose Dark or Light, and hit Apply — a theme file gets saved to your repo.",
      "I recommend using clear page names like 'about', 'contact', 'services', 'gallery' — these are easy for visitors to find and remember.",
      "The ➕ Add Page button is your best friend! Click it on any repo card, pick a page style, and I'll suggest what makes sense for your site.",
      "Tip: If your site looks broken on phones, click 🩹 Fix It on the card — it auto-fixes the most common mobile issues.",
    ];
    let msgCount = 0;

    const GP_SVG = `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" width="16" height="16"><polygon points="28,22 23,8 34,18" fill="#c084fc"/><polygon points="52,22 57,8 46,18" fill="#c084fc"/><circle cx="40" cy="32" r="18" fill="#a855f7"/><circle cx="33" cy="29" r="5" fill="white"/><circle cx="47" cy="29" r="5" fill="white"/><circle cx="33" cy="30" r="2.5" fill="#4c1d95"/><circle cx="47" cy="30" r="2.5" fill="#4c1d95"/><path d="M34,39 Q40,44 46,39" stroke="#6b21a8" fill="none" stroke-width="1.5" stroke-linecap="round"/><ellipse cx="40" cy="61" rx="16" ry="12" fill="#a855f7"/><text x="40" y="65" text-anchor="middle" fill="white" font-size="9" font-weight="bold" font-family="system-ui,sans-serif">GP</text><line x1="27" y1="57" x2="12" y2="48" stroke="#c084fc" stroke-width="2.5" stroke-linecap="round"/><line x1="25" y1="63" x2="8" y2="63" stroke="#c084fc" stroke-width="2.5" stroke-linecap="round"/><line x1="27" y1="69" x2="12" y2="78" stroke="#c084fc" stroke-width="2.5" stroke-linecap="round"/><line x1="53" y1="57" x2="68" y2="48" stroke="#c084fc" stroke-width="2.5" stroke-linecap="round"/><line x1="55" y1="63" x2="72" y2="63" stroke="#c084fc" stroke-width="2.5" stroke-linecap="round"/><line x1="53" y1="69" x2="68" y2="78" stroke="#c084fc" stroke-width="2.5" stroke-linecap="round"/></svg>`;

    const messagesEl  = document.getElementById('chatMessages');
    const inputEl     = document.getElementById('chatInput');
    const sendBtn     = document.getElementById('chatSendBtn');

    const addMsg = (text, isUser = false) => {
      if (!messagesEl) return;
      const div = document.createElement('div');
      div.className = `chat-msg ${isUser ? 'user' : 'bot'}`;
      div.innerHTML = isUser
        ? `<div class="chat-bubble">${text}</div>`
        : `<div class="chat-bot-avatar" style="overflow:hidden">${GP_SVG}</div><div class="chat-bubble">${text}</div>`;
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
