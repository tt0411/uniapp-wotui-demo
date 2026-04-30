/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface ImportMetaEnv {
  /** 应用标题 */
  readonly VITE_APP_TITLE: string
  /** 当前环境标识 */
  readonly VITE_APP_ENV: string
  /** 接口基础地址 */
  readonly VITE_APP_BASE_URL: string
  /** 微信小程序 AppID */
  readonly VITE_APP_APPID: string
  /** 项目名称 */
  readonly VITE_APP_PROJECT_NAME: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
