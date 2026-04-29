<script setup lang="ts">
import { ref } from 'vue'
import { subscribeMessage, subscribeMessages, getSubscriptionSetting } from '@/utils/subscribe'
import { showError, showSuccess } from '@/utils/toast'

const tmplIds = ref([
  'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // 替换为实际的模板 ID
  'yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy',
])

async function handleSingleSubscribe() {
  if (tmplIds.value[0].includes('xxxx')) {
    showError('请先替换 tmplId')
    return
  }
  await subscribeMessage(tmplIds.value[0])
}

async function handleMultiSubscribe() {
  const validIds = tmplIds.value.filter((id) => !id.includes('xxxx'))
  if (validIds.length === 0) {
    showError('请先替换 tmplId')
    return
  }
  await subscribeMessages(validIds.slice(0, 3))
}

async function checkSetting() {
  try {
    const setting = await getSubscriptionSetting()
    console.log('订阅设置', setting)
    showSuccess('请在控制台查看订阅设置')
  } catch (e) {
    showError('获取设置失败')
  }
}
</script>

<template>
  <view class="page-container">
    <PageNavbar title="订阅消息" />
    <view class="page-content">
      <view class="demo-card">
        <text class="card-title">订阅消息演示</text>
        <text class="card-desc">调用 subscribeMessage 封装方法，支持权限引导</text>

        <view class="btn-group">
          <button class="demo-btn primary" @click="handleSingleSubscribe">单条订阅</button>
          <button class="demo-btn primary" @click="handleMultiSubscribe">批量订阅（最多3条）</button>
          <button class="demo-btn default" @click="checkSetting">查看订阅设置</button>
        </view>
      </view>

      <view class="tips">
        <text class="tips-title">使用说明：</text>
        <text class="tips-item">1. 在小程序后台申请订阅消息模板</text>
        <text class="tips-item">2. 将模板 ID 填入 utils/subscribe.ts 或当前页面</text>
        <text class="tips-item">3. 调用 subscribeMessage(tmplId) 即可触发订阅弹窗</text>
        <text class="tips-item">4. 若用户拒绝，自动引导前往设置页开启</text>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.page-container {
  background-color: var(--app-bg-page);
  min-height: 100vh;
}

.page-content {
  padding: 40rpx;
}

.demo-card {
  background-color: var(--app-bg-card);
  border-radius: 20rpx;
  padding: 40rpx;
  margin-bottom: 24rpx;
}

.card-title {
  font-size: 36rpx;
  font-weight: 600;
  color: var(--app-text-primary);
  display: block;
  margin-bottom: 12rpx;
}

.card-desc {
  font-size: 26rpx;
  color: var(--app-text-secondary);
  display: block;
  margin-bottom: 32rpx;
}

.btn-group {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.demo-btn {
  height: 80rpx;
  line-height: 80rpx;
  font-size: 30rpx;
  border-radius: 40rpx;
  text-align: center;

  &::after {
    border: none;
  }

  &.primary {
    background-color: var(--app-button-primary-bg);
    color: var(--app-button-primary-text);
  }

  &.default {
    background-color: var(--app-button-secondary-bg);
    color: var(--app-button-secondary-text);
  }

  &:active {
    opacity: 0.85;
  }
}

.tips {
  background-color: var(--app-bg-card);
  border-radius: 20rpx;
  padding: 32rpx;
}

.tips-title {
  font-size: 30rpx;
  font-weight: 600;
  color: var(--app-text-primary);
  display: block;
  margin-bottom: 16rpx;
}

.tips-item {
  font-size: 26rpx;
  color: var(--app-text-secondary);
  display: block;
  line-height: 1.8;
}
</style>
