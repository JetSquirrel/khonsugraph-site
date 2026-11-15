import { mkdir, writeFile, rm } from 'node:fs/promises';
import { caseArt, heroSky, heroTrace } from './art.mjs';
import { artwork, stories } from './story-content.mjs';
import { translations } from './home-content.mjs';
const repo = 'https://github.com/JetSquirrel/KhonsuGraph';
const origin = process.env.SITE_URL ? new URL(process.env.SITE_URL).origin : '';
if (origin && !origin.startsWith('https://')) throw new Error('SITE_URL must use HTTPS');

const pagePath = (lang) => lang === 'en' ? '/' : `/${lang}/`;
const docsPath = (lang) => lang === 'en' ? '/docs/' : `/docs/${lang}/`;
const languages = Object.entries(translations);
const discovery = {
  en: ['English overview', 'Documentation'], zh: ['中文介绍', '中文文档'], ja: ['日本語の概要', '日本語ドキュメント'],
  ko: ['한국어 개요', '한국어 문서'], fr: ['Présentation en français', 'Documentation française'], de: ['Deutsche Übersicht', 'Deutsche Dokumentation']
};
const ogLocale = { en: 'en_US', 'zh-CN': 'zh_CN', ja: 'ja_JP', ko: 'ko_KR', fr: 'fr_FR', de: 'de_DE' };

const languageLinks = (current) => languages.map(([lang, item]) => `<a href="${pagePath(lang)}" lang="${item.htmlLang}" hreflang="${item.htmlLang}"${lang === current ? ' aria-current="page"' : ''}>${item.label}</a>`).join('');

function languageMenu(current) {
  return `<details class="lang-select"><summary aria-label="${translations[current].langMenu}">${translations[current].label}<span aria-hidden="true">⌄</span></summary><div class="lang-list">${languageLinks(current)}</div></details>`;
}

