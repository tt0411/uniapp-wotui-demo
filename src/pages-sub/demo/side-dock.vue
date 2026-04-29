<script setup lang="ts">
import { ref } from 'vue'
import { onPageScroll } from '@dcloudio/uni-app'
import SideDock, { type SideDockItem } from '@/components/side-dock/index.vue'

const items = ref<SideDockItem[]>([
  { key: 'price', icon: 'book', label: '价目表' },
  { key: 'wework', icon: 'bulb', label: '企微', badge: 3 },
  { key: 'card', icon: 'apps', label: '工牌' }
])

const log = ref<string[]>([])
const dockHidden = ref(false)
let scrollTimer: any = null

function onSelect(item: SideDockItem) {
  log.value.unshift(`点击：${item.label}（${item.key}）`)
  uni.showToast({ title: item.label, icon: 'none' })
}

function onDragend(pos: { side: 'left' | 'right'; top: number }) {
  log.value.unshift(`吸附到 ${pos.side}，top=${pos.top.toFixed(0)}rpx`)
}

onPageScroll(() => {
  dockHidden.value = true
  clearTimeout(scrollTimer)
  scrollTimer = setTimeout(() => {
    dockHidden.value = false
  }, 180)
})
</script>

<template>
  <view class="page">
    <PageNavbar title="侧边悬浮菜单" preset="gradientInfoHeader" />
    <view class="page-content">
      <view class="tip">
        <view class="tip__title">侧边悬浮菜单 SideDock</view>
        <view class="tip__desc">· 默认仅显示图标</view>
        <view class="tip__desc">· 点击菜单容器切换展开/收起（显示名称）</view>
        <view class="tip__desc">· 长按并拖动，松手后自动吸附左/右边</view>
        <view class="tip__desc">· 通过 storageKey 自动记忆位置</view>
      </view>

      <view class="log">
        <view class="log__title">事件日志</view>
        <view v-for="(l, i) in log" :key="i" class="log__item">{{ l }}</view>
        <view v-if="!log.length" class="log__empty">暂无事件</view>
      </view>
    </view>

    <side-dock
      :items="items"
      side="right"
      storage-key="demo_side_dock_pos"
      :collapse-delay="3000"
      :hidden="dockHidden"
      :hide-on-scroll="false"
      @select="onSelect"
      @dragend="onDragend"
    />
  </view>
</template>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  box-sizing: border-box;
  background-color: var(--app-bg-page-secondary);
}

.page-content {
  padding: 32rpx;
}

.tip {
  background-color: var(--app-bg-card);
  padding: 24rpx 28rpx;
  border-radius: 16rpx;
  margin-bottom: 24rpx;

  &__title {
    font-size: 32rpx;
    font-weight: 600;
    color: var(--app-color-info);
    margin-bottom: 12rpx;
  }

  &__desc {
    font-size: 26rpx;
    color: var(--app-text-secondary);
    line-height: 1.8;
  }
}

.log {
  background-color: var(--app-bg-card);
  padding: 24rpx 28rpx;
  border-radius: 16rpx;

  &__title {
    font-size: 30rpx;
    font-weight: 600;
    margin-bottom: 12rpx;
  }

  &__item {
    font-size: 26rpx;
    color: var(--app-text-primary);
    padding: 10rpx 0;
    border-bottom: 2rpx solid var(--app-divider);

    &:last-child {
      border-bottom: none;
    }
  }

  &__empty {
    font-size: 26rpx;
    color: var(--app-text-muted);
    text-align: center;
    padding: 24rpx 0;
  }
}
</style>
