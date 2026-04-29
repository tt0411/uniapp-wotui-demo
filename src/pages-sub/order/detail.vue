<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const orderId = ref('')
const order = ref({
  id: '',
  status: '待发货',
  total: 299,
  date: '2024-04-23 10:00:00',
  address: '北京市朝阳区 xxx 街道',
  receiver: '张三 138****8888',
})

onLoad((options) => {
  orderId.value = options?.id || ''
  order.value.id = orderId.value
})
</script>

<template>
  <view class="page-container">
    <PageNavbar title="订单详情" preset="gradientPrimaryHeader" />
    <view class="status-bar">
      <text class="status-text">{{ order.status }}</text>
    </view>
    <view class="info-card">
      <view class="info-row">
        <text class="info-label">订单编号</text>
        <text class="info-value">{{ order.id }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">下单时间</text>
        <text class="info-value">{{ order.date }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">收货人</text>
        <text class="info-value">{{ order.receiver }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">收货地址</text>
        <text class="info-value">{{ order.address }}</text>
      </view>
    </view>
    <view class="total-bar">
      <text class="total-label">订单金额</text>
      <text class="total-value">¥{{ order.total }}</text>
    </view>
  </view>
</template>

<style scoped lang="scss">
.page-container {
  padding: 20rpx;
  background-color: var(--app-bg-page);
  box-sizing: border-box;
  min-height: 100vh;
}

.status-bar {
  padding: 40rpx;
  background: var(--app-gradient-user-header);
  border-radius: 16rpx;
  margin-bottom: 20rpx;
}

.status-text {
  font-size: 40rpx;
  font-weight: 700;
  color: var(--app-text-inverse);
}

.info-card {
  background-color: var(--app-bg-card);
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 16rpx 0;
  border-bottom: 1rpx solid var(--app-border-primary);

  &:last-child {
    border-bottom: none;
  }
}

.info-label {
  font-size: 28rpx;
  color: var(--app-text-secondary);
}

.info-value {
  font-size: 28rpx;
  color: var(--app-text-primary);
}

.total-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28rpx 24rpx;
  background-color: var(--app-bg-card);
  border-radius: 16rpx;
}

.total-label {
  font-size: 30rpx;
  color: var(--app-text-primary);
}

.total-value {
  font-size: 36rpx;
  color: var(--app-color-danger);
  font-weight: 700;
}
</style>
