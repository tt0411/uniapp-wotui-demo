<script setup lang="ts">
import { computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import CustomTabBar from '@/custom-tab-bar/index.vue'
import { useAppStore } from '@/store/app'

const appStore = useAppStore()
const showTabBar = computed(() => appStore.activeTab === '/pages/tabs/admin')

onShow(() => {
  appStore.setActiveTab('/pages/tabs/admin')
})
</script>

<template>
  <view class="page-container">
  <wd-navbar safeAreaInsetTop bordered title="管理"></wd-navbar>

    <view class="content">
      <view class="stats-card">
        <view class="stats-title">数据概览 (Admin)</view>
        <view class="stats-grid">
          <view class="stats-item">
            <text class="stats-value">1,280</text>
            <text class="stats-label">今日访问</text>
          </view>
          <view class="stats-item">
            <text class="stats-value">¥12,840</text>
            <text class="stats-label">成交金额</text>
          </view>
        </view>
      </view>

      <view class="menu-list">
        <wd-cell title="订单管理" is-link icon="order" />
        <wd-cell title="商品配置" is-link icon="goods" />
        <wd-cell title="用户审计" is-link icon="user" />
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

.content {
  padding: 24rpx;
}

.stats-card {
  background: var(--app-gradient-info);
  border-radius: 16rpx;
  padding: 32rpx;
  color: var(--app-text-inverse);
  margin-bottom: 24rpx;
}

.stats-title {
  font-size: 28rpx;
  opacity: 0.8;
  margin-bottom: 24rpx;
}

.stats-grid {
  display: flex;
  justify-content: space-around;
}

.stats-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stats-value {
  font-size: 40rpx;
  font-weight: bold;
}

.stats-label {
  font-size: 24rpx;
  margin-top: 8rpx;
  opacity: 0.7;
}

.menu-list {
  background-color: var(--app-bg-card);
  border-radius: 16rpx;
  overflow: hidden;
}
</style>
