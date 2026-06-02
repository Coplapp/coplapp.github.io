/**
 * Konvertera PRIVACY/TERMS (sv + en) till HTML-sidor med Frost-design.
 * Använder marked för MD→HTML, sen wrappar i page-template.
 * Genererar svenska sidor i landing/ och engelska i landing/en/.
 *
 * Kör: node landing/build-legal.mjs   (kräver: npm i marked)
 */

import { marked } from 'marked';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// Språkdetektering: körs i <head>. Svenska sidan skickar icke-svenska
// webbläsare till /en/; engelska sidan skickar sv-preferens tillbaka.
const DETECT = {
  sv: `(function(){try{var l=localStorage.getItem('copl-lang');if(l==='sv')return;var f=location.pathname.split('/').pop()||'index.html';if(l==='en'||(navigator.language||'').toLowerCase().indexOf('sv')!==0){location.replace('en/'+f);}}catch(e){}})();`,
  en: `(function(){try{if(localStorage.getItem('copl-lang')==='sv'){var f=location.pathname.split('/').pop()||'index.html';location.replace('../'+f);}}catch(e){}})();`,
};

const LANGS = {
  sv: {
    htmlLang: 'sv',
    prefix: '',
    nav: [
      { href: 'index.html', label: 'Hem', key: 'home' },
      { href: 'features.html', label: 'Funktioner', key: 'features' },
      { href: 'privacy.html', label: 'Integritet', key: 'privacy' },
    ],
    footerTagline: 'Byggd med omtanke från ett par till ett annat.',
    footerLinks: [
      { href: 'index.html', label: 'Hem' },
      { href: 'features.html', label: 'Funktioner' },
      { href: 'privacy.html', label: 'Integritet' },
      { href: 'terms.html', label: 'Användarvillkor' },
      { href: 'mailto:copl-app@outlook.com', label: 'Kontakt' },
    ],
    switchLabel: 'EN',
    switchLang: 'en',
    switchHref: (page) => `en/${page}`,
  },
  en: {
    htmlLang: 'en',
    prefix: '../',
    nav: [
      { href: 'index.html', label: 'Home', key: 'home' },
      { href: 'features.html', label: 'Features', key: 'features' },
      { href: 'privacy.html', label: 'Privacy', key: 'privacy' },
    ],
    footerTagline: 'Built with care, from one couple to another.',
    footerLinks: [
      { href: 'index.html', label: 'Home' },
      { href: 'features.html', label: 'Features' },
      { href: 'privacy.html', label: 'Privacy' },
      { href: 'terms.html', label: 'Terms' },
      { href: 'mailto:copl-app@outlook.com', label: 'Contact' },
    ],
    switchLabel: 'SV',
    switchLang: 'sv',
    switchHref: (page) => `../${page}`,
  },
};

function buildPage({ lang, title, description, navActive, mdPath, outPath, pageFile }) {
  const L = LANGS[lang];
  const md = readFileSync(mdPath, 'utf8');
  const htmlBody = marked.parse(md);

  const navLinks = L.nav
    .map((n) => `<li><a href="${n.href}"${n.key === navActive ? ' class="active"' : ''}>${n.label}</a></li>`)
    .join('\n        ')
    + `\n        <li><a href="${L.switchHref(pageFile)}" onclick="localStorage.setItem('copl-lang','${L.switchLang}')">${L.switchLabel}</a></li>`;

  const footerLinks = L.footerLinks
    .map((n) => `<li><a href="${n.href}">${n.label}</a></li>`)
    .join('\n        ');

  const page = `<!doctype html>
<html lang="${L.htmlLang}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="theme-color" content="#061018" />
<script>
${DETECT[lang]}
</script>
<title>${title} - Copl</title>
<meta name="description" content="${description}" />
<link rel="icon" href="${L.prefix}assets/copl-logo.png" type="image/png" />
<link rel="stylesheet" href="${L.prefix}style.css" />
</head>
<body>

  <nav class="nav">
    <div class="nav-inner">
      <a href="index.html" class="nav-brand">
        <img src="${L.prefix}assets/copl-logo.png" alt="Copl" class="nav-logo" />
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
      <img src="${L.prefix}assets/copl-logo.png" alt="Copl" class="footer-logo" />
      <p class="footer-tagline">${L.footerTagline}</p>
      <ul class="footer-links">
        ${footerLinks}
      </ul>
      <div class="footer-copy">© 2026 Copl</div>
    </div>
  </footer>

  <script src="${L.prefix}reveal.js"></script>
</body>
</html>
`;

  writeFileSync(outPath, page);
  console.log(`✓ ${outPath}`);
}

mkdirSync(join(__dirname, 'en'), { recursive: true });

// Svenska
buildPage({
  lang: 'sv', title: 'Integritetspolicy', navActive: 'privacy', pageFile: 'privacy.html',
  description: 'Vad Copl gör med din data. Sammanfattning: ingenting du inte vill att vi gör.',
  mdPath: join(ROOT, 'PRIVACY.md'), outPath: join(__dirname, 'privacy.html'),
});
buildPage({
  lang: 'sv', title: 'Användarvillkor', navActive: 'privacy', pageFile: 'terms.html',
  description: 'Användarvillkor för Copl. Skrivna i klartext.',
  mdPath: join(ROOT, 'TERMS.md'), outPath: join(__dirname, 'terms.html'),
});

// Engelska
buildPage({
  lang: 'en', title: 'Privacy Policy', navActive: 'privacy', pageFile: 'privacy.html',
  description: 'What Copl does with your data. Summary: nothing you would not want us to.',
  mdPath: join(ROOT, 'PRIVACY.en.md'), outPath: join(__dirname, 'en', 'privacy.html'),
});
buildPage({
  lang: 'en', title: 'Terms of Service', navActive: 'privacy', pageFile: 'terms.html',
  description: 'Terms of Service for Copl. Written in plain language.',
  mdPath: join(ROOT, 'TERMS.en.md'), outPath: join(__dirname, 'en', 'terms.html'),
});

console.log('Klar.');
