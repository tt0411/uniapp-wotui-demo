<script setup lang="ts">
import { ref } from 'vue'
import ScanInput from '@/components/scan-input/index.vue'
import { showError, showSuccess } from '@/utils/toast'

const serialNo = ref('')

function handleScan(value: { value: string }) {
  showSuccess(value.value ? '已识别' : '未识别到内容')
}

function handleScanFail() {
  showError('扫码失败')
}
</script>

<template>
  <view class="page-container">
    <PageNavbar title="扫码输入" />
    <view class="page-content">
      <view class="demo-card">
        <ScanInput
          v-model="serialNo"
          placeholder="请输入序列号"
          clearable
          @scan="handleScan"
          @scanFail="handleScanFail"
        >
          <view class="tip-icon">i</view>
        </ScanInput>
      </view>

      <view class="demo-card">
        <view class="result-title">当前内容</view>
        <view class="result-value">{{ serialNo || '暂无输入' }}</view>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
:deep(input) {
  color: var(--app-input-text);
}

.page-container {
  min-height: 100vh;
  background-color: var(--app-bg-page);
}

.page-content {
  padding: 24rpx;
  box-sizing: border-box;
}

.demo-card {
  padding: 28rpx;
  margin-bottom: 24rpx;
  background-color: var(--app-bg-card);
  border-radius: 16rpx;
}

.tip-icon {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background-color: var(--app-color-warning);
  color: var(--app-text-inverse);
  font-size: 30rpx;
  font-weight: 700;
  font-style: italic;
  line-height: 40rpx;
  text-align: center;
}

.result-title {
  font-size: 28rpx;
  color: var(--app-text-secondary);
  margin-bottom: 12rpx;
}

.result-value {
  min-height: 44rpx;
  font-size: 30rpx;
  color: var(--app-text-primary);
  word-break: break-all;
}
</style>
