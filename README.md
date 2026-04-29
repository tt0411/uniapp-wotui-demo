# UniApp + Wot UI + UnoCSS 小程序模板

这是一个基于 UniApp Vue3 的微信小程序模板，内置 Wot UI、UnoCSS、Pinia、自定义 TabBar、环境配置脚本，以及支付、订阅消息、定位、请求等常用业务封装。适合用作小程序项目的起始工程或功能验证项目。

## 功能概览

- UniApp Vue3 + Vite 微信小程序开发环境
- Wot UI 组件自动导入，深度适配 v2 版本
- Zod 声明式表单验证与 Wot UI 表单组件深度集成
- UnoCSS 小程序预设和常用快捷类
- Pinia 状态管理与持久化配置
- 动态主题系统：支持深色模式、多品牌颜色、语义化变量 tokens 管理
- 普通用户 / 管理员两种角色 TabBar 演示
- 自定义 TabBar，支持常规模式和悬浮模式切换
- 商城、订单、支付、订阅消息、定位（支持多厂商切换）示例分包
- 复杂表单示例：包含扫码、级联地区、日期/时间、多选、图片上传等全场景覆盖
- 业务组件封装：
  - **SmartUpload**: 支持水印（可配置文字、颜色、不透明度）、图片压缩、视频压缩、上传队列、成功标识
  - **ScanInput**: 支持扫码录入、位数统计、手动输入切换
  - **LoadList**: 通用列表组件，支持接口请求、传参、下拉刷新、上拉加载和多标签切换
- 工具封装：请求拦截器、RSA 加密、消息提示、微信支付、定位（百度/高德/腾讯）、日志、环境动态配置脚本

## 快速开始

```bash
# 安装依赖
npm install

# 开发环境运行微信小程序
npm run dev:mp-weixin

# 测试环境运行微信小程序
npm run dev:mp-weixin:test

# 生产环境运行微信小程序
npm run dev:mp-weixin:prod

# 生产环境构建微信小程序
npm run build:mp-weixin

# 测试环境构建微信小程序
npm run build:mp-weixin:test
```

构建产物默认输出到 `dist/build/mp-weixin`，运行产物默认输出到 `dist/dev/mp-weixin`。

## 环境配置

项目通过 `scripts/build-config.js` 生成运行配置，并同步更新 `src/manifest.json` 中的微信小程序 AppID。

| 环境     | 命令参数      | 接口地址                       | 地图 Key 管理             |
| -------- | ------------- | ------------------------------ | ------------------------- |
| 开发环境 | `development` | `https://api-dev.example.com`  | `scripts/build-config.js` |
| 测试环境 | `test`        | `https://api-test.example.com` | `scripts/build-config.js` |
| 生产环境 | `production`  | `https://api.example.com`      | `scripts/build-config.js` |

单独生成环境配置：

```bash
node scripts/build-config.js development
```

生成后的配置文件是 `src/config/env.ts`。这个文件由脚本自动维护，接口地址、AppID、地图 Key（百度/高德/腾讯）等真实项目参数需要在 `scripts/build-config.js` 中替换。

## 主题系统

项目内置了基于 TypeScript 的动态主题系统（`src/theme/tokens.ts`），提供以下特性：

- **语义化变量**: 定义了 `primary`, `textSecondary`, `navHeaderPrimary` 等语义化 Token。
- **自动适配**: `getThemeTokens` 函数根据当前 `themeMode`（light/dark）自动返回对应色值。
- **UI 组件适配**: 在 `App.vue` 中通过 `wd-config-provider` 注入 Wot UI 主题变量。

## 页面说明

### 主包页面

| 页面 | 路径                        | 说明                              |
| ---- | --------------------------- | --------------------------------- |
| 首页 | `src/pages/tabs/home.vue`   | 功能入口、轮播图、TabBar 模式切换 |
| 登录 | `src/pages/login/index.vue` | 普通用户 / 管理员身份选择         |
| 管理 | `src/pages/tabs/admin.vue`  | 管理员数据概览和菜单示例          |
| 我的 | `src/pages/tabs/user.vue`   | 用户信息、订单入口、退出登录      |

### 分包页面

| 分包 | 路径                  | 页面                                                                    |
| ---- | --------------------- | ----------------------------------------------------------------------- |
| 商城 | `src/pages-sub/shop`  | 商城列表、商品详情                                                      |
| 订单 | `src/pages-sub/order` | 订单列表、订单详情                                                      |
| 示例 | `src/pages-sub/demo`  | 支付、订阅消息、定位、上传组件、复杂表单 (Zod 校验)、扫码输入、通用列表 |

进入首页时会预加载商城分包。

## 目录结构

```text
├── scripts/
│   └── build-config.js          # 环境配置生成脚本（含地图 Key）
├── src/
│   ├── api/                     # 接口定义
│   ├── components/              # 业务组件 (SmartUpload, ScanInput, LoadList)
│   ├── config/
│   │   └── env.ts               # 自动生成的当前环境配置
│   ├── custom-tab-bar/          # 自定义 TabBar
│   ├── pages/                   # 主包页面
│   ├── pages-sub/               # 分包页面
│   ├── static/                  # 静态资源
│   ├── store/                   # Pinia 状态
│   ├── styles/                  # 全局样式和图标样式
│   ├── theme/                   # 主题 Tokens 定义
│   ├── utils/                   # 通用工具封装
│   │   └── location/            # 抽象定位模块（支持百度/高德/腾讯）
│   ├── App.vue
│   ├── main.ts
│   ├── manifest.json            # 小程序应用配置
│   ├── pages.json               # 页面、分包配置
│   ├── uni.scss                 # UniApp 全局变量
│   └── uno.css                  # UnoCSS 引入
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 常用配置位置

- 微信小程序 AppID / 接口地址：`scripts/build-config.js`
- 动态主题色 Token：`src/theme/tokens.ts`
- 扫码输入组件：`src/components/scan-input/index.vue`
- 增强上传组件：`src/components/smart-upload/index.vue`
- 复杂表单逻辑：`src/pages-sub/demo/form.vue`
- 微信支付封装：`src/utils/pay.ts`
- 订阅消息封装：`src/utils/subscribe.ts`
- 定位封装入口：`src/utils/location/index.ts`

## 接入真实项目前需要替换

1. 在 `scripts/build-config.js` 中替换各环境的 AppID、接口地址、公钥、项目名称以及各厂商地图 Key。
2. 在 `src/pages-sub/demo/subscribe.vue` 中替换订阅消息模板 ID。
3. 将 `src/utils/pay.ts` 中的模拟支付流程改为后端真实下单接口返回的支付参数。
4. 将 `src/static/tabbar/` 下的 TabBar 图标替换为项目真实图标。
5. 将示例图片、示例接口和占位文案替换为真实业务内容。
