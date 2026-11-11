import { defineConfig } from 'vitepress'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

const repository = 'https://github.com/JetSquirrel/KhonsuGraph'
const origin = new URL(process.env.SITE_URL || 'https://khonsugraph.com').origin
const pages = [
  ['getting-started', 'Getting started', '快速开始'],
  ['data-sources', 'Data sources', '数据源'],
  ['queries', 'Cypher & SQL', 'Cypher 与 SQL'],
  ['investigations', 'Investigations', '调查'],
  ['analysis', 'Graph analysis', '图分析'],
  ['dashboards', 'Dashboards', '仪表盘'],
  ['cli', 'CLI & AI agents', 'CLI 与 AI Agent'],
  ['plugins', 'Plugin development', '插件开发'],
  ['examples', 'Examples', '示例'],
  ['troubleshooting', 'Troubleshooting', '常见问题'],
]
function locale(zh = false) {
  return {
    label: zh ? '简体中文' : 'English', lang: zh ? 'zh-CN' : 'en',
    title: zh ? 'KhonsuGraph 文档' : 'KhonsuGraph Docs',
    themeConfig: {
      nav: [{ text: zh ? '下载' : 'Download', link: `${repository}/releases` }],
      sidebar: [{ text: zh ? '使用 KhonsuGraph' : 'Using KhonsuGraph', items: pages.map(([slug,en,cn]) => ({text: zh ? cn : en, link: `${zh ? '/zh/' : '/'}${slug}`})) }],
      docFooter: { prev: zh ? '上一页' : 'Previous page', next: zh ? '下一页' : 'Next page' },
      outline: { label: zh ? '本页目录' : 'On this page', level: [2,3] as [number,number] },
      sidebarMenuLabel: zh ? '目录' : 'Menu', returnToTopLabel: zh ? '返回顶部' : 'Return to top',
      langMenuLabel: zh ? '切换语言' : 'Change language',
      skipToContentLabel: zh ? '跳转到正文' : 'Skip to content',
      darkModeSwitchLabel: zh ? '外观' : 'Appearance',
      lightModeSwitchTitle: zh ? '切换为浅色主题' : 'Switch to light theme',
      darkModeSwitchTitle: zh ? '切换为深色主题' : 'Switch to dark theme',
      footer: { message: zh ? 'Apache-2.0 开源 · 基于 HawDB 的独立项目' : 'Apache-2.0 · An independent project built on HawDB' },
    }
  }
}
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
  locales: { root: locale(), zh: locale(true) },
  themeConfig: {
    logo: {src:'/logo.png',alt:'KhonsuGraph'},
    socialLinks: [{icon:'github',link:repository}],
    search: {provider:'local', options:{locales:{zh:{translations:{
      button:{buttonText:'搜索文档',buttonAriaLabel:'搜索文档'},
      modal:{displayDetails:'显示详细列表',resetButtonTitle:'清除搜索',backButtonTitle:'关闭搜索',noResultsText:'未找到相关结果',footer:{selectText:'选择',navigateText:'切换',closeText:'关闭'}}
    }}}}},
  },
  transformHead({ pageData, title, description }) {
    if (!origin || pageData.isNotFound) return []
    const path = pageData.relativePath.replace(/index\.md$/, '').replace(/\.md$/, '')
    const en = path.replace(/^zh\//,''), zh = path.startsWith('zh/')
    const url = `${origin}/docs/${path}`, card = `${origin}/assets/og-card.jpg`
    const home = `${origin}/docs/${zh ? 'zh/' : ''}`
    const crumbs = [['KhonsuGraph', `${origin}/${zh ? 'zh/' : ''}`], [zh ? '文档' : 'Docs', home], ...(en ? [[pageData.title, url]] : [])]
    const structured = {'@context':'https://schema.org','@graph':[
      {'@type':'TechArticle', headline: pageData.title, description, url, inLanguage: zh ? 'zh-CN' : 'en', image: card,
        isPartOf: {'@type':'WebSite','@id':`${origin}/#website`}, about: {'@type':'SoftwareApplication','@id':`${origin}/#app`, name:'KhonsuGraph'}},
      {'@type':'BreadcrumbList', itemListElement: crumbs.map(([name,item],i) => ({'@type':'ListItem', position: i+1, name, item}))},
    ]}
    return [
      ['link', {rel:'canonical',href:url}],
      ['link', {rel:'alternate',hreflang:'en',href:`${origin}/docs/${en}`}],
      ['link', {rel:'alternate',hreflang:'zh-CN',href:`${origin}/docs/zh/${en}`}],
      ['link', {rel:'alternate',hreflang:'x-default',href:`${origin}/docs/${en}`}],
      ['meta', {property:'og:url',content:url}],
      ['meta', {property:'og:locale',content:zh ? 'zh_CN' : 'en_US'}],
      ['meta', {property:'og:title',content:title}],
      ['meta', {property:'og:description',content:description}],
      ['meta', {property:'og:image',content:card}],
      ['meta', {name:'twitter:title',content:title}],
      ['meta', {name:'twitter:description',content:description}],
      ['meta', {name:'twitter:image',content:card}],
      ['script', {type:'application/ld+json'}, JSON.stringify(structured)],
    ]
  },
  async buildEnd(config) {
    const full = {en:[] as string[],zh:[] as string[]}
    for (const page of config.pages) {
      const markdown = (await readFile(resolve(config.srcDir,page),'utf8')).replace(/^---\n[\s\S]*?\n---\n/,'')
      const target = resolve(config.outDir,page)
      await mkdir(dirname(target),{recursive:true})
      await writeFile(target,markdown)
      full[page.startsWith('zh/')?'zh':'en'].push(markdown)
    }
    await writeFile(resolve(config.outDir,'llms-full.txt'),full.en.join('\n\n---\n\n'))
    await writeFile(resolve(config.outDir,'zh/llms-full.txt'),full.zh.join('\n\n---\n\n'))
  }
})
