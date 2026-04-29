<script setup lang="ts">
import { ref } from 'vue'
import SmartCurtain from '@/components/smart-curtain/index.vue'
import { showToast } from '@/utils/toast'

const showCurtain = ref(false)

function handleOpen() {
  showCurtain.value = true
}

function handleEnd() {
  console.log('倒计时结束')
}

function handleClick() {
  showToast('点击了广告图')
}

function handleClose() {
  showToast('幕帘已关闭')
}
</script>

<template>
  <view class="page-container">
    <PageNavbar title="智能幕帘" preset="gradientPrimaryHeader" />
    <view class="page-content">
      <view class="demo-card">
        <text class="card-title">智能幕帘</text>
        <text class="card-desc">基于 wd-curtain 封装，支持倒计时功能</text>

        <view class="btn-group">
          <button class="demo-btn primary" @click="handleOpen">打开幕帘 (倒计时 5s)</button>
        </view>
      </view>
    </view>

    <!-- 示例 1: 图片幕帘 -->
    <SmartCurtain
      v-model="showCurtain"
      src="https://wot-ui.cn/demo/assets/black_mao_1-Igvd36hK.png"
      :countdown="5"
      @click="handleClick"
      @close="handleClose"
      @countdown-end="handleEnd"
    />
  </view>
</template>

<style scoped lang="scss">
.page-container {
  background-color: var(--app-bg-page-secondary);
  min-height: 100vh;
}

.page-content {
  padding: 30rpx;
}

.demo-card {
  background-color: var(--app-bg-card);
  border-radius: 24rpx;
  padding: 40rpx;
  margin-bottom: 30rpx;
  box-shadow: var(--app-shadow-card);
}

.card-title {
  font-size: 34rpx;
  font-weight: 700;
}

.btn-group {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.demo-btn {
  width: 100%;
  height: 90rpx;
  line-height: 90rpx;
  font-size: 30rpx;
  border-radius: 45rpx;
  text-align: center;
  border: none;

  &::after {
    border: none;
  }

  &.primary {
    background: var(--app-gradient-primary);
    color: var(--app-text-inverse);
  }

  &.default {
    background-color: var(--app-button-secondary-bg);
    color: var(--app-button-secondary-text);
  }
}
</style>
