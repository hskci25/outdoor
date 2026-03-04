# Fix "Not Found" on direct links (e.g. krew.life/onboarding)

When you open https://krew.life/onboarding (or /login, /register, /app) directly, the server looks for a file at that path. There is none—the app is a single-page app (SPA) and only `index.html` exists. You need to tell Render to **rewrite** all such requests to `index.html`.

## Steps on Render (do this for your **frontend** static site)

1. Go to **[dashboard.render.com](https://dashboard.render.com)** and log in.
2. Click your **frontend** static site (the one that serves krew.life — often named like "outdoor-frontend" or similar). **Do not** open the backend service.
3. In the **left sidebar** of that static site, look for **"Redirects/Rewrites"** or **"Redirects"**. It may be under **Settings** or as its own tab.
4. Click **"Add Rule"** or **"Add Redirect/Rewrite"**.
5. Add **one** rule:
   - **Source path:** `/*`
   - **Destination path:** `/index.html`
   - **Action:** **Rewrite** (not Redirect — Rewrite keeps the URL in the browser and serves index.html).
6. Save. Wait a minute if needed.
7. Try opening https://krew.life/onboarding (or /login) again in a new tab or incognito.

If you don’t see "Redirects/Rewrites", check under **Settings** for a "Redirects and rewrites" section, or refer to [Render’s docs](https://render.com/docs/redirects-rewrites).
