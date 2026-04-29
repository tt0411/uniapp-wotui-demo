<script setup lang="ts">
import { ref } from 'vue'
import { doPayment } from '@/utils/pay'
import { showError } from '@/utils/toast'

const amount = ref('99')
const loading = ref(false)

async function handlePay() {
  const num = parseFloat(amount.value)
  if (!num || num <= 0) {
    showError('请输入有效金额')
    return
  }
  if (loading.value) return

  loading.value = true
  const success = await doPayment('goods_demo', 1)
  loading.value = false

  if (success) {
    // 支付成功后的业务处理
    console.log('支付流程完成')
  }
}
</script>

<template>
  <view class="page-container">
    <PageNavbar title="支付示例" />
    <view class="page-content">
      <view class="pay-card">
        <text class="pay-title">支付金额</text>
        <view class="pay-input-row">
          <text class="pay-symbol">¥</text>
          <input
            v-model="amount"
            class="pay-input"
            type="digit"
            placeholder="0.00"
            maxlength="8"
          />
        </view>
      </view>

      <view class="pay-info">
        <text class="info-text">演示说明：点击支付将调用封装好的 doPayment 方法</text>
        <text class="info-text">实际项目中需先调用后端接口创建订单获取支付参数</text>
      </view>

      <button
        class="pay-btn"
        :class="{ disabled: loading }"
        :disabled="loading"
        @click="handlePay"
      >
        {{ loading ? '请稍候...' : '立即支付' }}
      </button>
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

.pay-card {
  background-color: var(--app-bg-card);
  border-radius: 20rpx;
  padding: 40rpx;
  margin-bottom: 24rpx;
}

.pay-title {
  font-size: 28rpx;
  color: var(--app-text-secondary);
  display: block;
  margin-bottom: 20rpx;
}

.pay-input-row {
  display: flex;
  align-items: center;
  border-bottom: 2rpx solid var(--app-border-secondary);
  padding-bottom: 16rpx;
}

.pay-symbol {
  font-size: 48rpx;
  color: var(--app-text-primary);
  font-weight: 600;
  margin-right: 12rpx;
}

.pay-input {
  flex: 1;
  font-size: 56rpx;
  font-weight: 700;
  color: var(--app-text-primary);
  height: 80rpx;
  caret-color: var(--app-color-primary);
}

.pay-info {
  margin-bottom: 40rpx;
}

.info-text {
  font-size: 24rpx;
  color: var(--app-text-muted);
  display: block;
  margin-bottom: 8rpx;
  line-height: 1.5;
}

.pay-btn {
  width: 100%;
  height: 90rpx;
  line-height: 90rpx;
  background-color: var(--app-button-primary-bg);
  color: var(--app-button-primary-text);
  font-size: 32rpx;
  border-radius: 45rpx;
  text-align: center;

  &:active {
    opacity: 0.9;
  }

  &.disabled {
    background-color: var(--app-button-primary-disabled-bg);
  }
}
</style>
