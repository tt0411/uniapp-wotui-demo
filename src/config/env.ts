/**
 * 环境配置模块 (由 scripts/build-config.js 自动生成)
 */

export const envConfig = {
  env: "development",
  baseUrl: "https://api-dev.example.com",
  appId: "xxxx-appid",
  projectName: "小程序-开发版",
  appTitle: "UniApp 小程序",
  publicKey: "xxx",
  isDev: true,
  isTest: false,
  isProd: false,
  // 地图配置
  baiduMapKey: "xxx",
  amapKey: "xxx",
  tencentMapKey: "YOUR_TENCENT_MAP_KEY_DEV",
} as const;

export type EnvConfig = typeof envConfig;
