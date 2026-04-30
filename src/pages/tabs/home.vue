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
  { name: '瀑布流', path: '/pages-sub/demo/waterfall', icon: '▥' },
  { name: '侧边悬浮菜单', path: '/pages-sub/demo/side-dock', icon: '🧲' },
  { name: '智能幕帘', path: '/pages-sub/demo/curtain', icon: '🎭' },
  { name: '复杂表单', path: '/pages-sub/demo/form', icon: '📝' },
  { name: 'AI聊天', path: '/pages-sub/demo/ai-chat', icon: '🤖' },
  { name: '商城分包', path: '/pages-sub/shop/index', icon: '🛒' },
  { name: '订单分包', path: '/pages-sub/order/index', icon: '📋' },
])

const bannerList = ref([
  { url: 'https://pro-shbihu.oss-cn-hangzhou.aliyuncs.com/bihu-image/bihu-web/uniapp-wotui-demo.png', title: 'Banner 1' },
])

function navigateTo(path: string) {
  uni.navigateTo({ url: path })
}

// 图片预览
function previewImage(currentUrl: string) {
  const urls = bannerList.value.map(item => item.url)
  uni.previewImage({
    current: currentUrl,
    urls: urls
  })
}

onShow(() => {
  appStore.setActiveTab('/pages/tabs/home')
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
        <image class="banner-img" :src="item.url" mode="aspectFill" @click="previewImage(item.url)"/>
      </swiper-item>
    </swiper>

    <!-- 功能入口 -->
    <view class="feature-section">
      <view class="section-title">功能演示</view>
      <wd-grid :column="4" :border="false" clickable>
        <wd-grid-item
          v-for="item in features"
          :key="item.name"
          :text="item.name"
          @click="navigateTo(item.path)"
        >
          <template #icon>
            <text class="feature-icon">{{ item.icon }}</text>
          </template>
        </wd-grid-item>
      </wd-grid>
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

.feature-icon {
  font-size: 48rpx;
}

:deep(.wd-grid-item__text) {
  font-size: 26rpx !important;
}

</style>
