<script lang="ts">
export default {
  options: {
    styleIsolation: 'shared'
  }
}
</script>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/user'
import { useAppStore } from '@/store/app'
import { getThemeTokens } from '@/theme/tokens'

const appStore = useAppStore()
const userStore = useUserStore()
const active = ref<number>(0)
const isDarkTheme = computed(() => appStore.themeMode === 'dark')

// 根据角色定义的菜单配置
const allTabs = {
  user: [
    { title: '首页', name: 'home', icon: 'home', path: '/pages/tabs/home' },
    { title: '我的', name: 'user', icon: 'user', path: '/pages/tabs/user' },
  ],
  admin: [
    { title: '首页', name: 'home', icon: 'home', path: '/pages/tabs/home' },
    { title: '管理', name: 'admin', icon: 'settings', path: '/pages/tabs/admin' },
    { title: '我的', name: 'user', icon: 'user', path: '/pages/tabs/user' },
  ]
}

const tabList = computed(() => {
  return allTabs[userStore.role] || allTabs.user
})

const tabbarColors = computed(() => {
  const tokens = getThemeTokens(appStore.themeMode, appStore.themeName)
  return {
    active: tokens.primary,
    inactive: tokens.textMuted,
    normalBg: tokens.tabbarBg,
    floatingBg: isDarkTheme.value ? tokens.bgCard : tokens.tabbarFloatingBg,
    border: tokens.tabbarBorder,
    shadow: tokens.tabbarShadow
  }
})

// 监听全局状态，直接同步，避免页面切换时的图标闪烁
watch(() => appStore.activeTab, (newPath) => {
  const idx = tabList.value.findIndex(item => item.path === newPath)
  if (idx !== -1) {
    active.value = idx
  }
}, { immediate: true })

function updateActiveIndex() {
  const pages = getCurrentPages()
  if (pages.length > 0) {
    const currentPage = pages[pages.length - 1]
    const route = '/' + ((currentPage as any).route || '')
    const idx = tabList.value.findIndex(item => item.path === route)
    if (idx !== -1) {
      active.value = idx
      appStore.setActiveTab(route) // 修正并同步到全局
    }
  }
}

onShow(() => {
  updateActiveIndex()
})

function handleChange(e: any) {
  const val = e.value
  const target = tabList.value[val]
  if (!target) {
    return
  }
  // 先更新全局状态，这样新页面加载时激活索引就是正确的
  appStore.setActiveTab(target.path)
  uni.switchTab({
    url: target.path,
  })
}

// 获取系统信息，判断是否为 iOS
const sysInfo = uni.getSystemInfoSync()
// 兼容不同版本的平台判断
const isIOS = sysInfo.osName === 'ios' || sysInfo.platform === 'ios'

// 动态计算样式变量
const wrapperStyle = computed(() => {
  return {
    // 悬浮模式下：iOS 减少底部间距（解决太远），安卓保持 20rpx
    '--floating-gap': isIOS ? '-20rpx' : '20rpx',
    // 悬浮模式内部高度撑高一点
    '--inner-padding': isIOS ? '6rpx 0' : '0',
    // 常规模式下：iOS 增加额外底部间距（解决太近），安卓保持 0
    '--normal-gap': isIOS ? '-24rpx' : '0rpx',
    // 暗色下关闭模糊，避免文字和图标发虚重影
    '--floating-backdrop-filter': isDarkTheme.value ? 'none' : 'blur(10px)',
    '--floating-background': tabbarColors.value.floatingBg,
    '--tabbar-active-color': tabbarColors.value.active,
    '--tabbar-inactive-color': tabbarColors.value.inactive,
    '--tabbar-background': tabbarColors.value.normalBg,
    '--tabbar-border': tabbarColors.value.border,
    '--tabbar-shadow': tabbarColors.value.shadow
  }
})
</script>

<template>
  <view 
    :style="wrapperStyle"
    :class="[
      'custom-tabbar-wrapper',
      appStore.tabBarMode === 'floating' ? 'is-floating' : 'is-normal',
      isIOS ? 'is-ios' : ''
    ]"
  >
    <view class="tabbar-container">
      <wd-tabbar
        v-model="active"
        :shape="appStore.tabBarMode === 'floating' ? 'round' : undefined"
        :bordered="appStore.tabBarMode === 'normal'"
        :safe-area-inset-bottom="appStore.tabBarMode === 'normal'"
        :active-color="tabbarColors.active"
        :inactive-color="tabbarColors.inactive"
        @change="handleChange"
      >
        <wd-tabbar-item
          v-for="item in tabList"
          :key="item.name"
          :title="item.title"
          :icon="item.icon"
        />
      </wd-tabbar>
    </view>
  </view>
</template>

<style scoped lang="scss">

.custom-tabbar-wrapper {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 500;
  pointer-events: none; /* 让背景点击穿透 */

  &.is-floating {
    /* 基础安全区 + 动态间距 */
    padding-bottom: calc(env(safe-area-inset-bottom) + var(--floating-gap)) !important;

    .tabbar-container {
      pointer-events: auto; /* 恢复内容区的点击 */
      
      :deep(.wd-tabbar) {
        background-color: var(--floating-background) !important;
        backdrop-filter: var(--floating-backdrop-filter) !important;
        margin: 0 32rpx !important;
        border-radius: 40rpx !important;
        box-shadow: var(--tabbar-shadow) !important;
        border: 1rpx solid var(--tabbar-border) !important;
        /* 针对 iOS 稍微加厚胶囊 */
        padding: var(--inner-padding) !important;
      }
    }
  }

  &.is-normal {
    .tabbar-container {
      pointer-events: auto;
      :deep(.wd-tabbar) {
        background-color: var(--tabbar-background) !important;
        border-color: var(--tabbar-border) !important;
        /* 常规模式基础安全区 + 动态额外间距 */
        padding-bottom: calc(env(safe-area-inset-bottom) + var(--normal-gap)) !important;
      }
    }
  }

  &.is-ios {
    :deep(.wd-tabbar-item__body) {
      padding-top: 10rpx;
    }
  }

  :deep(.wd-tabbar-item__body-icon),
  :deep(.wd-tabbar-item__body-title) {
    text-shadow: none !important;
    filter: none !important;
  }

  :deep(.wd-tabbar-item__body-icon.is-inactive),
  :deep(.wd-tabbar-item__body-title.is-inactive) {
    color: var(--tabbar-inactive-color) !important;
  }

  :deep(.wd-tabbar-item__body-icon.is-active),
  :deep(.wd-tabbar-item__body-title.is-active) {
    color: var(--tabbar-active-color) !important;
  }

}
</style>
