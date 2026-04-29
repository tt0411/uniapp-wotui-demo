<script setup lang="ts">
import { ref } from 'vue'

const goodsList = ref([
  { id: 1, name: '商品 A', price: 99, image: 'https://picsum.photos/300/300?random=10' },
  { id: 2, name: '商品 B', price: 199, image: 'https://picsum.photos/300/300?random=11' },
  { id: 3, name: '商品 C', price: 299, image: 'https://picsum.photos/300/300?random=12' },
  { id: 4, name: '商品 D', price: 399, image: 'https://picsum.photos/300/300?random=13' },
])

function goDetail(id: number) {
  uni.navigateTo({ url: `/pages-sub/shop/detail?id=${id}` })
}
</script>

<template>
  <view class="page-container">
    <PageNavbar title="商城" preset="bgPage" />
    <view class="page-content">
      <view class="page-title">商城（分包页面）</view>
      <view class="goods-grid">
        <view
          v-for="item in goodsList"
          :key="item.id"
          class="goods-card"
          @click="goDetail(item.id)"
        >
          <image class="goods-img" :src="item.image" mode="aspectFill" />
          <view class="goods-info">
            <text class="goods-name">{{ item.name }}</text>
            <text class="goods-price">¥{{ item.price }}</text>
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

.goods-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.goods-card {
  width: calc(50% - 10rpx);
  background-color: var(--app-bg-card);
  border-radius: 16rpx;
  overflow: hidden;
}

.goods-img {
  width: 100%;
  height: 300rpx;
}

.goods-info {
  padding: 16rpx;
}

.goods-name {
  font-size: 28rpx;
  color: var(--app-text-primary);
  display: block;
}

.goods-price {
  font-size: 32rpx;
  color: var(--app-color-danger);
  font-weight: 600;
  margin-top: 8rpx;
  display: block;
}
</style>
