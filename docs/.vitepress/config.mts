import { defineConfig } from 'vitepress'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

const repository = 'https://github.com/JetSquirrel/KhonsuGraph'
const origin = new URL(process.env.SITE_URL || 'https://khonsugraph.com').origin
const pages = [
  ['getting-started', 'Getting started', '快速开始', 'はじめに', '시작하기', 'Premiers pas', 'Erste Schritte'],
  ['data-sources', 'Data sources', '数据源', 'データソース', '데이터 소스', 'Sources de données', 'Datenquellen'],
  ['queries', 'Cypher & SQL', 'Cypher 与 SQL', 'Cypher と SQL', 'Cypher 및 SQL', 'Cypher et SQL', 'Cypher & SQL'],
  ['investigations', 'Investigations', '调查', '調査', '조사', 'Investigations', 'Untersuchungen'],
  ['analysis', 'Graph analysis', '图分析', 'グラフ分析', '그래프 분석', 'Analyse de graphe', 'Graphanalyse'],
  ['dashboards', 'Dashboards', '仪表盘', 'ダッシュボード', '대시보드', 'Tableaux de bord', 'Dashboards'],
  ['cli', 'CLI & AI agents', 'CLI 与 AI Agent', 'CLI と AI エージェント', 'CLI 및 AI 에이전트', 'CLI et agents IA', 'CLI & KI-Agenten'],
  ['plugins', 'Plugin development', '插件开发', 'プラグイン開発', '플러그인 개발', 'Développement de plugins', 'Plugin-Entwicklung'],
  ['examples', 'Examples', '示例', '例', '예제', 'Exemples', 'Beispiele'],
  ['troubleshooting', 'Troubleshooting', '常见问题', 'トラブルシューティング', '문제 해결', 'Dépannage', 'Fehlerbehebung'],
]
type LocaleCode = 'en' | 'zh' | 'ja' | 'ko' | 'fr' | 'de'
type Strings = {
  label: string; lang: string; title: string; download: string; section: string; docs: string; prev: string; next: string
  outline: string; menu: string; top: string; langMenu: string; skip: string; appearance: string; light: string; dark: string; footer: string
  ogLocale: string
  search: { button: string; details: string; reset: string; back: string; noResults: string; select: string; navigate: string; close: string }
}
const strings: Record<LocaleCode, Strings> = {
  en: {
    label: 'English', lang: 'en', title: 'KhonsuGraph Docs', download: 'Download', section: 'Using KhonsuGraph', docs: 'Docs',
    prev: 'Previous page', next: 'Next page', outline: 'On this page', menu: 'Menu', top: 'Return to top',
    langMenu: 'Change language', skip: 'Skip to content', appearance: 'Appearance', light: 'Switch to light theme', dark: 'Switch to dark theme',
    footer: 'Apache-2.0 · An independent project built on HawDB', ogLocale: 'en_US',
    search: { button: 'Search', details: 'Display detailed list', reset: 'Reset search', back: 'Close search', noResults: 'No results for', select: 'to select', navigate: 'to navigate', close: 'to close' },
  },
  zh: {
    label: '简体中文', lang: 'zh-CN', title: 'KhonsuGraph 文档', download: '下载', section: '使用 KhonsuGraph', docs: '文档',
    prev: '上一页', next: '下一页', outline: '本页目录', menu: '目录', top: '返回顶部',
    langMenu: '切换语言', skip: '跳转到正文', appearance: '外观', light: '切换为浅色主题', dark: '切换为深色主题',
    footer: 'Apache-2.0 开源 · 基于 HawDB 的独立项目', ogLocale: 'zh_CN',
    search: { button: '搜索文档', details: '显示详细列表', reset: '清除搜索', back: '关闭搜索', noResults: '未找到相关结果', select: '选择', navigate: '切换', close: '关闭' },
  },
  ja: {
    label: '日本語', lang: 'ja', title: 'KhonsuGraph ドキュメント', download: 'ダウンロード', section: 'KhonsuGraph の使い方', docs: 'ドキュメント',
    prev: '前のページ', next: '次のページ', outline: 'このページ', menu: 'メニュー', top: 'ページ上部へ',
    langMenu: '言語を切り替える', skip: '本文へスキップ', appearance: '表示', light: 'ライトテーマに切り替える', dark: 'ダークテーマに切り替える',
    footer: 'Apache-2.0 · HawDB を基盤とする独立プロジェクト', ogLocale: 'ja_JP',
    search: { button: 'ドキュメントを検索', details: '詳細を表示', reset: '検索をクリア', back: '検索を閉じる', noResults: '結果が見つかりません', select: '選択', navigate: '移動', close: '閉じる' },
  },
  ko: {
    label: '한국어', lang: 'ko', title: 'KhonsuGraph 문서', download: '다운로드', section: 'KhonsuGraph 사용하기', docs: '문서',
    prev: '이전 페이지', next: '다음 페이지', outline: '이 페이지', menu: '메뉴', top: '맨 위로',
    langMenu: '언어 변경', skip: '본문으로 건너뛰기', appearance: '모양', light: '라이트 테마로 전환', dark: '다크 테마로 전환',
    footer: 'Apache-2.0 · HawDB 위에 만들어진 독립 프로젝트', ogLocale: 'ko_KR',
    search: { button: '문서 검색', details: '상세 목록 표시', reset: '검색 지우기', back: '검색 닫기', noResults: '결과 없음', select: '선택', navigate: '이동', close: '닫기' },
  },
  fr: {
    label: 'Français', lang: 'fr', title: 'Documentation KhonsuGraph', download: 'Télécharger', section: 'Utiliser KhonsuGraph', docs: 'Documentation',
    prev: 'Page précédente', next: 'Page suivante', outline: 'Sur cette page', menu: 'Menu', top: 'Retour en haut',
    langMenu: 'Changer de langue', skip: 'Aller au contenu', appearance: 'Apparence', light: 'Passer au thème clair', dark: 'Passer au thème sombre',
    footer: 'Apache-2.0 · Un projet indépendant construit sur HawDB', ogLocale: 'fr_FR',
    search: { button: 'Rechercher dans la documentation', details: 'Afficher les détails', reset: 'Effacer la recherche', back: 'Fermer la recherche', noResults: 'Aucun résultat pour', select: 'sélectionner', navigate: 'naviguer', close: 'fermer' },
  },
  de: {
    label: 'Deutsch', lang: 'de', title: 'KhonsuGraph Dokumentation', download: 'Download', section: 'KhonsuGraph verwenden', docs: 'Dokumentation',
    prev: 'Vorherige Seite', next: 'Nächste Seite', outline: 'Auf dieser Seite', menu: 'Menü', top: 'Nach oben',
    langMenu: 'Sprache ändern', skip: 'Zum Inhalt springen', appearance: 'Darstellung', light: 'Zum hellen Design wechseln', dark: 'Zum dunklen Design wechseln',
    footer: 'Apache-2.0 · Ein unabhängiges Projekt auf Basis von HawDB', ogLocale: 'de_DE',
    search: { button: 'Dokumentation durchsuchen', details: 'Details anzeigen', reset: 'Suche zurücksetzen', back: 'Suche schließen', noResults: 'Keine Ergebnisse für', select: 'auswählen', navigate: 'navigieren', close: 'schließen' },
  },
}
const localeCodes = Object.keys(strings) as LocaleCode[]
const pageTitle = (slug: string, code: LocaleCode) => {
  const row = pages.find(page => page[0] === slug)
  if (!row) return slug
  return row[localeCodes.indexOf(code) + 1]
}

