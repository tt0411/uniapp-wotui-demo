<script setup lang="ts">
defineProps<{
  item: {
    id: string
    title: string
    status: string
    amount: number
    date: string
  }
}>()
</script>

<template>
  <view class="demo-list-item">
    <view class="demo-list-item__header">
      <text class="demo-list-item__title">{{ item.title }}</text>
      <text class="demo-list-item__status">{{ item.status }}</text>
    </view>
    <view class="demo-list-item__footer">
      <text class="demo-list-item__date">{{ item.date }}</text>
      <text class="demo-list-item__amount">¥{{ item.amount }}</text>
    </view>
  </view>
</template>

<style scoped lang="scss">
.demo-list-item {
  padding: 24rpx;
  background-color: var(--app-bg-card);
  border-radius: 12rpx;
}

.demo-list-item__header,
.demo-list-item__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.demo-list-item__header {
  margin-bottom: 16rpx;
}

.demo-list-item__title {
  font-size: 30rpx;
  color: var(--app-text-primary);
  font-weight: 600;
}

.demo-list-item__status {
  font-size: 24rpx;
  color: var(--app-text-brand);
}

.demo-list-item__date {
  font-size: 24rpx;
  color: var(--app-text-muted);
}

.demo-list-item__amount {
  font-size: 30rpx;
  color: var(--app-color-danger);
  font-weight: 700;
}
</style>
