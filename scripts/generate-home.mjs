import { mkdir, writeFile } from 'node:fs/promises';
import { caseArt, heroSky, heroTrace } from './art.mjs';
import { artwork, stories } from './story-content.mjs';
import { translations } from './home-content.mjs';
import { landingPages } from './landing-content.mjs';
const repo = 'https://github.com/JetSquirrel/KhonsuGraph';
const origin = new URL(process.env.SITE_URL || 'https://khonsugraph.com').origin;
if (origin && !origin.startsWith('https://')) throw new Error('SITE_URL must use HTTPS');

const pagePath = (lang) => lang === 'en' ? '/' : `/${lang}/`;
const docsPath = (lang) => lang === 'en' ? '/docs/' : `/docs/${lang}/`;
const languages = Object.entries(translations);
const ogLocale = { en: 'en_US', 'zh-CN': 'zh_CN', ja: 'ja_JP', ko: 'ko_KR', fr: 'fr_FR', de: 'de_DE', es: 'es_ES', 'pt-BR': 'pt_BR', ru: 'ru_RU' };
const languageLinks = (current) => languages.map(([lang, item]) => `<a href="${pagePath(lang)}" lang="${item.htmlLang}" hreflang="${item.htmlLang}"${lang === current ? ' aria-current="page"' : ''}>${item.label}</a>`).join('');

// Hero use-case links, in the order of `uses` in home-content.mjs. Each points to a localized docs
// section; English points to its landing page where one exists.
const useTargets = [
  { docs: 'examples#attack-chain' },
  { docs: 'examples#aws-exposure', page: '/use-cases/attack-path-analysis/' },
  { docs: 'examples#blast-radius', page: '/use-cases/sre-dependency-analysis/' },
  { docs: 'examples#offshore-network' },
  { docs: 'analysis' },
];
const useHref = (lang, target) => lang === 'en' && target.page ? target.page : `${docsPath(lang)}${target.docs}`;
const esc = (s) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
// Plain text with `code` spans, as written in landing-content.mjs.
const rich = (s) => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>');
const plain = (s) => s.replaceAll('`', '');

function languageMenu(current) {
  return `<details class="lang-select"><summary aria-label="${translations[current].langMenu}">${translations[current].label}<span aria-hidden="true">⌄</span></summary><div class="lang-list">${languageLinks(current)}</div></details>`;
}

