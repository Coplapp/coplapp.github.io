/**
 * Konvertera PRIVACY.md och TERMS.md till HTML-sidor med Frost-design.
 * Använder marked för MD→HTML, sen wrappar i page-template.
 *
 * Kör: node landing/build-legal.mjs
 */

import { marked } from 'marked';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

function buildPage({ title, description, navActive, mdPath, outPath }) {
  const md = readFileSync(mdPath, 'utf8');
  const htmlBody = marked.parse(md);

  const navItems = [
    { href: 'index.html', label: 'Hem', key: 'home' },
    { href: 'features.html', label: 'Funktioner', key: 'features' },
    { href: 'privacy.html', label: 'Integritet', key: 'privacy' },
  ];
  const navLinks = navItems
    .map((n) => `<li><a href="${n.href}"${n.key === navActive ? ' class="active"' : ''}>${n.label}</a></li>`)
    .join('\n        ');

  const page = `<!doctype html>
<html lang="sv">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="theme-color" content="#061018" />
<title>${title} — Copl</title>
<meta name="description" content="${description}" />
<link rel="icon" href="assets/copl-logo.png" type="image/png" />
<link rel="stylesheet" href="style.css" />
</head>
<body>

  <nav class="nav">
    <div class="nav-inner">
      <a href="index.html" class="nav-brand">
        <img src="assets/copl-logo.png" alt="Copl" class="nav-logo" />
        <span>Copl</span>
      </a>
      <ul class="nav-links">
        ${navLinks}
      </ul>
    </div>
  </nav>

  <main class="container">
    <article class="prose">
${htmlBody}
    </article>
  </main>

  <footer class="footer">
    <div class="container">
      <img src="assets/copl-logo.png" alt="Copl" class="footer-logo" />
      <p class="footer-tagline">Byggd med omtanke från ett par till ett annat.</p>
      <ul class="footer-links">
        <li><a href="index.html">Hem</a></li>
        <li><a href="features.html">Funktioner</a></li>
        <li><a href="privacy.html">Integritet</a></li>
        <li><a href="terms.html">Användarvillkor</a></li>
        <li><a href="mailto:copl-app@outlook.com">Kontakt</a></li>
      </ul>
      <div class="footer-copy">© 2026 Pontus Brunzell</div>
    </div>
  </footer>

  <script src="reveal.js"></script>
</body>
</html>
`;

  writeFileSync(outPath, page);
  console.log(`✓ ${outPath}`);
}

buildPage({
  title: 'Integritetspolicy',
  description: 'Vad Copl gör med din data. Sammanfattning: ingenting du inte vill att vi gör.',
  navActive: 'privacy',
  mdPath: join(ROOT, 'PRIVACY.md'),
  outPath: join(__dirname, 'privacy.html'),
});

buildPage({
  title: 'Användarvillkor',
  description: 'Användarvillkor för Copl. Skrivna i klartext.',
  navActive: 'privacy',
  mdPath: join(ROOT, 'TERMS.md'),
  outPath: join(__dirname, 'terms.html'),
});

console.log('Klar.');