function locale(code: LocaleCode) {
  const s = strings[code]
  const zh = code !== 'en'
  const prefix = zh ? `/${code}/` : '/'
  return {
    label: s.label, lang: s.lang, title: s.title,
    themeConfig: {
      nav: [{ text: s.download, link: `${repository}/releases` }],
      sidebar: [{ text: s.section, items: pages.map(([slug]) => ({ text: pageTitle(slug, code), link: `${prefix}${slug}` })) }],
      docFooter: { prev: s.prev, next: s.next },
      outline: { label: s.outline, level: [2,3] as [number,number] },
      sidebarMenuLabel: s.menu, returnToTopLabel: s.top,
      langMenuLabel: s.langMenu,
      skipToContentLabel: s.skip,
      darkModeSwitchLabel: s.appearance,
      lightModeSwitchTitle: s.light,
      darkModeSwitchTitle: s.dark,
      footer: { message: s.footer },
    }
  }
}

const search = Object.fromEntries(localeCodes.filter(code => code !== 'en').map(code => [code, { translations: {
  button: { buttonText: strings[code].search.button, buttonAriaLabel: strings[code].search.button },
  modal: {
    displayDetails: strings[code].search.details, resetButtonTitle: strings[code].search.reset, backButtonTitle: strings[code].search.back,
    noResultsText: strings[code].search.noResults,
    footer: { selectText: strings[code].search.select, navigateText: strings[code].search.navigate, closeText: strings[code].search.close }
  }
}}]))

