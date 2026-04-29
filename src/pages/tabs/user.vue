<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getThemeTokens } from '@/theme/tokens'
import CustomTabBar from '@/custom-tab-bar/index.vue'
import { showModal } from '@/utils/toast'
import { useUserStore } from '@/store/user'
import { useAppStore } from '@/store/app'

const appStore = useAppStore()
const userStore = useUserStore()
const showTabBar = computed(() => appStore.activeTab === '/pages/tabs/user')

const userInfo = computed(() => userStore.userInfo)

const menuList = ref([
  { name: '我的订单', path: '/pages-sub/order/index', icon: '📋' },
  { name: '收货地址', path: '', icon: '📍' },
  { name: '联系客服', path: '', icon: '💬' },
  { name: '切换身份 (退出登录)', path: '/pages/login/index', icon: '🔄', logout: true },
  { name: '设置', path: '', icon: '⚙️' },
])

function handleLogin() {
  // 如果已经登录过且有头像昵称，不再重复调用 getUserProfile
  if (userStore.isLoggedIn && userInfo.value.nickname !== '点击登录') {
    return
  }

  uni.getUserProfile({
    desc: '用于完善用户资料',
    success: (res) => {
      userStore.setUserInfo({
        nickname: res.userInfo.nickName,
        avatar: res.userInfo.avatarUrl
      })
      userStore.setLogin(true)
    },
    fail: (err) => {
      if (err.errMsg.includes('frequently')) {
        uni.showToast({ title: '操作太频繁，请稍后再试', icon: 'none' })
      } else {
        showModal('提示', '需要授权才能获取用户信息')
      }
    },
  })
}


function handleMenu(item: any) {
  if (!item.path) {
    uni.showToast({ title: '功能开发中', icon: 'none' })
    return
  }
  
  if (item.logout) {
    userStore.setLogin(false)
    uni.reLaunch({ url: item.path })
  } else {
    uni.navigateTo({ url: item.path })
  }
}

const isDarkTheme = computed({
  get: () => appStore.themeMode === 'dark',
  set: (value: boolean) => {
    appStore.setThemeMode(value ? 'dark' : 'light')
  }
})

const switchColor = computed(() => getThemeTokens(appStore.themeMode, appStore.themeName).primary)

const isFloatingTabBar = computed({
  get: () => appStore.tabBarMode === 'floating',
  set: (value: boolean) => {
    appStore.setTabBarMode(value ? 'floating' : 'normal')
  }
})

onShow(() => {
  appStore.setActiveTab('/pages/tabs/user')
})

</script>

<template>
  <view class="page-container">
    <!-- 用户信息卡片 -->
    <view class="user-card">
      <view class="user-info" @click="handleLogin">
        <image class="avatar" :src="userInfo.avatar" mode="aspectFill" />
        <view class="user-meta">
          <text class="nickname">{{ userInfo.nickname }}</text>
          <text v-if="userInfo.phone" class="phone">{{ userInfo.phone }}</text>
        </view>
      </view>
    </view>

    <!-- 菜单列表 -->
    <view class="menu-section">
      <view
        v-for="(item, index) in menuList"
        :key="index"
        class="menu-item"
        @click="handleMenu(item)"
      >
        <view class="menu-left">
          <text class="menu-icon">{{ item.icon }}</text>
          <text class="menu-name">{{ item.name }}</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <view class="setting-section">
      <view class="setting-title">页面设置</view>
      <view class="setting-item setting-item-bordered">
        <view class="setting-copy">
          <text class="setting-name">暗色主题</text>
          <text class="setting-desc">{{ isDarkTheme ? '当前为暗色模式' : '当前为亮色模式' }}</text>
        </view>
        <switch
          :checked="isDarkTheme"
          :color="switchColor"
          @change="isDarkTheme = $event.detail.value"
        />
      </view>
      <view class="setting-item">
        <view class="setting-copy">
          <text class="setting-name">TabBar 悬浮模式</text>
          <text class="setting-desc">{{ isFloatingTabBar ? '已开启悬浮模式' : '当前为常规模式' }}</text>
        </view>
        <switch
          :checked="isFloatingTabBar"
          :color="switchColor"
          @change="isFloatingTabBar = $event.detail.value"
        />
      </view>
    </view>

    <CustomTabBar v-if="showTabBar" />
  </view>
</template>

<style scoped lang="scss">
.page-container {
  min-height: 100vh;
  background-color: var(--app-bg-page);
}

.user-card {
  // margin: 20rpx;
  padding: calc(40rpx + var(--status-bar-height)) 40rpx 40rpx;
  background: var(--app-gradient-user-header);
  border-radius: 20rpx;
}



.user-info {
  display: flex;
  align-items: center;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  border: 4rpx solid var(--app-border-inverse);
  background-color: var(--app-bg-card);
}

.user-meta {
  margin-left: 24rpx;
  display: flex;
  flex-direction: column;
}

.nickname {
  font-size: 36rpx;
  font-weight: 600;
  color: var(--app-text-inverse);
}

.phone {
  font-size: 26rpx;
  color: var(--app-overlay-icon);
  margin-top: 8rpx;
}

.menu-section {
  margin: 20rpx;
  background-color: var(--app-bg-card);
  border-radius: 16rpx;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 24rpx;
  border-bottom: 1rpx solid var(--app-border-primary);

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background-color: var(--app-bg-page);
  }
}

.menu-left {
  display: flex;
  align-items: center;
}

.menu-icon {
  font-size: 36rpx;
  margin-right: 16rpx;
}

.menu-name {
  font-size: 30rpx;
  color: var(--app-text-primary);
}

.menu-arrow {
  font-size: 32rpx;
  color: var(--app-text-disabled);
}

.setting-section {
  margin: 20rpx;
  padding: 24rpx;
  background-color: var(--app-bg-card);
  border-radius: 16rpx;
}

.setting-title {
  font-size: 30rpx;
  font-weight: 600;
  color: var(--app-text-primary);
  margin-bottom: 20rpx;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24rpx;
}

.setting-item-bordered {
  padding-bottom: 24rpx;
  margin-bottom: 24rpx;
  border-bottom: 1rpx solid var(--app-border-primary);
}

.setting-copy {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.setting-name {
  font-size: 30rpx;
  color: var(--app-text-primary);
}

.setting-desc {
  font-size: 24rpx;
  color: var(--app-text-muted);
}
</style>