for (const [lang, t] of languages) {
  const story = stories[lang];
  const path = pagePath(lang), docs = docsPath(lang);
  const alternates = languages.map(([code, item]) => `<link rel="alternate" hreflang="${item.htmlLang}" href="${origin}${pagePath(code)}">`).join('');
  const card = `${origin}/assets/og-card.jpg`;
  const faq = t.faq.map(([name, text]) => ({ '@type': 'Question', name, acceptedAnswer: { '@type': 'Answer', text } }));
  const graph = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'WebSite', '@id': `${origin}/#website`, url: `${origin}/`, name: 'KhonsuGraph', inLanguage: languages.map(([, item]) => item.htmlLang) },
    { '@type': 'SoftwareApplication', '@id': `${origin}/#app`, name: 'KhonsuGraph', url: `${origin}${path}`, inLanguage: t.htmlLang, description: t.description, image: card, applicationCategory: 'DeveloperApplication', applicationSubCategory: 'Graph analysis', operatingSystem: 'macOS, Windows', isAccessibleForFree: true, license: 'https://www.apache.org/licenses/LICENSE-2.0', downloadUrl: `${repo}/releases`, sameAs: [repo], softwareHelp: { '@type': 'CreativeWork', url: `${origin}${docs}` }, featureList: t.steps.map(s => s[1]), offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } },
    { '@type': 'FAQPage', '@id': `${origin}${path}#faq`, inLanguage: t.htmlLang, mainEntity: faq }] };
  const html = `<!doctype html>
<html lang="${t.htmlLang}"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${t.metaTitle}</title><meta name="description" content="${t.metaDescription}">
<meta name="theme-color" content="#141a1b"><link rel="icon" href="/assets/logo.png" type="image/png">
<link rel="preload" as="image" href="/assets/hero-traces.webp" imagesrcset="/assets/hero-traces-960.webp 960w, /assets/hero-traces.webp 1536w" imagesizes="(max-width: 1000px) 100vw, 80vw">
<link rel="stylesheet" href="/styles.css">
<meta property="og:type" content="website"><meta property="og:site_name" content="KhonsuGraph"><meta property="og:locale" content="${ogLocale[t.htmlLang]}">${languages.filter(([code]) => code !== lang).map(([, item]) => `<meta property="og:locale:alternate" content="${ogLocale[item.htmlLang]}">`).join('')}<meta property="og:title" content="KhonsuGraph — ${t.title}"><meta property="og:description" content="${t.metaDescription}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="KhonsuGraph — ${t.title}"><meta name="twitter:description" content="${t.metaDescription}">
<link rel="canonical" href="${origin}${path}"><meta property="og:url" content="${origin}${path}"><meta property="og:image" content="${card}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="${t.metaTitle}"><meta name="twitter:image" content="${card}">${alternates}<link rel="alternate" hreflang="x-default" href="${origin}/">
<script type="application/ld+json">${JSON.stringify(graph)}</script></head>
<body><a class="skip" href="#main">${t.skip}</a>
<main id="main"><div class="dark-top">${heroSky()}<header class="wrap nav"><a class="brand" href="${path}"><img src="/assets/logo.png" width="38" height="38" alt="">Khonsu<span>Graph</span></a><nav aria-label="${t.navAria}"><a class="desktop-link" href="#explore">${t.nav[0]}</a><a class="desktop-link" href="#agents">${t.nav[1]}</a><a href="${docs}">${t.nav[2]}</a>${languageMenu(lang)}<a class="nav-download" href="${repo}/releases">${t.nav[3]} <span aria-hidden="true">↗</span></a></nav></header>
<section class="wrap hero"><div class="hero-copy"><h1><span class="h1-kicker">${t.kicker}</span> ${t.heading}</h1><p class="tagline">${t.tagline}</p><p class="lead">${t.lead}</p><div class="actions"><a class="button gold" href="${repo}/releases"><span aria-hidden="true">↓</span> ${t.download}</a><a class="text-link" href="#story">${story.read} <span aria-hidden="true">↓</span></a></div><p class="fine">${t.fine} · <a href="${docs}getting-started">${t.start} →</a></p><nav class="hero-uses" aria-label="${t.usesLabel}"><span>${t.usesLabel}</span>${t.uses.map((label, i) => `<a href="${useHref(lang, useTargets[i])}">${label}</a>`).join('')}</nav></div>
<figure class="hero-art"><img class="hero-illustration" src="/assets/hero-traces.webp" srcset="/assets/hero-traces-960.webp 960w, /assets/hero-traces.webp 1536w" sizes="(max-width: 1000px) 100vw, 80vw" width="1536" height="1024" fetchpriority="high" alt="${t.heroAlt}">${heroTrace()}</figure></section>
<div class="wrap facts">${t.facts.map((s, i) => `<span><b aria-hidden="true">${['◉', '⌘', '▣', '↗'][i]}</b>${s}</span>`).join('')}</div></div>
<section class="story-section" id="story"><div class="wrap story-intro"><p class="eyebrow">${story.eyebrow}</p><h2>${story.title}</h2><p>${story.intro}</p><nav class="chapter-index" aria-label="${t.chaptersAria}">${story.labels.map((label, i) => `<a href="#chapter-${i + 1}"><span>0${i + 1}</span>${label}<span aria-hidden="true">↗</span></a>`).join('')}</nav></div>
<div class="wrap chapters">${story.chapters.map((chapter, i) => `<article class="chapter" id="chapter-${i + 1}"><figure>${artwork(i, chapter.alt)}<figcaption><span>0${i + 1} / ${story.labels[i]}</span><span>${chapter.motif}</span></figcaption></figure><div class="chapter-copy"><p class="chapter-era"><span>0${i + 1}</span>${chapter.era}</p><h3>${chapter.title}</h3>${chapter.paragraphs.map(p => `<p>${p}</p>`).join('')}<p class="chapter-insight">${chapter.insight}</p></div></article>`).join('')}</div>
<div class="story-resolution"><div class="wrap"><p class="bridge">${story.bridge}</p><h2>${story.conclusion}</h2><div class="resolution-mark" aria-hidden="true">✦</div><h3>${story.product}</h3><ul class="hunters">${story.hunters.map(([role, body]) => `<li><h4>${role}</h4><p>${body}</p></li>`).join('')}</ul><p class="resolution-signature">${t.signature}</p></div></div></section>
<section class="wrap section flow-section" id="explore"><div class="section-head"><div><p class="eyebrow">${t.flowEye}</p><h2>${t.flowTitle}</h2></div><p class="section-lead">${t.flowLead}</p></div><div class="steps">${t.steps.map(([n, title, body, link, slug]) => `<article><div class="step-top"><span>${n}</span><span aria-hidden="true">${['↳', '⌘', '⇢', '◎', '✓', '▦'][Number(n) - 1]}</span></div><h3>${title}</h3><p>${body}</p><a href="${docs}${slug}">${link} <span aria-hidden="true">↗</span></a></article>`).join('')}</div></section>
<section class="agent-section" id="agents"><div class="wrap agent-grid"><div><p class="eyebrow">${t.agentEye}</p><h2>${t.agentTitle}</h2><p>${t.agentLead}</p><ul class="agent-list">${t.agentList.map(s => `<li><span aria-hidden="true">✓</span>${s}</li>`).join('')}</ul><a class="text-link" href="${docs}cli">${t.agentLink} ↗</a></div><div class="terminal"><div class="terminal-head"><span>${t.terminal}</span><span>khonsu CLI</span></div><pre><span class="comment"># 01 — Inspect</span>
<span class="prompt">$</span> khonsu schema --db graphs/demo

<span class="comment"># 02 — Query</span>
<span class="prompt">$</span> khonsu query --db graphs/demo \\
    --cypher <span class="string">"MATCH (a)-[r:CALLS]-&gt;(b)
               RETURN a, r, b LIMIT 20"</span>

<span class="comment"># 03 — Validate & review</span>
<span class="prompt">$</span> khonsu check overview.dash --db graphs/demo
<span class="prompt">$</span> khonsu open overview.dash</pre><div class="terminal-bottom"><span class="status-dot"></span>${t.terminalNote}</div></div></div></section>
<section class="wrap section" id="use-cases"><div class="section-head"><div><p class="eyebrow">${t.casesEye}</p><h2>${t.casesTitle}</h2></div><p class="section-lead">${t.casesLead}</p></div><div class="case-grid">${t.cases.map(([tag, title, body, dir], i) => `<article class="case"><div class="case-art" aria-hidden="true">${caseArt[i]}</div><p class="eyebrow">${tag}</p><h3>${title}</h3><p>${body}</p><a href="${docs}examples#${dir}">${t.caseLink} ↗</a></article>`).join('')}</div></section>
<section class="wrap section faq-section" id="faq"><div><p class="eyebrow">${t.faqEye}</p><h2>${t.faqTitle}</h2><a class="text-link" href="${docs}queries">${t.readDocs} ↗</a></div><div class="faq-list">${t.faq.map(([q, a]) => `<details><summary>${q}<span aria-hidden="true">+</span></summary><p>${a}</p></details>`).join('')}</div></section>
<section class="closing"><div class="wrap closing-inner"><div><p class="eyebrow">KHONSUGRAPH</p><h2>${t.close}</h2><p>${t.closeSub}</p></div><div class="closing-actions"><a class="button dark-button" href="${repo}/releases">↓ ${t.download}</a><a href="${repo}">${t.source} ↗</a></div></div></section></main>
<footer class="wrap footer"><div><a class="brand" href="${path}"><img src="/assets/logo.png" width="32" height="32" alt="">Khonsu<span>Graph</span></a><p>${t.footer}</p><small>${t.built}</small></div><div class="footer-links"><a href="${docs}">${t.nav[2]}</a>${lang === 'en' ? landingPages.map(p => `<a href="/${p.slug}/">${p.crumb}</a>`).join('') : ''}<a href="${repo}">GitHub ↗</a><a href="${repo}/blob/main/LICENSE">Apache-2.0</a></div><div class="siblings"><span>${t.related}</span><a href="https://ducklocal.app">DuckLocal ↗</a><a href="https://cloudbridge.jetsquirrel.cloud">CloudBridge ↗</a></div><nav class="footer-langs" aria-label="${t.langMenu}">${languageLinks(lang)}</nav></footer></body></html>`;
  await mkdir(`home${path}`, { recursive: true });
  await writeFile(`home${path}index.html`, html);
  await writeFile(`home${path}index.md`, `# KhonsuGraph — ${t.title}\n\n${t.tagline}\n\n${t.description}\n\n## ${story.eyebrow}\n\n${story.intro}\n\n${story.chapters.map(c => `### ${c.era} — ${c.title}\n\n${c.paragraphs.join("\n\n")}\n\n${c.insight.replaceAll("<br>", " ")}`).join("\n\n")}\n\n${story.bridge.replaceAll("<br>", " ")} ${story.conclusion}\n\n${story.product}\n\n${story.hunters.map(([r, b]) => `- **${r}**: ${b}`).join('\n')}\n\n${t.signature}\n\n${t.steps.map(s => `## ${s[1]}\n\n${s[2]}\n\n[${s[3]}](${origin}${docs}${s[4]})`).join('\n\n')}\n\n${t.faq.map(([q, a]) => `## ${q}\n\n${a}`).join('\n\n')}\n\n[GitHub](${repo})\n`);
}
// Landing pages: English only, one search intent each, sharing the homepage's styles.
const en = translations.en;
for (const p of landingPages) {
  const url = `${origin}/${p.slug}/`, card = `${origin}/assets/og-card.jpg`;
  const graph = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'WebPage', '@id': `${url}#page`, url, name: p.metaTitle, description: p.metaDescription, inLanguage: 'en', image: card, isPartOf: { '@id': `${origin}/#website` }, about: { '@id': `${origin}/#app` }, breadcrumb: { '@id': `${url}#breadcrumb` } },
    { '@type': 'BreadcrumbList', '@id': `${url}#breadcrumb`, itemListElement: [{ '@type': 'ListItem', position: 1, name: 'KhonsuGraph', item: `${origin}/` }, { '@type': 'ListItem', position: 2, name: p.crumb, item: url }] },
    { '@type': 'FAQPage', '@id': `${url}#faq`, inLanguage: 'en', mainEntity: p.faq.map(([q, a]) => ({ '@type': 'Question', name: plain(q), acceptedAnswer: { '@type': 'Answer', text: plain(a) } })) }] };
  const table = p.table ? `<section class="wrap section lp-compare" id="compare"><div class="section-head"><div><p class="eyebrow">${esc(p.table.title.toUpperCase())}</p><h2>${esc(p.table.title)}</h2></div><p class="section-lead">${rich(p.table.note)}</p></div><div class="lp-table"><table><thead><tr>${p.table.head.map(h => `<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${p.table.rows.map(([k, ...v]) => `<tr><th scope="row">${esc(k)}</th>${v.map(c => `<td>${rich(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div></section>` : '';
  const commands = esc(p.commands).replace(/^(# .*)$/gm, '<span class="comment">$1</span>').replace(/^\$ /gm, '<span class="prompt">$</span> ');
  const html = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(p.metaTitle)}</title><meta name="description" content="${esc(p.metaDescription)}">
<meta name="theme-color" content="#141a1b"><link rel="icon" href="/assets/logo.png" type="image/png">
<link rel="stylesheet" href="/styles.css">
<meta property="og:type" content="website"><meta property="og:site_name" content="KhonsuGraph"><meta property="og:locale" content="en_US"><meta property="og:title" content="${esc(p.metaTitle)}"><meta property="og:description" content="${esc(p.metaDescription)}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(p.metaTitle)}"><meta name="twitter:description" content="${esc(p.metaDescription)}">
<link rel="canonical" href="${url}"><meta property="og:url" content="${url}"><meta property="og:image" content="${card}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="${esc(p.h1)}"><meta name="twitter:image" content="${card}">
<script type="application/ld+json">${JSON.stringify(graph).replaceAll('<', '\\u003c')}</script></head>
<body class="lp"><a class="skip" href="#main">${en.skip}</a>
<main id="main"><div class="dark-top">${heroSky()}<header class="wrap nav"><a class="brand" href="/"><img src="/assets/logo.png" width="38" height="38" alt="">Khonsu<span>Graph</span></a><nav aria-label="${en.navAria}"><a class="desktop-link" href="#walkthrough">Walkthrough</a><a href="/docs/">${en.nav[2]}</a><a class="nav-download" href="${repo}/releases">${en.nav[3]} <span aria-hidden="true">↗</span></a></nav></header>
<section class="wrap lp-hero"><nav class="crumbs" aria-label="Breadcrumb"><a href="/">KhonsuGraph</a><span aria-hidden="true">/</span><span aria-current="page">${esc(p.crumb)}</span></nav><p class="eyebrow">${esc(p.eyebrow)}</p><h1>${esc(p.h1)}</h1><p class="lead">${rich(p.lead)}</p><div class="actions"><a class="button gold" href="${repo}/releases"><span aria-hidden="true">↓</span> ${en.download}</a><a class="text-link" href="#walkthrough">See the walkthrough <span aria-hidden="true">↓</span></a></div><p class="fine">${en.fine} · <a href="/docs/getting-started">${en.start} →</a></p></section></div>
<section class="wrap section flow-section" id="capabilities"><div class="section-head"><div><p class="eyebrow">${esc(p.capsEye)}</p><h2>${p.capsTitle}</h2></div><p class="section-lead">${rich(p.capsLead)}</p></div><div class="steps lp-steps">${p.caps.map(([title, body, link, slug], i) => `<article><div class="step-top"><span>0${i + 1}</span></div><h3>${esc(title)}</h3><p>${rich(body)}</p><a href="/docs/${slug}">${esc(link)} <span aria-hidden="true">↗</span></a></article>`).join('')}</div></section>
${table}<section class="agent-section" id="walkthrough"><div class="wrap agent-grid"><div><p class="eyebrow">${esc(p.walkEye)}</p><h2>${p.walkTitle}</h2><p>${rich(p.walkLead)}</p><ul class="agent-list">${p.walkNotes.map(s => `<li><span aria-hidden="true">✓</span>${rich(s)}</li>`).join('')}</ul></div><div class="terminal"><div class="terminal-head"><span>${esc(p.terminal)}</span><span>khonsu CLI</span></div><pre>${commands}</pre><div class="terminal-bottom"><span class="status-dot"></span>${rich(p.terminalNote)}</div></div></div></section>
<section class="wrap section lp-limits" id="limits"><div class="section-head"><div><p class="eyebrow">BEFORE YOU RELY ON IT</p><h2>${esc(p.limitsTitle)}</h2></div></div><ul>${p.limits.map(s => `<li>${rich(s)}</li>`).join('')}</ul></section>
<section class="wrap section faq-section" id="faq"><div><p class="eyebrow">${en.faqEye}</p><h2>Questions</h2><ul class="lp-related">${p.related.map(([text, href]) => `<li><a href="${href}">${esc(text)} <span aria-hidden="true">↗</span></a></li>`).join('')}</ul></div><div class="faq-list">${p.faq.map(([q, a]) => `<details><summary>${rich(q)}<span aria-hidden="true">+</span></summary><p>${rich(a)}</p></details>`).join('')}</div></section>
<section class="closing"><div class="wrap closing-inner"><div><p class="eyebrow">KHONSUGRAPH</p><h2>${en.close}</h2><p>${en.closeSub}</p></div><div class="closing-actions"><a class="button dark-button" href="${repo}/releases">↓ ${en.download}</a><a href="${repo}">${en.source} ↗</a></div></div></section></main>
<footer class="wrap footer"><div><a class="brand" href="/"><img src="/assets/logo.png" width="32" height="32" alt="">Khonsu<span>Graph</span></a><p>${en.footer}</p><small>${en.built}</small></div><div class="footer-links"><a href="/docs/">${en.nav[2]}</a>${landingPages.map(o => `<a href="/${o.slug}/"${o === p ? ' aria-current="page"' : ''}>${esc(o.crumb)}</a>`).join('')}<a href="${repo}">GitHub ↗</a><a href="${repo}/blob/main/LICENSE">Apache-2.0</a></div><div class="siblings"><span>${en.related}</span><a href="https://ducklocal.app">DuckLocal ↗</a><a href="https://cloudbridge.jetsquirrel.cloud">CloudBridge ↗</a></div></footer></body></html>`;
  await mkdir(`home/${p.slug}`, { recursive: true });
  await writeFile(`home/${p.slug}/index.html`, html);
  await writeFile(`home/${p.slug}/index.md`, `# ${plain(p.h1)}\n\n${plain(p.lead)}\n\n${p.caps.map(([title, body, link, slug]) => `## ${title}\n\n${plain(body)}\n\n[${link}](${origin}/docs/${slug})`).join('\n\n')}\n\n${p.table ? `## ${p.table.title}\n\n| ${p.table.head.join(' | ')} |\n| ${p.table.head.map(() => '---').join(' | ')} |\n${p.table.rows.map(r => `| ${r.map(plain).join(' | ')} |`).join('\n')}\n\n${plain(p.table.note)}\n\n` : ''}## ${p.walkTitle.replaceAll('<br>', ' ')}\n\n${plain(p.walkLead)}\n\n\`\`\`sh\n${p.commands}\n\`\`\`\n\n${p.walkNotes.map(s => `- ${plain(s)}`).join('\n')}\n\n## ${p.limitsTitle}\n\n${p.limits.map(s => `- ${plain(s)}`).join('\n')}\n\n${p.faq.map(([q, a]) => `## ${plain(q)}\n\n${plain(a)}`).join('\n\n')}\n\n[Download](${repo}/releases) · [Documentation](${origin}/docs/)\n`);
}
// scripts/sitemap.mjs writes sitemap.xml after the docs build.
await writeFile('home/robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`);
await writeFile('home/llms.txt', `# KhonsuGraph\n\n> Built for Hunters. Open-source, local-first graph investigation workbench on HawDB, for macOS and Windows. Cypher and PostgreSQL SQL, a graph canvas, path exploration, record-level evidence, graph algorithms, saved investigations, data-source plugins (CSV, AWS, Neo4j) and reviewable .dash dashboards, with a JSON CLI for AI agents. Independent of HawDB. Apache-2.0.\n\n## Overview\n\n${languages.map(([lang, item]) => `- [${item.label}](${origin}${pagePath(lang)}index.md)`).join('\n')}\n- [Source](${repo})\n\n## Use cases\n\n${landingPages.map(p => `- [${p.crumb}](${origin}/${p.slug}/index.md): ${p.metaDescription}`).join('\n')}\n\n## Documentation\n\n${languages.map(([lang, item]) => `### ${item.label}\n\n- [llms-full.txt](${origin}${docsPath(lang)}llms-full.txt)\n${item.guides.map(([slug, name, about]) => `- [${name}](${origin}${docsPath(lang)}${slug}.md): ${about}`).join('\n')}`).join('\n\n')}\n`);
