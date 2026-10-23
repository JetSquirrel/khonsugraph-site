import { defineConfig } from 'vitepress'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

const repository = 'https://github.com/JetSquirrel/KhonsuGraph'
const origin = process.env.SITE_URL ? new URL(process.env.SITE_URL).origin : ''
const pages = [
  ['getting-started', 'Getting started', '快速开始'],
  ['data-sources', 'Data sources', '数据源'],
  ['queries', 'Cypher & SQL', 'Cypher 与 SQL'],
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
  title: 'KhonsuGraph Docs', description: 'Guides for the local-first graph workbench.',
  base: '/docs/', outDir: '../dist/site/docs', cleanUrls: true, ignoreDeadLinks: false,
  head: [['link', {rel:'icon', href:'/assets/logo.png'}]],
  sitemap: origin ? { hostname: `${origin}/docs/` } : undefined,
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
    const en = path.replace(/^zh\//,'')
    return [
      ['link', {rel:'canonical',href:`${origin}/docs/${path}`}],
      ['link', {rel:'alternate',hreflang:'en',href:`${origin}/docs/${en}`}],
      ['link', {rel:'alternate',hreflang:'zh-CN',href:`${origin}/docs/zh/${en}`}],
      ['meta', {property:'og:title',content:title}],
      ['meta', {property:'og:description',content:description}],
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
