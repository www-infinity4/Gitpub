/**
 * Gitpub Shared Auth Module
 *
 * Exposes a stable `window.GitpubAuth` API for reading and writing the
 * Gitpub sign-in state (GitHub username + PAT) that is persisted in
 * localStorage.  Because GitHub Pages serves every repo under the same
 * origin (https://www-infinity4.github.io/), any other repo that loads
 * this script will share the exact same login state as Gitpub.
 *
 * NOTE: Token storage uses XOR obfuscation + base64.  This is NOT
 * encryption — it only prevents casual shoulder-surfing in DevTools.
 * Always use short-lived, fine-grained PATs with the minimum required
 * scopes and revoke them promptly.
 *
 * Usage (from another GitHub Pages repo on the same origin):
 *
 *   <script src="https://www-infinity4.github.io/Gitpub/shared/gitpub-auth.js"></script>
 *   <script>
 *     const auth = GitpubAuth.getGitpubAuth();
 *     if (auth) {
 *       console.log('Signed in as', auth.username);
 *     }
 *   </script>
 */

'use strict';

(function (global) {

  /* ── Constants ───────────────────────────────────────────── */
  const KEY_USER  = 'gitpub_user';
  const KEY_TOKEN = 'gitpub_token';

  /* ── XOR obfuscation ─────────────────────────────────────── */
  // Must stay in sync with js/app.js XOR_KEY = 42.
  const XOR_KEY = 42;
  function xorStr(str) {
    return str.split('').map(function (c) {
      return String.fromCharCode(c.charCodeAt(0) ^ XOR_KEY);
    }).join('');
  }

  /* ── Public API ──────────────────────────────────────────── */

  /**
   * Returns the currently stored credentials, or null if the user is
   * not signed in.
   *
   * @returns {{ username: string, token: string } | null}
   */
  function getGitpubAuth() {
    var rawToken = localStorage.getItem(KEY_TOKEN);
    var rawUser  = localStorage.getItem(KEY_USER);
    if (!rawToken || !rawUser) return null;
    return {
      username: rawUser,
      token:    xorStr(atob(rawToken))
    };
  }

  /**
   * Stores credentials using the same obfuscation scheme as Gitpub.
   *
   * @param {{ username: string, token: string }} credentials
   */
  function setGitpubAuth(credentials) {
    if (!credentials || !credentials.username || !credentials.token) {
      throw new TypeError('setGitpubAuth: { username, token } required');
    }
    localStorage.setItem(KEY_TOKEN, btoa(xorStr(credentials.token)));
    localStorage.setItem(KEY_USER,  credentials.username);
  }

  /**
   * Removes all Gitpub auth keys from localStorage, effectively
   * signing the user out across all repos on this origin.
   */
  function clearGitpubAuth() {
    localStorage.removeItem(KEY_TOKEN);
    localStorage.removeItem(KEY_USER);
  }

  /* ── Attach to global scope ──────────────────────────────── */
  global.GitpubAuth = {
    KEY_USER:        KEY_USER,
    KEY_TOKEN:       KEY_TOKEN,
    getGitpubAuth:   getGitpubAuth,
    setGitpubAuth:   setGitpubAuth,
    clearGitpubAuth: clearGitpubAuth,
  };

}(typeof globalThis !== 'undefined' ? globalThis : window));
