import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import { useData } from 'vitepress'
import './custom.css'
export default {
  extends: DefaultTheme,
  Layout() {
    const { lang } = useData()
    return h(DefaultTheme.Layout, null, {
      'nav-bar-content-before': () => h('a', {
        href: lang.value === 'zh-CN' ? '/zh/' : '/',
        target: '_self',
        class: 'product-home-link'
      }, lang.value === 'zh-CN' ? '官网' : 'Home')
    })
  }
}
