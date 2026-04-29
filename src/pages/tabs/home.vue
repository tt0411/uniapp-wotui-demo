<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app'
import CustomTabBar from '@/custom-tab-bar/index.vue'
import { useAppStore } from '@/store/app'
import { encryptRSA } from '@/utils'

const appStore = useAppStore()
const showTabBar = computed(() => appStore.activeTab === '/pages/tabs/home')


const features = ref([
  { name: '支付示例', path: '/pages-sub/demo/pay', icon: '💳' },
  { name: '订阅消息', path: '/pages-sub/demo/subscribe', icon: '🔔' },
  { name: '定位示例', path: '/pages-sub/demo/location', icon: '📍' },
  { name: '上传组件', path: '/pages-sub/demo/upload', icon: '⬆️' },
  { name: '扫码输入', path: '/pages-sub/demo/scan', icon: '▣' },
  { name: '通用列表', path: '/pages-sub/demo/list', icon: '☰' },
  { name: '多标签列表', path: '/pages-sub/demo/tabs-list', icon: '≡' },
  { name: '侧边悬浮菜单', path: '/pages-sub/demo/side-dock', icon: '🧲' },
  { name: '智能幕帘', path: '/pages-sub/demo/curtain', icon: '🎭' },
  { name: '复杂表单', path: '/pages-sub/demo/form', icon: '📝' },
  { name: '商城分包', path: '/pages-sub/shop/index', icon: '🛒' },
  { name: '订单分包', path: '/pages-sub/order/index', icon: '📋' },
])

const bannerList = ref([
  { url: 'https://picsum.photos/750/300?random=1', title: 'Banner 1' },
  { url: 'https://picsum.photos/750/300?random=2', title: 'Banner 2' },
])

function navigateTo(path: string) {
  uni.navigateTo({ url: path })
}

onShow(() => {
  const rsa = encryptRSA('123456')
  appStore.setActiveTab('/pages/tabs/home')
  console.log('首页 onShow', rsa)
})

onPullDownRefresh(() => {
  setTimeout(() => {
    uni.stopPullDownRefresh()
  }, 1000)
})
</script>

<template>
  <view class="page-container">
    <!-- 自定义导航栏 -->
    <wd-navbar safeAreaInsetTop bordered title="首页"></wd-navbar>

    <!-- 轮播图 -->
    <swiper class="banner" indicator-dots autoplay circular>
      <swiper-item v-for="(item, idx) in bannerList" :key="idx">
        <image class="banner-img" :src="item.url" mode="aspectFill" />
      </swiper-item>
    </swiper>

    <!-- 功能入口 -->
    <view class="feature-section">
      <view class="section-title">功能演示</view>
      <view class="feature-grid">
        <view
          v-for="item in features"
          :key="item.name"
          class="feature-item"
          @click="navigateTo(item.path)"
        >
          <text class="feature-icon">{{ item.icon }}</text>
          <text class="feature-name">{{ item.name }}</text>
        </view>
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

.banner {
  height: 300rpx;
  margin: 20rpx;
  border-radius: 16rpx;
  overflow: hidden;
}

.banner-img {
  width: 100%;
  height: 100%;
}

.feature-section {
  margin: 20rpx;
  padding: 24rpx;
  background-color: var(--app-bg-card);
  border-radius: 16rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--app-text-primary);
  margin-bottom: 16rpx;
}

.feature-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 24rpx;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: calc(20% - 20rpx);
  padding: 16rpx 0;
}

.feature-icon {
  font-size: 48rpx;
  margin-bottom: 8rpx;
}

.feature-name {
  font-size: 24rpx;
  color: var(--app-text-secondary);
}

</style>
