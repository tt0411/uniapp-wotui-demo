/**
 * 构建配置脚本
 *
 * 功能：
 * 1. 根据环境变量动态更新 manifest.json 中的微信 appId
 * 2. 在控制台输出当前环境信息
 *
 * 使用方式：
 *   node scripts/build-config.js              # 默认 development 环境
 *   node scripts/build-config.js test         # 测试环境
 *   node scripts/build-config.js production   # 生产环境
 */

const fs = require("fs");
const path = require("path");

// ========== 环境配置映射 ==========
const CONFIG_MAP = {
  // 开发环境
  development: {
    appId: "xxx",
    baseURL: "https://api-dev.example.com",
    projectName: "小程序-开发版",
    env: "development",
    envName: "开发环境",
    publicKey: "xxx",
    baiduMapKey: "xxx",
    amapKey: "xxx",
    tencentMapKey: "YOUR_TENCENT_MAP_KEY_DEV",
  },
  // 测试环境
  test: {
    appId: "xxx",
    baseURL: "https://api-test.example.com",
    projectName: "小程序-测试版",
    env: "test",
    envName: "测试环境",
    publicKey: "test123",
    baiduMapKey: "YOUR_BAIDU_MAP_KEY_TEST",
    amapKey: "YOUR_AMAP_KEY_TEST",
    tencentMapKey: "YOUR_TENCENT_MAP_KEY_TEST",
  },
  // 生产环境
  production: {
    appId: "xxx",
    baseURL: "https://api.example.com",
    projectName: "小程序-正式版",
    env: "production",
    envName: "生产环境",
    publicKey: "prod123",
    baiduMapKey: "YOUR_BAIDU_MAP_KEY_PROD",
    amapKey: "YOUR_AMAP_KEY_PROD",
    tencentMapKey: "YOUR_TENCENT_MAP_KEY_PROD",
  },
};

// 从命令行参数获取环境，默认 development
const ENV = process.argv[2] || "development";
const config = CONFIG_MAP[ENV];

if (!config) {
  console.error(
    `❗ 找不到环境 "${ENV}" 的配置，可选值：${Object.keys(CONFIG_MAP).join(", ")}`,
  );
  process.exit(1);
}

// ========== 1. 更新 manifest.json 中的 appid ==========
const manifestPath = path.resolve(__dirname, "../src/manifest.json");
if (fs.existsSync(manifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));

  // 更新微信小程序 appId
  if (manifest["mp-weixin"]) {
    manifest["mp-weixin"].appid = config.appId;
  }

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`✅ 已更新 manifest.json 微信 appId: ${config.appId}`);
}

// ========== 2. 生成 src/config/env.ts ==========
const envContent = `/**
 * 环境配置模块 (由 scripts/build-config.js 自动生成)
 */

export const envConfig = {
  env: "${config.env}",
  baseUrl: "${config.baseURL}",
  appId: "${config.appId}",
  projectName: "${config.projectName}",
  appTitle: "UniApp 小程序",
  publicKey: "${config.publicKey}",
  isDev: ${config.env === "development"},
  isTest: ${config.env === "test"},
  isProd: ${config.env === "production"},
  // 地图配置
  baiduMapKey: "${config.baiduMapKey}",
  amapKey: "${config.amapKey}",
  tencentMapKey: "${config.tencentMapKey}",
} as const;

export type EnvConfig = typeof envConfig;
`;

const envConfigPath = path.resolve(__dirname, "../src/config/env.ts");
fs.writeFileSync(envConfigPath, envContent);
console.log(`✅ 已生成环境配置文件: ${envConfigPath}`);

// ========== 3. 输出环境摘要 ==========
console.log("");
console.log("╔══════════════════════════════════════════════╗");
console.log(`║  📦 构建环境: ${config.envName.padEnd(27)}║`);
console.log(`║  🏷️  项目名称: ${config.projectName.padEnd(25)}║`);
console.log(`║  🆔 AppID:    ${config.appId.padEnd(31)}║`);
console.log(`║  🌐 接口地址: ${config.baseURL.padEnd(31)}║`);
console.log("╚══════════════════════════════════════════════╝");
console.log("");
