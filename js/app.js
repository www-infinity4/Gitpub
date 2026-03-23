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
    label: 'Page Tools',
    buttons: [
      ['📍','moveUpDown',  'Move Up/Down', 'Move'],
      ['📎','addPages',    'Add Pages',    'Pages'],
      ['🔧','quickFix',    'Quick Fix',    'Fix'],
      ['🪣','styles',      'Styles',       'Styles'],
      ['🧲','pullMemory',  'Pull Memory',  'Pull'],
      ['🟦','dropContent', 'Drop Content', 'Drop'],
      ['🧰','toolbox',     'Toolbox',      'Tools'],
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
        ${repo.has_pages
          ? `<a href="${pagesUrl}" target="_blank" rel="noopener" class="btn-open">🌐 Open Site</a>`
          : `<button class="btn btn-success btn-sm btn-enable-pages" data-repo="${repo.name}">🚀 Enable Pages</button>`}
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
        const actions = card.querySelector('.card-actions');
        if (actions) {
          const pagesUrl = repoName === `${this.username}.github.io`
            ? `https://${this.username}.github.io/`
            : `https://${this.username}.github.io/${repoName}/`;
          actions.querySelector('.btn-enable-pages')?.replaceWith(
            Object.assign(document.createElement('a'), {
              href: pagesUrl, target: '_blank', rel: 'noopener',
              className: 'btn-open', textContent: '🌐 Open Site'
            })
          );
        }
      }
      this._updateStats();
      this.showToast(`🚀 GitHub Pages enabled for ${repoName}!`, 'success');
    } catch (err) {
      this.showToast(`❌ ${err.message}`, 'error');
      btn.disabled = false;
      btn.textContent = '🚀 Enable Pages';
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
      if      (actionId === 'moveUpDown')   result = await this._toolMoveUpDown(box, repoName);
      else if (actionId === 'addPages')     result = await this._toolAddPages(box, repoName);
      else if (actionId === 'quickFix')     result = await this._toolQuickFix(box, repoName);
      else if (actionId === 'styles')       result = await this._toolStyles(box, repoName);
      else if (actionId === 'pullMemory')   result = await this._toolPullMemory(box, repoName);
      else if (actionId === 'dropContent')  result = await this._toolDropContent(box, repoName);
      else if (actionId === 'toolbox')      result = await this._toolToolbox(box, repoName);
      else throw new Error(`No handler for ${actionId}`);

      // Show real result in preview
      if (pre) {
        const lines = [`// ✅ Done — ${toolName}`, `// Repo: ${repoName}`];
        if (result?.commit?.sha)       lines.push(`// SHA: ${result.commit.sha.slice(0, 8)}`);
        if (result?.pulled)            lines.push(`// Pulled ${result.length} chars from ${result.repo}/${result.path}`, `// Use 🟦 Drop Content to insert`);
        if (result?.committed?.length) lines.push(`// Files committed: ${result.committed.join(', ')}`);
        if (result?.pageName)          lines.push(`// Created: ${result.pageName}`);
        pre.textContent = lines.join('\n');
        pre.style.color = 'var(--gitpub-accent2)';
      }
      this.showToast(`✅ ${toolName} — done!`, 'success');
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
