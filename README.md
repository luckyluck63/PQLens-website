# PQLens website

A static, single-page marketing site for PQLens. It uses plain HTML, CSS and JavaScript, with no build step, so it runs as-is on GitHub Pages.

## Files

```
index.html               the page
404.html                 not-found page
assets/css/styles.css    all styles
assets/js/main.js        navigation, tabs, contact form, lamp animation
assets/img/brand/        logos, favicon, social preview image
assets/img/team/         team photos
assets/img/product/      PQLens v3.2 screens
assets/img/illustrations/
.nojekyll                tells GitHub Pages to serve files as they are
robots.txt
```

## Publish on GitHub Pages

1. Create a new repository on GitHub, for example `pqlens-website`.
2. Upload every file and folder in this directory to the repository root. Include `.nojekyll`, which is a hidden file.
3. In the repository, open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and `/ (root)`, then **Save**.
5. After a minute or two the site is live at `https://<your-user>.github.io/pqlens-website/`.

### Custom domain (optional)

In **Settings → Pages → Custom domain**, enter your domain (for example `www.pqlens.com`). GitHub adds a `CNAME` file. Then point your DNS at GitHub Pages as GitHub describes, and tick **Enforce HTTPS**.

## Before you go live

- **Contact email.** The form opens the visitor’s email app, because GitHub Pages has no server. Set your address in `assets/js/main.js`:
  ```js
  var CONTACT_EMAIL = 'hello@pqlens.com';
  ```
  To receive submissions without email apps, swap the form for a hosted form service (such as Formspree or Basin) and set the form’s `action` to the URL it gives you.
- **Photos.** Two advisor portraits came from the decks and are labelled as official Monash University portraits. Confirm you have permission to use them on the web.
- **Claims.** Figures come from the decks and their cited sources (Capgemini World Payments Report 2026, ASD, NIST IR 8547, PCI DSS 4.0, and the team’s 2026 market scan of 68 vendors). Review them before launch.

## Edit content

All copy is in `index.html`, section by section. Colours and fonts are CSS variables at the top of `styles.css`. Fonts load from Google Fonts: Space Grotesk for headings and Inter for text.

The hero animation is drawn on a canvas in `main.js`. It pauses when it is off screen, and for visitors who have turned on Reduce Motion it shows a still frame.
