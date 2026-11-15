import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import { useData } from 'vitepress'
import './custom.css'
const home: Record<string, string> = { 'zh-CN': '/zh/', ja: '/ja/', ko: '/ko/', fr: '/fr/', de: '/de/' }
const label: Record<string, string> = { 'zh-CN': '首页', ja: 'ホーム', ko: '홈', fr: 'Accueil', de: 'Startseite' }
export default {
  extends: DefaultTheme,
  Layout() {
    const { lang } = useData()
    return h(DefaultTheme.Layout, null, {
      'nav-bar-content-before': () => h('a', {
        href: home[lang.value] ?? '/',
        target: '_self',
        class: 'product-home-link'
      }, label[lang.value] ?? 'Home')
    })
  }
}
