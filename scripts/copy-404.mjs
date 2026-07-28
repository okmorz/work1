// GitHub Pages is a static host with no server-side rewrites: a direct request to a
// client-side route (e.g. /guide, shared as a QR code / link) 404s unless dist/404.html
// exists. GitHub Pages serves 404.html for any unmatched path within the site, so copying
// the built index.html there lets React Router take over and render the right route.
import { copyFileSync } from 'node:fs'

copyFileSync('dist/index.html', 'dist/404.html')
console.log('copied dist/index.html -> dist/404.html')
