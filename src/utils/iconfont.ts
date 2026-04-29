/**
 * IconFont 工具函数
 * 支持动态加载 iconfont JS/Symbol 或 CSS 链接
 */

/**
 * 动态加载 iconfont CSS 链接
 * @param url iconfont CSS 地址，如 //at.alicdn.com/t/c/font_xxx.css
 */
export function loadIconfontCss(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // 检查是否已加载
    const exists = document?.querySelector(`link[href="${url}"]`)
    if (exists) {
      resolve()
      return
    }

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = url.startsWith('http') ? url : `https:${url}`
    link.onload = () => resolve()
    link.onerror = () => reject(new Error('Iconfont CSS 加载失败'))
    document.head.appendChild(link)
  })
}

/**
 * 动态加载 iconfont Symbol JS
 * 适用于 Symbol 引用方式
 * @param url iconfont JS 地址
 */
export function loadIconfontSymbol(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const exists = document?.querySelector(`script[src="${url}"]`)
    if (exists) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = url.startsWith('http') ? url : `https:${url}`
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Iconfont Symbol JS 加载失败'))
    document.body.appendChild(script)
  })
}

/**
 * 获取 iconfont Symbol SVG 图标（H5 环境下使用）
 * @param iconName 图标名称（iconfont 项目中的类名，如 icon-home）
 */
export function getIconfontSvg(iconName: string): string {
  return `<svg class="iconfont" aria-hidden="true"><use xlink:href="#${iconName}"></use></svg>`
}

/**
 * 小程序环境下使用 iconfont 的建议方案：
 *
 * 方案 A（Font class，推荐）：
 * 1. 在 iconfont 项目中选择「Font class」生成代码
 * 2. 下载到本地，放入 src/styles/iconfont.css 和 static/fonts/
 * 3. 在 App.vue 中 @import './styles/iconfont.css'
 * 4. 页面中使用：<text class="iconfont icon-home"></text>
 *
 * 方案 B（Base64 内联）：
 * 1. 在 iconfont 项目中选择「Base64」选项
 * 2. 复制 CSS 代码到 src/styles/iconfont.css
 * 3. 无需额外字体文件，小程序支持度最好
 *
 * 方案 C（Unicode）：
 * 1. 使用 uni-icons 或 @iconify-json/carbon 配合 UnoCSS
 * 2. 安装 @iconify-json/xxx 包
 * 3. UnoCSS 配置 presetWeapp 的 icon 选项
 */
