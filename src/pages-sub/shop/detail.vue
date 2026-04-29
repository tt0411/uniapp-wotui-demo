<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const goodsId = ref('')
const goods = ref({
  name: '商品详情',
  price: 299,
  image: 'https://picsum.photos/750/500?random=20',
  desc: '这是一个商品详情示例页面，展示分包加载能力。',
})

onLoad((options) => {
  goodsId.value = options?.id || ''
  console.log('商品 ID:', goodsId.value)
})

function buyNow() {
  uni.navigateTo({ url: '/pages-sub/demo/pay' })
}
</script>

<template>
  <view class="page-container">
    <PageNavbar title="商品详情" />
    <image class="detail-img" :src="goods.image" mode="aspectFill" />
    <view class="detail-info">
      <text class="detail-name">{{ goods.name }}</text>
      <text class="detail-price">¥{{ goods.price }}</text>
      <text class="detail-desc">{{ goods.desc }}</text>
    </view>
    <view class="bottom-bar safe-area-bottom">
      <button class="buy-btn" @click="buyNow">立即购买</button>
    </view>
  </view>
</template>

<style scoped lang="scss">
.page-container {
  min-height: 100vh;
  background-color: var(--app-bg-page);
  padding-bottom: 120rpx;
}

.detail-img {
  width: 100%;
  height: 500rpx;
  display: block;
}

.detail-info {
  padding: 24rpx;
  background-color: var(--app-bg-card);
}

.detail-name {
  font-size: 36rpx;
  font-weight: 600;
  color: var(--app-text-primary);
  display: block;
}

.detail-price {
  font-size: 40rpx;
  color: var(--app-color-danger);
  font-weight: 700;
  margin-top: 12rpx;
  display: block;
}

.detail-desc {
  font-size: 28rpx;
  color: var(--app-text-secondary);
  margin-top: 16rpx;
  display: block;
  line-height: 1.6;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 24rpx;
  background-color: var(--app-bg-card);
  border-top: 1rpx solid var(--app-border-secondary);
}

.buy-btn {
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  background-color: var(--app-button-primary-bg);
  color: var(--app-button-primary-text);
  font-size: 30rpx;
  border-radius: 40rpx;
  text-align: center;
  border: none;
}

.buy-btn::after {
  border: none;
}
</style>
