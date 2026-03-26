# Gitpub
Publishes repositories, grows them with website builder and environment tools for every nook of a website

---

## Shared Auth Module

Gitpub exposes a lightweight shared authentication module at:

```
https://www-infinity4.github.io/Gitpub/shared/gitpub-auth.js
```

Any other GitHub Pages repo hosted under the same origin
(`https://www-infinity4.github.io/`) can load this script to read or
write the same sign-in state that Gitpub uses — no duplicated logic
required.

### Quick-start

Add the following `<script>` tag **before** your own JavaScript:

```html
<script src="https://www-infinity4.github.io/Gitpub/shared/gitpub-auth.js"></script>
```

### API

All functions are available on `window.GitpubAuth`.

| Function | Signature | Description |
|---|---|---|
| `getGitpubAuth` | `() → { username, token } \| null` | Returns stored credentials, or `null` if not signed in. |
| `setGitpubAuth` | `({ username, token }) → void` | Stores credentials using the same obfuscation Gitpub uses. |
| `clearGitpubAuth` | `() → void` | Removes all Gitpub auth keys — signs the user out everywhere on this origin. |

Constants `GitpubAuth.KEY_USER` (`"gitpub_user"`) and
`GitpubAuth.KEY_TOKEN` (`"gitpub_token"`) are also exposed for advanced
use.

### Example

```html
<script src="https://www-infinity4.github.io/Gitpub/shared/gitpub-auth.js"></script>
<script>
  const auth = GitpubAuth.getGitpubAuth();
  if (auth) {
    // User is already signed in to Gitpub on this device
    console.log('Signed in as', auth.username);
    // auth.token is the raw PAT, ready for use with the GitHub API
  } else {
    // Prompt user to sign in at Gitpub first, or collect credentials
    // yourself and call GitpubAuth.setGitpubAuth({ username, token })
  }
</script>
```

### Origin requirement

Shared localStorage state only works when **both sites are served from
the same origin**.  On GitHub Pages this means both repos must be hosted
under `https://www-infinity4.github.io/` (the `www-infinity4`
organisation).

### Security notice

> ⚠️ The PAT is stored using XOR obfuscation + base64, **not
> encryption**.  Anyone with access to the browser's DevTools or
> localStorage can decode it trivially.  Always use short-lived,
> fine-grained PATs with the minimum required scopes (`public_repo` or
> `repo`) and revoke them promptly when no longer needed.
