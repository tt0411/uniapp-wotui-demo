<script setup lang="ts">
import { ref } from 'vue'

const orderList = ref([
  { id: '20240423001', status: '待发货', total: 299, date: '2024-04-23' },
  { id: '20240423002', status: '已发货', total: 199, date: '2024-04-22' },
  { id: '20240423003', status: '已完成', total: 599, date: '2024-04-20' },
])

const statusColors: Record<string, string> = {
  '待发货': 'var(--app-status-pending)',
  '已发货': 'var(--app-status-shipped)',
  '已完成': 'var(--app-status-completed)',
}

function goDetail(id: string) {
  uni.navigateTo({ url: `/pages-sub/order/detail?id=${id}` })
}
</script>

<template>
  <view class="page-container">
    <PageNavbar title="订单列表" />
    <view class="page-content">
      <view class="page-title">订单列表（分包页面）</view>
      <view class="order-list">
        <view
          v-for="item in orderList"
          :key="item.id"
          class="order-card"
          @click="goDetail(item.id)"
        >
          <view class="order-header">
            <text class="order-id">订单号：{{ item.id }}</text>
            <text class="order-status" :style="{ color: statusColors[item.status] }">
              {{ item.status }}
            </text>
          </view>
          <view class="order-body">
            <text class="order-date">下单时间：{{ item.date }}</text>
            <text class="order-total">¥{{ item.total }}</text>
          </view>
        </view>
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
  padding: 20rpx;
}

.page-title {
  font-size: 32rpx;
  font-weight: 600;
  margin-bottom: 20rpx;
  color: var(--app-text-primary);
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.order-card {
  background-color: var(--app-bg-card);
  border-radius: 16rpx;
  padding: 24rpx;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.order-id {
  font-size: 26rpx;
  color: var(--app-text-secondary);
}

.order-status {
  font-size: 26rpx;
  font-weight: 600;
}

.order-body {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-date {
  font-size: 24rpx;
  color: var(--app-text-muted);
}

.order-total {
  font-size: 32rpx;
  color: var(--app-color-danger);
  font-weight: 700;
}
</style>