export default defineConfig({
  title: 'KhonsuGraph Docs', description: 'Guides for KhonsuGraph, the open-source, local-first graph investigation workbench: Cypher and SQL queries, path exploration, evidence, graph analysis and dashboards.',
  base: '/docs/', outDir: '../dist/site/docs', cleanUrls: true, ignoreDeadLinks: false,
  head: [
    ['link', {rel:'icon', href:'/assets/logo.png'}],
    ['meta', {name:'theme-color', content:'#141a1b'}],
    ['meta', {property:'og:site_name', content:'KhonsuGraph'}],
    ['meta', {property:'og:type', content:'article'}],
    ['meta', {name:'twitter:card', content:'summary_large_image'}],
  ],
  locales: Object.fromEntries(localeCodes.map(code => [code === 'en' ? 'root' : code, locale(code)])),
  themeConfig: {
    logo: {src:'/logo.png',alt:'KhonsuGraph'},
    socialLinks: [{icon:'github',link:repository}],
    search: {provider:'local', options:{locales: search}},
  },
  transformHead({ pageData, title, description }) {
    if (pageData.isNotFound) return []
    const path = pageData.relativePath.replace(/index\.md$/, '').replace(/\.md$/, '')
    const code = (localeCodes.find(code => code !== 'en' && path.startsWith(`${code}/`)) ?? 'en') as LocaleCode
    const entry = path.replace(/^(zh|ja|ko|fr|de)\//,'')
    const prefix = code === 'en' ? '' : `${code}/`
    const url = `${origin}/docs/${path}`, card = `${origin}/assets/og-card.jpg`, s = strings[code]
    const home = `${origin}/${prefix}`
    const docsHome = `${origin}/docs/${prefix}`
    const href = (target: LocaleCode) => `${origin}/docs/${target === 'en' ? '' : `${target}/`}${entry}`
    const crumbs = [['KhonsuGraph', home], [s.docs, docsHome], ...(entry ? [[pageData.title, url]] : [])]
    const structured = {'@context':'https://schema.org','@graph':[
      {'@type':'TechArticle', headline: pageData.title, description, url, inLanguage: s.lang, image: card,
        isPartOf: {'@type':'WebSite','@id':`${origin}/#website`}, about: {'@type':'SoftwareApplication','@id':`${origin}/#app`, name:'KhonsuGraph'}},
      {'@type':'BreadcrumbList', itemListElement: crumbs.map(([name,item],i) => ({'@type':'ListItem', position: i+1, name, item}))},
    ]}
    const head: [string, Record<string, string>][] = [
      ['link', {rel:'canonical',href:url}],
      ...localeCodes.map((target): [string, Record<string, string>] => ['link', {rel:'alternate',hreflang:strings[target].lang,href:href(target)}]),
      ['link', {rel:'alternate',hreflang:'x-default',href:href('en')}],
      ['meta', {property:'og:url',content:url}],
      ['meta', {property:'og:locale',content:s.ogLocale}],
      ...localeCodes.filter(target => target !== code).map((target): [string, Record<string, string>] => ['meta', {property:'og:locale:alternate',content:strings[target].ogLocale}]),
      ['meta', {property:'og:title',content:title}],
      ['meta', {property:'og:description',content:description}],
      ['meta', {property:'og:image',content:card}],
      ['meta', {name:'twitter:title',content:title}],
      ['meta', {name:'twitter:description',content:description}],
      ['meta', {name:'twitter:image',content:card}],
      ['script', {type:'application/ld+json'}, JSON.stringify(structured)],
    ]
    return head
  },
  async buildEnd(config) {
    const full = Object.fromEntries(localeCodes.map(code => [code, [] as string[]]))
    for (const page of config.pages) {
      const markdown = (await readFile(resolve(config.srcDir,page),'utf8')).replace(/^---\n[\s\S]*?\n---\n/,'')
      const target = resolve(config.outDir,page)
      await mkdir(dirname(target),{recursive:true})
      await writeFile(target,markdown)
      const folder = page.split('/')[0] as LocaleCode
      full[folder in full ? folder : 'en'].push(markdown)
    }
    for (const code of localeCodes) {
      const target = resolve(config.outDir, code === 'en' ? 'llms-full.txt' : `${code}/llms-full.txt`)
      await mkdir(dirname(target),{recursive:true})
      await writeFile(target, full[code].join('\n\n---\n\n'))
    }
  }
})
