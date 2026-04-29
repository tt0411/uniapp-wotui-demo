<script setup lang="ts">
import { ref } from 'vue'
import { envConfig } from '@/config/env'
import {
  locationService,
  BaiduMapProvider,
  AmapProvider,
  TencentMapProvider
} from '@/utils/location/index'
import { showError, showSuccess } from '@/utils/toast'

const locationInfo = ref<{
  latitude: number
  longitude: number
  address?: string
  name?: string
  provider?: string
} | null>(null)

const currentProviderName = ref('baidu')

// 初始化服务商（从环境配置获取 Key）
const providers = {
  baidu: new BaiduMapProvider({ key: envConfig.baiduMapKey, coordType: 'gcj02' }),
  amap: new AmapProvider({ key: envConfig.amapKey }),
  tencent: new TencentMapProvider({ key: envConfig.tencentMapKey })
}

function handleSwitchProvider(name: 'baidu' | 'amap' | 'tencent') {
  currentProviderName.value = name
  locationService.setProvider(providers[name])
  showSuccess(`切换到 ${name.toUpperCase()} 地图`)
}

async function handleGetLocation() {
  try {
    const res = await locationService.getCurrentLocation({ needAddress: true })
    locationInfo.value = {
      latitude: res.latitude,
      longitude: res.longitude,
      address: res.address,
      provider: currentProviderName.value
    }
  } catch (e) {
    console.error(e)
  }
}

async function handleChooseLocation() {
  try {
    const res = await locationService.chooseLocation()
    locationInfo.value = {
      latitude: res.latitude,
      longitude: res.longitude,
      name: res.name,
      address: res.address,
      provider: '系统选择器'
    }
  } catch (e) {
    console.error(e)
  }
}

function handleOpenMap() {
  if (!locationInfo.value) {
    showError('请先获取位置')
    return
  }
  locationService.openLocation(
    locationInfo.value.latitude,
    locationInfo.value.longitude,
    locationInfo.value.name || '当前位置',
    locationInfo.value.address || ''
  )
}
</script>

<template>
  <view class="page-container">
    <PageNavbar title="定位示例" preset="bgPageSecondary" />
    <view class="page-content">
      <view class="demo-card">
        <text class="card-title">地图服务商切换</text>
        <text class="card-desc">当前服务商: <text class="highlight">{{ currentProviderName.toUpperCase() }}</text></text>

        <view class="provider-selector">
          <view
            class="provider-item"
            :class="{ active: currentProviderName === 'baidu' }"
            @click="handleSwitchProvider('baidu')"
          >百度</view>
          <view
            class="provider-item"
            :class="{ active: currentProviderName === 'amap' }"
            @click="handleSwitchProvider('amap')"
          >高德</view>
          <view
            class="provider-item"
            :class="{ active: currentProviderName === 'tencent' }"
            @click="handleSwitchProvider('tencent')"
          >腾讯</view>
        </view>
      </view>

      <view class="demo-card">
        <text class="card-title">定位演示</text>
        <text class="card-desc">封装并抽象了不同地图厂商的 API</text>

        <view class="btn-group">
          <button class="demo-btn primary" @click="handleGetLocation">获取位置 + 逆地址解析</button>
          <button class="demo-btn primary" @click="handleChooseLocation">选择位置</button>
          <button class="demo-btn default" @click="handleOpenMap">打开内置地图</button>
        </view>
      </view>

      <view v-if="locationInfo" class="result-card">
        <text class="result-title">位置详情 (来自 {{ locationInfo.provider }})</text>
        <view class="result-row">
          <text class="result-label">纬度</text>
          <text class="result-value">{{ locationInfo.latitude }}</text>
        </view>
        <view class="result-row">
          <text class="result-label">经度</text>
          <text class="result-value">{{ locationInfo.longitude }}</text>
        </view>
        <view v-if="locationInfo.name" class="result-row">
          <text class="result-label">位置名称</text>
          <text class="result-value">{{ locationInfo.name }}</text>
        </view>
        <view v-if="locationInfo.address" class="result-row">
          <text class="result-label">详细地址</text>
          <text class="result-value">{{ locationInfo.address }}</text>
        </view>
      </view>
    </view>
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
  color: var(--app-text-primary);
  display: block;
  margin-bottom: 8rpx;
}

.card-desc {
  font-size: 24rpx;
  color: var(--app-text-muted);
  display: block;
  margin-bottom: 32rpx;

  .highlight {
    color: var(--app-text-brand);
    font-weight: 600;
    margin-left: 10rpx;
  }
}

.provider-selector {
  display: flex;
  background-color: var(--app-bg-surface-muted);
  padding: 6rpx;
  border-radius: 16rpx;
  gap: 6rpx;
}

.provider-item {
  flex: 1;
  text-align: center;
  padding: 16rpx 0;
  font-size: 26rpx;
  color: var(--app-button-secondary-text);
  border-radius: 12rpx;
  transition: all 0.2s ease;

  &.active {
    background-color: var(--app-bg-card);
    color: var(--app-text-brand);
    font-weight: 600;
    box-shadow: var(--app-shadow-card);
  }
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

  &:active {
    transform: scale(0.98);
    opacity: 0.9;
  }
}

.result-card {
  background-color: var(--app-bg-card);
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: var(--app-shadow-card);
}

.result-title {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--app-text-primary);
  display: block;
  margin-bottom: 24rpx;
  padding-bottom: 16rpx;
  border-bottom: 1rpx solid var(--app-divider);
}

.result-row {
  display: flex;
  padding: 20rpx 0;
  align-items: flex-start;

  &:not(:last-child) {
    border-bottom: 1rpx dashed var(--app-divider);
  }
}

.result-label {
  width: 140rpx;
  font-size: 26rpx;
  color: var(--app-text-muted);
  flex-shrink: 0;
}

.result-value {
  flex: 1;
  font-size: 26rpx;
  color: var(--app-text-primary);
  font-weight: 500;
  word-break: break-all;
}
</style>