for (const [lang, t] of languages) {
  const story = stories[lang];
  const path = pagePath(lang), docs = docsPath(lang);
  const alternates = languages.map(([code, item]) => `<link rel="alternate" hreflang="${item.htmlLang}" href="${origin}${pagePath(code)}">`).join('');
  const faq = t.faq.map(([name, text]) => ({ '@type': 'Question', name, acceptedAnswer: { '@type': 'Answer', text } }));
  const graph = { '@context': 'https://schema.org', '@graph': [{ '@type': 'SoftwareApplication', name: 'KhonsuGraph', description: t.description, applicationCategory: 'DeveloperApplication', operatingSystem: 'macOS, Windows', license: 'https://www.apache.org/licenses/LICENSE-2.0', downloadUrl: `${repo}/releases`, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } }, { '@type': 'FAQPage', mainEntity: faq }] };
  const html = `<!doctype html>
<html lang="${t.htmlLang}"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>KhonsuGraph — ${t.title}</title><meta name="description" content="${t.description}">
<meta name="theme-color" content="#141a1b"><link rel="icon" href="/assets/logo.png" type="image/png">
<link rel="preload" as="image" href="/assets/hero-traces.webp" imagesrcset="/assets/hero-traces-960.webp 960w, /assets/hero-traces.webp 1536w" imagesizes="(max-width: 1000px) 100vw, 80vw">
<link rel="stylesheet" href="/styles.css">
<meta property="og:type" content="website"><meta property="og:site_name" content="KhonsuGraph"><meta property="og:locale" content="${ogLocale[t.htmlLang]}">${languages.filter(([code]) => code !== lang).map(([, item]) => `<meta property="og:locale:alternate" content="${ogLocale[item.htmlLang]}">`).join('')}<meta property="og:title" content="KhonsuGraph — ${t.title}"><meta property="og:description" content="${t.description}"><meta name="twitter:card" content="summary">
${origin ? `<link rel="canonical" href="${origin}${path}"><meta property="og:url" content="${origin}${path}"><meta property="og:image" content="${origin}/assets/logo.png">${alternates}<link rel="alternate" hreflang="x-default" href="${origin}/">` : ''}
<script type="application/ld+json">${JSON.stringify(graph)}</script></head>
<body><a class="skip" href="#main">${t.skip}</a>
<main id="main"><div class="dark-top">${heroSky()}<header class="wrap nav"><a class="brand" href="${path}"><img src="/assets/logo.png" width="38" height="38" alt="">Khonsu<span>Graph</span></a><nav aria-label="${t.navAria}"><a class="desktop-link" href="#explore">${t.nav[0]}</a><a class="desktop-link" href="#agents">${t.nav[1]}</a><a href="${docs}">${t.nav[2]}</a>${languageMenu(lang)}<a class="nav-download" href="${repo}/releases">${t.nav[3]} <span aria-hidden="true">↗</span></a></nav></header>
<section class="wrap hero"><div class="hero-copy"><h1>${t.heading}</h1><p class="tagline">${t.tagline}</p><p class="lead">${t.lead}</p><div class="actions"><a class="button gold" href="${repo}/releases"><span aria-hidden="true">↓</span> ${t.download}</a><a class="text-link" href="#story">${story.read} <span aria-hidden="true">↓</span></a></div><p class="fine">${t.fine}</p></div>
<figure class="hero-art"><img class="hero-illustration" src="/assets/hero-traces.webp" srcset="/assets/hero-traces-960.webp 960w, /assets/hero-traces.webp 1536w" sizes="(max-width: 1000px) 100vw, 80vw" width="1536" height="1024" fetchpriority="high" alt="${t.heroAlt}">${heroTrace()}</figure></section>
<div class="wrap facts">${t.facts.map((s, i) => `<span><b aria-hidden="true">${['◉', '⌘', '▣', '↗'][i]}</b>${s}</span>`).join('')}</div></div>
<section class="story-section" id="story"><div class="wrap story-intro"><p class="eyebrow">${story.eyebrow}</p><h2>${story.title}</h2><p>${story.intro}</p><nav class="chapter-index" aria-label="${t.chaptersAria}">${story.labels.map((label, i) => `<a href="#chapter-${i + 1}"><span>0${i + 1}</span>${label}<span aria-hidden="true">↗</span></a>`).join('')}</nav></div>
<div class="wrap chapters">${story.chapters.map((chapter, i) => `<article class="chapter" id="chapter-${i + 1}"><figure>${artwork(i, chapter.alt)}<figcaption><span>0${i + 1} / ${story.labels[i]}</span><span>${chapter.motif}</span></figcaption></figure><div class="chapter-copy"><p class="chapter-era"><span>0${i + 1}</span>${chapter.era}</p><h3>${chapter.title}</h3>${chapter.paragraphs.map(p => `<p>${p}</p>`).join('')}<p class="chapter-insight">${chapter.insight}</p></div></article>`).join('')}</div>
<div class="story-resolution"><div class="wrap"><p class="bridge">${story.bridge}</p><h2>${story.conclusion}</h2><div class="resolution-mark" aria-hidden="true">✦</div><h3>${story.product}</h3><ul class="hunters">${story.hunters.map(([role, body]) => `<li><h4>${role}</h4><p>${body}</p></li>`).join('')}</ul><p class="resolution-signature">${t.signature}</p></div></div></section>
<section class="wrap section flow-section" id="explore"><div class="section-head"><div><p class="eyebrow">${t.flowEye}</p><h2>${t.flowTitle}</h2></div><p class="section-lead">${t.flowLead}</p></div><div class="steps">${t.steps.map(([n, title, body, link, slug]) => `<article><div class="step-top"><span>${n}</span><span aria-hidden="true">${['↳', '⌘', '▦'][Number(n) - 1]}</span></div><h3>${title}</h3><p>${body}</p><a href="${docs}${slug}">${link} <span aria-hidden="true">↗</span></a></article>`).join('')}</div></section>
<section class="agent-section" id="agents"><div class="wrap agent-grid"><div><p class="eyebrow">${t.agentEye}</p><h2>${t.agentTitle}</h2><p>${t.agentLead}</p><ul class="agent-list">${t.agentList.map(s => `<li><span aria-hidden="true">✓</span>${s}</li>`).join('')}</ul><a class="text-link" href="${docs}cli">${t.agentLink} ↗</a></div><div class="terminal"><div class="terminal-head"><span>${t.terminal}</span><span>khonsu CLI</span></div><pre><span class="comment"># 01 — Inspect</span>
<span class="prompt">$</span> khonsu schema --db graphs/demo

<span class="comment"># 02 — Query</span>
<span class="prompt">$</span> khonsu query --db graphs/demo \\
    --cypher <span class="string">"MATCH (a)-[r:CALLS]-&gt;(b)
               RETURN a, r, b LIMIT 20"</span>

<span class="comment"># 03 — Validate & review</span>
<span class="prompt">$</span> khonsu check overview.dash --db graphs/demo
<span class="prompt">$</span> khonsu open overview.dash</pre><div class="terminal-bottom"><span class="status-dot"></span>${t.terminalNote}</div></div></div></section>
<section class="wrap section" id="use-cases"><div class="section-head"><div><p class="eyebrow">${t.casesEye}</p><h2>${t.casesTitle}</h2></div><p class="section-lead">${t.casesLead}</p></div><div class="case-grid">${t.cases.map(([tag, title, body, dir], i) => `<article class="case"><div class="case-art" aria-hidden="true">${caseArt[i]}</div><p class="eyebrow">${tag}</p><h3>${title}</h3><p>${body}</p><a href="${repo}/tree/main/examples/${dir}">${t.caseLink} ↗</a></article>`).join('')}</div></section>
<section class="wrap section faq-section" id="faq"><div><p class="eyebrow">${t.faqEye}</p><h2>${t.faqTitle}</h2><a class="text-link" href="${docs}queries">${t.readDocs} ↗</a></div><div class="faq-list">${t.faq.map(([q, a]) => `<details><summary>${q}<span aria-hidden="true">+</span></summary><p>${a}</p></details>`).join('')}</div></section>
<section class="closing"><div class="wrap closing-inner"><div><p class="eyebrow">KHONSUGRAPH</p><h2>${t.close}</h2><p>${t.closeSub}</p></div><div class="closing-actions"><a class="button dark-button" href="${repo}/releases">↓ ${t.download}</a><a href="${repo}">${t.source} ↗</a></div></div></section></main>
<footer class="wrap footer"><div><a class="brand" href="${path}"><img src="/assets/logo.png" width="32" height="32" alt="">Khonsu<span>Graph</span></a><p>${t.footer}</p><small>${t.built}</small></div><div class="footer-links"><a href="${docs}">${t.nav[2]}</a><a href="${repo}">GitHub ↗</a><a href="${repo}/blob/main/LICENSE">Apache-2.0</a></div><div class="siblings"><span>${t.related}</span><a href="https://ducklocal.app">DuckLocal ↗</a><a href="https://cloudbridge.jetsquirrel.cloud">CloudBridge ↗</a></div><nav class="footer-langs" aria-label="${t.langMenu}">${languageLinks(lang)}</nav></footer></body></html>`;
  await mkdir(`home${path}`, { recursive: true });
  await writeFile(`home${path}index.html`, html);
  await writeFile(`home${path}index.md`, `# KhonsuGraph — ${t.title}\n\n${t.tagline}\n\n${t.description}\n\n## ${story.eyebrow}\n\n${story.intro}\n\n${story.chapters.map(c => `### ${c.era} — ${c.title}\n\n${c.paragraphs.join("\n\n")}\n\n${c.insight.replaceAll("<br>", " ")}`).join("\n\n")}\n\n${story.bridge.replaceAll("<br>", " ")} ${story.conclusion}\n\n${story.product}\n\n${story.hunters.map(([r, b]) => `- **${r}**: ${b}`).join('\n')}\n\n${t.signature}\n\n${t.steps.map(s => `## ${s[1]}\n\n${s[2]}\n\n[${s[3]}](${origin}${docs}${s[4]})`).join('\n\n')}\n\n${t.faq.map(([q, a]) => `## ${q}\n\n${a}`).join('\n\n')}\n\n[GitHub](${repo})\n`);
}
await writeFile('home/robots.txt', `User-agent: *\nAllow: /\n${origin ? `Sitemap: ${origin}/sitemap.xml\nSitemap: ${origin}/docs/sitemap.xml\n` : ''}`);
await writeFile('home/llms.txt', `# KhonsuGraph\n\n> Built for Hunters. Open-source, local-first graph investigation workbench on HawDB. Cypher, SQL, a graph canvas, data-source plugins and reviewable .dash dashboards. Independent of HawDB. Apache-2.0.\n\n${languages.map(([lang]) => `- [${discovery[lang][0]}](${origin}${pagePath(lang)}index.md)`).join('\n')}\n${languages.map(([lang]) => `- [${discovery[lang][1]}](${origin}${docsPath(lang)}llms-full.txt)`).join('\n')}\n- [Source](${repo})\n`);
if (origin) await writeFile('home/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${languages.map(([lang]) => `<url><loc>${origin}${pagePath(lang)}</loc>${languages.map(([code, item]) => `<xhtml:link rel="alternate" hreflang="${item.htmlLang}" href="${origin}${pagePath(code)}"/>`).join('')}<xhtml:link rel="alternate" hreflang="x-default" href="${origin}/"/></url>`).join('')}</urlset>`);
else await rm('home/sitemap.xml', { force: true });
